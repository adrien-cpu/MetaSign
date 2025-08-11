"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AiControl from "./ai-control";
import AiControlDashboard from "./ai-control-dashboard";
import AiManagement from "./ai-management";
import AiManagementDashboard from "./ai-management-dashboard";

const AIControlDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="control">
        <TabsList>
          <TabsTrigger value="control">AI Control</TabsTrigger>
          <TabsTrigger value="control-dashboard">AI Control Dashboard</TabsTrigger>
          <TabsTrigger value="management">AI Management</TabsTrigger>
          <TabsTrigger value="management-dashboard">AI Management Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="control">
          <Card>
            <CardHeader>
              <CardTitle>AI Control</CardTitle>
            </CardHeader>
            <CardContent>
              <AiControl />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="control-dashboard">
          <Card>
            <CardHeader>
              <CardTitle>AI Control Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <AiControlDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management">
          <Card>
            <CardHeader>
              <CardTitle>AI Management</CardTitle>
            </CardHeader>
            <CardContent>
              <AiManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management-dashboard">
          <Card>
            <CardHeader>
              <CardTitle>AI Management Dashboard</CardTitle>
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
