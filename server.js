const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 10000;

// ❤️ নিচের ৬টা জিনিস কোডে কিছু লিখতে হবে না। Render → Environment এ এই নামগুলো দিয়ে বসান:
// ❤️ SECRET = যেকোনো লম্বা গোপন লেখা (ইউজারের লগইন সুরক্ষিত রাখে)
const SECRET = process.env.SECRET || crypto.randomBytes(32).toString('hex');
// ❤️ ADMIN_PASSWORD = আপনার নিজের এডমিন পাসওয়ার্ড (Render Environment এ দিন, এখানে লিখবেন না)
const ADMIN_PASS = process.env.ADMIN_PASSWORD || '';
// ❤️ GOOGLE_CLIENT_ID = Google Cloud Console থেকে পাওয়া Client ID (Render Environment এ দিন)
const GID = process.env.GOOGLE_CLIENT_ID || '';
// ❤️ OFFERWALL_KEY = অফারওয়ালের Public key (Render Environment এ দিন)
const OW_KEY = process.env.OFFERWALL_KEY || '';
// ❤️ OFFERWALL_SECRET = অফারওয়ালের নতুন Secret key (Render Environment এ দিন, কাউকে দেখাবেন না)
const OW_SECRET = process.env.OFFERWALL_SECRET || '';
// ❤️ BDT_PER_USD = ১ ডলারের কত টাকা ধরবেন। কিছু না দিলে ১২০ ধরা হবে (Render Environment এ দিতে পারেন)
const RATE = Number(process.env.BDT_PER_USD) || 120;

// ❤️ নিচের সংখ্যাগুলো আপনি এখানেই বদলাতে পারবেন:
// ❤️ REF_BONUS = রেফার বোনাস (টাকা), DAILY = Login Bonus (এখন ২ টাকা), CHECKIN = Check-in Bonus (এখন ৪ টাকা)
// ❤️ MIN_WD / MAX_WD = উইথড্রের সর্বনিম্ন ও সর্বোচ্চ টাকা, SLOTS = প্রতিদিন কয়টা টাস্ক দেখাবে
const REF_BONUS = 10, DAILY = 2, CHECKIN = 4, MIN_WD = 300, MAX_WD = 5000, SLOTS = 50;
// ❤️ PENDING_HOURS = কত ঘণ্টা পেন্ডিং থাকলে টাস্ক তালিকা থেকে সরে যাবে (এখন ৪৮ ঘণ্টা)
const PENDING_HOURS = 48;
// ❤️ LATE_CREDIT = true হলে ৪৮ ঘণ্টা পরেও অফারওয়াল টাকা পাঠালে ইউজারকে দেওয়া হবে (বিজ্ঞাপনদাতা আপনাকে টাকা দিয়েছে বলে)। না দিতে চাইলে false করুন।
const LATE_CREDIT = true;
// ❤️ SPIN = লাকি ড্রয়ের সত্যিকারের পুরস্কার। প্রতিটা [টাকা, সম্ভাবনার ভাগ]। এখন: ১ টাকা ৪০%, ২ টাকা ৩০%, ৩ টাকা ২০%, ৫ টাকা ১০%।
const SPIN = [[1, 40], [2, 30], [3, 20], [5, 10]];
// ❤️ MAX_USD = এর চেয়ে বড় (ডলারে) অফার ইউজারকে দেখানো হবে না। টাস্ক কম এলে এটা বাড়ান (যেমন 20)।
const MAX_USD = 5;
// ❤️ COUNTRY_FILTER = true হলে শুধু TARGET_COUNTRY (বাংলাদেশ = BD) অথবা সব দেশের জন্য খোলা অফার আসবে।
// ❤️ টাস্ক একদম না এলে সাময়িক false করে দেখতে পারেন, কিন্তু US-only অফার বাংলাদেশ থেকে করলে টাকা আসে না।
const COUNTRY_FILTER = true;
const TARGET_COUNTRY = 'BD';
// ❤️ এই ধরনের অফার কোড নিজেই লুকিয়ে ফেলবে (অফারওয়ালের Blocked categories এর পাশাপাশি)
const BLOCK_CATS = ['signup', 'signups', 'deposit', 'deposits', 'creditcard', 'creditcards', 'oneclick', 'multireward', 'freetrial', 'freetrials', 'shopping', 'extension', 'extensions'];
app.use(express.json({ limit: '100kb' }));

// ❤️ MONGO_URI = আপনার ডাটাবেসের লিংক। এটা আগে থেকেই Render Environment এ আছে, আবার দিতে হবে না।
if (!process.env.MONGO_URI) console.error('MONGO_URI is not set: accounts cannot be saved.');
else mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected');
  // পুরনো ভুল ইনডেক্স ঠিক করে নেয় (রেজিস্ট্রেশনে Server error হওয়ার কারণ এটাই হতে পারে)
  try { await User.syncIndexes(); console.log('User indexes synced'); } catch (e) { console.error('Index sync error:', e.message); }
}).catch(e => console.error('MongoDB error:', e.message));

const User = mongoose.model('User', new mongoose.Schema({
  name: String, nameKey: { type: String, unique: true, sparse: true }, phone: String,
  email: { type: String, unique: true, sparse: true }, hash: String, salt: String,
  balance: { type: Number, default: 0 }, earned: { type: Number, default: 0 },
  refCode: { type: String, unique: true }, refBy: String,
  refEarn: { type: Number, default: 0 }, refCount: { type: Number, default: 0 },
  lastDaily: { type: Number, default: 0 }, lastCheckin: String, lastSpin: { type: Number, default: 0 }, lastSeen: Number, created: { type: Date, default: Date.now }
}));
const Click = mongoose.model('Click', new mongoose.Schema({ uid: String, offerId: String, title: String, icon: String, bdt: Number, status: { type: String, default: 'pending' }, at: { type: Date, default: Date.now }, doneAt: Number }));
const Conv = mongoose.model('Conv', new mongoose.Schema({ key: { type: String, unique: true }, uid: String, tx: String, bdt: Number, status: String, at: { type: Date, default: Date.now } }));
const Wd = mongoose.model('Wd', new mongoose.Schema({ uid: String, name: String, amount: Number, method: String, phone: String, status: { type: String, default: 'pending' }, at: { type: Date, default: Date.now } }));
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
// "আজ" মানে বাংলাদেশ সময় (UTC+6) অনুযায়ী রাত ১২টা থেকে। অ্যাডমিন প্যানেলের "আজকের" হিসাব এটা দিয়ে হয়।
const dayStart = () => { const o = 6 * 36e5, n = Date.now() + o; return new Date(n - (n % 864e5) - o); };
const credit = (id, n) => User.updateOne({ _id: id }, { $inc: { balance: n, earned: n } });
const me = u => ({ name: u.name, phone: u.phone || '', email: u.email || '', balance: u.balance, earned: u.earned, refCode: u.refCode, refEarn: u.refEarn, refCount: u.refCount, lastDaily: u.lastDaily, lastSpin: u.lastSpin || 0, checkedIn: u.lastCheckin === today(), d: DAILY, c: CHECKIN });
// ❤️ নিচের লাইনে ইউজারের ভাগ ঠিক করা আছে: ১ ডলারের বেশি হলে ০.৫ (৫০%), ১ ডলার বা কম হলে ০.৭ (৭০%)। বদলাতে চাইলে এই দুটো সংখ্যা বদলান।
const bdtFor = usd => Math.round(usd * RATE * (usd > 1 ? 0.5 : 0.7) * 100) / 100;
// ❤️ ৪৮ ঘণ্টার বেশি পেন্ডিং থাকা টাস্ক "expired" হয়ে তালিকা থেকে সরে যায়।
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

// ---------- Offerwall ----------
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
  l = l.filter(o => !COUNTRY_FILTER || !o.cnt.length || o.cnt.includes(TARGET_COUNTRY)); if (dbg) dbg.country = l.length;
  l = l.filter(o => !ctx.device || devOk(o.dev, ctx.device)); if (dbg) dbg.device = l.length;
  return l;
}

