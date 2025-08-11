import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Globe,
  PlayCircle,
  Camera,
  Newspaper,
  Briefcase,
  Plane,
} from 'lucide-react';

const IntegratedPlatformsDashboard = () => {
  const [activeModules] = useState({
    culturalHub: {
      ongoingTours: 3,
      activeExhibitions: 2,
      liveEvents: 1
    },
    gaming: {
      activePlayers: 156,
      ongoingTournaments: 2,
      dailyQuests: 5
    },
    cinema: {
      liveFestivals: 1,
      ongoingProductions: 4,
      workshops: 2
    },
    news: {
      liveStreams: 2,
      topStories: 8,
      communityReports: 12
    },
    business: {
      activeListings: 45,
      networkingEvents: 3,
      certifications: 78
    },
    travel: {
      activeGuides: 23,
      plannedMeetups: 5,
      destinations: 34
    }
  });

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Cultural Discovery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Découverte Culturelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Visites Virtuelles</span>
                <span className="text-green-600">{activeModules.culturalHub.ongoingTours} en cours</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Expositions</span>
                <span className="text-blue-600">{activeModules.culturalHub.activeExhibitions} actives</span>
              </div>
              <Button className="w-full mt-2">Explorer</Button>
            </div>
          </CardContent>
        </Card>

        {/* Gaming */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              MetaSign Gaming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Joueurs Actifs</span>
                <span className="text-purple-600">{activeModules.gaming.activePlayers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tournois</span>
                <span className="text-orange-600">{activeModules.gaming.ongoingTournaments} en cours</span>
              </div>
              <Button className="w-full mt-2">Jouer</Button>
            </div>
          </CardContent>
        </Card>

        {/* Cinema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Deaf Cinema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Productions</span>
                <span className="text-red-600">{activeModules.cinema.ongoingProductions} en cours</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Ateliers</span>
                <span className="text-yellow-600">{activeModules.cinema.workshops} disponibles</span>
              </div>
              <Button className="w-full mt-2">Regarder</Button>
            </div>
          </CardContent>
        </Card>

        {/* News Network */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              Sign News
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Direct</span>
                <span className="text-red-600">{activeModules.news.liveStreams} live</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Stories</span>
                <span>{activeModules.news.topStories} nouveaux</span>
              </div>
              <Button className="w-full mt-2">Actualités</Button>
            </div>
          </CardContent>
        </Card>

        {/* Business */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              MetaSign Business
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Marketplace</span>
                <span>{activeModules.business.activeListings} annonces</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Networking</span>
                <span>{activeModules.business.networkingEvents} événements</span>
              </div>
              <Button className="w-full mt-2">Business</Button>
            </div>
          </CardContent>
        </Card>

        {/* Travel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Sign Travel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Destinations</span>
                <span>{activeModules.travel.destinations} disponibles</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Meetups</span>
                <span>{activeModules.travel.plannedMeetups} prévus</span>
              </div>
              <Button className="w-full mt-2">Voyager</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegratedPlatformsDashboard;
