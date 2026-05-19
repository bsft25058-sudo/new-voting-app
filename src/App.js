import React, { useState } from 'react';
import Login from './components/Login';
import Voting from './components/Voting'; // or Vote.js depending on your exact filename

function App() {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (username) => {
    setUser(username);
  };

  return (
    <div className="App">
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Voting username={user} />
      )}
    </div>
  );
}

export default App;