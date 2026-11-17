const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const util = require('util');
const path = require('path');
const fs = require('fs');

const scrypt = util.promisify(crypto.scrypt);
const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '200kb', verify: (req, res, buf) => { req.rawBody = buf; } }));

const PORT = process.env.PORT || 3000;
const pub = path.join(__dirname, 'public');
// ওয়ালেটের ঠিকানা: শেষের ফাঁকা জায়গা, / বা /api থাকলে নিজেই ঠিক করে নেয়
const WALLET_URL = (process.env.WALLET_API_URL || '').trim().replace(/\/+$/, '').replace(/\/api$/, '');
const WALLET_KEY = (process.env.WALLET_API_KEY || '').trim();
const WALLET_SECRET = (process.env.WALLET_WEBHOOK_SECRET || '').trim();

// ================= MongoDB =================
let dbState = 'not configured';
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      dbState = 'connected';
      // একটা ফোন নাম্বারে একটাই অ্যাকাউন্ট (পুরনো ডুপ্লিকেট থাকলে ইনডেক্স হবে না, তবে নতুন রেজিস্ট্রেশন তবুও আটকাবে)
      User.collection.createIndex({ phone: 1 }, { unique: true, sparse: true })
        .catch((e) => console.error('[ফোন ইনডেক্স] তৈরি হয়নি, পুরনো ডুপ্লিকেট নাম্বার আছে: ' + e.message));
    })
    .catch((e) => { dbState = 'error: ' + e.message; });
}
const ObjectId = mongoose.Schema.Types.ObjectId;

// ================= সাইটের সেটিংস (ডাটাবেসে থাকে, পরে অ্যাডমিন থেকে বদলানো যাবে) =================
const DEFAULT_CFG = {
  rate: Number(process.env.USD_RATE) || 125,
  tk: [
    { t: 'ad', n: 'স্পনসর বিজ্ঞাপন দেখুন', l: 'https://example.com/ad1', on: true },
    { t: 'ad', n: 'ব্যানার বিজ্ঞাপন ভিজিট', l: 'https://example.com/ad2', on: true },
    { t: 'ad', n: 'অ্যাপ প্রমো দেখুন', l: 'https://example.com/ad3', on: true },
    { t: 'ad', n: 'অফার বিজ্ঞাপন দেখুন', l: 'https://example.com/ad4', on: true },
    { t: 'vid', n: 'YouTube ভিডিও দেখুন', l: 'https://www.youtube.com', on: true },
    { t: 'vid', n: 'TikTok ভিডিও দেখুন', l: 'https://www.tiktok.com', on: true },
    { t: 'vid', n: 'Facebook রিলস দেখুন', l: 'https://www.facebook.com', on: true },
    { t: 'vid', n: 'Instagram রিলস দেখুন', l: 'https://www.instagram.com', on: true }
  ],
  pk: [
    { n: 'Free', pr: 0, lim: 4, rw: 1 },
    { n: 'Silver', pr: 500, lim: 8, rw: 4 },
    { n: 'Gold', pr: 1500, lim: 10, rw: 12 },
    { n: 'Diamond', pr: 5000, lim: 10, rw: 45 }
  ],
  bn: [
    { k: 'daily', n: 'ডেইলি বোনাস', v: 2, h: 24 },
    { k: 'login', n: 'লগইন বোনাস', v: 1, h: 24 },
    { k: 'week', n: 'সাপ্তাহিক বোনাস', v: 20, h: 168 },
    { k: 'month', n: 'মাসিক বোনাস', v: 100, h: 720 },
    { k: 'vip', n: 'মাসিক VIP বোনাস', v: 500, h: 720 }
  ],
  vipMin: 2,
  wv: [5, 10, 2, 20, 5, 1, 10, 50, 5, 2, 20, 10, 1, 5, 100, 2],
  ww: [14, 10, 16, 3, 14, 18, 10, 1, 14, 16, 3, 10, 18, 14, 0.3, 16],
  ref: { su: 20, pct: 5 },
  bnr: [
    { t: 'TechMart BD', d: 'সব গ্যাজেটে ২০% ছাড়', c: 0, on: true },
    { t: 'FoodieGo', d: 'প্রথম অর্ডারে ফ্রি ডেলিভারি', c: 1, on: true },
    { t: 'LearnFast', d: 'অনলাইন কোর্সে বিশেষ অফার', c: 2, on: true }
  ],
  pr: [
    { n: 'TechMart BD', d: 'গ্যাজেট স্টোর ভিজিট করুন', l: 'https://example.com/techmart', rw: 6, c: 0, on: true },
    { n: 'FoodieGo', d: 'অ্যাপ ইনস্টল পেজ দেখুন', l: 'https://example.com/foodiego', rw: 8, c: 1, on: true },
    { n: 'LearnFast', d: 'ফ্রি কোর্স দেখুন', l: 'https://example.com/learnfast', rw: 5, c: 2, on: true },
    { n: 'PayEasy', d: 'ওয়ালেট অফার দেখুন', l: 'https://example.com/payeasy', rw: 10, c: 3, on: true },
    { n: 'TravelBD', d: 'ট্যুর প্যাকেজ দেখুন', l: 'https://example.com/travelbd', rw: 7, c: 1, on: true },
    { n: 'StyleHub', d: 'ফ্যাশন কালেকশন দেখুন', l: 'https://example.com/stylehub', rw: 6, c: 2, on: true }
  ],
  smm: [
    { pf: 'YouTube', sv: 'Subscribers', p: 4.5, on: true }, { pf: 'YouTube', sv: 'Views', p: 1.2, on: true }, { pf: 'YouTube', sv: 'Likes', p: 2, on: true },
    { pf: 'TikTok', sv: 'Followers', p: 2.8, on: true }, { pf: 'TikTok', sv: 'Likes', p: 0.9, on: true }, { pf: 'TikTok', sv: 'Views', p: 0.15, on: true },
    { pf: 'Instagram', sv: 'Followers', p: 3.2, on: true }, { pf: 'Instagram', sv: 'Likes', p: 1.1, on: true }, { pf: 'Instagram', sv: 'Views', p: 0.2, on: true },
    { pf: 'Facebook', sv: 'Page Followers', p: 2.5, on: true }, { pf: 'Facebook', sv: 'Post Likes', p: 1.5, on: true }, { pf: 'Facebook', sv: 'Page Likes', p: 2.2, on: true },
    { pf: 'Telegram', sv: 'Channel Members', p: 2.2, on: true }, { pf: 'Telegram', sv: 'Post Views', p: 0.3, on: true }, { pf: 'Telegram', sv: 'Reactions', p: 0.8, on: true },
    { pf: 'Twitter / X', sv: 'Followers', p: 4, on: true }, { pf: 'Twitter / X', sv: 'Likes', p: 2.4, on: true }, { pf: 'Twitter / X', sv: 'Retweets', p: 2.8, on: true },
    { pf: 'Snapchat', sv: 'Followers', p: 3.5, on: true }, { pf: 'Snapchat', sv: 'Story Views', p: 0.9, on: true },
    { pf: 'Pinterest', sv: 'Followers', p: 3, on: true }, { pf: 'Pinterest', sv: 'Saves', p: 1.8, on: true },
    { pf: 'LinkedIn', sv: 'Followers', p: 6, on: true }, { pf: 'LinkedIn', sv: 'Post Likes', p: 3, on: true },
    { pf: 'Twitch', sv: 'Followers', p: 5, on: true }, { pf: 'Twitch', sv: 'Live Viewers', p: 4.5, on: true },
    { pf: 'Spotify', sv: 'Plays', p: 1.2, on: true }, { pf: 'Spotify', sv: 'Followers', p: 3.8, on: true },
    { pf: 'Threads', sv: 'Followers', p: 3.4, on: true }, { pf: 'Threads', sv: 'Likes', p: 1.6, on: true },
    { pf: 'WhatsApp', sv: 'Channel Followers', p: 3.2, on: true }, { pf: 'WhatsApp', sv: 'Reactions', p: 1.1, on: true }
  ],
  set: { name: 'EarnHub', bk: '01XXX-XXXXXX', ng: '01YYY-YYYYYY', minwd: 200, mindep: 50 }
};
const Config = mongoose.model('Config', new mongoose.Schema({ key: { type: String, unique: true }, data: mongoose.Schema.Types.Mixed }));
let cfgCache = null;
let cfgAt = 0;
async function getCfg(force) {
  if (!force && cfgCache && Date.now() - cfgAt < 30000) return cfgCache;
  let d = await Config.findOne({ key: 'main' });
  if (!d) {
    try { d = await Config.create({ key: 'main', data: DEFAULT_CFG }); }
    catch (e) { d = await Config.findOne({ key: 'main' }); }
  }
  cfgCache = Object.assign({}, DEFAULT_CFG, d.data);
  cfgAt = Date.now();
  return cfgCache;
}
// ইউজারকে পাঠানো সেটিংস (স্পিনের সম্ভাবনা গোপন থাকে)
function publicCfg(c) { const o = Object.assign({}, c); delete o.ww; return o; }

