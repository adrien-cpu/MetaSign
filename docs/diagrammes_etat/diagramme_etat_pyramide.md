flowchart TD
    %% Nœuds principaux
    PyramideIACore["PyramideIACore"]
    PCache["Système de Cache\nPyramidCache"]
    PProcessor["Traitement Parallèle\nParallelProcessingManager"]
    PValidator["Validation des Données\nPyramidDataValidator"]
    PMetrics["Métriques Avancées\nAdvancedMetricsCollector"]
    
    %% Composants du niveau PyramideIACore
    subgraph Core["Cœur de la Pyramide IA"]
        PyramideIACore --> Levels["Gestion des Niveaux"]
        PyramideIACore --> Metrics["Métriques de Performance"]
        PyramideIACore --> UpFlow["Flux Montant\nprocessUp()"]
        PyramideIACore --> DownFlow["Flux Descendant\nprocessDown()"]
    end
    
    %% Système de Cache
    subgraph Cache["Cache Intelligent"]
        PCache --> CacheStrategy["Stratégies de Cache\nLRU, LFU, FIFO, Adaptive"]
        PCache --> CacheMetrics["Métriques de Cache"]
        PCache --> CachePredict["Préchargement Prédictif"]
    end
    
    %% Traitement Parallèle
    subgraph Parallel["Traitement Parallèle"]
        PProcessor --> TaskQueue["File d'Attente Prioritaire"]
        PProcessor --> Concurrency["Gestion de Concurrence"]
        PProcessor --> FailureHandling["Gestion des Échecs"]
        PProcessor --> BatchProcessing["Traitement par Lots"]
    end
    
    %% Validation des Données
    subgraph Validation["Validation des Données"]
        PValidator --> Schemas["Schémas de Validation"]
        PValidator --> Rules["Règles de Validation"]
        PValidator --> ErrorHandling["Gestion des Erreurs"]
    end
    
    %% Métriques Avancées
    subgraph Metrics["Métriques Avancées"]
        PMetrics --> MetricTypes["Types de Métriques"]
        PMetrics --> Aggregation["Agrégation Statistique"]
        PMetrics --> Alerts["Système d'Alertes"]
        PMetrics --> TimeSeries["Séries Temporelles"]
    end
    
    %% Interconnexions
    PyramideIACore <--> PCache
    PyramideIACore <--> PProcessor
    PyramideIACore <--> PValidator
    PyramideIACore <--> PMetrics
    
    %% Flux de données
    InputData["Données d'Entrée"] --> PValidator
    PValidator --> PProcessor
    PProcessor --> PyramideIACore
    PyramideIACore --> PCache
    PyramideIACore --> OutputData["Données de Sortie"]
    
    %% Monitoring
    PMetrics --> Monitoring["Supervision et Dashboards"]
    
    %% Légende
    classDef core fill:#f9f,stroke:#333,stroke-width:2px
    classDef cache fill:#bbf,stroke:#333,stroke-width:1px
    classDef parallel fill:#bfb,stroke:#333,stroke-width:1px
    classDef validation fill:#fbb,stroke:#333,stroke-width:1px
    classDef metrics fill:#ffb,stroke:#333,stroke-width:1px
    
    class Core core
    class Cache cache
    class Parallel parallel
    class Validation validation
    class Metrics metrics
