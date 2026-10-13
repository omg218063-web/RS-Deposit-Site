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
const MIN_AGE = 18;
const CO = {
  n: 'RS Growth Matrix', e: 'omg218063@gmail.com', p: '01764024069', y: 2026,
  tg: 'rkrana33', wa: '8801764024069', fb: 'https://www.facebook.com/share/1CAK8sYqDw/', age: MIN_AGE,
  d: 'RS Growth Matrix একটি টাস্কভিত্তিক রিওয়ার্ড প্ল্যাটফর্ম। এখানে সহজ টাস্ক, দৈনিক বোনাস ও লাকি ড্রয়ের মাধ্যমে ব্যালেন্স জমিয়ে bKash বা Nagad-এ উত্তোলন করা যায়।'
};

const REF_BONUS = 10, DAILY = 2, CHECKIN = 4, MIN_WD = 300, MAX_WD = 5000, SLOTS = 50;
const PENDING_HOURS = 48;
const SPIN = [[1, 40], [2, 30], [3, 20], [5, 10]];
const MAX_USD = 5;
const COUNTRY_FILTER = true;
const TARGETS = ['BD', 'IN', 'PK', 'NP'];
const BLOCK_CATS = ['signup', 'signups', 'deposit', 'deposits', 'creditcard', 'creditcards', 'oneclick', 'multireward', 'freetrial', 'freetrials', 'shopping', 'extension', 'extensions'];
app.use(express.json({ limit: '100kb' }));

let NAMES = { boys: [], girls: [] };
try { NAMES = require('./names.js'); } catch (e) {}

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI).then(async () => {
    try { await User.syncIndexes(); } catch (e) {}
  }).catch(() => {});
}

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
const Msg = mongoose.model('Msg', new mongoose.Schema({ uid: String, name: String, from: String, text: String, at: { type: Date, default: Date.now } }));

const h = fn => (q, s) => fn(q, s).catch(e => {
  if (e && e.code === 11000) return s.status(400).json({ error: 'এই নাম বা ফোন নম্বরটি ইতিমধ্যে নিবন্ধিত।' });
  s.status(500).json({ error: 'সার্ভার ত্রুটি। আবার চেষ্টা করুন।' });
});
const bad = (s, m, c) => s.status(c || 400).json({ error: m });
const hmac = b => crypto.createHmac('sha256', SECRET).update(b).digest('hex');
const sign = id => { const b = id + '.' + (Date.now() + 30 * 864e5); return b + '.' + hmac(b); };
const hashPw = (p, salt) => crypto.scryptSync(p, salt, 32).toString('hex');
const same = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const today = () => new Date().toISOString().slice(0, 10);
const dayStart = () => { const o = 6 * 36e5, n = Date.now() + o; return new Date(n - (n % 864e5) - o); };
const me = u => ({ name: u.name, phone: u.phone || '', email: u.email || '', av: u.avatar || '', balance: u.balance, earned: u.earned, refCode: u.refCode, refEarn: u.refEarn, refCount: u.refCount, lastDaily: u.lastDaily, lastSpin: u.lastSpin || 0, checkedIn: u.lastCheckin === today(), d: DAILY, c: CHECKIN, ct: CO, pt: [OW_KEY && OW_SECRET ? 'offerwall.gg' : ''].filter(Boolean) });
const bdtFor = usd => Math.round(usd * RATE * (usd > 1 ? 0.5 : 0.7) * 100) / 100;

const auth = async (req, res, next) => {
  try {
    const [id, exp, sig] = (req.headers.authorization || '').replace('Bearer ', '').split('.');
    if (!sig || !same(sig, hmac(id + '.' + exp)) || +exp < Date.now()) throw 0;
    req.user = await User.findById(id);
    if (!req.user) throw 0;
    next();
  } catch (e) { bad(res, 'দয়া করে পুনরায় লগইন করুন।', 401); }
};
const admin = (req, res, next) => (ADMIN_PASS && same(String(req.headers['x-admin-pass'] || ''), ADMIN_PASS)) ? next() : bad(res, 'ভুল অ্যাডমিন পাসওয়ার্ড।', 403);

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
  if (n.length < 3 || n.length > 30) return bad(s, 'নাম ৩ থেকে ৩০ অক্ষরের মধ্যে হতে হবে।');
  if (!/^01\d{9}$/.test(String(phone || ''))) return bad(s, 'সঠিক ১১ ডিজিটের ফোন নম্বর দিন।');
  if (String(password || '').length < 6) return bad(s, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
  if (password !== confirm) return bad(s, 'পাসওয়ার্ড মিলছে না।');
  if (await User.exists({ nameKey: n.toLowerCase() })) return bad(s, 'এই নামটি ইতিমধ্যে ব্যবহৃত হয়েছে।');
  const salt = crypto.randomBytes(16).toString('hex');
  const u = await newUser({ name: n, nameKey: n.toLowerCase(), phone, salt, hash: hashPw(password, salt) }, ref);
  s.json({ token: sign(u.id), me: me(u) });
}));

