const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 10000;

const SECRET = process.env.SECRET || crypto.randomBytes(32).toString('hex');
const ADMIN_PASS = process.env.ADMIN_PASSWORD || '';
const GID = process.env.GOOGLE_CLIENT_ID || '';
const OW_KEY = process.env.OFFERWALL_KEY || '';
const OW_SECRET = process.env.OFFERWALL_SECRET || '';
const RATE = Number(process.env.BDT_PER_USD) || 120;

const TW_SECRET = process.env.TIMEWALL_SECRET || '';
const TW_RATE = Number(process.env.TIMEWALL_RATE) || 65;
const TW_URL = process.env.TIMEWALL_URL || '';
const TW_IP_CHECK = false;
const TW_IPS = ['18.156.132.55', '51.81.120.73', '142.111.248.18'];

// Deposit Personal Number
const DEPOSIT_NUMBER = '01951639460';

// 8 Ring/Package System Definition
const PACKAGES = [
  { id: 1, name: 'Ring Package 1', price: 300, return: 360, duration: 7 },
  { id: 2, name: 'Ring Package 2', price: 600, return: 750, duration: 7 },
  { id: 3, name: 'Ring Package 3', price: 1200, return: 1560, duration: 10 },
  { id: 4, name: 'Ring Package 4', price: 2500, return: 3375, duration: 10 },
  { id: 5, name: 'Ring Package 5', price: 5000, return: 7000, duration: 15 },
  { id: 6, name: 'Ring Package 6', price: 10000, return: 14500, duration: 15 },
  { id: 7, name: 'Ring Package 7', price: 20000, return: 30000, duration: 20 },
  { id: 8, name: 'Ring Package 8', price: 50000, return: 80000, duration: 30 }
];

const MIN_AGE = 18;
const CO = {
  n: 'RS Growth Matrix', e: 'omg218063@gmail.com', p: '01764024069', y: 2026,
  tg: 'rkrana33', wa: '8801764024069', fb: 'https://www.facebook.com/share/1CAK8sYqDw/', age: MIN_AGE,
  d: 'RS Growth Matrix একটি টাস্কভিত্তিক রিওয়ার্ড প্ল্যাটফর্ম। এখানে সহজ টাস্ক, দৈনিক বোনাস ও লাকি ড্রয়ের মাধ্যমে ব্যালেন্স জমিয়ে bKash বা Nagad-এ উত্তোলন করা যায়। টাস্কের টাকা আমাদের পার্টনার নেটওয়ার্ক থেকে আসে এবং যাচাই শেষে সফল হলে ব্যালেন্সে যোগ হয়। সাথে আছে ইসলামিক নাম, দোয়া ও হাদিসের একটি বই।'
};

const REF_BONUS = 10, DAILY = 2, CHECKIN = 4, MIN_WD = 300, MAX_WD = 5000, SLOTS = 50;
const PENDING_HOURS = 48;
const LATE_CREDIT = true;
const SPIN = [[1, 40], [2, 30], [3, 20], [5, 10]];
const MAX_USD = 5;
const COUNTRY_FILTER = true;
const TARGETS = ['BD', 'IN', 'PK', 'NP'];
const BLOCK_CATS = ['signup', 'signups', 'deposit', 'deposits', 'creditcard', 'creditcards', 'oneclick', 'multireward', 'freetrial', 'freetrials', 'shopping', 'extension', 'extensions'];
app.use(express.json({ limit: '100kb' }));

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
  balance: { type: Number, default: 0 }, earned: { type: Number, default: 0 },
  refCode: { type: String, unique: true }, refBy: String,
  refEarn: { type: Number, default: 0 }, refCount: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  lastDaily: { type: Number, default: 0 }, lastCheckin: String, lastSpin: { type: Number, default: 0 }, lastSeen: Number, created: { type: Date, default: Date.now }
}));
const Click = mongoose.model('Click', new mongoose.Schema({ uid: String, offerId: String, title: String, icon: String, bdt: Number, status: { type: String, default: 'pending' }, at: { type: Date, default: Date.now }, doneAt: Number }));
const Conv = mongoose.model('Conv', new mongoose.Schema({ key: { type: String, unique: true }, uid: String, tx: String, bdt: Number, status: String, at: { type: Date, default: Date.now } }));
const Wd = mongoose.model('Wd', new mongoose.Schema({ uid: String, name: String, amount: Number, method: String, phone: String, status: { type: String, default: 'pending' }, at: { type: Date, default: Date.now } }));
const Deposit = mongoose.model('Deposit', new mongoose.Schema({ uid: String, name: String, amount: Number, method: String, txid: String, lastDigits: String, status: { type: String, default: 'pending' }, at: { type: Date, default: Date.now } }));
const UserPackage = mongoose.model('UserPackage', new mongoose.Schema({ uid: String, packageId: Number, name: String, price: Number, status: { type: String, default: 'active' }, at: { type: Date, default: Date.now } }));
const Msg = mongoose.model('Msg', new mongoose.Schema({ uid: String, name: String, from: String, text: String, at: { type: Date, default: Date.now } }));

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
const credit = (id, n) => User.updateOne({ _id: id }, { $inc: { balance: n, earned: n } });
const partners = () => [OW_KEY && OW_SECRET ? 'offerwall.gg' : '', TW_SECRET && TW_URL ? 'TimeWall.io (Australian Clearing Pty Ltd)' : ''].filter(Boolean);
const me = u => ({ name: u.name, phone: u.phone || '', email: u.email || '', av: u.avatar || '', balance: u.balance, earned: u.earned, refCode: u.refCode, refEarn: u.refEarn, refCount: u.refCount, lastDaily: u.lastDaily, lastSpin: u.lastSpin || 0, checkedIn: u.lastCheckin === today(), d: DAILY, c: CHECKIN, tc: TARGETS, ct: CO, pt: partners() });
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

