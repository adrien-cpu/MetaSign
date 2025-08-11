// src/ai/specialized/spatial/analyzers/SpatialAnalyzer.ts

import {
    LSFInput,
    SpatialAnalysis,
    SpatialComponent,
    SpatialRelation,
    SpatialGraph,
    SpatialComponentType,
    SpatialRelationType,
    AnalysisMetadata,
    Point3D
} from '../types';

/**
 * Classe responsable de l'analyse des structures spatiales LSF
 */
export class SpatialAnalyzer {
    /**
     * Configuration pour l'analyse
     */
    private config = {
        defaultConfidenceThreshold: 0.7,
        minComponentDistance: 0.1,
        maxRelationStrength: 0.95,
        processingTimeLimit: 5000 // ms
    };

    /**
     * Analyse une entrée LSF et génère une structure spatiale
     * @param input Entrée LSF à analyser
     * @returns Analyse spatiale complète
     */
    public async analyzeLSFInput(input: LSFInput): Promise<SpatialAnalysis> {
        const startTime = Date.now();

        // Initialiser les données d'analyse
        const components: SpatialComponent[] = [];
        const relations: SpatialRelation[] = [];

        // Extraire les éléments spatiaux selon le type d'entrée
        if (typeof input.data === 'string') {
            await this.analyzeTextInput(input.data, components, relations);
        } else {
            await this.analyzeStructuredInput(input.data, components, relations);
        }

        // Construire le graphe spatial
        const graph = this.buildSpatialGraph(components, relations);

        // Calculer les métadonnées
        const processingTime = Date.now() - startTime;
        const metadata = this.generateMetadata(components, relations, processingTime);

        // Générer l'ID unique
        const id = `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        return {
            id,
            components,
            relations,
            graph,
            metadata
        };
    }

    /**
     * Analyse une entrée textuelle et extrait les composants et relations spatiales
     * @param text Texte à analyser
     * @param components Tableau des composants à remplir
     * @param relations Tableau des relations à remplir
     */
    private async analyzeTextInput(
        text: string,
        components: SpatialComponent[],
        relations: SpatialRelation[]
    ): Promise<void> {
        // Exemple simplifié d'extraction de composants
        const words = text.split(/\s+/);
        const position: Point3D = { x: 0, y: 0, z: 0 };

        // Pour chaque mot, créer un composant
        for (let i = 0; i < words.length; i++) {
            const word = words[i];

            // Choisir un type de composant (exemple simplifié)
            let componentType = SpatialComponentType.ZONE;
            if (word.includes('point') || word.includes('montre')) {
                componentType = SpatialComponentType.POINTING;
            } else if (word.includes('regard') || word.includes('voir')) {
                componentType = SpatialComponentType.GAZE;
            } else if (word.includes('mouvement')) {
                componentType = SpatialComponentType.MOVEMENT;
            }

            // Créer un composant spatial
            const component: SpatialComponent = {
                id: `comp_${i}_${Date.now()}`,
                type: componentType,
                position: { ...position },
                properties: {
                    word,
                    index: i,
                    extractedFrom: 'text'
                }
            };

            components.push(component);

            // Décaler la position pour le prochain mot
            position.x += 0.5;
            if (position.x > 3) {
                position.x = 0;
                position.y -= 0.5;
            }

            // Si ce n'est pas le dernier mot, créer une relation avec le suivant
            if (i < words.length - 1) {
                const relation: SpatialRelation = {
                    id: `rel_${i}_${Date.now()}`,
                    sourceId: component.id,
                    targetId: `comp_${i + 1}_${Date.now()}`, // ID du prochain composant
                    type: SpatialRelationType.TEMPORAL,
                    strength: 0.8,
                    properties: {
                        type: 'sequence',
                        extractedFrom: 'text'
                    }
                };

                relations.push(relation);
            }
        }
    }

    /**
     * Analyse une entrée structurée et extrait les composants et relations spatiales
     * @param data Données structurées à analyser
     * @param components Tableau des composants à remplir
     * @param relations Tableau des relations à remplir
     */
    private async analyzeStructuredInput(
        data: Record<string, unknown>,
        components: SpatialComponent[],
        relations: SpatialRelation[]
    ): Promise<void> {
        // Exemple simplifié d'extraction depuis des données structurées

        // Extraire les composants
        const inputComponents = data.components as Record<string, unknown>[] | undefined;
        if (inputComponents) {
            for (let i = 0; i < inputComponents.length; i++) {
                const inputComp = inputComponents[i];

                // Créer un composant spatial
                const component: SpatialComponent = {
                    id: `comp_${i}_${Date.now()}`,
                    type: this.mapComponentType(inputComp.type as string),
                    position: this.extractPosition(inputComp),
                    properties: {
                        ...inputComp,
                        extractedFrom: 'structured'
                    }
                };

                components.push(component);
            }
        }

        // Extraire les relations
        const inputRelations = data.relations as Record<string, unknown>[] | undefined;
        if (inputRelations) {
            for (let i = 0; i < inputRelations.length; i++) {
                const inputRel = inputRelations[i];

                // Créer une relation spatiale
                const relation: SpatialRelation = {
                    id: `rel_${i}_${Date.now()}`,
                    sourceId: inputRel.source as string,
                    targetId: inputRel.target as string,
                    type: this.mapRelationType(inputRel.type as string),
                    strength: typeof inputRel.strength === 'number' ? inputRel.strength : 0.7,
                    properties: {
                        ...inputRel,
                        extractedFrom: 'structured'
                    }
                };

                relations.push(relation);
            }
        }
    }

    /**
     * Construit un graphe spatial à partir des composants et relations
     * @param components Composants spatiaux
     * @param relations Relations spatiales
     * @returns Graphe spatial
     */
    private buildSpatialGraph(
        components: SpatialComponent[],
        relations: SpatialRelation[]
    ): SpatialGraph {
        // Construire un graphe simple
        return {
            nodes: components,
            edges: relations,
            properties: {
                nodeCount: components.length,
                edgeCount: relations.length,
                density: components.length > 0
                    ? relations.length / (components.length * (components.length - 1))
                    : 0
            }
        };
    }

    /**
     * Génère les métadonnées pour l'analyse
     * @param components Composants analysés
     * @param relations Relations analysées
     * @param processingTime Temps de traitement en ms
     * @returns Métadonnées de l'analyse
     */
    private generateMetadata(
        components: SpatialComponent[],
        relations: SpatialRelation[],
        processingTime: number
    ): AnalysisMetadata {
        // Calculer la complexité et la cohérence
        const complexityScore = this.calculateComplexityScore(components, relations);
        const coherenceScore = this.calculateCoherenceScore(components, relations);

        // Générer des avertissements si nécessaire
        const warnings: string[] = [];
        if (processingTime > this.config.processingTimeLimit) {
            warnings.push(`Processing time (${processingTime}ms) exceeded limit (${this.config.processingTimeLimit}ms)`);
        }

        if (components.length === 0) {
            warnings.push('No components were extracted from the input');
        }

        // Générer des suggestions si nécessaire
        const suggestions: string[] = [];
        if (coherenceScore < 0.5) {
            suggestions.push('Consider reorganizing spatial components for better coherence');
        }

        if (components.length > 20) {
            suggestions.push('Consider simplifying the spatial structure - too many components can reduce clarity');
        }

        return {
            processingTime,
            confidenceScore: 0.8, // Valeur exemple
            modelVersion: '1.0.0',
            warnings,
            suggestions,
            statistics: {
                componentCount: components.length,
                relationCount: relations.length,
                complexityScore,
                coherenceScore
            }
        };
    }

    /**
     * Calcule un score de complexité basé sur les composants et relations
     * @param components Composants spatiaux
     * @param relations Relations spatiales
     * @returns Score de complexité (0-1)
     */
    private calculateComplexityScore(
        components: SpatialComponent[],
        relations: SpatialRelation[]
    ): number {
        if (components.length === 0) {
            return 0;
        }

        // Calculer la complexité basée sur le nombre de composants et de relations
        const typeDiversity = new Set(components.map(c => c.type)).size / Object.keys(SpatialComponentType).length;
        const relationDensity = relations.length / (components.length * (components.length - 1) / 2);

        // Combinaison pondérée
        return Math.min(1, (0.4 * typeDiversity + 0.6 * relationDensity));
    }

    /**
     * Calcule un score de cohérence basé sur les composants et relations
     * @param components Composants spatiaux
     * @param relations Relations spatiales
     * @returns Score de cohérence (0-1)
     */
    private calculateCoherenceScore(
        components: SpatialComponent[],
        relations: SpatialRelation[]
    ): number {
        if (components.length === 0) {
            return 0;
        }

        // Calculer la cohérence en vérifiant si toutes les relations référencent des composants existants
        const componentIds = new Set(components.map(c => c.id));

        let validRelations = 0;
        for (const relation of relations) {
            if (componentIds.has(relation.sourceId) && componentIds.has(relation.targetId)) {
                validRelations++;
            }
        }

        return relations.length > 0 ? validRelations / relations.length : 1;
    }

    /**
     * Convertit un type de composant depuis une chaîne
     * @param type Type sous forme de chaîne
     * @returns Type de composant spatial
     */
    private mapComponentType(type: string): SpatialComponentType {
        const typeMap: Record<string, SpatialComponentType> = {
            'zone': SpatialComponentType.ZONE,
            'proforme': SpatialComponentType.PROFORME,
            'pointing': SpatialComponentType.POINTING,
            'transition': SpatialComponentType.TRANSITION,
            'gaze': SpatialComponentType.GAZE,
            'expression': SpatialComponentType.EXPRESSION,
            'orientation': SpatialComponentType.ORIENTATION,
            'movement': SpatialComponentType.MOVEMENT
        };

        return typeMap[type.toLowerCase()] || SpatialComponentType.ZONE;
    }

    /**
     * Convertit un type de relation depuis une chaîne
     * @param type Type sous forme de chaîne
     * @returns Type de relation spatiale
     */
    private mapRelationType(type: string): SpatialRelationType {
        const typeMap: Record<string, SpatialRelationType> = {
            'temporal': SpatialRelationType.TEMPORAL,
            'spatial': SpatialRelationType.SPATIAL,
            'semantic': SpatialRelationType.SEMANTIC,
            'causal': SpatialRelationType.CAUSAL,
            'structural': SpatialRelationType.STRUCTURAL
        };

        return typeMap[type.toLowerCase()] || SpatialRelationType.SEMANTIC;
    }

    /**
     * Extrait une position 3D depuis un objet
     * @param obj Objet contenant des coordonnées
     * @returns Position 3D
     */
    private extractPosition(obj: Record<string, unknown>): Point3D {
        // Essayer plusieurs formats possibles
        if (obj.position && typeof obj.position === 'object') {
            const pos = obj.position as Record<string, unknown>;
            return {
                x: typeof pos.x === 'number' ? pos.x : 0,
                y: typeof pos.y === 'number' ? pos.y : 0,
                z: typeof pos.z === 'number' ? pos.z : 0
            };
        }

        // Essayer les propriétés individuelles
        return {
            x: typeof obj.x === 'number' ? obj.x : 0,
            y: typeof obj.y === 'number' ? obj.y : 0,
            z: typeof obj.z === 'number' ? obj.z : 0
        };
    }
}