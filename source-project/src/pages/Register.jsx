import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const DRAFT_KEY = 'wbl-team-registration-draft-v1';
const SUCCESS_KEY = 'wbl-team-registration-confirmation-v1';
const DRAFT_DATABASE = 'wbl-team-registration-files';
const DRAFT_STORE = 'files';
const REVIEW_STEP = 16;
const TOTAL_STEPS = REVIEW_STEP + 1;

const emptyValues = {
  teamName: '',
  teamLocation: '',
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
    const savedStep = draft.step >= 2 ? Math.min(draft.step, REVIEW_STEP) : draft.step;
    return {
      values: { ...emptyValues, ...draft.values },
      step: Number.isInteger(draft.step) && draft.step >= 0 ? savedStep : 0,
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

function readSavedSuccess() {
  try {
    return { id: localStorage.getItem(SUCCESS_KEY), error: null };
  } catch (error) {
    return {
      id: null,
      error: `Your registration confirmation could not be loaded: ${error.message}`,
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
  const initialSuccess = useState(readSavedSuccess)[0];
  const [formValues, setFormValues] = useState(initialDraft.values);
  const [step, setStep] = useState(initialDraft.step);
  const [savedFiles, setSavedFiles] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(initialDraft.error || initialSuccess.error);
  const [successId, setSuccessId] = useState(initialSuccess.id);
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
    const maxDigits = /Age$/.test(name) ? 2 : /JerseyNumber$/.test(name) ? 3 : null;
    const nextValue = maxDigits ? value.replace(/\D/g, '').slice(0, maxDigits) : value;
    setFormValues((current) => ({ ...current, [name]: nextValue }));
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
      if (file.key === 'teamQr') return;
      if (file.key === 'player1Photo' && savedFiles.captainPhoto) return;
      const fieldName = file.key === 'player1Photo' ? 'captainPhoto' : file.key;
      formData.append(fieldName, file.blob, file.name);
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

      const cleanupErrors = [];
      try {
        localStorage.setItem(SUCCESS_KEY, String(data.registrationId));
      } catch (error) {
        cleanupErrors.push(`The confirmation could not be saved for refresh: ${error.message}`);
      }

      try {
        localStorage.removeItem(DRAFT_KEY);
        await clearDraftFiles();
      } catch (error) {
        cleanupErrors.push(`The saved draft could not be cleared: ${error.message}`);
      }
      if (cleanupErrors.length) setErrorStatus(`Registration succeeded. ${cleanupErrors.join(' ')}`);
    } catch (error) {
      setErrorStatus(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFileInput = (name, label) => (
    <div className="field">
      <label htmlFor={name} style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>{label}</label>
      <input id={name} type="file" name={name} accept="image/*" onChange={handleFileChange} required={!savedFiles[name]} style={fileStyle} />
      {savedFiles[name] && (
        <div style={{ color: 'var(--lime)', fontSize: '12px', marginTop: '6px' }}>
          Saved for this draft: {savedFiles[name].name}
        </div>
      )}
    </div>
  );

  const getSavedFileName = (name) => savedFiles[name]?.name || 'Not selected';
  const handleStartAnotherRegistration = async () => {
    try {
      localStorage.removeItem(SUCCESS_KEY);
      localStorage.removeItem(DRAFT_KEY);
      await clearDraftFiles();
      setSuccessId(null);
      setFormValues(emptyValues);
      setSavedFiles({});
      setStep(0);
      setDraftEnabled(true);
      setErrorStatus(null);
    } catch (error) {
      setErrorStatus(`A new registration could not be started: ${error.message}`);
    }
  };

  const reviewPlayers = Array.from({ length: 14 }, (_, index) => {
    const playerIndex = index + 2;
    return {
      playerIndex,
      name: formValues[`player${playerIndex}Name`] || '—',
      phone: formValues[`player${playerIndex}Phone`] || '—',
      age: formValues[`player${playerIndex}Age`] || '—',
      jerseyNumber: formValues[`player${playerIndex}JerseyNumber`] ?? '—',
      photo: getSavedFileName(`player${playerIndex}Photo`),
    };
  });

  return (
    <Layout>
      <main className="page content-page register-page">
        {successId && (
          <motion.section className="registration-confirmation" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="confirmation-icon" aria-hidden="true">✓</div>
            <div className="confirmation-eyebrow">REGISTRATION RECEIVED</div>
            <h2>Thank you for registering your team.</h2>
            <p className="confirmation-copy">Your details have been submitted successfully. Our team will review your registration and contact you if anything else is needed.</p>
            <div className="confirmation-status">
              <span className="confirmation-status-dot" />
              <span>Registration is under review</span>
            </div>
            <div className="confirmation-reference">
              <span>Confirmation ID</span>
              <strong>WBL-{successId}</strong>
            </div>
            <button type="button" className="register-another-button" onClick={handleStartAnotherRegistration}>
              REGISTER ANOTHER TEAM
            </button>
          </motion.section>
        )}

        {errorStatus && (
          <motion.div className="register-message register-error" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <strong>Error:</strong> {errorStatus}
          </motion.div>
        )}

        {!successId && <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSubmit}
          className="register-form"
        >
          <div className="register-step-header">
            <div className="register-step-name">
              {step === 0 ? 'Team Details' : step === 1 ? 'Captain Details' : step === REVIEW_STEP ? 'Review Registration' : `Player ${step} Details`}
            </div>
            <div className="register-step-count" aria-live="polite">
              Step {step + 1} of {TOTAL_STEPS}
            </div>
          </div>

          {step === 0 ? (
            <div className="register-step-fields">
                <div className="field">
                  <label htmlFor="teamName" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Team Name</label>
                  <input id="teamName" type="text" name="teamName" value={formValues.teamName} onChange={handleValueChange} placeholder="Enter team name" required style={inputStyle} />
                </div>
                <div className="field">
                  <label htmlFor="teamLocation" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Team Location</label>
                  <input id="teamLocation" type="text" name="teamLocation" value={formValues.teamLocation} onChange={handleValueChange} placeholder="Enter team location" required style={inputStyle} />
                </div>
                {renderFileInput('teamLogo', 'Team Logo')}
                <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                  <div style={{ color: 'var(--lime)', marginBottom: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Payment Mode</div>
                  <div className="register-payment-options" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {['Cash', 'UPI', 'Both'].map((mode) => (
                      <label key={mode} className="register-payment-option" style={radioStyle(formValues.paymentMode === mode)}>
                        <input type="radio" name="paymentMode" value={mode} checked={formValues.paymentMode === mode} onChange={handleValueChange} required />
                        {mode}
                      </label>
                    ))}
                  </div>
                </div>
            </div>
          ) : step === 1 ? (
            <div className="register-step-card">
              <div className="register-card-eyebrow">TEAM CAPTAIN</div>
              <div className="field" style={{ marginBottom: '16px' }}>
                <label htmlFor="captainName" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Captain Name</label>
                <input id="captainName" type="text" name="captainName" value={formValues.captainName} onChange={handleValueChange} placeholder="Enter captain name" required style={inputStyle} />
              </div>
              <div className="field" style={{ marginBottom: '16px' }}>
                <label htmlFor="captainPhone" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Captain Phone</label>
                <input id="captainPhone" type="tel" name="captainPhone" value={formValues.captainPhone} onChange={handlePhoneChange} placeholder="Enter phone number" required maxLength={10} pattern="[0-9]{10}" inputMode="numeric" style={inputStyle} />
              </div>
              <div className="field" style={{ marginBottom: '16px' }}>
                <label htmlFor="captainAlternatePhone" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Alternative Captain Phone</label>
                <input id="captainAlternatePhone" type="tel" name="captainAlternatePhone" value={formValues.captainAlternatePhone} onChange={handlePhoneChange} placeholder="Enter alternative phone number" required maxLength={10} pattern="[0-9]{10}" inputMode="numeric" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                {renderFileInput('captainPhoto', 'Captain Photo')}
              </div>
              <div className="field" style={{ marginBottom: '16px' }}>
                <label htmlFor="captainAge" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Age</label>
                <input id="captainAge" type="text" name="captainAge" value={formValues.captainAge || ''} onChange={handleValueChange} placeholder="Enter age (2 digits)" required inputMode="numeric" pattern="[0-9]{1,2}" maxLength={2} style={inputStyle} />
              </div>
              <div className="field">
                <label htmlFor="captainJerseyNumber" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Jersey Number</label>
                <input id="captainJerseyNumber" type="text" name="captainJerseyNumber" value={formValues.captainJerseyNumber || ''} onChange={handleValueChange} placeholder="Enter jersey number (up to 3 digits)" required inputMode="numeric" pattern="[0-9]{1,3}" maxLength={3} style={inputStyle} />
              </div>
            </div>
          ) : step === REVIEW_STEP ? (
            <div className="registration-review">
              <p className="review-intro">Please check your team information before submitting. Use Back to make any changes.</p>
              <section className="review-section">
                <div className="review-section-heading"><h2>Team details</h2><button type="button" onClick={() => setStep(0)}>Edit</button></div>
                <dl className="review-grid">
                  <div><dt>Team name</dt><dd>{formValues.teamName}</dd></div>
                  <div><dt>Team location</dt><dd>{formValues.teamLocation}</dd></div>
                  <div><dt>Team logo</dt><dd>{getSavedFileName('teamLogo')}</dd></div>
                  <div><dt>Payment mode</dt><dd>{formValues.paymentMode}</dd></div>
                </dl>
              </section>
              <section className="review-section">
                <div className="review-section-heading"><h2>Captain details</h2><button type="button" onClick={() => setStep(1)}>Edit</button></div>
                <dl className="review-grid">
                  <div><dt>Name</dt><dd>{formValues.captainName}</dd></div>
                  <div><dt>Phone</dt><dd>{formValues.captainPhone}</dd></div>
                  <div><dt>Alternative phone</dt><dd>{formValues.captainAlternatePhone}</dd></div>
                  <div><dt>Age</dt><dd>{formValues.captainAge}</dd></div>
                  <div><dt>Jersey number</dt><dd>{formValues.captainJerseyNumber}</dd></div>
                  <div className="review-wide"><dt>Captain photo</dt><dd>{getSavedFileName('captainPhoto')}</dd></div>
                </dl>
              </section>
              <section className="review-section">
                <div className="review-section-heading"><h2>Player roster</h2><span>14 players</span></div>
                <div className="review-player-list">
                  {reviewPlayers.map((player) => (
                    <article className="review-player" key={player.playerIndex}>
                      <span className="review-player-number">{player.playerIndex}</span>
                      <div className="review-player-info">
                        <strong>{player.name}</strong>
                        <span>{player.phone} · Age {player.age} · Jersey {player.jerseyNumber}</span>
                        <small>Photo: {player.photo}</small>
                      </div>
                      <button type="button" onClick={() => setStep(player.playerIndex)}>Edit</button>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="register-step-card">
              <div className="register-card-eyebrow">PLAYER {step}</div>
              <div className="field" style={{ marginBottom: '16px' }}>
                <label htmlFor={`player${step}Name`} style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Player Name</label>
                <input id={`player${step}Name`} type="text" name={`player${step}Name`} value={formValues[`player${step}Name`] || ''} onChange={handleValueChange} placeholder={`Enter player ${step} name`} required style={inputStyle} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                {renderFileInput(`player${step}Photo`, 'Player Photo')}
              </div>
              <div className="field">
                <label htmlFor={`player${step}Phone`} style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Phone Number</label>
                <input id={`player${step}Phone`} type="tel" name={`player${step}Phone`} value={formValues[`player${step}Phone`] || ''} onChange={handlePhoneChange} placeholder="Enter phone number" required maxLength={10} pattern="[0-9]{10}" inputMode="numeric" style={inputStyle} />
              </div>
              <div className="field" style={{ marginTop: '16px' }}>
                <label htmlFor={`player${step}Age`} style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Age</label>
                <input id={`player${step}Age`} type="text" name={`player${step}Age`} value={formValues[`player${step}Age`] || ''} onChange={handleValueChange} placeholder="Enter age (2 digits)" required inputMode="numeric" pattern="[0-9]{1,2}" maxLength={2} style={inputStyle} />
              </div>
              <div className="field" style={{ marginTop: '16px' }}>
                <label htmlFor={`player${step}JerseyNumber`} style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Jersey Number</label>
                <input id={`player${step}JerseyNumber`} type="text" name={`player${step}JerseyNumber`} value={formValues[`player${step}JerseyNumber`] || ''} onChange={handleValueChange} placeholder="Enter jersey number (up to 3 digits)" required inputMode="numeric" pattern="[0-9]{1,3}" maxLength={3} style={inputStyle} />
              </div>
            </div>
          )}

          <div className="register-actions">
            {step > 0 && (
              <button type="button" className="register-back-button" onClick={() => setStep((current) => current - 1)}>
                &larr; BACK
              </button>
            )}
            <button
              type="submit"
              className="primary-button register-continue-button"
              disabled={isLoading}
              style={{ cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? 'SUBMITTING...' : step === REVIEW_STEP ? 'CONFIRM & SUBMIT REGISTRATION \u2192' : 'CONTINUE \u2192'}
            </button>
          </div>
        </motion.form>}
      </main>
    </Layout>
  );
}
