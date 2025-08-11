// src/app/translation/components/tabs/sign-to-voice/SignToVoice.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { Volume2 } from 'lucide-react';
import { LanguageSelector } from '../../components/shared/LanguageSelector';
import { TranslationControls } from '../../components/shared/TranslationControls';
import { ActionButtons } from '../../components/shared/ActionButtons';
import { cn } from '@/lib/utils';
import Banner from '@/components/ui/banner';

export const SignToVoice: React.FC = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTranslate = () => {
    setIsTranslating(true);
    setTimeout(() => setIsTranslating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Banner
        title="LSF -> Voix"
        description="Traduisez la Langue des Signes en Voix"
        icon={<Volume2 size={24} className="text-red-500" />}
        backHref="/modules/translation"
      />
      <LanguageSelector
        label="Select Language"
        selectedLanguage="en"
        onLanguageChange={(lang) => console.log(`Language changed to ${lang}`)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-orange-50">
          <CardContent className="p-6">
            <div className="relative min-h-[300px] bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Zone de capture LSF</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-100">
          <CardContent className="p-6">
            <div className="min-h-[300px] p-4 bg-gray-50 rounded-lg flex flex-col items-center justify-center">
              <CustomButton
                variant="outline"
                size="lg"
                onClick={() => setIsPlaying(!isPlaying)}
                className="rounded-full w-16 h-16 flex items-center justify-center"
              >
                <Volume2 className={cn("h-8 w-8", isPlaying ? "text-green-500" : "")} />
              </CustomButton>
              <p className="text-sm text-gray-500 mt-4">
                {isPlaying ? "Lecture en cours..." : "Cliquez pour écouter"}
              </p>
            </div>
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

export default SignToVoice;