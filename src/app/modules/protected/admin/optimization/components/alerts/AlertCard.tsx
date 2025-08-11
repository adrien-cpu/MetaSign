// src/app/adminModules/optimization/components/alerts/AlertCard.tsx
import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Alert } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface AlertCardProps {
    alert: Alert;
    onAcknowledge: (id: string) => void;
    onResolve: (id: string) => void;
    onViewDetails: (alert: Alert) => void;
}

const severityIcons = {
    CRITICAL: AlertCircle,
    HIGH: AlertTriangle,
    MEDIUM: Clock,
    LOW: CheckCircle,
};

const severityColors = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    LOW: 'bg-blue-100 text-blue-800 border-blue-200',
};

export const AlertCard: React.FC<AlertCardProps> = ({
    alert,
    onAcknowledge,
    onResolve,
    onViewDetails,
}) => {
    const Icon = severityIcons[alert.severity];

    return (
        <Card className={cn(
            'border-l-4',
            severityColors[alert.severity]
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                    <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {alert.title}
                    </div>
                </CardTitle>
                <Badge variant={alert.status === 'RESOLVED' ? 'outline' : 'default'}>
                    {alert.status}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <p className="text-sm text-gray-500">{alert.description}</p>

                    <div className="flex flex-wrap gap-2">
                        {alert.impacts.map((impact, idx) => (
                            <Badge
                                key={idx}
                                variant="outline"
                                className={cn(
                                    impact.trend === 'POSITIVE' && 'border-green-500 text-green-700',
                                    impact.trend === 'NEGATIVE' && 'border-red-500 text-red-700'
                                )}
                            >
                                {impact.type}: {impact.value}
                            </Badge>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Source: {alert.source}</span>
                        <span>•</span>
                        <span>
                            {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                        </span>
                    </div>

                    {alert.affectedComponents.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {alert.affectedComponents.map((component, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                    {component}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetails(alert)}
                        >
                            View Details
                        </Button>
                        {alert.status === 'ACTIVE' && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onAcknowledge(alert.id)}
                                >
                                    Acknowledge
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => onResolve(alert.id)}
                                >
                                    Resolve
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};