import { IDialectMapper } from '@ai/cultural/interfaces/IDialectMapper';
import { IOriginDetector } from '@ai/cultural/interfaces/IOriginDetector';
import { IVariantValidator } from '@ai/cultural/interfaces/IVariantValidator';
import {
    GestureFrame,
    RegionalContext,
    DialectVariant,
    SubstitutionRule,
    DialectVariation,
    CacheOptions,
    ValidationResult
} from '@ai/cultural/types';

/**
 * Structure optimisée pour les performances de recherche
 */
interface VariantEntry {
    signId: string;
    region: string;
    variant: Record<string, unknown>;
    confidence: number;
    validatedByNative: boolean;
    lastUpdated: number;
    usageCount: number;
}

/**
 * Optimisation d'indexation pour la recherche rapide
 */
interface SignRegionMappings {
    [signId: string]: {
        [region: string]: VariantEntry;
    };
}

/**
 * Gestion optimisée des variantes dialectales en LSF
 * 
 * Ce composant est responsable de:
 * - Cartographier les variantes régionales de signes
 * - Détecter l'origine dialectale d'un signant
 * - Substituer dynamiquement les signes selon le contexte régional
 * - Valider les variantes via contribution communautaire
 */
export class GestionVariantesDiatopiques {
    // Mappings optimisés pour la performance
    private readonly variantMappings: SignRegionMappings = {};

    // Relations entre variantes régionales
    private readonly relationships: Map<string, Map<string, Set<string>>> = new Map();

    // Caches pour les données fréquemment accédées
    private readonly variantsCache: Map<string, Map<string, DialectVariant>> = new Map();
    private readonly substitutionRulesCache: Map<string, SubstitutionRule[]> = new Map();
    private readonly resultCache: Map<string, Record<string, unknown>> = new Map();
    private readonly cacheHits: Map<string, number> = new Map();

    // Configuration du cache
    private readonly cacheOptions: CacheOptions = {
        strategy: 'memory',
        ttl: 3600000, // 1 heure par défaut
        maxSize: 1000,
        cleanupInterval: 600000 // 10 minutes
    };

    private lastCacheCleanup: number = Date.now();

    /**
     * Crée une nouvelle instance de GestionVariantesDiatopiques
     * @param dialectMapper Mapper pour la gestion des variantes régionales
     * @param originDetector Détecteur d'origine pour la détection automatique du contexte
     * @param variantValidator Validateur de variantes pour garantir l'authenticité
     * @param cacheOptions Options de configuration du cache
     */
    constructor(
        private readonly dialectMapper: IDialectMapper,
        private readonly originDetector: IOriginDetector,
        private readonly variantValidator: IVariantValidator,
        cacheOptions?: Partial<CacheOptions>
    ) {
        if (cacheOptions) {
            this.cacheOptions = {
                ...this.cacheOptions,
                ...cacheOptions
            };
        }
    }

    /**
     * Détecte la région d'origine de l'utilisateur
     * @param userContext Contexte de l'utilisateur pour la détection
     */
    public async detectUserOrigin(userContext: Record<string, unknown>): Promise<string> {
        return this.originDetector.detectOrigin(userContext);
    }

    /**
     * Détecte la région d'origine à partir de gestes
     * @param gestureFrames Séquence de gestes à analyser
     */
    public async detectRegionalOrigin(gestureFrames: GestureFrame[]): Promise<string> {
        try {
            return await this.originDetector.detectOrigin(gestureFrames);
        } catch (error) {
            console.error('Erreur lors de la détection d\'origine:', error);
            return 'standard';
        }
    }

    /**
     * Obtient les variantes dialectales pour une région donnée
     * @param region Code de la région
     */
    public async getVariantsForRegion(region: string): Promise<Map<string, DialectVariant>> {
        // Vérifier dans le cache
        if (this.variantsCache.has(region)) {
            return this.variantsCache.get(region)!;
        }

        // Récupérer les variantes depuis le mapper
        const variants = await this.dialectMapper.getRegionalVariant(region);

        // Mettre en cache
        this.variantsCache.set(region, variants);

        return variants;
    }

    /**
     * Obtient les règles de substitution pour une région donnée
     * @param region Code de la région
     */
    public async getSubstitutionRules(region: string): Promise<SubstitutionRule[]> {
        // Vérifier dans le cache
        if (this.substitutionRulesCache.has(region)) {
            return this.substitutionRulesCache.get(region)!;
        }

        // Récupérer les règles depuis le mapper
        const rules = await this.dialectMapper.getRules(region);

        // Mettre en cache
        this.substitutionRulesCache.set(region, rules);

        return rules;
    }

    /**
     * Ajoute une variante dialectale à la cartographie
     * @param signId Identifiant du signe
     * @param region Code régional
     * @param variant Données de la variante
     */
    public async addRegionalVariant(signId: string, region: string, variant: Record<string, unknown>): Promise<void> {
        // Valider la variante avant de l'ajouter
        const validationResult = await this.variantValidator.validateVariant(signId, region, variant);

        if (!validationResult.isValid) {
            throw new Error(`Variante invalide pour ${signId} en région ${region}: ${validationResult.reason}`);
        }

        // Créer la structure si elle n'existe pas
        if (!this.variantMappings[signId]) {
            this.variantMappings[signId] = {};
        }

        // Ajouter ou mettre à jour la variante
        this.variantMappings[signId][region] = {
            signId,
            region,
            variant,
            confidence: validationResult.confidence,
            validatedByNative: validationResult.validatedByNative,
            lastUpdated: Date.now(),
            usageCount: 0
        };

        // Invalider les caches concernés
        this.resultCache.delete(`${signId}:${region}`);
        if (this.variantsCache.has(region)) {
            const variants = this.variantsCache.get(region)!;
            // Mettre à jour la variante dans le cache
            const dialectVariant: DialectVariant = {
                id: `${signId}_${region}`,
                originalId: signId,
                region: region,
                type: 'substitution',
                parameters: variant,
                metadata: {
                    source: 'community',
                    confidence: validationResult.confidence,
                    lastUpdated: Date.now(),
                    validatedBy: validationResult.validatedByNative ? ['native'] : []
                }
            };
            variants.set(signId, dialectVariant);
        }

        // Mettre à jour les relations dialectales
        this.updateRelationships(signId, region);

        // Déléguer également au mapper externe
        await this.dialectMapper.addRegionalVariant(signId, region, variant);
    }

    /**
     * Récupère la variante dialectale d'un signe
     * @param signId Identifiant du signe
     * @param region Code régional
     * @returns Variante régionale ou null si non trouvée
     */
    public async getRegionalVariant(signId: string, region: string): Promise<Record<string, unknown> | null> {
        // Vérifier le cache avec une clé combinée
        const cacheKey = `${signId}:${region}`;
        if (this.resultCache.has(cacheKey)) {
            // Incrémenter le compteur de hits pour l'optimisation du cache
            this.cacheHits.set(cacheKey, (this.cacheHits.get(cacheKey) || 0) + 1);
            return this.resultCache.get(cacheKey) || null;
        }

        // Rechercher dans les mappings locaux
        const regionMap = this.variantMappings[signId];
        if (regionMap && regionMap[region]) {
            const entry = regionMap[region];

            // Incrémenter le compteur d'utilisation pour l'analyse de fréquence
            entry.usageCount++;

            // Mettre en cache pour les accès futurs
            this.resultCache.set(cacheKey, entry.variant);
            this.cacheHits.set(cacheKey, 1);

            return entry.variant;
        }

        // Sinon consulter le mapper externe
        const variant = await this.dialectMapper.getRegionalVariant(signId, region);

        // Mettre en cache le résultat (même si null)
        if (variant !== null) {
            this.resultCache.set(cacheKey, variant);
        } else {
            this.resultCache.set(cacheKey, {});
        }
        this.cacheHits.set(cacheKey, 1);

        // Nettoyage périodique du cache
        const now = Date.now();
        if (now - this.lastCacheCleanup > this.cacheOptions.cleanupInterval) {
            this.cleanupCache();
            this.lastCacheCleanup = now;
        }

        return variant;
    }

    /**
     * Adapte une expression LSF au contexte régional
     * @param expressionId ID de l'expression à adapter
     * @param context Contexte régional pour l'adaptation
     */
    public async adaptExpression(expressionId: string, context: RegionalContext): Promise<DialectVariant | null> {
        // Vérifier si une adaptation est nécessaire
        if (!context.region || context.region === 'standard') {
            return null; // Pas d'adaptation nécessaire
        }

        // Récupérer les variantes pour la région
        const variants = await this.getVariantsForRegion(context.region);

        // Chercher une variante spécifique pour cette expression
        if (variants.has(expressionId)) {
            const variant = variants.get(expressionId)!;

            // Valider la variante avant utilisation
            const validationResult = await this.variantValidator.validateVariantInContext(variant.parameters, context);

            if (validationResult.isValid) {
                return variant;
            }
        }

        // Si aucune variante spécifique n'est trouvée, essayer d'appliquer des règles générales
        const rules = await this.getSubstitutionRules(context.region);

        // Trouver une règle applicable
        for (const rule of rules) {
            if (this.isRuleApplicable(rule, expressionId, context)) {
                return this.applySubstitutionRule(expressionId, rule, context);
            }
        }

        // Si aucune règle n'est applicable, essayer de substituer une variante d'une région proche
        return this.findSimilarRegionVariant(expressionId, context);
    }

    /**
     * Crée des variations dialectales pour une séquence d'expressions
     * @param signIds Liste d'identifiants de signes
     * @param sourceRegion Région source
     * @param targetRegion Région cible
     * @returns Informations sur les variations dialectales
     */
    public async createDialectVariations(
        signIds: string[],
        sourceRegion: string,
        targetRegion: string
    ): Promise<DialectVariation> {
        // Créer la structure de base pour les variations
        const dialectVariation: DialectVariation = {
            region: targetRegion,
            expressionChanges: [],
            culturalNotes: await this.getCulturalNotes(sourceRegion, targetRegion)
        };

        // Pour chaque signe, tenter de trouver une variante
        for (const signId of signIds) {
            try {
                const hasVariant = await this.hasRegionalVariant(signId, targetRegion);
                if (hasVariant) {
                    dialectVariation.expressionChanges.push({
                        originalId: signId,
                        replacementId: this.generateReplacementId(signId, targetRegion),
                        confidence: this.getVariantConfidence(signId, targetRegion),
                        validatedByNative: this.isValidatedByNative(signId, targetRegion)
                    });
                }
            } catch (error) {
                console.error(`Erreur lors du traitement de la variante pour ${signId}:`, error);
            }
        }

        return dialectVariation;
    }

    /**
     * Substitue un signe par sa variante régionale appropriée
     * @param signId Identifiant du signe
     * @param sourceRegion Région source
     * @param targetRegion Région cible
     * @returns Variante substituée ou null si non trouvée
     */
    public async substituteVariant(
        signId: string,
        sourceRegion: string,
        targetRegion: string
    ): Promise<Record<string, unknown> | null> {
        // Si les régions sont identiques, pas de substitution nécessaire
        if (sourceRegion === targetRegion) {
            return this.getRegionalVariant(signId, sourceRegion);
        }

        // Récupérer la variante cible
        const targetVariant = await this.getRegionalVariant(signId, targetRegion);

        // Si une variante cible existe, l'utiliser
        if (targetVariant) {
            return targetVariant;
        }

        // Si aucune variante cible n'existe, utiliser les relations pour trouver une substitution
        const relationships = await this.getVariantRelationships(signId);
        const sourceRelations = relationships.get(sourceRegion);

        if (sourceRelations && sourceRelations.has(targetRegion)) {
            // Relation directe trouvée, utiliser la variante source comme base
            const sourceVariant = await this.getRegionalVariant(signId, sourceRegion);
            if (sourceVariant) {
                // Adapter la variante source pour la région cible
                return this.adaptVariant(sourceVariant, sourceRegion, targetRegion);
            }
        }

        // Aucune substitution trouvée
        return null;
    }

    /**
     * Vérifie l'existence d'une variante pour un signe et une région
     * @param signId Identifiant du signe
     * @param region Code régional
     * @returns true si une variante existe
     */
    public async hasRegionalVariant(signId: string, region: string): Promise<boolean> {
        const regionMap = this.variantMappings[signId];
        if (regionMap && regionMap[region]) {
            return true;
        }

        // Vérifier également via le mapper externe
        const variant = await this.dialectMapper.getRegionalVariant(signId, region);
        return variant !== null;
    }

    /**
     * Recherche les relations entre variantes dialectales
     * @param signId Identifiant du signe
     * @returns Carte des relations entre variantes régionales
     */
    public async getVariantRelationships(signId: string): Promise<Map<string, Set<string>>> {
        const relationships = this.relationships.get(signId);
        if (!relationships) {
            return new Map();
        }
        return relationships;
    }

    /**
     * Obtient tous les codes régionaux pour lesquels il existe des variantes d'un signe
     * @param signId Identifiant du signe
     * @returns Ensemble des codes régionaux disponibles
     */
    public async getAvailableRegions(signId: string): Promise<Set<string>> {
        const regionMap = this.variantMappings[signId];
        if (!regionMap) {
            return new Set();
        }
        return new Set(Object.keys(regionMap));
    }

    /**
     * Précharge les variantes dialectales pour un ensemble de régions
     * @param regions Liste des codes de région à précharger
     */
    public async preloadVariants(regions: string[]): Promise<void> {
        const loadPromises = regions.map(region => this.getVariantsForRegion(region));
        await Promise.all(loadPromises);

        const rulesPromises = regions.map(region => this.getSubstitutionRules(region));
        await Promise.all(rulesPromises);
    }

    /**
     * Vide les caches de variantes dialectales
     */
    public clearCache(): void {
        this.variantsCache.clear();
        this.substitutionRulesCache.clear();
        this.resultCache.clear();
        this.cacheHits.clear();
    }

    /**
     * Récupère les métriques de performance du module
     * @returns Métriques de performance
     */
    public getPerformanceMetrics(): Record<string, number> {
        const totalVariants = Object.values(this.variantMappings)
            .reduce((count, regions) => count + Object.keys(regions).length, 0);

        const cacheSize = this.resultCache.size;
        const totalHits = Array.from(this.cacheHits.values()).reduce((sum, hits) => sum + hits, 0);

        return {
            totalVariants,
            cacheSize,
            cacheHits: totalHits,
            cacheEfficiency: totalHits ? (totalHits / (totalHits + 1)) * 100 : 0, // pourcentage d'efficacité du cache
            relationshipsMappings: this.relationships.size,
            variantsCacheSize: this.variantsCache.size,
            rulesCacheSize: this.substitutionRulesCache.size,
            memoryUsage: this.estimateMemoryUsage()
        };
    }

    /**
     * Vérifie si une règle de substitution est applicable
     */
    private isRuleApplicable(
        rule: SubstitutionRule,
        expressionId: string,
        context: RegionalContext
    ): boolean {
        // Vérifier si l'expression correspond au pattern de la règle
        if (rule.pattern instanceof RegExp) {
            return rule.pattern.test(expressionId);
        } else if (typeof rule.pattern === 'string') {
            return expressionId.includes(rule.pattern);
        }

        // Vérifier les conditions contextuelles si présentes
        if (rule.contextConditions && Object.keys(rule.contextConditions).length > 0) {
            for (const [key, value] of Object.entries(rule.contextConditions)) {
                const contextKey = key as keyof RegionalContext;
                // Utiliser 'as unknown' pour gérer la comparaison de types différents
                if (context[contextKey] !== value) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Applique une règle de substitution à une expression
     */
    private async applySubstitutionRule(
        expressionId: string,
        rule: SubstitutionRule,
        context: RegionalContext
    ): Promise<DialectVariant> {
        // Créer une variante basée sur la règle
        const variant: DialectVariant = {
            id: `${expressionId}_${context.region}`,
            originalId: expressionId,
            region: context.region,
            type: 'substitution',
            substitutionType: rule.type,
            parameters: rule.parameters ? { ...rule.parameters } : {},
            metadata: {
                source: 'rule',
                confidence: rule.confidence || 0.8,
                lastUpdated: Date.now(),
                ruleId: rule.id
            }
        };

        // Valider la variante générée
        const validationResult: ValidationResult = await this.variantValidator.validateVariantInContext(variant.parameters, context);

        if (!validationResult.isValid && validationResult.suggestedFixes) {
            // Ajuster la variante si nécessaire
            variant.parameters = {
                ...variant.parameters,
                ...validationResult.suggestedFixes
            };

            // Ajuster la confiance
            if (variant.metadata) {
                variant.metadata.confidence = Math.max(
                    0.5,
                    (variant.metadata.confidence) * 0.9
                );
            }
        }

        return variant;
    }

    /**
     * Met à jour les relations entre variantes dialectales
     * @param signId Identifiant du signe
     * @param region Code régional nouvellement ajouté
     */
    private updateRelationships(signId: string, region: string): void {
        const regionMap = this.variantMappings[signId];
        if (!regionMap) return;

        // Obtenir ou créer la carte des relations pour ce signe
        let signRelationships = this.relationships.get(signId);
        if (!signRelationships) {
            signRelationships = new Map();
            this.relationships.set(signId, signRelationships);
        }

        // Obtenir ou créer l'ensemble des relations pour cette région
        let regionRelations = signRelationships.get(region);
        if (!regionRelations) {
            regionRelations = new Set();
            signRelationships.set(region, regionRelations);
        }

        // Analyser les similitudes avec les autres variantes régionales
        for (const otherRegion of Object.keys(regionMap)) {
            if (otherRegion === region) continue;

            // Calculer la similitude entre les variantes
            const similarity = this.calculateSimilarity(
                regionMap[region].variant,
                regionMap[otherRegion].variant
            );

            // Si la similitude dépasse un seuil, établir une relation bidirectionnelle
            if (similarity > 0.7) {
                regionRelations.add(otherRegion);

                // Relation inverse
                let otherRegionRelations = signRelationships.get(otherRegion);
                if (!otherRegionRelations) {
                    otherRegionRelations = new Set();
                    signRelationships.set(otherRegion, otherRegionRelations);
                }
                otherRegionRelations.add(region);
            }
        }
    }

    /**
     * Calcule la similitude entre deux variantes
     * @param variant1 Première variante
     * @param variant2 Seconde variante
     * @returns Score de similitude entre 0 et 1
     */
    private calculateSimilarity(
        variant1: Record<string, unknown>,
        variant2: Record<string, unknown>
    ): number {
        // Implémentation simplifiée pour l'exemple
        // Dans une version réelle, utiliserait des algorithmes de comparaison sophistiqués

        let matchingKeys = 0;
        let totalKeys = 0;

        // Comparer les clés et valeurs communes
        for (const key of Object.keys(variant1)) {
            if (key in variant2) {
                totalKeys++;
                if (JSON.stringify(variant1[key]) === JSON.stringify(variant2[key])) {
                    matchingKeys++;
                }
            }
        }

        // Ajouter les clés uniques à la seconde variante
        for (const key of Object.keys(variant2)) {
            if (!(key in variant1)) {
                totalKeys++;
            }
        }

        return totalKeys > 0 ? matchingKeys / totalKeys : 0;
    }

    /**
     * Adapte une variante d'une région à une autre
     * @param sourceVariant Variante source
     * @param sourceRegion Région source
     * @param targetRegion Région cible
     * @returns Variante adaptée
     */
    private adaptVariant(
        sourceVariant: Record<string, unknown>,
        sourceRegion: string,
        targetRegion: string
    ): Record<string, unknown> {
        // Copier la variante source
        const adaptedVariant = { ...sourceVariant };

        // Marquer comme adaptation
        adaptedVariant.adapted = true;
        adaptedVariant.sourceRegion = sourceRegion;
        adaptedVariant.targetRegion = targetRegion;

        // Appliquer des adaptations spécifiques à la région cible
        // Dans une implémentation réelle, utiliserait des règles d'adaptation plus sophistiquées

        return adaptedVariant;
    }

    /**
     * Cherche une variante d'une région similaire
     * @param expressionId ID de l'expression
     * @param context Contexte régional
     */
    private async findSimilarRegionVariant(
        expressionId: string,
        context: RegionalContext
    ): Promise<DialectVariant | null> {
        // Obtenir les relations pour ce signe
        const relationships = this.relationships.get(expressionId);
        if (!relationships) {
            return null;
        }

        // Chercher des régions reliées à la région cible
        for (const [region, relatedRegions] of relationships.entries()) {
            if (relatedRegions.has(context.region)) {
                // Région reliée trouvée, récupérer sa variante
                const variant = await this.getRegionalVariant(expressionId, region);
                if (variant) {
                    // Adapter la variante pour la région cible
                    const adaptedVariant = this.adaptVariant(variant, region, context.region);

                    return {
                        id: `${expressionId}_${context.region}`,
                        originalId: expressionId,
                        region: context.region,
                        type: 'modification',
                        parameters: adaptedVariant,
                        metadata: {
                            source: 'automatic',
                            confidence: 0.7,
                            lastUpdated: Date.now()
                        }
                    };
                }
            }
        }

        return null;
    }

    /**
     * Génère un identifiant de remplacement pour une variante
     * @param signId Identifiant du signe original
     * @param region Code régional
     * @returns Identifiant de remplacement
     */
    private generateReplacementId(signId: string, region: string): string {
        return `${signId}_${region}`;
    }

    /**
     * Récupère le niveau de confiance d'une variante
     * @param signId Identifiant du signe
     * @param region Code régional
     * @returns Niveau de confiance entre 0 et 1
     */
    private getVariantConfidence(signId: string, region: string): number {
        const regionMap = this.variantMappings[signId];
        if (!regionMap || !regionMap[region]) {
            return 0;
        }
        return regionMap[region].confidence;
    }

    /**
     * Vérifie si une variante a été validée par un locuteur natif
     * @param signId Identifiant du signe
     * @param region Code régional
     * @returns true si validé par un natif
     */
    private isValidatedByNative(signId: string, region: string): boolean {
        const regionMap = this.variantMappings[signId];
        if (!regionMap || !regionMap[region]) {
            return false;
        }
        return regionMap[region].validatedByNative;
    }

    /**
     * Récupère des notes culturelles pour une adaptation entre régions
     * @param sourceRegion Région source
     * @param targetRegion Région cible
     * @returns Notes culturelles ou undefined si non disponibles
     */
    private async getCulturalNotes(
        sourceRegion: string,
        targetRegion: string
    ): Promise<string | undefined> {
        // Dans une implémentation réelle, consulterait une base de données de notes culturelles
        const culturalNotesKey = `${sourceRegion}_to_${targetRegion}`;

        // Exemple de notes culturelles
        const culturalNotes: Record<string, string> = {
            'paris_to_marseille': 'Les signes marseillais ont tendance à utiliser plus d\'expressions faciales marquées.',
            'lyon_to_toulouse': 'Les signes toulousains ont souvent une influence occitane dans leur exécution.',
            'standard_to_alsace': 'Les signes alsaciens présentent une influence germanique notable.'
        };

        return culturalNotes[culturalNotesKey];
    }

    /**
     * Nettoie le cache en supprimant les entrées peu utilisées et anciennes
     */
    private cleanupCache(): void {
        const now = Date.now();

        // Trier les entrées du cache par fréquence d'utilisation
        const sortedEntries = Array.from(this.cacheHits.entries())
            .sort(([, hits1], [, hits2]) => hits2 - hits1);

        // Garder seulement les entrées les plus utilisées (max défini dans les options)
        if (sortedEntries.length > this.cacheOptions.maxSize) {
            const entriesToRemove = sortedEntries.slice(this.cacheOptions.maxSize);
            for (const [key] of entriesToRemove) {
                this.resultCache.delete(key);
                this.cacheHits.delete(key);
            }
        }

        // Supprimer les entrées trop anciennes
        for (const [key, value] of this.resultCache.entries()) {
            // Vérifier si l'entrée a un timestamp
            if (value && typeof value === 'object' && 'lastUpdated' in value) {
                const lastUpdated = (value as Record<string, unknown>).lastUpdated as number;
                if (now - lastUpdated > this.cacheOptions.ttl) {
                    this.resultCache.delete(key);
                    this.cacheHits.delete(key);
                }
            }
        }
    }

    /**
     * Estime l'utilisation mémoire du composant
     * @returns Estimation en octets
     */
    private estimateMemoryUsage(): number {
        // Estimation grossière basée sur la taille des structures de données
        const variantMappingsSize = Object.keys(this.variantMappings).length * 1000; // ~1KB par entrée
        const relationshipsSize = this.relationships.size * 500; // ~500B par relation
        const cacheSize = this.resultCache.size * 2000; // ~2KB par entrée de cache
        const variantsCacheSize = this.variantsCache.size * 5000; // ~5KB par entrée de cache de variantes
        const rulesCacheSize = this.substitutionRulesCache.size * 3000; // ~3KB par entrée de cache de règles

        return variantMappingsSize + relationshipsSize + cacheSize + variantsCacheSize + rulesCacheSize;
    }
}