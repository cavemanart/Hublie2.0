import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 16 }}>
        Welcome to the Dashboard
      </h1>
      <p style={{ color: '#555', marginBottom: 24 }}>
        This is your hub for managing household tasks, shared goals, vent logs, and more.
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 16,
          }}
          onClick={() => navigate('/shared-goals')}
        >
          Shared Goals
        </button>

        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 16,
          }}
          onClick={() => navigate('/task-rotation')}
        >
          Task Rotation
        </button>

        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 16,
          }}
          onClick={() => navigate('/vent-log')}
        >
          Vent Log
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
