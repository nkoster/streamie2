import { useState } from 'react'
import './App.css'
import Login from './components/Login';
import UpdateForm from './components/UpdateForm';

function App() {
  const [token, setToken] = useState<string | null>(null);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <div>
      {token ? (
        <UpdateForm token={token} onLogout={handleLogout}/>
      ) : (
        <Login onLogin={handleLogin}/>
      )}
    </div>
  )
}

export default App;
