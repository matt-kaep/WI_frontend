import { supabase } from './supabase';

// Base URL pour l'API backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/';

// Client API pour les requêtes au backend
const apiClient = {
  // Sessions
  async getUserSessions() {
    console.log(`Démarrage de getUserSessions - URL: ${API_BASE_URL}/session`);
    
    try {
      const { data: userSession, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur d'authentification Supabase:", error);
        throw error;
      }
      
      console.log("Session Supabase récupérée:", 
        userSession?.session ? `ID: ${userSession.session.user.id} (token présent)` : "Pas de session");
      
      const requestHeaders = {
        'Authorization': `Bearer ${userSession.session?.access_token}`,
      };
      
      console.log("En-têtes de la requête:", JSON.stringify(requestHeaders, null, 2));
      console.log(`Envoi requête GET à ${API_BASE_URL}/session/all`);
      
      const response = await fetch(`${API_BASE_URL}/session/all`, {
        headers: requestHeaders,
      });
      
      console.log("Réponse reçue:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        url: response.url,
        redirected: response.redirected
      });
      
      if (!response.ok) {
        console.warn(`Réponse non-OK (${response.status}): ${response.statusText}`);
        
        // Vérifier le type de contenu avant d'essayer de parser le JSON
        const contentType = response.headers.get('content-type');
        console.log("Type de contenu:", contentType);
        
        if (contentType && contentType.includes('application/json')) {
          console.log("Tentative de parsing JSON pour l'erreur");
          const errorData = await response.json();
          console.error("Données d'erreur JSON:", errorData);
          throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
        } else {
          // Si ce n'est pas du JSON, utilisez le texte ou le statut HTTP
          const errorText = await response.text();
          console.error('Réponse non-JSON reçue:', errorText.substring(0, 500));
          console.error('HTML/texte complet:', errorText);
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
      
      // Vérifier le type de contenu de la réponse OK
      const contentType = response.headers.get('content-type');
      console.log("Type de contenu de la réponse réussie:", contentType);
      
      try {
        const responseText = await response.text();
        console.log("Texte de la réponse:", responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
        
        // Parser manuellement le JSON après avoir récupéré le texte
        const jsonData = JSON.parse(responseText);
        console.log("Données JSON parsées avec succès:", jsonData);
        return jsonData;
      } catch (jsonError) {
        console.error('Erreur lors du parsing JSON:', jsonError);
        throw new Error('La réponse du serveur n\'est pas au format JSON valide');
      }
    } catch (error) {
      console.error("Erreur dans getUserSessions:", error);
      throw error;
    }
  },
  
  // Création de session
  async createSession(name: string, description?: string) {
    console.log(`Démarrage de createSession - URL: ${API_BASE_URL}/session/create`);
    
    try {
      const { data: userSession, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur d'authentification Supabase:", error);
        throw error;
      }
      
      if (!userSession.session) {
        throw new Error("Aucune session utilisateur active");
      }
      
      const userId = userSession.session.user.id;
      console.log("Création de session pour l'utilisateur:", userId);
      
      // Préparation des données selon le format attendu par l'API
      const sessionData = {
        user_id: userId,
        name: name,
        description: description || undefined,
        source: "Frontend creation"
      };
      
      const response = await fetch(`${API_BASE_URL}/session/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession.session.access_token}`,
        },
        body: JSON.stringify(sessionData),
      });
      
      console.log("Réponse reçue:", {
        status: response.status,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error("Erreur lors de la création de session:", errorData);
          throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
        } else {
          const errorText = await response.text();
          console.error('Réponse non-JSON reçue:', errorText.substring(0, 500));
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
      
      // Récupérer et retourner les données de la session créée
      const newSession = await response.json();
      console.log("Session créée avec succès:", newSession);
      return newSession;
    } catch (error) {
      console.error("Erreur dans createSession:", error);
      throw error;
    }
  },
  
  // Session stats and status
  async getSessionStats(sessionId: string) {
    const { data: userSession, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    const response = await fetch(`${API_BASE_URL}/session/${sessionId}/stats`, {
      headers: {
        'Authorization': `Bearer ${userSession.session?.access_token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération des statistiques');
    }
    
    return await response.json();
  },
  
  async getSessionStatus(sessionId: string) {
    const { data: userSession, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    const response = await fetch(`${API_BASE_URL}/session/${sessionId}/status`, {
      headers: {
        'Authorization': `Bearer ${userSession.session?.access_token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération du statut');
    }
    
    return await response.json();
  },
  
  // File upload
  async uploadConnectionsFile(file: File, sessionId: string, userLinkedinUrl: string) {
    const { data: userSession, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);
    formData.append('user_personal_linkedin_account_url', userLinkedinUrl);
    
    const response = await fetch(`${API_BASE_URL}/upload-connections/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userSession.session?.access_token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de l\'upload du fichier');
    }
    
    return await response.json();
  },
  
  // Connexions - getCurrentSession, fetch connections
  async getCurrentSession() {
    const { data: userSession, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    const response = await fetch(`${API_BASE_URL}/session/current`, {
      headers: {
        'Authorization': `Bearer ${userSession.session?.access_token}`,
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Pas de session active
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération de la session courante');
    }
    
    return await response.json();
  },
  
  // User connections
  async getUserConnections(minSimilarity: number = 0.0, maxResults: number = 1000) {
    const { data: userSession, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    const url = new URL(`${API_BASE_URL}/user-connections`);
    url.searchParams.append('min_similarity', minSimilarity.toString());
    url.searchParams.append('max_results', maxResults.toString());
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${userSession.session?.access_token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération des connexions');
    }
    
    return await response.json();
  },

  // Get prospects for a specific session
  async getSessionProspects(sessionId: string) {
    console.log(`Récupération des prospects pour la session ${sessionId}`);
    
    try {
      const { data: userSession, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur d'authentification Supabase:", error);
        throw error;
      }
      
      if (!userSession.session) {
        throw new Error("Aucune session utilisateur active");
      }
      
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/prospects`, {
        headers: {
          'Authorization': `Bearer ${userSession.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error("Erreur lors de la récupération des prospects:", errorData);
          throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
        } else {
          const errorText = await response.text();
          console.error('Réponse non-JSON reçue:', errorText.substring(0, 500));
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
      
      const prospects = await response.json();
      console.log("Prospects récupérés avec succès:", prospects.length);
      return prospects;
    } catch (error) {
      console.error("Erreur dans getSessionProspects:", error);
      throw error;
    }
  },
  
  // Recherche de prospects selon des filtres
  async findProspects(filters: any) {
    console.log("Recherche de prospects avec les filtres:", filters);
    
    try {
      const { data: userSession, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur d'authentification Supabase:", error);
        throw error;
      }
      
      if (!userSession.session) {
        throw new Error("Aucune session utilisateur active");
      }
      
      const response = await fetch(`${API_BASE_URL}/find-prospects/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userSession.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error("Erreur lors de la recherche de prospects:", errorData);
          throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
        } else {
          const errorText = await response.text();
          console.error('Réponse non-JSON reçue:', errorText.substring(0, 500));
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
      
      const prospects = await response.json();
      console.log("Prospects trouvés avec succès:", prospects.length);
      return prospects;
    } catch (error) {
      console.error("Erreur dans findProspects:", error);
      throw error;
    }
  },
  
  // Récupérer les connexions existantes depuis la table connections
  async getExistingConnections() {
    console.log('Récupération des connexions existantes');
    
    try {
      const { data: userSession, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur d'authentification Supabase:", error);
        throw error;
      }
      
      if (!userSession.session) {
        throw new Error("Aucune session utilisateur active");
      }
      
      const response = await fetch(`${API_BASE_URL}/connections/existing`, {
        headers: {
          'Authorization': `Bearer ${userSession.session.access_token}`,
        },
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error("Erreur lors de la récupération des connexions existantes:", errorData);
          throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
        } else {
          const errorText = await response.text();
          console.error('Réponse non-JSON reçue:', errorText.substring(0, 500));
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
      
      const connections = await response.json();
      console.log("Connexions existantes récupérées avec succès:", connections);
      return connections;
    } catch (error) {
      console.error("Erreur dans getExistingConnections:", error);
      throw error;
    }
  },
  
  // Activer une session spécifique
  async activateSession(sessionId: string) {
    console.log(`Activation de la session ${sessionId}`);
    
    try {
      const { data: userSession, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur d'authentification Supabase:", error);
        throw error;
      }
      
      if (!userSession.session) {
        throw new Error("Aucune session utilisateur active");
      }
      
      const response = await fetch(`${API_BASE_URL}/session/${sessionId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession.session.access_token}`,
        }
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error("Erreur lors de l'activation de la session:", errorData);
          throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
        } else {
          const errorText = await response.text();
          console.error('Réponse non-JSON reçue:', errorText.substring(0, 500));
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
      
      // Récupérer et retourner les données de la session activée
      const activatedSession = await response.json();
      console.log("Session activée avec succès:", activatedSession);
      return activatedSession;
    } catch (error) {
      console.error("Erreur dans activateSession:", error);
      throw error;
    }
  },

  // Supprimer une session et toutes ses données associées
  async deleteSession(sessionId: string) {
    console.log(`Suppression de la session ${sessionId}`);
    
    try {
      const { data: userSession, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur d'authentification Supabase:", error);
        throw error;
      }
      
      if (!userSession.session) {
        throw new Error("Aucune session utilisateur active");
      }
      
      const response = await fetch(`${API_BASE_URL}/session/delete/${sessionId}`, {
        method: 'GET', // Note: L'endpoint est défini comme GET dans le backend
        headers: {
          'Authorization': `Bearer ${userSession.session.access_token}`,
        }
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error("Erreur lors de la suppression de la session:", errorData);
          throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
        } else {
          const errorText = await response.text();
          console.error('Réponse non-JSON reçue:', errorText.substring(0, 500));
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
      
      // Récupérer et retourner la confirmation de suppression
      const result = await response.json();
      console.log("Session supprimée avec succès:", result);
      return result;
    } catch (error) {
      console.error("Erreur dans deleteSession:", error);
      throw error;
    }
  },

  // Récupérer le résumé d'un profil (informations de base, expériences, formations)
  async getProfileResume(profileId: string) {
    console.log(`Récupération du résumé du profil ${profileId}`);
    
    try {
      const { data: userSession, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur d'authentification Supabase:", error);
        throw error;
      }
      
      if (!userSession.session) {
        throw new Error("Aucune session utilisateur active");
      }
      
      // Récupérer la session active (on utilise la session active de l'utilisateur)
      const session = await this.getCurrentSession();
      if (!session) {
        throw new Error("Aucune session active trouvée. Veuillez importer vos connexions LinkedIn d'abord.");
      }
      
  
      
      // Faire la requête à l'endpoint de résumé de profil avec le profileId comme paramètre de requête
      const response = await fetch(`${API_BASE_URL}/profile_resume/?profile_id=${profileId}`, {
        headers: {
          'Authorization': `Bearer ${userSession.session.access_token}`,
        },
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error("Erreur lors de la récupération du résumé du profil:", errorData);
          throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
        } else {
          const errorText = await response.text();
          console.error("Erreur lors de la récupération du résumé du profil (texte):", errorText);
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
      
      const profileData = await response.json();
      console.log("Résumé du profil récupéré avec succès:", profileData);
      return profileData;
    } catch (error) {
      console.error("Erreur dans getProfileResume:", error);
      throw error;
    }
  },
  
  // Calculer les connexions entre prospects et leurs connexions parentes
  async computeProspectsConnections(prospects: any[]) {
    console.log(`Calcul des connexions pour ${prospects.length} prospects`);
    
    try {
      const { data: userSession, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur d'authentification Supabase:", error);
        throw error;
      }
      
      if (!userSession.session) {
        throw new Error("Aucune session utilisateur active");
      }
      
      const response = await fetch(`${API_BASE_URL}/prospects-connections/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userSession.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prospects)
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error("Erreur lors du calcul des connexions des prospects:", errorData);
          throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
        } else {
          const errorText = await response.text();
          console.error('Réponse non-JSON reçue:', errorText.substring(0, 500));
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
      
      const connections = await response.json();
      console.log("Connexions des prospects calculées avec succès:", connections.length);
      return connections;
    } catch (error) {
      console.error("Erreur dans computeProspectsConnections:", error);
      throw error;
    }
  },

  // Ajouter une connexion manuellement à partir d'une URL LinkedIn
  async addConnectionByUrl(linkedinUrl: string) {
    console.log(`Démarrage de addConnectionByUrl pour URL: ${linkedinUrl}`);
    
    try {
      const { data: userSession, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur d'authentification Supabase:", error);
        throw error;
      }
      
      const requestHeaders = {
        'Authorization': `Bearer ${userSession.session?.access_token}`,
        'Content-Type': 'application/json',
      };
      
      const response = await fetch(`${API_BASE_URL}/insert_new_connection?linkedin_url=${encodeURIComponent(linkedinUrl)}`, {
        method: 'POST',
        headers: requestHeaders,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur lors de l'ajout de la connexion: ${response.status} - ${errorText}`);
        throw new Error(`Erreur lors de l'ajout de la connexion: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de l'appel API addConnectionByUrl:", error);
      throw error;
    }
  },

  // Basculer l'état favori d'une connexion
  async toggleConnectionFavorite(connectionId: string | number) {
    console.log(`Démarrage de toggleConnectionFavorite pour connexion ID: ${connectionId}`);
    
    try {
      const { data: userSession, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur d'authentification Supabase:", error);
        throw error;
      }
      
      const requestHeaders = {
        'Authorization': `Bearer ${userSession.session?.access_token}`,
        'Content-Type': 'application/json',
      };
      
      const response = await fetch(`${API_BASE_URL}/connections/${connectionId}/toggle-favorite`, {
        method: 'PATCH',
        headers: requestHeaders,
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error("Erreur lors du basculement du statut favori:", errorData);
          throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
        } else {
          const errorText = await response.text();
          console.error(`Erreur lors du basculement du statut favori: ${response.status} - ${errorText}`);
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
      
      const result = await response.json();
      console.log(`Statut favori basculé avec succès. Nouveau statut: ${result.is_favorite ? 'Favori' : 'Non favori'}`);
      return result;
    } catch (error) {
      console.error("Erreur lors de l'appel API toggleConnectionFavorite:", error);
      throw error;
    }
  },

  // Récupérer uniquement les connexions favorites
  async getFavoriteConnections() {
    console.log('Récupération des connexions favorites');
    
    try {
      const { data: userSession, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur d'authentification Supabase:", error);
        throw error;
      }
      
      if (!userSession.session) {
        throw new Error("Aucune session utilisateur active");
      }
      
      const response = await fetch(`${API_BASE_URL}/connections/favorites`, {
        headers: {
          'Authorization': `Bearer ${userSession.session.access_token}`,
        },
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error("Erreur lors de la récupération des connexions favorites:", errorData);
          throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
        } else {
          const errorText = await response.text();
          console.error('Réponse non-JSON reçue:', errorText.substring(0, 500));
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
      
      const favorites = await response.json();
      console.log("Connexions favorites récupérées avec succès:", favorites);
      return favorites;
    } catch (error) {
      console.error("Erreur dans getFavoriteConnections:", error);
      throw error;
    }
  },
};

export { apiClient };