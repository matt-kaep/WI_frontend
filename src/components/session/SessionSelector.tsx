import React, { useState, useEffect } from 'react';
import { Session, useSession } from '../../contexts/SessionContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SessionSelectorProps {
  onClose?: () => void;
  className?: string;
}

const SessionSelector: React.FC<SessionSelectorProps> = ({ onClose, className = '' }) => {
  const { sessions, currentSession, setCurrentSession, isLoadingSessions, createSession, deleteSession, fetchSessions } = useSession();
  
  // État pour le modal de création de session
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // État pour la confirmation de suppression
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // État pour forcer le rafraîchissement de l'UI
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Effet pour rafraîchir les sessions lorsque refreshKey change
  useEffect(() => {
    if (refreshKey > 0) {
      // Ne pas appeler à l'initialisation (refreshKey = 0)
      // Pas besoin d'appeler fetchSessions ici car on l'appelle déjà dans handleDeleteSession
      // Cet effet est juste pour forcer un re-rendu du composant
    }
  }, [refreshKey]);
  
  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };
  
  // Gestion du changement de session
  const handleSessionChange = async (session: Session) => {
    try {
      await setCurrentSession(session);
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error("Erreur lors du changement de session:", err);
      setError("Impossible de changer de session. Veuillez réessayer.");
    }
  };
  
  // Gestion de la création d'une nouvelle session
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSessionName.trim()) {
      setError('Le nom de la session est requis');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await createSession(newSessionName.trim(), newSessionDescription.trim() || undefined);
      // Réinitialiser le formulaire
      setNewSessionName('');
      setNewSessionDescription('');
      setIsCreatingSession(false);
      
      // Récupérer la liste des sessions à jour après création
      await fetchSessions();
      
      // Forcer le rendu du composant avec un délai pour laisser le temps à fetchSessions de terminer
      setTimeout(() => {
        setRefreshKey(prevKey => prevKey + 1);
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la session');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Gestion de la suppression de session
  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await deleteSession(sessionToDelete.id);
      setSessionToDelete(null);
      
      // Récupérer la liste des sessions à jour après suppression
      await fetchSessions();
      
      // Forcer le rendu du composant avec un délai pour laisser le temps à fetchSessions de terminer
      setTimeout(() => {
        setRefreshKey(prevKey => prevKey + 1);
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la session');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className={`session-selector ${className}`}>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">Mes sessions de travail</h3>
        <button
          onClick={() => setIsCreatingSession(prev => !prev)}
          className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {isCreatingSession ? 'Annuler' : 'Nouvelle session'}
        </button>
      </div>
      
      {/* Formulaire de création de session */}
      {isCreatingSession && (
        <form onSubmit={handleCreateSession} className="mb-4 p-3 bg-gray-50 rounded border">
          <div className="mb-3">
            <label htmlFor="sessionName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la session*
            </label>
            <input
              id="sessionName"
              type="text"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Ex: Import LinkedIn Avril 2025"
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="sessionDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnelle)
            </label>
            <textarea
              id="sessionDescription"
              value={newSessionDescription}
              onChange={(e) => setNewSessionDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Description de votre session..."
              rows={2}
            />
          </div>
          
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Création...' : 'Créer la session'}
            </button>
          </div>
        </form>
      )}
      
      {/* Liste des sessions */}
      {isLoadingSessions ? (
        <div className="text-center py-4">Chargement des sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          Aucune session disponible. Créez votre première session.
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-3 rounded border cursor-pointer transition-colors ${
                session.is_active
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => handleSessionChange(session)}
            >
              <div className="flex justify-between items-center">
                <div
                  className="font-medium text-gray-900 cursor-pointer"
                >
                  {session.name}
                </div>
                {session.is_active && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                )}
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <div>Créée le {formatDate(session.created_at)}</div>
                <div className="flex space-x-3">
                  <span>{session.profile_count} profils</span>
                  {session.connection_count > 0 && (
                    <span>{session.connection_count} connexions</span>
                  )}
                </div>
              </div>
              
              {session.description && (
                <div className="mt-1 text-sm text-gray-600">{session.description}</div>
              )}
              
              <div className="mt-2 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Empêche le déclenchement du onClick du parent
                    setSessionToDelete(session);
                  }}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal de confirmation de suppression */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-md max-w-sm w-full">
            <h4 className="text-lg font-medium mb-3">Confirmer la suppression</h4>
            <p className="text-sm text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer la session "{sessionToDelete.name}" ? Cette action est irréversible.
            </p>
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSessionToDelete(null)}
                className="px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteSession}
                disabled={isDeleting}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionSelector;