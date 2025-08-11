'use client';

import { useEffect, useState } from "react";

export default function Leaderboard() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch("/api/users/leaderboard")
            .then((res) => res.json())
            .then((data) => setUsers(data));
    }, []);

    return (
        <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-white">🏆 Classement des membres</h3>
            <ul>
                {users.map((user, index) => (
                    <li key={user.id} className="text-white">
                        #{index + 1} {user.name} - {user._count.posts} posts
                    </li>
                ))}
            </ul>
        </div>
    );
}
