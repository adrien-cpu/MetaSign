/**
 * @file src/ai/services/learning/human/coda/codavirtuel/scenarios/exercises/utils/ConceptGenerator.ts
 * @description Générateur de concepts pour les exercices
 * @module services/learning/human/coda/codavirtuel/scenarios/exercises/utils
 * @author MetaSign
 * @version 1.0.0
 * @since 2024
 */

import { Logger } from '@/ai/utils/Logger';

/**
 * Classe pour générer des concepts à tester dans les exercices
 */
export class ConceptGenerator {
    private readonly logger: Logger;

    /**
     * Initialise le générateur de concepts
     */
    constructor() {
        this.logger = new Logger('ConceptGenerator');
    }

    /**
     * Génère une liste de concepts à tester
     * @param theme Thème de l'exercice
     * @param masteredConcepts Concepts déjà maîtrisés par l'apprenant
     * @param count Nombre de concepts à générer
     * @returns Liste de concepts à tester
     */
    public generateConceptsToTest(theme: string, masteredConcepts: string[], count: number): string[] {
        this.logger.debug(`Génération de ${count} concepts sur le thème "${theme}"`);

        // Concepts disponibles par thème (à remplacer par une source de données réelle)
        const availableConcepts: Record<string, string[]> = {
            'salutations': ['bonjour', 'au revoir', 'comment ça va', 'enchanté', 'à bientôt'],
            'famille': ['père', 'mère', 'frère', 'sœur', 'enfant', 'grand-parent'],
            'nourriture': ['manger', 'boire', 'restaurant', 'cuisine', 'repas', 'goûter'],
            'temps': ['heure', 'jour', 'semaine', 'mois', 'année', 'saison'],
            'actions': ['aller', 'venir', 'donner', 'prendre', 'regarder', 'parler'],
            'émotions': ['content', 'triste', 'fâché', 'surpris', 'inquiet', 'calme'],
            'default': ['concept1', 'concept2', 'concept3', 'concept4', 'concept5']
        };

        // Récupérer les concepts pour le thème donné ou utiliser le thème par défaut
        const themeConcepts = availableConcepts[theme] || availableConcepts['default'];

        // Filtrer les concepts déjà maîtrisés
        const availableToTest = themeConcepts.filter(concept => !masteredConcepts.includes(concept));

        if (availableToTest.length === 0) {
            this.logger.warn(`Aucun concept disponible pour le thème "${theme}" après filtrage. Utilisation de concepts génériques.`);
            return Array.from({ length: count }, (_, i) => `concept_générique_${i + 1}`);
        }

        // Sélectionner aléatoirement le nombre demandé de concepts
        const result: string[] = [];
        const maxConcepts = Math.min(count, availableToTest.length);

        // Mélanger le tableau pour une sélection aléatoire
        const shuffled = [...availableToTest].sort(() => 0.5 - Math.random());

        // Prendre les premiers éléments après mélange
        for (let i = 0; i < maxConcepts; i++) {
            result.push(shuffled[i]);
        }

        // Si on n'a pas assez de concepts, compléter avec des répétitions
        if (result.length < count) {
            for (let i = result.length; i < count; i++) {
                const randomIndex = Math.floor(Math.random() * availableToTest.length);
                result.push(availableToTest[randomIndex]);
            }
        }

        this.logger.debug(`Concepts générés: ${result.join(', ')}`);
        return result;
    }
}