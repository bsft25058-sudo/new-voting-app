import React, { useState } from 'react';
import React, { useState } from 'react';
import Login from './Login';   // Cleaned path: removed /components/
import Vote from './Vote';    // Cleaned path: removed /components/
import Result from './Result';// Cleaned path: removed /components/
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  // Global user state tracking
  const [user, setUser] = useState(null);
  // View switcher state: 'login' | 'voting' | 'results'
  const [currentView, setCurrentView] = useState('login');

  // Triggered upon successful login or registration verification
  const handleLoginSuccess = (username) => {
    setUser(username);
    setCurrentView('voting');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Top Navigation Header Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold text-uppercase tracking-wider">
            🗳️ Secure Voting Portal
          </span>
          <div className="d-flex gap-2">
            <button 
              className={`btn btn-sm ${currentView === 'results' ? 'btn-primary' : 'btn-outline-light'}`}
              onClick={() => setCurrentView('results')}
            >
              📊 Live Results
            </button>
            {user ? (
              <div className="d-flex align-items-center gap-3 ms-2">
                <span className="text-light btn btn-sm btn-outline-secondary disabled border-secondary">
                  👤 {user}
                </span>
                <button className="btn btn-sm btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              currentView !== 'login' && (
                <button className="btn btn-sm btn-success" onClick={() => setCurrentView('login')}>
                  Login / Register
                </button>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Main Container View Router Segment */}
      <main className="container py-4">
        {currentView === 'login' && (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
        
        {currentView === 'voting' && user && (
          <Vote username={user} />
        )}
        
        {currentView === 'results' && (
          <Result />
        )}
      </main>
    </div>
  );
}

export default App;