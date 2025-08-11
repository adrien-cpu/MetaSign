// src/ai/systems/expressions/rpm/metrics/utils/TimeSeriesUtils.ts

export class TimeSeriesUtils {
  /**
   * Décompose une série temporelle en ses composantes
   * (tendance, saisonnalité, résidus)
   */
  static decomposeTimeSeries(
    values: number[],
    timestamps: number[],
    options: DecompositionOptions = {}
  ): TimeSeriesDecomposition {
    // Validation des entrées
    if (values.length !== timestamps.length) {
      throw new TimeSeriesError('Values and timestamps must have the same length');
    }

    // Décomposition
    const trend = TimeSeriesUtils.extractTrend(values, options.trendWindow || 24);
    const seasonal = TimeSeriesUtils.extractSeasonality(values, trend, options.seasonalPeriod);
    const residual = TimeSeriesUtils.calculateResiduals(values, trend, seasonal);

    return {
      original: values,
      timestamps,
      trend,
      seasonal,
      residual,
      metrics: TimeSeriesUtils.calculateDecompositionMetrics(trend, seasonal, residual)
    };
  }

  /**
   * Détecte les cycles dans une série temporelle
   */
  static detectCycles(
    values: number[],
    timestamps: number[]
  ): CycleAnalysis {
    // Analyse spectrale pour détecter les périodes dominantes
    const periodogram = TimeSeriesUtils.calculatePeriodogram(values);
    const dominantPeriods = TimeSeriesUtils.findDominantPeriods(periodogram);

    // Analyse de la force des cycles
    const cycles = dominantPeriods.map((period: number) => ({
      period,
      strength: TimeSeriesUtils.calculateCycleStrength(values, period),
      phase: TimeSeriesUtils.calculateCyclePhase(values, period)
    }));

    return {
      cycles: cycles.sort((a: Cycle, b: Cycle) => b.strength - a.strength),
      significance: TimeSeriesUtils.calculateCycleSignificance(cycles),
      stationarity: TimeSeriesUtils.testStationarity(values)
    };
  }

  /**
   * Prédit les valeurs futures basées sur les patterns historiques
   */
  static forecastValues(
    values: number[],
    horizon: number,
    _options: ForecastOptions = {}
  ): ForecastResult {
    // Décomposition et analyse des patterns
    const decomposition = TimeSeriesUtils.decomposeTimeSeries(
      values,
      Array.from({ length: values.length }, (_, i) => i)
    );

    // Prédiction des composantes individuelles
    const trendForecast = TimeSeriesUtils.forecastTrend(decomposition.trend, horizon);
    const seasonalForecast = TimeSeriesUtils.forecastSeasonal(decomposition.seasonal, horizon);

    // Combinaison des prédictions
    const forecast = TimeSeriesUtils.combineForecast(trendForecast, seasonalForecast);

    // Calcul des intervalles de confiance
    const confidence = TimeSeriesUtils.calculateConfidenceIntervals(forecast, decomposition);

    return {
      forecast,
      confidence,
      decomposition,
      quality: TimeSeriesUtils.assessForecastQuality(values, forecast)
    };
  }

  /**
   * Détecte les changements de régime dans la série
   */
  static detectRegimeChanges(
    values: number[],
    _options: RegimeOptions = {}
  ): RegimeChangeResult {
    // Détection des points de changement
    const changePoints = TimeSeriesUtils.findChangePoints(values);

    // Analyse des régimes
    const regimes = TimeSeriesUtils.analyzeRegimes(values, changePoints);

    // Caractérisation des transitions
    const transitions = TimeSeriesUtils.characterizeTransitions(values, changePoints);

    return {
      changePoints,
      regimes,
      transitions,
      significance: TimeSeriesUtils.assessChangeSignificance(regimes)
    };
  }

  private static extractTrend(
    values: number[],
    window: number
  ): number[] {
    // Utilisation d'une moyenne mobile centrée
    const halfWindow = Math.floor(window / 2);
    const trend = new Array(values.length).fill(0);

    for (let i = 0; i < values.length; i++) {
      let sum = 0;
      let count = 0;

      for (let j = Math.max(0, i - halfWindow);
        j < Math.min(values.length, i + halfWindow + 1); j++) {
        sum += values[j];
        count++;
      }

      trend[i] = sum / count;
    }

    return trend;
  }

  private static extractSeasonality(
    values: number[],
    trend: number[],
    period?: number
  ): number[] {
    // Si la période n'est pas spécifiée, la détecter
    if (!period) {
      period = TimeSeriesUtils.detectSeasonalPeriod(values);
    }

    // Calcul des moyennes saisonnières
    const seasonal = new Array(values.length).fill(0);
    const seasonalPattern = new Array(period).fill(0);
    const seasonalCounts = new Array(period).fill(0);

    // Extraction du pattern saisonnier
    for (let i = 0; i < values.length; i++) {
      const detrended = values[i] - trend[i];
      const seasonIndex = i % period;
      seasonalPattern[seasonIndex] += detrended;
      seasonalCounts[seasonIndex]++;
    }

    // Normalisation du pattern
    for (let i = 0; i < period; i++) {
      seasonalPattern[i] /= seasonalCounts[i];
    }

    // Application du pattern
    for (let i = 0; i < values.length; i++) {
      seasonal[i] = seasonalPattern[i % period];
    }

    return seasonal;
  }

  private static calculateResiduals(
    values: number[],
    trend: number[],
    seasonal: number[]
  ): number[] {
    return values.map((v, i) => v - trend[i] - seasonal[i]);
  }

  private static detectSeasonalPeriod(values: number[]): number {
    // Utilisation de l'autocorrélation pour détecter la période
    const autocorr = TimeSeriesUtils.calculateAutocorrelation(values);
    const peaks = TimeSeriesUtils.findPeaks(autocorr);

    return peaks.length > 0 ? peaks[0] : Math.floor(values.length / 4);
  }

