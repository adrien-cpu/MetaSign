'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Banner from '@/components/ui/banner';
import { ROUTES } from '@/constants/routes';
import Image from 'next/image';
import {
  LayoutDashboard
} from 'lucide-react';

// Types enrichis
interface Review {
  note: number;
  comment: string;
  date: string;
  photo?: string;
  criteria?: {
    accueil?: number;
    accessibilite?: number;
    communication?: number;
  };
  user?: string;
}

interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  rating: number;
  ratingsCount: number;
  reviews: Review[];
  photos?: string[];
}

// Catégories de lieux
const categories = [
  'Administration',
  'Restaurant',
  'Commerce',
  'Santé',
  'Culture',
  'Autre'
];

// Exemple de données initiales
const initialPlaces: Place[] = [
  {
    id: '1',
    name: 'Mairie',
    address: '1 rue de la République, Paris',
    lat: 48.8566,
    lng: 2.3522,
    category: 'Administration',
    rating: 4.5,
    ratingsCount: 10,
    reviews: [],
    photos: []
  }
];

export default function FacilitiesPage() {
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [search, setSearch] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [loading, setLoading] = useState(false);

  // Géocodage via Nominatim
  async function geocodeAddress(addr: string) {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`);
    const data = await res.json();
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    throw new Error('Adresse introuvable');
  }

  // Ajout d'un lieu
  async function handleAddPlace(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const coords = await geocodeAddress(address);
      let photoUrl = '';
      if (photo) {
        // Simuler l'upload (à remplacer par un vrai backend)
        photoUrl = URL.createObjectURL(photo);
      }
      setPlaces([
        ...places,
        {
          id: Date.now().toString(),
          name,
          address,
          lat: coords.lat,
          lng: coords.lng,
          category,
          rating: 0,
          ratingsCount: 0,
          reviews: [],
          photos: photoUrl ? [photoUrl] : []
        }
      ]);
      setName('');
      setAddress('');
      setCategory(categories[0]);
      setPhoto(null);
    } catch (err) {
      alert((err as Error).message);
    }
    setLoading(false);
  }

  // Utiliser la géolocalisation
  function handleUseLocation() {
    if (!navigator.geolocation) return alert("Géolocalisation non supportée");
    navigator.geolocation.getCurrentPosition(
      pos => {
        setPlaces([
          ...places,
          {
            id: Date.now().toString(),
            name,
            address: 'Ma position',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            category,
            rating: 0,
            ratingsCount: 0,
            reviews: [],
            photos: []
          }
        ]);
        setName('');
        setAddress('');
        setCategory(categories[0]);
      },
      err => alert("Impossible d'obtenir la position : " + err.message)
    );
  }

  // Ajout d'un avis
  const handleRate = (id: string, note: number, comment: string, criteria: Review['criteria'], reviewPhoto?: File) => {
    setPlaces(places =>
      places.map(place =>
        place.id === id
          ? {
              ...place,
              rating: (place.rating * place.ratingsCount + note) / (place.ratingsCount + 1),
              ratingsCount: place.ratingsCount + 1,
              reviews: [
                ...place.reviews,
                {
                  note,
                  comment,
                  date: new Date().toLocaleDateString(),
                  criteria,
                  photo: reviewPhoto ? URL.createObjectURL(reviewPhoto) : undefined,
                  user: 'Utilisateur' // à remplacer par l'utilisateur connecté
                }
              ]
            }
          : place
      )
    );
  };

  // Filtrage des lieux
  const filteredPlaces = places.filter(
    place =>
      place.name.toLowerCase().includes(search.toLowerCase()) &&
      place.rating >= minRating
  );

  return (
   <div>
      <Banner
        icon={<LayoutDashboard className="text-white" />}
        title="Réseau Social"
        description="Bienvenue dans vos espaces de discussion"
        backHref={ROUTES.HOME}
      />

    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold">Lieux accessibles (employés savent signer)</h1>

      {/* Recherche et filtre */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Rechercher un lieu"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={minRating}
          onChange={e => setMinRating(Number(e.target.value))}
          className="border p-2 rounded"
        >
          <option value={0}>Toutes les notes</option>
          {[1,2,3,4,5].map(n => (
            <option key={n} value={n}>{n}⭐ et plus</option>
          ))}
        </select>
      </div>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleAddPlace} className="flex gap-2 items-center flex-wrap">
        <input
          type="text"
          placeholder="Nom du lieu"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Adresse"
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="border p-2 rounded w-64"
          required
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border p-2 rounded"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={e => setPhoto(e.target.files?.[0] || null)}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded" disabled={loading}>
          Ajouter
        </button>
        <button type="button" className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleUseLocation}>
          Utiliser ma position
        </button>
      </form>

      {/* Liste des lieux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlaces.map(place => (
          <div key={place.id} className="border rounded p-4 flex flex-col gap-2">
            <span className="font-semibold">{place.name}</span>
            <span className="text-sm text-gray-600">{place.address}</span>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded w-fit">{place.category}</span>
            <span>Note moyenne : {place.rating.toFixed(2)} ({place.ratingsCount} avis)</span>
            {place.photos && place.photos.length > 0 && (
              <div className="flex gap-2 mt-2">
                {place.photos.map((url, idx) => (
                  <Image key={idx} src={url} alt="photo lieu" width={64} height={64} className="h-16 w-16 object-cover rounded" />
                ))}
              </div>
            )}

            {/* Formulaire d'avis */}
            <div className="mb-1 font-medium">Noter ce lieu :</div>
            <form
              onSubmit={e => {
                e.preventDefault();
                const note = Number(e.currentTarget.note.value);
                const comment = e.currentTarget.comment.value;
                const accueil = Number(e.currentTarget.accueil.value);
                const accessibilite = Number(e.currentTarget.accessibilite.value);
                const communication = Number(e.currentTarget.communication.value);
                const reviewPhoto = e.currentTarget.photo.files?.[0];
                handleRate(place.id, note, comment, { accueil, accessibilite, communication }, reviewPhoto);
                e.currentTarget.reset();
              }}
              className="flex flex-col gap-2"
            >
              <div className="flex gap-2">
                <select name="note" required className="border rounded px-2 py-1">
                  <option value="">Note</option>
                  {[1,2,3,4,5].map(n => (
                    <option key={n} value={n}>{n}⭐</option>
                  ))}
                </select>
                <input
                  name="comment"
                  type="text"
                  placeholder="Votre commentaire"
                  className="border rounded px-2 py-1"
                  required
                />
                <input
                  name="photo"
                  type="file"
                  accept="image/*"
                  className="border rounded px-2 py-1"
                />
              </div>
              <div className="flex gap-2">
                <input name="accueil" type="number" min={1} max={5} placeholder="Accueil (1-5)" className="border rounded px-2 py-1 w-32" />
                <input name="accessibilite" type="number" min={1} max={5} placeholder="Accessibilité (1-5)" className="border rounded px-2 py-1 w-32" />
                <input name="communication" type="number" min={1} max={5} placeholder="Communication LSF (1-5)" className="border rounded px-2 py-1 w-40" />
              </div>
              <button type="submit" className="bg-indigo-600 text-white px-3 py-1 rounded">Envoyer</button>
            </form>

            {/* Affichage des avis */}
            <div className="mt-2">
              {place.reviews.slice().reverse().map((r, idx) => (
                <div key={idx} className="text-sm text-gray-700 mb-1 border-b pb-1">
                  <span className="font-bold">{r.note}⭐</span> — {r.comment}
                  <span className="ml-2 text-xs text-gray-500">{r.date}</span>
                  {r.photo && <Image src={r.photo} alt="photo avis" width={40} height={40} className="h-10 w-10 object-cover rounded inline-block ml-2" />}
                  {r.criteria && (
                    <span className="ml-2 text-xs text-gray-600">
                      Accueil: {r.criteria.accueil ?? '-'} / Accessibilité: {r.criteria.accessibilite ?? '-'} / Communication: {r.criteria.communication ?? '-'}
                    </span>
                  )}
                  {/* Système de signalement (à compléter) */}
                  <button className="ml-4 text-red-500 text-xs">Signaler</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Carte */}
      <div className="mt-8">
        <MapContainer
  center={[48.8566, 2.3522] as [number, number]}
  zoom={13}
  style={{ height: '400px', width: '100%' }}
>
  <TileLayer
    attribution='&copy; OpenStreetMap contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  {filteredPlaces.map(place => (
    <Marker key={place.id} position={[place.lat, place.lng]}>
      <Popup>
        <strong>{place.name}</strong><br />
        {place.address}<br />
        Catégorie : {place.category}<br />
        Note : {place.rating.toFixed(2)}<br />
        {place.ratingsCount} avis
        {place.photos && place.photos.length > 0 && (
          <div>
            {place.photos.map((url, idx) => (
              <Image key={idx} src={url} alt="photo lieu" width={40} height={40} className="h-10 w-10 object-cover rounded mt-2" />
            ))}
          </div>
        )}
      </Popup>
    </Marker>
  ))}
</MapContainer>
      </div>
    </div>
    </div>
  );
}