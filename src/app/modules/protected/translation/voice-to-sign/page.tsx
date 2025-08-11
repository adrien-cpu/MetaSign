'use client';

import React, { useState } from 'react';
import { Eye, Mic } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { LanguageSelector } from '../../components/shared/LanguageSelector';
import { TranslationControls } from '../../components/shared/TranslationControls';
import { SubtitlesDisplay } from '../../components/shared/SubtitlesDisplay';
import { ActionButtons } from '../../components/shared/ActionButtons';
import Banner from '@/components/ui/banner';

export const VoiceToSign = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);

  const toggleRecording = () => setIsRecording(prev => !prev);
  const toggleSubtitles = () => setShowSubtitles(prev => !prev);

  const handleTranslate = () => {
    setIsTranslating(true);
    setTimeout(() => setIsTranslating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Banner
        title="Voix -> LSF"
        description="Traduisez votre voix en Langue des Signes Française"
        icon={<Mic size={24} className="text-green-500" />}
        backHref="/modules/translation"
      />
      <LanguageSelector
        label="Select Language"
        selectedLanguage="en"
        onLanguageChange={(lang) => console.log(`Language changed to ${lang}`)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-purple-100 shadow-lg">
          <CardContent className="p-6">
            <div className="min-h-[300px] flex flex-col items-center justify-center">
              <div className="mb-4">
                <CustomButton
                  variant={isRecording ? "outline" : "default"}
                  onClick={toggleRecording}
                  className="transition duration-300 ease-in-out transform hover:scale-105"
                >
                  {isRecording ? "Arrêter" : "Commencer"} l &apos; enregistrement
                </CustomButton>
              </div>
              {isRecording && (
                <div className="text-sm text-gray-500 animate-pulse">Enregistrement en cours...</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-100 shadow-lg">
          <CardContent className="p-6">
            <div className="min-h-[300px] p-4 bg-gray-50 rounded-lg relative">
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Traduction en langue des signes étrangère</p>
              </div>
              <div className="absolute bottom-2 right-2">
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={toggleSubtitles}
                  className="transition duration-300 ease-in-out transform hover:scale-105"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Afficher les sous-titres
                </CustomButton>
              </div>
            </div>
            {showSubtitles && <SubtitlesDisplay text="Traduction..." />}
            <div className="flex justify-end space-x-4 mt-4">
              <TranslationControls
                onTranslate={handleTranslate}
                isTranslating={isTranslating}
              />
              <ActionButtons
                onSave={() => console.log('Enregistrer la traduction')}
                onShare={() => console.log('Partager la traduction')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceToSign;