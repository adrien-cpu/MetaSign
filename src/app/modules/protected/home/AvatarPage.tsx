'use client';

import React from 'react';
import Image from "next/image";

const AvatarPage = () => {
    return (
        <div>
            <Image
                src="/ReadyPlayerMe-Avatar.png"
                alt="Avatar"
                width={300}
                height={300}
                className="w-500 h-500 rounded-full border border-gray-300"
            />
        </div>
    );
};

export default AvatarPage;
