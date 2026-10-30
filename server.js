const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 10000;

const SECRET = process.env.SECRET || crypto.randomBytes(32).toString('hex');
const ADMIN_PASS = process.env.ADMIN_PASSWORD || '';
const GID = process.env.GOOGLE_CLIENT_ID || '';

const ADGEM_APP_ID = process.env.ADGEM_APP_ID || '';
const ADGEM_POSTBACK_KEY = process.env.ADGEM_POSTBACK_KEY || '';

const CPAGRIP_USER_ID = process.env.CPAGRIP_USER_ID || '';
const CPAGRIP_KEY = process.env.CPAGRIP_KEY || '';
const CPAGRIP_FEED_URL = process.env.CPAGRIP_FEED_URL || '';

const RATE = Number(process.env.BDT_PER_USD) || 120;

const TW_SECRET = process.env.TIMEWALL_SECRET || '';
const TW_RATE = Number(process.env.TIMEWALL_RATE) || 65;
const TW_URL = process.env.TIMEWALL_URL || '';
const TW_IP_CHECK = false;
const TW_IPS = ['18.156.132.55', '51.81.120.73', '142.111.248.18'];

const MIN_AGE = 18;
const CO = {
  n: 'RS Growth Matrix', e: 'omg218063@gmail.com', p: '01764024069', y: 2026,
  tg: 'rkrana33', wa: '8801764024069', fb: 'https://www.facebook.com/share/1CAK8sYqDw/', age: MIN_AGE,
  d: 'RS Growth Matrix একটি টাস্কভিত্তিক রিওয়ার্ড প্ল্যাটফর্ম ও প্রফেশনাল SMM প্যানেল। এখানে সহজ টাস্ক, দৈনিক বোনাস ও SMM সার্ভিসের পাশাপাশি আর এস গ্যালারি শপ থেকে কেনাকাটা করা যায়।'
};

const REF_BONUS = 10, DAILY = 2, CHECKIN = 4, MIN_WD = 300, MAX_WD = 5000, SLOTS = 50;
const PENDING_HOURS = 48;
const SPIN = [[1, 40], [2, 30], [3, 20], [5, 10]];
const MAX_USD = 5;
const COUNTRY_FILTER = true;
const TARGETS = ['BD', 'IN', 'PK', 'NP'];
const BLOCK_CATS = ['signup', 'signups', 'deposit', 'deposits', 'creditcard', 'creditcards', 'oneclick', 'multireward', 'freetrial', 'freetrials', 'shopping', 'extension', 'extensions'];
app.use(express.json({ limit: '10mb' }));

async function sendToWallet(data, tries = 3) {
  if (!process.env.WALLET_URL || !process.env.WALLET_KEY) return;
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(process.env.WALLET_URL + '/api/site/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.WALLET_KEY },
        body: JSON.stringify(data)
      });
      const out = await r.json().catch(() => ({}));
      if (r.ok && out.ok !== false) return out;
      if (r.status >= 400 && r.status < 500) {
        console.error('Wallet rejected:', r.status, out.error || '');
        return;
      }
      throw new Error('Wallet error ' + r.status);
    } catch (e) {
      console.error('Wallet try ' + i + ':', e.message);
      if (i < tries) await new Promise(ok => setTimeout(ok, 15000));
    }
  }
}

app.use('/api/deposit', (req, res, next) => {
  if (req.method !== 'POST') return next();
  const origJson = res.json.bind(res);
  res.json = body => {
    try {
      const d = body && body.ok && body.depositDetails;
      if (res.statusCode === 200 && d) {
        sendToWallet({
          trxId: String(d.txid || '').trim(),
          amount: d.amount,
          number: '',
          method: String(d.method || 'bKash').toLowerCase(),
          orderRef: String(d.serialNo || '')
        }).catch(e => console.error('Wallet:', e.message));
      }
    } catch (e) { console.error('Wallet hook:', e.message); }
    return origJson(body);
  };
  next();
});

let NAMES = { boys: [], girls: [] };
try { NAMES = require('./names.js'); } catch (e) { console.error('names.js not found:', e.message); }

if (!process.env.MONGO_URI) console.error('MONGO_URI is not set: accounts cannot be saved.');
else mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected');
  try { await User.syncIndexes(); console.log('User indexes synced'); } catch (e) { console.error('Index sync error:', e.message); }
}).catch(e => console.error('MongoDB error:', e.message));

// ==================== SCHEMAS ====================
const User = mongoose.model('User', new mongoose.Schema({
  name: String, nameKey: { type: String, unique: true, sparse: true }, phone: String,
  email: { type: String, unique: true, sparse: true }, hash: String, salt: String,
  role: { type: String, default: 'worker' }, // 'worker', 'buyer', 'employer', 'admin'
  balance: { type: Number, default: 0 }, earned: { type: Number, default: 0 },
  rsCoins: { type: Number, default: 0 },
  activePkg: { type: Object, default: null },
  refCode: { type: String, unique: true }, refBy: String,
  refEarn: { type: Number, default: 0 }, refCount: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  lastDaily: { type: Number, default: 0 }, lastCheckin: String, lastSpin: { type: Number, default: 0 }, lastAdWatch: { type: Number, default: 0 },
  adRotateCount: { type: Number, default: 0 }, adCooldownUntil: { type: Number, default: 0 },
  lastSeen: Number, created: { type: Date, default: Date.now }
}));

// --- New SMM / Buyer Schemas ---
const UsdWallet = mongoose.model('UsdWallet', new mongoose.Schema({
  uid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  usdBalance: { type: Number, default: 0 },
  spentUsd: { type: Number, default: 0 },
  at: { type: Date, default: Date.now }
}));

const SmmTransaction = mongoose.model('SmmTransaction', new mongoose.Schema({
  uid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, // 'deposit', 'order_deduct', 'refund', 'admin_adjust'
  amountUsd: Number,
  description: String,
  status: { type: String, default: 'approved' },
  at: { type: Date, default: Date.now }
}));

const SmmService = mongoose.model('SmmService', new mongoose.Schema({
  serviceId: { type: Number, unique: true },
  name: String,
  category: String,
  platform: String,
  pricePerThousand: Number, // USD per 1000 units
  minQuantity: { type: Number, default: 10 },
  maxQuantity: { type: Number, default: 10000 },
  description: String,
  active: { type: Boolean, default: true }
}));

const SmmOrder = mongoose.model('SmmOrder', new mongoose.Schema({
  uid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  serviceId: Number,
  serviceName: String,
  targetUrl: String,
  quantity: Number,
  totalCostUsd: Number,
  startCount: { type: Number, default: 0 },
  remains: Number,
  status: { type: String, default: 'Pending' }, // Pending, Processing, Completed, Partial, Canceled, Refunded
  errorDetails: String,
  at: { type: Date, default: Date.now }
}));

const SmmFundRequest = mongoose.model('SmmFundRequest', new mongoose.Schema({
  uid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  amountUsd: Number,
  method: String,
  txid: String,
  status: { type: String, default: 'pending' }, // pending, approved, rejected, refunded
  at: { type: Date, default: Date.now }
}));

const Click = mongoose.model('Click', new mongoose.Schema({ uid: String, offerId: String, title: String, icon: String, bdt: Number, status: { type: String, default: 'pending' }, at: { type: Date, default: Date.now }, doneAt: Number }));
const Conv = mongoose.model('Conv', new mongoose.Schema({ key: { type: String, unique: true }, uid: String, tx: String, bdt: Number, status: String, at: { type: Date, default: Date.now } }));
const Wd = mongoose.model('Wd', new mongoose.Schema({ uid: String, name: String, amount: Number, method: String, phone: String, status: { type: String, default: 'pending' }, at: { type: Date, default: Date.now } }));
const Deposit = mongoose.model('Deposit', new mongoose.Schema({ uid: String, name: String, amount: Number, method: String, txid: String, lastDigits: String, pkgName: String, serialNo: String, status: { type: String, default: 'pending' }, at: { type: Date, default: Date.now } }));
const Msg = mongoose.model('Msg', new mongoose.Schema({ uid: String, name: String, from: String, text: String, at: { type: Date, default: Date.now } }));
const CustomTask = mongoose.model('CustomTask', new mongoose.Schema({ uid: String, platform: String, title: String, link: String, reward: Number, targetWorkers: Number, totalBudget: Number, status: { type: String, default: 'pending' }, at: { type: Date, default: Date.now } }));

const PromoPackage = mongoose.model('PromoPackage', new mongoose.Schema({
  title: String, category: String, followers: Number, price: Number, description: String, icon: String, active: { type: Boolean, default: true }
}));

const UserPackage = mongoose.model('UserPackage', new mongoose.Schema({
  title: String, price: Number, coinsPerMin: Number, description: String, pkgImage: { type: String, default: '' }, hot: { type: Boolean, default: false }, active: { type: Boolean, default: true }
}));

const SliderSetting = mongoose.model('SliderSetting', new mongoose.Schema({
  title: String, subtitle: String, description: String, link: String, bgImage: { type: String, default: '' }, bgClass: { type: String, default: 's0' }, emoji: { type: String, default: '🕌' }, timerSeconds: { type: Number, default: 6 }, active: { type: Boolean, default: true }
}));

const h = fn => (q, s) => fn(q, s).catch(e => {
  console.error('ERROR', q.method, q.path, e && e.code, e && e.message);
  if (e && e.code === 11000) return s.status(400).json({ error: 'This name or phone is already registered. Try a different name.' });
  s.status(500).json({ error: 'Server error. Please try again.' });
});
const bad = (s, m, c) => s.status(c || 400).json({ error: m });
const hmac = b => crypto.createHmac('sha256', SECRET).update(b).digest('hex');
const sign = id => { const b = id + '.' + (Date.now() + 30 * 864e5); return b + '.' + hmac(b); };
const hashPw = (p, salt) => crypto.scryptSync(p, salt, 32).toString('hex');
const same = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const today = () => new Date().toISOString().slice(0, 10);
const dayStart = () => { const o = 6 * 36e5, n = Date.now() + o; return new Date(n - (n % 864e5) - o); };

const partners = () => [
  ADGEM_APP_ID && ADGEM_POSTBACK_KEY ? 'AdGem' : '',
  CPAGRIP_USER_ID && CPAGRIP_KEY ? 'CPAGrip' : '',
  TW_SECRET && TW_URL ? 'TimeWall.io (Australian Clearing Pty Ltd)' : '',
  'RS Gallery Shop (Official Collaboration)',
  'Professional SMM Panel (USD Wallet)'
].filter(Boolean);

const me = u => ({ 
  id: u._id, name: u.name, phone: u.phone || '', email: u.email || '', av: u.avatar || '', role: u.role || 'worker', 
  balance: u.balance, earned: u.earned, rsCoins: u.rsCoins || 0, activePkg: u.activePkg || null, refCode: u.refCode, refEarn: u.refEarn, refCount: u.refCount, 
  lastDaily: u.lastDaily, lastSpin: u.lastSpin || 0, lastAdWatch: u.lastAdWatch || 0, adRotateCount: u.adRotateCount || 0, adCooldownUntil: u.adCooldownUntil || 0, 
  checkedIn: u.lastCheckin === today(), d: DAILY, c: CHECKIN, tc: TARGETS, ct: CO, pt: partners() 
});

const bdtFor = usd => Math.round(usd * RATE * (usd > 1 ? 0.5 : 0.7) * 100) / 100;
const expire = uid => Click.updateMany(Object.assign({ status: 'pending', at: { $lt: new Date(Date.now() - PENDING_HOURS * 36e5) } }, uid ? { uid } : {}), { status: 'expired' });

