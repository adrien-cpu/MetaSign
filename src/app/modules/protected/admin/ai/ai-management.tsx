"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, Database, Brain, GitBranch } from "lucide-react";

const AIManagement = () => {
    const [state, setState] = useState({
        models: {
            active: [
                {
                    id: 'lsf-translator-v2',
                    name: 'LSF Translator',
                    version: '2.0',
                    status: 'running',
                    performance: 95.5,
                    lastUpdate: '2024-02-25'
                }
            ],
            training: [
                {
                    id: 'lsf-analyzer-v1',
                    name: 'LSF Analyzer',
                    version: '1.0',
                    progress: 75,
                    eta: '2h30'
                }
            ]
        }
    });

    // Fonction pour mettre à jour le statut d'un modèle
    const updateModelStatus = (modelId: string, newStatus: 'running' | 'paused' | 'error') => {
        setState(prev => ({
            ...prev,
            models: {
                ...prev.models,
                active: prev.models.active.map(model =>
                    model.id === modelId ? { ...model, status: newStatus } : model
                )
            }
        }));
    };

    // Fonction pour mettre à jour la progression d'entraînement
    const updateTrainingProgress = (modelId: string, progress: number) => {
        setState(prev => ({
            ...prev,
            models: {
                ...prev.models,
                training: prev.models.training.map(model =>
                    model.id === modelId ? { ...model, progress } : model
                )
            }
        }));
    };

    // Simuler la progression automatique
    useEffect(() => {
        const interval = setInterval(() => {
            setState(prev => ({
                ...prev,
                models: {
                    ...prev.models,
                    training: prev.models.training.map(model => ({
                        ...model,
                        progress: model.progress < 100
                            ? Math.min(model.progress + 1, 100)
                            : model.progress
                    }))
                }
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []); // Pas besoin de dépendances car nous utilisons le updater de setState

    return (
        <div className="space-y-6">
            {/* En-tête statistiques */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            Modèles Actifs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{state.models.active.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <GitBranch className="h-4 w-4" />
                            En Entraînement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{state.models.training.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Utilisateurs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Données
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2.5 TB</div>
                    </CardContent>
                </Card>
            </div>

            {/* Modèles actifs */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Modèles en production
                    </CardTitle>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Configuration
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {state.models.active.map(model => (
                            <div key={model.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-medium">{model.name} v{model.version}</h3>
                                        <p className="text-sm text-gray-500">Dernière mise à jour : {model.lastUpdate}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium">
                                            Performance: {model.performance}%
                                        </span>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateModelStatus(model.id, 'paused')}
                                            >
                                                {model.status === 'running' ? 'Pause' : 'Reprendre'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Modèles en entraînement */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        Modèles en entraînement
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            // Simuler une mise à jour de progression
                            state.models.training.forEach(model => {
                                updateTrainingProgress(model.id,
                                    Math.min(model.progress + 5, 100)
                                );
                            });
                        }}
                        className="flex items-center gap-2"
                    >
                        Accélérer l&apos;entraînement
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {state.models.training.map(model => (
                            <div key={model.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-medium">{model.name} v{model.version}</h3>
                                        <p className="text-sm text-gray-500">Temps restant estimé : {model.eta}</p>
                                    </div>
                                    <div className="w-64">
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500"
                                                style={{ width: `${model.progress}%` }}
                                            />
                                        </div>
                                        <p className="text-sm text-center mt-1">{model.progress}%</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AIManagement;
