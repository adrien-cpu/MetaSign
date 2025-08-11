'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, X } from 'lucide-react';

interface Sign {
    id: number;
    word: string;
    timestamp: number;
    videoUrl: string;
}

interface FeedbackSystemProps {
    signs: Sign[];
    onClose: () => void;
}

const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ signs, onClose }) => {
    const [ratings, setRatings] = useState({
        grammar: 0,
        fluidity: 0,
        naturalness: 0,
        clarity: 0,
        emotionalExpression: 0
    });

    const [comment, setComment] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const ratingCriteria = {
        grammar: "Grammaire LSF",
        fluidity: "Fluidité des mouvements",
        naturalness: "Naturel des expressions",
        clarity: "Clarté du message",
        emotionalExpression: "Expression des émotions"
    };

    const handleRating = (criterion: keyof typeof ratings, value: number) => {
        setRatings(prev => ({
            ...prev,
            [criterion]: value
        }));
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const videoURL = URL.createObjectURL(blob);
                setRecordedVideo(videoURL);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Erreur d'accès à la caméra:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        }
    };

    const handleSubmit = () => {
        console.log('Feedback soumis:', { ratings, comment, signs });
        onClose();
    };

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Évaluation de la traduction</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Critères d &apos; évaluation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(ratingCriteria).map(([key, label]) => (
                            <div key={key} className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{label}</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            onClick={() => handleRating(key as keyof typeof ratings, value)}
                                            className={`p-2 rounded-full w-10 h-10 flex items-center justify-center transition-colors ${ratings[key as keyof typeof ratings] >= value
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            <Star className={`w-4 h-4 ${ratings[key as keyof typeof ratings] >= value ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Commentaire écrit</CardTitle>
                </CardHeader>
                <CardContent>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full h-32 p-3 border rounded-lg resize-none"
                        placeholder="Ajoutez vos remarques ou suggestions ici..."
                    />
                </CardContent>
            </Card>
            <div className="flex justify-between items-center mt-4">
                <Button onClick={startRecording} disabled={isRecording} className="bg-green-500 text-white">
                    Démarrer l &apos;enregistrement
                </Button>
                <Button onClick={stopRecording} disabled={!isRecording} className="bg-red-500 text-white">
                    Arrêter l &apos; enregistrement
                </Button>
            </div>
            {recordedVideo && (
                <div className="mt-4">
                    <h3 className="text-lg font-medium">Vidéo enregistrée :</h3>
                    <video ref={videoRef} src={recordedVideo} controls className="w-full mt-2" />
                </div>
            )}
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Annuler</Button>
                <Button onClick={handleSubmit} className="bg-blue-500 text-white">Soumettre l &apos; évaluation</Button>
            </div>
        </div>
    );
};

export default FeedbackSystem;
