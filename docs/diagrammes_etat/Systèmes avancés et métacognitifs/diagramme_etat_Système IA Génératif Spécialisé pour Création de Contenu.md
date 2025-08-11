stateDiagram-v2
    %% Système principal IA Génératif pour contenu
    state "SystemeIAGeneratifSpecialise" as SIGS {
        state "MoteurCreationContenu" as MCC {
            AnalyseObjectifsPedagogiques --> ConceptionSequencesApprentissage
            ConceptionSequencesApprentissage --> GenerationAssetsMultimedia
            GenerationAssetsMultimedia --> IntegrationCoherente
        }
        
        state "AdaptateurModalites" as AM {
            GenerationContenusAR --> GenerationContenusVR
            GenerationContenusVR --> GenerationSupportsInteractifs
            GenerationSupportsInteractifs --> GenerationJeuxEducatifs
        }
        
        state "PersonnalisationContextuelle" as PC {
            ProfilageApprenant --> AdaptationNiveauDifficulte
            AdaptationNiveauDifficulte --> OptimisationPresentationContenu
            OptimisationPresentationContenu --> SuiviProgression
        }
        
        state "GenerationVisuellePedagogique" as GVP {
            ConceptionSchemas --> GenerationAnimations
            GenerationAnimations --> ConceptionInfographies
            ConceptionInfographies --> IllustrationsConcepts
        }
        
        state "GenerationExercicesInteractifs" as GEI {
            AnalyseObjectifsCompetences --> CreationSequencesInteractives
            CreationSequencesInteractives --> GenerationFeedbackContextuel
            GenerationFeedbackContextuel --> AdaptationDifficulteProgressive
        }
    }
    
    %% Connexions avec le système existant
    SystemeIACore --> SIGS: Competences cognitives
    PyramideIALSF --> SIGS: IA Generative (Niveau 8)
    SystemeFeedbackInterne --> SIGS: Recommandations amelioration
    
    %% Connexions spécifiques avec composants génératifs
    SystemeMistralConversationnel --> SIGS: Capacites linguistiques
    SIGS --> AvatarLSF: Contenu adapte LSF
    
    %% Applications concrètes
    state "ApplicationsPedagogiques" as AP {
        state "EnvironnementsImmersifs" as EI {
            MondesVirtuelsEducatifs --> SimulationsInteractives
            SimulationsInteractives --> ExperiencesCollaboratives
        }
        
        state "SupportsCours" as SC {
            PresentationsVisuelles --> DocumentsInteractifs
            DocumentsInteractifs --> FichesActivites
        }
        
        state "EvaluationAdaptative" as EA {
            QCMInteractifs --> ExercicesApplications
            ExercicesApplications --> ProjectsCreatifs
        }
        
        state "ActivitesLudiques" as AL {
            JeuxEducatifs --> DefisApprentissage
            DefisApprentissage --> MissionsCollaboratives
        }
    }
    
    %% Connexions avec applications concrètes
    SIGS --> AP: Alimentation contenu
    PC --> AP: Personnalisation experience
    MCC --> SC: Generation supports
    AM --> EI: Creation environnements
    GEI --> EA: Conception evaluations
    GVP --> AP: Assets visuels
    
    %% Intégrations technologiques
    state "IntegrationsTechnologiques" as IT {
        state "PlateformesAR" as PAR {
            ExperiencesPortables --> ExperiencesTablettesSmarphones
            ExperiencesTablettesSmarphones --> LunettesAR
        }
        
        state "SystemesVR" as SVR {
            CasquesAutonomes --> ExperiencesImmersivesSalle
            ExperiencesImmersivesSalle --> InteractionsMultiUtilisateurs
        }
        
        state "SupportsTactiles" as ST {
            TableauxInteractifs --> TablettesEducatives
            TablettesEducatives --> ApplicationsMobiles
        }
        
        state "SystemesHaptiques" as SH {
            RetourSensoriel --> DevicesHaptiques
            DevicesHaptiques --> GantsInteractifs
        }
    }
    
    %% Connexions technologies
    AM --> IT: Integration technique
    IT --> AP: Support technologique