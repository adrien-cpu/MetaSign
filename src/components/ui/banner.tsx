import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BannerProps {
    icon?: React.ReactNode;
    title?: string;
    description?: string;
    backHref?: string;
}

const Banner: React.FC<BannerProps> = ({ icon, title, description, backHref }) => {
    const handleBackClick = () => {
        if (backHref) {
            window.location.href = backHref;
        } else {
            window.history.back();
        }
    };

    return (
        <div className="sticky top-18 left-0 right-0 backdrop-blur-md z-40 px-4 py-3 border-b border-gray-200 shadow-sm mx-auto w-auto">
            <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-4">
                    {icon && (
                        <div className="w-12 h-12 flex items-center justify-center text-black">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl font-bold text-black">{title}</h1>
                        {description && <p className="text-black/90">{description}</p>}
                    </div>
                </div>
                {backHref && (
                    <Button
                        variant="ghost"
                        onClick={handleBackClick}
                        className="text-black hover:bg-black/20 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Banner;
