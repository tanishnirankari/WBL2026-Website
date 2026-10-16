import { useState } from 'react';
import {
  ArrowLeft, CheckCircle2, Eye, EyeOff, Gavel, Image, LockKeyhole,
  LogOut, Printer, RefreshCw, Search, ShieldCheck, Upload, UserRound, Users,
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

function AdminPanel({ children, className = '' }) {
  return <section className={`admin-panel ${className}`}>{children}</section>;
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('teams');
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');
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
      setNote('');
    } catch (error) {
      setNote(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const print = (team) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setNote('Allow pop-ups to print the registration.');
      return;
    }
    const rows = (team.players || [])
      .filter((player) => player.name || player.phone || player.photoUrl)
      .map((player) => `<tr><td>${player.playerIndex}</td><td>${player.photoUrl ? `<img src="${player.photoUrl}" width="42" alt="">` : ''}</td><td>${player.name || '-'}</td><td>${player.phone || '-'}</td></tr>`)
      .join('');
    printWindow.document.write(`<title>WBL Team Registration</title><style>@page{size:A4;margin:15mm}body{font:12px Arial;color:#123}table{width:100%;border-collapse:collapse}td,th{border:1px solid #aaa;padding:7px}h2{border-bottom:2px solid #8c0;padding:6px}.sig{display:flex;justify-content:space-between;margin-top:50px}.sig div{border-top:1px solid;width:40%;padding-top:6px}</style><h1>Winter Bash League - Final Team Registration</h1><p>Registration WBL-${team.id}</p><h2>Team details</h2><p>Team: ${team.teamName}<br>Captain: ${team.captainName}<br>Phone: ${team.captainPhone}<br>Payment method: ${team.paymentMode}<br>Payment status: ${team.paymentStatus}<br>Organiser approval: ${team.organiserApproval}</p><h2>Players</h2><table><tr><th>#</th><th>Photo</th><th>Name</th><th>Phone</th></tr>${rows}</table><div class="sig"><div>Captain signature</div><div>Organiser signature and stamp</div></div>`);
    printWindow.document.close();
    printWindow.print();
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

  const teams = data.teams.filter((team) => (
    `${team.teamName} ${team.captainName}`.toLowerCase().includes(search.toLowerCase())
  ));
  const players = data.teams.flatMap((team) => (
    (team.players || [])
      .filter((player) => player.name || player.phone || player.photoUrl)
      .map((player) => ({ ...player, teamName: team.teamName }))
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
                <div><h2>Team registrations</h2><p>{teams.length} teams in your league</p></div>
                <label className="admin-search"><Search size={17} /><input placeholder="Search teams or captains" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
              </div>
              {teams.length === 0 ? <p className="admin-empty">No teams match your search.</p> : (
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
                        <span className={`admin-status-pill ${team.organiserApproval === 'APPROVED' ? 'approved' : team.organiserApproval === 'REJECTED' ? 'rejected' : ''}`}>{team.organiserApproval || 'PENDING'}</span>
                      </div>
                      <div className="admin-team-details"><span>{team.captainPhone}</span><span>Payment: {team.paymentMode}</span><span>{(team.players || []).filter((player) => player.name || player.phone || player.photoUrl).length} player records</span></div>
                      <div className="admin-team-actions">
                        <label>Approval<select value={team.organiserApproval || 'PENDING'} onChange={(event) => patchTeam(team, 'organiserApproval', event.target.value)}>{['PENDING', 'APPROVED', 'REJECTED'].map((status) => <option key={status}>{status}</option>)}</select></label>
                        <label>Payment<select value={team.paymentStatus || 'PENDING'} onChange={(event) => patchTeam(team, 'paymentStatus', event.target.value)}>{['PENDING', 'PAID', 'PARTIALLY PAID', 'NOT REQUIRED'].map((status) => <option key={status}>{status}</option>)}</select></label>
                        <button className="admin-action-button primary" onClick={() => save(team)}><CheckCircle2 size={15} /> Save review</button>
                        <button className="admin-action-button" onClick={() => print(team)}><Printer size={15} /> Print</button>
                      </div>
                      <details className="admin-player-details"><summary>View player details and photos</summary>
                        {(team.players || []).map((player) => (
                          <div className="admin-player-row" key={player.playerIndex}>
                            {player.photoUrl ? <img src={player.photoUrl} alt={player.name ? `${player.name} photo` : 'Player photo'} /> : <span className="admin-player-photo-placeholder"><UserRound size={16} /></span>}
                            <span><strong>{player.name || `Player ${player.playerIndex}`}</strong><small>{player.phone || 'No phone provided'}</small></span>
                            <small>Player {player.playerIndex}</small>
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
                <div className="admin-player-grid">
                  {players.map((player, index) => (
                    <article className="admin-player-card" key={`${player.playerIndex}-${player.teamName}-${index}`}>
                      {player.photoUrl ? <img src={player.photoUrl} alt={player.name || 'Player'} /> : <span className="admin-player-card-placeholder"><UserRound size={24} /></span>}
                      <div><h3>{player.name || 'Unnamed player'}</h3><p>{player.teamName}</p><small>Player {player.playerIndex} · {player.phone || 'No phone'}</small></div>
                    </article>
                  ))}
                </div>
              )}
            </AdminPanel>
          )}

          {tab === 'auction' && (
            <AdminPanel>
              <div className="admin-panel-heading"><div><h2>Auction registrations</h2><p>Players registered for the league auction</p></div></div>
              {data.auctionPlayers.length === 0 ? <p className="admin-empty">No auction registrations yet.</p> : (
                <div className="admin-auction-list">{data.auctionPlayers.map((player) => (
                  <article className="admin-auction-row" key={player.id}><span className="admin-auction-icon"><Gavel size={18} /></span><div><h3>{player.fullName}</h3><p>{player.role} · {player.clubName || 'No club listed'}</p></div><strong>{player.basePrice}</strong></article>
                ))}</div>
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
