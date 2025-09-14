/**
 * @file LiveStreamingStudio.tsx
 * @description Studio de streaming live complet avec enseignant, élèves et avatar synchronisé
 * @author MetaSign Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TeacherVideoInterface } from './TeacherVideoInterface';
import { StudentVideoInterface } from './StudentVideoInterface';
import { CODAAvatar3D } from './CODAAvatar3D';
import { useVideoStreaming } from '../hooks/useVideoStreaming';
import { useAvatarSigning } from '../hooks/useAvatarSigning';
import { useCODAService } from '../../coda/hooks/useCODAService';

interface LiveStreamingStudioProps {
  mode: 'teacher' | 'student';
  userId: string;
  userName: string;
  roomId?: string;
  className?: string;
}

export const LiveStreamingStudio: React.FC<LiveStreamingStudioProps> = ({
  mode,
  userId,
  userName,
  roomId,
  className = ''
}) => {
  const [currentRoomId, setCurrentRoomId] = useState(roomId || '');
  const [isInRoom, setIsInRoom] = useState(false);
  const [participants, setParticipants] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [chatMessages, setChatMessages] = useState<Array<{ from: string; message: string; timestamp: number }>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [avatarActive, setAvatarActive] = useState(false);

  const streaming = useVideoStreaming(userId, mode);
  const avatar = useAvatarSigning();
  const coda = useCODAService();

  // Gestion des participants
  useEffect(() => {
    const participantsList = Array.from(streaming.participants.values()).map(p => ({
      id: p.id,
      name: p.name,
      role: p.role
    }));
    setParticipants(participantsList);
  }, [streaming.participants]);

  // Auto-join room si fourni et mode student
  useEffect(() => {
    if (mode === 'student' && roomId && streaming.isConnected && !isInRoom) {
      handleJoinRoom(roomId);
    }
  }, [mode, roomId, streaming.isConnected, isInRoom]);

  /**
   * Gestion des événements de room
   */
  const handleRoomCreated = (newRoomId: string) => {
    setCurrentRoomId(newRoomId);
    setIsInRoom(true);
    setAvatarActive(true);
    
    // Message de bienvenue de l'avatar
    if (avatar.isInitialized) {
      avatar.playSign('bonjour').then(() => {
        avatar.setEmotional('excited');
      });
    }
  };

  const handleJoinRoom = async (roomIdToJoin: string) => {
    try {
      await streaming.joinRoom(roomIdToJoin, userName);
      setCurrentRoomId(roomIdToJoin);
      setIsInRoom(true);
      setAvatarActive(true);
      
      // Avatar salue
      if (avatar.isInitialized) {
        avatar.playSign('bonjour').then(() => {
          avatar.setEmotional('happy');
        });
      }
    } catch (error) {
      console.error('Erreur rejoindre room:', error);
    }
  };

  const handleLeaveRoom = () => {
    setIsInRoom(false);
    setCurrentRoomId('');
    setAvatarActive(false);
    setParticipants([]);
    
    // Avatar dit au revoir
    if (avatar.isInitialized) {
      avatar.playSign('au_revoir').then(() => {
        avatar.setEmotional('neutral');
      });
    }
  };

  /**
   * Gestion du chat
   */
  const handleSendMessage = () => {
    if (!currentMessage.trim() || !isInRoom) return;

    const message = {
      from: userName,
      message: currentMessage.trim(),
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, message]);
    setCurrentMessage('');

    // Simuler réaction avatar pour messages spéciaux
    if (currentMessage.toLowerCase().includes('merci')) {
      avatar.playSign('merci');
    } else if (currentMessage.toLowerCase().includes('bonjour')) {
      avatar.playSign('bonjour');
    }
  };

  /**
   * Interactions avatar contextuelles
   */
  const handleAvatarInteraction = async (action: string) => {
    if (!avatar.isInitialized) return;

    switch (action) {
      case 'welcome':
        avatar.setEmotional('excited');
        await avatar.playSignSequence(['bonjour', 'merci'], 1000);
        break;
      
      case 'encourage':
        avatar.setEmotional('happy');
        await avatar.playSign('oui');
        break;
        
      case 'help':
        avatar.setEmotional('curious');
        await avatar.playSignSequence(['oui', 'merci'], 800);
        break;
    }
  };

  /**
   * Stats temps réel
   */
  const getConnectionQuality = () => {
    if (!streaming.connectionStats) return 'unknown';
    
    if (streaming.connectedPeersCount === 0) return 'no-peers';
    if (streaming.connectedPeersCount < 3) return 'good';
    if (streaming.connectedPeersCount < 8) return 'fair';
    return 'slow';
  };

  return (
    <div className={`live-streaming-studio ${mode} ${className}`}>
      {/* Header global */}
      <header className="studio-header">
        <div className="studio-title">
          <h1>🎥 Studio Streaming LSF Live</h1>
          <div className="mode-indicator">
            {mode === 'teacher' ? '👩‍🏫 Enseignant' : '👨‍🎓 Élève'} - {userName}
          </div>
        </div>

        <div className="studio-status">
          <div className="status-grid">
            <div className={`status-item ${streaming.isConnected ? 'connected' : 'disconnected'}`}>
              <span className="status-label">Connexion:</span>
              <span className="status-value">
                {streaming.isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
              </span>
            </div>
            
            <div className={`status-item ${isInRoom ? 'active' : 'inactive'}`}>
              <span className="status-label">Room:</span>
              <span className="status-value">
                {isInRoom ? `🏠 ${currentRoomId}` : '⚪ Hors ligne'}
              </span>
            </div>
            
            <div className="status-item">
              <span className="status-label">Participants:</span>
              <span className="status-value">👥 {participants.length}</span>
            </div>
            
            <div className={`status-item ${getConnectionQuality()}`}>
              <span className="status-label">Qualité:</span>
              <span className="status-value">
                {getConnectionQuality() === 'good' ? '🟢 Excellente' :
                 getConnectionQuality() === 'fair' ? '🟡 Correcte' :
                 getConnectionQuality() === 'slow' ? '🔴 Lente' : '⚪ Inconnue'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="studio-content">
        {/* Interface principale selon le mode */}
        <div className="main-interface">
          {mode === 'teacher' ? (
            <TeacherVideoInterface
              teacherId={userId}
              onRoomCreated={handleRoomCreated}
              onSessionEnd={handleLeaveRoom}
            />
          ) : (
            <StudentVideoInterface
              studentId={userId}
              studentName={userName}
              roomId={currentRoomId}
              onJoinRoom={(roomId) => setCurrentRoomId(roomId)}
              onLeaveRoom={handleLeaveRoom}
            />
          )}
        </div>

        {/* Panel latéral */}
        <div className="side-panel">
          {/* Avatar CODA */}
          <div className="avatar-section">
            <h3>🤖 Assistant Sophie</h3>
            <div className="avatar-container">
              <CODAAvatar3D
                isActive={avatarActive}
                currentSign={avatar.currentSign}
                emotional={avatar.emotional}
                onSignCompleted={(sign) => {
                  console.log('Sophie:', sign);
                }}
                showDebugInfo={false}
              />
            </div>
            
            {/* Contrôles avatar rapides */}
            {avatarActive && (
              <div className="avatar-controls">
                <button onClick={() => handleAvatarInteraction('welcome')} className="avatar-btn">
                  👋 Saluer
                </button>
                <button onClick={() => handleAvatarInteraction('encourage')} className="avatar-btn">
                  👍 Encourager
                </button>
                <button onClick={() => handleAvatarInteraction('help')} className="avatar-btn">
                  ❓ Aider
                </button>
              </div>
            )}
          </div>

          {/* Liste des participants */}
          <div className="participants-section">
            <h3>👥 Participants ({participants.length})</h3>
            <div className="participants-list">
              {participants.map(participant => (
                <div key={participant.id} className={`participant-item ${participant.role}`}>
                  <span className="participant-icon">
                    {participant.role === 'teacher' ? '👩‍🏫' : '👨‍🎓'}
                  </span>
                  <span className="participant-name">{participant.name}</span>
                  <span className="participant-role">({participant.role})</span>
                </div>
              ))}
              
              {participants.length === 0 && (
                <div className="no-participants">
                  Aucun participant connecté
                </div>
              )}
            </div>
          </div>

          {/* Chat live */}
          <div className="chat-section">
            <h3>💬 Chat Live</h3>
            <div className="chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className="chat-message">
                  <span className="message-author">{msg.from}:</span>
                  <span className="message-content">{msg.message}</span>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              
              {chatMessages.length === 0 && (
                <div className="no-messages">
                  Aucun message pour le moment
                </div>
              )}
            </div>
            
            {isInRoom && (
              <div className="chat-input">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="message-input"
                />
                <button onClick={handleSendMessage} className="send-btn">
                  📤
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer avec infos techniques */}
      <footer className="studio-footer">
        <div className="tech-info">
          <span>🔧 Streaming: {streaming.isStreamingConnected ? 'Actif' : 'Inactif'}</span>
          <span>📊 Peers: {streaming.connectedPeersCount}</span>
          {streaming.connectionStats && (
            <span>📈 Flux: {streaming.connectionStats.localStreamActive ? 'Actif' : 'Inactif'}</span>
          )}
        </div>
      </footer>

      {/* Styles CSS */}
      <style jsx>{`
        .live-streaming-studio {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .studio-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .studio-title h1 {
          margin: 0;
          font-size: 24px;
        }

        .mode-indicator {
          font-size: 14px;
          opacity: 0.9;
          margin-top: 5px;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
        }

        .status-item {
          text-align: center;
          padding: 8px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
        }

        .status-item.connected, .status-item.active {
          background: rgba(40, 167, 69, 0.3);
        }

        .status-item.disconnected, .status-item.inactive {
          background: rgba(220, 53, 69, 0.3);
        }

        .status-label {
          display: block;
          font-size: 12px;
          opacity: 0.8;
        }

        .status-value {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-top: 2px;
        }

        .studio-content {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 20px;
          padding: 20px;
        }

        .main-interface {
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          overflow: hidden;
        }

        .side-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .avatar-section, .participants-section, .chat-section {
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          padding: 20px;
        }

        .avatar-section h3, .participants-section h3, .chat-section h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 16px;
        }

        .avatar-container {
          height: 200px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 15px;
          overflow: hidden;
        }

        .avatar-controls {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .avatar-btn {
          padding: 8px;
          background: #e3f2fd;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          color: #1976d2;
        }

        .avatar-btn:hover {
          background: #bbdefb;
        }

        .participants-list {
          max-height: 200px;
          overflow-y: auto;
        }

        .participant-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: 6px;
          margin-bottom: 5px;
        }

        .participant-item.teacher {
          background: #fff3e0;
          color: #ef6c00;
        }

        .participant-item.student {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .participant-name {
          flex: 1;
          font-weight: 500;
        }

        .participant-role {
          font-size: 12px;
          opacity: 0.7;
        }

        .no-participants, .no-messages {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 20px;
        }

        .chat-messages {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 15px;
          border: 1px solid #eee;
          border-radius: 6px;
          padding: 10px;
        }

        .chat-message {
          margin-bottom: 10px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .message-author {
          font-weight: 500;
          color: #495057;
          margin-right: 5px;
        }

        .message-content {
          color: #212529;
        }

        .message-time {
          display: block;
          font-size: 11px;
          color: #6c757d;
          margin-top: 3px;
        }

        .chat-input {
          display: flex;
          gap: 8px;
        }

        .message-input {
          flex: 1;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .message-input:focus {
          outline: none;
          border-color: #4facfe;
        }

        .send-btn {
          padding: 8px 12px;
          background: #4facfe;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .send-btn:hover {
          background: #2196F3;
        }

        .studio-footer {
          background: #f8f9fa;
          padding: 15px 20px;
          border-top: 1px solid #dee2e6;
        }

        .tech-info {
          display: flex;
          gap: 20px;
          font-size: 12px;
          color: #6c757d;
          justify-content: center;
        }

        @media (max-width: 1024px) {
          .studio-content {
            grid-template-columns: 1fr;
          }
          
          .side-panel {
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .studio-header {
            text-align: center;
          }
          
          .status-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default LiveStreamingStudio;