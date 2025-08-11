// src/app/translation/components/tabs/sign-to-text/SignToText.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageSelector } from '../../components/shared/LanguageSelector';
import { TranslationControls } from '../../components/shared/TranslationControls';
import { SubtitlesDisplay } from '../../components/shared/SubtitlesDisplay';
import { ActionButtons } from '../../components/shared/ActionButtons';
import { cn } from '@/lib/utils';
import { HandMetal } from 'lucide-react';
import Banner from '@/components/ui/banner';


interface SignToTextProps {
  className?: string;
}

export const SignToText: React.FC<SignToTextProps> = ({ className = '' }) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [showSubtitles] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleTranslate = () => {
    setIsTranslating(true);
    setTimeout(() => setIsTranslating(false), 2000);
  };

  return (
    <div className={cn("space-y-6", className)}>

      <Banner
        title="LSF -> Texte"
        description="Traduisez la Langue des Signes en Texte"
        icon={<HandMetal className="text-purple-500" />}
        backHref="/modules/translation"
      />

      <div className="flex gap-4 items-center">
        <LanguageSelector
          label="Select Target Language"
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-pink-50">
            <CardContent className="p-6">
              <div className="relative min-h-[300px] bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center h-full">
                  {/* Zone de capture LSF */}
                  <p className="text-gray-500">Zone de capture LSF</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {showSubtitles && <SubtitlesDisplay text="Traduction..." />}

          <Card className="bg-pink-100">
            <CardContent className="p-6">
              <div className="flex min-h-[300px] p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">La traduction apparaîtra ici...</p>
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
    </div>
  );
};

export default SignToText; 