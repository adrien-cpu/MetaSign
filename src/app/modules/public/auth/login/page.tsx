'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Toggle from '@/components/ui/toggle';
import { ROUTES } from '@/constants/routes';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState(urlError ? "Identifiants invalides. Veuillez réessayer." : "");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage(""); // Réinitialisation de l'erreur avant la requête

    const response = await signIn('credentials', {
      email,
      password,
      redirect: false, // Empêche la redirection automatique
    });

    if (response?.error) {
      setErrorMessage("Identifiants invalides. Veuillez réessayer.");
    } else {
      window.location.href = ROUTES.HOME; // Rediriger manuellement en cas de succès
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-none">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
        <h1 className="text-2xl font-bold">Se connecter</h1>

        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-2 flex items-center text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <Toggle
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
          />
          <span>Se souvenir de moi</span>
        </div>

        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          Se connecter
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
