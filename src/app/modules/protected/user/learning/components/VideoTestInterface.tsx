/**
 * @file VideoTestInterface.tsx
 * @description Interface de test simple pour vérifier le flux vidéo
 * @author MetaSign Team
 * @version 1.0.0
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useVideoStreaming } from '../hooks/useVideoStreaming';

interface VideoTestInterfaceProps {
  userId: string;
  className?: string;
}

export const VideoTestInterface: React.FC<VideoTestInterfaceProps> = ({
  userId,
  className = ''
}) => {
  const streaming = useVideoStreaming(userId, 'teacher');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Attacher le flux vidéo quand il arrive
  useEffect(() => {
    if (streaming.localStream && videoRef.current) {
      console.log('📹 Attachement stream au test vidéo');
      videoRef.current.srcObject = streaming.localStream;
    }
  }, [streaming.localStream]);

  const handleStart = async () => {
    try {
      setError(null);
      console.log('🎬 Test démarrage flux vidéo...');
      
      await streaming.startLocalStream();
      setIsStarted(true);
      
      console.log('✅ Flux vidéo démarré avec succès');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      console.error('❌ Erreur test vidéo:', err);
    }
  };

  const handleStop = () => {
    streaming.stopLocalStream();
    setIsStarted(false);
    console.log('⏹️ Flux vidéo arrêté');
  };

  return (
    <div className={`video-test-interface ${className}`}>
      <h2>🧪 Test Flux Vidéo</h2>
      
      <div className="test-controls">
        <button 
          onClick={handleStart}
          disabled={isStarted || !streaming.isConnected}
          className="start-test-btn"
        >
          {isStarted ? '✅ Démarré' : '🎬 Démarrer Test'}
        </button>
        
        <button 
          onClick={handleStop}
          disabled={!isStarted}
          className="stop-test-btn"
        >
          ⏹️ Arrêter Test
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <div className="status-info">
        <div>WebSocket: {streaming.isConnected ? '✅ Connecté' : '❌ Déconnecté'}</div>
        <div>Stream Local: {streaming.localStream ? '✅ Actif' : '❌ Inactif'}</div>
        <div>Vidéo Attachée: {videoRef.current?.srcObject ? '✅ Oui' : '❌ Non'}</div>
      </div>

      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="test-video"
          onLoadedMetadata={() => console.log('📹 Test vidéo: métadonnées chargées')}
          onPlay={() => console.log('📹 Test vidéo: lecture démarrée')}
          onError={(e) => {
            console.error('📹 Test vidéo: erreur', e);
            setError('Erreur lecture vidéo');
          }}
        />
        
        {!streaming.localStream && (
          <div className="video-placeholder">
            <div className="placeholder-content">
              <div className="camera-icon">📹</div>
              <p>Cliquez sur "Démarrer Test" pour voir votre vidéo</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .video-test-interface {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .video-test-interface h2 {
          text-align: center;
          color: #333;
          margin-bottom: 20px;
        }

        .test-controls {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .start-test-btn {
          background: #28a745;
          color: white;
          border: 2px solid #28a745;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
          transition: all 0.3s ease;
        }

        .start-test-btn:hover:not(:disabled) {
          background: #218838;
          border-color: #218838;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(40, 167, 69, 0.4);
        }

        .start-test-btn:disabled {
          background: #6c757d;
          border-color: #6c757d;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .stop-test-btn {
          background: #dc3545;
          color: white;
          border: 2px solid #dc3545;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
          transition: all 0.3s ease;
        }

        .stop-test-btn:hover:not(:disabled) {
          background: #c82333;
          border-color: #c82333;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(220, 53, 69, 0.4);
        }

        .stop-test-btn:disabled {
          background: #6c757d;
          border-color: #6c757d;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 20px;
          text-align: center;
        }

        .status-info {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 20px;
          font-family: monospace;
          font-size: 14px;
        }

        .status-info div {
          margin-bottom: 5px;
        }

        .status-info div:last-child {
          margin-bottom: 0;
        }

        .video-container {
          position: relative;
          background: #000;
          border-radius: 8px;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .test-video {
          width: 100%;
          height: auto;
          max-height: 600px;
          border-radius: 8px;
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
          font-size: 64px;
          margin-bottom: 20px;
        }

        .placeholder-content p {
          margin: 0;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default VideoTestInterface;