  private static calculateAutocorrelation(values: number[]): number[] {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b) / n;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2)) / n;

    const autocorr = new Array(Math.floor(n / 2)).fill(0);

    for (let lag = 0; lag < autocorr.length; lag++) {
      let sum = 0;
      for (let i = 0; i < n - lag; i++) {
        sum += (values[i] - mean) * (values[i + lag] - mean);
      }
      autocorr[lag] = sum / (n * variance);
    }

    return autocorr;
  }

  // Implémentations des méthodes manquantes
  private static calculateDecompositionMetrics(
    trend: number[],
    seasonal: number[],
    residual: number[]
  ): DecompositionMetrics {
    // Calcul simple pour la démonstration
    const trendVariance = TimeSeriesUtils.calculateVariance(trend);
    const seasonalVariance = TimeSeriesUtils.calculateVariance(seasonal);
    const residualVariance = TimeSeriesUtils.calculateVariance(residual);
    const totalVariance = trendVariance + seasonalVariance + residualVariance;

    return {
      trendStrength: trendVariance / totalVariance,
      seasonalStrength: seasonalVariance / totalVariance,
      residualStrength: residualVariance / totalVariance,
      fitQuality: 1 - (residualVariance / totalVariance)
    };
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  }

  private static calculatePeriodogram(values: number[]): number[] {
    // Implémentation simplifiée pour démonstration
    const n = values.length;
    const periodogram = new Array(Math.floor(n / 2)).fill(0);

    // Fréquences à examiner
    for (let k = 1; k < periodogram.length; k++) {
      const frequency = k / n;
      let real = 0;
      let imag = 0;

      // Calcul de la transformée de Fourier discrète
      for (let t = 0; t < n; t++) {
        const angle = 2 * Math.PI * frequency * t;
        real += values[t] * Math.cos(angle);
        imag += values[t] * Math.sin(angle);
      }

      // Magnitude au carré
      periodogram[k] = (real * real + imag * imag) / n;
    }

    return periodogram;
  }

  private static findDominantPeriods(periodogram: number[]): number[] {
    // Identification des pics dans le périodogramme
    const peaks = TimeSeriesUtils.findPeaks(periodogram);

    // Conversion des indices en périodes
    return peaks.map(index => periodogram.length / index)
      .filter(period => period > 1 && period < periodogram.length / 2);
  }

  private static calculateCycleStrength(values: number[], period: number): number {
    // Calcule la force du cycle en utilisant l'autocorrélation
    const autocorr = TimeSeriesUtils.calculateAutocorrelation(values);
    const periodIndex = Math.round(autocorr.length / period);

    if (periodIndex > 0 && periodIndex < autocorr.length) {
      return Math.abs(autocorr[periodIndex]);
    }
    return 0;
  }

  private static calculateCyclePhase(values: number[], period: number): number {
    // Calcul simplifié de la phase
    let maxVal = -Infinity;
    let maxPhase = 0;

    for (let phase = 0; phase < period; phase++) {
      let correlation = 0;

      for (let i = 0; i < values.length; i++) {
        const predictedIndex = (i + phase) % period;
        correlation += values[i] * values[predictedIndex];
      }

      if (correlation > maxVal) {
        maxVal = correlation;
        maxPhase = phase;
      }
    }

    return maxPhase / period * 2 * Math.PI;
  }

  private static calculateCycleSignificance(cycles: Cycle[]): number {
    // Somme pondérée des forces des cycles
    return cycles.reduce((sum, cycle) => sum + cycle.strength, 0) / cycles.length;
  }

  private static testStationarity(values: number[]): StationarityTest {
    // Test simplifié pour la stationnarité
    const meanStability = TimeSeriesUtils.testMeanStability(values);
    const varianceStability = TimeSeriesUtils.testVarianceStability(values);

    return {
      isStationary: meanStability.isStable && varianceStability.isStable,
      pValue: Math.min(meanStability.pValue, varianceStability.pValue),
      statistics: {
        meanTest: meanStability,
        varianceTest: varianceStability,
        adfStatistic: TimeSeriesUtils.calculateADFStatistic(values)
      }
    };
  }

  private static calculateFirstDifference(values: number[]): number[] {
    const diff = new Array(values.length - 1);
    for (let i = 0; i < diff.length; i++) {
      diff[i] = values[i + 1] - values[i];
    }
    return diff;
  }

  private static testMeanStability(values: number[]): { isStable: boolean; pValue: number } {
    // Divise la série en deux et compare les moyennes
    const half = Math.floor(values.length / 2);
    const mean1 = values.slice(0, half).reduce((a, b) => a + b, 0) / half;
    const mean2 = values.slice(half).reduce((a, b) => a + b, 0) / (values.length - half);

    // Calcul simplifié du t-test
    const diff = Math.abs(mean1 - mean2);
    const threshold = 0.2 * Math.max(Math.abs(mean1), Math.abs(mean2));

    return {
      isStable: diff < threshold,
      pValue: 1.0 - diff / (diff + threshold)
    };
  }

  private static testVarianceStability(values: number[]): { isStable: boolean; pValue: number } {
    // Divise la série en deux et compare les variances
    const half = Math.floor(values.length / 2);
    const var1 = TimeSeriesUtils.calculateVariance(values.slice(0, half));
    const var2 = TimeSeriesUtils.calculateVariance(values.slice(half));

    // Ratio des variances
    const ratio = Math.max(var1, var2) / Math.max(0.001, Math.min(var1, var2));

    return {
      isStable: ratio < 2.0,
      pValue: 1.0 / ratio
    };
  }

  private static calculateADFStatistic(values: number[]): number {
    // Calcul simplifié de la statistique ADF
    const diff = TimeSeriesUtils.calculateFirstDifference(values);
    const correlation = TimeSeriesUtils.calculateCorrelation(values.slice(0, -1), diff);
    return (correlation - 1) * Math.sqrt(values.length);
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length) {
      throw new Error('Arrays must have the same length');
    }

    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - meanX;
      const yDiff = y[i] - meanY;
      numerator += xDiff * yDiff;
      denomX += xDiff * xDiff;
      denomY += yDiff * yDiff;
    }
    return numerator / Math.sqrt(denomX * denomY);
  }

  private static forecastTrend(trend: number[], horizon: number): number[] {
    // Utilise une régression linéaire simple pour prédire la tendance
    const n = trend.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = trend;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (y[i] - meanY);
      denominator += (x[i] - meanX) * (x[i] - meanX);
    }

    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;

    // Génération des prédictions
    return Array.from({ length: horizon }, (_, i) => {
      const t = n + i;
      return intercept + slope * t;
    });
  }

  private static forecastSeasonal(seasonal: number[], horizon: number): number[] {
    // Répétition du dernier pattern saisonnier
    const seasonLength = TimeSeriesUtils.detectSeasonalPeriod(seasonal);
    const lastCycle = seasonal.slice(-seasonLength);

    // Remplir le forecast en répétant le dernier cycle
    const forecast = new Array(horizon);
    for (let i = 0; i < horizon; i++) {
      forecast[i] = lastCycle[i % lastCycle.length];
    }

    return forecast;
  }

  private static combineForecast(
    trendForecast: number[],
    seasonalForecast: number[]
  ): number[] {
    // Simple addition des composantes
    const horizon = Math.min(trendForecast.length, seasonalForecast.length);
    const forecast = new Array(horizon);

    for (let i = 0; i < horizon; i++) {
      forecast[i] = trendForecast[i] + seasonalForecast[i];
    }
    return forecast;
  }

  private static calculateConfidenceIntervals(
    forecast: number[],
    decomposition: TimeSeriesDecomposition
  ): ConfidenceInterval[] {
    // Utilise la variance des résidus pour les intervalles de confiance
    const residualStd = Math.sqrt(TimeSeriesUtils.calculateVariance(decomposition.residual));

    // Intervalles pour un niveau de confiance de 95%
    const z95 = 1.96;

    return forecast.map((value, index) => {
      // L'incertitude augmente avec l'horizon
      const uncertainty = residualStd * (1 + 0.1 * index);

      return {
        lower: value - z95 * uncertainty,
        upper: value + z95 * uncertainty,
        level: 0.95
      };
    });
  }

  private static assessForecastQuality(
    actual: number[],
    forecast: number[]
  ): ForecastQuality {
    // Pour la démonstration, on compare juste les dernières valeurs de actual avec forecast
    const n = Math.min(actual.length, forecast.length);
    if (n === 0) {
      return { mape: 0, rmse: 0, mae: 0, accuracy: 0 };
    }

    let sumAbsError = 0;
    let sumSquaredError = 0;
    let sumAbsPercentError = 0;

    for (let i = 0; i < n; i++) {
      const error = actual[i] - forecast[i];
      sumAbsError += Math.abs(error);
      sumSquaredError += error * error;

      if (actual[i] !== 0) {
        sumAbsPercentError += Math.abs(error / actual[i]);
      }
    }

    const mae = sumAbsError / n;
    const rmse = Math.sqrt(sumSquaredError / n);
    const mape = (sumAbsPercentError / n) * 100;
    const accuracy = 100 - mape;

    return { mape, rmse, mae, accuracy };
  }

  private static findChangePoints(values: number[]): number[] {
    // Implémentation simple utilisant la différence cumulée
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;

    // Calcul de la somme cumulée des écarts à la moyenne
    const cusum = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) {
      cusum[i + 1] = cusum[i] + (values[i] - mean);
    }

    // Recherche du point de divergence maximal
    const range = Math.max(...cusum) - Math.min(...cusum);
    if (range === 0) {
      return [];
    }

    // Seuil pour détecter les changements significatifs
    const threshold = range * 0.25;

    // Identifier les points où la dérivée de CUSUM change significativement
    const changePoints = [];
    let lastDirection = 0;

    for (let i = 1; i < n; i++) {
      const diff = cusum[i + 1] - cusum[i];
      const direction = Math.sign(diff);

      if (direction !== 0 && direction !== lastDirection) {
        const magnitude = Math.abs(diff);
        if (magnitude > threshold) {
          changePoints.push(i);
          lastDirection = direction;
        }
      }
    }

    return changePoints;
  }

  private static analyzeRegimes(
    values: number[],
    changePoints: number[]
  ): Regime[] {
    const regimes: Regime[] = [];
    const points = [0, ...changePoints, values.length];

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      const segment = values.slice(start, end);

      regimes.push({
        start,
        end,
        characteristics: TimeSeriesUtils.calculateRegimeCharacteristics(segment)
      });
    }

    return regimes;
  }

  private static calculateRegimeCharacteristics(values: number[]): RegimeCharacteristics {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = TimeSeriesUtils.calculateVariance(values);

    // Calcul de la tendance par régression linéaire simple
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    let sumXY = 0;
    let sumX = 0;
    const sumY = mean * n;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumXY += x[i] * y[i];
      sumX += x[i];
      sumXX += x[i] * x[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    // Stabilité: inverse de la variance normalisée
    const stability = Math.exp(-variance / (mean * mean + 1e-10));

    return {
      mean,
      variance,
      trend: slope,
      stability
    };
  }

  private static characterizeTransitions(
    values: number[],
    changePoints: number[]
  ): Transition[] {
    const transitions: Transition[] = [];

    for (let i = 0; i < changePoints.length; i++) {
      const point = changePoints[i];

      // Fenêtre avant et après le point de changement
      const windowSize = Math.min(10, Math.floor(values.length / 10));
      const before = values.slice(Math.max(0, point - windowSize), point);
      const after = values.slice(point, Math.min(values.length, point + windowSize));

      if (before.length === 0 || after.length === 0) {
        continue;
      }

      const meanBefore = before.reduce((a, b) => a + b, 0) / before.length;
      const meanAfter = after.reduce((a, b) => a + b, 0) / after.length;

      // Magnitude du changement
      const magnitude = Math.abs(meanAfter - meanBefore) /
        (Math.abs(meanBefore) + 1e-10);

      // Type de transition
      const isGradual = TimeSeriesUtils.isGradualTransition(values, point, windowSize);

      transitions.push({
        from: Math.max(0, point - windowSize),
        to: Math.min(values.length, point + windowSize),
        duration: 2 * windowSize,
        type: isGradual ? 'gradual' : 'abrupt',
        magnitude
      });
    }

    return transitions;
  }

  private static isGradualTransition(
    values: number[],
    changePoint: number,
    windowSize: number
  ): boolean {
    const start = Math.max(0, changePoint - windowSize);
    const end = Math.min(values.length, changePoint + windowSize);

    // Ajuste une ligne entre le début et la fin
    const x1 = start;
    const y1 = values[start];
    const x2 = end - 1;
    const y2 = values[end - 1];

    const slope = (y2 - y1) / (x2 - x1);
    const intercept = y1 - slope * x1;

    // Calcule l'erreur quadratique moyenne par rapport à la ligne
    let mse = 0;
    for (let i = start; i < end; i++) {
      const expected = intercept + slope * i;
      mse += Math.pow(values[i] - expected, 2);
    }
    mse /= (end - start);

    // Calcule la variance des données
    const segment = values.slice(start, end);
    const variance = TimeSeriesUtils.calculateVariance(segment);

    // Si le MSE est beaucoup plus petit que la variance, la transition est graduelle
    return mse < variance * 0.5;
  }

  private static findPeaks(values: number[]): number[] {
    const peaks: number[] = [];

    // Un point est un pic s'il est supérieur à ses voisins
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
        peaks.push(i);
      }
    }

    // Trie les pics par amplitude décroissante
    return peaks.sort((a, b) => values[b] - values[a]);
  }

  private static assessChangeSignificance(regimes: Regime[]): number {
    // Calcule les différences entre régimes adjacents
    let totalDifference = 0;

    for (let i = 0; i < regimes.length - 1; i++) {
      const current = regimes[i].characteristics;
      const next = regimes[i + 1].characteristics;

      // Différence normalisée des moyennes
      const meanDiff = Math.abs(next.mean - current.mean) /
        (Math.abs(current.mean) + 1e-10);

      // Différence des tendances
      const trendDiff = Math.abs(next.trend - current.trend);

      // Différence des stabilités
      const stabilityDiff = Math.abs(next.stability - current.stability);

      // Combiner les différences
      totalDifference += meanDiff + trendDiff + stabilityDiff;
    }

    // Normaliser par le nombre de transitions
    return regimes.length > 1 ? totalDifference / (regimes.length - 1) : 0;
  }
}

