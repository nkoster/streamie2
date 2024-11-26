import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { login } from '../api';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await login(username, password);
      onLogin(token);
    } catch (err) {
      setError(`Invalid username or password\n${err}`);
    }
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%'}}>
      <form onSubmit={handleLogin}>
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
          <div>
            <TextField
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              label="stream"
              variant="standard"
              required
            />
          </div>
          <div>
            <TextField
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="password"
              variant="standard"
              required
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <Button variant="outlined" type={'submit'}>login</Button>
        </div>
      </form>
    </div>
  );
};

export default Login;
