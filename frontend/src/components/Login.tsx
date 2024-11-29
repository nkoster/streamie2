import React, { useState } from 'react';
import {TextField, Button, Snackbar} from '@mui/material'
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Invalid stream and/or password!');
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
          {/*{error && <p style={{ color: 'red' }}>{error}</p>}*/}
          <Button disabled={username.length < 6 && password.length < 6} variant="outlined" type={'submit'}>login</Button>
        </div>
      </form>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        message={error}
      />
    </div>
  );
};

export default Login;