// ================= মডেল =================
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  phone: String,
  site: { type: String, enum: ['smm', 'free'], required: true },
  salt: String,
  hash: String,
  balance: { type: Number, default: 0 },   // smm: USD, free: BDT
  pkg: { type: Number, default: 0 },
  earn: { type: Number, default: 0 },
  banned: { type: Boolean, default: false },
  refCode: { type: String, unique: true, sparse: true },
  referredBy: { type: ObjectId },
  refPaid: { type: Boolean, default: false },
  today: { d: String, tasks: [String], promos: [String], earned: { type: Number, default: 0 } },
  last: { daily: Date, login: Date, week: Date, month: Date, vip: Date },
  spinDay: String,
  photo: String,
  createdAt: { type: Date, default: Date.now }
}));

const reqSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', index: true },
  username: String,
  site: String,
  type: { type: String, enum: ['deposit', 'withdraw'] },
  amount: Number,        // সাইটের মুদ্রায়
  amountBdt: Number,
  method: String,        // bKash / Nagad
  reference: String,     // ডিপোজিট: Transaction ID, উইথড্র: নাম্বার
  status: { type: String, default: 'pending', index: true },
  walletSent: { type: Boolean, default: false },
  walletError: String,
  walletTries: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  doneAt: Date
});
// একই ডিপোজিট Transaction ID দুইবার ব্যবহার করা যাবে না
reqSchema.index({ reference: 1 }, { unique: true, partialFilterExpression: { type: 'deposit' } });
const Req = mongoose.model('Req', reqSchema);

// ব্যালেন্সের প্রতিটা পরিবর্তনের খাতা (হিসাব মেলানোর জন্য)
const Ledger = mongoose.model('Ledger', new mongoose.Schema({
  user: { type: ObjectId, index: true },
  delta: Number,
  kind: String,
  note: String,
  earn: { type: Boolean, default: false },
  at: { type: Date, default: Date.now, index: true }
}));

// টাস্ক শুরুর সময় (১০ সেকেন্ড অপেক্ষা সার্ভারে যাচাই হয়)
const startSchema = new mongoose.Schema({ user: ObjectId, id: String, at: { type: Date, default: Date.now } });
startSchema.index({ user: 1, id: 1 }, { unique: true });
startSchema.index({ at: 1 }, { expireAfterSeconds: 3600 });
const Start = mongoose.model('Start', startSchema);

const Order = mongoose.model('Order', new mongoose.Schema({
  user: { type: ObjectId, index: true }, username: String, pf: String, sv: String, link: String,
  qty: Number, cost: Number, status: { type: String, default: 'Pending' }, createdAt: { type: Date, default: Date.now }
}));
const Custom = mongoose.model('Custom', new mongoose.Schema({
  user: ObjectId, username: String, text: String, link: String, budget: Number, createdAt: { type: Date, default: Date.now }
}));
const Support = mongoose.model('Support', new mongoose.Schema({
  user: ObjectId, username: String, message: String, createdAt: { type: Date, default: Date.now }
}));

// ================= হেল্পার =================
const SECRET =
  process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update('earnhub:' + (process.env.ADMIN_PASS || 'x')).digest('hex');
const sign = (v) => crypto.createHmac('sha256', SECRET).update(v).digest('hex');
function safeEq(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}
function getCookie(req, name) {
  const parts = (req.headers.cookie || '').split(';').map((s) => s.trim());
  for (const p of parts) {
    const i = p.indexOf('=');
    if (i > 0 && p.slice(0, i) === name) return decodeURIComponent(p.slice(i + 1));
  }
  return '';
}
const ah = (fn) => (req, res, next) =>
  fn(req, res, next).catch((e) => { console.error(e); res.status(500).json({ ok: false, msg: 'server error' }); });
function needDb(req, res, next) {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ ok: false, msg: 'database not ready' });
  next();
}
const hits = new Map();
function limit(max, windowMs) {
  return (req, res, next) => {
    const k = req.ip + req.path;
    const now = Date.now();
    const h = (hits.get(k) || []).filter((t) => now - t < windowMs);
    if (h.length >= max) return res.status(429).json({ ok: false, msg: 'অনেক বেশি অনুরোধ, একটু পরে চেষ্টা করুন।' });
    h.push(now);
    hits.set(k, h);
    next();
  };
}
const dayKey = () => new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10); // ঢাকার তারিখ
const mask = (n) => (n.length <= 4 ? n[0] + '***' : n.slice(0, 2) + '***' + n.slice(-2));
const round2 = (n) => Math.round(n * 100) / 100;

// ================= অ্যাডমিন গেট (পাসওয়ার্ড, ১ ঘণ্টা লক) =================
const MAX_TRIES = 3;
const LOCK_MS = 60 * 60 * 1000;
const ADMIN_SESSION_MS = 8 * 60 * 60 * 1000;
const attempts = new Map();
const makeAdminToken = () => { const exp = String(Date.now() + ADMIN_SESSION_MS); return exp + '.' + sign('admin:' + exp); };
function validAdminToken(t) {
  if (!t) return false;
  const [exp, sig] = t.split('.');
  if (!exp || !sig) return false;
  return safeEq(sig, sign('admin:' + exp)) && Number(exp) > Date.now();
}
app.post('/api/admin-login', (req, res) => {
  const pass = process.env.ADMIN_PASS;
  if (!pass) return res.status(503).json({ ok: false, msg: 'ADMIN_PASS is not set' });
  const ip = req.ip;
  const now = Date.now();
  const rec = attempts.get(ip) || { fails: 0, lockUntil: 0 };
  if (rec.lockUntil > now) {
    console.log('ADMIN LOGIN while locked, ip=' + ip);
    return res.status(429).json({ ok: false, locked: true, retryAfter: Math.ceil((rec.lockUntil - now) / 1000) });
  }
  const given = (req.body && req.body.password) || '';
  if (safeEq(given, pass)) {
    attempts.delete(ip);
    res.setHeader('Set-Cookie', 'eh_admin=' + makeAdminToken() + '; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=' + ADMIN_SESSION_MS / 1000);
    return res.json({ ok: true });
  }
  rec.fails += 1;
  console.log('ADMIN LOGIN FAILED, ip=' + ip + ', count=' + rec.fails);
  if (rec.fails >= MAX_TRIES) {
    rec.fails = 0;
    rec.lockUntil = now + LOCK_MS;
    attempts.set(ip, rec);
    return res.status(429).json({ ok: false, locked: true, retryAfter: LOCK_MS / 1000 });
  }
  attempts.set(ip, rec);
  res.status(401).json({ ok: false, left: MAX_TRIES - rec.fails });
});
function adminOnly(req, res, next) {
  if (validAdminToken(getCookie(req, 'eh_admin'))) return next();
  res.redirect('/');
}

// ================= ইউজার অ্যাকাউন্ট =================
const USER_SESSION_MS = 30 * 24 * 60 * 60 * 1000;
function setUserCookie(res, id) {
  const exp = String(Date.now() + USER_SESSION_MS);
  res.setHeader('Set-Cookie', 'eh_user=' + id + '.' + exp + '.' + sign('u:' + id + '.' + exp) + '; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=' + USER_SESSION_MS / 1000);
}
async function hashPw(pw, salt) { return (await scrypt(pw, salt, 64)).toString('hex'); }
const publicUser = (u) => ({ username: u.username, site: u.site, balance: u.balance, pkg: u.pkg, earn: u.earn, photo: u.photo || '', refCode: u.refCode || '' });
function newRefCode() { return 'EH' + crypto.randomBytes(4).toString('hex').slice(0, 5).toUpperCase(); }

