"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Brain,
  Cpu,
  GitBranch,
  BarChart,
  Settings,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  Bell
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Types pour la configuration et les métriques
interface ModelConfiguration {
  batchSize: number;
  learningRate: number;
  epochs: number;
  optimizer: string;
  parameters: {
    [key: string]: number | string | boolean;
  };
}

interface ModelMetrics {
  accuracy: number;
  latency: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  [key: string]: number;
}

// Types existants
interface AIModel {
  id: string;
  name: string;
  type: 'MASTER' | 'APPRENTICE' | 'DISTILLED';
  version: string;
  status: 'ACTIVE' | 'TRAINING' | 'PAUSED' | 'ERROR';
  configuration: ModelConfiguration;
  metrics?: ModelMetrics;
}

// Types pour les alertes
interface LSFAlert {
  id: string;
  type: 'NEGATIVE_TREND' | 'CRITICAL_ISSUE' | 'PERFORMANCE_DEGRADATION' | 'LOW_SATISFACTION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  context: {
    description: string;
    modelId?: string;
    metricName?: string;
    threshold?: number;
    currentValue?: number;
  };
  timestamp: number;
  status: 'ACTIVE' | 'RESOLVED';
  resolvedAt?: number;
}

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

const AIControlDashboard = () => {
  // États
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<Record<string, AIModel[]>>({
    MASTER: [],
    APPRENTICE: [],
    DISTILLED: []
  });
  const [activeAlerts, setActiveAlerts] = useState<LSFAlert[]>([]);
  const [alertHistory, setAlertHistory] = useState<LSFAlert[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Effet pour charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modelsResponse, alertsResponse] = await Promise.all([
          fetch('/api/admin/ai/models'),
          fetch('/api/admin/ai/alerts')
        ]);

        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json();
          setModels(modelsData);
        }

        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          setActiveAlerts(alertsData.active);
          setAlertHistory(alertsData.history);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fonction de filtrage des alertes
  const getFilteredAlerts = (alerts: LSFAlert[]) => {
    return alerts.filter(alert => {
      const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
      const matchesType = filterType === 'all' || alert.type === filterType;
      const matchesSearch = !searchQuery ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.context.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSeverity && matchesType && matchesSearch;
    });
  };

  // Fonctions helpers
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" => {
    switch (status) {
      case 'ACTIVE': return "default";
      case 'TRAINING': return "secondary";
      case 'PAUSED': return "outline";
      case 'ERROR': return "secondary";
      default: return "default";
    }
  };

  const renderAlertBadge = (severity: Severity): string => {
    const colors: Record<Severity, string> = {
      CRITICAL: "bg-red-500 text-white",
      HIGH: "bg-orange-500 text-white",
      MEDIUM: "bg-yellow-500",
      LOW: "bg-blue-500 text-white"
    };
    return colors[severity];
  };

  // Fonctions de rendu des composants
  const renderModelCard = (model: AIModel) => (
    <Card key={model.id}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {model.name}
          </CardTitle>
          <Badge variant={getStatusBadgeVariant(model.status)}>
            {model.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Version</span>
            <span className="text-sm font-medium">{model.version}</span>
          </div>

          {model.metrics && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Précision</span>
                <span className="text-sm font-medium">{model.metrics.accuracy}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Latence</span>
                <span className="text-sm font-medium">{model.metrics.latency}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Ressources</span>
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    {model.metrics.throughput} req/s
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {model.status === 'ACTIVE' ? (
              <Button size="sm" className="w-full" variant="outline">
                <PauseCircle className="h-4 w-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button size="sm" className="w-full" variant="default">
                <PlayCircle className="h-4 w-4 mr-2" />
                Activer
              </Button>
            )}
            <Button size="sm" variant="ghost" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Config
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderModelSection = (type: string) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <GitBranch className="h-5 w-5" />
        <h3 className="text-lg font-medium">{type} Models</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <>
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </>
        ) : (
          models[type]?.map(model => renderModelCard(model))
        )}
      </div>
    </div>
  );

  const renderAlertCard = (alert: LSFAlert) => (
    <Card key={alert.id} className="border-l-4" style={{ borderLeftColor: severity2Color(alert.severity) }}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">{alert.message}</span>
              <Badge className={renderAlertBadge(alert.severity)}>
                {alert.severity}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{alert.context.description}</p>
          </div>
          {alert.status === 'ACTIVE' && (
            <Button variant="outline" size="sm">
              Résoudre
            </Button>
          )}
        </div>
        <div className="mt-3 text-sm text-gray-500">
          {alert.status === 'RESOLVED' ? (
            <span>Résolu le {new Date(alert.resolvedAt!).toLocaleString()}</span>
          ) : (
            <span>Détecté le {new Date(alert.timestamp).toLocaleString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderAlertFilters = () => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher des alertes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={filterSeverity}
          onValueChange={setFilterSeverity}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par sévérité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les sévérités</SelectItem>
            <SelectItem value="CRITICAL">Critique</SelectItem>
            <SelectItem value="HIGH">Haute</SelectItem>
            <SelectItem value="MEDIUM">Moyenne</SelectItem>
            <SelectItem value="LOW">Basse</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterType}
          onValueChange={setFilterType}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="NEGATIVE_TREND">Tendance négative</SelectItem>
            <SelectItem value="CRITICAL_ISSUE">Problème critique</SelectItem>
            <SelectItem value="PERFORMANCE_DEGRADATION">Dégradation performance</SelectItem>
            <SelectItem value="LOW_SATISFACTION">Satisfaction basse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {getFilteredAlerts(activeAlerts).length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              {getFilteredAlerts(activeAlerts).length} Alerte{getFilteredAlerts(activeAlerts).length !== 1 ? 's' : ''} active{getFilteredAlerts(activeAlerts).length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFilterSeverity('all');
            setFilterType('all');
            setSearchQuery('');
          }}
        >
          Réinitialiser les filtres
        </Button>
      </div>
    </div>
  );

  const renderPerformanceMetrics = () => (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          {activeAlerts.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {activeAlerts.length} Alert{activeAlerts.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <div className="grid grid-cols-4 gap-4 h-full">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Utilisation CPU
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold">
                      {loading ? <Skeleton className="h-8 w-16" /> : "78%"}
                    </span>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: "78%" }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* ...autres métriques... */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Rendu principal
  return (
    <div className="space-y-6 p-6">
      {renderPerformanceMetrics()}

      <Tabs defaultValue="master" className="space-y-4">
        <TabsList className="border-b p-0">
          <TabsTrigger
            value="master"
            className="text-lg px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Master
          </TabsTrigger>
          <TabsTrigger
            value="apprentice"
            className="text-lg px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Apprentice
          </TabsTrigger>
          <TabsTrigger
            value="distilled"
            className="text-lg px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Distilled
          </TabsTrigger>
          <TabsTrigger
            value="alerts"
            className="text-lg px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary relative"
          >
            Alerts
            {activeAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {activeAlerts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="master">
          {renderModelSection('MASTER')}
        </TabsContent>
        <TabsContent value="apprentice">
          {renderModelSection('APPRENTICE')}
        </TabsContent>
        <TabsContent value="distilled">
          {renderModelSection('DISTILLED')}
        </TabsContent>
        <TabsContent value="alerts">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium flex items-center gap-2">
                <Bell className="h-6 w-6" />
                Gestion des Alertes
              </h3>
            </div>

            {renderAlertFilters()}

            <Separator />

            {/* Active Alerts */}
            {getFilteredAlerts(activeAlerts).length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Alertes Actives</h4>
                {getFilteredAlerts(activeAlerts).map(renderAlertCard)}
              </div>
            )}

            {/* Alert History */}
            {getFilteredAlerts(alertHistory).length > 0 && (
              <div className="space-y-4 mt-8">
                <h4 className="text-lg font-medium text-gray-900">Historique des Alertes</h4>
                {getFilteredAlerts(alertHistory).map(renderAlertCard)}
              </div>
            )}

            {getFilteredAlerts([...activeAlerts, ...alertHistory]).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Aucune alerte ne correspond aux critères de filtrage actuels.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Fonction utilitaire pour la couleur des alertes
const severity2Color = (severity: Severity): string => {
  const colors: Record<Severity, string> = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#3b82f6'
  };
  return colors[severity];
};

export default AIControlDashboard;