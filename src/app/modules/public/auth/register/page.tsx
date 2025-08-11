"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from '@/constants/routes';

const RegisterPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: '',
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    specialChar: false,
    uppercase: false,
    number: false,
  });

  const validatePassword = (password: string) => {
    setPasswordCriteria({
      length: password.length >= 8,
      specialChar: /[!@#$%^&*]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "password") validatePassword(e.target.value);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!Object.values(passwordCriteria).every(Boolean)) {
      setError("Le mot de passe ne respecte pas tous les critères.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(ROUTES.API_REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          location: form.location,
          email: form.email,
          password: form.password,
          role: "USER",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      alert("Compte créé avec succès !");
      router.push(ROUTES.LOGIN);
    } catch (err) {
      console.error("Erreur lors de l'inscription :", err);
      setError("Une erreur s'est produite. Veuillez réessayer.");
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-none">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
        < h1 className="text-2xl font-bold" > Créer un compte</h1 >

        {error && <p className="text-red-600 text-sm">{error}</p>
        }

        <input
          type="text"
          name="firstName"
          placeholder="Prénom"
          value={form.firstName}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Nom"
          value={form.lastName}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />

        <input
          type="phone"
          name="^hone"
          placeholder="Téléphone"
          value={form.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />

        <input
          type="location"
          name="^location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />

        {/* Critères du mot de passe */}
        <div className="text-sm space-y-1">
          <p className={passwordCriteria.length ? "text-green-600" : "text-red-600"}>
            ✔ Au moins 8 caractères
          </p>
          <p className={passwordCriteria.specialChar ? "text-green-600" : "text-red-600"}>
            ✔ Au moins un caractère spécial (!@#$%^&*)
          </p>
          <p className={passwordCriteria.uppercase ? "text-green-600" : "text-red-600"}>
            ✔ Au moins une lettre majuscule
          </p>
          <p className={passwordCriteria.number ? "text-green-600" : "text-red-600"}>
            ✔ Au moins un chiffre
          </p>
        </div>

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmer le mot de passe"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? "Création en cours..." : "S'inscrire"}
        </button>
      </form >
    </div >
  );
};

export default RegisterPage;