app.post('/api/register', h(async (q, s) => {
  const { name, phone, password, confirm, ref } = q.body || {};
  const n = String(name || '').trim();
  if (n.length < 3 || n.length > 30) return bad(s, 'Name must be 3 to 30 characters.');
  if (!/^01\d{9}$/.test(String(phone || ''))) return bad(s, 'Enter a valid 11-digit phone number.');
  if (String(password || '').length < 6) return bad(s, 'Password must be at least 6 characters.');
  if (password !== confirm) return bad(s, 'Passwords do not match.');
  if (await User.exists({ nameKey: n.toLowerCase() })) return bad(s, 'This name is already taken.');
  const salt = crypto.randomBytes(16).toString('hex');
  const u = await newUser({ name: n, nameKey: n.toLowerCase(), phone, salt, hash: hashPw(password, salt) }, ref);
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
  if (!u) u = await newUser({ name: (g.name || g.email.split('@')[0]).slice(0, 30), email: g.email }, (q.body || {}).ref);
  s.json({ token: sign(u.id), me: me(u) });
}));

app.get('/api/me', auth, (q, s) => s.json(me(q.user)));

app.post('/api/avatar', auth, h(async (q, s) => {
  const img = String((q.body || {}).img || '');
  if (img.length > 30000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(img)) return bad(s, 'Photo is invalid or too large. Try another photo.');
  await User.updateOne({ _id: q.user.id }, { avatar: img });
  s.json({ av: img });
}));

app.get('/api/names/:t', auth, (q, s) => s.json(q.params.t === 'girls' ? NAMES.girls : NAMES.boys));

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
  if (!OW_KEY || !OW_SECRET) return [];
  const r = await fetch('https://offerwall.gg/api/v1/offers?appId=' + OW_KEY + '&userId=' + encodeURIComponent(uid) + '&limit=100', { headers: { 'X-Api-Key': OW_SECRET } });
  const j = await r.json();
  const arr = Array.isArray(j) ? j : ((j.data && j.data.offers) || j.offers || (Array.isArray(j.data) ? j.data : []));
  let l = arr.map(o => {
    const coins = +pick(o, ['currencyAmount', 'rewardAmount', 'reward', 'coins', 'amount', 'payout']) || 0;
    return {
      id: String(pick(o, ['id', 'offerId']) || ''), title: String(pick(o, ['name', 'title', 'offerName']) || 'Offer').slice(0, 80),
      icon: String(pick(o, ['iconUrl', 'icon', 'imageUrl', 'image', 'thumbnail']) || ''), clickUrl: pick(o, ['clickUrl', 'url']),
      desc: String(o.description || '').slice(0, 300), req: String(o.requirements || '').slice(0, 300),
      usd: coins / 100, bdt: bdtFor(coins / 100),
      cats: arrOf(o.categories).map(c => String(c).toLowerCase().replace(/[^a-z]/g, '')),
      cnt: arrOf(o.countries).map(c => String(c).toUpperCase()),
      dev: arrOf(o.devices)
    };
  }).filter(o => o.id && o.clickUrl);
  if (dbg) {
    dbg.total = l.length; dbg.cn = {};
    l.forEach(o => (o.cnt.length ? o.cnt : ['ALL']).forEach(c => { dbg.cn[c] = (dbg.cn[c] || 0) + 1; }));
  }
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
    if (used.length >= SLOTS) return bad(s, 'Daily task limit reached. New tasks arrive after 24 hours.');
    await Click.create({ uid: q.user.id, offerId: o.id, title: o.title, icon: o.icon, bdt: o.bdt });
  }
  s.json({ url: o.clickUrl });
}));

app.get('/api/offerwall', h(async (q, s) => {
  const { user, tx, amount, status, offerId, offer, test, sig } = q.query;
  if (!OW_SECRET || !user || !tx || amount == null || !sig) return bad(s, 'bad request', 400);
  const exp = crypto.createHmac('sha256', OW_SECRET).update(user + ':' + tx + ':' + amount).digest('hex');
  if (!same(String(sig), exp)) return bad(s, 'invalid signature', 403);
  if (test === '1') return s.send('ok');
  const coins = +amount;
  if (!isFinite(coins) || !mongoose.isValidObjectId(user)) return s.send('ok');
  const neg = coins < 0 || status === 'reversed';
  const bdt = bdtFor(Math.abs(coins) / 100);
  const oid = String(offerId || tx);
  if (!neg && !LATE_CREDIT && await Click.exists({ uid: user, offerId: oid, status: 'expired' })) return s.send('ok');
  try { await Conv.create({ key: tx + ':' + (neg ? 'rev' : 'cr'), uid: user, tx, bdt: neg ? -bdt : bdt, status: neg ? 'reversed' : 'credited' }); }
  catch (e) { if (e.code === 11000) return s.send('ok'); throw e; }
  if (!(await User.exists({ _id: user }))) return s.send('ok');
  if (neg) {
    await User.updateOne({ _id: user }, { $inc: { balance: -bdt, earned: -bdt } });
    await Click.findOneAndUpdate({ uid: user, offerId: oid, status: { $in: ['success', 'pending'] } }, { status: 'cancelled' });
  } else {
    await credit(user, bdt);
    const c = await Click.findOneAndUpdate({ uid: user, offerId: oid, status: 'pending' }, { $set: { status: 'success', doneAt: Date.now(), bdt } });
    if (!c) await Click.create({ uid: user, offerId: oid, title: String(offer || 'Task').slice(0, 80), bdt, status: 'success', doneAt: Date.now() });
  }
  s.send('ok');
}));

app.get('/api/callback/timewall', h(async (q, s) => {
  const uid = String(q.query.userID || q.query.userid || ''), tx = String(q.query.txid || '');
  const rev = String(q.query.revenue == null ? '' : q.query.revenue), hs = String(q.query.hash || '').toLowerCase();
  if (!TW_SECRET || !uid || !tx || rev === '' || !hs) return bad(s, 'bad request', 400);
  if (TW_IP_CHECK) {
    const ip = String(q.headers['x-forwarded-for'] || q.ip || '').split(',')[0].trim();
    if (!TW_IPS.includes(ip)) { console.error('TimeWall blocked IP:', ip); return bad(s, 'forbidden', 403); }
  }
  const exp = crypto.createHash('sha256').update(uid + rev + TW_SECRET).digest('hex');
  if (!same(hs, exp)) { console.error('TimeWall invalid hash for tx', tx); return bad(s, 'invalid hash', 403); }
  const usd = +rev;
  if (!isFinite(usd) || !mongoose.isValidObjectId(uid)) return s.send('ok');
  const type = String(q.query.type || '');
  const neg = usd < 0 || /charge|revers|refund/i.test(type);
  const bdt = Math.round(Math.abs(usd) * TW_RATE * 1e4) / 1e4;
  try { await Conv.create({ key: 'tw:' + tx + ':' + (neg ? 'rev' : 'cr'), uid, tx, bdt: neg ? -bdt : bdt, status: neg ? 'reversed' : 'credited' }); }
  catch (e) { if (e.code === 11000) return s.send('ok'); throw e; }
  if (!(await User.exists({ _id: uid }))) return s.send('ok');
  const title = String(q.query.offername || 'TimeWall task').slice(0, 80);
  if (neg) {
    await User.updateOne({ _id: uid }, { $inc: { balance: -bdt, earned: -bdt } });
    await Click.updateOne({ uid, offerId: 'tw:' + tx }, { status: 'cancelled' });
  } else {
    await credit(uid, bdt);
    await Click.create({ uid, offerId: 'tw:' + tx, title, bdt, status: 'success', doneAt: Date.now() });
  }
  s.send('ok');
}));

app.get('/api/timewall', auth, (q, s) => s.json({ url: TW_URL ? TW_URL.replace(/\{uid\}/g, encodeURIComponent(q.user.id)) : '' }));

