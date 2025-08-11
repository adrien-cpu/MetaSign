// src/ai/systems/expressions/rpm/RPMMorphTargets.ts

/**
 * Représente les cibles de morph pour le système RPM (Real-time Performance Monitoring)
 */
export interface RPMMorphTargets {
  // Propriétés faciales
  /** Sourcil intérieur relevé */
  browInnerUp: number;

  /** Sourcil extérieur gauche relevé */
  browOuterUpLeft: number;

  /** Sourcil extérieur droit relevé */
  browOuterUpRight: number;

  /** Plissement de l'œil gauche */
  eyeSquintLeft: number;

  /** Plissement de l'œil droit */
  eyeSquintRight: number;

  /** Clignotement de l'œil gauche */
  eyeBlinkLeft: number;

  /** Clignotement de l'œil droit */
  eyeBlinkRight: number;

  /** Sourire */
  mouthSmile: number;

  /** Moue */
  mouthFrown: number;

  /** Ouverture de la mâchoire */
  jawOpen: number;

  // Méthodes optionnelles pour la gestion des cibles
  targets?: Map<string, number>;
  groupPriorities?: Map<string, number>;
  weights?: Map<string, number>;
  setTarget?: (name: string, value: number) => void;
  getTarget?: (name: string) => number;

  // Propriétés additionnelles
  [key: string]: number | Map<string, number> | ((name: string, value: number) => void) | ((name: string) => number) | undefined;
}

/**
 * Classe pour gérer les cibles de morph
 */
export class MorphTargetsManager implements RPMMorphTargets {
  // Propriétés requises par l'interface
  browInnerUp: number = 0;
  browOuterUpLeft: number = 0;
  browOuterUpRight: number = 0;
  eyeSquintLeft: number = 0;
  eyeSquintRight: number = 0;
  eyeBlinkLeft: number = 0;
  eyeBlinkRight: number = 0;
  mouthSmile: number = 0;
  mouthFrown: number = 0;
  jawOpen: number = 0;

  // Stockage des cibles et leurs propriétés
  targets: Map<string, number> = new Map();
  groupPriorities: Map<string, number> = new Map();
  weights: Map<string, number> = new Map();

  /**
   * Constructeur
   * @param initialValues Valeurs initiales optionnelles
   */
  constructor(initialValues?: Partial<RPMMorphTargets>) {
    if (initialValues) {
      Object.assign(this, initialValues);

      // Initialiser la map des cibles avec les valeurs initiales
      for (const [key, value] of Object.entries(initialValues)) {
        if (typeof value === 'number') {
          this.targets.set(key, value);
        }
      }
    }
  }

  /**
   * Définit la valeur d'une cible de morph
   * @param name Nom de la cible
   * @param value Valeur de la cible (typiquement entre 0 et 1)
   */
  setTarget(name: string, value: number): void {
    this.targets.set(name, value);

    // Mettre à jour la propriété directe si elle existe
    if (Object.hasOwn(this, name)) {
      (this as { [key: string]: number })[name] = value;
    }
  }

  /**
   * Récupère la valeur d'une cible de morph
   * @param name Nom de la cible
   * @returns Valeur de la cible ou 0 si non définie
   */
  getTarget(name: string): number {
    return this.targets.get(name) || 0;
  }

  /**
   * Réinitialise toutes les cibles à zéro
   */
  resetAllTargets(): void {
    for (const key of this.targets.keys()) {
      this.setTarget(key, 0);
    }

    // Réinitialiser également les propriétés directes
    this.browInnerUp = 0;
    this.browOuterUpLeft = 0;
    this.browOuterUpRight = 0;
    this.eyeSquintLeft = 0;
    this.eyeSquintRight = 0;
    this.eyeBlinkLeft = 0;
    this.eyeBlinkRight = 0;
    this.mouthSmile = 0;
    this.mouthFrown = 0;
    this.jawOpen = 0;
  }

  /**
   * Définit la priorité d'un groupe de cibles
   * @param groupName Nom du groupe
   * @param priority Priorité (plus élevé = plus prioritaire)
   */
  setGroupPriority(groupName: string, priority: number): void {
    this.groupPriorities.set(groupName, priority);
  }
}