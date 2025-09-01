'use client';

import React, { useState } from 'react';
import { BookOpenText } from 'lucide-react';
import Banner from '@/components/ui/banner';
import { ROUTES } from '@/constants/routes';

function TileSection({
  title,
  children,
  details,
}: {
  title: string;
  children: React.ReactNode;
  details?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="bg-white rounded-lg shadow p-6 flex flex-col mb-4">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <div>{children}</div>
      {details && (
        <button
          className="mt-4 text-indigo-600 underline self-start"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Réduire' : 'En savoir plus'}
        </button>
      )}
      {open && details && (
        <div className="mt-2 animate-fade-in">{details}</div>
      )}
    </section>
  );
}

export default function DeafCulturePage() {
  return (
    <div>
      <Banner
        icon={<BookOpenText className="text-white" />}
        title="Culture Sourde"
        description="Découvrez la richesse de la culture sourde à travers sa langue, son histoire et ses figures emblématiques."
        backHref={ROUTES.HOME}
      />

      {/* Bouton d'ajout de thème */}
      <div className="flex justify-end max-w-4xl mx-auto p-6">
        <a
          href={ROUTES.DEAF_CULTURE_ADD_THEME}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
        >
          Ajoutez un thème
        </a>
      </div>

      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Introduction */}
        <TileSection title="Introduction">
          <p>
            La culture sourde, ce n’est pas seulement une question de surdité : c’est une identité, une langue, une communauté riche et vivante.
          </p>
          <blockquote className="italic border-l-4 pl-4 text-indigo-700 mt-4">
            “La surdité n’est pas un handicap, c’est une façon différente d’être humain.”
          </blockquote>
        </TileSection>

        {/* 2. Langue des signes */}
        <TileSection
          title="Langue des signes"
          details={
            <ul className="list-disc ml-6 mt-2">
              <li>
                <a href="https://www.elix-lsf.fr/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">
                  Dictionnaire Elix (alphabet, expressions courantes)
                </a>
              </li>
              <li>
                <a href="https://www.lsf-online.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">
                  LSF Online – Cours et ressources
                </a>
              </li>
            </ul>
          }
        >
          <p>
            La LSF (Langue des Signes Française) est une langue visuelle, avec sa propre grammaire et son histoire.
          </p>
          <div className="my-4">
            <iframe
              width="100%"
              height="200"
              src="https://www.youtube.com/embed/4uQ5gkF5rjI"
              title="Introduction à la LSF"
              allowFullScreen
              className="rounded"
            />
          </div>
        </TileSection>

        {/* 3. Histoire et figures emblématiques */}
        <TileSection
          title="Histoire et figures emblématiques"
          details={
            <ul className="list-disc ml-6 mt-2">
              <li>Abbé de l’Épée : pionnier de l’éducation des sourds</li>
              <li>Ferdinand Berthier : militant et intellectuel sourd</li>
              <li>Reconnaissance de la LSF en France : loi de 2005</li>
            </ul>
          }
        >
          <p>
            De l’Abbé de l’Épée à Ferdinand Berthier, la culture sourde est portée par des personnalités engagées et des événements marquants.
          </p>
        </TileSection>

        {/* 4. Vie quotidienne et accessibilité */}
        <TileSection
          title="Vie quotidienne et accessibilité"
          details={
            <ul className="list-disc ml-6 mt-2">
              <li>Technologies : vibrateurs, sous-titrage, applications de traduction</li>
              <li>Défis : accès à l’éducation, à la santé, aux médias</li>
            </ul>
          }
        >
          <p>
            Témoignages et exemples : comment les personnes sourdes communiquent, travaillent, et accèdent à l’information.
          </p>
        </TileSection>

        {/* 5. Art et divertissement */}
        <TileSection
          title="Art et divertissement"
          details={
            <ul className="list-disc ml-6 mt-2">
              <li>
                Cinéma sourd : <span className="italic">La Famille Bélier</span>, <span className="italic">CODA</span>
              </li>
              <li>Théâtre visuel, poésie signée</li>
              <li>Musique et vibration : comment les sourds créent et ressentent la musique</li>
            </ul>
          }
        >
          <p>
            La culture sourde s’exprime aussi dans l’art : cinéma, théâtre, poésie, et même musique adaptée.
          </p>
        </TileSection>

        {/* 6. Engagement et inclusion */}
        <TileSection
          title="Engagement et inclusion"
          details={
            <ul className="list-disc ml-6 mt-2">
              <li>
                Associations : <a href="https://www.unisda.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">UNISDA</a>, <a href="https://www.ivt.fr/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">IVT</a>, <a href="https://www.fnsf.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">FNSF</a>
              </li>
              <li>Comment devenir un·e allié·e : apprendre la LSF, militer pour l’accessibilité</li>
              <li>
                <a href="https://www.ivt.fr/festival/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">
                  Événements, conférences, festivals sourds
                </a>
              </li>
            </ul>
          }
        >
          <p>
            S’engager pour l’inclusion : associations, collectifs, et actions pour rendre la société plus accessible.
          </p>
        </TileSection>
      </div>
    </div>
  );
}