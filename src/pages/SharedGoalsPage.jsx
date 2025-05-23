import React, { useState, useEffect } from 'react';

const SharedGoalsPage = () => {
  const [goals, setGoals] = useState([]);

  // Example: fetch goals from an API or Supabase (replace with real fetch)
  useEffect(() => {
    // Simulate fetching shared goals
    const fetchGoals = async () => {
      // Replace this with your actual data fetching logic
      const exampleGoals = [
        { id: 1, title: 'Reduce monthly expenses', completed: false },
        { id: 2, title: 'Plan family vacation', completed: true },
        { id: 3, title: 'Save for a new car', completed: false },
      ];
      setGoals(exampleGoals);
    };

    fetchGoals();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Shared Goals</h1>
      {goals.length === 0 ? (
        <p>No shared goals yet. Add some goals to get started!</p>
      ) : (
        <ul>
          {goals.map((goal) => (
            <li key={goal.id} style={{ marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={goal.completed}
                readOnly
                style={{ marginRight: '0.5rem' }}
              />
              {goal.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SharedGoalsPage;