async function auth(req, res, next) {
  try {
    const [id, exp, sig] = getCookie(req, 'eh_user').split('.');
    if (!id || !exp || !sig || !safeEq(sig, sign('u:' + id + '.' + exp)) || Number(exp) < Date.now() || !mongoose.isValidObjectId(id)) {
      return res.status(401).json({ ok: false, msg: 'login required' });
    }
    const u = await User.findById(id);
    if (!u || u.banned) return res.status(401).json({ ok: false, msg: 'login required' });
    req.user = u;
    next();
  } catch (e) { res.status(500).json({ ok: false, msg: 'server error' }); }
}
function onlySite(site) {
  return (req, res, next) => {
    if (req.user.site !== site) return res.status(403).json({ ok: false, msg: 'এই অ্যাকাউন্টে এটা চলবে না।' });
    next();
  };
}

app.post('/api/register', needDb, limit(10, 60000), ah(async (req, res) => {
  const { username = '', phone = '', password = '', site = '', ref = '' } = req.body || {};
  const un = String(username).trim().toLowerCase();
  if (!/^[a-z0-9_.]{3,20}$/.test(un)) return res.status(400).json({ ok: false, msg: 'ইউজারনেম ৩–২০ অক্ষর, শুধু ইংরেজি অক্ষর, সংখ্যা, _ বা .' });
  if (!/^01\d{9}$/.test(String(phone))) return res.status(400).json({ ok: false, msg: 'সঠিক ১১ সংখ্যার ফোন নাম্বার দিন।' });
  if (String(password).length < 6) return res.status(400).json({ ok: false, msg: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
  if (!['smm', 'free'].includes(site)) return res.status(400).json({ ok: false, msg: 'সাইট বেছে নিন।' });
  if (await User.exists({ username: un })) return res.status(409).json({ ok: false, msg: 'এই ইউজারনেম আগেই নেওয়া হয়েছে। অন্য নাম দিন।' });
  if (await User.exists({ phone: String(phone) })) return res.status(409).json({ ok: false, msg: 'এই ফোন নাম্বার দিয়ে আগেই একটি অ্যাকাউন্ট খোলা হয়েছে। একটা নাম্বারে একটাই অ্যাকাউন্ট চলবে।' });
  let referredBy;
  if (site === 'free' && ref) {
    const rf = await User.findOne({ refCode: String(ref).trim().toUpperCase(), site: 'free' });
    if (rf) referredBy = rf._id;
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await hashPw(String(password), salt);
  for (let i = 0; i < 5; i++) {
    try {
      const u = await User.create({ username: un, phone: String(phone), site, salt, hash, refCode: site === 'free' ? newRefCode() : undefined, referredBy });
      setUserCookie(res, u._id);
      return res.json({ ok: true, user: publicUser(u) });
    } catch (e) {
      if (e.code === 11000 && e.keyPattern && e.keyPattern.refCode) continue;
      if (e.code === 11000 && e.keyPattern && e.keyPattern.phone) return res.status(409).json({ ok: false, msg: 'এই ফোন নাম্বার দিয়ে আগেই একটি অ্যাকাউন্ট খোলা হয়েছে। একটা নাম্বারে একটাই অ্যাকাউন্ট চলবে।' });
      if (e.code === 11000) return res.status(409).json({ ok: false, msg: 'এই ইউজারনেম আগেই নেওয়া হয়েছে। অন্য নাম দিন।' });
      throw e;
    }
  }
  res.status(500).json({ ok: false, msg: 'আবার চেষ্টা করুন।' });
}));

app.post('/api/login', needDb, limit(15, 60000), ah(async (req, res) => {
  const { username = '', password = '' } = req.body || {};
  const u = await User.findOne({ username: String(username).trim().toLowerCase() });
  if (!u || u.banned || !safeEq(await hashPw(String(password), u.salt), u.hash)) {
    return res.status(401).json({ ok: false, msg: 'ইউজারনেম বা পাসওয়ার্ড মিলছে না।' });
  }
  setUserCookie(res, u._id);
  res.json({ ok: true, user: publicUser(u) });
}));

app.post('/api/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'eh_user=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  res.json({ ok: true });
});

app.get('/api/me', needDb, auth, (req, res) => res.json({ ok: true, user: publicUser(req.user) }));

// পুরো অবস্থা: ব্যালেন্স, আজকের কাজ, বোনাসের সময়, সেটিংস
app.get('/api/state', needDb, auth, limit(120, 60000), ah(async (req, res) => {
  const u = req.user;
  if (u.site === 'free' && !u.refCode) { u.refCode = newRefCode(); await u.save().catch(() => {}); }
  const cfg = await getCfg();
  const day = dayKey();
  const t = u.today && u.today.d === day ? u.today : { tasks: [], promos: [], earned: 0 };
  const refs = await User.countDocuments({ referredBy: u._id });
  const pendingReq = await Req.countDocuments({ user: u._id, status: 'pending' });
  res.json({
    ok: true,
    user: publicUser(u),
    today: { tasks: t.tasks || [], promos: t.promos || [], earned: t.earned || 0 },
    last: u.last || {},
    spinToday: u.spinDay === day,
    refs: { count: refs },
    pendingRequests: pendingReq,
    cfg: publicCfg(cfg)
  });
}));

// ================= ওয়ালেটে অনুরোধ পাঠানো =================
async function sendToWallet(r, timeoutMs) {
  if (!WALLET_URL || !WALLET_KEY) {
    r.walletError = 'WALLET_API_URL বা WALLET_API_KEY সেট করা নেই';
    try { await r.save(); } catch (e) {}
    return false;
  }
  try {
    const resp = await fetch(WALLET_URL + '/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': WALLET_KEY },
      body: JSON.stringify({
        requestId: String(r._id),
        type: r.type,
        site: r.site,
        username: r.username,
        amount: r.amount,
        currency: r.site === 'smm' ? 'USD' : 'BDT',
        amountBdt: r.amountBdt,
        method: r.method,
        reference: r.reference
      }),
      signal: AbortSignal.timeout(timeoutMs || 40000)
    });
    if (resp.ok) {
      r.walletSent = true;
      r.walletError = undefined;
      await r.save();
      console.log('[wallet] ' + r.type + ' ' + r._id + ' -> পাঠানো হয়েছে');
      return true;
    }
    r.walletError = 'ওয়ালেট উত্তর দিয়েছে HTTP ' + resp.status;
  } catch (e) {
    r.walletError = 'সংযোগ হয়নি: ' + e.message;
  }
  r.walletTries = (r.walletTries || 0) + 1;
  console.error('[wallet] ' + r.type + ' ' + r._id + ' -> ' + r.walletError);
  try { await r.save(); } catch (e) {}
  return false;
}
let retrying = false;
setInterval(async () => {
  if (retrying || mongoose.connection.readyState !== 1) return;
  retrying = true;
  try {
    const list = await Req.find({ walletSent: false, status: 'pending' }).limit(20);
    for (const r of list) await sendToWallet(r, 40000);
  } catch (e) { console.error('retry error: ' + e.message); }
  retrying = false;
}, 60000);

