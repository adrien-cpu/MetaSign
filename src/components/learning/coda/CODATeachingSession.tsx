/**
 * @fileoverview Interface de session d'enseignement CODA virtuel
 * Chemin: src/components/learning/coda/CODATeachingSession.tsx
 * 
 * Interface interactive pour enseigner la LSF à un avatar IA avec feedback en temps réel,
 * correction d'erreurs et adaptation pédagogique dynamique.
 * 
 * @author MetaSign AI Team
 * @version 1.0.0
 * @since 2024
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Progress from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
    Camera,
    Mic,
    MicOff,
    Video,
    VideoOff,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Lightbulb,
    Target,
    Timer,
    BookOpen,
    Brain
} from 'lucide-react';

// Types pour la session d'enseignement
interface TeachingSessionState {
    id: string;
    studentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    currentExercise: Exercise;
    progress: number;
    timeElapsed: number;
    isRecording: boolean;
    isVideoEnabled: boolean;
    feedback: SessionFeedback[];
    studentResponse: StudentResponse | null;
    teacherGuidance: string;
}

interface Exercise {
    id: string;
    type: 'vocabulary' | 'grammar' | 'expression' | 'comprehension';
    title: string;
    description: string;
    targetSigns: string[];
    difficulty: number;
    context: string;
    expectedResponse: string;
}

interface SessionFeedback {
    id: string;
    type: 'correction' | 'encouragement' | 'suggestion' | 'question';
    message: string;
    timestamp: Date;
    severity: 'info' | 'warning' | 'error' | 'success';
}

interface StudentResponse {
    id: string;
    videoData: string; // Base64 ou URL
    signAccuracy: number;
    grammarCorrectness: number;
    expressionClarity: number;
    mistakes: StudentMistake[];
    strengths: string[];
}

interface StudentMistake {
    type: 'spatial' | 'temporal' | 'manual' | 'facial';
    description: string;
    correction: string;
    severity: 'minor' | 'major' | 'critical';
}

/**
 * Composant de session d'enseignement CODA
 * 
 * Permet aux utilisateurs d'enseigner la LSF à un avatar IA avec :
 * - Enregistrement vidéo des signes de l'utilisateur
 * - Analyse en temps réel des performances de l'avatar
 * - Feedback pédagogique adaptatif
 * - Correction d'erreurs guidée
 */
