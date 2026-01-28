import React, { useState } from 'react';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { SimulationView } from './components/SimulationView';
import { HeroSection } from './components/ui/hero-section-dark';

type AppView = 'HOME' | 'LOGIN' | 'DASHBOARD' | 'SIMULATION';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('HOME');

  const handleStart = () => {
    setCurrentView('LOGIN');
  };

  const handleLogin = () => {
    setCurrentView('DASHBOARD');
  };

  const handleLaunch = () => {
    setCurrentView('SIMULATION');
  };

  const handleExitSimulation = () => {
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    setCurrentView('HOME');
  };

  return (
    <div className="w-screen h-screen bg-black text-white overflow-hidden font-sans">

      {/* View Switcher */}

      {currentView === 'HOME' && (
        <HeroSection
          title="Viveka Vara"
          subtitle={{
            regular: "A generative reality that ",
            gradient: "responds to how you feel.",
          }}
          description="Enter a reactive 2D environment. Analyze your voice, text, and facial expressions to shift the atmosphere, weather, and world around you."
          ctaText="Initialize System"
          onCtaClick={handleStart}
          gridOptions={{
            angle: 65,
            opacity: 0.2,
            cellSize: 40,
            lightLineColor: "#4a4a4a",
            darkLineColor: "#334155",
          }}
        />
      )}

      {currentView === 'LOGIN' && (
        <LoginView onLogin={handleLogin} />
      )}

      {currentView === 'DASHBOARD' && (
        <DashboardView onLaunch={handleLaunch} onLogout={handleLogout} />
      )}

      {currentView === 'SIMULATION' && (
        <SimulationView onExit={handleExitSimulation} />
      )}

    </div>
  );
};

export default App;
