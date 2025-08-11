// src/ai/systems/expressions/cultural/__tests__/utils/validators/ScenarioValidator.ts

import {
    ComplexScenario,
    EmergencyChallenge,
    Recommendation,
    ScenarioResponse,
    ValidationAspect,
    ValidationResult,
    ValidationScore
} from '../types/scenario-types';

import {
    calculateContextualRelevance,
    calculateEmergencyContextRelevance,
    categorizeAction,
    categorizeAdaptationMechanism,
    extractCore,
    isActionAddressingEmergencyChallenge,
    isRelatedToCultural
} from '../helpers/ScenarioUtils';

/**
 * Validateur de scénarios pour évaluer les réponses
 */
export class ScenarioValidator {
    /**
     * Valide la réponse à un scénario
     * @param scenario Scénario complexe (non utilisé actuellement)
     * @param response Réponse au scénario
     * @returns Résultat de la validation
     */
    async validateScenarioResponse(
        _unused_scenario: ComplexScenario,
        response: ScenarioResponse
    ): Promise<ValidationResult> {
        const culturalValidation = await this.validateCulturalAspects(response);
        const practicalValidation = await this.validatePracticalEffectiveness(response);
        const balanceValidation = await this.validateBalancedApproach(response);

        return {
            overall: this.calculateOverallValidation([
                culturalValidation,
                practicalValidation,
                balanceValidation
            ]),
            details: {
                cultural: culturalValidation,
                practical: practicalValidation,
                balance: balanceValidation
            },
            recommendations: this.generateImprovementRecommendations([
                culturalValidation,
                practicalValidation,
                balanceValidation
            ])
        };
    }

    /**
     * Valide les aspects culturels d'une réponse
     * @param response Réponse au scénario
     * @returns Résultat de validation des aspects culturels
     */
    private async validateCulturalAspects(
        response: ScenarioResponse
    ): Promise<ValidationAspect> {
        // Initialiser les données d'évaluation
        let score = 0;
        const strengths: string[] = [];
        const weaknesses: string[] = [];

        // Pour les besoins de ce test, nous utilisons des placeholders
        // au lieu de vérifier les éléments culturels qui ne sont plus disponibles

        // Vérifier la préservation des éléments culturels basée sur les actions
        if (response.actionsTaken.cultural.some((action: string) => action.includes('respect') || action.includes('tradition'))) {
            score += 1;
            strengths.push("Préservation réussie: Respect des structures culturelles");
        } else {
            weaknesses.push("Élément culturel essentiel négligé: Respect des structures traditionnelles");
        }

        if (response.actionsTaken.cultural.some((action: string) => action.includes('communication') || action.includes('adapter'))) {
            score += 1;
            strengths.push("Préservation réussie: Communication adaptée aux normes");
        } else {
            weaknesses.push("Élément culturel essentiel négligé: Communication adaptée");
        }

        if (response.actionsTaken.cultural.some((action: string) => action.includes('sensibilité') || action.includes('considération'))) {
            score += 1;
            strengths.push("Préservation réussie: Considération des sensibilités culturelles");
        } else {
            weaknesses.push("Élément culturel essentiel négligé: Sensibilités culturelles");
        }

        // Vérifier les considérations culturelles secondaires
        if (response.actionsTaken.cultural.some((action: string) => action.includes('adresse') || action.includes('titre'))) {
            score += 0.5;
            strengths.push("Bonne considération: Formes d'adresse traditionnelles");
        }

        if (response.actionsTaken.cultural.some((action: string) => action.includes('espace') || action.includes('disposition'))) {
            score += 0.5;
            strengths.push("Bonne considération: Disposition spatiale culturelle");
        }

        if (response.actionsTaken.cultural.some((action: string) => action.includes('séquence') || action.includes('rituel'))) {
            score += 0.5;
            strengths.push("Bonne considération: Séquences et rituels de communication");
        }

        // Normaliser le score sur 10
        score = Math.min(10, score);

        return {
            score,
            strengths,
            weaknesses,
            contextualRelevance: calculateContextualRelevance(response.actionsTaken.cultural)
        };
    }

