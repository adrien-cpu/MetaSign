'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { VideoStreamingService, type StreamParticipant } from '../services/VideoStreamingService';

export interface VideoStreamingState {
  isConnected: boolean;
  currentRoom: string | null;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: Map<string, StreamParticipant>;
  isStreaming: boolean;
  participantRole: 'teacher' | 'student';
  error: string | null;
  connectionStats: any | null;
}

export interface VideoStreamingControls {
  startLocalStream: () => Promise<MediaStream>;
  stopLocalStream: () => void;
  createRoom: (roomName: string) => Promise<string>;
  joinRoom: (roomId: string, participantName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  getStats: () => Promise<any>;
  dispose: () => void;
}

export interface VideoStreamingHookReturn extends VideoStreamingState, VideoStreamingControls {}

export const useVideoStreaming = (
  participantId: string,
  participantRole: 'teacher' | 'student',
  wsUrl?: string
): VideoStreamingHookReturn => {
  
  const serviceRef = useRef<VideoStreamingService | null>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<VideoStreamingState>({
    isConnected: false,
    currentRoom: null,
    localStream: null,
    remoteStreams: new Map(),
    participants: new Map(),
    isStreaming: false,
    participantRole,
    error: null,
    connectionStats: null
  });

  // Initialisation du service
  useEffect(() => {
    const initService = () => {
      try {
        serviceRef.current = new VideoStreamingService(
          participantId,
          participantRole,
          wsUrl
        );

        // Événements de connexion
        serviceRef.current.on('connected', () => {
          setState(prev => ({ ...prev, isConnected: true, error: null }));
        });

        serviceRef.current.on('disconnected', () => {
          setState(prev => ({ ...prev, isConnected: false }));
        });

        serviceRef.current.on('error', (error) => {
          setState(prev => ({ 
            ...prev, 
            error: error.message || 'Erreur de connexion' 
          }));
        });

        // Événements de stream
        serviceRef.current.on('local-stream-started', (stream: MediaStream) => {
          setState(prev => ({ 
            ...prev, 
            localStream: stream, 
            isStreaming: true,
            error: null 
          }));
        });

        serviceRef.current.on('local-stream-stopped', () => {
          setState(prev => ({ 
            ...prev, 
            localStream: null, 
            isStreaming: false 
          }));
        });

        serviceRef.current.on('remote-stream-received', ({ participantId: pid, stream }) => {
          setState(prev => {
            const newRemoteStreams = new Map(prev.remoteStreams);
            newRemoteStreams.set(pid, stream);
            return { ...prev, remoteStreams: newRemoteStreams };
          });
        });

        // Événements de room
        serviceRef.current.on('room-created', ({ roomId }) => {
          setState(prev => ({ ...prev, currentRoom: roomId }));
        });

        serviceRef.current.on('joining-room', ({ roomId }) => {
          setState(prev => ({ ...prev, currentRoom: roomId }));
        });

        serviceRef.current.on('room-left', () => {
          setState(prev => ({ 
            ...prev, 
            currentRoom: null,
            remoteStreams: new Map(),
            participants: new Map()
          }));
        });

        // Événements de participants
        serviceRef.current.on('participant-joined', ({ participantId: pid, participantName, participantRole: pRole }) => {
          setState(prev => {
            const newParticipants = new Map(prev.participants);
            newParticipants.set(pid, {
              id: pid,
              name: participantName || 'Participant',
              role: pRole || 'student',
              isConnected: true
            });
            return { ...prev, participants: newParticipants };
          });
        });

        serviceRef.current.on('participant-left', ({ participantId: pid }) => {
          setState(prev => {
            const newParticipants = new Map(prev.participants);
            const newRemoteStreams = new Map(prev.remoteStreams);
            newParticipants.delete(pid);
            newRemoteStreams.delete(pid);
            return { 
              ...prev, 
              participants: newParticipants,
              remoteStreams: newRemoteStreams 
            };
          });
        });

        serviceRef.current.on('peer-connected', ({ participantId: pid }) => {
          setState(prev => {
            const newParticipants = new Map(prev.participants);
            const participant = newParticipants.get(pid);
            if (participant) {
              participant.isConnected = true;
              newParticipants.set(pid, participant);
            }
            return { ...prev, participants: newParticipants };
          });
        });

        serviceRef.current.on('peer-disconnected', ({ participantId: pid }) => {
          setState(prev => {
            const newParticipants = new Map(prev.participants);
            const participant = newParticipants.get(pid);
            if (participant) {
              participant.isConnected = false;
              newParticipants.set(pid, participant);
            }
            return { ...prev, participants: newParticipants };
          });
        });

      } catch (error) {
        console.error('Erreur initialisation service streaming:', error);
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Erreur initialisation'
        }));
      }
    };

    initService();

    return () => {
      if (serviceRef.current) {
        serviceRef.current.dispose();
        serviceRef.current = null;
      }
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, [participantId, participantRole, wsUrl]);

  // Mise à jour périodique des statistiques
  useEffect(() => {
    if (state.isConnected && !statsIntervalRef.current) {
      statsIntervalRef.current = setInterval(async () => {
        if (serviceRef.current) {
          try {
            const stats = await serviceRef.current.getStreamingStats();
            setState(prev => ({ ...prev, connectionStats: stats }));
          } catch (error) {
            console.error('Erreur récupération stats:', error);
          }
        }
      }, 5000);
    } else if (!state.isConnected && statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
      }
    };
  }, [state.isConnected]);

  // Contrôles
  const startLocalStream = useCallback(async (): Promise<MediaStream> => {
    if (!serviceRef.current) {
      throw new Error('Service non initialisé');
    }
    
    try {
      setState(prev => ({ ...prev, error: null }));
      return await serviceRef.current.startLocalStream();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur démarrage stream';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  const stopLocalStream = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.stopLocalStream();
    }
  }, []);

  const createRoom = useCallback(async (roomName: string): Promise<string> => {
    if (!serviceRef.current) {
      throw new Error('Service non initialisé');
    }

    try {
      setState(prev => ({ ...prev, error: null }));
      return await serviceRef.current.createRoom(roomName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur création room';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  const joinRoom = useCallback(async (roomId: string, participantName: string): Promise<void> => {
    if (!serviceRef.current) {
      throw new Error('Service non initialisé');
    }

    try {
      setState(prev => ({ ...prev, error: null }));
      await serviceRef.current.joinRoom(roomId, participantName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur rejoindre room';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  const leaveRoom = useCallback(async (): Promise<void> => {
    if (serviceRef.current) {
      await serviceRef.current.leaveRoom();
    }
  }, []);

  const getStats = useCallback(async (): Promise<any> => {
    if (!serviceRef.current) return null;
    return await serviceRef.current.getStreamingStats();
  }, []);

  const dispose = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.dispose();
      serviceRef.current = null;
    }
    setState({
      isConnected: false,
      currentRoom: null,
      localStream: null,
      remoteStreams: new Map(),
      participants: new Map(),
      isStreaming: false,
      participantRole,
      error: null,
      connectionStats: null
    });
  }, [participantRole]);

  return {
    // État
    ...state,
    
    // Contrôles
    startLocalStream,
    stopLocalStream,
    createRoom,
    joinRoom,
    leaveRoom,
    getStats,
    dispose
  };
};