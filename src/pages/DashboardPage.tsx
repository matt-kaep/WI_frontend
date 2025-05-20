import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../contexts/SessionContext';
import { apiClient } from '../services/api';

// Types pour les statistiques et le statut
interface SessionStats {
  connection_count: number;
  profile_count: number;
  prospect_count: number;
  last_activity: string;
  file_name?: string;
}

interface SessionStatus {
  status: 'idle' | 'uploading' | 'processing' | 'done' | 'failed';
  message?: string;
  progress?: number;
}

const DashboardPage: React.FC = () => {
  const { currentSession } = useSession();
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [linkedinUrlError, setLinkedinUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fonction pour récupérer les statistiques de la session
  const fetchSessionStats = async () => {
    if (!currentSession) return;
    
    try {
      const statsData = await apiClient.getSessionStats(currentSession.id);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  // Fonction pour récupérer le statut de la session
  const fetchSessionStatus = async () => {
    if (!currentSession) return;
    
    try {
      const statusData = await apiClient.getSessionStatus(currentSession.id);
      setStatus(statusData);
      
      // Continuer à vérifier le statut si le traitement est en cours
      if (statusData.status === 'uploading' || statusData.status === 'processing') {
        setTimeout(fetchSessionStatus, 3000); // Vérifier toutes les 3 secondes
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
    }
  };

  // Charger les données au chargement de la page et lorsque la session change
  useEffect(() => {
    if (currentSession) {
      fetchSessionStats();
      fetchSessionStatus();
    }
  }, [currentSession]);

  // Gestion du changement de fichier
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      // Vérifier que c'est bien un fichier CSV
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setUploadError(null);
      } else {
        setUploadError('Veuillez sélectionner un fichier CSV');
        setFile(null);
      }
    }
  };

  // Gestion du changement d'URL LinkedIn
  const handleLinkedinUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setLinkedinUrl(url);
    
    // Validation simple de l'URL LinkedIn
    if (url && !url.includes('linkedin.com/')) {
      setLinkedinUrlError('Veuillez saisir une URL LinkedIn valide');
    } else {
      setLinkedinUrlError(null);
    }
  };

  // Fonction pour uploader le fichier
  const handleUpload = async () => {
    if (!file || !currentSession) return;

    // Validation de l'URL LinkedIn
    if (!linkedinUrl) {
      setLinkedinUrlError('Veuillez saisir votre URL LinkedIn');
      return;
    }
    
    if (!linkedinUrl.includes('linkedin.com/')) {
      setLinkedinUrlError('Veuillez saisir une URL LinkedIn valide');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload du fichier et récupération des résultats avec l'URL LinkedIn
      const uploadResult = await apiClient.uploadConnectionsFile(file, currentSession.id, linkedinUrl);
      
      // Mettre à jour les statistiques et le statut
      setStats({
        connection_count: uploadResult.connection_count || 0,
        profile_count: uploadResult.profile_count || 0,
        prospect_count: uploadResult.prospect_count || 0,
        last_activity: new Date().toISOString(),
        file_name: file.name
      });
      
      // Lancer la vérification du statut
      fetchSessionStatus();
      
      // Réinitialiser le fichier
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setUploadError(`Erreur lors de l'upload: ${error.message}`);
      console.error('Erreur lors de l\'upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Formatage de la date pour l'affichage
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  // Rendu conditionnel si aucune session n'est active
  if (!currentSession) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Home Page</h1>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Home Page</h1>
      
      {/* Message de bienvenue */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <h2 className="text-xl font-semibold text-blue-700">Welcome ! 👋 </h2>
        <p className="mt-2 text-sm text-blue-600">
          Our tool helps you analyze your LinkedIn network and identify the best introductions for your prospects.
          Import your connections below to start the analysis.
        </p>
      </div>
      
      {/* Upload de fichier - Déplacé en haut */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Import LinkedIn Connections</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Your LinkedIn URL
            </label>
            <div className="mt-1">
              <input
                type="text"
                value={linkedinUrl}
                onChange={handleLinkedinUrlChange}
                placeholder="https://www.linkedin.com/in/your-profile/"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                disabled={isUploading}
              />
              {linkedinUrlError && (
                <p className="mt-1 text-sm text-red-600">{linkedinUrlError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                We use this information to identify your profile in the network.
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              LinkedIn Connections CSV File
            </label>
            <div className="mt-1 flex items-center">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".csv"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                disabled={isUploading}
              />
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-500">
                Selected file: {file.name}
              </p>
            )}
            {uploadError && (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            )}
          </div>
          
          <div>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading || !linkedinUrl || !!linkedinUrlError}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                !file || isUploading || !linkedinUrl || !!linkedinUrlError
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Upload in progress...
                </>
              ) : (
                'Import and start analysis'
              )}
            </button>
          </div>
          
          {/* Statut du traitement intégré */}
          {status && (
            <div className="mt-4">
              <div className="flex items-center">
                <div className="mr-2">
                  {status.status === 'idle' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Ready
                    </span>
                  )}
                  {status.status === 'uploading' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Uploading
                    </span>
                  )}
                  {status.status === 'processing' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Processing
                    </span>
                  )}
                  {status.status === 'done' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Complete
                    </span>
                  )}
                  {status.status === 'failed' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Failed
                    </span>
                  )}
                </div>
                <span className="text-sm">{status.message || ''}</span>
              </div>
              
              {(status.status === 'uploading' || status.status === 'processing') && status.progress !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${status.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-500">
            <p>
              Import your LinkedIn connections CSV export file and provide your LinkedIn profile URL to start analysis. 
              The process can take several minutes depending on the size of your network.
            </p>
          </div>
        </div>
      </div>
      
      {/* Statistiques du réseau */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Network Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Imported Connections</p>
            <p className="text-2xl font-bold">{stats?.connection_count || currentSession.connection_count || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Analyzed Profiles</p>
            <p className="text-2xl font-bold">{stats?.profile_count || currentSession.profile_count || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Prospects Found</p>
            <p className="text-2xl font-bold">{stats?.prospect_count || currentSession.prospect_count || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Last Activity</p>
            <p className="text-md font-medium">
              {stats?.last_activity ? formatDate(stats.last_activity) : formatDate(currentSession.updated_at)}
            </p>
          </div>
        </div>
        
        {stats?.file_name && (
          <div className="mt-4 text-sm text-gray-500">
            <p>Last imported file: {stats.file_name}</p>
          </div>
        )}
      </div>
      
      {/* Informations sur la session */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Current Session</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Session ID</p>
            <p className="font-medium">{currentSession.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{currentSession.name}</p>
          </div>
          {currentSession.description && (
            <div className="col-span-1 md:col-span-2">
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">{currentSession.description}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Created on</p>
            <p className="font-medium">{formatDate(currentSession.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="font-medium">{formatDate(currentSession.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;