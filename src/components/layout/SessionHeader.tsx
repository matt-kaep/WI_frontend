import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSession } from '../../contexts/SessionContext';
import SessionSelector from '../session/SessionSelector';

const SessionHeader: React.FC = () => {
  const { user, signOut } = useAuth();
  const { currentSession } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  
  // État pour gérer l'affichage du sélecteur de session
  const [isSessionSelectorOpen, setIsSessionSelectorOpen] = useState(false);
  const sessionSelectorRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sessionSelectorRef.current && !sessionSelectorRef.current.contains(event.target as Node)) {
        setIsSessionSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Détermine si un lien est actif
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo et titre */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <svg 
                className="h-8 w-8 text-blue-600" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 12a5 5 0 110-10 5 5 0 010 10zm0 2a8 8 0 00-8 8a1 1 0 001 1h14a1 1 0 001-1 8 8 0 00-8-8zm9-12a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V2z" />
              </svg>
              <span className="ml-2 text-lg font-semibold text-gray-900">TamTam Warm Intros</span>
            </Link>
          </div>
          
          {/* Navigation principale */}
          <nav className="flex-1 flex items-center justify-center px-2 lg:px-0">
            <div className="hidden md:block">
              <div className="flex space-x-4">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/dashboard')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/connections"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/connections')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Connexions
                </Link>
                <Link
                  to="/prospects"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/prospects')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Prospects
                </Link>
              </div>
            </div>
          </nav>
          
          {/* Session Selector et Menu utilisateur */}
          <div className="ml-4 flex items-center space-x-4">
            {/* Session Selector */}
            <div className="relative" ref={sessionSelectorRef}>
              <button
                onClick={() => setIsSessionSelectorOpen(!isSessionSelectorOpen)}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="mr-2">
                  {currentSession ? currentSession.name : 'Aucune session'}
                </span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Utilisation du composant SessionSelector */}
              {isSessionSelectorOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="p-4">
                    <SessionSelector onClose={() => setIsSessionSelectorOpen(false)} />
                  </div>
                </div>
              )}
            </div>
            
            {/* Menu utilisateur */}
            <div className="relative">
              <div className="flex items-center">
                <div className="relative">
                  <button 
                    type="button" 
                    className="bg-gray-800 rounded-full flex text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
                    aria-expanded="false" 
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    {/* Utiliser les initiales de l'utilisateur comme avatar par défaut */}
                    <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </button>
                </div>
                <div className="ml-2 hidden md:block">
                  <div className="text-sm font-medium text-gray-800">
                    {user?.email?.split('@')[0] || 'Utilisateur'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-500 hover:text-red-500"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation mobile */}
      <div className="sm:hidden">
        <div className="flex justify-around px-2 pt-2 pb-3 space-x-1">
          <Link
            to="/dashboard"
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium text-center ${
              isActive('/dashboard')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/connections"
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium text-center ${
              isActive('/connections')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            Connexions
          </Link>
          <Link
            to="/prospects"
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium text-center ${
              isActive('/prospects')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            Prospects
          </Link>
        </div>
      </div>
    </header>
  );
};

export default SessionHeader;