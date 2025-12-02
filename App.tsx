import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { JobForm } from './components/JobForm';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'form'>('landing');

  return (
    <>
      {currentView === 'landing' ? (
        <LandingPage onApply={() => {
          setCurrentView('form');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} />
      ) : (
        <JobForm onBack={() => {
          setCurrentView('landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} />
      )}
    </>
  );
};

export default App;