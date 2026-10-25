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
  d: 'RS Growth Matrix একটি টাস্কভিত্তিক রিওয়ার্ড প্ল্যাটফর্ম। এখানে সহজ টাস্ক, দৈনিক বোনাস, অ্যাড দেখে ইনকাম ও লাকি ড্রয়ের মাধ্যমে ব্যালেন্স জমিয়ে bKash বা Nagad-এ উত্তোলন করা যায়। এছাড়া আমাদের কোলাবোরেশন পার্টনার আর এস গ্যালারি শপ (RS Gallery Shop) থেকে আপনার জমানো ইনকামের টাকা দিয়ে খুব সহজেই দেশি-বিদেশি আকর্ষণীয় কাপড়চোপড় ও ফ্যাশন আইটেম কেনাকাটা করতে পারবেন।'
};

const REF_BONUS = 10, DAILY = 2, CHECKIN = 4, MIN_WD = 300, MAX_WD = 5000, SLOTS = 50;
const PENDING_HOURS = 48;
const SPIN = [[1, 40], [2, 30], [3, 20], [5, 10]];
const MAX_USD = 5;
const COUNTRY_FILTER = true;
const TARGETS = ['BD', 'IN', 'PK', 'NP'];
const BLOCK_CATS = ['signup', 'signups', 'deposit', 'deposits', 'creditcard', 'creditcards', 'oneclick', 'multireward', 'freetrial', 'freetrials', 'shopping', 'extension', 'extensions'];
app.use(express.json({ limit: '10mb' }));

let NAMES = { boys: [], girls: [] };
try { NAMES = require('./names.js'); } catch (e) { console.error('names.js not found:', e.message); }

if (!process.env.MONGO_URI) console.error('MONGO_URI is not set: accounts cannot be saved.');
else mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected');
  try { await User.syncIndexes(); console.log('User indexes synced'); } catch (e) { console.error('Index sync error:', e.message); }
}).catch(e => console.error('MongoDB error:', e.message));

const User = mongoose.model('User', new mongoose.Schema({
  name: String, nameKey: { type: String, unique: true, sparse: true }, phone: String,
  email: { type: String, unique: true, sparse: true }, hash: String, salt: String,
  role: { type: String, default: 'worker' },
  balance: { type: Number, default: 0 }, earned: { type: Number, default: 0 },
  rsCoins: { type: Number, default: 0 },
  activePkg: { type: Object, default: null },
  refCode: { type: String, unique: true }, refBy: String,
  refEarn: { type: Number, default: 0 }, refCount: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  lastDaily: { type: Number, default: 0 }, lastCheckin: String, lastSpin: { type: Number, default: 0 }, lastAdWatch: { type: Number, default: 0 }, lastSeen: Number, created: { type: Date, default: Date.now }
}));
const Click = mongoose.model('Click', new mongoose.Schema({ uid: String, offerId: String, title: String, icon: String, bdt: Number, status: { type: String, default: 'pending' }, at: { type: Date, default: Date.now }, doneAt: Number }));
const Conv = mongoose.model('Conv', new mongoose.Schema({ key: { type: String, unique: true }, uid: String, tx: String, bdt: Number, status: String, at: { type: Date, default: Date.now } }));
const Wd = mongoose.model('Wd', new mongoose.Schema({ uid: String, name: String, amount: Number, method: String, phone: String, status: { type: String, default: 'pending' }, at: { type: Date, default: Date.now } }));
const Deposit = mongoose.model('Deposit', new mongoose.Schema({ uid: String, name: String, amount: Number, method: String, txid: String, lastDigits: String, pkgName: String, serialNo: String, status: { type: String, default: 'pending' }, at: { type: Date, default: Date.now } }));
const Msg = mongoose.model('Msg', new mongoose.Schema({ uid: String, name: String, from: String, text: String, at: { type: Date, default: Date.now } }));
const CustomTask = mongoose.model('CustomTask', new mongoose.Schema({ uid: String, platform: String, title: String, link: String, reward: Number, targetWorkers: Number, totalBudget: Number, status: { type: String, default: 'pending' }, at: { type: Date, default: Date.now } }));

const PromoPackage = mongoose.model('PromoPackage', new mongoose.Schema({
  title: String,
  category: String,
  followers: Number,
  price: Number,
  description: String,
  icon: String,
  active: { type: Boolean, default: true }
}));

const UserPackage = mongoose.model('UserPackage', new mongoose.Schema({
  title: String,
  price: Number,
  coinsPerMin: Number,
  description: String,
  pkgImage: { type: String, default: '' },
  hot: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}));

const SliderSetting = mongoose.model('SliderSetting', new mongoose.Schema({
  title: String,
  subtitle: String,
  description: String,
  link: String,
  bgImage: { type: String, default: '' },
  bgClass: { type: String, default: 's0' },
  emoji: { type: String, default: '🕌' },
  timerSeconds: { type: Number, default: 6 },
  active: { type: Boolean, default: true }
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
  'RS Gallery Shop (Official Collaboration)'
].filter(Boolean);

const me = u => ({ id: u._id, name: u.name, phone: u.phone || '', email: u.email || '', av: u.avatar || '', role: u.role || 'worker', balance: u.balance, earned: u.earned, rsCoins: u.rsCoins || 0, activePkg: u.activePkg || null, refCode: u.refCode, refEarn: u.refEarn, refCount: u.refCount, lastDaily: u.lastDaily, lastSpin: u.lastSpin || 0, lastAdWatch: u.lastAdWatch || 0, checkedIn: u.lastCheckin === today(), d: DAILY, c: CHECKIN, tc: TARGETS, ct: CO, pt: partners() });
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
    name: "RS Growth Matrix", short_name: "RS Matrix",
    description: "RS Growth Matrix - Complete tasks, earn rewards, and shop at RS Gallery.",
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

app.post('/api/register', h(async (q, s) => {
  const { name, phone, password, confirm, role, ref } = q.body || {};
  const n = String(name || '').trim();
  if (n.length < 3 || n.length > 30) return bad(s, 'Name must be 3 to 30 characters.');
  if (!/^01\d{9}$/.test(String(phone || ''))) return bad(s, 'Enter a valid 11-digit phone number.');
  if (String(password || '').length < 6) return bad(s, 'Password must be at least 6 characters.');
  if (password !== confirm) return bad(s, 'Passwords do not match.');
  if (await User.exists({ nameKey: n.toLowerCase() })) return bad(s, 'This name is already taken.');
  const userRole = role === 'employer' ? 'employer' : 'worker';
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

app.get('/api/sliders', auth, h(async (q, s) => {
  let sliders = await SliderSetting.find({ active: true });
  if (!sliders.length) {
    const defaultSliders = [
      { title: 'নামাজের স্মরণ', subtitle: 'নামাজ কি পড়েছেন?', description: 'নামাজ আমাদের জীবনের সবচেয়ে বড় আমানত। কাজের ফাঁকে ওয়াক্ত হলেই নামাজ আদায় করে নিন।', link: '#', bgClass: 's0', emoji: '🕌', timerSeconds: 6 },
      { title: 'আমাদের সাইট ও পার্টনার', subtitle: 'RS Growth Matrix & RS Gallery', description: 'টাস্ক সম্পন্ন করে ইনকাম করুন এবং আমাদের অফিশিয়াল পার্টনার আর এস গ্যালারি শপ থেকে পছন্দের পোশাক অর্ডার করুন।', link: 'https://www.facebook.com/share/1CAK8sYqDw/', bgClass: 's1', emoji: '🛍️', timerSeconds: 6 },
      { title: 'টাস্ক ও অ্যাড আয়', subtitle: 'ডেইলি ক্যাশ রিওয়ার্ড', description: 'Tasks ট্যাবে গিয়ে টাস্ক সম্পন্ন করুন অথবা Watch Ads অপশনে গিয়ে অ্যাড দেখে ইনস্ট্যান্ট ক্যাশ আয় করুন।', link: '#', bgClass: 's2', emoji: '📱', timerSeconds: 6 },
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
  if (q.user.lastAdWatch && now - q.user.lastAdWatch < 30000) return bad(s, 'Please wait 30 seconds.');
  const adReward = 0.50;
  const u = await User.findOneAndUpdate({ _id: q.user.id }, { $set: { lastAdWatch: now }, $inc: { balance: adReward, earned: adReward } }, { new: true });
  s.json({ reward: adReward, me: me(u) });
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
      balance: flucBal,
      earned: flucBal + 2000,
      rsCoins: flucCoins,
      avatar: demoAvatars[i % demoAvatars.length]
    });
  }
  let combined = realTop.map(u => ({ name: u.name, balance: u.balance || 0, earned: u.earned, rsCoins: u.rsCoins || 0, avatar: u.avatar || '' })).concat(demoTop);
  combined.sort((a, b) => b.rsCoins - a.rsCoins || b.earned - a.earned);
  s.json(combined.slice(0, 100));
}));

app.post('/api/withdraw', auth, h(async (q, s) => {
  if (q.user.role === 'employer') return bad(s, 'Employers cannot withdraw funds.');
  const { amount, method, phone } = q.body || {};
  const a = Math.floor(+amount);
  if (!(a >= MIN_WD && a <= MAX_WD)) return bad(s, 'Withdraw amount must be between ' + MIN_WD + ' and ' + MAX_WD + '.');
  if (!['bKash', 'Nagad'].includes(method)) return bad(s, 'Choose bKash or Nagad.');
  if (!/^01\d{9}$/.test(String(phone || ''))) return bad(s, 'Enter a valid 11-digit number.');
  const r = await User.findOneAndUpdate({ _id: q.user.id, balance: { $gte: a } }, { $inc: { balance: -a } }, { new: true });
  if (!r) return bad(s, 'Not enough balance.');
  await Wd.create({ uid: q.user.id, name: q.user.name, amount: a, method, phone });
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
  
  let pkgData = null;
  if (pkgName && pkgName !== 'Custom Deposit') {
    let coinsPerMin = 10;
    if (a >= 3000) coinsPerMin = 300;
    else if (a >= 2500) coinsPerMin = 220;
    else if (a >= 2000) coinsPerMin = 160;
    else if (a >= 1500) coinsPerMin = 110;
    else if (a >= 1200) coinsPerMin = 80;
    else if (a >= 800) coinsPerMin = 50;
    else if (a >= 500) coinsPerMin = 25;
    else if (a >= 200) coinsPerMin = 10;

    pkgData = { name: pkgName, amount: a, coinsPerMin, startedAt: Date.now(), lastClaim: Date.now(), expiresAt: Date.now() + (30 * 86400000) };
    await User.updateOne({ _id: q.user.id }, { $set: { activePkg: pkgData } });
  }

  const newDep = await Deposit.create({ uid: q.user.id, name: q.user.name, amount: a, method, txid: txid.trim(), lastDigits: lDigits, pkgName: pkgName || 'Custom Deposit', serialNo });
  s.json({ ok: true, serialNo, time: new Date().toLocaleString(), balance: q.user.balance, depositDetails: newDep, activePkg: pkgData });
}));

app.get('/api/deposits', auth, h(async (q, s) => s.json(await Deposit.find({ uid: q.user.id }).sort({ at: -1 }).limit(30))));

app.get('/api/global-feed', auth, h(async (q, s) => {
  const feedItems = [
    { name: 'Tanvir Ahmed', action: 'bKash-এ ৳500 ডিপোজিট সফল হয়েছে', type: 'dep', time: 'মাত্রই' },
    { name: 'Rakibul Islam', action: 'Nagad-এ ৳1,000 উত্তোলন করেছেন', type: 'wd', time: '১ মিনিট আগে' },
    { name: 'Sumaiya Akter', action: 'আর এস গ্যালারি শপ থেকে ৳850 দিয়ে শার্ট অর্ডার করেছেন', type: 'shop', time: '২ মিনিট আগে' },
    { name: 'Farhan Hossain', action: 'রেফারেল বোনাস হিসেবে ৳10 পেয়েছেন', type: 'bonus', time: '৩ মিনিট আগে' },
    { name: 'Nusrat Jahan', action: 'প্রিমিয়াম RS Coin Package (৳1,500) কিনেছেন', type: 'shop', time: '৪ মিনিট আগে' },
    { name: 'Mehedi Hasan', action: 'bKash-এ ৳1,200 ডিপোজিট সফল হয়েছে', type: 'dep', time: '৫ মিনিট আগে' }
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
  if(lower.includes('ডিপোজিট') || lower.includes('deposit')) {
    botReply = 'ডিপোজিট সমস্যার জন্য অনুগ্রহ করে সঠিক TrxID ও সঠিক লাস্ট ডিজিট প্রদান করুন। সাধারণত ১০-১৫ মিনিটের মধ্যে ডিপোজিট ব্যালেন্সে যুক্ত হয়।';
  } else if(lower.includes('উইথড্র') || lower.includes('withdrawal') || lower.includes('টাকা পাব')) {
    botReply = 'উইথড্র রিকোয়েস্ট করার পর ২৪ থেকে ৪৮ ঘণ্টার মধ্যে পেমেন্ট সফলভাবে সম্পন্ন করা হয়। অনুগ্রহ করে অপেক্ষা করুন।';
  } else if(lower.includes('টাস্ক') || lower.includes('task')) {
    botReply = 'টাস্ক সেকশন থেকে যেকোনো অফার বা টাস্ক সঠিকভাবে নিয়ম মেনে সম্পন্ন করলে ব্যালেন্সে রিওয়ার্ড যোগ হয়ে যাবে।';
  } else if(lower.includes('গ্যালারি') || lower.includes('gallery')) {
    botReply = 'আর এস গ্যালারি শপ (RS Gallery Shop) আমাদের অফিশিয়াল পার্টনার। এখানে আপনি ইনকামের টাকা দিয়ে খুব সহজেই সাশ্রয়ী মূল্যে সেরা পোশাক ও ফ্যাশন আইটেম অর্ডার করতে পারবেন!';
  }
  
  await Msg.create({ uid: q.user.id, name: 'Support Bot', from: 'support', text: botReply });
  s.json({ ok: true });
}));

app.get('/api/admin/user-packages', admin, h(async (q, s) => {
  s.json(await UserPackage.find({}));
}));
app.post('/api/admin/user-packages', admin, h(async (q, s) => {
  const { title, price, coinsPerMin, description, pkgImage, hot } = q.body || {};
  if (!price || !coinsPerMin) return bad(s, 'Price and coins per min are required.');
  await UserPackage.create({ title: title || 'RS Coin Package', price: Number(price), coinsPerMin: Number(coinsPerMin), description: description || '', pkgImage: pkgImage || '', hot: !!hot });
  s.json({ ok: true });
}));
app.post('/api/admin/user-packages/delete/:id', admin, h(async (q, s) => {
  await UserPackage.findByIdAndDelete(q.params.id);
  s.json({ ok: true });
}));

app.get('/api/admin/promo-packages', admin, h(async (q, s) => {
  s.json(await PromoPackage.find({}));
}));
app.post('/api/admin/promo-packages', admin, h(async (q, s) => {
  const { title, category, followers, price, description, icon } = q.body || {};
  if (!title || !price) return bad(s, 'Title and price are required.');
  await PromoPackage.create({ title, category: category || 'Social Media', followers: Number(followers) || 100, price: Number(price) || 100, description: description || '', icon: icon || 'https://cdn-icons-png.flaticon.com/512/1041/1041888.png' });
  s.json({ ok: true });
}));
app.post('/api/admin/promo-packages/delete/:id', admin, h(async (q, s) => {
  await PromoPackage.findByIdAndDelete(q.params.id);
  s.json({ ok: true });
}));

app.get('/api/admin/sliders', admin, h(async (q, s) => {
  s.json(await SliderSetting.find({}));
}));
app.post('/api/admin/sliders', admin, h(async (q, s) => {
  const { title, subtitle, description, link, bgImage, bgClass, emoji, timerSeconds } = q.body || {};
  await SliderSetting.create({ title, subtitle, description, link, bgImage: bgImage || '', bgClass: bgClass || 's0', emoji: emoji || '🌟', timerSeconds: Number(timerSeconds) || 6 });
  s.json({ ok: true });
}));
app.post('/api/admin/sliders/delete/:id', admin, h(async (q, s) => {
  await SliderSetting.findByIdAndDelete(q.params.id);
  s.json({ ok: true });
}));

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
      pendingTasks: await CustomTask.countDocuments({ status: 'pending' })
    }
  });
}));