    /**
     * Valide l'efficacité pratique d'une réponse
     * @param response Réponse au scénario
     * @returns Résultat de validation de l'efficacité pratique
     */
    private async validatePracticalEffectiveness(
        response: ScenarioResponse
    ): Promise<ValidationAspect> {
        // Initialiser les données d'évaluation
        let score = 0;
        const strengths: string[] = [];
        const weaknesses: string[] = [];

        // Vérifier les réponses aux défis d'urgence typiques
        const emergencyChallenges: EmergencyChallenge[] = [
            { description: "Time Pressure", impact: ["EFFICIENCY", "COORDINATION"] },
            { description: "Multi Group Coordination", impact: ["COORDINATION", "COMMUNICATION"] },
            { description: "Clarity Maintenance", impact: ["COMMUNICATION", "TRUST"] }
        ];

        emergencyChallenges.forEach((challenge: EmergencyChallenge) => {
            const isAddressed = response.actionsTaken.emergency.some(
                (action: string) => action.includes(challenge.description) ||
                    isActionAddressingEmergencyChallenge(action, challenge)
            );

            if (isAddressed) {
                score += 1.5;
                strengths.push(`Défi d'urgence bien géré: ${challenge.description}`);
            } else {
                weaknesses.push(`Défi d'urgence non adressé: ${challenge.description}`);
            }
        });

        // Évaluer l'efficacité des mécanismes d'adaptation
        const adaptationScore = this.evaluateAdaptationMechanisms(
            response.adaptationMechanisms,
            emergencyChallenges
        );

        score += adaptationScore.value;
        strengths.push(...adaptationScore.strengths);
        weaknesses.push(...adaptationScore.weaknesses);

        // Normaliser le score sur 10
        score = Math.min(10, score);

        return {
            score,
            strengths,
            weaknesses,
            contextualRelevance: calculateEmergencyContextRelevance(response.actionsTaken.emergency)
        };
    }

    /**
     * Évalue les mécanismes d'adaptation
     * @param mechanisms Mécanismes d'adaptation à évaluer
     * @param challenges Défis à adresser
     * @returns Score et feedback d'évaluation
     */
    private evaluateAdaptationMechanisms(
        mechanisms: string[],
        challenges: EmergencyChallenge[]
    ): { value: number; strengths: string[]; weaknesses: string[] } {
        let value = 0;
        const strengths: string[] = [];
        const weaknesses: string[] = [];

        // Les défis critiques nécessitent plus d'attention
        // Pour cet exemple, on considère que tous les défis sont critiques
        const criticalChallengesCount = challenges.length;

        if (mechanisms.length >= criticalChallengesCount) {
            value += 2;
            strengths.push("Nombre suffisant de mécanismes d'adaptation");
        } else {
            weaknesses.push("Mécanismes d'adaptation insuffisants pour les défis critiques");
        }

        // Vérifier la diversité des mécanismes
        const adaptationTypes = new Set(mechanisms.map(m => categorizeAdaptationMechanism(m)));
        if (adaptationTypes.size >= 3) {
            value += 2;
            strengths.push("Diversité de mécanismes d'adaptation");
        }

        return { value, strengths, weaknesses };
    }

    /**
     * Valide l'équilibre de l'approche entre aspects culturels et pratiques
     * @param response Réponse au scénario
     * @returns Résultat de validation de l'équilibre
     */
    private async validateBalancedApproach(
        response: ScenarioResponse
    ): Promise<ValidationAspect> {
        let score = 0;
        const strengths: string[] = [];
        const weaknesses: string[] = [];

        // Vérifier le ratio entre actions culturelles et d'urgence
        const culturalCount = response.actionsTaken.cultural.length;
        const emergencyCount = response.actionsTaken.emergency.length;
        const balancingCount = response.actionsTaken.balancing.length;

        // Un bon équilibre dépend du type de scénario
        // Sans accès au scénario, on utilise une valeur par défaut
        const idealRatio = 1.0;
        const actualRatio = culturalCount / Math.max(1, emergencyCount);

        // Évaluer l'écart par rapport à l'idéal
        const ratioDifference = Math.abs(actualRatio - idealRatio);

        if (ratioDifference < 0.3) {
            score += 3;
            strengths.push("Excellent équilibre entre considérations culturelles et d'urgence");
        } else if (ratioDifference < 0.7) {
            score += 2;
            strengths.push("Bon équilibre entre considérations culturelles et d'urgence");
        } else if (ratioDifference < 1.0) {
            score += 1;
            weaknesses.push("Équilibre perfectible entre considérations culturelles et d'urgence");
        } else {
            weaknesses.push("Déséquilibre marqué entre considérations culturelles et d'urgence");
        }

        // Évaluer les actions de mise en équilibre spécifiques
        if (balancingCount > 0) {
            score += Math.min(3, balancingCount);
            strengths.push(`${balancingCount} actions spécifiques d'équilibrage identifiées`);
        } else {
            weaknesses.push("Aucune action spécifique d'équilibrage identifiée");
        }

        // Évaluer la prise en compte des alternatives
        if (response.alternativesConsidered.length > 2) {
            score += 2;
            strengths.push("Bonne considération des approches alternatives");
        } else if (response.alternativesConsidered.length > 0) {
            score += 1;
            strengths.push("Certaines alternatives considérées");
        } else {
            weaknesses.push("Peu ou pas d'alternatives considérées");
        }

        // Vérifier l'application des limites d'adaptation
        // Sans accès au scénario, on utilise une logique simplifiée
        const respectsLimits = this.checkSimplifiedAdaptationLimits(response);

        if (respectsLimits.respected) {
            score += 2;
            strengths.push("Respect des limites d'adaptation culturelle");
        } else {
            weaknesses.push(`Limites d'adaptation non respectées: ${respectsLimits.violations.join(', ')}`);
        }

        // Normaliser le score sur 10
        score = Math.min(10, score);

        return {
            score,
            strengths,
            weaknesses,
            contextualRelevance: this.calculateBalanceRelevance(response)
        };
    }