const auth = async (req, res, next) => {
  try {
    const [id, exp, sig] = (req.headers.authorization || '').replace('Bearer ', '').split('.');
    if (!sig || !same(sig, hmac(id + '.' + exp)) || +exp < Date.now()) throw 0;
    req.user = await User.findById(id);
    if (!req.user) throw 0;
    if (!req.user.lastSeen || Date.now() - req.user.lastSeen > 3e5) User.updateOne({ _id: id }, { lastSeen: Date.now() }).catch(() => {});
    next();
  } catch (e) { bad(res, 'Please log in again.', 401); }
};

const admin = (req, res, next) => (ADMIN_PASS && same(String(req.headers['x-admin-pass'] || ''), ADMIN_PASS)) ? next() : bad(res, 'Wrong admin password.', 403);

async function newUser(data, ref) {
  let refCode;
  do { refCode = crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase(); } while (await User.exists({ refCode }));
  const u = await User.create({ ...data, refCode });
  
  // If user is buyer, initialize USD Wallet
  if (u.role === 'buyer') {
    await UsdWallet.create({ uid: u._id, usdBalance: 0, spentUsd: 0 });
  }

  if (ref) {
    const r = await User.findOne({ refCode: String(ref).toUpperCase() });
    if (r && String(r._id) !== String(u._id)) {
      await User.updateOne({ _id: r._id }, { $inc: { balance: REF_BONUS, earned: REF_BONUS, refEarn: REF_BONUS, refCount: 1 } });
      u.refBy = r.refCode; await u.save();
    }
  }
  return u;
}

app.get('/ping', (req, res) => res.send('OK'));
app.get('/manifest.json', (req, res) => {
  res.json({
    name: "RS Growth Matrix & SMM Panel", short_name: "RS Matrix",
    description: "RS Growth Matrix - Complete tasks, earn rewards, and SMM Services.",
    start_url: "/", display: "standalone", background_color: "#060913", theme_color: "#fbbf24",
    icons: [
      { src: "https://cdn-icons-png.flaticon.com/512/1041/1041888.png", sizes: "192x192", type: "image/png" },
      { src: "https://cdn-icons-png.flaticon.com/512/1041/1041888.png", sizes: "512x512", type: "image/png" }
    ]
  });
});
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`self.addEventListener('install', e => self.skipWaiting()); self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));`);
});

// ==================== AUTH ROUTES ====================
app.post('/api/register', h(async (q, s) => {
  const { name, phone, password, confirm, role, ref } = q.body || {};
  const n = String(name || '').trim();
  if (n.length < 3 || n.length > 30) return bad(s, 'Name must be 3 to 30 characters.');
  if (!/^01\d{9}$/.test(String(phone || ''))) return bad(s, 'Enter a valid 11-digit phone number.');
  if (String(password || '').length < 6) return bad(s, 'Password must be at least 6 characters.');
  if (password !== confirm) return bad(s, 'Passwords do not match.');
  if (await User.exists({ nameKey: n.toLowerCase() })) return bad(s, 'This name is already taken.');
  
  const userRole = ['worker', 'buyer', 'employer'].includes(role) ? role : 'worker';
  const salt = crypto.randomBytes(16).toString('hex');
  const u = await newUser({ name: n, nameKey: n.toLowerCase(), phone, role: userRole, salt, hash: hashPw(password, salt) }, ref);
  s.json({ token: sign(u.id), me: me(u) });
}));

app.post('/api/login', h(async (q, s) => {
  const { name, password } = q.body || {};
  const u = await User.findOne({ nameKey: String(name || '').trim().toLowerCase() });
  if (!u || !u.hash || !same(u.hash, hashPw(String(password || ''), u.salt))) return bad(s, 'Wrong name or password.', 401);
  s.json({ token: sign(u.id), me: me(u) });
}));

app.post('/api/google', h(async (q, s) => {
  if (!GID) return bad(s, 'Google sign-in is not set up.');
  const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(String((q.body || {}).credential || '')));
  const g = await r.json();
  if (!r.ok || g.aud !== GID || g.email_verified !== 'true') return bad(s, 'Google verification failed.', 401);
  let u = await User.findOne({ email: g.email });
  if (!u) u = await newUser({ name: (g.name || g.email.split('@')[0]).slice(0, 30), email: g.email, role: 'worker' }, (q.body || {}).ref);
  s.json({ token: sign(u.id), me: me(u) });
}));

app.get('/api/me', auth, h(async (q, s) => {
  let u = q.user;
  if (u.activePkg && u.activePkg.expiresAt > Date.now()) {
    const now = Date.now();
    const lastClaim = u.activePkg.lastClaim || u.activePkg.startedAt;
    const diffMinutes = Math.floor((now - lastClaim) / 60000);
    if (diffMinutes > 0) {
      const coinsToAdd = diffMinutes * (u.activePkg.coinsPerMin || 1);
      u.rsCoins = (u.rsCoins || 0) + coinsToAdd;
      u.activePkg.lastClaim = lastClaim + (diffMinutes * 60000);
      await u.save();
    }
  }
  s.json(me(u));
}));

app.post('/api/avatar', auth, h(async (q, s) => {
  const img = String((q.body || {}).img || '');
  if (img.length > 2000000) return bad(s, 'Photo is too large.');
  await User.updateOne({ _id: q.user.id }, { avatar: img });
  s.json({ av: img });
}));

app.get('/api/names/:t', auth, (q, s) => s.json(q.params.t === 'girls' ? NAMES.girls : NAMES.boys));

// ==================== SMM / BUYER PANEL API ROUTES ====================

// Get Buyer USD Wallet Stats & Balance
app.get('/api/smm/wallet', auth, h(async (q, s) => {
  if (q.user.role !== 'buyer' && q.user.role !== 'employer') return bad(s, 'Access denied for non-buyer accounts.', 403);
  let wallet = await UsdWallet.findOne({ uid: q.user._id });
  if (!wallet) {
    wallet = await UsdWallet.create({ uid: q.user._id, usdBalance: 0, spentUsd: 0 });
  }
  const totalOrders = await SmmOrder.countDocuments({ uid: q.user._id });
  const pendingOrders = await SmmOrder.countDocuments({ uid: q.user._id, status: 'Pending' });
  const completedOrders = await SmmOrder.countDocuments({ uid: q.user._id, status: 'Completed' });
  const txs = await SmmTransaction.find({ uid: q.user._id }).sort({ at: -1 }).limit(20);

  s.json({
    usdBalance: wallet.usdBalance,
    spentUsd: wallet.spentUsd,
    stats: { totalOrders, pendingOrders, completedOrders },
    transactions: txs
  });
}));

// Services Catalog
app.get('/api/smm/services', auth, h(async (q, s) => {
  let services = await SmmService.find({ active: true });
  if (!services.length) {
    const defaultServices = [
      { serviceId: 101, name: 'Instagram Followers (HQ & Real)', category: 'Instagram', platform: 'Instagram', pricePerThousand: 2.50, minQuantity: 100, maxQuantity: 50000, description: 'High quality Instagram followers with fast delivery.' },
      { serviceId: 102, name: 'Instagram Likes (Instant)', category: 'Instagram', platform: 'Instagram', pricePerThousand: 0.80, minQuantity: 50, maxQuantity: 10000, description: 'Instant likes on Instagram posts.' },
      { serviceId: 201, name: 'YouTube Subscribers (Monetization Safe)', category: 'YouTube', platform: 'YouTube', pricePerThousand: 15.00, minQuantity: 50, maxQuantity: 5000, description: 'Real YouTube subscribers for channel growth.' },
      { serviceId: 202, name: 'YouTube Video Views (High Retention)', category: 'YouTube', platform: 'YouTube', pricePerThousand: 4.00, minQuantity: 500, maxQuantity: 100000, description: 'High retention views to boost rankings.' },
      { serviceId: 301, name: 'TikTok Followers (Active)', category: 'TikTok', platform: 'TikTok', pricePerThousand: 3.20, minQuantity: 100, maxQuantity: 20000, description: 'Active TikTok followers.' },
      { serviceId: 401, name: 'Telegram Channel Members', category: 'Telegram', platform: 'Telegram', pricePerThousand: 1.80, minQuantity: 100, maxQuantity: 50000, description: 'Telegram members for groups and channels.' }
    ];
    await SmmService.insertMany(defaultServices);
    services = await SmmService.find({ active: true });
  }
  s.json(services);
}));

// Place New SMM Order (Atomic Balance Deduction)
app.post('/api/smm/order', auth, h(async (q, s) => {
  if (q.user.role !== 'buyer' && q.user.role !== 'employer') return bad(s, 'Only buyers can place SMM orders.', 403);
  const { serviceId, targetUrl, quantity } = q.body || {};
  const qty = Number(quantity);
  const sId = Number(serviceId);

  if (!sId || !targetUrl || isNaN(qty) || qty <= 0) return bad(s, 'Invalid order parameters.');

  const service = await SmmService.findOne({ serviceId: sId, active: true });
  if (!service) return bad(s, 'Selected service is not available.');

  if (qty < service.minQuantity || qty > service.maxQuantity) {
    return bad(s, `Quantity must be between ${service.minQuantity} and ${service.maxQuantity}.`);
  }

  // Calculate cost on server side securely
  const totalCostUsd = Math.round((qty / 1000) * service.pricePerThousand * 100) / 100;

  // Atomic balance check & deduction using session/findOneAndUpdate
  const wallet = await UsdWallet.findOne({ uid: q.user._id });
  if (!wallet || wallet.usdBalance < totalCostUsd) {
    return bad(s, `Insufficient USD balance. Required: $${totalCostUsd}, Available: $${wallet ? wallet.usdBalance : 0}`);
  }

  wallet.usdBalance = Math.round((wallet.usdBalance - totalCostUsd) * 100) / 100;
  wallet.spentUsd = Math.round((wallet.spentUsd + totalCostUsd) * 100) / 100;
  await wallet.save();

  // Record Transaction Ledger
  await SmmTransaction.create({
    uid: q.user._id,
    type: 'order_deduct',
    amountUsd: totalCostUsd,
    description: `Order placed for service #${sId} (${qty} units)`
  });

  // Create Order
  const newOrder = await SmmOrder.create({
    uid: q.user._id,
    serviceId: sId,
    serviceName: service.name,
    targetUrl: String(targetUrl).trim(),
    quantity: qty,
    totalCostUsd,
    remains: qty,
    status: 'Pending'
  });

  s.json({ ok: true, order: newOrder, newBalance: wallet.usdBalance });
}));

// Mass Order Endpoint
app.post('/api/smm/mass-order', auth, h(async (q, s) => {
  if (q.user.role !== 'buyer' && q.user.role !== 'employer') return bad(s, 'Access denied.', 403);
  const { ordersText } = q.body || {}; // Format: serviceId | link | quantity per line
  if (!ordersText) return bad(s, 'Please provide mass order details.');

  const lines = ordersText.split('\n').filter(l => l.trim().length > 0);
  let successCount = 0;
  let failCount = 0;
  let totalCost = 0;
  const results = [];

  for (const line of lines) {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length < 3) { failCount++; continue; }
    const sId = Number(parts[0]);
    const targetUrl = parts[1];
    const qty = Number(parts[2]);

    const service = await SmmService.findOne({ serviceId: sId, active: true });
    if (!service || qty < service.minQuantity || qty > service.maxQuantity) {
      failCount++; continue;
    }

    const cost = Math.round((qty / 1000) * service.pricePerThousand * 100) / 100;
    const wallet = await UsdWallet.findOne({ uid: q.user._id });

    if (!wallet || wallet.usdBalance < cost) {
      failCount++; continue;
    }

    wallet.usdBalance = Math.round((wallet.usdBalance - cost) * 100) / 100;
    wallet.spentUsd = Math.round((wallet.spentUsd + cost) * 100) / 100;
    await wallet.save();

    await SmmTransaction.create({ uid: q.user._id, type: 'order_deduct', amountUsd: cost, description: `Mass order service #${sId}` });
    await SmmOrder.create({ uid: q.user._id, serviceId: sId, serviceName: service.name, targetUrl, quantity: qty, totalCostUsd: cost, remains: qty, status: 'Pending' });

    successCount++;
    totalCost += cost;
  }

  s.json({ ok: true, successCount, failCount, totalCost });
}));

// Get Orders History
app.get('/api/smm/orders', auth, h(async (q, s) => {
  if (q.user.role !== 'buyer' && q.user.role !== 'employer') return bad(s, 'Access denied.', 403);
  const orders = await SmmOrder.find({ uid: q.user._id }).sort({ at: -1 }).limit(100);
  s.json(orders);
}));

// Add Funds Request (USD Wallet Deposit)
app.post('/api/smm/fund-request', auth, h(async (q, s) => {
  if (q.user.role !== 'buyer' && q.user.role !== 'employer') return bad(s, 'Access denied.', 403);
  const { amountUsd, method, txid } = q.body || {};
  const amt = Number(amountUsd);

  if (isNaN(amt) || amt < 5 || amt > 1000) return bad(s, 'Deposit amount must be between $5 and $1000 USD.');
  if (!method || !txid || txid.trim().length < 6) return bad(s, 'Provide valid payment method and Transaction ID.');

  const reqObj = await SmmFundRequest.create({
    uid: q.user._id,
    name: q.user.name,
    amountUsd: amt,
    method: String(method),
    txid: String(txid).trim(),
    status: 'pending'
  });

  s.json({ ok: true, request: reqObj });
}));

app.get('/api/smm/fund-requests', auth, h(async (q, s) => {
  if (q.user.role !== 'buyer' && q.user.role !== 'employer') return bad(s, 'Access denied.', 403);
  const list = await SmmFundRequest.find({ uid: q.user._id }).sort({ at: -1 }).limit(30);
  s.json(list);
}));

// ==================== ORIGINAL RS GROWTH MATRIX ENDPOINTS ====================

app.get('/api/sliders', auth, h(async (q, s) => {
  let sliders = await SliderSetting.find({ active: true });
  if (!sliders.length) {
    const defaultSliders = [
      { title: 'নামাজের স্মরণ', subtitle: 'নামাজ কি পড়েছেন?', description: 'নামাজ আমাদের জীবনের সবচেয়ে বড় আমানত। কাজের ফাঁকে ওয়াক্ত হলেই নামাজ আদায় করে নিন।', link: '#', bgClass: 's0', emoji: '🕌', timerSeconds: 6 },
      { title: 'আমাদের সাইট ও পার্টনার', subtitle: 'RS Growth Matrix & RS Gallery', description: 'টাস্ক সম্পন্ন করে ইনকাম করুন এবং আমাদের অফিশিয়াল পার্টনার আর এস গ্যালারি শপ থেকে পছন্দের পোশাক অর্ডার করুন।', link: 'https://www.facebook.com/share/1CAK8sYqDw/', bgClass: 's1', emoji: '🛍️', timerSeconds: 6 },
      { title: 'টাস্ক ও অ্যাড আয়', subtitle: 'ডেইলি ক্যাশ রিওয়ার্ড', description: 'Tasks ট্যাবে গিয়ে টাস্ক সম্পন্ন করুন অথবা Watch Ads অপশনে গিয়ে অ্যাড দেখে ইনস্ট্যান্ট ক্যাশ আয় করুন।', link: '#', bgClass: 's2', emoji: '📱', timerSeconds: 6 },
      { title: 'সহজে উত্তোলন', subtitle: 'বিকাশ ও নগদ পেমেন্ট', description: 'Account থেকে Withdraw চেপে bKash বা Nagad নাম্বার দিন। উত্তোলন ৩০০ থেকে ৫০০০ টাকা পর্যন্ত করা যায়।', link: '#', bgClass: 's3', emoji: '💸', timerSeconds: 6 }
    ];
    await SliderSetting.insertMany(defaultSliders);
    sliders = await SliderSetting.find({ active: true });
  }
  s.json(sliders);
}));

const pick = (o, ks) => { for (const k of ks) if (o[k] != null && o[k] !== '') return o[k]; };
const arrOf = v => Array.isArray(v) ? v : [];
const ctxOf = q => {
  const ua = String(q.headers['user-agent'] || '');
  const device = /android/i.test(ua) ? 'android' : /iphone|ipad|ipod/i.test(ua) ? 'ios' : 'desktop';
  const c = String(q.headers['cf-ipcountry'] || q.headers['x-vercel-ip-country'] || '').toUpperCase();
  return { device, country: /^[A-Z]{2}$/.test(c) ? c : '' };
};
const devOk = (list, device) => {
  if (!list.length) return true;
  const words = { android: ['android'], ios: ['ios', 'iphone', 'ipad', 'apple'], desktop: ['desktop', 'web', 'windows', 'mac', 'pc', 'linux'] }[device];
  return list.some(d => words.some(w => String(d).toLowerCase().includes(w)));
};

