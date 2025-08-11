//src/components/lsf/ProsodicPatternsViewer.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Move, Star, StarOff } from 'lucide-react';
import Link from 'next/link';
import { ProsodicFeature } from '@ai-types/lsf';
import LSFProsodicPatterns from '@ai/systems/expressions/prosodic/LSFProsodicPatterns';

interface ProsodicPatternsViewerProps {
    editMode?: boolean;
    onPatternsUpdated?: (features: ProsodicFeature[]) => void;
}

/**
 * Composant de visualisation des modèles prosodiques LSF
 */
const ProsodicPatternsViewer: React.FC<ProsodicPatternsViewerProps> = ({
    editMode = false,
    onPatternsUpdated
}) => {
    const [features, setFeatures] = useState<ProsodicFeature[]>([]);
    const [draggedCard, setDraggedCard] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // Initialisation au chargement du composant
    useEffect(() => {
        const prosodicManager = new LSFProsodicPatterns();
        setFeatures(prosodicManager.getFeaturedPatterns());
    }, []);

    // Notification lorsque les modèles sont mis à jour
    useEffect(() => {
        if (onPatternsUpdated && features.length > 0) {
            onPatternsUpdated(features);
        }
    }, [features, onPatternsUpdated]);

    const handleDragStart = (id: string, event: React.DragEvent<HTMLDivElement>) => {
        if (editMode) {
            setDraggedCard(id);
            event.dataTransfer.effectAllowed = "move";
        }
    };

    const handleDragOver = (id: string, event: React.DragEvent<HTMLDivElement>) => {
        if (editMode && draggedCard && draggedCard !== id) {
            event.preventDefault();
            setHoveredCard(id);
        }
    };

    const handleDrop = (id: string) => {
        if (editMode && draggedCard && draggedCard !== id) {
            const updatedFeatures = [...features];
            const draggedIndex = updatedFeatures.findIndex(f => f.id === draggedCard);
            const targetIndex = updatedFeatures.findIndex(f => f.id === id);
            const [draggedItem] = updatedFeatures.splice(draggedIndex, 1);
            updatedFeatures.splice(targetIndex, 0, draggedItem);
            setFeatures(updatedFeatures);
            setDraggedCard(null);
            setHoveredCard(null);
        }
    };

    const handleDragEnd = () => {
        setDraggedCard(null);
        setHoveredCard(null);
    };

    const toggleFavorite = (id: string, event: React.MouseEvent) => {
        event.preventDefault(); // Empêche la navigation si on clique sur le bouton
        event.stopPropagation(); // Empêche la propagation de l'événement

        const updatedFeatures = features.map(feature =>
            feature.id === id ? { ...feature, isFavorite: !feature.isFavorite } : feature
        );
        setFeatures(updatedFeatures);
    };

    // Si aucun modèle n'est disponible, afficher un message
    if (features.length === 0) {
        return <div className="p-4 text-center">Chargement des modèles prosodiques...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
                <div
                    key={feature.id}
                    onDragOver={(e) => handleDragOver(feature.id, e)}
                    onDrop={() => handleDrop(feature.id)}
                    className={`border-2 ${hoveredCard === feature.id ? 'border-blue-500' : 'border-transparent'}`}
                >
                    <Link href={`/prosodic-patterns/${feature.patternId}`}>
                        <Card
                            draggable={editMode}
                            onDragStart={(e) => handleDragStart(feature.id, e)}
                            onDragEnd={handleDragEnd}
                        >
                            <CardHeader className="flex items-center p-4 gap-4">
                                {editMode && <Move size={24} className="text-gray-600" />}
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-800">
                                        {feature.title}
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">{feature.description}</p>
                                </div>
                                <button onClick={(e) => toggleFavorite(feature.id, e)}>
                                    {feature.isFavorite ? (
                                        <Star className="text-yellow-500" />
                                    ) : (
                                        <StarOff className="text-gray-500" />
                                    )}
                                </button>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default ProsodicPatternsViewer;