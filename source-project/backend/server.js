require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_UPLOAD_PRESET
);

let auctionTableReady;
const ensureAuctionTable = () => {
  if (!auctionTableReady) {
    auctionTableReady = pool.query(`
      CREATE TABLE IF NOT EXISTS wbl_auction_registrations (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(120) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        age SMALLINT NOT NULL CHECK (age BETWEEN 14 AND 50),
        playing_role VARCHAR(60) NOT NULL,
        batting_style VARCHAR(40),
        bowling_style VARCHAR(40),
        club_name VARCHAR(120),
        base_price VARCHAR(20) NOT NULL,
        status VARCHAR(40) NOT NULL DEFAULT 'PENDING VERIFICATION',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `).catch((error) => {
      auctionTableReady = null;
      throw error;
    });
  }
  return auctionTableReady;
};

const hasValidAdminPassword = (providedPassword) => {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword || !providedPassword) return false;

  const configured = Buffer.from(configuredPassword);
  const provided = Buffer.from(providedPassword);
  return configured.length === provided.length && crypto.timingSafeEqual(configured, provided);
};

const requireAdmin = (req, res, next) => {
  if (!hasValidAdminPassword(req.get('x-admin-password'))) {
    return res.status(401).json({ error: 'Enter the correct admin password.' });
  }
  next();
};

const asPlayerList = (players) => {
  if (Array.isArray(players)) return players;
  if (typeof players !== 'string') return [];
  try {
    const parsed = JSON.parse(players);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const imageUrl = (req, storedPath) => {
  if (!storedPath) return null;
  if (/^https?:\/\//i.test(storedPath)) return storedPath;
  return `${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(path.basename(storedPath))}`;
};

pool.connect()
  .then(() => console.log('Successfully connected to PostgreSQL.'))
  .catch(err => {
    console.error('Failed to connect to PostgreSQL. Is the DATABASE_URL correct and running?', err.message);
  });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed.'));
  }
});

