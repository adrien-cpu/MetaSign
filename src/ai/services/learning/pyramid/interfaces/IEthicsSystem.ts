/**
 * Interface pour le système de contrôle éthique
 * Permet l'intégration avec différentes implémentations du système d'éthique
 */
export interface IEthicsSystem {
    /**
     * Valide une action selon les règles éthiques
     * 
     * @param action - Description de l'action à valider
     * @returns Résultat de la validation contenant l'approbation et la raison si refusée
     */
    validateAction(action: {
        actionType: string;
        actionDetails: unknown;
        context: Record<string, unknown>;
    }): Promise<{ approved: boolean; reason?: string }>;
}