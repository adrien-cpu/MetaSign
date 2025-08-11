// src/ai/api/multimodal/MultimodalAPI.ts
import { ModalityFusion, ContextManager } from './core';
import { LSFProcessor, VocalProcessor } from './processors';
import { SynchronizationService } from './services';

export class MultimodalAPI {
    private modalityFusion: ModalityFusion;
    private contextManager: ContextManager;
    private lsfProcessor: LSFProcessor;
    private vocalProcessor: VocalProcessor;
    private syncService: SynchronizationService;

    async processMultimodal(input: MultimodalInput): Promise<MultimodalOutput> {
        const [lsfFeatures, vocalFeatures] = await Promise.all([
            this.lsfProcessor.process(input.lsf),
            this.vocalProcessor.process(input.vocal)
        ]);

        const synchronizedFeatures = await this.syncService.synchronize({
            lsf: lsfFeatures,
            vocal: vocalFeatures
        });

        const context = await this.contextManager.analyzeContext(synchronizedFeatures);
        return this.modalityFusion.fuse(synchronizedFeatures, context);
    }
}