app.get('/api/wallet-check', limit(6, 60000), ah(async (req, res) => {
  const out = { db: dbState, urlSet: !!WALLET_URL, keySet: !!WALLET_KEY, secretSet: !!WALLET_SECRET };
  try { out.walletHost = new URL(WALLET_URL).host; } catch (e) { out.walletHost = 'ঠিকানা নেই বা ভুল'; }
  if (mongoose.connection.readyState === 1) {
    out.unsent = await Req.countDocuments({ walletSent: false, status: 'pending' });
    const recent = await Req.find().sort({ createdAt: -1 }).limit(8);
    out.recent = recent.map((r) => ({
      type: r.type, status: r.status, walletSent: r.walletSent, tries: r.walletTries || 0,
      error: r.walletError || null, minutesAgo: Math.round((Date.now() - r.createdAt) / 60000)
    }));
  }
  if (WALLET_URL) {
    try {
      const p = await fetch(WALLET_URL + '/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': WALLET_KEY },
        body: '{}',
        signal: AbortSignal.timeout(40000)
      });
      out.walletProbe = p.status;
      out.meaning = ({
        400: 'ঠিক আছে: ঠিকানা ও কী দুটোই মিলেছে',
        401: 'কী মেলেনি: দুই জায়গার কী হুবহু এক করুন',
        404: 'ওয়ালেটে earnhub.js লোড হয়নি বা ঠিকানা ভুল'
      })[p.status] || 'অন্য উত্তর';
    } catch (e) { out.walletProbe = 'সংযোগ হয়নি: ' + e.message; }
  }
  res.json(out);
}));

// ================= ডিপোজিট / উইথড্র =================
app.post('/api/deposit', needDb, auth, limit(10, 60000), ah(async (req, res) => {
  const { amount, method, trx } = req.body || {};
  const a = Number(amount);
  const u = req.user;
  const cfg = await getCfg();
  const min = u.site === 'smm' ? 1 : Number(cfg.set.mindep) || 50;
  if (!(a >= min)) return res.status(400).json({ ok: false, msg: 'পরিমাণ কমপক্ষে ' + (u.site === 'smm' ? '$1' : '৳' + min) + ' দিন।' });
  if (!['bKash', 'Nagad'].includes(method)) return res.status(400).json({ ok: false, msg: 'পেমেন্ট মাধ্যম বেছে নিন।' });
  const ref = String(trx || '').trim();
  if (ref.length < 6 || ref.length > 40) return res.status(400).json({ ok: false, msg: 'সঠিক Transaction ID দিন।' });
  let r;
  try {
    r = await Req.create({
      user: u._id, username: u.username, site: u.site, type: 'deposit', amount: a,
      amountBdt: u.site === 'smm' ? Math.round(a * cfg.rate) : a, method, reference: ref
    });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ ok: false, msg: 'এই Transaction ID আগেই ব্যবহার হয়েছে।' });
    throw e;
  }
  const sent = await sendToWallet(r, 8000);
  res.json({ ok: true, id: r._id, status: r.status, walletSent: sent });
}));

app.post('/api/withdraw', needDb, auth, onlySite('free'), limit(10, 60000), ah(async (req, res) => {
  const { amount, method, account } = req.body || {};
  const a = Number(amount);
  const u = req.user;
  const cfg = await getCfg();
  const min = Number(cfg.set.minwd) || 200;
  if (!(a >= min)) return res.status(400).json({ ok: false, msg: 'কমপক্ষে ৳' + min + ' উইথড্র করা যাবে।' });
  if (!['bKash', 'Nagad'].includes(method)) return res.status(400).json({ ok: false, msg: 'পেমেন্ট মাধ্যম বেছে নিন।' });
  if (!/^01\d{9}$/.test(String(account || ''))) return res.status(400).json({ ok: false, msg: 'সঠিক নাম্বার দিন (01XXXXXXXXX)।' });
  let doc = null;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const ok = await User.findOneAndUpdate({ _id: u._id, balance: { $gte: a } }, { $inc: { balance: -a } }, { session });
      if (!ok) { doc = null; return; }
      const made = await Req.create([{ user: u._id, username: u.username, site: u.site, type: 'withdraw', amount: a, amountBdt: a, method, reference: String(account) }], { session });
      doc = made[0];
      await Ledger.create([{ user: u._id, delta: -a, kind: 'withdraw', note: String(doc._id) }], { session });
    });
  } finally { session.endSession(); }
  if (!doc) return res.status(400).json({ ok: false, msg: 'ব্যালেন্স যথেষ্ট নয়।' });
  const sent = await sendToWallet(doc, 8000);
  res.json({ ok: true, id: doc._id, status: doc.status, walletSent: sent });
}));

