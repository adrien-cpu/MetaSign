// src/ai/systems/expressions/emotions/LSFEmotionSystem.ts
import {
    EmotionState,
    EmotionType,
    EmotionComponents,
    EmotionDynamics,
    PartialEmotionDynamics,
    EmotionTransition
} from '@ai/emotions/types/base';

/**
 * Configuration d'émotion LSF
 */
export interface LSFEmotionConfig {
    /** Intensité par défaut (0-1) */
    defaultIntensity: number;
    /** Modèles de composantes par défaut */
    defaultComponents: Partial<EmotionComponents>;
    /** Dynamique par défaut */
    defaultDynamics: PartialEmotionDynamics;
    /** Appliquer des paramètres basés sur le contexte */
    useContextualParameters: boolean;
}

/**
 * Système de gestion des émotions en LSF
 */
export class LSFEmotionSystem {
    /** Configurations par émotion */
    private configs: Map<EmotionType, LSFEmotionConfig>;
    /** Émotions activées actuellement */
    private activeEmotions: Map<string, EmotionState>;

    /**
     * Crée une nouvelle instance du système d'émotions LSF
     */
    constructor() {
        this.configs = new Map();
        this.activeEmotions = new Map();
        this.initializeDefaultConfigs();
    }

    /**
     * Initialise les configurations par défaut pour les émotions de base
     */
    private initializeDefaultConfigs(): void {
        // Configuration pour la joie
        this.configs.set(EmotionType.JOY, {
            defaultIntensity: 0.7,
            defaultComponents: {
                facial: {
                    eyebrows: 'raised',
                    eyes: 'wide',
                    mouth: 'smile',
                    intensity: 0.7
                },
                gestural: {
                    hands: 'open',
                    speed: 'normal',
                    amplitude: 'medium',
                    tension: 'relaxed',
                    intensity: 0.7
                }
            },
            defaultDynamics: {
                duration: 2000,
                peakDelay: 500,
                holdDuration: 800,
                decayTime: 700,
                transitions: [] // Tableau vide par défaut pour éviter undefined
            },
            useContextualParameters: true
        });

        // Configuration pour la tristesse
        this.configs.set(EmotionType.SADNESS, {
            defaultIntensity: 0.6,
            defaultComponents: {
                facial: {
                    eyebrows: 'lowered',
                    eyes: 'narrowed',
                    mouth: 'frown',
                    intensity: 0.6
                },
                gestural: {
                    hands: 'relaxed',
                    speed: 'slow',
                    amplitude: 'small',
                    tension: 'slight',
                    intensity: 0.5
                }
            },
            defaultDynamics: {
                duration: 3000,
                peakDelay: 1000,
                holdDuration: 1200,
                decayTime: 800,
                transitions: [] // Tableau vide par défaut pour éviter undefined
            },
            useContextualParameters: true
        });

        // Ajouter d'autres émotions de base avec leurs configurations par défaut
        // (Pour cet exemple, nous nous limitons à deux émotions)
    }

    /**
     * Crée une émotion LSF
     * @param type Type d'émotion
     * @param intensity Intensité (optionnelle, utilise la valeur par défaut si non fournie)
     * @param customComponents Composantes personnalisées (optionnelles)
     * @param customDynamics Dynamique personnalisée (optionnelle)
     * @returns État émotionnel créé
     */
    createEmotion(
        type: EmotionType,
        intensity?: number,
        customComponents?: Partial<EmotionComponents>,
        customDynamics?: PartialEmotionDynamics
    ): EmotionState {
        const config = this.getEmotionConfig(type);

        // Utiliser l'intensité fournie ou la valeur par défaut
        const finalIntensity = intensity !== undefined ? intensity : config.defaultIntensity;

        // Fusionner les composantes par défaut avec les composantes personnalisées
        const finalComponents = this.mergeComponents(config.defaultComponents, customComponents, finalIntensity);

        // Fusionner la dynamique par défaut avec la dynamique personnalisée
        const finalDynamics = this.mergeDynamics(config.defaultDynamics, customDynamics);

        // Créer l'état émotionnel
        const emotionState: EmotionState = {
            type,
            intensity: finalIntensity,
            components: finalComponents as EmotionComponents,
            dynamics: finalDynamics as EmotionDynamics
        };

        return emotionState;
    }

    /**
     * Obtient la configuration d'une émotion
     * @param type Type d'émotion
     * @returns Configuration de l'émotion
     * @throws Error si le type d'émotion n'est pas configuré
     */
    private getEmotionConfig(type: EmotionType): LSFEmotionConfig {
        const config = this.configs.get(type);
        if (!config) {
            throw new Error(`Emotion type ${type} is not configured`);
        }
        return config;
    }

    /**
     * Fusionne les composantes par défaut avec les composantes personnalisées
     * @param defaultComponents Composantes par défaut
     * @param customComponents Composantes personnalisées
     * @param intensity Intensité à appliquer
     * @returns Composantes fusionnées
     */
    private mergeComponents(
        defaultComponents: Partial<EmotionComponents>,
        customComponents?: Partial<EmotionComponents>,
        intensity = 1.0
    ): Partial<EmotionComponents> {
        if (!customComponents) {
            // Ajuster l'intensité des composantes par défaut
            return this.adjustComponentsIntensity(defaultComponents, intensity);
        }

        // Fusionner récursivement les composantes
        const result: Partial<EmotionComponents> = { ...defaultComponents };

        // Fusionner les composantes faciales
        if (customComponents.facial && defaultComponents.facial) {
            result.facial = {
                ...defaultComponents.facial,
                ...customComponents.facial
            };
        }

        // Fusionner les composantes gestuelles
        if (customComponents.gestural && defaultComponents.gestural) {
            result.gestural = {
                ...defaultComponents.gestural,
                ...customComponents.gestural
            };
        }

        // Fusionner les composantes additionnelles
        if (customComponents.additional) {
            result.additional = {
                ...defaultComponents.additional,
                ...customComponents.additional
            };
        }

        // Ajuster l'intensité des composantes fusionnées
        return this.adjustComponentsIntensity(result, intensity);
    }