app.post('/api/daily', auth, h(async (q, s) => {
  const r = await User.findOneAndUpdate({ _id: q.user.id, lastDaily: { $lte: Date.now() - 864e5 } }, { $set: { lastDaily: Date.now() }, $inc: { balance: DAILY, earned: DAILY } }, { new: true });
  if (!r) return bad(s, 'You already claimed today. Come back in 24 hours.');
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
  const u = await User.findOneAndUpdate({ _id: q.user.id, $or: [{ lastSpin: { $exists: false } }, { lastSpin: { $lte: Date.now() - 864e5 } }] }, { $set: { lastSpin: Date.now() }, $inc: { balance: prize, earned: prize } }, { new: true });
  if (!u) return bad(s, 'You already spun today. Come back in 24 hours.');
  s.json({ prize, me: me(u) });
}));

app.get('/api/leaderboard', auth, h(async (q, s) => {
  const realTop = await User.find({ earned: { $gt: 0 } }).sort({ earned: -1 }).limit(20).select('name earned');
  const demoNames = ['Tanvir Ahmed', 'Rakibul Islam', 'Sumaiya Akter', 'Farhan Hossain', 'Nusrat Jahan', 'Mehedi Hasan', 'Ayesha Siddika', 'Imran Khan', 'Sadia Afrin', 'Nazmul Huda'];
  let demoTop = [];
  let baseEarn = 45000;
  for (let i = 0; i < 100; i++) {
    demoTop.push({
      name: i === 0 ? '👑 Al-Amin (Top 1)' : (i === 1 ? '⭐ Shanto Mahmud (Top 2)' : (demoNames[i % demoNames.length] + ' ' + (i + 1))),
      earned: Math.max(1000, baseEarn - (i * 400))
    });
  }
  let combined = realTop.map(u => ({ name: u.name, earned: u.earned })).concat(demoTop);
  combined.sort((a, b) => b.earned - a.earned);
  s.json(combined.slice(0, 100));
}));

// Deposit Route with Provided Number
app.get('/api/deposit-info', auth, (q, s) => {
  s.json({ number: DEPOSIT_NUMBER, methods: ['bKash', 'Nagad'] });
});

app.post('/api/deposit', auth, h(async (q, s) => {
  const { amount, method, txid, lastDigits } = q.body || {};
  const a = Math.floor(+amount);
  if (!a || a <= 0) return bad(s, 'Invalid amount.');
  if (!['bKash', 'Nagad'].includes(method)) return bad(s, 'Choose bKash or Nagad.');
  if (!txid) return bad(s, 'Enter transaction ID (TrxID).');
  
  const dep = await Deposit.create({ uid: q.user.id, name: q.user.name, amount: a, method, txid, lastDigits });
  s.json({ success: true, message: 'Deposit request submitted successfully to ' + DEPOSIT_NUMBER, depId: dep._id });
}));

// 8 Ring Packages API Endpoints
app.get('/api/packages', auth, (q, s) => {
  s.json(PACKAGES);
});

app.post('/api/packages/buy', auth, h(async (q, s) => {
  const { packageId } = q.body || {};
  const pkg = PACKAGES.find(p => p.id === Number(packageId));
  if (!pkg) return bad(s, 'Package not found.');

  const r = await User.findOneAndUpdate(
    { _id: q.user.id, balance: { $gte: pkg.price } },
    { $inc: { balance: -pkg.price } },
    { new: true }
  );
  if (!r) return bad(s, 'Insufficient balance to buy this package.');

  const userPkg = await UserPackage.create({ uid: q.user.id, packageId: pkg.id, name: pkg.name, price: pkg.price });
  s.json({ success: true, message: pkg.name + ' activated successfully!', balance: r.balance, userPkgId: userPkg._id });
}));

app.post('/api/withdraw', auth, h(async (q, s) => {
  const { amount, method, phone } = q.body || {};
  const a = Math.floor(+amount);
  if (!(a >= MIN_WD && a <= MAX_WD)) return bad(s, 'Withdraw amount must be between ' + MIN_WD + ' and ' + MAX_WD + '.');
  if (!['bKash', 'Nagad'].includes(method)) return bad(s, 'Choose bKash or Nagad.');
  if (!/^01\d{9}$/.test(String(phone || ''))) return bad(s, 'Enter a valid 11-digit number.');
  const r = await User.findOneAndUpdate({ _id: q.user.id, balance: { $gte: a } }, { $inc: { balance: -a } }, { new: true });
  if (!r) return bad(s, 'Insufficient balance.');
  const wd = await Wd.create({ uid: q.user.id, name: r.name, amount: a, method, phone });
  s.json({ success: true, balance: r.balance, wdId: wd._id });
}));

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