app.get('/api/requests', needDb, auth, ah(async (req, res) => {
  const list = await Req.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ ok: true, items: list.map((r) => ({ id: r._id, type: r.type, amount: r.amount, method: r.method, reference: r.reference, status: (r.status === 'pending' && !r.walletSent) ? '⚠️ ওয়ালেটে এখনো পৌঁছায়নি, আবার চেষ্টা চলছে' : r.status, error: r.walletError || null, createdAt: r.createdAt })) });
}));

// লাইভ ট্রানজ্যাকশন: শুধু ওয়ালেটে অ্যাপ্রুভ হওয়া, নাম আংশিক ঢাকা
app.get('/api/live', needDb, ah(async (req, res) => {
  const list = await Req.find({ status: 'approved' }).sort({ doneAt: -1 }).limit(10);
  res.json({ ok: true, items: list.map((r) => ({ name: mask(r.username), type: r.type, amountBdt: r.amountBdt, at: r.doneAt })) });
}));

// ================= Free Income: আয় (সব হিসাব সার্ভারে) =================
// ব্যালেন্স বদলানো + খাতায় লেখা + রেফারেল কমিশন
async function earnLog(userDoc, amount, kind, note) {
  await Ledger.create({ user: userDoc._id, delta: amount, kind, note, earn: true });
  if (userDoc.referredBy) {
    const cfg = await getCfg();
    const c = Math.round(amount * (Number(cfg.ref.pct) || 0)) / 100;
    if (c > 0) {
      await User.updateOne({ _id: userDoc.referredBy }, { $inc: { balance: c, earn: c } });
      await Ledger.create({ user: userDoc.referredBy, delta: c, kind: 'refcom', note: userDoc.username, earn: true });
    }
  }
}
function taskInfo(cfg, id) {
  let m = /^(ad|vid)(\d+)$/.exec(id);
  if (m) {
    const list = (cfg.tk || []).filter((t) => t.t === m[1]);
    const t = list[Number(m[2])];
    return t && t.on !== false ? { kind: 'task' } : null;
  }
  m = /^p(\d+)$/.exec(id);
  if (m) {
    const p = (cfg.pr || [])[Number(m[1])];
    return p && p.on !== false ? { kind: 'promo', rw: Number(p.rw) } : null;
  }
  return null;
}
async function rollDay(uid) {
  const day = dayKey();
  await User.updateOne({ _id: uid, 'today.d': { $ne: day } }, { $set: { today: { d: day, tasks: [], promos: [], earned: 0 } } });
  return day;
}

app.post('/api/task/start', needDb, auth, onlySite('free'), limit(60, 60000), ah(async (req, res) => {
  const id = String((req.body || {}).id || '');
  const cfg = await getCfg();
  if (!taskInfo(cfg, id)) return res.status(400).json({ ok: false, msg: 'টাস্কটা পাওয়া যায়নি।' });
  await Start.updateOne({ user: req.user._id, id }, { $set: { at: new Date() } }, { upsert: true });
  res.json({ ok: true, wait: 10 });
}));

app.post('/api/task/claim', needDb, auth, onlySite('free'), limit(60, 60000), ah(async (req, res) => {
  const id = String((req.body || {}).id || '');
  const u = req.user;
  const cfg = await getCfg();
  const info = taskInfo(cfg, id);
  if (!info) return res.status(400).json({ ok: false, msg: 'টাস্কটা পাওয়া যায়নি।' });
  const day = await rollDay(u._id);
  const st = await Start.findOneAndDelete({ user: u._id, id, at: { $lte: new Date(Date.now() - 9000) } });
  if (!st) return res.status(400).json({ ok: false, msg: 'আগে টাস্ক শুরু করে ১০ সেকেন্ড অপেক্ষা করুন।' });
  const pk = cfg.pk[u.pkg] || cfg.pk[0];
  let done;
  if (info.kind === 'task') {
    done = await User.findOneAndUpdate(
      { _id: u._id, 'today.d': day, 'today.tasks': { $ne: id }, $expr: { $lt: [{ $size: { $ifNull: ['$today.tasks', []] } }, Number(pk.lim)] } },
      { $push: { 'today.tasks': id }, $inc: { balance: Number(pk.rw), earn: Number(pk.rw), 'today.earned': Number(pk.rw) } },
      { new: true }
    );
    if (!done) return res.status(400).json({ ok: false, msg: 'আজকের লিমিট শেষ, অথবা এই টাস্ক আগেই করা হয়েছে।' });
    await earnLog(done, Number(pk.rw), 'task', id);
    return res.json({ ok: true, reward: Number(pk.rw), balance: done.balance });
  }
  done = await User.findOneAndUpdate(
    { _id: u._id, 'today.d': day, 'today.promos': { $ne: id } },
    { $push: { 'today.promos': id }, $inc: { balance: info.rw, earn: info.rw, 'today.earned': info.rw } },
    { new: true }
  );
  if (!done) return res.status(400).json({ ok: false, msg: 'এই প্রমোশনের কাজ আজ আগেই করা হয়েছে।' });
  await earnLog(done, info.rw, 'promo', id);
  res.json({ ok: true, reward: info.rw, balance: done.balance });
}));

