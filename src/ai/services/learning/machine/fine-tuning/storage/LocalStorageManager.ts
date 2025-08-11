// src/ai/learning/fine-tuning/storage/LocalStorageManager.ts

import * as fs from 'fs/promises';
import * as path from 'path';
import { TrainingDataset, ValidationMetrics } from '../types';
import { Logger } from '@ai/utils/Logger';
import { compress, decompress } from '../utils/compression';

/**
 * Métadonnées d'un modèle sauvegardé
 */
interface ModelMetadata {
    /** Identifiant du modèle */
    id: string;
    /** Date de création */
    createdAt: string;
    /** Taille du modèle en bytes */
    sizeBytes: number;
    /** Format de compression utilisé */
    compressionFormat: string;
    /** Métriques de performance */
    metrics: ValidationMetrics;
    /** Informations sur le dataset utilisé */
    dataset: {
        /** Identifiant du dataset */
        id: string;
        /** Nombre d'échantillons */
        sampleCount: number;
    };
    /** Options utilisées pour l'entraînement */
    trainingOptions: Record<string, unknown>;
    /** Tags pour catégorisation */
    tags?: string[];
    /** Commentaires */
    notes?: string;
    /** Version du schéma de modèle */
    schemaVersion: string;
}

/**
 * Résultat de vérification de l'espace disponible
 */
interface StorageCheckResult {
    /** Capacité totale en MB */
    total: number;
    /** Espace disponible en MB */
    available: number;
    /** Espace requis estimé en MB */
    required: number;
    /** Espace suffisant pour l'opération */
    sufficient: boolean;
}

/**
 * Gestionnaire de stockage local pour les modèles et datasets
 */
export class LocalStorageManager {
    private readonly logger = new Logger('LocalStorageManager');
    private readonly modelsDir: string;
    private readonly datasetsDir: string;
    private readonly tempDir: string;
    private readonly metadataDir: string;

    /**
     * Constructeur
     * @param basePath Chemin de base pour le stockage
     */
    constructor(private readonly basePath: string) {
        // Créer les chemins pour les différents types de données
        this.modelsDir = path.join(basePath, 'models');
        this.datasetsDir = path.join(basePath, 'datasets');
        this.tempDir = path.join(basePath, 'temp');
        this.metadataDir = path.join(basePath, 'metadata');

        // Initialiser les répertoires
        this.initializeDirectories().catch(err => {
            this.logger.error('Failed to initialize storage directories:', err);
        });
    }

    /**
     * Initialise les répertoires de stockage
     */
    private async initializeDirectories(): Promise<void> {
        try {
            // Créer les répertoires s'ils n'existent pas
            await fs.mkdir(this.basePath, { recursive: true });
            await fs.mkdir(this.modelsDir, { recursive: true });
            await fs.mkdir(this.datasetsDir, { recursive: true });
            await fs.mkdir(this.tempDir, { recursive: true });
            await fs.mkdir(this.metadataDir, { recursive: true });

            this.logger.info('Storage directories initialized at:', this.basePath);
        } catch (error) {
            this.logger.error('Error initializing directories:', error);
            throw error;
        }
    }

    /**
     * Vérifie l'espace de stockage disponible
     */
    public async checkAvailableStorage(): Promise<StorageCheckResult> {
        try {
            // Obtenir les statistiques du système de fichiers
            const stats = await fs.stat(this.basePath);

            // Pour Windows/macOS/Linux, nous devons utiliser une approche différente
            // Cette implémentation est simplifiée - dans un vrai système,
            // il faudrait utiliser diskusage ou une autre bibliothèque

            // Estimer l'espace disponible (simulé ici)
            const total = 1024 * 100; // 100 GB simulés
            const available = 1024 * 50; // 50 GB disponibles simulés
            const required = 1024; // 1 GB requis simulé

            return {
                total,
                available,
                required,
                sufficient: available > required
            };
        } catch (error) {
            this.logger.error('Error checking available storage:', error);
            throw error;
        }
    }

    /**
     * Sauvegarde un dataset
     * @param dataset Dataset à sauvegarder
     */
    public async saveDataset(dataset: TrainingDataset): Promise<void> {
        try {
            // Chemin du fichier
            const datasetPath = path.join(this.datasetsDir, `${dataset.id}.json`);

            // Sauvegarde atomique en utilisant un fichier temporaire
            const tempPath = path.join(this.tempDir, `${dataset.id}_${Date.now()}.tmp`);

            // Sérialiser le dataset
            await fs.writeFile(tempPath, JSON.stringify(dataset, null, 2));

            // Renommer pour l'atomicité
            await fs.rename(tempPath, datasetPath);

            this.logger.info(`Dataset saved: ${dataset.id}`);
        } catch (error) {
            this.logger.error(`Error saving dataset ${dataset.id}:`, error);
            throw error;
        }
    }

