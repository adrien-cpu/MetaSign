// src/ai/feedback/observation/InteractionCollector.ts
export interface Interaction {
    id: string;
    timestamp: number;
    userId: string;
    sessionId: string;
    interactionType: string;
    context: Record<string, unknown>;
    data: Record<string, unknown>;
}

export class InteractionCollector {
    private interactions: Interaction[] = [];
    private readonly observers: Array<(interaction: Interaction) => void> = [];
    private isCollecting = false;

    startCollecting(): void {
        this.isCollecting = true;
    }

    stopCollecting(): void {
        this.isCollecting = false;
    }

    recordInteraction(interaction: Omit<Interaction, 'id' | 'timestamp'>): string {
        if (!this.isCollecting) return '';

        const completeInteraction: Interaction = {
            ...interaction,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        };

        this.interactions.push(completeInteraction);

        // Notifier les observateurs
        this.notifyObservers(completeInteraction);

        return completeInteraction.id;
    }

    addObserver(observer: (interaction: Interaction) => void): void {
        this.observers.push(observer);
    }

    removeObserver(observer: (interaction: Interaction) => void): void {
        const index = this.observers.indexOf(observer);
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
    }

    private notifyObservers(interaction: Interaction): void {
        for (const observer of this.observers) {
            try {
                observer(interaction);
            } catch (error) {
                console.error('Error in interaction observer:', error);
            }
        }
    }

    getInteractions(filters?: Partial<Interaction>): Interaction[] {
        if (!filters) return [...this.interactions];

        return this.interactions.filter(interaction => {
            for (const [key, value] of Object.entries(filters)) {
                if (key in interaction && interaction[key as keyof Interaction] !== value) {
                    return false;
                }
            }
            return true;
        });
    }

    clearInteractions(): void {
        this.interactions = [];
    }
}