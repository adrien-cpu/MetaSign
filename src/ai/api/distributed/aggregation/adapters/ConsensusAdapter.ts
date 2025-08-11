/**
 * src/ai/api/distributed/aggregation/adapters/ConsensusAdapter.ts
 * 
 * Adaptateur pour convertir entre les différents formats de données de consensus
 * utilisés par les composants du système d'agrégation.
 */

import {
    NodeTrainingResult,
    ConsensusResult
} from '../../types/DistributedTypes';
import {
    NodeTrainingResult as ConsensusNodeTrainingResult,
    ConsensusInfo
} from '../../consensus/types/ConsensusTypes';

/**
 * Adaptateur pour les formats de données de consensus
 */
export class ConsensusAdapter {
    /**
     * Adapte les résultats d'entraînement au format attendu par le ConsensusManager
     * 
     * @param results - Résultats d'entraînement originaux
     * @returns Résultats adaptés pour le consensus
     */
    public adaptResultsForConsensus(results: NodeTrainingResult[]): ConsensusNodeTrainingResult[] {
        return results.map(result => {
            // Adapter le format des paramètres du modèle
            const modelParameters = {
                version: result.parameters.version,
                weights: result.parameters.weights,
                hash: result.parameters.version // Utiliser la version comme hash
            };

            // Créer une structure de métriques compatible avec le consensus
            const metrics = {
                loss: result.loss,
                accuracy: result.accuracy,
                ...(result.metrics || {})
            };

            return {
                nodeId: result.nodeId,
                taskId: `task-${result.nodeId}-${Date.now()}`, // Générer un ID de tâche
                iteration: 1, // Valeur par défaut
                modelParameters,
                metrics,
                timestamp: result.timestamp,
                config: {}, // Objet vide au lieu de undefined
                systemInfo: {
                    dataSize: result.samplesProcessed
                }
            };
        });
    }

    /**
     * Convertit les informations de consensus au format ConsensusResult attendu
     * 
     * @param consensusInfo - Informations brutes de consensus
     * @returns Résultat de consensus formaté
     */
    public convertToConsensusResult(consensusInfo: ConsensusInfo): ConsensusResult {
        // Créer un résultat avec les champs requis
        const result: ConsensusResult = {
            achieved: consensusInfo.achieved,
            confidence: consensusInfo.agreement?.confidence ?? 0.0,
            participantCount: consensusInfo.participants ?? 0,
            consensusMethod: consensusInfo.agreement?.aggregationMethod ?? 'weighted_voting'
        };

        // Ajouter des champs optionnels uniquement s'ils ont des valeurs
        if (consensusInfo.agreement?.agreementCount) {
            result.votingResults = {};
        }

        if (consensusInfo.metadata?.reason) {
            result.decisionReason = String(consensusInfo.metadata.reason);
        }

        if (Array.isArray(consensusInfo.metadata?.outliers)) {
            result.outliers = consensusInfo.metadata.outliers as string[];
        }

        return result;
    }
}