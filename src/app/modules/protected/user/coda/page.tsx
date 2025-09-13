'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brain, Play, Pause, RotateCcw, Settings, MessageCircle, BookOpen, Trophy, Heart, Wifi, WifiOff } from 'lucide-react';
import Banner from '@/components/ui/banner';
import { ROUTES } from '@/constants/routes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCODAService } from './hooks/useCODAService';

interface CODASession {
  id: string;
  startTime: Date;
  duration: number;
  interactions: number;
  emotionalState: 'curious' | 'frustrated' | 'excited' | 'focused' | 'tired';
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

interface CODAMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  emotionalTone?: string;
  gestureDescription?: string;
}

const CODAPage = () => {
  const [session, setSession] = useState<CODASession | null>(null);
  const [messages, setMessages] = useState<CODAMessage[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('A2');
  const [selectedPersonality, setSelectedPersonality] = useState('Curieux');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Utilisation du service CODA
  const {
    isConnected,
    isLoading: codaLoading,
    error: codaError,
    initializeSession,
    sendMessage: sendCODAMessage,
    endSession,
    clearError
  } = useCODAService();

  const emotionalStateColors = {
    curious: 'text-blue-500',
    frustrated: 'text-red-500',
    excited: 'text-yellow-500',
    focused: 'text-green-500',
    tired: 'text-gray-500'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSession = async () => {
    try {
      clearError();
      const newSession = await initializeSession({
        level: selectedLevel,
        personality: selectedPersonality,
        mentorId: 'user_mentor' // À récupérer du contexte utilisateur
      });

      setSession(newSession);
      setIsSessionActive(true);
      setMessages([
        {
          id: 'welcome',
          type: 'ai',
          content: "Salut ! Je suis ton élève CODA virtuel. Je vais apprendre la LSF avec toi aujourd'hui ! 👋 Comment on commence ?",
          timestamp: new Date(),
          emotionalTone: 'curious',
          gestureDescription: 'Salutation enthousiaste avec les mains'
        }
      ]);
    } catch (error) {
      console.error('Erreur lors du démarrage de la session:', error);
    }
  };

  const pauseSession = () => {
    setIsSessionActive(false);
  };

  const resumeSession = () => {
    setIsSessionActive(true);
  };

  const resetSession = async () => {
    if (session) {
      await endSession(session.id);
    }
    setSession(null);
    setIsSessionActive(false);
    setMessages([]);
    setUserInput('');
    clearError();
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !session) return;

    const userMessage: CODAMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = userInput;
    setUserInput('');
    setIsTyping(true);

    try {
      // Utiliser le service CODA pour envoyer le message
      const codaResponse = await sendCODAMessage(session.id, messageToSend);
      
      const aiResponse: CODAMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: codaResponse.message,
        timestamp: new Date(),
        emotionalTone: codaResponse.emotionalState,
        gestureDescription: codaResponse.gestureDescription || 'Geste d\'apprentissage avec concentration'
      };

      setMessages(prev => [...prev, aiResponse]);

      // Mettre à jour la session avec les nouvelles informations
      setSession(prev => prev ? {
        ...prev,
        interactions: prev.interactions + 1,
        emotionalState: codaResponse.emotionalState as any,
        currentLevel: codaResponse.level as any
      } : null);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      // Message d'erreur pour l'utilisateur
      const errorMessage: CODAMessage = {
        id: `error_${Date.now()}`,
        type: 'ai',
        content: "Désolé, j'ai un petit problème technique... Peux-tu réessayer ? 😅",
        timestamp: new Date(),
        emotionalTone: 'frustrated'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div>
      <Banner
        title="CODA Virtuel"
        description="Système d'apprentissage inversé avec IA CODA"
        icon={<Brain className="text-cyan-600" />}
        backHref={ROUTES.USER_DASHBOARD}
      />

      <div className="container mx-auto px-6 py-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Section principale - Chat */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
                      <Brain className="text-white text-lg" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">Assistant CODA</h3>
                        {isConnected ? (
                          <Wifi className="w-4 h-4 text-green-500" title="Connecté au service CODA" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-red-500" title="Mode simulation" />
                        )}
                      </div>
                      {session && (
                        <p className={`text-sm ${emotionalStateColors[session.emotionalState]}`}>
                          État : {session.emotionalState} • Niveau : {session.currentLevel}
                        </p>
                      )}
                      {codaError && (
                        <p className="text-xs text-red-500 mt-1">
                          ⚠️ Mode simulation actif
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!session ? (
                      <Button 
                        onClick={startSession} 
                        disabled={codaLoading}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {codaLoading ? 'Connexion...' : 'Démarrer'}
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={isSessionActive ? pauseSession : resumeSession}
                          variant={isSessionActive ? "outline" : "default"}
                          disabled={codaLoading}
                        >
                          {isSessionActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button onClick={resetSession} variant="outline" disabled={codaLoading}>
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !session && (
                  <div className="text-center text-gray-500 mt-20">
                    <Brain className="w-16 h-16 mx-auto mb-4 text-cyan-300" />
                    <h3 className="text-xl font-semibold mb-2">Prêt pour une session CODA ?</h3>
                    <p>Démarrez une session pour commencer l'apprentissage inversé avec votre élève IA !</p>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-cyan-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p>{message.content}</p>
                      {message.gestureDescription && (
                        <p className="text-xs mt-2 opacity-70 italic">
                          🤲 {message.gestureDescription}
                        </p>
                      )}
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input zone */}
              {session && isSessionActive && (
                <div className="p-4 border-t">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Enseignez quelque chose à votre élève CODA..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <Button onClick={sendMessage} disabled={!userInput.trim()} className="bg-cyan-600 hover:bg-cyan-700">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Panneau latéral - Statistiques et contrôles */}
          <div className="space-y-4">
            {/* Statistiques de session */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Statistiques
              </h3>
              {session ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Interactions:</span>
                    <span className="font-semibold">{session.interactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Niveau actuel:</span>
                    <span className="font-semibold text-cyan-600">{session.currentLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">État émotionnel:</span>
                    <span className={`font-semibold ${emotionalStateColors[session.emotionalState]}`}>
                      {session.emotionalState}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Durée:</span>
                    <span className="font-semibold">
                      {Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60)}min
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucune session active</p>
              )}
            </Card>

            {/* Paramètres rapides */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Configuration
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Niveau d'apprentissage</label>
                  <select 
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    disabled={!!session}
                    className="w-full mt-1 px-3 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                  >
                    <option value="A1">A1 - Débutant</option>
                    <option value="A2">A2 - Élémentaire</option>
                    <option value="B1">B1 - Intermédiaire</option>
                    <option value="B2">B2 - Avancé</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Personnalité IA</label>
                  <select 
                    value={selectedPersonality}
                    onChange={(e) => setSelectedPersonality(e.target.value)}
                    disabled={!!session}
                    className="w-full mt-1 px-3 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                  >
                    <option value="Curieux">Curieux</option>
                    <option value="Studieux">Studieux</option>
                    <option value="Playful">Playful</option>
                    <option value="Déterminé">Déterminé</option>
                  </select>
                </div>
                {codaError && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    <strong>Mode simulation :</strong> L'API CODA n'est pas disponible. Les fonctionnalités sont simulées localement.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Section aide en dessous */}
        <div className="mt-8 max-w-6xl mx-auto">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Guide d'utilisation CODA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">🤖 IA Apprenante</h4>
                <p>L&apos;IA CODA apprend de vous comme un vrai élève. Elle fait des erreurs, pose des questions et progresse selon vos enseignements.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">🎭 Émotions Réalistes</h4>
                <p>Elle a des émotions et une personnalité qui évoluent : curiosité, frustration, excitement, concentration, fatigue.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">📈 Progression Adaptative</h4>
                <p>Son niveau progresse selon vos enseignements et s&apos;adapte à votre style pédagogique personnel.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">❓ Questions Pertinentes</h4>
                <p>Elle pose des questions intelligentes sur la LSF et demande des clarifications comme un vrai apprenant.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CODAPage;