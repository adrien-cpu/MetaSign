'use client';

import React, { useState, useRef } from 'react';

// À remplacer par ton vrai système d’authentification
const isAuthenticated = true;

interface WikiSignTile {
  id: string;
  title: string;
  description: string;
  link: string;
}

export default function WikiSignPage() {
  const [tiles, setTiles] = useState<WikiSignTile[]>([
    { id: '1', title: 'Bonjour', description: 'Signe pour saluer', link: '/wikisign/signe/bonjour' },
    { id: '2', title: 'Merci', description: 'Signe pour remercier', link: '/wikisign/signe/merci' },
  ]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [feedback, setFeedback] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Vérifie les doublons
  const isDuplicate = tiles.some(tile => tile.title.trim().toLowerCase() === title.trim().toLowerCase());

  function handleCreateTile(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFeedback("Veuillez remplir tous les champs.");
      return;
    }
    if (isDuplicate) {
      setFeedback("Ce titre existe déjà.");
      return;
    }
    setTiles([
      ...tiles,
      {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        link: `/wikisign/signe/${title.trim().toLowerCase().replace(/\s+/g, '-')}`,
      },
    ]);
    setTitle('');
    setDescription('');
    setFeedback("Fiche créée avec succès !");
    titleInputRef.current?.focus();
    setTimeout(() => setFeedback(''), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">WikiSign – Encyclopédie LSF</h1>

      {/* Formulaire de création de tile si connecté */}
      {isAuthenticated && (
        <form onSubmit={handleCreateTile} className="mb-8 bg-gray-50 p-4 rounded shadow flex flex-col gap-2" aria-label="Créer une nouvelle fiche">
          <h2 className="text-xl font-semibold mb-2">Créer une nouvelle fiche</h2>
          <label htmlFor="title" className="font-medium">Titre</label>
          <input
            id="title"
            ref={titleInputRef}
            type="text"
            placeholder="Titre (ex : Bonjour)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border p-2 rounded"
            required
            autoFocus
          />
          <label htmlFor="description" className="font-medium">Description courte</label>
          <textarea
            id="description"
            placeholder="Description courte"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="border p-2 rounded"
            required
            rows={2}
          />
          {feedback && (
            <span className={`text-sm ${isDuplicate ? 'text-red-600' : 'text-green-600'}`}>{feedback}</span>
          )}
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded mt-2"
            disabled={!title.trim() || !description.trim() || isDuplicate}
          >
            Créer la fiche
          </button>
        </form>
      )}

      {/* Liste des tiles existantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tiles.map(tile => (
          <a
            key={tile.id}
            href={tile.link}
            className="bg-white rounded-lg shadow p-6 flex flex-col hover:bg-indigo-50 transition"
            tabIndex={0}
            aria-label={`Voir la fiche ${tile.title}`}
          >
            <h3 className="text-lg font-bold mb-2">{tile.title}</h3>
            <p className="text-gray-700">{tile.description}</p>
            <span className="mt-4 text-indigo-600 underline">Voir la fiche</span>
          </a>
        ))}
      </div>
    </div>
  );
}