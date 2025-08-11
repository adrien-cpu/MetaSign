/**
 * @class RPMCalculator
 * @brief Calculateur de valeurs RPM
 * @details Calcule les valeurs normalisées pour les expressions RPM
 */
class RPMCalculator {
  /**
   * @brief Calcule la position intérieure des sourcils
   * @param eyebrows Composant des sourcils
   * @returns number Valeur normalisée (0-1)
   */
  calculateBrowInnerUp(eyebrows: FrameComponent): number {
    return this.normalizeValue(eyebrows.position, -1, 1);
  }

  /**
   * @brief Calcule le plissement des yeux
   * @param eyes Composant des yeux
   * @param side Côté à calculer ('left'|'right')
   * @returns number Valeur normalisée (0-1)
   */
  calculateEyeSquint(eyes: FrameComponent, side: 'left' | 'right'): number {
    const baseSquint = 1 - eyes.position;
    return side === 'left' ? baseSquint : baseSquint * 0.9;
  }

  /**
   * @brief Calcule l'ouverture de la bouche
   * @param mouth Composant de la bouche
   * @returns number Valeur normalisée (0-1)
   */
  calculateMouthOpen(mouth: FrameComponent): number {
    return this.normalizeValue(mouth.position, 0, 1);
  }

  /**
   * @brief Normalise une valeur dans un intervalle
   * @param value Valeur à normaliser
   * @param min Minimum de l'intervalle
   * @param max Maximum de l'intervalle
   * @returns number Valeur normalisée (0-1)
   * @private
   */
  private normalizeValue(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
  }
}