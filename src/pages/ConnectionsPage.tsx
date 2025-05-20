import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from '../contexts/SessionContext';
import { apiClient } from '../services/api';

// Interface pour les données de connexion
interface Connection {
  id: number;
  profile_id: string;
  name: string;
  target_name: string;
  title: string;
  location?: string;
  industry?: string;
  profile_image_url?: string;
  profile_url?: string;
  overall_similarity: number;
  company_similarity: number;
  education_similarity: number;
  job_title_similarity: number;
  family_name_similarity: number;
  nbr_shared_companies: number;
  nbr_shared_schools: number;
  shared_companies: Array<{ id: string; name: string }>;
  shared_schools: Array<{ id: string; name: string }>;
  overall_similarity_explanation?: string;
  is_favorite?: boolean;
}

// Composant Toast
const Toast = ({ message, onClose, type = "info" }: { message: string, onClose: () => void, type?: "info" | "warning" | "success" | "error" }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgClass = {
    info: "bg-blue-50 border-blue-400 text-blue-700",
    warning: "bg-yellow-50 border-yellow-400 text-yellow-700",
    success: "bg-green-50 border-green-400 text-green-700",
    error: "bg-red-50 border-red-400 text-red-700",
  }[type];

  const iconClass = {
    info: "text-blue-400",
    warning: "text-yellow-400",
    success: "text-green-400",
    error: "text-red-400",
  }[type];
  
  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full shadow-lg rounded-lg">
      <div className={`p-4 border-l-4 ${bgClass} flex justify-between items-start`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className={`h-5 w-5 ${iconClass}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm">{message}</p>
          </div>
        </div>
        <button onClick={onClose} className="flex-shrink-0 ml-4">
          <svg className={`h-5 w-5 ${iconClass}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Composant Modal pour ajouter une connexion
const AddConnectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (url: string) => void;
  isLoading: boolean;
}> = ({ isOpen, onClose, onSubmit, linkedinUrl, setLinkedinUrl, isLoading }) => {
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(linkedinUrl);
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Ajouter une connexion manuellement</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="linkedin-url">
              URL LinkedIn
            </label>
            <input
              id="linkedin-url"
              type="text"
              placeholder="https://www.linkedin.com/in/username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Entrez l'URL complète du profil LinkedIn de votre connexion
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isLoading || !linkedinUrl}
            >
              {isLoading ? (
                <div className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ajout en cours...
                </div>
              ) : (
                "Ajouter"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConnectionsPage: React.FC = () => {
  const { currentSession, updateSession } = useSession();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasExistingConnections, setHasExistingConnections] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string, type: "info" | "warning" | "success" | "error" } | null>(null);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  // Nouveaux états pour l'ajout manuel de connexions
  const [isAddConnectionModalOpen, setIsAddConnectionModalOpen] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isAddingConnection, setIsAddingConnection] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState<string | null>(null);

  // Fonction pour basculer l'état favori d'une connexion
  const toggleFavorite = async (connectionId: number) => {
    if (!currentSession || isTogglingFavorite === connectionId.toString()) return;
    
    try {
      setIsTogglingFavorite(connectionId.toString());
      
      // Utilisation de la méthode d'API pour basculer l'état du favori
      const data = await apiClient.toggleConnectionFavorite(connectionId);
      
      if (data && data.is_favorite !== undefined) {
        // Mise à jour locale de l'état des connexions
        setConnections(prevConnections => 
          prevConnections.map(conn => 
            conn.id === connectionId 
              ? { ...conn, is_favorite: data.is_favorite } 
              : conn
          )
        );
        
        // Afficher un toast de confirmation
        setToast({
          message: `${data.is_favorite ? 'Ajouté aux' : 'Retiré des'} favoris`,
          type: "success"
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification du statut favori:', error);
      setToast({
        message: error.message || 'Une erreur est survenue lors de la modification du statut favori',
        type: "error"
      });
    } finally {
      setIsTogglingFavorite(null);
    }
  };

  // Fonction pour charger les connexions existantes
  const fetchExistingConnections = async () => {
    if (!currentSession) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Charger les connexions existantes depuis l'API
      const connectionData = await apiClient.getExistingConnections();
      console.log('Connexions existantes reçues:', connectionData);
      
      if (connectionData.connections && connectionData.connections.length > 0) {
        // Tri des connexions par score de similarité décroissant
        const sortedConnections = [...connectionData.connections].sort(
          (a, b) => b.overall_similarity - a.overall_similarity
        );
        setConnections(sortedConnections || []);
        setHasExistingConnections(true);
      } else {
        setHasExistingConnections(false);
      }
      
      setIsLoading(false);
      
      // Récupération des profils sélectionnés du contexte de session s'ils existent
      if (currentSession.selectedProfiles) {
        setSelectedProfiles(currentSession.selectedProfiles);
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des connexions existantes:', error);
      setError(error.message || 'Une erreur est survenue lors du chargement des connexions existantes');
      setHasExistingConnections(false);
      setIsLoading(false);
    }
  };

  // Fonction de calcul des nouvelles connexions
  const calculateConnections = async () => {
    if (!currentSession) return;
    
    // Afficher le toast d'information
    setToast({
      message: "Le calcul des connexions peut prendre entre 2 et 5 minutes. Veuillez patienter...",
      type: "info"
    });
    
    setIsCalculating(true);
    setError(null);
    setSelectedConnection(null);
    
    try {
      // Calculer les connexions depuis l'API
      const connectionData = await apiClient.getUserConnections();
      console.log('Nouvelles connexions calculées:', connectionData);
      
      // Tri des connexions par score de similarité décroissant
      const sortedConnections = [...connectionData.connections].sort(
        (a, b) => b.overall_similarity - a.overall_similarity
      );
      setConnections(sortedConnections || []);
      setHasExistingConnections(true);
      setIsCalculating(false);
      
      // Toast de succès
      setToast({
        message: "Calcul terminé avec succès!",
        type: "success"
      });
    } catch (error: any) {
      console.error('Erreur lors du calcul des connexions:', error);
      setError(error.message || 'Une erreur est survenue lors du calcul des connexions');
      setIsCalculating(false);
      
      // Toast d'erreur
      setToast({
        message: error.message || "Une erreur est survenue lors du calcul des connexions",
        type: "error"
      });
    }
  };
  
  // État pour afficher seulement les favoris
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  
  // Filtrer les connexions en fonction de la recherche et du filtre de favoris
  const filteredConnections = useMemo(() => {
    // Première étape : filtrer par favoris si demandé
    let filtered = connections;
    if (showOnlyFavorites) {
      filtered = connections.filter(conn => conn.is_favorite);
    }
    
    // Deuxième étape : appliquer la recherche si nécessaire
    if (!searchQuery.trim()) {
      return filtered;
    }
    
    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    return filtered.filter((connection) => {
      const name = (connection.target_name || connection.name || '').toLowerCase();
      const title = (connection.title || '').toLowerCase();
      const location = (connection.location || '').toLowerCase();
      const industry = (connection.industry || '').toLowerCase();
      
      // Recherche dans les entreprises partagées
      const hasMatchingCompany = connection.shared_companies?.some(
        company => company.name.toLowerCase().includes(normalizedQuery)
      );
      
      // Recherche dans les écoles partagées
      const hasMatchingSchool = connection.shared_schools?.some(
        school => school.name.toLowerCase().includes(normalizedQuery)
      );
      
      // Retourne true si une des conditions est remplie
      return name.includes(normalizedQuery) || 
             title.includes(normalizedQuery) ||
             location.includes(normalizedQuery) ||
             industry.includes(normalizedQuery) ||
             hasMatchingCompany ||
             hasMatchingSchool;
    });
  }, [connections, searchQuery, showOnlyFavorites]);
  
  // Charger les connexions uniquement au premier chargement ou lors d'un changement de session (sans recharger lors des mises à jour de selectedProfiles)
  useEffect(() => {
    // Utilisation d'une clé pour suivre si la session a réellement changé
    const sessionId = currentSession?.id;
    
    // Fonction pour initialiser les données
    const initializeSessionData = async () => {
      // Vérifier que currentSession existe
      if (!currentSession) return;
      
      // Récupérer les profils sélectionnés s'ils existent dans la session
      if (currentSession.selectedProfiles && Array.isArray(currentSession.selectedProfiles)) {
        setSelectedProfiles(currentSession.selectedProfiles);
      } else {
        // Initialiser avec un tableau vide si aucun profil n'est sélectionné dans la session
        setSelectedProfiles([]);
      }
      
      // Charger les connexions
      await fetchExistingConnections();
    };
    
    // Initialiser les données seulement si la session existe
    if (currentSession) {
      initializeSessionData();
    }
  }, [currentSession?.id]); // Dépendance uniquement sur l'ID de la session, pas sur l'objet session entier

  // Gérer l'ajout d'une connexion manuelle
  const handleAddConnection = async (url: string) => {
    if (!currentSession || !url.trim()) return;
    
    setIsAddingConnection(true);
    setError(null);
    
    try {
      const response = await apiClient.addConnectionByUrl(url);
      console.log('Connexion ajoutée avec succès:', response);
      
      // Afficher un message de succès
      setToast({
        message: `Connexion avec ${response.connection_details.name || 'le profil'} ajoutée avec succès`,
        type: "success"
      });
      
      // Recharger les connexions pour afficher la nouvelle
      await fetchExistingConnections();
      
      // Fermer le modal et réinitialiser l'URL
      setIsAddConnectionModalOpen(false);
      setLinkedinUrl('');
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout d\'une connexion:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'ajout de la connexion');
      setToast({
        message: error.message || 'Une erreur est survenue lors de l\'ajout de la connexion',
        type: "error"
      });
    } finally {
      setIsAddingConnection(false);
    }
  };

  // Fonction pour sélectionner une connexion et afficher ses détails
  const handleSelectConnection = (connection: Connection) => {
    setSelectedConnection(connection === selectedConnection ? null : connection);
  };

  // Gérer la recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Effacer la recherche
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  // Gérer la sélection/désélection d'un profil
  const handleProfileSelection = (connection: Connection) => {
    if (!connection || !connection.profile_id || !currentSession) {
      console.error("Erreur: profile_id ou session manquant");
      setToast({
        message: "Erreur lors de la sélection du profil",
        type: "error"
      });
      return;
    }
    
    try {
      const profileId = connection.profile_id;
      
      // Vérifier si le profil est déjà sélectionné
      const isProfileSelected = selectedProfiles.includes(profileId);
      let updatedProfiles;
      
      if (isProfileSelected) {
        // Si le profil est déjà sélectionné, le désélectionner
        updatedProfiles = selectedProfiles.filter(id => id !== profileId);
      } else {
        // Sinon, l'ajouter à la sélection
        updatedProfiles = [...selectedProfiles, profileId];
      }
      
      // Mettre à jour l'état local d'abord
      setSelectedProfiles(updatedProfiles);
      
      // Ensuite, mettre à jour la session
      updateSession({
        ...currentSession,
        selectedProfiles: updatedProfiles
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour des profils sélectionnés:", error);
      setToast({
        message: "Erreur lors de la sélection du profil",
        type: "error"
      });
    }
  };

  // Sélectionner/désélectionner tous les profils
  const handleSelectAllProfiles = () => {
    if (!currentSession) return;
    
    try {
      let updatedProfiles: string[] = [];
      
      if (selectedProfiles.length === filteredConnections.length) {
        // Tout désélectionner - déjà initialisé avec un tableau vide
      } else {
        // Tout sélectionner
        updatedProfiles = filteredConnections
          .map(conn => conn.profile_id)
          .filter((id): id is string => Boolean(id)); // Filtrer les valeurs undefined/null avec type guard
      }
      
      // Mettre à jour l'état local d'abord
      setSelectedProfiles(updatedProfiles);
      
      // Ensuite, mettre à jour la session
      updateSession({
        ...currentSession,
        selectedProfiles: updatedProfiles
      });
    } catch (error) {
      console.error("Erreur lors de la sélection/désélection de tous les profils:", error);
      setToast({
        message: "Erreur lors de la sélection des profils",
        type: "error"
      });
    }
  };

  // Rendu conditionnel si aucune session n'est active
  if (!currentSession) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Connexions</h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Aucune session active. Veuillez créer ou sélectionner une session.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fonction pour obtenir la classe CSS de la couleur en fonction du score de similarité
  const getSimilarityColorClass = (similarity: number) => {
    if (similarity >= 0.75) return 'bg-green-500';
    if (similarity >= 0.5) return 'bg-yellow-500';
    if (similarity >= 0.25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Formater le pourcentage
  const formatPercentage = (value: number) => {
    return `${(value*100).toFixed(0)}%`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toast notification */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Compteur de sélection flottant */}
      {selectedProfiles.length > 0 && (
        <div className="fixed bottom-5 left-5 z-50">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
            <div className="flex items-center justify-center bg-white text-blue-600 rounded-full w-8 h-8 font-bold mr-3">
              {selectedProfiles.length}
            </div>
            <span className="font-medium">
              {selectedProfiles.length} profil{selectedProfiles.length > 1 ? 's' : ''} sélectionné{selectedProfiles.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
      
      <h1 className="text-2xl font-bold mb-6">Connexions</h1>
      
      {/* Contrôles de filtrage */}
      <div className="mb-6 bg-white p-4 shadow rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          {/* Affichage du nombre de profils sélectionnés */}
          {selectedProfiles.length > 0 && (
            <div className="flex items-center mb-4 md:mb-0">
              <div className="flex items-center justify-center bg-blue-600 text-white rounded-full w-8 h-8 font-bold mr-3">
              </div>
              <span className="font-medium text-blue-600">
 profil sélectionné              </span>
            </div>
          )}
          
          {/* Boutons d'action */}
          <div className="flex space-x-2">
            {/* Bouton pour ajouter une connexion manuellement */}
            <button
              onClick={() => setIsAddConnectionModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              disabled={isAddingConnection || !currentSession}
            >
              Ajouter une connexion
            </button>
            
            {/* Bouton pour calculer/recalculer les connexions */}
            <button
              onClick={calculateConnections}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  Calcul en cours...
                </>
              ) : (
                hasExistingConnections ? 'Recalculer les connexions' : 'Calculer mes connexions'
              )}
            </button>
          </div>
        </div>
        
        {/* Barre de recherche et filtres */}
        {connections.length > 0 && (
          <div className="mt-4">
            {/* Barre de recherche */}
            <div className="relative">
              <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher par nom, poste, entreprise, école..."
                  className="block w-full pl-10 pr-10 py-2 border-0 rounded-md focus:outline-none focus:ring-0 text-sm"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button 
                      onClick={clearSearch} 
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      aria-label="Effacer la recherche"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Options de filtrage */}
            <div className="flex flex-wrap items-center mt-3 gap-2">
              {/* Filtre favoris */}
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`flex items-center px-3 py-1 rounded-full text-sm ${
                  showOnlyFavorites 
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <svg 
                  className={`h-4 w-4 ${showOnlyFavorites ? 'text-yellow-500' : 'text-gray-500'} mr-1`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {showOnlyFavorites ? 'Tous les profils' : 'Favoris uniquement'}
              </button>
              
              {/* Statistiques de résultats */}
              <div className="text-sm text-gray-500 ml-auto">
                {filteredConnections.length} 
                {showOnlyFavorites ? ' favori' : ' résultat'}
                {filteredConnections.length > 1 ? 's' : ''} 
                {searchQuery && ' pour la recherche'}
                {showOnlyFavorites && connections.filter(c => c.is_favorite).length > 0 && 
                  ` sur ${connections.filter(c => c.is_favorite).length} favori${connections.filter(c => c.is_favorite).length > 1 ? 's' : ''}`
                }
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal pour ajouter une connexion manuellement */}
      <AddConnectionModal
        isOpen={isAddConnectionModalOpen}
        onClose={() => setIsAddConnectionModalOpen(false)}
        onSubmit={handleAddConnection}
        linkedinUrl={linkedinUrl}
        setLinkedinUrl={setLinkedinUrl}
        isLoading={isAddingConnection}
      />
      
      {/* Affichage des données pendant le chargement initial */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Chargement des connexions existantes...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : hasExistingConnections === false ? (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Aucune connexion trouvée. Cliquez sur "Calculer mes connexions" pour analyser vos connexions LinkedIn.
              </p>
            </div>
          </div>
        </div>
      ) : connections.length === 0 ? (
        <div></div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Table des connexions */}
          <div className="w-full lg:w-3/4 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Vos connexions LinkedIn
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {filteredConnections.length} connexions {searchQuery && 'trouvées'}
                {searchQuery && filteredConnections.length !== connections.length && ` sur ${connections.length} total`}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={filteredConnections.length > 0 && selectedProfiles.length === filteredConnections.length}
                          onChange={handleSelectAllProfiles}
                        />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entreprises
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Écoles
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredConnections.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                        Aucune connexion ne correspond à votre recherche
                      </td>
                    </tr>
                  ) : (
                    filteredConnections.map((connection) => (
                      <tr 
                        key={connection.id} 
                        className={selectedConnection?.id === connection.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
                      >
                        <td className="px-3 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={selectedProfiles.includes(connection.profile_id)}
                              onChange={() => handleProfileSelection(connection)}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleSelectConnection(connection)}>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              {connection.profile_image_url ? (
                                <img 
                                  className="h-10 w-10 rounded-full" 
                                  src={connection.profile_image_url} 
                                  alt={connection.target_name || connection.name || ''} 
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 font-medium">
                                    {(connection.target_name || connection.name || '??').split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              )}
                              {/* Icône de favori sur l'image */}
                              {connection.is_favorite && (
                                <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow">
                                  <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                <span>{connection.target_name || connection.name || 'Sans nom'}</span>
                                {/* Bouton de favori à côté du nom */}
                                <button 
                                  className="ml-2 focus:outline-none" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(connection.id);
                                  }}
                                  aria-label={connection.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                  disabled={isTogglingFavorite === connection.id.toString()}
                                >
                                  {isTogglingFavorite === connection.id.toString() ? (
                                    <svg className="h-4 w-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : connection.is_favorite ? (
                                    <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ) : (
                                    <svg className="h-5 w-5 text-gray-300 hover:text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleSelectConnection(connection)}>
                          <div className="text-sm text-gray-900 truncate max-w-[200px]">
                            {connection.title || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleSelectConnection(connection)}>
                          <div className="text-sm text-gray-900 text-center font-medium">
                            {connection.nbr_shared_companies || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleSelectConnection(connection)}>
                          <div className="text-sm text-gray-900 text-center font-medium">
                            {connection.nbr_shared_schools || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleSelectConnection(connection)}>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 mr-2">
                              {formatPercentage(connection.overall_similarity)}
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${getSimilarityColorClass(connection.overall_similarity)}`}
                                style={{ width: `${connection.overall_similarity * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Side Profile Card */}
          <div className="w-full lg:w-1/4">
            {selectedConnection ? (
              <div className="bg-white shadow-lg rounded-lg overflow-hidden sticky top-4">
                {/* Profile Header */}
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-700">
                  <div className="absolute bottom-0 transform translate-y-1/2 left-6">
                    {selectedConnection.profile_image_url ? (
                      <img 
                        className="h-20 w-20 rounded-full border-4 border-white object-cover" 
                        src={selectedConnection.profile_image_url} 
                        alt={selectedConnection.name} 
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                        <span className="text-2xl text-gray-500 font-medium">
                          {(selectedConnection.name || '??').split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Profile Info */}
                <div className="pt-12 px-6 pb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedConnection.name || 'Sans nom'}
                    </h3>
                    <button 
                      className="focus:outline-none" 
                      onClick={() => toggleFavorite(selectedConnection.id)}
                      aria-label={selectedConnection.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      disabled={isTogglingFavorite === selectedConnection.id.toString()}
                    >
                      {isTogglingFavorite === selectedConnection.id.toString() ? (
                        <svg className="h-6 w-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : selectedConnection.is_favorite ? (
                        <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ) : (
                        <svg className="h-6 w-6 text-gray-300 hover:text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-gray-600 mt-1 mb-3">
                    {selectedConnection.title || 'N/A'}
                  </p>
                  
                  {selectedConnection.location && (
                    <p className="text-sm text-gray-500 flex items-center mb-2">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                      </svg>
                      {selectedConnection.location}
                    </p>
                  )}
                  
                  {selectedConnection.industry && (
                    <p className="text-sm text-gray-500 flex items-center mb-4">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 002-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2h-.5a.5.5 0 01-.5-.5v-2a.5.5 0 01.5-.5H7v-1h6v1h2.5a.5.5 0 01.5.5v2a.5.5 0 01-.5.5H15z" clipRule="evenodd"></path>
                      </svg>
                      {selectedConnection.industry}
                    </p>
                  )}
                  
                  {/* LinkedIn Profile Link */}
                  {selectedConnection.profile_url && (
                    <a 
                      href={selectedConnection.profile_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 mb-4"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 0C4.477 0 0 4.477 0 10c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10 0-5.523-4.477-10-10-10z" />
                        <path fill="white" d="M7.5 6.5v8h2v-5.843L9 8l1.5.5V14.5h2v-8H11l-1 2.5-1-2.5H7.5z" />
                      </svg>
                      Voir sur LinkedIn
                    </a>
                  )}
                  
                  {/* Similarity Score Summary */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Score de similarité</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Global</p>
                        <p className="font-medium">{formatPercentage(selectedConnection.overall_similarity)}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Entreprises</p>
                        <p className="font-medium">{selectedConnection.nbr_shared_companies}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Formation</p>
                        <p className="font-medium">{selectedConnection.nbr_shared_schools}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Poste</p>
                        <p className="font-medium">{formatPercentage(selectedConnection.job_title_similarity)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Shared Companies */}
                  {selectedConnection.shared_companies && selectedConnection.shared_companies.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Entreprises communes</h4>
                      <div className="space-y-1">
                        {selectedConnection.shared_companies.map((company, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1">
                            {company.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Shared Schools */}
                  {selectedConnection.shared_schools && selectedConnection.shared_schools.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Écoles communes</h4>
                      <div className="space-y-1">
                        {selectedConnection.shared_schools.map((school, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1 mb-1">
                            {school.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Similarity Explanation */}
                  {selectedConnection.overall_similarity_explanation && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Explication</h4>
                      <p className="text-xs text-gray-600 whitespace-pre-line">
                        {selectedConnection.overall_similarity_explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun profil sélectionné</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Cliquez sur une connexion dans le tableau pour voir ses détails.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionsPage;