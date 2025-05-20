import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPassword, signInWithOtp, signUpWithPassword } from '../../services/supabase';

// Types pour les props du composant
interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  
  // États du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  
  // États pour gérer le chargement et les erreurs
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Effectuer l'authentification selon le mode
      if (isOtpMode) {
        // Mode OTP (connexion par email uniquement)
        const { error } = await signInWithOtp(email);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setOtpSent(true);
      } else if (isSignUpMode) {
        // Mode inscription
        const { error } = await signUpWithPassword(email, password);
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Message de confirmation pour vérifier l'email
        setOtpSent(true);
      } else {
        // Mode connexion standard
        const { error } = await signInWithPassword(email, password);
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Connexion réussie
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'authentification');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Réinitialiser le formulaire lors du changement de mode
  const resetForm = () => {
    setError(null);
    setOtpSent(false);
  };
  
  // Changer de mode d'authentification
  const toggleOtpMode = () => {
    setIsOtpMode(!isOtpMode);
    setIsSignUpMode(false);
    resetForm();
  };
  
  const toggleSignUpMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setIsOtpMode(false);
    resetForm();
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignUpMode ? 'Créer un compte' : (isOtpMode ? 'Connexion par Email' : 'Connexion')}
        </h2>
        
        {otpSent ? (
          <div className="text-center p-4 bg-green-50 rounded mb-4">
            <p className="text-green-700 mb-2 font-medium">
              Email envoyé!
            </p>
            <p className="text-sm text-gray-600">
              Veuillez vérifier votre boîte de réception et cliquer sur le lien pour {isSignUpMode ? 'activer votre compte' : 'vous connecter'}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Champ Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                placeholder="votreemail@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {/* Champ Mot de passe (uniquement si pas en mode OTP) */}
            {!isOtpMode && (
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder={isSignUpMode ? 'Choisissez un mot de passe sécurisé' : 'Votre mot de passe'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
            
            {/* Affichage des erreurs */}
            {error && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span>Chargement...</span>
              ) : (
                <span>
                  {isSignUpMode ? 'S\'inscrire' : (isOtpMode ? 'Envoyer le lien de connexion' : 'Se connecter')}
                </span>
              )}
            </button>
          </form>
        )}
        
        {/* Liens pour basculer entre les modes */}
        <div className="mt-6 text-center text-sm">
          {!otpSent && (
            <>
              <button
                onClick={toggleOtpMode}
                className="text-blue-600 hover:underline font-medium"
              >
                {isOtpMode ? 'Se connecter avec un mot de passe' : 'Se connecter sans mot de passe'}
              </button>
              
              <div className="my-2 text-gray-500">ou</div>
              
              <button
                onClick={toggleSignUpMode}
                className="text-blue-600 hover:underline font-medium"
              >
                {isSignUpMode ? 'Déjà un compte ? Se connecter' : 'Créer un nouveau compte'}
              </button>
            </>
          )}
          
          {otpSent && (
            <button
              onClick={resetForm}
              className="text-blue-600 hover:underline font-medium"
            >
              Retour au formulaire
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;