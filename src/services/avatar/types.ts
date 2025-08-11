// src/services/avatar/types.ts

export interface RPMUser {
  id: string;
  token: string;
}

export interface RPMTemplate {
  id: string;
  imageUrl: string;
  gender: string;
}

export interface AvatarResponse {
  id: string;
  modelUrl: string;
}

export interface CreateAvatarOptions {
  type: 'deaf' | 'hearing';
  gender?: 'masculine' | 'feminine' | 'neutral';
  bodyType?: 'fullbody' | 'halfbody';
}

export interface AvatarAssets {
  skinColor: number;
  eyeColor: string;
  hairStyle: string;
  hairColor: number;
  facialStyle?: string;
  facialColor?: number;
  clothes?: string[];
  // Additional LSF-specific assets will be added here
}

export interface AvatarMetadata {
  id: string;
  partner: string;
  gender: string;
  bodyType: string;
  assets: AvatarAssets;
  // Additional LSF-specific metadata will be added here
}

// Types utilitaires pour les avatars LSF
export interface LSFAvatarOptions extends CreateAvatarOptions {
  expressionPreset?: string;
  culturalFeatures?: string[];
}

export interface LSFAvatarAssets extends AvatarAssets {
  expressionMorphs?: {
    [key: string]: number;
  };
  culturalIdentifiers?: string[];
}

export interface LSFAvatarMetadata extends AvatarMetadata {
  lsfFeatures?: {
    expressionSupport: boolean;
    culturalElements: string[];
    preferredSigningSpace?: {
      width: number;
      height: number;
      depth: number;
    };
  };
}