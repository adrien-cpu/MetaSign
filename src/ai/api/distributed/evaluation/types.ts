// src/ai/api/distributed/evaluation/types.ts

/**
 * Structure représentant les données d'entraînement
 */
export interface TrainingData {
    /** Identifiant unique du jeu de données */
    id: string;
    /** Nom du jeu de données */
    name: string;
    /** Version du jeu de données */
    version: string;
    /** Date de création */
    createdAt: Date;
    /** Nombre d'échantillons */
    sampleCount: number;
    /** Caractéristiques des données */
    features: string[];
    /** Étiquettes disponibles */
    labels?: string[];
    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
    /** Données brutes ou référence aux données */
    data: unknown[] | string;
}

/**
 * Interface pour les problèmes de qualité identifiés
 */
export interface QualityIssue {
    /** Type de problème */
    type: 'missing_data' | 'inconsistency' | 'bias' | 'imbalance' | 'noise' | 'outlier' | string;
    /** Sévérité du problème (0-1) */
    severity: number;
    /** Description détaillée */
    description: string;
    /** Localisation du problème (attributs, indices, etc.) */
    location?: string[];
    /** Impact potentiel */
    impact?: string;
    /** Exemples de données problématiques */
    examples?: unknown[];
}

/**
 * Interface pour les recommandations d'amélioration de qualité
 */
export interface QualityRecommendation {
    /** Identifiant unique */
    id: string;
    /** Type de recommandation */
    type: 'cleaning' | 'augmentation' | 'balancing' | 'normalization' | 'transformation' | string;
    /** Description de la recommandation */
    description: string;
    /** Actions spécifiques à entreprendre */
    actions: string[];
    /** Impact attendu */
    expectedImpact: {
        /** Score de qualité avant */
        before: number;
        /** Score de qualité prévu après */
        after: number;
        /** Amélioration en pourcentage */
        improvement: number;
    };
    /** Priorité de la recommandation (1-10) */
    priority: number;
    /** Complexité de mise en œuvre (1-10) */
    complexity: number;
}

/**
 * Résultats de vérification de cohérence
 */
export interface ConsistencyResult {
    /** Score global de cohérence (0-1) */
    score: number;
    /** Problèmes identifiés */
    issues: {
        /** Type d'incohérence */
        type: string;
        /** Description du problème */
        description: string;
        /** Gravité (0-1) */
        severity: number;
    }[];
    /** Validations réussies */
    validations: {
        /** Type de validation */
        type: string;
        /** Résultat */
        result: boolean;
    }[];
}

/**
 * Résultats d'analyse de distribution
 */
export interface DistributionResult {
    /** Score de qualité de distribution (0-1) */
    score: number;
    /** Statistiques par caractéristique */
    featureStats: Record<string, {
        /** Moyenne */
        mean?: number;
        /** Médiane */
        median?: number;
        /** Écart-type */
        stdDev?: number;
        /** Minimum */
        min?: number;
        /** Maximum */
        max?: number;
        /** Skewness (asymétrie) */
        skewness?: number;
        /** Kurtosis (aplatissement) */
        kurtosis?: number;
        /** Distribution estimée */
        distribution?: string;
    }>;
    /** Déséquilibres identifiés */
    imbalances: {
        /** Caractéristique concernée */
        feature: string;
        /** Sévérité du déséquilibre (0-1) */
        severity: number;
        /** Description du déséquilibre */
        description: string;
    }[];
    /** Corrélations significatives */
    correlations: {
        /** Première caractéristique */
        feature1: string;
        /** Seconde caractéristique */
        feature2: string;
        /** Coefficient de corrélation */
        coefficient: number;
    }[];
}

/**
 * Résultats de détection de biais
 */
export interface BiasResult {
    /** Score global d'équité (0-1) */
    score: number;
    /** Biais identifiés */
    biases: {
        /** Type de biais */
        type: string;
        /** Caractéristiques concernées */
        features: string[];
        /** Sévérité du biais (0-1) */
        severity: number;
        /** Description du biais */
        description: string;
    }[];
    /** Attributs sensibles */
    sensitiveAttributes: string[];
    /** Métriques d'équité */
    fairnessMetrics: {
        /** Disparité démographique */
        demographicParity?: number;
        /** Égalité des chances */
        equalOpportunity?: number;
        /** Égalité des résultats */
        equalizedOdds?: number;
    };
}

/**
 * Métriques pour l'évaluation de la qualité des données
 */
export interface DataQualityMetrics {
    /** Score global de qualité (0-1) */
    score: number;
    /** Problèmes de qualité identifiés */
    issues: QualityIssue[];
    /** Recommandations d'amélioration */
    recommendations: QualityRecommendation[];
}

/**
 * Évaluation des risques
 */
export interface RiskAssessment {
    /** Type de risque */
    type: string;
    /** Probabilité (0-1) */
    probability: number;
    /** Impact potentiel (0-1) */
    impact: number;
    /** Score de risque (probabilité x impact) */
    score: number;
    /** Description du risque */
    description: string;
    /** Actions de mitigation recommandées */
    mitigationActions?: string[];
}

/**
 * Tendance de fiabilité
 */
export interface ReliabilityTrend {
    /** Période de temps */
    period: string;
    /** Score de fiabilité */
    score: number;
    /** Changement par rapport à la période précédente */
    change: number;
    /** Direction du changement */
    direction: 'up' | 'down' | 'stable';
    /** Facteurs contributifs */
    factors: {
        /** Nom du facteur */
        name: string;
        /** Impact sur le score */
        impact: number;
    }[];
}

/**
 * Score de fiabilité
 */
export interface ReliabilityScore {
    /** Score global (0-1) */
    score: number;
    /** Niveau de confiance dans le score (0-1) */
    confidence: number;
    /** Tendances historiques */
    trends: ReliabilityTrend[];
    /** Risques identifiés */
    risks: RiskAssessment[];
}

/**
 * Métriques de performance
 */
export interface PerformanceMetrics {
    /** Efficacité de calcul */
    computeEfficiency: number;
    /** Utilisation de la mémoire */
    memoryUsage: MemoryMetrics;
    /** Latence */
    latency: LatencyMetrics;
    /** Débit */
    throughput: ThroughputMetrics;
    /** Score global de performance */
    score: number;
}

/**
 * Métriques de mémoire
 */
export interface MemoryMetrics {
    /** Usage total (Mo) */
    totalUsage: number;
    /** Pic d'utilisation (Mo) */
    peakUsage: number;
    /** Fuites détectées (Mo) */
    leakage: number;
    /** Fragmentation (0-1) */
    fragmentation: number;
    /** Efficacité d'allocation (0-1) */
    allocationEfficiency: number;
    /** Utilisation par composant */
    usageByComponent?: Record<string, number>;
}

/**
 * Métriques de latence
 */
export interface LatencyMetrics {
    /** Latence moyenne (ms) */
    average: number;
    /** Percentile 95 (ms) */
    p95: number;
    /** Percentile 99 (ms) */
    p99: number;
    /** Latence maximale (ms) */
    max: number;
    /** Stabilité de la latence (0-1) */
    stability: number;
    /** Latence par opération */
    byOperation?: Record<string, number>;
}

/**
 * Métriques de débit
 */
export interface ThroughputMetrics {
    /** Requêtes par seconde */
    requestsPerSecond: number;
    /** Transactions par seconde */
    transactionsPerSecond: number;
    /** Opérations par seconde */
    operationsPerSecond: number;
    /** Capacité maximale */
    maxCapacity: number;
    /** Utilisation (% de capacité) */
    utilizationPercentage: number;
    /** Évolutivité (0-1) */
    scalability: number;
}

/**
 * Métriques CPU
 */
export interface CPUMetrics {
    /** Utilisation moyenne (%) */
    usage: number;
    /** Pic d'utilisation (%) */
    peak: number;
    /** Temps d'attente moyen (ms) */
    wait: number;
    /** Nombre de threads */
    threads: number;
    /** Nombre de cœurs utilisés */
    cores: number;
    /** Efficacité d'utilisation (0-1) */
    efficiency: number;
}

/**
 * Métriques GPU
 */
export interface GPUMetrics {
    /** Utilisation moyenne (%) */
    usage: number;
    /** Pic d'utilisation (%) */
    peak: number;
    /** Mémoire utilisée (Mo) */
    memory: number;
    /** Température (°C) */
    temperature: number;
    /** Efficacité d'utilisation (0-1) */
    efficiency: number;
    /** Disponibilité (%) */
    availability: number;
}

/**
 * Métriques réseau
 */
export interface NetworkMetrics {
    /** Bande passante utilisée (Mbps) */
    bandwidth: number;
    /** Paquets par seconde */
    packetsPerSecond: number;
    /** Temps d'aller-retour (ms) */
    roundTripTime: number;
    /** Taux de perte de paquets (%) */
    packetLoss: number;
    /** Jitter (ms) */
    jitter: number;
    /** Connexions actives */
    activeConnections: number;
}

/**
 * Métriques de stockage
 */
export interface StorageMetrics {
    /** Espace utilisé (Go) */
    usedSpace: number;
    /** Espace disponible (Go) */
    availableSpace: number;
    /** Opérations de lecture par seconde */
    readOps: number;
    /** Opérations d'écriture par seconde */
    writeOps: number;
    /** Latence de lecture (ms) */
    readLatency: number;
    /** Latence d'écriture (ms) */
    writeLatency: number;
    /** Taux de fragmentation (%) */
    fragmentation: number;
}

/**
 * Métriques de nœud
 */
export interface NodeMetrics {
    /** Ressources utilisées */
    resources: {
        /** Métriques CPU */
        cpu: CPUMetrics;
        /** Métriques GPU */
        gpu: GPUMetrics;
        /** Métriques mémoire */
        memory: MemoryMetrics;
    };
    /** Métriques réseau */
    network: NetworkMetrics;
    /** Métriques stockage */
    storage: StorageMetrics;
}