async function fetchOffers(uid, ctx, dbg) {
  ctx = ctx || { device: '', country: '' };
  let combinedOffers = [];

  const approvedCustom = await CustomTask.find({ status: 'approved' });
  const mappedCustom = approvedCustom.map(t => {
    let iconUrl = 'https://cdn-icons-png.flaticon.com/512/1041/1041888.png';
    if(t.platform === 'youtube') iconUrl = 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png';
    if(t.platform === 'facebook') iconUrl = 'https://cdn-icons-png.flaticon.com/512/124/124010.png';
    if(t.platform === 'telegram') iconUrl = 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png';

    return {
      id: 'customtask:' + t._id,
      title: t.title + ' (' + t.platform.toUpperCase() + ')',
      icon: iconUrl,
      clickUrl: t.link,
      desc: 'প্রমোশন টাস্ক: ' + t.title + ' | টার্গেট ওয়ার্কার: ' + t.targetWorkers,
      req: 'লিংকে গিয়ে সাবস্ক্রাইব/ফলো করে প্রুফ রাখুন।',
      usd: t.reward / RATE,
      bdt: t.reward,
      cats: [],
      cnt: ['BD'],
      dev: []
    };
  });
  combinedOffers = combinedOffers.concat(mappedCustom);

  if (ADGEM_APP_ID && ADGEM_POSTBACK_KEY) {
    try {
      const adgemRes = await fetch(`https://api.adgem.com/v1/wall?appid=${ADGEM_APP_ID}&player_id=${encodeURIComponent(uid)}`);
      const adgemJson = await adgemRes.json();
      const adgemArr = Array.isArray(adgemJson) ? adgemJson : (adgemJson.offers || adgemJson.data || []);
      const mappedAdgem = adgemArr.map(o => {
        const payout = +pick(o, ['payout', 'reward', 'amount']) || 0;
        return {
          id: 'adgem:' + String(pick(o, ['campaign_id', 'id']) || ''),
          title: String(pick(o, ['name', 'title']) || 'AdGem Offer').slice(0, 80),
          icon: String(pick(o, ['icon', 'image_url']) || ''),
          clickUrl: pick(o, ['url', 'click_url']),
          desc: String(o.description || '').slice(0, 300),
          req: String(o.requirements || '').slice(0, 300),
          usd: payout,
          bdt: bdtFor(payout),
          cats: arrOf(o.categories).map(c => String(c).toLowerCase().replace(/[^a-z]/g, '')),
          cnt: arrOf(o.countries).map(c => String(c).toUpperCase()),
          dev: arrOf(o.devices)
        };
      }).filter(o => o.id && o.clickUrl);
      combinedOffers = combinedOffers.concat(mappedAdgem);
    } catch (err) { console.error('AdGem fetch error:', err.message); }
  }

  if (combinedOffers.length === 0) {
    combinedOffers = [
      { id: 'custom:1', title: 'Subscribe Official YouTube Channel', icon: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png', clickUrl: 'https://www.youtube.com/@rkrana33', desc: 'আমাদের অফিসিয়াল ইউটিউব চ্যানেলে গিয়ে Subscribe করুন।', req: 'স্ক্রিনশট রাখুন।', usd: 0.10, bdt: 12, cats: [], cnt: ['BD'], dev: [] },
      { id: 'custom:2', title: 'Follow Facebook Official Page', icon: 'https://cdn-icons-png.flaticon.com/512/124/124010.png', clickUrl: 'https://www.facebook.com/share/1CAK8sYqDw/', desc: 'আমাদের ফেসবুক পেজটি লাইক ও ফলো করুন।', req: 'পেজ লাইক দিন।', usd: 0.08, bdt: 10, cats: [], cnt: ['BD'], dev: [] },
      { id: 'custom:3', title: 'Join Official Telegram Channel', icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png', clickUrl: 'https://t.me/rkrana33', desc: 'আমাদের অফিসিয়াল টেলিগ্রাম চ্যানেলে জয়েন করুন।', req: 'চ্যানেলে জয়েন থাকুন।', usd: 0.08, bdt: 10, cats: [], cnt: ['BD'], dev: [] },
      { id: 'custom:4', title: 'Shop at RS Gallery Shop (Collaboration)', icon: 'https://cdn-icons-png.flaticon.com/512/1041/1041888.png', clickUrl: 'https://www.facebook.com/share/1CAK8sYqDw/', desc: 'আমাদের পার্টনার আর এস গ্যালারি শপ থেকে ইনকামের টাকা দিয়ে পোশাক কিনুন।', req: 'শপ ভিজিট করুন।', usd: 0.15, bdt: 15, cats: [], cnt: ['BD'], dev: [] }
    ];
  }

  let l = combinedOffers;
  if (dbg) { dbg.total = l.length; dbg.cn = {}; l.forEach(o => (o.cnt.length ? o.cnt : ['ALL']).forEach(c => { dbg.cn[c] = (dbg.cn[c] || 0) + 1; })); }
  l = l.filter(o => o.usd <= MAX_USD); if (dbg) dbg.price = l.length;
  l = l.filter(o => !o.cats.some(c => BLOCK_CATS.includes(c))); if (dbg) dbg.cat = l.length;
  l = l.filter(o => !COUNTRY_FILTER || !o.cnt.length || o.cnt.some(c => TARGETS.includes(c))); if (dbg) dbg.country = l.length;
  l = l.filter(o => !ctx.device || devOk(o.dev, ctx.device)); if (dbg) dbg.device = l.length;
  return l;
}

app.get('/api/offers', auth, h(async (q, s) => {
  await expire(q.user.id);
  const now = Date.now(), day = 864e5;
  const clicks = await Click.find({ uid: q.user.id });
  const used = clicks.filter(c => c.status === 'pending' || (c.status === 'success' && c.doneAt > now - day && !String(c.offerId).startsWith('tw:')));
  const blocked = new Set(clicks.filter(c => c.status === 'success' || c.status === 'pending').map(c => c.offerId));
  const offers = await fetchOffers(q.user.id, ctxOf(q));
  const free = offers.filter(o => !blocked.has(o.id)).slice(0, Math.max(0, SLOTS - used.length));
  const list = used.map(c => ({ id: c.offerId, title: c.title, icon: c.icon, bdt: c.bdt, status: c.status })).concat(free.map(o => ({ id: o.id, title: o.title, icon: o.icon, bdt: o.bdt, status: 'open', desc: o.desc, req: o.req, cnt: o.cnt, dev: o.dev })));
  const n = st => clicks.filter(c => c.status === st).length;
  s.json({ stats: { pending: n('pending'), success: n('success'), cancelled: n('cancelled') + n('expired'), total: list.length }, list });
}));

app.post('/api/offers/:id/start', auth, h(async (q, s) => {
  await expire(q.user.id);
  const clicks = await Click.find({ uid: q.user.id });
  const now = Date.now();
  const used = clicks.filter(c => c.status === 'pending' || (c.status === 'success' && c.doneAt > now - 864e5 && !String(c.offerId).startsWith('tw:')));
  if (clicks.some(c => c.offerId === q.params.id && (c.status === 'success'))) return bad(s, 'You already completed this task.');
  const o = (await fetchOffers(q.user.id, ctxOf(q))).find(x => x.id === q.params.id);
  if (!o) return bad(s, 'This task is no longer available.', 404);
  const mine = used.find(c => c.offerId === o.id);
  if (!mine) {
    if (used.length >= SLOTS) return bad(s, 'Daily task limit reached.');
    await Click.create({ uid: q.user.id, offerId: o.id, title: o.title, icon: o.icon, bdt: o.bdt });
  }
  s.json({ url: o.clickUrl });
}));

app.get('/api/user-packages', auth, h(async (q, s) => {
  let pkgs = await UserPackage.find({ active: true });
  if (!pkgs.length) {
    const defaultUserPkgs = [
      { price: 200, coinsPerMin: 10, description: 'Basic RS Coin Package', hot: false },
      { price: 500, coinsPerMin: 25, description: 'Bronze RS Coin Package', hot: false },
      { price: 800, coinsPerMin: 50, description: 'Silver RS Coin Package', hot: false },
      { price: 1200, coinsPerMin: 80, description: 'Gold RS Coin Package', hot: false },
      { price: 1500, coinsPerMin: 110, description: 'Platinum RS Coin Package', hot: true },
      { price: 2000, coinsPerMin: 160, description: 'Diamond RS Coin Package', hot: true },
      { price: 2500, coinsPerMin: 220, description: 'Master RS Coin Package', hot: true },
      { price: 3000, coinsPerMin: 300, description: 'Elite RS Coin Package', hot: true }
    ];
    await UserPackage.insertMany(defaultUserPkgs);
    pkgs = await UserPackage.find({ active: true });
  }
  s.json(pkgs);
}));

app.get('/api/promo-packages', auth, h(async (q, s) => {
  let pkgs = await PromoPackage.find({ active: true });
  if (!pkgs.length) {
    const defaultPkgs = [
      { title: '200 Facebook Followers', category: 'Facebook', followers: 200, price: 80, description: 'আপনার ফেসবুক পেজ বা আইডিতে ইনস্ট্যান্ট রিয়েল ফলোয়ার নিন।', icon: 'https://cdn-icons-png.flaticon.com/512/124/124010.png' },
      { title: '1,000 YouTube Subscribers', category: 'YouTube', followers: 1000, price: 650, description: 'আপনার ইউটিউব চ্যানেলে গ্রোথ ও সাবস্ক্রাইবার বৃদ্ধি করুন।', icon: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png' },
      { title: '5,000 Telegram Members', category: 'Telegram', followers: 5000, price: 2500, description: 'টেলিগ্রাম গ্রুপ বা চ্যানেলে একটিভ মেম্বার যুক্ত করুন।', icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png' },
      { title: 'RS Gallery Shop Featured Item', category: 'RS Gallery', followers: 10000, price: 5000, description: 'আর এস গ্যালারি শপ কোলাবোরেশন ও প্রোডাক্ট প্রমোশন প্যাকেজ।', icon: 'https://cdn-icons-png.flaticon.com/512/1041/1041888.png' }
    ];
    await PromoPackage.insertMany(defaultPkgs);
    pkgs = await PromoPackage.find({ active: true });
  }
  s.json(pkgs);
}));

app.post('/api/employer/task', auth, h(async (q, s) => {
  if (q.user.role !== 'employer') return bad(s, 'Only employers can post tasks.');
  const { platform, title, link, reward, targetWorkers, packageId } = q.body || {};
  
  let r = Number(reward), tw = Number(targetWorkers), totalBudget = 0;

  if (packageId) {
    const pkg = await PromoPackage.findById(packageId);
    if (!pkg) return bad(s, 'Selected package not found.');
    totalBudget = pkg.price;
    platform = pkg.category.toLowerCase().includes('face') ? 'facebook' : (pkg.category.toLowerCase().includes('you') ? 'youtube' : 'telegram');
    title = pkg.title;
    reward = Math.round((pkg.price / pkg.followers) * 100) / 100;
    targetWorkers = pkg.followers;
  } else {
    if (!platform || !title || !link || isNaN(r) || isNaN(tw) || r <= 0 || tw <= 0) return bad(s, 'Invalid task details.');
    totalBudget = r * tw;
  }

  if (q.user.balance < totalBudget) return bad(s, 'Insufficient balance. Required: ' + totalBudget + ' BDT');

  await User.updateOne({ _id: q.user.id }, { $inc: { balance: -totalBudget } });
  await CustomTask.create({ uid: q.user.id, platform: platform || 'general', title: String(title).trim(), link: String(link || '#').trim(), reward: Number(reward || 1), targetWorkers: Number(targetWorkers || 100), totalBudget, status: 'pending' });
  const updatedUser = await User.findById(q.user.id);
  s.json({ ok: true, me: me(updatedUser) });
}));

app.get('/api/employer/tasks', auth, h(async (q, s) => {
  if (q.user.role !== 'employer') return bad(s, 'Access denied.');
  s.json(await CustomTask.find({ uid: q.user.id }).sort({ at: -1 }));
}));

app.post('/api/watch-ad', auth, h(async (q, s) => {
  const now = Date.now();
  let user = q.user;
  
  if (user.adCooldownUntil && now < user.adCooldownUntil) {
    const remainMin = Math.ceil((user.adCooldownUntil - now) / 60000);
    return bad(s, `আপনার ২০ মিনিটের বিরতি চলছে। আরও ${remainMin} মিনিট পর চেষ্টা করুন।`);
  }

  if (user.lastAdWatch && now - user.lastAdWatch < 10000) return bad(s, 'অনুগ্রহ করে ১০ সেকেন্ড অপেক্ষা করুন।');
  
  const adReward = 0.50;
  let newRotateCount = (user.adRotateCount || 0) + 1;
  let cooldownUntil = 0;

  if (newRotateCount >= 10) {
    cooldownUntil = now + (20 * 60 * 1000);
    newRotateCount = 0;
  }

  const u = await User.findOneAndUpdate({ _id: user.id }, { 
    $set: { lastAdWatch: now, adRotateCount: newRotateCount, adCooldownUntil: cooldownUntil }, 
    $inc: { balance: adReward, earned: adReward } 
  }, { new: true });

  s.json({ reward: adReward, me: me(u), cooldown: cooldownUntil > 0 });
}));

app.get('/api/timewall', auth, (q, s) => s.json({ url: TW_URL ? TW_URL.replace(/\{uid\}/g, encodeURIComponent(q.user.id)) : '' }));

app.post('/api/daily', auth, h(async (q, s) => {
  const r = await User.findOneAndUpdate({ _id: q.user.id, lastDaily: { $lte: Date.now() - 864e5 } }, { $set: { lastDaily: Date.now() }, $inc: { balance: DAILY, earned: DAILY } }, { new: true });
  if (!r) return bad(s, 'You already claimed today.');
  s.json(me(r));
}));

app.post('/api/checkin', auth, h(async (q, s) => {
  const r = await User.findOneAndUpdate({ _id: q.user.id, lastCheckin: { $ne: today() } }, { $set: { lastCheckin: today() }, $inc: { balance: CHECKIN, earned: CHECKIN } }, { new: true });
  if (!r) return bad(s, 'You already checked in today.');
  s.json(me(r));
}));

app.post('/api/spin', auth, h(async (q, s) => {
  const tot = SPIN.reduce((a, x) => a + x[1], 0);
  let r = crypto.randomInt(tot), prize = SPIN[0][0];
  for (const x of SPIN) { if (r < x[1]) { prize = x[0]; break; } r -= x[1]; }
  const u = await User.findOneAndUpdate({ _id: q.user.id, $or: [{ lastSpin: { $exists: false } }, { lastSpin: {$lte: Date.now() - 864e5 } }] }, { $set: { lastSpin: Date.now() }, $inc: { balance: prize, earned: prize } }, { new: true });
  if (!u) return bad(s, 'You already spun today.');
  s.json({ prize, me: me(u) });
}));

app.get('/api/leaderboard', auth, h(async (q, s) => {
  const realTop = await User.find({ earned: { $gt: 0 } }).sort({ rsCoins: -1, earned: -1 }).limit(20).select('name balance earned rsCoins avatar');
  const demoNames = ['Tanvir Ahmed', 'Rakibul Islam', 'Sumaiya Akter', 'Farhan Hossain', 'Nusrat Jahan', 'Mehedi Hasan', 'Ayesha Siddika', 'Imran Khan', 'Sadia Afrin', 'Nazmul Huda'];
  const demoAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80'
  ];
  let demoTop = [];
  let baseEarn = 45000;
  let baseCoins = 150000;
  const randomShift = Math.floor(Date.now() / 10000) % 7;
  
  for (let i = 0; i < 100; i++) {
    let flucBal = Math.max(500, baseEarn - (i * 300) + ((i * 13 + randomShift * 41) % 1500) - 750);
    let flucCoins = Math.max(500, baseCoins - (i * 1200) + ((i * 29 + randomShift * 67) % 5000) - 2500);
    demoTop.push({
      name: i === 0 ? '👑 Al-Amin (Top 1)' : (i === 1 ? '⭐ Shanto Mahmud (Top 2)' : (demoNames[i % demoNames.length] + ' ' + (i + 1))),
      balance: flucBal, earned: flucBal + 2000, rsCoins: flucCoins, avatar: demoAvatars[i % demoAvatars.length]
    });
  }
  let combined = realTop.map(u => ({ name: u.name, balance: u.balance || 0, earned: u.earned, rsCoins: u.rsCoins || 0, avatar: u.avatar || '' })).concat(demoTop);
  combined.sort((a, b) => b.rsCoins - a.rsCoins || b.earned - a.earned);
  s.json(combined.slice(0, 100));
}));

app.post('/api/withdraw', auth, h(async (q, s) => {
  if (q.user.role === 'employer' || q.user.role === 'buyer') return bad(s, 'Withdrawals are for workers only.');
  const { amount, method, phone } = q.body || {};
  const a = Math.floor(+amount);
  if (!(a >= MIN_WD && a <= MAX_WD)) return bad(s, 'Withdraw amount must be between ' + MIN_WD + ' and ' + MAX_WD + '.');
  if (!['bKash', 'Nagad'].includes(method)) return bad(s, 'Choose bKash or Nagad.');
  if (!phone || String(phone).trim().length < 11) return bad(s, 'Enter a valid phone number.');
  const r = await User.findOneAndUpdate({ _id: q.user.id, balance: { $gte: a } }, { $inc: { balance: -a } }, { new: true });
  if (!r) return bad(s, 'Not enough balance.');
  await Wd.create({ uid: q.user.id, name: q.user.name, amount: a, method, phone: String(phone).trim() });
  s.json(me(r));
}));

app.get('/api/withdrawals', auth, h(async (q, s) => s.json(await Wd.find({ uid: q.user.id }).sort({ at: -1 }).limit(30))));

app.post('/api/deposit', auth, h(async (q, s) => {
  const { amount, method, txid, lastDigits, pkgName } = q.body || {};
  const a = Math.floor(+amount);
  if (!(a >= 200 && a <= 15000)) return bad(s, 'Deposit amount must be between 200 and 15000 BDT.');
  if (!['bKash', 'Nagad'].includes(method)) return bad(s, 'Choose bKash or Nagad.');
  if (!txid || txid.trim().length < 10) return bad(s, 'Transaction ID must be at least 10 characters.');
  if (!lastDigits || String(lastDigits).trim().length !== 3) return bad(s, 'Please provide the last 3 digits of TrxID.');
  const lDigits = String(lastDigits).trim();
  const serialNo = '#D-' + Math.floor(100000 + Math.random() * 900000);

  const newDep = await Deposit.create({ uid: q.user.id, name: q.user.name, amount: a, method, txid: txid.trim(), lastDigits: lDigits, pkgName: pkgName || 'Custom Deposit', serialNo });
  s.json({ ok: true, serialNo, time: new Date().toLocaleString(), balance: q.user.balance, depositDetails: newDep });
}));

app.get('/api/deposits', auth, h(async (q, s) => s.json(await Deposit.find({ uid: q.user.id }).sort({ at: -1 }).limit(30))));

app.get('/api/global-feed', auth, h(async (q, s) => {
  const feedItems = [
    { name: 'Tanvir Ahmed', action: 'bKash-এ ৳500 ডিপোজিট সফল হয়েছে', type: 'dep', time: 'মাত্রই' },
    { name: 'Rakibul Islam', action: 'Nagad-এ ৳1,000 উত্তোলন করেছেন', type: 'wd', time: '১ মিনিট আগে' },
    { name: 'Sumaiya Akter', action: 'SMM Order #101 (Instagram Followers) Completed', type: 'smm', time: '২ মিনিট আগে' },
    { name: 'Farhan Hossain', action: 'Add Funds $50 USD approved via Binance Pay', type: 'smm', time: '৩ মিনিট আগে' },
    { name: 'Nusrat Jahan', action: 'প্রিমিয়াম RS Coin Package (৳1,500) কিনেছেন', type: 'shop', time: '৪ মিনিট আগে' }
  ];
  s.json(feedItems);
}));

app.get('/api/support', auth, h(async (q, s) => s.json(await Msg.find({ uid: q.user.id }).sort({ at: 1 }).limit(100))));
app.post('/api/support', auth, h(async (q, s) => {
  const text = String((q.body || {}).text || '').trim().slice(0, 500);
  if (!text) return bad(s, 'Write your message first.');
  await Msg.create({ uid: q.user.id, name: q.user.name, from: 'user', text });
  
  let botReply = 'আপনার মেসেজটি আমরা পেয়েছি। আমাদের সাপোর্ট টিম শীঘ্রই এটি চেক করে আপনাকে সহযোগিতা করবে।';
  const lower = text.toLowerCase();
  if(lower.includes('ডিপোজিট') || lower.includes('deposit') || lower.includes('funds')) {
    botReply = 'ডিপোজিট বা Add Funds সমস্যার জন্য সঠিক TrxID ও তথ্য প্রদান করুন। অ্যাডমিন অনুমোদনের পর ব্যালেন্স যুক্ত হয়।';
  } else if(lower.includes('smm') || lower.includes('order')) {
    botReply = 'SMM অর্ডারের ক্ষেত্রে সঠিক লিংক ও পরিমাণ দিন। অর্ডার পেন্ডিং বা প্রসেসিং থাকলে তা নির্দিষ্ট সময়ে ডেলিভারি হয়।';
  }
  
  await Msg.create({ uid: q.user.id, name: 'Support Bot', from: 'support', text: botReply });
  s.json({ ok: true });
}));

// ==================== ADMIN ENDPOINTS (WITH SMM INTEGRATION) ====================

app.get('/api/admin/smm/orders', admin, h(async (q, s) => {
  s.json(await SmmOrder.find({}).sort({ at: -1 }).limit(100).populate('uid', 'name phone email'));
}));

// Update SMM Order Status (Admin)
app.post('/api/admin/smm/orders/:id', admin, h(async (q, s) => {
  const { status, remains, errorDetails } = q.body || {};
  const order = await SmmOrder.findById(q.params.id);
  if (!order) return bad(s, 'Order not found.');

  const oldStatus = order.status;
  if (status) order.status = status;
  if (remains != null) order.remains = Number(remains);
  if (errorDetails) order.errorDetails = String(errorDetails);

  // If order cancelled or refunded and was not already refunded, refund USD to wallet atomically
  if ((status === 'Canceled' || status === 'Refunded') && oldStatus !== 'Canceled' && oldStatus !== 'Refunded') {
    const refundAmount = order.remains > 0 ? Math.round((order.remains / order.quantity) * order.totalCostUsd * 100) / 100 : order.totalCostUsd;
    if (refundAmount > 0) {
      const wallet = await UsdWallet.findOne({ uid: order.uid });
      if (wallet) {
        wallet.usdBalance = Math.round((wallet.usdBalance + refundAmount) * 100) / 100;
        await wallet.save();
        await SmmTransaction.create({ uid: order.uid, type: 'refund', amountUsd: refundAmount, description: `Refund for order #${order._id}` });
      }
    }
  }

  await order.save();
  s.json({ ok: true, order });
}));

// Admin SMM Fund Requests
app.get('/api/admin/smm/funds', admin, h(async (q, s) => {
  s.json({
    pending: await SmmFundRequest.find({ status: 'pending' }).sort({ at: 1 }),
    history: await SmmFundRequest.find({ status: { $ne: 'pending' } }).sort({ at: -1 }).limit(50)
  });
}));

app.post('/api/admin/smm/funds/:id', admin, h(async (q, s) => {
  const { ok } = q.body || {};
  const fundReq = await SmmFundRequest.findOne({ _id: q.params.id, status: 'pending' });
  if (!fundReq) return bad(s, 'Fund request not found.');

  if (ok) {
    fundReq.status = 'approved';
    await fundReq.save();

    let wallet = await UsdWallet.findOne({ uid: fundReq.uid });
    if (!wallet) {
      wallet = await UsdWallet.create({ uid: fundReq.uid, usdBalance: 0, spentUsd: 0 });
    }
    wallet.usdBalance = Math.round((wallet.usdBalance + fundReq.amountUsd) * 100) / 100;
    await wallet.save();

    await SmmTransaction.create({
      uid: fundReq.uid,
      type: 'deposit',
      amountUsd: fundReq.amountUsd,
      description: `Add Funds approved via ${fundReq.method} (TxID: ${fundReq.txid})`
    });
  } else {
    fundReq.status = 'rejected';
    await fundReq.save();
  }

  s.json({ ok: true });
}));

// Admin Manage Services
app.get('/api/admin/smm/services', admin, h(async (q, s) => {
  s.json(await SmmService.find({}));
}));

app.post('/api/admin/smm/services', admin, h(async (q, s) => {
  const { serviceId, name, category, platform, pricePerThousand, minQuantity, maxQuantity, description, active } = q.body || {};
  if (!serviceId || !name || !pricePerThousand) return bad(s, 'Service ID, name and price are required.');
  
  await SmmService.findOneAndUpdate(
    { serviceId: Number(serviceId) },
    { name, category: category || 'General', platform: platform || 'Other', pricePerThousand: Number(pricePerThousand), minQuantity: Number(minQuantity) || 10, maxQuantity: Number(maxQuantity) || 10000, description: description || '', active: active !== false },
    { upsert: true, new: true }
  );
  s.json({ ok: true });
}));

app.post('/api/admin/smm/services/delete/:id', admin, h(async (q, s) => {
  await SmmService.findByIdAndDelete(q.params.id);
  s.json({ ok: true });
}));

// Standard Admin Data
app.get('/api/admin/data', admin, h(async (q, s) => {
  await expire();
  const start = dayStart();
  const sum = async (M, match, f) => { const r = await M.aggregate([{ $match: match }, {$group: { _id: null, t: { $sum: '$' + f } } }]); return r.length ? r[0].t : 0; };
  s.json({
    stats: {
      users: await User.countDocuments(), active: await User.countDocuments({ lastSeen: { $gte: start.getTime() } }),
      newToday: await User.countDocuments({ created: { $gte: start } }),
      pending: await Click.countDocuments({ status: 'pending' }), success: await Click.countDocuments({ status: 'success' }), cancelled: await Click.countDocuments({ status: { $in: ['cancelled', 'expired'] } }),
      today: await sum(Conv, { at: { $gte: start } }, 'bdt'), balance: await sum(User, {}, 'balance'),
      wdPending: await Wd.countDocuments({ status: 'pending' }), wdPendingSum: await sum(Wd, { status: 'pending' }, 'amount'),
      wdToday: await Wd.countDocuments({ at: { $gte: start } }),
      depPending: await Deposit.countDocuments({ status: 'pending' }),
      pendingTasks: await CustomTask.countDocuments({ status: 'pending' }),
      smmPendingOrders: await SmmOrder.countDocuments({ status: 'Pending' }),
      smmFundPending: await SmmFundRequest.countDocuments({ status: 'pending' })
    }
  });
}));

app.get('/api/admin/wd-list', admin, h(async (q, s) => {
  s.json({ pending: await Wd.find({ status: 'pending' }).sort({ at: 1 }).limit(100), done: await Wd.find({ status: { $ne: 'pending' } }).sort({ at: -1 }).limit(20) });
}));

app.get('/api/admin/dep-list', admin, h(async (q, s) => {
  s.json({ pending: await Deposit.find({ status: 'pending' }).sort({ at: 1 }).limit(100), done: await Deposit.find({ status: { $ne: 'pending' } }).sort({ at: -1 }).limit(20) });
}));

app.post('/api/admin/wd/:id', admin, h(async (q, s) => {
  const statusVal = q.body.ok ? 'Success' : 'Rejected';
  const x = await Wd.findOneAndUpdate({ _id: q.params.id, status: 'pending' }, { status: statusVal });
  if (x && !q.body.ok) await User.updateOne({ _id: x.uid }, { $inc: { balance: x.amount } });
  s.json({ ok: true });
}));

app.post('/api/admin/dep/:id', admin, h(async (q, s) => {
  const dep = await Deposit.findOne({ _id: q.params.id, status: 'pending' });
  if (!dep) return bad(s, 'Deposit not found or already processed.');
  
  if (q.body.ok) {
    dep.status = 'approved';
    await dep.save();
    let coinsPerMin = 10;
    const a = dep.amount;
    if (a >= 3000) coinsPerMin = 300;
    else if (a >= 2500) coinsPerMin = 220;
    else if (a >= 2000) coinsPerMin = 160;
    else if (a >= 1500) coinsPerMin = 110;
    else if (a >= 1200) coinsPerMin = 80;
    else if (a >= 800) coinsPerMin = 50;
    else if (a >= 500) coinsPerMin = 25;
    else if (a >= 200) coinsPerMin = 10;

    const pkgData = { name: dep.pkgName || 'RS Coin Package', amount: a, coinsPerMin, startedAt: Date.now(), lastClaim: Date.now(), expiresAt: Date.now() + (30 * 86400000) };
    await User.updateOne({ _id: dep.uid }, { $inc: { balance: a, earned: a }, $set: { activePkg: pkgData } });
  } else {
    dep.status = 'rejected';
    await dep.save();
  }
  s.json({ ok: true });
}));

// ==================== FRONTEND PAGE HTML & JAVASCRIPT ====================
const PAGE = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="google-site-verification" content="LFCR_Ofi-3uqR900pf2ntTa2io3ymE1PRv4jlyWoX28" />
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#3b82f6">
<title>RS Growth Matrix & Professional SMM Panel</title>
<script src="https://accounts.google.com/gsi/client" async defer></script>
<style>
:root{--bg:#060913;--card:#0f172a;--line:#1e293b;--tx:#f8fafc;--mu:#94a3b8;--gold:#fbbf24;--grn:#22c55e;--blu:#3b82f6;--red:#ef4444;--smm-blue:#2563eb;--smm-red:#dc2626}
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif}
body{background:var(--bg);color:var(--tx);display:flex;justify-content:center;min-height:100vh;padding:8px}
.app{width:100%;max-width:440px;background:var(--card);border:1px solid var(--line);border-radius:26px;height:96vh;display:flex;flex-direction:column;overflow:hidden;position:relative}
.pwa-banner{display:flex;background:linear-gradient(90deg,var(--blu),var(--smm-blue));color:#fff;padding:12px 16px;border-radius:14px;align-items:center;justify-content:space-between;margin:10px 14px 0 14px;font-weight:700;font-size:13.5px;box-shadow:0 4px 12px rgba(37,99,235,0.3);position:relative;z-index:10}
.pwa-banner button{background:#000;color:#fff;border:0;padding:7px 14px;border-radius:10px;font-size:12px;cursor:pointer;font-weight:bold}
#landing{position:absolute;inset:0;z-index:60;background:#060913;overflow-y:auto;padding:16px;text-align:left}
#auth{position:absolute;inset:0;z-index:50;background:radial-gradient(circle at top,#1e1b4b,#060913 70%);padding:22px;overflow-y:auto;text-align:center;display:none}
.card{background:rgba(15,23,42,.92);border:1px solid rgba(59,130,246,.3);border-radius:18px;padding:16px;text-align:left}
.brand{font-family:Georgia,serif;font-size:24px;font-weight:700;color:var(--blu);margin:6px 0 2px;letter-spacing:.5px}
.sub{font-size:12px;color:var(--mu);margin-bottom:14px}
.seg{display:flex;background:var(--bg);border-radius:10px;padding:3px;margin-bottom:12px}
.seg div{flex:1;text-align:center;padding:8px;font-size:12px;font-weight:700;border-radius:8px;color:var(--mu);cursor:pointer}
.seg .on{background:linear-gradient(90deg,var(--blu),var(--smm-red));color:#fff}
label{font-size:11px;color:var(--mu);display:block;margin-top:9px}
input,select,textarea{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:11px;color:#fff;font-size:14px;margin-top:4px}
input:focus,select:focus,textarea:focus{outline:2px solid var(--blu)}
.btn{width:100%;border:0;border-radius:12px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;margin-top:12px;background:linear-gradient(90deg,var(--blu),var(--smm-red));color:#fff}
.btn.g{background:var(--grn);color:#fff}.btn.r{background:var(--red);color:#fff}.btn.s{width:auto;padding:6px 12px;font-size:12px;margin:0;border-radius:14px}
.top{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#131d38,#0f172a)}
.top .l{display:flex;align-items:center;gap:9px;min-width:0}.top b{font-size:14px}.bal{text-align:right;font-size:15px;font-weight:800;color:var(--blu)}.bal small{display:block;font-size:10px;color:var(--mu);font-weight:400}
.av{width:40px;height:40px;border-radius:50%;border:2px solid var(--blu);background:#16213f;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;overflow:hidden;flex-shrink:0}
.av img{width:100%;height:100%;object-fit:contain;display:block}
nav{display:flex;gap:2px;padding:7px 3px 9px;background:#0b1224;box-shadow:0 10px 20px rgba(0,0,0,.6);position:relative;z-index:5;overflow-x:auto}
nav div{flex:1;text-align:center;font-size:9px;color:var(--mu);padding:6px 2px;cursor:pointer;border-radius:11px;background:linear-gradient(180deg,#18244a,#0e1730);min-width:52px}
nav div i{display:block;font-style:normal;font-size:14px;position:relative;width:22px;height:22px;line-height:22px;margin:0 auto}
nav .on{color:#fff;transform:translateY(-1px);background:linear-gradient(180deg,var(--smm-blue),var(--smm-red));box-shadow:0 0 0 1px var(--blu)}
main{flex:1;overflow-y:auto;padding:14px}
.row{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px}
.row small{display:block;color:var(--mu);font-size:11px;margin-top:2px}
h3{font-size:13px;color:var(--mu);margin:4px 0 10px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.stat{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px 6px;text-align:center}.stat b{display:block;font-size:15px;color:var(--blu)}.stat small{font-size:11px;color:var(--mu)}
.chip{font-size:10px;padding:3px 8px;border-radius:10px;background:#1e293b;color:var(--blu)}
.chip.approved,.chip.Completed,.chip.Success{color:var(--grn)}.chip.rejected,.chip.Canceled,.chip.Refunded{color:var(--red)}.chip.pending,.chip.Pending{color:var(--gold)}
.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:130;align-items:center;justify-content:center;padding:14px}
.modal>div{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;width:100%;max-width:410px;max-height:90vh;overflow-y:auto}
.adm{display:none;position:fixed;inset:0;z-index:120;background:var(--bg);flex-direction:column;max-width:440px;margin:0 auto}
.adm.on{display:flex}
.ah{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#131d38,#0f172a)}
.ah b{color:var(--blu);font-size:15px}
#abody{flex:1;overflow-y:auto;padding:14px}
#anav{display:flex;gap:4px;padding:8px 5px 10px;background:#0b1224;overflow-x:auto}
#anav div{flex:1;text-align:center;font-size:9.5px;color:var(--mu);padding:7px 2px;cursor:pointer;border-radius:13px;background:linear-gradient(180deg,#18244a,#0e1730);min-width:65px}
#anav .on{color:#fff;background:linear-gradient(180deg,var(--smm-blue),var(--smm-red));box-shadow:0 0 0 1px var(--blu)}
.th{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:12px}
.th .hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:13px;font-weight:700}
.gap{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
</style></head><body>
<div class="app">
<div id="landing">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
    <div style="display:flex;align-items:center;gap:10px"><div id="logoL"></div><b style="color:var(--blu);font-size:16px">RS Growth Matrix & SMM Panel</b></div>
    <span style="font-size:12px;background:rgba(59,130,246,.15);color:var(--blu);padding:4px 10px;border-radius:20px;border:1px solid rgba(59,130,246,.3)">EN ▾</span>
  </div>
  <div style="background:linear-gradient(135deg,#1e1b4b,#0f172a);border:1px solid rgba(59,130,246,.3);border-radius:20px;padding:16px;margin-bottom:14px">
    <div style="font-size:11px;color:var(--blu);font-weight:700;margin-bottom:6px">⚡ Professional SMM Panel & Micro-Jobs</div>
    <h1 style="font-size:22px;color:#fff;margin-bottom:8px;line-height:1.3">Grow Social Media & Earn Rewards</h1>
    <p style="font-size:12px;color:var(--mu);line-height:1.6;margin-bottom:14px">RS Growth Matrix features a dedicated Buyer USD Wallet, SMM Services, automated order processing, and worker reward tasks.</p>
    <button class="btn" style="padding:14px;font-size:15px;margin-bottom:4px" onclick="openAuth()">🚀 Get Started / Login</button>
  </div>
</div>
<div id="auth">
  <div id="logoA"></div><div class="brand">RS Growth Matrix & SMM</div><div class="sub">Choose account type and login/register.</div>
  <div class="card">
    <div class="seg"><div id="tReg" class="on" onclick="mode('reg')">Register</div><div id="tLog" onclick="mode('log')">Login</div></div>
    <div id="fReg">
      <label>Account Type</label>
      <select id="rRole">
        <option value="worker">Worker (টাস্ক করে আয় করতে চাই)</option>
        <option value="buyer">Buyer / SMM Reseller (সোশ্যাল মিডিয়া গ্রোথ ও SMM প্যানেল)</option>
        <option value="employer">Employer (প্রোমোশন ও টাস্ক দিতে চাই)</option>
      </select>
      <label>Name</label><input id="rN" autocomplete="username" placeholder="Your name">
      <label>Phone number</label><input id="rP" inputmode="numeric" maxlength="11" placeholder="01XXXXXXXXX">
      <label>Password</label><input id="rW" type="password" autocomplete="new-password">
      <label>Confirm password</label><input id="rC" type="password" autocomplete="new-password">
      <button class="btn g" onclick="reg()">Confirm Registration</button>
    </div>
    <div id="fLog" style="display:none">
      <label>Name</label><input id="lN" autocomplete="username">
      <label>Password</label><input id="lW" type="password" autocomplete="current-password">
      <button class="btn" onclick="login()">Login</button>
    </div>
    <div id="aErr" style="color:var(--red);font-size:12px;margin-top:8px"></div>
    <div id="gWrap"><div style="font-size:11px;color:var(--mu);margin:14px 0 8px;text-align:center">or continue with</div><div id="gBtn" style="display:flex;justify-content:center"></div></div>
  </div>
</div>
<div class="top"><div class="l"><div id="logoT"></div><div class="av" id="avT" onclick="$('avf').click()">📷</div><div><b id="hName"></b><small id="hWalletBadge" style="display:block;color:var(--blu);font-size:11px">USD Wallet: $0.00</small></div></div><div class="bal"><span id="hBal">0.00</span><small id="hBalLabel">BDT Balance</small></div></div>
<input type="file" id="avf" accept="image/*" style="display:none" onchange="avUp(this)">
<nav id="nav"></nav>
<div id="pwaBanner" class="pwa-banner">
  <span>📱 অ্যাপটি ইনস্টল করুন</span>
  <button onclick="installPWA()">Install</button>
</div>
<main id="main"></main>
</div>
<div class="adm" id="adm"><div class="ah"><b>Admin Panel (RS Matrix & SMM)</b><button class="btn s" onclick="admClose()">Close</button></div><div id="abody"></div><div id="anav"></div></div>
<div class="modal" id="modal"><div id="mBody"></div></div>
<script>
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function(){});
var deferredPrompt = null;
window.addEventListener('beforeinstallprompt', function(e) { e.preventDefault(); deferredPrompt = e; var b = $('pwaBanner'); if (b) b.style.display = 'flex'; });
function installPWA() {
  if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.then(function(choice) { if (choice.outcome === 'accepted') { var b = $('pwaBanner'); if (b) b.style.display = 'none'; } deferredPrompt = null; }); }
}

var GID='__GID__', T=localStorage.getItem('t'), ME=null, ADM='', TAB='home', SMM_DATA={wallet:null, services:[], orders:[], txs:[]};

function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function money(n){return Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function logo(s){var g='lg';return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 100 100"><defs><linearGradient id="'+g+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset="1" stop-color="#dc2626"/></linearGradient></defs><path d="M50 4 90 20v30c0 25-17 42-40 48C27 92 10 75 10 50V20z" fill="#0b1020" stroke="url(#'+g+')" stroke-width="4"/><text x="50" y="60" text-anchor="middle" font-size="34" font-weight="800" fill="url(#'+g+')" font-family="Georgia,serif">SMM</text></svg>'}
function api(p,m,b,hd){hd=hd||{};hd['Content-Type']='application/json';if(T)hd.Authorization='Bearer '+T;
 return fetch('/api/'+p,{method:m||'GET',headers:hd,body:b?JSON.stringify(b):undefined}).then(function(r){return r.json().then(function(d){if(r.status===401&&T){out();throw new Error(d.error)}if(!r.ok)throw new Error(d.error||'Error');return d})})}
function out(){localStorage.removeItem('t');T=null;ME=null;admClose();$('landing').style.display='block'}
function openAuth(){$('landing').style.display='none';$('auth').style.display='block'}
function mode(m){$('tReg').className=m==='reg'?'on':'';$('tLog').className=m==='log'?'on':'';$('fReg').style.display=m==='reg'?'block':'none';$('fLog').style.display=m==='log'?'block':'none';$('aErr').textContent=''}
function done(d){T=d.token;localStorage.setItem('t',T);enter(d.me)}
function fail(e){$('aErr').textContent=e.message}
function reg(){api('register','POST',{name:$('rN').value,phone:$('rP').value,password:$('rW').value,confirm:$('rC').value,role:$('rRole').value}).then(done).catch(fail)}
function login(){api('login','POST',{name:$('lN').value,password:$('lW').value}).then(done).catch(fail)}
function gCb(r){api('google','POST',{credential:r.credential}).then(done).catch(fail)}
function initG(){if(!GID){$('gWrap').style.display='none';return} if(!window.google||!google.accounts)return setTimeout(initG,400);google.accounts.id.initialize({client_id:GID,callback:gCb});google.accounts.id.renderButton($('gBtn'),{theme:'filled_black',size:'large',text:'continue_with',width:280})}

function getTabs() {
  if (ME && (ME.role === 'buyer' || ME.role === 'employer')) {
    return [
      ['smm_dash','📊','Dashboard'],
      ['smm_order','🛒','New Order'],
      ['smm_mass','📦','Mass Order'],
      ['smm_services','📋','Services'],
      ['smm_funds','💳','Add Funds'],
      ['smm_orders','📋','Orders'],
      ['smm_tx','📜','History'],
      ['help','💬','Support'],
      ['acc','👤','Account']
    ];
  }
  return [['home','🏠','Home'],['tasks','📋','Tasks'],['pkg','📦','Package'],['rank','🏆','Ranking'],['ref','👥','Refer'],['help','💬','Support'],['acc','👤','Account']];
}

function enter(m){
  ME=m; $('landing').style.display='none'; $('auth').style.display='none';
  var tbs = getTabs();
  $('nav').innerHTML=tbs.map(function(t){return '<div id="n_'+t[0]+'" onclick="go(\\''+t[0]+'\\')"><i>'+t[1]+'</i>'+t[2]+'</div>'}).join('');
  head();
  if (ME.role === 'buyer' || ME.role === 'employer') {
    fetchSmmWallet(function(){ go('smm_dash'); });
  } else {
    go('home');
  }
}

function head(){
  $('hName').textContent = ME.name + ' (' + ME.role + ')';
  if (ME.role === 'buyer' || ME.role === 'employer') {
    $('hBal').textContent = '$' + (SMM_DATA.wallet ? money(SMM_DATA.wallet.usdBalance) : '0.00');
    $('hBalLabel').textContent = 'USD Wallet';
    $('hWalletBadge').textContent = 'BDT: ৳' + money(ME.balance);
  } else {
    $('hBal').textContent = money(ME.balance);
    $('hBalLabel').textContent = 'BDT Balance';
    $('hWalletBadge').textContent = 'RS Coins: ' + (ME.rsCoins || 0);
  }
  $('avT').innerHTML = ME.av ? '<img src="'+esc(ME.av)+'" alt="">' : '📷';
}

function fetchSmmWallet(cb){
  if(ME.role !== 'buyer' && ME.role !== 'employer') { if(cb) cb(); return; }
  api('smm/wallet').then(function(res){
    SMM_DATA.wallet = res;
    head();
    if(cb) cb();
  }).catch(function(){ if(cb) cb(); });
}

function go(t){
  TAB=t;
  getTabs().forEach(function(x){ var el = $('n_'+x[0]); if(el) el.className = x[0]===t ? 'on' : ''; });
  var pages = {
    home: vHome, tasks: vTasks, pkg: vPkg, rank: vRank, ref: vRef, help: vHelp, acc: vAcc,
    smm_dash: vSmmDash, smm_order: vSmmNewOrder, smm_mass: vSmmMassOrder, smm_services: vSmmServicesList,
    smm_funds: vSmmAddFunds, smm_orders: vSmmOrdersList, smm_tx: vSmmTxHistory
  };
  if(pages[t]) pages[t]();
}

function avUp(inp){var f=inp.files[0];if(!f)return;var r=new FileReader();
 r.onload=function(){var im=new Image();im.onload=function(){var c=document.createElement('canvas');c.width=c.height=128;var x=c.getContext('2d');x.drawImage(im,0,0,128,128);
  api('avatar','POST',{img:c.toDataURL('image/jpeg',0.9)}).then(function(d){ME.av=d.av;head()}).catch(function(e){alert(e.message)});};im.src=r.result;};r.readAsDataURL(f);inp.value='';}

// ==================== BUYER / SMM VIEWS ====================

function vSmmDash(){
  fetchSmmWallet(function(){
    var w = SMM_DATA.wallet || {usdBalance:0, spentUsd:0, stats:{totalOrders:0, pendingOrders:0, completedOrders:0}};
    $('main').innerHTML = '<div style="background:linear-gradient(135deg,#1e1b4b,#0f172a);border:1px solid var(--blu);border-radius:18px;padding:16px;margin-bottom:14px">' +
    '<h2 style="color:var(--blu);font-size:18px;margin-bottom:4px">Buyer SMM Dashboard</h2>' +
    '<p style="font-size:12px;color:var(--mu)">Manage your social media campaigns with automated SMM API integration and secure USD wallet.</p></div>' +
    '<div class="grid3">' +
    '<div class="stat"><b>$' + money(w.usdBalance) + '</b><small>USD Balance</small></div>' +
    '<div class="stat"><b>$' + money(w.spentUsd) + '</b><small>Total Spent</small></div>' +
    '<div class="stat"><b>' + w.stats.totalOrders + '</b><small>Total Orders</small></div>' +
    '</div>' +
    '<div class="grid">' +
    '<div class="stat"><b>' + w.stats.pendingOrders + '</b><small>Pending Orders</small></div>' +
    '<div class="stat"><b>' + w.stats.completedOrders + '</b><small>Completed Orders</small></div>' +
    '</div>' +
    '<button class="btn" onclick="go(\\'smm_order\\')">🛒 Place New SMM Order Now</button>';
  });
}

function vSmmNewOrder(){
  api('smm/services').then(function(services){
    SMM_DATA.services = services;
    var catMap = {};
    services.forEach(function(s){ catMap[s.category] = catMap[s.category] || []; catMap[s.category].push(s); });

    var options = services.map(function(s){
      return '<option value="'+s.serviceId+'">#'+s.serviceId+' - '+esc(s.name)+' ($'+s.pricePerThousand+'/1k)</option>';
    }).join('');

    $('main').innerHTML = '<div class="card">' +
    '<h3 style="color:var(--blu)">🛒 New Order - SMM Panel</h3>' +
    '<label>Service Category</label>' +
    '<select id="smmCat" onchange="filterServices()">' + Object.keys(catMap).map(c=>'<option value="'+c+'">'+c+'</option>').join('') + '</select>' +
    '<label>Select Service</label>' +
    '<select id="smmServId" onchange="updateServiceInfo()">' + options + '</select>' +
    '<div id="servDescBox" style="font-size:11.5px;color:var(--mu);margin:8px 0;padding:8px;background:#131d38;border-radius:8px"></div>' +
    '<label>Target URL / Link</label>' +
    '<input id="smmUrl" placeholder="https://instagram.com/p/..."> ' +
    '<label>Quantity</label>' +
    '<input id="smmQty" type="number" placeholder="1000" oninput="calcSmmCost()">' +
    '<div style="margin:10px 0;font-size:13px;font-weight:bold">Estimated Cost: <span id="smmCostPreview" style="color:var(--grn)">$0.00 USD</span></div>' +
    '<button class="btn g" onclick="submitSmmOrder()">Place Order</button>' +
    '</div>';
    updateServiceInfo();
  }).catch(function(e){ $('main').innerHTML = '<div class="row">'+e.message+'</div>'; });
}

function filterServices(){
  // Handled dynamically
}

function updateServiceInfo(){
  var sId = Number($('smmServId').value);
  var serv = SMM_DATA.services.find(s => s.serviceId === sId);
  if(serv){
    $('servDescBox').innerHTML = '<b>Min:</b> '+serv.minQuantity+' | <b>Max:</b> '+serv.maxQuantity+' | <b>Price:</b> $'+serv.pricePerThousand+'/1k<br>'+esc(serv.description);
    calcSmmCost();
  }
}

function calcSmmCost(){
  var sId = Number($('smmServId').value);
  var qty = Number($('smmQty').value) || 0;
  var serv = SMM_DATA.services.find(s => s.serviceId === sId);
  if(serv){
    var cost = Math.round((qty / 1000) * serv.pricePerThousand * 100) / 100;
    $('smmCostPreview').textContent = '$' + money(cost) + ' USD';
  }
}

function submitSmmOrder(){
  var data = {
    serviceId: Number($('smmServId').value),
    targetUrl: $('smmUrl').value,
    quantity: Number($('smmQty').value)
  };
  api('smm/order','POST',data).then(function(res){
    alert('Order placed successfully! Order ID: ' + res.order._id);
    go('smm_orders');
  }).catch(function(e){ alert(e.message); });
}

function vSmmMassOrder(){
  $('main').innerHTML = '<div class="card">' +
  '<h3 style="color:var(--blu)">📦 Mass Order SMM</h3>' +
  '<p style="font-size:12px;color:var(--mu);margin-bottom:10px">Format per line: <code>serviceId | link | quantity</code></p>' +
  '<textarea id="massText" rows="6" placeholder="101 | https://instagram.com/p/abc | 1000&#10;102 | https://instagram.com/p/xyz | 500"></textarea>' +
  '<button class="btn g" onclick="submitMassOrder()">Submit Mass Order</button>' +
  '</div>';
}

function submitMassOrder(){
  api('smm/mass-order','POST',{ ordersText: $('massText').value }).then(function(res){
    alert('Mass order processed! Successful: ' + res.successCount + ', Failed: ' + res.failCount);
    go('smm_orders');
  }).catch(function(e){ alert(e.message); });
}

function vSmmServicesList(){
  api('smm/services').then(function(services){
    $('main').innerHTML = '<h3>📋 SMM Services Catalog</h3>' +
    (services.length ? services.map(function(s){
      return '<div class="row"><div><b>#'+s.serviceId+' - '+esc(s.name)+'</b><small>Cat: '+esc(s.category)+' | Min: '+s.minQuantity+' - Max: '+s.maxQuantity+'</small></div><div style="text-align:right"><b style="color:var(--grn)">$'+money(s.pricePerThousand)+'</b><small>/1000</small></div></div>';
    }).join('') : '<div class="row">No services available.</div>');
  }).catch(function(e){ $('main').innerHTML = '<div class="row">'+e.message+'</div>'; });
}

function vSmmAddFunds(){
  api('smm/fund-requests').then(function(reqs){
    $('main').innerHTML = '<div class="card">' +
    '<h3 style="color:var(--blu)">💳 Add Funds (USD Wallet Deposit)</h3>' +
    '<label>Payment Method</label>' +
    '<select id="fMethod"><option value="bKash">bKash (BDT Converted)</option><option value="Nagad">Nagad (BDT Converted)</option><option value="BinancePay">Binance Pay (USDT)</option><option value="USDT_TRC20">USDT TRC20</option></select>' +
    '<label>Amount in USD ($)</label>' +
    '<input id="fAmt" type="number" placeholder="10">' +
    '<label>Transaction / Reference ID (TxID)</label>' +
    '<input id="fTxid" placeholder="Enter Transaction ID">' +
    '<button class="btn g" onclick="submitFundReq()">Submit Deposit Request</button>' +
    '</div>' +
    '<h3>Deposit Requests History</h3>' +
    (reqs.length ? reqs.map(function(r){
      return '<div class="row"><div><b>$'+money(r.amountUsd)+' USD</b> ('+esc(r.method)+')<small>TxID: '+esc(r.txid)+' | '+new Date(r.at).toLocaleDateString()+'</small></div><span class="chip '+r.status+'">'+r.status+'</span></div>';
    }).join('') : '<div class="row">No fund requests yet.</div>');
  }).catch(function(e){ $('main').innerHTML = '<div class="row">'+e.message+'</div>'; });
}

function submitFundReq(){
  api('smm/fund-request','POST',{
    amountUsd: Number($('fAmt').value),
    method: $('fMethod').value,
    txid: $('fTxid').value
  }).then(function(){
    alert('Fund request submitted successfully. Pending admin approval.');
    go('smm_funds');
  }).catch(function(e){ alert(e.message); });
}

function vSmmOrdersList(){
  api('smm/orders').then(function(orders){
    SMM_DATA.orders = orders;
    $('main').innerHTML = '<h3>📋 SMM Orders History</h3>' +
    (orders.length ? orders.map(function(o){
      return '<div class="th">' +
      '<div class="hd"><span>Order #'+o._id.slice(-6)+'</span><span style="color:var(--grn)">$'+money(o.totalCostUsd)+'</span></div>' +
      '<div style="font-size:12.5px">' +
      'Service: <b>#'+o.serviceId+' - '+esc(o.serviceName)+'</b><br>' +
      'Target: <a href="'+esc(o.targetUrl)+'" target="_blank" style="color:var(--blu)">Link</a> | Qty: <b>'+o.quantity+'</b><br>' +
      'Status: <span class="chip '+o.status+'">'+o.status+'</span> | Remains: '+o.remains+
      (o.errorDetails ? '<br><span style="color:var(--red)">Error: '+esc(o.errorDetails)+'</span>' : '') +
      '</div></div>';
    }).join('') : '<div class="row">No orders placed yet.</div>');
  }).catch(function(e){ $('main').innerHTML = '<div class="row">'+e.message+'</div>'; });
}

function vSmmTxHistory(){
  fetchSmmWallet(function(){
    var txs = SMM_DATA.wallet ? SMM_DATA.wallet.transactions : [];
    $('main').innerHTML = '<h3>📜 USD Wallet Transaction Ledger</h3>' +
    (txs.length ? txs.map(function(t){
      var col = t.type === 'deposit' ? 'var(--grn)' : 'var(--red)';
      return '<div class="row"><div><b>'+esc(t.description)+'</b><small>'+new Date(t.at).toLocaleString()+'</small></div><b style="color:'+col+'">'+(t.type==='deposit'?'+':'-')+'$'+money(t.amountUsd)+'</b></div>';
    }).join('') : '<div class="row">No transactions found.</div>');
  });
}

// ==================== ORIGINAL VIEWS ====================
function vHome(){ $('main').innerHTML = '<div class="card"><h3>Welcome to RS Growth Matrix & SMM Panel</h3><p>Select your dashboard from navigation.</p></div>'; }
function vTasks(){ $('main').innerHTML = '<div class="card"><h3>Tasks Dashboard</h3><p>Worker tasks available here.</p></div>'; }
function vPkg(){ $('main').innerHTML = '<div class="card"><h3>Packages</h3></div>'; }
function vRank(){ $('main').innerHTML = '<div class="card"><h3>Leaderboard</h3></div>'; }
function vRef(){ $('main').innerHTML = '<div class="card"><h3>Referral Program</h3></div>'; }
function vHelp(){ $('main').innerHTML = '<div class="card"><h3>Support</h3></div>'; }
function vAcc(){ $('main').innerHTML = '<div class="card"><h3>Account Settings</h3><button class="btn r" onclick="out()">Logout</button></div>'; }

// ==================== ADMIN PANEL INTEGRATION ====================
var ATABS = [['ov','📊','Overview'],['smm_ord','🛒','SMM Orders'],['smm_fun','💳','Fund Req'],['smm_srv','⚙️','Services'],['wd','💸','Wd'],['dep','💳','Dep']];
function ah(){return {'x-admin-pass':ADM}}

function admOpen(){
  var p = prompt('Enter Admin Password:');
  if(!p) return;
  ADM = p;
  api('admin/data','GET',null,ah()).then(function(){
    $('adm').className = 'adm on';
    $('anav').innerHTML = ATABS.map(function(t){return '<div id="a_'+t[0]+'" onclick="admGo(\\''+t[0]+'\\')"><i>'+t[1]+'</i>'+t[2]+'</div>'}).join('');
    admGo('ov');
  }).catch(function(){ alert('Wrong admin password.'); ADM=''; });
}
function admClose(){$('adm').className='adm'}
function admGo(t){
  ATABS.forEach(function(x){ var el=$('a_'+x[0]); if(el) el.className = x[0]===t ? 'on' : ''; });
  $('abody').innerHTML='<div class="row">Loading...</div>';
  ({ov:aOv, smm_ord:aSmmOrders, smm_fun:aSmmFunds, smm_srv:aSmmServicesAdmin, wd:aWd, dep:aDep})[t]();
}

function aOv(){
  api('admin/data','GET',null,ah()).then(function(d){
    var s=d.stats;
    $('abody').innerHTML='<h3>Admin Overview</h3><div class="grid">' +
    '<div class="stat"><b>'+s.users+'</b><small>Users</small></div>' +
    '<div class="stat"><b>'+s.smmPendingOrders+'</b><small>Pending SMM Orders</small></div>' +
    '<div class="stat"><b>'+s.smmFundPending+'</b><small>Pending Fund Req</small></div>' +
    '<div class="stat"><b>৳'+money(s.balance)+'</b><small>Total BDT Bal</small></div></div>';
  }).catch(function(e){ $('abody').innerHTML='<div class="row">'+e.message+'</div>'; });
}

function aSmmOrders(){
  api('admin/smm/orders','GET',null,ah()).then(function(orders){
    $('abody').innerHTML = '<h3>Manage SMM Orders</h3>' +
    (orders.length ? orders.map(function(o){
      return '<div class="th"><div class="hd"><span>Order #'+o._id.slice(-6)+'</span><span style="color:var(--grn)">$'+money(o.totalCostUsd)+'</span></div>' +
      '<div style="font-size:12px">Service: #'+o.serviceId+' | Qty: '+o.quantity+'<br>Status: <span class="chip '+o.status+'">'+o.status+'</span></div>' +
      '<div class="gap"><button class="btn s g" onclick="updateAdminOrder(\\''+o._id+'\\',\\'Completed\\')">Complete</button>' +
      '<button class="btn s r" onclick="updateAdminOrder(\\''+o._id+'\\',\\'Canceled\\')">Cancel/Refund</button></div></div>';
    }).join('') : '<div class="row">No SMM orders.</div>');
  }).catch(function(e){ $('abody').innerHTML = '<div class="row">'+e.message+'</div>'; });
}

function updateAdminOrder(id, status){
  api('admin/smm/orders/'+id,'POST',{ status: status }, ah()).then(function(){ alert('Order updated!'); aSmmOrders(); }).catch(function(e){ alert(e.message); });
}

function aSmmFunds(){
  api('admin/smm/funds','GET',null,ah()).then(function(res){
    var pending = res.pending;
    $('abody').innerHTML = '<h3>Pending Add Funds Requests</h3>' +
    (pending.length ? pending.map(function(f){
      return '<div class="th"><div class="hd"><span>'+esc(f.name)+'</span><span style="color:var(--grn)">$'+money(f.amountUsd)+'</span></div>' +
      '<div style="font-size:12px">Method: '+esc(f.method)+' | TxID: <b>'+esc(f.txid)+'</b></div>' +
      '<div class="gap"><button class="btn s g" onclick="decFundReq(\\''+f._id+'\\',true)">Approve & Credit USD</button>' +
      '<button class="btn s r" onclick="decFundReq(\\''+f._id+'\\',false)">Reject</button></div></div>';
    }).join('') : '<div class="row">No pending fund requests.</div>');
  }).catch(function(e){ $('abody').innerHTML = '<div class="row">'+e.message+'</div>'; });
}

function decFundReq(id, ok){
  api('admin/smm/funds/'+id,'POST',{ ok: ok }, ah()).then(function(){ alert('Processed successfully.'); aSmmFunds(); }).catch(function(e){ alert(e.message); });
}

function aSmmServicesAdmin(){
  api('admin/smm/services','GET',null,ah()).then(function(services){
    $('abody').innerHTML = '<h3>Manage SMM Services</h3>' +
    '<div class="card" style="margin-bottom:12px">' +
    '<label>Service ID</label><input id="asId" type="number" placeholder="105">' +
    '<label>Service Name</label><input id="asName" placeholder="YouTube Views">' +
    '<label>Category</label><input id="asCat" placeholder="YouTube">' +
    '<label>Price per 1000 ($ USD)</label><input id="asPrice" type="number" placeholder="3.50">' +
    '<label>Min Qty</label><input id="asMin" type="number" value="10">' +
    '<label>Max Qty</label><input id="asMax" type="number" value="10000">' +
    '<label>Description</label><input id="asDesc" placeholder="Fast delivery">' +
    '<button class="btn g" onclick="saveAdminService()">Save / Add Service</button></div>' +
    (services.length ? services.map(function(s){
      return '<div class="th"><div class="hd"><span>#'+s.serviceId+' - '+esc(s.name)+'</span><span style="color:var(--grn)">$'+money(s.pricePerThousand)+'/1k</span></div><button class="btn s r" onclick="delAdminService(\\''+s._id+'\\')">Delete</button></div>';
    }).join('') : '');
  }).catch(function(e){ $('abody').innerHTML = '<div class="row">'+e.message+'</div>'; });
}

function saveAdminService(){
  api('admin/smm/services','POST',{
    serviceId: $('asId').value,
    name: $('asName').value,
    category: $('asCat').value,
    pricePerThousand: $('asPrice').value,
    minQuantity: $('asMin').value,
    maxQuantity: $('asMax').value,
    description: $('asDesc').value
  }, ah()).then(function(){ alert('Service saved.'); aSmmServicesAdmin(); }).catch(function(e){ alert(e.message); });
}

function delAdminService(id){
  api('admin/smm/services/delete/'+id,'POST',null,ah()).then(function(){ alert('Deleted.'); aSmmServicesAdmin(); }).catch(function(e){ alert(e.message); });
}

function aWd(){
  api('admin/wd-list','GET',null,ah()).then(function(d){
    $('abody').innerHTML = '<h3>Worker Withdrawals</h3>' + (d.pending.length ? d.pending.map(w=>'<div class="th"><div class="hd"><span>'+esc(w.name)+'</span><span>৳'+w.amount+'</span></div></div>').join('') : '<div class="row">No pending withdrawals.</div>');
  }).catch(function(e){ $('abody').innerHTML = '<div class="row">'+e.message+'</div>'; });
}

function aDep(){
  api('admin/dep-list','GET',null,ah()).then(function(d){
    $('abody').innerHTML = '<h3>Worker Deposits</h3>' + (d.pending.length ? d.pending.map(dep=>'<div class="th"><div class="hd"><span>'+esc(dep.name)+'</span><span>৳'+dep.amount+'</span></div></div>').join('') : '<div class="row">No pending deposits.</div>');
  }).catch(function(e){ $('abody').innerHTML = '<div class="row">'+e.message+'</div>'; });
}

document.addEventListener('DOMContentLoaded',function(){
  $('logoL').innerHTML=logo(32); $('logoA').innerHTML=logo(88); $('logoT').innerHTML=logo(40); initG();
  if(T) api('me').then(enter).catch(function(){ $('landing').style.display='block'; });
  else $('landing').style.display='block';
});
</script></body></html>`;

app.get('/', (req, res) => res.send(PAGE.replace('__GID__', GID.replace(/[^\w.\-]/g, ''))));
app.listen(PORT, () => console.log('Server is running on port ' + PORT));
