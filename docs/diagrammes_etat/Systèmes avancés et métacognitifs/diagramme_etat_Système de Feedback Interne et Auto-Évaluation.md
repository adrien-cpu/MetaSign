stateDiagram-v2
    %% Structure principale du système de feedback interne
    state "SystemeFeedbackInterne" as SFI {
        state "AutoEvaluationContinue" as AEC {
            DetectionLacunes --> AnalyseRacinesCauses
            AnalyseRacinesCauses --> PropositionAmeliorations
            PropositionAmeliorations --> PrioritisationChangements
        }
        
        state "MesurePerformanceInterne" as MPI {
            MetriquesPrecision --> MetriquesCoherence
            MetriquesCoherence --> MetriquesNaturalite
            MetriquesNaturalite --> ScoreGlobalQualite
        }
        
        state "DiagnosticCompetencesLSF" as DCL {
            EvaluationLexique --> EvaluationGrammaire
            EvaluationGrammaire --> EvaluationPragmatique
            EvaluationPragmatique --> CartographieCompetences
        }
        
        state "ApprentissageDesLacunes" as ADL {
            IdentificationPointsFaibles --> RecommandationRessources
            RecommandationRessources --> PlanAcquisitionCompetences
            PlanAcquisitionCompetences --> ValidationProgressions
        }
        
        state "FeedbackPedagogique" as FP {
            AnalyseProgressionApprenants --> IdentificationObstacles
            IdentificationObstacles --> SuggestionsStrategies
            SuggestionsStrategies --> AdaptationContenusPedagogiques
        }
    }
    
    %% Connexions avec les systèmes principaux
    SystemeIACore --> SFI: Donnees performances 
    SFI --> SystemeIACore: Plans amelioration
    
    SystemeExpressions --> SFI: Qualite expressions
    SFI --> SystemeExpressions: Ajustements expressifs
    
    PyramideIALSF --> SFI: Capacites actuelles
    SFI --> PyramideIALSF: Lacunes identifiees
    
    %% Connexions spécifiques au contexte éducatif
    SFI --> AdaptationMatieresSourds: Strategies pedagogiques
    SFI --> EnseignementLSFEntendants: Recommandations didactiques
    
    %% États spécifiques pour le contexte éducatif
    state "AdaptationMatieresSourds" as AMS {
        AnalyseMatiereComplexe --> SimplificationConcepts
        SimplificationConcepts --> VisualisationPedagogique
        VisualisationPedagogique --> ValidationComprehension
    }
    
    state "EnseignementLSFEntendants" as ELE {
        ProgressionPedagogique --> ExercicesPratiques
        ExercicesPratiques --> FeedbackCorrectif
        FeedbackCorrectif --> EvaluationAcquisition
    }
    
    %% Connexions du feedback pédagogique
    FP --> AMS: Adaptation contenu sourds
    FP --> ELE: Adaptation apprentissage LSF
    
    %% Système de création de contenu
    state "CreationContenuAdapte" as CCA {
        AnalysePublicCible --> ConceptionStrategique
        ConceptionStrategique --> ProductionContenu
        ProductionContenu --> ValidationPertinence
    }
    
    SFI --> CCA: Recommandations creation
    DCL --> CCA: Niveau competences adapte