// src/ai/pyramid/PyramidLevelFactory.ts

import { PyramidLevel, PyramidLevelType, IPyramidLevelFactory } from './types';
import { ExplorerLevel } from './levels/ExplorerLevel';
import { CollectorLevel } from './levels/CollectorLevel';
import { PreparerLevel } from './levels/PreparerLevel';
import { SpectatorLevel } from './levels/SpectatorLevel';
import { AnomalyManagerLevel } from './levels/AnomalyManagerLevel';
import { AnalystLevel } from './levels/AnalystLevel';
import { MentorLevel } from './levels/MentorLevel';
import { GeneratorLevel } from './levels/GeneratorLevel';
import { EthicistLevel } from './levels/EthicistLevel';
import { MediatorLevel } from './levels/MediatorLevel';

/**
 * Factory class for creating pyramid level instances
 * Follows the Factory Method pattern to abstract level creation
 */
export class PyramidLevelFactory implements IPyramidLevelFactory {
    /**
     * Create a pyramid level based on the specified type
     * @param type Type of pyramid level to create
     * @returns Appropriate pyramid level instance
     */
    public createLevel(type: PyramidLevelType): PyramidLevel {
        switch (type) {
            case PyramidLevelType.EXPLORER:
                return new ExplorerLevel();

            case PyramidLevelType.COLLECTOR:
                return new CollectorLevel();

            case PyramidLevelType.PREPARER:
                return new PreparerLevel();

            case PyramidLevelType.SPECTATOR:
                return new SpectatorLevel();

            case PyramidLevelType.ANOMALY_MANAGER:
                return new AnomalyManagerLevel();

            case PyramidLevelType.ANALYST:
                return new AnalystLevel();

            case PyramidLevelType.MENTOR:
                return new MentorLevel();

            case PyramidLevelType.GENERATOR:
                return new GeneratorLevel();

            case PyramidLevelType.ETHICIST:
                return new EthicistLevel();

            case PyramidLevelType.MEDIATOR:
                return new MediatorLevel();

            default:
                throw new Error(`Unknown pyramid level type: ${type}`);
        }
    }
}