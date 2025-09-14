/**
 * @file MultimodalLearningStudio.tsx
 * @description Studio d'apprentissage multimodal combinant vidéo, texte et IA CODA
 * @author MetaSign Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TeacherVideoInterface } from './TeacherVideoInterface';
import { CODAAvatar3D } from './CODAAvatar3D';
import { useVideoLearning } from '../hooks/useVideoLearning';
import { useAvatarSigning } from '../hooks/useAvatarSigning';
import { useCODAService } from '../../coda/hooks/useCODAService';
import { CODAVideoIntegration } from '../services/CODAVideoIntegration';
import type { SignRecognitionResult } from '../services/VideoLearningBridge';

interface MultimodalLearningStudioProps {
  teacherId: string;
  className?: string;
}

export const MultimodalLearningStudio: React.FC<MultimodalLearningStudioProps> = ({
  teacherId,
  className
}) => {
  // Hooks pour les services
  const videoLearning = useVideoLearning();
  const codaService = useCODAService();
  const avatarSigning = useAvatarSigning();
  
  // États locaux
  const [integrationActive, setIntegrationActive] = useState(false);
  const [codaFeedback, setCodaFeedback] = useState<any[]>([]);
  const [learningStats, setLearningStats] = useState<any>(null);
  const [currentCodaResponse, setCurrentCodaResponse] = useState<string>('');
  const [avatarActive, setAvatarActive] = useState(false);

  // Référence vers l'intégration
  const integrationRef = useRef<CODAVideoIntegration | null>(null);
  const statsUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialise l'intégration CODA-Vidéo
   */
  useEffect(() => {
    const initializeIntegration = async () => {
      if (videoLearning.isConnected && codaService.isConnected) {
        try {
          // Créer l'intégration (en production, utiliser les vrais bridges)
          // integrationRef.current = new CODAVideoIntegration(codaService, videoLearning);
          
          setIntegrationActive(true);
          
          // Démarrer les mises à jour des statistiques
          startStatsUpdates();
          
        } catch (error) {
          console.error('Erreur initialisation intégration:', error);
        }
      }
    };

    initializeIntegration();

    return () => {
      stopStatsUpdates();
      integrationRef.current?.dispose();
    };
  }, [videoLearning.isConnected, codaService.isConnected]);

  /**
   * Démarre les mises à jour des statistiques
   */
  const startStatsUpdates = () => {
    if (statsUpdateIntervalRef.current) {
      clearInterval(statsUpdateIntervalRef.current);
    }

    statsUpdateIntervalRef.current = setInterval(() => {
      if (integrationRef.current?.isActive()) {
        const stats = integrationRef.current.getIntegrationStats();
        const recentFeedback = integrationRef.current.getRecentFeedback(5);
        
        setLearningStats(stats);
        setCodaFeedback(recentFeedback);
      }
    }, 3000);
  };

  /**
   * Arrête les mises à jour des statistiques
   */
  const stopStatsUpdates = () => {
    if (statsUpdateIntervalRef.current) {
      clearInterval(statsUpdateIntervalRef.current);
      statsUpdateIntervalRef.current = null;
    }
  };

  /**
   * Gère la reconnaissance d'un signe
   */
  const handleSignRecognized = async (sign: SignRecognitionResult) => {
    if (!integrationActive || !integrationRef.current) return;

    try {
      // Simuler l'apprentissage multimodal
      const feedback = await integrationRef.current.forcelearningInteraction(
        `Le signe "${sign.signName}" a été reconnu`,
        [sign]
      );

      // Générer une réponse CODA basée sur le feedback
      const codaResponse = generateCODAResponse(sign, feedback);
      setCurrentCodaResponse(codaResponse);

      // Faire signer l'avatar en réponse
      if (avatarSigning.isInitialized && sign.confidence > 0.7) {
        // Avatar répète le signe pour confirmer la compréhension
        await avatarSigning.playSign(sign.signName);
        
        // Changer l'émotion selon la confiance
        if (sign.confidence > 0.9) {
          avatarSigning.setEmotional('excited');
        } else if (sign.confidence > 0.8) {
          avatarSigning.setEmotional('happy');
        } else {
          avatarSigning.setEmotional('focused');
        }
      }

    } catch (error) {
      console.error('Erreur traitement signe:', error);
    }
  };

  /**
   * Génère une réponse CODA basée sur le signe et le feedback
   */
  const generateCODAResponse = (sign: SignRecognitionResult, feedback: any): string => {
    const responses = {
      high_confidence: [
        `Oh ! Je vois que tu signes "${sign.signName}" ! C'est exactement ça ! Je comprends bien ce signe maintenant. 🤩`,
        `Super ! Le signe "${sign.signName}" est très clair ! Peux-tu me montrer comment on l'utilise dans une phrase ? 🤔`,
        `Excellent ! J'ai bien saisi "${sign.signName}". Est-ce qu'il y a des variations de ce signe ? 🌟`
      ],
      medium_confidence: [
        `Je crois voir le signe "${sign.signName}", mais je ne suis pas totalement sûr... Peux-tu le refaire plus lentement ? 🤨`,
        `Hmm, ça ressemble à "${sign.signName}" mais j'ai un petit doute. Peux-tu me corriger si je me trompe ? 🤷‍♀️`,
        `Je pense que c'est "${sign.signName}" ! Si c'est bon, peux-tu me montrer un signe similaire pour comparer ? 🤓`
      ],
      low_confidence: [
        `J'ai du mal à bien voir ce signe... Peux-tu me le montrer encore une fois ? 😅`,
        `Ça me paraît difficile ! Peux-tu me guider étape par étape pour ce signe ? 🙏`,
        `Je suis un peu perdue... Peux-tu m'expliquer la position des mains pour ce signe ? 😰`
      ]
    };

    let confidenceLevel: keyof typeof responses;
    if (sign.confidence > 0.8) {
      confidenceLevel = 'high_confidence';
    } else if (sign.confidence > 0.5) {
      confidenceLevel = 'medium_confidence';  
    } else {
      confidenceLevel = 'low_confidence';
    }

    const responseOptions = responses[confidenceLevel];
    return responseOptions[Math.floor(Math.random() * responseOptions.length)];
  };

  /**
   * Gère le démarrage de session
   */
  const handleSessionStart = (sessionId: string) => {
    console.log('Session multimodale démarrée:', sessionId);
    
    // Activer l'avatar
    setAvatarActive(true);
    
    // Initialiser une session CODA pour l'IA apprenante
    codaService.initializeSession({
      level: 'A2',
      personality: 'curious_student',
      mentorId: teacherId
    }).then(() => {
      console.log('Session CODA initialisée pour l\'IA apprenante');
      
      // Avatar salue au démarrage
      if (avatarSigning.isInitialized) {
        avatarSigning.playSign('bonjour').then(() => {
          avatarSigning.setEmotional('excited');
        });
      }
    }).catch(console.error);
  };

  /**
   * Gère la fin de session
   */
  const handleSessionEnd = () => {
    console.log('Session multimodale terminée');
    
    // Avatar dit au revoir
    if (avatarSigning.isInitialized) {
      avatarSigning.playSign('au_revoir').then(() => {
        avatarSigning.setEmotional('neutral');
        setAvatarActive(false);
      });
    } else {
      setAvatarActive(false);
    }
    
    // Terminer la session CODA
    const currentSession = codaService.getCurrentSession?.();
    if (currentSession?.id) {
      codaService.endSession(currentSession.id).catch(console.error);
    }
    
    setCurrentCodaResponse('');
  };

  /**
   * Envoie un message à l'IA CODA
   */
  const sendMessageToCODA = async (message: string) => {
    if (!codaService.isConnected) return;

    try {
      const response = await codaService.sendMessage('current_session', message);
      setCurrentCodaResponse(response.message);
      
      // Avatar réagit aux réponses CODA
      if (avatarSigning.isInitialized && response.message) {
        // Analyser la réponse pour déterminer l'émotion et d'éventuels signes
        const responseAnalysis = analyzeResponseForSigns(response.message);
        
        if (responseAnalysis.emotion) {
          avatarSigning.setEmotional(responseAnalysis.emotion);
        }
        
        if (responseAnalysis.signsToPlay.length > 0) {
          await avatarSigning.playSignSequence(responseAnalysis.signsToPlay, 800);
        }
      }
    } catch (error) {
      console.error('Erreur envoi message CODA:', error);
    }
  };

  /**
   * Analyse une réponse CODA pour extraire les signes et émotions
   */
  const analyzeResponseForSigns = (response: string) => {
    const result = {
      emotion: null as any,
      signsToPlay: [] as string[]
    };

    // Détecter l'émotion basée sur le contenu
    if (response.includes('Super') || response.includes('Excellent') || response.includes('🤩') || response.includes('🌟')) {
      result.emotion = 'excited';
    } else if (response.includes('merci') || response.includes('🤔') || response.includes('Peux-tu')) {
      result.emotion = 'curious';
    } else if (response.includes('difficile') || response.includes('perdue') || response.includes('😰') || response.includes('😅')) {
      result.emotion = 'confused';
    } else if (response.includes('bien') || response.includes('👍') || response.includes('C\'est bon')) {
      result.emotion = 'happy';
    } else {
      result.emotion = 'focused';
    }

    // Extraire les signes mentionnés dans la réponse
    const availableSigns = avatarSigning.availableSigns;
    availableSigns.forEach(sign => {
      if (response.toLowerCase().includes(sign.toLowerCase())) {
        result.signsToPlay.push(sign);
      }
    });

    // Ajouter des signes selon le contexte
    if (response.includes('bonjour') || response.includes('salut')) {
      result.signsToPlay.push('bonjour');
    }
    if (response.includes('merci')) {
      result.signsToPlay.push('merci');
    }
    if (response.includes('oui') || response.includes('exact') || response.includes('c\'est bon')) {
      result.signsToPlay.push('oui');
    }
    if (response.includes('non') || response.includes('pas')) {
      result.signsToPlay.push('non');
    }

    return result;
  };

  return (
    <div className={`multimodal-learning-studio ${className || ''}`}>
      {/* Header avec informations sur l'intégration */}
      <header className="studio-header">
        <h1>🎭 Studio d&apos;Apprentissage Multimodal LSF</h1>
        
        <div className="integration-status">
          <div className="status-item">
            <span className="status-label">Vidéo:</span>
            <span className={`status-indicator ${videoLearning.isConnected ? 'connected' : 'disconnected'}`}>
              {videoLearning.isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
            </span>
          </div>
          
          <div className="status-item">
            <span className="status-label">CODA IA:</span>
            <span className={`status-indicator ${codaService.isConnected ? 'connected' : 'disconnected'}`}>
              {codaService.isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
            </span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Intégration:</span>
            <span className={`status-indicator ${integrationActive ? 'active' : 'inactive'}`}>
              {integrationActive ? '🟢 Active' : '⚪ Inactive'}
            </span>
          </div>
        </div>
      </header>

      <div className="studio-content">
        {/* Interface enseignant à gauche */}
        <div className="teacher-section">
          <TeacherVideoInterface
            teacherId={teacherId}
            onSessionStart={handleSessionStart}
            onSessionEnd={handleSessionEnd}
            onSignRecognized={handleSignRecognized}
          />
        </div>

        {/* Panel IA CODA à droite */}
        <div className="coda-section">
          {/* Avatar 3D CODA */}
          {avatarActive && (
            <div className="avatar-container">
              <CODAAvatar3D
                isActive={avatarActive}
                currentSign={avatarSigning.currentSign}
                emotional={avatarSigning.emotional}
                onSignCompleted={(signName) => {
                  console.log('Avatar a terminé le signe:', signName);
                }}
                onAvatarReady={() => {
                  console.log('Avatar CODA prêt');
                }}
                showDebugInfo={false}
                className="coda-avatar"
              />
            </div>
          )}

          <div className="coda-panel">
            <h2>🤖 IA Apprenante (CODA)</h2>
            
            {/* État de l'IA */}
            <div className="coda-status">
              <div className="ai-info">
                <span className="ai-name">👩‍🎓 Sophie (IA)</span>
                <span className="ai-level">Niveau: A2</span>
                <span className="ai-emotion">
                  {codaService.isConnected ? '😊 Attentive' : '😴 Endormie'}
                </span>
              </div>
            </div>

            {/* Réponse actuelle de l'IA */}
            {currentCodaResponse && (
              <div className="coda-response">
                <div className="response-header">
                  <span className="speaker-icon">🤖</span>
                  <span className="speaker-name">Sophie dit:</span>
                </div>
                <div className="response-content">
                  {currentCodaResponse}
                </div>
              </div>
            )}

            {/* Zone d'interaction manuelle */}
            <div className="manual-interaction">
              <h3>💬 Interaction Manuelle</h3>
              <div className="interaction-controls">
                <input
                  type="text"
                  placeholder="Tapez un message à l'IA..."
                  className="message-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessageToCODA(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('.message-input') as HTMLInputElement;
                    if (input?.value) {
                      sendMessageToCODA(input.value);
                      input.value = '';
                    }
                  }}
                  className="send-button"
                >
                  📤
                </button>
              </div>
            </div>

            {/* Feedback récent */}
            {codaFeedback.length > 0 && (
              <div className="feedback-section">
                <h3>🧠 Apprentissage IA</h3>
                <div className="feedback-list">
                  {codaFeedback.slice(-3).reverse().map((feedback, index) => (
                    <div key={index} className="feedback-item">
                      <div className="feedback-understanding">
                        Compréhension: {Math.round(feedback.understanding * 100)}%
                      </div>
                      <div className="feedback-emotion">
                        Émotion: {feedback.emotionalResponse}
                      </div>
                      {feedback.questions.length > 0 && (
                        <div className="feedback-questions">
                          Questions: {feedback.questions.slice(0, 1).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statistiques d'apprentissage */}
            {learningStats && (
              <div className="learning-stats">
                <h3>📊 Progrès d&apos;Apprentissage</h3>
                
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Sessions:</span>
                    <span className="stat-value">{learningStats.learningSessionsCount}</span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Compréhension moyenne:</span>
                    <span className="stat-value">{Math.round(learningStats.averageUnderstanding * 100)}%</span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Émotion dominante:</span>
                    <span className="stat-value">{learningStats.mostCommonEmotion}</span>
                  </div>
                </div>

                {/* Progrès par compétence */}
                <div className="skill-progress">
                  <h4>Compétences:</h4>
                  {Object.entries(learningStats.skillProgress || {}).map(([skill, progress]) => (
                    <div key={skill} className="skill-item">
                      <span className="skill-name">{skill}:</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${(progress as number) * 100}%` }}
                        />
                      </div>
                      <span className="progress-text">{Math.round((progress as number) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer avec conseils */}
      <footer className="studio-footer">
        <div className="tips">
          <h4>💡 Conseils d&apos;utilisation:</h4>
          <ul>
            <li><strong>Signez clairement</strong> devant la caméra pour une meilleure reconnaissance</li>
            <li><strong>Parlez en même temps</strong> que vous signez pour créer des associations</li>
            <li><strong>Observez les réactions de l&apos;IA</strong> pour adapter votre enseignement</li>
            <li><strong>Utilisez le bouton &quot;Associer&quot;</strong> pour créer des liens texte-signe</li>
          </ul>
        </div>
      </footer>

      {/* Styles CSS */}
      <style jsx>{`
        .multimodal-learning-studio {
          max-width: 1600px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .studio-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 25px;
        }

        .studio-header h1 {
          margin: 0 0 20px 0;
          font-size: 28px;
          text-align: center;
        }

        .integration-status {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .status-label {
          font-weight: 500;
        }

        .status-indicator {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-indicator.connected, .status-indicator.active {
          background: rgba(40, 167, 69, 0.2);
          color: #28a745;
        }

        .status-indicator.disconnected, .status-indicator.inactive {
          background: rgba(220, 53, 69, 0.2);
          color: #dc3545;
        }

        .studio-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 25px;
        }

        .teacher-section {
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .coda-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .avatar-container {
          height: 300px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          overflow: hidden;
        }

        .coda-avatar {
          width: 100%;
          height: 100%;
        }

        .coda-panel {
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          padding: 20px;
          height: fit-content;
          position: sticky;
          top: 20px;
        }

        .coda-panel h2 {
          margin: 0 0 20px 0;
          color: #495057;
          text-align: center;
        }

        .coda-status {
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .ai-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .ai-name {
          font-weight: 600;
          color: #007bff;
        }

        .coda-response {
          margin: 20px 0;
          padding: 15px;
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          border-radius: 8px;
        }

        .response-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #1976d2;
        }

        .response-content {
          font-size: 15px;
          line-height: 1.5;
          color: #333;
        }

        .manual-interaction {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
        }

        .manual-interaction h3 {
          margin: 0 0 15px 0;
          font-size: 16px;
          color: #495057;
        }

        .interaction-controls {
          display: flex;
          gap: 10px;
        }

        .message-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .send-button {
          background: #007bff;
          border: none;
          color: white;
          padding: 10px 15px;
          border-radius: 6px;
          cursor: pointer;
        }

        .feedback-section, .learning-stats {
          margin: 20px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .feedback-section h3, .learning-stats h3 {
          margin: 0 0 15px 0;
          font-size: 16px;
          color: #495057;
        }

        .feedback-item {
          margin-bottom: 10px;
          padding: 10px;
          background: white;
          border-radius: 6px;
          font-size: 13px;
        }

        .feedback-understanding {
          font-weight: 500;
          color: #28a745;
        }

        .feedback-emotion {
          color: #6c757d;
          text-transform: capitalize;
        }

        .feedback-questions {
          color: #007bff;
          font-style: italic;
          margin-top: 5px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 15px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }

        .stat-value {
          font-weight: 600;
          color: #007bff;
        }

        .skill-progress h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #495057;
        }

        .skill-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .skill-name {
          min-width: 80px;
          text-transform: capitalize;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: #e9ecef;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #28a745;
          transition: width 0.3s ease;
        }

        .progress-text {
          min-width: 40px;
          text-align: right;
          color: #6c757d;
        }

        .studio-footer {
          margin-top: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .tips h4 {
          margin: 0 0 15px 0;
          color: #495057;
        }

        .tips ul {
          margin: 0;
          padding-left: 20px;
        }

        .tips li {
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .tips strong {
          color: #007bff;
        }

        @media (max-width: 1200px) {
          .studio-content {
            grid-template-columns: 1fr;
          }
          
          .coda-panel {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .integration-status {
            flex-direction: column;
            align-items: center;
            gap: 15px;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};