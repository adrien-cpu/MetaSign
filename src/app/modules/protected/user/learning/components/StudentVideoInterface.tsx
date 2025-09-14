/**
 * @file StudentVideoInterface.tsx
 * @description Interface élève pour recevoir le flux vidéo de l'enseignant et voir l'avatar CODA
 * @author MetaSign Team
 * @version 1.0.0
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { CODAAvatar3D } from './CODAAvatar3D';
import { useVideoStreaming } from '../hooks/useVideoStreaming';
import { useAvatarSigning } from '../hooks/useAvatarSigning';

interface StudentVideoInterfaceProps {
  studentId: string;
  studentName: string;
  roomId?: string;
  onJoinRoom?: (roomId: string) => void;
  onLeaveRoom?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const StudentVideoInterface: React.FC<StudentVideoInterfaceProps> = ({
  studentId,
  studentName,
  roomId,
  onJoinRoom,
  onLeaveRoom,
  onError,
  className = ''
}) => {
  const streaming = useVideoStreaming(studentId, 'student');
  const avatar = useAvatarSigning();
  
  const [joinRoomId, setJoinRoomId] = useState(roomId || '');
  const [isJoined, setIsJoined] = useState(false);
  const [teacherVideoLoaded, setTeacherVideoLoaded] = useState(false);
  const [avatarMessages, setAvatarMessages] = useState<string[]>([]);
  
  const teacherVideoRef = useRef<HTMLVideoElement>(null);

  // Auto-join si roomId fourni au montage
  useEffect(() => {
    if (roomId && streaming.isConnected && !isJoined) {
      handleJoinRoom();
    }
  }, [roomId, streaming.isConnected, isJoined]);

  // Gestion des streams distants (enseignant)
  useEffect(() => {
    if (streaming.remoteStreams.size > 0 && teacherVideoRef.current) {
      // Prendre le premier stream (enseignant)
      const [firstStream] = streaming.remoteStreams.values();
      teacherVideoRef.current.srcObject = firstStream;
      setTeacherVideoLoaded(true);
    } else {
      setTeacherVideoLoaded(false);
    }
  }, [streaming.remoteStreams]);

  // Gestion des erreurs
  useEffect(() => {
    if (streaming.error) {
      onError?.(streaming.error);
    }
  }, [streaming.error, onError]);

  // Messages d'avatar contextuels
  useEffect(() => {
    const messages: string[] = [];
    
    if (!streaming.isConnected) {
      messages.push('⚠️ Connexion en cours...');
    } else if (!isJoined) {
      messages.push('📚 Prêt à rejoindre un cours');
    } else if (streaming.participants.size === 0) {
      messages.push('⏳ En attente de l\'enseignant...');
    } else if (!teacherVideoLoaded) {
      messages.push('📹 Connexion vidéo en cours...');
    } else {
      messages.push('✅ Cours en direct !');
    }

    setAvatarMessages(messages);
  }, [streaming.isConnected, isJoined, streaming.participants.size, teacherVideoLoaded]);

  /**
   * Rejoint une room de cours
   */
  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) {
      onError?.('ID de salle requis');
      return;
    }

    try {
      await streaming.joinRoom(joinRoomId.trim(), studentName);
      setIsJoined(true);
      onJoinRoom?.(joinRoomId.trim());
      
      // Avatar salue
      if (avatar.isInitialized) {
        avatar.playSign('bonjour').then(() => {
          avatar.setEmotional('excited');
        });
      }
      
    } catch (error) {
      console.error('Erreur rejoindre room:', error);
      onError?.(error instanceof Error ? error.message : 'Erreur de connexion');
    }
  };

  /**
   * Quitte la room actuelle
   */
  const handleLeaveRoom = async () => {
    try {
      // Avatar dit au revoir
      if (avatar.isInitialized) {
        await avatar.playSign('au_revoir');
        avatar.setEmotional('neutral');
      }

      await streaming.leaveRoom();
      setIsJoined(false);
      setTeacherVideoLoaded(false);
      onLeaveRoom?.();
      
    } catch (error) {
      console.error('Erreur quitter room:', error);
      onError?.(error instanceof Error ? error.message : 'Erreur déconnexion');
    }
  };

  /**
   * Simule interaction avec avatar (pour démo)
   */
  const handleAvatarInteraction = async (action: string) => {
    if (!avatar.isInitialized) return;

    switch (action) {
      case 'question':
        avatar.setEmotional('curious');
        await avatar.playSignSequence(['oui', 'merci'], 1000);
        break;
      
      case 'understand':
        avatar.setEmotional('happy');
        await avatar.playSign('oui');
        break;
        
      case 'confused':
        avatar.setEmotional('confused');
        await avatar.playSign('non');
        break;
        
      case 'thanks':
        avatar.setEmotional('excited');
        await avatar.playSign('merci');
        break;
    }
  };

  return (
    <div className={`student-video-interface ${className}`}>
      {/* Header */}
      <header className="student-header">
        <h1>👨‍🎓 Interface Élève LSF</h1>
        <div className="student-info">
          <span className="student-name">👤 {studentName}</span>
          <span className={`connection-status ${streaming.isConnected ? 'connected' : 'disconnected'}`}>
            {streaming.isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
          </span>
        </div>
      </header>

      <div className="student-content">
        {/* Section vidéo enseignant */}
        <div className="teacher-video-section">
          <h2>🎥 Vidéo Enseignant</h2>
          
          {!isJoined ? (
            <div className="join-room-panel">
              <h3>Rejoindre un cours</h3>
              <div className="join-controls">
                <input
                  type="text"
                  placeholder="ID de la salle de cours"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  className="room-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                />
                <button 
                  onClick={handleJoinRoom}
                  disabled={!streaming.isConnected || !joinRoomId.trim()}
                  className="join-button"
                >
                  📚 Rejoindre
                </button>
              </div>
            </div>
          ) : (
            <div className="video-container">
              <video
                ref={teacherVideoRef}
                autoPlay
                playsInline
                muted={false}
                className="teacher-video"
                onLoadedMetadata={() => setTeacherVideoLoaded(true)}
                onError={() => setTeacherVideoLoaded(false)}
              />
              
              {!teacherVideoLoaded && (
                <div className="video-placeholder">
                  <div className="loading-spinner"></div>
                  <p>Connexion à la vidéo de l&apos;enseignant...</p>
                </div>
              )}
              
              {/* Overlay avec infos */}
              <div className="video-overlay">
                <div className="participants-count">
                  👥 {streaming.participants.size} participant(s)
                </div>
                {streaming.currentRoom && (
                  <div className="room-id">
                    🏠 {streaming.currentRoom}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contrôles de session */}
          {isJoined && (
            <div className="session-controls">
              <button 
                onClick={handleLeaveRoom}
                className="leave-button"
              >
                🚪 Quitter le cours
              </button>
            </div>
          )}
        </div>

        {/* Section avatar IA */}
        <div className="avatar-section">
          <h2>🤖 Assistant IA (Sophie)</h2>
          
          <div className="avatar-container">
            <CODAAvatar3D
              isActive={isJoined}
              currentSign={avatar.currentSign}
              emotional={avatar.emotional}
              onSignCompleted={(sign) => {
                console.log('Sophie a terminé:', sign);
              }}
              onAvatarReady={() => {
                console.log('Sophie est prête');
              }}
              showDebugInfo={false}
            />
          </div>

          {/* Messages avatar */}
          <div className="avatar-messages">
            {avatarMessages.map((message, index) => (
              <div key={index} className="avatar-message">
                {message}
              </div>
            ))}
          </div>

          {/* Interactions avec avatar (pour démo) */}
          {isJoined && avatar.isInitialized && (
            <div className="avatar-interactions">
              <h4>💬 Interactions avec Sophie</h4>
              <div className="interaction-buttons">
                <button 
                  onClick={() => handleAvatarInteraction('understand')}
                  className="interaction-btn understand"
                >
                  👍 J&apos;ai compris
                </button>
                <button 
                  onClick={() => handleAvatarInteraction('question')}
                  className="interaction-btn question"
                >
                  ❓ Question
                </button>
                <button 
                  onClick={() => handleAvatarInteraction('confused')}
                  className="interaction-btn confused"
                >
                  😕 Je ne comprends pas
                </button>
                <button 
                  onClick={() => handleAvatarInteraction('thanks')}
                  className="interaction-btn thanks"
                >
                  🙏 Merci
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques (debug) */}
      {streaming.connectionStats && (
        <details className="stats-panel">
          <summary>📊 Statistiques de connexion</summary>
          <pre>{JSON.stringify(streaming.connectionStats, null, 2)}</pre>
        </details>
      )}

      {/* Styles CSS */}
      <style jsx>{`
        .student-video-interface {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .student-header {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }

        .student-header h1 {
          margin: 0;
          font-size: 24px;
        }

        .student-info {
          display: flex;
          gap: 15px;
          align-items: center;
          font-size: 14px;
        }

        .connection-status.connected {
          color: #90EE90;
        }

        .connection-status.disconnected {
          color: #FFB6C1;
        }

        .student-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }

        .teacher-video-section {
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          padding: 20px;
        }

        .teacher-video-section h2 {
          margin: 0 0 20px 0;
          color: #333;
        }

        .join-room-panel {
          text-align: center;
          padding: 40px 20px;
        }

        .join-room-panel h3 {
          margin-bottom: 20px;
          color: #666;
        }

        .join-controls {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .room-input {
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          min-width: 200px;
        }

        .room-input:focus {
          outline: none;
          border-color: #4facfe;
        }

        .join-button {
          padding: 12px 20px;
          background: #4facfe;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
        }

        .join-button:hover:not(:disabled) {
          background: #2196F3;
        }

        .join-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .video-container {
          position: relative;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          min-height: 300px;
        }

        .teacher-video {
          width: 100%;
          height: auto;
          display: block;
        }

        .video-placeholder {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: white;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .video-overlay {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: flex-end;
        }

        .participants-count, .room-id {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 12px;
        }

        .session-controls {
          margin-top: 15px;
          text-align: center;
        }

        .leave-button {
          padding: 10px 20px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .leave-button:hover {
          background: #c82333;
        }

        .avatar-section {
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          padding: 20px;
          height: fit-content;
        }

        .avatar-section h2 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .avatar-container {
          height: 250px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 15px;
          overflow: hidden;
        }

        .avatar-messages {
          margin-bottom: 15px;
        }

        .avatar-message {
          background: #e3f2fd;
          padding: 8px 12px;
          border-radius: 15px;
          margin-bottom: 5px;
          font-size: 14px;
          color: #1976d2;
        }

        .avatar-interactions h4 {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 14px;
        }

        .interaction-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .interaction-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        }

        .interaction-btn.understand {
          background: #d4edda;
          color: #155724;
        }

        .interaction-btn.question {
          background: #fff3cd;
          color: #856404;
        }

        .interaction-btn.confused {
          background: #f8d7da;
          color: #721c24;
        }

        .interaction-btn.thanks {
          background: #d1ecf1;
          color: #0c5460;
        }

        .interaction-btn:hover {
          opacity: 0.8;
        }

        .stats-panel {
          margin-top: 20px;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }

        .stats-panel summary {
          cursor: pointer;
          font-weight: 500;
          color: #666;
        }

        .stats-panel pre {
          margin: 10px 0 0 0;
          background: white;
          padding: 10px;
          border-radius: 4px;
          font-size: 12px;
          overflow-x: auto;
        }

        @media (max-width: 768px) {
          .student-content {
            grid-template-columns: 1fr;
          }
          
          .student-header {
            text-align: center;
          }
          
          .student-info {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentVideoInterface;