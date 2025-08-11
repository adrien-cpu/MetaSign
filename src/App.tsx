import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/navigation/Sidebar';
import { Breadcrumb } from './components/navigation/Breadcrumb';
import { AIModelManagement } from './components/AdminDashboard/AIModelManagement';
import { AITrainingMetrics } from './components/AdminDashboard/AITrainingMetrics';
import { AIPerformanceMonitor } from './components/AdminDashboard/AIPerformanceMonitor';
import { SecurityDashboard } from './components/AdminDashboard/SecurityDashboard';
import { UserManagementPanel } from './components/AdminDashboard/UserManagementPanel';
import { MonitoringPanel } from './components/AdminDashboard/MonitoringPanel';
import { DataAPIPanel } from './components/AdminDashboard/DataAPIPanel';
import { FeedbackPanel } from './components/AdminDashboard/FeedbackPanel';
import { SupportPanel } from './components/AdminDashboard/SupportPanel';
import { ActivityFeed } from './components/AdminDashboard/ActivityFeed';
import { DashboardMetrics } from './components/AdminDashboard/DashboardMetrics';
import { AIModelType } from './types/AIModel';

// Définition des interfaces
interface PerformanceMetrics {
  cpuUsage: number;
  gpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkBandwidth: number;
  latency: number;
  requestsPerSecond: number;
  errorRate: number;
  uptime: string;
  temperature: number;
  powerConsumption: number;
  activeModels: number;
  queuedRequests: number;
  lastUpdate: string;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  severity?: number;
}

interface Activity {
  id: string;
  type: 'model' | 'user' | 'success' | 'message' | 'system' | 'security' | 'error';
  title: string;
  description: string;
  timestamp: string;
  metadata: { [key: string]: string | number };  // Correction du type metadata
  user?: {
    name: string;
    avatar: string;
  };
}

// Données de test pour les métriques d'entraînement
const mockTrainingMetrics = [
  {
    timestamp: new Date().toISOString(),
    accuracy: 85.5,
    loss: 0.15,
    learningRate: 0.001,
    epochNumber: 1,
    validationAccuracy: 84.2,
    validationLoss: 0.17,
    gpuUtilization: 75,
    memoryUsage: 8.2,
    batchSize: 32,
    gradientNorm: 1.23
  },
  {
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    accuracy: 83.2,
    loss: 0.18,
    learningRate: 0.001,
    epochNumber: 2,
    validationAccuracy: 82.8,
    validationLoss: 0.19,
    gpuUtilization: 78,
    memoryUsage: 8.4,
    batchSize: 32,
    gradientNorm: 1.45
  }
];

// Mise à jour des données mockées avec les types appropriés
const mockModels: AIModelType[] = [
  {
    id: '1',
    name: 'SignTranslator',
    version: '1.0.0',
    type: 'LSF',
    status: 'deployed',
    lastUpdated: new Date().toISOString(),
    accuracy: 0.95,
    lastTraining: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    nextTraining: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    parameters: {
      vocabSize: 50000,
      layers: 12,
      heads: 8
    },
    metrics: {
      accuracy: 0.95,
      loss: 0.05,
      validationAccuracy: 0.93,
      validationLoss: 0.07
    },
    config: {
      batchSize: 32,
      learningRate: 0.001,
      epochs: 100,
      optimizer: 'adam'
    },
    performance: {
      inferenceTime: 150,
      throughput: 100,
      memoryUsage: 4.2,
      gpuUtilization: 65
    },
    training: {
      currentEpoch: 100,
      totalEpochs: 100,
      startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedCompletion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 100
    },
    gpuUsage: 65,
    memoryUsage: 4.2,
    specializations: ['LSF Translation', 'Sign Detection'],
    dependencies: [
      { name: 'tensorflow', version: '2.8.0', required: true },
      { name: 'opencv', version: '4.5.4', required: true },
      { name: 'mediapipe', version: '0.8.9', required: false }
    ]
  }
];

const mockMetrics: PerformanceMetrics = {
  cpuUsage: 45,
  gpuUsage: 65,
  memoryUsage: 70,
  diskUsage: 55,
  networkBandwidth: 25,
  latency: 150,
  requestsPerSecond: 250,
  errorRate: 0.5,
  uptime: '5d 12h 30m',
  temperature: 65,
  powerConsumption: 450,
  activeModels: 8,
  queuedRequests: 15,
  lastUpdate: new Date().toISOString()
};

const mockAlerts: Alert[] = [];

// Données de test pour les activités
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'model',
    title: 'Nouveau signe ajouté',
    description: 'Le signe "Innovation" a été ajouté à la base de données',
    timestamp: '2 min ago',
    metadata: {
      category: 'Technologie',
      difficulty: 'Intermédiaire'
    }
  },
  {
    id: '2',
    type: 'user',
    title: 'Nouvel utilisateur certifié',
    description: 'Marie Dubois a obtenu sa certification de traducteur LSF',
    timestamp: '15 min ago',
    metadata: {
      certificationLevel: 'Professionnel',
      completionTime: '6 mois'
    },
    user: {
      name: 'Marie Dubois',
      avatar: 'https://ui-avatars.com/api/?name=Marie+Dubois'
    }
  },
  {
    id: '3',
    type: 'success',
    title: 'Événement culturel créé',
    description: 'Nouveau festival de théâtre LSF programmé',
    timestamp: '1h ago',
    metadata: {
      date: '15/12/2023',
      location: 'Paris'
    }
  },
  {
    id: '4',
    type: 'message',
    title: 'Nouvelle discussion populaire',
    description: 'Le club "Culture Sourde" a dépassé 100 participants',
    timestamp: '2h ago',
    metadata: {
      club: 'Culture Sourde',
      members: '102'
    }
  },
  {
    id: '5',
    type: 'system',
    title: 'Mise à jour du système',
    description: 'Nouvelles fonctionnalités de traduction ajoutées',
    timestamp: '3h ago',
    metadata: {
      version: '2.3.0',
      features: '3 nouvelles fonctionnalités'
    }
  }
];

