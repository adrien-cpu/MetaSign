'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Network, Brain, Database, AlertCircle, GitBranch } from 'lucide-react';

// Skeleton fallback for loading states
const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-gray-300 ${className}`} />
);

interface Node {
  id: string;
  status: string;
  type: string;
}

interface Model {
  id: string;
  name: string;
  version: string;
  type: string;
  status: string;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [aiModels, setAiModels] = useState<Record<string, Model[]>>({
    MASTER: [],
    APPRENTICE: [],
    DISTILLED: []
  });
  const [systemMetrics, setSystemMetrics] = useState({
    nodesActive: 0,
    aiModels: 0,
    memoryUsage: "0%",
    systemLoad: "0%",
  });

  // Récupération des données des nodes
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await fetch('/api/admin/nodes');
        if (response.ok) {
          const data: Node[] = await response.json();
          setNodes(data);
          setSystemMetrics(prev => ({
            ...prev,
            nodesActive: data.filter(node => node.status === 'ACTIVE').length
          }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des nodes:', error);
      }
    };

    fetchNodes();
  }, []);

  // Récupération des données des modèles AI
  useEffect(() => {
    const fetchAIModels = async () => {
      try {
        const response = await fetch('/api/admin/ai/models');
        if (response.ok) {
          const data: Record<string, Model[]> = await response.json();
          setAiModels(data);
          setSystemMetrics(prev => ({
            ...prev,
            aiModels: Object.values(data).flat().length
          }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des modèles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAIModels();
  }, []);

  const renderNodeControlPanel = () => (
    <div className="space-y-4">
      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h4 className="font-medium">Active Nodes</h4>
          <p className="text-2xl">{systemMetrics.nodesActive}</p>
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              Types:
              {Object.entries(nodes.reduce<Record<string, number>>((acc, node) => {
                acc[node.type] = (acc[node.type] || 0) + 1;
                return acc;
              }, {})).map(([type, count]) => (
                <span key={type} className="inline-block px-2 py-1 bg-gray-200 rounded-lg mx-1">
                  {type}: {count}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderModelRegistry = () => (
    <div className="space-y-2">
      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        Object.entries(aiModels).map(([type, models]) => (
          <div key={type} className="p-4 bg-gray-50 rounded-lg shadow">
            <h4 className="font-medium">{type} Models</h4>
            <div className="flex items-center mt-2">
              <GitBranch className="w-6 h-6 mr-2 flex-shrink-0" />
              <span>{models.length} active instances</span>
            </div>
            <div className="mt-2">
              {models.map((model: Model) => (
                <div key={model.id} className="text-sm text-gray-600">
                  • {model.name} (v{model.version})
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTrainingControls = () => {
    const trainingModels = Object.values(aiModels).flat().filter(
      (model: Model) => model.status === 'TRAINING'
    );

    return (
      <div className="space-y-4">
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg shadow">
            <h4 className="font-medium">Training Status</h4>
            <p>{trainingModels.length} models in training</p>
            {trainingModels.length > 0 && (
              <div className="mt-2">
                {trainingModels.map((model: Model) => (
                  <div key={model.id} className="text-sm text-gray-600">
                    • {model.name} - {model.type}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full p-4">
      <Tabs defaultValue="nodes">
        <TabsList className="grid w-full grid-cols-4 font-bold text-xl">
          {[
            { value: "nodes", icon: <Network className="w-6 h-6 mr-2 flex-shrink-0" />, label: "Nodes" },
            { value: "ai", icon: <Brain className="w-6 h-6 mr-2 flex-shrink-0" />, label: "AI Models" },
            { value: "memory", icon: <Database className="w-6 h-6 mr-2 flex-shrink-0" />, label: "Memory" },
            { value: "system", icon: <AlertCircle className="w-6 h-6 mr-2 flex-shrink-0" />, label: "System" },
          ].map(({ value, icon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="font-bold text-xl px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-shadow flex items-center"
            >
              {icon}
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="nodes">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Node Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-gray-100 rounded-lg h-96 p-4 shadow">
                  <h3 className="text-xl font-medium">Node Topology</h3>
                  {loading ? (
                    <Skeleton className="h-80 w-full mt-4" />
                  ) : (
                    <div className="mt-4">
                      {/* Ajoutez une visualisation ici */}
                    </div>
                  )}
                </div>
                {renderNodeControlPanel()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">AI Model Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <h3 className="text-xl font-medium mb-4">Model Registry</h3>
                  {renderModelRegistry()}
                </div>
                {renderTrainingControls()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ajoutez ici les autres TabsContent pour memory et system */}
      </Tabs>
    </div>
  );
};

export default Dashboard;
