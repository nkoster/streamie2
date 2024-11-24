import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import UpdateForm from './components/UpdateForm';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    if (!token) {
      handleLogout();
    }
  }, [token]);

  return (
    <div>
      {token ? (
        <UpdateForm token={token} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