app.get('/api/offers', auth, h(async (q, s) => {
  await expire(q.user.id);
  const now = Date.now(), day = 864e5;
  const clicks = await Click.find({ uid: q.user.id });
  const used = clicks.filter(c => c.status === 'pending' || (c.status === 'success' && c.doneAt > now - day));
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
  const used = clicks.filter(c => c.status === 'pending' || (c.status === 'success' && c.doneAt > now - 864e5));
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

// ❤️ এই অংশে কিছু বদলাতে হবে না। অফারওয়াল টাস্ক শেষ হলে নিজে এই ঠিকানায় খবর পাঠায় (Postback)।
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

// ---------- Rewards, ranking, withdraw, support ----------
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

// ❤️ লাকি ড্র: সার্ভারে র‍্যান্ডম পুরস্কার ঠিক হয়, ২৪ ঘণ্টায় একবার।
app.post('/api/spin', auth, h(async (q, s) => {
  const tot = SPIN.reduce((a, x) => a + x[1], 0);
  let r = crypto.randomInt(tot), prize = SPIN[0][0];
  for (const x of SPIN) { if (r < x[1]) { prize = x[0]; break; } r -= x[1]; }
  const u = await User.findOneAndUpdate({ _id: q.user.id, $or: [{ lastSpin: { $exists: false } }, { lastSpin: { $lte: Date.now() - 864e5 } }] }, { $set: { lastSpin: Date.now() }, $inc: { balance: prize, earned: prize } }, { new: true });
  if (!u) return bad(s, 'You already spun today. Come back in 24 hours.');
  s.json({ prize, me: me(u) });
}));

app.get('/api/leaderboard', auth, h(async (q, s) => {
  const top = await User.find({ earned: { $gt: 0 } }).sort({ earned: -1 }).limit(20).select('name earned');
  s.json(top.map(u => ({ name: u.name, earned: u.earned })));
}));

app.post('/api/withdraw', auth, h(async (q, s) => {
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

app.get('/api/support', auth, h(async (q, s) => s.json(await Msg.find({ uid: q.user.id }).sort({ at: 1 }).limit(100))));
app.post('/api/support', auth, h(async (q, s) => {
  const text = String((q.body || {}).text || '').trim().slice(0, 500);
  if (!text) return bad(s, 'Write your message first.');
  await Msg.create({ uid: q.user.id, name: q.user.name, from: 'user', text });
  s.json({ ok: true });
}));

// ---------- Admin ----------
app.get('/api/admin/data', admin, h(async (q, s) => {
  await expire();
  const start = dayStart();
  const sum = async (M, match, f) => { const r = await M.aggregate([{ $match: match }, { $group: { _id: null, t: { $sum: '$' + f } } }]); return r.length ? r[0].t : 0; };
  s.json({
    stats: {
      users: await User.countDocuments(), active: await User.countDocuments({ lastSeen: { $gte: start.getTime() } }),
      newToday: await User.countDocuments({ created: { $gte: start } }),
      pending: await Click.countDocuments({ status: 'pending' }), success: await Click.countDocuments({ status: 'success' }), cancelled: await Click.countDocuments({ status: { $in: ['cancelled', 'expired'] } }),
      today: await sum(Conv, { at: { $gte: start } }, 'bdt'), balance: await sum(User, {}, 'balance'),
      wdPending: await Wd.countDocuments({ status: 'pending' }), wdPendingSum: await sum(Wd, { status: 'pending' }, 'amount'),
      wdToday: await Wd.countDocuments({ at: { $gte: start } })
    }
  });
}));
app.get('/api/admin/wd-list', admin, h(async (q, s) => {
  const pending = await Wd.find({ status: 'pending' }).sort({ at: 1 }).limit(100);
  const done = await Wd.find({ status: { $ne: 'pending' } }).sort({ at: -1 }).limit(20);
  s.json({ pending, done });
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
  const act = await User.find({ lastSeen: { $gte: st.getTime() } }).sort({ lastSeen: -1 }).limit(200).select('name phone email lastSeen balance earned');
  const ag = await Conv.aggregate([{ $match: { at: { $gte: st } } }, { $group: { _id: '$uid', t: { $sum: '$bdt' } } }]);
  const em = {}; ag.forEach(x => { em[x._id] = x.t; });
  const ids = ag.map(x => x._id).filter(x => mongoose.isValidObjectId(x));
  const eu = ids.length ? await User.find({ _id: { $in: ids } }).select('name phone email') : [];
  const earners = eu.map(u => ({ name: u.name, phone: u.phone || u.email || '', t: em[String(u._id)] || 0 })).sort((a, b) => b.t - a.t);
  const top = await User.find({ earned: { $gt: 0 } }).sort({ earned: -1 }).limit(30).select('name phone email earned balance');
  s.json({
    newToday: await User.countDocuments({ created: { $gte: st } }),
    active: act.map(u => ({ name: u.name, phone: u.phone || u.email || '', seen: u.lastSeen, balance: u.balance, today: em[String(u._id)] || 0 })),
    earners,
    top: top.map(u => ({ name: u.name, phone: u.phone || u.email || '', earned: u.earned, balance: u.balance }))
  });
}));
app.post('/api/admin/wd/:id', admin, h(async (q, s) => {
  const x = await Wd.findOneAndUpdate({ _id: q.params.id, status: 'pending' }, { status: q.body.ok ? 'paid' : 'rejected' });
  if (x && !q.body.ok) await User.updateOne({ _id: x.uid }, { $inc: { balance: x.amount } });
  s.json({ ok: true });
}));
app.post('/api/admin/reply', admin, h(async (q, s) => {
  const u = await User.findById(q.body.uid);
  if (u && q.body.text) await Msg.create({ uid: u.id, name: u.name, from: 'support', text: String(q.body.text).slice(0, 500) });
  s.json({ ok: true });
}));
app.get('/api/admin/offers-raw', admin, h(async (q, s) => {
  if (!OW_KEY || !OW_SECRET) return s.json({ text: 'OFFERWALL_KEY or OFFERWALL_SECRET is not set in Environment.' });
  const dbg = {};
  await fetchOffers('admin-test', ctxOf(q), dbg);
  const cs = Object.entries(dbg.cn || {}).sort((a, b) => b[1] - a[1]).slice(0, 10).map(x => x[0] + ':' + x[1]).join(', ');
  s.json({ text: 'Offers from offerwall: ' + dbg.total + '\nCountries (offers per country): ' + cs + '\n\nAfter price limit ($' + MAX_USD + '): ' + dbg.price + '\nAfter category block: ' + dbg.cat + '\nAfter country filter (' + TARGET_COUNTRY + '): ' + dbg.country + '\nShown to user (after device filter): ' + dbg.device });
}));

const PAGE = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>RS Growth Matrix</title>
<script src="https://accounts.google.com/gsi/client" async defer></script>
<style>
:root{--bg:#060913;--card:#0f172a;--line:#1e293b;--tx:#f8fafc;--mu:#94a3b8;--gold:#fbbf24;--grn:#22c55e;--blu:#38bdf8;--red:#ef4444}
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif}
body{background:var(--bg);color:var(--tx);display:flex;justify-content:center;min-height:100vh;padding:8px}
.app{width:100%;max-width:440px;background:var(--card);border:1px solid var(--line);border-radius:26px;height:96vh;display:flex;flex-direction:column;overflow:hidden;position:relative}
#auth{position:absolute;inset:0;z-index:50;background:radial-gradient(circle at top,#1e1b4b,#060913 70%);padding:22px;overflow-y:auto;text-align:center;display:none}
.card{background:rgba(15,23,42,.92);border:1px solid rgba(251,191,36,.3);border-radius:18px;padding:16px;text-align:left}
.brand{font-family:Georgia,serif;font-size:24px;font-weight:700;color:var(--gold);margin:6px 0 2px;letter-spacing:.5px}
.sub{font-size:12px;color:var(--mu);margin-bottom:14px}
.seg{display:flex;background:var(--bg);border-radius:10px;padding:3px;margin-bottom:12px}
.seg div{flex:1;text-align:center;padding:8px;font-size:12px;font-weight:700;border-radius:8px;color:var(--mu);cursor:pointer}
.seg .on{background:linear-gradient(90deg,var(--gold),#f59e0b);color:#000}
label{font-size:11px;color:var(--mu);display:block;margin-top:9px}
input,select,textarea{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:11px;color:#fff;font-size:14px;margin-top:4px}
input:focus,select:focus,textarea:focus,button:focus-visible{outline:2px solid var(--gold)}
.btn{width:100%;border:0;border-radius:12px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;margin-top:12px;background:linear-gradient(90deg,var(--gold),#f59e0b);color:#000}
.btn.g{background:var(--grn);color:#fff}.btn.r{background:var(--red);color:#fff}.btn.s{width:auto;padding:6px 12px;font-size:12px;margin:0;border-radius:14px}
.or{font-size:11px;color:var(--mu);margin:14px 0 8px;text-align:center}
.top{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#131d38,#0f172a)}
.top .l{display:flex;align-items:center;gap:10px}.top b{font-size:14px}.bal{text-align:right;font-size:17px;font-weight:800;color:var(--grn)}.bal small{display:block;font-size:10px;color:var(--mu);font-weight:400}
nav{display:flex;border-bottom:1px solid var(--line);background:#0b1224}
nav div{flex:1;text-align:center;font-size:10px;color:var(--mu);padding:8px 0;cursor:pointer;border-bottom:2px solid transparent}
nav div i{display:block;font-style:normal;font-size:16px}nav .on{color:var(--gold);border-color:var(--gold)}
nav #n_book{color:var(--gold);font-weight:700}
nav #n_book i{font-size:19px;animation:glow 2.2s ease-in-out infinite}
@keyframes glow{50%{transform:scale(1.18);filter:drop-shadow(0 0 7px #fbbf24)}}
main{flex:1;overflow-y:auto;padding:14px}
.row{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px}
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
.chip.approved,.chip.paid{color:var(--grn)}.chip.rejected,.chip.cancelled{color:var(--red)}
.share{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.share a,.share button{display:block;text-align:center;background:#1e293b;border:1px solid var(--line);border-radius:10px;padding:10px;font-size:12px;color:var(--tx);text-decoration:none;cursor:pointer}
.chat{max-height:46vh;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin-bottom:10px}
.m{padding:8px 12px;border-radius:12px;font-size:13px;max-width:85%}.m.user{background:#1e293b;align-self:flex-end}.m.support{background:#172554;color:var(--blu);align-self:flex-start}
.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:130;align-items:center;justify-content:center;padding:14px}
.modal>div{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;width:100%;max-width:410px;max-height:90vh;overflow-y:auto}
pre{white-space:pre-wrap;word-break:break-all;font-size:11px;color:#e2e8f0;line-height:1.5;margin:8px 0}
.err{color:var(--red);font-size:12px;margin-top:8px;min-height:14px}
.mq{overflow:hidden;white-space:nowrap;border-radius:14px;background:linear-gradient(90deg,#2b1f04,#4a3508,#2b1f04);border:1px solid rgba(251,191,36,.55);box-shadow:0 0 14px rgba(251,191,36,.18);padding:10px 0;margin-bottom:12px}
.mq span{display:inline-block;padding-left:100%;animation:mq 26s linear infinite;color:var(--gold);font-size:12.5px;font-weight:700;letter-spacing:.2px}
.mq.u{background:#101a33;border-color:rgba(56,189,248,.4);box-shadow:none;padding:8px 0}
.mq.u span{color:#bae6fd;text-decoration:underline;font-size:12px;animation-duration:36s}
@keyframes mq{to{transform:translateX(-100%)}}
.ar{font-size:20px;line-height:2.1;direction:rtl;text-align:right;color:var(--gold);font-family:'Amiri','Traditional Arabic',serif;margin:6px 0}
.bkc{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px;font-size:13px;line-height:1.7}
.bkc b{color:var(--gold)}.bkc small{display:block;color:var(--mu);font-size:11px;margin-top:4px}
.bkh{text-align:center;margin-bottom:14px;border-radius:20px;padding:10px;border:1px solid rgba(251,191,36,.45);background:linear-gradient(180deg,#14263f,#0b1224)}
.bkh .t{font-size:20px;font-weight:700;color:var(--gold);margin-top:6px}
.bkh .u{font-size:12px;color:var(--mu)}
.adm{display:none;position:fixed;inset:0;z-index:120;background:var(--bg);flex-direction:column;max-width:440px;margin:0 auto}
.adm.on{display:flex}
.ah{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#131d38,#0f172a)}
.ah b{color:var(--gold);font-size:15px}
#abody{flex:1;overflow-y:auto;padding:14px}
#anav{display:flex;border-top:1px solid var(--line);background:#0b1224;padding-bottom:6px}
#anav div{flex:1;text-align:center;font-size:10px;color:var(--mu);padding:8px 0;cursor:pointer;border-top:2px solid transparent}
#anav div i{display:block;font-style:normal;font-size:18px}#anav .on{color:var(--gold);border-color:var(--gold)}
.th{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:12px}
.th .hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:13px;font-weight:700}
.gap{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.hs{position:relative;height:200px;border-radius:24px;overflow:hidden;margin-bottom:10px;border:1px solid rgba(251,191,36,.45);box-shadow:0 8px 24px rgba(0,0,0,.45)}
.sl{position:absolute;inset:0;padding:18px 16px;opacity:0;transform:scale(.96);transition:opacity .7s,transform .7s;display:flex;flex-direction:column;justify-content:center;pointer-events:none;overflow:hidden}
.sl.on{opacity:1;transform:none;pointer-events:auto}
.sl .tag{display:inline-block;align-self:flex-start;font-size:10px;font-weight:700;letter-spacing:.4px;padding:3px 10px;border-radius:12px;background:rgba(0,0,0,.35);color:#fde68a;margin-bottom:8px;position:relative;z-index:2}
.sl h4{font-size:18px;color:#fff;margin-bottom:6px;position:relative;z-index:2;max-width:72%}
.sl p{font-size:12.5px;line-height:1.65;color:#f1f5f9;position:relative;z-index:2;max-width:74%}
.sl .em{position:absolute;right:8px;bottom:6px;font-size:76px;z-index:1;animation:fl 3.2s ease-in-out infinite;filter:drop-shadow(0 6px 10px rgba(0,0,0,.4))}
.sl .e2{position:absolute;right:84px;top:10px;font-size:22px;opacity:.7;animation:fl 4.2s ease-in-out infinite .6s}
.sl .e3{position:absolute;right:16px;top:24px;font-size:18px;opacity:.6;animation:fl 3.6s ease-in-out infinite 1.1s}
@keyframes fl{50%{transform:translateY(-9px) rotate(4deg)}}
.s0{background:linear-gradient(135deg,#0f3d2e,#14532d 55%,#052e1a)}
.s1{background:linear-gradient(135deg,#1e1b4b,#312e81 55%,#0f172a)}
.s2{background:linear-gradient(135deg,#0c4a6e,#075985 55%,#082f49)}
.s3{background:linear-gradient(135deg,#78350f,#92400e 55%,#451a03)}
.dots{display:flex;justify-content:center;gap:6px;margin-bottom:14px}
.dots i{width:7px;height:7px;border-radius:50%;background:#334155;cursor:pointer;transition:all .3s}
.dots i.on{background:var(--gold);width:22px;border-radius:6px}
.bn{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.bo{border-radius:22px;padding:3px;background:linear-gradient(135deg,#fde68a,#b45309 50%,#fbbf24);box-shadow:0 6px 18px rgba(251,191,36,.18)}
.bi{border-radius:19px;background:linear-gradient(180deg,#16213f,#0b1224);padding:14px 10px;text-align:center;border:1px solid rgba(251,191,36,.25)}
.bi .ic{font-size:34px;display:block;animation:fl 3.4s ease-in-out infinite}
.bi b{display:block;font-size:13px;margin:6px 0 2px;color:#fff}
.bi small{display:block;font-size:10.5px;color:var(--mu);margin-bottom:10px}
.bi .btn{margin-top:0;padding:9px;font-size:12px}
.bi .btn.dn{background:#1e293b;color:var(--mu)}
.lk{display:flex;align-items:center;gap:12px;text-align:left}
.lk .ic{font-size:42px;animation:none}
.lk small{margin:0}
.wheel{position:relative;width:250px;margin:14px auto 6px}
.wheel .pt{position:absolute;top:-12px;left:50%;transform:translateX(-50%);font-size:28px;color:#fbbf24;z-index:3;text-shadow:0 2px 6px #000}
.tdw{font-size:12.5px;line-height:1.7;color:#e2e8f0;background:#131d38;border:1px solid var(--line);border-radius:12px;padding:10px;margin:8px 0}
.tdw b{color:var(--gold)}
.tdw.w{border-color:rgba(239,68,68,.5);color:#fecaca}
.stp{font-size:12.5px;line-height:1.9;color:#cbd5e1;margin:8px 0 4px;padding-left:4px}
</style></head><body>
<div class="app">
<div id="auth">
  <div id="logoA"></div><div class="brand">RS Growth Matrix</div><div class="sub">Complete tasks. Earn rewards. Withdraw.</div>
  <div class="card">
    <div class="seg"><div id="tReg" class="on" onclick="mode('reg')">Register</div><div id="tLog" onclick="mode('log')">Login</div></div>
    <div id="fReg">
      <label>Name</label><input id="rN" autocomplete="username" placeholder="Your name">
      <label>Phone number</label><input id="rP" inputmode="numeric" maxlength="11" placeholder="01XXXXXXXXX">
      <label>Password (at least 6 characters)</label><input id="rW" type="password" autocomplete="new-password">
      <label>Confirm password</label><input id="rC" type="password" autocomplete="new-password">
      <button class="btn g" onclick="reg()">Confirm</button>
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
<div class="top"><div class="l"><div id="logoT"></div><div><b id="hName"></b><small style="display:block;color:var(--gold);font-size:11px">Member</small></div></div><div class="bal"><span id="hBal">0.00</span><small>Balance (BDT)</small></div></div>
<nav id="nav"></nav>
<main id="main"></main>
</div>
<div class="adm" id="adm"><div class="ah"><b>Admin Panel</b><button class="btn s" onclick="admClose()">Close</button></div><div id="abody"></div><div id="anav"></div></div>
<div class="modal" id="modal"><div id="mBody"></div></div>
<script>
var GID='__GID__',T=localStorage.getItem('t'),ME=null,ADM='',TAB='home',TIMER=null,AD={},HSI=0,LC=0,ROT=0,SPUN=false;
var SEG=[1,2,3,5,1,2,3,1];
var REF=new URLSearchParams(location.search).get('ref')||localStorage.getItem('ref')||'';
if(REF)localStorage.setItem('ref',REF);
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function money(n){return Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function tm(t){return new Date(t).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
function logo(s){var g='lg'+(LC++);return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 100 100" aria-label="RS Growth Matrix"><defs><linearGradient id="'+g+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#b45309"/></linearGradient></defs><path d="M50 4 90 20v30c0 25-17 42-40 48C27 92 10 75 10 50V20z" fill="#0b1020" stroke="url(#'+g+')" stroke-width="4"/><text x="50" y="60" text-anchor="middle" font-size="34" font-weight="800" fill="url(#'+g+')" font-family="Georgia,serif">RS</text><path d="M30 71h40M38 77h24" stroke="url(#'+g+')" stroke-width="2.5" stroke-linecap="round"/></svg>'}
function mosque(w){var g='mg'+(LC++);return '<svg width="'+w+'" viewBox="0 0 200 120" style="max-width:100%" aria-label="Mosque"><defs><linearGradient id="'+g+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#b45309"/></linearGradient><linearGradient id="'+g+'s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#0f3d2e"/></linearGradient><clipPath id="'+g+'c"><rect width="200" height="120" rx="16"/></clipPath></defs><g clip-path="url(#'+g+'c)"><rect width="200" height="120" fill="url(#'+g+'s)"/>'+
 '<circle cx="165" cy="26" r="12" fill="#fde68a"/><circle cx="171" cy="22" r="10" fill="#1e1b4b"/>'+
 '<circle cx="28" cy="20" r="1.8" fill="#fff"/><circle cx="55" cy="34" r="1.3" fill="#fff"/><circle cx="80" cy="14" r="1.6" fill="#fde68a"/><circle cx="130" cy="18" r="1.4" fill="#fff"/><circle cx="188" cy="58" r="1.3" fill="#fff"/><circle cx="14" cy="60" r="1.2" fill="#fde68a"/>'+
 '<rect x="26" y="52" width="14" height="56" fill="#0b1020" stroke="url(#'+g+')" stroke-width="1.5"/><path d="M26 52l7-18 7 18z" fill="url(#'+g+')"/><circle cx="33" cy="31" r="2" fill="#fde68a"/><rect x="31" y="62" width="4" height="8" rx="2" fill="#fbbf24"/>'+
 '<rect x="160" y="52" width="14" height="56" fill="#0b1020" stroke="url(#'+g+')" stroke-width="1.5"/><path d="M160 52l7-18 7 18z" fill="url(#'+g+')"/><circle cx="167" cy="31" r="2" fill="#fde68a"/><rect x="165" y="62" width="4" height="8" rx="2" fill="#fbbf24"/>'+
 '<rect x="58" y="80" width="84" height="28" fill="#0b1020" stroke="url(#'+g+')" stroke-width="1.5"/>'+
 '<path d="M68 80a32 32 0 0 1 64 0z" fill="url(#'+g+')"/><rect x="99" y="36" width="2" height="14" fill="#fde68a"/><circle cx="100" cy="35" r="2.6" fill="#fde68a"/>'+
 '<path d="M91 108V96a9 9 0 0 1 18 0v12z" fill="url(#'+g+')"/>'+
 '<path d="M66 96V90a5 5 0 0 1 10 0v6z" fill="#fbbf24" opacity=".8"/><path d="M124 96V90a5 5 0 0 1 10 0v6z" fill="#fbbf24" opacity=".8"/>'+
 '<rect y="108" width="200" height="12" fill="#052e1a"/></g></svg>'}
function api(p,m,b,hd){hd=hd||{};hd['Content-Type']='application/json';if(T)hd.Authorization='Bearer '+T;
 return fetch('/api/'+p,{method:m||'GET',headers:hd,body:b?JSON.stringify(b):undefined}).then(function(r){return r.json().then(function(d){if(r.status===401&&T){out();throw new Error(d.error)}if(!r.ok)throw new Error(d.error||'Error');return d})})}
function out(){localStorage.removeItem('t');T=null;ME=null;admClose();$('auth').style.display='block'}
function mode(m){$('tReg').className=m==='reg'?'on':'';$('tLog').className=m==='log'?'on':'';$('fReg').style.display=m==='reg'?'block':'none';$('fLog').style.display=m==='log'?'block':'none';$('aErr').textContent=''}
function done(d){T=d.token;localStorage.setItem('t',T);localStorage.removeItem('ref');enter(d.me)}
function fail(e){$('aErr').textContent=e.message}
function reg(){api('register','POST',{name:$('rN').value,phone:$('rP').value,password:$('rW').value,confirm:$('rC').value,ref:REF}).then(done).catch(fail)}
function login(){api('login','POST',{name:$('lN').value,password:$('lW').value}).then(done).catch(fail)}
function gCb(r){api('google','POST',{credential:r.credential,ref:REF}).then(done).catch(fail)}
function initG(){if(!GID){$('gWrap').style.display='none';return}
 if(!window.google||!google.accounts){return setTimeout(initG,400)}
 google.accounts.id.initialize({client_id:GID,callback:gCb});google.accounts.id.renderButton($('gBtn'),{theme:'filled_black',size:'large',text:'continue_with',width:280})}
var TABS=[['home','🏠','Home'],['tasks','📋','Tasks'],['rank','🏆','Ranking'],['ref','👥','Refer'],['help','💬','Support'],['acc','👤','Account'],['book','🕌','Islam']];
function enter(m){ME=m;$('auth').style.display='none';$('nav').innerHTML=TABS.map(function(t){return '<div id="n_'+t[0]+'" onclick="go(\\''+t[0]+'\\')"><i>'+t[1]+'</i>'+t[2]+'</div>'}).join('');head();go('home')}
function head(){$('hName').textContent=ME.name;$('hBal').textContent=money(ME.balance)}
function go(t){TAB=t;clearInterval(TIMER);TABS.forEach(function(x){$('n_'+x[0]).className=x[0]===t?'on':''});({home:vHome,tasks:vTasks,rank:vRank,ref:vRef,help:vHelp,acc:vAcc,book:vBook})[t]()}
function toast(m){alert(m)}

/* ---------- Home ---------- */
var HS=[
 ['s0','🕌 নামাজের স্মরণ','নামাজ কি পড়েছেন?','নামাজ আমাদের জীবনের সবচেয়ে বড় আমানত। কাজের ফাঁকে ওয়াক্ত হলেই নামাজ আদায় করে নিন। মনও শান্ত থাকবে, কাজেও বরকত আসবে।','🕌','🌙','⭐'],
 ['s1','🌟 আমাদের সাইট','RS Growth Matrix','এটি একটি টাস্কভিত্তিক আয়ের সাইট। এখানে সহজ টাস্ক শেষ করলে ব্যালেন্সে টাকা যোগ হয়। আছে দৈনিক বোনাস, লাকি ড্র, রেফার, র‍্যাংকিং, সাপোর্ট ও একটি ইসলামিক বই।','🚀','✨','💎'],
 ['s2','📋 টাস্ক ও আয়','সহজ টাস্ক, নিয়মিত আয়','Tasks ট্যাবে গিয়ে পছন্দের টাস্কে চাপুন, বিস্তারিত পড়ুন এবং Start দিন। যাচাই শেষে সফল হলে টাকা ব্যালেন্সে যোগ হবে। পেন্ডিং দেখালে ধৈর্য ধরুন।','📱','💰','🎯'],
 ['s3','💸 উত্তোলন','সহজে টাকা তুলুন','Account থেকে Withdraw চেপে bKash বা Nagad নাম্বার দিন। উত্তোলন ৩০০ থেকে ৫০০০ টাকা পর্যন্ত করা যায়। রিকোয়েস্ট যাচাই করে আমরা নিজে টাকা পাঠাই।','💸','🏦','✅']];
function hsGo(i){HSI=i;var s=document.querySelectorAll('.sl'),d=document.querySelectorAll('.dots i');for(var k=0;k<s.length;k++){s[k].className='sl '+HS[k][0]+(k===i?' on':'');d[k].className=k===i?'on':''}}
function vHome(){var ok=Date.now()-ME.lastDaily>=864e5,sp=Date.now()-(ME.lastSpin||0)>=864e5;HSI=0;
 var sl=HS.map(function(x,i){return '<div class="sl '+x[0]+(i===0?' on':'')+'"><span class="tag">'+x[1]+'</span><h4>'+x[2]+'</h4><p>'+x[3]+'</p><span class="em">'+x[4]+'</span><span class="e2">'+x[5]+'</span><span class="e3">'+x[6]+'</span></div>'}).join('');
 var dt=HS.map(function(x,i){return '<i class="'+(i===0?'on':'')+'" onclick="hsGo('+i+')"></i>'}).join('');
 $('main').innerHTML='<div class="mq"><span>🌙 RS Growth Matrix-এ স্বাগতম! আপনার নামাজের কথা মনে আছে তো? 🤲 নামাজ পড়ুন, তারপর কাজে মন দিন। ✨ আমাদের এই সাইটে আপনি নিশ্চিন্তে সহজ টাস্ক করে আয় করতে পারেন। 🤝 কোনো সমস্যা হলে Support-এ জানান। 💬</span></div>'+
 '<div class="grid"><div class="stat"><b>'+money(ME.balance)+'</b><small>Balance</small></div><div class="stat"><b>'+money(ME.earned)+'</b><small>Total earned</small></div></div>'+
 '<div class="hs">'+sl+'</div><div class="dots">'+dt+'</div>'+
 '<div class="bo" style="margin-bottom:14px"><div class="bi lk"><span class="ic">🎡</span><div style="flex:1"><b style="margin-top:0">Lucky Draw</b><small>প্রতি ২৪ ঘণ্টায় একবার ঘোরান, ১ থেকে ৫ টাকা জিতুন</small></div><button class="btn s'+(sp?'':' dn')+'" style="'+(sp?'':'background:#1e293b;color:#94a3b8')+'" onclick="spinOpen()">'+(sp?'Spin':'Done ✅')+'</button></div></div>'+
 '<h3>আজকের বোনাস</h3><div class="bn">'+
 '<div class="bo"><div class="bi"><span class="ic">🎁</span><b>Login Bonus</b><small>+'+ME.d+' BDT · প্রতি ২৪ ঘণ্টায় একবার</small><button class="btn'+(ok?'':' dn')+'" onclick="act(\\'daily\\')">'+(ok?'Claim':'Claimed ✅')+'</button></div></div>'+
 '<div class="bo"><div class="bi"><span class="ic">📅</span><b>Check-in Bonus</b><small>+'+ME.c+' BDT · প্রতিদিন একবার</small><button class="btn'+(ME.checkedIn?' dn':'')+'" onclick="act(\\'checkin\\')">'+(ME.checkedIn?'Done ✅':'Check in')+'</button></div></div></div>';
 TIMER=setInterval(function(){if(!document.querySelector('.hs')){clearInterval(TIMER);return}hsGo((HSI+1)%HS.length)},6000)}
function act(p){api(p,'POST').then(function(m){ME=m;head();vHome();toast('Reward added to your balance.')}).catch(function(e){toast(e.message)})}

/* ---------- Lucky Draw ---------- */
function wheelSvg(){var cols=['#b45309','#1e3a8a','#14532d','#7c2d12','#4c1d95','#0c4a6e','#78350f','#164e63'],h='<svg viewBox="0 0 200 200" width="250" height="250" id="whs" style="display:block;transition:transform 4.5s cubic-bezier(.17,.67,.12,1);transform:rotate('+ROT+'deg)"><circle cx="100" cy="100" r="98" fill="#0b1224" stroke="#fbbf24" stroke-width="3"/>';
 for(var i=0;i<8;i++){h+='<g transform="rotate('+(i*45+22.5)+' 100 100)"><path d="M100 100L63.65 12.23A95 95 0 0 1 136.35 12.23Z" fill="'+cols[i]+'" stroke="#fbbf24" stroke-width="1.2"/><text x="100" y="44" text-anchor="middle" font-size="17" font-weight="800" fill="#fff">'+SEG[i]+'৳</text></g>'}
 return h+'<circle cx="100" cy="100" r="15" fill="#0b1224" stroke="#fbbf24" stroke-width="3"/><text x="100" y="105" text-anchor="middle" font-size="12">⭐</text></svg>'}
function spinOpen(){SPUN=false;var ok=Date.now()-(ME.lastSpin||0)>=864e5;
 modal('<h3 style="color:var(--gold);text-align:center;font-size:16px">🎡 Lucky Draw</h3><div class="wheel"><div class="pt">▼</div>'+wheelSvg()+'</div><div id="spmsg" style="text-align:center;font-size:13px;min-height:22px;color:#e2e8f0;margin:6px 0">'+(ok?'চাকা ঘোরাতে Spin চাপুন':'আজকের স্পিন শেষ। ২৪ ঘণ্টা পর আবার আসুন।')+'</div><button id="spb" class="btn"'+(ok?'':' disabled style="opacity:.5"')+' onclick="doSpin()">Spin</button><button class="btn" style="background:#1e293b;color:#fff" onclick="closeSpin()">Close</button>')}
function doSpin(){if(SPUN)return;SPUN=true;$('spb').disabled=true;$('spb').style.opacity='.5';
 api('spin','POST').then(function(r){var c=[];for(var k=0;k<SEG.length;k++)if(SEG[k]===r.prize)c.push(k);var i=c[Math.floor(Math.random()*c.length)];
  ROT=Math.ceil(ROT/360)*360+1800-(i*45+22.5);$('whs').style.transform='rotate('+ROT+'deg)';
  setTimeout(function(){ME=r.me;head();var m=$('spmsg');if(m)m.innerHTML='🎉 অভিনন্দন! আপনি জিতেছেন <b style="color:#fbbf24">'+r.prize+' টাকা</b>'},4700)})
 .catch(function(e){SPUN=false;toast(e.message);closeSpin()})}
function closeSpin(){closeM();if(TAB==='home')vHome()}

/* ---------- Tasks ---------- */
function vTasks(){$('main').innerHTML='<div class="grid4" id="st"></div><div class="mq u"><span>⏳ আপনার টাস্ক পেন্ডিং থাকা মানে যাচাই চলছে, চিন্তার কোনো কারণ নেই। টাস্ক কমপ্লিট হতে কিছুটা সময় লাগে। যাচাই শেষে সফল হলে টাকা আপনার ব্যালেন্সে যোগ হবে। ৪৮ ঘণ্টার মধ্যে যাচাই না হলে টাস্কটি তালিকা থেকে সরে যায়। ধৈর্য ধরুন। 🤍</span></div><h3>Live tasks</h3><div id="tl">Loading...</div>';
 function load(){api('offers').then(function(d){var s=d.stats;if(!$('st'))return;
 $('st').innerHTML=[['Pending',s.pending],['Success',s.success],['Cancelled',s.cancelled],['Total',s.total]].map(function(x){return '<div class="stat"><b>'+x[1]+'</b><small>'+x[0]+'</small></div>'}).join('');
 window.OF=d.list;
 $('tl').innerHTML=d.list.length?d.list.map(function(t,i){var op=t.status==='open',b=op?'<button class="btn s">Details</button>':'<span class="chip '+(t.status==='success'?'approved':t.status)+'">'+t.status+'</span>';
 return '<div class="row"'+(op?' style="cursor:pointer" onclick="showT('+i+')"':'')+'><div style="display:flex;gap:10px;align-items:center">'+(t.icon?'<img src="'+esc(t.icon)+'" width="38" height="38" style="border-radius:10px" alt="">':'')+'<div>'+esc(t.title)+'<small>Reward: '+money(t.bdt)+' BDT</small></div></div>'+b+'</div>'}).join(''):'<div class="row">এই মুহূর্তে বাংলাদেশের জন্য কোনো নতুন টাস্ক নেই। কিছুক্ষণ পর আবার দেখুন।</div>'}).catch(function(e){if($('tl'))$('tl').textContent=e.message})}
 load();TIMER=setInterval(load,30000)}
function showT(i){var t=OF[i],cn=t.cnt||[],dv=t.dev||[],okC=!cn.length||cn.indexOf('BD')>=0;
 modal('<div style="display:flex;gap:12px;align-items:center">'+(t.icon?'<img src="'+esc(t.icon)+'" width="54" height="54" style="border-radius:14px" alt="">':'')+'<div><b style="font-size:15px">'+esc(t.title)+'</b><div style="color:var(--grn);font-weight:800;margin-top:3px">Reward: '+money(t.bdt)+' BDT</div></div></div>'+
 '<div class="tdw"><b>কাজ কী:</b> '+esc(t.desc||'বিস্তারিত দেওয়া নেই')+'</div>'+
 (t.req?'<div class="tdw"><b>শর্ত:</b> '+esc(t.req)+'</div>':'')+
 '<div class="tdw"><b>ডিভাইস:</b> '+(dv.length?esc(dv.join(', ')):'সব ডিভাইস')+'<br><b>যোগ্য দেশ:</b> '+(cn.length?esc(cn.join(', ')):'সব দেশ')+'</div>'+
 (okC?'':'<div class="tdw w">⚠️ এই অফার শুধু '+esc(cn.join(', '))+' দেশের ইউজারদের জন্য। আপনার দেশ এই তালিকায় না থাকলে কাজ শেষ করলেও টাকা নাও আসতে পারে।</div>')+
 '<h3 style="margin-top:10px">কীভাবে করবেন</h3><div class="stp">১. নিচের Start চাপুন।<br>২. যে পেজ খুলবে সেখানে শর্ত অনুযায়ী কাজটা শেষ করুন। কোনো অফারওয়াল অ্যাকাউন্ট লাগবে না।<br>৩. কাজ শেষে আমাদের সাইটে ফিরে আসুন, টাস্ক Pending দেখাবে।<br>৪. যাচাই শেষে সফল হলে টাকা ব্যালেন্সে যোগ হবে।</div>'+
 '<button class="btn g" onclick="closeM();startO('+i+')">Start</button><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">Close</button>')}
function startO(i){api('offers/'+encodeURIComponent(OF[i].id)+'/start','POST').then(function(r){var w=window.open(r.url,'_blank');if(!w)location.href=r.url;vTasks()}).catch(function(e){toast(e.message)})}
function modal(h){$('mBody').innerHTML=h;$('modal').style.display='flex'}
function closeM(){$('modal').style.display='none'}
function vRank(){$('main').innerHTML='<h3>Top earners</h3><div id="rk">Loading...</div>';
 function load(){api('leaderboard').then(function(a){if(!a.length){$('rk').innerHTML='<div class="row">No earners yet. Complete a task to take the first place.</div>';return}
 var p=[a[1],a[0],a[2]],cl=['','p1',''],rk=['#2','#1','#3'];
 $('rk').innerHTML='<div class="pod">'+p.map(function(u,i){return u?'<div class="'+cl[i]+'">'+(i===1?'👑':'')+'<br>'+esc(u.name)+'<b>'+money(u.earned)+'</b><small>'+rk[i]+'</small></div>':'<div></div>'}).join('')+'</div>'+
 a.slice(3).map(function(u,i){return '<div class="row"><div>#'+(i+4)+' '+esc(u.name)+'</div><b style="color:var(--grn)">'+money(u.earned)+'</b></div>'}).join('')}).catch(function(){})}
 load();TIMER=setInterval(load,20000)}
function vRef(){var link=location.origin+'/?ref='+ME.refCode,e=encodeURIComponent(link),tx=encodeURIComponent('Join RS Growth Matrix and earn by completing tasks: ');window.RL=link;
 $('main').innerHTML='<div class="card" style="text-align:center">'+logo(64)+'<div class="brand" style="font-size:18px">Invite and earn</div><div class="sub">You get '+10+' BDT for every friend who signs up with your link.</div>'+
 '<input readonly id="rl" value="'+esc(link)+'"><button class="btn" onclick="copyL()">Copy link</button>'+
 '<div class="share"><a target="_blank" rel="noopener" href="https://wa.me/?text='+tx+e+'">WhatsApp</a><a target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u='+e+'">Facebook</a><a href="fb-messenger://share?link='+e+'">Messenger</a><button onclick="copyL(1)">Imo</button><a target="_blank" rel="noopener" href="https://t.me/share/url?url='+e+'&text='+tx+'">Telegram</a><button onclick="nat()">More apps</button></div></div>'+
 '<div class="grid" style="margin-top:12px"><div class="stat"><b>'+ME.refCount+'</b><small>Friends joined</small></div><div class="stat"><b>'+money(ME.refEarn)+'</b><small>Referral earnings</small></div></div>'}
function copyL(imo){(navigator.clipboard?navigator.clipboard.writeText(RL):Promise.reject()).then(function(){toast(imo?'Link copied. Open Imo and paste it in a chat.':'Link copied.')}).catch(function(){$('rl').select();toast('Press copy on the selected link.')})}
function nat(){if(navigator.share)navigator.share({title:'RS Growth Matrix',url:RL});else copyL()}
function vHelp(){$('main').innerHTML='<h3>Support</h3><div class="chat" id="ch"></div><textarea id="st" rows="2" maxlength="500" placeholder="Describe your problem"></textarea><button class="btn" onclick="sendS()">Send</button>';
 function load(){api('support').then(function(a){var c=$('ch');if(!c)return;c.innerHTML=a.length?a.map(function(m){return '<div class="m '+m.from+'">'+esc(m.text)+'</div>'}).join(''):'<div class="m support">Hello! Write your message and our team will reply here.</div>';c.scrollTop=c.scrollHeight}).catch(function(){})}
 load();TIMER=setInterval(load,10000)}
function sendS(){api('support','POST',{text:$('st').value}).then(function(){$('st').value='';vHelp()}).catch(function(e){toast(e.message)})}
function vAcc(){$('main').innerHTML='<div class="row"><div>'+esc(ME.name)+'<small>'+esc(ME.phone||ME.email)+'</small></div><button class="btn s" onclick="out()">Logout</button></div>'+
 '<div class="grid"><div class="stat"><b>'+money(ME.balance)+'</b><small>Balance</small></div><div class="stat"><b>'+money(ME.earned)+'</b><small>Total earned</small></div></div>'+
 '<button class="btn r" style="margin-top:0" onclick="wdForm()">Withdraw</button><h3 style="margin-top:16px">Withdraw history</h3><div id="wh">Loading...</div>'+
 '<button class="btn" style="background:#1e293b;color:#fff" onclick="admOpen()">Admin panel</button>';
 api('withdrawals').then(function(a){$('wh').innerHTML=a.length?a.map(function(w){return '<div class="row"><div>'+esc(w.method)+' '+esc(w.phone)+'<small>'+new Date(w.at).toLocaleDateString()+'</small></div><div>'+money(w.amount)+' <span class="chip '+w.status+'">'+w.status+'</span></div></div>'}).join(''):'<div class="row">No withdrawals yet.</div>'})}
function wdForm(){modal('<h3 style="color:var(--gold)">Withdraw (300 - 5000 BDT)</h3><label>Method</label><select id="wm"><option>bKash</option><option>Nagad</option></select><label>Amount</label><input id="wa" type="number" inputmode="numeric"><label>Your bKash/Nagad number</label><input id="wp" maxlength="11" inputmode="numeric" value="'+esc(ME.phone)+'"><button class="btn r" onclick="doWd()">Send request</button><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">Close</button>')}
function doWd(){api('withdraw','POST',{method:$('wm').value,amount:$('wa').value,phone:$('wp').value}).then(function(m){ME=m;head();closeM();toast('Withdraw request sent.');vAcc()}).catch(function(e){toast(e.message)})}

/* ---------- Islamic Book ---------- */
var NB=[["মুহাম্মদ","প্রশংসিত"],["আহমদ","অধিক প্রশংসাকারী"],["আবদুল্লাহ","আল্লাহর বান্দা"],["ইবরাহিম","নবী ইবরাহিম (আ.)-এর নাম"],["ইসমাইল","নবী ইসমাইল (আ.)-এর নাম"],["ইউসুফ","নবী ইউসুফ (আ.)-এর নাম"],["ইয়াহইয়া","নবী ইয়াহইয়া (আ.)-এর নাম"],["ইদরিস","নবী ইদরিস (আ.)-এর নাম"],["উমর","সাহাবীর নাম, দ্বিতীয় খলিফা"],["আলী","উচ্চ মর্যাদাসম্পন্ন"],["হামজা","সাহাবীর নাম, শক্তিশালী"],["বিলাল","সাহাবীর নাম, নবী (সা.)-এর মুয়াজ্জিন"],["সালমান","শান্তিপ্রিয়, নিরাপদ"],["হাসান","সুন্দর, উত্তম"],["হুসাইন","ছোট্ট সুন্দর, প্রিয়"]];
var NG=[["আয়েশা","প্রাণবন্ত, জীবন্ত"],["ফাতিমা","নবী (সা.)-এর কন্যার নাম"],["খাদিজা","নবী (সা.)-এর প্রথম স্ত্রী"],["মারিয়াম","নবী ঈসা (আ.)-এর মাতা"],["জয়নব","সুগন্ধি বৃক্ষ"],["রুকাইয়া","নবী (সা.)-এর কন্যার নাম"],["হাফসা","সাহাবিয়া, নবী (সা.)-এর স্ত্রী"],["সুমাইয়া","ইসলামের প্রথম শহীদ নারী"],["আসমা","উচ্চ মর্যাদাসম্পন্না"],["সালমা","শান্তিপ্রিয়, নিরাপদ"],["আমিনা","বিশ্বস্ত, নিরাপদ"],["জান্নাত","বেহেশত"],["নূর","আলো"],["সাফিয়া","খাঁটি, নির্মল"],["হালিমা","ধৈর্যশীলা, কোমল"]];
var DUA=[
["১. সানা (নামাজের শুরুতে)","سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ","সুবহানাকাল্লাহুম্মা ওয়া বিহামদিকা ওয়া তাবারাকাসমুকা ওয়া তাআলা জাদ্দুকা ওয়া লা ইলাহা গাইরুক।","হে আল্লাহ, আপনি পবিত্র, আপনার প্রশংসা করছি। আপনার নাম বরকতময়, আপনার মর্যাদা সুউচ্চ, আপনি ছাড়া কোনো ইলাহ নেই।"],
["২. সূরা ফাতিহা (প্রতি রাকাতে)","بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ الرَّحْمَٰنِ الرَّحِيمِ مَالِكِ يَوْمِ الدِّينِ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ","","পরম করুণাময় দয়ালু আল্লাহর নামে শুরু। সমস্ত প্রশংসা জগতের প্রতিপালক আল্লাহর। তিনি পরম করুণাময়, অতি দয়ালু, বিচার দিনের মালিক। আমরা শুধু আপনারই ইবাদত করি ও আপনারই কাছে সাহায্য চাই। আমাদের সরল পথ দেখান, তাদের পথ, যাদের আপনি নিয়ামত দিয়েছেন; তাদের পথ নয়, যারা গজবপ্রাপ্ত ও পথভ্রষ্ট।"],
["৩. আত্তাহিয়্যাতু (শেষ বৈঠকে)","التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ","আত্তাহিয়্যাতু লিল্লাহি ওয়াস সালাওয়াতু ওয়াত তাইয়্যিবাতু, আস সালামু আলাইকা আইয়্যুহান নাবিয়্যু ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহু, আস সালামু আলাইনা ওয়া আলা ইবাদিল্লাহিস সালিহীন, আশহাদু আল লা ইলাহা ইল্লাল্লাহু ওয়া আশহাদু আন্না মুহাম্মাদান আবদুহু ওয়া রাসুলুহু।","সমস্ত সম্মান, ইবাদত ও পবিত্রতা আল্লাহর জন্য। হে নবী, আপনার ওপর শান্তি, আল্লাহর রহমত ও বরকত বর্ষিত হোক। আমাদের ওপর এবং আল্লাহর সৎ বান্দাদের ওপরও শান্তি বর্ষিত হোক। আমি সাক্ষ্য দিচ্ছি আল্লাহ ছাড়া কোনো ইলাহ নেই, আর মুহাম্মদ (সা.) তাঁর বান্দা ও রাসুল।"],
["৪. দরুদ ইবরাহিম","اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ","আল্লাহুম্মা সাল্লি আলা মুহাম্মাদিউ ওয়া আলা আলি মুহাম্মাদিন কামা সাল্লাইতা আলা ইবরাহিমা ওয়া আলা আলি ইবরাহিমা ইন্নাকা হামিদুম মাজিদ। আল্লাহুম্মা বারিক আলা মুহাম্মাদিউ ওয়া আলা আলি মুহাম্মাদিন কামা বারাকতা আলা ইবরাহিমা ওয়া আলা আলি ইবরাহিমা ইন্নাকা হামিদুম মাজিদ।","হে আল্লাহ, মুহাম্মদ (সা.) ও তাঁর পরিবারের ওপর রহমত বর্ষণ করুন, যেমন ইবরাহিম (আ.) ও তাঁর পরিবারের ওপর করেছিলেন। নিশ্চয়ই আপনি প্রশংসিত ও মহিমান্বিত। হে আল্লাহ, মুহাম্মদ (সা.) ও তাঁর পরিবারের ওপর বরকত দিন, যেমন ইবরাহিম (আ.) ও তাঁর পরিবারের ওপর দিয়েছিলেন।"],
["৫. দোয়া মাসুরা","اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ","আল্লাহুম্মা ইন্নি জালামতু নাফসি জুলমান কাসিরাঁও ওয়া লা ইয়াগফিরুয যুনুবা ইল্লা আনতা ফাগফিরলি মাগফিরাতাম মিন ইনদিকা ওয়ারহামনি ইন্নাকা আনতাল গাফুরুর রাহিম।","হে আল্লাহ, আমি নিজের ওপর অনেক জুলুম করেছি। আপনি ছাড়া কেউ গুনাহ মাফ করতে পারে না। তাই আপনার পক্ষ থেকে আমাকে ক্ষমা করুন ও দয়া করুন। নিশ্চয়ই আপনি ক্ষমাশীল, দয়ালু।"],
["৬. নামাজের পরের দোয়া","رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ","রাব্বানা আতিনা ফিদ্দুনইয়া হাসানাতাঁও ওয়া ফিল আখিরাতি হাসানাতাঁও ওয়া কিনা আজাবান নার।","হে আমাদের রব, আমাদের দুনিয়াতে কল্যাণ দিন, আখিরাতেও কল্যাণ দিন এবং আমাদের জাহান্নামের আজাব থেকে রক্ষা করুন।"]];
var RK=[["ফজর","২ রাকাত ফরজ"],["জোহর","৪ রাকাত ফরজ"],["আসর","৪ রাকাত ফরজ"],["মাগরিব","৩ রাকাত ফরজ"],["এশা","৪ রাকাত ফরজ"]];
var HD=[["কাজ নিয়তের ওপর নির্ভরশীল। প্রত্যেক ব্যক্তি তা-ই পাবে, যার নিয়ত সে করেছে।","সহিহ বুখারি ১, সহিহ মুসলিম ১৯০৭"],["তোমাদের মধ্যে সেই ব্যক্তি সর্বোত্তম, যে কুরআন শেখে এবং অন্যকে শেখায়।","সহিহ বুখারি ৫০২৭"],["তোমাদের কেউ প্রকৃত মুমিন হবে না, যতক্ষণ না সে নিজের জন্য যা পছন্দ করে, তার ভাইয়ের জন্যও তা পছন্দ করে।","সহিহ বুখারি ১৩, সহিহ মুসলিম ৪৫"],["পবিত্রতা ঈমানের অর্ধেক।","সহিহ মুসলিম ২২৩"],["প্রকৃত বীর সে নয়, যে কুস্তিতে অন্যকে হারায়। প্রকৃত বীর সে, যে রাগের সময় নিজেকে নিয়ন্ত্রণ করে।","সহিহ বুখারি ৬১১৪, সহিহ মুসলিম ২৬০৯"],["যে আল্লাহ ও আখিরাতের দিনে বিশ্বাস রাখে, সে যেন ভালো কথা বলে, নয়তো চুপ থাকে।","সহিহ বুখারি ৬০১৮, সহিহ মুসলিম ৪৭"],["যে ব্যক্তি প্রতারণা করে, সে আমাদের দলভুক্ত নয়।","সহিহ মুসলিম ১০১"]];
function bkb(p,ic,t,s){return '<div class="row" style="cursor:pointer" onclick="bk(\\''+p+'\\')"><div>'+ic+' '+t+'<small>'+s+'</small></div><span style="color:var(--gold)">&rsaquo;</span></div>'}
function bkBack(p){return '<button class="btn s" style="margin-bottom:12px" onclick="bk(\\''+p+'\\')">&lsaquo; ফিরে যান</button>'}
function vBook(){bk('menu')}
function bk(p){var h='';
 if(p==='menu'){h='<div class="bkh">'+mosque(230)+'<div class="t">ইসলামিক বই</div><div class="u">নাম, দোয়া ও হাদিস</div></div>'+
  bkb('names','🌙','ইসলামিক নাম','ছেলে ও মেয়েদের নাম ও অর্থ')+bkb('dua','🤲','নামাজের দোয়া','নামাজে যা যা পড়তে হয়')+bkb('rakat','🕌','পাঁচ ওয়াক্ত নামাজ','ফরজ রাকাতের সংখ্যা')+bkb('hadith','📜','হাদিস','কিছু সহিহ হাদিস')}
 else if(p==='names'){h=bkBack('menu')+'<h3>কাদের নাম দেখতে চান?</h3>'+bkb('boys','👦','ছেলেদের নাম','ইসলামিক ছেলে শিশুর নাম')+bkb('girls','👧','মেয়েদের নাম','ইসলামিক মেয়ে শিশুর নাম')}
 else if(p==='boys'||p==='girls'){var L=p==='boys'?NB:NG;h=bkBack('names')+'<h3>'+(p==='boys'?'ছেলেদের':'মেয়েদের')+' ইসলামিক নাম</h3>'+L.map(function(n){return '<div class="bkc"><b>'+esc(n[0])+'</b><small>'+esc(n[1])+'</small></div>'}).join('')}
 else if(p==='dua'){h=bkBack('menu')+'<h3>নামাজের দোয়া</h3>'+DUA.map(function(d){return '<div class="bkc"><b>'+esc(d[0])+'</b><div class="ar">'+esc(d[1])+'</div>'+(d[2]?'<div>'+esc(d[2])+'</div>':'')+'<small>অর্থ: '+esc(d[3])+'</small></div>'}).join('')}
 else if(p==='rakat'){h=bkBack('menu')+'<h3>পাঁচ ওয়াক্ত নামাজ</h3>'+RK.map(function(r){return '<div class="row"><div><b style="color:var(--gold)">'+r[0]+'</b></div><div>'+r[1]+'</div></div>'}).join('')+'<div class="bkc"><small>এখানে শুধু ফরজ রাকাত দেওয়া হয়েছে। সুন্নত ও নফল সম্পর্কে আপনার আলেম বা নির্ভরযোগ্য বই থেকে জেনে নিন।</small></div>'}
 else if(p==='hadith'){h=bkBack('menu')+'<h3>হাদিস</h3>'+HD.map(function(x){return '<div class="bkc">'+esc(x[0])+'<small>সূত্র: '+esc(x[1])+'</small></div>'}).join('')}
 $('main').innerHTML=h;$('main').scrollTop=0}

/* ---------- Admin panel ---------- */
var ATABS=[['ov','📊','ওভারভিউ'],['wd','💸','উত্তোলন'],['sp','💬','সাপোর্ট'],['us','🟢','অ্যাক্টিভ'],['ea','🏆','ইনকাম']];
function ah(){return{'x-admin-pass':ADM}}
function admOpen(){var p=prompt('Admin password');if(!p)return;ADM=p;$('adm').className='adm on';
 $('anav').innerHTML=ATABS.map(function(t){return '<div id="a_'+t[0]+'" onclick="admGo(\\''+t[0]+'\\')"><i>'+t[1]+'</i>'+t[2]+'</div>'}).join('');admGo('ov')}
function admClose(){$('adm').className='adm'}
function aErr(e){if(e.message==='Wrong admin password.'){toast(e.message);admClose()}else $('abody').innerHTML='<div class="row">'+esc(e.message)+'</div>'}
function admGo(t){ATABS.forEach(function(x){$('a_'+x[0]).className=x[0]===t?'on':''});$('abody').innerHTML='<div class="row">Loading...</div>';
 ({ov:aOv,wd:aWd,sp:aSp,us:aUs,ea:aEa})[t]()}
function sc(a){return a.map(function(x){return '<div class="stat"><b>'+x[1]+'</b><small>'+x[0]+'</small></div>'}).join('')}
function aOv(){api('admin/data','GET',null,ah()).then(function(d){var s=d.stats;
 $('abody').innerHTML='<h3>আজকের হিসাব</h3><div class="grid">'+sc([['মোট ইউজার',s.users],['আজ ঢুকেছে',s.active],['আজ নতুন',s.newToday],['আজ উত্তোলন রিকোয়েস্ট',s.wdToday],['আজ ইউজাররা আয় করেছে',money(s.today)],['সব ইউজারের ব্যালেন্স',money(s.balance)]])+'</div>'+
 '<h3>টাস্ক</h3><div class="grid4">'+sc([['Pending',s.pending],['Success',s.success],['Cancelled',s.cancelled],['অপেক্ষমাণ উত্তোলন',s.wdPending]])+'</div>'+
 '<div class="row"><div>অপেক্ষমাণ উত্তোলন মোট<small>এখনো পাঠানো হয়নি</small></div><b style="color:var(--gold)">'+money(s.wdPendingSum)+'</b></div>'+
 '<button class="btn" style="background:#1e293b;color:#fff" onclick="chk()">Check offers</button>'}).catch(aErr)}
function chk(){api('admin/offers-raw','GET',null,ah()).then(function(r){modal('<h3 style="color:var(--gold)">Offers response</h3><pre>'+esc(r.text)+'</pre><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">Close</button>')})}
function cpI(i){var t=AD.wds[i].phone;if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast('Copied: '+t)}).catch(function(){toast(t)});else toast(t)}
function decI(i,ok){var w=AD.wds[i];if(!confirm((ok?'Paid':'Reject')+' করবেন? '+w.name+' - '+w.amount))return;api('admin/wd/'+w._id,'POST',{ok:!!ok},ah()).then(aWd).catch(aErr)}
function aWd(){api('admin/wd-list','GET',null,ah()).then(function(d){AD.wds=d.pending;
 var tot=d.pending.reduce(function(a,w){return a+w.amount},0);
 $('abody').innerHTML='<div class="grid">'+sc([['অপেক্ষমাণ',d.pending.length],['মোট টাকা',money(tot)]])+'</div><h3>পাঠাতে হবে</h3>'+
 (d.pending.map(function(w,i){return '<div class="th"><div class="hd"><span>'+esc(w.name)+'</span><span style="color:var(--gold)">'+money(w.amount)+'</span></div><div style="font-size:13px">'+esc(w.method)+': <b>'+esc(w.phone)+'</b></div><small style="color:var(--mu)">'+new Date(w.at).toLocaleString()+'</small><div class="gap"><button class="btn s" onclick="cpI('+i+')">নাম্বার কপি</button><button class="btn s g" onclick="decI('+i+',1)">Paid</button><button class="btn s r" onclick="decI('+i+',0)">Reject</button></div></div>'}).join('')||'<div class="row">কোনো রিকোয়েস্ট নেই</div>')+
 '<h3 style="margin-top:14px">সর্বশেষ সম্পন্ন</h3>'+(d.done.map(function(w){return '<div class="row"><div>'+esc(w.name)+'<small>'+esc(w.method)+' '+esc(w.phone)+'</small></div><div>'+money(w.amount)+' <span class="chip '+w.status+'">'+w.status+'</span></div></div>'}).join('')||'<div class="row">নেই</div>')}).catch(aErr)}
function repI(i){var t=$('rp'+i).value.trim();if(!t)return;api('admin/reply','POST',{uid:AD.th[i].uid,text:t},ah()).then(aSp).catch(aErr)}
function aSp(){api('admin/support','GET',null,ah()).then(function(d){AD.th=d;
 $('abody').innerHTML=d.length?d.map(function(t,i){return '<div class="th"><div class="hd"><span>'+esc(t.name)+'</span>'+(t.needs?'<span class="chip" style="color:var(--red)">উত্তর দিন</span>':'<span class="chip approved">উত্তর দেওয়া হয়েছে</span>')+'</div><div class="chat" style="max-height:30vh">'+t.msgs.map(function(m){return '<div class="m '+m.from+'">'+esc(m.text)+'</div>'}).join('')+'</div><textarea id="rp'+i+'" rows="2" maxlength="500" placeholder="উত্তর লিখুন"></textarea><button class="btn s" style="margin-top:8px" onclick="repI('+i+')">Send</button></div>'}).join(''):'<div class="row">কোনো মেসেজ নেই</div>'}).catch(aErr)}
function aUs(){api('admin/users','GET',null,ah()).then(function(d){
 $('abody').innerHTML='<div class="grid">'+sc([['আজ ঢুকেছে',d.active.length],['আজ নতুন',d.newToday]])+'</div><h3>আজ যারা ঢুকেছে</h3>'+
 (d.active.map(function(u){return '<div class="row"><div>'+esc(u.name)+'<small>'+esc(u.phone)+' · শেষ '+tm(u.seen)+'</small></div><div style="text-align:right"><b style="color:var(--grn)">+'+money(u.today)+'</b><small>ব্যালেন্স '+money(u.balance)+'</small></div></div>'}).join('')||'<div class="row">আজ কেউ ঢোকেনি</div>')}).catch(aErr)}
function aEa(){api('admin/users','GET',null,ah()).then(function(d){
 $('abody').innerHTML='<h3>আজ যারা আয় করেছে ('+d.earners.length+' জন)</h3>'+
 (d.earners.map(function(u){return '<div class="row"><div>'+esc(u.name)+'<small>'+esc(u.phone)+'</small></div><b style="color:var(--grn)">'+money(u.t)+'</b></div>'}).join('')||'<div class="row">আজ এখনো কেউ আয় করেনি</div>')+
 '<h3 style="margin-top:14px">সর্বকালের শীর্ষ আয়কারী</h3>'+
 d.top.map(function(u,i){return '<div class="row"><div>#'+(i+1)+' '+esc(u.name)+'<small>'+esc(u.phone)+' · ব্যালেন্স '+money(u.balance)+'</small></div><b style="color:var(--gold)">'+money(u.earned)+'</b></div>'}).join('')}).catch(aErr)}

document.addEventListener('DOMContentLoaded',function(){$('logoA').innerHTML=logo(88);$('logoT').innerHTML=logo(40);initG();
 if(REF)mode('reg');
 if(T)api('me').then(enter).catch(function(){$('auth').style.display='block'});else $('auth').style.display='block'});
</script></body></html>`;

app.get('/', (req, res) => res.send(PAGE.replace('__GID__', GID.replace(/[^\w.\-]/g, ''))));
app.listen(PORT, () => console.log('Server is running on port ' + PORT));
