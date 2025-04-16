import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminHome2.css'; // import the CSS file

function AdminHome() {
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [rounds, setRounds] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    axios.get('http://localhost:4000/get-clients')
      .then(response => {
        console.log(response)
        setClients(response.data);
      })
      .catch(error => {
        console.error("Error fetching clients:", error);
        setMessage({ text: "Failed to fetch clients", type: 'error' });
      });
  }, []);

  const handleCheckboxChange = (clientId) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleStartTraining = () => {
    if (selectedClients.length < 2) {
      setMessage({ text: "Please select at least 2 clients", type: 'error' });
      return;
    }
  
    if (rounds <= 0) {
      setMessage({ text: "Please enter a valid number of training rounds", type: 'error' });
      return;
    }
  
    setLoading(true);
    setMessage({ text: '', type: '' });
  
    axios.post('/api/start-training', {
      clients: selectedClients,
      rounds: rounds,
    })
      .then(response => {
        setMessage({ text: "Training started successfully!", type: 'success' });
      })
      .catch(error => {
        console.error("Error starting training:", error);
        setMessage({ text: "Failed to start training", type: 'error' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="admin-container">
      <h2>Admin Panel</h2>

      <div className="section">
        <label className="label">Select Clients</label>
        <div className="checkbox-group">
          {clients.map(client => (
            <div key={client.id} className="checkbox-item">
              <input
                type="checkbox"
                id={`client-${client.id}`}
                onChange={() => handleCheckboxChange(client.id)}
                checked={selectedClients.includes(client.id)}
              />
              <label htmlFor={`client-${client.id}`}>{client.name}</label>
            </div>
          ))}
        </div>
        <div className="helper-text">
          {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''} selected
        </div>
      </div>

      <div className="section">
        <label className="label" htmlFor="rounds">Training Rounds</label>
        <input
          id="rounds"
          type="number"
          min="1"
          value={rounds}
          onChange={e => setRounds(Number(e.target.value))}
          className="input"
          placeholder="Enter number of rounds"
        />
      </div>

      <button
        onClick={handleStartTraining}
        disabled={loading || selectedClients.length < 2}
        className="button"
      >
        {loading ? (
          <span className="button-content">
            <svg className="spinner" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
            </svg>
            Starting Training...
          </span>
        ) : (
          "Start Training"
        )}
      </button>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'error' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="message-icon">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="message-icon">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}
          {message.text}
        </div>
      )}
    </div>
  );
}

export default AdminHome;
