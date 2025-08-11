// src/ai/systems/expressions/emotions/index.ts

import { LSFContextualEmotionSystem } from './LSFContextualEmotionSystem';
import { SocialContextAnalyzer } from './contextual/analyzers/SocialContextAnalyzer';
import { NarrativeContextAnalyzer } from './contextual/analyzers/NarrativeContextAnalyzer';
import { CulturalContextAnalyzer } from './contextual/analyzers/CulturalContextAnalyzer';
import { TemporalContextAnalyzer } from './contextual/analyzers/TemporalContextAnalyzer';
import { ContextualAdaptationValidator } from './validation/ContextualAdaptationValidator';
import { EmotionAdaptationEvaluator } from './contextual/evaluation/EmotionAdaptationEvaluator';

import {
    EmotionState,
    AdaptedEmotion,
    ContextualInformation,
    SocialContext,
    NarrativeContext,
    TemporalContext,
    ValidationResult
} from './contextual/types';

import {
    IContextualEmotionSystem,
    ISocialContextAnalyzer,
    INarrativeContextAnalyzer,
    ICulturalContextAnalyzer,
    ITemporalContextAnalyzer,
    IContextualAdaptationValidator,
    IEmotionAdaptationEvaluator
} from './contextual/interfaces';

/**
 * Exporte les classes principales du système d'émotions contextuelles LSF
 */
export {
    // Système principal
    LSFContextualEmotionSystem,

    // Analyseurs
    SocialContextAnalyzer,
    NarrativeContextAnalyzer,
    CulturalContextAnalyzer,
    TemporalContextAnalyzer,

    // Validateur et évaluateur
    ContextualAdaptationValidator,
    EmotionAdaptationEvaluator,
};

// Réexportation des interfaces avec le mot-clé type pour isolatedModules
export type {
    // Interfaces
    IContextualEmotionSystem,
    ISocialContextAnalyzer,
    INarrativeContextAnalyzer,
    ICulturalContextAnalyzer,
    ITemporalContextAnalyzer,
    IContextualAdaptationValidator,
    IEmotionAdaptationEvaluator,

    // Types
    EmotionState,
    AdaptedEmotion,
    ContextualInformation,
    SocialContext,
    NarrativeContext,
    TemporalContext,
    ValidationResult
};

/**
 * Fonction d'assistance pour créer un état émotionnel de base
 * @param type Type d'émotion
 * @param intensity Intensité globale
 * @returns État émotionnel
 */
export function createBaseEmotionState(type: string, intensity: number = 0.7): EmotionState {
    return {
        type,
        intensity,
        components: {
            facial: {
                eyebrows: getDefaultEyebrowsForEmotion(type),
                eyes: getDefaultEyesForEmotion(type),
                mouth: getDefaultMouthForEmotion(type),
                intensity: intensity
            },
            gestural: {
                hands: getDefaultHandsForEmotion(type),
                arms: getDefaultArmsForEmotion(type),
                body: getDefaultBodyForEmotion(type),
                intensity: intensity
            },
            intensity: intensity
        },
        dynamics: {
            duration: getDefaultDurationForEmotion(type),
            transition: getDefaultTransitionForEmotion(type),
            sequence: getDefaultSequenceForEmotion(type)
        },
        metadata: {
            source: 'base_emotion_creator',
            confidence: 1.0
        }
    };
}

/**
 * Crée une information contextuelle de base
 * @param settings Paramètres optionnels pour personnaliser le contexte
 * @returns Information contextuelle
 */
export function createBaseContextualInformation(
    settings?: {
        socialSetting?: string;
        formalityLevel?: number;
        narrativeType?: string;
        culturalRegion?: string;
        temporalDuration?: number;
    }
): ContextualInformation {
    return {
        social: {
            setting: settings?.socialSetting || 'standard',
            formalityLevel: settings?.formalityLevel || 0.5
        },
        narrative: {
            type: settings?.narrativeType || 'standard'
        },
        cultural: {
            region: settings?.culturalRegion || 'standard',
            formalityLevel: settings?.formalityLevel || 0.5,
            context: 'narrative' // Changé de 'standard' à 'narrative' pour correspondre au type attendu
        },
        temporal: {
            duration: settings?.temporalDuration || 2.5,
            timingPatterns: [{
                type: 'standard',
                duration: settings?.temporalDuration || 2.5
            }]
        }
    };
}

