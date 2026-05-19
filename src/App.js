import React, { useState } from 'react';
import Login from './Login';
import Vote from './Vote';

function App() {
  const [user, setUser] = useState(""); 

  return (
    <div className="App bg-light min-vh-100 py-5">
      {!user ? (
        <Login onLoginSuccess={(username) => setUser(username)} />
      ) : (
        <Vote username={user} />
      )}
    </div>
  );
}

export default App;