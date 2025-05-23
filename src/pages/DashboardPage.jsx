import React from 'react';

const DashboardPage = () => {
  const handleClick = (name) => {
    alert(`${name} clicked`);
  };

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
          onClick={() => handleClick('Shared Goals')}
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
          onClick={() => handleClick('Task Rotation')}
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
          onClick={() => handleClick('Vent Log')}
        >
          Vent Log
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
