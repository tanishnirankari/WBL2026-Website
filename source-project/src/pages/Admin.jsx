import { useEffect, useState } from 'react';
import {
  ArrowLeft, CheckCircle2, Eye, EyeOff, Gavel, Image, LockKeyhole, Phone,
  LogOut, Printer, RefreshCw, Search, ShieldCheck, Upload, UserRound, Users,
  Check, XCircle, ToggleLeft, ToggleRight, DollarSign, Tag, CheckSquare, Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminPortalLogo from '../components/AdminPortalLogo';

const api = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const tabs = [
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'players', label: 'Players', icon: UserRound },
  { id: 'auction', label: 'Auction', icon: Gavel },
  { id: 'gallery', label: 'Gallery', icon: Image },
];

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

const formatDate = (value) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not recorded'
    : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const formatBasePrice = (value) => {
  const amount = Number(String(value || '').replace(/[^\d.]/g, ''));
  return `${Number.isFinite(amount) ? amount.toLocaleString('en-IN') : '—'} T`;
};

const formatStatusLabel = (status) => {
  const value = String(status || 'PENDING').trim();
  if (value.toUpperCase().startsWith('PENDING')) return 'Pending';
  return value.toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
};

const statusTone = (status) => {
  const value = String(status || 'PENDING').toLowerCase();
  return value.startsWith('pending') ? 'pending' : value.replace(/\s+/g, '-');
};

function AdminPanel({ children, className = '' }) {
  return <section className={`admin-panel ${className}`}>{children}</section>;
}

