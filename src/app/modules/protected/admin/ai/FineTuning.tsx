import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Types simulés pour l'interface
interface ModelInfo {
    id: string;
    createdAt: string;
    metrics: {
        accuracy: number;
        loss: number;
        inferenceLatency: number;
        modelSize: number;
    };
    optimized: boolean;
    size: number;
}

interface ProgressInfo {
    percentage: number;
    currentIteration: number;
    totalIterations: number;
    currentLoss: number;
    timestamp: number;
    memoryUsage: number;
    cpuUsage: number;
    estimatedTimeRemaining?: number;
}

// Composant principal
const FineTuningUI = () => {
    const [models, setModels] = useState<ModelInfo[]>([]);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('models');
    const [isTraining, setIsTraining] = useState(false);
    const [trainingProgress, setTrainingProgress] = useState<ProgressInfo | null>(null);
    const [lossHistory, setLossHistory] = useState<{ iteration: number; loss: number }[]>([]);

    // Options de configuration pour le fine-tuning
    const [config, setConfig] = useState({
        iterations: 10,
        batchSize: 64,
        learningRate: 0.001,
        dropoutRate: 0.2,
        applyPruning: true,
        applyQuantization: true,
        enableCollaborativeValidation: false,
        optimizationFlags: ['mixed_precision', 'gradient_checkpointing']
    });

    // Charger les modèles disponibles
    useEffect(() => {
        // Simulation du chargement des modèles
        // Dans l'application réelle, appelez votre API ici
        const mockModels: ModelInfo[] = [
            {
                id: 'model_123456',
                createdAt: '2025-03-25T10:30:00Z',
                metrics: {
                    accuracy: 0.92,
                    loss: 0.15,
                    inferenceLatency: 12,
                    modelSize: 45
                },
                optimized: true,
                size: 45
            },
            {
                id: 'model_789012',
                createdAt: '2025-03-20T14:15:00Z',
                metrics: {
                    accuracy: 0.88,
                    loss: 0.22,
                    inferenceLatency: 18,
                    modelSize: 78
                },
                optimized: false,
                size: 78
            }
        ];

        setModels(mockModels);
    }, []);

    // Simuler l'entraînement
    const startTraining = () => {
        setIsTraining(true);
        setLossHistory([]);

        // Simulation de l'entraînement progressif
        let iteration = 0;
        const totalIterations = config.iterations;
        const interval = setInterval(() => {
            iteration++;

            // Simuler une perte décroissante
            const loss = 1.0 - (0.8 * (iteration / totalIterations)) + (Math.random() * 0.1);

            // Ajouter à l'historique
            setLossHistory(prev => [...prev, { iteration, loss }]);

            // Mettre à jour la progression
            setTrainingProgress({
                percentage: (iteration / totalIterations) * 100,
                currentIteration: iteration,
                totalIterations,
                currentLoss: loss,
                timestamp: Date.now(),
                memoryUsage: 2500 + Math.random() * 500,
                cpuUsage: 40 + Math.random() * 30,
                estimatedTimeRemaining: (totalIterations - iteration) * 500
            });

            // Fin de l'entraînement
            if (iteration >= totalIterations) {
                clearInterval(interval);
                setIsTraining(false);

                // Ajouter le nouveau modèle à la liste
                const newModel: ModelInfo = {
                    id: `model_${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    metrics: {
                        accuracy: 0.90 + Math.random() * 0.08,
                        loss: loss,
                        inferenceLatency: 10 + Math.random() * 10,
                        modelSize: config.applyPruning ? 30 + Math.random() * 20 : 70 + Math.random() * 30
                    },
                    optimized: config.applyPruning || config.applyQuantization,
                    size: config.applyPruning ? 30 + Math.random() * 20 : 70 + Math.random() * 30
                };

                setModels(prev => [newModel, ...prev]);
            }
        }, 500);

        // Nettoyage
        return () => clearInterval(interval);
    };

    // Formater la durée restante
    const formatTimeRemaining = (ms: number = 0) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    // Rendu des onglets
    const renderTabContent = () => {
        switch (activeTab) {
            case 'models':
                return renderModelsTab();
            case 'training':
                return renderTrainingTab();
            case 'settings':
                return renderSettingsTab();
            default:
                return renderModelsTab();
        }
    };

    // Onglet des modèles
    const renderModelsTab = () => (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Models Available</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {models.map(model => (
                    <div
                        key={model.id}
                        className={`p-4 border rounded-md cursor-pointer transition-colors ${selectedModel === model.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                            }`}
                        onClick={() => setSelectedModel(model.id)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold">{model.id}</h3>
                                <p className="text-sm text-gray-500">
                                    Created: {new Date(model.createdAt).toLocaleString()}
                                </p>
                            </div>
                            {model.optimized && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Optimized
                                </span>
                            )}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="text-sm">
                                <span className="text-gray-500">Accuracy:</span>
                                <span className="ml-2 font-semibold">{model.metrics.accuracy.toFixed(4)}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-gray-500">Loss:</span>
                                <span className="ml-2 font-semibold">{model.metrics.loss.toFixed(4)}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-gray-500">Latency:</span>
                                <span className="ml-2 font-semibold">{model.metrics.inferenceLatency.toFixed(2)} ms</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-gray-500">Size:</span>
                                <span className="ml-2 font-semibold">{model.size.toFixed(2)} MB</span>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                                Load
                            </button>
                            <button className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                                Export
                            </button>
                            <button className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {models.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    <p>No models available. Start training to create your first model.</p>
                </div>
            )}
        </div>
    );

    // Onglet d'entraînement
    const renderTrainingTab = () => (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Model Training</h2>

            {isTraining ? (
                <div className="border rounded-md p-4">
                    <h3 className="font-semibold mb-2">Training in Progress</h3>

                    {trainingProgress && (
                        <>
                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm">Progress: {trainingProgress.percentage.toFixed(1)}%</span>
                                    <span className="text-sm">
                                        Iteration: {trainingProgress.currentIteration} / {trainingProgress.totalIterations}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full"
                                        style={{ width: `${trainingProgress.percentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-500">Current Loss</span>
                                    <p className="font-semibold">{trainingProgress.currentLoss.toFixed(4)}</p>
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-500">Memory Usage</span>
                                    <p className="font-semibold">{(trainingProgress.memoryUsage / 1024).toFixed(2)} GB</p>
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-500">CPU Usage</span>
                                    <p className="font-semibold">{trainingProgress.cpuUsage.toFixed(1)}%</p>
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-500">Time Remaining</span>
                                    <p className="font-semibold">{formatTimeRemaining(trainingProgress.estimatedTimeRemaining)}</p>
                                </div>
                            </div>

                            <div className="h-64 mb-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={lossHistory}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="iteration"
                                            label={{ value: 'Iteration', position: 'insideBottomRight', offset: -10 }}
                                        />
                                        <YAxis label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="loss"
                                            stroke="#8884d8"
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => setIsTraining(false)}
                            >
                                Cancel Training
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="border rounded-md p-4">
                    <h3 className="font-semibold mb-4">Start New Training</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Iterations (Epochs)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={config.iterations}
                                onChange={e => setConfig({ ...config, iterations: parseInt(e.target.value) || 10 })}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Batch Size
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="128"
                                step="8"
                                value={config.batchSize}
                                onChange={e => setConfig({ ...config, batchSize: parseInt(e.target.value) || 64 })}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Learning Rate
                            </label>
                            <input
                                type="number"
                                min="0.0001"
                                max="0.1"
                                step="0.0001"
                                value={config.learningRate}
                                onChange={e => setConfig({ ...config, learningRate: parseFloat(e.target.value) || 0.001 })}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dropout Rate
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="0.5"
                                step="0.05"
                                value={config.dropoutRate}
                                onChange={e => setConfig({ ...config, dropoutRate: parseFloat(e.target.value) || 0.2 })}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4 className="font-medium mb-2">Optimizations</h4>
                        <div className="flex flex-wrap gap-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.applyPruning}
                                    onChange={e => setConfig({ ...config, applyPruning: e.target.checked })}
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2">Model Pruning</span>
                            </label>

                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.applyQuantization}
                                    onChange={e => setConfig({ ...config, applyQuantization: e.target.checked })}
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2">Quantization</span>
                            </label>

                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.enableCollaborativeValidation}
                                    onChange={e => setConfig({ ...config, enableCollaborativeValidation: e.target.checked })}
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2">Collaborative Validation</span>
                            </label>
                        </div>
                    </div>

                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={startTraining}
                    >
                        Start Training
                    </button>
                </div>
            )}
        </div>
    );

    // Onglet de paramètres
    const renderSettingsTab = () => (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Settings</h2>

            <div className="border rounded-md p-4">
                <h3 className="font-semibold mb-4">Hardware Optimization</h3>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Device Selection
                    </label>
                    <select className="w-full p-2 border rounded">
                        <option value="auto">Auto (Recommended)</option>
                        <option value="cpu">CPU Only</option>
                        <option value="gpu">GPU (AMD Radeon)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        Auto will use AMD ROCm acceleration when available
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Thread Count
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="16"
                            defaultValue="12"
                            className="w-full p-2 border rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Ryzen 9 6900HX supports up to 16 threads
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Memory Allocation (GB)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="28"
                            defaultValue="24"
                            step="1"
                            className="w-full p-2 border rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Maximum recommended: 28GB of 32GB total
                        </p>
                    </div>
                </div>

                <h3 className="font-semibold mb-4">Storage Settings</h3>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Storage Location
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            defaultValue="C:/MetaSign/FineTuning"
                            className="flex-1 p-2 border rounded"
                        />
                        <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                            Browse
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Compression Format
                    </label>
                    <select className="w-full p-2 border rounded">
                        <option value="zstd">ZSTD (Recommended)</option>
                        <option value="brotli">Brotli</option>
                        <option value="gzip">GZIP</option>
                        <option value="none">No Compression</option>
                    </select>
                </div>

                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Save Settings
                </button>
            </div>

            <div className="border rounded-md p-4 mt-4">
                <h3 className="font-semibold mb-4">System Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm">
                            <span className="text-gray-500">CPU:</span>
                            <span className="ml-2">AMD Ryzen 9 6900HX (8 cores, 16 threads)</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm">
                            <span className="text-gray-500">RAM:</span>
                            <span className="ml-2">32GB (29.7GB available)</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm">
                            <span className="text-gray-500">Graphics:</span>
                            <span className="ml-2">AMD Radeon Graphics (integrated)</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm">
                            <span className="text-gray-500">AVX2 Support:</span>
                            <span className="ml-2">Yes</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm">
                            <span className="text-gray-500">ROCm Support:</span>
                            <span className="ml-2">Yes</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm">
                            <span className="text-gray-500">System:</span>
                            <span className="ml-2">64-bit Windows</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">MetaSign Local Fine-Tuning</h1>

            {/* Onglets */}
            <div className="flex border-b mb-4">
                <button
                    className={`px-4 py-2 ${activeTab === 'models' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('models')}
                >
                    Models
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'training' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('training')}
                >
                    Training
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'settings' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
            </div>

            {/* Contenu des onglets */}
            {renderTabContent()}
        </div>
    );
};

export default FineTuningUI;