interface DecompositionOptions {
  trendWindow?: number;
  seasonalPeriod?: number;
}

interface TimeSeriesDecomposition {
  original: number[];
  timestamps: number[];
  trend: number[];
  seasonal: number[];
  residual: number[];
  metrics: DecompositionMetrics;
}

interface DecompositionMetrics {
  trendStrength: number;
  seasonalStrength: number;
  residualStrength: number;
  fitQuality: number;
}

interface CycleAnalysis {
  cycles: Cycle[];
  significance: number;
  stationarity: StationarityTest;
}

interface Cycle {
  period: number;
  strength: number;
  phase: number;
}

interface StationarityTest {
  isStationary: boolean;
  pValue: number;
  statistics: StatisticsData;
}

interface StatisticsData {
  meanTest: { isStable: boolean; pValue: number };
  varianceTest: { isStable: boolean; pValue: number };
  adfStatistic: number;
}

interface ForecastOptions {
  confidence?: number;
  method?: 'auto' | 'arima' | 'exponential' | 'neural';
}

interface ForecastResult {
  forecast: number[];
  confidence: ConfidenceInterval[];
  decomposition: TimeSeriesDecomposition;
  quality: ForecastQuality;
}

interface ConfidenceInterval {
  lower: number;
  upper: number;
  level: number;
}

interface ForecastQuality {
  mape: number;
  rmse: number;
  mae: number;
  accuracy: number;
}

interface RegimeOptions {
  sensitivity?: number;
  minRegimeLength?: number;
}

interface RegimeChangeResult {
  changePoints: number[];
  regimes: Regime[];
  transitions: Transition[];
  significance: number;
}

interface Regime {
  start: number;
  end: number;
  characteristics: RegimeCharacteristics;
}

interface RegimeCharacteristics {
  mean: number;
  variance: number;
  trend: number;
  stability: number;
}

interface Transition {
  from: number;
  to: number;
  duration: number;
  type: 'abrupt' | 'gradual';
  magnitude: number;
}

class TimeSeriesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeSeriesError';
  }
}