function AuctionNominations({ password }) {
  const [players, setPlayers] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [photoData, setPhotoData] = useState('');
  const headers = { 'x-admin-password': password, 'Content-Type': 'application/json' };
  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(api + '/admin/dashboard', { headers });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load player nominations.');
      setPlayers(result.auctionPlayers || []);
      setLoadError('');
      setMessage('');
    } catch (error) { setLoadError(error.message || 'Could not load player nominations.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [password]);
  const review = async (player, status) => {
    setBusyId(player.id);
    try {
      const response = await fetch(api + '/admin/auction/registrations/' + player.id + '/review', { method: 'PATCH', headers, body: JSON.stringify({ status }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update player status.');
      setPlayers((current) => current.map((item) => item.id === player.id ? { ...item, status: result.status } : item));
      setMessage(player.fullName + ' is now ' + result.status.toLowerCase() + '.');
    } catch (error) { setMessage(error.message); }
    finally { setBusyId(null); }
  };
  const removeNomination = async (player) => {
    if (!window.confirm(`Delete ${player.fullName}'s player nomination? This cannot be undone.`)) return;
    setBusyId(player.id);
    try {
      const response = await fetch(`${api}/admin/auction/registrations/${player.id}`, { method: 'DELETE', headers });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not delete player nomination.');
      setPlayers((current) => current.filter((item) => item.id !== player.id));
      if (editingId === player.id) { setEditingId(null); setDraft(null); setPhotoData(''); }
      setMessage(`${player.fullName}'s nomination was deleted.`);
    } catch (error) { setMessage(error.message || 'Could not delete player nomination.'); }
    finally { setBusyId(null); }
  };
  const beginEdit = (player) => {
    setEditingId(player.id);
    setPhotoData('');
    setDraft({
      fullName: player.fullName || '', age: String(player.age || ''), role: player.role || '',
      battingStyle: player.battingStyle || '', bowlingStyle: player.bowlingStyle || '',
      clubName: player.clubName || '', basePrice: String(player.basePrice || '').replace(/[^\d.]/g, ''),
      category: player.category || 'APPROVED PLAYER', matches: player.matches || '',
      primaryStat: player.primaryStat || '', strikeRate: player.strikeRate || '',
      economy: player.economy || '', average: player.average || '', best: player.best || '',
    });
  };
  const saveProfile = async (event, player) => {
    event.preventDefault();
    setBusyId(player.id);
    try {
      const response = await fetch(api + '/admin/auction/registrations/' + player.id + '/profile', {
        method: 'PATCH', headers, body: JSON.stringify({ ...draft, ...(photoData ? { photoUrl: photoData } : {}) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save player details.');
      setPlayers((current) => current.map((item) => item.id === player.id ? result : item));
      setEditingId(null); setDraft(null); setPhotoData('');
      setMessage(`${result.fullName}'s auction profile was saved.`);
    } catch (error) { setMessage(error.message || 'Could not save player details.'); }
    finally { setBusyId(null); }
  };
  const setField = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const shown = players.filter((player) => filter === 'ALL' || player.status === filter);
  return (
    <section>
      <div className="admin-panel-heading admin-nominations-heading">
        <div><h2>Player nominations</h2><p>Review each player before publishing them to the public auction page.</p></div>
        <button className="admin-refresh" onClick={load} disabled={loading}><RefreshCw size={15} /> Refresh</button>
      </div>
      <label className="admin-filter admin-nomination-filter">
        <span>Filter by status</span>
        <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter player nominations by status">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
            <option key={status} value={status}>
              {status === 'ALL' ? 'All nominations' : formatStatusLabel(status)} ({players.filter((player) => status === 'ALL' || player.status === status).length})
            </option>
          ))}
        </select>
      </label>
      {message && <p role="status" className="admin-notice">{message}</p>}
      {loadError && <div className="admin-nomination-error" role="alert"><p>{loadError}</p><button className="admin-action-button" onClick={load} disabled={loading}>Try again</button></div>}
      {loading ? <div className="admin-nomination-loading" role="status"><span className="admin-spinner" /> Loading nominations…</div> : loadError ? null : shown.length === 0 ? <div className="admin-nomination-empty"><UserRound size={21} /><strong>No {filter === 'ALL' ? '' : filter.toLowerCase() + ' '}nominations yet</strong><span>New player submissions will appear here.</span></div> : (
        <div className="admin-nomination-list">
          {shown.map((player) => (
            <article key={player.id} className="admin-nomination-card">
              {(editingId === player.id && draft) ? (
                <form className="admin-auction-profile-edit" onSubmit={(event) => saveProfile(event, player)}>
                  <div className="admin-auction-edit-grid">
                    <label>Player name<input required maxLength="120" value={draft.fullName} onChange={(event) => setField('fullName', event.target.value)} /></label>
                    <label>Age<input required type="number" min="14" max="50" value={draft.age} onChange={(event) => setField('age', event.target.value)} /></label>
                    <label>Role<input required maxLength="60" value={draft.role} onChange={(event) => setField('role', event.target.value)} /></label>
                    <label>Category<input maxLength="40" value={draft.category} onChange={(event) => setField('category', event.target.value)} /></label>
                    <label>Club / team<input maxLength="120" value={draft.clubName} onChange={(event) => setField('clubName', event.target.value)} /></label>
                    <label>Base price (Bash Tokens)<input required type="number" min="1" step="1" value={draft.basePrice} onChange={(event) => setField('basePrice', event.target.value)} /></label>
                    <label>Batting style<input maxLength="40" value={draft.battingStyle} onChange={(event) => setField('battingStyle', event.target.value)} /></label>
                    <label>Bowling style<input maxLength="40" value={draft.bowlingStyle} onChange={(event) => setField('bowlingStyle', event.target.value)} /></label>
                    <label>Matches<input maxLength="30" value={draft.matches} onChange={(event) => setField('matches', event.target.value)} /></label>
                    <label>Performance highlight<input maxLength="80" value={draft.primaryStat} onChange={(event) => setField('primaryStat', event.target.value)} /></label>
                    <label>Strike rate<input maxLength="30" value={draft.strikeRate} onChange={(event) => setField('strikeRate', event.target.value)} /></label>
                    <label>Economy<input maxLength="30" value={draft.economy} onChange={(event) => setField('economy', event.target.value)} /></label>
                    <label>Average<input maxLength="30" value={draft.average} onChange={(event) => setField('average', event.target.value)} /></label>
                    <label>Best figures<input maxLength="30" value={draft.best} onChange={(event) => setField('best', event.target.value)} /></label>
                  </div>
                  <label className="admin-auction-photo-field">Player photo<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 5 * 1024 * 1024) { setMessage('Player photos must be 5 MB or smaller.'); event.target.value = ''; return; } const reader = new FileReader(); reader.onload = () => setPhotoData(String(reader.result || '')); reader.readAsDataURL(file); }} /></label>
                  {player.phone && <small>Private contact: {player.phone}</small>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="admin-action-button primary" type="submit" disabled={busyId === player.id}><Check size={14} /> Save player details</button><button className="admin-action-button" type="button" onClick={() => { setEditingId(null); setDraft(null); setPhotoData(''); }}>Cancel</button><button className="admin-action-button danger" type="button" onClick={() => removeNomination(player)} disabled={busyId === player.id}><Trash2 size={14} /> Delete nomination</button></div>
                </form>
              ) : <>
                <div className="admin-nomination-card-main">
                  <div className="admin-nomination-identity">
                    <div className="admin-nomination-avatar">
                      {player.photoUrl ? <img src={player.photoUrl} alt={player.fullName} /> : <UserRound size={22} />}
                    </div>
                    <div className="admin-nomination-content">
                      <div className="admin-nomination-title">
                        <h3>{player.fullName}</h3>
                        <span className={`admin-review-status ${statusTone(player.status)}`}>{formatStatusLabel(player.status)}</span>
                      </div>
                      <p className="admin-nomination-role">
                        {player.role || 'Role not specified'}
                        <span aria-hidden="true">·</span>
                        <span>{player.age ? `Age ${player.age}` : 'Age not provided'}</span>
                      </p>
                      <div className="admin-nomination-contact">
                        <Phone size={15} aria-hidden="true" />
                        {player.phone
                          ? <a href={`tel:${String(player.phone).replace(/[^\d+]/g, '')}`}>{player.phone}</a>
                          : <span className="admin-nomination-no-contact">Not provided</span>}
                      </div>
                    </div>
                  </div>
                  <div className="admin-nomination-price">
                    <small>Base price</small>
                    <strong>{formatBasePrice(player.basePrice)}</strong>
                  </div>
                </div>
                <div className="admin-nomination-actions">
                  <button type="button" onClick={() => beginEdit(player)} disabled={busyId === player.id} className="admin-action-button">Edit</button>
                  {player.status !== 'APPROVED' && <button type="button" onClick={() => review(player, 'APPROVED')} disabled={busyId === player.id} className="admin-action-button primary"><Check size={14} /> Approve</button>}
                  {player.status !== 'REJECTED' && <button type="button" onClick={() => review(player, 'REJECTED')} disabled={busyId === player.id} className="admin-action-button danger"><XCircle size={14} /> Reject</button>}
                  <button type="button" onClick={() => removeNomination(player)} disabled={busyId === player.id} className="admin-action-button danger destructive" aria-label={`Delete ${player.fullName}`}><Trash2 size={14} /> Delete</button>
                </div>
              </>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}


export default function Admin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('teams');
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const headers = { 'x-admin-password': password, 'Content-Type': 'application/json' };

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${api}/admin/dashboard`, { headers });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to open the admin portal.');
      setData(result);
      if (!data) setAuctionPlayers(result.cataloguePlayers || []);
      setBidsList(result.bids || []);
      setNote('');
    } catch (error) {
      setNote(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Keep the bid inbox current while the organiser has the dashboard open.
  useEffect(() => {
    if (!data) return undefined;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 20000);
    return () => window.clearInterval(timer);
  }, [Boolean(data), password]);

  const save = async (team) => {
    try {
      const response = await fetch(`${api}/admin/teams/${team.id}/review`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          organiserApproval: team.organiserApproval,
          paymentStatus: team.paymentStatus,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save team status.');
      setNote('Team review status saved.');
    } catch (error) {
      setNote(error.message);
    }
  };

  const patchTeam = (team, key, value) => {
    setData((current) => ({
      ...current,
      teams: current.teams.map((item) => item.id === team.id ? { ...item, [key]: value } : item),
    }));
  };

  // Auction Bids & Player Management State
  const [bidFilter, setBidFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
  const [auctionSubTab, setAuctionSubTab] = useState('nominations'); // nominations, bids, catalogue

  const [auctionPlayers, setAuctionPlayers] = useState([]);

  const [bidsList, setBidsList] = useState([]);

  const deleteAdminRecord = async (path, confirmMessage, successMessage, onDelete) => {
    if (!window.confirm(confirmMessage)) return;
    try {
      const response = await fetch(`${api}${path}`, { method: 'DELETE', headers });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to delete this record.');
      onDelete();
      setNote(successMessage);
    } catch (error) {
      setNote(error.message || 'Unable to delete this record.');
    }
  };

  const deleteTeam = (team) => deleteAdminRecord(
    `/admin/teams/${team.id}`,
    `Delete the ${team.teamName} team registration and all its player records? This cannot be undone.`,
    `${team.teamName} registration deleted.`,
    () => setData((current) => ({ ...current, teams: current.teams.filter((item) => item.id !== team.id) }))
  );

  const deleteRegisteredPlayer = (player) => deleteAdminRecord(
    `/admin/teams/${player.teamId}/players/${player.playerIndex}`,
    `Delete ${player.name || `Player ${player.playerIndex}`} from ${player.teamName}? This cannot be undone.`,
    `${player.name || `Player ${player.playerIndex}`} deleted from ${player.teamName}.`,
    () => setData((current) => ({
      ...current,
      teams: current.teams.map((team) => team.id === player.teamId
        ? { ...team, players: team.players.filter((item) => item.playerIndex !== player.playerIndex) }
        : team),
    }))
  );

  const deleteBid = (bid) => deleteAdminRecord(
    `/admin/auction/bids/${bid.id}`,
    `Delete the bid from ${bid.bidderName}? This cannot be undone.`,
    'Bid deleted.',
    () => setBidsList((current) => current.filter((item) => item.id !== bid.id))
  );

  const deleteCataloguePlayer = (player) => deleteAdminRecord(
    `/admin/auction/catalogue/${encodeURIComponent(player.id)}`,
    `Delete ${player.name} from the auction catalogue? This cannot be undone.`,
    `${player.name} deleted from the auction catalogue.`,
    () => setAuctionPlayers((current) => current.filter((item) => item.id !== player.id))
  );

  const reviewBid = async (bidId, status) => {
    const targetBid = bidsList.find((bid) => bid.id === bidId);
    if (!targetBid) return;
    try {
      const response = await fetch(`${api}/admin/auction/bids/${bidId}/review`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save bid status.');
      setBidsList((current) => current.map((bid) => bid.id === bidId ? { ...bid, status: result.status } : bid));
      setNote(`Bid from ${targetBid.bidderName} for ${Number(targetBid.bidAmount).toLocaleString('en-IN')} T ${status.toLowerCase()}.`);
    } catch (error) {
      setNote(error.message || 'Unable to save bid status.');
    }
  };
  const handleApproveBid = (bidId) => reviewBid(bidId, 'APPROVED');
  const handleRejectBid = (bidId) => reviewBid(bidId, 'REJECTED');

  const saveCataloguePlayer = async (playerId, updates, successMessage) => {
    try {
      const response = await fetch(`${api}/admin/auction/catalogue/${encodeURIComponent(playerId)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save player catalogue changes.');
      setAuctionPlayers((current) => current.map((player) => player.id === playerId ? result : player));
      if (successMessage) setNote(successMessage);
    } catch (error) {
      setNote(error.message || 'Unable to save player catalogue changes.');
    }
  };

  const togglePlayerPublished = (playerId) => {
    const player = auctionPlayers.find((item) => item.id === playerId);
    if (player) saveCataloguePlayer(playerId, { published: player.published === false }, 'Player catalogue visibility updated.');
  };

  const setPlayerAuctionStatus = (playerId, status) => {
    saveCataloguePlayer(playerId, { status }, `Player marked as ${status}.`);
  };

  const updatePlayerStat = (playerId, field, value) => {
    const updated = auctionPlayers.map((p) =>
      p.id === playerId
        ? { ...p, stats: { ...(p.stats || {}), [field]: value } }
        : p
    );
    setAuctionPlayers(updated);
  };

  const savePlayerStats = (playerId) => {
    const player = auctionPlayers.find((item) => item.id === playerId);
    if (player) saveCataloguePlayer(playerId, { stats: player.stats }, 'Player stats saved.');
  };

  const print = async (team) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setNote('Allow pop-ups to print the registration.');
      return;
    }
    const wblLogoUrl = new URL(`${import.meta.env.BASE_URL}images/logo.png`, window.location.origin).href;
    let wblLogoDataUrl;
    try {
      const response = await fetch(wblLogoUrl);
      if (!response.ok) throw new Error('Could not load the WBL logo for the registration PDF.');
      const logoBlob = await response.blob();
      wblLogoDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('Could not prepare the WBL logo for printing.'));
        reader.readAsDataURL(logoBlob);
      });
    } catch (error) {
      printWindow.close();
      setNote(error.message || 'Could not prepare the WBL logo for printing.');
      return;
    }
    const roster = (team.players || []).filter((player) => player.name || player.phone || player.photoUrl);
    const imageMarkup = (url, alt, className) => url
      ? `<img class="${className}" src="${escapeHtml(url)}" alt="${escapeHtml(alt)}">`
      : `<div class="${className} image-placeholder">No photo</div>`;
    const playerCards = roster.length
      ? roster.map((player) => `
          <article class="player-card">
            ${imageMarkup(player.photoUrl, `${player.name || `Player ${player.playerIndex}`} photo`, 'player-photo')}
            <div class="player-info">
              <span class="player-number">PLAYER ${escapeHtml(player.playerIndex)}</span>
              <h3>${escapeHtml(player.name || 'Name not provided')}</h3>
              <p>${escapeHtml(player.phone || 'Phone not provided')}</p>
            </div>
          </article>`).join('')
      : '<p class="empty-roster">No player details were submitted with this registration.</p>';
    const teamLogo = imageMarkup(team.teamLogoUrl, `${team.teamName} team logo`, 'team-logo');
    const date = escapeHtml(formatDate(team.createdAt));
    const logoMarkup = team.teamLogoUrl
      ? teamLogo
      : '<div class="team-logo image-placeholder">WBL</div>';
    const html = `<!doctype html>
      <html lang="en"><head><meta charset="utf-8"><title>WBL-${escapeHtml(team.id)} · ${escapeHtml(team.teamName)} registration</title>
      <style>
        @page{size:A4;margin:13mm}
        *{box-sizing:border-box}
        body{margin:0;color:#15253a;font:12px/1.45 Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .topline{height:5px;background:#81bd34;margin-bottom:18px}
        .brand{display:flex;align-items:center;justify-content:space-between;padding-bottom:13px;border-bottom:1px solid #dce3e9}
        .brand-identity{display:flex;align-items:center;gap:11px}.wbl-logo{width:48px;height:48px;object-fit:contain}
        .brand-title{font-size:10px;font-weight:800;letter-spacing:2px;color:#5c752f}.brand-subtitle{margin-top:4px;font-size:9px;color:#738194}
        .registration-id{text-align:right;color:#6d7b8c;font-size:9px}.registration-id strong{display:block;color:#17283d;font-size:13px}
        .team-header{display:flex;align-items:center;gap:16px;padding:20px 0 16px;border-bottom:1px solid #e2e7ec}
        .team-logo{width:88px;height:88px;flex:none;object-fit:contain;border:1px solid #e0e6eb;border-radius:10px;background:#f5f7f9;padding:5px}
        .image-placeholder{display:grid;place-items:center;color:#8794a2;font-size:10px;font-weight:700}
        h1{margin:0;color:#14263b;font-size:25px;line-height:1.12}.team-meta{margin:7px 0 0;color:#647387;font-size:10px}
        .status-row{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.status{padding:4px 8px;border-radius:20px;background:#f1f5e9;color:#4e7525;font-size:8px;font-weight:800;text-transform:uppercase}
        .section-title{margin:17px 0 9px;color:#263950;font-size:11px;letter-spacing:1px;text-transform:uppercase}
        .details{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
        .detail{min-height:49px;padding:8px 10px;border:1px solid #e3e8ed;border-radius:7px;background:#fbfcfd}
        .detail span{display:block;color:#7b8999;font-size:8px;text-transform:uppercase;letter-spacing:.5px}.detail strong{display:block;margin-top:4px;color:#24374d;font-size:10px;overflow-wrap:anywhere}
        .player-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
        .player-card{min-height:94px;padding:7px;display:flex;align-items:center;gap:10px;break-inside:avoid;page-break-inside:avoid;border:1px solid #e2e7ec;border-radius:8px}
        .player-photo{width:78px;height:78px;flex:none;object-fit:cover;border-radius:6px;background:#f0f3f5}
        .player-info{min-width:0}.player-number{color:#6a8d3a;font-size:8px;font-weight:800;letter-spacing:.7px}
        .player-info h3{margin:5px 0;color:#1d3046;font-size:11px;overflow-wrap:anywhere}.player-info p{margin:0;color:#637286;font-size:9px;overflow-wrap:anywhere}
        .empty-roster{padding:18px;border:1px dashed #d2dbe2;color:#728194}
        .signature{display:grid;grid-template-columns:1fr 1fr;gap:38px;margin-top:28px;break-inside:avoid}
        .signature div{padding-top:7px;border-top:1px solid #8c98a5;color:#637286;font-size:9px}
        .footer{display:grid;gap:4px;margin-top:18px;padding-top:9px;border-top:1px solid #e3e8ed;color:#8491a0;font-size:8px;text-align:center}
        .footer-credit{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px;color:#637286}
        .footer-social{display:inline-flex;align-items:center;gap:3px;color:#557b31;text-decoration:none;font-weight:700}
        .instagram-icon{width:12px;height:12px;display:block;flex:none}
        @media screen{body{max-width:800px;margin:24px auto;padding:0 22px}.print-hint{margin:12px 0;padding:10px;border-radius:7px;background:#f3f7ec;color:#55752e;font-size:11px}}
        @media print{.print-hint{display:none}html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.footer-credit,.footer-social{color:#405b32!important}.instagram-icon{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
      </style></head><body>
      <div class="print-hint">Choose “Save as PDF” in the print dialog. For clear player photos, use A4 paper and default or high print quality.</div>
      <div class="topline"></div>
      <header class="brand"><div class="brand-identity"><img class="wbl-logo" src="${escapeHtml(wblLogoDataUrl)}" alt="Winter Bash League logo"><div><div class="brand-title">WINTER BASH LEAGUE</div><div class="brand-subtitle">TEAM REGISTRATION RECORD · 2026 SEASON</div></div></div><div class="registration-id"><strong>WBL-${escapeHtml(team.id)}</strong>Registered ${date}</div></header>
      <section class="team-header">${logoMarkup}<div><h1>${escapeHtml(team.teamName)}</h1><p class="team-meta">Captain: ${escapeHtml(team.captainName)} · ${escapeHtml(team.captainPhone)}</p><div class="status-row"><span class="status">Approval: ${escapeHtml(team.organiserApproval || 'PENDING')}</span><span class="status">Payment: ${escapeHtml(team.paymentStatus || 'PENDING')}</span></div></div></section>
      <h2 class="section-title">Registration details</h2>
      <section class="details"><div class="detail"><span>Team</span><strong>${escapeHtml(team.teamName)}</strong></div><div class="detail"><span>Team captain</span><strong>${escapeHtml(team.captainName)}</strong></div><div class="detail"><span>Captain phone</span><strong>${escapeHtml(team.captainPhone)}</strong></div><div class="detail"><span>Alternative captain phone</span><strong>${escapeHtml(team.captainAlternatePhone || '—')}</strong></div><div class="detail"><span>Payment method</span><strong>${escapeHtml(team.paymentMode)}</strong></div><div class="detail"><span>Payment status</span><strong>${escapeHtml(team.paymentStatus || 'PENDING')}</strong></div><div class="detail"><span>Organiser approval</span><strong>${escapeHtml(team.organiserApproval || 'PENDING')}</strong></div></section>
      <h2 class="section-title">Player roster · ${roster.length} submitted</h2><section class="player-grid">${playerCards}</section>
      <section class="signature"><div>Captain signature</div><div>Organiser signature and stamp</div></section>
      <footer class="footer"><div class="footer-credit">Organised by Tanish Nirankari · <a class="footer-social" href="https://www.instagram.com/winterbashleague/" target="_blank" rel="noopener noreferrer"><svg class="instagram-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" aria-label="Instagram" role="img"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="#557b31" stroke-width="2.5"/><circle cx="12" cy="12" r="4" fill="none" stroke="#557b31" stroke-width="2.5"/><circle cx="18" cy="6" r="1.5" fill="#557b31"/></svg>@winterbashleague</a></div><div>Winter Bash League · Official registration record · Generated ${escapeHtml(formatDate(new Date()))}</div></footer>
      </body></html>`;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    try {
      await Promise.all(Array.from(printWindow.document.images, (image) => image.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        })));
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      printWindow.close();
      setNote('Unable to prepare the registration PDF. Please try again.');
    }
  };

  const upload = async (event) => {
    event.preventDefault();
    if (!file) {
      setNote('Choose an image before uploading.');
      return;
    }
    const body = new FormData();
    body.append('image', file);
    body.append('caption', caption);
    try {
      const response = await fetch(`${api}/admin/gallery`, {
        method: 'POST',
        headers: { 'x-admin-password': password },
        body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to upload image.');
      setData((current) => ({ ...current, gallery: [result, ...(current.gallery || [])] }));
      setFile(null);
      setCaption('');
      event.target.reset();
      setNote('Gallery image uploaded.');
    } catch (error) {
      setNote(error.message);
    }
  };

  const removeImage = async (id) => {
    const image = (data.gallery || []).find((item) => item.id === id);
    if (!window.confirm(`Delete ${image?.caption || 'this gallery image'}? This cannot be undone.`)) return;
    try {
      const response = await fetch(`${api}/admin/gallery/${id}`, { method: 'DELETE', headers });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to remove image.');
      setData((current) => ({ ...current, gallery: current.gallery.filter((item) => item.id !== id) }));
      setNote('Gallery image removed.');
    } catch (error) {
      setNote(error.message);
    }
  };

  if (!data) {
    return (
      <main className="admin-login">
        <section className="admin-login-showcase">
          <Link to="/" className="admin-back-link"><ArrowLeft size={16} /> Back to WBL website</Link>
          <AdminPortalLogo />
          <div className="admin-showcase-copy">
            <span className="admin-kicker">WINTER BASH LEAGUE · SEASON 01</span>
            <h1>Everything behind<br />the game.</h1>
            <p>A secure workspace for registrations, player records and league operations.</p>
          </div>
          <div className="admin-showcase-note">
            <ShieldCheck size={20} />
            <span><strong>Private admin access</strong><small>Authorised organisers only</small></span>
          </div>
          <div className="admin-showcase-decoration" aria-hidden="true" />
        </section>

        <section className="admin-login-area">
          <div className="admin-login-card">
            <div className="admin-mobile-brand"><AdminPortalLogo /></div>
            <div className="admin-login-icon"><LockKeyhole size={22} /></div>
            <span className="admin-kicker">ADMINISTRATOR ACCESS</span>
            <h2>Welcome back</h2>
            <p className="admin-login-description">Sign in to manage your league dashboard.</p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                load();
              }}
            >
              <label htmlFor="admin-password">Admin password</label>
              <div className="admin-password-field">
                <LockKeyhole size={17} aria-hidden="true" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {note && <p className="admin-notice admin-notice-error" role="alert">{note}</p>}
              <button className="admin-sign-in" type="submit" disabled={loading}>
                {loading ? 'Verifying access…' : <>Sign in to portal <span aria-hidden="true">→</span></>}
              </button>
            </form>
            <div className="admin-login-foot"><ShieldCheck size={15} /> Your session is protected</div>
          </div>
          <p className="admin-copyright">© 2026 Winter Bash League · Beyond Boundaries</p>
        </section>
      </main>
    );
  }

  const teams = data.teams
    .filter((team) => `${team.teamName} ${team.captainName}`.toLowerCase().includes(search.toLowerCase()))
    .filter((team) => approvalFilter === 'ALL' || (team.organiserApproval || 'PENDING') === approvalFilter)
    .filter((team) => paymentFilter === 'ALL' || (team.paymentStatus || 'PENDING') === paymentFilter)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const players = data.teams.flatMap((team) => (
    (team.players || [])
      .filter((player) => player.name || player.phone || player.photoUrl)
      .map((player) => ({ ...player, teamId: team.id, teamName: team.teamName }))
  ));
  const counts = {
    teams: data.teams.length,
    players: players.length,
    auction: data.auctionPlayers.length,
    gallery: (data.gallery || []).length,
  };

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-sidebar-brand"><AdminPortalLogo compact /></Link>
        <div className="admin-sidebar-label">WORKSPACE</div>
        <nav className="admin-side-nav" aria-label="Admin sections">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
              <Icon size={18} /><span>{label}</span><span className="admin-nav-count">{counts[id]}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-user-chip"><span className="admin-user-avatar">W</span><span><strong>League admin</strong><small>Administrator</small></span></div>
          <Link to="/" className="admin-return-link"><LogOut size={16} /> Return to website</Link>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div><span className="admin-breadcrumb">Workspace</span><span className="admin-breadcrumb-divider">/</span><strong>{tabs.find((item) => item.id === tab)?.label}</strong></div>
          <div className="admin-topbar-actions"><span className="admin-live-status"><i /> Portal active</span><button className="admin-refresh" onClick={load} disabled={loading}><RefreshCw size={16} /> Refresh</button></div>
        </header>
        <div className="admin-content">
          <div className="admin-page-heading">
            <div><span className="admin-kicker">LEAGUE MANAGEMENT</span><h1>{tab === 'teams' ? 'Registrations' : tabs.find((item) => item.id === tab)?.label}</h1><p>Review and manage your Winter Bash League records.</p></div>
            <span className="admin-season-pill">2026 SEASON</span>
          </div>

          {note && <p className="admin-notice" role="status">{note}</p>}

          <div className="admin-stat-grid">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`admin-stat-card ${tab === id ? 'selected' : ''}`} onClick={() => setTab(id)}>
                <span className="admin-stat-icon"><Icon size={18} /></span>
                <span className="admin-stat-copy"><small>{label}</small><strong>{counts[id]}</strong></span>
              </button>
            ))}
          </div>

          {tab === 'teams' && (
            <AdminPanel>
              <div className="admin-panel-heading">
                <div><h2>Team registrations</h2><p>Showing {teams.length} of {data.teams.length} registrations · newest first</p></div>
                <div className="admin-registration-tools">
                  <label className="admin-search"><Search size={17} /><input placeholder="Search teams or captains" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
                  <label className="admin-filter">Approval
                    <select value={approvalFilter} onChange={(event) => setApprovalFilter(event.target.value)}>
                      <option value="ALL">All statuses</option>
                      {['PENDING', 'APPROVED', 'REJECTED'].map((status) => <option key={status} value={status}>{formatStatusLabel(status)}</option>)}
                    </select>
                  </label>
                  <label className="admin-filter">Payment
                    <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
                      <option value="ALL">All statuses</option>
                      {['PENDING', 'PAID', 'PARTIALLY PAID', 'NOT REQUIRED'].map((status) => <option key={status} value={status}>{formatStatusLabel(status)}</option>)}
                    </select>
                  </label>
                </div>
              </div>
              {teams.length === 0 ? <p className="admin-empty">No registrations match the selected search and filters.</p> : (
                <div className="admin-team-list">
                  {teams.map((team) => (
                    <article className="admin-team-card" key={team.id}>
                      <div className="admin-team-heading">
                        <div className="admin-team-identity">
                          {team.teamLogoUrl
                            ? <img className="admin-team-logo" src={team.teamLogoUrl} alt={`${team.teamName} logo`} />
                            : <span className="admin-team-logo-placeholder"><ShieldCheck size={22} /></span>}
                          <div><h3>{team.teamName}</h3><p>Registration WBL-{team.id} · Captain {team.captainName}</p></div>
                        </div>
                        <span className={`admin-status-pill ${statusTone(team.organiserApproval)}`}>{formatStatusLabel(team.organiserApproval)}</span>
                      </div>
                      <div className="admin-team-details"><span>{team.captainPhone}</span>{team.captainAlternatePhone && <span>Alternative: {team.captainAlternatePhone}</span>}<span>Payment method: {team.paymentMode}</span><span>{(team.players || []).filter((player) => player.name || player.phone || player.photoUrl).length} player records</span><span>Registered: {formatDate(team.createdAt)}</span></div>
                      <div className="admin-team-actions">
                        <label>Approval<select value={team.organiserApproval || 'PENDING'} onChange={(event) => patchTeam(team, 'organiserApproval', event.target.value)}>{['PENDING', 'APPROVED', 'REJECTED'].map((status) => <option key={status} value={status}>{formatStatusLabel(status)}</option>)}</select></label>
                        <label>Payment<select value={team.paymentStatus || 'PENDING'} onChange={(event) => patchTeam(team, 'paymentStatus', event.target.value)}>{['PENDING', 'PAID', 'PARTIALLY PAID', 'NOT REQUIRED'].map((status) => <option key={status} value={status}>{formatStatusLabel(status)}</option>)}</select></label>
                        <button className="admin-action-button primary" onClick={() => save(team)}><CheckCircle2 size={15} /> Save review</button>
                        <button className="admin-action-button" onClick={() => print(team)}><Printer size={15} /> Print / Save PDF</button>
                        <button className="admin-action-button danger" onClick={() => deleteTeam(team)}><Trash2 size={15} /> Delete team</button>
                      </div>
                      <details className="admin-player-details"><summary>View player details and photos</summary>
                        {(team.players || []).map((player) => (
                          <div className="admin-player-row" key={player.playerIndex}>
                            {player.photoUrl ? <img src={player.photoUrl} alt={player.name ? `${player.name} photo` : 'Player photo'} /> : <span className="admin-player-photo-placeholder"><UserRound size={18} /></span>}
                            <span><strong>{player.name || `Player ${player.playerIndex}`}</strong><small>{player.phone || 'No phone provided'}</small></span>
                            <small>Player {player.playerIndex}</small>
                            <button className="admin-action-button danger" onClick={() => deleteRegisteredPlayer({ ...player, teamId: team.id, teamName: team.teamName })} aria-label={`Delete ${player.name || `player ${player.playerIndex}`}`}><Trash2 size={14} /> Delete</button>
                          </div>
                        ))}
                      </details>
                    </article>
                  ))}
                </div>
              )}
            </AdminPanel>
          )}

          {tab === 'players' && (
            <AdminPanel>
              <div className="admin-panel-heading"><div><h2>Registered players</h2><p>Player profiles submitted with team registrations</p></div></div>
              {players.length === 0 ? <p className="admin-empty">No player profiles have been submitted yet.</p> : (
                <div className="admin-registered-team-list">
                  {data.teams.map((team) => {
                    const teamPlayers = (team.players || [])
                      .filter((player) => player.name || player.phone || player.photoUrl)
                      .map((player) => ({ ...player, teamId: team.id, teamName: team.teamName }));
                    if (!teamPlayers.length) return null;
                    return (
                      <details className="admin-registered-team" key={team.id}>
                        <summary>
                          <span className="admin-registered-team-mark"><Users size={18} /></span>
                          <span className="admin-registered-team-copy"><strong>{team.teamName}</strong><small>Team roster</small></span>
                          <span className="admin-registered-team-count">{teamPlayers.length} {teamPlayers.length === 1 ? 'player' : 'players'}</span>
                        </summary>
                        <div className="admin-registered-team-players">
                          {teamPlayers.map((player) => (
                            <article className="admin-player-card" key={player.playerIndex}>
                              {player.photoUrl ? <img src={player.photoUrl} alt={player.name || 'Player'} /> : <span className="admin-player-card-placeholder"><UserRound size={24} /></span>}
                              <div className="admin-registered-player-copy">
                                <h3>{player.name || `Player ${player.playerIndex}`}</h3>
                                <small>Player {player.playerIndex} · {player.phone || 'No phone'}</small>
                              </div>
                              <button className="admin-action-button danger" onClick={() => deleteRegisteredPlayer(player)} aria-label={`Delete ${player.name || `player ${player.playerIndex}`} from ${team.teamName}`}><Trash2 size={14} /><span>Delete</span></button>
                            </article>
                          ))}
                        </div>
                      </details>
                    );
                  })}
                </div>
              )}
            </AdminPanel>
          )}

          {tab === 'auction' && (
            <AdminPanel>
              <div className="admin-panel-heading">
                <div>
                  <h2>Player Auction & Bidding Portal</h2>
                  <p>Review incoming franchise bids and manage published player catalogue</p>
                </div>
                <div className="admin-auction-tabs" role="group" aria-label="Auction management sections">
                  <button
                    type="button"
                    className={`admin-auction-tab${auctionSubTab === 'nominations' ? ' active' : ''}`}
                    aria-pressed={auctionSubTab === 'nominations'}
                    onClick={() => setAuctionSubTab('nominations')}
                  >Player Nominations ({data?.auctionPlayers?.length || 0})</button>
                  <button
                    type="button"
                    className={`admin-auction-tab${auctionSubTab === 'bids' ? ' active' : ''}`}
                    aria-pressed={auctionSubTab === 'bids'}
                    onClick={() => setAuctionSubTab('bids')}
                  >Bids Management ({bidsList.length})</button>
                  <button
                    type="button"
                    className={`admin-auction-tab${auctionSubTab === 'catalogue' ? ' active' : ''}`}
                    aria-pressed={auctionSubTab === 'catalogue'}
                    onClick={() => setAuctionSubTab('catalogue')}
                  >Player Catalogue</button>
                </div>
              </div>

              {auctionSubTab === 'nominations' ? <AuctionNominations password={password} /> : auctionSubTab === 'bids' ? (
                <>
                  <div className="admin-bids-heading"><div><strong>Incoming bids</strong><small>New bids sync automatically while this page is open.</small></div><button className="admin-refresh" onClick={load} disabled={loading}><RefreshCw size={15} /> Refresh now</button></div>
                  <div className="admin-status-filters">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setBidFilter(filter)}
                        className={`admin-filter-chip${bidFilter === filter ? ' active' : ''}`}
                      >
                        {filter === 'ALL' ? 'All' : formatStatusLabel(filter)}<span>{bidsList.filter((b) => filter === 'ALL' || b.status === filter).length}</span>
                      </button>
                    ))}
                  </div>

                  {bidsList.filter((b) => bidFilter === 'ALL' || b.status === bidFilter).length === 0 ? (
                    <p className="admin-empty">No bids match the selected filter.</p>
                  ) : (
                    <div className="admin-bids-table-wrap" style={{ overflowX: 'auto' }}>
                      <table className="admin-bids-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                            <th style={{ padding: '10px 12px' }}>Player</th>
                            <th style={{ padding: '10px 12px' }}>Bidder</th>
                            <th style={{ padding: '10px 12px' }}>Bid Amount</th>
                            <th style={{ padding: '10px 12px' }}>Contact (Private)</th>
                            <th style={{ padding: '10px 12px' }}>Status</th>
                            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bidsList
                            .filter((b) => bidFilter === 'ALL' || b.status === bidFilter)
                            .map((bid) => (
                              <tr key={bid.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td data-label="Player" style={{ padding: '12px' }}>
                                  <strong>{bid.playerName || bid.playerId}</strong>
                                </td>
                                <td data-label="Bidder" style={{ padding: '12px' }}>{bid.bidderName}</td>
                                <td data-label="Bid amount" style={{ padding: '12px', color: 'var(--lime)', fontWeight: 800 }}>
                                  {Number(bid.bidAmount).toLocaleString('en-IN')} T
                                </td>
                                <td data-label="Private contact" style={{ padding: '12px', color: '#94a3b8', fontSize: '12px' }}>
                                  {bid.phone} {bid.email && `• ${bid.email}`}
                                </td>
                                <td data-label="Status" style={{ padding: '12px' }}>
                                  <span className={`admin-review-status ${statusTone(bid.status)}`}>{formatStatusLabel(bid.status)}</span>
                                </td>
                                <td data-label="Review" style={{ padding: '12px', textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                                    <button
                                      onClick={() => deleteBid(bid)}
                                      className="admin-action-button danger"
                                      aria-label={`Delete bid from ${bid.bidderName}`}
                                    >
                                      <Trash2 size={14} /> Delete
                                    </button>
                                    {bid.status !== 'APPROVED' && (
                                      <button
                                        onClick={() => handleApproveBid(bid.id)}
                                        style={{
                                          padding: '5px 10px',
                                          borderRadius: '6px',
                                          background: 'rgba(156,255,0,0.15)',
                                          border: '1px solid var(--lime)',
                                          color: 'var(--lime)',
                                          fontSize: '11px',
                                          fontWeight: 800,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Approve
                                      </button>
                                    )}
                                    {bid.status !== 'REJECTED' && (
                                      <button
                                        onClick={() => handleRejectBid(bid.id)}
                                        style={{
                                          padding: '5px 10px',
                                          borderRadius: '6px',
                                          background: 'rgba(239,68,68,0.15)',
                                          border: '1px solid rgba(239,68,68,0.4)',
                                          color: '#ef4444',
                                          fontSize: '11px',
                                          fontWeight: 800,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Reject
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className="admin-catalogue-grid">
                  {auctionPlayers.map((player) => (
                    <article className="admin-catalogue-card" key={player.id}>
                      <div className="admin-catalogue-player">
                        <div className="admin-catalogue-photo">
                          {player.photoUrl ? <img src={player.photoUrl} alt="" /> : <UserRound size={24} aria-hidden="true" />}
                        </div>
                        <div className="admin-catalogue-player-copy">
                          <span className="admin-catalogue-eyebrow">{player.category || 'Auction player'}</span>
                          <h3>{player.name || 'Unnamed player'}</h3>
                          <p>{player.role || 'Role not specified'}</p>
                        </div>
                        <span className={`admin-catalogue-visibility${player.published !== false ? ' published' : ''}`}>
                          <i aria-hidden="true" />{player.published !== false ? 'Published' : 'Hidden'}
                        </span>
                      </div>

                      <div className="admin-catalogue-summary">
                        <div className="admin-catalogue-price"><span>Base price</span><strong>{Number(String(player.basePrice || '').replace(/[^\d.]/g, '')).toLocaleString('en-IN')} <small>T</small></strong></div>
                        <span className={`admin-catalogue-status${player.status === 'SOLD' ? ' sold' : ''}`}>
                          {formatStatusLabel(player.status || 'AVAILABLE')}
                        </span>
                      </div>

                      <div className="admin-catalogue-stats">
                        <div className="admin-catalogue-section-heading">
                          <div><strong>Performance</strong><span>Player statistics</span></div>
                          <button className="admin-action-button primary" type="button" onClick={() => savePlayerStats(player.id)}>Save stats</button>
                        </div>
                        <div className="admin-catalogue-stat-grid">
                          {[{ label: 'Average', field: 'average' }, { label: 'Strike rate', field: 'strikeRate' }, { label: 'Economy', field: 'economy' }, { label: 'Best', field: 'best' }].map(({ label, field }) => (
                            <label className="admin-catalogue-stat" key={field}>
                              <span>{label}</span>
                              <input
                                type="text"
                                maxLength={30}
                                placeholder="—"
                                value={player.stats?.[field] === '—' ? '' : (player.stats?.[field] || '')}
                                onChange={(e) => updatePlayerStat(player.id, field, e.target.value || '—')}
                                aria-label={`${label} for ${player.name || 'player'}`}
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="admin-catalogue-actions">
                        <button
                          type="button"
                          className="admin-action-button"
                          onClick={() => togglePlayerPublished(player.id)}
                        >
                          {player.published !== false ? 'Unpublish' : 'Publish'}
                        </button>

                        <button
                          type="button"
                          className={`admin-action-button${player.status === 'SOLD' ? ' primary' : ''}`}
                          onClick={() => setPlayerAuctionStatus(player.id, player.status === 'SOLD' ? 'AVAILABLE' : 'SOLD')}
                        >
                          {player.status === 'SOLD' ? 'Mark Available' : 'Mark Sold'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCataloguePlayer(player)}
                          className="admin-action-button danger"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </AdminPanel>
          )}

          {tab === 'gallery' && (
            <>
              <AdminPanel>
                <div className="admin-panel-heading"><div><h2>League gallery</h2><p>Upload and manage images shown on the website</p></div></div>
                <form className="admin-upload-form" onSubmit={upload}>
                  <label className="admin-file-picker"><Upload size={18} /><span>{file ? file.name : 'Choose an image to upload'}</span><input type="file" accept="image/*" onChange={(event) => setFile(event.target.files[0] || null)} /></label>
                  <input className="admin-caption-input" placeholder="Image caption (optional)" value={caption} onChange={(event) => setCaption(event.target.value)} />
                  <button className="admin-action-button primary" type="submit"><Upload size={15} /> Upload image</button>
                </form>
              </AdminPanel>
              {(data.gallery || []).length > 0 && <div className="admin-gallery-grid">{data.gallery.map((image) => (
                <article className="admin-gallery-card" key={image.id}><img src={image.url} alt={image.caption || 'League gallery'} /><div><p>{image.caption || 'Untitled image'}</p><button className="admin-action-button danger" onClick={() => removeImage(image.id)}>Remove</button></div></article>
              ))}</div>}
            </>
          )}
          <footer className="admin-footer">Winter Bash League <span>·</span> Admin workspace</footer>
        </div>
      </section>
    </main>
  );
}
