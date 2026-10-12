import React, { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

export default function Register() {
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)', color: 'white'
  };
  const fileStyle = {
    width: '100%', padding: '10px', border: '1px dashed rgba(156,255,0,0.6)',
    borderRadius: '8px', background: 'rgba(156,255,0,0.03)', color: 'white'
  };
  const radioStyle = (selected) => ({
    flex: 1, padding: '12px', display: 'flex', alignItems: 'center', gap: '8px',
    border: `1px solid ${selected ? 'var(--lime)' : 'var(--border)'}`,
    borderRadius: '8px', background: selected ? 'rgba(156,255,0,0.08)' : 'transparent', cursor: 'pointer'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorStatus(null);
    setSuccessId(null);

    const formData = new FormData(e.target);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiUrl}/registrations`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server responded with an error');
      }

      setSuccessId(data.registrationId);
      e.target.reset();
      setPaymentMode('Cash');
    } catch (err) {
      setErrorStatus(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <main className="page" style={{ paddingTop: '120px', paddingBottom: '80px', maxWidth: '1000px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ color: 'var(--lime)', fontSize: '12px', letterSpacing: '4px', fontWeight: 'bold' }}>
            TOURNAMENT REGISTRATION
          </div>
          <h1 style={{ fontSize: '42px', marginTop: '10px', textTransform: 'uppercase' }}>Register Your Team</h1>
        </div>

        {successId && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(156, 255, 0, 0.1)', border: '1px solid var(--lime)', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--lime)', margin: '0 0 10px 0' }}>Registration Successful!</h2>
            <p>Your team has been securely registered in the system (Confirmation ID: {successId}). We will contact you soon for further details.</p>
          </motion.div>
        )}

        {errorStatus && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(255, 107, 107, 0.1)', border: '1px solid #ff6b6b', padding: '15px', borderRadius: '12px', textAlign: 'center', marginBottom: '30px', color: '#ff6b6b' }}>
            <strong>Error:</strong> {errorStatus}
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSubmit}
          style={{ background: 'rgba(11, 32, 51, 0.9)', padding: '35px', borderRadius: '18px', border: '1px solid var(--border)' }}
        >
          <div style={{ color: 'var(--lime)', marginBottom: '16px', fontWeight: 'bold', textTransform: 'uppercase' }}>Team Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="field">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Team Name</label>
              <input type="text" name="teamName" placeholder="Enter team name" required style={inputStyle} />
            </div>
            <div className="field">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Captain Name</label>
              <input type="text" name="captainName" placeholder="Enter captain name" required style={inputStyle} />
            </div>
            <div className="field">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Captain Phone</label>
              <input type="tel" name="captainPhone" placeholder="Enter phone number" required style={inputStyle} />
            </div>
            <div className="field">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Team Logo</label>
              <input type="file" name="teamLogo" accept="image/*" style={fileStyle} />
            </div>
          </div>

          <div style={{ marginTop: '35px' }}>
            <div style={{ color: 'var(--lime)', marginBottom: '16px', fontWeight: 'bold', textTransform: 'uppercase' }}>Payment Mode</div>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {['Cash', 'UPI', 'Both'].map((mode) => (
                <label key={mode} style={radioStyle(paymentMode === mode)}>
                  <input type="radio" name="paymentMode" value={mode} checked={paymentMode === mode} onChange={(e) => setPaymentMode(e.target.value)} />
                  {mode}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '45px' }}>
            <div style={{ color: 'var(--lime)', marginBottom: '16px', fontWeight: 'bold', textTransform: 'uppercase' }}>Player List (15 Players)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--lime)', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>PLAYER {i + 1}</div>
                  <input type="text" name={`player${i + 1}Name`} placeholder={`Player ${i + 1} Name`} style={{ ...inputStyle, marginBottom: '10px' }} />
                  <input type="file" name={`player${i + 1}Photo`} accept="image/*" style={{ ...fileStyle, marginBottom: '10px' }} />
                  <input type="tel" name={`player${i + 1}Phone`} placeholder="Phone Number" style={inputStyle} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <button
              type="submit"
              className="primary-button"
              disabled={isLoading}
              style={{ padding: '16px 36px', fontSize: '16px', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? 'SUBMITTING...' : 'SUBMIT TEAM REGISTRATION \u2192'}
            </button>
          </div>
        </motion.form>
      </main>
    </Layout>
  );
}