    /**
     * Ajuste l'intensité des composantes
     * @param components Composantes à ajuster
     * @param intensity Facteur d'intensité
     * @returns Composantes ajustées
     */
    private adjustComponentsIntensity(
        components: Partial<EmotionComponents>,
        intensity: number
    ): Partial<EmotionComponents> {
        const result: Partial<EmotionComponents> = { ...components };

        if (result.facial) {
            result.facial = {
                ...result.facial,
                intensity: result.facial.intensity * intensity
            };
        }

        if (result.gestural) {
            result.gestural = {
                ...result.gestural,
                intensity: result.gestural.intensity * intensity
            };
        }

        return result;
    }

    /**
     * Fusionne la dynamique par défaut avec la dynamique personnalisée
     * @param defaultDynamics Dynamique par défaut
     * @param customDynamics Dynamique personnalisée
     * @returns Dynamique fusionnée
     */
    private mergeDynamics(
        defaultDynamics: PartialEmotionDynamics,
        customDynamics?: PartialEmotionDynamics
    ): PartialEmotionDynamics {
        if (!customDynamics) {
            return defaultDynamics;
        }

        // Créer un nouvel objet pour le résultat sans inclure les propriétés problématiques
        const { transitions: defaultTransitions, ...restDefaultDynamics } = defaultDynamics;
        const { transitions: customTransitions, ...restCustomDynamics } = customDynamics;

        // Fusionner toutes les propriétés sauf transitions
        const result: PartialEmotionDynamics = {
            ...restDefaultDynamics,
            ...restCustomDynamics
        };

        // Traiter les transitions séparément avec vérification de nullité stricte
        // On utilise des tableaux vides par défaut pour éviter undefined
        const finalTransitions: EmotionTransition[] = [];

        // Utiliser les transitions personnalisées si définies, sinon les transitions par défaut
        if (customTransitions && customTransitions.length > 0) {
            result.transitions = customTransitions;
        } else if (defaultTransitions && defaultTransitions.length > 0) {
            result.transitions = defaultTransitions;
        } else {
            // S'assurer qu'un tableau vide est toujours présent
            result.transitions = finalTransitions;
        }

        return result;
    }

    /**
     * Active une émotion dans le système
     * @param emotionState État d'émotion à activer
     * @param id Identifiant unique pour l'émotion (généré automatiquement si non fourni)
     * @returns Identifiant de l'émotion activée
     */
    activateEmotion(emotionState: EmotionState, id?: string): string {
        const emotionId = id || `emotion_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        this.activeEmotions.set(emotionId, emotionState);
        return emotionId;
    }

    /**
     * Obtient une émotion active par son identifiant
     * @param id Identifiant de l'émotion
     * @returns État de l'émotion ou undefined si non trouvée
     */
    getActiveEmotion(id: string): EmotionState | undefined {
        return this.activeEmotions.get(id);
    }

    /**
     * Désactive une émotion
     * @param id Identifiant de l'émotion à désactiver
     * @returns true si l'émotion a été désactivée, false sinon
     */
    deactivateEmotion(id: string): boolean {
        return this.activeEmotions.delete(id);
    }

    /**
     * Obtient toutes les émotions actives
     * @returns Map des émotions actives
     */
    getAllActiveEmotions(): Map<string, EmotionState> {
        return new Map(this.activeEmotions);
    }

    /**
     * Vérifie si l'intensité d'une émotion est appropriée dans son contexte
     * @param emotion État de l'émotion à vérifier
     * @returns Score d'adéquation (0-1)
     */
    evaluateIntensityAppropriateness(emotion: EmotionState): number {
        // Implémentation simplifiée pour l'exemple
        if (!emotion.context) {
            return 0.7; // Score par défaut sans contexte
        }

        // Vérifier si l'intensité correspond à la désirabilité et au contrôle
        let score = 0.8; // Score de base

        if (emotion.context.desirability !== undefined) {
            // Ajuster le score en fonction de la désirabilité
            const desirabilityFactor = Math.abs(emotion.context.desirability);
            if (Math.abs(emotion.intensity - desirabilityFactor) > 0.3) {
                score -= 0.2; // Pénalité pour intensité inappropriée
            }
        }

        if (emotion.context.control !== undefined) {
            // Ajuster le score en fonction du contrôle
            const controlDifference = Math.abs(emotion.intensity - emotion.context.control);
            if (controlDifference > 0.4) {
                score -= 0.2; // Pénalité pour intensité inappropriée
            }
        }

        return Math.max(0, Math.min(1, score));
    }

    /**
     * Vérifie la cohérence de l'intensité émotionnelle
     * @param emotion État de l'émotion à vérifier
     * @returns Score de cohérence (0-1)
     */
    checkIntensityConsistency(emotion: EmotionState): number {
        // Vérifier si l'intensité est cohérente avec les composantes
        const facialIntensity = emotion.components.facial.intensity;
        const gesturalIntensity = emotion.components.gestural.intensity;

        // Calculer la différence entre l'intensité globale et les intensités des composantes
        const facialDiff = Math.abs(emotion.intensity - facialIntensity);
        const gesturalDiff = Math.abs(emotion.intensity - gesturalIntensity);

        // Calculer le score de cohérence (1 = parfaitement cohérent)
        const consistencyScore = 1 - ((facialDiff + gesturalDiff) / 2);

        return Math.max(0, Math.min(1, consistencyScore));
    }
}