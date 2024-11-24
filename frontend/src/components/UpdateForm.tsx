import React, { useState } from 'react';
import { updateStreamKey } from '../api';

interface UpdateFormProps {
  token: string;
  onLogout: () => void;
}

const UpdateForm: React.FC<UpdateFormProps> = ({ token, onLogout }) => {
  const [streamKey, setStreamKey] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStreamKey(token, streamKey);
      setMessage('Stream key updated successfully!');
    } catch (err) {
      setMessage(`Failed to update stream key.\n${err}`);
    }
  };

  return (
    <div>
      <h1>Update Stream Key</h1>
      <form onSubmit={handleUpdate}>
        <div>
          <label>Stream Key:</label>
          <input
            type="text"
            value={streamKey}
            onChange={(e) => setStreamKey(e.target.value)}
            required
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
