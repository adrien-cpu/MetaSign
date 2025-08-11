"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from "next/image";

const AvatarCreator = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const subdomain = process.env.NEXT_PUBLIC_RPM_SUBDOMAIN;
        const appId = process.env.NEXT_PUBLIC_RPM_APP_ID;
        const url = `https://${subdomain}.readyplayer.me/avatar?frameApi&appId=${appId}`;

        if (iframeRef.current) {
            iframeRef.current.src = url;
        }

        const handleMessage = (event: MessageEvent) => {
            const json = parseMessage(event);
            if (json?.source !== 'readyplayerme') return;

            if (json.eventName === 'v1.frame.ready') {
                console.log('Frame ready');
            }
            if (json.eventName === 'v1.avatar.exported') {
                console.log('Avatar URL:', json.data.url);
                setAvatarUrl(json.data.url);
            }
        };

        const parseMessage = (event: MessageEvent) => {
            try {
                return JSON.parse(event.data);
            } catch {
                return null;
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    return (
        <div >
            <iframe
                ref={iframeRef}
                className="max-w-7xl flex-1 w-screen border-none"
                style={{
                    minHeight: "calc(100vh - 80px)", // ✅ Hauteur dynamique excluant la Topbar et BottomBar
                    marginTop: "40px", // ✅ Décalage sous la Topbar
                    marginBottom: "40px", // ✅ Décalage avant la BottomBar
                    zIndex: 30
                }}
                allow="camera *; microphone *"
            />
            {avatarUrl && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold">Avatar créé</h3>
                    <Image src={avatarUrl} alt="Avatar" width={192} height={192} />
                </div>
            )}
        </div>
    );
};

export default AvatarCreator;
