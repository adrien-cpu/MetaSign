/**
 * @fileoverview Page d'accueil principale de MetaSign - Interface révolutionnaire pour la LSF
 * @path src/app/page.tsx
 * @description Composant React pour la page d'accueil avec design moderne et expérience utilisateur optimisée
 * @author MetaSign Team
 * @version 2.0.0
 * 
 * @features
 * - Design moderne avec glassmorphism et animations
 * - Interface responsive et accessible
 * - Intégration avec l'écosystème MetaSign
 * - Optimisations performance et SEO
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Sparkles,
  Users,
  Brain,
  Accessibility,
  BookOpen,
  MessageCircle,
  ArrowRight,
  PlayCircle,
  Lightbulb,
  Globe
} from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { useAppContext } from '@/context/AppContext';
import HomePageContent from '@/app/modules/protected/home/page';

/**
 * Types pour les props des composants
 */
interface FeatureCardProps {
  readonly title: string;
  readonly description: string;
  readonly icon: React.ReactNode;
  readonly gradient: string;
  readonly delay?: number;
}

interface HeroSectionProps {
  readonly onRegisterClick: () => void;
  readonly onLoginClick: () => void;
}

interface StatsCardProps {
  readonly value: string;
  readonly label: string;
  readonly icon: React.ReactNode;
}

/**
 * Composant pour les cartes de fonctionnalités
 */
const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  gradient,
  delay = 0
}) => (
  <div
    className={`group relative overflow-hidden rounded-2xl ${gradient} p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm" />
    <div className="relative z-10">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
      <p className="text-white/90 leading-relaxed">{description}</p>
    </div>
    <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <ArrowRight className="h-6 w-6 text-white" />
    </div>
  </div>
);

/**
 * Composant pour les statistiques
 */
const StatsCard: React.FC<StatsCardProps> = ({ value, label, icon }) => (
  <div className="text-center">
    <div className="mb-2 flex justify-center text-blue-500">
      {icon}
    </div>
    <div className="text-3xl font-bold text-gray-900">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

/**
 * Section héro de la page d'accueil
 */
const HeroSection: React.FC<HeroSectionProps> = ({ onRegisterClick, onLoginClick }) => (
  <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

    <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Contenu textuel */}
        <div className="space-y-8">
          <div className="flex items-center space-x-2 text-blue-300">
            <Sparkles className="h-5 w-5" />
            <span className="text-2xl font-medium">Révolution technologique LSF</span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block">Bienvenue sur</span>
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MetaSign
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
            La plateforme révolutionnaire qui transforme l&apos;apprentissage et la communication
            en Langue des Signes Française. Une expérience immersive alimentée par l&apos;IA.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onRegisterClick}
              className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30"
              aria-label="Créer un compte MetaSign"
            >
              Commencer l&apos;aventure
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onLoginClick}
              className="group inline-flex items-center justify-center rounded-xl border-2 border-white/30 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/50 focus:outline-none focus:ring-4 focus:ring-white/20"
              aria-label="Se connecter à MetaSign"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Se connecter
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
            <StatsCard value="50K+" label="Utilisateurs actifs" icon={<Users className="h-8 w-8" />} />
            <StatsCard value="98%" label="Satisfaction" icon={<Sparkles className="h-8 w-8" />} />
            <StatsCard value="24/7" label="Disponible" icon={<Globe className="h-8 w-8" />} />
          </div>
        </div>

        {/* Avatar et animation */}
        <div className="relative">
          <div className="relative mx-auto h-96 w-96">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl animate-pulse" />
            <div className="relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-8">
              <Image
                src="/ReadyPlayerMe-Avatar.png"
                alt="Avatar intelligent MetaSign"
                width={320}
                height={320}
                className="object-contain rounded-lg"
                priority
              />
              <div className="absolute -top-4 -right-4 rounded-full bg-green-500 p-2 shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Composant principal de la page d'accueil
 */
const HomePage: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { setCurrentPage } = useAppContext();

  useEffect(() => {
    setCurrentPage("home");
  }, [setCurrentPage]);

  const handleRegister = useCallback(() => {
    router.push(ROUTES.REGISTER);
  }, [router]);

  const handleLogin = useCallback(() => {
    router.push(ROUTES.LOGIN);
  }, [router]);

  // Si l'utilisateur est connecté, afficher le contenu protégé
  if (session) {
    return <HomePageContent />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Section héro */}
      <HeroSection onRegisterClick={handleRegister} onLoginClick={handleLogin} />

      {/* Section des fonctionnalités */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Une révolution technologique pour la LSF
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez un écosystème complet d&apos;outils innovants conçus pour enrichir
              votre maîtrise de la Langue des Signes Française.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Avatar Conversationnel IA"
              description="Engagez des conversations naturelles en temps réel avec notre avatar intelligent alimenté par l'IA de pointe."
              icon={<Brain className="h-8 w-8" />}
              gradient="bg-gradient-to-br from-blue-500 to-blue-700"
              delay={100}
            />

            <FeatureCard
              title="Apprentissage Adaptatif"
              description="Modules pédagogiques personnalisés qui s'adaptent à votre rythme et style d'apprentissage unique."
              icon={<BookOpen className="h-8 w-8" />}
              gradient="bg-gradient-to-br from-purple-500 to-purple-700"
              delay={200}
            />

            <FeatureCard
              title="Accessibilité Universelle"
              description="Outils d'inclusion conçus pour rendre la communication LSF accessible à tous, partout."
              icon={<Accessibility className="h-8 w-8" />}
              gradient="bg-gradient-to-br from-green-500 to-green-700"
              delay={300}
            />

            <FeatureCard
              title="Communauté Connectée"
              description="Rejoignez une communauté vibrante d'apprenants et d'experts pour échanger et progresser ensemble."
              icon={<Users className="h-8 w-8" />}
              gradient="bg-gradient-to-br from-orange-500 to-orange-700"
              delay={100}
            />

            <FeatureCard
              title="Communication Instantanée"
              description="Plateforme de communication avancée pour connecter les personnes sourdes et entendantes."
              icon={<MessageCircle className="h-8 w-8" />}
              gradient="bg-gradient-to-br from-teal-500 to-teal-700"
              delay={200}
            />

            <FeatureCard
              title="Innovation Continue"
              description="Technologie de pointe en constante évolution pour offrir la meilleure expérience utilisateur."
              icon={<Lightbulb className="h-8 w-8" />}
              gradient="bg-gradient-to-br from-pink-500 to-pink-700"
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* Section d'appel à l'action */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à révolutionner votre communication ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d&apos;utilisateurs qui transforment déjà leur expérience
            de la Langue des Signes avec MetaSign.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRegister}
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-medium text-blue-600 shadow-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30"
              aria-label="Créer un compte gratuit"
            >
              Essai gratuit
              <Sparkles className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={handleLogin}
              className="inline-flex items-center justify-center rounded-xl border-2 border-white px-8 py-4 text-lg font-medium text-white transition-all duration-300 hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/20"
              aria-label="Découvrir la démo"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Voir la démo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;