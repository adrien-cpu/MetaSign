// src/ai/systems/expressions/emotions/contextual/analyzers/NarrativeContextAnalyzer.ts

import { NarrativeContext, NarrativeElementsAnalysis } from '../types';
import { INarrativeContextAnalyzer } from '../interfaces';

/**
 * Analyseur de contexte narratif pour les adaptations émotionnelles
 */
export class NarrativeContextAnalyzer implements INarrativeContextAnalyzer {
    /**
     * Analyse le contexte narratif pour déterminer comment adapter les émotions
     * @param narrative Contexte narratif
     * @returns Analyse des éléments narratifs
     */
    public analyzeNarrativeContext(narrative: NarrativeContext): NarrativeElementsAnalysis {
        // Gérer le cas où le contexte est incomplet
        if (!narrative || typeof narrative !== 'object') {
            return this.createDefaultAnalysis();
        }

        // Analyser les éléments de l'histoire
        const storyElements = this.analyzeStoryElements(narrative);

        // Extraire les arcs émotionnels
        const emotionalArcs = this.extractEmotionalArcs(narrative);

        // Calculer les caractéristiques narratives supplémentaires
        const narrativeCharacteristics = this.calculateNarrativeCharacteristics(narrative, storyElements, emotionalArcs);

        return {
            storyElements,
            emotionalArcs,
            narrativeType: narrative.type || 'neutral',
            narrativeCharacteristics
        };
    }

    /**
     * Implémentation de l'interface IContextAnalyzer
     */
    public analyze(context: NarrativeContext): NarrativeElementsAnalysis {
        return this.analyzeNarrativeContext(context);
    }

    /**
     * Crée une analyse par défaut quand le contexte est incomplet
     * @returns Analyse des éléments narratifs par défaut
     */
    private createDefaultAnalysis(): NarrativeElementsAnalysis {
        return {
            storyElements: {
                tone: 'neutral',
                pace: 'moderate',
                theme: 'general'
            },
            emotionalArcs: [],
            narrativeType: 'neutral',
            narrativeCharacteristics: {
                emotionalIntensity: 'moderate',
                emotionalComplexity: 'low',
                pacing: 'steady',
                audience: 'general'
            }
        };
    }

    /**
     * Analyse les éléments de l'histoire
     * @param narrative Contexte narratif
     * @returns Éléments de l'histoire analysés
     */
    private analyzeStoryElements(narrative: NarrativeContext): NarrativeElementsAnalysis['storyElements'] {
        // Déterminer le ton à partir du type narratif si non spécifié
        const tone = narrative.storyElements?.tone || this.inferToneFromType(narrative.type);

        // Autres propriétés des éléments de l'histoire
        const theme = narrative.storyElements?.theme || 'general';
        const pace = narrative.storyElements?.pace || this.inferPaceFromType(narrative.type);

        return {
            tone,
            theme,
            pace,
            narrativeType: narrative.type || 'neutral'
        };
    }

    /**
     * Infère le ton basé sur le type narratif
     * @param type Type narratif
     * @returns Ton inféré
     */
    private inferToneFromType(type: string | undefined): string {
        if (!type) return 'neutral';

        switch (type.toLowerCase()) {
            case 'dramatic':
                return 'intense';
            case 'comedic':
                return 'light';
            case 'instructional':
                return 'neutral';
            case 'informative':
                return 'factual';
            case 'personal':
                return 'intimate';
            default:
                return 'balanced';
        }
    }

    /**
     * Infère le rythme basé sur le type narratif
     * @param type Type narratif
     * @returns Rythme inféré
     */
    private inferPaceFromType(type: string | undefined): string {
        if (!type) return 'moderate';

        switch (type.toLowerCase()) {
            case 'dramatic':
                return 'dynamic';
            case 'comedic':
                return 'quick';
            case 'instructional':
                return 'measured';
            case 'informative':
                return 'steady';
            case 'personal':
                return 'variable';
            default:
                return 'moderate';
        }
    }

    /**
     * Extrait et analyse les arcs émotionnels
     * @param narrative Contexte narratif
     * @returns Arcs émotionnels analysés
     */
    private extractEmotionalArcs(narrative: NarrativeContext): Array<Record<string, unknown>> {
        if (!narrative.emotionalArcs || narrative.emotionalArcs.length === 0) {
            // Créer un arc par défaut basé sur le type narratif
            return [this.createDefaultArc(narrative.type)];
        }

        return narrative.emotionalArcs.map(arc => {
            // Valider et normaliser les valeurs
            const intensity = typeof arc.intensity === 'number'
                ? Math.min(1, Math.max(0, arc.intensity))
                : 0.5;

            const duration = typeof arc.duration === 'number' && arc.duration > 0
                ? arc.duration
                : 1.0;

            // Déterminer l'importance de l'arc
            const significance = this.determineArcSignificance(arc.name, intensity);

            // Déterminer le motif de l'arc
            const pattern = this.determineArcPattern(arc.name, intensity);

            return {
                name: arc.name,
                intensity,
                duration,
                significance,
                pattern
            };
        });
    }

    /**
     * Crée un arc émotionnel par défaut basé sur le type narratif
     * @param narrativeType Type de narration
     * @returns Arc émotionnel par défaut
     */
    private createDefaultArc(narrativeType: string | undefined): Record<string, unknown> {
        if (!narrativeType) {
            return {
                name: 'standard_arc',
                intensity: 0.6,
                duration: 1.0,
                pattern: 'balanced',
                significance: 'primary'
            };
        }

        switch (narrativeType.toLowerCase()) {
            case 'dramatic':
                return {
                    name: 'dramatic_build',
                    intensity: 0.8,
                    duration: 1.0,
                    pattern: 'rising',
                    significance: 'primary'
                };
            case 'comedic':
                return {
                    name: 'comedic_relief',
                    intensity: 0.7,
                    duration: 0.8,
                    pattern: 'oscillating',
                    significance: 'primary'
                };
            case 'instructional':
                return {
                    name: 'educational_focus',
                    intensity: 0.5,
                    duration: 1.0,
                    pattern: 'sustained',
                    significance: 'supportive'
                };
            case 'informative':
                return {
                    name: 'informative_arc',
                    intensity: 0.4,
                    duration: 1.0,
                    pattern: 'steady',
                    significance: 'supportive'
                };
            case 'personal':
                return {
                    name: 'personal_experience',
                    intensity: 0.7,
                    duration: 1.0,
                    pattern: 'variable',
                    significance: 'primary'
                };
            default:
                return {
                    name: 'standard_arc',
                    intensity: 0.6,
                    duration: 1.0,
                    pattern: 'balanced',
                    significance: 'primary'
                };
        }
    }

    /**
     * Détermine l'importance d'un arc émotionnel
     * @param name Nom de l'arc
     * @param intensity Intensité de l'arc
     * @returns Niveau d'importance
     */
    private determineArcSignificance(name: string, intensity: number): string {
        // Les arcs avec certains mots-clés sont considérés plus importants
        const importantKeywords = ['climax', 'peak', 'critical', 'key', 'main', 'primary', 'central'];

        // Vérifier si le nom contient un mot-clé important
        const hasImportantKeyword = importantKeywords.some(keyword =>
            name.toLowerCase().includes(keyword)
        );

        // Déterminer l'importance basée sur les mots-clés et l'intensité
        if (hasImportantKeyword || intensity > 0.8) {
            return 'major';
        } else if (intensity > 0.5) {
            return 'significant';
        } else {
            return 'supporting';
        }
    }

    /**
     * Détermine le motif d'un arc émotionnel
     * @param name Nom de l'arc
     * @param intensity Intensité de l'arc
     * @returns Motif de l'arc
     */
    private determineArcPattern(name: string, intensity: number): string {
        const patternKeywords: Record<string, string> = {
            'rising': 'rising',
            'crescendo': 'rising',
            'building': 'rising',
            'increasing': 'rising',
            'falling': 'falling',
            'descending': 'falling',
            'decreasing': 'falling',
            'oscillating': 'oscillating',
            'variable': 'variable',
            'fluctuating': 'variable',
            'steady': 'steady',
            'sustained': 'steady',
            'constant': 'steady',
            'peaked': 'peaked',
            'climax': 'peaked'
        };

        // Rechercher des mots-clés dans le nom de l'arc
        for (const [keyword, pattern] of Object.entries(patternKeywords)) {
            if (name.toLowerCase().includes(keyword)) {
                return pattern;
            }
        }

        // Par défaut, les arcs de haute intensité sont souvent croissants
        if (intensity > 0.7) {
            return 'rising';
        } else if (intensity < 0.4) {
            return 'steady';
        }

        return 'balanced';
    }

    /**
     * Calcule les caractéristiques narratives supplémentaires
     * @param narrative Contexte narratif
     * @param storyElements Éléments de l'histoire
     * @param emotionalArcs Arcs émotionnels
     * @returns Caractéristiques narratives
     */
    private calculateNarrativeCharacteristics(
        narrative: NarrativeContext,
        storyElements: Record<string, unknown>,
        emotionalArcs: Array<Record<string, unknown>>
    ): Record<string, unknown> {
        // Déterminer l'intensité émotionnelle globale
        const emotionalIntensity = this.calculateEmotionalIntensity(narrative, emotionalArcs);

        // Déterminer la complexité émotionnelle
        const emotionalComplexity = this.determineEmotionalComplexity(narrative, emotionalArcs);

        // Déterminer le rythme
        const pacing = this.determinePacing(storyElements);

        // Inférer le public cible
        const audience = this.inferAudienceFromType(narrative.type);

        return {
            emotionalIntensity,
            emotionalComplexity,
            pacing,
            audience
        };
    }