app.post('/api/login', h(async (q, s) => {
  const { name, password } = q.body || {};
  const u = await User.findOne({ nameKey: String(name || '').trim().toLowerCase() });
  if (!u || !u.hash || !same(u.hash, hashPw(String(password || ''), u.salt))) return bad(s, 'নাম অথবা পাসওয়ার্ড ভুল।', 401);
  s.json({ token: sign(u.id), me: me(u) });
}));

app.post('/api/google', h(async (q, s) => {
  if (!GID) return bad(s, 'গুগল সাইন-ইন সেটআপ করা নেই।');
  const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(String((q.body || {}).credential || '')));
  const g = await r.json();
  if (!r.ok || g.aud !== GID || g.email_verified !== 'true') return bad(s, 'গুগল ভেরিফিকেশন ব্যর্থ হয়েছে।', 401);
  let u = await User.findOne({ email: g.email });
  if (!u) u = await newUser({ name: (g.name || g.email.split('@')[0]).slice(0, 30), email: g.email }, (q.body || {}).ref);
  s.json({ token: sign(u.id), me: me(u) });
}));

app.get('/api/me', auth, (q, s) => s.json(me(q.user)));

app.post('/api/avatar', auth, h(async (q, s) => {
  const img = String((q.body || {}).img || '');
  await User.updateOne({ _id: q.user.id }, { avatar: img });
  s.json({ av: img });
}));

app.get('/api/names/:t', auth, (q, s) => s.json(q.params.t === 'girls' ? NAMES.girls : NAMES.boys));

app.get('/api/offers', auth, h(async (q, s) => {
  s.json({ stats: { pending: 0, success: 0, cancelled: 0, total: 0 }, list: [] });
}));

app.post('/api/offers/:id/start', auth, h(async (q, s) => {
  s.json({ url: '#' });
}));

app.post('/api/daily', auth, h(async (q, s) => {
  const r = await User.findOneAndUpdate({ _id: q.user.id, lastDaily: { $lte: Date.now() - 864e5 } }, { $set: { lastDaily: Date.now() },$inc: { balance: DAILY, earned: DAILY } }, { new: true });
  if (!r) return bad(s, 'আপনি আজ ইতিমধ্যে ক্লাইম করেছেন।');
  s.json(me(r));
}));

app.post('/api/checkin', auth, h(async (q, s) => {
  const r = await User.findOneAndUpdate({ _id: q.user.id, lastCheckin: { $ne: today() } }, { $set: { lastCheckin: today() },$inc: { balance: CHECKIN, earned: CHECKIN } }, { new: true });
  if (!r) return bad(s, 'আজ ইতিমধ্যে চেক-ইন করা হয়েছে।');
  s.json(me(r));
}));

app.post('/api/spin', auth, h(async (q, s) => {
  const tot = SPIN.reduce((a, x) => a + x[1], 0);
  let r = crypto.randomInt(tot), prize = SPIN[0][0];
  for (const x of SPIN) { if (r < x[1]) { prize = x[0]; break; } r -= x[1]; }
  const u = await User.findOneAndUpdate({ _id: q.user.id, $or: [{ lastSpin: { $exists: false } }, { lastSpin: {$lte: Date.now() - 864e5 } }] }, { $set: { lastSpin: Date.now() },$inc: { balance: prize, earned: prize } }, { new: true });
  if (!u) return bad(s, 'আজ ইতিমধ্যে স্পিন করা হয়েছে।');
  s.json({ prize, me: me(u) });
}));

app.get('/api/leaderboard', auth, h(async (q, s) => {
  const realTop = await User.find({ earned: { $gt: 0 } }).sort({ earned: -1 }).limit(20).select('name earned avatar');
  s.json(realTop);
}));

app.post('/api/withdraw', auth, h(async (q, s) => {
  const { amount, method, phone } = q.body || {};
  const a = Math.floor(+amount);
  if (!(a >= MIN_WD && a <= MAX_WD)) return bad(s, 'উত্তোলনের পরিমাণ ৩০০ থেকে ৫০০০ টাকার মধ্যে হতে হবে।');
  const r = await User.findOneAndUpdate({ _id: q.user.id, balance: { $gte: a } }, {$inc: { balance: -a } }, { new: true });
  if (!r) return bad(s, 'পর্যাপ্ত ব্যালেন্স নেই।');
  await Wd.create({ uid: q.user.id, name: q.user.name, amount: a, method, phone });
  s.json(me(r));
}));

app.get('/api/withdrawals', auth, h(async (q, s) => s.json(await Wd.find({ uid: q.user.id }).sort({ at: -1 }).limit(30))));

app.post('/api/deposit', auth, h(async (q, s) => {
  const { amount, method, txid, lastDigits } = q.body || {};
  const a = Math.floor(+amount);
  if (!(a >= 100 && a <= 10000)) return bad(s, 'ডিপোজিটের পরিমাণ সঠিক দিন।');
  if (!txid || txid.length < 3) return bad(s, 'সঠিক TrxID দিন।');
  if (!lastDigits || lastDigits.length !== 3) return bad(s, 'শেষ ৩ ডিজিট সঠিক ভাবে দিন।');
  await Deposit.create({ uid: q.user.id, name: q.user.name, amount: a, method, txid, lastDigits });
  s.json({ ok: true });
}));

app.get('/api/deposits', auth, h(async (q, s) => s.json(await Deposit.find({ uid: q.user.id }).sort({ at: -1 }).limit(30))));

app.get('/api/support', auth, h(async (q, s) => s.json(await Msg.find({ uid: q.user.id }).sort({ at: 1 }).limit(100))));
app.post('/api/support', auth, h(async (q, s) => {
  const text = String((q.body || {}).text || '').trim().slice(0, 500);
  if (!text) return bad(s, 'মেসেজ লিখুন।');
  await Msg.create({ uid: q.user.id, name: q.user.name, from: 'user', text });
  s.json({ ok: true });
}));

app.get('/api/admin/data', admin, h(async (q, s) => {
  s.json({ stats: { users: await User.countDocuments(), balance: 0 } });
}));

app.get('/api/admin/wd-list', admin, h(async (q, s) => {
  s.json({ pending: await Wd.find({ status: 'pending' }), done: [] });
}));

app.get('/api/admin/dep-list', admin, h(async (q, s) => {
  s.json({ pending: await Deposit.find({ status: 'pending' }), done: await Deposit.find({ status: { $ne: 'pending' } }).limit(20) });
}));

app.get('/api/admin/support', admin, h(async (q, s) => { s.json([]); }));
app.get('/api/admin/users', admin, h(async (q, s) => { s.json({ active: [], earners: [], top: [] }); }));

app.post('/api/admin/wd/:id', admin, h(async (q, s) => {
  const x = await Wd.findOneAndUpdate({ _id: q.params.id, status: 'pending' }, { status: q.body.ok ? 'paid' : 'rejected' });
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
  const u = await User.findOneAndUpdate({ phone: String(phone).trim() }, { $inc: { balance: a, earned: a } });
  if (!u) return bad(s, 'ইউজার পাওয়া যায়নি।');
  s.json({ ok: true });
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
.brand{font-family:Georgia,serif;font-size:24px;font-weight:700;color:var(--gold);margin:6px 0 2px}
.sub{font-size:12px;color:var(--mu);margin-bottom:14px}
.seg{display:flex;background:var(--bg);border-radius:10px;padding:3px;margin-bottom:12px}
.seg div{flex:1;text-align:center;padding:8px;font-size:12px;font-weight:700;border-radius:8px;color:var(--mu);cursor:pointer}
.seg .on{background:linear-gradient(90deg,var(--gold),#f59e0b);color:#000}
label{font-size:11px;color:var(--mu);display:block;margin-top:9px}
input,select,textarea{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:11px;color:#fff;font-size:14px;margin-top:4px}
.btn{width:100%;border:0;border-radius:12px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;margin-top:12px;background:linear-gradient(90deg,var(--gold),#f59e0b);color:#000}
.btn.g{background:var(--grn);color:#fff}.btn.r{background:var(--red);color:#fff}.btn.s{width:auto;padding:6px 12px;font-size:12px;margin:0;border-radius:14px}
.or{font-size:11px;color:var(--mu);margin:14px 0 8px;text-align:center}
.top{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#131d38,#0f172a)}
.top .l{display:flex;align-items:center;gap:9px}.bal{text-align:right;font-size:17px;font-weight:800;color:var(--grn)}.bal small{display:block;font-size:10px;color:var(--mu);font-weight:400}
.av{width:40px;height:40px;border-radius:50%;border:2px solid var(--gold);background:#16213f;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden}
.av img{width:100%;height:100%;object-fit:cover}
nav{display:flex;gap:2px;padding:7px 3px 9px;background:#0b1224;position:relative;z-index:5}
nav div{flex:1;text-align:center;font-size:9px;color:var(--mu);padding:6px 0;cursor:pointer;border-radius:11px;background:linear-gradient(180deg,#18244a,#0e1730)}
nav .on{color:var(--gold);background:linear-gradient(180deg,#2a2208,#13100a);box-shadow:0 0 0 1px var(--gold)}
main{flex:1;overflow-y:auto;padding:14px}
.row{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;font-size:13px}
.row small{display:block;color:var(--mu);font-size:11px;margin-top:2px}
h3{font-size:13px;color:var(--mu);margin:4px 0 10px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.stat{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px 6px;text-align:center}
.stat b{display:block;font-size:16px;color:var(--gold)}.stat small{font-size:11px;color:var(--mu)}
.chip{font-size:10px;padding:3px 8px;border-radius:10px;background:#1e293b;color:var(--gold)}
.chip.approved,.chip.paid{color:var(--grn)}.chip.rejected,.chip.cancelled{color:var(--red)}
.share{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.share a,.share button{display:block;text-align:center;background:#1e293b;border:1px solid var(--line);border-radius:10px;padding:10px;font-size:12px;color:var(--tx);text-decoration:none;cursor:pointer}
.chat{max-height:46vh;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin-bottom:10px}
.m{padding:8px 12px;border-radius:12px;font-size:13px;max-width:85%}.m.user{background:#1e293b;align-self:flex-end}.m.support{background:#172554;color:var(--blu);align-self:flex-start}
.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:130;align-items:center;justify-content:center;padding:14px}
.modal>div{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;width:100%;max-width:410px;max-height:90vh;overflow-y:auto}
.mq{overflow:hidden;white-space:nowrap;border-radius:14px;background:linear-gradient(90deg,#2b1f04,#4a3508,#2b1f04);border:1px solid rgba(251,191,36,.55);padding:10px 0;margin-bottom:12px}
.mq span{display:inline-block;padding-left:100%;animation:mq 26s linear infinite;color:var(--gold);font-size:12.5px;font-weight:700}
@keyframes mq{to{transform:translateX(-100%)}}
.adm{display:none;position:fixed;inset:0;z-index:120;background:var(--bg);flex-direction:column;max-width:440px;margin:0 auto}
.adm.on{display:flex}
.ah{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#131d38,#0f172a)}
.ah b{color:var(--gold);font-size:15px}
#abody{flex:1;overflow-y:auto;padding:14px}
#anav{display:flex;gap:4px;padding:8px 5px 10px;background:#0b1224}
#anav div{flex:1;text-align:center;font-size:9.5px;color:var(--mu);padding:7px 0;cursor:pointer;border-radius:13px;background:linear-gradient(180deg,#18244a,#0e1730)}
#anav .on{color:var(--gold);background:linear-gradient(180deg,#2a2208,#13100a);box-shadow:0 0 0 1px var(--gold)}
.th{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:12px}
.th .hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:13px;font-weight:700}
.gap{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.wheel{position:relative;width:250px;margin:14px auto 6px}
.wheel .pt{position:absolute;top:-12px;left:50%;transform:translateX(-50%);font-size:28px;color:#fbbf24;z-index:3}
@keyframes rot{to{transform:rotate(360deg)}}
</style></head><body>
<div class="app">
<div id="auth">
  <div id="logoA"></div><div class="brand">RS Growth Matrix</div><div class="sub">Complete tasks. Earn rewards. Withdraw.</div>
  <div class="card">
    <div class="seg"><div id="tReg" class="on" onclick="mode('reg')">Register</div><div id="tLog" onclick="mode('log')">Login</div></div>
    <div id="fReg">
      <label>Name</label><input id="rN" autocomplete="username" placeholder="Your name">
      <label>Phone number</label><input id="rP" inputmode="numeric" maxlength="11" placeholder="01XXXXXXXXX">
      <label>Password</label><input id="rW" type="password" autocomplete="new-password">
      <label>Confirm password</label><input id="rC" type="password" autocomplete="new-password">
      <button class="btn g" onclick="reg()">Confirm</button>
    </div>
    <div id="fLog" style="display:none">
      <label>Name</label><input id="lN" autocomplete="username">
      <label>Password</label><input id="lW" type="password" autocomplete="current-password">
      <button class="btn" onclick="login()">Login</button>
    </div>
    <div style="color:var(--red);font-size:12px;margin-top:8px" id="aErr"></div>
    <div id="gWrap"><div class="or">or continue with</div><div id="gBtn" style="display:flex;justify-content:center"></div></div>
  </div>
</div>
<div class="top"><div class="l"><div id="logoT"></div><div class="av" id="avT" onclick="$('avf').click()">📷</div><div><b id="hName"></b><small style="color:var(--gold);font-size:11px">Member</small></div></div><div class="bal"><span id="hBal">0.00</span><small>Balance (BDT)</small></div></div>
<input type="file" id="avf" accept="image/*" style="display:none" onchange="avUp(this)">
<nav id="nav"></nav>
<main id="main"></main>
</div>
<div class="adm" id="adm"><div class="ah"><b>Admin Panel</b><button class="btn s" onclick="admClose()">Close</button></div><div id="abody"></div><div id="anav"></div></div>
<div class="modal" id="modal"><div id="mBody"></div></div>
<script>
var GID='__GID__',T=localStorage.getItem('t'),ME=null,TAB='home',LC=0,ROT=0,SPUN=false,TWU='';
var SEG=[['iPhone 18',10],['1৳',25],['Watch',10],['2৳',20],['Laptop',10],['3৳',20],['Bluetooth',10],['5৳',15]];
var REF=new URLSearchParams(location.search).get('ref')||localStorage.getItem('ref')||'';
if(REF)localStorage.setItem('ref',REF);
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function money(n){return Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function logo(s){var g='lg'+(LC++);return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 100 100"><defs><linearGradient id="'+g+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#b45309"/></linearGradient></defs><path d="M50 4 90 20v30c0 25-17 42-40 48C27 92 10 75 10 50V20z" fill="#0b1020" stroke="url(#'+g+')" stroke-width="4"/><text x="50" y="60" text-anchor="middle" font-size="34" font-weight="800" fill="url(#'+g+')" font-family="Georgia,serif">RS</text></svg>'}
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

var TABS=[['home','🏠','Home'],['tasks','📋','Tasks'],['pkg','📦','Package'],['rank','🏆','Ranking'],['ref','👥','Refer'],['help','💬','Support'],['acc','👤','Account']];
function enter(m){ME=m;$('auth').style.display='none';$('nav').innerHTML=TABS.map(function(t){return '<div id="n_'+t[0]+'" onclick="go(\\'"+t[0]+"\\')"><i>'+t[1]+'</i>'+t[2]+'</div>'.replace(/"/g, "'")}).join('');head();go('home')}
function head(){$('hName').textContent=ME.name;$('hBal').textContent=money(ME.balance);$('avT').innerHTML=ME.av?'<img src="'+esc(ME.av)+'" alt="">':'📷'}
function go(t){TABS.forEach(function(x){$('n_'+x[0]).className=x[0]===t?'on':''});({home:vHome,tasks:vTasks,pkg:vPkg,rank:vRank,ref:vRef,help:vHelp,acc:vAcc})[t]()}
function toast(m){alert(m)}

function avUp(inp){var f=inp.files[0];if(!f)return;var r=new FileReader();
 r.onload=function(){api('avatar','POST',{img:r.result}).then(function(d){ME.av=d.av;head()}).catch(function(e){toast(e.message)})};
 r.readAsDataURL(f);inp.value=''}

function vHome(){var ok=Date.now()-ME.lastDaily>=864e5,sp=Date.now()-(ME.lastSpin||0)>=864e5;
 $('main').innerHTML='<div class="mq"><span>✨ RS Growth Matrix-এ স্বাগতম! প্রতিদিন টাস্ক করুন এবং লাকি স্পিন থেকে পুরস্কার জিতুন। 🚀</span></div>'+
 '<div class="grid"><div class="stat"><b>'+money(ME.balance)+'</b><small>Balance</small></div><div class="stat"><b>'+money(ME.earned)+'</b><small>Total earned</small></div></div>'+
 '<div class="card" style="margin-bottom:12px;text-align:center"><span style="font-size:36px">🎡</span><b>Lucky Draw (Grand Prizes)</b><div style="font-size:12px;color:var(--mu);margin:4px 0 8px">আইফোন ১৮, ঘড়ি, ল্যাপটপ, ব্লুটুথ এবং ক্যাশ প্রাইজ!</div><button class="btn s" onclick="spinOpen()">'+(sp?'Spin Now':'Done ✅')+'</button></div>'+
 '<h3>আজকের বোনাস</h3><div class="grid">'+
 '<div class="stat"><b>Login Bonus</b><small>+'+ME.d+' BDT</small><button class="btn'+(ok?'':'" style="opacity:.5')+'" onclick="act(\\'daily\\')">'+(ok?'Claim':'Claimed')+'</button></div>'+
 '<div class="stat"><b>Check-in</b><small>+'+ME.c+' BDT</small><button class="btn'+(ME.checkedIn?'" style="opacity:.5':'')+'" onclick="act(\\'checkin\\')">'+(ME.checkedIn?'Done':'Check in')+'</button></div></div>'}
function act(p){api(p,'POST').then(function(m){ME=m;head();vHome();toast('বোনাস যোগ হয়েছে।')}).catch(function(e){toast(e.message)})}

function wheelSvg(){var cols=['#b45309','#1e3a8a','#14532d','#7c2d12','#4c1d95','#0c4a6e','#78350f','#164e63'];
 var h='<svg viewBox="0 0 200 200" width="250" height="250" id="whs" style="display:block;transition:transform 4.5s cubic-bezier(.17,.67,.12,1);transform:rotate('+ROT+'deg)"><circle cx="100" cy="100" r="98" fill="#0b1224" stroke="#fbbf24" stroke-width="3"/>';
 for(var i=0;i<8;i++){h+='<g transform="rotate('+(i*45+22.5)+' 100 100)"><path d="M100 100L63.65 12.23A95 95 0 0 1 136.35 12.23Z" fill="'+cols[i]+'" stroke="#fbbf24" stroke-width="1.2"/><text x="100" y="44" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">'+SEG[i][0]+'</text></g>'}
 return h+'<circle cx="100" cy="100" r="15" fill="#0b1224" stroke="#fbbf24" stroke-width="3"/><text x="100" y="105" text-anchor="middle" font-size="12">🎁</text></svg>'}
function spinOpen(){SPUN=false;var ok=Date.now()-(ME.lastSpin||0)>=864e5;
 modal('<h3 style="color:var(--gold);text-align:center">🎡 Grand Prize Lucky Draw</h3><div class="wheel"><div class="pt">▼</div>'+wheelSvg()+'</div><div id="spmsg" style="text-align:center;font-size:13px;margin:6px 0">'+(ok?'চাকা ঘোরাতে Spin চাপুন':'আজকের স্পিন শেষ।')+'</div><button id="spb" class="btn"'+(ok?'':' disabled style="opacity:.5"')+' onclick="doSpin()">Spin</button><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">Close</button>'}
function doSpin(){if(SPUN)return;SPUN=true;
 api('spin','POST').then(function(r){var c=[1,3,5,7];var i=c[Math.floor(Math.random()*c.length)];
  ROT=Math.ceil(ROT/360)*360+1800-(i*45+22.5);$('whs').style.transform='rotate('+ROT+'deg)';
  setTimeout(function(){ME=r.me;head();$('spmsg').innerHTML='🎉 অভিনন্দন! আপনি জিতেছেন <b style="color:#fbbf24">'+r.prize+' টাকা</b>'},4700)})
 .catch(function(e){SPUN=false;toast(e.message);closeM()})}
function closeM(){$('modal').style.display='none'}

function vTasks(){$('main').innerHTML='<h3>Tasks</h3><div class="row">এই মুহূর্তে কোনো টাস্ক নেই।</div>'}
function modal(h){$('mBody').innerHTML=h;$('modal').style.display='flex'}

function vPkg(){var pkgs=[
 {p:200,c:2000,b:200},{p:300,c:3000,b:300},{p:500,c:5000,b:600},{p:800,c:8000,b:1000},
 {p:1200,c:12000,b:1600},{p:1500,c:15000,b:2000},{p:2000,c:20000,b:2800},{p:3000,c:30000,b:4500}
];
$('main').innerHTML='<h3 style="color:var(--gold)">RS PACKAGE SYSTEM</h3>' +
pkgs.map(function(x){return '<div class="card" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;align-items:center"><div><b style="color:var(--gold);font-size:16px">৳ '+x.p+'</b><div style="font-size:12px;color:#fff">Coins: '+x.c+' | Bonus: +'+x.b+'</div></div><button class="btn s g" onclick="go(\\'acc\\'); depForm('+x.p+')">Buy Now</button></div></div>'}).join('');
}

function vRank(){$('main').innerHTML='<h3>Top Earners</h3><div id="rk">Loading...</div>';
 api('leaderboard').then(function(a){if(!a.length){$('rk').innerHTML='<div class="row">কেউ নেই।</div>';return}
 var crowns=['👑👑👑','👑👑','👑'];
 $('rk').innerHTML=a.map(function(u,i){return '<div class="row"><div>'+(crowns[i]||('#'+(i+1)))+' '+esc(u.name)+'</div><b style="color:var(--grn)">'+money(u.earned)+'</b></div>'}).join('')}).catch(function(){})}

function vRef(){var link=location.origin+'/?ref='+ME.refCode;window.RL=link;
 $('main').innerHTML='<h3>Invite & Earn</h3><div class="card" style="text-align:center"><input readonly id="rl" value="'+esc(link)+'"><button class="btn" onclick="navigator.clipboard.writeText(RL);toast(\'লিংক কপি হয়েছে\')">Copy Link</button></div>'+
 '<div class="grid" style="margin-top:10px"><div class="stat"><b>'+ME.refCount+'</b><small>Friends</small></div><div class="stat"><b>'+money(ME.refEarn)+'</b><small>Earned</small></div></div>'+
 '<h3 style="margin-top:12px">লাইভ রেফারেল ট্রানজেকশন</h3>'+
 '<div style="background:#131d38;border:1px solid var(--gold);border-radius:12px;padding:12px;text-align:center;color:var(--gold)">⚡ Tanvir got 10 BDT referral bonus!</div>';
}

function vHelp(){$('main').innerHTML='<h3>Support</h3><div class="chat" id="ch"></div><textarea id="st" rows="2" placeholder="আপনার সমস্যা লিখুন"></textarea><button class="btn" onclick="sendS()">Send</button>';
 api('support').then(function(a){$('ch').innerHTML=a.length?a.map(function(m){return '<div class="m '+m.from+'">'+esc(m.text)+'</div>'}).join(''):'<div class="m support">স্বাগতম! কোনো সমস্যা হলে জানান।</div>'})}
function sendS(){api('support','POST',{text:$('st').value}).then(function(){$('st').value='';vHelp()}).catch(function(e){toast(e.message)})

function vAcc(){
 var globEvents=['[Tanvir] withdrew 500 BDT','[Rakib] deposited 1000 BDT','[Sumaiya] got Daily Bonus!','[Farhan] upgraded VIP Package'];
 var gEv=globEvents[Math.floor(Math.random()*globEvents.length)];
 
 $('main').innerHTML='<h3>My Account</h3><div class="row"><div>'+esc(ME.name)+'<small>'+esc(ME.phone||ME.email)+'</small></div><button class="btn s" onclick="out()">Logout</button></div>'+
 '<div class="grid"><div class="stat"><b>'+money(ME.balance)+'</b><small>Balance</small></div><div class="stat"><b>'+money(ME.earned)+'</b><small>Total earned</small></div></div>'+
 '<div style="display:flex;gap:8px"><button class="btn r" style="flex:1" onclick="wdForm()">Withdraw</button><button class="btn g" style="flex:1" onclick="depForm()">Deposit</button></div>'+
 '<div style="margin:10px 0;background:#131d38;border:1px solid var(--grn);border-radius:12px;padding:10px;text-align:center"><b style="color:var(--grn);font-size:11px">🌐 Global Live Transaction</b><div style="font-size:12px;color:#fff;margin-top:2px">'+gEv+'</div></div>'+
 '<h3 style="margin-top:14px">Withdraw History</h3><div id="wh">Loading...</div>'+
 '<h3 style="margin-top:14px">Deposit History</h3><div id="dh">Loading...</div>'+
 '<button class="btn" style="background:#1e293b;color:#fff;margin-top:14px" onclick="admOpen()">Admin Panel</button>';

 api('withdrawals').then(function(a){$('wh').innerHTML=a.length?a.map(function(w){return '<div class="row"><div>'+esc(w.method)+' '+esc(w.phone)+'</div><div>'+money(w.amount)+' <span class="chip '+w.status+'">'+w.status+'</span></div></div>'}).join(''):'<div class="row">কোনো উত্তোলন নেই</div>'});
 api('deposits').then(function(a){$('dh').innerHTML=a.length?a.map(function(d){return '<div class="row"><div>'+esc(d.method)+' (Trx: ...'+esc(d.lastDigits)+')</div><div>'+money(d.amount)+' <span class="chip '+d.status+'">'+d.status+'</span></div></div>'}).join(''):'<div class="row">কোনো ডিপোজিট নেই</div>'})}

function wdForm(){modal('<h3>Withdraw (300 - 5000 BDT)</h3><label>Method</label><select id="wm"><option>bKash</option><option>Nagad</option></select><label>Amount</label><input id="wa" type="number"><label>Number</label><input id="wp" value="'+esc(ME.phone)+'"><button class="btn r" onclick="doWd()">Send Request</button><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">Close</button>')}
function doWd(){api('withdraw','POST',{method:$('wm').value,amount:$('wa').value,phone:$('wp').value}).then(function(m){ME=m;head();closeM();toast('রিকোয়েস্ট পাঠানো হয়েছে।');vAcc()}).catch(function(e){toast(e.message)})

function depForm(preVal){
  var numbers=['01781682016 (Nagad Only)','01811223344 (bKash/Nagad)','01922334455 (bKash/Nagad)'];
  var numIdx=0;
  modal('<h3>Deposit Balance</h3><div style="background:#131d38;border:1px solid var(--gold);padding:8px;border-radius:10px;text-align:center;font-size:12px;margin-bottom:8px">Send Money to:<br><b id="rotNum" style="color:var(--grn);font-size:15px">'+numbers[0]+'</b></div>'+
  '<label>Method</label><select id="dm"><option>bKash</option><option>Nagad</option></select>'+
  '<label>Amount</label><input id="da" type="number" value="'+(preVal||'')+'">'+
  '<div style="display:flex;gap:4px;margin-top:6px">'+[100,300,500,1000,2000].map(function(x){return '<button class="btn s" style="flex:1;background:#1e293b;color:var(--gold)" onclick="$(\\'da\\').value='+x+'">'+x+'৳</button>'}).join('')+'</div>'+
  '<label>Transaction ID (TrxID)</label><input id="dtx" placeholder="Full TrxID">'+
  '<label>Last 3 Digits of Sender Number</label><input id="dlast" maxlength="3" inputmode="numeric" placeholder="e.g. 016">'+
  '<button class="btn g" onclick="doDep()">Submit Deposit</button><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">Close</button>');
  window.NUM_ROT=setInterval(function(){numIdx=(numIdx+1)%numbers.length;var el=$('rotNum');if(el)el.textContent=numbers[numIdx];}, 4000);
}
function doDep(){clearInterval(window.NUM_ROT);api('deposit','POST',{method:$('dm').value,amount:$('da').value,txid:$('dtx').value,lastDigits:$('dlast').value}).then(function(){closeM();toast('ডিপোজিট সফলভাবে জমা হয়েছে।');vAcc()}).catch(function(e){toast(e.message)})

var ATABS=[['ov','📊','ওভারভিউ'],['wd','💸','উত্তোলন'],['dep','💳','ডিপোজিট'],['bn','🎁','বোনাস']];
var ADM='';
function admOpen(){var p=prompt('Admin password');if(!p)return;ADM=p;$('adm').className='adm on';
 $('anav').innerHTML=ATABS.map(function(t){return '<div id="a_'+t[0]+'" onclick="admGo(\\'"+t[0]+"\\')"><i>'+t[1]+'</i>'+t[2]+'</div>'.replace(/"/g, "'")}).join('');admGo('ov')}
function admClose(){$('adm').className='adm'}
function admGo(t){ATABS.forEach(function(x){$('a_'+x[0]).className=x[0]===t?'on':''});({ov:aOv,wd:aWd,dep:aDep,bn:aBn})[t]()}
function aOv(){api('admin/data','GET',null,{'x-admin-pass':ADM}).then(function(d){$('abody').innerHTML='<h3>ওভারভিউ</h3><div class="row">মোট ইউজার: '+d.stats.users+'</div>'}).catch(function(e){toast(e.message);admClose()})}
function aWd(){api('admin/wd-list','GET',null,{'x-admin-pass':ADM}).then(function(d){$('abody').innerHTML='<h3>উত্তোলন রিকোয়েস্ট</h3>'+(d.pending.map(function(w,i){return '<div class="th"><b>'+w.name+'</b> - '+w.amount+' BDT<br>'+w.phone+'<div class="gap"><button class="btn s g" onclick="api(\\'admin/wd/'+w._id+'\\',\'POST\',{ok:true},{\\'x-admin-pass\\':\\''+ADM+'\\'}).then(aWd)">Paid</button><button class="btn s r" onclick="api(\\'admin/wd/'+w._id+'\\',\'POST\',{ok:false},{\\'x-admin-pass\\':\\''+ADM+'\\'}).then(aWd)">Reject</button></div></div>'}).join('')||'<div class="row">কোনো রিকোয়েস্ট নেই</div>')})}
function aDep(){api('admin/dep-list','GET',null,{'x-admin-pass':ADM}).then(function(d){$('abody').innerHTML='<h3>ডিপোজিট রিকোয়েস্ট</h3>'+(d.pending.map(function(dep,i){return '<div class="th"><b>'+dep.name+'</b> - '+dep.amount+' BDT<br>Trx: '+dep.txid+' (শেষ ৩: '+dep.lastDigits+')<div class="gap"><button class="btn s g" onclick="api(\\'admin/dep/'+dep._id+'\\',\'POST\',{ok:true},{\\'x-admin-pass\\':\\''+ADM+'\\'}).then(aDep)">Approve</button><button class="btn s r" onclick="api(\\\'admin/dep/'+dep._id+'\\',\'POST\',{ok:false},{\\'x-admin-pass\\':\\''+ADM+'\\'}).then(aDep)">Reject</button></div></div>'}).join('')||'<div class="row">কোনো ডিপোজিট নেই</div>')})}
function aBn(){$('abody').innerHTML='<h3>ইউজারকে বোনাস দিন</h3><label>Phone</label><input id="bp" placeholder="01XXXXXXXXX"><label>Amount</label><input id="ba" type="number"><button class="btn g" onclick="api(\\'admin/bonus\\',\'POST\',{phone:$(\\'bp\\').value,amount:$(\\'ba\\').value},{\\'x-admin-pass\\':\\''+ADM+'\\'}).then(function(){toast(\'বোনাস দেওয়া হয়েছে\')})">Send Bonus</button>'}

document.addEventListener('DOMContentLoaded',function(){$('logoA').innerHTML=logo(88);$('logoT').innerHTML=logo(40);initG();
 if(REF)mode('reg');
 if(T)api('me').then(enter).catch(function(){$('auth').style.display='block'});else $('auth').style.display='block'});
</script></body></html>`;

app.get('/', (req, res) => res.send(PAGE.replace('__GID__', GID.replace(/[^\w.\-]/g, ''))));
app.listen(PORT, () => console.log('Server is running on port ' + PORT));
