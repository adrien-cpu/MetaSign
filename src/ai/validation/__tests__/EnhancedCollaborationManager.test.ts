//src/ai/validation/__tests__/EnhancedCollaborationManager.test.ts
import { EnhancedCollaborationManager } from '../implementations/EnhancedCollaborationManager';
import {
    ValidationState,
    ValidationEventType,
    CollaborativeValidationRequest,
    ValidationFeedback,
    ExpertiseLevel,
    ExpertProfile,
    SignContent,
    ValidationContent
} from '../types';

describe('EnhancedCollaborationManager', () => {
    let manager: EnhancedCollaborationManager;

    beforeEach(async () => {
        // Créer une nouvelle instance pour chaque test avec la journalisation activée
        manager = new EnhancedCollaborationManager({
            enableLogging: true,
            logLevel: 'debug',
            defaultMinFeedbackRequired: 3
        });
        await manager.initialize();
    });

    describe('Validation lifecycle', () => {
        it('should handle a complete validation lifecycle', async () => {
            // 1. Soumettre une validation
            const signContent: SignContent = {
                type: 'sign',
                signId: 'test-sign',
                parameters: {
                    handshape: 'flat',
                    location: 'chest',
                    movement: 'circular',
                    orientation: 'palm-up'
                }
            };

            const request: CollaborativeValidationRequest = {
                type: 'sign',
                content: signContent,
                requester: 'test-user'
            };

            const submitResult = await manager.submitProposal(request);
            expect(submitResult.success).toBe(true);

            // S'assurer que data existe avant de l'utiliser
            expect(submitResult.data).toBeDefined();
            // Utilisation de non-null assertion pour éviter l'erreur string | undefined
            const validationId = submitResult.data!;

            // 2. Vérifier l'état initial
            const initialStateResult = await manager.getValidationState(validationId);
            expect(initialStateResult.success).toBe(true);
            expect(initialStateResult.data).toBe(ValidationState.SUBMITTED);

            // 3. Ajouter plusieurs feedbacks
            const expertIds = ['expert-1', 'expert-2', 'expert-3', 'expert-4', 'expert-5'];
            const feedbacks = [];

            // Ajouter 3 feedbacks positifs et 2 négatifs
            for (let i = 0; i < 5; i++) {
                const feedback: ValidationFeedback = {
                    expertId: expertIds[i],
                    isNativeValidator: i % 2 === 0,
                    approved: i < 3, // 3 approbations, 2 rejets
                    expertiseLevel: i % 2 === 0 ? ExpertiseLevel.EXPERT : ExpertiseLevel.INTERMEDIAIRE,
                    score: 6 + i,
                    comments: `Feedback ${i + 1}`,
                    timestamp: new Date()
                };

                const result = await manager.addFeedback(validationId, feedback);
                expect(result.success).toBe(true);
                feedbacks.push(result.data);
            }

            // 4. Vérifier le changement d'état après les feedbacks
            const midStateResult = await manager.getValidationState(validationId);
            expect(midStateResult.success).toBe(true);
            expect(midStateResult.data).toBe(ValidationState.FEEDBACK_COLLECTING);

            // 5. Récupérer les feedbacks avec pagination
            const getAllResult = await manager.getAllFeedback(validationId, { page: 1, limit: 3 });
            expect(getAllResult.success).toBe(true);
            expect(getAllResult.data?.items.length).toBe(3);
            expect(getAllResult.data?.total).toBe(5);

            // 6. Calculer le consensus
            const consensusResult = await manager.calculateConsensus(validationId);
            expect(consensusResult.success).toBe(true);
            expect(consensusResult.data?.approved).toBe(true);
            expect(consensusResult.data?.expertCount).toBe(5);

            // 7. Vérifier l'état après le consensus
            const postConsensusState = await manager.getValidationState(validationId);
            expect(postConsensusState.success).toBe(true);
            expect(postConsensusState.data).toBe(ValidationState.CONSENSUS_REACHED);

            // 8. Mettre à jour l'état final
            const updateResult = await manager.updateValidationState(
                validationId,
                ValidationState.APPROVED,
                'Approved after review'
            );
            expect(updateResult.success).toBe(true);

            // 9. Vérifier l'historique des états
            const historyResult = await manager.getValidationHistory(validationId);
            expect(historyResult.success).toBe(true);
            expect(historyResult.data?.length).toBeGreaterThan(3);

            // 10. Vérifier l'état final
            const finalStateResult = await manager.getValidationState(validationId);
            expect(finalStateResult.success).toBe(true);
            expect(finalStateResult.data).toBe(ValidationState.APPROVED);
        });
    });

    describe('Expert profiles', () => {
        it('should manage expert profiles', async () => {
            // 1. Enregistrer des profils d'experts
            const experts = [];

            for (let i = 0; i < 5; i++) {
                const profile: ExpertProfile = {
                    id: `expert-${i}`,
                    name: `Expert ${i}`,
                    expertiseLevel: i > 2 ? ExpertiseLevel.EXPERT : ExpertiseLevel.INTERMEDIAIRE,
                    isNative: i % 2 === 0,
                    domains: ['sign', 'linguistics'],
                    experience: 5 + i
                };

                const result = await manager.registerExpertProfile(profile);
                expect(result.success).toBe(true);
                experts.push(result.data);
            }

            // 2. Récupérer un profil
            // S'assurer que experts[0] existe
            expect(experts[0]).toBeDefined();
            const getProfileResult = await manager.getExpertProfile(experts[0]!);
            expect(getProfileResult.success).toBe(true);
            expect(getProfileResult.data?.name).toBe('Expert 0');

            // 3. Trouver des experts qualifiés pour une validation
            const signContent: SignContent = {
                type: 'sign',
                signId: 'test-sign',
                parameters: {
                    handshape: 'flat',
                    location: 'chest',
                    movement: 'circular',
                    orientation: 'palm-up'
                }
            };

            const request: CollaborativeValidationRequest = {
                type: 'sign',
                content: signContent,
                requester: 'test-user',
                context: {
                    domain: 'linguistics'
                },
                requiresNativeValidation: true
            };

            const submitResult = await manager.submitProposal(request);
            expect(submitResult.success).toBe(true);
            expect(submitResult.data).toBeDefined();

            const findExpertsResult = await manager.findQualifiedExperts(submitResult.data!, 3);
            expect(findExpertsResult.success).toBe(true);
            expect(findExpertsResult.data?.length).toBeLessThanOrEqual(3);

            // Au moins un expert devrait être natif
            const hasNative = findExpertsResult.data?.some(exp => exp.isNative);
            expect(hasNative).toBe(true);
        });
    });

    describe('Analytics', () => {
        it('should calculate system statistics', async () => {
            // 1. Créer des validations
            const validationIds = [];

            for (let i = 0; i < 5; i++) {
                let content: ValidationContent;

                if (i % 2 === 0) {
                    content = {
                        type: 'sign',
                        signId: `test-sign-${i}`,
                        parameters: {
                            handshape: 'flat',
                            location: 'chest',
                            movement: 'circular',
                            orientation: 'palm-up'
                        }
                    };
                } else {
                    content = {
                        type: 'translation',
                        sourceText: `Source text ${i}`,
                        targetSign: `Target sign ${i}`,
                        context: 'Educational context'
                    };
                }

                const request: CollaborativeValidationRequest = {
                    type: i % 2 === 0 ? 'sign' : 'translation',
                    content,
                    requester: `user-${i % 3}`
                };

                const result = await manager.submitProposal(request);
                expect(result.data).toBeDefined();
                validationIds.push(result.data!);

                // Mettre certaines validations dans des états différents
                if (i > 0) {
                    await manager.updateValidationState(
                        result.data!,
                        i % 3 === 0 ? ValidationState.IN_REVIEW :
                            i % 3 === 1 ? ValidationState.APPROVED :
                                ValidationState.REJECTED
                    );
                }
            }

            // 2. Ajouter des feedbacks
            for (let i = 0; i < validationIds.length; i++) {
                for (let j = 0; j < 3; j++) {
                    const feedback: ValidationFeedback = {
                        expertId: `expert-${j}`,
                        isNativeValidator: j === 0,
                        approved: j < 2,
                        score: 5 + j,
                        timestamp: new Date()
                    };

                    await manager.addFeedback(validationIds[i], feedback);
                }
            }

            // 3. Calculer les statistiques
            const statsResult = await manager.getSystemStats();
            expect(statsResult.success).toBe(true);
            expect(statsResult.data?.totalValidations).toBe(5);

            // Vérification avec les propriétés correctes de ValidationStats
            const stats = statsResult.data;
            expect(stats?.feedbackCount).toBe(15); // 5 validations * 3 feedbacks
            expect(stats?.successRate).toBeGreaterThan(0);
            expect(stats?.validationsByState).toBeDefined();
            expect(Object.keys(stats?.validationsByState || {})).toContain(ValidationState.APPROVED);
        });

        it('should calculate expert statistics', async () => {
            // 1. Créer des validations et ajouter des feedbacks
            const validationIds = [];
            const expertId = 'expert-stats-test';

            for (let i = 0; i < 3; i++) {
                const signContent: SignContent = {
                    type: 'sign',
                    signId: `test-sign-${i}`,
                    parameters: {
                        handshape: 'flat',
                        location: 'chest',
                        movement: 'circular',
                        orientation: 'palm-up'
                    }
                };

                const request: CollaborativeValidationRequest = {
                    type: 'sign',
                    content: signContent,
                    requester: 'test-user'
                };

                const result = await manager.submitProposal(request);
                expect(result.data).toBeDefined();
                validationIds.push(result.data!);

                // Ajouter un feedback de l'expert à chaque validation
                const feedback: ValidationFeedback = {
                    expertId,
                    isNativeValidator: true,
                    approved: i < 2, // 2 approbations, 1 rejet
                    score: 7,
                    confidence: 0.9,
                    timestamp: new Date()
                };

                await manager.addFeedback(result.data!, feedback);

                // Ajouter d'autres feedbacks
                for (let j = 0; j < 2; j++) {
                    const otherFeedback: ValidationFeedback = {
                        expertId: `other-expert-${j}`,
                        isNativeValidator: false,
                        approved: i < 2, // Même opinion que l'expert principal
                        score: 6 + j,
                        timestamp: new Date()
                    };

                    await manager.addFeedback(result.data!, otherFeedback);
                }

                // Calculer le consensus
                await manager.calculateConsensus(result.data!);
            }

            // 2. Calculer les statistiques de l'expert
            const expertStatsResult = await manager.getExpertStats(expertId);
            expect(expertStatsResult.success).toBe(true);

            // Utilisation des propriétés correctes du type ExpertStats
            const expertStats = expertStatsResult.data;
            expect(expertStats?.feedbackCount).toBe(3);
            expect(expertStats?.approvalRate).toBeCloseTo(2 / 3, 2);
            expect(expertStats?.averageScore).toBe(7);
            expect(expertStats?.consensusAlignment).toBe(1); // Parfaitement aligné
        });
    });

    describe('Search and querying', () => {
        it('should search validations with complex criteria', async () => {
            // 1. Créer des validations avec des propriétés variées
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            for (let i = 0; i < 10; i++) {
                let content: ValidationContent;

                if (i % 2 === 0) {
                    content = {
                        type: 'sign',
                        signId: `test-sign-${i}`,
                        parameters: {
                            handshape: i % 3 === 0 ? 'flat' : 'curved',
                            location: i % 4 === 0 ? 'chest' : 'face',
                            movement: 'circular',
                            orientation: 'palm-up'
                        }
                    };
                } else {
                    content = {
                        type: 'translation',
                        sourceText: `Source text ${i}`,
                        targetSign: `Target sign ${i}`,
                        context: 'Educational context'
                    };
                }

                const request: CollaborativeValidationRequest = {
                    type: i % 2 === 0 ? 'sign' : 'translation',
                    content,
                    requester: `user-${i % 3}`,
                    submissionDate: i % 2 === 0 ? today : yesterday,
                    metadata: {
                        source: 'test-application', // Ajout de la propriété source requise
                        priority: i % 3 === 0 ? 'high' : 'medium',
                        category: i % 2 === 0 ? 'educational' : 'general',
                        tags: [`tag-${i % 5}`, 'test']
                    }
                };

                const result = await manager.submitProposal(request);
                expect(result.data).toBeDefined();

                // Mettre certaines validations dans des états différents
                if (i % 3 === 0) {
                    await manager.updateValidationState(result.data!, ValidationState.IN_REVIEW);
                } else if (i % 3 === 1) {
                    await manager.updateValidationState(result.data!, ValidationState.APPROVED);
                }

                // Ajouter des feedbacks pour certaines validations
                if (i % 2 === 0) {
                    const feedback: ValidationFeedback = {
                        expertId: 'search-expert',
                        isNativeValidator: true,
                        approved: true,
                        timestamp: new Date()
                    };

                    await manager.addFeedback(result.data!, feedback);
                }
            }

            // 2. Rechercher par état
            const stateSearchResult = await manager.searchValidations({
                states: [ValidationState.APPROVED]
            });
            expect(stateSearchResult.success).toBe(true);
            expect(stateSearchResult.data?.items.length).toBeGreaterThan(0);
            expect(stateSearchResult.data?.items.every(v =>
                v.metadata?.category === 'general'
            )).toBe(false); // Mélange de catégories

            // 3. Rechercher par date
            const dateSearchResult = await manager.searchValidations({
                dateRange: { start: yesterday, end: today }
            });
            expect(dateSearchResult.success).toBe(true);
            expect(dateSearchResult.data?.items.length).toBe(10); // Toutes les validations

            // 4. Rechercher par expert
            const expertSearchResult = await manager.searchValidations({
                expertIds: ['search-expert']
            });
            expect(expertSearchResult.success).toBe(true);
            expect(expertSearchResult.data?.items.length).toBe(5); // Les validations avec i % 2 === 0

            // 5. Rechercher par métadonnées
            const metaSearchResult = await manager.searchValidations({
                metadata: {
                    priority: 'high'
                }
            });
            expect(metaSearchResult.success).toBe(true);
            expect(metaSearchResult.data?.items.length).toBeGreaterThan(0);
            expect(metaSearchResult.data?.items.every(v =>
                v.metadata?.priority === 'high'
            )).toBe(true);

            // 6. Rechercher par mot-clé
            const keywordSearchResult = await manager.searchValidations({
                keywords: ['flat']
            });
            expect(keywordSearchResult.success).toBe(true);
            expect(keywordSearchResult.data?.items.length).toBeGreaterThan(0);

            // Utilisation de type approprié au lieu de 'any'
            expect(keywordSearchResult.data?.items.every(v => {
                if (v.type === 'sign' && v.content.type === 'sign') {
                    return v.content.parameters.handshape === 'flat';
                }
                return false;
            })).toBe(true);

            // 7. Recherche combinée
            const combinedSearchResult = await manager.searchValidations({
                states: [ValidationState.IN_REVIEW],
                metadata: {
                    priority: 'high'
                }
            });
            expect(combinedSearchResult.success).toBe(true);
            // Les résultats devraient être les validations qui sont IN_REVIEW ET ont priority=high
        });
    });

    describe('Event system', () => {
        it('should notify subscribers of events', async () => {
            // 1. Créer des callbacks mock
            const allEventsCallback = jest.fn();
            const stateChangeCallback = jest.fn();

            // 2. S'abonner aux événements
            // Ignorer allSubscriptionId puisqu'il n'est pas utilisé dans ce test
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const allSubscriptionId = manager.subscribeToEvents('all', allEventsCallback);
            const stateSubscriptionId = manager.subscribeToEvents(ValidationEventType.STATE_CHANGED, stateChangeCallback);

            // 3. Créer une validation et déclencher des événements
            const signContent: SignContent = {
                type: 'sign',
                signId: 'test-sign',
                parameters: {
                    handshape: 'flat',
                    location: 'chest',
                    movement: 'circular',
                    orientation: 'palm-up'
                }
            };

            const request: CollaborativeValidationRequest = {
                type: 'sign',
                content: signContent,
                requester: 'test-user'
            };

            const submitResult = await manager.submitProposal(request);
            expect(submitResult.data).toBeDefined();
            const validationId = submitResult.data!;

            // 4. Vérifier que l'événement de soumission a été déclenché
            expect(allEventsCallback).toHaveBeenCalledWith(
                validationId,
                ValidationEventType.SUBMISSION,
                expect.anything()
            );

            // Le callback de changement d'état ne devrait pas être appelé pour la soumission
            expect(stateChangeCallback).not.toHaveBeenCalled();

            // 5. Mettre à jour l'état
            await manager.updateValidationState(
                validationId,
                ValidationState.IN_REVIEW,
                'Testing events'
            );

            // 6. Vérifier que les deux callbacks ont été appelés
            expect(allEventsCallback).toHaveBeenCalledTimes(2);
            expect(stateChangeCallback).toHaveBeenCalledWith(
                validationId,
                ValidationEventType.STATE_CHANGED,
                expect.anything()
            );

            // 7. Se désabonner et vérifier qu'on ne reçoit plus d'événements
            expect(manager.unsubscribeFromEvents(stateSubscriptionId)).toBe(true);

            await manager.updateValidationState(
                validationId,
                ValidationState.FEEDBACK_COLLECTING,
                'Testing unsubscribe'
            );

            // Le callback général est toujours appelé
            expect(allEventsCallback).toHaveBeenCalledTimes(3);
            // Mais le callback spécifique n'est plus appelé
            expect(stateChangeCallback).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error handling', () => {
        it('should handle invalid operations gracefully', async () => {
            // 1. Tenter d'accéder à une validation inexistante
            const nonExistentId = 'non-existent-id';

            const stateResult = await manager.getValidationState(nonExistentId);
            expect(stateResult.success).toBe(false);
            expect(stateResult.error?.code).toBe('VALIDATION_NOT_FOUND');

            // 2. Tenter de mettre à jour un état avec une transition invalide
            const signContent: SignContent = {
                type: 'sign',
                signId: 'test-sign',
                parameters: {
                    handshape: 'flat',
                    location: 'chest',
                    movement: 'circular',
                    orientation: 'palm-up'
                }
            };

            const request: CollaborativeValidationRequest = {
                type: 'sign',
                content: signContent,
                requester: 'test-user'
            };

            const submitResult = await manager.submitProposal(request);
            expect(submitResult.data).toBeDefined();
            const validationId = submitResult.data!;

            // Tenter de passer de SUBMITTED à APPROVED (non permis)
            const invalidTransitionResult = await manager.updateValidationState(
                validationId,
                ValidationState.APPROVED,
                'Invalid transition'
            );

            expect(invalidTransitionResult.success).toBe(false);
            expect(invalidTransitionResult.error?.code).toBe('STATE_TRANSITION_DENIED');

            // 3. Soumettre une requête invalide
            // Utilisation de type partiel au lieu de 'any'
            const invalidRequest: Partial<CollaborativeValidationRequest> = {
                type: 'sign',
                content: {
                    type: 'sign',
                    // Manque signId et parameters
                } as Partial<SignContent> as SignContent,
                requester: 'test-user'
            };

            const invalidSubmitResult = await manager.submitProposal(invalidRequest as CollaborativeValidationRequest);
            expect(invalidSubmitResult.success).toBe(false);
            expect(invalidSubmitResult.error?.code).toBe('MISSING_REQUIRED_FIELD');

            // 4. Ajouter un feedback invalide
            // Utilisation de type partiel au lieu de 'any'
            const invalidFeedback: Partial<ValidationFeedback> = {
                // Manque expertId
                isNativeValidator: true,
                approved: true,
                timestamp: new Date()
            };

            const invalidFeedbackResult = await manager.addFeedback(validationId, invalidFeedback as ValidationFeedback);
            expect(invalidFeedbackResult.success).toBe(false);
            expect(invalidFeedbackResult.error?.code).toBe('MISSING_REQUIRED_FIELD');
        });
    });

    describe('Transactions', () => {
        it('should execute operations as a transaction', async () => {
            // 1. Exécuter une transaction réussie
            const transactionResult = await manager.transaction(async (txManager) => {
                // Créer une validation
                const signContent: SignContent = {
                    type: 'sign',
                    signId: 'tx-sign',
                    parameters: {
                        handshape: 'flat',
                        location: 'chest',
                        movement: 'circular',
                        orientation: 'palm-up'
                    }
                };

                const request: CollaborativeValidationRequest = {
                    type: 'sign',
                    content: signContent,
                    requester: 'tx-user'
                };

                const submitResult = await txManager.submitProposal(request);
                expect(submitResult.data).toBeDefined();
                const validationId = submitResult.data!;

                // Mettre à jour l'état
                await txManager.updateValidationState(
                    validationId,
                    ValidationState.IN_REVIEW,
                    'In transaction'
                );

                // Ajouter un feedback
                const feedback: ValidationFeedback = {
                    expertId: 'tx-expert',
                    isNativeValidator: true,
                    approved: true,
                    timestamp: new Date()
                };

                await txManager.addFeedback(validationId, feedback);

                return validationId;
            });

            expect(transactionResult.success).toBe(true);

            // Vérifier que les opérations ont été exécutées
            const stateResult = await manager.getValidationState(transactionResult.data as string);
            expect(stateResult.success).toBe(true);
            expect(stateResult.data).toBe(ValidationState.IN_REVIEW);

            // 2. Exécuter une transaction échouant en partie
            // Note: Notre implémentation ne permet pas de rollback, c'est seulement pour illustration
            try {
                await manager.transaction(async (txManager) => {
                    const signContent: SignContent = {
                        type: 'sign',
                        signId: 'tx-sign-2',
                        parameters: {
                            handshape: 'flat',
                            location: 'chest',
                            movement: 'circular',
                            orientation: 'palm-up'
                        }
                    };

                    const request: CollaborativeValidationRequest = {
                        type: 'sign',
                        content: signContent,
                        requester: 'tx-user'
                    };

                    const submitResult = await txManager.submitProposal(request);
                    expect(submitResult.data).toBeDefined();
                    const validationId = submitResult.data!;

                    // Mettre à jour l'état avec une transition invalide
                    await txManager.updateValidationState(
                        validationId,
                        ValidationState.APPROVED, // Transition invalide depuis SUBMITTED
                        'Should fail'
                    );

                    return validationId;
                });

                // La transaction devrait échouer, donc ce code ne devrait pas s'exécuter
                expect(true).toBe(false);
            } catch (error) {
                // On s'attend à une erreur
                expect(error).toBeDefined();
            }
        });
    });
});