app.post('/api/bonus/claim', needDb, auth, onlySite('free'), limit(30, 60000), ah(async (req, res) => {
  const key = String((req.body || {}).key || '');
  const u = req.user;
  const cfg = await getCfg();
  const b = (cfg.bn || []).find((x) => x.k === key);
  if (!b || !['daily', 'login', 'week', 'month', 'vip'].includes(key)) return res.status(400).json({ ok: false, msg: 'বোনাস পাওয়া যায়নি।' });
  if (key === 'vip' && u.pkg < Number(cfg.vipMin)) return res.status(403).json({ ok: false, msg: 'VIP বোনাসের জন্য ' + cfg.pk[cfg.vipMin].n + ' বা তার উপরের প্যাকেজ লাগবে।' });
  const f = 'last.' + key;
  const since = new Date(Date.now() - Number(b.h) * 36e5);
  const done = await User.findOneAndUpdate(
    { _id: u._id, $or: [{ [f]: { $exists: false } }, { [f]: null }, { [f]: { $lte: since } }] },
    { $set: { [f]: new Date() }, $inc: { balance: Number(b.v), earn: Number(b.v) } },
    { new: true }
  );
  if (!done) return res.status(400).json({ ok: false, msg: 'এই বোনাস এখনো নেওয়ার সময় হয়নি।' });
  await earnLog(done, Number(b.v), 'bonus', key);
  res.json({ ok: true, reward: Number(b.v), balance: done.balance });
}));

app.post('/api/spin', needDb, auth, onlySite('free'), limit(10, 60000), ah(async (req, res) => {
  const u = req.user;
  const cfg = await getCfg();
  const w = cfg.ww.map((x) => Math.max(0, Math.round(Number(x) * 10)));
  const total = w.reduce((a, b) => a + b, 0);
  if (!total) return res.status(500).json({ ok: false, msg: 'স্পিন বন্ধ আছে।' });
  let p = crypto.randomInt(0, total);
  let idx = 0;
  for (; idx < w.length; idx++) { if (p < w[idx]) break; p -= w[idx]; }
  const val = Number(cfg.wv[idx]);
  const day = dayKey();
  const done = await User.findOneAndUpdate(
    { _id: u._id, spinDay: { $ne: day } },
    { $set: { spinDay: day }, $inc: { balance: val, earn: val } },
    { new: true }
  );
  if (!done) return res.status(400).json({ ok: false, msg: 'আজকের স্পিন শেষ, কাল আবার চেষ্টা করুন।' });
  await earnLog(done, val, 'spin', String(idx));
  res.json({ ok: true, index: idx, value: val, balance: done.balance });
}));

app.post('/api/package/buy', needDb, auth, onlySite('free'), limit(10, 60000), ah(async (req, res) => {
  const idx = Number((req.body || {}).index);
  const u = req.user;
  const cfg = await getCfg();
  const p = cfg.pk[idx];
  if (!Number.isInteger(idx) || !p) return res.status(400).json({ ok: false, msg: 'প্যাকেজ পাওয়া যায়নি।' });
  const price = Number(p.pr);
  const done = await User.findOneAndUpdate(
    { _id: u._id, pkg: { $lt: idx }, balance: { $gte: price } },
    { $inc: { balance: -price }, $set: { pkg: idx } },
    { new: true }
  );
  if (!done) return res.status(400).json({ ok: false, msg: 'ব্যালেন্স কম, অথবা এটা আপনার বর্তমান প্যাকেজের চেয়ে নিচের।' });
  await Ledger.create({ user: u._id, delta: -price, kind: 'package', note: p.n });
  res.json({ ok: true, pkg: idx, balance: done.balance });
}));

app.post('/api/photo', needDb, auth, limit(10, 60000), ah(async (req, res) => {
  const d = String((req.body || {}).data || '');
  if (d.length > 120000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(d)) {
    return res.status(400).json({ ok: false, msg: 'ছবি ঠিক নেই বা অনেক বড়।' });
  }
  await User.updateOne({ _id: req.user._id }, { $set: { photo: d } });
  res.json({ ok: true });
}));

// র‍্যাংকিং: আসল আয়ের হিসাব থেকে
app.get('/api/ranking', needDb, auth, onlySite('free'), limit(30, 60000), ah(async (req, res) => {
  const range = String(req.query.range || 'week');
  const days = range === 'week' ? 7 : range === 'month' ? 30 : 0;
  const match = { earn: true };
  if (days) match.at = { $gte: new Date(Date.now() - days * 864e5) };
  const rows = await Ledger.aggregate([{ $match: match }, { $group: { _id: '$user', total: { $sum: '$delta' } } }, { $sort: { total: -1 } }, { $limit: 10 }]);
  const us = await User.find({ _id: { $in: rows.map((r) => r._id) } }).select('username photo');
  const byId = {};
  us.forEach((x) => { byId[String(x._id)] = x; });
  const mine = await Ledger.aggregate([{ $match: Object.assign({ user: req.user._id }, match) }, { $group: { _id: '$user', total: { $sum: '$delta' } } }]);
  const my = mine.length ? mine[0].total : 0;
  const above = await Ledger.aggregate([{ $match: match }, { $group: { _id: '$user', total: { $sum: '$delta' } } }, { $match: { total: { $gt: my } } }, { $count: 'n' }]);
  res.json({
    ok: true,
    top: rows.map((r) => { const x = byId[String(r._id)]; return { name: x ? mask(x.username) : '—', total: round2(r.total), me: String(r._id) === String(req.user._id) }; }),
    me: { total: round2(my), rank: (above.length ? above[0].n : 0) + 1 }
  });
}));