const CODATeachingSession: React.FC = () => {
    // États du composant
    const [sessionState, setSessionState] = useState<TeachingSessionState>({
        id: `session-${Date.now()}`,
        studentLevel: 'A2',
        currentExercise: {
            id: 'ex-001',
            type: 'vocabulary',
            title: 'Les émotions de base',
            description: 'Enseigner les signes pour exprimer la joie, la tristesse, la colère et la surprise',
            targetSigns: ['JOIE', 'TRISTESSE', 'COLÈRE', 'SURPRISE'],
            difficulty: 2,
            context: 'Situation quotidienne - Expression des sentiments',
            expectedResponse: 'Avatar doit reproduire les 4 signes avec les expressions faciales appropriées'
        },
        progress: 0,
        timeElapsed: 0,
        isRecording: false,
        isVideoEnabled: true,
        feedback: [],
        studentResponse: null,
        teacherGuidance: ''
    });

    const [currentPhase, setCurrentPhase] = useState<'preparation' | 'demonstration' | 'practice' | 'evaluation'>('preparation');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Timer pour la session
    useEffect(() => {
        if (currentPhase !== 'preparation') {
            timerRef.current = setInterval(() => {
                setSessionState(prev => ({
                    ...prev,
                    timeElapsed: prev.timeElapsed + 1
                }));
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [currentPhase]);

    // Handlers
    const handleStartRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setSessionState(prev => ({ ...prev, isRecording: true }));
            addFeedback('info', 'Enregistrement démarré. Montrez le signe à votre avatar étudiant.');
        } catch (error) {
            console.error('Erreur lors du démarrage de l\'enregistrement:', error);
            addFeedback('error', 'Impossible d\'accéder à la caméra. Vérifiez vos permissions.');
        }
    }, []);

    const handleStopRecording = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }

        setSessionState(prev => ({ ...prev, isRecording: false }));
        setIsAnalyzing(true);

        // Simulation de l'analyse de la performance de l'avatar
        setTimeout(() => {
            simulateStudentResponse();
            setIsAnalyzing(false);
        }, 3000);
    }, []);

    const simulateStudentResponse = useCallback(() => {
        const mockResponse: StudentResponse = {
            id: `response-${Date.now()}`,
            videoData: 'mock-video-data',
            signAccuracy: Math.floor(Math.random() * 40) + 60, // 60-100%
            grammarCorrectness: Math.floor(Math.random() * 30) + 70, // 70-100%
            expressionClarity: Math.floor(Math.random() * 35) + 65, // 65-100%
            mistakes: [
                {
                    type: 'facial',
                    description: 'Expression faciale insuffisante pour "COLÈRE"',
                    correction: 'Accentuer le froncement des sourcils et la tension de la mâchoire',
                    severity: 'minor'
                },
                {
                    type: 'spatial',
                    description: 'Espace de signation trop restreint pour "SURPRISE"',
                    correction: 'Élargir le mouvement vers l\'extérieur avec les mains',
                    severity: 'major'
                }
            ],
            strengths: ['Fluidité du mouvement', 'Précision des configurations manuelles']
        };

        setSessionState(prev => ({ ...prev, studentResponse: mockResponse }));
        setCurrentPhase('evaluation');

        addFeedback('success', `L'avatar a reproduit les signes avec ${mockResponse.signAccuracy}% de précision !`);
    }, []);

    const addFeedback = useCallback((severity: SessionFeedback['severity'], message: string) => {
        const newFeedback: SessionFeedback = {
            id: `feedback-${Date.now()}`,
            type: severity === 'error' ? 'correction' : severity === 'success' ? 'encouragement' : 'suggestion',
            message,
            timestamp: new Date(),
            severity
        };

        setSessionState(prev => ({
            ...prev,
            feedback: [...prev.feedback, newFeedback]
        }));
    }, []);

    const handleProvideCorrection = useCallback((mistake: StudentMistake) => {
        addFeedback('info', `Correction: ${mistake.correction}`);

        // Simulation de l'amélioration de l'avatar après correction
        setTimeout(() => {
            setSessionState(prev => ({
                ...prev,
                studentResponse: prev.studentResponse ? {
                    ...prev.studentResponse,
                    mistakes: prev.studentResponse.mistakes.filter(m => m !== mistake)
                } : null,
                progress: Math.min(prev.progress + 10, 100)
            }));
            addFeedback('success', 'L\'avatar a intégré votre correction !');
        }, 2000);
    }, []);

    const handleNextExercise = useCallback(() => {
        setCurrentPhase('preparation');
        setSessionState(prev => ({
            ...prev,
            studentResponse: null,
            feedback: [],
            progress: 0
        }));
        addFeedback('info', 'Nouvel exercice chargé. Préparez votre démonstration.');
    }, []);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getFeedbackIcon = (severity: SessionFeedback['severity']) => {
        switch (severity) {
            case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
            default: return <MessageSquare className="w-4 h-4 text-blue-600" />;
        }
    };

    const getSeverityColor = (severity: StudentMistake['severity']) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'major': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header avec informations de session */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Session CODA: {sessionState.currentExercise.title}
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                        <Badge className="bg-blue-100 text-blue-800">
                            Niveau {sessionState.studentLevel}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Timer className="w-4 h-4" />
                            {formatTime(sessionState.timeElapsed)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Target className="w-4 h-4" />
                            Phase: {currentPhase}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Progress value={sessionState.progress} className="w-32" />
                    <span className="text-sm font-medium">{sessionState.progress}%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Zone principale - Vidéo et contrôles */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Exercice actuel */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Exercice en cours
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">{sessionState.currentExercise.title}</h3>
                                <p className="text-gray-600 mb-3">{sessionState.currentExercise.description}</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Signes à enseigner:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {sessionState.currentExercise.targetSigns.map((sign, index) => (
                                                <Badge key={index} variant="outline">
                                                    {sign}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Contexte:</p>
                                        <p className="text-sm text-gray-600">{sessionState.currentExercise.context}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Zone vidéo */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Camera className="w-5 h-5" />
                                    Démonstration
                                </span>
                                <div className="flex items-center gap-2">
                                    {sessionState.isRecording && (
                                        <div className="flex items-center gap-2 text-red-600">
                                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                                            <span className="text-sm font-medium">REC</span>
                                        </div>
                                    )}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
                                {sessionState.isVideoEnabled ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-white">
                                        <VideoOff className="w-12 h-12 mb-2" />
                                        <p>Caméra désactivée</p>
                                    </div>
                                )}

                                {isAnalyzing && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                                            <p>Analyse de la performance de l'avatar...</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Contrôles vidéo */}
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setSessionState(prev => ({
                                        ...prev,
                                        isVideoEnabled: !prev.isVideoEnabled
                                    }))}
                                >
                                    {sessionState.isVideoEnabled ? (
                                        <Video className="w-4 h-4 mr-2" />
                                    ) : (
                                        <VideoOff className="w-4 h-4 mr-2" />
                                    )}
                                    {sessionState.isVideoEnabled ? 'Caméra ON' : 'Caméra OFF'}
                                </Button>

                                {!sessionState.isRecording ? (
                                    <Button
                                        onClick={handleStartRecording}
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={!sessionState.isVideoEnabled || isAnalyzing}
                                    >
                                        <Mic className="w-4 h-4 mr-2" />
                                        Commencer la démonstration
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleStopRecording}
                                        variant="destructive"
                                    >
                                        <MicOff className="w-4 h-4 mr-2" />
                                        Arrêter l'enregistrement
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Résultats de l'avatar */}
                    {sessionState.studentResponse && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="w-5 h-5" />
                                    Performance de l'avatar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Métriques */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Précision des signes</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {sessionState.studentResponse.signAccuracy}%
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Grammaire</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {sessionState.studentResponse.grammarCorrectness}%
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Expression</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {sessionState.studentResponse.expressionClarity}%
                                        </p>
                                    </div>
                                </div>

                                {/* Points forts */}
                                {sessionState.studentResponse.strengths.length > 0 && (
                                    <div>
                                        <p className="font-medium text-green-700 mb-2 flex items-center gap-2">
                                            <ThumbsUp className="w-4 h-4" />
                                            Points forts
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {sessionState.studentResponse.strengths.map((strength, index) => (
                                                <Badge key={index} className="bg-green-100 text-green-800">
                                                    {strength}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Erreurs à corriger */}
                                {sessionState.studentResponse.mistakes.length > 0 && (
                                    <div>
                                        <p className="font-medium text-orange-700 mb-2 flex items-center gap-2">
                                            <ThumbsDown className="w-4 h-4" />
                                            Erreurs détectées
                                        </p>
                                        <div className="space-y-2">
                                            {sessionState.studentResponse.mistakes.map((mistake, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-3 rounded-lg border ${getSeverityColor(mistake.severity)}`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="font-medium">{mistake.description}</p>
                                                            <p className="text-sm mt-1">
                                                                <strong>Correction:</strong> {mistake.correction}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleProvideCorrection(mistake)}
                                                            className="ml-4"
                                                        >
                                                            <Lightbulb className="w-4 h-4 mr-1" />
                                                            Corriger
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex justify-center gap-4 pt-4">
                                    <Button onClick={handleNextExercise} className="bg-blue-600 hover:bg-blue-700">
                                        Exercice suivant
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Panneau latéral - Feedback et conseils */}
                <div className="space-y-6">
                    {/* Feedback en temps réel */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Feedback en temps réel
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {sessionState.feedback.length === 0 ? (
                                    <p className="text-gray-500 text-sm">
                                        Les retours apparaîtront ici pendant la session...
                                    </p>
                                ) : (
                                    sessionState.feedback.map((feedback) => (
                                        <div key={feedback.id} className="flex items-start gap-2">
                                            {getFeedbackIcon(feedback.severity)}
                                            <div className="flex-1">
                                                <p className="text-sm">{feedback.message}</p>
                                                <p className="text-xs text-gray-500">
                                                    {feedback.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes pédagogiques */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="w-5 h-5" />
                                Notes pédagogiques
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={sessionState.teacherGuidance}
                                onChange={(e) => setSessionState(prev => ({
                                    ...prev,
                                    teacherGuidance: e.target.value
                                }))}
                                placeholder="Notez vos observations et stratégies d'enseignement..."
                                className="min-h-32"
                            />
                        </CardContent>
                    </Card>

                    {/* Conseils adaptatifs */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="w-5 h-5" />
                                Conseils adaptatifs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="font-medium text-blue-800">💡 Astuce</p>
                                    <p className="text-blue-700">
                                        Pour ce niveau A2, insistez sur les expressions faciales qui accompagnent chaque émotion.
                                    </p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <p className="font-medium text-green-800">✅ Stratégie</p>
                                    <p className="text-green-700">
                                        Répétez chaque signe 3 fois avant de passer au suivant pour favoriser la mémorisation.
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <p className="font-medium text-purple-800">🎯 Objectif</p>
                                    <p className="text-purple-700">
                                        L'avatar doit atteindre 80% de précision pour valider cet exercice.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CODATeachingSession;