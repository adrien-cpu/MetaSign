'use client';

import { useNotifications } from "@/context/NotificationContext";
import { Bell } from "lucide-react";

export default function Notifications() {
    const { notifications, clearNotifications } = useNotifications();

    if (notifications.length === 0) return null;

    return (
        <div className="bg-yellow-200 p-4 rounded-md mb-4">
            <Bell className="inline-block mr-2" />
            {notifications.map((notif) => (
                <p key={notif.id}>{notif.message}</p>
            ))}
            <button onClick={clearNotifications} className="text-sm text-blue-600 mt-2">
                Effacer
            </button>
        </div>
    );
}