    /**
     * Calcule l'intensité émotionnelle globale
     * @param narrative Contexte narratif
     * @param emotionalArcs Arcs émotionnels
     * @returns Niveau d'intensité émotionnelle
     */
    private calculateEmotionalIntensity(
        narrative: NarrativeContext,
        emotionalArcs: Array<Record<string, unknown>>
    ): string {
        // Si des arcs sont présents, calculer l'intensité moyenne pondérée
        if (emotionalArcs.length > 0) {
            let totalIntensity = 0;
            let totalWeight = 0;

            emotionalArcs.forEach(arc => {
                const intensity = arc.intensity as number || 0.5;
                const significance = arc.significance as string || 'supporting';

                // Pondération selon l'importance
                const weight = significance === 'major' ? 3 :
                    significance === 'significant' ? 2 : 1;

                totalIntensity += intensity * weight;
                totalWeight += weight;
            });

            const averageIntensity = totalWeight > 0 ? totalIntensity / totalWeight : 0.5;

            if (averageIntensity > 0.7) return 'high';
            if (averageIntensity > 0.4) return 'moderate';
            return 'low';
        }

        // Sinon, baser l'intensité sur le type narratif
        switch ((narrative.type || '').toLowerCase()) {
            case 'dramatic':
                return 'high';
            case 'comedic':
            case 'personal':
                return 'moderate_high';
            case 'instructional':
            case 'informative':
                return 'moderate_low';
            default:
                return 'moderate';
        }
    }

    /**
     * Détermine la complexité émotionnelle
     * @param narrative Contexte narratif
     * @param emotionalArcs Arcs émotionnels
     * @returns Niveau de complexité émotionnelle
     */
    private determineEmotionalComplexity(
        narrative: NarrativeContext,
        emotionalArcs: Array<Record<string, unknown>>
    ): string {
        // Complexité basée sur le nombre d'arcs émotionnels
        const arcCount = emotionalArcs.length;

        // Complexité basée sur la diversité des motifs d'arcs
        const uniquePatterns = new Set(
            emotionalArcs.map(arc => arc.pattern as string).filter(Boolean)
        );

        // Facteur de complexité
        const complexityFactor = (arcCount * 0.7) + (uniquePatterns.size * 0.3);

        if (complexityFactor > 3) return 'high';
        if (complexityFactor > 1.5) return 'medium';
        return 'low';
    }

    /**
     * Détermine le rythme narratif
     * @param storyElements Éléments de l'histoire
     * @returns Description du rythme
     */
    private determinePacing(storyElements: Record<string, unknown>): string {
        // Utiliser directement le rythme s'il est défini
        if (storyElements.pace) {
            const pace = storyElements.pace as string;

            if (['fast', 'quick', 'rapid'].includes(pace.toLowerCase())) {
                return 'fast';
            } else if (['slow', 'deliberate', 'measured'].includes(pace.toLowerCase())) {
                return 'slow';
            } else if (['variable', 'dynamic', 'changing'].includes(pace.toLowerCase())) {
                return 'variable';
            }
        }

        // Baser le rythme sur le ton narratif
        const tone = storyElements.tone as string;
        if (['intense', 'dramatic', 'urgent'].includes(tone.toLowerCase())) {
            return 'dynamic';
        } else if (['light', 'comedic', 'lively'].includes(tone.toLowerCase())) {
            return 'quick';
        } else if (['factual', 'neutral', 'informative'].includes(tone.toLowerCase())) {
            return 'steady';
        } else if (['intimate', 'melancholic', 'subdued'].includes(tone.toLowerCase())) {
            return 'measured';
        }

        return 'moderate';
    }

    /**
     * Infère le public cible basé sur le type narratif
     * @param type Type narratif
     * @returns Description du public cible
     */
    private inferAudienceFromType(type: string | undefined): string {
        if (!type) return 'general';

        switch (type.toLowerCase()) {
            case 'instructional':
                return 'learners';
            case 'informative':
                return 'general';
            case 'comedic':
                return 'entertainment';
            case 'dramatic':
                return 'engaged';
            case 'personal':
                return 'intimate';
            default:
                return 'mixed';
        }
    }
}