import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/api';
import { useAuth } from './AuthContext';

// Type de la session
export interface Session {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  connection_count: number;
  profile_count: number;
  prospect_count: number;
  is_active: boolean;
  selectedProfiles?: string[]; // Liste des profils sélectionnés
}

// Type du contexte de session
interface SessionContextType {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  isLoadingSessions: boolean; // Pour la compatibilité avec SessionSelector
  error: string | null;
  fetchSessions: () => Promise<void>;
  setCurrentSessionById: (id: string) => Promise<void>;
  setCurrentSession: (session: Session) => Promise<void>; // Pour la compatibilité avec SessionSelector
  createSession: (name: string, description?: string) => Promise<Session>;
  updateSession: (updatedSession: Session) => void; // Ajout de la fonction updateSession
  deleteSession: (sessionId: string) => Promise<boolean>; // Fonction pour supprimer une session
}

// Création du contexte
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession doit être utilisé à l\'intérieur d\'un SessionProvider');
  }
  return context;
};

// Props du provider
interface SessionProviderProps {
  children: ReactNode;
}

// Provider du contexte
export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSessionState] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les sessions de l'utilisateur
  const fetchSessions = async () => {
    if (!isAuthenticated || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Récupération des sessions utilisateur...");
      const userSessions = await apiClient.getUserSessions();
      console.log("Sessions récupérées:", userSessions);
      setSessions(userSessions);
      
      // Si aucune session active mais des sessions existent, on définit la première comme active
      if (!currentSession && userSessions.length > 0) {
        setCurrentSessionState(userSessions[0]);
        localStorage.setItem('currentSessionId', userSessions[0].id);
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des sessions:', error);
      setError(error.message || 'Une erreur est survenue lors de la récupération des sessions');
    } finally {
      setIsLoading(false);
    }
  };

  // Définir la session active par ID
  const setCurrentSessionById = async (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      try {
        await apiClient.activateSession(id);
        setCurrentSessionState(session);
        localStorage.setItem('currentSessionId', id);
      } catch (error: any) {
        console.error('Erreur lors de l\'activation de la session:', error);
        setError(error.message || 'Une erreur est survenue lors de l\'activation de la session');
      }
    }
  };

  // Définir la session active
  const setCurrentSession = async (session: Session) => {
    try {
      await apiClient.activateSession(session.id);
      setCurrentSessionState(session);
      localStorage.setItem('currentSessionId', session.id);
      
      // Mettre à jour le statut is_active de toutes les sessions
      const updatedSessions = sessions.map(s => ({
        ...s,
        is_active: s.id === session.id
      }));
      setSessions(updatedSessions);
    } catch (error: any) {
      console.error('Erreur lors de l\'activation de la session:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'activation de la session');
    }
  };

  // Créer une nouvelle session
  const createSession = async (name: string, description?: string): Promise<Session> => {
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté pour créer une session');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newSession = await apiClient.createSession(name, description);
      setSessions(prev => [...prev, newSession]);
      await setCurrentSession(newSession);
      return newSession;
    } catch (error: any) {
      console.error('Erreur lors de la création de la session:', error);
      setError(error.message || 'Une erreur est survenue lors de la création de la session');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mettre à jour une session existante
  const updateSession = (updatedSession: Session) => {
    if (!updatedSession) return;
    
    try {
      // Mise à jour de la session dans la liste des sessions
      setSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === updatedSession.id ? updatedSession : session
        )
      );
      
      // Si la session mise à jour est la session courante, mettre à jour l'état
      if (currentSession && currentSession.id === updatedSession.id) {
        setCurrentSessionState(updatedSession);
      }
      
      console.log("Session mise à jour:", updatedSession);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la session:', error);
      setError(error.message || 'Une erreur est survenue lors de la mise à jour de la session');
    }
  };

  // Supprimer une session existante
  const deleteSession = async (sessionId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté pour supprimer une session');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.deleteSession(sessionId);
      
      if (result.success) {
        // Supprimer la session de la liste des sessions
        setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
        
        // Si la session supprimée était la session courante, réinitialiser
        if (currentSession && currentSession.id === sessionId) {
          setCurrentSessionState(null);
          localStorage.removeItem('currentSessionId');
          
          // Si d'autres sessions existent, activer la première
          const remainingSessions = sessions.filter(s => s.id !== sessionId);
          if (remainingSessions.length > 0) {
            await setCurrentSession(remainingSessions[0]);
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la session:', error);
      setError(error.message || 'Une erreur est survenue lors de la suppression de la session');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Charger la session mémorisée et les sessions au démarrage
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Utilisateur authentifié, chargement des sessions...");
      const memorizedSessionId = localStorage.getItem('currentSessionId');
      
      fetchSessions().then(() => {
        if (memorizedSessionId) {
          const memorizedSession = sessions.find(s => s.id === memorizedSessionId);
          if (memorizedSession) {
            setCurrentSession(memorizedSession);
          }
        }
        
        setIsLoading(false);
      });
    } else {
      console.log("Utilisateur non authentifié, pas de chargement des sessions");
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  return (
    <SessionContext.Provider
      value={{
        sessions,
        currentSession,
        isLoading,
        isLoadingSessions: isLoading, // Alias pour la compatibilité avec SessionSelector
        error,
        fetchSessions,
        setCurrentSessionById,
        setCurrentSession, // Pour la compatibilité avec SessionSelector
        createSession,
        updateSession,
        deleteSession
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};