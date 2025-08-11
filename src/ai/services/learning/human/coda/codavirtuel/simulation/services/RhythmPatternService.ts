/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/services/RhythmPatternService.ts
 * @description Service de génération et gestion des patterns rythmiques LSF
 * @author MetaSign
 * @version 1.0.0
 * @since 2024
 * 
 * Ce service fournit des utilitaires pour générer des patterns d'hésitation,
 * de pauses inappropriées et calculer les impacts rythmiques.
 * 
 * @module RhythmPatternService
 */

/**
 * Interface pour les patterns d'hésitation
 */
export interface HesitationPattern {
    readonly pattern: string;
    readonly frequency: number;
    readonly speedReduction: number;
    readonly fluidityMultiplier: number;
    readonly accuracyImpact: number;
}

/**
 * Interface pour les pauses inappropriées
 */
export interface InappropriatePause {
    readonly type: string;
    readonly description: string;
    readonly duration: number;
    readonly fluidityImpact: number;
}

/**
 * Service de patterns rythmiques LSF
 * Fournit des utilitaires pour générer et analyser les patterns rythmiques
 */
export class RhythmPatternService {
    private static readonly HESITATION_PATTERNS: readonly HesitationPattern[] = [
        {
            pattern: 'Hésitations lexicales',
            frequency: 0.3,
            speedReduction: 0.7,
            fluidityMultiplier: 0.5,
            accuracyImpact: 0.4
        },
        {
            pattern: 'Hésitations syntaxiques',
            frequency: 0.2,
            speedReduction: 0.8,
            fluidityMultiplier: 0.6,
            accuracyImpact: 0.3
        },
        {
            pattern: 'Hésitations de performance',
            frequency: 0.4,
            speedReduction: 0.6,
            fluidityMultiplier: 0.4,
            accuracyImpact: 0.5
        }
    ] as const;

    private static readonly INAPPROPRIATE_PAUSES: readonly InappropriatePause[] = [
        {
            type: 'mid_word',
            description: 'Pause au milieu d\'un signe',
            duration: 0.8,
            fluidityImpact: 0.6
        },
        {
            type: 'excessive_length',
            description: 'Pause trop longue',
            duration: 2.5,
            fluidityImpact: 0.4
        },
        {
            type: 'missing_syntactic',
            description: 'Pause syntaxique manquante',
            duration: 0.0,
            fluidityImpact: 0.3
        },
        {
            type: 'random_insertion',
            description: 'Pause aléatoire insérée',
            duration: 1.2,
            fluidityImpact: 0.5
        }
    ] as const;

    private static readonly PAUSE_ACCURACY_IMPACT_MAP: Record<string, number> = {
        mid_word: 0.7,
        excessive_length: 0.4,
        missing_syntactic: 0.5,
        random_insertion: 0.3
    } as const;

    /**
     * Génère un pattern d'hésitation réaliste
     * @returns Pattern d'hésitation
     */
    public static generateHesitationPattern(): HesitationPattern {
        const randomIndex = Math.floor(Math.random() * this.HESITATION_PATTERNS.length);
        return this.HESITATION_PATTERNS[randomIndex];
    }

    /**
     * Génère une pause inappropriée contextuelle
     * @returns Information sur la pause
     */
    public static generateInappropriatePause(): InappropriatePause {
        const randomIndex = Math.floor(Math.random() * this.INAPPROPRIATE_PAUSES.length);
        return this.INAPPROPRIATE_PAUSES[randomIndex];
    }

    /**
     * Calcule l'impact de fluidité sur d'autres paramètres
     * @param factor - Facteur de transformation
     * @returns Impact sur la fluidité
     */
    public static calculateFluidityImpact(factor: number): number {
        if (factor > 1.5) {
            return (factor - 1.5) * 0.4; // Changement excessif nuit à la fluidité
        } else if (factor < 0.5) {
            return (0.5 - factor) * 0.3; // Changement trop faible crée des saccades
        }
        return 0;
    }

    /**
     * Calcule l'impact sur la précision pour les transformations de vitesse
     * @param factor - Facteur de vitesse
     * @returns Impact sur la précision
     */
    public static calculateSpeedAccuracyImpact(factor: number): number {
        const extremeness = Math.abs(factor - 1);
        return Math.min(0.6, extremeness * 0.4);
    }

    /**
     * Calcule l'impact des pauses sur la précision
     * @param pauseInfo - Information sur la pause
     * @returns Impact sur la précision
     */
    public static calculatePauseAccuracyImpact(pauseInfo: InappropriatePause): number {
        return this.PAUSE_ACCURACY_IMPACT_MAP[pauseInfo.type] ?? 0.3;
    }

    /**
     * Vérifie si un pattern d'hésitation est valide
     * @param pattern - Pattern à vérifier
     * @returns true si le pattern est valide
     */
    public static isValidHesitationPattern(pattern: string): boolean {
        return this.HESITATION_PATTERNS.some(p => p.pattern === pattern);
    }

    /**
     * Vérifie si un type de pause est valide
     * @param pauseType - Type de pause à vérifier
     * @returns true si le type est valide
     */
    public static isValidPauseType(pauseType: string): boolean {
        return this.INAPPROPRIATE_PAUSES.some(p => p.type === pauseType);
    }

    /**
     * Obtient tous les patterns d'hésitation disponibles
     * @returns Liste des patterns d'hésitation
     */
    public static getAllHesitationPatterns(): readonly HesitationPattern[] {
        return this.HESITATION_PATTERNS;
    }

    /**
     * Obtient toutes les pauses inappropriées disponibles
     * @returns Liste des pauses inappropriées
     */
    public static getAllInappropriatePauses(): readonly InappropriatePause[] {
        return this.INAPPROPRIATE_PAUSES;
    }

    /**
     * Calcule l'impact combiné de multiples patterns
     * @param patterns - Liste des patterns appliqués
     * @returns Impact combiné sur la précision
     */
    public static calculateCombinedPatternImpact(patterns: readonly string[]): number {
        let totalImpact = 0;
        let combinationMultiplier = 1;

        patterns.forEach(pattern => {
            const hesitationPattern = this.HESITATION_PATTERNS.find(p => p.pattern === pattern);
            if (hesitationPattern) {
                totalImpact += hesitationPattern.accuracyImpact * combinationMultiplier;
                combinationMultiplier *= 0.8; // Réduction de l'impact pour les patterns supplémentaires
            }
        });

        return Math.min(0.9, totalImpact); // Cap à 90% d'impact
    }

    /**
     * Suggère des améliorations pour un pattern d'hésitation donné
     * @param pattern - Pattern d'hésitation
     * @returns Suggestions d'amélioration
     */
    public static suggestImprovementsForHesitation(pattern: HesitationPattern): readonly string[] {
        const suggestions: string[] = [];

        switch (pattern.pattern) {
            case 'Hésitations lexicales':
                suggestions.push('Enrichir le vocabulaire actif');
                suggestions.push('Pratiquer la récupération lexicale rapide');
                suggestions.push('Utiliser des techniques mnémotechniques');
                break;

            case 'Hésitations syntaxiques':
                suggestions.push('Réviser les structures grammaticales LSF');
                suggestions.push('Pratiquer des constructions syntaxiques complexes');
                suggestions.push('Analyser des exemples de discours fluides');
                break;

            case 'Hésitations de performance':
                suggestions.push('Travailler la confiance en soi');
                suggestions.push('Pratiquer dans des contextes variés');
                suggestions.push('Utiliser des techniques de relaxation');
                break;

            default:
                suggestions.push('Pratiquer régulièrement la fluidité gestuelle');
                suggestions.push('Travailler la continuité des mouvements');
        }

        return suggestions;
    }

    /**
     * Suggère des améliorations pour un type de pause inappropriée
     * @param pause - Pause inappropriée
     * @returns Suggestions d'amélioration
     */
    public static suggestImprovementsForPause(pause: InappropriatePause): readonly string[] {
        const suggestions: string[] = [];

        switch (pause.type) {
            case 'mid_word':
                suggestions.push('Travailler la continuité des signes');
                suggestions.push('Pratiquer l\'exécution complète des mouvements');
                suggestions.push('Renforcer la mémorisation des formes gestuelles');
                break;

            case 'excessive_length':
                suggestions.push('Travailler le timing des pauses');
                suggestions.push('Pratiquer avec un métronome');
                suggestions.push('Étudier les durées appropriées selon le contexte');
                break;

            case 'missing_syntactic':
                suggestions.push('Étudier la structure syntaxique LSF');
                suggestions.push('Identifier les points de pause obligatoires');
                suggestions.push('Pratiquer la segmentation du discours');
                break;

            case 'random_insertion':
                suggestions.push('Améliorer la planification du discours');
                suggestions.push('Travailler la fluidité mentale');
                suggestions.push('Pratiquer l\'improvisation contrôlée');
                break;

            default:
                suggestions.push('Étudier les patterns de pause appropriés');
                suggestions.push('Pratiquer le placement stratégique des pauses');
        }

        return suggestions;
    }
}