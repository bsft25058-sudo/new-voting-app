import React, { useState } from 'react';
import Login from './Login';
import Vote from './Vote';

function App() {
  const [user, setUser] = useState(""); // Stores logged-in username

  return (
    <div className="App">
      {!user ? (
        <Login onLoginSuccess={(username) => setUser(username)} />
      ) : (
        <Vote username={user} />
      )}
    </div>
  );
}

export default App;