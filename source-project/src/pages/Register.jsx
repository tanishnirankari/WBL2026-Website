import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const DRAFT_KEY = 'wbl-team-registration-draft-v1';
const SUCCESS_KEY = 'wbl-team-registration-confirmation-v1';
const DRAFT_DATABASE = 'wbl-team-registration-files';
const REVIEW_STEP = 16;
const TOTAL_STEPS = REVIEW_STEP + 1;
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

async function getRegistrationStatus() {
  const response = await fetch(`${apiUrl}/registrations/status`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Could not check registration availability.');
  return result;
}

const emptyValues = {
  teamName: '',
  teamLocation: '',
  captainName: '',
  captainPhone: '',
  captainAlternatePhone: '',
  paymentMode: 'Cash',
};

function getImageFile(file) {
  if (!file) return null;

  const imageTypesByExtension = {
    avif: 'image/avif',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  const extension = file.name?.split('.').pop()?.toLowerCase();
  const type = file.type?.startsWith('image/')
    ? file.type
    : imageTypesByExtension[extension];

  if (!type?.startsWith('image/')) return null;
  return file.type === type ? file : new File([file], file.name, { type });
}

export default function Register() {
  const [formValues, setFormValues] = useState(emptyValues);
  const [step, setStep] = useState(0);
  const [savedFiles, setSavedFiles] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState({ loading: true, open: false, error: '' });

  useEffect(() => {
    let active = true;
    getRegistrationStatus()
      .then((result) => {
        if (active) setRegistrationStatus({ loading: false, open: result.open === true, error: '' });
      })
      .catch((error) => {
        if (active) setRegistrationStatus({ loading: false, open: false, error: error.message || 'Could not check registration availability.' });
      });
    return () => { active = false; };
  }, []);

  const refreshRegistrationStatus = () => {
    setRegistrationStatus({ loading: true, open: false, error: '' });
    getRegistrationStatus()
      .then((result) => setRegistrationStatus({ loading: false, open: result.open === true, error: '' }))
      .catch((error) => setRegistrationStatus({ loading: false, open: false, error: error.message || 'Could not check registration availability.' }));
  };

  useEffect(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(SUCCESS_KEY);
    } catch (error) {
      setErrorStatus(`Previous saved registration data could not be cleared: ${error.message}`);
    }

    if (!window.indexedDB) return;

    const request = window.indexedDB.deleteDatabase(DRAFT_DATABASE);
    request.onerror = () => {
      setErrorStatus(`Previous saved photos could not be cleared: ${request.error?.message || 'Storage error.'}`);
    };
    request.onblocked = () => {
      setErrorStatus('Close other registration tabs to clear previously saved photos.');
    };
  }, []);

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

  const handleFileChange = (event) => {
    const input = event.currentTarget;
    const { name, files } = input;
    const file = files?.[0];
    input.value = '';

    if (!file) return;

    const imageFile = getImageFile(file);
    if (!imageFile || imageFile.size === 0 || imageFile.size > 5 * 1024 * 1024) {
      setErrorStatus(imageFile
        ? 'This image is larger than 5 MB. Choose a smaller image.'
        : 'Choose a JPG, PNG, WEBP, GIF, AVIF, or HEIC image.');
      return;
    }

    setSavedFiles((current) => ({ ...current, [name]: imageFile }));
    setErrorStatus(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!registrationStatus.open) return;

    if (step < TOTAL_STEPS - 1) {
      setStep((current) => current + 1);
      setErrorStatus(null);
      return;
    }

    setIsLoading(true);
    setErrorStatus(null);
    const formData = new FormData();
    Object.entries(formValues).forEach(([name, value]) => formData.append(name, value));
    const requiredFiles = [
      'teamLogo',
      'captainPhoto',
      ...Array.from({ length: 14 }, (_, index) => `player${index + 2}Photo`),
    ];
    const uploadFiles = requiredFiles.map((fieldName) => ({
      fieldName,
      file: savedFiles[fieldName] || (fieldName === 'captainPhoto' ? savedFiles.player1Photo : null),
    }));
    const missingFile = uploadFiles.find(({ file }) => (
      !file || file.size === 0 || !file.type.startsWith('image/')
    ));
    if (missingFile) {
      setErrorStatus(`Please upload a valid image for ${missingFile.fieldName.replace(/([A-Z])/g, ' $1')}.`);
      setIsLoading(false);
      return;
    }
    uploadFiles.forEach(({ fieldName, file }) => {
      formData.append(fieldName, file, file.name);
    });

    try {
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
    } catch (error) {
      setErrorStatus(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFileInput = (name, label) => (
    <div className="field">
      <label htmlFor={name} style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>{label}</label>
      <input id={name} type="file" name={name} accept="image/*,.heic,.heif" onChange={handleFileChange} required={!savedFiles[name]} style={fileStyle} />
      {savedFiles[name] && (
        <div style={{ color: 'var(--lime)', fontSize: '12px', marginTop: '6px' }}>
          Selected photo (choose another to replace it): {savedFiles[name].name}
        </div>
      )}
    </div>
  );

  const getSavedFileName = (name) => savedFiles[name]?.name || 'Not selected';
  const handleStartAnotherRegistration = () => {
    setSuccessId(null);
    setFormValues(emptyValues);
    setSavedFiles({});
    setStep(0);
    setErrorStatus(null);
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
        {registrationStatus.loading && (
          <section className="registration-closed" role="status" aria-live="polite">
            <p>Checking registration availability…</p>
          </section>
        )}

        {!registrationStatus.loading && !registrationStatus.open && (
          <motion.section className="registration-closed" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="confirmation-eyebrow">{registrationStatus.error ? 'REGISTRATION STATUS' : 'TEAM REGISTRATION'}</div>
            <h1>{registrationStatus.error ? 'Registration status unavailable' : 'Registration starts soon'}</h1>
            <p>{registrationStatus.error || 'Stay tuned'}</p>
            {registrationStatus.error && <button type="button" className="register-another-button" onClick={refreshRegistrationStatus}>Try again</button>}
          </motion.section>
        )}

        {!registrationStatus.loading && registrationStatus.open && <>
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
        </>}
      </main>
    </Layout>
  );
}