// Données de test pour le dashboard LSF
const mockLSFDashboardData = {
  userMetrics: {
    totalUsers: 1250,
    activeUsers: 847,
    newUsers: 23,
    userGrowth: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      users: Math.floor(1000 + Math.random() * 500)
    })).reverse(),
    userTypes: [
      { name: 'Traducteurs', value: 300 },
      { name: 'Étudiants', value: 500 },
      { name: 'Enseignants', value: 250 },
      { name: 'Autres', value: 200 }
    ]
  },
  learningMetrics: {
    totalSigns: 3500,
    signsByCategory: [
      { category: 'Vocabulaire courant', count: 1500 },
      { category: 'Expressions', count: 800 },
      { category: 'Technique', count: 700 },
      { category: 'Médical', count: 500 }
    ],
    learningProgress: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      completed: Math.floor(2000 + (Math.random() * 1500))
    })).reverse(),
    grammarRules: 125,
    syntaxRules: 85,
    culturalFacts: 250,
    deafHistory: 75,
    deafHumor: 45,
    cecrlMetrics: {
      currentLevel: 'B2',
      progressToNextLevel: 75,
      evaluationScores: {
        comprehension: 85,
        expression: 78,
        interaction: 82,
        culturalKnowledge: 90
      },
      levelDistribution: [
        { level: 'A1', count: 250 },
        { level: 'A2', count: 350 },
        { level: 'B1', count: 450 },
        { level: 'B2', count: 300 },
        { level: 'C1', count: 150 },
        { level: 'C2', count: 50 }
      ],
      recentEvaluations: Array.from({ length: 10 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        score: 70 + Math.random() * 30
      })).reverse()
    },
    certificationMetrics: {
      totalCertified: 450,
      certificationTypes: [
        { type: 'Enseignement LSF', count: 150 },
        { type: 'Traduction LSF-Français', count: 200 },
        { type: 'Interprétation LSF', count: 100 }
      ],
      certificationProgress: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { month: 'short' }),
        certifications: Math.floor(20 + Math.random() * 30)
      })).reverse(),
      successRate: 85,
      averageCompletionTime: '6 mois',
      activeTrainees: 275
    }
  },
  communityMetrics: {
    totalClubs: 45,
    activeClubs: 38,
    thematicChats: 12,
    activeDiscussions: 156,
    participationRate: 78,
    topClubs: [
      { name: 'Culture Sourde', members: 450 },
      { name: 'Apprentissage LSF', members: 380 },
      { name: 'Théâtre LSF', members: 280 },
      { name: 'Tech & LSF', members: 220 },
      { name: 'Sport LSF', members: 190 }
    ]
  },
  accessibilityMetrics: {
    signLanguageLocations: 834,
    locationsByType: [
      { type: 'Restaurants', count: 250 },
      { type: 'Services publics', count: 180 },
      { type: 'Commerces', count: 220 },
      { type: 'Santé', count: 120 },
      { type: 'Loisirs', count: 64 }
    ],
    recentAdditions: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      count: Math.floor(Math.random() * 10)
    })).reverse(),
    verifiedLocations: 645
  },
  culturalMetrics: {
    events: 89,
    eventsByType: [
      { type: 'Théâtre', count: 35 },
      { type: 'Chansigne', count: 25 },
      { type: 'Conférences', count: 15 },
      { type: 'Festivals', count: 8 },
      { type: 'Expositions', count: 6 }
    ],
    upcomingEvents: 12,
    participantsTotal: 3450,
    performances: [
      { type: 'Théâtre LSF', count: 45 },
      { type: 'Chansigne', count: 35 },
      { type: 'Poésie LSF', count: 25 },
      { type: 'Humour LSF', count: 20 }
    ]
  },
  systemMetrics: {
    uptime: '99.9%',
    responseTime: 250,
    errorRate: 0.5,
    performance: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}h`,
      cpu: 30 + Math.random() * 40,
      memory: 40 + Math.random() * 30
    }))
  }
};

// Configuration de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />

          <div className="flex-1 ml-[280px]">
            <div className="p-8">
              <div className="mb-6">
                <Breadcrumb />
              </div>

              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <div className="space-y-6">
                      <DashboardMetrics {...mockLSFDashboardData} />
                      <ActivityFeed activities={mockActivities} />
                    </div>
                  }
                />
                <Route 
                  path="/ai/models" 
                  element={
                    <AIModelManagement 
                      models={mockModels} 
                      onStartTraining={() => {}} 
                      onStopTraining={() => {}} 
                      onDeploy={() => {}} 
                      onRollback={() => {}} 
                      onUpdateConfig={() => {}} 
                    />
                  } 
                />
                <Route 
                  path="/ai/performance" 
                  element={
                    <AIPerformanceMonitor 
                      metrics={mockMetrics} 
                      alerts={mockAlerts} 
                      onRefresh={() => {}} 
                      onClearAlerts={() => {}} 
                    />
                  } 
                />
                <Route path="/analytics" element={<AITrainingMetrics metrics={mockTrainingMetrics} modelId="1" modelName="LSF Translator" />} />
                <Route path="/performance" element={<AIPerformanceMonitor metrics={mockMetrics} alerts={mockAlerts} onRefresh={() => { }} onClearAlerts={() => { }} />} />
                <Route path="/security" element={<SecurityDashboard events={[]} metrics={{ threatsPrevented: 0, activeThreats: 0, securityScore: 0 }} />} />
                <Route path="/users" element={<UserManagementPanel users={[]} onUserStatusChange={() => { }} onUserRoleChange={() => { }} />} />
                <Route path="/monitoring" element={<MonitoringPanel logs={[]} incidents={[]} />} />
                <Route path="/api" element={<DataAPIPanel apiMetrics={[]} dbMetrics={[]} />} />
                <Route path="/feedback" element={<FeedbackPanel feedbacks={[]} onStatusChange={() => { }} onReply={() => { }} />} />
                <Route path="/support" element={<SupportPanel tickets={[]} onStatusChange={() => { }} onAssign={() => { }} onReply={() => { }} />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
}