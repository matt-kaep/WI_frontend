import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getCurrentUser } from '../services/supabase';
import { apiClient } from '../services/api';

// Types pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  session: Session | null;
  appSession: any | null; // Session côté application (pas Supabase)
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// Props du provider
interface AuthProviderProps {
  children: React.ReactNode;
}

// Provider du contexte
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [appSession, setAppSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start as true

  // Initialise l'état d'authentification
  useEffect(() => {
    console.log('[AuthContext useEffect] Starting initial authentication check.'); // Log Start

    const initAuth = async () => {
      console.log('[AuthContext initAuth] Setting isLoading = true.'); // Log Init Start
      setIsLoading(true); // Explicitly set loading true at start

      try {
        console.log('[AuthContext initAuth] Calling supabase.auth.getSession()...'); // Log Before getSession
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        console.log('[AuthContext initAuth] supabase.auth.getSession() finished.', { currentSession, sessionError }); // Log After getSession

        if (sessionError) {
          console.error('[AuthContext initAuth] Error getting Supabase session:', sessionError.message);
          setSession(null);
          setUser(null);
          setAppSession(null); // Clear app session on error too
        } else if (currentSession) {
          console.log('[AuthContext initAuth] Supabase session found. Setting session state.');
          setSession(currentSession);

          console.log('[AuthContext initAuth] Calling getCurrentUser()...'); // Log Before getCurrentUser
          const currentUser = await getCurrentUser();
          console.log('[AuthContext initAuth] getCurrentUser() finished.', { currentUser }); // Log After getCurrentUser
          setUser(currentUser);

          
        } else {
          console.log('[AuthContext initAuth] No Supabase session found.');
          setSession(null);
          setUser(null);
          setAppSession(null);
        }
      } catch (error) {
        console.error('[AuthContext initAuth] General error during initAuth:', error); // Log General Error
        setSession(null);
        setUser(null);
        setAppSession(null);
      } finally {
        console.log('[AuthContext initAuth] Finally block reached. Setting isLoading = false.'); // Log Finally
        setIsLoading(false); // Ensure loading is set to false
      }
    };

    initAuth();

    console.log('[AuthContext useEffect] Setting up onAuthStateChange listener.'); // Log Listener Setup
    // Mettre en place un écouteur pour les changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('[AuthContext onAuthStateChange] Auth state changed:', { event, newSession }); // Log State Change
      // Set loading true during state change processing? Maybe not needed if initAuth handles initial load.
      // setIsLoading(true);

      setSession(newSession);
      setUser(newSession?.user ?? null);
/* 
      if (newSession) {
        console.log('[AuthContext onAuthStateChange] New session exists. Calling apiClient.initSession()...'); // Log Listener Init Session Start
        try {
          const sessionData = await apiClient.initSession();
          console.log('[AuthContext onAuthStateChange] apiClient.initSession() successful.', { sessionData }); // Log Listener Init Session Success
          setAppSession(sessionData);
        } catch (error) {
          console.error('[AuthContext onAuthStateChange] Error initializing app session:', error); // Log Listener Init Session Error
          setAppSession(null); // Clear app session on error
        }
      } else {
        console.log('[AuthContext onAuthStateChange] No session. Clearing app session.');
        setAppSession(null);
      }
*/
      // If initAuth hasn't finished yet, this might prematurely set loading to false.
      // However, initAuth's finally block should handle the initial load state correctly.
      // Let's rely on initAuth's finally block for the initial load.
      // console.log('[AuthContext onAuthStateChange] Setting isLoading = false.');
      // setIsLoading(false);
    });

    // Cleanup function
    return () => {
      console.log('[AuthContext useEffect] Cleaning up: Unsubscribing from onAuthStateChange.'); // Log Cleanup
      authListener?.subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Connexion
  const signIn = async (email: string, password: string) => {
    console.log('[AuthContext signIn] Attempting sign in for:', email); // Log Sign In Start
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthContext signIn] Supabase sign in error:', error.message); // Log Sign In Supabase Error
        throw error;
      }

      console.log('[AuthContext signIn] Supabase sign in successful:', { user: data.user, session: data.session }); // Log Sign In Supabase Success

    } finally {
      setIsLoading(false);
    }
  };

  // Déconnexion
  const signOut = async () => {
    console.log('[AuthContext signOut] Attempting sign out.'); // Log Sign Out Start
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AuthContext signOut] Supabase sign out error:', error.message); // Log Sign Out Error
        throw error; // Optional: re-throw if needed
      }
      console.log('[AuthContext signOut] Supabase sign out successful.'); // Log Sign Out Success
      // onAuthStateChange should handle clearing user/session/appSession state.
      // setUser(null);
      // setSession(null);
      // setAppSession(null);
    } catch (error) {
      console.error('[AuthContext signOut] General sign out error:', error); // Log Sign Out General Error
      // Ensure states are cleared even if Supabase call fails somehow
      setUser(null);
      setSession(null);
      setAppSession(null);
    } finally {
      console.log('[AuthContext signOut] Finally block reached. Setting isLoading = false.'); // Log Sign Out Finally
      setIsLoading(false);
    }
  };

  // Rafraîchir la session (App Session mainly)
  const refreshSession = async () => {
    console.log('[AuthContext refreshSession] Attempting to refresh session.'); // Log Refresh Start
    setIsLoading(true);
    try {
      // First, ensure Supabase session is fresh (optional, but good practice)
      console.log('[AuthContext refreshSession] Calling supabase.auth.getSession()...');
      const { data: { session: currentSupabaseSession }, error: supabaseError } = await supabase.auth.getSession();
      console.log('[AuthContext refreshSession] supabase.auth.getSession() finished.', { currentSupabaseSession, supabaseError });

      if (supabaseError) throw supabaseError; // Handle Supabase error

      setSession(currentSupabaseSession); // Update Supabase session state

      if (currentSupabaseSession) {
        setUser(currentSupabaseSession.user); // Update user state
        console.log('[AuthContext refreshSession] Calling apiClient.getCurrentSession()...'); // Log Get Current App Session
        try {
          const sessionData = await apiClient.getCurrentSession();
          console.log('[AuthContext refreshSession] apiClient.getCurrentSession() successful.', { sessionData }); // Log Get Current App Session Success
          setAppSession(sessionData);
        } catch (error: any) {
          console.warn('[AuthContext refreshSession] Error getting current app session:', error.message, '. Trying initSession...'); // Log Get Current App Session Error
        }
      } else {
        // No Supabase session, clear everything
        console.log('[AuthContext refreshSession] No Supabase session found during refresh.');
        setUser(null);
        setAppSession(null);
      }
    } catch (error) {
      console.error('[AuthContext refreshSession] General error during refreshSession:', error); // Log Refresh General Error
      // Clear states on error? Maybe safer to clear appSession at least
      setAppSession(null);
    } finally {
      console.log('[AuthContext refreshSession] Finally block reached. Setting isLoading = false.'); // Log Refresh Finally
      setIsLoading(false);
    }
  };

  // Rafraîchir l'utilisateur
  const refreshUser = async () => {
    console.log('[AuthContext refreshUser] Attempting to refresh user data.'); // Log Refresh User Start
    // No loading state change here as it's usually a background update
    try {
      const currentUser = await getCurrentUser();
      console.log('[AuthContext refreshUser] getCurrentUser() successful.', { currentUser }); // Log Refresh User Success
      setUser(currentUser);
    } catch (error) {
      console.error('[AuthContext refreshUser] Error refreshing user data:', error); // Log Refresh User Error
    }
  };

  const value = {
    user,
    session,
    appSession,
    isLoading,
    isAuthenticated: !!user && !!session, // Consider both user and session for isAuthenticated
    signIn,
    signOut,
    refreshSession,
    refreshUser
  };

  // Log context value changes (optional, can be noisy)
  // console.log('[AuthContext Provider] Rendering with value:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};