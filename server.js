const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ LOGO ROUTE - PREMIUM LOGO SERVE
app.get('/logo.png', (req, res) => {
    const possiblePaths = [
        path.join(__dirname, 'rs_logo.png'),
        path.join(__dirname, 'logo.png'),
        '/mnt/data/rs_logo.png',
        '/mnt/data/rs_logo_small.png'
    ];
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) return res.sendFile(p);
    }
    // fallback - redirect to CDN if local not found
    return res.redirect('https://i.ibb.co/0jZ3XqgJ/rs-logo.png');
});

if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log('MongoDB Connected'))
      .catch(err => console.error(err));
}

app.get('/api/tasks', (req, res) => {
    const defaultTasks = [
        { _id: 1, title: "MicroTask #1: YouTube Channel Subscribe & Watch", reward: 50, description: "১. দেওয়া লিংকে ক্লিক করে ইউটিউব চ্যানেল সাবস্ক্রাইব করুন।\n২. ভিডিওটি সম্পূর্ণ দেখে একটি লাইক দিন।\n৩. আপনার ইউটিউব ইউজারনেম প্রুফ হিসেবে নিচে লিখুন।" },
        { _id: 2, title: "MicroTask #2: Facebook Page Like & Follow", reward: 40, description: "১. ফেসবুক পেজে প্রবেশ করে লাইক ও ফলো করুন।\n২. আপনার ফেসবুক প্রোফাইল লিংক বা নাম প্রুফ দিন।" }
    ];
    res.json(defaultTasks);
});

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RS Growth Matrix - Ultimate Earning Platform</title>

<!-- ✅ SHARE PREVIEW FIX - OG TAGS -->
<link rel="icon" type="image/png" href="/logo.png">
<meta property="og:title" content="RS Growth Matrix - Ultimate Earning Platform 2026">
<meta property="og:description" content="RS Growth Matrix - প্রতিদিন কাজ করুন, প্যাকেজ মাইন করুন আর ইনকাম করুন। ২৪ ঘণ্টা অটো RS কয়েন মাইনিং।">
<meta property="og:image" content="/logo.png">
<meta property="og:image:width" content="512">
<meta property="og:image:height" content="512">
<meta property="og:url" content="https://rs.taptoearn.app">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="/logo.png">

