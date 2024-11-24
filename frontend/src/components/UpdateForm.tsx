import React, { useState, useEffect } from 'react';
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
      <h3>Stream Keys {user}</h3>
      <form onSubmit={handleUpdate}>
        <div>
          <label>
            <input
              type="checkbox"
              checked={enableYouTube}
              onChange={(e) => setEnableYouTube(e.target.checked)}
            />
            YouTube
          </label>
          <input
            type="text"
            placeholder="YouTube Stream Key"
            value={streamKeyYouTube}
            onChange={(e) => setStreamKeyYouTube(e.target.value)}
          />
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={enableTwitch}
              onChange={(e) => setEnableTwitch(e.target.checked)}
            />
            Twitch
          </label>
          <input
            type="text"
            placeholder="Twitch Stream Key"
            value={streamKeyTwitch}
            onChange={(e) => setStreamKeyTwitch(e.target.value)}
          />
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={enableFacebook}
              onChange={(e) => setEnableFacebook(e.target.checked)}
            />
            Facebook
          </label>
          <input
            type="text"
            placeholder="Facebook Stream Key"
            value={streamKeyFacebook}
            onChange={(e) => setStreamKeyFacebook(e.target.value)}
          />
        </div>
        <button type="submit">Update</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={onLogout}>Logout</button>
    </div>
  );
};

export default UpdateForm;
