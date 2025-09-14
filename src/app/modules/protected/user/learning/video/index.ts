/**
 * @file index.ts
 * @description Point d'entrée pour tous les composants d'apprentissage vidéo multimodal
 * @author MetaSign Team
 * @version 1.0.0
 */

// Services principaux
export { VideoLearningBridge } from '../services/VideoLearningBridge';
export { CODAVideoIntegration } from '../services/CODAVideoIntegration';
export { AvatarSigningService } from '../services/AvatarSigningService';
export { VideoStreamingService } from '../services/VideoStreamingService';

// Hooks
export { useVideoLearning } from '../hooks/useVideoLearning';
export { useAvatarSigning } from '../hooks/useAvatarSigning';
export { useVideoStreaming } from '../hooks/useVideoStreaming';

// Composants
export { TeacherVideoInterface } from '../components/TeacherVideoInterface';
export { MultimodalLearningStudio } from '../components/MultimodalLearningStudio';
export { CODAAvatar3D } from '../components/CODAAvatar3D';
export { StudentVideoInterface } from '../components/StudentVideoInterface';
export { LiveStreamingStudio } from '../components/LiveStreamingStudio';

// Types pour l'interface
export type {
  VideoStreamConfig,
  LearningSession,
  SignRecognitionResult,
  TextSignAssociation,
  VideoRecording,
  HandPose,
  StreamingMessage
} from '../services/VideoLearningBridge';

export type {
  CODALearningContext,
  MultimodalLearningData,
  CODAFeedback
} from '../services/CODAVideoIntegration';

export type {
  SignKeyframe,
  HandPosition,
  FingerConfiguration,
  SignDatabase
} from '../services/AvatarSigningService';

export type {
  StreamParticipant,
  StreamingRoom,
  StreamingMessage,
  WebRTCConfig
} from '../services/VideoStreamingService';