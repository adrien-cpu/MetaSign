import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

// Define the Ontology type
interface Ontology {
  id: string;
  domain: string;
  concepts: number;
  relations: number;
  lastUpdated: string;
}

// Define the SemanticData type
interface SemanticData {
  ontologies: Ontology[];
}

const OntologyTab: React.FC<{ semanticData: SemanticData }> = ({ semanticData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Globe className="h-5 w-5" />
        Ontologies LSF
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-4">
        {semanticData.ontologies.map(ontology => (
          <div key={ontology.id} className="bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="font-medium">{ontology.domain}</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Concepts:</span>
                <span className="text-sm font-medium">{ontology.concepts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Relations:</span>
                <span className="text-sm font-medium">{ontology.relations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Mis à jour:</span>
                <span className="text-sm font-medium">{ontology.lastUpdated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default OntologyTab;