'use client';
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ThumbsUp, ThumbsDown, MessageSquare, Zap, Code, Cpu } from 'lucide-react';

type ImprovementCategory = 'performance' | 'code' | 'architecture';
type ImprovementStatus = 'pending' | 'approved' | 'rejected' | 'reanalyze';

interface Improvement {
  id: string;
  title: string;
  description: string;
  impact: Record<string, string>;
  codeChanges: string | string[];
  status: ImprovementStatus;
  priority: string;
  aiAnalyst: string;
  timestamp: string;
}

interface ImprovementsState {
  performance: Improvement[];
  code: Improvement[];
  architecture: Improvement[];
}

interface RefactoringSuggestion {
  id: string;
  module: string;
  issues: string[];
  suggestion: {
    pattern: string;
  };
}

interface UserFeedback {
  refactoring: RefactoringSuggestion[];
}

const OptimizationDashboard = () => {
  const [improvements, setImprovements] = useState<ImprovementsState>({
    performance: [
      {
        id: 'perf-1',
        title: 'Optimisation du rendu des avatars',
        description: 'Réécriture du système de rendu en WebGL pour réduire la latence de 60%',
        impact: {
          cpuUsage: '-45%',
          memoryUsage: '-30%',
          renderTime: '-60%'
        },
        codeChanges: 'src/rendering/avatarRenderer.ts',
        status: 'pending',
        priority: 'high',
        aiAnalyst: 'IA-Performance-01',
        timestamp: '2024-03-28 14:23'
      }
    ],
    code: [
      {
        id: 'code-1',
        title: 'Refactoring du module de traduction',
        description: 'Implémentation du pattern Observer pour améliorer la réactivité',
        impact: {
          maintainability: '+40%',
          testCoverage: '+25%',
          complexity: '-35%'
        },
        codeChanges: [
          'src/translation/core.ts',
          'src/translation/observers/*'
        ],
        status: 'pending',
        priority: 'medium',
        aiAnalyst: 'IA-CodeReview-02',
        timestamp: '2024-03-28 15:45'
      }
    ],
    architecture: [
      {
        id: 'arch-1',
        title: 'Migration vers une architecture événementielle',
        description: 'Proposition de passage à Event Sourcing pour améliorer la scalabilité',
        impact: {
          scalability: '+70%',
          reliability: '+45%',
          maintenance: '+30%'
        },
        codeChanges: 'Multiple modules',
        status: 'pending',
        priority: 'high',
        aiAnalyst: 'IA-Architect-01',
        timestamp: '2024-03-28 16:12'
      }
    ]
  });

  const [activeAnalysis, setActiveAnalysis] = useState<Improvement | null>(null);

  const handleAction = (category: ImprovementCategory, id: string, action: ImprovementStatus) => {
    setImprovements(prev => ({
      ...prev,
      [category]: prev[category].map((item: Improvement) =>
        item.id === id ? { ...item, status: action } : item
      )
    }));
  };

  const userFeedback: UserFeedback = {
    refactoring: [
      {
        id: 'ref-1',
        module: 'Translation Module',
        issues: ['Issue 1', 'Issue 2'],
        suggestion: {
          pattern: 'Use Observer Pattern'
        }
      }
    ]
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Optimization Center</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Trigger Analysis
          </Button>
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance" className="font-bold text-xl px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-shadow flex items-center">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="code" className="font-bold text-xl px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-shadow flex items-center">
            <Code className="h-4 w-4" />
            Code Quality
          </TabsTrigger>
          <TabsTrigger value="architecture" className="font-bold text-xl px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-shadow flex items-center">
            <Cpu className="h-4 w-4" />
            Architecture
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Improvements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {improvements.performance.map(improvement => (
                  <div key={improvement.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{improvement.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {improvement.description}
                        </p>

                        {/* Impact Metrics */}
                        <div className="mt-3 flex gap-3">
                          {Object.entries(improvement.impact).map(([key, value]) => (
                            <span key={key} className="bg-white px-2 py-1 rounded text-sm">
                              {key}: <span className="text-green-600">{value}</span>
                            </span>
                          ))}
                        </div>

                        {/* Code Changes */}
                        <div className="mt-3 text-sm">
                          <span className="font-medium">Files affected: </span>
                          <code className="bg-gray-100 px-2 py-1 rounded">
                            {Array.isArray(improvement.codeChanges) ? improvement.codeChanges.join(', ') : improvement.codeChanges}
                          </code>
                        </div>

                        {/* Metadata */}
                        <div className="mt-3 flex gap-4 text-sm text-gray-500">
                          <span>Analyst: {improvement.aiAnalyst}</span>
                          <span>Priority: {improvement.priority}</span>
                          <span>Proposed: {improvement.timestamp}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction('performance', improvement.id, 'approved')}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction('performance', improvement.id, 'rejected')}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction('performance', improvement.id, 'reanalyze')}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveAnalysis(improvement)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Suggestions de Refactoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userFeedback.refactoring.map((ref: RefactoringSuggestion) => (
                  <div key={ref.id} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium">{ref.module}</h3>

                    <div className="mt-3 space-y-2">
                      <div className="bg-white p-3 rounded">
                        <h4 className="text-sm font-medium">Issues:</h4>
                        <ul className="mt-1 space-y-1">
                          {ref.issues.map((issue: string, idx: number) => (
                            <li key={idx} className="text-sm">{issue}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded">
                        <h4 className="text-sm font-medium">Solution Proposée:</h4>
                        <p className="text-sm mt-1">{ref.suggestion.pattern}</p>
                        <div className="mt-2 flex gap-2">
                          <Button variant="outline" size="sm">Voir Avant</Button>
                          <Button variant="outline" size="sm">Voir Après</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Similar content for Architecture tab */}
      </Tabs>

      {/* Active Analysis Dialog */}
      {activeAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Detailed Analysis</h2>
            {/* Add detailed analysis content here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizationDashboard;