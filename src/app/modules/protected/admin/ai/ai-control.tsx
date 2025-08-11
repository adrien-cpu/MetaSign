"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, PlayCircle, PauseCircle, RefreshCw } from "lucide-react";

interface AIControlState {
    status: "active" | "paused" | "loading";
    metrics: {
        accuracy: number;
        latency: number;
        requests: number;
    };
}

const AiControl: React.FC = () => {
    const [state, setState] = React.useState<AIControlState>({
        status: "active",
        metrics: {
            accuracy: 95.5,
            latency: 150,
            requests: 1200
        }
    });

    // Fonction pour rafraîchir les métriques
    const refreshMetrics = () => {
        setState(prev => ({
            ...prev,
            metrics: {
                accuracy: +(prev.metrics.accuracy + (Math.random() * 2 - 1)).toFixed(1),
                latency: Math.max(50, Math.floor(prev.metrics.latency + (Math.random() * 40 - 20))),
                requests: prev.metrics.requests + Math.floor(Math.random() * 100)
            }
        }));
    };

    return (
        <div className="grid gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="h-6 w-6" />
                            État du Système
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={refreshMetrics}
                            className="hover:bg-slate-100"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <p>Status: {state.status}</p>
                            <p>Précision: {state.metrics.accuracy}%</p>
                            <p>Latence: {state.metrics.latency}ms</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setState(prev => ({
                                ...prev,
                                status: prev.status === "active" ? "paused" : "active"
                            }))}
                        >
                            {state.status === "active" ? (
                                <PauseCircle className="h-4 w-4 mr-2" />
                            ) : (
                                <PlayCircle className="h-4 w-4 mr-2" />
                            )}
                            {state.status === "active" ? "Pause" : "Start"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AiControl;