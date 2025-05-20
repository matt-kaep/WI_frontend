import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Rediriger vers le dashboard
  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 bg-blue-600">
            <div className="h-full flex items-center justify-center p-12">
              <div className="text-center">
                <svg 
                  className="mx-auto h-24 w-24 text-white opacity-75" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12a5 5 0 110-10 5 5 0 010 10zm0 2a8 8 0 00-8 8 1 1 0 001 1h14a1 1 0 001-1 8 8 0 00-8-8zm9-12a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V2z" />
                </svg>
                <h2 className="mt-4 text-xl text-white font-bold">TamTam Warm Intros</h2>
                <p className="mt-1 text-blue-100">
                  Trouvez les meilleures connections dans votre réseau
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-8 md:w-1/2">
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-800">
                {user ? `Bienvenue !` : 'Bienvenue!'}
              </h1>
              
              <p className="mt-4 text-gray-600">
                Découvrez les connexions pertinentes dans votre réseau LinkedIn et identifiez 
                les meilleurs prospects grâce à l'analyse de vos contacts.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Importez vos connexions LinkedIn</p>
                </div>
                
                <div className="flex items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Analysez votre réseau professionnel</p>
                </div>
                
                <div className="flex items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Identifiez les meilleurs prospects</p>
                </div>
              </div>
              
              <button
                onClick={goToDashboard}
                className="mt-8 w-full md:w-auto rounded-lg px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
              >
                <div className="flex items-center justify-center">
                  <span>Commencer maintenant</span>
                  <svg className="ml-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-center text-gray-500 text-sm">
        Pour démarrer, cliquez sur le bouton ci-dessus pour accéder au dashboard et importer vos connexions LinkedIn.
      </p>
    </div>
  );
};

export default WelcomePage;