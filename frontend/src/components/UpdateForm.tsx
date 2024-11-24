import React, { useState, useEffect } from 'react';
import { updateStreamKey } from '../api';

interface UpdateFormProps {
  token: string;
  onLogout: () => void;
}

const UpdateForm: React.FC<UpdateFormProps> = ({ token, onLogout }) => {
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
      <h1>Update Stream Keys</h1>
      <form onSubmit={handleUpdate}>
        <div>
          <label>
            <input
              type="checkbox"
              checked={enableYouTube}
              onChange={(e) => setEnableYouTube(e.target.checked)}
            />
            Enable YouTube
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
            Enable Twitch
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
            Enable Facebook
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
