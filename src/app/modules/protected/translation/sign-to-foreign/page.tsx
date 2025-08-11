'use client';

/**
 * SignToForeign is a React functional component that provides an interface
 * for translating sign language into a foreign sign language. It includes
 * controls for selecting the target language, capturing sign language input,
 * and displaying the translation. Users can toggle subtitles, initiate
 * translation, and perform actions like saving or sharing the translation.
 */

import React, { useState } from 'react';
import { Eye, Globe2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { LanguageSelector } from '../../components/shared/LanguageSelector';
import { TranslationControls } from '../../components/shared/TranslationControls';
import { ActionButtons } from '../../components/shared/ActionButtons';
import { SubtitlesDisplay } from '../../components/shared/SubtitlesDisplay';
import Banner from '@/components/ui/banner';

export const SignToForeign: React.FC = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleTranslate = () => {
    setIsTranslating(true);
    setTimeout(() => setIsTranslating(false), 2000);
  };

  const handleSave = () => {
    console.log('Enregistrer la traduction');
  };

  const handleShare = () => {
    console.log('Partager la traduction');
  };

  return (
    <div className="space-y-6">
      <Banner
        title="LSF -> LS étrangère"
        description="Traduisez de la LSF vers une autre Langue Des Signes"
        icon={<Globe2 className="text-teal-500" />}
        backHref="/modules/translation"
      />
      <div className="flex gap-4 items-center">
        <LanguageSelector
          label="Select Target Language"
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        <CustomButton variant="outline" className="w-[200px]">
          <Globe2 className="h-4 w-4 mr-2" />
          Langue cible
        </CustomButton>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-teal-100">
          <CardContent className="p-6">
            <div className="relative min-h-[300px] bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Zone de capture LSF</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-teal-100">
          <CardContent className="p-6">
            <div className="min-h-[300px] p-4 bg-gray-50 rounded-lg relative">
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Traduction en langue des signes étrangère</p>
              </div>
              <div className="absolute bottom-2 right-2">
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSubtitles(!showSubtitles)}
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
                onSave={handleSave}
                onShare={handleShare}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignToForeign;