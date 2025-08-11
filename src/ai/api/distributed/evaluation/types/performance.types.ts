/**
 * performance.types.ts
 * 
 * Types de données pour l'évaluation des performances des nœuds distribués.
 */

/**
 * Informations sur l'utilisation du processeur
 */
export interface CpuInfo {
    /** Nombre de cœurs du processeur */
    cores: number;
    /** Fréquence du processeur en GHz */
    frequency: number;
    /** Taux d'utilisation du processeur (0-1) */
    utilization: number;
    /** Température du processeur en degrés Celsius */
    temperature: number;
}

/**
 * Informations sur l'utilisation de la mémoire
 */
export interface MemoryInfo {
    /** Mémoire totale disponible en Mo */
    total: number;
    /** Mémoire utilisée en Mo */
    used: number;
    /** Efficacité de l'utilisation de la mémoire (0-1) */
    efficiency: number;
}

/**
 * Informations sur l'utilisation du GPU
 */
export interface GpuInfo {
    /** Modèle du GPU */
    model: string;
    /** Mémoire totale du GPU en Mo */
    memory: number;
    /** Taux d'utilisation du GPU (0-1) */
    utilization: number;
    /** Température du GPU en degrés Celsius */
    temperature: number;
}

/**
 * Informations sur l'utilisation du réseau
 */
export interface NetworkInfo {
    /** Bande passante disponible en Mbps */
    bandwidth: number;
    /** Taux d'utilisation du réseau (0-1) */
    utilization: number;
    /** Taux de perte de paquets (0-1) */
    packetLoss: number;
}

/**
 * Informations sur l'utilisation du disque
 */
export interface DiskUsageInfo {
    /** Espace disque total en Mo */
    total: number;
    /** Espace disque utilisé en Mo */
    used: number;
    /** Vitesse de lecture en Mo/s */
    readSpeed: number;
    /** Vitesse d'écriture en Mo/s */
    writeSpeed: number;
}

/**
 * Utilisation des ressources d'un nœud
 */
export interface ResourceUtilization {
    /** Informations sur le CPU */
    cpu: CpuInfo;
    /** Informations sur la mémoire */
    memory: MemoryInfo;
    /** Informations sur le GPU (optionnel) */
    gpu?: GpuInfo;
    /** Informations sur le réseau */
    network: NetworkInfo;
}

/**
 * Métriques détaillées d'un nœud
 */
export interface NodeMetrics {
    /** Identifiant du nœud */
    nodeId: string;
    /** Timestamp de la collecte des métriques */
    timestamp: number;
    /** Temps de fonctionnement du nœud en secondes */
    uptime: number;
    /** Informations sur l'utilisation des ressources */
    resources: ResourceUtilization;
    /** Système d'exploitation du nœud */
    operatingSystem: string;
    /** Charge système (load average) */
    systemLoad: number;
    /** Nombre de connexions réseau actives */
    networkConnections: number;
    /** Informations sur l'utilisation du disque */
    diskUsage: DiskUsageInfo;
}

/**
 * Résultats des benchmarks de performance
 */
export interface BenchmarkResult {
    /** Identifiant du nœud évalué */
    nodeId: string;
    /** Timestamp du benchmark */
    timestamp: number;
    /** Latence réseau en millisecondes */
    networkLatency: number;
    /** Temps de traitement en millisecondes */
    processingTime: number;
    /** Débit en opérations par seconde */
    throughput: number;
    /** Nombre de requêtes traitées pendant le test */
    requestsHandled: number;
    /** Durée totale du test en millisecondes */
    testDuration: number;
    /** Taux d'erreur (0-1) */
    errorRate: number;
    /** Charge maximale supportée */
    maxLoad: number;
    /** Détails supplémentaires spécifiques au benchmark */
    details?: Record<string, unknown>;
}

/**
 * Métriques de performance calculées
 */
export interface PerformanceMetrics {
    /** Score d'efficacité de calcul (0-1, plus haut = meilleur) */
    computeEfficiency: number;
    /** Score d'utilisation de la mémoire (0-1, plus bas = meilleur) */
    memoryUsage: number;
    /** Score de latence (0-1, plus bas = meilleur) */
    latency: number;
    /** Score de débit (0-1, plus haut = meilleur) */
    throughput: number;
    /** Score global de performance (0-1) */
    score: number;
    /** Timestamp de l'évaluation */
    timestamp: number;
    /** Identifiant du nœud évalué */
    nodeId: string;
    /** Version du modèle évalué */
    modelVersion: string;
    /** Itération d'entraînement */
    trainingIteration: number;
    /** Métriques additionnelles */
    additionalMetrics: {
        /** Utilisation du CPU (0-1) */
        cpuUtilization: number;
        /** Utilisation du GPU (0-1) */
        gpuUtilization: number;
        /** Efficacité de la mémoire (0-1) */
        memoryEfficiency: number;
        /** Latence réseau en millisecondes */
        networkLatency: number;
        /** Temps de traitement en millisecondes */
        processingTime: number;
        /** Précision de prédiction (0-1) */
        predictionAccuracy: number;
        /** Métriques personnalisées supplémentaires */
        [key: string]: number;
    };
}

/**
 * Rapport détaillé d'évaluation des performances
 */
export interface PerformanceReport {
    /** Métriques de performance */
    metrics: PerformanceMetrics;
    /** Score de comparaison avec la référence (-1 à 1) */
    baselineComparison: number;
    /** Score de tendance par rapport aux évaluations précédentes (-1 à 1) */
    trend: number;
    /** Recommandations d'optimisation */
    recommendations: string[];
    /** Points critiques identifiés */
    criticalPoints: Array<{
        /** Nom du point critique */
        name: string;
        /** Description du problème */
        description: string;
        /** Sévérité (1-5) */
        severity: number;
        /** Suggestions de résolution */
        suggestions: string[];
    }>;
    /** Historique des performances */
    history: Array<{
        /** Timestamp */
        timestamp: number;
        /** Score */
        score: number;
        /** Version du modèle */
        modelVersion: string;
    }>;
    /** Timestamp du rapport */
    timestamp: number;
    /** Validité du rapport en secondes */
    validity: number;
}