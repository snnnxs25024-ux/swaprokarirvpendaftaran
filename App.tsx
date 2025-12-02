
import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { JobForm } from './components/JobForm';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

type ViewState = 'landing' | 'form' | 'login' | 'dashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleApply = () => {
    setCurrentView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminClick = () => {
    setCurrentView('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentView('landing');
  };

  return (
    <>
      {currentView === 'landing' && (
        <LandingPage 
          onApply={handleApply} 
          onAdminClick={handleAdminClick} 
        />
      )}
      
      {currentView === 'form' && (
        <JobForm onBack={handleBackToLanding} />
      )}

      {currentView === 'login' && (
        <Login 
          onLogin={handleLoginSuccess} 
          onBack={handleBackToLanding} 
        />
      )}

      {currentView === 'dashboard' && isAdmin && (
        <Dashboard onLogout={handleLogout} />
      )}

      {/* Safety fallback if dashboard is accessed without admin rights */}
      {currentView === 'dashboard' && !isAdmin && (
        <Login 
          onLogin={handleLoginSuccess} 
          onBack={handleBackToLanding} 
        />
      )}
    </>
  );
};

export default App;
