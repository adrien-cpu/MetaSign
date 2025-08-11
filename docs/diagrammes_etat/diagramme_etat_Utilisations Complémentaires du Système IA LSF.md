stateDiagram-v2
    %% Système principal
    state "SystemeCompletLSF" as SCLSF
    
    %% Utilisations complémentaires
    state "AccessibiliteCulturelle" as AC {
        state "TourismeCultureAccessible" as TCA {
            GuidesVirtuelsMusees --> InterpretatioOeuvresArt
            InterpretatioOeuvresArt --> VisitesVirtuellesAdaptees
        }
        
        state "MediasAccessibles" as MA {
            AdaptationFilms --> AdaptationSpectaclesVivants
            AdaptationSpectaclesVivants --> AdaptationEmissionsTV
        }
        
        state "PatrimoineCulturel" as PC {
            NumerisationPatrimoineLSF --> ArchivesSourditude
            ArchivesSourditude --> RessourcesHistoriquesInteractives
        }
    }
    
    state "SanteCommunication" as SC {
        state "AccessibiliteHopitaux" as AH {
            InterpretationConsultations --> InterpretationUrgences
            InterpretationUrgences --> FormationPersonnelSoignant
        }
        
        state "SanteMentale" as SM {
            TherapieLSF --> SoutienPsychologique
            SoutienPsychologique --> OutilsDiagnosticAdaptes
        }
        
        state "AutonomieMedicale" as AM {
            ExplicationTraitements --> SuiviMedicalLSF
            SuiviMedicalLSF --> AlertesMedicales
        }
    }
    
    state "InclusionProfessionnelle" as IP {
        state "FormationProfessionnelle" as FP {
            CursusAdaptes --> CertificationsAccessibles
            CertificationsAccessibles --> DeveloppementCompetences
        }
        
        state "EnvironnementsTravail" as ET {
            ReunionsAccessibles --> OutilsCollaborationLSF
            OutilsCollaborationLSF --> MentoratsAdaptes
        }
        
        state "EntrepreneuriatSourds" as ES {
            OutilsGestionAccessibles --> ReseauxAffinitaires
            ReseauxAffinitaires --> AccesFinancement
        }
    }
    
    state "CitoyenneteParticipative" as CP {
        state "ServicesPublicsAccessibles" as SPA {
            DemarchesAdministratives --> AccessibiliteJustice
            AccessibiliteJustice --> ParticipationCitoyenne
        }
        
        state "DemocratieLSF" as DLSF {
            DebatsPolitiquesAccessibles --> VoteInformeAccessible
            VoteInformeAccessible --> EngagementAssociatif
        }
        
        state "CommunicationCrises" as CC {
            AlertesEmergenceLSF --> InformationsCatastrophesNaturelles
            InformationsCatastrophesNaturelles --> PandemiesInfosLSF
        }
    }
    
    state "SocialSourditude" as SS {
        state "ReseauxSociaux" as RS {
            PlateformesCommunautaires --> OutilsReseautageLSF
            OutilsReseautageLSF --> PartageContenuVisuel
        }
        
        state "SoutienFamilial" as SF {
            CommunicationIntergenerationnelle --> ParentsEntendantsEnfantsSourds
            ParentsEntendantsEnfantsSourds --> SoutiensConjugaux
        }
        
        state "LoisirsCulturels" as LC {
            JeuxVideoAccessibles --> DivertissementsAdaptes
            DivertissementsAdaptes --> EvenementsCommemoratifsLSF
        }
    }
    
    %% Connexion avec le système central
    SCLSF --> AC: Adaptation culturelle
    SCLSF --> SC: Support medical
    SCLSF --> IP: Insertion professionnelle
    SCLSF --> CP: Participation citoyenne
    SCLSF --> SS: Connexion sociale
    
    %% Interconnexions entre utilisations
    AC --> SC: Education culturelle sante
    SC --> IP: Sante travail
    IP --> CP: Employabilite citoyennete
    CP --> SS: Societe inclusive
    SS --> AC: Besoins culturels