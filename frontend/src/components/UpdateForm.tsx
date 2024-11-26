import React, { useState, useEffect } from 'react';
import {TextField, Button, Switch} from '@mui/material'
import { updateStreamKey, getConfig } from '../api';

interface UpdateFormProps {
  token: string;
  user: string | null;
  onLogout: () => void;
}

const UpdateForm: React.FC<UpdateFormProps> = ({ token, user, onLogout }) => {
  const [streamKeyYouTube, setStreamKeyYouTube] = useState('');
  const [streamKeyTwitch, setStreamKeyTwitch] = useState('');
  const [streamKeyFacebook, setStreamKeyFacebook] = useState('');
  const [enableYouTube, setEnableYouTube] = useState(false);
  const [enableTwitch, setEnableTwitch] = useState(false);
  const [enableFacebook, setEnableFacebook] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if token is valid (optional, token validation can be more complex)
    if (!token) {
      onLogout();
    }
  }, [token, onLogout]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getConfig(token);
        setStreamKeyYouTube(config.streamkey_youtube);
        setStreamKeyTwitch(config.streamkey_twitch);
        setStreamKeyFacebook(config.streamkey_facebook);
        setEnableYouTube(config.enable_youtube);
        setEnableTwitch(config.enable_twitch);
        setEnableFacebook(config.enable_facebook);
      } catch (err) {
        setMessage(`Failed to load configuration.\n${err}`);
      }
    };

    fetchConfig();
  }, [token]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStreamKey(token, {
        streamkey_youtube: streamKeyYouTube,
        streamkey_twitch: streamKeyTwitch,
        streamkey_facebook: streamKeyFacebook,
        enable_youtube: enableYouTube,
        enable_twitch: enableTwitch,
        enable_facebook: enableFacebook,
      });
      setMessage('Stream keys updated successfully!');
    } catch (err) {
      setMessage(`Failed to update stream keys.\n${err}`);
    }
  };

  return (
    <div>
      <form onSubmit={handleUpdate}>
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '2rem', borderWidth: '1px',
          borderColor: 'black', borderStyle: 'solid', padding: '2rem',
        }}>
          <div>Stream keys for stream <strong>{user}</strong></div>
          <div>
            <Switch
              checked={enableYouTube}
              onChange={(e) => setEnableYouTube(e.target.checked)}
              name="enableYouTube"
              inputProps={{'aria-label': 'enable youtube'}}
            />
            <TextField
              type="text"
              value={streamKeyYouTube}
              onChange={(e) => setStreamKeyYouTube(e.target.value)}
              label="Youtube"
              variant="outlined"
            />
          </div>
          <div>
            <Switch
              checked={enableTwitch}
              onChange={(e) => setEnableTwitch(e.target.checked)}
              name="enableTwitch"
              inputProps={{'aria-label': 'enable twitch'}}
            />
            <TextField
              type="text"
              value={streamKeyTwitch}
              onChange={(e) => setStreamKeyTwitch(e.target.value)}
              label="Twitch"
              variant="outlined"
            />
          </div>
          <div>
            <Switch
              checked={enableFacebook}
              onChange={(e) => setEnableFacebook(e.target.checked)}
              name="enableFacebook"
              inputProps={{'aria-label': 'enable facebook'}}
            />
            <TextField
              type="text"
              value={streamKeyFacebook}
              onChange={(e) => setStreamKeyFacebook(e.target.value)}
              label="Facebook"
              variant="outlined"
            />
          </div>
          {/*<button type="submit">Update</button>*/}
          {/*<div style={{width: '100%'}}>*/}
            <Button style={{width: '100%'}} variant="contained" type={'submit'}>Update</Button>
          {/*</div>*/}
        </div>
      </form>
      {message && <p>{message}</p>}
      <button onClick={onLogout}>Logout</button>
    </div>
  );
};

export default UpdateForm;
