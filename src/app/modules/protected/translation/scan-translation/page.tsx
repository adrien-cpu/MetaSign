'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { LanguageSelector } from '../../components/shared/LanguageSelector';
import { TranslationControls } from '../../components/shared/TranslationControls';
import { SubtitlesDisplay } from '../../components/shared/SubtitlesDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid, Clock, List } from "lucide-react";
import Banner from '@/components/ui/banner';

const UnifiedScanTranslation = () => {
  const [sourceLanguage, setSourceLanguage] = useState("French");
  const [targetLanguage, setTargetLanguage] = useState("LSF");
  const [scanHistory] = useState([
    { id: 1, documentType: "Menu", source: "Restaurant.pdf", date: "2024-03-25", feedback: "Good translation accuracy." },
    { id: 2, documentType: "Manual", source: "UserGuide.pdf", date: "2024-03-20", feedback: "Some errors in technical terms." }
  ]);
  const [isSubtitleEnabled, setIsSubtitleEnabled] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <Banner
        title="Scan & Translate"
        description="Scan and translate documents into different languages."
        icon={<Grid className="text-indigo-500" />}
        backHref="/modules/translation"
      />
      <Tabs defaultValue="scan">
        <TabsList>
          <TabsTrigger value="scan">
            <Grid className="h-4 w-4 mr-2" />
            Scan & Translate
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            Scan History
          </TabsTrigger>
          <TabsTrigger value="subtitles">
            <List className="h-4 w-4 mr-2" />
            Subtitles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan">
          <Card>
            <CardHeader>
              <CardTitle>Scan & Translate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LanguageSelector
                  label="Source Language"
                  selectedLanguage={sourceLanguage}
                  onLanguageChange={setSourceLanguage}
                />
                <LanguageSelector
                  label="Target Language"
                  selectedLanguage={targetLanguage}
                  onLanguageChange={setTargetLanguage}
                />
              </div>
              <TranslationControls
                isTranslating={false}
                onTranslate={() => console.log("Translating...")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scanHistory.map(({ id, documentType, source, date, feedback }) => (
                  <div key={id} className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{documentType}</h3>
                        <p className="text-sm text-gray-600">Source: {source}</p>
                        <p className="text-xs text-gray-400">Date: {date}</p>
                        <p className="text-sm text-gray-500 mt-2">Feedback: {feedback}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subtitles">
          <Card>
            <CardHeader>
              <CardTitle>Sous-Titres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm">Enable Subtitles:</p>
                  <Button variant="outline" onClick={() => setIsSubtitleEnabled(!isSubtitleEnabled)}>
                    {isSubtitleEnabled ? "Disable" : "Enable"}
                  </Button>
                </div>
                {isSubtitleEnabled && <SubtitlesDisplay text="Subtitles are enabled." />}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedScanTranslation;