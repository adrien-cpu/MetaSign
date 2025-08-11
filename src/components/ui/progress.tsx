'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressProps {
    value: number; // Pourcentage de progression (0-100)
    className?: string;
}

const Progress: React.FC<ProgressProps> = ({ value, className }) => {
    return (
        <div className={`relative w-full bg-gray-700 rounded-lg h-4 overflow-hidden ${className}`}>
            <motion.div
                className="h-full bg-yellow-400 rounded-lg"
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1 }}
            />
        </div>
    );
};

export default Progress;
