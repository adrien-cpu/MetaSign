/**
 * @fileoverview Gestionnaire d'exercices et scénarios CODA
 * Chemin: src/components/learning/coda/CODAExerciseManager.tsx
 * 
 * Interface de gestion complète des exercices pour le système CODA virtuel,
 * incluant la création, modification, et personnalisation des scénarios d'apprentissage.
 * 
 * @author MetaSign AI Team
 * @version 1.0.0
 * @since 2024
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
    Plus,
    Edit,
    Trash2,
    Play,
    Copy,
    Filter,
    Search,
    BookOpen,
    Target,
    Clock,
    Users,
    Brain,
    Star,
    AlertCircle,
    CheckCircle,
    Settings,
    Shuffle,
    TrendingUp,
    Award,
    Lightbulb,
    Eye,
    Hand
} from 'lucide-react';

// Types pour les exercices CODA
interface CODAExercise {
    id: string;
    title: string;
    description: string;
    type: ExerciseType;
    difficulty: DifficultyLevel;
    targetLevel: CECRLLevel;
    duration: number; // en minutes
    skills: SkillArea[];
    learningObjectives: string[];
    instructions: string;
    context: CulturalContext;
    adaptationRules: AdaptationRule[];
    successCriteria: SuccessCriteria;
    errorPatterns: ErrorPattern[];
    variations: ExerciseVariation[];
    createdAt: Date;
    lastUsed: Date;
    usageCount: number;
    averageSuccess: number;
    isActive: boolean;
    tags: string[];
}

type ExerciseType =
    | 'vocabulary_introduction'
    | 'grammar_practice'
    | 'spatial_syntax'
    | 'expression_training'
    | 'comprehension_check'
    | 'cultural_context'
    | 'error_correction'
    | 'free_conversation';

type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type SkillArea =
    | 'vocabulary'
    | 'grammar'
    | 'spatial_syntax'
    | 'facial_expressions'
    | 'manual_components'
    | 'non_manual_markers'
    | 'cultural_context'
    | 'comprehension';

interface CulturalContext {
    region: string;
    formality: 'formal' | 'informal' | 'mixed';
    setting: 'educational' | 'social' | 'professional' | 'family';
    ageGroup: 'child' | 'teen' | 'adult' | 'senior' | 'mixed';
}

interface AdaptationRule {
    condition: string;
    action: 'increase_difficulty' | 'decrease_difficulty' | 'change_focus' | 'add_hints' | 'skip_step';
    parameters: Record<string, unknown>;
}

interface SuccessCriteria {
    minimumAccuracy: number; // 0-100
    timeLimit?: number; // en secondes
    requiredSkills: SkillArea[];
    allowedErrors: number;
    progression_threshold: number;
}

interface ErrorPattern {
    type: 'spatial' | 'temporal' | 'manual' | 'facial' | 'grammatical';
    description: string;
    commonCauses: string[];
    corrections: string[];
    difficulty_impact: number;
}

interface ExerciseVariation {
    id: string;
    name: string;
    modifications: string[];
    difficulty_delta: number; // -2 à +2
}

interface ExerciseTemplate {
    id: string;
    name: string;
    description: string;
    baseStructure: Partial<CODAExercise>;
    customizableFields: string[];
}

/**
 * Composant de gestion des exercices CODA
 * 
 * Fonctionnalités:
 * - Création et édition d'exercices
 * - Gestion des templates et variations
 * - Système de filtrage et recherche
 * - Adaptation automatique selon le niveau
 * - Statistiques d'utilisation
 */
