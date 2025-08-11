import React from 'react';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  AlertTriangle,
  Layers,
  Zap,
  Puzzle,
  Award
} from 'lucide-react';
import { TranslationStats } from '@/types/translation';

interface QualityMetricsProps {
  stats: TranslationStats;
  className?: string;
}

// Helper function to calculate quality score
const calculateQualityScore = (stats: TranslationStats): number => {
  const {
    accuracyRate = 0,
    completenessRate = 0,
    consistencyRate = 0
  } = stats;

  // Weighted calculation (can be adjusted based on specific requirements)
  return Math.round(
    (accuracyRate * 0.4) +
    (completenessRate * 0.3) +
    (consistencyRate * 0.3)
  );
};

// Color coding for quality score
const getQualityColor = (score: number): string => {
  if (score >= 90) return 'text-green-500';
  if (score >= 75) return 'text-yellow-500';
  return 'text-red-500';
};

const QualityMetrics: React.FC<QualityMetricsProps> = ({
  stats,
  className
}) => {
  const qualityScore = calculateQualityScore(stats);

  const metricItems = [
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      label: 'Précision',
      value: `${stats.accuracyRate?.toFixed(1) || 0}%`,
      tooltip: 'Pourcentage de correspondance fidèle au texte original'
    },
    {
      icon: <Layers className="w-5 h-5 text-blue-500" />,
      label: 'Complétude',
      value: `${stats.completenessRate?.toFixed(1) || 0}%`,
      tooltip: 'Pourcentage du contenu traduit sans omissions'
    },
    {
      icon: <Zap className="w-5 h-5 text-purple-500" />,
      label: 'Cohérence',
      value: `${stats.consistencyRate?.toFixed(1) || 0}%`,
      tooltip: 'Uniformité de la terminologie et du style'
    },
    {
      icon: <Puzzle className="w-5 h-5 text-orange-500" />,
      label: 'Complexité',
      value: stats.complexityLevel || 'N/A',
      tooltip: 'Niveau de difficulté linguistique de la traduction'
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      label: 'Erreurs',
      value: `${stats.errorCount || 0}`,
      tooltip: 'Nombre total d\'erreurs détectées'
    }
  ];

  return (
    <div className={cn(
      'bg-white rounded-lg shadow-md p-6 space-y-4',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Award className="w-6 h-6 mr-2 text-yellow-500" />
          Métriques de Qualité
        </h2>
        <div
          className={`text-2xl font-bold ${getQualityColor(qualityScore)}`}
          title="Score global de qualité de traduction"
        >
          {qualityScore}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metricItems.map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3 hover:bg-gray-100 transition-colors group"
            title={item.tooltip}
          >
            {item.icon}
            <div>
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {stats.recommendedImprovements && stats.recommendedImprovements.length > 0 && (
        <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-3">
          <h3 className="font-semibold text-blue-800 mb-2">
            Recommandations d&apos;Amélioration
          </h3>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            {stats.recommendedImprovements.map((improvement: string, index: number) => (
              <li key={index}>{improvement}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QualityMetrics;