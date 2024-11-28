import React, { useState, useEffect } from 'react';
import {TextField, Button, Switch, Snackbar, Tooltip, styled, TooltipProps, tooltipClasses} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
  const [changed, setChanged] = useState(false);
  const [message, setMessage] = useState('');
  const [width, setWidth] = useState(window.innerWidth > 600 ? '22rem' : '15rem');

  useEffect(() => {
    // Check if token is valid
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

    fetchConfig().catch(err => {
      setMessage(`Failed to load configuration.\n${err}`);
    });
  }, [token]);

  useEffect(() => {
    // change width based on window size
    window.addEventListener('resize', () => {
      if (window.innerWidth > 600) {
        setWidth('22rem');
      } else {
        setWidth('15rem');
      }
    });
    return () => {
      window.removeEventListener('resize', () => {});
    };
  }, [])

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
      setChanged(false);
    } catch (err) {
      setMessage(`Failed to update stream keys.\n${err}`);
    }
  };

  const handleCopyToClipboard = () => {
    const streamKey = `rtmp://streamie.w3b.net/${user}`;
    navigator.clipboard.writeText(streamKey)
      .then(() => {
        setMessage('Stream RTMP URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy to clipboard:', err);
      });
  };

  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#3f50b5',
      color: 'white',
      maxWidth: 320,
      fontSize: theme.typography.pxToRem(18),
      paddingLeft: '1rem', paddingRight: '1rem',
      boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)'
    },
  }));

  return (
    <div>
      <form onSubmit={handleUpdate}>
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '2rem',
        }}>
          <Button style={{width: '100%'}} onClick={onLogout} variant="outlined">Logout</Button>
          <div style={{fontSize: '1rem', cursor: 'default'}}>Stream keys for stream&nbsp;
            <HtmlTooltip title={
              <span onClick={handleCopyToClipboard} style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <span style={{fontWeight: 'bold'}}>rtmp://streamie.w3b.net/{user}</span>
                <small style={{textAlign: 'right'}}>copy to clipboard</small>
              </span>
            }
            >
              <span onClick={handleCopyToClipboard}><strong>{user}</strong> <ContentCopyIcon
                sx={{fontSize: 14}}/></span>
            </HtmlTooltip>
          </div>
          <div>
            <Switch
              checked={enableYouTube}
              onChange={(e) => {
                setEnableYouTube(e.target.checked)
                setChanged(true)
              }}
              name="enableYouTube"
              inputProps={{'aria-label': 'enable youtube'}}
            />
            <TextField
              type="text"
              value={streamKeyYouTube}
              onChange={(e) => {
                setStreamKeyYouTube(e.target.value)
                setChanged(true)
              }}
              label="YOUTUBE"
              variant="outlined"
              style={{width}}
            />
          </div>
          <div>
            <Switch
              checked={enableFacebook}
              onChange={(e) => {
                setEnableFacebook(e.target.checked)
                setChanged(true)
              }}
              name="enableFacebook"
              inputProps={{'aria-label': 'enable facebook'}}
            />
            <TextField
              type="text"
              value={streamKeyFacebook}
              onChange={(e) => {
                setStreamKeyFacebook(e.target.value)
                setChanged(true)
              }}
              label="FACEBOOK"
              variant="outlined"
              slotProps={{
                input: {
                  spellCheck: false
                },
              }}
              style={{width}}
            />
          </div>
          <div>
            <Switch
              checked={enableTwitch}
              onChange={(e) => {
                setEnableTwitch(e.target.checked)
                setChanged(true)
              }}
              name="enableTwitch"
              inputProps={{'aria-label': 'enable twitch'}}
            />
            <TextField
              type="text"
              value={streamKeyTwitch}
              onChange={(e) => {
                setStreamKeyTwitch(e.target.value)
                setChanged(true)
              }}
              label="TWITCH"
              variant="outlined"
              style={{width}}
            />
          </div>
          <div>
            <Switch
              checked={enableFacebook}
              onChange={(e) => {
                setEnableFacebook(e.target.checked)
                setChanged(true)
              }}
              name="enableFacebook"
              inputProps={{'aria-label': 'enable facebook'}}
            />
            <TextField
              type="text"
              value={streamKeyFacebook}
              onChange={(e) => {
                setStreamKeyFacebook(e.target.value)
                setChanged(true)
              }}
              label="Facebook"
              variant="outlined"
              style={{width}}
            />
          </div>
          <Button
            style={{width: '100%', marginTop: '1.2rem'}}
            variant="contained"
            type={'submit'}
            disabled={!changed}
          >Update</Button>
        </div>
      </form>
      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={() => {
          setMessage('');
        }}
        message={message}
      />
    </div>
  );
};

export default UpdateForm;