    /**
     * Charge un dataset depuis le stockage
     * @param datasetId Identifiant du dataset à charger
     */
    public async loadDataset(datasetId: string): Promise<TrainingDataset> {
        try {
            // Chemin du fichier
            const datasetPath = path.join(this.datasetsDir, `${datasetId}.json`);

            // Lire le fichier
            const data = await fs.readFile(datasetPath, 'utf8');

            // Parser le JSON
            return JSON.parse(data) as TrainingDataset;
        } catch (error) {
            this.logger.error(`Error loading dataset ${datasetId}:`, error);
            throw error;
        }
    }

    /**
     * Sauvegarde un modèle fine-tuné
     * @param modelId Identifiant du modèle
     * @param modelData Données binaires du modèle
     * @param metadata Métadonnées associées
     */
    public async saveModel(
        modelId: string,
        modelData: ArrayBuffer,
        metadata: Record<string, unknown>
    ): Promise<void> {
        try {
            // Compresser les données du modèle
            const compressionFormat = 'zstd';
            const compressedData = await compress(modelData, compressionFormat);

            // Chemin des fichiers
            const modelPath = path.join(this.modelsDir, `${modelId}.bin`);
            const metadataPath = path.join(this.metadataDir, `${modelId}.json`);

            // Fichiers temporaires pour l'atomicité
            const tempModelPath = path.join(this.tempDir, `${modelId}_${Date.now()}.bin.tmp`);
            const tempMetadataPath = path.join(this.tempDir, `${modelId}_${Date.now()}.json.tmp`);

            // Préparer les métadonnées complètes
            const fullMetadata: ModelMetadata = {
                id: modelId,
                createdAt: new Date().toISOString(),
                sizeBytes: modelData.byteLength,
                compressionFormat,
                metrics: metadata.metrics as ValidationMetrics,
                dataset: metadata.dataset as { id: string; sampleCount: number },
                trainingOptions: metadata.options || {},
                schemaVersion: '1.0.0'
            };

            // Écrire les fichiers temporaires
            await fs.writeFile(tempModelPath, Buffer.from(compressedData));
            await fs.writeFile(tempMetadataPath, JSON.stringify(fullMetadata, null, 2));

            // Renommer pour l'atomicité
            await fs.rename(tempModelPath, modelPath);
            await fs.rename(tempMetadataPath, metadataPath);

            this.logger.info(`Model saved: ${modelId} (${modelData.byteLength} bytes, compressed with ${compressionFormat})`);
        } catch (error) {
            this.logger.error(`Error saving model ${modelId}:`, error);
            throw error;
        }
    }

    /**
     * Charge un modèle depuis le stockage
     * @param modelId Identifiant du modèle à charger
     */
    public async loadModel(modelId: string): Promise<ArrayBuffer> {
        try {
            // Vérifier si le modèle existe
            const exists = await this.checkModelExists(modelId);

            if (!exists) {
                throw new Error(`Model ${modelId} not found`);
            }

            // Charger les métadonnées pour obtenir le format de compression
            const metadata = await this.loadModelMetadata(modelId);

            // Chemin du fichier modèle
            const modelPath = path.join(this.modelsDir, `${modelId}.bin`);

            // Lire les données compressées
            const compressedData = await fs.readFile(modelPath);

            // Décompresser les données
            return await decompress(compressedData.buffer, metadata.compressionFormat);
        } catch (error) {
            this.logger.error(`Error loading model ${modelId}:`, error);
            throw error;
        }
    }

