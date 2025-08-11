import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ModerationFlag {
    id: string;
    type: string;
    severity: 'high' | 'medium' | 'low';
    aiDecision: {
        reason: string;
        suggestedAction: string;
    };
}

interface UserFeedback {
    moderationFlags: ModerationFlag[];
}

const Moderate: React.FC = () => {
    const [userFeedback,] = useState<UserFeedback>({
        moderationFlags: [
            {
                id: 'flag-1',
                type: 'Inappropriate Content',
                severity: 'high',
                aiDecision: {
                    reason: 'Detected offensive language',
                    suggestedAction: 'Review and remove content'
                }
            },
            {
                id: 'flag-2',
                type: 'Spam',
                severity: 'medium',
                aiDecision: {
                    reason: 'Repeated content detected',
                    suggestedAction: 'Consider marking as spam'
                }
            }
        ]
    });

    return (
        <div>
            <h2>Moderation Dashboard</h2>
            <p>This is the moderation dashboard where you can manage content moderation tasks.</p>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Modération
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {userFeedback.moderationFlags.map((flag: ModerationFlag) => (
                            <div key={flag.id} className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className={`h-4 w-4 ${flag.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
                                    <h3 className="font-medium">{flag.type}</h3>
                                </div>
                                <div className="mt-3 bg-white p-3 rounded">
                                    <p className="text-sm">{flag.aiDecision.reason}</p>
                                    <p className="text-sm mt-2 font-medium">{flag.aiDecision.suggestedAction}</p>
                                </div>
                                <CardFooter>
                                    <button className="text-blue-500">Review</button>
                                    <button className="text-red-500 ml-2">Dismiss</button>
                                </CardFooter>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Moderate;
