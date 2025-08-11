/**
 * @class RPMIntegrator
 * @brief Intégrateur Ready Player Me
 * @details Gère l'intégration avec l'API RPM pour les expressions faciales
 */
class RPMIntegrator {
  /** 
   * @brief Cibles de morphing disponibles
   * @private
   */
  private readonly morphTargets = {
    /** @brief Cibles pour les sourcils */
    eyebrows: ['browInnerUp', 'browOuterUpLeft', 'browOuterUpRight'],
    /** @brief Cibles pour les yeux */
    eyes: ['eyeSquintLeft', 'eyeSquintRight', 'eyeWideLeft', 'eyeWideRight'],
    /** @brief Cibles pour la bouche */
    mouth: ['mouthSmile', 'mouthFrown', 'mouthOpen']
  };

  /**
   * @brief Convertit une frame en cibles de morphing
   * @param frame Frame à convertir
   * @returns RPMMorphTargets Cibles de morphing
   */
  convertFrameToMorphTargets(frame: Frame): RPMMorphTargets {
    return {
      browInnerUp: this.calculateBrowInnerUp(frame.eyebrows),
      browOuterUpLeft: this.calculateBrowOuterUp(frame.eyebrows, 'left'),
      browOuterUpRight: this.calculateBrowOuterUp(frame.eyebrows, 'right'),
      eyeSquintLeft: this.calculateEyeSquint(frame.eyes, 'left'),
      eyeSquintRight: this.calculateEyeSquint(frame.eyes, 'right'),
      mouthOpen: this.calculateMouthOpen(frame.mouth),
      // ... autres morphs
    };
  }

  /**
   * @brief Met à jour l'expression de l'avatar
   * @param morphTargets Cibles de morphing à appliquer
   * @returns Promise<void>
   * @throws RPMIntegrationError En cas d'échec de mise à jour
   */
  async updateAvatarExpression(morphTargets: RPMMorphTargets): Promise<void> {
    try {
      await this.sendToRPMAPI(morphTargets);
    } catch (error) {
      throw new RPMIntegrationError('Failed to update avatar expression', error);
    }
  }
}