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

const OFFERWALL_PUBLIC_KEY = process.env.PUBLIC_KEY || 'demo_public_key';
const OFFERWALL_SECRET_KEY = process.env.SECRET_KEY || 'demo_secret_key';

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

app.get('/api/offerwall', (req, res) => {
    const userId = req.query.userId || 'guest_user';
    const iframeUrl = `https://www.cpalead.com/offerwall/demo?pub=${OFFERWALL_PUBLIC_KEY}&subid=${userId}`;
    res.json({
        publicKey: OFFERWALL_PUBLIC_KEY,
        iframeUrl: iframeUrl
    });
});

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
            overflow: hidden;
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
            padding: 12px 15px;
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
            width: 40px; height: 40px;
        }
        .user-avatar {
            width: 40px; height: 40px; border-radius: 50%;
            background: linear-gradient(135deg, #fbbf24, #a855f7);
            padding: 2px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #000;
        }
        .user-avatar img {
            width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
        }
        .plus-upload-icon {
            position: absolute; bottom: -2px; right: -2px; background: var(--accent-green); color: white;
            width: 15px; height: 15px; border-radius: 50%; font-size: 10px; display: flex;
            align-items: center; justify-content: center; cursor: pointer; border: 1px solid #0f172a;
        }
        .user-info h3 { font-size: 13px; font-weight: bold; cursor: pointer; }
        .user-info p { font-size: 9px; color: var(--accent-gold); display: flex; align-items: center; gap: 2px; }

        .balance-pill {
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid var(--card-border-glow);
            padding: 5px 10px;
            border-radius: 20px;
            text-align: right;
        }
        .balance-pill .b-val { font-size: 13px; font-weight: bold; color: var(--accent-green); }
        .balance-pill .rs-val { font-size: 10px; font-weight: bold; color: var(--accent-gold); }
        .balance-pill .b-lbl { font-size: 8px; color: var(--text-muted); }

        .top-nav {
            display: flex; 
            justify-content: space-around; 
            background: linear-gradient(180deg, #131d38, #0f172a);
            border-bottom: 1px solid rgba(56, 189, 248, 0.2); 
            padding: 8px 4px; 
            flex-shrink: 0;
            z-index: 10;
        }
        .nav-item { 
            text-align: center; 
            color: var(--text-muted); 
            font-size: 9px; 
            cursor: pointer; 
            flex: 1;
            transition: all 0.2s ease;
        }
        .nav-item div { 
            font-size: 15px; 
            margin-bottom: 1px; 
        }
        .nav-item.active { 
            color: var(--accent-gold); 
            text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
            font-weight: bold;
        }

        .marquee-container {
            background: linear-gradient(90deg, #1e1b4b, #172554);
            border-bottom: 1px solid rgba(56, 189, 248, 0.2);
            padding: 6px 12px;
            font-size: 10px;
            color: var(--accent-gold);
            overflow: hidden;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .view-section {
            display: none;
            flex-grow: 1;
            overflow-y: auto;
            padding: 15px;
            padding-bottom: 30px;
        }
        .view-section.active { display: block; }

        .banner-card {
            background: linear-gradient(135deg, #172554, #1e1b4b);
            border: 1px solid rgba(251, 191, 36, 0.3);
            border-radius: 20px;
            padding: 18px;
            margin-bottom: 15px;
        }
        .banner-card h2 { font-size: 15px; color: var(--accent-gold); margin-bottom: 4px; }
        .banner-card p { font-size: 11px; color: #cbd5e1; margin-bottom: 10px; }
        .banner-btn {
            background: linear-gradient(90deg, #fbbf24, #f59e0b);
            color: #000; border: none; padding: 6px 14px; border-radius: 20px;
            font-size: 11px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
        }

        .section-heading { font-size: 12px; font-weight: bold; color: var(--text-muted); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
        .home-grid-3 {
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px;
        }
        .home-grid-card {
            background: linear-gradient(145deg, #1e293b, #0f172a);
            border: 1px solid var(--card-border);
            border-radius: 16px; padding: 12px 6px; text-align: center; cursor: pointer;
        }
        .hg-icon { font-size: 20px; margin-bottom: 4px; }
        .hg-title { font-size: 11px; font-weight: bold; margin-bottom: 2px; }
        .hg-sub { font-size: 9px; color: var(--text-muted); }

        .premium-notice-box {
            background: linear-gradient(135deg, rgba(30, 27, 75, 0.9), rgba(15, 23, 42, 0.95));
            border: 2px solid var(--accent-gold);
            border-radius: 16px;
            padding: 14px;
            margin-bottom: 15px;
        }
        .notice-title { font-size: 13px; font-weight: bold; color: var(--accent-gold); margin-bottom: 6px; }
        .notice-desc { font-size: 10px; color: #e2e8f0; line-height: 1.5; }

        .update-card {
            background: rgba(30, 41, 59, 0.5); border: 1px solid var(--card-border);
            border-radius: 12px; padding: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;
        }

        .packages-grid-2x2 {
            display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;
        }
        .pkg-card {
            background: linear-gradient(145deg, #1e293b, #0f172a);
            border-radius: 14px; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;
        }
        .pkg-card.tier-1 { border: 2px solid #64748b; }
        .pkg-card.tier-2 { border: 2px solid #38bdf8; }
        .pkg-card.tier-3 { border: 2px solid #818cf8; }
        .pkg-card.tier-4 { border: 2px solid #a855f7; }
        .pkg-card.tier-5 { border: 2px solid #f472b6; }
        .pkg-card.tier-6 { border: 2px solid #fbbf24; }
        .pkg-card.tier-7 { border: 2px solid #f97316; }
        .pkg-card.tier-8 { border: 2px solid #ef4444; }

        .pkg-title { font-size: 11px; font-weight: bold; margin-bottom: 4px; }
        .pkg-price { font-size: 12px; font-weight: bold; color: var(--accent-gold); margin-bottom: 4px; }
        .pkg-rate { font-size: 9px; color: var(--text-muted); margin-bottom: 8px; }
        .pkg-btn {
            background: linear-gradient(90deg, #38bdf8, #2563eb); color: #fff; border: none;
            padding: 5px; border-radius: 8px; font-size: 9px; font-weight: bold; cursor: pointer; width: 100%;
        }
        .pkg-active-status {
            background: rgba(34, 197, 94, 0.15); border: 1px solid var(--accent-green); border-radius: 8px;
            padding: 6px; margin-top: 4px; font-size: 9px; text-align: center; color: var(--accent-green);
        }

        .task-row-card {
            background: linear-gradient(145deg, #1e293b, #0f172a);
            border: 1px solid var(--card-border);
            border-radius: 14px; padding: 10px 12px; margin-bottom: 8px;
            display: flex; align-items: center; justify-content: space-between;
        }
        .tr-left { display: flex; align-items: center; gap: 10px; }
        .tr-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .tr-info h4 { font-size: 12px; font-weight: bold; }
        .tr-info p { font-size: 9px; color: var(--text-muted); }
        .tr-btn {
            background: linear-gradient(90deg, #fbbf24, #f59e0b); color: #000; border: none;
            padding: 5px 10px; border-radius: 12px; font-size: 10px; font-weight: bold; cursor: pointer;
        }

        .offerwall-box {
            background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(30, 41, 59, 0.9));
            border: 2px dashed var(--accent-purple);
            border-radius: 16px; padding: 14px; margin-bottom: 15px; text-align: center;
        }

        .podium-box { display: flex; justify-content: center; align-items: flex-end; gap: 8px; margin-bottom: 15px; }
        .podium-col {
            background: linear-gradient(180deg, #1e293b, #0f172a); border: 1px solid var(--card-border);
            border-radius: 14px; padding: 14px 4px 10px 4px; text-align: center; flex: 1; position: relative;
        }
        .podium-col.rank-1 { border-color: var(--accent-gold); transform: scale(1.03); }
        .crown { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); font-size: 16px; }
        .p-ava { width: 38px; height: 38px; border-radius: 50%; margin: 0 auto 4px; border: 2px solid var(--accent-gold); overflow: hidden; display: flex; align-items: center; justify-content: center; background: #334155; font-weight: bold; color: #fff; font-size: 11px; }
        .p-ava img { width: 100%; height: 100%; object-fit: cover; }

        .support-banner {
            background: linear-gradient(145deg, #1e293b, #0f172a); border: 1px solid var(--card-border);
            border-radius: 14px; padding: 12px; margin-bottom: 12px; display: flex; gap: 10px; align-items: center;
        }
        .chat-box-area {
            background: rgba(15, 23, 42, 0.7); border: 1px solid var(--card-border); border-radius: 14px; padding: 10px; margin-top: 8px;
            max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;
        }
        .chat-msg { padding: 6px 10px; border-radius: 10px; font-size: 10px; max-width: 85%; }
        .chat-msg.user { background: #1e293b; color: #fff; align-self: flex-end; }
        .chat-msg.support { background: #172554; color: var(--accent-blue); align-self: flex-start; border: 1px solid rgba(56,189,248,0.2); }

        .ref-banner {
            background: linear-gradient(135deg, #1e1b4b, #312e81); border: 1px solid rgba(168, 85, 247, 0.4);
            border-radius: 16px; padding: 14px; text-align: center; margin-bottom: 12px;
        }
        .ref-logo-circle {
            width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #fbbf24, #d97706);
            display: inline-flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; color: #000; margin-bottom: 4px;
        }
        .ref-input-box {
            display: flex; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--card-border);
            border-radius: 10px; padding: 4px; margin: 8px 0; gap: 4px;
        }
        .social-share-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 8px; }
        .ss-btn {
            background: rgba(30, 41, 59, 0.8); border: 1px solid var(--card-border); border-radius: 8px;
            padding: 6px; text-align: center; font-size: 10px; cursor: pointer; color: var(--text-main); text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 3px;
        }

        .live-ticker-box-large {
            background: rgba(30,41,59,0.95); border: 1px solid var(--accent-purple); border-radius: 14px; padding: 10px; margin-top: 10px;
            height: 95px; overflow: hidden; position: relative;
        }
        .ticker-list { display: flex; flex-direction: column; gap: 6px; animation: scrollTicker 4s linear infinite; }
        @keyframes scrollTicker { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        .ticker-item { font-size: 10px; padding: 5px 8px; border-radius: 6px; background: rgba(15, 23, 42, 0.6); display: flex; justify-content: space-between; align-items: center; }
        .t-dep { color: var(--accent-green); }
        .t-wd { color: #ef4444; }
        .t-bon { color: var(--accent-gold); }
        .t-ref { color: var(--accent-purple); }

        .acc-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 12px; text-align: center; }
        .acc-stat-card { background: rgba(30, 41, 59, 0.5); border: 1px solid var(--card-border); border-radius: 10px; padding: 8px 2px; }
        
        .transaction-row {
            background: rgba(30, 41, 59, 0.4); border: 1px solid var(--card-border); border-radius: 10px;
            padding: 8px 10px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;
        }

        .modal {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); justify-content: center; align-items: center; z-index: 1000; padding: 15px;
        }
        .modal-card {
            background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 18px;
            width: 100%; max-width: 400px; padding: 18px; position: relative; max-height: 90vh; overflow-y: auto;
        }
        .form-control {
            width: 100%; background: #060913; border: 1px solid var(--card-border); border-radius: 8px;
            padding: 8px; color: white; font-size: 11px; margin-top: 4px;
        }
        .popup-amount-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin-top: 5px; margin-bottom: 8px; }
        .popup-amt-btn {
            background: rgba(30, 41, 59, 0.8); border: 1px solid var(--card-border); border-radius: 6px;
            padding: 5px; text-align: center; font-size: 10px; font-weight: bold; color: var(--accent-gold); cursor: pointer;
        }
        .admin-trigger-btn {
            background: linear-gradient(90deg, #a855f7, #6366f1); color: white; border: none; padding: 6px 10px; border-radius: 10px;
            font-size: 10px; font-weight: bold; cursor: pointer; margin-top: 6px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 4px;
        }
        .admin-dashboard-container { background: linear-gradient(145deg, #0f172a, #060913); border: 2px solid var(--accent-gold); border-radius: 14px; padding: 12px; }
        .admin-stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 10px; }
        .admin-stat-box { background: rgba(30, 41, 59, 0.9); border: 1px solid var(--card-border); border-radius: 10px; padding: 8px; text-align: center; }
        .admin-live-list-box { background: rgba(6, 9, 19, 0.9); border: 1px solid var(--card-border); border-radius: 10px; padding: 8px; max-height: 120px; overflow-y: auto; margin-top: 6px; margin-bottom: 10px; }
    </style>
</head>
<body>

    <div class="container">
        <div class="top-user-bar">
            <div class="user-left">
                <div class="user-avatar-container">
                    <div class="user-avatar" id="headerAvatarBox">RS</div>
                    <div class="plus-upload-icon" onclick="triggerPhotoUpload()" title="ছবি">+</div>
                    <input type="file" id="globalPhotoInput" style="display: none;" accept="image/*" onchange="handlePhotoUpload(event)">
                </div>
                <div class="user-info">
                    <h3 id="headerName" onclick="openEditProfileModal()">Rakibul Islam ✏️</h3>
                    <p>👑 VIP Member <span style="background:var(--accent-green); color:white; font-size:7px; padding:1px 3px; border-radius:3px;">Verified ✓</span></p>
                </div>
            </div>
            <div class="balance-pill">
                <div class="b-val" id="topBalanceDisplay">৳ ২৫.০০</div>
                <div class="rs-val" id="topRsDisplay">🪙 0.00 RS</div>
                <div class="b-lbl">Balance / Coin</div>
            </div>
        </div>

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
                <div>🎧</div>সাপোর্ট
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

        <!-- HOME VIEW -->
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
                <div class="notice-title">👑 অফিসিয়াল ঘোষণা ও প্রিমিয়াম অফার ২০২৬</div>
                <div class="notice-desc">
                    প্রিয় ব্যবহারকারী, RS Growth Matrix-এ আপনাকে স্বাগতম! আমাদের প্রিমিয়াম রিং প্যাকেজগুলো অ্যাক্টিভ করে এখন থেকেই প্রতি মিনিটে আনলিমিটেড রিয়েল আরএস কয়েন মাইন করুন। প্রতিটি ডিপোজিট ও উইথড্র এখন সুরক্ষিত ও দ্রুত প্রসেস করা হচ্ছে।
                </div>
            </div>

            <div class="section-heading"><span>📢 সর্বশেষ আপডেট</span></div>
            <div class="update-card">
                <div>
                    <h4 style="font-size: 11px; color: var(--accent-gold);">গুরুত্বপূর্ণ - RS প্যাকেজ মাইনিং আপডেট!</h4>
                    <p style="font-size: 9px; color: var(--text-muted);">আপনার প্যাকেজ থেকে প্রতি মিনিটে রিয়েল-টাইমে RS কয়েন জেনারেট হচ্ছে...</p>
                </div>
                <span style="font-size: 9px; color: var(--text-muted);">2026</span>
            </div>
        </div>

        <!-- PACKAGES VIEW -->
        <div id="packagesView" class="view-section">
            <div class="section-heading"><span>💎 এক্সক্লুসিভ মাইনিং প্যাকেজ</span> <span style="font-size: 10px; color: var(--accent-gold);">২৪ ঘণ্টা অটো মাইনিং</span></div>
            <div class="packages-grid-2x2" id="packagesGridContainer"></div>
        </div>

        <!-- TASKS VIEW -->
        <div id="tasksView" class="view-section">
            <div class="section-heading"><span>🔥 লাইভ অফারওয়াল (Offerwall)</span></div>
            <div class="offerwall-box">
                <h3 style="font-size: 12px; color: var(--accent-purple); margin-bottom: 4px;">🎯 অফারওয়াল সার্ভে ও টাস্ক</h3>
                <p style="font-size: 9px; color: var(--text-muted); margin-bottom: 8px;">Render-এর PUBLIC_KEY ও SECRET_KEY দিয়ে লাইভ অফার সম্পন্ন করুন!</p>
                <button type="button" class="banner-btn" style="background: linear-gradient(90deg, #a855f7, #6366f1); color: #fff;" onclick="openOfferwallModal()">🚀 অফারওয়াল অন করুন</button>
            </div>

            <div class="section-heading"><span>⚡ সার্ভার ও মাইক্রো জবস লাইভ টাস্ক</span></div>
            <div id="microJobsListContainer">
                <p style="font-size: 10px; color: var(--text-muted); text-align: center;">টাস্ক লোড করা হচ্ছে...</p>
            </div>
        </div>

        <!-- RANKING VIEW -->
        <div id="rankingView" class="view-section">
            <div class="section-heading"><span>🏆 গ্লোবাল টপ র‍্যাঙ্কিং লিডারবোর্ড</span></div>
            <div class="podium-box" id="podiumTop3Container"></div>
            <div class="section-heading"><span>অন্যান্য আর্নারগণ</span></div>
            <div id="rankingListContainer"></div>
        </div>

        <!-- SUPPORT VIEW -->
        <div id="supportView" class="view-section">
            <div class="support-banner">
                <div style="font-size: 24px;">👩‍💼</div>
                <div>
                    <h4 style="font-size: 12px; font-weight: bold;">RS সাপোর্ট টিম</h4>
                    <p style="font-size: 9px; color: var(--text-muted);">এজেন্ট: <span id="supportAgentNameDisplay" style="color: var(--accent-gold); font-weight: bold;">মাহিয়া</span> | ● অনলাইন</p>
                </div>
            </div>

            <div class="home-grid-3" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 12px;">
                <div class="home-grid-card" onclick="openSupportPopup('deposit')"><div class="hg-icon">💳</div><div class="hg-title" style="font-size: 8px;">ডিপোজিট</div></div>
                <div class="home-grid-card" onclick="openSupportPopup('withdraw')"><div class="hg-icon">🏦</div><div class="hg-title" style="font-size: 8px;">উইথড্র</div></div>
                <div class="home-grid-card" onclick="openSupportPopup('bonus')"><div class="hg-icon">🎁</div><div class="hg-title" style="font-size: 8px;">বোনাস</div></div>
                <div class="home-grid-card" onclick="openSupportPopup('task')"><div class="hg-icon">📋</div><div class="hg-title" style="font-size: 8px;">টাস্ক</div></div>
            </div>

            <div class="chat-box-area" id="chatBoxContainer">
                <div class="chat-msg support">হ্যালো! RS সাপোর্ট টিম থেকে বলছি। আপনার যেকোনো সমস্যায় কথা বলতে পারেন।</div>
            </div>
            <div style="display: flex; gap: 6px; margin-top: 8px;">
                <input type="text" class="form-control" id="supportInput" placeholder="আপনার সমস্যা লিখুন..." style="margin-top:0;">
                <button type="button" class="banner-btn" onclick="sendSupportMsg()">প্রেরণ</button>
            </div>
        </div>

        <!-- REFERRAL VIEW -->
        <div id="referralView" class="view-section">
            <div class="ref-banner">
                <div class="ref-logo-circle">RS</div>
                <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 3px; color: var(--accent-gold);">RS Referral Program</h3>
                <p style="font-size: 10px; color: #cbd5e1; margin-bottom: 6px;">আজীবন ৩% কমিশন ও ইনস্ট্যান্ট ১০০ আরএস কয়েন</p>
                <div class="ref-input-box">
                    <input type="text" id="refLinkInput" value="https://rs.taptoearn.app/ref/RS12345" readonly style="background:transparent; border:none; color:white; font-size:10px; width:100%; outline:none; padding-left:4px;">
                    <button type="button" class="tr-btn" onclick="copyRefLink()">কপি</button>
                </div>
                <div class="social-share-row">
                    <a href="https://t.me/share/url?url=https://rs.taptoearn.app/ref/RS12345" target="_blank" class="ss-btn">✈️ টেলিগ্রাম</a>
                    <a href="https://api.whatsapp.com/send?text=Join" target="_blank" class="ss-btn">💬 হোয়াটসঅ্যাপ</a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=https://rs.taptoearn.app/ref/RS12345" target="_blank" class="ss-btn">📘 ফেসবুক</a>
                </div>
            </div>
            <div class="section-heading"><span>🎁 লাইভ রেফারেল ফিড</span></div>
            <div class="live-ticker-box-large">
                <div class="ticker-list">
                    <div class="ticker-item"><span class="t-ref">🎁 SAJIB_07 রেফার করে +100 কয়েন বোনাস পেয়েছে</span><span style="font-size:8px; color:var(--text-muted)">১মিঃ আগে</span></div>
                    <div class="ticker-item"><span class="t-ref">🔥 Nayeem_99 রেফার করে +100 কয়েন বোনাস পেয়েছে</span><span style="font-size:8px; color:var(--text-muted)">৩মিঃ আগে</span></div>
                </div>
            </div>
        </div>

        <!-- ACCOUNT VIEW -->
        <div id="accountView" class="view-section">
            <div class="section-heading"><span>অ্যাকাউন্ট ওভারভিউ</span></div>
            <div class="update-card" style="align-items: center; background: rgba(30, 41, 59, 0.7);">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div id="accScreenAvatar" style="width: 40px; height: 40px; border-radius: 50%; background:#334155; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#fff;">RS</div>
                    <div>
                        <h4 style="font-size: 12px;" id="accScreenName">Rakibul Islam</h4>
                        <p style="font-size: 9px; color: var(--accent-gold);" id="accScreenUserPhone">নম্বর: 01700000000</p>
                    </div>
                </div>
                <button type="button" class="tr-btn" onclick="openEditProfileModal()">এডিট</button>
            </div>

            <button type="button" class="admin-trigger-btn" onclick="promptAdminLogin()">🔐 এডমিন প্যানেল লগইন</button>

            <div class="acc-grid-4" style="margin-top: 10px;">
                <div class="acc-stat-card"><div style="font-size: 9px; color: var(--text-muted);">পেন্ডিং</div><div style="font-size: 10px; font-weight: bold; color: var(--accent-gold);" id="statPending">৳ ০</div></div>
                <div class="acc-stat-card"><div style="font-size: 9px; color: var(--text-muted);">লেনদেন</div><div style="font-size: 11px; font-weight: bold; color: var(--accent-blue);" id="statTransactions">০</div></div>
                <div class="acc-stat-card"><div style="font-size: 9px; color: var(--text-muted);">আজকের আয়</div><div style="font-size: 10px; font-weight: bold; color: var(--accent-green);" id="statTodayEarn">৳ ০</div></div>
                <div class="acc-stat-card"><div style="font-size: 9px; color: var(--text-muted);">রেফার আয়</div><div style="font-size: 10px; font-weight: bold; color: var(--accent-purple);" id="statRefEarn">৳ ০</div></div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px;">
                <button type="button" class="banner-btn" style="width:100%; justify-content:center; background:linear-gradient(90deg, #22c55e, #16a34a); color:#fff;" onclick="openModal('depositModal')">➕ ডিপোজিট</button>
                <button type="button" class="banner-btn" style="width:100%; justify-content:center; background:linear-gradient(90deg, #ef4444, #dc2626); color:#fff;" onclick="openModal('withdrawModal')">➖ উইথড্র</button>
            </div>
            <button type="button" class="banner-btn" style="width:100%; justify-content:center; background:rgba(34, 197, 94, 0.2); color:var(--accent-green); border:1px solid var(--accent-green); margin-bottom:6px;" onclick="openModal('depositHistoryModal')">📋 ডিপোজিট হিস্ট্রি</button>
            <button type="button" class="banner-btn" style="width:100%; justify-content:center; background:rgba(239, 68, 68, 0.2); color:#ef4444; border:1px solid #ef4444; margin-bottom:10px;" onclick="openModal('withdrawHistoryModal')">📋 উইথড্র হিস্ট্রি</button>
        </div>
    </div>

    <!-- Modals -->
    <div class="modal" id="offerwallModal">
        <div class="modal-card" style="max-width:420px; padding:10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h3 style="font-size: 13px; color: var(--accent-purple);">🔥 লাইভ অফারওয়াল</h3>
                <span style="cursor: pointer; font-size: 18px;" onclick="closeModal('offerwallModal')">&times;</span>
            </div>
            <div style="width: 100%; height: 380px; background: #060913; border-radius: 10px; overflow: hidden;">
                <iframe id="offerwallIframe" src="about:blank" style="width:100%; height:100%; border:none;"></iframe>
            </div>
        </div>
    </div>

    <div class="modal" id="taskDetailModal">
        <div class="modal-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h3 id="modalTaskTitle" style="font-size: 13px; color: var(--accent-gold);">টাস্ক নির্দেশিকা</h3>
                <span style="cursor: pointer; font-size: 18px;" onclick="closeModal('taskDetailModal')">&times;</span>
            </div>
            <div style="background: rgba(30,41,59,0.7); padding: 8px; border-radius: 8px; margin-bottom: 8px;">
                <p id="modalTaskDesc" style="font-size: 10px; line-height: 1.4; margin-bottom: 6px;"></p>
                <a id="modalTaskLink" href="#" target="_blank" style="font-size: 10px; color: var(--accent-gold); word-break: break-all;"></a>
            </div>
            <label style="font-size: 9px; color: var(--text-muted);">প্রুফ / ইউজারনেম জমা দিন:</label>
            <textarea id="taskProofInput" class="form-control" rows="2" placeholder="প্রুফ লিখুন..." style="margin-bottom:10px;"></textarea>
            <button type="button" class="banner-btn" style="width:100%; justify-content:center; background:var(--accent-green); color:#fff;" onclick="submitTaskProof()">প্রুফ সাবমিট করুন (+<span id="modalTaskRewardSpan">0</span> RS)</button>
        </div>
    </div>

    <div class="modal" id="adminPanelModal">
        <div class="modal-card" style="max-width: 390px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="font-size: 13px; color: var(--accent-gold);">👑 ADMIN PANEL</h3>
                <span style="cursor: pointer; font-size: 18px;" onclick="closeModal('adminPanelModal')">&times;</span>
            </div>
            <div class="admin-dashboard-container">
                <div class="admin-stat-grid">
                    <div class="admin-stat-box"><div style="font-size: 9px; color: var(--text-muted);">পেন্ডিং</div><div style="font-size: 11px; font-weight: bold; color: var(--accent-gold);" id="adminStatPendingCount">০ টি</div></div>
                    <div class="admin-stat-box"><div style="font-size: 9px; color: var(--text-muted);">সাকসেস</div><div style="font-size: 11px; font-weight: bold; color: var(--accent-green);" id="adminStatSuccessCount">০ টি</div></div>
                </div>
                <div style="font-size: 10px; font-weight: bold; color: var(--accent-gold);">📥 ডিপোজিট লিস্ট</div>
                <div class="admin-live-list-box" id="adminDepositLiveList"><p style="font-size: 9px; color: var(--text-muted); text-align: center;">খালি</p></div>
                <div style="font-size: 10px; font-weight: bold; color: #ef4444;">📤 উইথড্র লিস্ট</div>
                <div class="admin-live-list-box" id="adminWithdrawLiveList"><p style="font-size: 9px; color: var(--text-muted); text-align: center;">খালি</p></div>
            </div>
        </div>
    </div>

    <!-- Deposit & Withdraw Modals -->
    <div class="modal" id="depositModal">
        <div class="modal-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h3 style="font-size: 13px; color: var(--accent-green);">➕ ডিপোজিট (২০০ - ৩০০০ টাকা)</h3>
                <span style="cursor: pointer; font-size: 16px;" onclick="closeModal('depositModal')">&times;</span>
            </div>
            <label style="font-size: 9px; color: var(--text-muted);">মেথড:</label>
            <select id="depositMethodSelect" class="form-control"><option value="bKash">বিকাশ</option><option value="Nagad">নগদ</option></select>
            <p style="font-size: 9px; color: var(--text-muted); margin: 6px 0;">সেন্ড মানি করুন: <b id="depositSendNumber" style="color:var(--accent-gold);">01951639460</b></p>
            <label style="font-size: 9px; color: var(--text-muted);">পরিমাণ:</label>
            <input type="number" id="depositInputAmt" class="form-control" placeholder="যেমন: ১০০০">
            <div class="popup-amount-grid">
                <div class="popup-amt-btn" onclick="setDepositAmt(200)">200</div>
                <div class="popup-amt-btn" onclick="setDepositAmt(500)">500</div>
                <div class="popup-amt-btn" onclick="setDepositAmt(1000)">1000</div>
            </div>
            <label style="font-size: 9px; color: var(--text-muted);">TrxID:</label>
            <input type="text" id="depositTrxId" class="form-control" placeholder="TrxID">
            <label style="font-size: 9px; color: var(--text-muted);">শেষ ৩ ডিজিট:</label>
            <input type="text" id="depositLast3Digits" class="form-control" placeholder="460" maxlength="3">
            <button type="button" class="banner-btn" style="width:100%; justify-content:center; margin-top:10px; background:var(--accent-green); color:#fff;" onclick="submitDeposit()">জমা দিন</button>
        </div>
    </div>

    <div class="modal" id="withdrawModal">
        <div class="modal-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h3 style="font-size: 13px; color: var(--accent-gold);">➖ উইথড্র (৩০০ - ৫০০০ টাকা)</h3>
                <span style="cursor: pointer; font-size: 16px;" onclick="closeModal('withdrawModal')">&times;</span>
            </div>
            <label style="font-size: 9px; color: var(--text-muted);">মেথড:</label>
            <select id="withdrawMethodSelect" class="form-control"><option value="bKash">বিকাশ</option><option value="Nagad">নগদ</option></select>
            <label style="font-size: 9px; color: var(--text-muted);">পরিমাণ:</label>
            <input type="number" id="withdrawInputAmt" class="form-control" placeholder="পরিমাণ">
            <label style="font-size: 9px; color: var(--text-muted);">নম্বর (১১ ডিজিট):</label>
            <input type="text" id="withdrawPhone" class="form-control" placeholder="017xxxxxxxx">
            <button type="button" class="banner-btn" style="width:100%; justify-content:center; margin-top:10px; background:#ef4444; color:#fff;" onclick="submitWithdraw()">উইথড্র পাঠান</button>
        </div>
    </div>

    <div class="modal" id="depositHistoryModal">
        <div class="modal-card"><div style="display:flex; justify-content:space-between; margin-bottom:8px;"><h3 style="font-size:13px; color:var(--accent-green);">ডিপোজিট হিস্ট্রি</h3><span style="cursor:pointer;" onclick="closeModal('depositHistoryModal')">&times;</span></div><div id="depositHistoryPopupContent"><p style="font-size:10px; text-align:center; color:var(--text-muted);">হিস্ট্রি খালি</p></div></div>
    </div>
    <div class="modal" id="withdrawHistoryModal">
        <div class="modal-card"><div style="display:flex; justify-content:space-between; margin-bottom:8px;"><h3 style="font-size:13px; color:#ef4444;">উইথড্র হিস্ট্রি</h3><span style="cursor:pointer;" onclick="closeModal('withdrawHistoryModal')">&times;</span></div><div id="withdrawHistoryPopupContent"><p style="font-size:10px; text-align:center; color:var(--text-muted);">হিস্ট্রি খালি</p></div></div>
    </div>
    <div class="modal" id="editProfileModal">
        <div class="modal-card"><div style="display:flex; justify-content:space-between; margin-bottom:8px;"><h3 style="font-size:13px; color:var(--accent-blue);">প্রোফাইল এডিট</h3><span style="cursor:pointer;" onclick="closeModal('editProfileModal')">&times;</span></div><label style="font-size:9px;">নাম:</label><input type="text" id="editNameInput" class="form-control"><button type="button" class="banner-btn" style="width:100%; justify-content:center; margin-top:10px; background:var(--accent-blue); color:#fff;" onclick="saveProfileChanges()">সেভ</button></div>
    </div>
    <div class="modal" id="supportPopupModal">
        <div class="modal-card"><div style="display:flex; justify-content:space-between; margin-bottom:8px;"><h3 id="supportPopupTitle" style="font-size:13px; color:var(--accent-gold);">গাইডলাইন</h3><span style="cursor:pointer;" onclick="closeModal('supportPopupModal')">&times;</span></div><p id="supportPopupDesc" style="font-size:10px; color:var(--text-muted); line-height:1.4;"></p></div>
    </div>

    <script>
        let currentUserName = localStorage.getItem('rs_username') || "Rakibul Islam";
        let currentUserPhone = localStorage.getItem('rs_phone') || "01700000000";
        let currentUserAvatar = localStorage.getItem('rs_avatar') || "";
        
        let userBalance = parseFloat(localStorage.getItem('rs_balance')) || 25.00;
        let rsCoins = parseFloat(localStorage.getItem('rs_coins')) || 0.00;
        let pendingAmount = parseFloat(localStorage.getItem('rs_pending')) || 0.00;
        let totalTransactionsCount = parseInt(localStorage.getItem('rs_tx_count')) || 0;
        let todayEarnAmount = parseFloat(localStorage.getItem('rs_today_earn')) || 0.00;
        let referralEarnAmount = parseFloat(localStorage.getItem('rs_ref_earn')) || 0.00;

        let userDepositHistory = JSON.parse(localStorage.getItem('rs_deposit_history')) || [];
        let userWithdrawHistory = JSON.parse(localStorage.getItem('rs_withdraw_history')) || [];
        let purchasedPackages = JSON.parse(localStorage.getItem('rs_purchased_packages')) || {};
        let microJobsList = [];

        window.addEventListener('DOMContentLoaded', () => {
            updateAccountStatsUI();
            fetchServerTasks();
            renderLeaderboard();
        });

        async function fetchServerTasks() {
            try {
                const response = await fetch('/api/tasks');
                const data = await response.json();
                if(data && data.length > 0) {
                    microJobsList = data.map((t, idx) => ({
                        id: t._id || idx + 1,
                        title: t.title || \`MicroTask #\${idx + 1}\`,
                        reward: t.reward || 50,
                        icon: "📋",
                        desc: t.description || "নির্দেশিকা অনুযায়ী কাজ সম্পন্ন করুন।",
                        link: "https://youtube.com/@SproutGigsTaskOfficial"
                    }));
                } else {
                    loadDefaultFallbackTasks();
                }
            } catch (err) {
                loadDefaultFallbackTasks();
            }
            renderMicroJobsUI();
        }

        function loadDefaultFallbackTasks() {
            microJobsList = [
                {id: 1, title: "MicroTask #1: YouTube Subscribe", reward: 50, icon: "▶️", desc: "চ্যানেল সাবস্ক্রাইব করুন ও লাইক দিন।", link: "https://youtube.com"},
                {id: 2, title: "MicroTask #2: Facebook Follow", reward: 40, icon: "📘", desc: "পেজে লাইক ও ফলো করুন।", link: "https://facebook.com"}
            ];
        }

        function renderMicroJobsUI() {
            const container = document.getElementById('microJobsListContainer');
            if(!container) return;
            let html = '';
            microJobsList.forEach(t => {
                html += \`
                    <div class="task-row-card">
                        <div class="tr-left">
                            <div class="tr-icon" style="background: rgba(56, 189, 248, 0.2); color: var(--accent-blue);">\${t.icon}</div>
                            <div class="tr-info">
                                <h4>\${t.title} <span style="color: var(--accent-gold); font-size: 9px;">+\${t.reward} RS</span></h4>
                                <p>মাইক্রো জবস টাস্ক</p>
                            </div>
                        </div>
                        <button type="button" class="tr-btn" onclick="openTaskDetails('\${t.id}')">কাজ করুন</button>
                    </div>
                \`;
            });
            container.innerHTML = html;
        }

        let selectedActiveTask = null;
        function openTaskDetails(taskId) {
            selectedActiveTask = microJobsList.find(t => t.id == taskId);
            if(!selectedActiveTask) return;
            document.getElementById('modalTaskTitle').innerText = selectedActiveTask.title;
            document.getElementById('modalTaskDesc').innerText = selectedActiveTask.desc;
            document.getElementById('modalTaskLink').href = selectedActiveTask.link;
            document.getElementById('modalTaskLink').innerText = selectedActiveTask.link;
            document.getElementById('modalTaskRewardSpan').innerText = selectedActiveTask.reward;
            document.getElementById('taskProofInput').value = '';
            openModal('taskDetailModal');
        }

        function submitTaskProof() {
            let proofText = document.getElementById('taskProofInput').value.trim();
            if(!proofText) { alert('দয়া করে প্রুফ লিখুন।'); return; }
            if(selectedActiveTask) {
                userBalance += selectedActiveTask.reward;
                todayEarnAmount += selectedActiveTask.reward;
                totalTransactionsCount += 1;
                updateAccountStatsUI();
                alert(\`সফল! +\${selectedActiveTask.reward} টাকা যোগ হয়েছে।\`);
                closeModal('taskDetailModal');
            }
        }

        async function openOfferwallModal() {
            try {
                const res = await fetch(\`/api/offerwall?userId=\${encodeURIComponent(currentUserPhone)}\`);
                const data = await res.json();
                if(data && data.iframeUrl) {
                    document.getElementById('offerwallIframe').src = data.iframeUrl;
                }
            } catch(e) {}
            openModal('offerwallModal');
        }

        function claimDailyTask() {
            let lastClaimTime = parseInt(localStorage.getItem('rs_last_daily_claim')) || 0;
            let currentTime = new Date().getTime();
            if (currentTime - lastClaimTime < 86400000) {
                alert('আপনি আজ ইতিমধ্যেই ডেইলি টাস্ক ক্লেইম করেছেন!');
                return;
            }
            userBalance += 30;
            todayEarnAmount += 30;
            totalTransactionsCount += 1;
            localStorage.setItem('rs_last_daily_claim', currentTime);
            updateAccountStatsUI();
            alert('ডেইলি টাস্ক থেকে +৩০ টাকা যোগ হয়েছে!');
        }

        function checkInDaily() {
            userBalance += 10;
            todayEarnAmount += 10;
            totalTransactionsCount += 1;
            updateAccountStatsUI();
            alert('চেক-ইন সফল! +১০ টাকা যোগ হয়েছে।');
        }

        function switchTab(tabName, el) {
            document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            const targetView = document.getElementById(tabName + 'View');
            if(targetView) targetView.classList.add('active');
            if(el) el.classList.add('active');
        }

        function openModal(id) { document.getElementById(id).style.display = 'flex'; }
        function closeModal(id) { document.getElementById(id).style.display = 'none'; }

        function updateAccountStatsUI() {
            document.getElementById('topBalanceDisplay').innerText = \`৳ \${userBalance.toFixed(2)}\`;
            document.getElementById('topRsDisplay').innerText = \`🪙 \${rsCoins.toFixed(0)} RS\`;
            document.getElementById('statPending').innerText = \`৳ \${pendingAmount.toFixed(2)}\`;
            document.getElementById('statTransactions').innerText = totalTransactionsCount;
            document.getElementById('statTodayEarn').innerText = \`৳ \${todayEarnAmount.toFixed(2)}\`;
            document.getElementById('statRefEarn').innerText = \`৳ \${referralEarnAmount.toFixed(2)}\`;
            
            localStorage.setItem('rs_balance', userBalance);
            localStorage.setItem('rs_coins', rsCoins);
            localStorage.setItem('rs_pending', pendingAmount);
            localStorage.setItem('rs_tx_count', totalTransactionsCount);
            localStorage.setItem('rs_today_earn', todayEarnAmount);
            renderPackagesUI();
        }

        function renderPackagesUI() {
            const container = document.getElementById('packagesGridContainer');
            if(!container) return;
            const list = [
                {id: 200, title: 'স্ট্যান্ডার্ড', price: 200, rate: '500 RS', tier: 'tier-1'},
                {id: 500, title: 'ব্রোঞ্জ', price: 500, rate: '1000 RS', tier: 'tier-2'},
                {id: 1000, title: 'গোল্ড', price: 1000, rate: '2500 RS', tier: 'tier-4'},
                {id: 3000, title: 'আল্টিমেট', price: 3000, rate: '10000 RS', tier: 'tier-8'}
            ];
            let html = '';
            list.forEach(p => {
                html += \`
                    <div class="pkg-card \${p.tier}">
                        <div>
                            <div class="pkg-title">\${p.title}</div>
                            <div class="pkg-price">৳ \${p.price}</div>
                            <div class="pkg-rate">রেট: \${p.rate}/মিঃ</div>
                        </div>
                        <button type="button" class="pkg-btn" onclick="buyPackage(\${p.price})">আনলক</button>
                    </div>
                \`;
            });
            container.innerHTML = html;
        }

        function buyPackage(price) {
            if(userBalance < price) { alert('পর্যাপ্ত ব্যালেন্স নেই!'); openModal('depositModal'); return; }
            userBalance -= price;
            updateAccountStatsUI();
            alert('প্যাকেজ সফলভাবে আনলক হয়েছে!');
        }

        function promptAdminLogin() {
            let pass = prompt("পাসওয়ার্ড দিন:");
            if(pass === "mdrana321") openModal('adminPanelModal');
            else if(pass !== null) alert("ভুল পাসওয়ার্ড!");
        }

        function submitDeposit() {
            const amt = parseFloat(document.getElementById('depositInputAmt').value);
            const trx = document.getElementById('depositTrxId').value.trim();
            if(isNaN(amt) || amt < 200) { alert('সঠিক পরিমাণ দিন।'); return; }
            pendingAmount += amt;
            updateAccountStatsUI();
            alert('ডিপোজিট রিকোয়েস্ট জমা হয়েছে!');
            closeModal('depositModal');
        }

        function submitWithdraw() {
            const amt = parseFloat(document.getElementById('withdrawInputAmt').value);
            if(isNaN(amt) || amt < 300 || amt > userBalance) { alert('সঠিক পরিমাণ বা পর্যাপ্ত ব্যালেন্স নেই।'); return; }
            userBalance -= amt;
            pendingAmount += amt;
            updateAccountStatsUI();
            alert('উইথড্র রিকোয়েস্ট পাঠানো হয়েছে!');
            closeModal('withdrawModal');
        }

        function renderLeaderboard() {
            const top3 = \`<div class="podium-col rank-1"><div class="crown">👑</div><div class="p-ava">JD</div><h5 style="font-size:10px;">John</h5><p style="font-size:9px; color:var(--accent-green);">৳৫০,০০০</p></div>\`;
            document.getElementById('podiumTop3Container').innerHTML = top3;
        }

        function openSupportPopup(type) {
            document.getElementById('supportPopupTitle').innerText = "সাপোর্ট গাইডলাইন";
            document.getElementById('supportPopupDesc').innerText = "যেকোনো সমস্যায় ডিপোজিট বা উইথড্র সেকশন চেক করুন অথবা সাপোর্টে মেসেজ পাঠান।";
            openModal('supportPopupModal');
        }

        function sendSupportMsg() {
            const txt = document.getElementById('supportInput').value.trim();
            if(!txt) return;
            const chatContainer = document.getElementById('chatBoxContainer');
            chatContainer.innerHTML += \`<div class="chat-msg user">\${txt}</div>\`;
            document.getElementById('supportInput').value = '';
            setTimeout(() => {
                chatContainer.innerHTML += \`<div class="chat-msg support">আপনার বার্তাটি পেয়েছি, শীঘ্রই সমাধান করা হবে।</div>`;
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 1000);
        }
    </script>
</body>
</html>`);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
