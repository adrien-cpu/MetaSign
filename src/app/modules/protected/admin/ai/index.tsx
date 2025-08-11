"use client";

import React from "react";
import { useRouter } from "next/navigation"; // Utilisation du router pour la navigation
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AiControlDashboard from "./ai-control-dashboard";
import AiManagementDashboard from "./ai-management-dashboard";
import { Button } from "@/components/ui/button";

const AIControlDashboard = () => {
  const router = useRouter(); // Initialisation du router

  return (
    <div className="p-6 space-y-6">
      {/* Bouton pour revenir au tableau de bord principal */}
      <div>
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => router.push("/admin")} // Naviguer vers le tableau de bord principal
        >
          Retour au tableau de bord Admin
        </Button>
      </div>

      {/* Onglets avec le premier actif par défaut */}
      <Tabs defaultValue="control-dashboard">
        <TabsList>
          {/* Titres des onglets agrandis */}
          <TabsTrigger
            value="control-dashboard"
            className="text-lg font-semibold"
          >
            AI Control Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="management-dashboard"
            className="text-lg font-semibold"
          >
            AI Management Dashboard
          </TabsTrigger>
        </TabsList>

        {/* Contenu pour le premier onglet */}
        <TabsContent value="control-dashboard">
          <Card>
            <CardHeader>
              {/* Titre agrandi */}
              <CardTitle className="text-2xl font-bold">
                AI Control Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AiControlDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenu pour le second onglet */}
        <TabsContent value="management-dashboard">
          <Card>
            <CardHeader>
              {/* Titre agrandi */}
              <CardTitle className="text-2xl font-bold">
                AI Management Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AiManagementDashboard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIControlDashboard;
