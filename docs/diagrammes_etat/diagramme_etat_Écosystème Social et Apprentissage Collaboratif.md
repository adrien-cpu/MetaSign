stateDiagram-v2
    %% Points d'entrée du système
    [*] --> EcosystemeSocialCollaboratif
    UtilisateurConnecte --> EcosystemeSocialCollaboratif
    
    %% Structure principale de l'écosystème
    state "EcosystemeSocialCollaboratif" as ESC {
        state "ClubsThematiques" as CT {
            state "MecanismeCreation" as MCC {
                PropositionTheme --> ValidationAdmins
                ValidationAdmins --> ConfigurationClub
                ConfigurationClub --> RecrutementMembres
            }
            
            state "MecanismeVote" as MCV {
                PropositionContenu --> VoteMembres
                VoteMembres --> AnalyseConsensus
                AnalyseConsensus --> IntegrationSiSeuil80
            }
            
            state "GestionCommunaute" as GCom {
                ModerationsInterne --> RecompenseContribution
                RecompenseContribution --> SystemeNiveaux
                SystemeNiveaux --> PrivilegesProgressifs
            }
        }
        
        state "EspacesConversation" as EC {
            state "ChatsPublics" as CP {
                DemarrerConversation --> InviterParticipants
                InviterParticipants --> EchangeMessages
                EchangeMessages --> ArchivageDynamique
            }
            
            state "ChatsPrives" as CPri {
                InitierConversation --> SelectionParticipants
                SelectionParticipants --> EchangeSecurise
                EchangeSecurise --> SauvegardeChiffree
            }
            
            state "ObservationIA" as OIA {
                AnalyseConversations --> ExtractionPatterns
                ExtractionPatterns --> IdentificationTendances
                IdentificationTendances --> EnrichissementModeles
            }
        }
        
        state "GlossaireCommunautaire" as GC {
            state "SignesStandard" as SS {
                SoumissionSigne --> ValidationExperts
                ValidationExperts --> CategorisationThematique
                CategorisationThematique --> PublicationGlossaire
            }
            
            state "SignesProblematiques" as SP {
                SignalementErreurIA --> AnalyseDivergence
                AnalyseDivergence --> PropositionCorrection
                PropositionCorrection --> VoteUtilisateurs
            }
            
            state "EvolutionLSF" as ELSF {
                DetectionNouveauxSignes --> DocumentationOrigine
                DocumentationOrigine --> ValidationLinguistique
                ValidationLinguistique --> IntegrationGlossaire
            }
        }
        
        state "ParticipationIARenforcee" as PIR {
            state "IAObservatrice" as IAO {
                ObservationPassive --> AnalyseInteractions
                AnalyseInteractions --> EnrichissementContextuel
                EnrichissementContextuel --> AmeliorationModeles
            }
            
            state "IAParticipative" as IAP {
                IntegrationConversation --> ContributionThematique
                ContributionThematique --> InteractionNaturelle
                InteractionNaturelle --> AdaptationContexte
            }
            
            state "RetourUtilisateurs" as RU {
                EvaluationPerformanceIA --> NotationPrecision
                NotationPrecision --> CommentairesAmelioration
                CommentairesAmelioration --> TraitementFeedback
            }
        }
    }
    
    %% Connexions avec les systèmes existants
    ESC --> SystemeApprentissageAdaptatif: Donnees apprentissage
    ESC --> ValidationCollaborative: Contenu valide
    SystemeIACore --> ESC: Capacites IA
    
    %% Connexions internes
    CT --> EC: Discussions thematiques
    EC --> GC: Identification signes
    GC --> PIR: Amelioration modeles
    PIR --> CT: Participation IA
    
    %% Mécanismes d'intégration des connaissances
    state "IntegrationConnaissancesAcquises" as ICA {
        state "ValidationMultiNiveau" as VMN {
            ValidationCommunautaire --> ValidationExperte
            ValidationExperte --> ValidationAlgorithmique
            ValidationAlgorithmique --> DecisionIntegration
        }
        
        state "ClassificationConnaissances" as CC {
            CategorieLexicale --> CategorieGrammaticale
            CategorieGrammaticale --> CategorieContextuelle
            CategorieContextuelle --> MetadonneesAssociees
        }
        
        state "ProcessusIntegration" as PI {
            PreparationDonnees --> TestIntegration
            TestIntegration --> IntegrationControleeIA
            IntegrationControleeIA --> MesureImpact
        }
    }
    
    %% Connexion intégration des connaissances
    MCV --> ICA: Contenus votes > 80%
    SP --> ICA: Corrections validees
    IAO --> ICA: Patterns detectes
    ICA --> SystemeIACore: Nouvelles connaissances
    
    %% Mécanismes de surveillance terrains
    state "ObservationTerrainReel" as OTR {
        state "CaptureContextuelle" as CCT {
            EnregistrementVideo --> AnalyseEnvironnement
            AnalyseEnvironnement --> IdentificationDefis
            IdentificationDefis --> ClassificationSituations
        }
        
        state "AdaptationSituationnelle" as AS {
            DetectionConditionsDifficiles --> AjustementStrategies
            AjustementStrategies --> OptimisationResultats
            OptimisationResultats --> ApprentissageSituationnel
        }
        
        state "InterventionContextuelle" as ICT {
            AnalyseMomentOpportun --> PreparationIntervention
            PreparationIntervention --> IntegrationNaturelle
            IntegrationNaturelle --> EvaluationImpact
        }
    }
    
    %% Connexion observation terrain
    PIR --> OTR: Participation reelle
    OTR --> ICA: Apprentissage contextuel
    
    %% Note explicative
    note right of ESC
        Cet écosystème permet:
        - L'amélioration continue via clubs et votes
        - L'apprentissage par observation des conversations
        - La correction collaborative des erreurs
        - L'intégration de l'IA comme membre actif
        - L'adaptation aux situations complexes réelles
    end note