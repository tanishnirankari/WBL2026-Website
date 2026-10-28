import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const DRAFT_KEY = 'wbl-team-registration-draft-v1';
const DRAFT_DATABASE = 'wbl-team-registration-files';
const DRAFT_STORE = 'files';
const TOTAL_STEPS = 16;

const emptyValues = {
  teamName: '',
  captainName: '',
  captainPhone: '',
  captainAlternatePhone: '',
  paymentMode: 'Cash',
};

function readDraft() {
  try {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (!savedDraft) return { values: emptyValues, step: 0, error: null };

    const draft = JSON.parse(savedDraft);
    return {
      values: { ...emptyValues, ...draft.values },
      step: Number.isInteger(draft.step) && draft.step >= 0 && draft.step < TOTAL_STEPS ? draft.step : 0,
      error: null,
    };
  } catch (error) {
    return {
      values: emptyValues,
      step: 0,
      error: `Your saved form details could not be loaded: ${error.message}`,
    };
  }
}

function openDraftDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('This browser does not support saving uploaded files between visits.'));
      return;
    }

    const request = window.indexedDB.open(DRAFT_DATABASE, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(DRAFT_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open saved registration files.'));
  });
}

async function runDraftTransaction(mode, operation) {
  const database = await openDraftDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DRAFT_STORE, mode);
    const request = operation(transaction.objectStore(DRAFT_STORE));
    request.onerror = () => reject(request.error || new Error('Could not save registration files.'));
    transaction.oncomplete = () => {
      database.close();
      resolve(request.result);
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('Could not save registration files.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error('Could not save registration files.'));
    };
  });
}

function readDraftFiles() {
  return runDraftTransaction('readonly', (store) => store.getAll());
}

function saveDraftFile(fieldName, file) {
  return runDraftTransaction('readwrite', (store) => store.put({
    key: fieldName,
    blob: file,
    name: file.name,
    type: file.type,
  }, fieldName));
}

function deleteDraftFile(fieldName) {
  return runDraftTransaction('readwrite', (store) => store.delete(fieldName));
}

function clearDraftFiles() {
  return runDraftTransaction('readwrite', (store) => store.clear());
}

