const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

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

app.get('/api/tasks', (req, res) => {
    const defaultTasks = [
        {
            _id: 1,
            title: "MicroTask #1: YouTube Channel Subscribe & Watch",
            reward: 50,
            description: "১. দেওয়া লিংকে ক্লিক করে ইউটিউব চ্যানেল সাবস্ক্রাইব করুন।\n২. ভিডিওটি সম্পূর্ণ দেখে একটি লাইক দিন।\n৩. আপনার ইউটিউব ইউজারনেম প্রুফ হিসেবে নিচে লিখুন."
        },
        {
            _id: 2,
            title: "MicroTask #2: Facebook Page Like & Follow",
            reward: 40,
            description: "১. ফেসবুক পেজে প্রবেশ করে লাইক ও ফলো করুন।\n২. আপনার ফেসবুক প্রোফাইল লিংক বা নাম প্রুফ দিন."
        }
    ];
    res.json(defaultTasks);
});

app.get('/', (req, res) => {
    const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RS Growth Matrix - Ultimate Earning Platform & Admin Dashboard</title>
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
            padding: 2px;
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
            padding-bottom: 90px;
        }
        .view-section.active {
            display: block !important;
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
        .hg-sub { font-size: 9px; color: var(--accent-gold); }

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
        .pkg-card.tier-1 { border: 2px solid #64748b; }
        .pkg-card.tier-2 { border: 2px solid #38bdf8; }
        .pkg-card.tier-3 { border: 2px solid #818cf8; }
        .pkg-card.tier-4 { border: 2px solid #a855f7; }
        .pkg-card.tier-5 { border: 2px solid #f472b6; }
        .pkg-card.tier-6 { border: 2px solid #fbbf24; }
        .pkg-card.tier-7 { border: 2px solid #f97316; }
        .pkg-card.tier-8 { border: 2px solid #ef4444; background: linear-gradient(145deg, #2a1b22, #0f172a); }

        .pkg-title { font-size: 12px; font-weight: bold; margin-bottom: 4px; color: var(--text-main); position: relative; }
        .crown-badge { position: absolute; top: -14px; right: 2px; font-size: 16px; }
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
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 6px; margin-bottom: 10px;
        }
        .popup-amt-btn {
            background: rgba(30, 41, 59, 0.8); border: 1px solid var(--card-border); border-radius: 8px;
            padding: 6px; text-align: center; font-size: 11px; font-weight: bold; color: var(--accent-gold); cursor: pointer;
        }

        .task-row-card {
            background: linear-gradient(145deg, #1e293b, #0f172a); border: 1px solid var(--card-border);
            border-radius: 16px; padding: 12px 14px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;
        }
        .tr-btn {
            background: linear-gradient(90deg, #fbbf24, #f59e0b); color: #000; border: none;
            padding: 6px 12px; border-radius: 16px; font-size: 11px; font-weight: bold; cursor: pointer;
        }

        .podium-box { display: flex; justify-content: center; align-items: flex-end; gap: 10px; margin-bottom: 20px; }
        .podium-col {
            background: linear-gradient(180deg, #1e293b, #0f172a); border: 1px solid var(--card-border);
            border-radius: 16px; padding: 16px 6px 12px 6px; text-align: center; flex: 1; position: relative;
        }
        .podium-col.rank-1 { border-color: var(--accent-gold); transform: scale(1.05); background: linear-gradient(180deg, rgba(251,191,36,0.15), #0f172a); }
        .crown { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 20px; }
        .p-ava { width: 45px; height: 45px; border-radius: 50%; margin: 0 auto 6px; border: 2px solid var(--accent-gold); overflow: hidden; }
        .p-ava img { width: 100%; height: 100%; object-fit: cover; }

        .support-banner {
            background: linear-gradient(145deg, #1e293b, #0f172a); border: 1px solid var(--card-border);
            border-radius: 16px; padding: 14px; margin-bottom: 15px; display: flex; gap: 12px; align-items: center;
        }
        .chat-box-area {
            background: rgba(15, 23, 42, 0.7); border: 1px solid var(--card-border); border-radius: 16px; padding: 12px; margin-top: 10px;
            max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;
        }
        .chat-msg { padding: 8px 12px; border-radius: 12px; font-size: 11px; max-width: 85%; line-height: 1.4; }
        .chat-msg.user { background: #1e293b; color: #fff; align-self: flex-end; }
        .chat-msg.support { background: #172554; color: var(--accent-blue); align-self: flex-start; border: 1px solid rgba(56,189,248,0.2); }

        .ref-banner {
            background: linear-gradient(135deg, #1e1b4b, #312e81); border: 1px solid rgba(168, 85, 247, 0.4);
            border-radius: 18px; padding: 16px; text-align: center; margin-bottom: 15px;
        }
        .ref-input-box { display: flex; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--card-border); border-radius: 12px; padding: 6px; margin: 10px 0; gap: 6px; }
        .social-share-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
        .ss-btn {
            background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px;
            padding: 10px 6px; text-align: center; font-size: 11px; cursor: pointer; color: var(--text-main);
            display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 500;
        }

        .live-ticker-box-large {
            background: radial-gradient(circle, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%);
            border: 1px solid var(--accent-purple); border-radius: 16px; padding: 12px; margin-top: 15px;
            height: 180px; overflow: hidden; position: relative;
        }
        .ticker-list { display: flex; flex-direction: column; gap: 8px; animation: scrollTicker 8s linear infinite; }
        @keyframes scrollTicker { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        .ticker-item {
            font-size: 11px; padding: 6px 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.6); display: flex; justify-content: space-between; align-items: center;
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

        .top-nav {
            display: flex; justify-content: space-around; background: linear-gradient(180deg, #131d38, #0f172a);
            border-bottom: 1px solid rgba(56, 189, 248, 0.3); padding: 10px 4px; flex-shrink: 0; z-index: 100;
        }
        .nav-item {
            text-align: center; color: var(--text-muted); font-size: 10px; cursor: pointer; flex: 1; position: relative;
        }
        .nav-icon-wrap {
            width: 32px; height: 32px; margin: 0 auto 2px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; position: relative; background: rgba(30, 41, 59, 0.8);
            transition: 0.3s;
        }
        .nav-item div.icon-symbol { font-size: 14px; z-index: 2; }
        .nav-item.active { color: var(--accent-gold); text-shadow: 0 0 8px rgba(251, 191, 36, 0.6); }
        .nav-item.active .nav-icon-wrap {
            background: rgba(251, 191, 36, 0.15);
            transform: translateY(-3px) scale(1.1);
        }
        .nav-item.active .nav-icon-wrap::after {
            content: ''; position: absolute; top: -3px; left: -3px; right: -3px; bottom: -3px;
            border-radius: 50%; border: 2px solid transparent; border-top-color: var(--accent-gold); border-bottom-color: var(--accent-purple);
            animation: ringRotate 1.5s linear infinite;
        }
        @keyframes ringRotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .modal {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); justify-content: center; align-items: center; z-index: 1000; padding: 15px;
        }
        .modal-card {
            background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px;
            width: 100%; max-width: 410px; padding: 20px; position: relative; max-height: 90vh; overflow-y: auto;
        }
        .form-control {
            width: 100%; background: #060913; border: 1px solid var(--card-border); border-radius: 10px;
            padding: 10px; color: white; font-size: 12px; margin-top: 6px;
        }
        .admin-trigger-btn {
            background: linear-gradient(90deg, #a855f7, #6366f1); color: white; border: none; padding: 6px 12px;
            border-radius: 12px; font-size: 10px; font-weight: bold; cursor: pointer; margin-top: 8px; width: 100%;
            display: flex; align-items: center; justify-content: center; gap: 4px;
        }
        .admin-dashboard-container {
            background: linear-gradient(145deg, #0f172a, #060913); border: 2px solid var(--accent-gold);
            border-radius: 18px; padding: 16px;
        }
        .admin-stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 14px; }
        .admin-stat-box {
            background: rgba(30, 41, 59, 0.9); border: 1px solid var(--card-border); border-radius: 14px;
            padding: 12px; text-align: center; cursor: pointer;
        }
        .admin-live-list-box {
            background: rgba(6, 9, 19, 0.9); border: 1px solid var(--card-border); border-radius: 12px;
            padding: 10px; max-height: 140px; overflow-y: auto; margin-top: 8px; margin-bottom: 14px;
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="top-user-bar">
            <div class="user-left">
                <div class="user-avatar-container">
                    <div class="user-avatar">
                        <img id="headerAvatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" alt="Avatar">
                    </div>
                    <div class="plus-upload-icon" onclick="triggerPhotoUpload()" title="ছবি আপলোড করুন">+</div>
                    <input type="file" id="globalPhotoInput" style="display: none;" accept="image/*" onchange="handlePhotoUpload(event)">
                </div>
                <div class="user-info">
                    <h3 id="headerName" onclick="openEditProfileModal()" style="cursor: pointer;" title="এডিট করতে ক্লিক করুন">Rakibul Islam ✏️</h3>
                    <p>👑 VIP Member</p>
                </div>
            </div>
            <div class="balance-pill">
                <div class="b-val" id="topBalanceDisplay">৳ ২৫.০০</div>
                <div class="rs-val" id="topRsDisplay">🪙 0.00 RS</div>
                <div class="b-lbl">Balance / RS Coin</div>
            </div>
        </div>

        <div class="top-nav">
            <div class="nav-item active" onclick="switchTab('home', this)">
                <div class="nav-icon-wrap"><div class="icon-symbol">🏠</div></div>হোম
            </div>
            <div class="nav-item" onclick="switchTab('packages', this)">
                <div class="nav-icon-wrap"><div class="icon-symbol">💎</div></div>প্যাকেজ
            </div>
            <div class="nav-item" onclick="switchTab('tasks', this)">
                <div class="nav-icon-wrap"><div class="icon-symbol">📋</div></div>টাস্ক
            </div>
            <div class="nav-item" onclick="switchTab('ranking', this)">
                <div class="nav-icon-wrap"><div class="icon-symbol">🏆</div></div>র‍্যাঙ্কিং
            </div>
            <div class="nav-item" onclick="switchTab('support', this)">
                <div class="nav-icon-wrap"><div class="icon-symbol">🎧</div></div>সাপোর্ট
            </div>
            <div class="nav-item" onclick="switchTab('referral', this)">
                <div class="nav-icon-wrap"><div class="icon-symbol">👥</div></div>রেফার
            </div>
            <div class="nav-item" onclick="switchTab('account', this)">
                <div class="nav-icon-wrap"><div class="icon-symbol">👤</div></div>অ্যাকাউন্ট
            </div>
        </div>

        <div class="marquee-container">
            <marquee behavior="scroll" direction="left" scrollamount="4">
                📢 RS-এর পক্ষ থেকে স্বাগতম! আমাদের সাইটে আপনারা প্যাকেজ কিনে ২৪ ঘণ্টা রিয়েল-টাইম RS কয়েন মাইনিং করতে পারেন এবং বিকাশ ও নগদের মাধ্যমে লেনদেন করুন।
            </marquee>
        </div>

        <div id="homeView" class="view-section active" style="display: block;">
            <div class="banner-card">
                <h2>RS REWARDS CENTER</h2>
                <p>প্রতিদিন কাজ করুন, প্যাকেজ মাইন করুন আর আরও বেশি রিওয়ার্ড জিতুন!</p>
                <button class="banner-btn" onclick="switchTab('packages', document.querySelectorAll('.nav-item')[1])">🚀 প্যাকেজ দেখুন &rarr;</button>
            </div>

            <div class="section-heading"><span>⚡ আজকের কার্যক্রম</span> <span style="font-size: 10px; color: var(--accent-blue); cursor: pointer;" onclick="switchTab('tasks', document.querySelectorAll('.nav-item')[2])">টাস্ক সম্পন্ন করুন &rsaquo;</span></div>
            <div class="home-grid-3">
                <div class="home-grid-card" onclick="claimDailyTask()">
                    <div class="hg-icon" style="color: var(--accent-blue);">📋</div>
                    <div class="hg-title">ডেইলি টাস্ক</div>
                    <div class="hg-sub" id="dailyTaskSubLabel">+50 RS (প্রতি ২৪ ঘণ্টায় ২ বার)</div>
                </div>
                <div class="home-grid-card" onclick="checkInDaily()">
                    <div class="hg-icon" style="color: var(--accent-green);">📅</div>
                    <div class="hg-title">চেক-ইন</div>
                    <div class="hg-sub">+100 RS (দিনে ১ বার)</div>
                </div>
                <div class="home-grid-card" onclick="switchTab('referral', document.querySelectorAll('.nav-item')[5])">
                    <div class="hg-icon" style="color: var(--accent-purple);">🎁</div>
                    <div class="hg-title">রিওয়ার্ড</div>
                    <div class="hg-sub">স্পেশাল বোনাস</div>
                </div>
            </div>

            <div class="premium-notice-box">
                <div class="notice-title"><span>👑</span> অফিসিয়াল ঘোষণা ও প্রিমিয়াম অফার ২০২৬</div>
                <div class="notice-desc">
                    প্রিয় ব্যবহারকারী, RS Growth Matrix-এ আপনাকে স্বাগতম! আমাদের প্রিমিয়াম রিং প্যাকেজগুলো অ্যাক্টিভ করে এখন থেকেই প্রতি মিনিটে আনলিমিটেড রিয়েল আরএস কয়েন মাইন করুন। প্যাকেজ মেয়াদ শেষে ক্যালকুলেটর অপশন থেকে কয়েন বাংলা টাকায় কনভার্ট হবে।
                </div>
            </div>
        </div>

        <div id="packagesView" class="view-section" style="display: none;">
            <div class="section-heading"><span>💎 এক্সক্লুসিভ মাইনিং প্যাকেজ</span> <span style="font-size: 10px; color: var(--accent-gold);">শুধুমাত্র ডিপোজিট করে কিনুন</span></div>
            <p style="font-size: 10px; color: var(--text-muted); margin-bottom: 12px;">অ্যাকাউন্টে নয়, সরাসরি ডিপোজিট ব্যালেন্স দিয়ে প্যাকেজ আনলক করতে হয়। ৩০ দিন পর প্যাকেজ অটো রিসেট ও কয়েন কনভার্ট হবে।</p>
            <div class="packages-grid-2x2" id="packagesGridContainer"></div>
        </div>

        <div id="tasksView" class="view-section" style="display: none;">
            <div class="section-heading"><span>⚡ Offerwall.gg লাইভ টাস্ক সেন্টার (৫০ টি টাস্ক)</span> <span style="font-size: 10px; color: var(--accent-green);">● সার্ভার লাইভ</span></div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 12px;">
                <div class="acc-stat-card"><div style="font-size: 9px; color: var(--text-muted);">টোটাল টাস্ক</div><div style="font-size: 11px; font-weight: bold; color: var(--accent-blue);" id="taskStatTotal">50</div></div>
                <div class="acc-stat-card"><div style="font-size: 9px; color: var(--text-muted);">পেন্ডিং</div><div style="font-size: 11px; font-weight: bold; color: var(--accent-gold);" id="taskStatPending">0</div></div>
                <div class="acc-stat-card"><div style="font-size: 9px; color: var(--text-muted);">সফল</div><div style="font-size: 11px; font-weight: bold; color: var(--accent-green);" id="taskStatSuccess">0</div></div>
                <div class="acc-stat-card"><div style="font-size: 9px; color: var(--text-muted);">রিজেক্ট</div><div style="font-size: 11px; font-weight: bold; color: #ef4444;" id="taskStatReject">0</div></div>
            </div>
            <div id="microJobsListContainer" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;"></div>
        </div>

        <div id="rankingView" class="view-section" style="display: none;">
            <div class="section-heading"><span>🏆 গ্লোবাল টপ র‍্যাঙ্কিং লিডারবোর্ড</span></div>
            <div class="podium-box" id="podiumTop3Container"></div>
            <div class="section-heading"><span>অন্যান্য আর্নারগণ</span></div>
            <div id="rankingListContainer"></div>
        </div>

        <div id="supportView" class="view-section" style="display: none;">
            <div class="support-banner">
                <div style="font-size: 28px;">💻</div>
                <div>
                    <h4 style="font-size: 13px; font-weight: bold;">RS সাপোর্ট টিম</h4>
                    <p style="font-size: 10px; color: var(--text-muted);">সার্ভিস এজেন্ট: <span id="supportAgentNameDisplay" style="color: var(--accent-gold); font-weight: bold;">মাহিয়া</span> | ● অনলাইন</p>
                </div>
            </div>
            <div class="home-grid-3" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 15px;">
                <div class="home-grid-card" onclick="openSupportPopup('deposit')"><div class="hg-icon">💳</div><div class="hg-title" style="font-size: 9px;">ডিপোজিট</div></div>
                <div class="home-grid-card" onclick="openSupportPopup('withdraw')"><div class="hg-icon">🏦</div><div class="hg-title" style="font-size: 9px;">উইথড্র</div></div>
                <div class="home-grid-card" onclick="openSupportPopup('bonus')"><div class="hg-icon">🎁</div><div class="hg-title" style="font-size: 9px;">বোনাস</div></div>
                <div class="home-grid-card" onclick="openSupportPopup('task')"><div class="hg-icon">📋</div><div class="hg-title" style="font-size: 9px;">ডেইলি টাস্ক</div></div>
            </div>
            <div class="chat-box-area" id="chatBoxContainer">
                <div class="chat-msg support">হ্যালো! আমি RS সাপোর্ট টিম থেকে বলছি। আপনার যেকোনো সমস্যায় কথা বলুন।</div>
            </div>
            <div style="display: flex; gap: 6px; margin-top: 10px;">
                <input type="text" class="form-control" id="supportInput" placeholder="আপনার সমস্যার বিস্তারিত লিখুন..." style="margin-top:0;">
                <button class="banner-btn" onclick="sendSupportMsg()">প্রেরণ</button>
            </div>
        </div>

        <div id="referralView" class="view-section" style="display: none;">
            <div class="ref-banner">
                <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">আজীবন ৩% কমিশন ও ইনস্ট্যান্ট ১০০ আরএস কয়েন</h3>
                <div class="ref-input-box">
                    <input type="text" id="refLinkInput" value="https://rs.taptoearn.app/ref/RS12345" readonly style="background:transparent; border:none; color:white; font-size:11px; width:100%; outline:none;">
                    <button class="tr-btn" onclick="copyRefLink()">কপি</button>
                </div>
                <div class="social-share-row">
                    <div class="ss-btn" onclick="shareToSocial('youtube')">▶️ ইউটিউব</div>
                    <div class="ss-btn" onclick="shareToSocial('facebook')">📘 ফেসবুক</div>
                    <div class="ss-btn" onclick="shareToSocial('tiktok')">🎵 টিকটক</div>
                </div>
            </div>
            <div class="section-heading"><span>🎁 প্রিমিয়াম লাইভ রেফারেল ফিড</span></div>
            <div class="live-ticker-box-large">
                <div class="ticker-list">
                    <div class="ticker-item"><span class="t-ref">🎁 SAJIB_07 রেফারেল করে +100 কয়েন পেয়েছে</span><span style="font-size:9px; color:var(--text-muted)">১মিঃ আগে</span></div>
                </div>
            </div>
        </div>

        <div id="accountView" class="view-section" style="display: none;">
            <div class="section-heading"><span>অ্যাকাউন্ট ওভারভিউ</span></div>
            <div class="update-card" style="align-items: center; background: rgba(30, 41, 59, 0.7);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img id="accScreenAvatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover;">
                    <div>
                        <h4 style="font-size: 13px;" id="accScreenName">Rakibul Islam</h4>
                        <p style="font-size: 10px; color: var(--accent-gold);">ইউজারনেম: RS_12345</p>
                    </div>
                </div>
                <button class="tr-btn" onclick="openEditProfileModal()">প্রোফাইল এডিট</button>
            </div>
            <button class="admin-trigger-btn" onclick="promptAdminLogin()">🔐 এডমিন প্যানেল লগইন</button>
            <div class="acc-grid-4" style="margin-top: 12px;">
                <div class="acc-stat-card"><div style="font-size: 10px; color: var(--text-muted);">পেন্ডিং</div><div style="font-size: 11px; font-weight: bold; color: var(--accent-gold);" id="statPending">৳ ০.০০</div></div>
                <div class="acc-stat-card"><div style="font-size: 10px; color: var(--text-muted);">লেনদেন</div><div style="font-size: 12px; font-weight: bold; color: var(--accent-blue);" id="statTransactions">০</div></div>
                <div class="acc-stat-card"><div style="font-size: 10px; color: var(--text-muted);">আজকের আয়</div><div style="font-size: 11px; font-weight: bold; color: var(--accent-green);" id="statTodayEarn">৳ ০.০০</div></div>
                <div class="acc-stat-card"><div style="font-size: 10px; color: var(--text-muted);">রেফার আয়</div><div style="font-size: 11px; font-weight: bold; color: var(--accent-purple);" id="statRefEarn">৳ ০.০০</div></div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 10px;">
                <button class="banner-btn" style="width:100%; justify-content:center; background:#22c55e; color:#fff;" onclick="openModal('depositModal')">➕ ডিপোজিট</button>
                <button class="banner-btn" style="width:100%; justify-content:center; background:#ef4444; color:#fff;" onclick="openModal('withdrawModal')">➖ উইথড্র</button>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <div class="modal" id="adminPanelModal"><div class="modal-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 14px; color: var(--accent-gold);">👑 ADMIN PANEL</h3>
            <span style="cursor: pointer; font-size: 20px;" onclick="closeModal('adminPanelModal')">&times;</span>
        </div>
        <div class="admin-dashboard-container">
            <div class="admin-stat-grid">
                <div class="admin-stat-box"><div style="font-size: 10px; color: var(--text-muted);">পেন্ডিং</div><div style="font-size: 13px; font-weight: bold; color: var(--accent-gold);" id="adminStatPendingCount">০ টি</div></div>
                <div class="admin-stat-box"><div style="font-size: 10px; color: var(--text-muted);">সাকসেস</div><div style="font-size: 13px; font-weight: bold; color: var(--accent-green);" id="adminStatSuccessCount">০ টি</div></div>
            </div>
            <div style="font-size: 11px; font-weight: bold; color: var(--accent-gold);">📥 ডিপোজিট রিকোয়েস্ট</div>
            <div class="admin-live-list-box" id="adminDepositLiveList"><p style="font-size: 10px; text-align: center;">খালি আছে</p></div>
            <div style="font-size: 11px; font-weight: bold; color: #ef4444;">📤 উইথড্র রিকোয়েস্ট</div>
            <div class="admin-live-list-box" id="adminWithdrawLiveList"><p style="font-size: 10px; text-align: center;">খালি আছে</p></div>
        </div>
    </div></div>

    <div class="modal" id="depositModal"><div class="modal-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="font-size: 14px; color: var(--accent-green);">➕ ডিপোজিট করুন (২০০ - ৩০০০ টাকা)</h3>
            <span style="cursor: pointer; font-size: 16px;" onclick="closeModal('depositModal')">&times;</span>
        </div>
        <select id="depositMethodSelect" class="form-control"><option value="bKash">বিকাশ</option><option value="Nagad">নগদ</option></select>
        <p style="font-size: 10px; margin: 8px 0;">নম্বরে সেন্ড মানি করুন: <b id="depositSendNumber" style="color:var(--accent-gold);">01951639460</b></p>
        <input type="number" id="depositInputAmt" class="form-control" placeholder="পরিমাণ (টাকা)">
        <div class="popup-amount-grid">
            <div class="popup-amt-btn" onclick="setDepositAmt(200)">200</div>
            <div class="popup-amt-btn" onclick="setDepositAmt(500)">500</div>
            <div class="popup-amt-btn" onclick="setDepositAmt(1000)">1000</div>
        </div>
        <input type="text" id="depositTrxId" class="form-control" placeholder="TrxID দিন">
        <input type="text" id="depositLastThreeDigits" class="form-control" maxlength="3" placeholder="শেষ ৩ ডিজিট">
        <button class="banner-btn" style="width:100%; justify-content:center; margin-top:12px; background:var(--accent-green); color:#fff;" onclick="submitDeposit()">ডিপোজিট কনফার্ম</button>
    </div></div>

    <div class="modal" id="withdrawModal"><div class="modal-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="font-size: 14px; color: #ef4444;">➖ উইথড্র করুন</h3>
            <span style="cursor: pointer; font-size: 16px;" onclick="closeModal('withdrawModal')">&times;</span>
        </div>
        <select id="withdrawMethodSelect" class="form-control"><option value="bKash">বিকাশ</option><option value="Nagad">নগদ</option></select>
        <input type="number" id="withdrawInputAmt" class="form-control" placeholder="পরিমাণ (টাকা)">
        <input type="text" id="withdrawPhone" class="form-control" placeholder="নম্বর (১১ ডিজিট)">
        <button class="banner-btn" style="width:100%; justify-content:center; margin-top:12px; background:#ef4444; color:#fff;" onclick="submitWithdraw()">উইথড্র পাঠান</button>
    </div></div>

    <div class="modal" id="editProfileModal"><div class="modal-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="font-size: 14px; color: var(--accent-blue);">✏️ প্রোফাইল এডিট</h3>
            <span style="cursor: pointer; font-size: 16px;" onclick="closeModal('editProfileModal')">&times;</span>
        </div>
        <input type="text" id="editNameInput" class="form-control" placeholder="নতুন নাম">
        <button class="banner-btn" style="width:100%; justify-content:center; margin-top:15px; background:var(--accent-blue); color:#fff;" onclick="saveProfileChanges()">সংরক্ষণ</button>
    </div></div>

    <div class="modal" id="pkgDepositPopupModal"><div class="modal-card" style="text-align: center;">
        <h3 style="font-size: 14px; color: var(--accent-gold); margin-bottom: 10px;">ডিপোজিট নোটিশ</h3>
        <p id="pkgPopupMsg" style="font-size: 11px; margin-bottom: 15px;"></p>
        <button class="banner-btn" style="width:100%; justify-content:center; background:var(--accent-green); color:#fff;" onclick="closeModal('pkgDepositPopupModal'); openModal('depositModal');">ডিপোজিট করুন</button>
    </div></div>

    <div class="modal" id="calculatorModal"><div class="modal-card" style="text-align: center;">
        <h3 style="font-size: 14px; color: var(--accent-gold); margin-bottom: 10px;">🧮 কয়েন কনভার্টার</h3>
        <p id="calcPkgTitle" style="font-size: 12px; font-weight: bold; color: var(--accent-blue); margin-bottom: 8px;"></p>
        <p id="calcDetailsText" style="font-size: 11px; margin-bottom: 15px;"></p>
        <button class="banner-btn" style="width:100%; justify-content:center; background:var(--accent-green); color:#fff;" onclick="executeCoinConversion()">টাকায় কনভার্ট করুন</button>
    </div></div>

    <script>
        let currentUserName = localStorage.getItem('rs_username') || "Rakibul Islam";
        let currentUserAvatar = localStorage.getItem('rs_avatar') || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces";
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

        function switchTab(tabName, el) {
            const sections = document.querySelectorAll('.view-section');
            sections.forEach(s => {
                s.style.display = 'none';
                s.classList.remove('active');
            });

            const targetView = document.getElementById(tabName + 'View');
            if (targetView) {
                targetView.style.display = 'block';
                targetView.classList.add('active');
            }

            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            if (el) {
                el.classList.add('active');
            }
        }

        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
            }
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
            }
        }

        async function fetchServerTasks() {
            try {
                const response = await fetch('/api/tasks');
                const data = await response.json();
                let baseTasks = data && data.length > 0 ? data : [{_id: 1, title: "YouTube Sub", reward: 50, description: "সাবস্ক্রাইব করুন।"}];
                microJobsList = [];
                for(let i = 1; i <= 50; i++) {
                    let sample = baseTasks[(i - 1) % baseTasks.length];
                    microJobsList.push({
                        id: i, title: "Task #" + i + ": " + sample.title, reward: sample.reward, icon: "▶️",
                        desc: sample.description, link: "https://offerwall.gg/task/" + i, status: 'available'
                    });
                }
            } catch (err) { console.error(err); }
            renderMicroJobsUI();
        }

        function renderMicroJobsUI() {
            const container = document.getElementById('microJobsListContainer');
            if(!container) return;
            let available = microJobsList.filter(t => t.status === 'available');
            document.getElementById('taskStatTotal').innerText = available.length;
            if(available.length === 0) { container.innerHTML = '<p style="font-size:11px; text-align:center; grid-column:span 2;">সব টাস্ক সম্পন্ন!</p>'; return; }
            let html = '';
            available.slice(0, 10).forEach(t => {
                html += '<div class="task-row-card" style="flex-direction:column; align-items:flex-start; gap:6px;">' +
                    '<div style="font-size:11px; font-weight:bold;">' + t.title + '</div>' +
                    '<div style="font-size:10px; color:var(--accent-gold);">+' + t.reward + ' RS</div>' +
                    '<button class="tr-btn" style="width:100%; padding:4px;" onclick="alert(\'টাস্ক লিংক: ' + t.link + '\')">কাজ করুন</button>' +
                '</div>';
            });
            container.innerHTML = html;
        }

        function claimDailyTask() {
            let claims = JSON.parse(localStorage.getItem('rs_daily_task_claims')) || [];
            let now = new Date().getTime();
            claims = claims.filter(t => now - t < 86400000);
            if(claims.length >= 2) { alert('২৪ ঘণ্টায় সর্বোচ্চ ২ বার ক্লেইম করা যাবে!'); return; }
            claims.push(now);
            localStorage.setItem('rs_daily_task_claims', JSON.stringify(claims));
            rsCoins += 50;
            updateAccountStatsUI();
            alert('🎉 ডেইলি টাস্ক থেকে +50 RS যোগ হয়েছে!');
        }

        function checkInDaily() {
            let last = parseInt(localStorage.getItem('rs_last_checkin')) || 0;
            let now = new Date().getTime();
            if(now - last < 86400000) { alert('আজ ইতিমধ্যেই চেক-ইন করা হয়েছে!'); return; }
            localStorage.setItem('rs_last_checkin', now);
            rsCoins += 100;
            updateAccountStatsUI();
            alert('🎁 চেক-ইন সফল! +100 RS যোগ হয়েছে।');
        }

        function saveAllState() {
            localStorage.setItem('rs_username', currentUserName);
            localStorage.setItem('rs_avatar', currentUserAvatar);
            localStorage.setItem('rs_balance', userBalance);
            localStorage.setItem('rs_coins', rsCoins);
            localStorage.setItem('rs_pending', pendingAmount);
            localStorage.setItem('rs_tx_count', totalTransactionsCount);
            localStorage.setItem('rs_deposit_history', JSON.stringify(userDepositHistory));
            localStorage.setItem('rs_withdraw_history', JSON.stringify(userWithdrawHistory));
            localStorage.setItem('rs_purchased_packages', JSON.stringify(purchasedPackages));
        }

        function formatCoinNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
            return num.toFixed(0);
        }

        function updateAccountStatsUI() {
            document.getElementById('topBalanceDisplay').innerText = '৳ ' + userBalance.toFixed(2);
            document.getElementById('topRsDisplay').innerText = '🪙 ' + formatCoinNumber(rsCoins) + ' RS';
            document.getElementById('statPending').innerText = '৳ ' + pendingAmount.toFixed(2);
            document.getElementById('statTransactions').innerText = totalTransactionsCount;
            document.getElementById('statTodayEarn').innerText = '৳ ' + todayEarnAmount.toFixed(2);
            document.getElementById('statRefEarn').innerText = '৳ ' + referralEarnAmount.toFixed(2);
            document.getElementById('headerName').innerText = currentUserName + " ✏️";
            document.getElementById('accScreenName').innerText = currentUserName;
            document.getElementById('headerAvatar').src = currentUserAvatar;
            document.getElementById('accScreenAvatar').src = currentUserAvatar;
            renderPackagesUI();
            renderAdminLiveLists();
            saveAllState();
        }

        function renderPackagesUI() {
            const container = document.getElementById('packagesGridContainer');
            if(!container) return;
            const packagesList = [
                {id: 200, title: 'স্ট্যান্ডার্ড প্যাকেজ', price: 200, rate: '500 RS/মিঃ', tier: 'tier-1', hasCrown: false},
                {id: 500, title: 'ব্রোঞ্জ প্যাকেজ', price: 500, rate: '1000 RS/মিঃ', tier: 'tier-2', hasCrown: false},
                {id: 700, title: 'সিলভার প্যাকেজ', price: 700, rate: '1700 RS/মিঃ', tier: 'tier-3', hasCrown: false},
                {id: 1000, title: 'গোল্ড প্যাকেজ', price: 1000, rate: '2500 RS/মিঃ', tier: 'tier-4', hasCrown: false},
                {id: 1500, title: 'প্লাটিনাম প্যাকেজ', price: 1500, rate: '3500 RS/মিঃ', tier: 'tier-5', hasCrown: true},
                {id: 2000, title: 'ডায়মন্ড প্যাকেজ', price: 2000, rate: '5000 RS/মিঃ', tier: 'tier-6', hasCrown: true},
                {id: 2500, title: 'ভিআইপি প্যাকেজ', price: 2500, rate: '7000 RS/মিঃ', tier: 'tier-7', hasCrown: false},
                {id: 3000, title: 'আল্টিমেট প্রিমিয়াম', price: 3000, rate: '10000 RS/মিঃ', tier: 'tier-8', hasCrown: true}
            ];
            let html = '';
            let now = new Date().getTime();
            packagesList.forEach(p => {
                let isPurchased = purchasedPackages[p.id];
                let crownHtml = p.hasCrown ? '<span class="crown-badge">👑</span>' : '';
                if (isPurchased) {
                    let daysPassed = Math.floor((now - isPurchased.startTime) / (1000 * 60 * 60 * 24));
                    let daysLeft = Math.max(0, 30 - daysPassed);
                    if(daysPassed >= 30) {
                        openCalculatorModal(p);
                        delete purchasedPackages[p.id];
                        saveAllState();
                        renderPackagesUI();
                        return;
                    }
                    let noticeBar = daysPassed >= 27 ? '<div style="font-size:9px; color:var(--accent-gold); font-weight:bold;">২৭ দিন পূর্ণ! আর ৩ দিন পর কয়েন কনভার্ট হবে।</div>' : '';
                    html += '<div class="pkg-card ' + p.tier + '" style="border-color:var(--accent-green);">' +
                        '<div><div class="pkg-title">' + p.title + ' ' + crownHtml + '</div><div class="pkg-price">৳ ' + p.price + '</div><div class="pkg-rate">' + p.rate + '</div></div>' +
                        '<div>' + noticeBar + '<div class="pkg-active-status"><b>প্যাকেজ সচল!</b><br>বাকি: ' + daysLeft + ' দিন</div></div>' +
                    '</div>';
                } else {
                    html += '<div class="pkg-card ' + p.tier + '">' +
                        '<div><div class="pkg-title">' + p.title + ' ' + crownHtml + '</div><div class="pkg-price">৳ ' + p.price + '</div><div class="pkg-rate">' + p.rate + '</div></div>' +
                        '<button class="pkg-btn" onclick="buyPackageViaDeposit(' + p.price + ', \'' + p.title + '\')">ডিপোজিট করে কিনুন</button>' +
                    '</div>';
                }
            });
            container.innerHTML = html;
        }

        function buyPackageViaDeposit(price, title) {
            document.getElementById('pkgPopupMsg').innerText = "⚠️ অ্যাকাউন্ট ব্যালেন্স দিয়ে প্যাকেজ কেনা যাবে না। '" + title + "' (৳" + price + ") কিনতে সরাসরি ডিপোজিট করুন।";
            openModal('pkgDepositPopupModal');
            document.getElementById('depositInputAmt').value = price;
        }

        let pendingPkgToUnlock = null;
        function openCalculatorModal(pkg) {
            pendingPkgToUnlock = pkg;
            document.getElementById('calcPkgTitle').innerText = pkg.title + " - ৩০ দিন পূর্ণ!";
            document.getElementById('calcDetailsText').innerText = "প্যাকেজের মেয়াদ ৩০ দিন পূর্ণ হয়েছে। এখন কয়েন কনভার্ট করে মূল টাকায় যোগ করা হবে।";
            openModal('calculatorModal');
        }

        function executeCoinConversion() {
            if(pendingPkgToUnlock) {
                userBalance += 500;
                let startTime = new Date().getTime();
                purchasedPackages[pendingPkgToUnlock.id] = { startTime: startTime, earnedCoins: 0 };
                updateAccountStatsUI();
                closeModal('calculatorModal');
                alert('🎉 সফল! কয়েন কনভার্ট হয়ে মূল ব্যালেন্সে যোগ হয়েছে এবং প্যাকেজ রিনিউ হয়েছে।');
            }
        }

        function triggerPhotoUpload() { document.getElementById('globalPhotoInput').click(); }
        function handlePhotoUpload(e) {
            if(e.target.files[0]) {
                let reader = new FileReader();
                reader.onload = function(evt) { currentUserAvatar = evt.target.result; updateAccountStatsUI(); alert('ছবি আপডেট হয়েছে!'); }
                reader.readAsDataURL(e.target.files[0]);
            }
        }
        function openEditProfileModal() { document.getElementById('editNameInput').value = currentUserName; openModal('editProfileModal'); }
        function saveProfileChanges() {
            let name = document.getElementById('editNameInput').value.trim();
            if(name) currentUserName = name;
            updateAccountStatsUI();
            closeModal('editProfileModal');
            alert('প্রোফাইল সেভ হয়েছে!');
        }

        function copyRefLink() { navigator.clipboard.writeText(document.getElementById('refLinkInput').value); alert('লিংক কপি হয়েছে!'); }
        function shareToSocial(p) { alert(p + ' এ শেয়ার করার জন্য লিংক কপি করা হয়েছে।'); }
        function setDepositAmt(v) { document.getElementById('depositInputAmt').value = v; }

        function openSupportPopup(t) {
            alert(t === 'deposit' ? 'ডিপোজিট সীমা ২০০ থেকে ৩০০০ টাকা।' : 'সাপোর্ট সেন্টারে স্বাগতম।');
        }

        function sendSupportMsg() {
            let txt = document.getElementById('supportInput').value.trim();
            if(!txt) return;
            let box = document.getElementById('chatBoxContainer');
            box.innerHTML += '<div class="chat-msg user">' + txt + '</div>';
            document.getElementById('supportInput').value = '';
            setTimeout(() => { box.innerHTML += '<div class="chat-msg support">আপনার মেসেজ পেয়েছি, দ্রুত জানানো হবে।</div>'; }, 800);
        }

        function promptAdminLogin() { if(prompt("পাসওয়ার্ড:") === "mdrana321") openModal('adminPanelModal'); else alert('ভুল পাসওয়ার্ড!'); }

        function submitDeposit() {
            let amt = parseFloat(document.getElementById('depositInputAmt').value);
            let trx = document.getElementById('depositTrxId').value.trim();
            let last = document.getElementById('depositLastThreeDigits').value.trim();
            if(isNaN(amt) || amt < 200 || amt > 3000 || !trx || last.length !== 3) { alert('সঠিক তথ্য দিন!'); return; }
            pendingAmount += amt;
            userDepositHistory.unshift({ amt, trx, status: 'Pending' });
            updateAccountStatsUI();
            if([200,500,700,1000,1500,2000,2500,3000].includes(amt)) {
                purchasedPackages[amt] = { startTime: new Date().getTime(), earnedCoins: 0 };
            }
            alert('ডিপোজিট রিকোয়েস্ট পেন্ডিং রয়েছে!');
            closeModal('depositModal');
        }

        function submitWithdraw() {
            let amt = parseFloat(document.getElementById('withdrawInputAmt').value);
            if(isNaN(amt) || amt < 300 || amt > userBalance) { alert('পর্যাপ্ত ব্যালেন্স বা সঠিক পরিমাণ নেই!'); return; }
            userBalance -= amt;
            pendingAmount += amt;
            updateAccountStatsUI();
            alert('উইথড্র রিকোয়েস্ট পাঠানো হয়েছে!');
            closeModal('withdrawModal');
        }

        function renderAdminLiveLists() {
            let depBox = document.getElementById('adminDepositLiveList');
            let pendingDeps = userDepositHistory.filter(d => d.status === 'Pending');
            if(pendingDeps.length === 0) { depBox.innerHTML = '<p style="font-size:10px; text-align:center;">কোনো রিকোয়েস্ট নেই</p>'; return; }
            let html = '';
            pendingDeps.forEach((d, i) => {
                html += '<div style="font-size:10px; background:rgba(30,41,59,0.7); padding:4px; margin-bottom:4px; display:flex; justify-content:space-between;">' +
                    '<span>৳' + d.amt + ' [Trx: ' + d.trx + ']</span>' +
                    '<button class="tr-btn" style="padding:2px 6px; font-size:9px; background:var(--accent-green); color:#fff;" onclick="approveDeposit(' + i + ')">অনুমোদন</button>' +
                '</div>';
            });
            depBox.innerHTML = html;
        }

        function approveDeposit(idx) {
            let pendingDeps = userDepositHistory.filter(d => d.status === 'Pending');
            let item = pendingDeps[idx];
            if(item) {
                item.status = 'Success';
                userBalance += item.amt;
                pendingAmount -= item.amt;
                updateAccountStatsUI();
                renderAdminLiveLists();
                alert('ডিপোজিট সফলভাবে অনুমোদিত হয়েছে!');
            }
        }

        setInterval(() => {
            for(let p in purchasedPackages) {
                rsCoins += 1000;
            }
            updateAccountStatsUI();
        }, 60000);

        updateAccountStatsUI();
        fetchServerTasks();
    </script>
</body>
</html>`;
    res.send(htmlContent);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
