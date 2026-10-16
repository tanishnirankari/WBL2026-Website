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

  const print = async (team) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setNote('Allow pop-ups to print the registration.');
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
        .footer{margin-top:18px;padding-top:8px;border-top:1px solid #e3e8ed;color:#8491a0;font-size:8px;text-align:center}
        @media screen{body{max-width:800px;margin:24px auto;padding:0 22px}.print-hint{margin:12px 0;padding:10px;border-radius:7px;background:#f3f7ec;color:#55752e;font-size:11px}}
        @media print{.print-hint{display:none}}
      </style></head><body>
      <div class="print-hint">Choose “Save as PDF” in the print dialog. For clear player photos, use A4 paper and default or high print quality.</div>
      <div class="topline"></div>
      <header class="brand"><div><div class="brand-title">WINTER BASH LEAGUE</div><div class="brand-subtitle">TEAM REGISTRATION RECORD · 2026 SEASON</div></div><div class="registration-id"><strong>WBL-${escapeHtml(team.id)}</strong>Registered ${date}</div></header>
      <section class="team-header">${logoMarkup}<div><h1>${escapeHtml(team.teamName)}</h1><p class="team-meta">Captain: ${escapeHtml(team.captainName)} · ${escapeHtml(team.captainPhone)}</p><div class="status-row"><span class="status">Approval: ${escapeHtml(team.organiserApproval || 'PENDING')}</span><span class="status">Payment: ${escapeHtml(team.paymentStatus || 'PENDING')}</span></div></div></section>
      <h2 class="section-title">Registration details</h2>
      <section class="details"><div class="detail"><span>Team</span><strong>${escapeHtml(team.teamName)}</strong></div><div class="detail"><span>Team captain</span><strong>${escapeHtml(team.captainName)}</strong></div><div class="detail"><span>Captain phone</span><strong>${escapeHtml(team.captainPhone)}</strong></div><div class="detail"><span>Payment method</span><strong>${escapeHtml(team.paymentMode)}</strong></div><div class="detail"><span>Payment status</span><strong>${escapeHtml(team.paymentStatus || 'PENDING')}</strong></div><div class="detail"><span>Organiser approval</span><strong>${escapeHtml(team.organiserApproval || 'PENDING')}</strong></div></section>
      <h2 class="section-title">Player roster · ${roster.length} submitted</h2><section class="player-grid">${playerCards}</section>
      <section class="signature"><div>Captain signature</div><div>Organiser signature and stamp</div></section>
      <footer class="footer">Winter Bash League · Official registration record · Generated ${escapeHtml(formatDate(new Date()))}</footer>
      </body></html>`;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    try {
      await Promise.all(Array.from(printWindow.document.images, (image) => (
        image.decode().catch(() => undefined)
      )));
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
                <div><h2>Team registrations</h2><p>Showing {teams.length} of {data.teams.length} registrations · newest first</p></div>
                <div className="admin-registration-tools">
                  <label className="admin-search"><Search size={17} /><input placeholder="Search teams or captains" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
                  <label className="admin-filter">Approval
                    <select value={approvalFilter} onChange={(event) => setApprovalFilter(event.target.value)}>
                      <option value="ALL">All statuses</option>
                      {['PENDING', 'APPROVED', 'REJECTED'].map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                  <label className="admin-filter">Payment
                    <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
                      <option value="ALL">All statuses</option>
                      {['PENDING', 'PAID', 'PARTIALLY PAID', 'NOT REQUIRED'].map((status) => <option key={status}>{status}</option>)}
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
                        <span className={`admin-status-pill ${team.organiserApproval === 'APPROVED' ? 'approved' : team.organiserApproval === 'REJECTED' ? 'rejected' : ''}`}>{team.organiserApproval || 'PENDING'}</span>
                      </div>
                      <div className="admin-team-details"><span>{team.captainPhone}</span><span>Payment method: {team.paymentMode}</span><span>{(team.players || []).filter((player) => player.name || player.phone || player.photoUrl).length} player records</span><span>Registered: {formatDate(team.createdAt)}</span></div>
                      <div className="admin-team-actions">
                        <label>Approval<select value={team.organiserApproval || 'PENDING'} onChange={(event) => patchTeam(team, 'organiserApproval', event.target.value)}>{['PENDING', 'APPROVED', 'REJECTED'].map((status) => <option key={status}>{status}</option>)}</select></label>
                        <label>Payment<select value={team.paymentStatus || 'PENDING'} onChange={(event) => patchTeam(team, 'paymentStatus', event.target.value)}>{['PENDING', 'PAID', 'PARTIALLY PAID', 'NOT REQUIRED'].map((status) => <option key={status}>{status}</option>)}</select></label>
                        <button className="admin-action-button primary" onClick={() => save(team)}><CheckCircle2 size={15} /> Save review</button>
                        <button className="admin-action-button" onClick={() => print(team)}><Printer size={15} /> Print / Save PDF</button>
                      </div>
                      <details className="admin-player-details"><summary>View player details and photos</summary>
                        {(team.players || []).map((player) => (
                          <div className="admin-player-row" key={player.playerIndex}>
                            {player.photoUrl ? <img src={player.photoUrl} alt={player.name ? `${player.name} photo` : 'Player photo'} /> : <span className="admin-player-photo-placeholder"><UserRound size={18} /></span>}
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
