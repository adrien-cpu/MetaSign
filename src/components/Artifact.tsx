import React from "react";
import Image from "next/image";

interface ArtifactProps {
    id: string;
    title: string;
    description: string;
    mediaUrl?: string;
}

export default function Artifact({ id, title, description, mediaUrl }: ArtifactProps) {
    const [vote, setVote] = React.useState<null | boolean>(null);

    const handleVote = async (userVote: boolean) => {
        await fetch(`/api/artifacts/${id}/vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vote: userVote }),
        });
        setVote(userVote);
    };

    return (
        <div className="bg-gray-800 p-4 rounded-md">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p>{description}</p>
            {mediaUrl && (
                <Image
                    src={mediaUrl}
                    alt={title}
                    className="mt-2 rounded-md"
                    width={500}
                    height={300}
                    layout="intrinsic"
                />
            )}
            <div className="flex gap-2 mt-2">
                <button
                    onClick={() => handleVote(true)}
                    className={`p-2 rounded-md ${vote === true ? "bg-green-500" : "bg-gray-700"}`}
                >
                    👍
                </button>
                <button
                    onClick={() => handleVote(false)}
                    className={`p-2 rounded-md ${vote === false ? "bg-red-500" : "bg-gray-700"}`}
                >
                    👎
                </button>
            </div>
        </div>
    );
}