app.get('/api/admin/wd-list', admin, h(async (q, s) => {
  s.json({ pending: await Wd.find({ status: 'pending' }).sort({ at: 1 }).limit(100), done: await Wd.find({ status: { $ne: 'pending' } }).sort({ at: -1 }).limit(20) });
}));

app.get('/api/admin/dep-list', admin, h(async (q, s) => {
  s.json({ pending: await Deposit.find({ status: 'pending' }).sort({ at: 1 }).limit(100), done: await Deposit.find({ status: { $ne: 'pending' } }).sort({ at: -1 }).limit(20) });
}));

app.get('/api/admin/custom-tasks', admin, h(async (q, s) => {
  s.json(await CustomTask.find({ status: 'pending' }).sort({ at: 1 }));
}));
app.post('/api/admin/custom-tasks/:id', admin, h(async (q, s) => {
  const t = await CustomTask.findById(q.params.id);
  if (!t) return bad(s, 'Task not found.');
  if (q.body.ok) {
    t.status = 'approved';
    await t.save();
  } else {
    t.status = 'rejected';
    await t.save();
    await User.updateOne({ _id: t.uid }, { $inc: { balance: t.totalBudget } });
  }
  s.json({ ok: true });
}));

app.get('/api/admin/support', admin, h(async (q, s) => {
  const all = await Msg.find().sort({ at: -1 }).limit(400);
  const map = {};
  all.reverse().forEach(m => { (map[m.uid] = map[m.uid] || { uid: m.uid, name: m.name, msgs: [] }).msgs.push({ from: m.from, text: m.text, at: m.at }); });
  const th = Object.values(map).map(t => { const l = t.msgs[t.msgs.length - 1]; return { uid: t.uid, name: t.name, msgs: t.msgs.slice(-30), needs: l.from === 'user', last: +new Date(l.at) }; });
  th.sort((a, b) => (b.needs - a.needs) || (b.last - a.last));
  s.json(th);
}));

app.get('/api/admin/users', admin, h(async (q, s) => {
  const st = dayStart();
  const act = await User.find({ lastSeen: { $gte: st.getTime() } }).sort({ lastSeen: -1 }).limit(200).select('name phone email lastSeen balance earned role');
  const ag = await Conv.aggregate([{ $match: { at: {$gte: st } } }, { $group: { _id: '$uid', t: { $sum: '$bdt' } } }]);
  const em = {}; ag.forEach(x => { em[x._id] = x.t; });
  const ids = ag.map(x => x._id).filter(x => mongoose.isValidObjectId(x));
  const eu = ids.length ? await User.find({ _id: { $in: ids } }).select('name phone email') : [];
  const earners = eu.map(u => ({ name: u.name, phone: u.phone || u.email || '', t: em[String(u._id)] || 0 })).sort((a, b) => b.t - a.t);
  const top = await User.find({ earned: { $gt: 0 } }).sort({ earned: -1 }).limit(30).select('name phone email earned balance');
  s.json({
    newToday: await User.countDocuments({ created: { $gte: st } }),
    active: act.map(u => ({ name: u.name, phone: u.phone || u.email || '', role: u.role || 'worker', seen: u.lastSeen, balance: u.balance, today: em[String(u._id)] || 0 })),
    earners,
    top: top.map(u => ({ name: u.name, phone: u.phone || u.email || '', earned: u.earned, balance: u.balance }))
  });
}));

app.post('/api/admin/wd/:id', admin, h(async (q, s) => {
  const statusVal = q.body.ok ? 'Success' : 'Rejected';
  const x = await Wd.findOneAndUpdate({ _id: q.params.id, status: 'pending' }, { status: statusVal });
  if (x && !q.body.ok) await User.updateOne({ _id: x.uid }, { $inc: { balance: x.amount } });
  s.json({ ok: true });
}));

app.post('/api/admin/dep/:id', admin, h(async (q, s) => {
  const x = await Deposit.findOneAndUpdate({ _id: q.params.id, status: 'pending' }, { status: q.body.ok ? 'approved' : 'rejected' });
  if (x && q.body.ok) await User.updateOne({ _id: x.uid }, { $inc: { balance: x.amount, earned: x.amount } });
  s.json({ ok: true });
}));

app.post('/api/admin/bonus', admin, h(async (q, s) => {
  const { phone, amount } = q.body || {};
  const a = Number(amount);
  if (!phone || isNaN(a) || a <= 0) return bad(s, 'Invalid phone or amount.');
  const u = await User.findOneAndUpdate({ phone: String(phone).trim() }, { $inc: { balance: a, earned: a } });
  if (!u) return bad(s, 'User not found.');
  s.json({ ok: true });
}));

app.post('/api/admin/reply', admin, h(async (q, s) => {
  const u = await User.findById(q.body.uid);
  if (u && q.body.text) await Msg.create({ uid: u.id, name: u.name, from: 'support', text: String(q.body.text).slice(0, 500) });
  s.json({ ok: true });
}));

app.get('/api/admin/offers-raw', admin, h(async (q, s) => {
  const dbg = {};
  await fetchOffers('admin-test', ctxOf(q), dbg);
  s.json({ text: 'Offers fetched successfully.' });
}));

const PAGE = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="google-site-verification" content="LFCR_Ofi-3uqR900pf2ntTa2io3ymE1PRv4jlyWoX28" />
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#fbbf24">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="RS Matrix">
<link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/1041/1041888.png">