    /**
     * Vérifie le respect des limites d'adaptation culturelle (version simplifiée)
     * @param response Réponse au scénario
     * @returns Résultat de la vérification
     */
    private checkSimplifiedAdaptationLimits(
        response: ScenarioResponse
    ): { respected: boolean; violations: string[] } {
        const violations: string[] = [];
        const allActions = [
            ...response.actionsTaken.cultural,
            ...response.actionsTaken.emergency,
            ...response.actionsTaken.balancing
        ];

        // Vérifier les termes problématiques typiques
        const problematicTerms = [
            'irrespect', 'mépris', 'ignorer', 'humiliation',
            'détruire', 'négliger', 'abandon', 'imposer', 'forcer'
        ];

        problematicTerms.forEach(term => {
            if (allActions.some(action => action.toLowerCase().includes(term))) {
                violations.push(`Respect de la limite: éviter les approches de type "${term}"`);
            }
        });

        return {
            respected: violations.length === 0,
            violations
        };
    }

    /**
     * Calcule la pertinence contextuelle de l'équilibre
     * @param response Réponse au scénario
     * @returns Score de pertinence contextuelle
     */
    private calculateBalanceRelevance(
        response: ScenarioResponse
    ): number {
        // Facteurs contribuant à la pertinence
        let relevance = 5; // Base moyenne

        // Adaptation à la diversité des actions
        const uniqueActionTypes = new Set([
            ...response.actionsTaken.cultural.map(a => categorizeAction(a, 'cultural')),
            ...response.actionsTaken.emergency.map(a => categorizeAction(a, 'emergency')),
            ...response.actionsTaken.balancing.map(a => categorizeAction(a, 'balancing'))
        ]).size;

        relevance += Math.min(2, uniqueActionTypes / 2);

        // Normaliser sur 10
        return Math.min(10, relevance);
    }

    /**
     * Calcule le score global de validation
     * @param validations Aspects de validation individuels
     * @returns Score global
     */
    private calculateOverallValidation(validations: ValidationAspect[]): ValidationScore {
        // Calculer la moyenne des scores
        const overallScore = validations.reduce(
            (sum, validation) => sum + validation.score,
            0
        ) / validations.length;

        // Extraire les scores spécifiques
        const culturalScore = validations[0].score;
        const practicalScore = validations[1].score;
        const balanceScore = validations[2].score;

        // Calculer le score d'adaptabilité basé sur l'équilibre et les forces
        const adaptabilityScore = (
            balanceScore * 0.6 +
            (culturalScore + practicalScore) * 0.2
        );

        return {
            overall: Math.round(overallScore * 10) / 10,
            culturalPreservation: Math.round(culturalScore * 10) / 10,
            practicalEffectiveness: Math.round(practicalScore * 10) / 10,
            balancedApproach: Math.round(balanceScore * 10) / 10,
            adaptability: Math.round(adaptabilityScore * 10) / 10
        };
    }

