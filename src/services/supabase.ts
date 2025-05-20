import { createClient } from '@supabase/supabase-js';

// Récupérer les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl ? "Loaded" : "MISSING!");
console.log("Supabase Anon Key:", supabaseAnonKey ? "Loaded" : "MISSING!");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables d\'environnement Supabase sont manquantes. Veuillez vérifier votre fichier .env');
}

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Récupère l'utilisateur actuel depuis le localStorage ou la session Supabase
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Récupère le token JWT pour les appels API
 */
export const getJwtToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

/**
 * Se déconnecte de Supabase Auth
 */
export const signOut = async () => {
  await supabase.auth.signOut();
};

/**
 * Se connecte avec email et mot de passe
 */
export const signInWithPassword = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

/**
 * Se connecte ou s'inscrit avec un email (OTP)
 */
export const signInWithOtp = async (email: string) => {
  return await supabase.auth.signInWithOtp({ 
    email,
    options: {
      emailRedirectTo: window.location.origin + '/auth/callback'
    }
  });
};

/**
 * S'inscrit avec email et mot de passe
 */
export const signUpWithPassword = async (email: string, password: string) => {
  return await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: window.location.origin + '/auth/callback'
    }
  });
};