/**
 * Fonctions d'assistance pour obtenir des valeurs par défaut pour les émotions
 */
function getDefaultEyebrowsForEmotion(type: string): string {
    switch (type) {
        case 'joy': return 'relaxed';
        case 'anger': return 'furrowed';
        case 'fear': return 'raised';
        case 'sadness': return 'inner_raised';
        case 'surprise': return 'high_raised';
        case 'disgust': return 'lowered';
        default: return 'neutral';
    }
}

function getDefaultEyesForEmotion(type: string): string {
    switch (type) {
        case 'joy': return 'squinted';
        case 'anger': return 'intensified';
        case 'fear': return 'widened';
        case 'sadness': return 'lowered';
        case 'surprise': return 'widened';
        case 'disgust': return 'narrowed';
        default: return 'neutral';
    }
}

function getDefaultMouthForEmotion(type: string): string {
    switch (type) {
        case 'joy': return 'smile';
        case 'anger': return 'tight';
        case 'fear': return 'open';
        case 'sadness': return 'down_turned';
        case 'surprise': return 'o_shaped';
        case 'disgust': return 'curled';
        default: return 'neutral';
    }
}

function getDefaultHandsForEmotion(type: string): string {
    switch (type) {
        case 'joy': return 'open';
        case 'anger': return 'tense';
        case 'fear': return 'defensive';
        case 'sadness': return 'low_energy';
        case 'surprise': return 'spread';
        case 'disgust': return 'rejecting';
        default: return 'neutral';
    }
}

function getDefaultArmsForEmotion(type: string): string {
    switch (type) {
        case 'joy': return 'animated';
        case 'anger': return 'tense';
        case 'fear': return 'protective';
        case 'sadness': return 'drooping';
        case 'surprise': return 'raised';
        case 'disgust': return 'distancing';
        default: return 'neutral';
    }
}

function getDefaultBodyForEmotion(type: string): string {
    switch (type) {
        case 'joy': return 'upright';
        case 'anger': return 'forward';
        case 'fear': return 'retracted';
        case 'sadness': return 'hunched';
        case 'surprise': return 'straightened';
        case 'disgust': return 'avoidant';
        default: return 'neutral';
    }
}

function getDefaultDurationForEmotion(type: string): number {
    switch (type) {
        case 'joy': return 3.0;
        case 'anger': return 2.5;
        case 'fear': return 2.0;
        case 'sadness': return 4.0;
        case 'surprise': return 1.5;
        case 'disgust': return 2.0;
        default: return 2.5;
    }
}

function getDefaultTransitionForEmotion(type: string): 'abrupt' | 'gradual' | 'smooth' {
    switch (type) {
        case 'surprise': return 'abrupt';
        case 'fear': return 'abrupt';
        case 'sadness': return 'gradual';
        case 'joy': return 'smooth';
        case 'disgust': return 'gradual';
        case 'anger': return 'abrupt';
        default: return 'smooth';
    }
}

function getDefaultSequenceForEmotion(type: string): string[] {
    switch (type) {
        case 'joy': return ['initial', 'rising', 'peak', 'sustained'];
        case 'anger': return ['initial', 'intensify', 'peak', 'sustain', 'gradual_release'];
        case 'fear': return ['initial', 'rapid_rise', 'peak', 'sustained_tension', 'vigilance'];
        case 'sadness': return ['initial', 'gradual_onset', 'sustained', 'fluctuating'];
        case 'surprise': return ['initial', 'sudden_onset', 'peak', 'rapid_decay'];
        case 'disgust': return ['initial', 'rising', 'peak', 'sustained_tension'];
        default: return ['initial', 'standard', 'release'];
    }
}