    /**
     * Génère des recommandations d'amélioration
     * @param validations Aspects de validation
     * @returns Liste de recommandations
     */
    private generateImprovementRecommendations(
        validations: ValidationAspect[]
    ): Recommendation[] {
        const recommendations: Recommendation[] = [];
        const [cultural, practical, balance] = validations;

        // Générer des recommandations culturelles
        if (cultural.score < 7) {
            recommendations.push({
                area: 'CULTURAL',
                description: "Améliorer la prise en compte des aspects culturels",
                priority: cultural.score < 5 ? 'HIGH' : 'MEDIUM',
                implementationSuggestions: this.generateCulturalSuggestions(cultural)
            });
        }

        // Générer des recommandations pratiques
        if (practical.score < 7) {
            recommendations.push({
                area: 'PRACTICAL',
                description: "Renforcer l'efficacité pratique de la réponse d'urgence",
                priority: practical.score < 5 ? 'HIGH' : 'MEDIUM',
                implementationSuggestions: this.generatePracticalSuggestions(practical)
            });
        }

        // Générer des recommandations d'équilibre
        if (balance.score < 7) {
            recommendations.push({
                area: 'BALANCE',
                description: "Améliorer l'équilibre entre respect culturel et efficacité pratique",
                priority: balance.score < 5 ? 'HIGH' : 'MEDIUM',
                implementationSuggestions: this.generateBalanceSuggestions(balance)
            });
        }

        // Recommandation générale si peu de recommandations spécifiques
        if (recommendations.length < 2 && (cultural.score + practical.score + balance.score) / 3 < 8) {
            recommendations.push({
                area: 'GENERAL',
                description: "Approfondir la préparation aux scénarios complexes",
                priority: 'MEDIUM',
                implementationSuggestions: [
                    "Développer une bibliothèque de cas culturels et d'urgence",
                    "Mettre en place des exercices de simulation réguliers",
                    "Constituer une équipe d'expertise culturelle consultable rapidement"
                ]
            });
        }

        return recommendations;
    }

    /**
     * Génère des suggestions d'amélioration culturelles
     * @param validation Validation culturelle
     * @returns Liste de suggestions
     */
    private generateCulturalSuggestions(
        validation: ValidationAspect
    ): string[] {
        const suggestions: string[] = [];

        // Suggestions basées sur les faiblesses
        validation.weaknesses.forEach(weakness => {
            if (weakness.includes('négligé')) {
                suggestions.push(
                    `Intégrer explicitement les éléments essentiels comme "${extractCore(weakness)}"`
                );
            }
        });

        // Suggestions générales si peu de suggestions spécifiques
        if (suggestions.length < 2) {
            suggestions.push(
                "Consulter des experts culturels locaux pour valider l'approche",
                "Intégrer des éléments visuels et gestuels culturellement adaptés",
                "Développer un module de formation sur les sensibilités culturelles spécifiques"
            );
        }

        return suggestions.slice(0, 4); // Limiter à 4 suggestions
    }

    /**
     * Génère des suggestions d'amélioration pratiques
     * @param validation Validation pratique
     * @returns Liste de suggestions
     */
    private generatePracticalSuggestions(
        validation: ValidationAspect
    ): string[] {
        const suggestions: string[] = [];

        // Suggestions basées sur les faiblesses
        validation.weaknesses.forEach(weakness => {
            if (weakness.includes('non adressé')) {
                suggestions.push(
                    `Développer une réponse spécifique au défi "${extractCore(weakness)}"`
                );
            }
        });

        // Suggestions générales si peu de suggestions spécifiques
        if (suggestions.length < 2) {
            suggestions.push(
                "Renforcer les mécanismes de coordination entre groupes",
                "Améliorer les protocoles de communication d'urgence",
                "Mettre en place des exercices de simulation avec contraintes réelles"
            );
        }

        return suggestions.slice(0, 4); // Limiter à 4 suggestions
    }

    /**
     * Génère des suggestions d'amélioration d'équilibre
     * @param validation Validation d'équilibre
     * @returns Liste de suggestions
     */
    private generateBalanceSuggestions(
        validation: ValidationAspect
    ): string[] {
        const suggestions: string[] = [];

        // Suggestions basées sur les faiblesses
        validation.weaknesses.forEach(weakness => {
            if (weakness.includes('Déséquilibre')) {
                suggestions.push(
                    "Développer une matrice de décision priorisant les aspects culturels et pratiques selon la gravité"
                );
            }
            if (weakness.includes('alternatives')) {
                suggestions.push(
                    "Intégrer une phase d'exploration d'alternatives durant la planification"
                );
            }
        });

        // Suggestions générales
        suggestions.push(
            "Créer des paires culture-urgence pour équilibrer chaque décision",
            "Développer un cadre d'évaluation rapide pour les compromis culturels-pratiques"
        );

        return suggestions.slice(0, 4); // Limiter à 4 suggestions
    }
}