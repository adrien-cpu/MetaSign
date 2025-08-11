'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import APIManager from './api-manager';
import APIManagement from './api-management';
import { BarChart2, Database } from 'lucide-react';

const APIDashboards = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">API Dashboards</h1>
      <Tabs defaultValue="manager">
        <TabsList>
          <TabsTrigger value="manager">
            <BarChart2 className="h-4 w-4 mr-2" />
            API Manager
          </TabsTrigger>
          <TabsTrigger value="management">
            <Database className="h-4 w-4 mr-2" />
            API Management
          </TabsTrigger>
        </TabsList>

        {/* Onglet API Manager */}
        <TabsContent value="manager">
          <APIManager />
        </TabsContent>

        {/* Onglet API Management */}
        <TabsContent value="management">
          <APIManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIDashboards;
