const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 10000;
const SECRET = process.env.SECRET || crypto.randomBytes(32).toString('hex');
const ADMIN_PASS = process.env.ADMIN_PASSWORD || '';
const GID = process.env.GOOGLE_CLIENT_ID || '';
const REF_BONUS = 10, DAILY = 30, CHECKIN = 10, MIN_WD = 300, MAX_WD = 5000;
app.use(express.json({ limit: '100kb' }));

if (!process.env.MONGO_URI) console.error('MONGO_URI is not set: accounts cannot be saved.');
else mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected')).catch(e => console.error('MongoDB error:', e.message));

const User = mongoose.model('User', new mongoose.Schema({
  name: String, nameKey: { type: String, unique: true, sparse: true }, phone: String,
  email: { type: String, unique: true, sparse: true }, hash: String, salt: String,
  balance: { type: Number, default: 0 }, earned: { type: Number, default: 0 },
  refCode: { type: String, unique: true }, refBy: String,
  refEarn: { type: Number, default: 0 }, refCount: { type: Number, default: 0 },
  lastDaily: { type: Number, default: 0 }, lastCheckin: String, created: { type: Date, default: Date.now }
}));
const Sub = mongoose.model('Sub', new mongoose.Schema({ uid: String, name: String, taskId: Number, reward: Number, proof: String, status: { type: String, default: 'pending' }, at: { type: Date, default: Date.now } }));
const Wd = mongoose.model('Wd', new mongoose.Schema({ uid: String, name: String, amount: Number, method: String, phone: String, status: { type: String, default: 'pending' }, at: { type: Date, default: Date.now } }));
const Msg = mongoose.model('Msg', new mongoose.Schema({ uid: String, name: String, from: String, text: String, at: { type: Date, default: Date.now } }));

// Replace the links below with your real task links.
const TASKS = [
  { id: 1, title: 'Subscribe to our YouTube channel', reward: 50, link: 'https://youtube.com/@SproutGigsTaskOfficial', desc: '1. Open the link and subscribe.\n2. Watch the video and like it.\n3. Write your YouTube username as proof.' },
  { id: 2, title: 'Like and follow our Facebook page', reward: 40, link: 'https://facebook.com/SproutGigsOfficialTask', desc: '1. Open the page, like it and follow it.\n2. Write your Facebook profile name or link as proof.' }
];

const h = fn => (q, s) => fn(q, s).catch(e => { console.error(e); s.status(500).json({ error: 'Server error. Please try again.' }); });
const bad = (s, m, c) => s.status(c || 400).json({ error: m });
const hmac = b => crypto.createHmac('sha256', SECRET).update(b).digest('hex');
const sign = id => { const b = id + '.' + (Date.now() + 30 * 864e5); return b + '.' + hmac(b); };
const hashPw = (p, salt) => crypto.scryptSync(p, salt, 32).toString('hex');
const same = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const today = () => new Date().toISOString().slice(0, 10);
const credit = (id, n) => User.updateOne({ _id: id }, { $inc: { balance: n, earned: n } });
const me = u => ({ name: u.name, phone: u.phone || '', email: u.email || '', balance: u.balance, earned: u.earned, refCode: u.refCode, refEarn: u.refEarn, refCount: u.refCount, lastDaily: u.lastDaily, checkedIn: u.lastCheckin === today() });

const auth = async (req, res, next) => {
  try {
    const [id, exp, sig] = (req.headers.authorization || '').replace('Bearer ', '').split('.');
    if (!sig || !same(sig, hmac(id + '.' + exp)) || +exp < Date.now()) throw 0;
    req.user = await User.findById(id);
    if (!req.user) throw 0;
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

app.get('/api/tasks', auth, h(async (q, s) => {
  const subs = await Sub.find({ uid: q.user.id });
  s.json(TASKS.map(t => { const x = subs.filter(v => v.taskId === t.id && v.status !== 'rejected')[0]; return { ...t, status: x ? x.status : 'open' }; }));
}));

app.post('/api/tasks/:id/submit', auth, h(async (q, s) => {
  const t = TASKS.find(v => v.id === +q.params.id);
  const proof = String((q.body || {}).proof || '').trim().slice(0, 300);
  if (!t) return bad(s, 'Task not found.', 404);
  if (!proof) return bad(s, 'Please enter your proof.');
  if (await Sub.exists({ uid: q.user.id, taskId: t.id, status: { $in: ['pending', 'approved'] } })) return bad(s, 'You already submitted this task.');
  await Sub.create({ uid: q.user.id, name: q.user.name, taskId: t.id, reward: t.reward, proof });
  s.json({ ok: true });
}));

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

app.get('/api/admin/data', admin, h(async (q, s) => s.json({
  subs: await Sub.find({ status: 'pending' }).sort({ at: 1 }).limit(50),
  wds: await Wd.find({ status: 'pending' }).sort({ at: 1 }).limit(50),
  msgs: await Msg.find({ from: 'user' }).sort({ at: -1 }).limit(30)
})));
app.post('/api/admin/sub/:id', admin, h(async (q, s) => {
  const x = await Sub.findOneAndUpdate({ _id: q.params.id, status: 'pending' }, { status: q.body.ok ? 'approved' : 'rejected' });
  if (x && q.body.ok) await credit(x.uid, x.reward);
  s.json({ ok: true });
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
main{flex:1;overflow-y:auto;padding:14px}
.row{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px}
.row small{display:block;color:var(--mu);font-size:11px;margin-top:2px}
h3{font-size:13px;color:var(--mu);margin:4px 0 10px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.stat{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px;text-align:center}.stat b{display:block;font-size:16px;color:var(--gold)}.stat small{font-size:11px;color:var(--mu)}
.pod{display:flex;gap:8px;align-items:flex-end;margin-bottom:14px}
.pod div{flex:1;text-align:center;border-radius:16px;padding:14px 6px;background:#131d38;border:1px solid var(--line);font-size:12px}
.pod .p1{border-color:var(--gold);padding-bottom:26px;background:linear-gradient(180deg,rgba(251,191,36,.18),#131d38)}
.pod b{display:block;color:var(--gold);font-size:14px;margin-top:4px}
.chip{font-size:10px;padding:3px 8px;border-radius:10px;background:#1e293b;color:var(--gold)}
.chip.approved,.chip.paid{color:var(--grn)}.chip.rejected{color:var(--red)}
.share{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.share a,.share button{display:block;text-align:center;background:#1e293b;border:1px solid var(--line);border-radius:10px;padding:10px;font-size:12px;color:var(--tx);text-decoration:none;cursor:pointer}
.chat{max-height:46vh;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin-bottom:10px}
.m{padding:8px 12px;border-radius:12px;font-size:13px;max-width:85%}.m.user{background:#1e293b;align-self:flex-end}.m.support{background:#172554;color:var(--blu);align-self:flex-start}
.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:100;align-items:center;justify-content:center;padding:14px}
.modal>div{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;width:100%;max-width:410px;max-height:90vh;overflow-y:auto}
pre{white-space:pre-wrap;font-size:12px;color:#e2e8f0;line-height:1.5;margin:8px 0}
.err{color:var(--red);font-size:12px;margin-top:8px;min-height:14px}
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
<div class="modal" id="modal"><div id="mBody"></div></div>
<script>
var GID='__GID__',T=localStorage.getItem('t'),ME=null,ADM='',TAB='home',TIMER=null;
var REF=new URLSearchParams(location.search).get('ref')||localStorage.getItem('ref')||'';
if(REF)localStorage.setItem('ref',REF);
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function money(n){return Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function logo(s){return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 100 100" aria-label="RS Growth Matrix"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#b45309"/></linearGradient></defs><path d="M50 4 90 20v30c0 25-17 42-40 48C27 92 10 75 10 50V20z" fill="#0b1020" stroke="url(#lg)" stroke-width="4"/><text x="50" y="60" text-anchor="middle" font-size="34" font-weight="800" fill="url(#lg)" font-family="Georgia,serif">RS</text><path d="M30 71h40M38 77h24" stroke="url(#lg)" stroke-width="2.5" stroke-linecap="round"/></svg>'}
function api(p,m,b,hd){hd=hd||{};hd['Content-Type']='application/json';if(T)hd.Authorization='Bearer '+T;
 return fetch('/api/'+p,{method:m||'GET',headers:hd,body:b?JSON.stringify(b):undefined}).then(function(r){return r.json().then(function(d){if(r.status===401&&T){out();throw new Error(d.error)}if(!r.ok)throw new Error(d.error||'Error');return d})})}
function out(){localStorage.removeItem('t');T=null;ME=null;$('auth').style.display='block'}
function mode(m){$('tReg').className=m==='reg'?'on':'';$('tLog').className=m==='log'?'on':'';$('fReg').style.display=m==='reg'?'block':'none';$('fLog').style.display=m==='log'?'block':'none';$('aErr').textContent=''}
function done(d){T=d.token;localStorage.setItem('t',T);localStorage.removeItem('ref');enter(d.me)}
function fail(e){$('aErr').textContent=e.message}
function reg(){api('register','POST',{name:$('rN').value,phone:$('rP').value,password:$('rW').value,confirm:$('rC').value,ref:REF}).then(done).catch(fail)}
function login(){api('login','POST',{name:$('lN').value,password:$('lW').value}).then(done).catch(fail)}
function gCb(r){api('google','POST',{credential:r.credential,ref:REF}).then(done).catch(fail)}
function initG(){if(!GID){$('gWrap').style.display='none';return}
 if(!window.google||!google.accounts){return setTimeout(initG,400)}
 google.accounts.id.initialize({client_id:GID,callback:gCb});google.accounts.id.renderButton($('gBtn'),{theme:'filled_black',size:'large',text:'continue_with',width:280})}
var TABS=[['home','🏠','Home'],['tasks','📋','Tasks'],['rank','🏆','Ranking'],['ref','👥','Refer'],['help','💬','Support'],['acc','👤','Account']];
function enter(m){ME=m;$('auth').style.display='none';$('nav').innerHTML=TABS.map(function(t){return '<div id="n_'+t[0]+'" onclick="go(\\''+t[0]+'\\')"><i>'+t[1]+'</i>'+t[2]+'</div>'}).join('');head();go('home')}
function head(){$('hName').textContent=ME.name;$('hBal').textContent=money(ME.balance)}
function go(t){TAB=t;clearInterval(TIMER);TABS.forEach(function(x){$('n_'+x[0]).className=x[0]===t?'on':''});({home:vHome,tasks:vTasks,rank:vRank,ref:vRef,help:vHelp,acc:vAcc})[t]()}
function toast(m){alert(m)}
function vHome(){var ok=Date.now()-ME.lastDaily>=864e5;
 $('main').innerHTML='<div class="grid"><div class="stat"><b>'+money(ME.balance)+'</b><small>Balance</small></div><div class="stat"><b>'+money(ME.earned)+'</b><small>Total earned</small></div></div>'+
 '<h3>Today</h3><div class="row"><div>Daily task<small>Claim once every 24 hours</small></div><button class="btn s" onclick="act(\\'daily\\')">'+(ok?'Claim':'Claimed')+'</button></div>'+
 '<div class="row"><div>Daily check-in<small>Login bonus, once per day</small></div><button class="btn s" onclick="act(\\'checkin\\')">'+(ME.checkedIn?'Done':'Check in')+'</button></div>'+
 '<div class="row"><div>Micro tasks<small>Subscribe, follow, and earn</small></div><button class="btn s" onclick="go(\\'tasks\\')">Open</button></div>'+
 '<div class="row"><div>Invite friends<small>Earn a bonus for every signup</small></div><button class="btn s" onclick="go(\\'ref\\')">Invite</button></div>'}
function act(p){api(p,'POST').then(function(m){ME=m;head();vHome();toast('Reward added to your balance.')}).catch(function(e){toast(e.message)})}
function vTasks(){$('main').innerHTML='<h3>Micro tasks</h3><div id="tl">Loading...</div>';
 api('tasks').then(function(a){window.TK=a;$('tl').innerHTML=a.map(function(t){var b=t.status==='open'?'<button class="btn s" onclick="openT('+t.id+')">Start</button>':'<span class="chip '+t.status+'">'+t.status+'</span>';
 return '<div class="row"><div>'+esc(t.title)+'<small>Reward: '+t.reward+' BDT</small></div>'+b+'</div>'}).join('')}).catch(function(e){$('tl').textContent=e.message})}
function modal(h){$('mBody').innerHTML=h;$('modal').style.display='flex'}
function closeM(){$('modal').style.display='none'}
function openT(id){var t=TK.filter(function(x){return x.id===id})[0];
 modal('<h3 style="color:var(--gold)">'+esc(t.title)+'</h3><pre>'+esc(t.desc)+'</pre><a href="'+esc(t.link)+'" target="_blank" rel="noopener" style="color:var(--gold);word-break:break-all;font-size:13px">'+esc(t.link)+'</a><label>Your proof (username, name or link)</label><textarea id="pf" rows="3" maxlength="300"></textarea><button class="btn g" onclick="sendP('+id+')">Submit proof (+'+t.reward+' BDT after review)</button><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">Close</button>')}
function sendP(id){api('tasks/'+id+'/submit','POST',{proof:$('pf').value}).then(function(){closeM();toast('Submitted. Your reward is added once the proof is approved.');vTasks()}).catch(function(e){toast(e.message)})}
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
 '<button class="btn" style="background:#1e293b;color:#fff" onclick="admin()">Admin panel</button>';
 api('withdrawals').then(function(a){$('wh').innerHTML=a.length?a.map(function(w){return '<div class="row"><div>'+esc(w.method)+' '+esc(w.phone)+'<small>'+new Date(w.at).toLocaleDateString()+'</small></div><div>'+money(w.amount)+' <span class="chip '+w.status+'">'+w.status+'</span></div></div>'}).join(''):'<div class="row">No withdrawals yet.</div>'})}
function wdForm(){modal('<h3 style="color:var(--gold)">Withdraw (300 - 5000 BDT)</h3><label>Method</label><select id="wm"><option>bKash</option><option>Nagad</option></select><label>Amount</label><input id="wa" type="number" inputmode="numeric"><label>Your bKash/Nagad number</label><input id="wp" maxlength="11" inputmode="numeric" value="'+esc(ME.phone)+'"><button class="btn r" onclick="doWd()">Send request</button><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">Close</button>')}
function doWd(){api('withdraw','POST',{method:$('wm').value,amount:$('wa').value,phone:$('wp').value}).then(function(m){ME=m;head();closeM();toast('Withdraw request sent.');vAcc()}).catch(function(e){toast(e.message)})}
function admin(){var p=prompt('Admin password');if(!p)return;ADM=p;loadAdm()}
function ah(){return{'x-admin-pass':ADM}}
function loadAdm(){api('admin/data','GET',null,ah()).then(function(d){
 modal('<h3 style="color:var(--gold)">Task proofs</h3>'+(d.subs.map(function(x){return '<div class="row"><div>'+esc(x.name)+' - task '+x.taskId+'<small>'+esc(x.proof)+'</small></div><div><button class="btn s g" onclick="dec(\\'sub\\',\\''+x._id+'\\',1)">OK</button> <button class="btn s r" onclick="dec(\\'sub\\',\\''+x._id+'\\',0)">No</button></div></div>'}).join('')||'<div class="row">None</div>')+
 '<h3>Withdrawals</h3>'+(d.wds.map(function(x){return '<div class="row"><div>'+esc(x.name)+' '+x.amount+'<small>'+esc(x.method)+' '+esc(x.phone)+'</small></div><div><button class="btn s g" onclick="dec(\\'wd\\',\\''+x._id+'\\',1)">Paid</button> <button class="btn s r" onclick="dec(\\'wd\\',\\''+x._id+'\\',0)">Reject</button></div></div>'}).join('')||'<div class="row">None</div>')+
 '<h3>Support messages</h3>'+(d.msgs.map(function(x){return '<div class="row"><div>'+esc(x.name)+'<small>'+esc(x.text)+'</small></div><button class="btn s" onclick="rep(\\''+x.uid+'\\')">Reply</button></div>'}).join('')||'<div class="row">None</div>')+
 '<button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">Close</button>')}).catch(function(e){toast(e.message)})}
function dec(t,id,ok){api('admin/'+t+'/'+id,'POST',{ok:!!ok},ah()).then(loadAdm)}
function rep(uid){var t=prompt('Reply');if(t)api('admin/reply','POST',{uid:uid,text:t},ah()).then(function(){toast('Sent')})}
document.addEventListener('DOMContentLoaded',function(){$('logoA').innerHTML=logo(88);$('logoT').innerHTML=logo(40);initG();
 if(REF)mode('reg');
 if(T)api('me').then(enter).catch(function(){$('auth').style.display='block'});else $('auth').style.display='block'});
</script></body></html>`;

app.get('/', (req, res) => res.send(PAGE.replace('__GID__', GID.replace(/[^\w.\-]/g, ''))));
app.listen(PORT, () => console.log('Server is running on port ' + PORT));
