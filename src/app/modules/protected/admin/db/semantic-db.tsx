import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network } from 'lucide-react';
import type { SemanticData, Concept } from 'src/types';


const SemanticTab: React.FC<{ semanticData: SemanticData }> = ({ semanticData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Network className="h-5 w-5" />
        Réseau Sémantique
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {semanticData.concepts.map((concept: Concept) => (
          <div key={concept.id} className="bg-gray-50 p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{concept.sign}</h3>
                <div className="mt-2 flex gap-2">
                  {concept.variants.map((variant: string, idx: number) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {variant}
                    </span>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {concept.relations.map((relation: { type: string; concept?: string; concepts?: string[] }, idx: number) => (
                    <div key={idx} className="bg-white p-2 rounded shadow">
                      <span className="text-sm font-medium capitalize">{relation.type}: </span>
                      {Array.isArray(relation.concepts) ? (
                        <div className="flex gap-2 mt-1">
                          {relation.concepts.map((c: string, i: number) => (
                            <span key={i} className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {relation.concept}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default SemanticTab;
