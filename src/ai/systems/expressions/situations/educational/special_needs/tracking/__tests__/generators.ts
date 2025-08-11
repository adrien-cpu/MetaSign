// src/ai/systems/expressions/situations/educational/special_needs/tracking/__tests__/generators.ts

import {
    SupportHistory,
    ChannelMetrics,
    AdaptationMetrics,
    IntegrationData,
    ExpressionSample,
    ContextScenario,
    CommunityFeedback
} from './types';

// Supprimé le paramètre non utilisé et ajouté un commentaire explicatif
export function generateChannelMetrics(): ChannelMetrics {
    // Note: La génération pourrait être personnalisée par type de canal dans une implémentation future
    return {
        accuracy: Array(10).fill(0).map((_, i) => 0.6 + (i * 0.04)),
        response_time: Array(10).fill(0).map((_, i) => 1000 - (i * 50)),
        consistency: Array(10).fill(0).map((_, i) => 0.7 + (i * 0.03))
    };
}

// Supprimé le paramètre non utilisé et ajouté un commentaire explicatif
export function generateAdaptationHistory(): AdaptationMetrics {
    // Note: La génération pourrait être personnalisée par type de canal dans une implémentation future
    return {
        effectiveness: 0.85,
        duration: 14,
        impact: {
            accuracy: 0.2,
            speed: 0.15,
            confidence: 0.25
        }
    };
}

export function generateIntegrationData(): IntegrationData {
    return {
        success_rate: 0.82,
        synchronization: 0.78,
        bottlenecks: ['timing_delay', 'coordination_gap']
    };
}

export function generateExpressionSamples(): ExpressionSample[] {
    return Array(5).fill(null).map((_, i) => ({
        type: `expression_${i}`,
        context: `context_${i}`,
        components: ['manual', 'non_manual', 'spatial'],
        cultural_markers: ['community_specific', 'generational']
    }));
}

export function generateContextScenarios(): ContextScenario[] {
    return Array(3).fill(null).map((_, i) => ({
        type: `scenario_${i}`,
        complexity: 0.5 + (i * 0.2),
        cultural_elements: ['formal', 'informal', 'community']
    }));
}

export function generateCommunityFeedback(): CommunityFeedback[] {
    return Array(4).fill(null).map((_, i) => ({
        source: `reviewer_${i}`,
        rating: 4 + (Math.random() * 1),
        comments: ['natural', 'culturally_appropriate', 'authentic']
    }));
}

export function generateSupportHistory(): SupportHistory {
    return {
        timeline: Array(5).fill(null).map((_, i) => ({
            timestamp: Date.now() - (i * 86400000),
            type: 'adaptation_adjustment',
            details: { reason: 'progress_based', impact: 'positive' }
        })),
        adaptations: Array(3).fill(null).map((_, i) => ({
            type: `adaptation_${i}`,
            duration: 7 + (i * 2),
            impact: 0.7 + (i * 0.1)
        })),
        effectiveness: {
            overall: 0.85,
            byType: {
                visual: 0.9,
                temporal: 0.8,
                spatial: 0.85
            }
        }
    };
}

export function generateTimeConstraints(): Record<string, number> {
    return {
        response_window: 5000,
        processing_time: 2000,
        adaptation_period: 1000
    };
}

export function generateExpectations(): Record<string, number> {
    return {
        accuracy_threshold: 0.85,
        fluency_minimum: 0.75,
        consistency_target: 0.8
    };
}

export function generateEnvironmentalChallenges(): string[] {
    return [
        'time_pressure',
        'distractions',
        'complex_interactions'
    ];
}

export function generateCulturalLearningJourney(): Record<string, unknown>[] {
    return Array(6).fill(null).map((_, i) => ({
        stage: `stage_${i}`,
        duration: 30,
        key_learnings: ['cultural_norms', 'community_practices'],
        confidence: 0.5 + (i * 0.1)
    }));
}

export function generateSetbackScenarios(): Record<string, unknown>[] {
    return Array(3).fill(null).map((_, i) => ({
        type: `setback_${i}`,
        severity: 0.5 + (i * 0.2),
        duration: 3 + i,
        impact_areas: ['confidence', 'fluency']
    }));
}

export function generateRecoveryData(): Record<string, unknown> {
    return {
        recovery_speed: 0.75,
        adaptation_quality: 0.8,
        resilience_indicators: ['quick_rebound', 'learning_integration']
    };
}

export function generateExposureHistory(): Record<string, unknown>[] {
    return Array(12).fill(null).map((_, i) => ({
        month: i + 1,
        exposure_hours: 20 + (i * 2),
        activities: ['community_events', 'peer_interactions']
    }));
}

export function generateIdentityMarkers(): Record<string, number> {
    return {
        cultural_awareness: 0.85,
        community_participation: 0.75,
        identity_integration: 0.8
    };
}

export function generateParticipationData(): Record<string, unknown> {
    return {
        frequency: 'weekly',
        roles: ['learner', 'contributor'],
        impact: 'significant'
    };
}

// Implémenté le paramètre type pour générer différents contextes culturels
export function generateCulturalContext(type: string): Record<string, unknown> {
    // Utiliser le type pour personnaliser le contexte culturel
    const patterns = type === 'formal'
        ? ['ceremonial', 'structured', 'hierarchical']
        : type === 'informal'
            ? ['casual', 'spontaneous', 'peer-based']
            : type === 'educational'
                ? ['structured_learning', 'guided_practice', 'feedback_oriented']
                : ['formal', 'informal']; // Valeur par défaut

    const norms = type === 'formal'
        ? ['respectful', 'precise', 'regulated']
        : type === 'informal'
            ? ['relaxed', 'flexible', 'adaptive']
            : type === 'educational'
                ? ['instructive', 'corrective', 'supportive']
                : ['direct', 'indirect']; // Valeur par défaut

    const adaptationLevel = type === 'formal' ? 0.7
        : type === 'informal' ? 0.9
            : type === 'educational' ? 0.85
                : 0.8; // Valeur par défaut

    return {
        primary_patterns: patterns,
        interaction_norms: norms,
        adaptation_level: adaptationLevel,
        context_type: type // Ajouter le type pour référence
    };
}

export function generateIntegrationPatterns(): Record<string, number> {
    return {
        pattern_recognition: 0.85,
        adaptation_speed: 0.8,
        cultural_fluidity: 0.75
    };
}