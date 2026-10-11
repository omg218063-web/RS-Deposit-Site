const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log('MongoDB Connected Successfully'))
      .catch(err => console.error('MongoDB Connection Error:', err));
}

// Offerwall Configuration from Render Environment Variables
const OFFERWALL_PUBLIC_KEY = process.env.PUBLIC_KEY || 'demo_public_key';
const OFFERWALL_SECRET_KEY = process.env.SECRET_KEY || 'demo_secret_key';

// Tasks API Route
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

// Offerwall Configuration Route
app.get('/api/offerwall', (req, res) => {
    const userId = req.query.userId || 'guest_user';
    const iframeUrl = `https://www.cpalead.com/offerwall/demo?pub=${OFFERWALL_PUBLIC_KEY}&subid=${userId}`;
    res.json({
        publicKey: OFFERWALL_PUBLIC_KEY,
        iframeUrl: iframeUrl
    });
});

// Offerwall S2S Postback Route
app.get('/api/offerwall/postback', (req, res) => {
    const { subid, reward, secret } = req.query;
    if (secret && secret !== OFFERWALL_SECRET_KEY) {
        return res.status(403).send('Unauthorized Postback Signature');
    }
    console.log(`[Offerwall Reward Received] User: ${subid}, Reward: ${reward}`);
    res.send('1');
});

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RS Growth Matrix - Ultimate Earning Platform</title>
    <style>
        :root {
            --bg-color: #060913;
            --card-bg: #0f172a;
            --card-border: #1e293b;
            --card-border-glow: #38bdf855;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --accent-blue: #38bdf8;
            --accent-green: #22c55e;
            --accent-gold: #fbbf24;
            --accent-purple: #a855f7;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-main);
            padding: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .container {
            width: 100%;
            max-width: 440px;
            background: var(--card-bg);
            border-radius: 28px;
            border: 1px solid var(--card-border);
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
            position: relative;
            display: flex;
            flex-direction: column;
            height: 94vh;
        }

        .top-user-bar {
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--card-border);
            background: linear-gradient(180deg, #131d38 0%, #0f172a 100%);
            flex-shrink: 0;
        }
        .user-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .user-avatar-container {
            position: relative;
            width: 44px; height: 44px;
        }
        .user-avatar {
            width: 44px; height: 44px; border-radius: 50%;
            background: linear-gradient(135deg, #fbbf24, #a855f7);
            padding: 2px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #000;
        }
        .user-avatar img {
            width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
        }
        .plus-upload-icon {
            position: absolute; bottom: -2px; right: -2px; background: var(--accent-green); color: white;
            width: 16px; height: 16px; border-radius: 50%; font-size: 10px; display: flex;
            align-items: center; justify-content: center; cursor: pointer; border: 1px solid #0f172a;
        }
        .user-info h3 { font-size: 14px; font-weight: bold; cursor: pointer; }
        .user-info p { font-size: 10px; color: var(--accent-gold); display: flex; align-items: center; gap: 2px; }

        .balance-pill {
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid var(--card-border-glow);
            padding: 6px 12px;
            border-radius: 20px;
            text-align: right;
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
        }
        .balance-pill .b-val { font-size: 14px; font-weight: bold; color: var(--accent-green); }
        .balance-pill .rs-val { font-size: 11px; font-weight: bold; color: var(--accent-gold); margin-top: 1px; }
        .balance-pill .b-lbl { font-size: 9px; color: var(--text-muted); }

        .marquee-container {
            background: linear-gradient(90deg, #1e1b4b, #172554);
            border-bottom: 1px solid rgba(56, 189, 248, 0.2);
            padding: 8px 12px;
            font-size: 11px;
            color: var(--accent-gold);
            overflow: hidden;
            white-space: nowrap;
            flex-shrink: 0;
        }
        .marquee-container marquee { font-weight: 500; }

        .view-section {
            display: none;
            flex-grow: 1;
            overflow-y: auto;
            padding: 15px;
            animation: fadeIn 0.25s ease-in-out;
            padding-bottom: 90px;
        }
        .view-section.active { display: block; }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .premium-notice-box {
            background: linear-gradient(135deg, rgba(30, 27, 75, 0.9), rgba(15, 23, 42, 0.95));
            border: 2px solid var(--accent-gold);
            border-radius: 20px;
            padding: 18px;
            margin-bottom: 15px;
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.25);
            position: relative;
            overflow: hidden;
        }
        .premium-notice-box::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 4px; height: 100%;
            background: linear-gradient(to bottom, var(--accent-gold), var(--accent-purple));
        }
        .notice-title {
            font-size: 14px;
            font-weight: bold;
            color: var(--accent-gold);
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 8px;
        }
        .notice-desc {
            font-size: 11px;
            color: #e2e8f0;
            line-height: 1.6;
        }

        .banner-card {
            background: linear-gradient(135deg, #172554, #1e1b4b);
            border: 1px solid rgba(251, 191, 36, 0.3);
            border-radius: 20px;
            padding: 20px;
            position: relative;
            overflow: hidden;
            margin-bottom: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        }
        .banner-card h2 { font-size: 16px; color: var(--accent-gold); margin-bottom: 4px; }
        .banner-card p { font-size: 11px; color: #cbd5e1; margin-bottom: 12px; line-height: 1.4; }
        .banner-btn {
            background: linear-gradient(90deg, #fbbf24, #f59e0b);
            color: #000; border: none; padding: 8px 16px; border-radius: 20px;
            font-size: 11px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
        }

        .section-heading { font-size: 13px; font-weight: bold; color: var(--text-muted); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
        .home-grid-3 {
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px;
        }
        .home-grid-card {
            background: linear-gradient(145deg, #1e293b, #0f172a);
            border: 1px solid var(--card-border);
            border-radius: 16px; padding: 14px 8px; text-align: center; cursor: pointer;
            transition: 0.2s;
        }
        .home-grid-card:hover { border-color: var(--accent-blue); transform: translateY(-2px); }
        .hg-icon { font-size: 22px; margin-bottom: 6px; }
        .hg-title { font-size: 11px; font-weight: bold; margin-bottom: 2px; }
        .hg-sub { font-size: 9px; color: var(--text-muted); }

        .update-card {
            background: rgba(30, 41, 59, 0.5); border: 1px solid var(--card-border);
            border-radius: 14px; padding: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;
        }

        .packages-grid-2x2 {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }
        .pkg-card {
            background: linear-gradient(145deg, #1e293b, #0f172a);
            border-radius: 16px;
            padding: 14px;
            text-align: center;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .pkg-card.tier-1 { border: 2px solid #64748b; box-shadow: 0 0 8px rgba(100, 116, 139, 0.3); }
        .pkg-card.tier-2 { border: 2px solid #38bdf8; box-shadow: 0 0 10px rgba(56, 189, 248, 0.4); }
        .pkg-card.tier-3 { border: 2px solid #818cf8; box-shadow: 0 0 12px rgba(129, 140, 248, 0.4); }
        .pkg-card.tier-4 { border: 2px solid #a855f7; box-shadow: 0 0 14px rgba(168, 85, 247, 0.4); }
        .pkg-card.tier-5 { border: 2px solid #f472b6; box-shadow: 0 0 14px rgba(244, 114, 182, 0.4); }
        .pkg-card.tier-6 { border: 2px solid #fbbf24; box-shadow: 0 0 16px rgba(251, 191, 36, 0.5); }
        .pkg-card.tier-7 { border: 2px solid #f97316; box-shadow: 0 0 18px rgba(249, 115, 22, 0.6); }
        .pkg-card.tier-8 { border: 2px solid #ef4444; box-shadow: 0 0 22px rgba(239, 68, 68, 0.8); background: linear-gradient(145deg, #2a1b22, #0f172a); }

        .pkg-title { font-size: 12px; font-weight: bold; margin-bottom: 4px; color: var(--text-main); }
        .pkg-price { font-size: 13px; font-weight: bold; color: var(--accent-gold); margin-bottom: 6px; }
        .pkg-rate { font-size: 10px; color: var(--text-muted); margin-bottom: 10px; }
        .pkg-btn {
            background: linear-gradient(90deg, #38bdf8, #2563eb); color: #fff; border: none;
            padding: 6px; border-radius: 10px; font-size: 10px; font-weight: bold; cursor: pointer; width: 100%;
        }
        .pkg-active-status {
            background: rgba(34, 197, 94, 0.15); border: 1px solid var(--accent-green); border-radius: 10px;
            padding: 8px; margin-top: 6px; font-size: 10px; text-align: center; color: var(--accent-green);
        }

        .popup-amount-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            margin-top: 6px;
            margin-bottom: 10px;
        }
        .popup-amt-btn {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid var(--card-border);
            border-radius: 8px;
            padding: 6px;
            text-align: center;
            font-size: 11px;
            font-weight: bold;
            color: var(--accent-gold);
            cursor: pointer;
            transition: 0.2s;
        }
        .popup-amt-btn:hover {
            border-color: var(--accent-gold);
            background: rgba(251, 191, 36, 0.1);
        }

        .task-row-card {
            background: linear-gradient(145deg, #1e293b, #0f172a);
            border: 1px solid var(--card-border);
            border-radius: 16px; padding: 12px 14px; margin-bottom: 10px;
            display: flex; align-items: center; justify-content: space-between;
        }
        .tr-left { display: flex; align-items: center; gap: 12px; }
        .tr-icon { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .tr-info h4 { font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 4px; }
        .tr-info p { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
        .tr-btn {
            background: linear-gradient(90deg, #fbbf24, #f59e0b); color: #000; border: none;
            padding: 6px 12px; border-radius: 16px; font-size: 11px; font-weight: bold; cursor: pointer;
        }

        .offerwall-box {
            background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(30, 41, 59, 0.9));
            border: 2px dashed var(--accent-purple);
            border-radius: 18px;
            padding: 15px;
            margin-bottom: 15px;
            text-align: center;
        }

        .podium-box {
            display: flex; justify-content: center; align-items: flex-end; gap: 10px; margin-bottom: 20px;
        }
        .podium-col {
            background: linear-gradient(180deg, #1e293b, #0f172a); border: 1px solid var(--card-border);
            border-radius: 16px; padding: 16px 6px 12px 6px; text-align: center; flex: 1; position: relative;
        }
        .podium-col.rank-1 { border-color: var(--accent-gold); transform: scale(1.05); background: linear-gradient(180deg, rgba(251,191,36,0.15), #0f172a); box-shadow: 0 0 20px rgba(251,191,36,0.25); }
        .crown {
            position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        }
        .p-ava { width: 45px; height: 45px; border-radius: 50%; margin: 0 auto 6px; border: 2px solid var(--accent-gold); overflow: hidden; display: flex; align-items: center; justify-content: center; background: #334155; font-weight: bold; color: #fff; }
        .p-ava img { width: 100%; height: 100%; object-fit: cover; }

        .support-banner {
            background: linear-gradient(145deg, #1e293b, #0f172a); border: 1px solid var(--card-border);
            border-radius: 16px; padding: 14px; margin-bottom: 15px; display: flex; gap: 12px; align-items: center;
        }
        .chat-box-area {
            background: rgba(15, 23, 42, 0.7); border: 1px solid var(--card-border); border-radius: 16px; padding: 12px; margin-top: 10px;
            max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;
        }
        .chat-msg {
            padding: 8px 12px; border-radius: 12px; font-size: 11px; max-width: 85%; line-height: 1.4;
        }
        .chat-msg.user { background: #1e293b; color: #fff; align-self: flex-end; border-bottom-right-radius: 2px; }
        .chat-msg.support { background: #172554; color: var(--accent-blue); align-self: flex-start; border-bottom-left-radius: 2px; border: 1px solid rgba(56,189,248,0.2); }

        .ref-banner {
            background: linear-gradient(135deg, #1e1b4b, #312e81); border: 1px solid rgba(168, 85, 247, 0.4);
            border-radius: 18px; padding: 16px; text-align: center; margin-bottom: 15px;
        }
        .ref-logo-circle {
            width: 50px; height: 50px; border-radius: 50%;
            background: linear-gradient(135deg, #fbbf24, #d97706);
            display: inline-flex; align-items: center; justify-content: center;
            font-size: 18px; font-weight: bold; color: #000;
            border: 2px solid #fff; box-shadow: 0 0 12px rgba(251,191,36,0.6);
            margin-bottom: 6px;
        }
        .ref-input-box {
            display: flex; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--card-border);
            border-radius: 12px; padding: 6px; margin: 10px 0; gap: 6px;
        }
        .social-share-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
        .ss-btn {
            background: rgba(30, 41, 59, 0.8); border: 1px solid var(--card-border); border-radius: 10px;
            padding: 8px; text-align: center; font-size: 11px; cursor: pointer; color: var(--text-main);
            display: flex; align-items: center; justify-content: center; gap: 4px; text-decoration: none;
        }

        .live-ticker-box-large {
            background: radial-gradient(circle, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%);
            border: 1px solid var(--accent-purple); border-radius: 16px; padding: 12px; margin-top: 15px;
            height: 110px; overflow: hidden; position: relative;
        }
        .ticker-list {
            display: flex; flex-direction: column; gap: 8px; animation: scrollTicker 4s linear infinite;
        }
        .ticker-list:hover { animation-play-state: paused; }
        @keyframes scrollTicker {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }
        .ticker-item {
            font-size: 11px; padding: 6px 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;
        }
        .t-dep { color: var(--accent-green); font-weight: 500; }
        .t-wd { color: #ef4444; font-weight: 500; }
        .t-bon { color: var(--accent-gold); font-weight: 500; }
        .t-ref { color: var(--accent-purple); font-weight: 500; }

        .acc-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 15px; text-align: center; }
        .acc-stat-card { background: rgba(30, 41, 59, 0.5); border: 1px solid var(--card-border); border-radius: 12px; padding: 10px 4px; }
        
        .transaction-row {
            background: rgba(30, 41, 59, 0.4); border: 1px solid var(--card-border); border-radius: 12px;
            padding: 10px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;
        }

        /* FIXED NAVIGATION BAR STYLING */
        .top-nav {
            display: flex; 
            justify-content: space-around; 
            background: linear-gradient(180deg, #131d38, #0f172a);
            border-bottom: 1px solid rgba(56, 189, 248, 0.2); 
            padding: 8px 4px; 
            flex-shrink: 0;
            position: relative;
            z-index: 9999;
        }
        .nav-item { 
            text-align: center; 
            color: var(--text-muted); 
            font-size: 10px; 
            cursor: pointer; 
            flex: 1;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            user-select: none;
        }
        .nav-item div { 
            font-size: 16px; 
            margin-bottom: 2px; 
            transition: transform 0.3s ease;
        }
        .nav-item:hover {
            color: var(--accent-blue);
            transform: translateY(-2px);
        }
        .nav-item.active { 
            color: var(--accent-gold); 
            text-shadow: 0 0 12px rgba(251, 191, 36, 0.6);
            font-weight: bold;
        }
        .nav-item.active div {
            transform: translateY(-2px) scale(1.1);
        }

        .modal {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); justify-content: center; align-items: center; z-index: 10000; padding: 15px;
        }
        .modal-card {
            background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px;
            width: 100%; max-width: 410px; padding: 20px; position: relative; max-height: 90vh; overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.9);
        }
        .form-control {
            width: 100%; background: #060913; border: 1px solid var(--card-border); border-radius: 10px;
            padding: 9px; color: white; font-size: 11px; margin-top: 4px;
        }

        .admin-trigger-btn {
            background: linear-gradient(90deg, #a855f7, #6366f1);
            color: white; border: none; padding: 6px 12px; border-radius: 12px;
            font-size: 10px; font-weight: bold; cursor: pointer; margin-top: 8px; width: 100%;
            display: flex; align-items: center; justify-content: center; gap: 4px;
        }

        .admin-dashboard-container {
            background: linear-gradient(145deg, #0f172a, #060913);
            border: 2px solid var(--accent-gold);
            border-radius: 18px;
            padding: 16px;
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.25);
        }
        .admin-stat-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 14px;
        }
        .admin-stat-box {
            background: rgba(30, 41, 59, 0.9);
            border: 1px solid var(--card-border);
            border-radius: 14px;
            padding: 12px;
            text-align: center;
            cursor: pointer;
            transition: 0.2s;
        }
        .admin-stat-box:hover { border-color: var(--accent-gold); transform: translateY(-2px); }
        .admin-live-list-box {
            background: rgba(6, 9, 19, 0.9);
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 10px;
            max-height: 140px;
            overflow-y: auto;
            margin-top: 8px;
            margin-bottom: 14px;
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="top-user-bar">
            <div class="user-left">
                <div class="user-avatar-container">
                    <div class="user-avatar" id="headerAvatarBox">
                        RS
                    </div>
                    <div class="plus-upload-icon" onclick="triggerPhotoUpload()" title="ছবি আপলোড করুন">+</div>
                    <input type="file" id="globalPhotoInput" style="display: none;" accept="image/*" onchange="handlePhotoUpload(event)">
                </div>
                <div class="user-info">
                    <h3 id="headerName" onclick="openEditProfileModal()" style="cursor: pointer;" title="এডিট করতে ক্লিক করুন">Rakibul Islam ✏️</h3>
                    <p style="display:flex; align-items:center; gap:3px;">👑 VIP Member <span style="background:var(--accent-green); color:white; font-size:8px; padding:1px 4px; border-radius:4px;">Verified ✓</span></p>
                </div>
            </div>
            <div class="balance-pill">
                <div class="b-val" id="topBalanceDisplay">৳ ২৫.০০</div>
                <div class="rs-val" id="topRsDisplay">🪙 0.00 RS</div>
                <div class="b-lbl">Balance / RS Coin</div>
            </div>
        </div>

        <!-- NAVIGATION BAR -->
        <div class="top-nav">
            <div class="nav-item active" onclick="switchTab('home', this)">
                <div>🏠</div>হোম
            </div>
            <div class="nav-item" onclick="switchTab('packages', this)">
                <div>💎</div>প্যাকেজ
            </div>
            <div class="nav-item" onclick="switchTab('tasks', this)">
                <div>📋</div>টাস্ক
            </div>
            <div class="nav-item" onclick="switchTab('ranking', this)">
                <div>🏆</div>র‍্যাঙ্কিং
            </div>
            <div class="nav-item" onclick="switchTab('support', this)">
                <div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" style="display:inline-block; vertical-align:middle;"><path d="M18 10a6 6 0 1 0-12 0v4h12v-4z"></path><path d="M6 14v3a2 2 0 0 0 2 2h1v-5H6z"></path><path d="M15 19h1a2 2 0 0 0 2-2v-3h-3v5z"></path></svg>
                </div>সাপোর্ট
            </div>
            <div class="nav-item" onclick="switchTab('referral', this)">
                <div>👥</div>রেফার
            </div>
            <div class="nav-item" onclick="switchTab('account', this)">
                <div>👤</div>অ্যাকাউন্ট
            </div>
        </div>

        <div class="marquee-container">
            <marquee behavior="scroll" direction="left" scrollamount="4">
                📢 RS-এর পক্ষ থেকে স্বাগতম! আমাদের সাইটে আপনারা প্যাকেজ কিনে ২৪ ঘণ্টা রিয়েল-টাইম RS কয়েন মাইনিং করতে পারেন এবং বিকাশ ও নগদের মাধ্যমে লেনদেন করুন।
            </marquee>
        </div>

        <!-- Home View -->
        <div id="homeView" class="view-section active">
            <div class="banner-card">
                <h2>RS REWARDS CENTER</h2>
                <p>প্রতিদিন কাজ করুন, প্যাকেজ মাইন করুন আর আরও বেশি রিওয়ার্ড জিতুন!</p>
                <button type="button" class="banner-btn" onclick="switchTab('packages', document.querySelectorAll('.nav-item')[1])">🚀 প্যাকেজ দেখুন &rsaquo;</button>
            </div>

            <div class="section-heading"><span>⚡ আজকের কার্যক্রম</span> <span style="font-size: 10px; color: var(--accent-blue); cursor: pointer;" onclick="switchTab('tasks', document.querySelectorAll('.nav-item')[2])">টাস্ক সম্পন্ন করুন &rsaquo;</span></div>
            <div class="home-grid-3">
                <div class="home-grid-card" onclick="claimDailyTask()">
                    <div class="hg-icon" style="color: var(--accent-blue);">📋</div>
                    <div class="hg-title">ডেইলি টাস্ক</div>
                    <div class="hg-sub" id="dailyTaskSubLabel">দিনে একবার ক্লেইম</div>
                </div>
                <div class="home-grid-card" onclick="checkInDaily()">
                    <div class="hg-icon" style="color: var(--accent-green);">📅</div>
                    <div class="hg-title">চেক-ইন</div>
                    <div class="hg-sub">লগইন বোনাস</div>
                </div>
                <div class="home-grid-card" onclick="switchTab('referral', document.querySelectorAll('.nav-item')[5])">
                    <div class="hg-icon" style="color: var(--accent-purple);">🎁</div>
                    <div class="hg-title">রিওয়ার্ড</div>
                    <div class="hg-sub">স্পেশাল বোনাস</div>
                </div>
            </div>

            <div class="premium-notice-box">
                <div class="notice-title">
                    <span>👑</span> অফিসিয়াল ঘোষণা ও প্রিমিয়াম অফার ২০২৬
                </div>
                <div class="notice-desc">
                    প্রিয় ব্যবহারকারী, RS Growth Matrix-এ আপনাকে স্বাগতম! আমাদের প্রিমিয়াম রিং প্যাকেজগুলো অ্যাক্টিভ করে এখন থেকেই প্রতি মিনিটে আনলিমিটেড রিয়েল আরএস কয়েন মাইন করুন। প্রতিটি ডিপোজিট ও উইথড্র এখন সম্পূর্ণ সুরক্ষিত ও দ্রুত প্রসেস করা হচ্ছে। যেকোনো সহায়তায় আমাদের সাপোর্টে যোগাযোগ করুন!
                </div>
            </div>

            <div class="section-heading"><span>📢 সর্বশেষ আপডেট</span></div>
            <div class="update-card">
                <div>
                    <h4 style="font-size: 12px; margin-bottom: 2px; color: var(--accent-gold);">গুরুত্বপূর্ণ - RS প্যাকেজ মাইনিং আপডেট!</h4>
                    <p style="font-size: 10px; color: var(--text-muted);">আপনার প্যাকেজ থেকে প্রতি মিনিটে রিয়েল-টাইমে RS কয়েন জেনারেট হচ্ছে...</p>
                </div>
                <span style="font-size: 9px; color: var(--text-muted);">2026</span>
            </div>
        </div>

        <!-- Packages View -->
        <div id="packagesView" class="view-section">
            <div class="section-heading"><span>💎 এক্সক্লুসিভ মাইনিং প্যাকেজ</span> <span style="font-size: 10px; color: var(--accent-gold);">২৪ ঘণ্টা অটো মাইনিং</span></div>
            <p style="font-size: 10px; color: var(--text-muted); margin-bottom: 12px;">প্যাকেজ আনলক করতে ক্লিক করুন, পর্যাপ্ত ফান্ড না থাকলে ডিপোজিট পপআপ ও OK বাটনসহ অপশন আসবে।</p>
            
            <div class="packages-grid-2x2" id="packagesGridContainer"></div>
        </div>

        <!-- Tasks View -->
        <div id="tasksView" class="view-section">
            <div class="section-heading"><span>🔥 লাইভ অফারওয়াল (Offerwall)</span> <span style="font-size: 10px; color: var(--accent-purple);">● Render Keys Connected</span></div>
            <div class="offerwall-box">
                <h3 style="font-size: 13px; color: var(--accent-purple); margin-bottom: 4px;">🎯 অফারওয়াল সার্ভে ও রিওয়ার্ড টাস্ক</h3>
                <p style="font-size: 10px; color: var(--text-muted); margin-bottom: 10px;">Render-এর PUBLIC_KEY ও SECRET_KEY দিয়ে অটোমেটিক লোডকৃত লাইভ অফার সম্পন্ন করে আনলিমিটেড কয়েন জেনারেট করুন!</p>
                <button type="button" class="banner-btn" style="background: linear-gradient(90deg, #a855f7, #6366f1); color: #fff;" onclick="openOfferwallModal()">🚀 অফারওয়াল অন করুন</button>
            </div>

            <div class="section-heading"><span>⚡ সার্ভার ও মাইক্রো জবস লাইভ টাস্ক</span> <span style="font-size: 10px; color: var(--accent-green);">● সার্ভার থেকে লোডকৃত</span></div>
            <div id="microJobsListContainer">
                <p style="font-size: 11px; color: var(--text-muted); text-align: center;">সার্ভার থেকে টাস্ক লোড করা হচ্ছে...</p>
            </div>
        </div>

        <!-- Ranking View -->
        <div id="rankingView" class="view-section">
            <div class="section-heading"><span>🏆 গ্লোবাল টপ র‍্যাঙ্কিং লিডারবোর্ড</span> <span style="font-size: 10px; color: var(--accent-gold);">টপ ১ থেকে ১০ কয়েন ক্রমান্বয়ে বৃদ্ধি পাবে</span></div>
            
            <div class="podium-box" id="podiumTop3Container"></div>

            <div class="section-heading"><span>অন্যান্য আর্নারগণ</span></div>
            <div id="rankingListContainer"></div>
        </div>

        <!-- Support View -->
        <div id="supportView" class="view-section">
            <div class="support-banner">
                <div style="font-size: 28px; position: relative;">
                    👩‍💼
                    <span style="position: absolute; bottom: 0; right: -4px; width: 12px; height: 12px; background: var(--accent-green); border-radius: 50%; border: 2px solid #0f172a; display: flex; align-items: center; justify-content: center; font-size: 8px; color: white;">✓</span>
                </div>
                <div>
                    <h4 style="font-size: 13px; font-weight: bold;">RS সাপোর্ট টিম</h4>
                    <p style="font-size: 10px; color: var(--text-muted);">সার্ভিস এজেন্ট: <span id="supportAgentNameDisplay" style="color: var(--accent-gold); font-weight: bold;">মাহিয়া</span> | ● অনলাইন (24/7)</p>
                </div>
            </div>

            <div class="home-grid-3" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 15px;">
                <div class="home-grid-card" onclick="openSupportPopup('deposit')">
                    <div class="hg-icon">💳</div>
                    <div class="hg-title" style="font-size: 9px;">ডিপোজিট</div>
                </div>
                <div class="home-grid-card" onclick="openSupportPopup('withdraw')">
                    <div class="hg-icon">🏦</div>
                    <div class="hg-title" style="font-size: 9px;">উইথড্র</div>
                </div>
                <div class="home-grid-card" onclick="openSupportPopup('bonus')">
                    <div class="hg-icon">🎁</div>
                    <div class="hg-title" style="font-size: 9px;">বোনাস</div>
                </div>
                <div class="home-grid-card" onclick="openSupportPopup('task')">
                    <div class="hg-icon">📋</div>
                    <div class="hg-title" style="font-size: 9px;">ডেইলি টাস্ক</div>
                </div>
            </div>

            <div class="chat-box-area" id="chatBoxContainer">
                <div class="chat-msg support">হ্যালো! আমি RS সাপোর্ট টিম থেকে বলছি। আপনার যেকোনো সমস্যায় আমাদের সাথে কথা বলতে পারেন।</div>
            </div>

            <div style="display: flex; gap: 6px; margin-top: 10px;">
                <input type="text" class="form-control" id="supportInput" placeholder="আপনার সমস্যার বিস্তারিত লিখুন..." style="margin-top:0;">
                <button type="button" class="banner-btn" onclick="sendSupportMsg()">প্রেরণ</button>
            </div>
        </div>

        <!-- Referral View -->
        <div id="referralView" class="view-section">
            <div class="ref-banner">
                <div class="ref-logo-circle">RS</div>
                <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: var(--accent-gold);">RS Growth Matrix - Referral</h3>
                <p style="font-size: 11px; color: #cbd5e1; margin-bottom: 8px;">আজীবন ৩% কমিশন ও ইনস্ট্যান্ট ১০০ আরএস কয়েন</p>
                <p style="font-size: 10px; color: var(--text-muted); margin-bottom: 10px;">অফিসিয়াল সোশ্যাল মিডিয়া (Telegram, WhatsApp, Imo, Messenger, Facebook, TikTok) লাইভ লিংকের মাধ্যমে শেয়ার করুন।</p>
                
                <div class="ref-input-box">
                    <input type="text" id="refLinkInput" value="https://rs.taptoearn.app/ref/RS12345" readonly style="background:transparent; border:none; color:white; font-size:11px; width:100%; outline:none; padding-left:4px;">
                    <button type="button" class="tr-btn" onclick="copyRefLink()">কপি</button>
                </div>
                <div class="social-share-row" style="grid-template-columns: repeat(3, 1fr);">
                    <a href="https://t.me/share/url?url=https://rs.taptoearn.app/ref/RS12345&text=Join%20RS%20Growth%20Matrix" target="_blank" class="ss-btn">✈️ টেলিগ্রাম</a>
                    <a href="https://api.whatsapp.com/send?text=Join%20RS%20Growth%20Matrix:%20https://rs.taptoearn.app/ref/RS12345" target="_blank" class="ss-btn">💬 হোয়াটসঅ্যাপ</a>
                    <a href="https://imo.im/" target="_blank" class="ss-btn">📞 ইমো</a>
                    <a href="fb-messenger://share?link=https://rs.taptoearn.app/ref/RS12345" target="_blank" class="ss-btn">⚡ মেসেঞ্জার</a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=https://rs.taptoearn.app/ref/RS12345" target="_blank" class="ss-btn">📘 ফেসবুক</a>
                    <a href="https://www.tiktok.com/" target="_blank" class="ss-btn">🎵 টিকটক</a>
                </div>
            </div>

            <div class="section-heading"><span>🎁 লাইভ রেফারেল ফিড</span></div>
            <div class="live-ticker-box-large">
                <div class="ticker-list">
                    <div class="ticker-item"><span class="t-ref">🎁 SAJIB_07 রেফারেল সম্পন্ন করে +100 কয়েন বোনাস পেয়েছে</span><span style="font-size:9px; color:var(--text-muted)">১মিঃ আগে</span></div>
                    <div class="ticker-item"><span class="t-ref">🔥 Nayeem_99 রেফারেল সম্পন্ন করে +100 কয়েন বোনাস পেয়েছে</span><span style="font-size:9px; color:var(--text-muted)">৩মিঃ আগে</span></div>
                </div>
            </div>
        </div>

        <!-- Account View -->
        <div id="accountView" class="view-section">
            <div class="section-heading"><span>অ্যাকাউন্ট ওভারভিউ</span></div>
            
            <div class="update-card" style="align-items: center; background: rgba(30, 41, 59, 0.7);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div id="accScreenAvatar" style="width: 45px; height: 45px; border-radius: 50%; background:#334155; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#fff;">RS</div>
                    <div>
                        <h4 style="font-size: 13px;" id="accScreenName">Rakibul Islam</h4>
                        <p style="font-size: 10px; color: var(--accent-gold);" id="accScreenUserPhone">নম্বর: 01700000000</p>
                    </div>
                </div>
                <button type="button" class="tr-btn" onclick="openEditProfileModal()">প্রোফাইল এডিট</button>
            </div>

            <button type="button" class="admin-trigger-btn" onclick="promptAdminLogin()">
                🔐 এডমিন প্যানেল লগইন
            </button>

            <div class="acc-grid-4" style="margin-top: 12px;">
                <div class="acc-stat-card">
                    <div style="font-size: 10px; color: var(--text-muted);">পেন্ডিং</div>
                    <div style="font-size: 11px; font-weight: bold; color: var(--accent-gold); margin-top: 2px;" id="statPending">৳ ০.০০</div>
                </div>
                <div class="acc-stat-card">
                    <div style="font-size: 10px; color: var(--text-muted);">লেনদেন</div>
                    <div style="font-size: 12px; font-weight: bold; color: var(--accent-blue); margin-top: 2px;" id="statTransactions">০</div>
                </div>
                <div class="acc-stat-card">
                    <div style="font-size: 10px; color: var(--text-muted);">আজকের আয়</div>
                    <div style="font-size: 11px; font-weight: bold; color: var(--accent-green); margin-top: 2px;" id="statTodayEarn">৳ ০.০০</div>
                </div>
                <div class="acc-stat-card">
                    <div style="font-size: 10px; color: var(--text-muted);">রেফার আয়</div>
                    <div style="font-size: 11px; font-weight: bold; color: var(--accent-purple); margin-top: 2px;" id="statRefEarn">৳ ০.০০</div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 10px;">
                <button type="button" class="banner-btn" style="width:100%; justify-content:center; background:linear-gradient(90deg, #22c55e, #16a34a); color:#fff;" onclick="openModal('depositModal')">➕ ডিপোজিট</button>
                <button type="button" class="banner-btn" style="width:100%; justify-content:center; background:linear-gradient(90deg, #ef4444, #dc2626); color:#fff;" onclick="openModal('withdrawModal')">➖ উইথড্র</button>
            </div>

            <button type="button" class="banner-btn" style="width:100%; justify-content:center; background:rgba(34, 197, 94, 0.2); color:var(--accent-green); border:1px solid var(--accent-green); margin-bottom:8px;" onclick="openModal('depositHistoryModal')">📋 রিয়েল ডিপোজিট হিস্ট্রি</button>
            <button type="button" class="banner-btn" style="width:100%; justify-content:center; background:rgba(239, 68, 68, 0.2); color:#ef4444; border:1px solid #ef4444; margin-bottom:15px;" onclick="openModal('withdrawHistoryModal')">📋 রিয়েল উইথড্র হিস্ট্রি</button>

            <div class="section-heading" style="margin-top: 15px;"><span>🌐 গ্লোবাল লাইভ ট্রানজেকশন ফিড</span></div>
            <div class="live-ticker-box-large">
                <div class="ticker-list" id="globalLiveTickerList">
                    <div class="ticker-item"><span class="t-dep">📥 ডিপোজিট (বিকাশ): +৳ ১,০০০.০০ (Success)</span><span style="font-size:9px; color:var(--text-muted)">017****94</span></div>
                    <div class="ticker-item"><span class="t-wd">📤 উইথড্র (নগদ): -৳ ৫০০.০০ (Success)</span><span style="font-size:9px; color:var(--text-muted)">018****22</span></div>
                    <div class="ticker-item"><span class="t-bon">🎁 বোনাস অর্জন: +৫০০ RS (Success)</span><span style="font-size:9px; color:var(--text-muted)">019****11</span></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <div class="modal" id="offerwallModal">
        <div class="modal-card" style="max-width:440px; padding:12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="font-size: 14px; color: var(--accent-purple);">🔥 লাইভ অফারওয়াল (Render Keys)</h3>
                <span style="cursor: pointer; font-size: 20px;" onclick="closeModal('offerwallModal')">&times;</span>
            </div>
            <div id="offerwallContainer" style="width: 100%; height: 400px; background: #060913; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                <iframe id="offerwallIframe" src="about:blank" style="width:100%; height:100%; border:none;"></iframe>
            </div>
        </div>
    </div>

    <div class="modal" id="taskDetailModal">
        <div class="modal-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 id="modalTaskTitle" style="font-size: 14px; color: var(--accent-gold);">টাস্ক ডিটেইলস ও নির্দেশিকা</h3>
                <span style="cursor: pointer; font-size: 20px;" onclick="closeModal('taskDetailModal')">&times;</span>
            </div>
            
            <div style="background: rgba(30,41,59,0.7); padding: 10px; border-radius: 10px; margin-bottom: 10px;">
                <p id="modalTaskDesc" style="font-size: 11px; color: var(--text-main); line-height: 1.5; margin-bottom: 8px;"></p>
                <p style="font-size: 11px; color: var(--accent-blue); font-weight: bold;">🔗 টাস্ক লিংক:</p>
                <a id="modalTaskLink" href="#" target="_blank" style="font-size: 11px; color: var(--accent-gold); word-break: break-all; display: block; margin-top: 2px;"></a>
            </div>

            <label style="font-size: 10px; color: var(--text-muted); display: block; margin-top: 6px;">কাজের প্রমাণ (Proof / Text / Username) জমা দিন:</label>
            <textarea id="taskProofInput" class="form-control" rows="3" placeholder="আপনার প্রুফ বা বিস্তারিত এখানে লিখুন..." style="margin-top:4px; margin-bottom:12px; resize:none; font-size:11px;"></textarea>
            
            <button type="button" class="banner-btn" style="width:100%; justify-content:center; background:var(--accent-green); color:#fff;" onclick="submitTaskProof()">প্রুফ সাবমিট করুন (+<span id="modalTaskRewardSpan">0</span> RS)</button>
        </div>
    </div>

    <div class="modal" id="adminPanelModal">
        <div class="modal-card" style="max-width: 410px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="font-size: 14px; color: var(--accent-gold);">👑 RS RANA HASAN - ADMIN PANEL</h3>
                <span style="cursor: pointer; font-size: 20px;" onclick="closeModal('adminPanelModal')">&times;</span>
            </div>
            
            <div class="admin-dashboard-container">
                <div style="font-size: 11px; font-weight: bold; color: var(--accent-gold); margin-bottom: 8px;">📊 লাইভ ওভারভিউ ও সাকসেস ট্র্যাকিং</div>
                <div class="admin-stat-grid">
                    <div class="admin-stat-box" onclick="alert('মোট পেন্ডিং লেনদেন')">
                        <div style="font-size: 10px; color: var(--text-muted);">পেন্ডিং</div>
                        <div style="font-size: 13px; font-weight: bold; color: var(--accent-gold); margin-top: 2px;" id="adminStatPendingCount">০ টি</div>
                    </div>
                    <div class="admin-stat-box" onclick="alert('মোট সফল লেনদেন')">
                        <div style="font-size: 10px; color: var(--text-muted);">সাকসেস (Success)</div>
                        <div style="font-size: 13px; font-weight: bold; color: var(--accent-green); margin-top: 2px;" id="adminStatSuccessCount">০ টি</div>
                    </div>
                </div>
                <div class="admin-stat-grid" style="grid-template-columns: repeat(2, 1fr); margin-bottom: 14px;">
                    <div class="admin-stat-box" onclick="alert('আজকের মোট আয়')">
                        <div style="font-size: 10px; color: var(--text-muted);">আজকের আয়</div>
                        <div style="font-size: 12px; font-weight: bold; color: var(--accent-blue); margin-top: 2px;" id="adminStatTodayEarn">৳ ০</div>
                    </div>
                    <div class="admin-stat-box" onclick="alert('মোট রেফারেল সংখ্যা')">
                        <div style="font-size: 10px; color: var(--text-muted);">রেফারেল</div>
                        <div style="font-size: 12px; font-weight: bold; color: var(--accent-purple); margin-top: 2px;">১০০ জন</div>
                    </div>
                </div>

                <div style="font-size: 11px; font-weight: bold; color: var(--accent-gold); margin-bottom: 4px;">📥 ডিপোজিট রিকোয়েস্ট লিস্ট ও সাবমিট</div>
                <div class="admin-live-list-box" id="adminDepositLiveList">
                    <p style="font-size: 10px; color: var(--text-muted); text-align: center;">পেন্ডিং ডিপোজিট লোড হচ্ছে...</p>
                </div>

                <div style="font-size: 11px; font-weight: bold; color: #ef4444; margin-bottom: 4px; margin-top: 6px;">📤 উইথড্র রিকোয়েস্ট লিস্ট ও সাবমিট</div>
                <div class="admin-live-list-box" id="adminWithdrawLiveList">
                    <p style="font-size: 10px; color: var(--text-muted); text-align: center;">পেন্ডিং উইথড্র লোড হচ্ছে...</p>
                </div>

                <label style="font-size: 10px; color: var(--text-muted); display: block; margin-top: 4px;">ইউজার ট্রানজাকশন নম্বর কপি ও ভেরিফাই:</label>
                <div style="display: flex; gap: 6px; margin-top: 4px; margin-bottom: 12px;">
                    <input type="text" id="adminUserSearch" class="form-control" placeholder="নম্বর বা TrxID দিন" style="margin-top:0; font-size:11px;">
                    <button type="button" class="tr-btn" onclick="verifyAdminTransaction()" style="padding: 6px 12px;">কনফার্ম</button>
                </div>

                <label style="font-size: 10px; color: var(--text-muted);">প্রিমিয়াম এডমিন নোটবুক:</label>
                <textarea id="adminNotebook" class="form-control" rows="3" placeholder="গুরুত্বপূর্ণ নোট লিখে রাখুন..." style="margin-top:4px; margin-bottom:12px; resize:none; font-size:11px;"></textarea>
                
                <button type="button" class="banner-btn" style="width:100%; justify-content:center; background:linear-gradient(90deg, #a855f7, #6366f1); color:#fff;" onclick="saveAdminNote()">নোট সেভ করুন</button>
            </div>
        </div>
    </div>

    <div class="modal" id="depositModal">
        <div class="modal-card">
            <div style