<style>
:root{--bg-color:#060913;--card-bg:#0f172a;--card-border:#1e293b;--text-main:#f8fafc;--text-muted:#94a3b8;--accent-blue:#38bdf8;--accent-green:#22c55e;--accent-gold:#fbbf24;--accent-purple:#a855f7;}
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',Roboto,sans-serif;}
body{background:var(--bg-color);color:var(--text-main);padding:10px;display:flex;justify-content:center;align-items:center;min-height:100vh;overflow:hidden;}
.container{width:100%;max-width:440px;background:var(--card-bg);border-radius:28px;border:1px solid var(--card-border);overflow:hidden;display:flex;flex-direction:column;height:94vh;position:relative;}
#authScreen{position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle at center,#1e1b4b 0%,#060913 100%);z-index:2000;display:flex;flex-direction:column;align-items:center;padding:20px;overflow-y:auto;}
.auth-logo-img{width:95px;height:95px;border-radius:50%;border:3px solid #fbbf24;box-shadow:0 0 30px rgba(251,191,36,0.7);margin:10px 0;object-fit:cover;background:#0f172a;}
.auth-logo-title{font-size:22px;font-weight:900;color:var(--accent-gold);text-shadow:0 0 15px rgba(251,191,36,0.6);}
.auth-subtitle{font-size:11px;color:var(--text-muted);margin-bottom:14px;}
.auth-box-card{background:rgba(15,23,42,0.9);border:1px solid rgba(251,191,36,0.3);border-radius:18px;padding:15px;width:100%;}
.auth-form-group{margin-bottom:8px;} .auth-form-group label{font-size:10px;color:var(--text-muted);display:block;margin-bottom:3px;}
.auth-switch-tab{display:flex;background:#060913;border-radius:10px;padding:3px;margin-bottom:12px;border:1px solid var(--card-border);}
.ast-btn{flex:1;text-align:center;padding:7px;font-size:11px;font-weight:bold;cursor:pointer;border-radius:8px;color:var(--text-muted);}
.ast-btn.active{background:linear-gradient(90deg,var(--accent-gold),#f59e0b);color:#000;}
.top-user-bar{padding:15px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--card-border);background:linear-gradient(180deg,#131d38 0%,#0f172a 100%);}
.user-left{display:flex;align-items:center;gap:10px;}
.user-avatar-container{position:relative;width:44px;height:44px;}
.user-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#fbbf24,#a855f7);padding:2px;display:flex;align-items:center;justify-content:center;overflow:hidden;}
.user-avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover;}
.balance-pill{background:rgba(15,23,42,0.9);border:1px solid #38bdf855;padding:6px 12px;border-radius:20px;text-align:right;}
.b-val{font-size:14px;font-weight:bold;color:var(--accent-green);} .rs-val{font-size:11px;font-weight:bold;color:var(--accent-gold);}
.view-section{display:none;flex-grow:1;overflow-y:auto;padding:15px;padding-bottom:90px;} .view-section.active{display:block;}
.top-nav{display:flex;justify-content:space-around;background:#0f172a;border-bottom:1px solid rgba(56,189,248,0.2);padding:8px 4px;}
.nav-item{text-align:center;color:var(--text-muted);font-size:10px;cursor:pointer;flex:1;} .nav-item.active{color:var(--accent-gold);}
.banner-card{background:linear-gradient(135deg,#172554,#1e1b4b);border:1px solid rgba(251,191,36,0.3);border-radius:20px;padding:20px;margin-bottom:15px;}
.banner-btn{background:linear-gradient(90deg,#fbbf24,#f59e0b);color:#000;border:none;padding:8px 16px;border-radius:20px;font-size:11px;font-weight:bold;cursor:pointer;}
.home-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:15px;}
.home-grid-card{background:linear-gradient(145deg,#1e293b,#0f172a);border:1px solid var(--card-border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;}
.packages-grid-2x2{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
.pkg-card{background:linear-gradient(145deg,#1e293b,#0f172a);border-radius:16px;padding:14px;text-align:center;border:2px solid #64748b;}
.task-row-card{background:linear-gradient(145deg,#1e293b,#0f172a);border:1px solid var(--card-border);border-radius:16px;padding:12px 14px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;}
.tr-btn{background:linear-gradient(90deg,#fbbf24,#f59e0b);color:#000;border:none;padding:6px 12px;border-radius:16px;font-size:11px;font-weight:bold;cursor:pointer;}
.ref-banner{background:linear-gradient(135deg,#1e1b4b,#312e81);border:1px solid rgba(168,85,247,0.4);border-radius:18px;padding:16px;text-align:center;margin-bottom:15px;}
.ref-logo-img{width:55px;height:55px;border-radius:50%;border:2px solid #fbbf24;box-shadow:0 0 15px rgba(251,191,36,0.6);margin-bottom:8px;object-fit:cover;}
.ref-input-box{display:flex;background:rgba(15,23,42,0.8);border:1px solid var(--card-border);border-radius:12px;padding:6px;margin:10px 0;gap:6px;}
.social-share-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;}
.ss-btn{background:rgba(30,41,59,0.9);border:1px solid var(--card-border);border-radius:12px;padding:10px 6px;text-align:center;font-size:10px;font-weight:bold;cursor:pointer;color:#fff;display:flex;flex-direction:column;align-items:center;gap:4px;text-decoration:none;transition:0.2s;}
.ss-btn:hover{transform:translateY(-2px);border-color:var(--accent-gold);}
.ss-btn img{width:24px;height:24px;object-fit:contain;}
.ss-btn.telegram{background:linear-gradient(145deg,#0e8ed9,#0088cc);} .ss-btn.whatsapp{background:linear-gradient(145deg,#25D366,#128C7E);}
.ss-btn.imo{background:linear-gradient(145deg,#00aeef,#008bd0);} .ss-btn.messenger{background:linear-gradient(145deg,#00B2FF,#006AFF);}
.ss-btn.facebook{background:linear-gradient(145deg,#1877F2,#0a59c1);} .ss-btn.tiktok{background:linear-gradient(145deg,#000000,#25F4EE);}
.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);justify-content:center;align-items:center;z-index:1000;padding:15px;}
.modal-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:20px;width:100%;max-width:410px;padding:20px;}
.form-control{width:100%;background:#060913;border:1px solid var(--card-border);border-radius:10px;padding:9px;color:white;font-size:11px;margin-top:4px;}
</style>
</head>
<body>

<div id="authScreen">
<img src="/logo.png" class="auth-logo-img" alt="RS Logo" onerror="this.src='https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4b0.png'">
<div class="auth-logo-title">RS Growth Matrix</div>
<div class="auth-subtitle">নিরাপদ আর্নিং ও মাইনিং প্ল্যাটফর্ম ২০২৬</div>
<div class="auth-box-card">
<div class="auth-switch-tab"><div class="ast-btn active" id="tabRegBtn" onclick="switchAuthMode('reg')">রেজিস্ট্রেশন</div><div class="ast-btn" id="tabLoginBtn" onclick="switchAuthMode('login')">লগইন</div></div>
<div id="registrationFormSection">
<div class="auth-form-group"><label>আপনার নাম:</label><input type="text" id="regName" class="form-control" placeholder="আপনার নাম লিখুন"></div>
<div class="auth-form-group"><label>মোবাইল নম্বর (১১ ডিজিট):</label><input type="text" id="regPhone" class="form-control" placeholder="017xxxxxxxx" maxlength="11"></div>
<div class="auth-form-group"><label>পাসওয়ার্ড:</label><input type="password" idconst express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ LOGO ROUTE - PREMIUM LOGO SERVE
app.get('/logo.png', (req, res) => {
    const possiblePaths = [
        path.join(__dirname, 'rs_logo.png'),
        path.join(__dirname, 'logo.png'),
        '/mnt/data/rs_logo.png',
        '/mnt/data/rs_logo_small.png'
    ];
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) return res.sendFile(p);
    }
    // fallback - redirect to CDN if local not found
    return res.redirect('https://i.ibb.co/0jZ3XqgJ/rs-logo.png');
});

if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log('MongoDB Connected'))
      .catch(err => console.error(err));
}

app.get('/api/tasks', (req, res) => {
    const defaultTasks = [
        { _id: 1, title: "MicroTask #1: YouTube Channel Subscribe & Watch", reward: 50, description: "১. দেওয়া লিংকে ক্লিক করে ইউটিউব চ্যানেল সাবস্ক্রাইব করুন।\n২. ভিডিওটি সম্পূর্ণ দেখে একটি লাইক দিন।\n৩. আপনার ইউটিউব ইউজারনেম প্রুফ হিসেবে নিচে লিখুন।" },
        { _id: 2, title: "MicroTask #2: Facebook Page Like & Follow", reward: 40, description: "১. ফেসবুক পেজে প্রবেশ করে লাইক ও ফলো করুন।\n২. আপনার ফেসবুক প্রোফাইল লিংক বা নাম প্রুফ দিন।" }
    ];
    res.json(defaultTasks);
});

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RS Growth Matrix - Ultimate Earning Platform</title>

<!-- ✅ SHARE PREVIEW FIX - OG TAGS -->
<link rel="icon" type="image/png" href="/logo.png">
<meta property="og:title" content="RS Growth Matrix - Ultimate Earning Platform 2026">
<meta property="og:description" content="RS Growth Matrix - প্রতিদিন কাজ করুন, প্যাকেজ মাইন করুন আর ইনকাম করুন। ২৪ ঘণ্টা অটো RS কয়েন মাইনিং।">
<meta property="og:image" content="/logo.png">
<meta property="og:image:width" content="512">
<meta property="og:image:height" content="512">
<meta property="og:url" content="https://rs.taptoearn.app">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="/logo.png">

<style>
:root{--bg-color:#060913;--card-bg:#0f172a;--card-border:#1e293b;--text-main:#f8fafc;--text-muted:#94a3b8;--accent-blue:#38bdf8;--accent-green:#22c55e;--accent-gold:#fbbf24;--accent-purple:#a855f7;}
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',Roboto,sans-serif;}
body{background:var(--bg-color);color:var(--text-main);padding:10px;display:flex;justify-content:center;align-items:center;min-height:100vh;overflow:hidden;}
.container{width:100%;max-width:440px;background:var(--card-bg);border-radius:28px;border:1px solid var(--card-border);overflow:hidden;display:flex;flex-direction:column;height:94vh;position:relative;}
#authScreen{position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle at center,#1e1b4b 0%,#060913 100%);z-index:2000;display:flex;flex-direction:column;align-items:center;padding:20px;overflow-y:auto;}
.auth-logo-img{width:95px;height:95px;border-radius:50%;border:3px solid #fbbf24;box-shadow:0 0 30px rgba(251,191,36,0.7);margin:10px 0;object-fit:cover;background:#0f172a;}
.auth-logo-title{font-size:22px;font-weight:900;color:var(--accent-gold);text-shadow:0 0 15px rgba(251,191,36,0.6);}
.auth-subtitle{font-size:11px;color:var(--text-muted);margin-bottom:14px;}
.auth-box-card{background:rgba(15,23,42,0.9);border:1px solid rgba(251,191,36,0.3);border-radius:18px;padding:15px;width:100%;}
.auth-form-group{margin-bottom:8px;} .auth-form-group label{font-size:10px;color:var(--text-muted);display:block;margin-bottom:3px;}
.auth-switch-tab{display:flex;background:#060913;border-radius:10px;padding:3px;margin-bottom:12px;border:1px solid var(--card-border);}
.ast-btn{flex:1;text-align:center;padding:7px;font-size:11px;font-weight:bold;cursor:pointer;border-radius:8px;color:var(--text-muted);}
.ast-btn.active{background:linear-gradient(90deg,var(--accent-gold),#f59e0b);color:#000;}
.top-user-bar{padding:15px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--card-border);background:linear-gradient(180deg,#131d38 0%,#0f172a 100%);}
.user-left{display:flex;align-items:center;gap:10px;}
.user-avatar-container{position:relative;width:44px;height:44px;}
.user-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#fbbf24,#a855f7);padding:2px;display:flex;align-items:center;justify-content:center;overflow:hidden;}
.user-avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover;}
.balance-pill{background:rgba(15,23,42,0.9);border:1px solid #38bdf855;padding:6px 12px;border-radius:20px;text-align:right;}
.b-val{font-size:14px;font-weight:bold;color:var(--accent-green);} .rs-val{font-size:11px;font-weight:bold;color:var(--accent-gold);}
.view-section{display:none;flex-grow:1;overflow-y:auto;padding:15px;padding-bottom:90px;} .view-section.active{display:block;}
.top-nav{display:flex;justify-content:space-around;background:#0f172a;border-bottom:1px solid rgba(56,189,248,0.2);padding:8px 4px;}
.nav-item{text-align:center;color:var(--text-muted);font-size:10px;cursor:pointer;flex:1;} .nav-item.active{color:var(--accent-gold);}
.banner-card{background:linear-gradient(135deg,#172554,#1e1b4b);border:1px solid rgba(251,191,36,0.3);border-radius:20px;padding:20px;margin-bottom:15px;}
.banner-btn{background:linear-gradient(90deg,#fbbf24,#f59e0b);color:#000;border:none;padding:8px 16px;border-radius:20px;font-size:11px;font-weight:bold;cursor:pointer;}
.home-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:15px;}
.home-grid-card{background:linear-gradient(145deg,#1e293b,#0f172a);border:1px solid var(--card-border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;}
.packages-grid-2x2{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
.pkg-card{background:linear-gradient(145deg,#1e293b,#0f172a);border-radius:16px;padding:14px;text-align:center;border:2px solid #64748b;}
.task-row-card{background:linear-gradient(145deg,#1e293b,#0f172a);border:1px solid var(--card-border);border-radius:16px;padding:12px 14px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;}
.tr-btn{background:linear-gradient(90deg,#fbbf24,#f59e0b);color:#000;border:none;padding:6px 12px;border-radius:16px;font-size:11px;font-weight:bold;cursor:pointer;}
.ref-banner{background:linear-gradient(135deg,#1e1b4b,#312e81);border:1px solid rgba(168,85,247,0.4);border-radius:18px;padding:16px;text-align:center;margin-bottom:15px;}
.ref-logo-img{width:55px;height:55px;border-radius:50%;border:2px solid #fbbf24;box-shadow:0 0 15px rgba(251,191,36,0.6);margin-bottom:8px;object-fit:cover;}
.ref-input-box{display:flex;background:rgba(15,23,42,0.8);border:1px solid var(--card-border);border-radius:12px;padding:6px;margin:10px 0;gap:6px;}
.social-share-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;}
.ss-btn{background:rgba(30,41,59,0.9);border:1px solid var(--card-border);border-radius:12px;padding:10px 6px;text-align:center;font-size:10px;font-weight:bold;cursor:pointer;color:#fff;display:flex;flex-direction:column;align-items:center;gap:4px;text-decoration:none;transition:0.2s;}
.ss-btn:hover{transform:translateY(-2px);border-color:var(--accent-gold);}
.ss-btn img{width:24px;height:24px;object-fit:contain;}
.ss-btn.telegram{background:linear-gradient(145deg,#0e8ed9,#0088cc);} .ss-btn.whatsapp{background:linear-gradient(145deg,#25D366,#128C7E);}
.ss-btn.imo{background:linear-gradient(145deg,#00aeef,#008bd0);} .ss-btn.messenger{background:linear-gradient(145deg,#00B2FF,#006AFF);}
.ss-btn.facebook{background:linear-gradient(145deg,#1877F2,#0a59c1);} .ss-btn.tiktok{background:linear-gradient(145deg,#000000,#25F4EE);}
.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);justify-content:center;align-items:center;z-index:1000;padding:15px;}
.modal-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:20px;width:100%;max-width:410px;padding:20px;}
.form-control{width:100%;background:#060913;border:1px solid var(--card-border);border-radius:10px;padding:9px;color:white;font-size:11px;margin-top:4px;}
</style>
</head>
<body>

<div id="authScreen">
<img src="/logo.png" class="auth-logo-img" alt="RS Logo" onerror="this.src='https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4b0.png'">
<div class="auth-logo-title">RS Growth Matrix</div>
<div class="auth-subtitle">নিরাপদ আর্নিং ও মাইনিং প্ল্যাটফর্ম ২০২৬</div>
<div class="auth-box-card">
<div class="auth-switch-tab"><div class="ast-btn active" id="tabRegBtn" onclick="switchAuthMode('reg')">রেজিস্ট্রেশন</div><div class="ast-btn" id="tabLoginBtn" onclick="switchAuthMode('login')">লগইন</div></div>
<div id="registrationFormSection">
<div class="auth-form-group"><label>আপনার নাম:</label><input type="text" id="regName" class="form-control" placeholder="আপনার নাম লিখুন"></div>
<div class="auth-form-group"><label>মোবাইল নম্বর (১১ ডিজিট):</label><input type="text" id="regPhone" class="form-control" placeholder="017xxxxxxxx" maxlength="11"></div>
<div class="auth-form-group"><label>পাসওয়ার্ড:</label><input type="password" id