const storeUploadedImage = async (file) => {
  if (!file) return null;

  if (cloudinaryConfigured) {
    const form = new FormData();
    form.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
    form.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);
    form.append('folder', 'wbl-2026');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: form }
    );
    const data = await response.json();
    if (!response.ok || !data.secure_url) {
      throw new Error(data.error?.message || 'Could not save the image.');
    }
    return data.secure_url;
  }

  const filename = `wbl-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
  await fs.promises.writeFile(path.join(__dirname, 'uploads', filename), file.buffer);
  return filename;
};

const uploadFields = [{ name: 'teamLogo', maxCount: 1 }];
for (let i = 1; i <= 15; i++) {
  uploadFields.push({ name: `player${i}Photo`, maxCount: 1 });
}

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.post('/api/registrations', upload.fields(uploadFields), asyncHandler(async (req, res) => {
  const { teamName, captainName, captainPhone, paymentMode } = req.body;

  if (!teamName || !captainName || !captainPhone || !paymentMode) {
    return res.status(400).json({ error: 'Missing required team fields (teamName, captainName, captainPhone, paymentMode).' });
  }

  const existingTeam = await pool.query('SELECT id FROM wbl_registrations WHERE team_name = $1', [teamName.trim()]);
  if (existingTeam.rows.length > 0) {
    return res.status(409).json({ error: 'A team with this exact name strongly matches an existing registration.' });
  }

  const teamLogoPath = await storeUploadedImage(req.files?.teamLogo?.[0]);

  const players = [];
  for (let i = 1; i <= 15; i++) {
    const name = req.body[`player${i}Name`] || null;
    const phone = req.body[`player${i}Phone`] || null;
    const photoPath = await storeUploadedImage(req.files?.[`player${i}Photo`]?.[0]);
    players.push({ playerIndex: i, name, phone, photoPath });
  }

  const query = `
    INSERT INTO wbl_registrations (team_name, captain_name, captain_phone, payment_mode, team_logo_path, players)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, created_at;
  `;
  const values = [teamName.trim(), captainName.trim(), captainPhone.trim(), paymentMode, teamLogoPath, JSON.stringify(players)];

  const result = await pool.query(query, values);
  const newRegistration = result.rows[0];

  res.status(201).json({
    message: 'Team successfully registered!',
    registrationId: newRegistration.id
  });
}));

app.get('/api/admin/dashboard', requireAdmin, asyncHandler(async (req, res) => {
  await ensureAuctionTable();

  const [teamsResult, auctionResult] = await Promise.all([
    pool.query(`
      SELECT id, team_name, captain_name, captain_phone, payment_mode,
             team_logo_path, players, created_at
      FROM wbl_registrations
      ORDER BY created_at DESC, id DESC
    `),
    pool.query(`
      SELECT id, full_name, phone, age, playing_role, batting_style,
             bowling_style, club_name, base_price, created_at
      FROM wbl_auction_registrations
      ORDER BY created_at DESC, id DESC
    `)
  ]);

  const teams = teamsResult.rows.map((team) => ({
    id: team.id,
    teamName: team.team_name,
    captainName: team.captain_name,
    captainPhone: team.captain_phone,
    paymentMode: team.payment_mode,
    createdAt: team.created_at,
    teamLogoUrl: imageUrl(req, team.team_logo_path),
    players: asPlayerList(team.players).map((player) => ({
      ...player,
      photoUrl: imageUrl(req, player.photoPath)
    }))
  }));

  const auctionPlayers = auctionResult.rows.map((player) => ({
    id: player.id,
    fullName: player.full_name,
    phone: player.phone,
    age: player.age,
    role: player.playing_role,
    battingStyle: player.batting_style,
    bowlingStyle: player.bowling_style,
    clubName: player.club_name,
    basePrice: player.base_price,
    createdAt: player.created_at
  }));

  res.json({ teams, auctionPlayers });
}));

app.get('/api/auction/registrations', asyncHandler(async (req, res) => {
  await ensureAuctionTable();
  const result = await pool.query(`
    SELECT id, playing_role, base_price, status, created_at
    FROM wbl_auction_registrations
    ORDER BY created_at DESC, id DESC
  `);
  res.json(result.rows.map((row) => ({
    id: row.id,
    role: row.playing_role,
    basePrice: row.base_price,
    status: row.status,
    createdAt: row.created_at
  })));
}));

app.post('/api/auction/registrations', asyncHandler(async (req, res) => {
  const { name, phone, age, role, battingStyle, bowlingStyle, club, basePrice } = req.body;
  const parsedAge = Number(age);
  const allowedPrices = ['₹1,000', '₹2,000', '₹3,000', '₹4,000', 'â‚¹1,000', 'â‚¹2,000', 'â‚¹3,000', 'â‚¹4,000'];

  if (!name?.trim() || !phone?.trim() || !Number.isInteger(parsedAge) || parsedAge < 14 || parsedAge > 50 || !role?.trim()) {
    return res.status(400).json({ error: 'Please provide a valid name, phone, age, and playing role.' });
  }
  if (!allowedPrices.includes(basePrice)) {
    return res.status(400).json({ error: 'Please choose a valid expected base price.' });
  }

  await ensureAuctionTable();
  const result = await pool.query(`
    INSERT INTO wbl_auction_registrations
      (full_name, phone, age, playing_role, batting_style, bowling_style, club_name, base_price)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, status
  `, [name.trim(), phone.trim(), parsedAge, role.trim(), battingStyle || null,
    bowlingStyle || null, club?.trim() || null, basePrice]);

  res.status(201).json({
    message: 'Player nomination received.',
    registrationId: result.rows[0].id,
    status: result.rows[0].status
  });
}));

app.use((req, res, next) => {
  res.status(404).json({ error: 'API route not found' });
});

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  if (err.code && err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate team name detected by database constraint.' });
  }
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

app.listen(port, () => {
  console.log(`WBL Backend listening on http://localhost:${port}`);
});
