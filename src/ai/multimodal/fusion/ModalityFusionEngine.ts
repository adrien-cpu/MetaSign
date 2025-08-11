/**
 * @file: src/ai/multimodal/fusion/ModalityFusionEngine.ts
 * 
 * Moteur de fusion multimodale pour combiner des entrées de différentes modalités
 * (texte, vidéo, audio, etc.) en une représentation unifiée pour l'analyse.
 */

import { logger } from '@/utils/Logger';
import { ModalityType } from '@ai-types/index';

/**
 * Données d'entrée pour une modalité spécifique
 */
export interface ModalityInput {
    /** Type de modalité */
    type: ModalityType;
    /** Données spécifiques à cette modalité */
    data: unknown;
    /** Poids de cette modalité (0-1) */
    weight?: number;
    /** Timestamp d'acquisition */
    timestamp?: number;
    /** Métadonnées supplémentaires */
    metadata?: Record<string, unknown>;
}

/**
 * Entrées multimodales complètes
 */
export interface MultimodalInput {
    /** Entrées par modalité */
    modalities: ModalityInput[];
    /** Contexte global */
    context?: Record<string, unknown>;
    /** Identifiant de session */
    sessionId?: string;
    /** Identifiant utilisateur */
    userId?: string;
    /** Préférences utilisateur */
    preferences?: Record<string, unknown>;
}

/**
 * Données de modalité traitées
 */
export interface ProcessedModality {
    /** Type de modalité */
    type: ModalityType;
    /** Caractéristiques extraites */
    features: Record<string, number[]>;
    /** Entités détectées */
    entities: ModalityEntity[];
    /** Embedding vectoriel */
    embedding?: number[];
    /** Score de confiance du traitement (0-1) */
    confidence: number;
    /** Métadonnées de traitement */
    metadata?: Record<string, unknown>;
}

/**
 * Entité détectée dans une modalité
 */
export interface ModalityEntity {
    /** Type d'entité */
    type: string;
    /** Valeur de l'entité */
    value: string | number | boolean;
    /** Score de confiance (0-1) */
    confidence: number;
    /** Propriétés spécifiques à l'entité */
    properties?: Record<string, unknown>;
}

/**
 * Résultat de fusion multimodale
 */
export interface FusionResult {
    /** Modalités utilisées */
    modalitiesUsed: ModalityType[];
    /** Représentation unifiée */
    unifiedRepresentation: Record<string, unknown>;
    /** Entités fusionnées */
    fusedEntities: ModalityEntity[];
    /** Score de confiance global (0-1) */
    confidence: number;
    /** Interprétation textuelle du résultat */
    interpretation?: string;
    /** Métadonnées de la fusion */
    metadata?: Record<string, unknown>;
}

/**
 * Stratégie de fusion multimodale
 */
export enum FusionStrategy {
    /** Moyenne pondérée des modalités */
    WEIGHTED_AVERAGE = 'weighted_average',
    /** Fusion basée sur la confiance des modalités */
    CONFIDENCE_BASED = 'confidence_based',
    /** Fusion hiérarchique (modalités principales + modalités complémentaires) */
    HIERARCHICAL = 'hierarchical',
    /** Fusion adaptative selon le contexte */
    ADAPTIVE = 'adaptive',
    /** Fusion de mise à jour (une modalité principale mise à jour par d'autres) */
    UPDATE = 'update'
}

/**
 * Options pour le moteur de fusion multimodale
 */
export interface ModalityFusionOptions {
    /** Stratégie de fusion par défaut */
    defaultStrategy?: FusionStrategy;
    /** Poids par défaut pour chaque modalité */
    defaultWeights?: Partial<Record<ModalityType, number>>;
    /** Seuil de confiance minimal (0-1) */
    confidenceThreshold?: number;
    /** Niveau de journalisation */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    /** Activer la normalisation des données */
    enableNormalization?: boolean;
    /** Dimension des embeddings unifiés */
    embeddingDimension?: number;
}

/**
 * Moteur de fusion multimodale
 */
export class ModalityFusionEngine {
    private initialized = false;
    private readonly options: Required<ModalityFusionOptions>;

    /** Processeurs par modalité */
    private readonly modalityProcessors: Map<ModalityType, (data: unknown) => Promise<ProcessedModality>> = new Map();
    /** Stratégies de fusion */
    private readonly fusionStrategies: Map<FusionStrategy, (modalities: ProcessedModality[]) => FusionResult> = new Map();

    /**
     * Crée une nouvelle instance du moteur de fusion multimodale
     * @param options Options de configuration
     */
    constructor(options: ModalityFusionOptions = {}) {
        this.options = {
            defaultStrategy: options.defaultStrategy || FusionStrategy.WEIGHTED_AVERAGE,
            defaultWeights: options.defaultWeights || {
                [ModalityType.text]: 0.5,
                [ModalityType.video]: 0.3,
                [ModalityType.audio]: 0.2,
                [ModalityType.image]: 0.2,
                [ModalityType.mixed]: 0.4
            },
            confidenceThreshold: options.confidenceThreshold || 0.3,
            logLevel: options.logLevel || 'info',
            enableNormalization: options.enableNormalization !== false,
            embeddingDimension: options.embeddingDimension || 128
        };

        logger.debug('ModalityFusionEngine created', {
            options: this.options
        });
    }

    /**
     * Initialise le moteur de fusion multimodale
     */
    public async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        logger.info('Initializing ModalityFusionEngine...');

        try {
            // Initialiser les processeurs de modalité
            this.initializeModalityProcessors();

            // Initialiser les stratégies de fusion
            this.initializeFusionStrategies();

            this.initialized = true;
            logger.info('ModalityFusionEngine initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize ModalityFusionEngine', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error('ModalityFusionEngine initialization failed');
        }
    }

    /**
     * Initialise les processeurs pour chaque modalité
     * @private
     */
    private initializeModalityProcessors(): void {
        // Processeur pour le texte
        this.modalityProcessors.set(ModalityType.text, this.processTextModality.bind(this));

        // Processeur pour la vidéo
        this.modalityProcessors.set(ModalityType.video, this.processVideoModality.bind(this));

        // Processeur pour l'audio
        this.modalityProcessors.set(ModalityType.audio, this.processAudioModality.bind(this));

        // Processeur pour les images
        this.modalityProcessors.set(ModalityType.image, this.processImageModality.bind(this));

        // Processeur pour les modalités mixtes
        this.modalityProcessors.set(ModalityType.mixed, this.processMixedModality.bind(this));

        logger.debug(`${this.modalityProcessors.size} modality processors initialized`);
    }

    /**
     * Initialise les stratégies de fusion
     * @private
     */
    private initializeFusionStrategies(): void {
        // Stratégie de moyenne pondérée
        this.fusionStrategies.set(FusionStrategy.WEIGHTED_AVERAGE, this.weightedAverageFusion.bind(this));

        // Stratégie basée sur la confiance
        this.fusionStrategies.set(FusionStrategy.CONFIDENCE_BASED, this.confidenceBasedFusion.bind(this));

        // Stratégie hiérarchique
        this.fusionStrategies.set(FusionStrategy.HIERARCHICAL, this.hierarchicalFusion.bind(this));

        // Stratégie adaptative
        this.fusionStrategies.set(FusionStrategy.ADAPTIVE, this.adaptiveFusion.bind(this));

        // Stratégie de mise à jour
        this.fusionStrategies.set(FusionStrategy.UPDATE, this.updateFusion.bind(this));

        logger.debug(`${this.fusionStrategies.size} fusion strategies initialized`);
    }

    /**
     * Prépare les entrées multimodales
     * @param input Entrées multimodales brutes
     * @returns Entrées multimodales normalisées
     */
    public async prepareInputs(input: unknown): Promise<MultimodalInput> {
        if (!this.initialized) {
            await this.initialize();
        }

        logger.debug('Preparing multimodal inputs');

        // Normaliser les entrées en fonction de leur format
        if (typeof input === 'string') {
            // Entrée texte simple
            return {
                modalities: [
                    {
                        type: ModalityType.text,
                        data: input,
                        weight: this.options.defaultWeights[ModalityType.text]
                    }
                ]
            };
        } else if (input && typeof input === 'object') {
            // Si c'est déjà une entrée multimodale valide
            if (this.isValidMultimodalInput(input)) {
                return this.normalizeMultimodalInput(input as MultimodalInput);
            }

            // Essai de conversion à partir d'autres formats
            const multimodalInput: MultimodalInput = {
                modalities: []
            };

            // Chercher des propriétés correspondant aux modalités
            const potentialInput = input as Record<string, unknown>;

            // Chercher des modalités standard
            const modalityTypes: ModalityType[] = Object.values(ModalityType);
            for (const modalityType of modalityTypes) {
                if (modalityType in potentialInput && potentialInput[modalityType] !== null) {
                    multimodalInput.modalities.push({
                        type: modalityType,
                        data: potentialInput[modalityType],
                        weight: this.options.defaultWeights[modalityType]
                    });
                }
            }

            // Chercher des propriétés spécifiques courantes
            const propertyToModalityMap: Record<string, ModalityType> = {
                'text': ModalityType.text,
                'textContent': ModalityType.text,
                'content': ModalityType.text,
                'message': ModalityType.text,

                'video': ModalityType.video,
                'videoContent': ModalityType.video,
                'videoData': ModalityType.video,

                'audio': ModalityType.audio,
                'audioContent': ModalityType.audio,
                'audioData': ModalityType.audio,

                'image': ModalityType.image,
                'imageContent': ModalityType.image,
                'imageData': ModalityType.image
            };

            for (const [property, modalityType] of Object.entries(propertyToModalityMap)) {
                if (property in potentialInput &&
                    potentialInput[property] !== null &&
                    potentialInput[property] !== undefined) {

                    // Vérifier si cette modalité existe déjà
                    const existingIndex = multimodalInput.modalities.findIndex(m => m.type === modalityType);

                    if (existingIndex === -1) {
                        // Ajouter une nouvelle modalité
                        multimodalInput.modalities.push({
                            type: modalityType,
                            data: potentialInput[property],
                            weight: this.options.defaultWeights[modalityType]
                        });
                    }
                }
            }

            // Si aucune modalité n'a été trouvée, considérer l'entrée comme mixte
            if (multimodalInput.modalities.length === 0) {
                multimodalInput.modalities.push({
                    type: ModalityType.mixed,
                    data: input,
                    weight: this.options.defaultWeights[ModalityType.mixed]
                });
            }

            // Récupérer le contexte et autres métadonnées
            if ('context' in potentialInput) {
                multimodalInput.context = potentialInput.context as Record<string, unknown>;
            }

            if ('sessionId' in potentialInput) {
                multimodalInput.sessionId = String(potentialInput.sessionId);
            }

            if ('userId' in potentialInput) {
                multimodalInput.userId = String(potentialInput.userId);
            }

            return this.normalizeMultimodalInput(multimodalInput);
        }

        // Pour les autres types de données, considérer comme mixte
        return {
            modalities: [
                {
                    type: ModalityType.mixed,
                    data: input,
                    weight: this.options.defaultWeights[ModalityType.mixed]
                }
            ]
        };
    }

    /**
      * Vérifie si un objet est une entrée multimodale valide
      * @param input Objet à vérifier
      * @returns True si c'est une entrée multimodale valide
      * @private
      */
    private isValidMultimodalInput(input: unknown): boolean {
        if (!input || typeof input !== 'object') {
            return false;
        }

        const potentialInput = input as Partial<MultimodalInput>;

        // Doit avoir un tableau de modalités
        if (!Array.isArray(potentialInput.modalities) || potentialInput.modalities.length === 0) {
            return false;
        }

        // Chaque élément doit être une modalité valide
        for (const modality of potentialInput.modalities) {
            if (!modality || typeof modality !== 'object') {
                return false;
            }

            // Doit avoir un type et des données
            if (!modality.type || !Object.values(ModalityType).includes(modality.type)) {
                return false;
            }

            if (modality.data === undefined || modality.data === null) {
                return false;
            }
        }

        return true;
    }

    /**
     * Normalise une entrée multimodale
     * @param input Entrée multimodale
     * @returns Entrée multimodale normalisée
     * @private
     */
    private normalizeMultimodalInput(input: MultimodalInput): MultimodalInput {
        const normalizedInput: MultimodalInput = {
            modalities: [],
            context: input.context || {},
            sessionId: input.sessionId,
            userId: input.userId,
            preferences: input.preferences
        };

        // Normaliser chaque modalité
        for (const modality of input.modalities) {
            normalizedInput.modalities.push({
                type: modality.type,
                data: modality.data,
                weight: modality.weight || this.options.defaultWeights[modality.type] || 0.5,
                timestamp: modality.timestamp || Date.now(),
                metadata: modality.metadata || {}
            });
        }

        return normalizedInput;
    }

    /**
     * Processe des entrées multimodales et effectue la fusion
     * @param input Entrées multimodales
     * @param strategy Stratégie de fusion à utiliser
     * @returns Résultat de la fusion
     */
    public async processMultimodalInput(
        input: unknown,
        strategy: FusionStrategy = this.options.defaultStrategy
    ): Promise<FusionResult> {
        if (!this.initialized) {
            await this.initialize();
        }

        logger.debug('Processing multimodal input', { strategy });

        // Préparer et normaliser les entrées
        const normalizedInput = await this.prepareInputs(input);

        // Traiter chaque modalité
        const processedModalities: ProcessedModality[] = [];
        for (const modalityInput of normalizedInput.modalities) {
            try {
                const processor = this.modalityProcessors.get(modalityInput.type);
                if (!processor) {
                    logger.warn(`No processor available for modality type: ${modalityInput.type}`);
                    continue;
                }

                const processedModality = await processor(modalityInput.data);

                // Appliquer le seuil de confiance
                if (processedModality.confidence >= this.options.confidenceThreshold) {
                    processedModalities.push(processedModality);
                } else {
                    logger.debug(`Modality ${modalityInput.type} skipped due to low confidence: ${processedModality.confidence}`);
                }
            } catch (error) {
                logger.error(`Error processing modality ${modalityInput.type}`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        // Vérifier si des modalités ont été traitées avec succès
        if (processedModalities.length === 0) {
            throw new Error('No modalities could be processed successfully');
        }

        // Appliquer la stratégie de fusion
        const fusionHandler = this.fusionStrategies.get(strategy);
        if (!fusionHandler) {
            throw new Error(`Fusion strategy not supported: ${strategy}`);
        }

        const fusionResult = fusionHandler(processedModalities);

        // Enrichir le résultat avec des métadonnées
        fusionResult.metadata = {
            ...(fusionResult.metadata || {}),
            timestamp: Date.now(),
            inputContext: normalizedInput.context,
            sessionId: normalizedInput.sessionId,
            userId: normalizedInput.userId
        };

        logger.debug('Fusion completed', {
            strategy,
            modalitiesCount: processedModalities.length,
            confidence: fusionResult.confidence
        });

        return fusionResult;
    }

    /**
     * Traite une modalité de type texte
     * @param data Données textuelles
     * @returns Modalité traitée
     * @private
     */
    private async processTextModality(data: unknown): Promise<ProcessedModality> {
        logger.debug('Processing text modality');

        const textData = typeof data === 'string' ? data : String(data);

        // Extraction d'entités simples pour démo
        const entities: ModalityEntity[] = [];

        // Exemple: détecter des entités numériques
        const numberRegex = /\b\d+(\.\d+)?\b/g;
        let match: RegExpExecArray | null;
        while ((match = numberRegex.exec(textData)) !== null) {
            entities.push({
                type: 'number',
                value: parseFloat(match[0]),
                confidence: 0.9
            });
        }

        // Exemple: détecter des entités temporelles simples
        const dateRegex = /\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4})\b/g;
        while ((match = dateRegex.exec(textData)) !== null) {
            entities.push({
                type: 'date',
                value: match[0],
                confidence: 0.85
            });
        }

        // Pour la démonstration, nous créons des caractéristiques simples
        // Dans un système réel, on utiliserait un modèle NLP
        const features: Record<string, number[]> = {
            'bagOfWords': this.textToBagOfWordsVector(textData)
        };

        return {
            type: ModalityType.text,
            features,
            entities,
            confidence: 0.9,
            metadata: {
                length: textData.length,
                wordCount: textData.split(/\s+/).length
            }
        };
    }

    /**
     * Convertit un texte en vecteur bag-of-words simplifié
     * @param text Texte à convertir
     * @returns Vecteur numérique représentant le texte
     * @private
     */
    private textToBagOfWordsVector(text: string): number[] {
        // Cette implémentation est simplifiée pour la démonstration
        // Utiliser un modèle vectoriel réel en production

        // Créer un vecteur simple basé sur la distribution des caractères
        const vector = new Array(26).fill(0);

        const normalizedText = text.toLowerCase();
        for (const char of normalizedText) {
            const code = char.charCodeAt(0) - 97; // 'a' est 97 en ASCII
            if (code >= 0 && code < 26) {
                vector[code]++;
            }
        }

        // Normaliser le vecteur
        const sum = vector.reduce((acc, val) => acc + val, 0);
        if (sum > 0) {
            for (let i = 0; i < vector.length; i++) {
                vector[i] /= sum;
            }
        }

        return vector;
    }

    /**
     * Traite une modalité de type vidéo
     * @param data Données vidéo
     * @returns Modalité traitée
     * @private
     */
    private async processVideoModality(data: unknown): Promise<ProcessedModality> {
        logger.debug('Processing video modality');

        // Implémentation simplifiée pour la démonstration
        // Dans un système réel, on utiliserait un modèle de vision par ordinateur

        // Simuler un traitement de base
        return {
            type: ModalityType.video,
            features: {
                // Simuler des caractéristiques extraites
                'movement': Array.from({ length: 10 }, () => Math.random()),
                'objects': Array.from({ length: 5 }, () => Math.random())
            },
            entities: [
                // Simuler des objets détectés
                {
                    type: 'object',
                    value: 'person',
                    confidence: 0.85
                },
                {
                    type: 'action',
                    value: 'moving',
                    confidence: 0.75
                }
            ],
            confidence: 0.75,
            metadata: {
                duration: 10, // Seconds
                resolution: '1280x720'
            }
        };
    }

    /**
     * Traite une modalité de type audio
     * @param data Données audio
     * @returns Modalité traitée
     * @private
     */
    private async processAudioModality(data: unknown): Promise<ProcessedModality> {
        logger.debug('Processing audio modality');

        // Implémentation simplifiée pour la démonstration
        // Dans un système réel, on utiliserait un modèle de reconnaissance vocale et d'analyse audio

        // Simuler un traitement de base
        return {
            type: ModalityType.audio,
            features: {
                // Simuler des caractéristiques extraites
                'spectral': Array.from({ length: 10 }, () => Math.random()),
                'temporal': Array.from({ length: 5 }, () => Math.random())
            },
            entities: [
                // Simuler des éléments détectés
                {
                    type: 'speech',
                    value: 'hello world',
                    confidence: 0.8
                },
                {
                    type: 'emotion',
                    value: 'neutral',
                    confidence: 0.7
                }
            ],
            confidence: 0.7,
            metadata: {
                duration: 5, // Seconds
                sampleRate: 44100
            }
        };
    }

    /**
     * Traite une modalité de type image
     * @param data Données image
     * @returns Modalité traitée
     * @private
     */
    private async processImageModality(data: unknown): Promise<ProcessedModality> {
        logger.debug('Processing image modality');

        // Implémentation simplifiée pour la démonstration
        // Dans un système réel, on utiliserait un modèle de vision par ordinateur

        // Simuler un traitement de base
        return {
            type: ModalityType.image,
            features: {
                // Simuler des caractéristiques extraites
                'color': Array.from({ length: 10 }, () => Math.random()),
                'texture': Array.from({ length: 5 }, () => Math.random())
            },
            entities: [
                // Simuler des objets détectés
                {
                    type: 'object',
                    value: 'flower',
                    confidence: 0.9
                },
                {
                    type: 'color',
                    value: 'red',
                    confidence: 0.85
                }
            ],
            confidence: 0.8,
            metadata: {
                resolution: '800x600',
                format: 'jpeg'
            }
        };
    }

    /**
     * Traite une modalité de type mixte
     * @param data Données mixtes
     * @returns Modalité traitée
     * @private
     */
    private async processMixedModality(data: unknown): Promise<ProcessedModality> {
        logger.debug('Processing mixed modality');

        // Pour les données mixtes, essayer d'identifier le type principal
        const dominantType = ModalityType.text;
        const confidence = 0.5;

        // Dans un système réel, on analyserait la structure des données pour déterminer le type

        // Par défaut, utiliser un traitement générique
        return {
            type: ModalityType.mixed,
            features: {
                'generic': Array.from({ length: 10 }, () => Math.random())
            },
            entities: [],
            confidence,
            metadata: {
                detectedType: dominantType,
                dataType: typeof data
            }
        };
    }

    /**
     * Stratégie de fusion par moyenne pondérée
     * @param modalities Modalités traitées
     * @returns Résultat de la fusion
     * @private
     */
    private weightedAverageFusion(modalities: ProcessedModality[]): FusionResult {
        logger.debug('Applying weighted average fusion strategy');

        // Calculer un score pondéré pour chaque entité
        const entityMap = new Map<string, { entity: ModalityEntity; score: number }>();

        for (const modality of modalities) {
            const modalityWeight = this.options.defaultWeights[modality.type] || 0.5;

            for (const entity of modality.entities) {
                const key = `${entity.type}:${String(entity.value)}`;

                const existingEntry = entityMap.get(key);
                if (existingEntry) {
                    // Mettre à jour le score avec la nouvelle contribution pondérée
                    existingEntry.score += entity.confidence * modalityWeight;
                } else {
                    // Nouvelle entité
                    entityMap.set(key, {
                        entity: { ...entity },
                        score: entity.confidence * modalityWeight
                    });
                }
            }
        }

        // Normaliser les scores et créer la liste d'entités fusionnées
        const fusedEntities: ModalityEntity[] = [];
        let totalScore = 0;

        for (const entry of entityMap.values()) {
            const normalizedConfidence = Math.min(entry.score, 1.0);
            fusedEntities.push({
                ...entry.entity,
                confidence: normalizedConfidence
            });
            totalScore += normalizedConfidence;
        }

        // Calculer la confiance globale
        const averageConfidence = fusedEntities.length > 0
            ? totalScore / fusedEntities.length
            : modalities.reduce((acc, m) => acc + m.confidence, 0) / modalities.length;

        // Créer un vecteur de représentation unifié (exemple simplifié)
        const unifiedRepresentation: Record<string, unknown> = {
            entityCount: fusedEntities.length,
            dominantModality: this.findDominantModality(modalities),
            confidenceScore: averageConfidence
        };

        return {
            modalitiesUsed: modalities.map(m => m.type),
            unifiedRepresentation,
            fusedEntities,
            confidence: averageConfidence,
            interpretation: this.generateInterpretation(fusedEntities, unifiedRepresentation),
            metadata: {
                fusionStrategy: FusionStrategy.WEIGHTED_AVERAGE,
                modalityCount: modalities.length,
                timestamp: Date.now()
            }
        };
    }

    /**
     * Stratégie de fusion basée sur la confiance
     * @param modalities Modalités traitées
     * @returns Résultat de la fusion
     * @private
     */
    private confidenceBasedFusion(modalities: ProcessedModality[]): FusionResult {
        logger.debug('Applying confidence-based fusion strategy');

        // Trier les modalités par niveau de confiance (descendant)
        const sortedModalities = [...modalities].sort((a, b) => b.confidence - a.confidence);

        // Utiliser principalement les entités des modalités à haute confiance
        const entityMap = new Map<string, ModalityEntity>();

        for (const modality of sortedModalities) {
            for (const entity of modality.entities) {
                const key = `${entity.type}:${String(entity.value)}`;

                // N'ajouter l'entité que si elle n'existe pas déjà ou a une confiance supérieure
                const existingEntity = entityMap.get(key);
                if (!existingEntity || entity.confidence > existingEntity.confidence) {
                    entityMap.set(key, { ...entity });
                }
            }
        }

        const fusedEntities = Array.from(entityMap.values());

        // La confiance globale est dominée par la modalité la plus fiable
        const overallConfidence = sortedModalities.length > 0 ? sortedModalities[0].confidence : 0;

        // Créer la représentation unifiée
        const unifiedRepresentation: Record<string, unknown> = {
            entityCount: fusedEntities.length,
            dominantModality: sortedModalities.length > 0 ? sortedModalities[0].type : undefined,
            confidenceScore: overallConfidence
        };

        return {
            modalitiesUsed: modalities.map(m => m.type),
            unifiedRepresentation,
            fusedEntities,
            confidence: overallConfidence,
            interpretation: this.generateInterpretation(fusedEntities, unifiedRepresentation),
            metadata: {
                fusionStrategy: FusionStrategy.CONFIDENCE_BASED,
                modalityCount: modalities.length,
                dominantModalityConfidence: sortedModalities.length > 0 ? sortedModalities[0].confidence : 0,
                timestamp: Date.now()
            }
        };
    }

    /**
     * Stratégie de fusion hiérarchique
     * @param modalities Modalités traitées
     * @returns Résultat de la fusion
     * @private
     */
    private hierarchicalFusion(modalities: ProcessedModality[]): FusionResult {
        logger.debug('Applying hierarchical fusion strategy');

        // Définir les priorités des modalités
        const modalityPriority: Record<ModalityType, number> = {
            [ModalityType.text]: 10,
            [ModalityType.video]: 8,
            [ModalityType.audio]: 6,
            [ModalityType.image]: 4,
            [ModalityType.mixed]: 2
        };

        // Séparer les modalités principales des modalités secondaires
        const sortedByPriority = [...modalities].sort(
            (a, b) => (modalityPriority[b.type] || 0) - (modalityPriority[a.type] || 0)
        );

        const primaryModalities = sortedByPriority.slice(0, Math.ceil(sortedByPriority.length / 2));
        const secondaryModalities = sortedByPriority.slice(Math.ceil(sortedByPriority.length / 2));

        // Fusionner les entités des modalités principales
        const primaryEntities = new Map<string, ModalityEntity>();
        for (const modality of primaryModalities) {
            for (const entity of modality.entities) {
                const key = `${entity.type}:${String(entity.value)}`;
                primaryEntities.set(key, { ...entity });
            }
        }

        // Utiliser les modalités secondaires pour enrichir ou confirmer
        for (const modality of secondaryModalities) {
            for (const entity of modality.entities) {
                const key = `${entity.type}:${String(entity.value)}`;

                const primaryEntity = primaryEntities.get(key);
                if (primaryEntity) {
                    // Confirmer l'entité existante
                    primaryEntity.confidence = Math.min(1.0, primaryEntity.confidence + 0.1);
                } else {
                    // Ajouter une nouvelle entité avec confiance réduite
                    primaryEntities.set(key, {
                        ...entity,
                        confidence: entity.confidence * 0.7
                    });
                }
            }
        }

        const fusedEntities = Array.from(primaryEntities.values());

        // Calculer la confiance globale
        const primaryConfidence = primaryModalities.reduce((acc, m) => acc + m.confidence, 0) /
            Math.max(1, primaryModalities.length);

        const secondaryContribution = secondaryModalities.length > 0
            ? (secondaryModalities.reduce((acc, m) => acc + m.confidence, 0) / secondaryModalities.length) * 0.3
            : 0;

        const overallConfidence = Math.min(1.0, primaryConfidence + secondaryContribution);

        // Créer la représentation unifiée
        const unifiedRepresentation: Record<string, unknown> = {
            entityCount: fusedEntities.length,
            primaryModalities: primaryModalities.map(m => m.type),
            secondaryModalities: secondaryModalities.map(m => m.type),
            confidenceScore: overallConfidence
        };

        return {
            modalitiesUsed: modalities.map(m => m.type),
            unifiedRepresentation,
            fusedEntities,
            confidence: overallConfidence,
            interpretation: this.generateInterpretation(fusedEntities, unifiedRepresentation),
            metadata: {
                fusionStrategy: FusionStrategy.HIERARCHICAL,
                primaryModalityCount: primaryModalities.length,
                secondaryModalityCount: secondaryModalities.length,
                timestamp: Date.now()
            }
        };
    }

    /**
     * Stratégie de fusion adaptative
     * @param modalities Modalités traitées
     * @returns Résultat de la fusion
     * @private
     */
    private adaptiveFusion(modalities: ProcessedModality[]): FusionResult {
        logger.debug('Applying adaptive fusion strategy');

        // Analyser le contexte pour déterminer la stratégie optimale

        // Si une modalité a une confiance très élevée, utiliser la stratégie basée sur la confiance
        const highConfidenceModality = modalities.find(m => m.confidence > 0.9);
        if (highConfidenceModality) {
            logger.debug('High confidence modality detected, using confidence-based fusion');
            return this.confidenceBasedFusion(modalities);
        }

        // Si les modalités sont complémentaires, utiliser la hiérarchie
        const modalityTypes = new Set(modalities.map(m => m.type));
        if (modalityTypes.size > 1 && modalityTypes.has(ModalityType.text)) {
            logger.debug('Complementary modalities detected, using hierarchical fusion');
            return this.hierarchicalFusion(modalities);
        }

        // Dans les autres cas, utiliser la moyenne pondérée
        logger.debug('Using weighted average fusion as default');
        return this.weightedAverageFusion(modalities);
    }

    /**
     * Stratégie de fusion par mise à jour
     * @param modalities Modalités traitées
     * @returns Résultat de la fusion
     * @private
     */
    private updateFusion(modalities: ProcessedModality[]): FusionResult {
        logger.debug('Applying update fusion strategy');

        // Trouver la modalité principale (celle avec le plus d'entités)
        const primaryModality = [...modalities].sort((a, b) => b.entities.length - a.entities.length)[0];

        // Partir des entités de la modalité principale
        const baseEntities = new Map<string, ModalityEntity>();
        for (const entity of primaryModality.entities) {
            const key = `${entity.type}:${String(entity.value)}`;
            baseEntities.set(key, { ...entity });
        }

        // Mettre à jour avec les autres modalités
        const otherModalities = modalities.filter(m => m !== primaryModality);
        for (const modality of otherModalities) {
            for (const entity of modality.entities) {
                const key = `${entity.type}:${String(entity.value)}`;

                const existingEntity = baseEntities.get(key);
                if (existingEntity) {
                    // Ajuster la confiance (moyenne pondérée)
                    existingEntity.confidence = (existingEntity.confidence + entity.confidence) / 2;

                    // Fusionner les propriétés
                    existingEntity.properties = {
                        ...(existingEntity.properties || {}),
                        ...(entity.properties || {})
                    };
                } else {
                    // Ajouter une nouvelle entité
                    baseEntities.set(key, { ...entity });
                }
            }
        }

        const fusedEntities = Array.from(baseEntities.values());

        // Calculer la confiance globale
        const overallConfidence = fusedEntities.length > 0
            ? fusedEntities.reduce((acc, e) => acc + e.confidence, 0) / fusedEntities.length
            : primaryModality.confidence;

        // Créer la représentation unifiée
        const unifiedRepresentation: Record<string, unknown> = {
            entityCount: fusedEntities.length,
            primaryModality: primaryModality.type,
            updateModalities: otherModalities.map(m => m.type),
            confidenceScore: overallConfidence
        };

        return {
            modalitiesUsed: modalities.map(m => m.type),
            unifiedRepresentation,
            fusedEntities,
            confidence: overallConfidence,
            interpretation: this.generateInterpretation(fusedEntities, unifiedRepresentation),
            metadata: {
                fusionStrategy: FusionStrategy.UPDATE,
                primaryModalityType: primaryModality.type,
                updateModalityCount: otherModalities.length,
                timestamp: Date.now()
            }
        };
    }

    /**
     * Trouve la modalité dominante dans un ensemble de modalités
     * @param modalities Modalités à analyser
     * @returns Type de la modalité dominante
     * @private
     */
    private findDominantModality(modalities: ProcessedModality[]): ModalityType | undefined {
        if (modalities.length === 0) {
            return undefined;
        }

        if (modalities.length === 1) {
            return modalities[0].type;
        }

        // Trier par confiance * poids
        return [...modalities].sort((a, b) => {
            const aScore = a.confidence * (this.options.defaultWeights[a.type] || 0.5);
            const bScore = b.confidence * (this.options.defaultWeights[b.type] || 0.5);
            return bScore - aScore;
        })[0].type;
    }

    /**
     * Génère une interprétation textuelle des résultats de fusion
     * @param entities Entités fusionnées
     * @param representation Représentation unifiée
     * @returns Interprétation textuelle
     * @private
     */
    private generateInterpretation(
        entities: ModalityEntity[],
        representation: Record<string, unknown>
    ): string {
        if (entities.length === 0) {
            return "Aucune entité détectée dans les données multimodales.";
        }

        // Générer une description des entités les plus confiantes
        const highConfidenceEntities = entities
            .filter(e => e.confidence > 0.7)
            .sort((a, b) => b.confidence - a.confidence);

        if (highConfidenceEntities.length === 0) {
            return "Entités détectées avec faible niveau de confiance.";
        }

        const entityDescriptions = highConfidenceEntities
            .slice(0, 3)
            .map(e => `${e.type} (${e.value}, confiance: ${(e.confidence * 100).toFixed(0)}%)`)
            .join(", ");

        const dominantModality = representation.dominantModality as ModalityType | undefined;
        const modalityDesc = dominantModality
            ? `principale: ${dominantModality}`
            : "multiples modalités équilibrées";

        return `Analyse multimodale (${modalityDesc}) a identifié: ${entityDescriptions}${highConfidenceEntities.length > 3 ? ` et ${entities.length - 3} autres entités` : ""
            }.`;
    }
}