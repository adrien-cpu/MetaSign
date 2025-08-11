import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Code,
  Key,
  Activity,
  Share2,
  Settings,
  Shield,
  Book,
  Building,
  Globe
} from 'lucide-react';

const APIManagementSystem = () => {
  const [apiStats, setApiStats] = useState({
    endpoints: [
      {
        name: 'Translation',
        route: '/api/v1/translate',
        usage: {
          daily: 15000,
          monthly: 450000
        },
        status: 'active',
        consumers: ['Musée du Louvre', 'SNCF', 'Éducation Nationale']
      },
      {
        name: 'Avatar Generation',
        route: '/api/v1/avatar',
        usage: {
          daily: 8000,
          monthly: 240000
        },
        status: 'active',
        consumers: ['Hôpitaux de Paris', 'Mairies']
      }
    ],
    partners: [
      {
        name: 'Musée du Louvre',
        type: 'cultural',
        features: ['Guide LSF', 'Description œuvres'],
        apiKey: 'xxxxx-xxxxx',
        status: 'active'
      }
    ],
    documentation: {
      sections: ['Getting Started', 'Authentication', 'Endpoints'],
      examples: ['Python', 'JavaScript', 'PHP'],
      tutorials: ['Guide Integration', 'Avatar Customization']
    }
  });

  // Ajouter une fonction pour mettre à jour les statistiques
  const refreshStats = () => {
    setApiStats(prev => ({
      ...prev,
      endpoints: prev.endpoints.map(endpoint => ({
        ...endpoint,
        usage: {
          daily: Math.floor(endpoint.usage.daily * (1 + Math.random() * 0.1)),
          monthly: Math.floor(endpoint.usage.monthly * (1 + Math.random() * 0.05))
        }
      }))
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* API Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              API MetaSign
            </CardTitle>
            <button
              onClick={refreshStats}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Rafraîchir les statistiques"
            >
              <Activity className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* API Endpoints */}
            {apiStats.endpoints.map((endpoint, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {endpoint.name}
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        {endpoint.status}
                      </span>
                    </h3>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-1 block">
                      {endpoint.route}
                    </code>

                    {/* Usage Stats */}
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Usage Quotidien</span>
                        <p className="font-medium">{endpoint.usage.daily.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Usage Mensuel</span>
                        <p className="font-medium">{endpoint.usage.monthly.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Consumers */}
                    <div className="mt-3">
                      <span className="text-sm font-medium">Utilisateurs:</span>
                      <div className="flex gap-2 mt-1">
                        {endpoint.consumers.map((consumer, idx) => (
                          <span key={idx} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {consumer}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Globe className="h-4 w-4" />
            <span>Disponibilité globale</span>
            <span className="font-medium text-green-600">99.9%</span>
          </div>
        </CardContent>
      </Card>

      {/* Partner Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Partenaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm">Sécurité active</span>
            </div>
            <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
              <Share2 className="h-4 w-4" />
              Inviter un partenaire
            </button>
          </div>
          <div className="space-y-4">
            {apiStats.partners.map((partner, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{partner.name}</h3>
                    <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {partner.type}
                    </span>

                    {/* Features */}
                    <div className="mt-3">
                      <span className="text-sm font-medium">Fonctionnalités:</span>
                      <div className="flex gap-2 mt-1">
                        {partner.features.map((feature, idx) => (
                          <span key={idx} className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* API Key */}
                    <div className="mt-3 flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {partner.apiKey}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Documentation API
            </CardTitle>
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
              <Settings className="h-4 w-4" />
              Configurer
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Sections</h3>
              {apiStats.documentation.sections.map((section, idx) => (
                <div key={idx} className="bg-gray-50 p-2 rounded">
                  {section}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Exemples</h3>
              {apiStats.documentation.examples.map((example, idx) => (
                <div key={idx} className="bg-gray-50 p-2 rounded">
                  {example}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Tutoriels</h3>
              {apiStats.documentation.tutorials.map((tutorial, idx) => (
                <div key={idx} className="bg-gray-50 p-2 rounded">
                  {tutorial}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIManagementSystem;