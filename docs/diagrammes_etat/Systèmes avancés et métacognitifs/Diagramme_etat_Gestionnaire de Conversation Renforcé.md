stateDiagram-v2
    %% Points d'entrée du système
    [*] --> GestionnaireConversation
    EntreeUtilisateur --> GestionnaireConversation
    WebhookExterne --> GestionnaireConversation
    APIRequest --> GestionnaireConversation
    
    %% Gestionnaire de Conversation Principal
    state "GestionnaireConversation" as GC {
        state "AnalyseRequete" as AR {
            DetectionIntention --> AnalyseContextuelle
            AnalyseContextuelle --> ClassificationRequete
            ClassificationRequete --> EvaluationPriorite
        }
        
        state "DistributionIntelligente" as DI {
            SelectionProcesseurs --> SequencementOperations
            SequencementOperations --> ParallelisationRequetes
            ParallelisationRequetes --> AggregationResultats
        }
        
        state "CoordinationReponse" as CR {
            GenerationOptionsReponse --> SelectionMeilleureOption
            SelectionMeilleureOption --> OptimisationPresentation
            OptimisationPresentation --> ValidationCoherence
        }
        
        state "GestionEtatConversation" as GEC {
            MaintienContexte --> TrackingVariables
            TrackingVariables --> SauvegardeEtat
            SauvegardeEtat --> RestaurarionContexte
        }
        
        state "GestionFluxUtilisateur" as GFU {
            AnticipationQuestions --> CreationCheminConversationnel
            CreationCheminConversationnel --> AdaptationDynamique
            AdaptationDynamique --> RefinementContinuExperience
        }
        
        %% Connexions internes
        AR --> DI: Requête analysée
        DI --> CR: Résultats à présenter
        CR --> GEC: Mise à jour contexte
        GEC --> GFU: État mis à jour
        GFU --> AR: Guide prochaine analyse
    }
    
    %% Intégration avec le Système d'Apprentissage
    state "SystemeApprentissageAdaptatif" as SAA {
        ProfilageUtilisateur --> AnalysePreferences
        AnalysePreferences --> OptimisationPersonnalisee
        OptimisationPersonnalisee --> ValidationAmeliorations
    }
    
    %% Intégration avec la Pyramide IA
    state "PyramideIA" as PIA {
        state "NiveauxAnalyse" as NA {
            IA_Exploratrices --> IA_Collectrices
            IA_Collectrices --> IA_Preparatrices
        }
        
        state "NiveauxDecision" as ND {
            IA_Spectatrices --> IA_Gestionnaires
            IA_Gestionnaires --> IA_Analystes
        }
        
        state "NiveauxInteraction" as NI {
            IA_Mentor --> IA_Generatives
            IA_Generatives --> IA_Ethiciennes
        }
    }
    
    %% Intégration avec le Système d'Expression
    state "SystemeExpressions" as SE {
        GenerationLSF --> OptimisationExpressive
        OptimisationExpressive --> RenderingAvatar
    }
    
    %% Intégration avec le Système Émotionnel
    state "SystemeEmotionnel" as SEM {
        AnalyseEmotionUtilisateur --> SelectionTonaliteAppropriee
        SelectionTonaliteAppropriee --> AjustementExpressionEmotionnelle
    }
    
    %% Système d'Intervention Proactive
    state "SystemeInterventionProactive" as SIP {
        AnalyseSignauxConfusion --> DetectionBesoinAssistance
        DetectionBesoinAssistance --> InitiationInteraction
        InitiationInteraction --> SuggestionProactive
    }
    
    %% Connectivité avec les utilisateurs
    state "InterfacesUtilisateur" as IU {
        InterfaceWeb --> InterfaceMobile
        InterfaceMobile --> IntegrationsMessagingAPIs
        IntegrationsMessagingAPIs --> ConnecteursIoT
    }
    
    %% Connexions entre systèmes
    GC --> SAA: Données utilisateur
    SAA --> GC: Adaptations personnalisées
    
    GC --> PIA: Requêtes à traiter
    PIA --> GC: Résultats traitement
    
    GC --> SE: Contenu à exprimer
    SE --> GC: Expressions LSF
    
    GC --> SEM: Contexte émotionnel
    SEM --> GC: Ajustements émotionnels
    
    GC --> SIP: Signaux utilisateur
    SIP --> GC: Interventions suggérées
    
    GC --> IU: Réponses finales
    IU --> GC: Entrées utilisateur
    
    %% Circuit de feedback
    state "CircuitFeedback" as CF {
        CollecteRetours --> AnalyseQualiteInteraction
        AnalyseQualiteInteraction --> IdentificationAmeliorationsPossibles
        IdentificationAmeliorationsPossibles --> PrioritisationAjustements
        PrioritisationAjustements --> ImplementationChangements
    }
    
    GC --> CF: Données interaction
    CF --> GC: Améliorations
    CF --> SAA: Données apprentissage
    
    %% Note explicative
    note right of GC
        Le Gestionnaire de Conversation agit comme:
        - Point central des interactions
        - Orchestrateur de services
        - Gardien du contexte
        - Optimisateur d'expérience
        tout en respectant la séparation des responsabilités
    end note