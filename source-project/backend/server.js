require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test connection
pool.connect()
  .then(() => console.log('Successfully connected to PostgreSQL.'))
  .catch(err => {
    console.error('Failed to connect to PostgreSQL. Is the DATABASE_URL correct and running?', err.message);
    // Continuing because we want server to run even if DB isn't strictly ready at startup
  });

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'wbl-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// Create dynamic multer fields for Team Logo and 15 player photos
const uploadFields = [{ name: 'teamLogo', maxCount: 1 }];
for (let i = 1; i <= 15; i++) {
  uploadFields.push({ name: `player${i}Photo`, maxCount: 1 });
}

// Global Error Handler for async routes
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.post('/api/registrations', upload.fields(uploadFields), asyncHandler(async (req, res) => {
  const { teamName, captainName, captainPhone, paymentMode } = req.body;

  // Basic Validation
  if (!teamName || !captainName || !captainPhone || !paymentMode) {
    return res.status(400).json({ error: 'Missing required team fields (teamName, captainName, captainPhone, paymentMode).' });
  }

  // Duplicate Check
  const existingTeam = await pool.query('SELECT id FROM wbl_registrations WHERE team_name = $1', [teamName.trim()]);
  if (existingTeam.rows.length > 0) {
    return res.status(409).json({ error: 'A team with this exact name strongly matches an existing registration.' });
  }

  // Gather Files
  const teamLogoPath = req.files && req.files['teamLogo'] ? req.files['teamLogo'][0].filename : null;

  // Reconstruct Players JSON
  const players = [];
  for (let i = 1; i <= 15; i++) {
    const name = req.body[`player${i}Name`] || null;
    const phone = req.body[`player${i}Phone`] || null;
    const photoPath = req.files && req.files[`player${i}Photo`] ? req.files[`player${i}Photo`][0].filename : null;

    // Push even if empty, to maintain structure, as optional
    players.push({ playerIndex: i, name, phone, photoPath });
  }

  // Insert to Postgres
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

// Route not found & default error handing
app.use((req, res, next) => {
  res.status(404).json({ error: 'API route not found' });
});

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  if (err.code && err.code === '23505') { // Postgres Unique Violation
    return res.status(409).json({ error: 'Duplicate team name detected by database constraint.' });
  }
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

app.listen(port, () => {
  console.log(`WBL Backend listening on http://localhost:${port}`);
});
