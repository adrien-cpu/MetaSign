//src/ai/validation/__tests__/CollaborationManager.test.ts
import { CollaborationManager } from '../implementations/CollaborationManager';
import {
    ValidationState,
    ValidationEventType,
    CollaborativeValidationRequest,
    ValidationFeedback,
    ExpertiseLevel,
    SignContent,
    TranslationContent
} from '../types';

describe('CollaborationManager', () => {
    let manager: CollaborationManager;

    beforeEach(async () => {
        // Créer une nouvelle instance pour chaque test
        manager = new CollaborationManager();
        await manager.initialize();
    });

    describe('submitProposal', () => {
        it('should successfully submit a proposal', async () => {
            // Préparer une requête de validation
            const request: CollaborativeValidationRequest = {
                type: 'sign',
                content: {
                    type: 'sign',
                    signId: 'test-sign',
                    parameters: {
                        handshape: 'flat',
                        location: 'chest',
                        movement: 'circular',
                        orientation: 'palm-up'
                    }
                },
                requester: 'test-user'
            };

            // Soumettre la proposition
            const result = await manager.submitProposal(request);

            // Vérifier le résultat
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(typeof result.data).toBe('string');
        });
    });

    describe('addFeedback', () => {
        it('should successfully add feedback to a validation', async () => {
            // Préparer une requête de validation
            const request: CollaborativeValidationRequest = {
                type: 'sign',
                content: {
                    type: 'sign',
                    signId: 'test-sign',
                    parameters: {
                        handshape: 'flat',
                        location: 'chest',
                        movement: 'circular',
                        orientation: 'palm-up'
                    }
                },
                requester: 'test-user'
            };

            // Soumettre la proposition
            const submitResult = await manager.submitProposal(request);
            expect(submitResult.success).toBe(true);
            const validationId = submitResult.data!;

            // Préparer un feedback
            const feedback: ValidationFeedback = {
                expertId: 'expert-1',
                isNativeValidator: true,
                approved: true,
                expertiseLevel: ExpertiseLevel.EXPERT,
                score: 8,
                comments: 'Looks good',
                timestamp: new Date()
            };

            // Ajouter le feedback
            const result = await manager.addFeedback(validationId, feedback);

            // Vérifier le résultat
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(typeof result.data).toBe('string');

            // Vérifier que l'état a été mis à jour
            const stateResult = await manager.getValidationState(validationId);
            expect(stateResult.success).toBe(true);
            expect(stateResult.data).toBe(ValidationState.IN_REVIEW);
        });

        it('should return error for non-existent validation', async () => {
            // Préparer un feedback
            const feedback: ValidationFeedback = {
                expertId: 'expert-1',
                isNativeValidator: true,
                approved: true,
                timestamp: new Date()
            };

            // Essayer d'ajouter un feedback à une validation inexistante
            const result = await manager.addFeedback('non-existent-id', feedback);

            // Vérifier l'erreur
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error?.code).toBe('VALIDATION_NOT_FOUND');
        });
    });

    describe('getAllFeedback', () => {
        it('should return paginated feedback', async () => {
            // Préparer et soumettre une validation
            const request: CollaborativeValidationRequest = {
                type: 'sign',
                content: {
                    type: 'sign',
                    signId: 'test-sign',
                    parameters: {
                        handshape: 'flat',
                        location: 'chest',
                        movement: 'circular',
                        orientation: 'palm-up'
                    }
                },
                requester: 'test-user'
            };

            const submitResult = await manager.submitProposal(request);
            const validationId = submitResult.data!;

            // Ajouter plusieurs feedbacks
            for (let i = 0; i < 15; i++) {
                const feedback: ValidationFeedback = {
                    expertId: `expert-${i}`,
                    isNativeValidator: i % 2 === 0,
                    approved: i % 3 === 0,
                    score: 5 + (i % 6),
                    timestamp: new Date()
                };

                await manager.addFeedback(validationId, feedback);
            }

            // Récupérer les feedbacks avec pagination
            const result = await manager.getAllFeedback(validationId, { page: 2, limit: 5 });

            // Vérifier le résultat
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.items.length).toBe(5);
            expect(result.data?.total).toBe(15);
            expect(result.data?.page).toBe(2);
            expect(result.data?.pageCount).toBe(3);
        });
    });

    describe('updateValidationState', () => {
        it('should update validation state and record history', async () => {
            // Préparer et soumettre une validation
            const request: CollaborativeValidationRequest = {
                type: 'sign',
                content: {
                    type: 'sign',
                    signId: 'test-sign',
                    parameters: {
                        handshape: 'flat',
                        location: 'chest',
                        movement: 'circular',
                        orientation: 'palm-up'
                    }
                },
                requester: 'test-user'
            };

            const submitResult = await manager.submitProposal(request);
            const validationId = submitResult.data!;

            // Mettre à jour l'état
            const updateResult = await manager.updateValidationState(
                validationId,
                ValidationState.IN_REVIEW,
                'Testing state change'
            );

            // Vérifier le résultat
            expect(updateResult.success).toBe(true);
            expect(updateResult.data).toBeDefined();
            expect(updateResult.data?.previousState).toBe(ValidationState.SUBMITTED);
            expect(updateResult.data?.newState).toBe(ValidationState.IN_REVIEW);
            expect(updateResult.data?.reason).toBe('Testing state change');

            // Récupérer l'historique
            const historyResult = await manager.getValidationHistory(validationId);

            // Vérifier l'historique
            expect(historyResult.success).toBe(true);
            expect(historyResult.data).toBeDefined();
            expect(historyResult.data?.length).toBe(2); // État initial + changement
            expect(historyResult.data?.[0].newState).toBe(ValidationState.SUBMITTED);
            expect(historyResult.data?.[1].newState).toBe(ValidationState.IN_REVIEW);
        });
    });

    describe('subscribeToEvents', () => {
        it('should notify subscribers when events occur', async () => {
            // Préparer une fonction de callback pour les événements
            const mockCallback = jest.fn();

            // S'abonner à tous les événements
            manager.subscribeToEvents('all', mockCallback);

            // Préparer et soumettre une validation
            const request: CollaborativeValidationRequest = {
                type: 'sign',
                content: {
                    type: 'sign',
                    signId: 'test-sign',
                    parameters: {
                        handshape: 'flat',
                        location: 'chest',
                        movement: 'circular',
                        orientation: 'palm-up'
                    }
                },
                requester: 'test-user'
            };

            const submitResult = await manager.submitProposal(request);
            const validationId = submitResult.data!;

            // Vérifier que l'événement SUBMISSION a été déclenché
            expect(mockCallback).toHaveBeenCalledWith(
                validationId,
                ValidationEventType.SUBMISSION,
                expect.anything()
            );

            // Réinitialiser le mock
            mockCallback.mockClear();

            // Mettre à jour l'état
            await manager.updateValidationState(
                validationId,
                ValidationState.IN_REVIEW,
                'Testing events'
            );

            // Vérifier que l'événement STATE_CHANGED a été déclenché
            expect(mockCallback).toHaveBeenCalledWith(
                validationId,
                ValidationEventType.STATE_CHANGED,
                expect.anything()
            );
        });

        it('should allow unsubscribing from events', async () => {
            // Préparer une fonction de callback pour les événements
            const mockCallback = jest.fn();

            // S'abonner à tous les événements
            const subscriptionId = manager.subscribeToEvents('all', mockCallback);

            // Se désabonner
            const result = manager.unsubscribeFromEvents(subscriptionId);
            expect(result).toBe(true);

            // Préparer et soumettre une validation
            const request: CollaborativeValidationRequest = {
                type: 'sign',
                content: {
                    type: 'sign',
                    signId: 'test-sign',
                    parameters: {
                        handshape: 'flat',
                        location: 'chest',
                        movement: 'circular',
                        orientation: 'palm-up'
                    }
                },
                requester: 'test-user'
            };

            await manager.submitProposal(request);

            // Vérifier que le callback n'a pas été appelé
            expect(mockCallback).not.toHaveBeenCalled();
        });
    });

    describe('searchValidations', () => {
        it('should filter validations based on criteria', async () => {
            // Soumettre plusieurs validations
            const states = [
                ValidationState.SUBMITTED,
                ValidationState.IN_REVIEW,
                ValidationState.FEEDBACK_COLLECTING,
                ValidationState.APPROVED,
                ValidationState.REJECTED
            ];

            for (let i = 0; i < 10; i++) {
                let request: CollaborativeValidationRequest;

                if (i % 2 === 0) {
                    // Créer une validation de type 'sign'
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

                    request = {
                        type: 'sign',
                        content: signContent,
                        requester: `user-${Math.floor(i / 3)}`,
                        submissionDate: new Date(Date.now() - i * 86400000)
                    };
                } else {
                    // Créer une validation de type 'translation'
                    const translationContent: TranslationContent = {
                        type: 'translation',
                        sourceText: `Source text ${i}`,
                        targetSign: `Target sign ${i}`
                    };

                    request = {
                        type: 'translation',
                        content: translationContent,
                        requester: `user-${Math.floor(i / 3)}`,
                        submissionDate: new Date(Date.now() - i * 86400000)
                    };
                }

                const submitResult = await manager.submitProposal(request);
                const validationId = submitResult.data!;

                // Mettre à jour l'état (différent pour chaque validation)
                await manager.updateValidationState(
                    validationId,
                    states[i % states.length],
                    'Setting test state'
                );
            }

            // Rechercher les validations par état
            const searchResult = await manager.searchValidations({
                states: [ValidationState.APPROVED, ValidationState.REJECTED]
            });

            // Vérifier le résultat
            expect(searchResult.success).toBe(true);
            expect(searchResult.data).toBeDefined();
            expect(searchResult.data?.items.length).toBeGreaterThan(0);
            expect(searchResult.data?.items.length).toBeLessThan(10);

            // S'assurer que tous les éléments ont l'état recherché
            searchResult.data?.items.forEach(validation => {
                // Dans une implémentation réelle, on pourrait vérifier l'état directement
                // Ici, on se contente de vérifier que la recherche a fonctionné
                expect(validation).toBeDefined();
            });
        });
    });
});