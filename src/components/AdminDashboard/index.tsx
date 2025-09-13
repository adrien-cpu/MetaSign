// AdminDashboard component exports
import React from 'react';

interface UserCardProps {
  user: {
    name: string;
    email: string;
    active: boolean;
  };
}

interface PerformanceData {
  cpuUsage: number;
  memoryUsage: number;
  uptime: string;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold">{user.name}</h3>
      <p className="text-sm text-gray-600">{user.email}</p>
      <span className={`inline-block px-2 py-1 rounded-full text-xs ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {user.active ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
};

export const SettingsPanel: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Settings</h3>
      <p className="text-sm text-gray-600">Configuration panel</p>
    </div>
  );
};

export const AIDashboard: React.FC<any> = ({ iaList, metrics, alerts }) => {
  return (
    <div className="bg-white p-4 rounded-lg">
      <h3 className="font-semibold mb-4">AI Dashboard</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h4 className="text-sm font-medium">AI Models ({iaList?.length || 0})</h4>
        </div>
        <div>
          <h4 className="text-sm font-medium">Metrics ({metrics?.length || 0})</h4>
        </div>
        <div>
          <h4 className="text-sm font-medium">Alerts ({alerts?.length || 0})</h4>
        </div>
      </div>
    </div>
  );
};

export const MonitoringPanel: React.FC<any> = ({ logs, incidents }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Monitoring</h3>
      <p className="text-sm">Logs: {logs?.length || 0} | Incidents: {incidents?.length || 0}</p>
    </div>
  );
};

export const DataAPIPanel: React.FC<any> = ({ apiData, dbMetrics, semanticData }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Data & API</h3>
      <p className="text-sm">API Data: {apiData?.length || 0} | DB Metrics: {dbMetrics?.length || 0}</p>
    </div>
  );
};

export const ServiceManagementPanel: React.FC<any> = ({ services, toggleServiceStatus }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Service Management</h3>
      <p className="text-sm">Services: {services?.length || 0}</p>
    </div>
  );
};

export const ModerationPanel: React.FC<any> = ({ reportedContent, handleModeration }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Moderation</h3>
      <p className="text-sm">Reported: {reportedContent?.length || 0}</p>
    </div>
  );
};

export const FeedbackPanel: React.FC<any> = ({ feedbacks, handleReply }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Feedback</h3>
      <p className="text-sm">Feedbacks: {feedbacks?.length || 0}</p>
    </div>
  );
};

export const SecurityDashboard: React.FC<any> = ({ incidents }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Security</h3>
      <p className="text-sm">Security Incidents: {incidents?.length || 0}</p>
    </div>
  );
};

export const DatabaseManagementPanel: React.FC<any> = ({ dbMetrics }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Database Management</h3>
      <p className="text-sm">DB Metrics: {dbMetrics?.length || 0}</p>
    </div>
  );
};

export const ServerManagementPanel: React.FC<any> = ({ servers, handleServerAction }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Server Management</h3>
      <p className="text-sm">Servers: {servers?.length || 0}</p>
    </div>
  );
};

export const UserManagementPanel: React.FC<any> = ({ users, sessions }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">User Management</h3>
      <p className="text-sm">Users: {users?.length || 0} | Sessions: {sessions?.length || 0}</p>
    </div>
  );
};

export const AuditLogPanel: React.FC<any> = ({ auditLogs }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Audit Logs</h3>
      <p className="text-sm">Entries: {auditLogs?.length || 0}</p>
    </div>
  );
};

export const SystemPerformancePanel: React.FC<{ performanceData: PerformanceData }> = ({ performanceData }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">System Performance</h3>
      <div className="text-sm">
        <p>CPU: {performanceData.cpuUsage}%</p>
        <p>Memory: {performanceData.memoryUsage}%</p>
        <p>Uptime: {performanceData.uptime}</p>
      </div>
    </div>
  );
};

export const NotificationsPanel: React.FC<any> = ({ notifications }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Notifications</h3>
      <p className="text-sm">Count: {notifications?.length || 0}</p>
    </div>
  );
};

export const ScheduledTasksPanel: React.FC<any> = ({ tasks }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Scheduled Tasks</h3>
      <p className="text-sm">Tasks: {tasks?.length || 0}</p>
    </div>
  );
};

export const ActivityLog: React.FC<any> = ({ logs }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Activity Log</h3>
      <p className="text-sm">Entries: {logs?.length || 0}</p>
    </div>
  );
};

export const ClientMetricsPanel: React.FC<any> = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Client Metrics</h3>
      <p className="text-sm">Metrics: {data?.length || 0}</p>
    </div>
  );
};

export const HistoryLog: React.FC<any> = ({ logs }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">History Log</h3>
      <p className="text-sm">Entries: {logs?.length || 0}</p>
    </div>
  );
};

export const SupportPanel: React.FC<any> = ({ tickets }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Support</h3>
      <p className="text-sm">Tickets: {tickets?.length || 0}</p>
    </div>
  );
};

// Additional components needed by App.tsx
export const AIModelManagement: React.FC<any> = (props) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">AI Model Management</h3>
      <p className="text-sm">Models: {props.models?.length || 0}</p>
    </div>
  );
};

export const AITrainingMetrics: React.FC<any> = (props) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">AI Training Metrics</h3>
      <p className="text-sm">Training sessions: {props.trainingData?.length || 0}</p>
    </div>
  );
};

export const AIPerformanceMonitor: React.FC<any> = (props) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">AI Performance Monitor</h3>
      <p className="text-sm">Performance data points: {props.performanceData?.length || 0}</p>
    </div>
  );
};

export const ActivityFeed: React.FC<any> = ({ activities = [] }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Activity Feed</h3>
      <p className="text-sm">Recent system activity ({activities.length})</p>
      {activities.slice(0, 3).map((activity: any, index: number) => (
        <div key={index} className="text-xs mt-1">
          {activity.message || activity.description || 'Activity'}
        </div>
      ))}
    </div>
  );
};

export const DashboardMetrics: React.FC<any> = (props) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Dashboard Metrics</h3>
      <p className="text-sm">Overall system metrics</p>
      {props.userMetrics && (
        <div className="mt-2">
          <p className="text-xs">Total Users: {props.userMetrics.totalUsers}</p>
          <p className="text-xs">Active Users: {props.userMetrics.activeUsers}</p>
        </div>
      )}
    </div>
  );
};