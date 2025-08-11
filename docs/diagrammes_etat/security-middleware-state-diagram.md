stateDiagram-v2
    %% Entrée du flux de requête
    [*] --> RequestValidation: Requête entrante
    RequestValidation --> SecurityMiddleware: Validation initiale
    
    %% Middleware de Sécurité principal
    state "SecurityMiddleware" as SecurityMiddleware {
        %% Chaîne de middlewares de sécurité
        state "SecurityMiddlewareChain" as Chain {
            ErrorHandler --> RequestId: Première passe
            RequestId --> RateLimiting: Identifiant de requête 
            RateLimiting --> Authentication: Contrôle de débit
            Authentication --> SecurityHeaders: Vérification JWT
            SecurityHeaders --> IntrusionDetection: En-têtes sécurisés
            IntrusionDetection --> BehaviorAnalysis: Détection de menaces
            BehaviorAnalysis --> Compliance: Analyse comportementale
            Compliance --> DataSanitization: Validation réglementaire
            DataSanitization --> Encryption: Assainissement données
            Encryption --> SecurityAudit: Chiffrement
            
            %% Retour d'erreur possible à chaque étape
            ErrorHandler: Gestion unifiée des erreurs
            RateLimiting --> ErrorHandler: Limite dépassée
            Authentication --> ErrorHandler: Token invalide
            IntrusionDetection --> ErrorHandler: Menace détectée
            BehaviorAnalysis --> ErrorHandler: Comportement suspect
            Compliance --> ErrorHandler: Non-conformité
            DataSanitization --> ErrorHandler: Injection détectée
            Encryption --> ErrorHandler: Erreur cryptographique
        }
    }
    
    %% Connexions avec les systèmes externes
    SecurityMiddleware --> SystemeControleEthique: Validation éthique
    SecurityMiddleware --> ValidationCollaborative: Validation critique
    SystemeControleEthique --> SecurityMiddleware: Autorisation éthique
    ValidationCollaborative --> SecurityMiddleware: Consensus validation
    
    %% Intégration avec le gestionnaire de périmètre
    SecurityMiddleware --> SecurityPerimeterManager: Vérification d'accès interne
    SecurityPerimeterManager --> ZoneManager: Gestion des zones
    SecurityPerimeterManager --> RuleManager: Application des règles
    ZoneManager --> ValidationCollaborative: Validation zones sensibles
    RuleManager --> SystemeControleEthique: Validation règles
    
    %% Intégration avec le système de monitoring
    SecurityMiddleware --> MonitoringUnifie: Métriques de sécurité
    MonitoringUnifie --> SecurityAuditMiddleware: Alertes
    
    %% Orchestration centrale
    SystemeOrchestrateurCentral --> SecurityMiddleware: Demande sécurisée
    SecurityMiddleware --> SystemeOrchestrateurCentral: Réponse sécurisée
    SystemeOrchestrateurCentral --> IACore: Traitement intelligence
    
    %% Systèmes pour interagir avec l'utilisateur
    IACore --> AvatarSourd: Expressions LSF
    IACore --> AvatarEntendant: Expressions orales
    
    %% Connexions avec le Système d'Évaluation
    SecurityMiddleware --> EvaluationPerformance: Analyse performances
    EvaluationPerformance --> SecurityMiddleware: Optimisations
    
    %% État final pour les réponses
    SecurityMiddleware --> ResponseProcessing: Traitement réponse
    ResponseProcessing --> [*]: Réponse sécurisée
    
    %% Flux d'erreur
    SecurityMiddleware --> ErrorResponse: Erreur de sécurité
    ErrorResponse --> [*]: Erreur retournée

    %% Notes explicatives
    note right of SecurityMiddleware
        Chaîne modulaire de middlewares
        pour protéger l'API externe
    end note
    
    note right of SecurityPerimeterManager
        Système pour la gestion des
        accès entre zones internes
    end note
    
    note left of SystemeControleEthique
        Vérification de la conformité
        aux principes éthiques
    end note
    
    note left of ValidationCollaborative
        Validation par consensus
        des opérations critiques
    end note
