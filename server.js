const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log('MongoDB Connected Successfully'))
      .catch(err => console.error('MongoDB Connection Error:', err));
}

app.get('/api/tasks', (req, res) => {
    const defaultTasks = [
        {
            _id: 1,
            title: "MicroTask #1: YouTube Channel Subscribe & Watch",
            reward: 50,
            description: "১. দেওয়া লিংকে ক্লিক করে ইউটিউব চ্যানেল সাবস্ক্রাইব করুন।\n২. ভিডিওটি সম্পূর্ণ দেখে একটি লাইক দিন।\n৩. আপনার ইউটিউব ইউজারনেম প্রুফ হিসেবে নিচে লিখুন।"
        },
        {
            _id: 2,
            title: "MicroTask #2: Facebook Page Like & Follow",
            reward: 40,
            description: "১. ফেসবুক পেজে প্রবেশ করে লাইক ও ফলো করুন।\n২. আপনার ফেসবুক প্রোফাইল লিংক বা নাম প্রুফ দিন।"
        }
    ];
    res.json(defaultTasks);
});

const pageHTML = '<!DOCTYPE html>\n' +
'<html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n' +
'<title>RS Growth Matrix</title>\n' +
'<script src="https://accounts.google.com/gsi/client" async defer></script>\n' +
'<style>\n' +
':root{--bg:#060913;--card:#0f172a;--line:#1e293b;--tx:#f8fafc;--mu:#94a3b8;--gold:#fbbf24;--grn:#22c55e;--blu:#38bdf8;--red:#ef4444}\n' +
'*{box-sizing:border-box;margin:0;padding:0;font-family:\'Segoe UI\',Roboto,Arial,sans-serif}\n' +
'body{background:var(--bg);color:var(--tx);display:flex;justify-content:center;min-height:100vh;padding:8px}\n' +
'.app{width:100%;max-width:440px;background:var(--card);border:1px solid var(--line);border-radius:26px;height:96vh;display:flex;flex-direction:column;overflow:hidden;position:relative}\n' +
'#auth{position:absolute;inset:0;z-index:50;background:radial-gradient(circle at top,#1e1b4b,#060913 70%);padding:22px;overflow-y:auto;text-align:center;display:block}\n' +
'.card{background:rgba(15,23,42,.92);border:1px solid rgba(251,191,36,.3);border-radius:18px;padding:16px;text-align:left}\n' +
'.brand{font-family:Georgia,serif;font-size:24px;font-weight:700;color:var(--gold);margin:6px 0 2px;letter-spacing:.5px}\n' +
'.sub{font-size:12px;color:var(--mu);margin-bottom:14px}\n' +
'.seg{display:flex;background:var(--bg);border-radius:10px;padding:3px;margin-bottom:12px}\n' +
'.seg div{flex:1;text-align:center;padding:8px;font-size:12px;font-weight:700;border-radius:8px;color:var(--mu);cursor:pointer}\n' +
'.seg .on{background:linear-gradient(90deg,var(--gold),#f59e0b);color:#000}\n' +
'label{font-size:11px;color:var(--mu);display:block;margin-top:9px}\n' +
'input,select,textarea{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:11px;color:#fff;font-size:14px;margin-top:4px}\n' +
'input:focus,select:focus,textarea:focus,button:focus-visible{outline:2px solid var(--gold)}\n' +
'.btn{width:100%;border:0;border-radius:12px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;margin-top:12px;background:linear-gradient(90deg,var(--gold),#f59e0b);color:#000}\n' +
'.btn.g{background:var(--grn);color:#fff}.btn.r{background:var(--red);color:#fff}.btn.s{width:auto;padding:6px 12px;font-size:12px;margin:0;border-radius:14px}\n' +
'.or{font-size:11px;color:var(--mu);margin:14px 0 8px;text-align:center}\n' +
'.top{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#131d38,#0f172a)}\n' +
'.top .l{display:flex;align-items:center;gap:10px}.top b{font-size:14px}.bal{text-align:right;font-size:17px;font-weight:800;color:var(--grn)}.bal small{display:block;font-size:10px;color:var(--mu);font-weight:400}\n' +
'nav{display:flex;border-bottom:1px solid var(--line);background:#0b1224}\n' +
'nav div{flex:1;text-align:center;font-size:10px;color:var(--mu);padding:8px 0;cursor:pointer;border-bottom:2px solid transparent}\n' +
'nav div i{display:block;font-style:normal;font-size:16px}nav .on{color:var(--gold);border-color:var(--gold)}\n' +
'main{flex:1;overflow-y:auto;padding:14px}\n' +
'.row{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px}\n' +
'.row small{display:block;color:var(--mu);font-size:11px;margin-top:2px}\n' +
'h3{font-size:13px;color:var(--mu);margin:4px 0 10px}\n' +
'.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}\n' +
'.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}\n' +
'.stat{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px 6px;text-align:center}.stat b{display:block;font-size:16px;color:var(--gold)}.stat small{font-size:11px;color:var(--mu)}\n' +
'.podium-box{display:flex;justify-content:center;align-items:flex-end;gap:10px;margin-bottom:20px}\n' +
'.podium-col{background:linear-gradient(180deg,#1e293b,#0f172a);border:1px solid var(--line);border-radius:16px;padding:16px 6px 12px 6px;text-align:center;flex:1;position:relative}\n' +
'.podium-col.rank-1{border-color:var(--gold);transform:scale(1.05);background:linear-gradient(180deg,rgba(251,191,36,.15),#0f172a);box-shadow:0 0 20px rgba(251,191,36,.25)}\n' +
'.crown{position:absolute;top:-16px;left:50%;transform:translateX(-50%);font-size:20px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.5))}\n' +
'.p-ava{width:45px;height:45px;border-radius:50%;margin:0 auto 6px;border:2px solid var(--gold);overflow:hidden;display:flex;align-items:center;justify-content:center;background:#334155;font-weight:bold;color:#fff}\n' +
'.p-ava img{width:100%;height:100%;object-fit:cover}\n' +
'.support-banner{background:linear-gradient(145deg,#1e293b,#0f172a);border:1px solid var(--line);border-radius:16px;padding:14px;margin-bottom:15px;display:flex;gap:12px;align-items:center}\n' +
'.chat-box-area{background:rgba(15,23,42,.7);border:1px solid var(--line);border-radius:16px;padding:12px;margin-top:10px;max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:8px}\n' +
'.chat-msg{padding:8px 12px;border-radius:12px;font-size:11px;max-width:85%;line-height:1.4}\n' +
'.chat-msg.user{background:#1e293b;color:#fff;align-self:flex-end;border-bottom-right-radius:2px}\n' +
'.chat-msg.support{background:#172554;color:var(--blu);align-self:flex-start;border-bottom-left-radius:2px;border:1px solid rgba(56,189,248,.2)}\n' +
'.live-ticker-box-large{background:radial-gradient(circle,rgba(30,41,59,.95) 0%,rgba(15,23,42,.98) 100%);border:1px solid #a855f7;border-radius:16px;padding:12px;margin-top:15px;height:110px;overflow:hidden;position:relative}\n' +
'.ticker-list{display:flex;flex-direction:column;gap:8px;animation:scrollTicker 4s linear infinite}\n' +
'.ticker-list:hover{animation-play-state:paused}\n' +
'@keyframes scrollTicker{0%{transform:translateY(0)}100%{transform:translateY(-50%)}}\n' +
'.ticker-item{font-size:11px;padding:6px 10px;border-radius:8px;background:rgba(15,23,42,.6);border:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;align-items:center}\n' +
'.t-dep{color:var(--grn);font-weight:500}.t-wd{color:#ef4444;font-weight:500}.t-bon{color:var(--gold);font-weight:500}.t-ref{color:#a855f7;font-weight:500}\n' +
'.acc-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:15px;text-align:center}\n' +
'.acc-stat-card{background:rgba(30,41,59,.5);border:1px solid var(--line);border-radius:12px;padding:10px 4px}\n' +
'.transaction-row{background:rgba(30,41,59,.4);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}\n' +
'.chip{font-size:10px;padding:3px 8px;border-radius:10px;background:#1e293b;color:var(--gold)}\n' +
'.chip.approved,.chip.paid{color:var(--grn)}.chip.rejected,.chip.cancelled{color:var(--red)}\n' +
'.share{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}\n' +
'.share a,.share button{display:flex;align-items:center;justify-content:center;gap:6px;background:#1e293b;border:1px solid var(--line);border-radius:10px;padding:10px;font-size:12px;color:var(--tx);text-decoration:none;cursor:pointer}\n' +
'.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:100;align-items:center;justify-content:center;padding:14px}\n' +
'.modal>div{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;width:100%;max-width:410px;max-height:90vh;overflow-y:auto}\n' +
'pre{white-space:pre-wrap;word-break:break-all;font-size:11px;color:#e2e8f0;line-height:1.5;margin:8px 0}\n' +
'.err{color:var(--red);font-size:12px;margin-top:8px;min-height:14px}\n' +
'.pkg-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}\n' +
'.pkg-card{background:#131d38;border:1px solid var(--line);border-radius:14px;padding:12px;text-align:center;position:relative}\n' +
'.pkg-card.glow{border-color:var(--gold);box-shadow:0 0 12px rgba(251,191,36,0.3)}\n' +
'.pkg-card b{color:var(--gold);font-size:15px;display:block;margin-bottom:4px}\n' +
'.notice-bar{background:linear-gradient(90deg,#1e1b4b,#131d38);border:1px solid var(--line);border-radius:12px;padding:8px 12px;margin-bottom:14px;font-size:12px;overflow:hidden;white-space:nowrap}\n' +
'</style></head><body>\n' +
'<div class="app">\n' +
'<div id="auth">\n' +
'  <div id="logoA"></div><div class="brand">RS Growth Matrix</div><div class="sub">Complete tasks. Earn rewards. Withdraw.</div>\n' +
'  <div class="card">\n' +
'    <div class="seg"><div id="tReg" class="on" onclick="mode(\'reg\')">Register</div><div id="tLog" onclick="mode(\'log\')">Login</div></div>\n' +
'    <div id="fReg">\n' +
'      <label>Name</label><input id="rN" autocomplete="username" placeholder="Your name">\n' +
'      <label>Phone number</label><input id="rP" inputmode="numeric" maxlength="11" placeholder="01XXXXXXXXX">\n' +
'      <label>Password (at least 6 characters)</label><input id="rW" type="password" autocomplete="new-password">\n' +
'      <label>Confirm password</label><input id="rC" type="password" autocomplete="new-password">\n' +
'      <button class="btn g" onclick="reg()">Confirm</button>\n' +
'    </div>\n' +
'    <div id="fLog" style="display:none">\n' +
'      <label>Name</label><input id="lN" autocomplete="username">\n' +
'      <label>Password</label><input id="lW" type="password" autocomplete="current-password">\n' +
'      <button class="btn" onclick="login()">Login</button>\n' +
'    </div>\n' +
'    <div class="err" id="aErr"></div>\n' +
'    <div id="gWrap"><div class="or">or continue with</div><div id="gBtn" style="display:flex;justify-content:center"></div></div>\n' +
'  </div>\n' +
'</div>\n' +
'<div class="top"><div class="l"><div id="logoT"></div><div><b id="hName"></b><small style="display:block;color:var(--gold);font-size:11px">Member</small></div></div><div class="bal"><span id="hBal">0.00</span><small>Balance (BDT)</small></div></div>\n' +
'<nav id="nav"></nav>\n' +
'<main id="main"></main>\n' +
'</div>\n' +
'<div class="modal" id="modal"><div id="mBody"></div></div>\n' +
'<script>\n' +
'var GID="",T=localStorage.getItem("t"),ME=null,ADM="",TAB="home",TIMER=null;\n' +
'var REF=new URLSearchParams(location.search).get("ref")||localStorage.getItem("ref")||"";\n' +
'if(REF)localStorage.setItem("ref",REF);\n' +
'function $(i){return document.getElementById(i)}\n' +
'function esc(s){return String(s==null?"":s).replace(/[&<>"\']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","\'":"&#39;"}[c]})}\n' +
'function money(n){return Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}\n' +
'function logo(s){return \'<svg width="\'+s+\'" height="\'+s+\'" viewBox="0 0 100 100" aria-label="RS Growth Matrix"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#b45309"/></linearGradient></defs><path d="M50 4 90 20v30c0 25-17 42-40 48C27 92 10 75 10 50V20z" fill="#0b1020" stroke="url(#lg)" stroke-width="4"/><text x="50" y="60" text-anchor="middle" font-size="34" font-weight="800" fill="url(#lg)" font-family="Georgia,serif">RS</text><path d="M30 71h40M38 77h24" stroke="url(#lg)" stroke-width="2.5" stroke-linecap="round"/></svg>\'}\n' +
'function api(p,m,b,hd){hd=hd||{};hd["Content-Type"]="application/json";if(T)hd.Authorization="Bearer "+T;\n' +
' return fetch("/api/"+p,{method:m||"GET",headers:hd,body:b?JSON.stringify(b):undefined}).then(function(r){return r.json().then(function(d){if(r.status===401&&T){out();throw new Error(d.error)}if(!r.ok)throw new Error(d.error||"Error");return d})})}\n' +
'function out(){localStorage.removeItem("t");T=null;ME=null;$("auth").style.display="block"}\n' +
'function mode(m){$("tReg").className=m==="reg"?"on":"";$("tLog").className=m==="log"?"on":"";$("fReg").style.display=m==="reg"?"block":"none";$("fLog").style.display=m==="log"?"block":"none";$("aErr").textContent=""}\n' +
'function done(d){T=d.token;localStorage.setItem("t",T);localStorage.removeItem("ref");enter(d.me)}\n' +
'function fail(e){$("aErr").textContent=e.message}\n' +
'function reg(){api("register","POST",{name:$("rN").value,phone:$("rP").value,password:$("rW").value,confirm:$("rC").value,ref:REF}).then(done).catch(fail)}\n' +
'function login(){api("login","POST",{name:$("lN").value,password:$("lW").value}).then(done).catch(fail)}\n' +
'function gCb(r){api("google","POST",{credential:r.credential,ref:REF}).then(done).catch(fail)}\n' +
'function initG(){if(!GID){$("gWrap").style.display="none";return}\n' +
' if(!window.google||!google.accounts){return setTimeout(initG,400)}\n' +
' google.accounts.id.initialize({client_id:GID,callback:gCb});google.accounts.id.renderButton($("gBtn"),{theme:"filled_black",size:"large",text:"continue_with",width:280})}\n' +
'var TABS=[["home","🏠","Home"],["packages","📦","Packages"],["tasks","📋","Tasks"],["rank","🏆","Ranking"],["ref","👥","Refer"],["help","💬","Support"],["acc","👤","Account"]];\n' +
'function enter(m){ME=m;$("auth").style.display="none";$("nav").innerHTML=TABS.map(function(t){return \'<div id="n_\'+t[0]+\'" onclick="go(\\\'\'+t[0]+\'\\\')"><i>\'+t[1]+\'</i>\'+t[2]+\'</div>\'}).join("");head();go("home")}\n' +
'function head(){$("hName").textContent=ME.name;$("hBal").textContent=money(ME.balance)}\n' +
'function go(t){TAB=t;clearInterval(TIMER);TABS.forEach(function(x){$("n_"+x[0]).className=x[0]===t?"on":""});({home:vHome,packages:vPackages,tasks:vTasks,rank:vRank,ref:vRef,help:vHelp,acc:vAcc})[t]()}\n' +
'function toast(m){alert(m)}\n' +
'function vHome(){\n' +
' var ok=Date.now()-ME.lastDaily>=864e5;\n' +
' $("main").innerHTML=\n' +
' \'<div class="notice-bar"><marquee>RS Growth Matrix-এ স্বাগতম! প্যাকেজ কিনে ইনকাম করুন। বিকাশ, নগদ ও রকেটের মাধ্যমে সহজেই টাকা উত্তোলন করতে পারবেন।</marquee></div>\'+\n' +
' \'<div class="grid"><div class="stat"><b>\'+money(ME.balance)+\'</b><small>Balance</small></div><div class="stat"><b>\'+money(ME.rsCoins||0)+\'</b><small>RS Coins</small></div></div>\'+\n' +
' \'<h3>শুরু করুন</h3>\'+\n' +
' \'<div class="row"><div>লগইন বোনাস<small>২৪ ঘণ্টায় একবার</small></div><button class="btn s" onclick="act(\\\'daily\\\')">\'+(ok?"Claim":"Claimed")+\'</button></div>\'+\n' +
' \'<div class="row"><div>ডেইলি বোনাস<small>২৪ ঘণ্টায় একবার চেক-ইন</small></div><button class="btn s" onclick="act(\\\'checkin\\\')">\'+(ME.checkedIn?"Done":"Check in")+\'</button></div>\'+\n' +
' \'<div class="row"><div>টাস্ক অপশন<small>অফারওয়াল টাস্ক করুন</small></div><button class="btn s" onclick="go(\\\'tasks\\\')">যান</button></div>\'+\n' +
' \'<div class="row"><div>প্যাকেজ সিস্টেম<small>প্যাকেজ কিনে আয় বাড়ান</small></div><button class="btn s" onclick="go(\\\'packages\\\')">দেখুন</button></div>\'+\n' +
' \'<div class="company-banner" style="background:#131d38;border:1px solid var(--line);border-radius:14px;padding:15px;text-align:center;margin-top:15px"><b style="color:var(--gold)">RS Growth Matrix</b><small style="display:block;color:var(--mu);margin-top:4px">আপনার বিশ্বস্ত ইনকাম প্ল্যাটফর্ম</small></div>\';\n' +
'}\n' +
'function act(p){api(p,"POST").then(function(m){ME=m;head();vHome();toast("বোনাস যোগ হয়েছে।")}).catch(function(e){toast(e.message)})}\n' +
'function vPackages(){\n' +
' var pkgs=[\n' +
'  {p:200,c:50,glow:false},{p:400,c:100,glow:false},{p:800,c:220,glow:false},{p:1600,c:450,glow:false},\n' +
'  {p:2500,c:750,glow:true},{p:3000,c:1000,glow:true},{p:4000,c:1400,glow:true},{p:5000,c:1800,glow:true}\n' +
' ];\n' +
' $("main").innerHTML=\'<h3>প্যাকেজ তালিকা (৩০ দিন মেয়াদী)</h3><div class="pkg-grid">\'+' +
'  pkgs.map(function(x,i){\n' +
'   return \'<div class="pkg-card \'+(x.glow?"glow":"")+\'"><b>\'+x.p+\' টাকা</b><small>প্রতি মিনিটে \'+x.c+\' আরএস কয়েন</small><br><small style="color:var(--grn);display:block;margin:6px 0">মেয়াদ: ৩০ দিন</small><button class="btn s" onclick="unlockPkg(\'+x.p+\')">আনলক করুন</button></div>\';\n' +
'  }).join("")+\'</div>\';\n' +
'}\n' +
'function unlockPkg(p){\n' +
' modal(\'<h3 style="color:var(--gold)">প্যাকেজ আনলক</h3><p style="font-size:13px;margin:10px 0">এই প্যাকেজটি কিনতে হলে আপনাকে ডিপোজিট করতে হবে।</p><button class="btn g" onclick="closeM();go(\\\'acc\\\')">ডিপোজিট করুন</button><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">বাতিল</button>\');\n' +
'}\n' +
'function vTasks(){\n' +
' $("main").innerHTML=\'<div class="grid4" id="st"></div><h3>অফারওয়াল টাস্ক</h3><div id="tl">লোড হচ্ছে...</div>\';\n' +
' api("offers").then(function(d){var s=d.stats;if(!$("#st"))return;\n' +
' $("#st").innerHTML=[["Pending",s.pending],["Success",s.success],["Cancelled",s.cancelled],["Total",s.total]].map(function(x){return \'<div class="stat"><b>\'+x[1]+\'</b><small>\'+x[0]+\'</small></div>\'}).join("");\n' +
' window.OF=d.list;\n' +
' $("#tl").innerHTML=d.list.length?d.list.map(function(t,i){var b=t.status==="open"?\'<button class="btn s" onclick="startO(\'+i+\')">Start</button>\':\'<span class="chip \'+(t.status==="success"?"approved":t.status)+\'">\'+t.status+\'</span>\';\n' +
' return \'<div class="row"><div style="display:flex;gap:10px;align-items:center">\'+(t.icon?\'<img src="\'+esc(t.icon)+\'" width="38" height="38" style="border-radius:10px" alt="">\':"")+\'<div>\'+esc(t.title)+\'<small>Reward: \'+money(t.bdt)+\' BDT</small></div></div>\'+b+\'</div>\'}).join(""):`<div class="row">কোনো টাস্ক নেই।</div>`}).catch(function(e){if($("#tl"))$("#tl").textContent=e.message});\n' +
'}\n' +
'function startO(i){api("offers/"+encodeURIComponent(OF[i].id)+"/start","POST").then(function(r){var w=window.open(r.url,"_blank");if(!w)location.href=r.url;vTasks()}).catch(function(e){toast(e.message)})}\n' +
'function modal(h){$("#mBody").innerHTML=h;$("#modal").style.display="flex"}\n' +
'function closeM(){$("#modal").style.display="none"}\n' +
'const maleNames = ["Alexander", "Benjamin", "Christopher", "Daniel", "Ethan", "Felix", "Gabriel", "Harrison", "Ian", "Julian", "Kevin", "Liam", "Mason", "Nathan", "Oliver", "Patrick", "Quentin", "Ryan", "Samuel", "Tristan"];\n' +
'const femaleNames = ["Sophia", "Emma", "Olivia", "Ava", "Isabella", "Mia", "Harper", "Evelyn", "Abigail", "Emily", "Elizabeth", "Sofia", "Avery", "Ella", "Scarlett", "Grace", "Chloe", "Victoria", "Aria", "Luna"];\n' +
'let usersData = [];\n' +
'for(let i = 1; i <= 100; i++) {\n' +
'    let isFemale = i % 2 === 0;\n' +
'    let nameList = isFemale ? femaleNames : maleNames;\n' +
'    let fName = nameList[i % nameList.length];\n' +
'    let lName = ["Smith", "Johnson", "Brown", "Taylor", "Miller", "Wilson", "Moore", "Clark", "Hall"][i % 9];\n' +
'    let fullName = fName + " " + lName;\n' +
'    let score = 50000 - (i * 350) + Math.floor(Math.random() * 200);\n' +
'    let rsCoinEarned = Math.floor(Math.random() * 5000) + 500;\n' +
'    let avatarUrl = "https://i.pravatar.cc/100?img=" + ((i % 70) + 1);\n' +
'    usersData.push({ rank: i, name: fullName, score: score, rsCoins: rsCoinEarned, avatar: avatarUrl });\n' +
'}\n' +
'function renderLeaderboard() {\n' +
'    if(!document.getElementById("podiumTop3Container")) return;\n' +
'    usersData.forEach((u, index) => {\n' +
'        u.score += Math.floor(Math.random() * 30) - 10;\n' +
'        if(index < 10) {\n' +
'            u.rsCoins += Math.floor(Math.random() * 20) + 5;\n' +
'        } else {\n' +
'            u.rsCoins += Math.floor(Math.random() * 10) - 4;\n' +
'            if(u.rsCoins < 0) u.rsCoins = 0;\n' +
'        }\n' +
'    });\n' +
'    usersData.sort((a, b) => b.score - a.score);\n' +
'    usersData.forEach((u, index) => u.rank = index + 1);\n' +
'    let top3HTML = "";\n' +
'    top3HTML += \'<div class="podium-col" style="border-color: #3b82f6;">\' +\n' +
'        \'<div class="crown">👑</div>\' +\n' +
'        \'<div class="p-ava" style="border-color: #3b82f6;"><img src="\' + usersData[1].avatar + \'" alt="2"></div>\' +\n' +
'        \'<h5 style="font-size: 11px;">\' + usersData[1].name + \'</h5>\' +\n' +
'        \'<p style="font-size: 9px; color: var(--grn);">৳ \' + usersData[1].score.toLocaleString() + \'</p>\' +\n' +
'        \'<p style="font-size: 8px; color: var(--gold);">🪙 \' + formatCoinNumber(usersData[1].rsCoins) + \' RS</p>\' +\n' +
'        \'<span style="font-size: 9px; background: #3b82f6; padding: 1px 6px; border-radius: 8px; margin-top: 4px; display: inline-block;">#২</span>\' +\n' +
'    \'</div>\';\n' +
'    top3HTML += \'<div class="podium-col rank-1">\' +\n' +
'        \'<div class="crown" style="font-size: 24px;">👑</div>\' +\n' +
'        \'<div class="p-ava" style="border-color: var(--gold); box-shadow: 0 0 15px var(--gold);"><img src="\' + usersData[0].avatar + \'" alt="1"></div>\' +\n' +
'        \'<h5 style="font-size: 12px; color: var(--gold); font-weight: bold;">\' + usersData[0].name + \'</h5>\' +\n' +
'        \'<p style="font-size: 10px; color: var(--grn);">৳ \' + usersData[0].score.toLocaleString() + \'</p>\' +\n' +
'        \'<p style="font-size: 9px; color: var(--gold);">🪙 \' + formatCoinNumber(usersData[0].rsCoins) + \' RS</p>\' +\n' +
'        \'<span style="font-size: 9px; background: var(--gold); color: #000; padding: 1px 6px; border-radius: 8px; margin-top: 4px; display: inline-block; font-weight: bold;">#১</span>\' +\n' +
'    \'</div>\';\n' +
'    top3HTML += \'<div class="podium-col" style="border-color: #b45309;">\' +\n' +
'        \'<div class="crown">👑</div>\' +\n' +
'        \'<div class="p-ava" style="border-color: #b45309;"><img src="\' + usersData[2].avatar + \'" alt="3"></div>\' +\n' +
'        \'<h5 style="font-size: 11px;">\' + usersData[2].name + \'</h5>\' +\n' +
'        \'<p style="font-size: 9px; color: var(--grn);">৳ \' + usersData[2].score.toLocaleString() + \'</p>\' +\n' +
'        \'<p style="font-size: 8px; color: var(--gold);">🪙 \' + formatCoinNumber(usersData[2].rsCoins) + \' RS</p>\' +\n' +
'        \'<span style="font-size: 9px; background: #b45309; padding: 1px 6px; border-radius: 8px; margin-top: 4px; display: inline-block;">#৩</span>\' +\n' +
'    \'</div>\';\n' +
'    document.getElementById("podiumTop3Container").innerHTML = top3HTML;\n' +
'    let remainingHTML = "";\n' +
'    for(let i = 3; i < usersData.length; i++) {\n' +
'        let u = usersData[i];\n' +
'        remainingHTML += \'<div class="transaction-row">\' +\n' +
'            \'<div style="display: flex; align-items: center; gap: 10px;">\' +\n' +
'                \'<span style="font-size: 11px; font-weight: bold; color: var(--blu);">#\' + u.rank + \'</span>\' +\n' +
'                \'<img src="\' + u.avatar + \'" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">\' +\n' +
'                \'<div>\' +\n' +
'                    \'<span style="font-size: 12px; display: block;">\' + u.name + \'</span>\' +\n' +
'                    \'<span style="font-size: 9px; color: var(--gold);">🪙 \' + formatCoinNumber(u.rsCoins) + \' RS Collected</span>\' +\n' +
'                \'</div>\' +\n' +
'            \'</div>\' +\n' +
'            \'<span style="font-size: 12px; color: var(--grn); font-weight: bold;">৳ \' + u.score.toLocaleString() + \'</span>\' +\n' +
'        \'</div>\';\n' +
'    }\n' +
'    document.getElementById("rankingListContainer").innerHTML = remainingHTML;\n' +
'}\n' +
'function formatCoinNumber(num) {\n' +
'    if (num >= 1000000) {\n' +
'        return (num / 1000000).toFixed(1) + "M";\n' +
'    } else if (num >= 1000) {\n' +
'        return (num / 1000).toFixed(1) + "k";\n' +
'    }\n' +
'    return num.toFixed(0);\n' +
'}\n' +
'function vRank(){\n' +
'    $("main").innerHTML = \'<div id="rankingView" class="view-section active" style="display:block;">\' +\n' +
'        \'<div class="section-heading"><span>🏆 গ্লোবাল টপ র‍্যাঙ্কিং লিডারবোর্ড</span> <span style="font-size: 10px; color: var(--gold);">টপ ১ থেকে ১০ কয়েন ক্রমান্বয়ে বৃদ্ধি পাবে</span></div>\' +\n' +
'        \'<div class="podium-box" id="podiumTop3Container"></div>\' +\n' +
'        \'<div class="section-heading"><span>অন্যান্য আর্নারগণ</span></div>\' +\n' +
'        \'<div id="rankingListContainer"></div>\' +\n' +
'    \'</div>\';\n' +
'    renderLeaderboard();\n' +
'}\n' +
'setInterval(() => {\n' +
'    if(TAB === "rank") renderLeaderboard();\n' +
'}, 4000);\n' +
'function vRef(){\n' +
' var link=location.origin+"/?ref="+ME.refCode,e=encodeURIComponent(link),tx=encodeURIComponent("RS Growth Matrix-এ যোগ দিন এবং আয় করুন: ");window.RL=link;\n' +
' $("main").innerHTML=\'<div class="card" style="text-align:center">\'+logo(64)+\'<div class="brand" style="font-size:18px">বন্ধুকে আমন্ত্রণ করুন</div><div class="sub">প্রতি রেফারে পান ১৫ টাকা ইনস্ট্যান্ট বোনাস, ১০০০ আরএস কয়েন এবং আজীবন ৩% কমিশন!</div>\'+\n' +
' \'<input readonly id="rl" value="\'+esc(link)+\'"><button class="btn" onclick="copyL()">লিংক কপি করুন</button>\'+\n' +
' \'<div class="share">\'+\n' +
' \'<a target="_blank" rel="noopener" href="https://wa.me/?text=\'+tx+e+\'"> WhatsApp</a>\'+\n' +
' \'<a target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=\'+e+\'"><svg width="16" height="16" fill="#1877f2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Facebook</a>\'+\n' +
' \'<a href="fb-messenger://share?link=\'+e+\'"> Messenger</a>\'+\n' +
' \'<button onclick="copyL(1)"><svg width="16" height="16" fill="#0088cc" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 2.16.564 4.183 1.55 5.944L.25 23.75l5.986-1.332A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.855 0-3.593-.513-5.078-1.405l-.364-.216-3.722.828.831-3.626-.237-.378A9.855 9.855 0 012.182 12c0-5.435 4.401-9.818 9.818-9.818s9.818 4.383 9.818 9.818-4.383 9.818-9.818 9.818z"/></svg> Imo</button>\'+\n' +
' \'<a target="_blank" rel="noopener" href="https://t.me/share/url?url=\'+e+\'&text=\'+tx+\'"> Telegram</a>\'+\n' +
' \'<button onclick="nat()"><svg width="16" height="16" fill="#fff" viewBox="0 0 24 24"><path d="M4 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm7 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm7 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"/></svg> TikTok</button>\'+\n' +
' \'</div></div>\'+\n' +
' \'<div class="grid" style="margin-top:12px"><div class="stat"><b>\'+ME.refCount+\'</b><small>বন্ধু যুক্ত হয়েছে</small></div><div class="stat"><b>\'+money(ME.refEarn)+\'</b><small>রেফারেল আয়</small></div></div>\'+\n' +
' \'<h3 style="margin-top:15px">লাইভ রেফারেল ট্রানজ্যাকশন</h3>\'+\n' +
' \'<div class="pod" style="margin-bottom:0"><div class="p1"><div class="ring"><img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"></div>রিয়াদ খান<b>১৫ টাকা + ১০০০ আরএস কয়েন</b><small>১০ সেকেন্ড আগে</small></div>\'+\n' +
' \'<div><div class="ring"><img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100"></div>শান্ত ইসলাম<b>১৫ টাকা + ১০০০ আরএস কয়েন</b><small>১ মিনিট আগে</small></div>\'+\n' +
' \'<div><div class="ring"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"></div>তানভীর আহমেদ<b>১৫ টাকা + ১০০০ আরএস কয়েন</b><small>এখনই</small></div></div>\';\n' +
'}\n' +
'function copyL(imo){(navigator.clipboard?navigator.clipboard.writeText(RL):Promise.reject()).then(function(){toast(imo?"লিংক কপি হয়েছে। ইমুতে পেস্ট করুন।":"লিংক কপি হয়েছে।")}).catch(function(){$("rl").select();toast("কপি করুন।")})}\n' +
'function nat(){if(navigator.share)navigator.share({title:"RS Growth Matrix",url:RL});else copyL()}\n' +
'const agentNames = ["মাহিয়া", "জান্নাত", "ফাতেমা", "সাবিহা", "নুসরাত"];\n' +
'let currentAgentIndex = 0;\n' +
'setInterval(() => {\n' +
'    currentAgentIndex = (currentAgentIndex + 1) % agentNames.length;\n' +
'    const agentEl = document.getElementById("supportAgentNameDisplay");\n' +
'    if(agentEl) agentEl.innerText = agentNames[currentAgentIndex];\n' +
'}, 180000);\n' +
'function openSupportPopup(type) {\n' +
'    let title = "", desc = "";\n' +
'    if(type === "deposit") {\n' +
'        title = "💳 ডিপোজিট সংক্রান্ত সমস্যা ও সমাধান";\n' +
'        desc = "১. ডিপোজিট সীমা ২০০ থেকে ৩০০০ টাকা।\\n২. সঠিক TrxID ও শেষ ৩ ডিজিট প্রদান করুন।";\n' +
'    } else if(type === "withdraw") {\n' +
'        title = "🏦 উইথড্র সংক্রান্ত সমস্যা ও সমাধান";\n' +
'        desc = "১. উইথড্র সীমা ৩০০ থেকে ৫০০০ টাকা।\\n২. অ্যাকাউন্টে নির্দিষ্ট পরিমাণের বেশি ব্যালেন্স থাকতে হবে।";\n' +
'    } else if(type === "bonus") {\n' +
'        title = "🎁 বোনাস সংক্রান্ত তথ্য";\n' +
'        desc = "১. রেফারেল ইনস্ট্যান্ট ১০০ কয়েন ও আজীবন ৩% কমিশন।";\n' +
'    } else if(type === "task") {\n' +
'        title = "📋 ডেইলি টাস্ক গাইডলাইন";\n' +
'        desc = "১. ২৪ ঘণ্টায় একবার ডেইলি টাস্ক ক্লেইম করা যায়।";\n' +
'    }\n' +
'    modal(\'<h3 style="color:var(--gold)">\'+title+\'</h3><p style="font-size:11px;color:var(--mu);line-height:1.5;margin:10px 0;white-space:pre-line;">\'+desc+\'</p><button class="btn s" onclick="closeM()">বুঝেছি</button>\');\n' +
'}\n' +
'function sendSupportMsg() {\n' +
'    const txt = document.getElementById("supportInput").value.trim();\n' +
'    if(!txt) { alert("দয়া করে আপনার সমস্যাটি লিখুন।"); return; }\n' +
'    const chatContainer = document.getElementById("chatBoxContainer");\n' +
'    const userMsgDiv = document.createElement("div");\n' +
'    userMsgDiv.className = "chat-msg user";\n' +
'    userMsgDiv.innerText = txt;\n' +
'    chatContainer.appendChild(userMsgDiv);\n' +
'    document.getElementById("supportInput").value = "";\n' +
'    chatContainer.scrollTop = chatContainer.scrollHeight;\n' +
'    setTimeout(() => {\n' +
'        const supportMsgDiv = document.createElement("div");\n' +
'        supportMsgDiv.className = "chat-msg support";\n' +
'        supportMsgDiv.innerText = "আমাদের এই মুহূর্তে কাস্টমার কেয়ারে অনেক পরিমাণ কাস্টমানের চাপ আছে। আপনারা কিছুক্ষণ পরে আবার মেসেজ করুন।";\n' +
'        chatContainer.appendChild(supportMsgDiv);\n' +
'        chatContainer.scrollTop = chatContainer.scrollHeight;\n' +
'    }, 1000);\n' +
'}\n' +
'function vHelp(){\n' +
'    $("main").innerHTML = \'<div id="supportView" class="view-section active" style="display:block;">\' +\n' +
'        \'<div class="support-banner">\' +\n' +
'            \'<div style="font-size: 28px; position: relative;">👩‍💼<span style="position: absolute; bottom: 0; right: -4px; width: 12px; height: 12px; background: var(--grn); border-radius: 50%; border: 2px solid #0f172a; display: flex; align-items: center; justify-content: center; font-size: 8px; color: white;">✓</span></div>\' +\n' +
'            \'<div>\' +\n' +
'                \'<h4 style="font-size: 13px; font-weight: bold;">RS সাপোর্ট টিম</h4>\' +\n' +
'                \'<p style="font-size: 10px; color: var(--mu);">সার্ভিস এজেন্ট: <span id="supportAgentNameDisplay" style="color: var(--gold); font-weight: bold;">মাহিয়া</span> | ● অনলাইন (24/7)</p>\' +\n' +
'            \'</div>\' +\n' +
'        \'</div>\' +\n' +
'        \'<div class="grid4" style="margin-bottom: 15px;">\' +\n' +
'            \'<div class="stat" style="cursor:pointer;" onclick="openSupportPopup(\\\'deposit\\\')"><div style="font-size: 20px;">💳</div><small style="font-size: 9px; color:var(--tx);">ডিপোজিট</small></div>\' +\n' +
'            \'<div class="stat" style="cursor:pointer;" onclick="openSupportPopup(\\\'withdraw\\\')"><div style="font-size: 20px;">🏦</div><small style="font-size: 9px; color:var(--tx);">উইথড্র</small></div>\' +\n' +
'            \'<div class="stat" style="cursor:pointer;" onclick="openSupportPopup(\\\'bonus\\\')"><div style="font-size: 20px;">🎁</div><small style="font-size: 9px; color:var(--tx);">বোনাস</small></div>\' +\n' +
'            \'<div class="stat" style="cursor:pointer;" onclick="openSupportPopup(\\\'task\\\')"><div style="font-size: 20px;">📋</div><small style="font-size: 9px; color:var(--tx);">ডেইলি টাস্ক</small></div>\' +\n' +
'        \'</div>\' +\n' +
'        \'<div class="chat-box-area" id="chatBoxContainer">\' +\n' +
'            \'<div class="chat-msg support">হ্যালো! আমি RS সাপোর্ট টিম থেকে বলছি। আপনার যেকোনো সমস্যায় আমাদের সাথে কথা বলতে পারেন।</div>\' +\n' +
'        \'</div>\' +\n' +
'        \'<div style="display: flex; gap: 6px; margin-top: 10px;">\' +\n' +
'            \'<input type="text" class="form-control" id="supportInput" placeholder="আপনার সমস্যার বিস্তারিত লিখুন..." style="margin-top:0;">\' +\n' +
'            \'<button type="button" class="btn s" onclick="sendSupportMsg()">প্রেরণ</button>\' +\n' +
'        \'</div>\' +\n' +
'    \'</div>\';\n' +
'}\n' +
'function vAcc(){\n' +
'    $("main").innerHTML = \'<div id="accountView" class="view-section active" style="display:block;">\' +\n' +
'        \'<div class="section-heading"><span>অ্যাকাউন্ট ওভারভিউ</span></div>\' +\n' +
'        \'<div class="update-card" style="align-items: center; background: rgba(30, 41, 59, 0.7);">\' +\n' +
'            \'<div style="display: flex; align-items: center; gap: 10px;">\' +\n' +
'                \'<div id="accScreenAvatar" style="width: 45px; height: 45px; border-radius: 50%; background:#334155; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#fff;">RS</div>\' +\n' +
'                \'<div>\' +\n' +
'                    \'<h4 style="font-size: 13px;" id="accScreenName">\' + esc(ME ? ME.name : "User") + \'</h4>\' +\n' +
'                    \'<p style="font-size: 10px; color: var(--gold);" id="accScreenUserPhone">নম্বর: \' + esc((ME && ME.phone) ? ME.phone : "01700000000") + \'</p>\' +\n' +
'                \'</div>\' +\n' +
'            \'</div>\' +\n' +
'            \'<button type="button" class="btn s" onclick="out()">লগআউট</button>\' +\n' +
'        \'</div>\' +\n' +
'        \'<button type="button" class="btn" style="background: linear-gradient(90deg, #a855f7, #6366f1); color: #fff; margin-top:0;" onclick="admin()">🔐 এডমিন প্যানেল লগইন</button>\' +\n' +
'        \'<div class="acc-grid-4" style="margin-top: 12px;">\' +\n' +
'            \'<div class="acc-stat-card"><div style="font-size: 10px; color: var(--mu);">পেন্ডিং</div><div style="font-size: 11px; font-weight: bold; color: var(--gold); margin-top: 2px;" id="statPending">৳ ০.০০</div></div>\' +\n' +
'            \'<div class="acc-stat-card"><div style="font-size: 10px; color: var(--mu);">লেনদেন</div><div style="font-size: 12px; font-weight: bold; color: var(--blu); margin-top: 2px;" id="statTransactions">০</div></div>\' +\n' +
'            \'<div class="acc-stat-card"><div style="font-size: 10px; color: var(--mu);">আজকের আয়</div><div style="font-size: 11px; font-weight: bold; color: var(--grn); margin-top: 2px;" id="statTodayEarn">৳ ০.০০</div></div>\' +\n' +
'            \'<div class="acc-stat-card"><div style="font-size: 10px; color: var(--mu);">রেফার আয়</div><div style="font-size: 11px; font-weight: bold; color: #a855f7; margin-top: 2px;" id="statRefEarn">৳ ০.০০</div></div>\' +\n' +
'        \'</div>\' +\n' +
'        \'<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 10px;">\' +\n' +
'            \'<button type="button" class="btn g" style="margin-top:0;" onclick="wdForm()">➕ ডিপোজিট</button>\' +\n' +
'            \'<button type="button" class="btn r" style="margin-top:0;" onclick="wdForm()">➖ উইথড্র</button>\' +\n' +
'        \'</div>\' +\n' +
'        \'<button type="button" class="btn s" style="width:100%; justify-content:center; background:rgba(34, 197, 94, 0.2); color:var(--grn); border:1px solid var(--grn); margin-bottom:8px;" onclick="loadWdHistory()">📋 রিয়েল ডিপোজিট ও উইথড্র হিস্ট্রি</button>\' +\n' +
'        \'<div class="section-heading" style="margin-top: 15px;"><span>🌐 গ্লোবাল লাইভ ট্রানজেকশন ফিড</span></div>\' +\n' +
'        \'<div class="live-ticker-box-large">\' +\n' +
'            \'<div class="ticker-list" id="globalLiveTickerList">\' +\n' +
'                \'<div class="ticker-item"><span class="t-dep">📥 ডিপোজিট (বিকাশ): +৳ ১,০০০.০০ (Success)</span><span style="font-size:9px; color:var(--mu)">017****94</span></div>\' +\n' +
'                \'<div class="ticker-item"><span class="t-wd">📤 উইথড্র (নগদ): -৳ ৫০০.০০ (Success)</span><span style="font-size:9px; color:var(--mu)">018****22</span></div>\' +\n' +
'                \'<div class="ticker-item"><span class="t-bon">🎁 বোনাস অর্জন: +৫০০ RS (Success)</span><span style="font-size:9px; color:var(--mu)">019****11</span></div>\' +\n' +
'            \'</div>\' +\n' +
'        \'</div>\' +\n' +
'    \'</div>\';\n' +
'}\n' +
'function loadWdHistory() {\n' +
'    api("withdrawals").then(function(a){\n' +
'        var html = a.length ? a.map(function(w){return \'<div class="row"><div>\'+esc(w.method)+\' \'+esc(w.phone)+\'<small>\'+new Date(w.at).toLocaleDateString()+\'</small></div><div>\'+money(w.amount)+\' <span class="chip \'+w.status+\'">\'+w.status+\'</span></div></div>\'}).join("") : \'<div class="row">কোনো উইথড্র ইতিহাস নেই।</div>\';\n' +
'        modal(\'<h3 style="color:var(--gold)">হিস্ট্রি</h3>\'+html+\'<button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">বন্ধ করুন</button>\');\n' +
'    });\n' +
'}\n' +
'function wdForm(){modal(\'<h3 style="color:var(--gold)">উইথড্র (৩০০ - ৫০০০ টাকা)</h3><label>মেথড</label><select id="wm"><option>bKash</option><option>Nagad</option></select><label>টাকা</label><input id="wa" type="number" inputmode="numeric"><label>নম্বর</label><input id="wp" maxlength="11" inputmode="numeric" value="\'+esc(ME?ME.phone:"")+\'"><button class="btn r" onclick="doWd()">রিকোয়েস্ট পাঠান</button><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">বন্ধ করুন</button>\')}\n' +
'function doWd(){api("withdraw","POST",{method:$("wm").value,amount:$("wa").value,phone:$("wp").value}).then(function(m){ME=m;head();closeM();toast("উইথড্র রিকোয়েস্ট সফল হয়েছে।");vAcc()}).catch(function(e){toast(e.message)})}\n' +
'function admin(){var p=prompt("এডমিন পাসওয়ার্ড দিন");if(!p)return;ADM=p;loadAdm()}\n' +
'function ah(){return{"x-admin-pass":ADM}}\n' +
'function loadAdm(){api("admin/data","GET",null,ah()).then(function(d){var s=d.stats;\n' +
' var cards=[["Users",s.users],["Active (24h)",s.active],["Pending tasks",s.pending],["Success tasks",s.success],["Cancelled tasks",s.cancelled],["Paid to users today",money(s.today)],["Users balance",money(s.balance)]].map(function(x){return \'<div class="stat"><b>\'+x[1]+\'</b><small>\'+x[0]+\'</small></div>\'}).join("");\n' +
' modal(\'<h3 style="color:var(--gold)">ওভারভিউ</h3><div class="grid">\'+cards+\'</div>\'+\n' +
' \'<h3>পেন্ডিং উইথড্র</h3>\'+(d.wds.map(function(x){return \'<div class="row"><div>\'+esc(x.name)+\' \'+x.amount+\'<small>\'+esc(x.method)+\' \'+esc(x.phone)+\'</small></div><div><button class="btn s g" onclick="dec(\\\'\'+x._id+\'\\\',1)">Paid</button> <button class="btn s r" onclick="dec(\\\'\'+x._id+\'\\\',0)">Reject</button></div></div>\'}).join("")||\'<div class="row">কিছু নেই</div>\')+\n' +
' \'<h3>সাপোর্ট মেসেজ</h3>\'+(d.msgs.map(function(x){return \'<div class="row"><div>\'+esc(x.name)+\'<small>\'+esc(x.text)+\'</small></div><button class="btn s" onclick="rep(\\\'\'+x.uid+\'\\\')">উত্তর</button></div>\'}).join("")||\'<div class="row">কিছু নেই</div>\')+\n' +
' \'<button class="btn" style="background:#1e293b;color:#fff" onclick="chk()">অফার চেক</button><button class="btn" style="background:#1e293b;color:#fff" onclick="closeM()">বন্ধ করুন</button>\')}).catch(function(e){toast(e.message)})}\n' +
'function dec(id,ok){api("admin/wd/"+id,"POST",{ok:!!ok},ah()).then(loadAdm)}\n' +
'function rep(uid){var t=prompt("উত্তর লিখুন");if(t)api("admin/reply","POST",{uid:uid,text:t},ah()).then(function(){toast("পাঠানো হয়েছে")})}\n' +
'function chk(){api("admin/offers-raw","GET",null,ah()).then(function(r){modal(\'<h3 style="color:var(--gold)">অফার রেসপন্স</h3><pre>\'+esc(r.text)+\'</pre><button class="btn" style="background:#1e293b;color:#fff" onclick="loadAdm()">পেছনে</button>\')})}\n' +
'document.addEventListener("DOMContentLoaded",function(){$("logoA").innerHTML=logo(88);$("logoT").innerHTML=logo(40);initG();\n' +
' if(REF)mode("reg");\n' +
' if(T){api("me").then(enter).catch(function(){$("auth").style.display="block"});}else{$("auth").style.display="block";}});\n' +
'</script></body></html>';

app.get('/', (req, res) => {
    res.send(pageHTML);
});

app.listen(PORT, () => console.log('Server is running on port ' + PORT));
