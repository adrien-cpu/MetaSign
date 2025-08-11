// src/ai/specialized/grammar/validators/types/temporal-grammar-types.ts

import { ComponentTiming } from '../../types';

// Types utilitaires
type ExtendedRecord = Record<string, unknown>;

// Interfaces pour la gestion interne des structures temporelles
export interface Timeline {
    mainLine: TimelineSegment[];
    branches: TimelineBranch[];
    markers: TimelineMarker[];
}

export interface TimelineSegment {
    id: string;
    start: number;
    end: number;
    content: TimelineContent;
}

export interface TimelineContent {
    type: string;
    value: string;
    additionalData?: Record<string, unknown>;
}

export interface TimelineBranch {
    id: string;
    parentId: string;
    segments: TimelineSegment[];
}

export interface TimelineMarker {
    id: string;
    position: number;
    type: string;
}

export interface Sequence {
    id: string;
    elements: TimelineContent[];
    timing: ComponentTiming;
    dependencies: string[];
}

export interface Transition {
    id: string;
    fromId: string;
    toId: string;
    duration: number;
    type: string;
}

// Interface pour représenter les composants grammaticaux de manière générique
export interface GrammarComponent {
    id: string;
    type: string;
    value?: unknown;
    [key: string]: unknown;
}

// Adapters pour accéder en toute sécurité aux propriétés des composants grammaticaux
export class ComponentAdapter {
    constructor(private component: GrammarComponent) { }

    getId(): string {
        return this.component.id || '';
    }

    getType(): string {
        return this.component.type || '';
    }

    getValue(): string {
        const value = this.component.value;
        return value ? String(value) : '';
    }

    getRole(): string {
        return this.getExtendedProperty('role', '');
    }

    getStartTime(): number {
        return this.getNestedProperty('timing.start', 0);
    }

    getDuration(): number {
        return this.getNestedProperty('timing.duration', 0);
    }

    getSubtype(): string {
        return this.getExtendedProperty('subtype', '');
    }

    getAdditionalData(): Record<string, unknown> {
        return this.getExtendedProperty('additionalData', {});
    }

    getParentId(): string {
        return this.getExtendedProperty('parentId', '');
    }

    getElements(): Array<Record<string, unknown>> {
        return this.getExtendedProperty('elements', []);
    }

    isMarker(): boolean {
        return this.component.type === 'MARKER' ||
            this.getExtendedPropertyString('type') === 'MARKER';
    }

    getMarkerPosition(): number {
        return this.getExtendedProperty('position', 0);
    }

    getMarkerType(): string {
        return this.getExtendedProperty('markerType', 'DEFAULT');
    }

    isTransition(): boolean {
        return this.getExtendedPropertyString('type') === 'TRANSITION';
    }

    getTransitionFromId(): string {
        return this.getExtendedProperty('fromId', '');
    }

    getTransitionToId(): string {
        return this.getExtendedProperty('toId', '');
    }

    getTransitionDuration(): number {
        return this.getExtendedProperty('duration', 0);
    }

    getTransitionType(): string {
        return this.getExtendedProperty('transitionType', 'DEFAULT');
    }

    getAspectType(): string {
        return this.getExtendedProperty('aspectType', '');
    }

    getFrequency(): number {
        return this.getExtendedProperty('frequency', 0);
    }

    getReferences(): string[] {
        return this.getExtendedProperty('references', []);
    }

    getDependencies(): string[] {
        return this.getExtendedProperty('dependencies', []);
    }

    private getExtendedPropertyString(property: string): string {
        const value = this.getExtendedProperty<unknown>(property, '');
        return String(value);
    }

    private getExtendedProperty<P>(property: string, defaultValue: P): P {
        try {
            // Essaie d'accéder à la propriété directement si le composant a des propriétés dynamiques
            if (this.component[property] !== undefined) {
                return this.component[property] as P;
            }

            // Essaie d'accéder via metadata si disponible
            if (this.component['metadata'] &&
                typeof this.component['metadata'] === 'object' &&
                this.component['metadata'] !== null) {
                const metadata = this.component['metadata'] as ExtendedRecord;
                if (metadata[property] !== undefined) {
                    return metadata[property] as P;
                }
            }

            // Si on ne trouve pas, essaie d'accéder via data si disponible
            if (this.component['data'] &&
                typeof this.component['data'] === 'object' &&
                this.component['data'] !== null) {
                const data = this.component['data'] as ExtendedRecord;
                if (data[property] !== undefined) {
                    return data[property] as P;
                }
            }

            return defaultValue;
        } catch (_unused) {
            return defaultValue;
        }
    }

    private getNestedProperty<P>(propertyPath: string, defaultValue: P): P {
        try {
            const parts = propertyPath.split('.');
            let currentObj: unknown = this.component;

            for (const part of parts) {
                if (!currentObj || typeof currentObj !== 'object') {
                    return defaultValue;
                }

                const objWithProperties = currentObj as ExtendedRecord;

                if (objWithProperties[part] !== undefined) {
                    currentObj = objWithProperties[part];
                } else if (objWithProperties['metadata'] &&
                    typeof objWithProperties['metadata'] === 'object') {
                    const metadata = objWithProperties['metadata'] as ExtendedRecord;
                    if (metadata[part] !== undefined) {
                        currentObj = metadata[part];
                    } else {
                        return defaultValue;
                    }
                } else if (objWithProperties['data'] &&
                    typeof objWithProperties['data'] === 'object') {
                    const data = objWithProperties['data'] as ExtendedRecord;
                    if (data[part] !== undefined) {
                        currentObj = data[part];
                    } else {
                        return defaultValue;
                    }
                } else {
                    return defaultValue;
                }
            }

            return currentObj as P;
        } catch (_unused) {
            return defaultValue;
        }
    }
}

// Helper pour créer des adapters d'éléments (sous-composants)
export class ElementAdapter {
    constructor(private element: Record<string, unknown>) { }

    getId(): string {
        return String(this.element.id || '');
    }

    getType(): string {
        return String(this.element.type || 'DEFAULT');
    }

    getValue(): string {
        return String(this.element.value || '');
    }

    getStartTime(): number {
        return this.getNestedProperty('timing.start', 0);
    }

    getDuration(): number {
        return this.getNestedProperty('timing.duration', 0);
    }

    getAdditionalData(): Record<string, unknown> {
        return this.element.additionalData as Record<string, unknown> || {};
    }

    private getNestedProperty<P>(propertyPath: string, defaultValue: P): P {
        try {
            const parts = propertyPath.split('.');
            let currentObj: unknown = this.element;

            for (const part of parts) {
                if (!currentObj || typeof currentObj !== 'object') {
                    return defaultValue;
                }
                currentObj = (currentObj as Record<string, unknown>)[part];
                if (currentObj === undefined) {
                    return defaultValue;
                }
            }

            return currentObj as P;
        } catch (_unused) {
            return defaultValue;
        }
    }
}