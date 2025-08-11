"use client";

import React, { useState } from 'react';
import { Video, Mic, Activity, CheckCircle, XCircle, Upload, Box } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type FeatureWithAlgorithm = {
  algorithm: string;
  performance: number;
};

type FeatureWithMethod = {
  method: string;
  performance: number;
};

type VisualFeature = {
  contouring: FeatureWithAlgorithm & { threshold: number };
  grayscale: FeatureWithMethod;
  noise_reduction: FeatureWithAlgorithm;
};

type AudioFeature = {
  noise_reduction: FeatureWithAlgorithm;
  voice_isolation: FeatureWithMethod;
  echo_cancellation: FeatureWithAlgorithm;
};

type SandboxTest = {
  id: string;
  type: string;
  features: VisualFeature | AudioFeature;
  status: string;
  progress: number;
};

type Deployment = {
  ready: boolean;
  validations: Record<string, boolean>;
  metrics: {
    performance: number;
    reliability: number;
    accuracy: number;
  };
};

type SandboxTestsState = {
  visual: SandboxTest[];
  audio: SandboxTest[];
  deployment: Deployment;
};

const isFeatureWithAlgorithm = (feature: FeatureWithAlgorithm | FeatureWithMethod): feature is FeatureWithAlgorithm => {
  return (feature as FeatureWithAlgorithm).algorithm !== undefined;
};

const SandboxDashboard = () => {
  const [sandboxTests, setSandboxTests] = useState<SandboxTestsState>({
    visual: [
      {
        id: 'vis-1',
        type: 'image_processing',
        features: {
          contouring: {
            algorithm: 'canny_edge',
            threshold: 0.75,
            performance: 92
          },
          grayscale: {
            method: 'weighted_conversion',
            performance: 95
          },
          noise_reduction: {
            algorithm: 'bilateral_filter',
            performance: 88
          }
        },
        status: 'running',
        progress: 65
      }
    ],
    audio: [
      {
        id: 'aud-1',
        type: 'noise_suppression',
        features: {
          noise_reduction: {
            algorithm: 'deep_filter',
            performance: 90
          },
          voice_isolation: {
            method: 'neural_separation',
            performance: 87
          },
          echo_cancellation: {
            algorithm: 'adaptive_filter',
            performance: 92
          }
        },
        status: 'completed',
        progress: 100
      }
    ],
    deployment: {
      ready: false,
      validations: {
        'IA-Judge-01': true,
        'IA-Spectator-02': true,
        'IA-User-01': false
      },
      metrics: {
        performance: 92,
        reliability: 88,
        accuracy: 90
      }
    }
  });

  // Fonctions de mise à jour
  const updateTestProgress = (testId: string, type: 'visual' | 'audio', newProgress: number) => {
    setSandboxTests(prev => ({
      ...prev,
      [type]: prev[type].map(test =>
        test.id === testId ? { ...test, progress: newProgress } : test
      )
    }));
  };

  const updateTestStatus = (testId: string, type: 'visual' | 'audio', newStatus: string) => {
    setSandboxTests(prev => ({
      ...prev,
      [type]: prev[type].map(test =>
        test.id === testId ? { ...test, status: newStatus } : test
      )
    }));
  };

  const updateDeploymentStatus = (ready: boolean) => {
    setSandboxTests(prev => ({
      ...prev,
      deployment: {
        ...prev.deployment,
        ready
      }
    }));
  };

  // Ajout des gestionnaires d'événements aux boutons
  const handleDeploy = () => {
    if (sandboxTests.deployment.ready) {
      // Logique de déploiement
      console.log('Déploiement en cours...');
      // Désactive temporairement le déploiement pendant le processus
      updateDeploymentStatus(false);

      // Simuler un processus de déploiement
      setTimeout(() => {
        console.log('Déploiement terminé');
        updateDeploymentStatus(true);
      }, 3000);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Visual Processing Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Visual Processing Sandbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sandboxTests.visual.map(test => (
              <div key={test.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <h3 className="font-medium flex items-center gap-2">
                      {test.type}
                      {test.status === 'running' && (
                        <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
                      )}
                    </h3>

                    {/* Features Testing */}
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {Object.entries(test.features).map(([key, data]) => (
                        <div key={key} className="bg-white p-3 rounded">
                          <h4 className="text-sm font-medium capitalize">{key}</h4>
                          <div className="mt-2 space-y-1">
                            <div className="text-sm">
                              {isFeatureWithAlgorithm(data) ? `Algorithm: ${data.algorithm}` : `Method: ${data.method}`}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="bg-gray-200 h-2 flex-grow rounded-full">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${data.performance}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {data.performance}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Test Progress</span>
                        <span>{test.progress}%</span>
                      </div>
                      <div className="bg-gray-200 h-2 rounded-full">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${test.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateTestStatus(test.id, 'visual', 'running');
                          let progress = 0;
                          const interval = setInterval(() => {
                            progress += 5;
                            updateTestProgress(test.id, 'visual', progress);
                            if (progress >= 100) {
                              clearInterval(interval);
                              updateTestStatus(test.id, 'visual', 'completed');
                            }
                          }, 500);
                        }}
                        disabled={test.status === 'running' || test.progress === 100}
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Start Test
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audio Processing Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Audio Processing Sandbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sandboxTests.audio.map(test => (
              <div key={test.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <h3 className="font-medium flex items-center gap-2">
                      {test.type}
                      {test.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </h3>

                    {/* Audio Features Testing */}
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {Object.entries(test.features).map(([key, data]) => (
                        <div key={key} className="bg-white p-3 rounded">
                          <h4 className="text-sm font-medium capitalize">
                            {key.replace('_', ' ')}
                          </h4>
                          <div className="mt-2 space-y-1">
                            <div className="text-sm">
                              {isFeatureWithAlgorithm(data) ? `Algorithm: ${data.algorithm}` : `Method: ${data.method}`}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="bg-gray-200 h-2 flex-grow rounded-full">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${data.performance}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {data.performance}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Deployment Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* AI Validations */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">AI Validation Status</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(sandboxTests.deployment.validations).map(([ai, status]) => (
                  <div key={ai} className="bg-white p-3 rounded flex justify-between items-center">
                    <span className="text-sm font-medium">{ai}</span>
                    {status ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Performance Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(sandboxTests.deployment.metrics).map(([metric, value]) => (
                  <div key={metric} className="bg-white p-3 rounded">
                    <h4 className="text-sm font-medium capitalize">{metric}</h4>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="bg-gray-200 h-2 flex-grow rounded-full">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deploy Button */}
            <Button
              className="w-full"
              disabled={!sandboxTests.deployment.ready}
              onClick={handleDeploy}
            >
              <Upload className="h-4 w-4 mr-2" />
              Deploy to Production
            </Button>

            {/* Validate Deployment Button */}
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                const allValid = Object.values(sandboxTests.deployment.validations).every(Boolean);
                const metricsThreshold = Object.values(sandboxTests.deployment.metrics).every(value => value >= 85);
                updateDeploymentStatus(allValid && metricsThreshold);
              }}
            >
              Validate Deployment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SandboxDashboard;
