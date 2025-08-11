"use client";
import { useState, useEffect } from "react";

type Role = "USER" | "ADMIN" | "DEVELOPER";

interface User {
  id: string;
  email: string;
  role: Role;
}

export default function UserRoleManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [newRole, setNewRole] = useState<Role>("USER");
  const [isLoading, setIsLoading] = useState(false);

  // 📌 Charger les utilisateurs au chargement du composant
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs :", error);
      }
    };
    fetchUsers();
  }, []);

  // 📌 Fonction pour modifier le rôle d’un utilisateur
  const handleRoleChange = async () => {
    if (!selectedUser) {
      alert("Veuillez sélectionner un utilisateur.");
      return;
    }

    console.log("🟢 Envoi de la requête avec :", { userId: selectedUser, newRole });

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/updateRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, newRole }),
      });

      console.log("🟡 Réponse reçue :", response);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Rôle mis à jour :", data);
        alert("Rôle mis à jour avec succès !");
      } else {
        const errorData = await response.json();
        console.error("❌ Erreur de mise à jour :", errorData);
        alert(`Erreur : ${errorData.error}`);
      }
    } catch (error) {
      console.error("❌ Erreur de requête :", error);
      alert("Une erreur est survenue.");
    }

    setIsLoading(false);
  };



  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Gestion des Rôles Utilisateurs</h1>

      {/* Sélection de l’utilisateur */}
      <label className="block font-semibold mb-2">Sélectionner un utilisateur :</label>
      <select
        className="border p-2 rounded w-full"
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
      >
        <option value="">-- Choisissez un utilisateur --</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.email} ({user.role})
          </option>
        ))}
      </select>

      {/* Sélection du rôle */}
      <label className="block font-semibold mt-4 mb-2">Attribuer un rôle :</label>
      <select
        className="border p-2 rounded w-full"
        value={newRole}
        onChange={(e) => setNewRole(e.target.value as Role)}
      >
        <option value="USER">Utilisateur</option>
        <option value="ADMIN">Administrateur</option>
        <option value="DEVELOPER">Développeur</option>
      </select>

      {/* Bouton pour modifier le rôle */}
      <button
        onClick={handleRoleChange}
        className="mt-4 bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600"
        disabled={isLoading}
      >
        {isLoading ? "Mise à jour..." : "Modifier le rôle"}
      </button>
    </div>
  );
}
