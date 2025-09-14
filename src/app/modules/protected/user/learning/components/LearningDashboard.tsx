/**
 * @file LearningDashboard.tsx
 * @description Exemple de composant utilisant les hooks d'apprentissage
 * @author MetaSign Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  useExercises, 
  useUserProfile, 
  useLearningSession,
  type LearningSessionConfig 
} from '../hooks';

interface LearningDashboardProps {
  userId: string;
  initialLevel?: string;
}

export const LearningDashboard: React.FC<LearningDashboardProps> = ({ 
  userId, 
  initialLevel = 'A1' 
}) => {
  const [sessionId] = useState(() => `session_${Date.now()}_${userId}`);
  
  // Hooks d'apprentissage
  const profile = useUserProfile(userId);
  const exercises = useExercises(userId, sessionId);
  const session = useLearningSession();

  // États locaux
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [selectedTopics] = useState(['greetings', 'numbers', 'colors']);

  // Démarrer une session automatiquement
  useEffect(() => {
    const startLearningSession = async () => {
      if (!session.session && session.isServiceConnected && profile.profile) {
        const sessionConfig: LearningSessionConfig = {
          userId,
          targetLevel: profile.profile.currentLevel || initialLevel,
          topics: selectedTopics,
          duration: 30 * 60 * 1000, // 30 minutes
          adaptiveMode: true
        };

        try {
          await session.startSession(sessionConfig);
          // Générer le premier exercice
          await exercises.generateNextExercise();
        } catch (error) {
          console.error('Erreur lors du démarrage de la session:', error);
        }
      }
    };

    startLearningSession();
  }, [session.session, session.isServiceConnected, profile.profile, userId, initialLevel, selectedTopics, session, exercises]);

  // Gestionnaire de soumission de réponse
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || !exercises.session.currentExercise) return;

    try {
      const evaluation = await exercises.submitAnswer(currentAnswer);
      
      // Mettre à jour les progrès de la session
      session.updateProgress(
        exercises.session.stats.totalExercises,
        evaluation.score
      );

      setCurrentAnswer('');
      
      // Générer l'exercice suivant après un délai
      setTimeout(() => {
        exercises.nextExercise();
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de l\'évaluation:', error);
    }
  };

  // Gestionnaire de pause/reprise
  const handleTogglePause = () => {
    if (session.isPaused) {
      session.resumeSession();
    } else {
      session.pauseSession();
    }
  };

  // Affichage des états de chargement et d'erreur
  if (!session.isServiceConnected) {
    return (
      <div className="learning-dashboard loading">
        <div className="status-message">
          <h2>🔄 Connexion aux services d&apos;apprentissage...</h2>
          <p>Veuillez patienter pendant que nous initialisons votre session.</p>
        </div>
      </div>
    );
  }

  if (session.error) {
    return (
      <div className="learning-dashboard error">
        <div className="status-message">
          <h2>⚠️ Erreur de session</h2>
          <p>{session.error}</p>
          <button onClick={() => session.clearError()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-dashboard">
      {/* Header avec informations de session */}
      <header className="dashboard-header">
        <div className="session-info">
          <h1>Session d&apos;apprentissage LSF</h1>
          <div className="session-stats">
            <span className="timer">
              ⏱️ {session.getFormattedElapsedTime()}
            </span>
            <span className="progress">
              📊 {session.progress.exercisesCompleted}/{session.progress.totalExercises} exercices
            </span>
            <span className="score">
              ⭐ Score moyen: {Math.round(session.progress.averageScore * 100)}%
            </span>
          </div>
        </div>
        
        <div className="session-controls">
          <button 
            onClick={handleTogglePause}
            className={`pause-btn ${session.isPaused ? 'resumed' : 'paused'}`}
          >
            {session.isPaused ? '▶️ Reprendre' : '⏸️ Pause'}
          </button>
          <button 
            onClick={session.endSession}
            className="end-session-btn"
          >
            🏁 Terminer
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Profil utilisateur */}
        <aside className="user-profile">
          <h3>👤 Profil</h3>
          {profile.isLoading ? (
            <div>Chargement du profil...</div>
          ) : profile.profile ? (
            <div className="profile-info">
              <div className="level">
                Niveau: <strong>{profile.profile.currentLevel}</strong>
              </div>
              <div className="points">
                Points: <strong>{profile.profile.totalPoints}</strong>
              </div>
              <div className="streak">
                Série: <strong>{profile.profile.stats.streak} jour{profile.profile.stats.streak > 1 ? 's' : ''}</strong>
              </div>
              
              {profile.analysis && (
                <div className="next-level-progress">
                  <div className="progress-label">
                    Progrès vers le niveau suivant:
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${profile.analysis.nextLevelProgress}%` }}
                    />
                  </div>
                  <div className="progress-text">
                    {Math.round(profile.analysis.nextLevelProgress)}%
                  </div>
                </div>
              )}

              {profile.analysis?.recommendations && (
                <div className="recommendations">
                  <h4>💡 Recommandations:</h4>
                  <ul>
                    {profile.analysis.recommendations.slice(0, 2).map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="profile-error">
              Erreur de chargement du profil
              <button onClick={() => profile.refreshProfile()}>
                🔄 Recharger
              </button>
            </div>
          )}
        </aside>

        {/* Zone d'exercice */}
        <main className="exercise-area">
          {exercises.isGenerating ? (
            <div className="exercise-loading">
              <h3>🎯 Génération d&apos;un nouvel exercice...</h3>
              <div className="loading-spinner"></div>
            </div>
          ) : exercises.session.currentExercise ? (
            <div className="current-exercise">
              <div className="exercise-header">
                <h3>📝 Exercice #{exercises.session.stats.totalExercises}</h3>
                <span className="exercise-type">
                  Type: {exercises.session.currentExercise.type}
                </span>
              </div>

              <div className="exercise-content">
                <div className="question">
                  {exercises.session.currentExercise.question}
                </div>

                {exercises.session.currentExercise.media && (
                  <div className="media-content">
                    {exercises.session.currentExercise.media.type === 'video' && (
                      <video 
                        src={exercises.session.currentExercise.media.url}
                        controls
                        className="exercise-video"
                      />
                    )}
                    {exercises.session.currentExercise.media.type === 'image' && (
                      <img 
                        src={exercises.session.currentExercise.media.url}
                        alt="Exercice"
                        className="exercise-image"
                      />
                    )}
                  </div>
                )}

                {exercises.session.currentExercise.options ? (
                  <div className="exercise-options">
                    {exercises.session.currentExercise.options.map((option, index) => (
                      <button
                        key={index}
                        className={`option-btn ${currentAnswer === option ? 'selected' : ''}`}
                        onClick={() => setCurrentAnswer(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-input">
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Tapez votre réponse..."
                      className="answer-input"
                      disabled={exercises.isEvaluating}
                    />
                  </div>
                )}

                <div className="exercise-actions">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!currentAnswer.trim() || exercises.isEvaluating}
                    className="submit-btn"
                  >
                    {exercises.isEvaluating ? '⏳ Évaluation...' : '✅ Valider'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-exercise">
              <h3>🎯 Prêt pour commencer ?</h3>
              <button 
                onClick={() => exercises.generateNextExercise()}
                className="start-exercise-btn"
              >
                🚀 Commencer un exercice
              </button>
            </div>
          )}

          {/* Historique des résultats récents */}
          {exercises.session.evaluationHistory.length > 0 && (
            <div className="recent-results">
              <h4>📊 Résultats récents:</h4>
              <div className="results-list">
                {exercises.session.evaluationHistory.slice(-3).reverse().map((evaluation, index) => (
                  <div 
                    key={index}
                    className={`result-item ${evaluation.correct ? 'correct' : 'incorrect'}`}
                  >
                    <span className="result-icon">
                      {evaluation.correct ? '✅' : '❌'}
                    </span>
                    <span className="result-score">
                      {Math.round(evaluation.score * 100)}%
                    </span>
                    <span className="result-feedback">
                      {evaluation.feedback}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommandations d'exercices */}
          {exercises.getRecommendations().length > 0 && (
            <div className="exercise-recommendations">
              <h4>💡 Suggestions:</h4>
              <ul>
                {exercises.getRecommendations().map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>

      {/* Footer avec statistiques */}
      <footer className="dashboard-footer">
        <div className="session-progress">
          <div className="progress-bar-container">
            <div className="progress-label">
              Progrès de la session: {Math.round(session.progress.percentComplete)}%
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${session.progress.percentComplete}%` }}
              />
            </div>
          </div>
          
          <div className="time-remaining">
            ⏰ Temps restant estimé: {session.getFormattedTimeRemaining()}
          </div>
        </div>

        {session.isNearingEnd() && (
          <div className="session-warning">
            ⚠️ La session approche de la fin. Vous pouvez l&apos;étendre si nécessaire.
            <button onClick={() => session.extendSession(10)}>
              ➕ +10 minutes
            </button>
          </div>
        )}
      </footer>

      {/* Styles CSS intégrés pour la démonstration */}
      <style jsx>{`
        .learning-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          border: 1px solid #e9ecef;
        }

        .session-stats {
          display: flex;
          gap: 20px;
          margin-top: 10px;
          font-size: 14px;
        }

        .session-controls {
          display: flex;
          gap: 10px;
        }

        .pause-btn, .end-session-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .pause-btn {
          background: #ffc107;
          color: #212529;
        }

        .end-session-btn {
          background: #dc3545;
          color: white;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        .user-profile {
          background: white;
          padding: 20px;
          border-radius: 10px;
          border: 1px solid #e9ecef;
          height: fit-content;
        }

        .exercise-area {
          background: white;
          padding: 30px;
          border-radius: 10px;
          border: 1px solid #e9ecef;
        }

        .current-exercise {
          max-width: 600px;
        }

        .exercise-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .question {
          font-size: 18px;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .exercise-options {
          display: grid;
          gap: 10px;
          margin-bottom: 20px;
        }

        .option-btn {
          padding: 12px 20px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }

        .option-btn:hover {
          border-color: #007bff;
        }

        .option-btn.selected {
          border-color: #007bff;
          background: #e7f3ff;
        }

        .answer-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 16px;
          margin-bottom: 20px;
        }

        .submit-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
        }

        .submit-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #007bff;
          transition: width 0.3s ease;
        }

        .recent-results {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }

        .result-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          margin-bottom: 5px;
          border-radius: 6px;
        }

        .result-item.correct {
          background: #d4edda;
        }

        .result-item.incorrect {
          background: #f8d7da;
        }

        .dashboard-footer {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          border: 1px solid #e9ecef;
        }

        .session-warning {
          margin-top: 15px;
          padding: 10px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e9ecef;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .status-message {
          text-align: center;
          padding: 60px 20px;
        }

        @media (max-width: 768px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }
          
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          
          .session-stats {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};