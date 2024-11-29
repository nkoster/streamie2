import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Login from './components/Login';
import UpdateForm from './components/UpdateForm';

interface TokenPayload {
  username: string;
  exp: number;
}

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<string | null>(null);

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode<TokenPayload>(token);
      // Check if the token is expired
      if (decodedToken.exp * 1000 < Date.now()) {
        handleLogout();
        return;
      }
      setUser(decodedToken.username);
    } else {
      handleLogout();
    }
  }, [token]);

  return (
    <div>
      {token ? (
        <UpdateForm token={token} user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
