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
app.use(cors()); app.use(express.json({limit:'7mb'}));
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req,file,cb) => file.mimetype?.startsWith('image/') ? cb(null,true) : cb(new Error('Only image files are allowed.')) });
const asyncHandler = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const cloudReady = () => process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_UPLOAD_PRESET;
async function saveImage(file, folder='wbl-2026') {
  if (!file) return null;
  if (!cloudReady()) throw new Error('Image storage is not configured yet.');
  const form = new FormData(); form.append('file',new Blob([file.buffer],{type:file.mimetype}),file.originalname); form.append('upload_preset',process.env.CLOUDINARY_UPLOAD_PRESET); form.append('folder',folder);
  const r=await fetch('https://api.cloudinary.com/v1_1/'+process.env.CLOUDINARY_CLOUD_NAME+'/image/upload',{method:'POST',body:form}); const d=await r.json(); if(!r.ok||!d.secure_url) throw new Error(d.error?.message||'Image upload failed.'); return d;
}
async function saveAuctionPhoto(dataUrl) {
  if (!dataUrl) return null;
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error('Please upload a JPG, PNG, WEBP, or GIF photo.');
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 5 * 1024 * 1024) throw new Error('Player photos must be 5 MB or smaller.');
  return (await saveImage({ buffer, mimetype: match[1], originalname: 'auction-player' }, 'wbl-2026/auction-players')).secure_url;
}
const ensure = async () => {
  await pool.query("ALTER TABLE wbl_registrations ADD COLUMN IF NOT EXISTS organiser_approval VARCHAR(20) NOT NULL DEFAULT 'PENDING'");
  await pool.query("ALTER TABLE wbl_registrations ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'");
  await pool.query('CREATE TABLE IF NOT EXISTS wbl_gallery_images (id SERIAL PRIMARY KEY, image_url TEXT NOT NULL, cloudinary_public_id TEXT, caption VARCHAR(240), created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)');
  await pool.query("CREATE TABLE IF NOT EXISTS wbl_auction_registrations (id SERIAL PRIMARY KEY, full_name VARCHAR(120) NOT NULL, phone VARCHAR(30) NOT NULL, age SMALLINT NOT NULL CHECK (age BETWEEN 14 AND 50), playing_role VARCHAR(60) NOT NULL, batting_style VARCHAR(40), bowling_style VARCHAR(40), club_name VARCHAR(120), base_price VARCHAR(20) NOT NULL, photo_url TEXT, status VARCHAR(40) NOT NULL DEFAULT 'PENDING', created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)");
  await pool.query("ALTER TABLE wbl_auction_registrations ADD COLUMN IF NOT EXISTS photo_url TEXT");
  await pool.query("ALTER TABLE wbl_auction_registrations ALTER COLUMN status SET DEFAULT 'PENDING'");
  await pool.query("UPDATE wbl_auction_registrations SET status = 'PENDING' WHERE status IS NULL OR status = '' OR status = 'PENDING VERIFICATION'");
};
let ready; const init=()=>ready||(ready=ensure().catch(e=>{ready=null;throw e}));
function admin(req,res,next){const a=Buffer.from(process.env.ADMIN_PASSWORD||'');const b=Buffer.from(req.get('x-admin-password')||'');if(!a.length||a.length!==b.length||!crypto.timingSafeEqual(a,b))return res.status(401).json({error:'Enter the correct admin password.'});next()}
function players(value,req){let list=value;if(typeof list==='string'){try{list=JSON.parse(list)}catch{list=[]}}return (Array.isArray(list)?list:[]).map(p=>({...p,photoUrl:/^https?:/i.test(p.photoPath||'')?p.photoPath:null}))}
app.post('/api/registrations',upload.fields([{name:'teamLogo',maxCount:1},...Array.from({length:15},(_,i)=>({name:'player'+(i+1)+'Photo',maxCount:1}))]),asyncHandler(async(req,res)=>{
  const {teamName,captainName,captainPhone,paymentMode}=req.body;if(!teamName||!captainName||!captainPhone||!paymentMode)return res.status(400).json({error:'Complete all required team details.'}); await init();
  if((await pool.query('SELECT id FROM wbl_registrations WHERE LOWER(team_name)=LOWER($1)',[teamName.trim()])).rows.length)return res.status(409).json({error:'A team with this name is already registered.'});
  const logo=await saveImage(req.files?.teamLogo?.[0]); const roster=[];
  for(let i=1;i<=15;i++){const f=req.files?.['player'+i+'Photo']?.[0];const photo=f?(await saveImage(f)).secure_url:null;roster.push({playerIndex:i,name:req.body['player'+i+'Name']||null,phone:req.body['player'+i+'Phone']||null,photoPath:photo})}
  const result=await pool.query('INSERT INTO wbl_registrations (team_name,captain_name,captain_phone,payment_mode,team_logo_path,players) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',[teamName.trim(),captainName.trim(),captainPhone.trim(),paymentMode,logo?.secure_url||null,JSON.stringify(roster)]);res.status(201).json({message:'Team successfully registered!',registrationId:result.rows[0].id});
}));
app.get('/api/admin/dashboard',admin,asyncHandler(async(req,res)=>{await init();const [t,a,g]=await Promise.all([pool.query('SELECT * FROM wbl_registrations ORDER BY created_at DESC,id DESC'),pool.query('SELECT * FROM wbl_auction_registrations ORDER BY created_at DESC,id DESC'),pool.query('SELECT id,image_url,caption,created_at FROM wbl_gallery_images ORDER BY created_at DESC,id DESC')]);res.json({teams:t.rows.map(x=>({id:x.id,teamName:x.team_name,captainName:x.captain_name,captainPhone:x.captain_phone,paymentMode:x.payment_mode,organiserApproval:x.organiser_approval,paymentStatus:x.payment_status,createdAt:x.created_at,teamLogoUrl:x.team_logo_path,players:players(x.players,req)})),auctionPlayers:a.rows.map(x=>({id:x.id,fullName:x.full_name,phone:x.phone,age:x.age,role:x.playing_role,battingStyle:x.batting_style,bowlingStyle:x.bowling_style,clubName:x.club_name,basePrice:x.base_price,photoUrl:x.photo_url,status:x.status,createdAt:x.created_at})),gallery:g.rows.map(x=>({id:x.id,url:x.image_url,caption:x.caption||'',createdAt:x.created_at}))})}));
app.patch('/api/admin/teams/:id/review',admin,asyncHandler(async(req,res)=>{await init();const approval=String(req.body.organiserApproval||'').toUpperCase(),payment=String(req.body.paymentStatus||'').toUpperCase();if(!['PENDING','APPROVED','REJECTED'].includes(approval)||!['PENDING','PAID','PARTIALLY PAID','NOT REQUIRED'].includes(payment))return res.status(400).json({error:'Invalid status.'});const r=await pool.query('UPDATE wbl_registrations SET organiser_approval=$1,payment_status=$2 WHERE id=$3 RETURNING id,organiser_approval,payment_status',[approval,payment,req.params.id]);if(!r.rows[0])return res.status(404).json({error:'Registration not found.'});res.json({id:r.rows[0].id,organiserApproval:r.rows[0].organiser_approval,paymentStatus:r.rows[0].payment_status})}));
app.get('/api/gallery',asyncHandler(async(req,res)=>{await init();const r=await pool.query('SELECT id,image_url,caption FROM wbl_gallery_images ORDER BY created_at DESC,id DESC');res.json(r.rows.map(x=>({id:x.id,url:x.image_url,caption:x.caption||''})))}));
app.post('/api/admin/gallery',admin,upload.single('image'),asyncHandler(async(req,res)=>{await init();const image=await saveImage(req.file,'wbl-2026/gallery');const r=await pool.query('INSERT INTO wbl_gallery_images(image_url,cloudinary_public_id,caption) VALUES($1,$2,$3) RETURNING id,image_url,caption,created_at',[image.secure_url,image.public_id,String(req.body.caption||'').trim().slice(0,240)]);const x=r.rows[0];res.status(201).json({id:x.id,url:x.image_url,caption:x.caption||'',createdAt:x.created_at})}));
app.delete('/api/admin/gallery/:id',admin,asyncHandler(async(req,res)=>{await init();const r=await pool.query('DELETE FROM wbl_gallery_images WHERE id=$1 RETURNING id',[req.params.id]);if(!r.rows[0])return res.status(404).json({error:'Image not found.'});res.json({removed:true})}));
app.get('/api/auction/registrations',asyncHandler(async(req,res)=>{await init();const r=await pool.query("SELECT id,full_name,playing_role,batting_style,bowling_style,club_name,base_price,photo_url,created_at FROM wbl_auction_registrations WHERE status='APPROVED' ORDER BY created_at DESC,id DESC");res.json(r.rows.map(x=>({id:x.id,name:x.full_name,role:x.playing_role,battingStyle:x.batting_style,bowlingStyle:x.bowling_style,clubName:x.club_name,basePrice:x.base_price,photoUrl:x.photo_url,createdAt:x.created_at,status:'APPROVED'})))}));
app.post('/api/auction/registrations',asyncHandler(async(req,res)=>{const {name,phone,age,role,battingStyle,bowlingStyle,club,basePrice,photoUrl}=req.body;const n=Number(age);if(!name?.trim()||!phone?.trim()||!Number.isInteger(n)||n<14||n>50||!role?.trim()||!basePrice)return res.status(400).json({error:'Please provide valid player details.'});await init();const photo=await saveAuctionPhoto(photoUrl);const r=await pool.query('INSERT INTO wbl_auction_registrations(full_name,phone,age,playing_role,batting_style,bowling_style,club_name,base_price,photo_url) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id,status',[name.trim(),phone.trim(),n,role.trim(),battingStyle||null,bowlingStyle||null,club?.trim()||null,basePrice,photo]);res.status(201).json({message:'Player nomination received. Organiser approval is pending.',registrationId:r.rows[0].id,status:r.rows[0].status})}));
app.patch('/api/admin/auction/registrations/:id/review',admin,asyncHandler(async(req,res)=>{await init();const status=String(req.body.status||'').toUpperCase();if(!['APPROVED','REJECTED','PENDING'].includes(status))return res.status(400).json({error:'Status must be APPROVED, REJECTED, or PENDING.'});const r=await pool.query('UPDATE wbl_auction_registrations SET status=$1 WHERE id=$2 RETURNING id,status',[status,req.params.id]);if(!r.rows[0])return res.status(404).json({error:'Player nomination not found.'});res.json({id:r.rows[0].id,status:r.rows[0].status})}));
app.use((req,res)=>res.status(404).json({error:'API route not found'}));
app.use((err,req,res,next)=>{console.error('SERVER ERROR:',err.stack);res.status(err.code==='23505'?409:500).json({error:err.message||'Unexpected server error.'})});
app.listen(port,()=>console.log('WBL Backend listening on port '+port));
