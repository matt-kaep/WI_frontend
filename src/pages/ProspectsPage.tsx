import React, { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { apiClient } from '../services/api';

// Define the ProspectFilter interface based on the backend
interface ProspectFilter {
  selectedConnectionIds: string[];
  locationFilter?: string;
  jobTitleFilter: string;
  specificCompaniesFilter?: string[];
  specificSchoolsFilter?: string[];
  useExperience?: boolean;
  useEducation?: boolean;
  limit?: number;
}

// Define the ProfileResume interface to match the API response
interface ProfileResume {
  basic_info: {
    id: string;
    full_name: string;
    current_title?: string;
    current_company?: string;
    location?: string;
    image_url?: string;
    profile_url?: string;
  };
  experiences?: Array<{
    id: string;
    company_name: string;
    title: string;
    date_range?: string;
    duration?: string;
  }>;
  education?: Array<{
    id: string;
    school_name: string;
    degree?: string;
    field_of_study?: string;
    date_range?: string;
  }>;
}

// Define the Prospect interface, updated to reflect the computeProspectsConnections response
interface Prospect {
  id?: string;
  session_id: string;
  focus_profile_id: string; // The parent connection profile ID
  profile_id: string; // The coresignal_prospect_id for this prospect
  name: string;
  title?: string;
  location?: string;
  industry?: string;
  profile_image_url?: string;
  profile_url?: string;
  overall_similarity: number;
  company_similarity?: number;
  education_similarity?: number;
  job_title_similarity?: number;
  nbr_shared_companies: number;
  nbr_shared_schools: number;
  shared_companies?: Array<string | {name: string}>;
  shared_schools?: Array<string | {name: string}>;
  
  // Basic info for the prospect themselves (matches ProfileResume basic_info structure for rendering)
  // This is present because computeProspectsConnections adds it.
  basic_info?: {
    id: string;
    full_name: string;
    current_title?: string;
    current_company?: string;
    location?: string;
    image_url?: string;
    profile_url?: string;
  };
}

// Import ConnectionProfileCard styles
import './ConnectionProfileCard.css';

// Composant Toast
const Toast = ({ message, onClose, type = "info", showSpinner = false }: { 
  message: string, 
  onClose: () => void, 
  type?: "info" | "warning" | "success" | "error", 
  showSpinner?: boolean 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);
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
            {showSpinner ? (
              <div className={`animate-spin rounded-full h-5 w-5 border-t-2 border-current ${iconClass}`}></div>
            ) : (
              <svg className={`h-5 w-5 ${iconClass}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
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

// --- ConnectionProfileCard Component (Updated) ---
// Define the props for the ConnectionProfileCard component
interface ConnectionProfileCardProps {
  connectionId: string;
  profileData: ProfileResume | null; // Now accepts full ProfileResume
  isLoading: boolean;
  error?: string;
  prospectCount: number;
}

const ConnectionProfileCard: React.FC<ConnectionProfileCardProps> = ({ 
  connectionId, 
  profileData, 
  isLoading, 
  error,
  prospectCount = 0,
}) => {

  // Définition d'une hauteur et largeur fixes pour toutes les cartes
  const cardStyle = {
    width: "100%",
    height: "200px", // Hauteur fixe pour toutes les cartes
    display: "flex",
    overflow: "hidden"
  };

  if (isLoading) {
    return (
      <div className="connection-profile-card connection-profile-card-parent connection-profile-card-loading" style={cardStyle}>
        <div className="connection-profile-badge">
          <div className="badge-number">{prospectCount}</div>
          <div className="badge-label">prospects</div>
        </div>
        <div className="connection-profile-spinner flex-grow">
          <div className="flex items-center">
            <div className="spinner-container mr-3">
              <div className="spinner w-6 h-6 border-t-2 border-blue-500 border-r-2 rounded-full animate-spin"></div>
            </div>
            <div className="spinner-text">Chargement des données du profil...</div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="connection-profile-card connection-profile-card-parent connection-profile-card-error" style={cardStyle}>
        <div className="connection-profile-badge">
          <div className="badge-number">{prospectCount}</div>
          <div className="badge-label">prospects</div>
        </div>
        <div className="connection-profile-error flex-grow">
          <div className="flex items-center">
            <div className="error-icon text-red-500 mr-3">⚠️</div>
            <div>
              <div className="error-message text-red-600 font-medium">{error}</div>
              <div className="connection-id text-gray-500 text-sm mt-1">ID: {connectionId}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If no profileData or basic_info, show a placeholder
  if (!profileData || !profileData.basic_info) {
    console.warn(`Profile data for connection ${connectionId} is incomplete or missing basic_info:`, profileData);
    return (
      <div className="connection-profile-card connection-profile-card-parent connection-profile-card-placeholder" style={cardStyle}>
        <div className="connection-profile-badge">
          <div className="badge-number">{prospectCount}</div>
          <div className="badge-label">prospects</div>
        </div>
        <div className="connection-profile-placeholder flex-grow">
          <div className="flex items-center">
            <div className="placeholder-avatar bg-gray-200 text-gray-600 w-10 h-10 rounded-full flex items-center justify-center mr-3">👤</div>
            <div>
              <div className="placeholder-text text-gray-600">Informations de profil de connexion non disponibles</div>
              <div className="connection-id text-gray-500 text-sm mt-1">ID: {connectionId}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const { basic_info, experiences, education } = profileData;
  
  return (
    <div className="connection-profile-card connection-profile-card-parent" style={cardStyle}>
      {/* Badge de nombre de prospects */}
      <div className="connection-profile-badge">
        <div className="badge-number">{prospectCount}</div>
        <div className="badge-label">prospects</div>
      </div>

      {/* Structure en trois colonnes */}
      <div className="grid grid-cols-3 w-full">
        {/* Colonne 1: Informations basiques */}
        <div className="p-3 flex flex-col justify-center border-r border-gray-200">
          <div className="flex items-center mb-2">
            {basic_info.image_url ? (
              <img 
                src={basic_info.image_url} 
                alt={basic_info.full_name} 
                className="w-12 h-12 rounded-full mr-3"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mr-3 font-bold text-lg">
                {basic_info.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="font-bold text-gray-900">{basic_info.full_name}</h4>
              {basic_info.location && (
                <div className="text-sm text-gray-600 flex items-center">
                  <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {basic_info.location}
                </div>
              )}
            </div>
          </div>
          
          {basic_info.current_title && (
            <div className="text-sm text-gray-700 flex items-center mb-1">
              <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              {basic_info.current_title}
            </div>
          )}
          
          {basic_info.current_company && (
            <div className="text-sm text-gray-700 flex items-center mb-1">
              <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              {basic_info.current_company}
            </div>
          )}
          
          {basic_info.profile_url && (
            <a 
              href={basic_info.profile_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-2 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded px-2 py-1 inline-flex items-center"
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
              LinkedIn
            </a>
          )}
        </div>

        {/* Colonne 2: Expériences (noms des entreprises uniquement) */}
        <div className="p-3 border-r border-gray-200">
          <h5 className="font-semibold text-gray-800 text-sm mb-2">Expériences</h5>
          {experiences && experiences.length > 0 ? (
            <div className="overflow-y-auto" style={{ maxHeight: "130px" }}>
              <ul className="space-y-1">
                {experiences.map((exp, index) => (
                  <li key={exp.id || `exp-${index}`} className="text-sm text-gray-700">
                    {exp.company_name}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Aucune expérience disponible</p>
          )}
        </div>

        {/* Colonne 3: Formations (noms des écoles uniquement) */}
        <div className="p-3">
          <h5 className="font-semibold text-gray-800 text-sm mb-2">Formation</h5>
          {education && education.length > 0 ? (
            <div className="overflow-y-auto" style={{ maxHeight: "130px" }}>
              <ul className="space-y-1">
                {education.map((edu, index) => (
                  <li key={edu.id || `edu-${index}`} className="text-sm text-gray-700">
                    {edu.school_name}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Aucune formation disponible</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- ProspectsPage Component ---
const ProspectsPage: React.FC = () => {
  const { currentSession, updateSession } = useSession();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<string[]>([]);
  const [parentProfileResumes, setParentProfileResumes] = useState<Record<string, ProfileResume>>({});
  const [loadingParentProfiles, setLoadingParentProfiles] = useState<Record<string, boolean>>({});
  const [parentProfileErrors, setParentProfileErrors] = useState<Record<string, string>>({});
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isLoadingProspectDetails, setIsLoadingProspectDetails] = useState<boolean>(false);
  const [prospectProfileData, setProspectProfileData] = useState<ProfileResume | null>(null);
  
  // Nouveaux états pour la vue et l'export
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  
  // Filter state
  const [filters, setFilters] = useState<ProspectFilter>({
    selectedConnectionIds: [],
    locationFilter: "France OR Paris",
    jobTitleFilter: "Sales OR Marketing",
    useExperience: true,
    useEducation: false,
    limit: 150,
  });
  
  // Show filter form (open by default)
  const [showFilters, setShowFilters] = useState(true);

  // Toast state for notifications
  const [toast, setToast] = useState<{ message: string, type: "info" | "warning" | "success" | "error" } | null>(null);

  // Fonction pour exporter les prospects en CSV
  const exportToCSV = () => {
    if (prospects.length === 0) {
      alert('Aucun prospect à exporter');
      return;
    }

    const headers = [
      'Nom',
      'Poste',
      'Localisation',
      'Score de similarité (%)',
      'Nombre d\'entreprises partagées',
      'Nombre d\'écoles partagées',
      'Entreprises partagées',
      'Écoles partagées',
      'URL LinkedIn',
      'Connection via (ID)'
    ];

    const csvData = prospects.map(prospect => [
      prospect.name || '',
      prospect.title || '',
      prospect.location || '',
      Math.round((prospect.overall_similarity || 0) * 100),
      prospect.nbr_shared_companies || 0,
      prospect.nbr_shared_schools || 0,
      prospect.shared_companies?.map(company => 
        typeof company === 'string' ? company : company.name
      ).join('; ') || '',
      prospect.shared_schools?.map(school => 
        typeof school === 'string' ? school : school.name
      ).join('; ') || '',
      prospect.profile_url || '',
      prospect.focus_profile_id || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `prospects_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group prospects by connection profile (focus_profile_id) and sort by overall_similarity
  const prospectsByConnection = React.useMemo(() => {
    const groups: Record<string, Prospect[]> = {};
    
    prospects.forEach(prospect => {
      const connectionId = prospect.focus_profile_id;
      if (!groups[connectionId]) {
        groups[connectionId] = [];
      }
      groups[connectionId].push(prospect);
    });
    
    // Sort each group by overall_similarity in descending order
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => (b.overall_similarity || 0) - (a.overall_similarity || 0));
    });
    
    return groups;
  }, [prospects]);

  // Function to fetch full profile resume data for parent connections
  const fetchParentProfileResume = async (profileId: string) => {
    if (!profileId || loadingParentProfiles[profileId] || parentProfileResumes[profileId]) return;
    
    try {
      setLoadingParentProfiles(prev => ({ ...prev, [profileId]: true }));
      setParentProfileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[profileId];
        return newErrors;
      });
      
      console.log(`Workspaceing full profile resume for parent ID: ${profileId}`);
      const profileData = await apiClient.getProfileResume(profileId);
      
      if (!profileData || !profileData.profile_basic_info) {
        console.error(`Invalid parent profile data returned for ${profileId}:`, profileData);
        throw new Error('Invalid profile data structure returned for parent connection');
      }
      
      const formattedProfileData: ProfileResume = {
        basic_info: profileData.profile_basic_info,
        experiences: profileData.profile_experience || [],
        education: profileData.profile_education || []
      };
      
      setParentProfileResumes(prev => ({
        ...prev,
        [profileId]: formattedProfileData
      }));
    } catch (error) {
      console.error(`Error fetching parent profile data for ${profileId}:`, error);
      setParentProfileErrors(prev => ({
        ...prev,
        [profileId]: error instanceof Error ? error.message : 'Failed to load parent profile'
      }));
    } finally {
      setLoadingParentProfiles(prev => ({ ...prev, [profileId]: false }));
    }
  };

  // Effect to load parent profile resumes when prospects are grouped
  useEffect(() => {
    const uniqueParentIds = Object.keys(prospectsByConnection).filter(id => id !== 'unknown');
    uniqueParentIds.forEach(id => {
      // Only fetch if not already loaded or currently loading
      if (!parentProfileResumes[id] && !loadingParentProfiles[id]) {
        fetchParentProfileResume(id);
      }
    });
  }, [prospectsByConnection]); // Dependency on grouped prospects

  // Load configuration when the page loads or session changes
  useEffect(() => {
    const loadConfig = async () => {
      if (!currentSession) return;
      
      const profiles = currentSession.selectedProfiles || [];
      setSelectedConnectionIds(profiles);
      setFilters(prev => ({
        ...prev,
        selectedConnectionIds: profiles
      }));
    };
    
    loadConfig();
  }, [currentSession]);

  // Handler for filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Function to search for prospects and compute connections
  const searchProspects = async () => {
    console.log('searchProspects called', { currentSession, filters });
    
    if (!currentSession) {
      setError('No active session. Please create or select a session.');
      return;
    }
    
    if (!filters.selectedConnectionIds.length) {
      setError('Please select at least one connection to find prospects.');
      return;
    }
    
    if (!filters.jobTitleFilter) {
      setError('Please enter a job title filter.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setProspects([]); // Clear previous prospects
    setParentProfileResumes({}); // Clear parent profile data
    setLoadingParentProfiles({}); // Clear parent profile loading states
    setParentProfileErrors({}); // Clear parent profile errors
    
    // Show loading toast with estimated time
    setToast({ 
      message: "Recherche en cours... Cette opération peut prendre 2 à 3 minutes", 
      type: "info" 
    });
    
    try {
      console.log('Calling findProspects with filters:', filters);
      const initialProspects = await apiClient.findProspects(filters);
      console.log('Found initial prospects:', initialProspects);
      
      if (!Array.isArray(initialProspects) || initialProspects.length === 0) {
        setProspects([]);
        setError('No initial prospects found with the current filters. Try adjusting your search.');
        return;
      }
      
      console.log('Computing prospect connections...');
      const enrichedProspects: Prospect[] = await apiClient.computeProspectsConnections(initialProspects);
      
      console.log('Enriched prospects with connections:', enrichedProspects);
      
      if (Array.isArray(enrichedProspects)) {
        // Trier les prospects par overall_similarity en ordre décroissant
        const sortedProspects = [...enrichedProspects].sort(
          (a, b) => (b.overall_similarity || 0) - (a.overall_similarity || 0)
        );
        
        setProspects(sortedProspects);
        updateSession({
          ...currentSession,
          prospect_count: sortedProspects.length
        });
      } else {
        console.error('computeProspectsConnections did not return an array:', enrichedProspects);
        setError('Invalid data format received for connections from server.');
      }
      
    } catch (error: any) {
      console.error('Error searching for prospects or computing connections:', error);
      setError(error.message || 'An error occurred during prospect search.');
    } finally {
      setIsLoading(false);
      setToast(null);
    }
  };

  // Function to load prospect details for the dialog
  const loadProspectDetails = async (prospect: Prospect) => {
    if (!prospect || !prospect.profile_id) return;
    
    try {
      setIsLoadingProspectDetails(true);
      setSelectedProspect(prospect);
      setProspectProfileData(null);
      
      console.log(`Loading details for prospect ID: ${prospect.profile_id}`);
      
      const profileData = await apiClient.getProfileResume(prospect.profile_id);
      
      if (!profileData || !profileData.profile_basic_info) {
        console.error(`Invalid profile data returned for prospect ${prospect.profile_id}:`, profileData);
        throw new Error('Invalid profile data structure returned from the server');
      }
      
      const formattedProfileData: ProfileResume = {
        basic_info: profileData.profile_basic_info,
        experiences: profileData.profile_experience || [],
        education: profileData.profile_education || []
      };
      
      console.log(`Profile data formatted for prospect ${prospect.profile_id}:`, formattedProfileData);
      setProspectProfileData(formattedProfileData);
      
    } catch (error) {
      console.error(`Error loading prospect details:`, error);
      setError(error instanceof Error ? error.message : 'Failed to load prospect details');
    } finally {
      setIsLoadingProspectDetails(false);
    }
  };
  
  // Create a prospect detail dialog component
  const ProspectDetailDialog = () => {
    if (!selectedProspect) return null;
    
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${selectedProspect ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSelectedProspect(null)}></div>
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 relative">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedProspect.name}
              </h2>
              <button 
                onClick={() => setSelectedProspect(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {isLoadingProspectDetails ? (
              <div className="flex justify-center items-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Loading profile details...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Current information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Current Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-md">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Position</p>
                      <p className="text-sm text-gray-900">{selectedProspect.title || 'Not available'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Location</p>
                      <p className="text-sm text-gray-900">{selectedProspect.location || 'Not available'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">LinkedIn</p>
                      {selectedProspect.profile_url ? (
                        <a 
                          href={selectedProspect.profile_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          View Profile
                        </a>
                      ) : (
                        <p className="text-sm text-gray-500">Not available</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Connection Information */}
                {((selectedProspect.shared_companies && selectedProspect.shared_companies.length > 0) || 
                  (selectedProspect.shared_schools && selectedProspect.shared_schools.length > 0) || 
                  selectedProspect.overall_similarity !== undefined) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Connection Information</h3>
                    
                    {/* Similarity scores */}
                    {selectedProspect.overall_similarity !== undefined && (
                      <div className="bg-blue-50 p-4 rounded-md mb-4">
                        <h4 className="text-sm font-medium text-gray-800 mb-3">Similarity Scores</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Overall</p>
                            <div className="flex items-center mt-1">
                              <div className="w-full bg-gray-200 rounded-full h-2 mr-2 flex-grow">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${Math.round((selectedProspect.overall_similarity || 0) * 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-blue-700">
                                {Math.round((selectedProspect.overall_similarity || 0) * 100)}%
                              </span>
                            </div>
                          </div>
                          
                          {selectedProspect.company_similarity !== undefined && (
                            <div>
                              <p className="text-xs text-gray-500">Company</p>
                              <div className="flex items-center mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2 mr-2 flex-grow">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${Math.round(selectedProspect.company_similarity * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-blue-700">
                                  {Math.round(selectedProspect.company_similarity * 100)}%
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {selectedProspect.education_similarity !== undefined && (
                            <div>
                              <p className="text-xs text-gray-500">Education</p>
                              <div className="flex items-center mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2 mr-2 flex-grow">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${Math.round(selectedProspect.education_similarity * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-blue-700">
                                  {Math.round(selectedProspect.education_similarity * 100)}%
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {selectedProspect.job_title_similarity !== undefined && (
                            <div>
                              <p className="text-xs text-gray-500">Job Title</p>
                              <div className="flex items-center mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2 mr-2 flex-grow">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${Math.round(selectedProspect.job_title_similarity * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-blue-700">
                                  {Math.round(selectedProspect.job_title_similarity * 100)}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Shared Entities */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Shared Companies */}
                      {selectedProspect.shared_companies && selectedProspect.shared_companies.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-md">
                          <h4 className="text-sm font-medium text-gray-800 mb-2">
                            Shared Companies ({selectedProspect.nbr_shared_companies || 0})
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedProspect.shared_companies.map((company, idx) => (
                              <span 
                                key={`company-detail-${idx}`} 
                                className="bg-white border border-blue-200 text-blue-700 rounded-full px-2 py-1 text-xs"
                              >
                                {typeof company === 'string' ? company : company.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Shared Schools */}
                      {selectedProspect.shared_schools && selectedProspect.shared_schools.length > 0 && (
                        <div className="bg-green-50 p-4 rounded-md">
                          <h4 className="text-sm font-medium text-gray-800 mb-2">
                            Shared Schools ({selectedProspect.nbr_shared_schools || 0})
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedProspect.shared_schools.map((school, idx) => (
                              <span 
                                key={`school-detail-${idx}`} 
                                className="bg-white border border-green-200 text-green-700 rounded-full px-2 py-1 text-xs"
                              >
                                {typeof school === 'string' ? school : school.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Past Experience */}
                {prospectProfileData && prospectProfileData.experiences && prospectProfileData.experiences.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Past Experience</h3>
                    <div className="space-y-4">
                      {prospectProfileData.experiences.map((exp, index) => (
                        <div key={exp.id || index} className="bg-gray-50 p-3 rounded-md">
                          <p className="font-medium text-gray-900">{exp.title || 'Unknown Position'}</p>
                          <p className="text-sm text-gray-600">{exp.company_name || 'Unknown Company'}</p>
                          {exp.date_range && <p className="text-xs text-gray-500">{exp.date_range}</p>}
                          {exp.duration && <p className="text-xs text-gray-500">Duration: {exp.duration}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Past Experience</h3>
                    <p className="text-sm text-gray-500">No experience data available</p>
                  </div>
                )}
                
                {/* Education */}
                {prospectProfileData && prospectProfileData.education && prospectProfileData.education.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Education</h3>
                    <div className="space-y-4">
                      {prospectProfileData.education.map((edu, index) => (
                        <div key={edu.id || index} className="bg-gray-50 p-3 rounded-md">
                          <p className="font-medium text-gray-900">{edu.school_name || 'Unknown School'}</p>
                          {edu.degree && <p className="text-sm text-gray-600">{edu.degree}</p>}
                          {edu.field_of_study && <p className="text-sm text-gray-600">{edu.field_of_study}</p>}
                          {edu.date_range && <p className="text-xs text-gray-500">{edu.date_range}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Education</h3>
                    <p className="text-sm text-gray-500">No education data available</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => setSelectedProspect(null)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {selectedProspect && <ProspectDetailDialog />}
      
      {/* Toast notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)}
          showSpinner={toast.type === "info" && isLoading}
        />
      )}
      
      <h1 className="text-2xl font-bold mb-6">🔎 Prospects Search</h1>
      
      {/* Selected profiles information */}
      <div className="mb-6 bg-white p-4 shadow rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Selected Connections: {selectedConnectionIds.length}
          </h3>
          <div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              onClick={searchProspects}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Find Prospects'}
            </button>
          </div>
        </div>

        {/* Filter form */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="text-md font-medium text-gray-800 mb-3">Search Filters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="jobTitleFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title Keywords (required)
                </label>
                <input
                  type="text"
                  id="jobTitleFilter"
                  name="jobTitleFilter"
                  value={filters.jobTitleFilter}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="CEO OR Director OR VP"
                  required
                />
              </div>
              <div>
                <label htmlFor="locationFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="locationFilter"
                  name="locationFilter" 
                  value={filters.locationFilter || ''}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="(France OR Paris)"
                />
              </div>
              <div>
                <label htmlFor="specificCompaniesFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Specific Companies
                </label>
                <input
                  type="text"
                  id="specificCompaniesFilter"
                  name="specificCompaniesFilter"
                  value={filters.specificCompaniesFilter?.join(', ') || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    specificCompaniesFilter: e.target.value ? e.target.value.split(', ').map(s => s.trim()) : []
                  }))}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Company1, Company2"
                />
              </div>
              <div>
                <label htmlFor="specificSchoolsFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Specific Schools
                </label>
                <input
                  type="text"
                  id="specificSchoolsFilter"
                  name="specificSchoolsFilter"
                  value={filters.specificSchoolsFilter?.join(', ') || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    specificSchoolsFilter: e.target.value ? e.target.value.split(', ').map(s => s.trim()) : []
                  }))}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="School1, School2"
                />
              </div>
              <div>
                <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">
                  Result Limit
                </label>
                <input
                  type="number"
                  id="limit"
                  name="limit"
                  value={filters.limit || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    limit: e.target.value ? parseInt(e.target.value) : undefined
                  }))}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="50"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="useExperience"
                    name="useExperience"
                    checked={filters.useExperience}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="useExperience" className="ml-2 text-sm text-gray-700">
                    Use Experience
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="useEducation"
                    name="useEducation"
                    checked={filters.useEducation}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="useEducation" className="ml-2 text-sm text-gray-700">
                    Use Education
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Searching for prospects and computing connections...</span>
        </div>
      )}
      
      {/* No profiles selected message */}
      {!isLoading && !error && selectedConnectionIds.length === 0 && prospects.length === 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                No connections selected. Please go to the Connections page and select profiles to find prospects.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* No prospects found message after search */}
      {!isLoading && !error && selectedConnectionIds.length > 0 && prospects.length === 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                No prospects found matching your criteria. Try adjusting your search filters or selecting different connections.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Prospects cards grouped by connection */}
      {!isLoading && prospects.length > 0 && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Identified Prospects
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {prospects.length} prospects with high connection potential
                </p>
              </div>
              <div className="flex space-x-3">
                {/* View mode toggle */}
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                      viewMode === 'cards'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Cartes
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md border-l-0 border ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Liste
                  </button>
                </div>
                
                {/* Export button */}
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exporter CSV
                </button>
              </div>
            </div>
          </div>
          <div className="p-4">
            {viewMode === 'cards' ? (
              // Vue en cartes (existante)
              Object.entries(prospectsByConnection).map(([focusProfileId, prospectsInGroup], index) => {
                const parentProfileData = parentProfileResumes[focusProfileId];
                const isParentLoading = loadingParentProfiles[focusProfileId];
                const parentError = parentProfileErrors[focusProfileId];

                return (
                  <div key={`parent-group-${focusProfileId}`} className="mb-8">
                    <div className="mb-4 border-b border-gray-200 pb-2">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                          {index + 1}
                        </div>
                        <h3 className="text-md font-medium text-gray-800">
                          Via connection:
                          <span className="ml-2 text-sm font-normal text-gray-500">({prospectsInGroup.length} prospects)</span>
                        </h3>
                      </div>
                      
                      {/* Display ConnectionProfileCard for the parent connection */}
                      {focusProfileId !== 'unknown' ? (
                        <div className="mt-3 w-full">
                          <div className="w-full">
                            <ConnectionProfileCard 
                              connectionId={focusProfileId} 
                              profileData={parentProfileData || null} 
                              isLoading={isParentLoading}
                              error={parentError}
                              prospectCount={prospectsInGroup.length}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 py-2 px-4 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-500">Unknown connection source or data not available</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Display prospects within this group */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                      {prospectsInGroup.map((prospect, prospectIndex) => (
                        <div
                          key={`prospect-${prospect.profile_id}-${prospectIndex}`} 
                          className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col"
                          style={{ height: "380px" }}  /* Hauteur fixe pour toutes les cartes */
                          onClick={() => loadProspectDetails(prospect)}
                        >
                          {/* Profile header with image */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 flex items-center">
                            <div className="h-16 w-16 flex-shrink-0">
                              {prospect.profile_image_url ? (
                                <img 
                                  src={prospect.profile_image_url} 
                                  alt={prospect.name}
                                  className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                              ) : (
                                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 flex items-center justify-center border-2 border-white shadow-sm">
                                  <span className="text-white font-medium text-xl">
                                    {prospect.name?.charAt(0) || ''}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <h4 className="text-lg font-medium text-gray-900 line-clamp-1">
                                {prospect.name}
                              </h4>
                              <p className="text-sm font-medium text-blue-600 line-clamp-1">
                                {prospect.title}
                              </p>
                            </div>
                          </div>
                          
                          {/* Profile details - using flex-grow to fill available space */}
                          <div className="p-4 flex-grow overflow-y-auto">
                            <div className="mb-2">
                              <p className="text-sm text-gray-600 font-medium">Position</p>
                              <p className="text-sm text-gray-900 line-clamp-2">{prospect.title}</p>
                            </div>
                            <div className="mb-2">
                              <p className="text-sm text-gray-600 font-medium">Location</p>
                              <p className="text-sm text-gray-900">{prospect.location}</p>
                            </div>
                            
                            {/* Similarity scores */}
                            {prospect.overall_similarity !== undefined && (
                              <div className="mb-4 mt-3 border-t border-gray-100 pt-3">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-xs text-gray-600 font-medium">Similarity Score:</p>
                                  <p className="text-xs font-bold text-blue-600">{Math.round(prospect.overall_similarity * 100)}%</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-600 h-1.5 rounded-full" 
                                    style={{ width: `${Math.round(prospect.overall_similarity * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            {/* Shared entities */}
                            {(prospect.shared_companies?.length || prospect.shared_schools?.length) && (
                              <div className="mb-3 text-xs">
                                {prospect.shared_companies && prospect.shared_companies.length > 0 && (
                                  <div className="mb-2">
                                    <p className="text-gray-600 font-medium mb-1">Shared Companies ({prospect.nbr_shared_companies}):</p>
                                    <div className="flex flex-wrap">
                                      {prospect.shared_companies.map((company, idx) => (
                                        <span 
                                          key={`company-${idx}`}
                                          className="bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-xs mb-1 mr-1"
                                        >
                                          {typeof company === 'string' ? company : company.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {prospect.shared_schools && prospect.shared_schools.length > 0 && (
                                  <div className="mb-2">
                                    <p className="text-gray-600 font-medium mb-1">Shared Schools ({prospect.nbr_shared_schools}):</p>
                                    <div className="flex flex-wrap">
                                      {prospect.shared_schools.map((school, idx) => (
                                        <span 
                                          key={`school-${idx}`}
                                          className="bg-green-50 text-green-700 rounded-full px-2 py-0.5 text-xs mb-1 mr-1"
                                        >
                                          {typeof school === 'string' ? school : school.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                            
                          {/* Actions - maintenant dans un div fixe au bas de la carte */}
                          <div className="p-4 border-t border-gray-100 mt-auto">
                            <div className="flex justify-between items-center">
                              {prospect.profile_url && (
                                <a 
                                  href={prospect.profile_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center"
                                  onClick={(e) => e.stopPropagation()} /* Empêche l'ouverture du dialog quand on clique sur le lien */
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                  </svg>
                                  Profile
                                </a>
                              )}
                              <button 
                                className="text-green-600 hover:text-green-900 text-sm font-medium flex items-center"
                                onClick={(e) => {
                                  e.stopPropagation(); // Empêche l'ouverture du dialog quand on clique sur le bouton
                                  // Logique pour les intros ici
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Intros
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Vue en liste (nouvelle)
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prospect
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Poste
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Localisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score de similarité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entreprises partagées
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Écoles partagées
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Connection via
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {prospects.map((prospect, index) => {
                      const parentProfileData = parentProfileResumes[prospect.focus_profile_id];
                      
                      return (
                        <tr 
                          key={`prospect-list-${prospect.profile_id}-${index}`} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => loadProspectDetails(prospect)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                {prospect.profile_image_url ? (
                                  <img 
                                    src={prospect.profile_image_url} 
                                    alt={prospect.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                      {prospect.name?.charAt(0) || ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{prospect.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{prospect.title || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{prospect.location || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${Math.round((prospect.overall_similarity || 0) * 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-blue-700">
                                {Math.round((prospect.overall_similarity || 0) * 100)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {prospect.nbr_shared_companies || 0}
                              {prospect.shared_companies && prospect.shared_companies.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {prospect.shared_companies.slice(0, 2).map((company, idx) => (
                                    <span key={idx} className="inline-block bg-blue-100 text-blue-800 rounded-full px-2 py-1 mr-1 mb-1">
                                      {typeof company === 'string' ? company : company.name}
                                    </span>
                                  ))}
                                  {prospect.shared_companies.length > 2 && (
                                    <span className="text-gray-400">+{prospect.shared_companies.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {prospect.nbr_shared_schools || 0}
                              {prospect.shared_schools && prospect.shared_schools.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {prospect.shared_schools.slice(0, 2).map((school, idx) => (
                                    <span key={idx} className="inline-block bg-green-100 text-green-800 rounded-full px-2 py-1 mr-1 mb-1">
                                      {typeof school === 'string' ? school : school.name}
                                    </span>
                                  ))}
                                  {prospect.shared_schools.length > 2 && (
                                    <span className="text-gray-400">+{prospect.shared_schools.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {parentProfileData?.basic_info?.full_name || prospect.focus_profile_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {prospect.profile_url && (
                                <a
                                  href={prospect.profile_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  LinkedIn
                                </a>
                              )}
                              <button
                                className="text-green-600 hover:text-green-900"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Logique pour les intros ici
                                }}
                              >
                                Intros
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProspectsPage;