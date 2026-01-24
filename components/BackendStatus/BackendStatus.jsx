import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BackendStatus.scss';

const BackendStatus = () => {
  const [status, setStatus] = useState('connecting'); // connecting, connected, error
  const [isVisible, setIsVisible] = useState(true);

  // Use environment variable for API URL (same as otpService)
  const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:8080";

  useEffect(() => {
    let intervalId;

    const checkHealth = async () => {
      try {
        // Ping the health endpoint
        await axios.get(`${BASE_URL}/health`);
        setStatus('connected');
        
        // Hide after 2 seconds of success
        setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      } catch (error) {
        console.error("Backend health check failed:", error);
        setStatus('error');
        setIsVisible(true);
      }
    };

    // Initial check
    checkHealth();

    // Optionally retry if error, but user asked for "during connection time" primarily.
    // We can retry every 3s if it fails to keep showing "connecting" or "retrying" behavior
    if (status !== 'connected') {
        // intervalId = setInterval(checkHealth, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`backend-status-bar ${status}`}>
      {status === 'connecting' && (
        <div className="status-content">
          <span className="spinner"></span>
          <span>Connecting to server...</span>
        </div>
      )}
      {status === 'connected' && (
        <div className="status-content">
          <span className="dot online"></span>
          <span>Server Connected</span>
        </div>
      )}
      {status === 'error' && (
        <div className="status-content">
          <span className="dot offline"></span>
          <span>Connecting to server...</span> {/* Keep showing connecting or error? User asked for "loading..." */}
        </div>
      )}
    </div>
  );
};

export default BackendStatus;