<title>RS Growth Matrix & RS Gallery Shop</title>
<script src="https://accounts.google.com/gsi/client" async defer></script>
<style>
:root{--bg:#060913;--card:#0f172a;--line:#1e293b;--tx:#f8fafc;--mu:#94a3b8;--gold:#fbbf24;--grn:#22c55e;--blu:#38bdf8;--red:#ef4444}
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif}
body{background:var(--bg);color:var(--tx);display:flex;justify-content:center;min-height:100vh;padding:8px}
.app{width:100%;max-width:440px;background:var(--card);border:1px solid var(--line);border-radius:26px;height:96vh;display:flex;flex-direction:column;overflow:hidden;position:relative}
.pwa-banner{display:flex;background:linear-gradient(90deg,#fbbf24,#f59e0b);color:#000;padding:12px 16px;border-radius:14px;align-items:center;justify-content:space-between;margin:10px 14px 0 14px;font-weight:700;font-size:13.5px;box-shadow:0 4px 12px rgba(251,191,36,0.3);position:relative;z-index:10}
.pwa-banner button{background:#000;color:#fff;border:0;padding:7px 14px;border-radius:10px;font-size:12px;cursor:pointer;font-weight:bold}
#landing{position:absolute;inset:0;z-index:60;background:#060913;overflow-y:auto;padding:16px;text-align:left}
#auth{position:absolute;inset:0;z-index:50;background:radial-gradient(circle at top,#1e1b4b,#060913 70%);padding:22px;overflow-y:auto;text-align:center;display:none}
.card{background:rgba(15,23,42,.92);border:1px solid rgba(251,191,36,.3);border-radius:18px;padding:16px;text-align:left}
.brand{font-family:Georgia,serif;font-size:24px;font-weight:700;color:var(--gold);margin:6px 0 2px;letter-spacing:.5px}
.sub{font-size:12px;color:var(--mu);margin-bottom:14px}
.seg{display:flex;background:var(--bg);border-radius:10px;padding:3px;margin-bottom:12px}
.seg div{flex:1;text-align:center;padding:8px;font-size:12px;font-weight:700;border-radius:8px;color:var(--mu);cursor:pointer}
.seg .on{background:linear-gradient(90deg,var(--gold),#f59e0b);color:#000}
label{font-size:11px;color:var(--mu);display:block;margin-top:9px}
input,select,textarea{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:11px;color:#fff;font-size:14px;margin-top:4px}
input:focus,select:focus,textarea:focus{outline:2px solid var(--gold)}
.btn{width:100%;border:0;border-radius:12px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;margin-top:12px;background:linear-gradient(90deg,var(--gold),#f59e0b);color:#000}
.btn.g{background:var(--grn);color:#fff}.btn.r{background:var(--red);color:#fff}.btn.s{width:auto;padding:6px 12px;font-size:12px;margin:0;border-radius:14px}
.or{font-size:11px;color:var(--mu);margin:14px 0 8px;text-align:center}
.agn{font-size:10.5px;color:var(--mu);margin-top:8px;text-align:center;line-height:1.5}
.top{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#131d38,#0f172a)}
.top .l{display:flex;align-items:center;gap:9px;min-width:0}.top b{font-size:14px}.bal{text-align:right;font-size:17px;font-weight:800;color:var(--grn)}.bal small{display:block;font-size:10px;color:var(--mu);font-weight:400}
.av{width:40px;height:40px;border-radius:50%;border:2px solid var(--gold);background:#16213f;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;overflow:hidden;flex-shrink:0;box-shadow:0 0 10px rgba(251,191,36,.3)}
.av img{width:100%;height:100%;object-fit:contain;display:block}
nav{display:flex;gap:2px;padding:7px 3px 9px;background:#0b1224;box-shadow:0 10px 20px rgba(0,0,0,.6);position:relative;z-index:5}
nav div{flex:1;text-align:center;font-size:9px;color:var(--mu);padding:6px 0;cursor:pointer;border-radius:11px;background:linear-gradient(180deg,#18244a,#0e1730)}
nav div i{display:block;font-style:normal;font-size:14px;position:relative;width:22px;height:22px;line-height:22px;margin:0 auto}
nav .on{color:var(--gold);transform:translateY(-1px);background:linear-gradient(180deg,#2a2208,#13100a);box-shadow:0 0 0 1px var(--gold)}
main{flex:1;overflow-y:auto;padding:14px}
.row{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px;box-shadow:0 4px 10px rgba(0,0,0,.35)}
.row small{display:block;color:var(--mu);font-size:11px;margin-top:2px}
h3{font-size:13px;color:var(--mu);margin:4px 0 10px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}
.stat{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px 6px;text-align:center}.stat b{display:block;font-size:16px;color:var(--gold)}.stat small{font-size:11px;color:var(--mu)}
.pod{display:flex;gap:8px;align-items:flex-end;margin-bottom:14px}
.pod div{flex:1;text-align:center;border-radius:16px;padding:14px 6px;background:#131d38;border:1px solid var(--line);font-size:12px}
.pod .p1{border-color:var(--gold);padding-bottom:26px;background:linear-gradient(180deg,rgba(251,191,36,.18),#131d38)}
.pod b{display:block;color:var(--gold);font-size:14px;margin-top:4px}
.chip{font-size:10px;padding:3px 8px;border-radius:10px;background:#1e293b;color:var(--gold)}
.chip.approved,.chip.paid,.chip.Success{color:var(--grn)}.chip.rejected,.chip.cancelled{color:var(--red)}.chip.pending{color:var(--gold)}
.chat{max-height:40vh;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin-bottom:10px}
.m{padding:8px 12px;border-radius:12px;font-size:13px;max-width:85%}.m.user{background:#1e293b;align-self:flex-end}.m.support{background:#172554;color:var(--blu);align-self:flex-start}
.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:130;align-items:center;justify-content:center;padding:14px}
.modal>div{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;width:100%;max-width:410px;max-height:90vh;overflow-y:auto}
pre{white-space:pre-wrap;word-break:break-all;font-size:11px;color:#e2e8f0;line-height:1.5;margin:8px 0}
.err{color:var(--red);font-size:12px;margin-top:8px;min-height:14px}
.mq{overflow:hidden;white-space:nowrap;border-radius:14px;background:linear-gradient(90deg,#2b1f04,#4a3508,#2b1f04);border:1px solid rgba(251,191,36,.55);padding:10px 0;margin-bottom:12px}
.mq span{display:inline-block;padding-left:100%;animation:mq 26s linear infinite;color:var(--gold);font-size:12.5px;font-weight:700}
@keyframes mq{to{transform:translateX(-100%)}}
.ar{font-size:20px;line-height:2.1;direction:rtl;text-align:right;color:var(--gold);font-family:'Amiri',serif;margin:6px 0}
.bkc{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px;font-size:13px;line-height:1.7}
.bkc b{color:var(--gold)}.bkc small{display:block;color:var(--mu);font-size:11px;margin-top:4px}
.nm{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 12px;margin-bottom:8px}
.nm .ar2{font-size:26px;color:var(--gold);font-family:'Amiri',serif;direction:rtl;text-align:right;white-space:nowrap}
.bkh{text-align:center;margin-bottom:14px;border-radius:20px;padding:10px;border:1px solid rgba(251,191,36,.45);background:linear-gradient(180deg,#14263f,#0b1224)}
.bkh .t{font-size:20px;font-weight:700;color:var(--gold);margin-top:6px}
.bkh .u{font-size:12px;color:var(--mu)}
.adm{display:none;position:fixed;inset:0;z-index:120;background:var(--bg);flex-direction:column;max-width:440px;margin:0 auto}
.adm.on{display:flex}
.ah{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#131d38,#0f172a)}
.ah b{color:var(--gold);font-size:15px}
#abody{flex:1;overflow-y:auto;padding:14px}
#anav{display:flex;gap:4px;padding:8px 5px 10px;background:#0b1224}
#anav div{flex:1;text-align:center;font-size:9.5px;color:var(--mu);padding:7px 0;cursor:pointer;border-radius:13px;background:linear-gradient(180deg,#18244a,#0e1730)}
#anav div i{display:block;font-style:normal;font-size:16px}
#anav .on{color:var(--gold);background:linear-gradient(180deg,#2a2208,#13100a);box-shadow:0 0 0 1px var(--gold)}
.th{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:12px}
.th .hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:13px;font-weight:700}
.gap{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.hs{position:relative;height:200px;border-radius:24px;overflow:hidden;margin-bottom:10px;border:1px solid rgba(251,191,36,.45);cursor:pointer;background-size:contain;background-repeat:no-repeat;background-position:center}
.sl{position:absolute;inset:0;padding:18px 16px;opacity:0;transform:scale(.96);transition:opacity .7s,transform .7s;display:flex;flex-direction:column;justify-content:center;pointer-events:none;background-size:contain;background-repeat:no-repeat;background-position:center}
.sl.on{opacity:1;transform:none;pointer-events:auto}
.sl .tag{display:inline-block;align-self:flex-start;font-size:10px;font-weight:700;padding:3px 10px;border-radius:12px;background:rgba(0,0,0,.5);color:#fde68a;margin-bottom:8px}
.sl h4{font-size:18px;color:#fff;margin-bottom:6px;max-width:72%;text-shadow:0 2px 4px rgba(0,0,0,.8)}
.sl p{font-size:12.5px;line-height:1.65;color:#f1f5f9;max-width:74%;text-shadow:0 2px 4px rgba(0,0,0,.8)}
.sl .em{position:absolute;right:8px;bottom:6px;font-size:76px}
.s0{background:linear-gradient(135deg,#0f3d2e,#14532d 55%,#052e1a)}
.s1{background:linear-gradient(135deg,#1e1b4b,#312e81 55%,#0f172a)}
.s2{background:linear-gradient(135deg,#0c4a6e,#075985 55%,#082f49)}
.s3{background:linear-gradient(135deg,#78350f,#92400e 55%,#451a03)}
.dots{display:flex;justify-content:center;gap:6px;margin-bottom:14px}
.dots i{width:7px;height:7px;border-radius:50%;background:#334155;cursor:pointer;transition:all .3s}
.dots i.on{background:var(--gold);width:22px;border-radius:6px}
.bn{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.bo{border-radius:22px;padding:3px;background:linear-gradient(135deg,#fde68a,#b45309 50%,#fbbf24)}
.bi{border-radius:19px;background:linear-gradient(180deg,#16213f,#0b1224);padding:14px 10px;text-align:center;border:1px solid rgba(251,191,36,.25)}
.bi .ic{font-size:34px;display:block}
.bi b{display:block;font-size:13px;margin:6px 0 2px;color:#fff}
.bi small{display:block;font-size:10.5px;color:var(--mu);margin-bottom:10px}
.bi .btn{margin-top:0;padding:9px;font-size:12px}
.bi .btn.dn{background:#1e293b;color:var(--mu)}
.lk{display:flex;align-items:center;gap:12px;text-align:left}
.wheel{position:relative;width:320px;margin:14px auto 6px}
.wheel .pt{position:absolute;top:-12px;left:50%;transform:translateX(-50%);font-size:28px;color:#fbbf24;z-index:3}
.tdw{font-size:12.5px;line-height:1.7;color:#e2e8f0;background:#131d38;border:1px solid var(--line);border-radius:12px;padding:10px;margin:8px 0}
.tdw b{color:var(--gold)}
.stp{font-size:12.5px;line-height:1.9;color:#cbd5e1;margin:8px 0 4px;padding-left:4px}
.thero{display:flex;align-items:center;gap:16px;background:linear-gradient(135deg,#0c2a4a,#0b1224);border:1px solid rgba(56,189,248,.35);border-radius:20px;padding:14px;margin-bottom:12px}
.thero b{font-size:16px;color:#fff}.thero small{display:block;color:var(--mu);font-size:11.5px;margin-top:4px}
.rg{position:relative;width:78px;height:78px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:30px}
.rg .r{position:absolute;border-radius:50%;border:2px solid transparent}
.rg .r1{inset:0;border-top-color:#fbbf24;border-bottom-color:#fbbf24;animation:rot 3.2s linear infinite}
.rg .r2{inset:9px;border-left-color:#38bdf8;border-right-color:#38bdf8;animation:rot 2.2s linear infinite reverse}
.rg .r3{inset:18px;border-top-color:#22c55e;border-right-color:#22c55e;animation:rot 1.4s linear infinite}
.hbn{display:flex;align-items:center;gap:14px;border-radius:20px;padding:14px;margin-bottom:12px;border:1px solid}
.hbn .e{font-size:38px;flex-shrink:0;display:block}
.hbn b{font-size:16px;color:#fff}.hbn small{display:block;color:#cbd5e1;font-size:11.5px;margin-top:3px}
.hb-rank{background:linear-gradient(135deg,#3b0a4a,#0b1224);border-color:rgba(217,70,239,.45)}
.hb-ref{background:linear-gradient(135deg,#0b3a1e,#0b1224);border-color:rgba(34,197,94,.45)}
.hb-help{background:linear-gradient(135deg,#0c2350,#0b1224);border-color:rgba(59,130,246,.45)}
.hb-acc{background:linear-gradient(135deg,#4a1d08,#0b1224);border-color:rgba(249,115,22,.45)}
@keyframes rot{to{transform:rotate(360deg)}}
.ft{margin-top:6px;border-radius:22px;padding:18px 16px;background:linear-gradient(180deg,#0d1a2e,#070d1a);border:1px solid rgba(251,191,36,.35)}
.ftl{display:flex;align-items:center;gap:12px;margin-bottom:10px}.ftl b{font-size:16px;color:var(--gold)}.ftl small{display:block;font-size:11px;color:var(--mu)}
.fd{font-size:12px;line-height:1.75;color:#94a3b8;margin-bottom:14px}
.fcols{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.fcols h5{font-size:12px;color:var(--gold);margin-bottom:6px}
.fcols a{display:block;font-size:12.5px;color:#94a3b8;padding:5px 0;cursor:pointer;text-decoration:none}
.fsoc{display:flex;align-items:center;justify-content:center;gap:14px;padding:14px 0;border-top:1px solid #1e293b;border-bottom:1px solid #1e293b;margin-bottom:12px}
.fsoc a{display:block;width:46px;height:46px;border-radius:50%}
.fage{display:flex;align-items:center;gap:12px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.4);border-radius:14px;padding:10px;margin-bottom:12px}
.fage .bd{width:46px;height:46px;border-radius:50%;border:3px solid var(--red);color:var(--red);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;flex-shrink:0}
.fage div{font-size:11.5px;line-height:1.6;color:#fecaca}
.fchips{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.fchip{font-size:11px;padding:5px 10px;border-radius:12px;background:#16213f;border:1px solid #243352;color:#e2e8f0}
.fh{font-size:11px;color:var(--mu);margin:10px 0 2px}
.fr{display:flex;align-items:center;gap:10px;font-size:12.5px;color:#cbd5e1;padding:7px 0;border-top:1px solid #1e293b}
.fr a{color:#7dd3fc;text-decoration:none}
.fc{font-size:10.5px;color:#64748b;text-align:center;margin-top:12px;border-top:1px solid #1e293b;padding-top:10px}
.img-upload-btn{display:flex;align-items:center;justify-content:center;gap:6px;background:#1e293b;border:1px dashed var(--gold);color:var(--gold);padding:10px;border-radius:10px;cursor:pointer;font-size:13px;margin-top:6px;font-weight:bold}

/* Enhanced bKash/Nagad Style Circular Hold Button with Glow Animation */
.hold-circle-container{position:relative;width:120px;height:120px;margin:18px auto 8px;display:flex;align-items:center;justify-content:center}
.hold-circle-svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.hold-bg-circle{fill:none;stroke:#1e293b;stroke-width:8}
.hold-progress-circle{fill:none;stroke:url(#circleGrad);stroke-width:9;stroke-dasharray:301.59;stroke-dashoffset:301.59;transition:stroke-dashoffset 0.04s linear;stroke-linecap:round}
.hold-btn-inner{position:relative;width:96px;height:96px;border-radius:50%;background:radial-gradient(circle,#0284c7,#0369a1);border:2px solid rgba(251,191,36,0.5);color:#fff;font-size:11.5px;font-weight:800;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;user-select:none;-webkit-user-select:none;box-shadow:0 0 25px rgba(56,189,248,0.6);text-align:center;padding:4px;touch-action:none;animation:pulseGlow 2s infinite}
.hold-btn-inner:active{transform:scale(0.94)}
@keyframes pulseGlow{0%{box-shadow:0 0 15px rgba(56,189,248,0.4)}50%{box-shadow:0 0 30px rgba(34,197,94,0.8)}100%{box-shadow:0 0 15px rgba(56,189,248,0.4)}}
.copy-btn-inline{background:var(--gold);color:#000;border:0;padding:4px 12px;border-radius:8px;font-weight:bold;font-size:11px;cursor:pointer;margin-left:6px;display:inline-block}
.admin-copy-btn{background:#1e293b;color:var(--gold);border:1px solid var(--gold);padding:3px 8px;border-radius:6px;font-size:10px;cursor:pointer;margin-left:6px}
</style></head><body>
<div class="app">
<div id="landing">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
    <div style="display:flex;align-items:center;gap:10px"><div id="logoL"></div><b style="color:var(--gold);font-size:16px">RS Growth Matrix & RS Gallery</b></div>
    <span style="font-size:12px;background:rgba(251,191,36,.15);color:var(--gold);padding:4px 10px;border-radius:20px;border:1px solid rgba(251,191,36,.3)">EN ▾</span>
  </div>
  <div style="background:linear-gradient(135deg,#1e1b4b,#0f172a);border:1px solid rgba(251,191,36,.3);border-radius:20px;padding:16px;margin-bottom:14px;position:relative;overflow:hidden">
    <div style="font-size:11px;color:var(--gold);font-weight:700;margin-bottom:6px">⚡ Work Smart • Earn & Shop at RS Gallery</div>
    <h1 style="font-size:22px;color:#fff;margin-bottom:8px;line-height:1.3">Small Tasks Big Opportunities</h1>
    <p style="font-size:12px;color:var(--mu);line-height:1.6;margin-bottom:14px">RS Growth Matrix একটি বিশ্বস্ত মাইক্রোজব প্ল্যাটফর্ম। এখানে টাস্ক করে ইনকাম করুন এবং আমাদের কোলাবোরেশন পার্টনার **আর এস গ্যালারি শপ** থেকে আপনার পছন্দের পোশাক অর্ডার করুন।</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center">
      <div style="background:#0b1224;padding:8px 4px;border-radius:12px;border:1px solid var(--line)"><span style="font-size:18px">📋</span><small style="display:block;font-size:9px;color:var(--mu);margin-top:2px">Tasks</small></div>
      <div style="background:#0b1224;padding:8px 4px;border-radius:12px;border:1px solid var(--line)"><span style="font-size:18px">🛍️</span><small style="display:block;font-size:9px;color:var(--mu);margin-top:2px">RS Gallery</small></div>
      <div style="background:#0b1224;padding:8px 4px;border-radius:12px;border:1px solid var(--line)"><span style="font-size:18px">🛡️</span><small style="display:block;font-size:9px;color:var(--mu);margin-top:2px">Secure</small></div>
      <div style="background:#0b1224;padding:8px 4px;border-radius:12px;border:1px solid var(--line)"><span style="font-size:18px">👥</span><small style="display:block;font-size:9px;color:var(--mu);margin-top:2px">Community</small></div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:14px;text-align:center">
    <div class="stat"><b style="font-size:13px" id="stUsers">52K+</b><small style="font-size:9.5px">Active Users</small></div>
    <div class="stat"><b style="font-size:13px" id="stTasks">1.2M+</b><small style="font-size:9.5px">Tasks Done</small></div>
    <div class="stat"><b style="font-size:13px" id="stEarn">৳8.5M+</b><small style="font-size:9.5px">Earnings</small></div>
    <div class="stat"><b style="font-size:13px">4.8/5</b><small style="font-size:9.5px">Rating</small></div>
  </div>
  <button class="btn" style="padding:14px;font-size:15px;margin-bottom:10px;box-shadow:0 4px 15px rgba(251,191,36,.3)" onclick="openAuth()">🚀 Get Started</button>
  <div style="text-align:center;font-size:11px;color:var(--mu);margin-bottom:14px">Join now and start earning today!</div>
  <div style="background:linear-gradient(135deg,#2b1f04,#141c2e);border:1px solid rgba(251,191,36,.4);border-radius:16px;padding:12px;display:flex;align-items:center;gap:12px;margin-bottom:14px">
    <span style="font-size:28px">🎁</span>
    <div><b style="color:var(--gold);font-size:13px;display:block">RS Gallery Shop Collaboration!</b><small style="color:var(--mu);font-size:11px">টাস্ক করে ইনকাম করা টাকা দিয়ে আর এস গ্যালারি থেকে শপিং করুন...</small></div>
  </div>
  <div style="display:flex;justify-content:space-around;padding:10px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);font-size:11px;color:var(--mu);text-align:center">
    <div>🛡️ 100% Safe & Secure</div>
    <div>🎧 Fast Support</div>
    <div>⚡ Instant Withdrawals</div>
  </div>
  <div style="text-align:center;font-size:10px;color:var(--mu);margin-top:14px">YOUR GROWTH • OUR MISSION</div>
</div>
<div id="auth">
  <div id="logoA"></div><div class="brand">RS Growth Matrix</div><div class="sub">Complete tasks, watch ads & earn rewards.</div>
  <div class="card">
    <div class="seg"><div id="tReg" class="on" onclick="mode('reg')">Register</div><div id="tLog" onclick="mode('log')">Login</div></div>
    <div id="fReg">
      <label>Account Type</label>
      <select id="rRole">
        <option value="worker">Worker (কাজ করতে চাই)</option>
        <option value="employer">Employer (প্রোমোশন ও প্যাকেজ কিনতে চাই)</option>
      </select>
      <label>Name</label><input id="rN" autocomplete="username" placeholder="Your name">
      <label>Phone number</label><input id="rP" inputmode="numeric" maxlength="11" placeholder="01XXXXXXXXX">
      <label>Password</label><input id="rW" type="password" autocomplete="new-password">
      <label>Confirm password</label><input id="rC" type="password" autocomplete="new-password">
      <button class="btn g" onclick="reg()">Confirm</button>
      <div class="agn">রেজিস্ট্রেশন করলে আপনি নিশ্চিত করছেন আপনার বয়স __AGE__ বছর বা তার বেশি।</div>
    </div>
    <div id="fLog" style="display:none">
      <label>Name</label><input id="lN" autocomplete="username">
      <label>Password</label><input id="lW" type="password" autocomplete="current-password">
      <button class="btn" onclick="login()">Login</button>
    </div>
    <div class="err" id="aErr"></div>
    <div id="gWrap"><div class="or">or continue with</div><div id="gBtn" style="display:flex;justify-content:center"></div></div>
  </div>
</div>
<div class="top"><div class="l"><div id="logoT"></div><div class="av" id="avT" onclick="$('avf').click()">📷</div><div><b id="hName"></b><small id="hRsCoins" style="display:block;color:var(--gold);font-size:11px">RS Coins: 0</small></div></div><div class="bal"><span id="hBal">0.00</span><small>Balance (BDT)</small></div></div>
<input type="file" id="avf" accept="image/*" style="display:none" onchange="avUp(this)">
<nav id="nav"></nav>

<div id="pwaBanner" class="pwa-banner">
  <span>📱 আপনার ফোনে অ্যাপটি ইনস্টল করুন</span>
  <button onclick="installPWA()">Install</button>
</div>

<main id="main"></main>
</div>
<div class="adm" id="adm"><div class="ah"><b>Admin Panel</b><button class="btn s" onclick="admClose()">Close</button></div><div id="abody"></div><div id="anav"></div></div>
<div class="modal" id="modal"><div id="mBody"></div></div>
<script>
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function(){});
var deferredPrompt = null;
window.addEventListener('beforeinstallprompt', function(e) { e.preventDefault(); deferredPrompt = e; var b = $('pwaBanner'); if (b) b.style.display = 'flex'; });
function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(choice) { if (choice.outcome === 'accepted') { var b = $('pwaBanner'); if (b) b.style.display = 'none'; } deferredPrompt = null; });
  } else {
    modal('<h3 style="color:var(--gold)">📱 অ্যাপ ইনস্টল করার নিয়ম</h3><div class="tdw">আপনার ব্রাউজারের ডানপাশের <b>৩-ডট (⋮) মেনুতে</b> ক্লিক করে <b>Add to Home screen</b> বা <b>Install app</b> অপশনটিতে চাপ দিন।</div><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">বুঝেছি</button>');
  }
}

setInterval(function() {
  fetch('/ping').catch(function() {});
}, 300000);

setInterval(function() {
  var u = document.getElementById('stUsers');
  var t = document.getElementById('stTasks');
  var e = document.getElementById('stEarn');
  if(u) u.textContent = (52 + Math.floor(Math.random()*3)) + 'K+';
  if(t) t.textContent = (1.2 + Math.random()*0.1).toFixed(1) + 'M+';
  if(e) e.textContent = '৳' + (8.5 + Math.random()*0.2).toFixed(1) + 'M+';
}, 4000);

var GID='__GID__',T=localStorage.getItem('t'),ME=null,ADM='',TAB='home',TIMER=null,AD={},HSI=0,LC=0,ROT=0,SPUN=false,NML=[],TWU='';
var SEG=[[1, 40], [2, 30], [3, 20], [5, 10]];
var REF=new URLSearchParams(location.search).get('ref')||localStorage.getItem('ref')||'';
if(REF)localStorage.setItem('ref',REF);
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function money(n){return Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function formatCompact(n){n=Number(n)||0;if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'k';return n.toString()}
function tm(t){return new Date(t).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
function logo(s){var g='lg'+(LC++);return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 100 100"><defs><linearGradient id="'+g+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#b45309"/></linearGradient></defs><path d="M50 4 90 20v30c0 25-17 42-40 48C27 92 10 75 10 50V20z" fill="#0b1020" stroke="url(#'+g+')" stroke-width="4"/><text x="50" y="60" text-anchor="middle" font-size="34" font-weight="800" fill="url(#'+g+')" font-family="Georgia,serif">RS</text><path d="M30 71h40M38 77h24" stroke="url(#'+g+')" stroke-width="2.5" stroke-linecap="round"/></svg>'}
function mosque(w){var g='mg'+(LC++);return '<svg width="'+w+'" viewBox="0 0 200 120" style="max-width:100%"><defs><linearGradient id="'+g+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#b45309"/></linearGradient><linearGradient id="'+g+'s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#0f3d2e"/></linearGradient><clipPath id="'+g+'c"><rect width="200" height="120" rx="16"/></clipPath></defs><g clip-path="url(#'+g+'c)"><rect width="200" height="120" fill="url(#'+g+'s)"/><rect x="26" y="52" width="14" height="56" fill="#0b1020" stroke="url(#'+g+')" stroke-width="1.5"/><path d="M26 52l7-18 7 18z" fill="url(#'+g+')"/><rect x="160" y="52" width="14" height="56" fill="#0b1020" stroke="url(#'+g+')" stroke-width="1.5"/><path d="M160 52l7-18 7 18z" fill="url(#'+g+')"/><rect x="58" y="80" width="84" height="28" fill="#0b1020" stroke="url(#'+g+')" stroke-width="1.5"/><path d="M68 80a32 32 0 0 1 64 0z" fill="url(#'+g+')"/><rect y="108" width="200" height="12" fill="#052e1a"/></g></svg>'}
function hb(c,e,t,s){return '<div class="hbn hb-'+c+'"><span class="e">'+e+'</span><div><b>'+t+'</b><small>'+s+'</small></div></div>'}
function api(p,m,b,hd){hd=hd||{};hd['Content-Type']='application/json';if(T)hd.Authorization='Bearer '+T;
 return fetch('/api/'+p,{method:m||'GET',headers:hd,body:b?JSON.stringify(b):undefined}).then(function(r){return r.json().then(function(d){if(r.status===401&&T){out();throw new Error(d.error)}if(!r.ok)throw new Error(d.error||'Error');return d})})}
function out(){localStorage.removeItem('t');T=null;ME=null;admClose();$('landing').style.display='block'}
function openAuth(){$('landing').style.display='none';$('auth').style.display='block'}
function mode(m){$('tReg').className=m==='reg'?'on':'';$('tLog').className=m==='log'?'on':'';$('fReg').style.display=m==='reg'?'block':'none';$('fLog').style.display=m==='log'?'block':'none';$('aErr').textContent=''}
function done(d){T=d.token;localStorage.setItem('t',T);localStorage.removeItem('ref');enter(d.me)}
function fail(e){$('aErr').textContent=e.message}
function reg(){api('register','POST',{name:$('rN').value,phone:$('rP').value,password:$('rW').value,confirm:$('rC').value,role:$('rRole').value,ref:REF}).then(done).catch(fail)}
function login(){api('login','POST',{name:$('lN').value,password:$('lW').value}).then(done).catch(fail)}
function gCb(r){api('google','POST',{credential:r.credential,ref:REF}).then(done).catch(fail)}
function initG(){if(!GID){$('gWrap').style.display='none';return}
 if(!window.google||!google.accounts){return setTimeout(initG,400)}
 google.accounts.id.initialize({client_id:GID,callback:gCb});google.accounts.id.renderButton($('gBtn'),{theme:'filled_black',size:'large',text:'continue_with',width:280})}

function getTabs() {
  if (ME && ME.role === 'employer') {
    return [['emp','🛍️','Promote Shop'],['help','💬','Support'],['acc','👤','Account']];
  }
  return [['home','🏠','Home'],['tasks','📋','Tasks'],['pkg','📦','Package'],['rank','🏆','Ranking'],['ref','👥','Refer'],['help','💬','Support'],['acc','👤','Account'],['book','🕌','Islam']];
}

function enter(m){
  ME=m;
  $('landing').style.display='none';
  $('auth').style.display='none';
  var tbs = getTabs();
  $('nav').innerHTML=tbs.map(function(t){return '<div id="n_'+t[0]+'" onclick="go(\\''+t[0]+'\\')"><i>'+t[1]+'</i>'+t[2]+'</div>'}).join('');
  head();
  go(ME.role === 'employer' ? 'emp' : 'home');
  startGlobalSync();
}

function head(){
  $('hName').textContent=ME.name + (ME.role === 'employer' ? ' (Employer)' : '');
  $('hBal').textContent=money(ME.balance);
  $('hRsCoins').textContent='RS Coins: '+formatCompact(ME.rsCoins||0);
  $('avT').innerHTML=ME.av?'<img src="'+esc(ME.av)+'" alt="">':'📷';
}
function startGlobalSync(){
  if(window.SYNC_INT) clearInterval(window.SYNC_INT);
  window.SYNC_INT = setInterval(function(){ if(!T) return; api('me').then(function(m){ ME=m; head(); }).catch(function(){}); }, 10000);
}
function go(t){
  TAB=t; clearInterval(TIMER);
  getTabs().forEach(function(x){ var el = $('n_'+x[0]); if(el) el.className=x[0]===t?'on':''; });
  var pages = {home:vHome,tasks:vTasks,emp:vEmp,pkg:vPkg,rank:vRank,ref:vRef,help:vHelp,acc:vAcc,book:vBook};
  if(pages[t]) pages[t]();
}
function toast(m){alert(m)}

function avUp(inp){var f=inp.files[0];if(!f)return;var r=new FileReader();
 r.onload=function(){var im=new Image();
  im.onload=function(){var c=document.createElement('canvas');c.width=c.height=128;var x=c.getContext('2d');
   x.drawImage(im,0,0,128,128);
   api('avatar','POST',{img:c.toDataURL('image/jpeg',0.9)}).then(function(d){ME.av=d.av;head()}).catch(function(e){toast(e.message)})};
  im.src=r.result};
 r.readAsDataURL(f);inp.value=''}

var HS_DATA = [];
function hsGo(i){
  HSI=i; var s=document.querySelectorAll('.sl'),d=document.querySelectorAll('.dots i');
  for(var k=0;k<s.length;k++){
    if(s[k]) s[k].className='sl '+(HS_DATA[k]?HS_DATA[k].bgClass:'s0')+(k===i?' on':''); 
    if(d[k]) d[k].className=k===i?'on':''
  }
}
function handleSlideClick(link){
  if(link && link !== '#'){
    var w = window.open(link, '_blank');
    if(!w) location.href = link;
  }
}

function foot(){var c=ME.ct||{},p=ME.pt||[],A=c.age||18;
 return '<div class="ft"><div class="ftl">'+logo(46)+'<div><b>'+esc(c.n)+'</b><small>টাস্কভিত্তিক রিওয়ার্ড প্ল্যাটফর্ম ও আর এস গ্যালারি কোলাবোরেশন</small></div></div>'+
 '<div class="fd">'+esc(c.d||'')+'</div>'+
 '<div class="fcols"><h5>প্ল্যাটফর্ম</h5><a onclick="go(\\'home\\')">Home</a><a onclick="go(\\'tasks\\')">Tasks</a><a onclick="go(\\'pkg\\')">Package</a><a onclick="go(\\'rank\\')">Ranking</a><a onclick="go(\\'ref\\')">Refer</a></div>'+
 '<div><h5>সহায়তা</h5><a onclick="go(\\'help\\')">Support</a><a onclick="go(\\'acc\\')">Account</a><a onclick="go(\\'book\\')">ইসলামিক বই</a></div></div>'+
 '<div class="fage"><span class="bd">'+A+'+</span><div>'+A+' বছরের নিচে কারও এই অ্যাকাউন্টে প্রবেশ করা নিষেধ।</div></div>'+
 '<div class="fc">© '+esc(c.y)+' '+esc(c.n)+'. সর্বস্বত্ব সংরক্ষিত।</div></div>'}

function vHome(){
  var ok=Date.now()-ME.lastDaily>=864e5,sp=Date.now()-(ME.lastSpin||0)>=864e5;HSI=0;
  
  api('sliders').then(function(sliders){
    HS_DATA = sliders;
    var timerSec = (sliders[0] && sliders[0].timerSeconds) ? (sliders[0].timerSeconds * 1000) : 6000;
    
    var sl = sliders.map(function(x,i){
      var styleBg = x.bgImage ? 'background-image:linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.6)),url(\\''+esc(x.bgImage)+'\\');background-size:cover;' : '';
      return '<div class="sl '+x.bgClass+(i===0?' on':'')+'" style="'+styleBg+'" onclick="handleSlideClick(\\''+esc(x.link)+'\\')"><span class="tag">'+esc(x.subtitle)+'</span><h4>'+esc(x.title)+'</h4><p>'+esc(x.description)+'</p><span class="em">'+x.emoji+'</span></div>';
    }).join('');
    var dt = sliders.map(function(x,i){
      return '<i class="'+(i===0?'on':'')+'" onclick="hsGo('+i+')"></i>';
    }).join('');

    var container = $('homeContainer');
    if(container) {
      container.innerHTML = '<div class="mq"><span>🌙 RS Growth Matrix ও আর এস গ্যালারি শপ-এর যৌথ উদ্যোগে স্বাগতম! টাস্ক করে জমানো টাকা দিয়ে শপিং করুন 🛍️</span></div>'+
      '<div class="grid"><div class="stat"><b>'+money(ME.balance)+'</b><small>Balance</small></div><div class="stat"><b>'+money(ME.earned)+'</b><small>Total earned</small></div></div>'+
      '<div class="hs">'+sl+'</div><div class="dots">'+dt+'</div>'+
      
      '<div class="bo" style="margin-bottom:14px;padding:4px"><div class="bi lk" style="flex-direction:column;text-align:center;padding:18px"><span class="ic" style="font-size:52px">🎡</span><div><b style="font-size:16px;color:var(--gold);margin-top:4px">Grand Lucky Spin & Rewards!</b><small style="font-size:11.5px">চাকা ঘুরিয়ে ক্যাশ ও কয়েন রিওয়ার্ড জিতে নিন!</small></div>'+
      '<button class="btn'+(sp?'':' dn')+'" style="margin-top:12px;width:100%" onclick="spinOpen()">'+(sp?'Spin Wheel Now':'Spin Completed ✅')+'</button></div></div>'+

      '<h3>আজকের বোনাস</h3><div class="bn">'+
      '<div class="bo"><div class="bi"><span class="ic">🎁</span><b>Login Bonus</b><small>+'+ME.d+' BDT</small><button class="btn'+(ok?'':' dn')+'" onclick="act(\\'daily\\')">'+(ok?'Claim':'Claimed ✅')+'</button></div></div>'+
      '<div class="bo"><div class="bi"><span class="ic">📅</span><b>Check-in Bonus</b><small>+'+ME.c+' BDT</small><button class="btn'+(ME.checkedIn?' dn':'')+'" onclick="act(\\'checkin\\')">'+(ME.checkedIn?'Done ✅':'Check in')+'</button></div></div></div>'+foot();
      
      if(window.TIMER) clearInterval(window.TIMER);
      window.TIMER=setInterval(function(){if(!document.querySelector('.hs')){clearInterval(window.TIMER);return}hsGo((HSI+1)%HS_DATA.length)}, timerSec);
    }
  }).catch(function(){});

  $('main').innerHTML='<div id="homeContainer">Loading...</div>';
}
function act(p){api(p,'POST').then(function(m){ME=m;head();vHome();toast('Reward added.')}).catch(function(e){toast(e.message)})}

function wheelSvg(){
  var cols=['#b45309','#1e3a8a','#14532d','#7c2d12','#4c1d95','#0c4a6e','#78350f','#164e63','#065f46','#1e1b4b'];
  var icons=['৳1','৳2','৳3','৳5','50 Coins','100 Coins','৳1','৳2','৳3','৳1'];
  var h='<svg viewBox="0 0 200 200" width="300" height="300" id="whs" style="display:block;margin:0 auto;transition:transform 4.5s cubic-bezier(.17,.67,.12,1);transform:rotate('+ROT+'deg)"><circle cx="100" cy="100" r="98" fill="#0b1224" stroke="#fbbf24" stroke-width="3"/>';
  for(var i=0;i<10;i++){
    var deg = i * (360/10);
    h+='<g transform="rotate('+deg+' 100 100)"><path d="M100 100L91 8A95 95 0 0 1 109 8Z" fill="'+cols[i]+'" stroke="#fbbf24" stroke-width="1"/><text x="100" y="27" text-anchor="middle" font-size="8.5" font-weight="800" fill="#fff">'+icons[i%icons.length]+'</text></g>';
  }
  return h+'<circle cx="100" cy="100" r="16" fill="#0b1224" stroke="#fbbf24" stroke-width="3"/><text x="100" y="104" text-anchor="middle" font-size="11">⭐</text></svg>';
}
function spinOpen(){SPUN=false;var ok=Date.now()-(ME.lastSpin||0)>=864e5;
 modal('<h3 style="color:var(--gold);text-align:center;font-size:16px">🎡 Grand Lucky Wheel</h3><div class="wheel"><div class="pt">▼</div>'+wheelSvg()+'</div><div id="spmsg" style="text-align:center;font-size:13px;min-height:22px;color:#e2e8f0;margin:6px 0">'+(ok?'চাকা ঘোরাতে Spin চাপুন':'আজকের স্পিন শেষ।')+'</div><button id="spb" class="btn"'+(ok?'':' disabled style="opacity:.5"')+' onclick="doSpin()">Spin Now</button><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">Close</button>')}
function doSpin(){if(SPUN)return;SPUN=true;$('spb').disabled=true;$('spb').style.opacity='.5';
 api('spin','POST').then(function(r){var c=[];for(var k=0;k<SEG.length;k++)if(SEG[k][0]===r.prize)c.push(k);var i=c[Math.floor(Math.random()*c.length)]||0;
  ROT=Math.ceil(ROT/360)*360+1800-(i*(360/10));$('whs').style.transform='rotate('+ROT+'deg)';
  setTimeout(function(){ME=r.me;head();var m=$('spmsg');if(m)m.innerHTML='🎉 অভিনন্দন! আপনি জিতেছেন <b style="color:#fbbf24">'+r.prize+' টাকা</b>'},4700)})
 .catch(function(e){SPUN=false;toast(e.message);closeSpin()})}
function closeSpin(){closeM();if(TAB==='home')vHome()}

function vEmp(){
  api('promo-packages').then(packages => {
    $('main').innerHTML='<div class="thero"><div class="rg"><span class="r r1"></span><span class="r r2"></span><span class="r r3"></span>🛍️</div><div><b>Promote Shop (RS Gallery Collaboration)</b><small>আপনার সোশ্যাল মিডিয়া প্রমোট করুন অথবা আর এস গ্যালারি শপের ফিচার্ড প্যাকেজ নিন।</small></div></div>' +
    '<h3 style="margin-bottom:10px">উপলব্ধ প্রমোশন ও শপ প্যাকেজসমূহ</h3>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">' +
    (packages.length ? packages.map(p => {
      return '<div style="background:linear-gradient(135deg,#131d38,#0b1224);border:1px solid rgba(251,191,36,0.4);border-radius:16px;padding:12px;display:flex;flex-direction:column;justify-content:space-between">' +
      '<div><img src="'+esc(p.icon)+'" width="36" height="36" style="border-radius:8px;margin-bottom:6px;object-fit:cover" alt="">' +
      '<b style="color:#fff;font-size:13px;display:block;margin-bottom:2px">'+esc(p.title)+'</b>' +
      '<small style="color:var(--mu);display:block;font-size:10.5px;margin-bottom:6px">'+esc(p.description)+'</small></div>' +
      '<div><div style="color:var(--gold);font-weight:800;font-size:14px;margin-bottom:6px">৳'+money(p.price)+'</div>' +
      '<button class="btn s g" style="width:100%" onclick="buyPromoPkg(\\''+p._id+'\\',\\''+esc(p.title)+'\\','+p.price+')">Buy Now</button></div>' +
      '</div>';
    }).join('') : '<div class="row">কোনো প্যাকেজ নেই।</div>') +
    '</div>' +
    '<div class="card" style="margin-top:10px">' +
    '<h3 style="color:var(--gold);margin-bottom:8px">বা কাস্টম প্রমোশন টাস্ক দিন</h3>' +
    '<label>প্লাটফর্ম নির্বাচন করুন</label>' +
    '<select id="etPlatform"><option value="youtube">YouTube</option><option value="facebook">Facebook</option><option value="telegram">Telegram</option><option value="rsgallery">RS Gallery Shop</option></select>' +
    '<label>চ্যানেল বা পেজের নাম/টাইটেল</label><input id="etTitle" placeholder="যেমন: RS Gallery Shirt Promo">' +
    '<label>লিংক (URL)</label><input id="etLink" placeholder="https://...">' +
    '<label>প্রতি ওয়ার্কারের পেমেন্ট (BDT)</label><input id="etReward" type="number" placeholder="2">' +
    '<label>কতজন ওয়ার্কার কাজ করবে (Target Workers)</label><input id="etWorkers" type="number" placeholder="100">' +
    '<button class="btn g" onclick="submitCustomTask()">Submit Custom Task</button>' +
    '</div>';
  });
}

function buyPromoPkg(id, title, price){
  modal('<h3 style="color:var(--gold)">প্যাকেজ অর্ডার নিশ্চিত করুন</h3>' +
  '<div class="tdw">প্যাকেজ: <b>'+title+'</b><br>মূল্য: <b style="color:var(--grn)">'+price+' BDT</b></div>' +
  '<label>আপনার প্রমোশন লিংক (YouTube/Facebook/RS Gallery URL)</label><input id="buyLink" placeholder="https://...">' +
  '<button class="btn g" onclick="confirmBuyPkg(\\''+id+'\\')">Confirm & Pay</button>' +
  '<button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">Cancel</button>');
}

function confirmBuyPkg(id){
  api('employer/task','POST',{ packageId: id, link: $('buyLink').value }).then(r => {
    ME = r.me; head(); closeM(); toast('প্যাকেজটি সফলভাবে অর্ডার করা হয়েছে!'); vEmp();
  }).catch(e => toast(e.message));
}

function submitCustomTask(){
  api('employer/task','POST',{
    platform: $('etPlatform').value,
    title: $('etTitle').value,
    link: $('etLink').value,
    reward: $('etReward').value,
    targetWorkers: $('etWorkers').value
  }).then(r=>{
    ME = r.me; head(); toast('টাস্কটি সফলভাবে সাবমিট হয়েছে।'); vEmp();
  }).catch(e=>toast(e.message));
}

function vTasks(){
  $('main').innerHTML='<div class="thero"><div class="rg"><span class="r r1"></span><span class="r r2"></span><span class="r r3"></span>📋</div><div><b>Tasks & Watch Ads Dashboard</b><small>টাস্ক সম্পন্ন করুন এবং অর্জিত টাকা দিয়ে আর এস গ্যালারি থেকে শপিং করুন।</small></div></div>' +
  '<div class="seg" style="margin-bottom:14px"><div id="subTask" class="on" onclick="switchTaskSub(\\'tasks\\')">📋 Offerwall Tasks</div><div id="subAd" onclick="switchTaskSub(\\'ads\\')">📺 Watch Ads</div></div>' +
  '<div id="taskSubContent"></div>';
  switchTaskSub('tasks');
}

function switchTaskSub(sub){
  $('subTask').className = sub === 'tasks' ? 'on' : '';
  $('subAd').className = sub === 'ads' ? 'on' : '';
  var c = $('taskSubContent');
  if(!c) return;
  if(sub === 'tasks'){
    c.innerHTML = '<div id="tw"></div><div class="grid4" id="st"></div><div id="tl">Loading...</div>';
    api('timewall').then(function(d){TWU=d.url;var e=$('tw');if(e&&d.url)e.innerHTML='<div class="row" style="border-color:rgba(34,197,94,.5)"><div style="display:flex;gap:10px;align-items:center"><span style="font-size:30px">⏱️</span><div>TimeWall Tasks</div></div><button class="btn s g" onclick="openTW()">Open</button></div>'}).catch(function(){});
    function loadOffers(){api('offers').then(function(d){var s=d.stats;if(!$('st'))return;
    $('st').innerHTML=[['Pending',s.pending],['Success',s.success],['Cancelled',s.cancelled],['Total',s.total]].map(function(x){return '<div class="stat"><b>'+x[1]+'</b><small>'+x[0]+'</small></div>'}).join('');
    window.OF=d.list;
    $('tl').innerHTML=d.list.length?d.list.map(function(t,i){var op=t.status==='open',b=op?'<button class="btn s">Details</button>':'<span class="chip '+(t.status==='success'?'approved':t.status)+'">'+t.status+'</span>';
    return '<div class="row"'+(op?' style="cursor:pointer" onclick="showT('+i+')"':'')+'><div style="display:flex;gap:10px;align-items:center">'+(t.icon?'<img src="'+esc(t.icon)+'" width="38" height="38" style="border-radius:10px" alt="">':'')+'<div>'+esc(t.title)+'<small>Reward: '+money(t.bdt)+' BDT</small></div></div>'+b+'</div>'}).join(''):'<div class="row">এই মুহূর্তে কোনো টাস্ক নেই।</div>'}).catch(function(e){if($('tl'))$('tl').textContent=e.message})}
    loadOffers();
  } else {
    c.innerHTML = '<div class="card" style="text-align:center;padding:24px"><span style="font-size:48px">📺</span><h3 style="color:var(--gold);margin-top:10px">Watch Ads & Earn Cash</h3><div class="sub">প্রতিটি অ্যাড সম্পূর্ণ দেখলে ইনস্ট্যান্ট ৳০.৫০ আপনার ব্যালেন্সে যোগ হবে।</div><div id="adTimerBox" style="font-size:14px;color:var(--mu);margin:14px 0">অ্যাড দেখতে নিচে ক্লিক করুন</div><button id="watchBtn" class="btn g" onclick="startWatchAd()">Watch Ad Now (+৳0.50)</button></div>';
  }
}

function startWatchAd(){
  var btn = $('watchBtn'); var box = $('adTimerBox');
  if(!btn || !box) return;
  btn.disabled = true; btn.style.opacity = '.5';
  var sec = 10;
  box.innerHTML = 'অ্যাড চলছে... অনুগ্রহ করে <b style="color:var(--gold)">'+sec+'</b> সেকেন্ড অপেক্ষা করুন';
  var int = setInterval(function(){
    sec--;
    if(sec > 0){ box.innerHTML = 'অ্যাড চলছে... অনুগ্রহ করে <b style="color:var(--gold)">'+sec+'</b> সেকেন্ড অপেক্ষা করুন'; }
    else {
      clearInterval(int);
      api('watch-ad', 'POST').then(function(r){
        ME = r.me; head();
        box.innerHTML = '<span style="color:var(--grn);font-weight:bold">🎉 সফল! আপনি ০.৫০ টাকা অর্জন করেছেন।</span>';
        btn.disabled = false; btn.style.opacity = '1'; btn.textContent = 'Watch Another Ad';
      }).catch(function(e){
        box.innerHTML = '<span style="color:var(--red)">'+e.message+'</span>';
        btn.disabled = false; btn.style.opacity = '1';
      });
    }
  }, 1000);
}

function openTW(){if(TWU){var w=window.open(TWU,'_blank');if(!w)location.href=TWU}}
function showT(i){var t=OF[i];
 modal('<div style="display:flex;gap:12px;align-items:center">'+(t.icon?'<img src="'+esc(t.icon)+'" width="54" height="54" style="border-radius:14px" alt="">':'')+'<div><b style="font-size:15px">'+esc(t.title)+'</b><div style="color:var(--grn);font-weight:800;margin-top:3px">Reward: '+money(t.bdt)+' BDT</div></div></div>'+
 '<div class="tdw"><b>কাজ কী:</b> '+esc(t.desc||'বিস্তারিত দেওয়া নেই')+'</div>'+
 (t.req?'<div class="tdw"><b>শর্ত:</b> '+esc(t.req)+'</div>':'')+
 '<button class="btn g" onclick="closeM();startO('+i+')">Start</button><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">Close</button>')}
function startO(i){api('offers/'+encodeURIComponent(OF[i].id)+'/start','POST').then(function(r){var w=window.open(r.url,'_blank');if(!w)location.href=r.url;vTasks()}).catch(function(e){toast(e.message)})}
function modal(h){$('mBody').innerHTML=h;$('modal').style.display='flex'}
function closeM(){$('modal').style.display='none'}

function vPkg(){
  api('user-packages').then(function(pkgs){
    var isBought = ME.activePkg && ME.activePkg.expiresAt > Date.now();
    $('main').innerHTML=hb('ref','📦','RS Coin Packages','৳২০০ থেকে ৳৩০০০ টাকার মধ্যে প্যাকেজ কিনুন। ৩০ দিনের জন্য আনলক হবে।') +
    (isBought ? '<div class="row" style="border-color:var(--grn);margin-bottom:12px"><div><b>আপনার একটি প্যাকেজ সক্রিয় আছে!</b></div></div>' : '') +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">' +
    (pkgs.length ? pkgs.map(function(x){
      var imgTag = x.pkgImage ? '<img src="'+esc(x.pkgImage)+'" width="100%" height="90" style="object-fit:cover;border-radius:10px;margin-bottom:6px" alt="">' : '';
      return '<div style="background:linear-gradient(135deg,#131d38,#0b1224);border:2px solid '+(x.hot?'var(--red)':'rgba(251,191,36,0.4)')+';border-radius:16px;padding:12px;text-align:center;position:relative">' +
      (x.hot?'<div style="position:absolute;top:-8px;left:-8px;background:var(--red);color:#fff;font-size:9px;font-weight:bold;padding:2px 6px;border-radius:6px">🔥 HOT</div>':'') +
      imgTag +
      '<b style="color:var(--gold);font-size:13px;display:block;margin-bottom:4px">'+esc(x.description)+'</b>' +
      '<div style="font-size:11px;color:var(--mu)">মূল্য: <b>'+x.price+' BDT</b></div>' +
      '<div style="font-size:12px;color:var(--grn);margin:4px 0 8px">মিনিটে: <b>'+formatCompact(x.coinsPerMin)+' RS Coins</b></div>' +
      '<button class="btn s g" style="width:100%" onclick="go(\\'acc\\');depForm('+x.price+',\\''+esc(x.description)+'\\')">Buy Package</button>' +
      '</div>';
    }).join('') : '<div class="row">কোনো প্যাকেজ নেই।</div>') + '</div>';
  }).catch(function(e){$('main').innerHTML='<div class="row">'+e.message+'</div>'});
}

function vRank(){
  $('main').innerHTML=hb('rank','🏆','Ranking','ইউজারদের রিয়েল ব্যালেন্স এবং সংগৃহীত আরএস কয়েন (রিয়েলটাইম আপডেট)।')+'<div id="rk">Loading...</div>';
  function load(){
    api('leaderboard').then(function(a){
      if(!a.length){$('rk').innerHTML='<div class="row">No data.</div>';return}
      var p=[a[1],a[0],a[2]],cl=['','p1',''],rk=['#2','#1','#3'];
      $('rk').innerHTML='<div class="pod">'+p.map(function(u,i){return u?'<div class="'+cl[i]+'">'+(i===1?'👑':'')+'<br>'+(u.avatar?'<img src="'+esc(u.avatar)+'" width="42" height="42" style="border-radius:50%;border:2px solid var(--gold);object-fit:cover;margin:4px auto;display:block">':'👤')+'<br>'+esc(u.name)+'<b style="color:var(--grn)">'+money(u.balance||0)+' BDT</b><small style="color:var(--gold)">'+formatCompact(u.rsCoins||0)+' RS Coins</small><small>'+rk[i]+'</small></div>':'<div></div>'}).join('')+'</div>'+
      a.slice(3).map(function(u,i){return '<div class="row"><div style="display:flex;align-items:center;gap:10px">'+(u.avatar?'<img src="'+esc(u.avatar)+'" width="32" height="32" style="border-radius:50%;object-fit:cover">':'👤')+'<div>#'+(i+4)+' '+esc(u.name)+'<small style="color:var(--gold)">RS Coins: '+formatCompact(u.rsCoins||0)+'</small></div></div><b style="color:var(--grn)">'+money(u.balance||0)+' BDT</b></div>'}).join('')
    }).catch(function(){})
  }
  load();
  TIMER=setInterval(load,5000)
}

function vRef(){var link=location.origin+'/?ref='+ME.refCode,e=encodeURIComponent(link),tx=encodeURIComponent('Join RS Growth Matrix: ');window.RL=link;
 $('main').innerHTML=hb('ref','👥','Invite & Earn','বন্ধুদের ইনভাইট করুন, প্রতি সাইনআপে বোনাস পান।')+'<div class="card" style="text-align:center">'+logo(64)+'<div class="brand" style="font-size:18px">Invite and earn</div>'+
 '<input readonly id="rl" value="'+esc(link)+'"><button class="btn" onclick="copyL()">Copy link</button></div>'+
 '<div class="grid" style="margin-top:12px"><div class="stat"><b>'+ME.refCount+'</b><small>Friends joined</small></div><div class="stat"><b>'+money(ME.refEarn)+'</b><small>Referral earnings (৳10 Bonus Active)</small></div></div>';
}
function copyL(){(navigator.clipboard?navigator.clipboard.writeText(RL):Promise.reject()).then(function(){toast('Link copied.')}).catch(function(){$('rl').select();toast('Copied.')})}

function vHelp(){
  $('main').innerHTML=hb('help','💬','Support','আপনার যেকোনো সমস্যার দ্রুত সমাধান নিন।') +
  '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">' +
  '<button class="btn s" onclick="presetMsg(\\'আমার ডিপোজিট এখনো যুক্ত হয়নি, কি করব?\\')">💳 ডিপোজিট সমস্যা</button>' +
  '<button class="btn s" onclick="presetMsg(\\'আমার উইথড্র পেন্ডিং আছে, কখন পাব?\\')">💸 উইথড্র সমস্যা</button>' +
  '<button class="btn s" onclick="presetMsg(\\'টাস্ক কমপ্লিট করার নিয়ম সম্পর্কে জানতে চাই।\\')">📋 টাস্ক সমস্যা</button>' +
  '<button class="btn s" onclick="presetMsg(\\'আর এস গ্যালারি শপ থেকে কিভাবে কেনাকাটা করব?\\')">🛍️ আর এস গ্যালারি শপ</button>' +
  '</div>' +
  '<div class="chat" id="ch"></div><textarea id="st" rows="2" maxlength="500" placeholder="Describe your problem"></textarea><button class="btn" onclick="sendS()">Send</button>';
  loadSupportMsgs();
  if(window.SUP_TIMER) clearInterval(window.SUP_TIMER);
  window.SUP_TIMER = setInterval(loadSupportMsgs, 10000);
}

function presetMsg(txt){
  var el = $('st');
  if(el){
    el.value = txt;
    sendS();
  }
}

function loadSupportMsgs(){
  api('support').then(function(a){
    var c=$('ch');if(!c)return;
    c.innerHTML=a.length?a.map(function(m){return '<div class="m '+m.from+'">'+esc(m.text)+'</div>'}).join(''):'<div class="m support">Hello! Write your message or select quick help above.</div>';
    c.scrollTop=c.scrollHeight;
  }).catch(function(){})
}
function sendS(){
  var txt = $('st').value.trim();
  if(!txt) return;
  api('support','POST',{text:txt}).then(function(){$('st').value='';loadSupportMsgs()}).catch(function(e){toast(e.message)})
}

var globalFeedInterval = null;
function vAcc(){
  if(window.SUP_TIMER) clearInterval(window.SUP_TIMER);
  if(globalFeedInterval) clearInterval(globalFeedInterval);
  var isEmp = ME.role === 'employer';
  
  api('global-feed').then(function(feed){
    renderLiveFeed(feed);
    globalFeedInterval = setInterval(function(){
      api('global-feed').then(renderLiveFeed).catch(function(){});
    }, 2000);
  }).catch(function(){});

  $('main').innerHTML=hb('acc','👤','My Account','আপনার ব্যালেন্স ও পপআপ হিস্ট্রি।')+
  '<div class="row"><div>'+esc(ME.name)+' ('+(isEmp?'Employer':'Worker')+')<small>'+esc(ME.phone||ME.email)+'</small></div><button class="btn s" onclick="out()">Logout</button></div>'+
  '<div class="grid"><div class="stat"><b>'+money(ME.balance)+'</b><small>Balance</small></div><div class="stat"><b>'+money(ME.earned)+'</b><small>Total earned</small></div></div>'+
  '<div style="display:flex;gap:8px"><button class="btn g" style="flex:1" onclick="depForm()">Deposit</button>'+(isEmp?'':'<button class="btn r" style="flex:1" onclick="wdForm()">Withdraw</button>')+'</div>'+
  
  '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px">' +
  '<button class="btn" style="background:#1e293b;color:var(--gold);margin-top:0" onclick="openWdPopup()">💸 Withdrawal History</button>' +
  '<button class="btn" style="background:#1e293b;color:var(--grn);margin-top:0" onclick="openDepPopup()">💳 Deposit History</button>' +
  '</div>' +
  '<button class="btn" style="background:#1e293b;color:#fff;margin-top:16px" onclick="admOpen()">Admin panel</button>' +
  
  '<div class="card" style="margin-top:16px;border-color:rgba(56,189,248,0.3)">' +
  '<h3 style="color:var(--blu);margin-bottom:8px">🌐 Live Global Transactions & RS Gallery Activity</h3>' +
  '<div id="liveFeedContainer" style="max-height:160px;overflow-y:auto">Loading live feed...</div>' +
  '</div>';
}

function renderLiveFeed(feed){
  var c = $('liveFeedContainer');
  if(!c) return;
  var shifted = feed.concat(feed.splice(0, Math.floor(Math.random() * feed.length)));
  c.innerHTML = shifted.map(function(f){
    var badgeColor = f.type === 'dep' ? 'var(--grn)' : (f.type === 'wd' ? 'var(--red)' : (f.type === 'shop' ? 'var(--gold)' : 'var(--blu)'));
    return '<div style="font-size:11.5px;color:var(--mu);padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center"><span><b style="color:'+badgeColor+'">●</b> <b>'+esc(f.name)+'</b> '+esc(f.action)+'</span><span style="color:var(--gold);font-size:10px">'+esc(f.time)+'</span></div>';
  }).join('');
}

function openWdPopup(){
  api('withdrawals').then(function(a){
    var content = a.length ? a.map(function(w){
      return '<div class="row"><div>'+esc(w.method)+' '+esc(w.phone)+'<small>'+new Date(w.at).toLocaleDateString()+'</small></div><div>'+money(w.amount)+' BDT <span class="chip '+(w.status==='pending'?'pending':w.status)+'">'+w.status+'</span></div></div>';
    }).join('') : '<div class="row">No withdrawals.</div>';
    modal('<h3 style="color:var(--gold)">💸 Withdrawal History & Pending</h3><div style="max-height:60vh;overflow-y:auto">'+content+'</div><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">Close</button>');
  });
}

function openDepPopup(){
  api('deposits').then(function(a){
    var content = a.length ? a.map(function(d){
      return '<div class="row"><div>'+esc(d.method)+' (Trx: ...'+esc(d.lastDigits)+')<small>'+new Date(d.at).toLocaleDateString()+'</small></div><div>'+money(d.amount)+' BDT <span class="chip '+(d.status==='pending'?'pending':d.status)+'">'+d.status+'</span></div></div>';
    }).join('') : '<div class="row">No deposits.</div>';
    modal('<h3 style="color:var(--grn)">💳 Deposit History & Pending</h3><div style="max-height:60vh;overflow-y:auto">'+content+'</div><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">Close</button>');
  });
}

/* Circular Hold Button Engine */
var circularTimer = null;
var currentProgress = 0;

function startCircleHold(type, pkgName){
  if(type === 'dep'){
    var txVal = $('dtx').value.trim();
    var lastDig = $('dlast').value.trim();
    if(txVal.length < 10) { toast('TrxID কমপক্ষে ১০ অক্ষরের হতে হবে।'); return; }
    if(lastDig.length !== 3) { toast('সঠিকভাবে ট্রানজেকশনের শেষের ৩ ডিজিট দিন।'); return; }
  } else if(type === 'wd'){
    var wa = $('wa').value, wp = $('wp').value;
    if(!wa || wa < 300) { toast('উইথড্র অ্যামাউন্ট কমপক্ষে ৩০০ টাকা হতে হবে।'); return; }
    if(!/^01\d{9}$/.test(wp)) { toast('সঠিক ১১ ডিজিটের ফোন নাম্বার দিন।'); return; }
  }

  currentProgress = 0;
  var circle = $('circleProgress');
  var txt = $('circleBtnText');
  if(txt) txt.innerText = 'HOLDING...';

  circularTimer = setInterval(function(){
    currentProgress += 4;
    var offset = 301.59 - (301.59 * currentProgress / 100);
    if(circle) circle.style.strokeDashoffset = offset;

    if(currentProgress >= 100){
      clearInterval(circularTimer);
      circularTimer = null;
      if(type === 'dep') executeDeposit(pkgName);
      else if(type === 'wd') doWd();
    }
  }, 35);
}

function cancelCircleHold(){
  if(circularTimer){
    clearInterval(circularTimer);
    circularTimer = null;
  }
  currentProgress = 0;
  var circle = $('circleProgress');
  if(circle) circle.style.strokeDashoffset = 301.59;
  var txt = $('circleBtnText');
  if(txt) txt.innerText = 'TAP & HOLD';
}

function wdForm(){
  modal('<h3 style="color:var(--gold);text-align:center">Withdraw Form</h3>' +
  '<div class="row" style="background:#0b1224;display:block;margin-bottom:10px">' +
  '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:var(--mu)">Username:</span><b>'+esc(ME.name)+'</b></div>' +
  '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:var(--mu)">User ID:</span><b>RSGM-'+ME.id.slice(-6).toUpperCase()+'</b></div>' +
  '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:var(--mu)">Current Balance:</span><b style="color:var(--grn)">৳'+money(ME.balance)+'</b></div>' +
  '</div>' +
  '<label>Select Method</label><select id="wm"><option value="bKash">bKash</option><option value="Nagad">Nagad</option></select>' +
  '<label>Withdraw Amount (BDT)</label><input id="wa" type="number" placeholder="300 - 5000">' +
  '<label>Account Number (11 Digits)</label><input id="wp" maxlength="11" placeholder="01XXXXXXXXX">' +
  
  '<div class="hold-circle-container">' +
  '<svg class="hold-circle-svg" viewBox="0 0 100 100"><defs><linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#22c55e"/></linearGradient></defs><circle class="hold-bg-circle" cx="50" cy="50" r="48"/><circle id="circleProgress" class="hold-progress-circle" cx="50" cy="50" r="48"/></svg>' +
  '<div class="hold-btn-inner" onmousedown="startCircleHold(\\'wd\\')" ontouchstart="startCircleHold(\\'wd\\')" onmouseup="cancelCircleHold()" ontouchend="cancelCircleHold()"><span id="circleBtnText">TAP & HOLD</span><small style="font-size:7px;opacity:0.9">TO SUBMIT</small></div>' +
  '</div>' +
  
  '<button class="btn" style="background:#1e293b;color:#fff;margin-top:6px" onclick="closeM()">Close</button>');
}

function doWd(){
  api('withdraw','POST',{method:$('wm').value,amount:$('wa').value,phone:$('wp').value}).then(function(m){
    ME=m; head(); closeM(); toast('Withdrawal request submitted successfully.'); vAcc();
  }).catch(function(e){toast(e.message)});
}

function depForm(presetAmount, pkgName){
  modal('<h3 style="color:var(--gold);text-align:center">Deposit Form</h3>' +
  '<div class="row" style="background:#0b1224;display:block;margin-bottom:10px">' +
  '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:var(--mu)">Username:</span><b>'+esc(ME.name)+'</b></div>' +
  '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:var(--mu)">User ID:</span><b>RSGM-'+ME.id.slice(-6).toUpperCase()+'</b></div>' +
  '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:var(--mu)">Current Balance:</span><b style="color:var(--grn)">৳'+money(ME.balance)+'</b></div>' +
  '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:var(--mu)">Date:</span><b>'+new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})+'</b></div>' +
  '</div>' +
  '<div style="display:flex;gap:10px;margin-bottom:10px">' +
  '<div id="payBkash" style="flex:1;background:#131d38;border:2px solid var(--gold);border-radius:12px;padding:8px;text-align:center;cursor:pointer" onclick="setDepMethod(\\'bKash\\')"><b style="color:#e11d48">bKash</b></div>' +
  '<div id="payNagad" style="flex:1;background:#131d38;border:2px solid var(--line);border-radius:12px;padding:8px;text-align:center;cursor:pointer" onclick="setDepMethod(\\'Nagad\\')"><b style="color:#f97316">Nagad</b></div>' +
  '</div>' +
  '<div class="tdw" style="text-align:center"><b>Official Number:</b> <span style="color:var(--grn);font-weight:bold" id="offNumText">01951639460</span> <button class="copy-btn-inline" onclick="copyDepNum()">Copy</button><br><small>1. Send money to this number.<br>2. Enter TrxID and Last 3 Digits below.</small></div>' +
  '<label>Deposit Amount (৳)</label><input id="da" type="number" value="'+(presetAmount||'')+'" placeholder="200 - 15000">' +
  '<label>Transaction ID (TrxID)</label><input id="dtx" placeholder="Enter Transaction ID">' +
  '<label>Last 3 Digits (Mandatory)</label><input id="dlast" maxlength="3" placeholder="123">' +
  
  '<div class="hold-circle-container">' +
  '<svg class="hold-circle-svg" viewBox="0 0 100 100"><defs><linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#22c55e"/></linearGradient></defs><circle class="hold-bg-circle" cx="50" cy="50" r="48"/><circle id="circleProgress" class="hold-progress-circle" cx="50" cy="50" r="48"/></svg>' +
  '<div class="hold-btn-inner" onmousedown="startCircleHold(\\'dep\\',\\''+(pkgName||'Custom Deposit')+'\\')" ontouchstart="startCircleHold(\\'dep\\',\\''+(pkgName||'Custom Deposit')+'\\')" onmouseup="cancelCircleHold()" ontouchend="cancelCircleHold()"><span id="circleBtnText">TAP & HOLD</span><small style="font-size:7px;opacity:0.9">TO SUBMIT</small></div>' +
  '</div>' +
  
  '<button class="btn" style="background:#1e293b;color:#fff;margin-top:6px" onclick="closeM()">Close</button>');
}

function copyDepNum(){
  navigator.clipboard.writeText('01951639460').then(function(){ toast('Official Number 01951639460 Copied!'); }).catch(function(){ toast('Copied 01951639460'); });
}

window.currentDepMethod = 'bKash';
function setDepMethod(m){
  window.currentDepMethod = m;
  if(m === 'bKash'){
    $('payBkash').style.borderColor = 'var(--gold)';
    $('payNagad').style.borderColor = 'var(--line)';
  } else {
    $('payNagad').style.borderColor = 'var(--gold)';
    $('payBkash').style.borderColor = 'var(--line)';
  }
}

function executeDeposit(pkgName){
  var txVal = $('dtx').value.trim();
  var lastDig = $('dlast').value.trim();
  api('deposit','POST',{method:window.currentDepMethod,amount:$('da').value,txid:txVal,lastDigits:lastDig,pkgName:pkgName}).then(function(r){
    if(r.activePkg) ME.activePkg = r.activePkg;
    
    var dep = r.depositDetails || {};
    modal('<h3 style="color:var(--grn);text-align:center">✅ Deposit Successful!</h3>' +
    '<div class="row" style="background:#0b1224;display:block;margin-bottom:10px">' +
    '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:var(--mu)">Username:</span><b>'+esc(ME.name)+'</b></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:var(--mu)">User ID:</span><b>RSGM-'+ME.id.slice(-6).toUpperCase()+'</b></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:var(--mu)">Order No:</span><b style="color:var(--gold)">'+esc(dep.serialNo||'#D-772391')+'</b></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:var(--mu)">Deposit Amount:</span><b style="color:var(--grn)">৳'+money(dep.amount)+'</b></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:var(--mu)">Status:</span><b style="color:var(--gold)">Pending (Verification in progress)</b></div>' +
    '</div>' +
    '<div class="tdw" style="text-align:center">⏱️ <b id="depTimer">02:00</b> মিনিট পর ব্যালেন্সে যুক্ত হবে।</div>' +
    '<button class="btn" style="background:#1e293b;color:#fff" onclick="closeM();vAcc()">OK, Go Back</button>');
    
    var seconds = 120;
    var timerInterval = setInterval(function(){
      seconds--;
      var m = Math.floor(seconds / 60);
      var s = seconds % 60;
      var tEl = $('depTimer');
      if(tEl) tEl.innerText = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
      if(seconds <= 0) clearInterval(timerInterval);
    }, 1000);

  }).catch(function(e){
    toast(e.message);
  });
}

var DUA=[
["১. সানা","سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ","সুবহানাকাল্লাহুম্মা ওয়া বিহামদিকা...","হে আল্লাহ, আপনি পবিত্র।"],
["২. সূরা ফাতিহা","بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ","বিসমিল্লাহির রাহমানির রাহিম...","পরম করুণাময় আল্লাহর নামে।"],
["৩. আত্তাহিয়্যাতু","التَّحِيَّاتُ لِلَّهِ","আত্তাহিয়্যাতু লিল্লাহি...","সমস্ত সম্মান আল্লাহর জন্য।"]];
var RK=[["ফজর","২ রাকাত ফরজ"],["জোহর","৪ রাকাত ফরজ"],["আসর","৪ রাকাত ফরজ"],["মাগরিব","৩ রাকাত ফরজ"],["এশা","৪ রাকাত ফরজ"]];
var HD=[["কাজ নিয়তের ওপর নির্ভরশীল।","সহিহ বুখারি ১"]];
function bkb(p,ic,t,s){return '<div class="row" style="cursor:pointer" onclick="bk(\\''+p+'\\')"><div>'+ic+' '+t+'<small>'+s+'</small></div><span style="color:var(--gold)">&rsaquo;</span></div>'}
function bkBack(p){return '<button class="btn s" style="margin-bottom:12px" onclick="bk(\\''+p+'\\')">&lsaquo; ফিরে যান</button>'}
function vBook(){bk('menu')}
function nmF(){var q=($('nq').value||'').trim().toLowerCase(),a=NML.filter(function(x){return !q||x.toLowerCase().indexOf(q)>=0});
 $('nl').innerHTML='<h3>'+a.length+'টি নাম</h3>'+(a.length?a.map(function(x){var p=x.split('|');return '<div class="bkc nm"><div><b>'+esc(p[0])+'</b><small>'+esc(p[2]||'')+'</small></div><div class="ar2">'+esc(p[1]||'')+'</div></div>'}).join(''):'<div class="row">কোনো নাম মেলেনি</div>')}
function bk(p){var h='';
 if(p==='menu'){h='<div class="bkh">'+mosque(230)+'<div class="t">ইসলামিক বই</div><div class="u">নাম, দোয়া ও হাদিস</div></div>'+
  bkb('names','🌙','ইসলামিক নাম','ছেলে ও মেয়েদের নাম')+bkb('dua','🤲','নামাজের দোয়া','নামাজে যা যা পড়তে হয়')+bkb('rakat','🕌','পাঁচ ওয়াক্ত নামাজ','ফরজ রাকাত')+bkb('hadith','📜','হাদিস','সহিহ হাদিস')}
 else if(p==='names'){h=bkBack('menu')+'<h3>কাদের নাম দেখতে চান?</h3>'+bkb('boys','👦','ছেলেদের নাম','')+bkb('girls','👧','মেয়েদের নাম','')}
 else if(p==='boys'||p==='girls'){NML=[];h=bkBack('names')+'<h3>'+(p==='boys'?'ছেলেদের':'মেয়েদের')+' ইসলামিক নাম</h3><input id="nq" placeholder="নাম খুঁজুন..." oninput="nmF()"><div id="nl" style="margin-top:10px"><div class="row">Loading...</div></div>';
  $('main').innerHTML=h;$('main').scrollTop=0;
  api('names/'+p).then(function(a){NML=a;nmF()}).catch(function(e){var l=$('nl');if(l)l.textContent=e.message});return}
 else if(p==='dua'){h=bkBack('menu')+'<h3>নামাজের দোয়া</h3>'+DUA.map(function(d){return '<div class="bkc"><b>'+esc(d[0])+'</b><div class="ar">'+esc(d[1])+'</div><small>অর্থ: '+esc(d[3])+'</small></div>'}).join('')}
 else if(p==='rakat'){h=bkBack('menu')+'<h3>পাঁচ ওয়াক্ত নামাজ</h3>'+RK.map(function(r){return '<div class="row"><div><b style="color:var(--gold)">'+r[0]+'</b></div><div>'+r[1]+'</div></div>'}).join('')}
 else if(p==='hadith'){h=bkBack('menu')+'<h3>হাদিস</h3>'+HD.map(function(x){return '<div class="bkc">'+esc(x[0])+'<small>সূত্র: '+esc(x[1])+'</small></div>'}).join('')}
 $('main').innerHTML=h;$('main').scrollTop=0}

var ATABS=[['ov','📊','ওভারভিউ'],['wd','💸','উত্তোলন'],['dep','💳','ডিপোজিট'],['ctask','📢','প্রমোশন'],['shop','🛍️','প্যাকেজ ও শপ'],['slider','🖼️','স্লাইডার কন্ট্রোল'],['sp','💬','সাপোর্ট'],['us','🟢','অ্যাক্টিভ']];
function ah(){return{'x-admin-pass':ADM}}

function admOpen(){
  modal('<div style="text-align:center"><h3 style="color:var(--gold);font-size:16px;margin-bottom:6px">⚠️ Warning: Admin Access Only!</h3>' +
  '<p style="font-size:12px;color:var(--mu);margin-bottom:12px">সাধারণ ইউজারদের জন্য এই প্যানেলটি নিষিদ্ধ। এডমিন পাসওয়ার্ড দিন:</p>' +
  '<input id="adminPassInput" type="password" placeholder="Enter Admin Password" style="margin-bottom:12px">' +
  '<button class="btn g" style="margin-top:0" onclick="verifyAdminPass()">Confirm Access</button>' +
  '<button class="btn" style="background:#1e293b;color:#fff;margin-top:6px" onclick="closeM()">Cancel</button></div>');
}

function verifyAdminPass(){
  var p = $('adminPassInput').value;
  if(!p) return;
  ADM = p;
  api('admin/data','GET',null,ah()).then(function(){
    closeM();
    $('adm').className='adm on';
    $('anav').innerHTML=ATABS.map(function(t){return '<div id="a_'+t[0]+'" onclick="admGo(\\''+t[0]+'\\')"><i>'+t[1]+'</i>'+t[2]+'</div>'}).join('');
    admGo('ov');
  }).catch(function(){
    toast('Wrong admin password.');
    ADM='';
  });
}

function admClose(){$('adm').className='adm'}
function aErr(e){if(e.message==='Wrong admin password.'){toast(e.message);admClose()}else $('abody').innerHTML='<div class="row">'+esc(e.message)+'</div>'}
function admGo(t){ATABS.forEach(function(x){var el=$('a_'+x[0]);if(el)el.className=x[0]===t?'on':''});$('abody').innerHTML='<div class="row">Loading...</div>';
 ({ov:aOv,wd:aWd,dep:aDep,ctask:aCTask,shop:aShopCtrl,slider:aSliderCtrl,sp:aSp,us:aUs})[t]()}
function sc(a){return a.map(function(x){return '<div class="stat"><b>'+x[1]+'</b><small>'+x[0]+'</small></div>'}).join('')}
function aOv(){api('admin/data','GET',null,ah()).then(function(d){var s=d.stats;
 $('abody').innerHTML='<h3>আজকের হিসাব</h3><div class="grid">'+sc([['মোট ইউজার',s.users],['আজ ঢুকেছে',s.active],['ডিপোজিট পেন্ডিং',s.depPending],['অপেক্ষমাণ টাস্ক',s.pendingTasks]])+'</div>'}).catch(aErr)}
function decI(i,ok){var w=AD.wds[i];api('admin/wd/'+w._id,'POST',{ok:!!ok},ah()).then(aWd).catch(aErr)}

function aWd(){
  api('admin/wd-list','GET',null,ah()).then(function(d){
    AD.wds = d.pending;
    $('abody').innerHTML = '<h3>অপেক্ষমাণ উত্তোলন (Real-time & Copy)</h3>' +
    (d.pending.length ? d.pending.map(function(w, i){
      var timeStr = new Date(w.at).toLocaleTimeString();
      return '<div class="th">' +
      '<div class="hd"><span>'+esc(w.name)+'</span><span style="color:var(--gold)">৳'+money(w.amount)+'</span></div>' +
      '<div style="font-size:13px">' +
      'Method: <b>'+esc(w.method)+'</b><br>' +
      'Phone: <b id="wdPhone'+i+'">'+esc(w.phone)+'</b> <button class="admin-copy-btn" onclick="copyAdminText(\\'wdPhone'+i+'\\')">Copy</button><br>' +
      '<small style="color:var(--mu)">সময়: '+timeStr+'</small>' +
      '</div>' +
      '<div class="gap"><button class="btn s g" onclick="decI('+i+',1)">Success</button><button class="btn s r" onclick="decI('+i+',0)">Reject</button></div>' +
      '</div>';
    }).join('') : '<div class="row">কোনো পেন্ডিং উইথড্র নেই।</div>');
  }).catch(aErr);
}

function decDep(i,ok){var d=AD.deps[i];api('admin/dep/'+d._id,'POST',{ok:!!ok},ah()).then(aDep).catch(aErr)}

function aDep(){
  api('admin/dep-list','GET',null,ah()).then(function(d){
    AD.deps = d.pending;
    $('abody').innerHTML = '<h3>অপেক্ষমাণ ডিপোজিট (Real-time & Copy)</h3>' +
    (d.pending.length ? d.pending.map(function(dep, i){
      var timeStr = new Date(dep.at).toLocaleTimeString();
      return '<div class="th">' +
      '<div class="hd"><span>'+esc(dep.name)+'</span><span style="color:var(--gold)">৳'+money(dep.amount)+'</span></div>' +
      '<div style="font-size:13px">' +
      'Method: <b>'+esc(dep.method)+'</b><br>' +
      'TrxID: <b id="depTrx'+i+'">'+esc(dep.txid)+'</b> <button class="admin-copy-btn" onclick="copyAdminText(\\'depTrx'+i+'\\')">Copy Trx</button><br>' +
      'Last 3 Digits: <b>'+esc(dep.lastDigits)+'</b><br>' +
      '<small style="color:var(--mu)">সময়: '+timeStr+' | Order: '+esc(dep.serialNo)+'</small>' +
      '</div>' +
      '<div class="gap"><button class="btn s g" onclick="decDep('+i+',1)">Approve</button><button class="btn s r" onclick="decDep('+i+',0)">Reject</button></div>' +
      '</div>';
    }).join('') : '<div class="row">কোনো পেন্ডিং ডিপোজিট নেই।</div>');
  }).catch(aErr);
}

function copyAdminText(elemId){
  var el = $(elemId);
  if(!el) return;
  navigator.clipboard.writeText(el.innerText).then(function(){
    toast('Copied: ' + el.innerText);
  }).catch(function(){
    toast('Copy failed');
  });
}

function aShopCtrl(){
  api('admin/user-packages','GET',null,ah()).then(function(userPkgs){
    api('admin/promo-packages','GET',null,ah()).then(function(promoPkgs){
      $('abody').innerHTML='<h3>📦 ইউজার কয়েন প্যাকেজ কন্ট্রোল</h3>' +
      '<div class="card" style="margin-bottom:12px">' +
      '<label>প্যাকেজ বিবরণ / নাম</label><input id="upDesc" placeholder="যেমন: Basic RS Coin Package">' +
      '<label>মূল্য (BDT)</label><input id="upPrice" type="number" placeholder="200">' +
      '<label>প্রতি মিনিটে কয়েন</label><input id="upCoins" type="number" placeholder="10">' +
      '<label>প্যাকেজের ছবি আপলোড করুন (গ্যালারি বা প্লাস আইকন)</label>' +
      '<input type="file" id="upFile" accept="image/*" style="display:none" onchange="uploadUserPkgImg(this)">' +
      '<div class="img-upload-btn" onclick="$(\\'upFile\\').click()">➕ গ্যালারি থেকে ছবি যোগ করুন</div>' +
      '<input id="upImgUrl" placeholder="বা সরাসরি ছবির URL" style="margin-top:6px">' +
      '<label>হট অফার (true/false)</label><input id="upHot" placeholder="false">' +
      '<button class="btn g" onclick="addUserPkg()">ইউজার প্যাকেজ যোগ করুন</button>' +
      '</div>' +
      '<h3>বিদ্যমান ইউজার প্যাকেজসমূহ</h3>' +
      (userPkgs.length ? userPkgs.map(p => '<div class="th"><div class="hd"><span>'+esc(p.description)+'</span><span style="color:var(--gold)">৳'+p.price+'</span></div><small>Coins/Min: '+p.coinsPerMin+' | Hot: '+p.hot+'</small><button class="btn s r" style="margin-top:6px" onclick="delUserPkg(\\''+p._id+'\\')">ডিলিট করুন</button></div>').join('') : '<div class="row">কোনো প্যাকেজ নেই।</div>') +
      '<hr style="border-color:var(--line);margin:16px 0">' +
      '<h3>🛍️ আর এস গ্যালারি ও প্রমোশন প্যাকেজ কন্ট্রোল</h3>' +
      '<div class="card" style="margin-bottom:12px">' +
      '<label>প্যাকেজের নাম</label><input id="apTitle" placeholder="যেমন: RS Gallery Shirt Featured">' +
      '<label>ক্যাটাগরি</label><input id="apCat" placeholder="RS Gallery / Social Media">' +
      '<label>পরিমাণ/ফলোয়ার</label><input id="apFol" type="number" placeholder="500">' +
      '<label>মূল্য (BDT)</label><input id="apPrice" type="number" placeholder="150">' +
      '<label>প্যাকেজ পিকচার আপলোড করুন (গ্যালারি থেকে)</label>' +
      '<input type="file" id="apFile" accept="image/*" style="display:none" onchange="uploadPkgImg(this)">' +
      '<div class="img-upload-btn" onclick="$(\\'apFile\\').click()">➕ গ্যালারি থেকে ছবি যুক্ত করুন</div>' +
      '<input id="apIcon" placeholder="বা ছবির URL দিন" style="margin-top:6px">' +
      '<label>বিবরণ</label><input id="apDesc" placeholder="ছোট বিবরণ">' +
      '<button class="btn g" onclick="addPromoPkg()">প্রমোশন প্যাকেজ যোগ করুন</button>' +
      '</div>' +
      '<h3>বিদ্যমান প্যাকেজসমূহ</h3>' +
      (promoPkgs.length ? promoPkgs.map(p => '<div class="th"><div class="hd"><span>'+esc(p.title)+'</span><span style="color:var(--gold)">৳'+p.price+'</span></div><small>Category: '+esc(p.category)+'</small><button class="btn s r" style="margin-top:6px" onclick="delPromoPkg(\\''+p._id+'\\')">ডিলিট করুন</button></div>').join('') : '<div class="row">কোনো প্যাকেজ নেই।</div>');
    }).catch(aErr);
  }).catch(aErr);
}

function uploadUserPkgImg(inp){
  var f = inp.files[0]; if(!f) return;
  var r = new FileReader();
  r.onload = function(){
    $('upImgUrl').value = r.result;
    toast('প্যাকেজ ছবি যুক্ত হয়েছে!');
  };
  r.readAsDataURL(f);
}

function uploadPkgImg(inp){
  var f = inp.files[0]; if(!f) return;
  var r = new FileReader();
  r.onload = function(){
    $('apIcon').value = r.result;
    toast('প্যাকেজ ছবি যুক্ত হয়েছে!');
  };
  r.readAsDataURL(f);
}

function aSliderCtrl(){
  api('admin/sliders','GET',null,ah()).then(function(sliders){
    $('abody').innerHTML='<h3>🖼️ হোম স্লাইডার ও ব্যানার কন্ট্রোল</h3>' +
    '<div class="card" style="margin-bottom:12px">' +
    '<label>মূল শিরোনাম (Title)</label><input id="slTitle" placeholder="যেমন: নামাজের স্মরণ">' +
    '<label>উপ-শিরোনাম (Subtitle)</label><input id="slSub" placeholder="যেমন: নামাজ কি পড়েছেন?">' +
    '<label>বিবরণ (Description)</label><input id="slDesc" placeholder="বিস্তারিত লিখুন">' +
    '<label>কোলাবোরেশন বা এক্সটার্নাল লিংক (URL)</label><input id="slLink" placeholder="https://www.facebook.com/share/...">' +
    '<label>গ্যালারি থেকে ব্যাকগ্রাউন্ড ব্যানার ছবি থিম যোগ করুন</label>' +
    '<input type="file" id="slFile" accept="image/*" style="display:none" onchange="uploadSliderImg(this)">' +
    '<div class="img-upload-btn" onclick="$(\\'slFile\\').click()">➕ প্লাস আইকন (গ্যালারি থেকে ছবি থিম সিলেক্ট করুন)</div>' +
    '<input id="slBgImg" placeholder="বা সরাসরি ছবি URL" style="margin-top:6px">' +
    '<label>ইমোজি বা আইকন</label><input id="slEmoji" placeholder="🛍️">' +
    '<label>পরিবর্তন সময় (স্লাইড টাইমার সেকেন্ডে, যেমন: ৬)</label><input id="slTimer" type="number" value="6">' +
    '<button class="btn g" onclick="addSlider()">স্লাইড ব্যানার যোগ করুন</button>' +
    '</div>' +
    '<h3>সক্রিয় স্লাইডার ব্যানারসমূহ</h3>' +
    (sliders.length ? sliders.map(s => '<div class="th"><div class="hd"><span>'+esc(s.title)+'</span><span style="color:var(--gold)">টাইমার: '+s.timerSeconds+'s</span></div><small>Link: '+esc(s.link)+'</small><button class="btn s r" style="margin-top:6px" onclick="delSlider(\\''+s._id+'\\')">ডিলিট করুন</button></div>').join('') : '<div class="row">কোনো স্লাইডার নেই।</div>');
  }).catch(aErr);
}

function uploadSliderImg(inp){
  var f = inp.files[0]; if(!f) return;
  var r = new FileReader();
  r.onload = function(){
    $('slBgImg').value = r.result;
    toast('স্লাইডার ব্যাকগ্রাউন্ড ছবি থিম হিসেবে সিলেক্ট হয়েছে!');
  };
  r.readAsDataURL(f);
}

function addSlider(){
  api('admin/sliders','POST',{
    title: $('slTitle').value,
    subtitle: $('slSub').value,
    description: $('slDesc').value,
    link: $('slLink').value,
    bgImage: $('slBgImg').value,
    emoji: $('slEmoji').value,
    timerSeconds: $('slTimer').value
  }, ah()).then(() => { toast('স্লাইডার সফলভাবে যোগ হয়েছে!'); aSliderCtrl(); }).catch(aErr);
}

function delSlider(id){
  api('admin/sliders/delete/'+id,'POST',null,ah()).then(() => { toast('স্লাইডার ডিলিট হয়েছে!'); aSliderCtrl(); }).catch(aErr);
}

function addUserPkg(){
  api('admin/user-packages','POST',{
    description: $('upDesc').value,
    price: $('upPrice').value,
    coinsPerMin: $('upCoins').value,
    pkgImage: $('upImgUrl').value,
    hot: $('upHot').value === 'true'
  }, ah()).then(() => { toast('ইউজার প্যাকেজ যোগ হয়েছে!'); aShopCtrl(); }).catch(aErr);
}

function delUserPkg(id){
  api('admin/user-packages/delete/'+id,'POST',null,ah()).then(() => { toast('প্যাকেজ ডিলিট হয়েছে!'); aShopCtrl(); }).catch(aErr);
}

function addPromoPkg(){
  api('admin/promo-packages','POST',{
    title: $('apTitle').value,
    category: $('apCat').value,
    followers: $('apFol').value,
    price: $('apPrice').value,
    description: $('apDesc').value,
    icon: $('apIcon').value
  }, ah()).then(() => { toast('প্রমোশন প্যাকেজ যোগ হয়েছে!'); aShopCtrl(); }).catch(aErr);
}

function delPromoPkg(id){
  api('admin/promo-packages/delete/'+id,'POST',null,ah()).then(() => { toast('প্যাকেজ ডিলিট হয়েছে!'); aShopCtrl(); }).catch(aErr);
}

function aCTask(){
  api('admin/custom-tasks','GET',null,ah()).then(function(tasks){
    $('abody').innerHTML='<h3>অপেক্ষমাণ প্রমোশন টাস্কসমূহ</h3>' +
    (tasks.length ? tasks.map(function(t, i){
      return '<div class="th"><div class="hd"><span>'+esc(t.title)+' ('+esc(t.platform)+')</span><span style="color:var(--gold)">Budget: '+t.totalBudget+' BDT</span></div><div style="font-size:13px">Link: <a href="'+esc(t.link)+'" target="_blank">'+esc(t.link)+'</a><br>Reward/Worker: '+t.reward+' BDT | Target: '+t.targetWorkers+'</div><div class="gap"><button class="btn s g" onclick="decCTask(\\''+t._id+'\\',1)">Approve</button><button class="btn s r" onclick="decCTask(\\''+t._id+'\\',0)">Reject</button></div></div>';
    }).join('') : '<div class="row">কোনো পেন্ডিং প্রমোশন টাস্ক নেই।</div>');
  }).catch(aErr);
}
function decCTask(id, ok){
  api('admin/custom-tasks/'+id,'POST',{ok:!!ok},ah()).then(aCTask).catch(aErr);
}

function repI(i){var t=$('rp'+i).value.trim();if(!t)return;api('admin/reply','POST',{uid:AD.th[i].uid,text:t},ah()).then(aSp).catch(aErr)}
function aSp(){api('admin/support','GET',null,ah()).then(function(d){AD.th=d;
 $('abody').innerHTML=d.length?d.map(function(t,i){return '<div class="th"><div class="hd"><span>'+esc(t.name)+'</span></div><div class="chat" style="max-height:30vh">'+t.msgs.map(function(m){return '<div class="m '+m.from+'">'+esc(m.text)+'</div>'}).join('')+'</div><textarea id="rp'+i+'" rows="2" maxlength="500" placeholder="উত্তর লিখুন"></textarea><button class="btn s" style="margin-top:8px" onclick="repI('+i+')">Send</button></div>'}).join(''):'<div class="row">কোনো মেসেজ নেই</div>'}).catch(aErr)}
function aUs(){api('admin/users','GET',null,ah()).then(function(d){
 $('abody').innerHTML='<h3>অ্যাক্টিভ ইউজার</h3>'+(d.active.map(function(u){return '<div class="row"><div>'+esc(u.name)+' ('+esc(u.role)+')<small>'+esc(u.phone)+'</small></div></div>'}).join('')||'<div class="row">কেউ নেই</div>')}).catch(aErr)}

document.addEventListener('DOMContentLoaded',function(){$('logoL').innerHTML=logo(32);$('logoA').innerHTML=logo(88);$('logoT').innerHTML=logo(40);initG();
 if(REF){$('landing').style.display='none';mode('reg');}
 if(T)api('me').then(enter).catch(function(){$('landing').style.display='block'});else $('landing').style.display='block'});
</script></body></html>`;

app.get('/', (req, res) => res.send(PAGE.replace('__GID__', GID.replace(/[^\w.\-]/g, '')).replace(/__AGE__/g, String(MIN_AGE | 0))));
app.listen(PORT, () => console.log('Server is running on port ' + PORT));