const CODAExerciseManager: React.FC = () => {
    // États du composant
    const [exercises, setExercises] = useState<CODAExercise[]>([]);
    const [templates, setTemplates] = useState<ExerciseTemplate[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<CODAExercise | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<ExerciseType | 'all'>('all');
    const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | 'all'>('all');
    const [filterLevel, setFilterLevel] = useState<CECRLLevel | 'all'>('all');
    const [isLoading, setIsLoading] = useState(true);

    // Templates prédéfinis
    const defaultTemplates: ExerciseTemplate[] = [
        {
            id: 'vocab-intro',
            name: 'Introduction vocabulaire',
            description: 'Template pour introduire de nouveaux signes',
            baseStructure: {
                type: 'vocabulary_introduction',
                duration: 15,
                skills: ['vocabulary', 'manual_components'],
                context: {
                    region: 'France',
                    formality: 'informal',
                    setting: 'educational',
                    ageGroup: 'mixed'
                }
            },
            customizableFields: ['title', 'description', 'learningObjectives', 'targetLevel']
        },
        {
            id: 'grammar-practice',
            name: 'Pratique grammaticale',
            description: 'Template pour les exercices de grammaire',
            baseStructure: {
                type: 'grammar_practice',
                duration: 20,
                skills: ['grammar', 'spatial_syntax'],
                context: {
                    region: 'France',
                    formality: 'mixed',
                    setting: 'educational',
                    ageGroup: 'mixed'
                }
            },
            customizableFields: ['title', 'description', 'learningObjectives', 'difficulty']
        },
        {
            id: 'expression-training',
            name: 'Entraînement expressif',
            description: 'Template pour les expressions faciales et corporelles',
            baseStructure: {
                type: 'expression_training',
                duration: 10,
                skills: ['facial_expressions', 'non_manual_markers'],
                context: {
                    region: 'France',
                    formality: 'informal',
                    setting: 'social',
                    ageGroup: 'mixed'
                }
            },
            customizableFields: ['title', 'description', 'learningObjectives', 'context']
        }
    ];

    // Chargement initial des données
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            // Simulation d'appel API
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Exercices mockés
            const mockExercises: CODAExercise[] = [
                {
                    id: 'ex-001',
                    title: 'Les émotions de base',
                    description: 'Apprendre à signer les émotions fondamentales',
                    type: 'vocabulary_introduction',
                    difficulty: 2,
                    targetLevel: 'A2',
                    duration: 15,
                    skills: ['vocabulary', 'facial_expressions'],
                    learningObjectives: [
                        'Maîtriser 6 signes d\'émotions',
                        'Associer expressions faciales appropriées',
                        'Utiliser le contexte spatial'
                    ],
                    instructions: 'Montrez chaque émotion avec l\'expression faciale correspondante',
                    context: {
                        region: 'France',
                        formality: 'informal',
                        setting: 'educational',
                        ageGroup: 'mixed'
                    },
                    adaptationRules: [
                        {
                            condition: 'accuracy < 60%',
                            action: 'add_hints',
                            parameters: { hint_type: 'visual', frequency: 'high' }
                        }
                    ],
                    successCriteria: {
                        minimumAccuracy: 75,
                        timeLimit: 300,
                        requiredSkills: ['vocabulary', 'facial_expressions'],
                        allowedErrors: 2,
                        progression_threshold: 80
                    },
                    errorPatterns: [
                        {
                            type: 'facial',
                            description: 'Expression neutre sur signes émotionnels',
                            commonCauses: ['Concentration sur les mains', 'Timidité', 'Méconnaissance'],
                            corrections: ['Rappeler l\'importance des expressions', 'Démonstration exagérée', 'Pratique devant miroir'],
                            difficulty_impact: 1
                        }
                    ],
                    variations: [
                        {
                            id: 'var-001',
                            name: 'Version rapide',
                            modifications: ['Réduction du temps', 'Moins de répétitions'],
                            difficulty_delta: 1
                        }
                    ],
                    createdAt: new Date('2024-01-10'),
                    lastUsed: new Date('2024-01-20'),
                    usageCount: 15,
                    averageSuccess: 78,
                    isActive: true,
                    tags: ['émotions', 'débutant', 'expressions']
                },
                {
                    id: 'ex-002',
                    title: 'Questions spatiales complexes',
                    description: 'Maîtriser l\'utilisation de l\'espace pour les questions',
                    type: 'spatial_syntax',
                    difficulty: 4,
                    targetLevel: 'B2',
                    duration: 25,
                    skills: ['spatial_syntax', 'grammar'],
                    learningObjectives: [
                        'Utiliser l\'espace pour les questions rhétoriques',
                        'Maîtriser les référents spatiaux multiples',
                        'Coordonner regard et pointage'
                    ],
                    instructions: 'Construisez des questions en utilisant différents points de l\'espace',
                    context: {
                        region: 'France',
                        formality: 'formal',
                        setting: 'professional',
                        ageGroup: 'adult'
                    },
                    adaptationRules: [
                        {
                            condition: 'spatial_errors > 3',
                            action: 'decrease_difficulty',
                            parameters: { remove_complexity: 'multi_reference' }
                        }
                    ],
                    successCriteria: {
                        minimumAccuracy: 85,
                        timeLimit: 600,
                        requiredSkills: ['spatial_syntax', 'grammar'],
                        allowedErrors: 1,
                        progression_threshold: 90
                    },
                    errorPatterns: [
                        {
                            type: 'spatial',
                            description: 'Confusion des référents spatiaux',
                            commonCauses: ['Surcharge cognitive', 'Manque de pratique', 'Planification insuffisante'],
                            corrections: ['Exercices de mapping', 'Ralentir le rythme', 'Décomposer les étapes'],
                            difficulty_impact: 2
                        }
                    ],
                    variations: [
                        {
                            id: 'var-002',
                            name: 'Version simplifiée',
                            modifications: ['Un seul référent', 'Questions directes uniquement'],
                            difficulty_delta: -2
                        }
                    ],
                    createdAt: new Date('2024-01-08'),
                    lastUsed: new Date('2024-01-19'),
                    usageCount: 8,
                    averageSuccess: 65,
                    isActive: true,
                    tags: ['spatial', 'avancé', 'questions']
                },
                {
                    id: 'ex-003',
                    title: 'Correction d\'erreurs temporelles',
                    description: 'Identifier et corriger les erreurs de marquage temporel',
                    type: 'error_correction',
                    difficulty: 3,
                    targetLevel: 'B1',
                    duration: 20,
                    skills: ['grammar', 'non_manual_markers'],
                    learningObjectives: [
                        'Reconnaître les erreurs temporelles',
                        'Proposer des corrections appropriées',
                        'Utiliser les marqueurs non-manuels'
                    ],
                    instructions: 'Analysez les productions de l\'avatar et corrigez les erreurs temporelles',
                    context: {
                        region: 'France',
                        formality: 'mixed',
                        setting: 'educational',
                        ageGroup: 'teen'
                    },
                    adaptationRules: [
                        {
                            condition: 'correction_accuracy < 70%',
                            action: 'add_hints',
                            parameters: { highlight_errors: true, provide_examples: true }
                        }
                    ],
                    successCriteria: {
                        minimumAccuracy: 80,
                        timeLimit: 480,
                        requiredSkills: ['grammar', 'non_manual_markers'],
                        allowedErrors: 2,
                        progression_threshold: 85
                    },
                    errorPatterns: [
                        {
                            type: 'temporal',
                            description: 'Marqueurs temporels incohérents',
                            commonCauses: ['Méconnaissance des règles', 'Automatismes insuffisants'],
                            corrections: ['Révision théorique', 'Exercices répétitifs', 'Feedback immédiat'],
                            difficulty_impact: 1
                        }
                    ],
                    variations: [],
                    createdAt: new Date('2024-01-12'),
                    lastUsed: new Date('2024-01-18'),
                    usageCount: 12,
                    averageSuccess: 72,
                    isActive: true,
                    tags: ['correction', 'temporel', 'intermédiaire']
                }
            ];

            setExercises(mockExercises);
            setTemplates(defaultTemplates);
            setIsLoading(false);
        };

        loadData();
    }, []);

    // Exercices filtrés
    const filteredExercises = useMemo(() => {
        return exercises.filter(exercise => {
            const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                exercise.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesType = filterType === 'all' || exercise.type === filterType;
            const matchesDifficulty = filterDifficulty === 'all' || exercise.difficulty === filterDifficulty;
            const matchesLevel = filterLevel === 'all' || exercise.targetLevel === filterLevel;

            return matchesSearch && matchesType && matchesDifficulty && matchesLevel && exercise.isActive;
        });
    }, [exercises, searchTerm, filterType, filterDifficulty, filterLevel]);

    // Handlers
    const handleCreateExercise = useCallback((template?: ExerciseTemplate) => {
        setIsCreating(true);
        if (template) {
            const newExercise: Partial<CODAExercise> = {
                ...template.baseStructure,
                id: `ex-${Date.now()}`,
                title: 'Nouvel exercice',
                description: 'Description à compléter',
                createdAt: new Date(),
                lastUsed: new Date(),
                usageCount: 0,
                averageSuccess: 0,
                isActive: true,
                tags: [],
                learningObjectives: [],
                instructions: '',
                adaptationRules: [],
                errorPatterns: [],
                variations: [],
                successCriteria: {
                    minimumAccuracy: 70,
                    allowedErrors: 3,
                    requiredSkills: template.baseStructure.skills || [],
                    progression_threshold: 75
                }
            };
            setSelectedExercise(newExercise as CODAExercise);
        }
    }, []);

    const handleEditExercise = useCallback((exercise: CODAExercise) => {
        setSelectedExercise(exercise);
        setIsEditing(true);
    }, []);

    const handleDeleteExercise = useCallback((exerciseId: string) => {
        setExercises(prev => prev.map(ex =>
            ex.id === exerciseId ? { ...ex, isActive: false } : ex
        ));
    }, []);

    const handleDuplicateExercise = useCallback((exercise: CODAExercise) => {
        const duplicated = {
            ...exercise,
            id: `ex-${Date.now()}`,
            title: `${exercise.title} (Copie)`,
            createdAt: new Date(),
            usageCount: 0,
            averageSuccess: 0
        };
        setExercises(prev => [...prev, duplicated]);
    }, []);

    const handleSaveExercise = useCallback((exercise: CODAExercise) => {
        if (isCreating) {
            setExercises(prev => [...prev, exercise]);
            setIsCreating(false);
        } else {
            setExercises(prev => prev.map(ex => ex.id === exercise.id ? exercise : ex));
            setIsEditing(false);
        }
        setSelectedExercise(null);
    }, [isCreating]);

    // Helpers
    const getTypeIcon = (type: ExerciseType) => {
        const iconMap: Record<ExerciseType, React.ReactNode> = {
            vocabulary_introduction: <BookOpen className="w-4 h-4" />,
            grammar_practice: <Target className="w-4 h-4" />,
            spatial_syntax: <TrendingUp className="w-4 h-4" />,
            expression_training: <Eye className="w-4 h-4" />,
            comprehension_check: <Brain className="w-4 h-4" />,
            cultural_context: <Users className="w-4 h-4" />,
            error_correction: <AlertCircle className="w-4 h-4" />,
            free_conversation: <Hand className="w-4 h-4" />
        };
        return iconMap[type];
    };

    const getTypeLabel = (type: ExerciseType) => {
        const labelMap: Record<ExerciseType, string> = {
            vocabulary_introduction: 'Introduction vocabulaire',
            grammar_practice: 'Pratique grammaticale',
            spatial_syntax: 'Syntaxe spatiale',
            expression_training: 'Entraînement expressif',
            comprehension_check: 'Vérification compréhension',
            cultural_context: 'Contexte culturel',
            error_correction: 'Correction d\'erreurs',
            free_conversation: 'Conversation libre'
        };
        return labelMap[type];
    };

    const getDifficultyColor = (difficulty: DifficultyLevel) => {
        const colorMap: Record<DifficultyLevel, string> = {
            1: 'bg-green-100 text-green-800',
            2: 'bg-blue-100 text-blue-800',
            3: 'bg-yellow-100 text-yellow-800',
            4: 'bg-orange-100 text-orange-800',
            5: 'bg-red-100 text-red-800'
        };
        return colorMap[difficulty];
    };

    const getLevelBadgeColor = (level: CECRLLevel) => {
        const colorMap: Record<CECRLLevel, string> = {
            'A1': 'bg-green-100 text-green-800',
            'A2': 'bg-blue-100 text-blue-800',
            'B1': 'bg-yellow-100 text-yellow-800',
            'B2': 'bg-orange-100 text-orange-800',
            'C1': 'bg-purple-100 text-purple-800',
            'C2': 'bg-red-100 text-red-800'
        };
        return colorMap[level];
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Chargement des exercices...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestionnaire d'exercices CODA</h1>
                    <p className="text-gray-600 mt-1">
                        Créez et gérez les exercices pour votre avatar étudiant
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => handleCreateExercise()}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvel exercice
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="exercises" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="exercises">Exercices</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="statistics">Statistiques</TabsTrigger>
                </TabsList>

                {/* Liste des exercices */}
                <TabsContent value="exercises" className="space-y-6">
                    {/* Filtres et recherche */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex-1 min-w-64">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Rechercher un exercice..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as ExerciseType | 'all')}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Tous les types</option>
                                    <option value="vocabulary_introduction">Vocabulaire</option>
                                    <option value="grammar_practice">Grammaire</option>
                                    <option value="spatial_syntax">Syntaxe spatiale</option>
                                    <option value="expression_training">Expression</option>
                                    <option value="comprehension_check">Compréhension</option>
                                    <option value="cultural_context">Culturel</option>
                                    <option value="error_correction">Correction</option>
                                    <option value="free_conversation">Conversation</option>
                                </select>

                                <select
                                    value={filterDifficulty}
                                    onChange={(e) => setFilterDifficulty(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as DifficultyLevel)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Toute difficulté</option>
                                    <option value="1">Très facile</option>
                                    <option value="2">Facile</option>
                                    <option value="3">Moyen</option>
                                    <option value="4">Difficile</option>
                                    <option value="5">Très difficile</option>
                                </select>

                                <select
                                    value={filterLevel}
                                    onChange={(e) => setFilterLevel(e.target.value as CECRLLevel | 'all')}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Tous niveaux</option>
                                    <option value="A1">A1</option>
                                    <option value="A2">A2</option>
                                    <option value="B1">B1</option>
                                    <option value="B2">B2</option>
                                    <option value="C1">C1</option>
                                    <option value="C2">C2</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Liste des exercices */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredExercises.map((exercise) => (
                            <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(exercise.type)}
                                            <CardTitle className="text-lg">{exercise.title}</CardTitle>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEditExercise(exercise)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDuplicateExercise(exercise)}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteExercise(exercise.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <p className="text-sm text-gray-600 line-clamp-2">{exercise.description}</p>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge className={getLevelBadgeColor(exercise.targetLevel)}>
                                            {exercise.targetLevel}
                                        </Badge>
                                        <Badge className={getDifficultyColor(exercise.difficulty)}>
                                            Niveau {exercise.difficulty}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {getTypeLabel(exercise.type)}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span>{exercise.duration} min</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Play className="w-4 h-4 text-gray-500" />
                                            <span>{exercise.usageCount} fois</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-gray-500" />
                                            <span>{exercise.averageSuccess}% réussite</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span>{exercise.lastUsed.toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {exercise.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {exercise.tags.slice(0, 3).map((tag, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {exercise.tags.length > 3 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{exercise.tags.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    <div className="pt-2 border-t">
                                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                            <Play className="w-4 h-4 mr-2" />
                                            Démarrer l'exercice
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredExercises.length === 0 && (
                        <Card>
                            <CardContent className="text-center py-12">
                                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg text-gray-600 mb-2">Aucun exercice trouvé</p>
                                <p className="text-gray-500 mb-4">
                                    Modifiez vos filtres ou créez un nouvel exercice
                                </p>
                                <Button onClick={() => handleCreateExercise()}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Créer un exercice
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Templates */}
                <TabsContent value="templates" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {templates.map((template) => (
                            <Card key={template.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                                        {template.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-gray-600">{template.description}</p>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Champs personnalisables:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {template.customizableFields.map((field, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {field}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t">
                                        <Button
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleCreateExercise(template)}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Utiliser ce template
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Statistiques */}
                <TabsContent value="statistics" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold">{exercises.filter(ex => ex.isActive).length}</p>
                                <p className="text-sm text-gray-600">Exercices actifs</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 text-center">
                                <Play className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold">
                                    {exercises.reduce((sum, ex) => sum + ex.usageCount, 0)}
                                </p>
                                <p className="text-sm text-gray-600">Utilisations totales</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 text-center">
                                <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold">
                                    {Math.round(exercises.reduce((sum, ex) => sum + ex.averageSuccess, 0) / exercises.length)}%
                                </p>
                                <p className="text-sm text-gray-600">Taux de réussite moyen</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 text-center">
                                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold">
                                    {Math.round(exercises.reduce((sum, ex) => sum + ex.duration, 0) / exercises.length)}
                                </p>
                                <p className="text-sm text-gray-600">Durée moyenne (min)</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CODAExerciseManager;