export default function Register() {
  const initialDraft = useState(readDraft)[0];
  const [formValues, setFormValues] = useState(initialDraft.values);
  const [step, setStep] = useState(initialDraft.step);
  const [savedFiles, setSavedFiles] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(initialDraft.error);
  const [successId, setSuccessId] = useState(null);
  const [draftEnabled, setDraftEnabled] = useState(true);

  useEffect(() => {
    readDraftFiles()
      .then((files) => {
        setSavedFiles(Object.fromEntries(files.map((file) => [file.key, file])));
      })
      .catch((error) => {
        setErrorStatus(`Saved uploads could not be restored: ${error.message}`);
      });
  }, []);

  useEffect(() => {
    if (!draftEnabled) return;

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ values: formValues, step }));
    } catch (error) {
      setErrorStatus(`Your form progress could not be saved: ${error.message}`);
    }
  }, [draftEnabled, formValues, step]);

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

  const handlePhoneChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value.replace(/\D/g, '').slice(0, 10) }));
  };

  const handleValueChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = async (event) => {
    const { name, files } = event.target;
    const file = files[0];

    if (!file) {
      setSavedFiles((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
      try {
        await deleteDraftFile(name);
      } catch (error) {
        setErrorStatus(`The saved upload could not be removed: ${error.message}`);
      }
      return;
    }

    const savedFile = { key: name, blob: file, name: file.name, type: file.type };
    setSavedFiles((current) => ({ ...current, [name]: savedFile }));
    try {
      await saveDraftFile(name, file);
    } catch (error) {
      setErrorStatus(`The upload could not be saved for refresh: ${error.message}`);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (step < TOTAL_STEPS - 1) {
      setStep((current) => current + 1);
      setErrorStatus(null);
      return;
    }

    setIsLoading(true);
    setErrorStatus(null);
    setSuccessId(null);

    const formData = new FormData();
    Object.entries(formValues).forEach(([name, value]) => formData.append(name, value));
    Object.values(savedFiles).forEach((file) => {
      formData.append(file.key, file.blob, file.name);
    });

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
      setFormValues(emptyValues);
      setSavedFiles({});
      setStep(0);
      setDraftEnabled(false);

      try {
        localStorage.removeItem(DRAFT_KEY);
        await clearDraftFiles();
      } catch (error) {
        setErrorStatus(`Registration succeeded, but the saved draft could not be cleared: ${error.message}`);
      }
    } catch (error) {
      setErrorStatus(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFileInput = (name, label) => (
    <div className="field">
      <label htmlFor={name} style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>{label}</label>
      <input id={name} type="file" name={name} accept="image/*" onChange={handleFileChange} style={fileStyle} />
      {savedFiles[name] && (
        <div style={{ color: 'var(--lime)', fontSize: '12px', marginTop: '6px' }}>
          Saved for this draft: {savedFiles[name].name}
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <main className="page content-page register-page">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ color: 'var(--lime)', fontSize: '12px', letterSpacing: '4px', fontWeight: 'bold' }}>
            TOURNAMENT REGISTRATION
          </div>
          <h1 className="register-title">Register Your Team</h1>
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
          className="register-form"
          style={{ background: 'rgba(11, 32, 51, 0.9)', borderRadius: '18px', border: '1px solid var(--border)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ color: 'var(--lime)', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {step === 0 ? 'Team & Captain Details' : `Player ${step} Details`}
            </div>
            <div aria-live="polite" style={{ fontSize: '14px', opacity: 0.8 }}>
              Step {step + 1} of {TOTAL_STEPS}
            </div>
          </div>

          {step === 0 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '20px' }}>
                <div className="field">
                  <label htmlFor="teamName" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Team Name</label>
                  <input id="teamName" type="text" name="teamName" value={formValues.teamName} onChange={handleValueChange} placeholder="Enter team name" required style={inputStyle} />
                </div>
                <div className="field">
                  <label htmlFor="captainName" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Captain Name</label>
                  <input id="captainName" type="text" name="captainName" value={formValues.captainName} onChange={handleValueChange} placeholder="Enter captain name" required style={inputStyle} />
                </div>
                <div className="field">
                  <label htmlFor="captainPhone" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Captain Phone</label>
                  <input id="captainPhone" type="tel" name="captainPhone" value={formValues.captainPhone} onChange={handlePhoneChange} placeholder="Enter phone number" required maxLength={10} pattern="[0-9]{10}" inputMode="numeric" style={inputStyle} />
                </div>
                <div className="field">
                  <label htmlFor="captainAlternatePhone" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Alternative Captain Phone</label>
                  <input id="captainAlternatePhone" type="tel" name="captainAlternatePhone" value={formValues.captainAlternatePhone} onChange={handlePhoneChange} placeholder="Enter alternative phone number" maxLength={10} pattern="[0-9]{10}" inputMode="numeric" style={inputStyle} />
                </div>
                {renderFileInput('teamLogo', 'Team Logo')}
              </div>

              <div style={{ marginTop: '35px' }}>
                <div style={{ color: 'var(--lime)', marginBottom: '16px', fontWeight: 'bold', textTransform: 'uppercase' }}>Payment Mode</div>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  {['Cash', 'UPI', 'Both'].map((mode) => (
                    <label key={mode} style={radioStyle(formValues.paymentMode === mode)}>
                      <input type="radio" name="paymentMode" value={mode} checked={formValues.paymentMode === mode} onChange={handleValueChange} required />
                      {mode}
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--lime)', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>PLAYER {step}</div>
              <div className="field" style={{ marginBottom: '16px' }}>
                <label htmlFor={`player${step}Name`} style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Player Name</label>
                <input id={`player${step}Name`} type="text" name={`player${step}Name`} value={formValues[`player${step}Name`] || ''} onChange={handleValueChange} placeholder={`Enter player ${step} name`} style={inputStyle} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                {renderFileInput(`player${step}Photo`, 'Player Photo')}
              </div>
              <div className="field">
                <label htmlFor={`player${step}Phone`} style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Phone Number</label>
                <input id={`player${step}Phone`} type="tel" name={`player${step}Phone`} value={formValues[`player${step}Phone`] || ''} onChange={handlePhoneChange} placeholder="Enter phone number" maxLength={10} pattern="[0-9]{10}" inputMode="numeric" style={inputStyle} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '40px', flexWrap: 'wrap' }}>
            {step > 0 && (
              <button type="button" className="primary-button" onClick={() => setStep((current) => current - 1)} style={{ padding: '16px 30px', fontSize: '16px', border: '1px solid var(--lime)', cursor: 'pointer', background: 'transparent' }}>
                &larr; BACK
              </button>
            )}
            <button
              type="submit"
              className="primary-button"
              disabled={isLoading}
              style={{ padding: '16px 36px', fontSize: '16px', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? 'SUBMITTING...' : step === TOTAL_STEPS - 1 ? 'SUBMIT TEAM REGISTRATION \u2192' : 'DONE & CONTINUE \u2192'}
            </button>
          </div>
        </motion.form>
      </main>
    </Layout>
  );
}
