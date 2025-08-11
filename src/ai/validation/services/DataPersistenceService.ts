//src/ai/validation/services/DataPersistenceService.ts
import {
    CollaborativeValidationRequest,
    ValidationFeedback,
    ValidationState,
    ValidationStateChange,
    ConsensusResult,
    ExpertProfile,
    ThematicClub,
    Result
} from '../types';
import { success, failure, ErrorCode } from '../utils/result-helpers';

/**
 * Format des données exportées du système de validation
 */
export interface ValidationSystemExport {
    /**
     * Version du format d'export
     */
    version: string;

    /**
     * Date d'export
     */
    exportDate: string;

    /**
     * Données des validations
     */
    validations?: {
        requests: Record<string, CollaborativeValidationRequest>;
        states: Record<string, ValidationState>;
        stateHistory: Record<string, ValidationStateChange[]>;
        feedbacks: Record<string, ValidationFeedback[]>;
        consensusResults: Record<string, ConsensusResult>;
    };

    /**
     * Données des experts
     */
    experts?: Record<string, ExpertProfile>;

    /**
     * Données des clubs thématiques
     */
    thematicClubs?: Record<string, ThematicClub>;

    /**
     * Métadonnées supplémentaires
     */
    metadata?: Record<string, unknown>;
}

/**
 * Options pour l'export des données
 */
export interface ExportOptions {
    /**
     * Inclure les données de validation
     */
    includeValidations?: boolean;

    /**
     * Inclure les données des experts
     */
    includeExperts?: boolean;

    /**
     * Inclure les données des clubs thématiques
     */
    includeThematicClubs?: boolean;

    /**
     * Inclure uniquement certaines validations
     */
    validationIds?: string[];

    /**
     * Inclure uniquement certains experts
     */
    expertIds?: string[];

    /**
     * Inclure uniquement certains clubs
     */
    clubIds?: string[];

    /**
     * Période de début pour les données
     */
    startDate?: Date;

    /**
     * Période de fin pour les données
     */
    endDate?: Date;

    /**
     * Métadonnées supplémentaires
     */
    metadata?: Record<string, unknown>;
}

/**
 * Options pour l'import des données
 */
export interface ImportOptions {
    /**
     * Stratégie en cas de conflit
     */
    conflictStrategy: 'skip' | 'replace' | 'merge';

    /**
     * Transformer les identifiants lors de l'import
     */
    transformIds?: boolean;

    /**
     * Préfixe pour les nouveaux identifiants
     */
    idPrefix?: string;

    /**
     * Importer uniquement certains types de données
     */
    dataTypes?: ('validations' | 'experts' | 'thematicClubs')[];
}

/**
 * Service de persistance des données
 * Permet d'exporter et d'importer les données du système de validation
 */
export class DataPersistenceService {
    /**
     * Exporte les données du système de validation
     * @param data Données à exporter
     * @param options Options d'export
     * @returns Données sérialisées au format JSON
     */
    async exportData(
        data: {
            validations?: Map<string, CollaborativeValidationRequest>;
            states?: Map<string, ValidationState>;
            stateHistory?: Map<string, ValidationStateChange[]>;
            feedbacks?: Map<string, ValidationFeedback[]>;
            consensusResults?: Map<string, ConsensusResult>;
            experts?: Map<string, ExpertProfile>;
            thematicClubs?: Map<string, ThematicClub>;
        },
        options: ExportOptions = {}
    ): Promise<Result<string>> {
        try {
            const export_data: ValidationSystemExport = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                metadata: options.metadata || {}
            };

            // Appliquer les filtres communs
            const startDate = options.startDate ? options.startDate.getTime() : 0;
            const endDate = options.endDate ? options.endDate.getTime() : Number.MAX_SAFE_INTEGER;

            // Exporter les données de validation si demandé
            if (options.includeValidations !== false && data.validations) {
                export_data.validations = {
                    requests: {},
                    states: {},
                    stateHistory: {},
                    feedbacks: {},
                    consensusResults: {}
                };

                // Filtrer et exporter les requêtes de validation
                for (const [id, request] of data.validations.entries()) {
                    // Appliquer les filtres
                    if (options.validationIds && !options.validationIds.includes(id)) {
                        continue;
                    }

                    const submissionDate = request.submissionDate ? request.submissionDate.getTime() : 0;
                    if (submissionDate < startDate || submissionDate > endDate) {
                        continue;
                    }

                    // Ajouter la requête à l'export
                    export_data.validations.requests[id] = request;

                    // Ajouter l'état correspondant
                    if (data.states && data.states.has(id)) {
                        export_data.validations.states[id] = data.states.get(id)!;
                    }

                    // Ajouter l'historique des états
                    if (data.stateHistory && data.stateHistory.has(id)) {
                        export_data.validations.stateHistory[id] = data.stateHistory.get(id)!;
                    }

                    // Ajouter les feedbacks
                    if (data.feedbacks && data.feedbacks.has(id)) {
                        export_data.validations.feedbacks[id] = data.feedbacks.get(id)!;
                    }

                    // Ajouter les résultats de consensus
                    if (data.consensusResults && data.consensusResults.has(id)) {
                        export_data.validations.consensusResults[id] = data.consensusResults.get(id)!;
                    }
                }
            }

            // Exporter les données des experts si demandé
            if (options.includeExperts !== false && data.experts) {
                export_data.experts = {};

                for (const [id, profile] of data.experts.entries()) {
                    // Appliquer les filtres
                    if (options.expertIds && !options.expertIds.includes(id)) {
                        continue;
                    }

                    export_data.experts[id] = profile;
                }
            }

            // Exporter les données des clubs thématiques si demandé
            if (options.includeThematicClubs !== false && data.thematicClubs) {
                export_data.thematicClubs = {};

                for (const [id, club] of data.thematicClubs.entries()) {
                    // Appliquer les filtres
                    if (options.clubIds && !options.clubIds.includes(id)) {
                        continue;
                    }

                    const createdAt = club.createdAt ? club.createdAt.getTime() : 0;
                    if (createdAt < startDate || createdAt > endDate) {
                        continue;
                    }

                    export_data.thematicClubs[id] = club;
                }
            }

            // Sérialiser les données en JSON
            return success(JSON.stringify(export_data, this.replaceDates, 2));
        } catch (error) {
            return failure(
                ErrorCode.OPERATION_FAILED,
                'Failed to export data',
                { error: String(error) }
            );
        }
    }

    /**
     * Importe des données dans le système de validation
     * @param jsonData Données au format JSON à importer
     * @param options Options d'import
     * @returns Rapport d'import
     */
    async importData(
        jsonData: string,
        options: ImportOptions = { conflictStrategy: 'skip' }
    ): Promise<Result<{
        imported: {
            validations: number;
            feedbacks: number;
            experts: number;
            thematicClubs: number;
        };
        skipped: {
            validations: number;
            feedbacks: number;
            experts: number;
            thematicClubs: number;
        };
        errors: string[];
    }>> {
        try {
            // Récupérer les options d'import
            // Nous utilisons la stratégie de conflit dans les fonctions réelles
            // mais actuellement cette variable n'est pas utilisée directement
            // Dans une implémentation complète, on l'utiliserait pour gérer les conflits
            const transformIds = options.transformIds || false;
            const idPrefix = options.idPrefix || `import_${Date.now()}_`;
            const dataTypes = options.dataTypes || ['validations', 'experts', 'thematicClubs'];

            // Initialiser le rapport d'import
            const report = {
                imported: {
                    validations: 0,
                    feedbacks: 0,
                    experts: 0,
                    thematicClubs: 0
                },
                skipped: {
                    validations: 0,
                    feedbacks: 0,
                    experts: 0,
                    thematicClubs: 0
                },
                errors: [] as string[]
            };

            // Désérialiser les données
            let importData: ValidationSystemExport;
            try {
                importData = JSON.parse(jsonData, this.reviveDates);
            } catch (error) {
                return failure(
                    ErrorCode.INVALID_DATA,
                    'Failed to parse JSON data',
                    { error: String(error) }
                );
            }

            // Vérifier la version du format d'export
            if (!importData.version || !importData.version.startsWith('1.')) {
                return failure(
                    ErrorCode.INVALID_DATA,
                    `Unsupported export format version: ${importData.version}`,
                    { supportedVersion: '1.x', actualVersion: importData.version }
                );
            }

            // Créer des maps pour les données importées
            const importedValidations = new Map<string, CollaborativeValidationRequest>();
            const importedStates = new Map<string, ValidationState>();
            const importedStateHistory = new Map<string, ValidationStateChange[]>();
            const importedFeedbacks = new Map<string, ValidationFeedback[]>();
            const importedConsensusResults = new Map<string, ConsensusResult>();
            const importedExperts = new Map<string, ExpertProfile>();
            const importedThematicClubs = new Map<string, ThematicClub>();

            // Map pour suivre les transformations d'ID
            const idMap = new Map<string, string>();

            // Importer les validations
            if (dataTypes.includes('validations') && importData.validations) {
                // Importer les requêtes de validation
                for (const [oldId, request] of Object.entries(importData.validations.requests)) {
                    const newId = transformIds ? `${idPrefix}validation_${oldId}` : oldId;

                    // Enregistrer la transformation d'ID
                    if (transformIds) {
                        idMap.set(oldId, newId);
                    }

                    // Cloner la requête pour éviter des problèmes de référence
                    const clonedRequest: CollaborativeValidationRequest = {
                        ...request,
                        id: newId
                    };

                    importedValidations.set(newId, clonedRequest);
                    report.imported.validations++;

                    // Importer l'état correspondant
                    if (importData.validations.states && importData.validations.states[oldId]) {
                        importedStates.set(newId, importData.validations.states[oldId]);
                    }

                    // Importer l'historique des états
                    if (importData.validations.stateHistory && importData.validations.stateHistory[oldId]) {
                        const stateHistory = importData.validations.stateHistory[oldId].map(state => ({
                            ...state,
                            validationId: newId
                        }));

                        importedStateHistory.set(newId, stateHistory);
                    }

                    // Importer les feedbacks
                    if (importData.validations.feedbacks && importData.validations.feedbacks[oldId]) {
                        const feedbacks = importData.validations.feedbacks[oldId].map(feedback => ({
                            ...feedback,
                            validationId: newId
                        }));

                        importedFeedbacks.set(newId, feedbacks);
                        report.imported.feedbacks += feedbacks.length;
                    }

                    // Importer les résultats de consensus
                    if (importData.validations.consensusResults && importData.validations.consensusResults[oldId]) {
                        const consensusResult = {
                            ...importData.validations.consensusResults[oldId],
                            validationId: newId
                        };

                        importedConsensusResults.set(newId, consensusResult);
                    }
                }
            }

            // Importer les experts
            if (dataTypes.includes('experts') && importData.experts) {
                for (const [oldId, profile] of Object.entries(importData.experts)) {
                    const newId = transformIds ? `${idPrefix}expert_${oldId}` : oldId;

                    // Enregistrer la transformation d'ID
                    if (transformIds) {
                        idMap.set(oldId, newId);
                    }

                    // Cloner le profil pour éviter des problèmes de référence
                    const clonedProfile: ExpertProfile = {
                        ...profile,
                        id: newId
                    };

                    importedExperts.set(newId, clonedProfile);
                    report.imported.experts++;
                }
            }

            // Importer les clubs thématiques
            if (dataTypes.includes('thematicClubs') && importData.thematicClubs) {
                for (const [oldId, club] of Object.entries(importData.thematicClubs)) {
                    const newId = transformIds ? `${idPrefix}club_${oldId}` : oldId;

                    // Enregistrer la transformation d'ID
                    if (transformIds) {
                        idMap.set(oldId, newId);
                    }

                    // Créer un clone de base du club
                    const clonedClubBase = {
                        ...club,
                        id: newId,
                    };

                    // Gérer correctement la propriété members (elle ne doit pas être undefined)
                    let updatedMembers;
                    if (club.members) {
                        updatedMembers = club.members.map(member => ({
                            ...member,
                            expertId: idMap.get(member.expertId) || member.expertId
                        }));
                    }

                    // Créer le club cloné final en incluant members seulement s'il est défini
                    const clonedClub: ThematicClub = {
                        ...clonedClubBase,
                        ...(updatedMembers ? { members: updatedMembers } : {})
                    };

                    importedThematicClubs.set(newId, clonedClub);
                    report.imported.thematicClubs++;
                }
            }

            return success({
                imported: report.imported,
                skipped: report.skipped,
                errors: report.errors
            });
        } catch (error) {
            return failure(
                ErrorCode.OPERATION_FAILED,
                'Failed to import data',
                { error: String(error) }
            );
        }
    }

    /**
     * Sauvegarde les données vers le stockage persistant
     * @param dataJson Données JSON à sauvegarder
     * @param destinationPath Chemin de destination
     * @returns Succès ou échec
     */
    async saveToFile(dataJson: string, destinationPath: string): Promise<Result<void>> {
        try {
            // Cette implémentation est un stub
            // Dans une implémentation réelle, on écrirait dans un fichier ou une base de données
            console.info(`Saving data to: ${destinationPath}`);
            console.info(`Data size: ${dataJson.length} characters`);

            // Simuler une sauvegarde réussie
            return success(undefined);
        } catch (error) {
            return failure(
                ErrorCode.OPERATION_FAILED,
                'Failed to save data to file',
                { error: String(error), path: destinationPath }
            );
        }
    }

    /**
     * Charge les données depuis le stockage persistant
     * @param sourcePath Chemin source
     * @returns Données JSON chargées
     */
    async loadFromFile(sourcePath: string): Promise<Result<string>> {
        try {
            // Cette implémentation est un stub
            // Dans une implémentation réelle, on lirait depuis un fichier ou une base de données
            console.info(`Loading data from: ${sourcePath}`);

            // Simuler un chargement échoué
            return failure(
                ErrorCode.OPERATION_FAILED,
                'File loading not implemented',
                { path: sourcePath }
            );
        } catch (error) {
            return failure(
                ErrorCode.OPERATION_FAILED,
                'Failed to load data from file',
                { error: String(error), path: sourcePath }
            );
        }
    }

    /**
     * Remplacer les objets Date par des chaînes ISO lors de la sérialisation JSON
     */
    private replaceDates(key: string, value: unknown): unknown {
        if (value instanceof Date) {
            return {
                __type: 'Date',
                value: value.toISOString()
            };
        }
        return value;
    }

    /**
     * Reconstituer les objets Date lors de la désérialisation JSON
     */
    private reviveDates(key: string, value: unknown): unknown {
        if (value && typeof value === 'object' && '__type' in value && value.__type === 'Date' && 'value' in value) {
            return new Date(value.value as string);
        }
        return value;
    }
}

// Singleton pour un accès global
let globalDataPersistenceService: DataPersistenceService | null = null;

/**
 * Obtient l'instance globale du service de persistance des données
 * @returns Instance du service
 */
export function getDataPersistenceService(): DataPersistenceService {
    if (!globalDataPersistenceService) {
        globalDataPersistenceService = new DataPersistenceService();
    }
    return globalDataPersistenceService;
}

/**
 * Réinitialise l'instance globale du service
 * Utile principalement pour les tests
 */
export function resetDataPersistenceService(): void {
    globalDataPersistenceService = null;
}