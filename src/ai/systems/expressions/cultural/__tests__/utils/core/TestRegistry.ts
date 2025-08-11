//src/ai/system/expressions/cultural/__tests__/utils/core/TestRegistry.ts
import { TestPlugin } from './TestPlugin';
import { ValidationStrategyFactory } from './ValidationStrategy';

/**
 * Registre global pour les plugins et les stratégies
 */
export class TestRegistry {
    private static instance: TestRegistry;
    private plugins: Map<string, TestPlugin> = new Map();

    private constructor() { }

    static getInstance(): TestRegistry {
        if (!TestRegistry.instance) {
            TestRegistry.instance = new TestRegistry();
        }
        return TestRegistry.instance;
    }

    /**
     * Enregistre un plugin
     */
    registerPlugin(plugin: TestPlugin): void {
        if (this.plugins.has(plugin.name)) {
            throw new Error(`Plugin '${plugin.name}' already registered`);
        }
        this.plugins.set(plugin.name, plugin);
    }

    /**
     * Récupère un plugin par son nom
     */
    getPlugin(name: string): TestPlugin | undefined {
        return this.plugins.get(name);
    }

    /**
     * Récupère tous les plugins triés par priorité
     */
    getAllPlugins(): TestPlugin[] {
        return Array.from(this.plugins.values())
            .sort((a, b) => a.priority - b.priority);
    }

    /**
     * Initialise tous les plugins
     */
    async initializeAllPlugins(): Promise<void> {
        const plugins = this.getAllPlugins();
        await Promise.all(plugins.map(p => p.initialize()));
    }

    /**
     * Fabrique de stratégies de validation
     */
    get validationFactory(): ValidationStrategyFactory {
        return ValidationStrategyFactory.getInstance();
    }
}