    /**
     * Vérifie si un modèle existe
     * @param modelId Identifiant du modèle
     */
    public async checkModelExists(modelId: string): Promise<boolean> {
        try {
            const modelPath = path.join(this.modelsDir, `${modelId}.bin`);
            await fs.access(modelPath);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Charge les métadonnées d'un modèle
     * @param modelId Identifiant du modèle
     */
    public async loadModelMetadata(modelId: string): Promise<ModelMetadata> {
        try {
            const metadataPath = path.join(this.metadataDir, `${modelId}.json`);
            const data = await fs.readFile(metadataPath, 'utf8');
            return JSON.parse(data) as ModelMetadata;
        } catch (error) {
            this.logger.error(`Error loading metadata for model ${modelId}:`, error);
            throw error;
        }
    }

    /**
     * Liste tous les modèles disponibles
     */
    public async listModels(): Promise<Array<{
        id: string;
        createdAt: string;
        metrics: ValidationMetrics;
        optimized: boolean;
        size: number;
    }>> {
        try {
            // Lire le contenu du répertoire des métadonnées
            const files = await fs.readdir(this.metadataDir);

            // Filtrer uniquement les fichiers JSON
            const metadataFiles = files.filter(file => file.endsWith('.json'));

            // Charger les métadonnées pour chaque modèle
            const models = await Promise.all(
                metadataFiles.map(async (file) => {
                    const modelId = path.basename(file, '.json');
                    const metadata = await this.loadModelMetadata(modelId);

                    return {
                        id: metadata.id,
                        createdAt: metadata.createdAt,
                        metrics: metadata.metrics,
                        optimized: metadata.trainingOptions.applyPruning === true ||
                            metadata.trainingOptions.applyQuantization === true,
                        size: Math.round(metadata.sizeBytes / 1024 / 1024) // Taille en MB
                    };
                })
            );

            // Trier par date de création (plus récent d'abord)
            return models.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        } catch (error) {
            this.logger.error('Error listing models:', error);
            return [];
        }
    }

    /**
     * Exporte un modèle pour utilisation externe
     * @param modelId Identifiant du modèle à exporter
     * @param exportPath Chemin de destination pour l'export
     */
    public async exportModel(modelId: string, exportPath: string): Promise<boolean> {
        try {
            // Vérifier si le modèle existe
            const exists = await this.checkModelExists(modelId);

            if (!exists) {
                throw new Error(`Model ${modelId} not found`);
            }

            // Charger le modèle
            const modelData = await this.loadModel(modelId);

            // Charger les métadonnées
            const metadata = await this.loadModelMetadata(modelId);

            // Créer un objet d'export combinant le modèle et les métadonnées
            const exportObject = {
                model: Array.from(new Uint8Array(modelData)),
                metadata: {
                    ...metadata,
                    exportedAt: new Date().toISOString(),
                    exportFormat: 'metasign-local-finetuned'
                }
            };

            // Sérialiser et écrire dans le fichier d'export
            await fs.writeFile(exportPath, JSON.stringify(exportObject));

            this.logger.info(`Model ${modelId} exported to ${exportPath}`);
            return true;
        } catch (error) {
            this.logger.error(`Error exporting model ${modelId}:`, error);
            return false;
        }
    }

    /**
     * Importe un modèle depuis un fichier externe
     * @param importPath Chemin du fichier à importer
     */
    public async importModel(importPath: string): Promise<string | null> {
        try {
            // Lire le fichier d'import
            const data = await fs.readFile(importPath, 'utf8');

            // Parser le contenu
            const importObject = JSON.parse(data);

            // Vérifier le format
            if (!importObject.model || !importObject.metadata ||
                !importObject.metadata.exportFormat?.includes('metasign')) {
                throw new Error('Invalid model file format');
            }

            // Créer un nouvel ID pour le modèle importé
            const modelId = `imported_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

            // Convertir le modèle en ArrayBuffer
            const modelData = new Uint8Array(importObject.model).buffer;

            // Préparer les métadonnées
            const metadata = {
                ...importObject.metadata,
                id: modelId,
                createdAt: new Date().toISOString(),
                importedAt: new Date().toISOString(),
                importSource: importPath
            };

            // Sauvegarder le modèle
            await this.saveModel(modelId, modelData, metadata);

            this.logger.info(`Model imported from ${importPath} with ID ${modelId}`);
            return modelId;
        } catch (error) {
            this.logger.error(`Error importing model from ${importPath}:`, error);
            return null;
        }
    }

    /**
     * Supprime un modèle
     * @param modelId Identifiant du modèle à supprimer
     */
    public async deleteModel(modelId: string): Promise<boolean> {
        try {
            // Chemins des fichiers
            const modelPath = path.join(this.modelsDir, `${modelId}.bin`);
            const metadataPath = path.join(this.metadataDir, `${modelId}.json`);

            // Vérifier si les fichiers existent
            const modelExists = await this.checkModelExists(modelId);

            if (!modelExists) {
                throw new Error(`Model ${modelId} not found`);
            }

            // Supprimer les fichiers
            await fs.unlink(modelPath);
            await fs.unlink(metadataPath);

            this.logger.info(`Model ${modelId} deleted`);
            return true;
        } catch (error) {
            this.logger.error(`Error deleting model ${modelId}:`, error);
            return false;
        }
    }