// ================= SMM Panel =================
app.post('/api/smm/order', needDb, auth, onlySite('smm'), limit(20, 60000), ah(async (req, res) => {
  const { pf, sv, link, qty } = req.body || {};
  const u = req.user;
  const cfg = await getCfg();
  const s = (cfg.smm || []).find((x) => x.pf === pf && x.sv === sv && x.on !== false);
  if (!s) return res.status(400).json({ ok: false, msg: 'সার্ভিসটা পাওয়া যায়নি।' });
  const q = Math.floor(Number(qty));
  if (!(q >= 100 && q <= 1000000)) return res.status(400).json({ ok: false, msg: 'পরিমাণ ১০০ থেকে ১০,০০,০০০ এর মধ্যে দিন।' });
  if (!/^https?:\/\/\S{3,500}$/.test(String(link || ''))) return res.status(400).json({ ok: false, msg: 'সঠিক লিংক দিন (https:// দিয়ে শুরু)।' });
  const cost = round2((q / 1000) * Number(s.p));
  const done = await User.findOneAndUpdate({ _id: u._id, balance: { $gte: cost } }, { $inc: { balance: -cost } }, { new: true });
  if (!done) return res.status(400).json({ ok: false, msg: 'ব্যালেন্স কম। আগে ফান্ড যোগ করুন।' });
  try {
    const o = await Order.create({ user: u._id, username: u.username, pf: s.pf, sv: s.sv, link: String(link), qty: q, cost });
    await Ledger.create({ user: u._id, delta: -cost, kind: 'order', note: String(o._id) });
    res.json({ ok: true, order: { id: o._id, pf: o.pf, sv: o.sv, qty: q, cost, status: o.status }, balance: done.balance });
  } catch (e) {
    await User.updateOne({ _id: u._id }, { $inc: { balance: cost } });
    throw e;
  }
}));

app.get('/api/smm/orders', needDb, auth, onlySite('smm'), ah(async (req, res) => {
  const list = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ ok: true, items: list.map((o) => ({ id: o._id, pf: o.pf, sv: o.sv, link: o.link, qty: o.qty, cost: o.cost, status: o.status, createdAt: o.createdAt })) });
}));

app.post('/api/smm/custom', needDb, auth, onlySite('smm'), limit(10, 60000), ah(async (req, res) => {
  const { text, link, budget } = req.body || {};
  if (!String(text || '').trim() || !String(link || '').trim()) return res.status(400).json({ ok: false, msg: 'কী লাগবে ও লিংক, দুটোই লিখুন।' });
  await Custom.create({ user: req.user._id, username: req.user.username, text: String(text).slice(0, 500), link: String(link).slice(0, 500), budget: Number(budget) || 0 });
  res.json({ ok: true });
}));

app.post('/api/support', needDb, auth, limit(10, 60000), ah(async (req, res) => {
  const m = String((req.body || {}).message || '').trim();
  if (!m) return res.status(400).json({ ok: false, msg: 'কিছু লিখুন।' });
  await Support.create({ user: req.user._id, username: req.user.username, message: m.slice(0, 1000) });
  res.json({ ok: true });
}));

// ================= ওয়ালেট থেকে অ্যাপ্রুভ / রিজেক্ট =================
app.post('/api/wallet/webhook', needDb, ah(async (req, res) => {
  if (!WALLET_SECRET) return res.status(503).json({ ok: false, msg: 'webhook secret not set' });
  const given = String(req.headers['x-signature'] || '');
  const good = crypto.createHmac('sha256', WALLET_SECRET).update(req.rawBody || '').digest('hex');
  if (!given || !safeEq(given, good)) { console.log('WEBHOOK bad signature, ip=' + req.ip); return res.status(401).json({ ok: false }); }

  const { requestId, status } = req.body || {};
  if (!mongoose.isValidObjectId(requestId) || !['approved', 'rejected'].includes(status)) return res.status(400).json({ ok: false });

  const cfg = await getCfg();
  let result = 'done';
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const r = await Req.findOneAndUpdate({ _id: requestId, status: 'pending' }, { status, doneAt: new Date() }, { session });
      if (!r) { result = 'skipped'; return; }
      const give = (r.type === 'deposit' && status === 'approved') || (r.type === 'withdraw' && status === 'rejected');
      if (give) {
        await User.updateOne({ _id: r.user }, { $inc: { balance: r.amount } }, { session });
        await Ledger.create([{ user: r.user, delta: r.amount, kind: r.type === 'deposit' ? 'deposit' : 'refund', note: String(r._id) }], { session });
      }
      // বন্ধুর প্রথম ডিপোজিট অ্যাপ্রুভ হলে রেফারারকে বোনাস (একবারই)
      if (r.type === 'deposit' && status === 'approved') {
        const du = await User.findById(r.user).session(session);
        if (du && du.site === 'free' && du.referredBy && !du.refPaid) {
          const su = Number(cfg.ref.su) || 0;
          await User.updateOne({ _id: du._id }, { $set: { refPaid: true } }, { session });
          if (su > 0) {
            await User.updateOne({ _id: du.referredBy }, { $inc: { balance: su, earn: su } }, { session });
            await Ledger.create([{ user: du.referredBy, delta: su, kind: 'ref', note: du.username, earn: true }], { session });
          }
        }
      }
    });
  } finally { session.endSession(); }
  res.json({ ok: true, result });
}));

// ================= পেজ =================
function page(name, inject) {
  return (req, res) => {
    const f = path.join(pub, name);
    if (!fs.existsSync(f)) return res.status(404).send('This page is not added yet.');
    if (!inject) return res.sendFile(f);
    fs.readFile(f, 'utf8', (err, html) => {
      if (err) return res.status(500).send('Error');
      res.type('html').send(html.replace('</body>', '<script src="/admin-gate.js"></script></body>'));
    });
  };
}
app.get('/health', (req, res) => res.json({
  ok: true,
  db: dbState,
  wallet: WALLET_URL && WALLET_KEY && WALLET_SECRET ? 'configured' : 'missing settings'
}));
app.get(['/admin', '/admin.html'], adminOnly, page('admin.html'));
app.get(['/smm', '/smm.html'], page('smm.html', true));
app.get(['/free', '/free.html'], page('free.html', true));
app.use(express.static(pub));

app.listen(PORT, () => console.log('EarnHub running on port ' + PORT));
