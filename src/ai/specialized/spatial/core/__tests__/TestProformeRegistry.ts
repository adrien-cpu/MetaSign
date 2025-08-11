/**
 * Version de ProformeRegistry spécifique aux tests
 * Expose des méthodes supplémentaires pour faciliter les tests
 * 
 * @file src/ai/specialized/spatial/core/__tests__/TestProformeRegistry.ts
 */
import { ProformeRegistry } from '../ProformeRegistry';
import { Proforme } from '../../types';

/**
 * Classe de test qui étend ProformeRegistry en exposant des méthodes
 * protégées pour faciliter les tests sans compromettre l'encapsulation
 */
export class TestProformeRegistry extends ProformeRegistry {
    /**
     * Permet de définir manuellement les proformes actives pour les tests
     * @param proformes Liste des proformes à activer
     */
    public setTestProformes(proformes: Proforme[]): void {
        // Réinitialiser d'abord
        this.reset();

        // Ajouter les proformes de test
        proformes.forEach(proforme => {
            this.addProforme(proforme);
            // Accéder à la propriété privée via une méthode protégée
            this.activateProforme(proforme.id);
        });
    }

    /**
     * Retourne les IDs des proformes actives pour les tests
     * @returns Liste des IDs de proformes actives
     */
    public getTestProformeIds(): string[] {
        // Récupérer les IDs via une méthode protégée
        return Array.from(this.getActiveProformeIds());
    }

    /**
     * Simule l'adaptation au niveau de formalité pour les tests
     * @param level Niveau de formalité (0-1)
     */
    public simulateAdaptProformalityLevel(level: number): void {
        // Appeler la méthode protégée
        this.adaptProformesToFormalityLevel(level);
    }
}