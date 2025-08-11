// src/ai/systems/expressions/rpm/metrics/utils/StatisticalUtils.ts

export class StatisticalUtils {
  /**
   * Calcule les statistiques descriptives de base pour un ensemble de données
   */
  static calculateBasicStats(data: number[]): BasicStatistics {
    if (data.length === 0) {
      throw new Error('Cannot calculate statistics on empty dataset');
    }

    // Tri des données pour les calculs de quantiles
    const sortedData = [...data].sort((a, b) => a - b);

    // Calcul des statistiques
    const min = sortedData[0];
    const max = sortedData[sortedData.length - 1];
    const sum = sortedData.reduce((acc, val) => acc + val, 0);
    const mean = sum / sortedData.length;

    // Calcul de la variance et écart-type
    const sumSquaredDiff = sortedData.reduce(
      (acc, val) => acc + Math.pow(val - mean, 2),
      0
    );
    const variance = sumSquaredDiff / sortedData.length;
    const standardDeviation = Math.sqrt(variance);

    // Calcul des quantiles
    const median = this.calculateQuantile(sortedData, 0.5);
    const q1 = this.calculateQuantile(sortedData, 0.25);
    const q3 = this.calculateQuantile(sortedData, 0.75);
    const iqr = q3 - q1;

    return {
      count: sortedData.length,
      min,
      max,
      range: max - min,
      sum,
      mean,
      median,
      variance,
      standardDeviation,
      q1,
      q3,
      iqr
    };
  }

  /**
   * Calcule un quantile spécifique d'un ensemble de données triées
   */
  static calculateQuantile(sortedData: number[], q: number): number {
    if (q < 0 || q > 1) {
      throw new Error('Quantile must be between 0 and 1');
    }

    if (sortedData.length === 0) {
      throw new Error('Cannot calculate quantile of empty dataset');
    }

    const pos = (sortedData.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;

    if (sortedData[base + 1] !== undefined) {
      return sortedData[base] + rest * (sortedData[base + 1] - sortedData[base]);
    } else {
      return sortedData[base];
    }
  }

  /**
   * Calcule la corrélation entre deux séries de données
   */
  static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length) {
      throw new Error('Both datasets must have the same length');
    }

    if (x.length === 0) {
      throw new Error('Cannot calculate correlation for empty datasets');
    }

    const n = x.length;
    const meanX = x.reduce((acc, val) => acc + val, 0) / n;
    const meanY = y.reduce((acc, val) => acc + val, 0) / n;

    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - meanX;
      const yDiff = y[i] - meanY;
      numerator += xDiff * yDiff;
      denominatorX += xDiff * xDiff;
      denominatorY += yDiff * yDiff;
    }

    if (denominatorX === 0 || denominatorY === 0) {
      return 0; // Éviter la division par zéro
    }

    return numerator / Math.sqrt(denominatorX * denominatorY);
  }

  /**
   * Détecte les valeurs aberrantes dans un ensemble de données
   */
  static detectOutliers(data: number[], method: OutlierDetectionMethod = 'iqr'): number[] {
    const sortedData = [...data].sort((a, b) => a - b);
    const stats = this.calculateBasicStats(sortedData);

    // Utilise la méthode IQR par défaut
    if (method === 'iqr') {
      const lowerBound = stats.q1 - 1.5 * stats.iqr;
      const upperBound = stats.q3 + 1.5 * stats.iqr;

      return data.filter(value => value < lowerBound || value > upperBound);
    }

    // Méthode z-score
    if (method === 'zscore') {
      const threshold = 3; // Valeurs avec |z-score| > 3 sont considérées aberrantes

      return data.filter(value => {
        const zScore = Math.abs((value - stats.mean) / stats.standardDeviation);
        return zScore > threshold;
      });
    }

    // Méthode de l'écart absolu médian (MAD)
    if (method === 'mad') {
      const medianValue = stats.median;
      const deviations = sortedData.map(value => Math.abs(value - medianValue));
      const mad = this.calculateQuantile([...deviations].sort((a, b) => a - b), 0.5);

      // Facteur d'échelle pour approximer l'écart-type (pour une distribution normale)
      const scale = 1.4826;
      const threshold = 3.5; // Similaire au seuil z-score

      return data.filter(value => {
        const scoreMad = Math.abs(value - medianValue) / (mad * scale);
        return scoreMad > threshold;
      });
    }

    return []; // Méthode non reconnue
  }

  /**
   * Teste si deux échantillons proviennent de la même distribution
   * Implémentation simplifiée du test de Kolmogorov-Smirnov
   */
  static testDistributionEquality(sample1: number[], sample2: number[]): TestResult {
    // Fonction pour calculer la fonction de distribution cumulative empirique
    const calculateECDF = (data: number[]): (x: number) => number => {
      const sortedData = [...data].sort((a, b) => a - b);

      return (x: number): number => {
        const count = sortedData.filter(value => value <= x).length;
        return count / sortedData.length;
      };
    };

    // Calcul des ECDF pour les deux échantillons
    const ecdf1 = calculateECDF(sample1);
    const ecdf2 = calculateECDF(sample2);

    // Combiner les deux échantillons pour trouver tous les points potentiels de différence
    const allPoints = [...sample1, ...sample2].sort((a, b) => a - b);

    // Calculer la statistique D (différence maximale entre les deux ECDF)
    let maxDiff = 0;
    for (const point of allPoints) {
      const diff = Math.abs(ecdf1(point) - ecdf2(point));
      if (diff > maxDiff) {
        maxDiff = diff;
      }
    }

    // Calcul de la valeur critique (approximation asymptotique)
    const n1 = sample1.length;
    const n2 = sample2.length;
    // Niveau de signification de 5% (utilisé implicitement dans le criticalValue)
    const criticalValue = 1.36 * Math.sqrt((n1 + n2) / (n1 * n2));

    // Décision du test
    const reject = maxDiff > criticalValue;
    const pValue = this.approximateKSPValue(maxDiff, n1, n2);

    return {
      testStatistic: maxDiff,
      criticalValue,
      pValue,
      reject,
      method: 'Kolmogorov-Smirnov',
      // Suppression de la variable non utilisée "_"
      // Nous utilisons directement index dans la création des indices
      sampleIndices: Array.from({ length: Math.max(n1, n2) }, (unused, index) => index)
    };
  }

  /**
   * Approximation de la p-value pour le test KS
   * Cette implémentation est simplifiée et approximative
   */
  private static approximateKSPValue(D: number, n1: number, n2: number): number {
    const n = (n1 * n2) / (n1 + n2);
    const lambda = Math.sqrt(n) * D;

    // Formule d'approximation pour grandes valeurs de λ
    if (lambda > 1.36) {
      return 2 * Math.exp(-2 * lambda * lambda);
    } else {
      // Pour les petites valeurs, utilisation d'une approximation plus simple
      return 1 - 0.12 + 0.11 / lambda;
    }
  }

  /**
   * Effectue une régression linéaire
   */
  static performLinearRegression(x: number[], y: number[]): RegressionResult {
    if (x.length !== y.length) {
      throw new Error('Both arrays must have the same length');
    }

    if (x.length === 0) {
      throw new Error('Cannot perform regression on empty datasets');
    }

    const n = x.length;
    const meanX = x.reduce((acc, val) => acc + val, 0) / n;
    const meanY = y.reduce((acc, val) => acc + val, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (y[i] - meanY);
      denominator += Math.pow(x[i] - meanX, 2);
    }

    if (denominator === 0) {
      throw new Error('Cannot perform regression when all x values are identical');
    }

    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;

    // Calcul des statistiques de qualité de l'ajustement
    let sumSquaredErrors = 0;
    let sumSquaredTotal = 0;
    let sumAbsoluteError = 0;

    for (let i = 0; i < n; i++) {
      const predicted = intercept + slope * x[i];
      sumSquaredErrors += Math.pow(y[i] - predicted, 2);
      sumSquaredTotal += Math.pow(y[i] - meanY, 2);
      sumAbsoluteError += Math.abs(y[i] - predicted);
    }

    const rSquared = 1 - (sumSquaredErrors / sumSquaredTotal);
    const mse = sumSquaredErrors / n;
    const rmse = Math.sqrt(mse);
    const mae = sumAbsoluteError / n;

    return {
      slope,
      intercept,
      rSquared,
      mse,
      rmse,
      mae,
      predict: (newX: number) => intercept + slope * newX
    };
  }
}

export interface BasicStatistics {
  count: number;
  min: number;
  max: number;
  range: number;
  sum: number;
  mean: number;
  median: number;
  variance: number;
  standardDeviation: number;
  q1: number;
  q3: number;
  iqr: number;
}

export type OutlierDetectionMethod = 'iqr' | 'zscore' | 'mad';

export interface TestResult {
  testStatistic: number;
  criticalValue: number;
  pValue: number;
  reject: boolean;
  method: string;
  sampleIndices: number[];
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  mse: number;
  rmse: number;
  mae: number;
  predict: (x: number) => number;
}