"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import {
  Brain,
  GitBranch,
  Plus,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  AlertTriangle,
  PauseCircle,
  PlayCircle,
  Activity
} from 'lucide-react';

type Recommendation = {
  id: number;
  title: string;
  description: string;
  priority: string;
  suggestedBy: string;
  status: string;
  impact: Record<string, string>;
};

type AICluster = {
  masters: { id: string; name: string; status: string; apprentices: number }[];
  apprentices: { id: string; name: string; master: string; progress: number }[];
  distilled: { id: string; name: string; source: string; size: string }[];
};

const AIManagementDashboard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: 1,
      title: "Optimisation du module de traduction LSF",
      description: "Suggestion d'utiliser un modèle distillé pour réduire la latence de 45%",
      priority: "high",
      suggestedBy: "IA-Critique-01",
      status: "pending",
      impact: {
        performance: "+45%",
        memory: "-30%",
        accuracy: "-5%"
      }
    },
    {
      id: 2,
      title: "Nouvelle source de données LSF",
      description: "Intégration de la base de données SignWriting pour enrichir le vocabulaire",
      priority: "medium",
      suggestedBy: "IA-Exploratrice-03",
      status: "pending",
      impact: {
        vocabulary: "+2000 signes",
        accuracy: "+15%",
        training: "+2 jours"
      }
    }
  ]);

  const [aiClusters, setAiClusters] = useState<AICluster>({
    masters: [
      { id: "master-1", name: "LSF-Master", status: "active", apprentices: 3 },
      { id: "master-2", name: "Gesture-Master", status: "active", apprentices: 2 }
    ],
    apprentices: [
      { id: "app-1", name: "LSF-App-1", master: "LSF-Master", progress: 85 },
      { id: "app-2", name: "LSF-App-2", master: "LSF-Master", progress: 67 }
    ],
    distilled: [
      { id: "dist-1", name: "LSF-Mobile", source: "LSF-Master", size: "45MB" }
    ]
  });

  const handleRecommendation = (id: number, action: string) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === id ? { ...rec, status: action } : rec
      )
    );
  };

  const handleClusterUpdate = (clusterId: string, action: 'pause' | 'resume') => {
    setAiClusters(prev => ({
      ...prev,
      masters: prev.masters.map(master =>
        master.id === clusterId
          ? { ...master, status: action === 'pause' ? 'paused' : 'active' }
          : master
      )
    }));
  };

  return (
    <div className="w-full p-6 space-y-6">
      {/* AI Hierarchy Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Hierarchy
            <GitBranch className="h-4 w-4 ml-2 text-gray-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Masters */}
            <div>
              <h3 className="font-medium mb-2">Master Models</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiClusters.masters.map(master => (
                  <div key={master.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{master.name}</span>
                      <div className="flex items-center gap-2">
                        {master.status === 'warning' && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className={`text-sm ${master.status === 'active' ? 'text-green-500' :
                            master.status === 'warning' ? 'text-yellow-500' :
                              master.status === 'paused' ? 'text-orange-500' :
                                'text-gray-500'
                          }`}>
                          {master.status.charAt(0).toUpperCase() + master.status.slice(1)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClusterUpdate(
                            master.id,
                            master.status === 'active' ? 'pause' : 'resume'
                          )}
                          className="ml-2"
                        >
                          {master.status === 'active' ? (
                            <PauseCircle className="h-4 w-4 text-orange-500" />
                          ) : (
                            <PlayCircle className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex justify-between items-center">
                        <span>Apprentices: {master.apprentices}</span>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          <span className="text-green-500">98.5% uptime</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Apprentices */}
            <div>
              <h3 className="font-medium mb-2">Apprentice Models</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiClusters.apprentices.map(app => (
                  <div key={app.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium">{app.name}</div>
                    <div className="text-sm text-gray-600">Master: {app.master}</div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 rounded-full h-2"
                        style={{ width: `${app.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AI Recommendations</span>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map(rec => (
              <div key={rec.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>

                    {/* Impact Metrics */}
                    <div className="mt-3 flex gap-4">
                      {Object.entries(rec.impact).map(([key, value]) => (
                        <div key={key} className="bg-white px-2 py-1 rounded text-sm">
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRecommendation(rec.id, 'approved')}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRecommendation(rec.id, 'rejected')}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRecommendation(rec.id, 'reanalyze')}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="mt-3 flex gap-4 text-sm text-gray-500">
                  <span>Suggested by: {rec.suggestedBy}</span>
                  <span>Priority: {rec.priority}</span>
                  <span>Status: {rec.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIManagementDashboard;