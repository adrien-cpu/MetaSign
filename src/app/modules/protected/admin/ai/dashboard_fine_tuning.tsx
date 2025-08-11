import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const FineTuningDashboard = () => {
    const [models, setModels] = useState([]);
    const [selectedModelId, setSelectedModelId] = useState(null);
    const [trainingProgress, setTrainingProgress] = useState(null);
    const [systemResources, setSystemResources] = useState({
        cpu: 30,
        memory: 40,
        temperature: 65
    });
    const [activeTab, setActiveTab] = useState('models');

    useEffect(() => {
        const mockModels = [
            { id: 'ft_lsf_emotions_20250328', name: 'Émotions LSF adaptées', createdAt: '2025-03-28T14:22:15Z', accuracy: 0.94, size: 45, type: 'text-classification', optimized: true, usageCount: 156 },
            { id: 'ft_expression_spatial_20250325', name: 'Expressions Spatiales Complexes', createdAt: '2025-03-25T09:18:42Z', accuracy: 0.91, size: 68, type: 'multimodal', optimized: true, usageCount: 87 },
            { id: 'ft_dialectal_variations_20250320', name: 'Variations Dialectales LSF', createdAt: '2025-03-20T16:45:30Z', accuracy: 0.89, size: 52, type: 'text-classification', optimized: false, usageCount: 124 }
        ];
        setModels(mockModels);
    }, []);

    useEffect(() => {
        const resourceInterval = setInterval(() => {
            setSystemResources({
                cpu: 30 + Math.random() * 20,
                memory: 40 + Math.random() * 15,
                temperature: 65 + Math.random() * 10
            });
        }, 3000);
        return () => clearInterval(resourceInterval);
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const renderModelsTable = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border">Nom du modèle</th>
                        <th className="py-2 px-4 border">Type</th>
                        <th className="py-2 px-4 border">Précision</th>
                        <th className="py-2 px-4 border">Taille (MB)</th>
                        <th className="py-2 px-4 border">Date de création</th>
                        <th className="py-2 px-4 border">Optimisé</th>
                        <th className="py-2 px-4 border">Utilisations</th>
                        <th className="py-2 px-4 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {models.map(model => (
                        <tr key={model.id} className={selectedModelId === model.id ? "bg-blue-50" : ""}>
                            <td className="py-2 px-4 border font-medium">{model.name}</td>
                            <td className="py-2 px-4 border">{model.type}</td>
                            <td className="py-2 px-4 border">{(model.accuracy * 100).toFixed(1)}%</td>
                            <td className="py-2 px-4 border">{model.size} MB</td>
                            <td className="py-2 px-4 border">{formatDate(model.createdAt)}</td>
                            <td className="py-2 px-4 border">
                                <span className={`px-2 py-1 text-xs rounded-full ${model.optimized ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {model.optimized ? 'Oui' : 'Non'}
                                </span>
                            </td>
                            <td className="py-2 px-4 border">{model.usageCount}</td>
                            <td className="py-2 px-4 border">
                                <div className="flex space-x-2">
                                    <button className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600" onClick={() => setSelectedModelId(model.id)}>Détails</button>
                                    <button className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600">Exporter</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-xl font-semibold mb-4">Tableau de bord du Fine-Tuning</h2>
            <div className="bg-white p-4 rounded-lg shadow">
                {renderModelsTable()}
            </div>
        </div>
    );
};

export default FineTuningDashboard;
