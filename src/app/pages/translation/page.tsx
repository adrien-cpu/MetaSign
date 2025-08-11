'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Languages, Mic, Globe, FileText, Video, Camera } from 'lucide-react';
import Banner from '@/components/ui/banner';
import { ROUTES } from '@/constants/routes';

interface HistoryItem {
    date: string;
    text: string;
}

interface HistoryRecord {
    [key: string]: HistoryItem[];
}

const history: HistoryRecord = {
    'text-to-sign': [
        { date: '2024-02-01', text: "Bonjour, comment allez-vous ?" },
        { date: '2024-02-01', text: "Je voudrais un café" }
    ],
    'lsf-to-voice': [
        { date: '2024-02-01', text: "Traduction vocale #1" },
        { date: '2024-02-01', text: "Traduction vocale #2" }
    ],
    'voice-to-lsf': [
        { date: '2024-02-01', text: "Message vocal #1" },
        { date: '2024-02-01', text: "Message vocal #2" }
    ],
    'sign-to-text': [
        { date: '2024-02-01', text: "LSF traduit #1" },
        { date: '2024-02-01', text: "LSF traduit #2" }
    ]
};

const modes = [
    {
        id: "text-to-sign",
        title: "Texte → LSF",
        description: "Traduire du texte en langue des signes française",
        icon: <Languages className="tile-icon text-blue-500 hover:text-blue-400" />
    },
    {
        id: "voice-to-lsf",
        title: "Voix → LSF",
        description: "Traduire la parole en langue des signes française",
        icon: <Mic className="tile-icon text-green-500 hover:text-green-400" />
    },
    {
        id: "sign-to-text",
        title: "LSF → Texte",
        description: "Traduire la langue des signes en texte",
        icon: <Globe className="tile-icon text-purple-500 hover:text-purple-400" />
    },
    {
        id: "lsf-to-voice",
        title: "LSF → Voix",
        description: "Convertir la langue des signes en parole",
        icon: <Mic className="tile-icon text-red-500 hover:text-red-400" />
    },
    {
        id: "lsf-to-foreign",
        title: "LSF → LS étrangère",
        description: "Traduire la LSF vers une autre langue des signes",
        icon: <Globe className="tile-icon text-teal-500 hover:text-teal-400" />
    },
    {
        id: "voice-to-text",
        title: "Voix → Texte",
        description: "Convertir la parole en texte",
        icon: <FileText className="tile-icon text-orange-500 hover:text-orange-400" />
    },
    {
        id: "foreign-to-lsf",
        title: "LS étrangère → LSF",
        description: "Traduire une langue des signes étrangère en LSF",
        icon: <Languages className="tile-icon text-indigo-500 hover:text-indigo-400" />
    },
    {
        id: "realtime",
        title: "Traduction en temps réel",
        description: "Traduire en temps réel avec la réalité augmentée",
        icon: <Video className="tile-icon text-yellow-500 hover:text-yellow-400" />
    },
    {
        id: "scan",
        title: "Scan et Traduction",
        description: "Traduire des documents en langue des signes",
        icon: <Camera className="tile-icon text-pink-500 hover:text-pink-400" />
    }
];

export default function TranslationUI() {
    return (
        <div>
            <Banner
                title="Traduction"
                description="Traduisez du texte ou de la voix en LSF"
                icon={<Languages className="text-blue-600" />}
                backHref={ROUTES.HOME}
            />

            <div className="container px-4 py-4">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-3 gap-6"
                        style={{
                            gridTemplateRows: 'repeat(3, 1fr)',
                            aspectRatio: '1'
                        }}
                    >
                        {modes.map((mode) => (
                            <Link
                                key={mode.id}
                                href={`/modules/protected/translation/${mode.id}`}
                                className="cursor-pointer"
                            >
                                <div className="tile">
                                    <div className="tile-header">
                                        {mode.icon}
                                        <h3 className="tile-title">{mode.title}</h3>
                                    </div>
                                    <p className="tile-description">{mode.description}</p>
                                    {history[mode.id]?.length > 0 && (
                                        <>
                                            <div className="border-t my-2"></div>
                                            <div className="flex-grow">
                                                <p className="text-base font-bold mb-1">Dernières traductions</p>
                                                <div className="space-y-1">
                                                    {history[mode.id]
                                                        .slice(0, 2)
                                                        .map((item, index) => (
                                                            <div key={index} className="text-sm truncate">
                                                                {item.text}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
