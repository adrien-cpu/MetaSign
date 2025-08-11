'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { TranslationControls } from '../../components/shared/TranslationControls';
import { ActionButtons } from '../../components/shared/ActionButtons';
import Banner from '@/components/ui/banner';
import { FileText } from 'lucide-react';
import { LanguageSelector } from '../../components/shared/LanguageSelector';

export const VoiceToText = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [transcription] = useState('');

  const handleTranslate = () => {
    setIsTranslating(true);
    setTimeout(() => setIsTranslating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Banner
        title="Voix -> Texte"
        description="Traduisez votre voix en texte"
        icon={<FileText className="text-orange-500" />}
        backHref="/modules/translation"
      />
      <LanguageSelector
        label="Select Language"
        selectedLanguage="en"
        onLanguageChange={(lang) => console.log(`Language changed to ${lang}`)}
      />
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-green-100">
          <CardContent className="p-6">
            <div className="min-h-[300px] flex flex-col items-center justify-center">
              <div className="mb-4">
                <CustomButton
                  variant={isRecording ? "outline" : "default"}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? "Arrêter" : "Commencer"} l &apos; enregistrement
                </CustomButton>
              </div>
              {isRecording && (
                <div className="text-sm text-gray-500">Enregistrement en cours...</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-100">
          <CardContent className="p-6">
            <div className="min-h-[300px] bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600">{transcription || 'La transcription apparaîtra ici...'}</p>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <TranslationControls
                onTranslate={handleTranslate}
                isTranslating={isTranslating}
              />
              <ActionButtons
                onSave={() => console.log('Enregistrer la traduction')}
                onShare={() => console.log('Partager la traduction')}
                onCopy={() => console.log('Copier la traduction')}
                showCopy={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceToText;