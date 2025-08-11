'use client';

import React, { useEffect, useState } from "react";
import {
    UserCard, SettingsPanel,
    AIDashboard, MonitoringPanel, DataAPIPanel,
    ServiceManagementPanel, ModerationPanel, FeedbackPanel,
    SecurityDashboard, DatabaseManagementPanel, ServerManagementPanel,
    UserManagementPanel, AuditLogPanel, SystemPerformancePanel, NotificationsPanel, ScheduledTasksPanel,
    ActivityLog, ClientMetricsPanel, HistoryLog, SupportPanel
} from "@/components/AdminDashboard";
import { fetchData } from "@/services/apiService";
import Sidebar from "@/components/navigation/Sidebar";
import { SidebarAdmin } from "@/components/navigation/SidebarAdmin";
import { useSession } from "next-auth/react";

interface IA {
    id: string;
    name: string;
    description: string;
    status: "ACTIVE" | "TRAINING" | "PAUSED" | "ERROR";
    type: "MASTER" | "APPRENTICE" | "DISTILLED";
}

interface Metric {
    id: string;
    name: string;
    value: number;
}

interface Alert {
    id: string;
    type: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    message: string;
    timestamp: number;
}

export default function Page() {
    const { data: session } = useSession();
    const [iaList, setIaList] = useState<IA[]>([]);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [adminSidebarOpen, setAdminSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            setIaList(await fetchData("/api/ia"));
            setMetrics(await fetchData("/api/metrics"));
            setAlerts(await fetchData("/api/alerts"));
        };
        fetchAllData();
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar principale avec option Admin */}
            <Sidebar
                onAdminClick={() => setAdminSidebarOpen(!adminSidebarOpen)}
                showAdminOption={!!session?.user?.role && session.user.role === "ADMIN"}
            />

            {/* Sidebar Admin déployable */}
            <SidebarAdmin
                onClose={() => setAdminSidebarOpen(false)}
                isVisible={adminSidebarOpen}
            />

            {/* Contenu principal */}
            <div className={`flex-1 p-6 space-y-4 transition-all duration-300 ${adminSidebarOpen ? "ml-64" : ""}`}>
                {/* Top Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <UserCard user={{ name: "Admin", email: "admin@company.com", active: true }} />
                    <SettingsPanel />
                    <SystemPerformancePanel performanceData={{ cpuUsage: 0, memoryUsage: 0, uptime: "" }} />
                    <NotificationsPanel notifications={[]} />
                </div>

                {/* AI Dashboard Section */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <AIDashboard iaList={iaList} metrics={metrics} alerts={alerts} />
                </div>

                {/* Other Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <MonitoringPanel logs={[]} incidents={[]} />
                    <DataAPIPanel apiData={[]} dbMetrics={[]} semanticData={{}} />
                    <UserManagementPanel users={[]} sessions={[]} />
                    <AuditLogPanel auditLogs={[]} />
                    <ScheduledTasksPanel tasks={[]} />
                    <ServiceManagementPanel services={[]} toggleServiceStatus={() => { }} />
                    <ModerationPanel reportedContent={[]} handleModeration={() => { }} />
                    <FeedbackPanel feedbacks={[]} handleReply={() => { }} />
                    <SecurityDashboard incidents={[]} />
                    <DatabaseManagementPanel dbMetrics={[]} />
                    <ServerManagementPanel servers={[]} handleServerAction={() => { }} />
                    <ActivityLog logs={[]} />
                    <ClientMetricsPanel data={metrics} />
                    <HistoryLog logs={[]} />
                    <SupportPanel tickets={[]} />
                </div>
            </div>
        </div>
    );
}
