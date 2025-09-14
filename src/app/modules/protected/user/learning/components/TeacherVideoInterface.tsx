/**
 * @file TeacherVideoInterface.tsx
 * @description Interface enseignant avec caméra pour l'apprentissage LSF multimodal
 * @author MetaSign Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useVideoLearning } from '../hooks/useVideoLearning';
import { useVideoStreaming } from '../hooks/useVideoStreaming';
import type { SignRecognitionResult } from '../services/VideoLearningBridge';

interface TeacherVideoInterfaceProps {
  teacherId: string;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: () => void;
  onSignRecognized?: (sign: SignRecognitionResult) => void;
  onRoomCreated?: (roomId: string) => void;
}

export const TeacherVideoInterface: React.FC<TeacherVideoInterfaceProps> = ({
  teacherId,
  onSessionStart,
  onSessionEnd,
  onSignRecognized,
  onRoomCreated
}) => {
  // Hooks
  const videoLearning = useVideoLearning();
  const streaming = useVideoStreaming(teacherId, 'teacher');
  
  // États locaux
  const [currentText, setCurrentText] = useState('');
  const [topic, setTopic] = useState('');
  const [targetLevel, setTargetLevel] = useState('A1');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [isAssociating, setIsAssociating] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [isStreamingActive, setIsStreamingActive] = useState(false);

  // Références
  const videoRef = useRef<HTMLVideoElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // Configuration des niveaux et sujets
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const topics = [
    'Salutations et politesse',
    'Nombres et quantités', 
    'Couleurs et formes',
    'Famille et relations',
    'Nourriture et boissons',
    'Temps et calendrier',
    'Transport et déplacements',
    'Émotions et sentiments'
  ];

  // Attacher le flux vidéo à l'élément video
  useEffect(() => {
    if (videoRef.current && videoLearning.currentSession?.videoStream) {
      videoLearning.attachVideoToElement(videoRef.current);
    }
  }, [videoLearning.currentSession?.videoStream, videoLearning.attachVideoToElement]);

  // Notifier les signes reconnus
  useEffect(() => {
    if (videoLearning.recentSigns.length > 0 && onSignRecognized) {
      const latestSign = videoLearning.recentSigns[videoLearning.recentSigns.length - 1];
      onSignRecognized(latestSign);
    }
  }, [videoLearning.recentSigns, onSignRecognized]);

  // Synchroniser le streaming vidéo avec la session locale
  useEffect(() => {
    if (streaming.localStream && videoRef.current) {
      console.log('📹 Attachement du stream local à la vidéo');
      videoRef.current.srcObject = streaming.localStream;
    }
  }, [streaming.localStream]);

  // Synchroniser aussi avec le stream de la session d'apprentissage
  useEffect(() => {
    if (videoLearning.currentSession?.videoStream && videoRef.current && !streaming.localStream) {
      console.log('📹 Attachement du stream d\'apprentissage à la vidéo');
      videoRef.current.srcObject = videoLearning.currentSession.videoStream;
    }
  }, [videoLearning.currentSession?.videoStream, streaming.localStream]);

  /**
   * Démarre le streaming vidéo
   */
  const handleStartStreaming = async () => {
    try {
      // Démarrer le flux local
      await streaming.startLocalStream();
      setIsStreamingActive(true);
      
      // Créer une room si nom fourni
      if (roomName.trim()) {
        const roomId = await streaming.createRoom(roomName.trim());
        onRoomCreated?.(roomId);
      }

    } catch (error) {
      console.error('Erreur démarrage streaming:', error);
      alert(`Erreur streaming: ${error instanceof Error ? error.message : 'Problème caméra'}`);
    }
  };

  /**
   * Démarre une session d'enseignement
   */
  const handleStartSession = async () => {
    if (!topic.trim()) {
      alert('Veuillez sélectionner un sujet');
      return;
    }

    try {
      console.log('🎬 Démarrage session complète...');
      
      // Démarrer d'abord le streaming pour obtenir le flux vidéo
      if (!isStreamingActive) {
        console.log('📡 Démarrage streaming préalable...');
        await handleStartStreaming();
      }

      // Attendre un court délai pour que le streaming soit stable
      await new Promise(resolve => setTimeout(resolve, 500));

      // Démarrer la session d'apprentissage avec le flux existant
      const session = await videoLearning.startSession({
        teacherId,
        topic,
        targetLevel,
        videoConfig: {
          width: 1280,
          height: 720,
          frameRate: 30,
          enableAudio: true
        },
        // Utiliser le stream existant si disponible
        existingStream: streaming.localStream || undefined
      });

      console.log('✅ Session complète démarrée');
      onSessionStart?.(session.sessionId);

    } catch (error) {
      console.error('Erreur démarrage session:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Problème de caméra'}`);
    }
  };

  /**
   * Termine la session
   */
  const handleEndSession = async () => {
    await videoLearning.endSession();
    
    // Arrêter le streaming
    if (isStreamingActive) {
      streaming.stopLocalStream();
      await streaming.leaveRoom();
      setIsStreamingActive(false);
    }
    
    onSessionEnd?.();
  };

  /**
   * Associe le texte actuel aux signes
   */
  const handleAssociateText = async () => {
    if (!currentText.trim() || !videoLearning.currentSession) {
      return;
    }

    setIsAssociating(true);
    
    try {
      await videoLearning.associateTextWithSigns(
        currentText,
        undefined, // startTime auto
        undefined, // endTime auto  
        teacherNotes || undefined
      );

      // Réinitialiser les champs
      setCurrentText('');
      setTeacherNotes('');
      textInputRef.current?.focus();

    } catch (error) {
      console.error('Erreur association:', error);
      alert('Erreur lors de l\'association texte-signe');
    } finally {
      setIsAssociating(false);
    }
  };

  /**
   * Formate les signes par catégorie pour l'affichage
   */
  const formatSignsDisplay = () => {
    const categories = videoLearning.getSignsByCategory();
    return Object.entries(categories).map(([category, signs]) => ({
      category,
      count: signs.length,
      recent: signs.slice(-3) // 3 derniers signes
    }));
  };

  // Vérification des permissions
  if (!videoLearning.permissions.checked) {
    return (
      <div className="teacher-interface loading">
        <div className="permission-check">
          <h2>🔄 Vérification des permissions...</h2>
          <p>Vérification de l&apos;accès à la caméra et au microphone</p>
        </div>
      </div>
    );
  }

  if (!videoLearning.permissions.camera) {
    return (
      <div className="teacher-interface error">
        <div className="permission-denied">
          <h2>📷 Accès caméra requis</h2>
          <p>Pour utiliser l&apos;interface enseignant, veuillez autoriser l&apos;accès à votre caméra.</p>
          <button onClick={() => videoLearning.checkPermissions()}>
            🔄 Vérifier à nouveau
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-video-interface">
      {/* Header avec contrôles de session */}
      <header className="interface-header">
        <div className="session-info">
          <h1>👩‍🏫 Interface Enseignant LSF</h1>
          
          {!videoLearning.currentSession ? (
            <div className="session-config">
              <div className="config-row">
                <select 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)}
                  className="topic-select"
                >
                  <option value="">Sélectionnez un sujet...</option>
                  {topics.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <select 
                  value={targetLevel} 
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className="level-select"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>Niveau {level}</option>
                  ))}
                </select>
              </div>

              <div className="streaming-config">
                <input
                  type="text"
                  placeholder="Nom de la salle de cours (optionnel)"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="room-name-input"
                />
              </div>

              <div className="action-buttons">
                <button 
                  onClick={handleStartStreaming}
                  disabled={!streaming.isConnected}
                  className="start-streaming-btn"
                >
                  📡 Démarrer le streaming
                </button>
                
                <button 
                  onClick={handleStartSession}
                  disabled={!topic || !videoLearning.isInitialized}
                  className="start-session-btn"
                >
                  🎬 Session complète
                </button>
              </div>
            </div>
          ) : (
            <div className="active-session">
              <div className="session-status">
                <span className="session-topic">📚 {videoLearning.currentSession.topic}</span>
                <span className="session-level">🎯 Niveau {videoLearning.currentSession.targetLevel}</span>
                <span className="session-duration">⏱️ {videoLearning.getFormattedDuration()}</span>
                <span className={`connection-status ${videoLearning.isConnected ? 'connected' : 'disconnected'}`}>
                  {videoLearning.isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
                </span>
                {streaming.currentRoom && (
                  <span className="room-info">
                    🏠 Room: {streaming.currentRoom} | 👥 {streaming.connectedPeersCount} élève(s)
                  </span>
                )}
              </div>
              
              <div className="session-controls">
                <button 
                  onClick={videoLearning.isRecording ? videoLearning.stopRecording : videoLearning.startRecording}
                  className={`record-btn ${videoLearning.isRecording ? 'recording' : ''}`}
                >
                  {videoLearning.isRecording ? '⏹️ Arrêter' : '🔴 Enregistrer'}
                </button>
                
                <button 
                  onClick={handleEndSession}
                  className="end-session-btn"
                >
                  🏁 Terminer
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="interface-content">
        {/* Zone vidéo principale */}
        <div className="video-section">
          <div className="video-container">
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              playsInline
              className="teacher-video"
              onLoadedMetadata={() => console.log('📹 Vidéo chargée')}
              onPlay={() => console.log('📹 Vidéo en lecture')}
              onError={(e) => console.error('📹 Erreur vidéo:', e)}
            />
            
            {/* Placeholder si pas de vidéo */}
            {!streaming.localStream && !videoLearning.currentSession?.videoStream && (
              <div className="video-placeholder">
                <div className="placeholder-content">
                  <div className="camera-icon">📹</div>
                  <p>Démarrez une session pour voir la vidéo</p>
                  {!streaming.isConnected && (
                    <p className="connection-info">⚠️ Connexion en cours...</p>
                  )}
                </div>
              </div>
            )}

            {/* Debug info overlay */}
            <div className="debug-overlay">
              <div className="debug-info">
                <div>🎥 Streaming: {streaming.localStream ? '✅' : '❌'}</div>
                <div>📚 Learning: {videoLearning.currentSession?.videoStream ? '✅' : '❌'}</div>
                <div>🔗 WebSocket: {streaming.isConnected ? '✅' : '❌'}</div>
                <div>📡 Room: {streaming.currentRoom || 'Aucune'}</div>
              </div>
            </div>
            
            {videoLearning.isStreaming && (
              <div className="video-overlay">
                <div className="recording-indicator">
                  {videoLearning.isRecording && (
                    <div className="rec-dot">🔴 REC</div>
                  )}
                </div>
                
                {/* Affichage des signes reconnus en temps réel */}
                <div className="sign-recognition-overlay">
                  {videoLearning.recentSigns.slice(-1).map(sign => (
                    <div key={sign.timestamp} className="recognized-sign">
                      <span className="sign-name">{sign.signName}</span>
                      <span className="confidence">
                        {Math.round(sign.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contrôles de texte-signe */}
          {videoLearning.currentSession && (
            <div className="text-association">
              <h3>💬 Associer Texte ↔ Signe</h3>
              
              <textarea
                ref={textInputRef}
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Tapez le texte que vous expliquez en signant..."
                className="text-input"
                rows={3}
              />
              
              <textarea
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                placeholder="Notes optionnelles (corrections, variantes, etc.)"
                className="notes-input"
                rows={2}
              />
              
              <button
                onClick={handleAssociateText}
                disabled={!currentText.trim() || isAssociating}
                className="associate-btn"
              >
                {isAssociating ? '⏳ Association...' : '🔗 Associer'}
              </button>
            </div>
          )}
        </div>

        {/* Panel de droite avec statistiques */}
        <aside className="stats-panel">
          <div className="stats-section">
            <h3>📊 Statistiques Temps Réel</h3>
            
            <div className="stat-item">
              <span className="stat-label">Signes reconnus:</span>
              <span className="stat-value">{videoLearning.stats.signsRecognized}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Associations créées:</span>
              <span className="stat-value">{videoLearning.textAssociations.length}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Enregistrements:</span>
              <span className="stat-value">{videoLearning.stats.recordingsCount}</span>
            </div>
          </div>

          {/* Signes récents par catégorie */}
          <div className="signs-section">
            <h3>🤲 Signes Récents</h3>
            
            {formatSignsDisplay().map(({ category, count, recent }) => (
              <div key={category} className="sign-category">
                <h4>{category} ({count})</h4>
                <div className="recent-signs">
                  {recent.map(sign => (
                    <div key={sign.timestamp} className="sign-item">
                      <span className="sign-name">{sign.signName}</span>
                      <span className="sign-confidence">
                        {Math.round(sign.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Associations texte-signe récentes */}
          <div className="associations-section">
            <h3>🔗 Associations Récentes</h3>
            
            <div className="associations-list">
              {videoLearning.textAssociations.slice(-5).reverse().map((assoc, index) => (
                <div key={index} className="association-item">
                  <div className="association-text">
                    &quot;{assoc.textSegment}&quot;
                  </div>
                  <div className="association-signs">
                    {assoc.associatedSigns.length} signe{assoc.associatedSigns.length > 1 ? 's' : ''}
                  </div>
                  {assoc.teacherNotes && (
                    <div className="association-notes">
                      💡 {assoc.teacherNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Messages d'erreur */}
      {videoLearning.error && (
        <div className="error-banner">
          <span className="error-message">⚠️ {videoLearning.error}</span>
          <button onClick={videoLearning.clearError}>✕</button>
        </div>
      )}

      {/* Styles CSS intégrés */}
      <style jsx>{`
        .teacher-video-interface {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .interface-header {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          border: 1px solid #e9ecef;
        }

        .session-config {
          margin-top: 15px;
        }

        .config-row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }

        .topic-select, .level-select {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          min-width: 200px;
        }

        .streaming-config {
          margin-bottom: 15px;
        }

        .room-name-input {
          width: 100%;
          padding: 10px;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .room-name-input:focus {
          outline: none;
          border-color: #4facfe;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .start-streaming-btn {
          background: #4facfe;
          color: white;
          border: 2px solid #4facfe;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(79, 172, 254, 0.3);
          transition: all 0.3s ease;
        }

        .start-streaming-btn:hover:not(:disabled) {
          background: #2196F3;
          border-color: #2196F3;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(79, 172, 254, 0.4);
        }

        .start-streaming-btn:disabled {
          background: #6c757d;
          border-color: #6c757d;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .start-session-btn {
          background: #28a745;
          color: white;
          border: 2px solid #28a745;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
          transition: all 0.3s ease;
        }

        .start-session-btn:hover:not(:disabled) {
          background: #218838;
          border-color: #218838;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(40, 167, 69, 0.4);
        }

        .start-session-btn:disabled {
          background: #6c757d;
          border-color: #6c757d;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .active-session {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
        }

        .session-status {
          display: flex;
          gap: 20px;
          font-size: 14px;
        }

        .connection-status.connected {
          color: #28a745;
        }

        .connection-status.disconnected {
          color: #dc3545;
        }

        .session-controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .record-btn {
          padding: 12px 20px;
          border: 2px solid #dc3545;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          background: #dc3545;
          color: white;
          box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
          transition: all 0.3s ease;
        }

        .record-btn:hover:not(.recording) {
          background: #c82333;
          border-color: #c82333;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(220, 53, 69, 0.4);
        }

        .record-btn.recording {
          background: #6c757d;
          border-color: #6c757d;
          box-shadow: 0 2px 4px rgba(108, 117, 125, 0.3);
          animation: pulse-record 2s infinite;
        }

        @keyframes pulse-record {
          0%, 50% { 
            background: #6c757d; 
            transform: scale(1);
          }
          25%, 75% { 
            background: #495057; 
            transform: scale(1.02);
          }
        }

        .end-session-btn {
          background: #fd7e14;
          color: white;
          border: 2px solid #fd7e14;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(253, 126, 20, 0.3);
          transition: all 0.3s ease;
        }

        .end-session-btn:hover {
          background: #e8650e;
          border-color: #e8650e;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(253, 126, 20, 0.4);
        }

        .interface-content {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 20px;
        }

        .video-section {
          background: white;
          border-radius: 10px;
          padding: 20px;
          border: 1px solid #e9ecef;
        }

        .video-container {
          position: relative;
          margin-bottom: 20px;
          background: #000;
          border-radius: 8px;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .teacher-video {
          width: 100%;
          max-width: 800px;
          height: auto;
          border-radius: 8px;
          background: #000;
          display: block;
        }

        .video-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
        }

        .placeholder-content {
          text-align: center;
          color: white;
        }

        .camera-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .placeholder-content p {
          margin: 0 0 10px 0;
          font-size: 16px;
        }

        .connection-info {
          font-size: 14px !important;
          opacity: 0.8;
        }

        .debug-overlay {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-family: monospace;
        }

        .debug-info div {
          margin-bottom: 3px;
        }

        .debug-info div:last-child {
          margin-bottom: 0;
        }

        .video-overlay {
          position: absolute;
          top: 10px;
          right: 10px;
        }

        .rec-dot {
          background: rgba(220, 53, 69, 0.9);
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.5; }
        }

        .sign-recognition-overlay {
          position: absolute;
          bottom: 10px;
          left: 10px;
        }

        .recognized-sign {
          background: rgba(40, 167, 69, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .text-association {
          border-top: 1px solid #e9ecef;
          padding-top: 20px;
        }

        .text-input, .notes-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          margin-bottom: 10px;
          font-family: inherit;
          resize: vertical;
        }

        .associate-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
        }

        .associate-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .stats-panel {
          background: white;
          border-radius: 10px;
          padding: 20px;
          border: 1px solid #e9ecef;
          height: fit-content;
          position: sticky;
          top: 20px;
        }

        .stats-section, .signs-section, .associations-section {
          margin-bottom: 25px;
        }

        .stats-section h3, .signs-section h3, .associations-section h3 {
          margin-bottom: 15px;
          color: #495057;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .stat-value {
          font-weight: bold;
          color: #007bff;
        }

        .sign-category {
          margin-bottom: 15px;
        }

        .sign-category h4 {
          font-size: 14px;
          color: #6c757d;
          margin-bottom: 8px;
          text-transform: capitalize;
        }

        .sign-item {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 13px;
          border-bottom: 1px solid #f8f9fa;
        }

        .sign-confidence {
          color: #28a745;
          font-weight: 500;
        }

        .associations-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .association-item {
          margin-bottom: 12px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 13px;
        }

        .association-text {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .association-signs {
          color: #6c757d;
          font-size: 12px;
        }

        .association-notes {
          margin-top: 4px;
          font-style: italic;
          color: #007bff;
          font-size: 12px;
        }

        .error-banner {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 12px 16px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .error-banner button {
          background: none;
          border: none;
          color: #721c24;
          cursor: pointer;
          font-size: 16px;
        }

        .permission-check, .permission-denied {
          text-align: center;
          padding: 60px 20px;
        }

        .permission-denied button {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 20px;
        }

        @media (max-width: 1024px) {
          .interface-content {
            grid-template-columns: 1fr;
          }
          
          .stats-panel {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .active-session {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .session-status {
            flex-direction: column;
            gap: 8px;
          }
          
          .config-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};