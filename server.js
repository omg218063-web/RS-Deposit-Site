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

        #authScreen {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle at center, #1e1b4b 0%, #060913 100%);
            z-index: 2000;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding: 20px;
            overflow-y: auto;
        }

        .auth-logo-circle {
            width: 85px; height: 85px; border-radius: 50%;
            background: linear-gradient(135deg, #fbbf24, #d97706);
            display: flex; align-items: center; justify-content: center;
            font-size: 30px; font-weight: bold; color: #000;
            border: 2px solid #fff; box-shadow: 0 0 25px rgba(251,191,36,0.6);
            margin-bottom: 8px; margin-top: 10px;
        }
        
        .auth-logo-title {
            font-size: 20px; font-weight: bold; color: var(--accent-gold);
            text-shadow: 0 0 15px rgba(251,191,36,0.4); margin-bottom: 2px;
        }
        .auth-subtitle {
            font-size: 10px; color: var(--text-muted); margin-bottom: 12px;
        }
        
        .auth-box-card {
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(251,191,36,0.3);
            border-radius: 18px;
            padding: 15px;
            width: 100%;
            text-align: left;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        }
        .auth-form-group {
            width: 100%; margin-bottom: 8px;
        }
        .auth-form-group label {
            font-size: 9px; color: var(--text-muted); margin-bottom: 2px; display: block;
        }
        .auth-switch-tab {
            display: flex; background: #060913; border-radius: 10px; padding: 3px; margin-bottom: 10px; border: 1px solid var(--card-border);
        }
        .ast-btn {
            flex: 1; text-align: center; padding: 6px; font-size: 10px; font-weight: bold; cursor: pointer; border-radius: 8px; color: var(--text-muted); transition: 0.3s;
        }
        .ast-btn.active {
            background: linear-gradient(90deg, var(--accent-gold), #f59e0b); color: #000;
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

        .top-nav {
            display: flex; 
            justify-content: space-around; 
            background: linear-gradient(180deg, #131d38, #0f172a);
            border-bottom: 1px solid rgba(56, 189, 248, 0.2); 
            padding: 8px 4px; 
            flex-shrink: 0;
            z-index: 100;
        }
        .nav-item { 
            text-align: center; 
            color: var(--text-muted); 
            font-size: 10px; 
            cursor: pointer; 
            flex: 1;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
        }
        .nav-item div { 
            font-size: 16px; 
            margin-bottom: 2px; 
            transition: transform 0.3s ease;
        }
        .nav-item:hover {
            color: var(--accent-blue);
            transform: translateY(-3px) rotate(1deg);
        }
        .nav-item.active { 
            color: var(--accent-gold); 
            text-shadow: 0 0 12px rgba(251, 191, 36, 0.6);
            animation: navPulse 1.5s infinite alternate;
        }
        @keyframes navPulse {
            0% { transform: translateY(0) scale(1); filter: brightness(1); }
            100% { transform: translateY(-4px) scale(1.08) rotate(2deg); filter: brightness(1.2); }
        }
        .nav-item.active div {
            transform: translateY(-3px) scale(1.1);
        }

        .modal {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); justify-content: center; align-items: center; z-index: 1000; padding: 15px;
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

    <!-- Authentication Screen (Updated & Fixed Registration with regName) -->
    <div id="authScreen">
        <div class="auth-logo-circle">RS</div>
        <div class="auth-logo-title">RS Growth Matrix</div>
        <div class="auth-subtitle">নিরাপদ আর্নিং ও মাইনিং প্ল্যাটফর্ম ২০২৬</div>
        
        <div class="auth-box-card">
            <div class="auth-switch-tab">
                <div class="ast-btn active" id="tabRegBtn" onclick="switchAuthMode('reg')">রেজিস্ট্রেশন</div>
                <div class="ast-btn" id="tabLoginBtn" onclick="switchAuthMode('login')">লগইন</div>
            </div>

            <!-- Registration Form Section -->
            <div id="registrationFormSection">
                <div class="auth-form-group">
                    <label>আপনার নাম:</label>
                    <input type="text" id="regName" class="form-control" placeholder="আপনার নাম লিখুন">
                </div>
                <div class="auth-form-group">
                    <label>মোবাইল নম্বর (১১ ডিজিট):</label>
                    <input type="text" id="regPhone" class="form-control" placeholder="017xxxxxxxx" maxlength="11">
                </div>
                <div class="auth-form-group">
                    <label>পাসওয়ার্ড (কমপক্ষে ২ সংখ্যা):</label>
                    <input type="password" id="regPass" class="form-control" placeholder="পাসওয়ার্ড দিন" maxlength="6">
                </div>
                <button type="button" class="banner-btn" style="width:100%; justify-content:center; margin-top:8px; background:var(--accent-green); color:#fff;" onclick="submitManualRegistration()">রেজিস্ট্রেশন কনফার্ম করুন</button>
            </div>

            <!-- Login Form Section -->
            <div id="loginFormSection" style="display: none;">
                <div class="auth-form-group">
                    <label>আপনার মোবাইল নম্বর:</label>
                    <input type="text" id="loginPhone" class="form-control" placeholder="017xxxxxxxx" maxlength="11">
                </div>
                <div class="auth-form-group">
                    <label>আপনার পাসওয়ার্ড:</label>
                    <input type="password" id="loginPass" class="form-control" placeholder="পাসওয়ার্ড দিন" maxlength="6">
                </div>
                <button type="button" class="banner-btn" style="width:100%; justify-content:center; margin-top:10px; background:var(--accent-gold); color:#000;" onclick="submitUserLogin()">লগইন করুন</button>
            </div>
        </div>
    </div>

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

        <div id="packagesView" class="view-section">
            <div class="section-heading"><span>💎 এক্সক্লুসিভ মাইনিং প্যাকেজ</span> <span style="font-size: 10px; color: var(--accent-gold);">২৪ ঘণ্টা অটো মাইনিং</span></div>
            <p style="font-size: 10px; color: var(--text-muted); margin-bottom: 12px;">প্যাকেজ আনলক করতে ক্লিক করুন, পর্যাপ্ত ফান্ড না থাকলে ডিপোজিট পপআপ ও OK বাটনসহ অপশন আসবে।</p>
            
            <div class="packages-grid-2x2" id="packagesGridContainer"></div>
        </div>

        <div id="tasksView" class="view-section">
            <div class="section-heading"><span>⚡ সার্ভার ও মাইক্রো জবস লাইভ টাস্ক</span> <span style="font-size: 10px; color: var(--accent-green);">● সার্ভার থেকে লোডকৃত</span></div>
            
            <div id="microJobsListContainer">
                <p style="font-size: 11px; color: var(--text-muted); text-align: center;">সার্ভার থেকে টাস্ক লোড করা হচ্ছে...</p>
            </div>
        </div>

        <div id="rankingView" class="view-section">
            <div class="section-heading"><span>🏆 গ্লোবাল টপ র‍্যাঙ্কিং লিডারবোর্ড</span> <span style="font-size: 10px; color: var(--accent-gold);">টপ ১ থেকে ১০ কয়েন ক্রমান্বয়ে বৃদ্ধি পাবে</span></div>
            
            <div class="podium-box" id="podiumTop3Container"></div>

            <div class="section-heading"><span>অন্যান্য আর্নারগণ</span></div>
            <div id="rankingListContainer"></div>
        </div>

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
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="font-size: 14px; color: var(--accent-green);">➕ ডিপোজিট করুন (সীমা: ২০০ - ৩০০০ টাকা)</h3>
                <span style="cursor: pointer; font-size: 16px;" onclick="closeModal('depositModal')">&times;</span>
            </div>
            
            <label style="font-size: 10px; color: var(--text-muted);">পেমেন্ট মেথড সিলেক্ট করুন:</label>
            <select id="depositMethodSelect" class="form-control">
                <option value="bKash">বিকাশ (bKash)</option>
                <option value="Nagad">নগদ (Nagad)</option>
            </select>

            <p style="font-size: 10px; color: var(--text-muted); margin: 8px 0;">নির্বাচিত নম্বরে সেন্ড মানি করুন:</p>
            <div style="display: flex; align-items: center; justify-content: space-between; background: #060913; border: 1px solid var(--card-border); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                <span id="depositSendNumber" style="font-size: 15px; font-weight: bold; color: var(--accent-gold); letter-spacing: 1px;">01951639460</span>
                <button type="button" class="tr-btn" onclick="copyDepositNumber()">কপি নম্বর</button>
            </div>

            <label style="font-size: 10px; color: var(--text-muted);">পরিমাণ (টাকা):</label>
            <input type="number" id="depositInputAmt" class="form-control" placeholder="যেমন: ১০০০">
            
            <div class="popup-amount-grid">
                <div class="popup-amt-btn" onclick="setDepositAmt(200)">200</div>
                <div class="popup-amt-btn" onclick="setDepositAmt(400)">400</div>
                <div class="popup-amt-btn" onclick="setDepositAmt(600)">600</div>
                <div class="popup-amt-btn" onclick="setDepositAmt(800)">800</div>
                <div class="popup-amt-btn" onclick="setDepositAmt(1200)">1200</div>
                <div class="popup-amt-btn" onclick="setDepositAmt(1500)">1500</div>
                <div class="popup-amt-btn" onclick="setDepositAmt(2000)">2000</div>
                <div class="popup-amt-btn" onclick="setDepositAmt(2500)">2500</div>
                <div class="popup-amt-btn" onclick="setDepositAmt(3000)">3000</div>
            </div>
            
            <label style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">ট্রানজাকশন আইডি (TrxID):</label>
            <input type="text" id="depositTrxId" class="form-control" placeholder="যেমন: 7A3B2C1D4E">

            <label style="font-size: 10px; color: var(--text-muted); margin-top: 6px;">পেমেন্ট নাম্বারের শেষ ৩ ডিজিট দিন (বাধ্যতামূলক):</label>
            <input type="text" id="depositLast3Digits" class="form-control" placeholder="যেমন: 460" maxlength="3">
            
            <button type="button" class="banner-btn" style="width:100%; justify-content:center; margin-top:12px; background:var(--accent-green); color:#fff;" onclick="submitDeposit()">ডিপোজিট নিশ্চিত করুন</button>
        </div>
    </div>

    <div class="modal" id="withdrawModal">
        <div class="modal-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="font-size: 14px; color: var(--accent-gold);">➖ ফান্ড উইথড্র করুন (সীমা: ৩০০ - ৫০০০ টাকা)</h3>
                <span style="cursor: pointer; font-size: 16px;" onclick="closeModal('withdrawModal')">&times;</span>
            </div>
            
            <label style="font-size: 10px; color: var(--text-muted);">উইথড্র মাধ্যম সিলেক্ট করুন:</label>
            <select id="withdrawMethodSelect" class="form-control">
                <option value="bKash">বিকাশ (bKash)</option>
                <option value="Nagad">নগদ (Nagad)</option>
            </select>

            <label style="font-size: 10px; color: var(--text-muted); margin-top: 8px;">উইথড্র পরিমাণ:</label>
            <input type="number" id="withdrawInputAmt" class="form-control" placeholder="যেমন: ৫০০">

            <div class="popup-amount-grid">
                <div class="popup-amt-btn" onclick="setWithdrawAmt(300)">300</div>
                <div class="popup-amt-btn" onclick="setWithdrawAmt(500)">500</div>
                <div class="popup-amt-btn" onclick="setWithdrawAmt(700)">700</div>
                <div class="popup-amt-btn" onclick="setWithdrawAmt(1200)">1200</div>
                <div class="popup-amt-btn" onclick="setWithdrawAmt(2000)">2000</div>
                <div class="popup-amt-btn" onclick="setWithdrawAmt(2500)">2500</div>
                <div class="popup-amt-btn" onclick="setWithdrawAmt(3000)">3000</div>
            </div>

            <label style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">আপনার বিকাশ/নগদ নম্বর (১১ ডিজিট):</label>
            <input type="text" id="withdrawPhone" class="form-control" placeholder="017xxxxxxxx">
            
            <button type="button" class="banner-btn" style="width:100%; justify-content:center; margin-top:12px; background:#ef4444; color:#fff;" onclick="submitWithdraw()">উইথড্র রিকোয়েস্ট পাঠান</button>
        </div>
    </div>

    <div class="modal" id="depositHistoryModal">
        <div class="modal-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="font-size: 14px; color: var(--accent-green);">📋 রিয়েল ডিপোজিট হিস্ট্রি</h3>
                <span style="cursor: pointer; font-size: 16px;" onclick="closeModal('depositHistoryModal')">&times;</span>
            </div>
            <div id="depositHistoryPopupContent" style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto;">
                <p style="font-size: 11px; color: var(--text-muted); text-align: center;">কোনো ডিপোজিট হিস্ট্রি নেই</p>
            </div>
        </div>
    </div>

    <div class="modal" id="withdrawHistoryModal">
        <div class="modal-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="font-size: 14px; color: #ef4444;">📋 রিয়েল উইথড্র হিস্ট্রি</h3>
                <span style="cursor: pointer; font-size: 16px;" onclick="closeModal('withdrawHistoryModal')">&times;</span>
            </div>
            <div id="withdrawHistoryPopupContent" style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto;">
                <p style="font-size: 11px; color: var(--text-muted); text-align: center;">কোনো উইথড্র হিস্ট্রি নেই</p>
            </div>
        </div>
    </div>

    <div class="modal" id="editProfileModal">
        <div class="modal-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="font-size: 14px; color: var(--accent-blue);">✏️ প্রোফাইল এডিট করুন</h3>
                <span style="cursor: pointer; font-size: 16px;" onclick="closeModal('editProfileModal')">&times;</span>
            </div>
            <label style="font-size: 10px; color: var(--text-muted);">আপনার নাম:</label>
            <input type="text" id="editNameInput" class="form-control" placeholder="নতুন নাম লিখুন">
            
            <label style="font-size: 10px; color: var(--text-muted); margin-top: 10px; display: block;">প্রোফাইল ছবি পরিবর্তন করুন:</label>
            <input type="file" id="modalPhotoInput" class="form-control" accept="image/*">
            
            <button type="button" class="banner-btn" style="width:100%; justify-content:center; margin-top:15px; background:var(--accent-blue); color:#fff;" onclick="saveProfileChanges()">সংরক্ষণ করুন</button>
        </div>
    </div>

    <div class="modal" id="supportPopupModal">
        <div class="modal-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 id="supportPopupTitle" style="font-size: 14px; color: var(--accent-gold);">সাপোর্ট গাইডলাইন</h3>
                <span style="cursor: pointer; font-size: 16px;" onclick="closeModal('supportPopupModal')">&times;</span>
            </div>
            <p id="supportPopupDesc" style="font-size: 11px; color: var(--text-muted); line-height: 1.5; margin-bottom: 15px;"></p>
            <button type="button" class="banner-btn" style="width:100%; justify-content:center; background:var(--accent-blue); color:#fff;" onclick="closeModal('supportPopupModal')">বুঝেছি</button>
        </div>
    </div>

    <div class="modal" id="pkgDepositPopupModal">
        <div class="modal-card" style="text-align: center;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="font-size: 14px; color: var(--accent-gold);">ডিপোজিট করুন</h3>
                <span style="cursor: pointer; font-size: 16px;" onclick="closeModal('pkgDepositPopupModal')">&times;</span>
            </div>
            <p id="pkgPopupMsg" style="font-size: 11px; color: var(--text-muted); margin-bottom: 15px;"></p>
            <button type="button" class="banner-btn" style="width:100%; justify-content:center; background:var(--accent-green); color:#fff;" onclick="closeModal('pkgDepositPopupModal'); openModal('depositModal');">OK</button>
        </div>
    </div>

    <script>
        let currentUserName = localStorage.getItem('rs_username') || "";
        let currentUserPhone = localStorage.getItem('rs_phone') || "";
        let currentUserAvatar = localStorage.getItem('rs_avatar') || "";
        
        window.addEventListener('DOMContentLoaded', () => {
            if (!currentUserPhone) {
                document.getElementById('authScreen').style.display = 'flex';
            } else {
                document.getElementById('authScreen').style.display = 'none';
                updateAccountStatsUI();
                fetchServerTasks();
            }
        });

        function switchAuthMode(mode) {
            if(mode === 'reg') {
                document.getElementById('tabRegBtn').classList.add('active');
                document.getElementById('tabLoginBtn').classList.remove('active');
                document.getElementById('registrationFormSection').style.display = 'block';
                document.getElementById('loginFormSection').style.display = 'none';
            } else {
                document.getElementById('tabLoginBtn').classList.add('active');
                document.getElementById('tabRegBtn').classList.remove('active');
                document.getElementById('loginFormSection').style.display = 'block';
                document.getElementById('registrationFormSection').style.display = 'none';
            }
        }

        function submitManualRegistration() {
            let uname = document.getElementById('regName').value.trim();
            let phone = document.getElementById('regPhone').value.trim();
            let pass = document.getElementById('regPass').value.trim();

            if (!uname || !phone || !pass) {
                alert('⚠️ দয়া করে নাম, মোবাইল নম্বর এবং পাসওয়ার্ড দিন।');
                return;
            }
            if (phone.length !== 11 || !/^\\d+$/.test(phone)) {
                alert('❌ সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন!');
                return;
            }
            if (pass.length < 2) {
                alert('❌ পাসওয়ার্ড অন্তত ২ সংখ্যার হতে হবে!');
                return;
            }

            currentUserName = uname;
            currentUserPhone = phone;
            localStorage.setItem('rs_username', currentUserName);
            localStorage.setItem('rs_phone', currentUserPhone);
            localStorage.setItem('rs_password', pass);

            document.getElementById('authScreen').style.display = 'none';
            updateAccountStatsUI();
            fetchServerTasks();
            alert('🎉 আপনার রেজিস্ট্রেশন সফল হয়েছে!');
        }

        function submitUserLogin() {
            let phone = document.getElementById('loginPhone').value.trim();
            let pass = document.getElementById('loginPass').value.trim();

            if (!phone || !pass) {
                alert('⚠️ মোবাইল নম্বর এবং পাসওয়ার্ড দিন।');
                return;
            }
            if (phone.length !== 11) {
                alert('❌ সঠিক ১১ ডিজিটের নম্বর দিন।');
                return;
            }

            currentUserPhone = phone;
            let storedName = localStorage.getItem('rs_username');
            if(storedName) currentUserName = storedName;
            else currentUserName = "User_" + phone.slice(-4);

            localStorage.setItem('rs_username', currentUserName);
            localStorage.setItem('rs_phone', currentUserPhone);
            localStorage.setItem('rs_password', pass);

            document.getElementById('authScreen').style.display = 'none';
            updateAccountStatsUI();
            fetchServerTasks();
            alert('✅ সফলভাবে লগইন হয়েছে!');
        }

        let userBalance = parseFloat(localStorage.getItem('rs_balance'));
        if(isNaN(userBalance)) { userBalance = 25.00; }

        let rsCoins = parseFloat(localStorage.getItem('rs_coins')) || 0.00;
        let pendingAmount = parseFloat(localStorage.getItem('rs_pending')) || 0.00;
        let totalTransactionsCount = parseInt(localStorage.getItem('rs_tx_count')) || 0;
        let todayEarnAmount = parseFloat(localStorage.getItem('rs_today_earn')) || 0.00;
        let referralEarnAmount = parseFloat(localStorage.getItem('rs_ref_earn')) || 0.00;

        let userDepositHistory = JSON.parse(localStorage.getItem('rs_deposit_history')) || [];
        let userWithdrawHistory = JSON.parse(localStorage.getItem('rs_withdraw_history')) || [];
        let purchasedPackages = JSON.parse(localStorage.getItem('rs_purchased_packages')) || {};

        let microJobsList = [];

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
                        color: "#38bdf8",
                        desc: t.description || "সার্ভার থেকে প্রাপ্ত টাস্ক বিবরণী। নির্দেশিকা অনুযায়ী কাজ সম্পন্ন করুন।",
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
                {id: 1, title: "MicroTask #1: YouTube Channel Subscribe & Watch", reward: 50, icon: "▶️", color: "#FF0000", desc: "১. দেওয়া লিংকে ক্লিক করে ইউটিউব চ্যানেল সাবস্ক্রাইব করুন।\n২. ভিডিওটি সম্পূর্ণ দেখে একটি লাইক দিন।\n৩. আপনার ইউটিউব ইউজারনেম প্রুফ হিসেবে নিচে লিখুন।", link: "https://youtube.com/@SproutGigsTaskOfficial"},
                {id: 2, title: "MicroTask #2: Facebook Page Like & Follow", reward: 40, icon: "📘", color: "#1877F2", desc: "১. ফেসবুক পেজে প্রবেশ করে লাইক ও ফলো করুন।\n২. আপনার ফেসবুক প্রোফাইল লিংক বা নাম প্রুফ দিন।", link: "https://facebook.com/SproutGigsOfficialTask"}
            ];
        }

        let selectedActiveTask = null;

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
                                <h4>\${t.title} <span style="color: var(--accent-gold); font-size: 10px;">+\${t.reward} RS</span></h4>
                                <p>মাইক্রো জবস টাস্ক</p>
                            </div>
                        </div>
                        <button type="button" class="tr-btn" onclick="openTaskDetails('\${t.id}')">কাজ করুন</button>
                    </div>
                \`;
            });
            container.innerHTML = html;
        }

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
            if(!proofText) {
                alert('⚠️ দয়া করে কাজের প্রমাণ (Proof) বক্সে আপনার তথ্য বা ইউজারনেম লিখুন।');
                return;
            }

            if(selectedActiveTask) {
                userBalance += selectedActiveTask.reward;
                todayEarnAmount += selectedActiveTask.reward;
                totalTransactionsCount += 1;
                updateAccountStatsUI();
                alert(\`🎉 অভিনন্দন! আপনার টাস্কের প্রুফ সফলভাবে জমা হয়েছে এবং অ্যাকাউন্টে +\${selectedActiveTask.reward} ৳ যোগ হয়েছে!\`);
                closeModal('taskDetailModal');
            }
        }

        function claimDailyTask() {
            let lastClaimTime = parseInt(localStorage.getItem('rs_last_daily_claim')) || 0;
            let currentTime = new Date().getTime();
            let twentyFourHours = 24 * 60 * 60 * 1000;

            if (currentTime - lastClaimTime < twentyFourHours) {
                let remainingTime = twentyFourHours - (currentTime - lastClaimTime);
                let hoursLeft = Math.floor(remainingTime / (1000 * 60 * 60));
                let minutesLeft = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
                alert(\`⏳ আপনি আজ ইতিমধ্যেই ডেইলি টাস্ক ক্লেইম করেছেন! পরবর্তী ক্লেইমের জন্য আরও \${hoursLeft} ঘণ্টা \${minutesLeft} মিনিট অপেক্ষা করুন।\`);
                return;
            }

            let rewardAmt = 30;
            userBalance += rewardAmt;
            todayEarnAmount += rewardAmt;
            totalTransactionsCount += 1;
            
            localStorage.setItem('rs_last_daily_claim', currentTime);
            updateAccountStatsUI();
            updateDailyTaskStatusUI();
            alert(\`🎉 সফল! ডেইলি টাস্ক থেকে +\${rewardAmt} টাকা আপনার অ্যাকাউন্টে যোগ হয়েছে।\`);
        }

        function updateDailyTaskStatusUI() {
            let lastClaimTime = parseInt(localStorage.getItem('rs_last_daily_claim')) || 0;
            let currentTime = new Date().getTime();
            let twentyFourHours = 24 * 60 * 60 * 1000;
            const subLabel = document.getElementById('dailyTaskSubLabel');
            if(!subLabel) return;

            if (currentTime - lastClaimTime < twentyFourHours) {
                subLabel.innerText = "২৪ ঘণ্টায় একবার (claimed)";
                subLabel.style.color = "var(--accent-gold)";
            } else {
                subLabel.innerText = "এখন ক্লেইম করুন";
                subLabel.style.color = "var(--accent-green)";
            }
        }

        const agentNames = ["মাহিয়া", "জান্নাত", "ফাতেমা", "সাবিহা", "নুসরাত"];
        let currentAgentIndex = 0;
        setInterval(() => {
            currentAgentIndex = (currentAgentIndex + 1) % agentNames.length;
            const agentEl = document.getElementById('supportAgentNameDisplay');
            if(agentEl) agentEl.innerText = agentNames[currentAgentIndex];
        }, 180000);

        function saveAllState() {
            localStorage.setItem('rs_username', currentUserName);
            localStorage.setItem('rs_phone', currentUserPhone);
            localStorage.setItem('rs_avatar', currentUserAvatar);
            localStorage.setItem('rs_balance', userBalance);
            localStorage.setItem('rs_coins', rsCoins);
            localStorage.setItem('rs_pending', pendingAmount);
            localStorage.setItem('rs_tx_count', totalTransactionsCount);
            localStorage.setItem('rs_today_earn', todayEarnAmount);
            localStorage.setItem('rs_ref_earn', referralEarnAmount);
            localStorage.setItem('rs_deposit_history', JSON.stringify(userDepositHistory));
            localStorage.setItem('rs_withdraw_history', JSON.stringify(userWithdrawHistory));
            localStorage.setItem('rs_purchased_packages', JSON.stringify(purchasedPackages));
        }

        function formatCoinNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'k';
            }
            return num.toFixed(0);
        }

        function updateAccountStatsUI() {
            document.getElementById('topBalanceDisplay').innerText = \`৳ \${userBalance.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`;
            document.getElementById('topRsDisplay').innerText = \`🪙 \${formatCoinNumber(rsCoins)} RS\`;
            document.getElementById('statPending').innerText = \`৳ \${pendingAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`;
            document.getElementById('statTransactions').innerText = totalTransactionsCount;
            document.getElementById('statTodayEarn').innerText = \`৳ \${todayEarnAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`;
            document.getElementById('statRefEarn').innerText = \`৳ \${referralEarnAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`;
            
            let displayName = (currentUserName || "Rakibul Islam");
            document.getElementById('headerName').innerText = displayName + " ✏️";
            document.getElementById('accScreenName').innerText = displayName;
            document.getElementById('accScreenUserPhone').innerText = "নম্বর: " + (currentUserPhone || "01700000000");

            const avatarBox = document.getElementById('headerAvatarBox');
            const accAvatarBox = document.getElementById('accScreenAvatar');
            if(currentUserAvatar) {
                avatarBox.innerHTML = \`<img src="\${currentUserAvatar}" alt="Avatar">\`;
                accAvatarBox.innerHTML = \`<img src="\${currentUserAvatar}" alt="Avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">\`;
            } else {
                let initials = displayName.slice(0, 2).toUpperCase();
                avatarBox.innerHTML = initials;
                accAvatarBox.innerHTML = initials;
            }

            renderPackagesUI();
            renderAdminLiveLists();
            updateDailyTaskStatusUI();
            saveAllState();
        }

        function renderPackagesUI() {
            const container = document.getElementById('packagesGridContainer');
            if(!container) return;

            const packagesList = [
                {id: 200, title: 'স্ট্যান্ডার্ড প্যাকেজ', price: 200, rate: '500 RS/মিঃ', tier: 'tier-1'},
                {id: 500, title: 'ব্রোঞ্জ প্যাকেজ', price: 500, rate: '1000 RS/মিঃ', tier: 'tier-2'},
                {id: 700, title: 'সিলভার প্যাকেজ', price: 700, rate: '1700 RS/মিঃ', tier: 'tier-3'},
                {id: 1000, title: 'গোল্ড প্যাকেজ', price: 1000, rate: '2500 RS/মিঃ', tier: 'tier-4'},
                {id: 1500, title: 'প্লাটিনাম প্যাকেজ', price: 1500, rate: '3500 RS/মিঃ', tier: 'tier-5'},
                {id: 2000, title: 'ডায়মন্ড প্যাকেজ', price: 2000, rate: '5000 RS/মিঃ', tier: 'tier-6'},
                {id: 2500, title: 'ভিআইপি প্যাকেজ', price: 2500, rate: '7000 RS/মিঃ', tier: 'tier-7'},
                {id: 3000, title: 'আল্টিমেট প্রিমিয়াম', price: 3000, rate: '10000 RS/মিঃ', tier: 'tier-8'}
            ];

            let html = '';
            packagesList.forEach(p => {
                let isPurchased = purchasedPackages[p.id];
                if (isPurchased) {
                    let now = new Date().getTime();
                    let timeLeft = isPurchased.expireTime - now;
                    if(timeLeft <= 0) {
                        delete purchasedPackages[p.id];
                        isPurchased = null;
                        saveAllState();
                    } else {
                        let daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                        let hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        html += \`
                            <div class="pkg-card \${p.tier}" style="border-color: var(--accent-green);">
                                <div>
                                    <div class="pkg-title">\${p.title}</div>
                                    <div class="pkg-price">৳ \${p.price}</div>
                                    <div class="pkg-rate">মাইন রেট: \${p.rate}</div>
                                </div>
                                <div class="pkg-active-status">
                                    <div style="font-weight:bold; font-size:11px;">প্যাকেজ আনলক হইছে!</div>
                                    <div style="font-size:9px; color:var(--text-main);">মেয়াদ: \${daysLeft} দিন \${hoursLeft} ঘণ্টা</div>
                                    <div style="font-size:10px; font-weight:bold; color:var(--accent-gold); margin-top:2px;">আর্নিং: \${formatCoinNumber(isPurchased.earnedCoins)} RS</div>
                                </div>
                            </div>
                        \`;
                        return;
                    }
                }

                html += \`
                    <div class="pkg-card \${p.tier}">
                        <div>
                            <div class="pkg-title">\${p.title}</div>
                            <div class="pkg-price">৳ \${p.price}</div>
                            <div class="pkg-rate">মাইন রেট: \${p.rate}</div>
                        </div>
                        <button type="button" class="pkg-btn" onclick="buyPackage(\${p.price})">আনলক করুন</button>
                    </div>
                \`;
            });
            container.innerHTML = html;
        }

        function buyPackage(price) {
            if(userBalance < price) {
                document.getElementById('pkgPopupMsg').innerText = \`⚠️ আপনার পর্যাপ্ত ব্যালেন্স নেই। প্যাকেজটি কিনতে ৳\${price} ডিপোজিট করুন।\`;
                openModal('pkgDepositPopupModal');
                document.getElementById('depositInputAmt').value = price;
                return;
            }
            userBalance -= price;
            totalTransactionsCount += 1;
            let expireTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
            purchasedPackages[price] = { expireTime: expireTime, earnedCoins: 0 };
            updateAccountStatsUI();
            alert(\`🎉 অভিনন্দন! সফলভাবে ৳\${price} টাকার প্যাকেজটি আনলক হয়েছে!\`);
        }

        function switchTab(tabName, el) {
            document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            
            const targetView = document.getElementById(tabName + 'View');
            if(targetView) targetView.classList.add('active');
            if(el) el.classList.add('active');
        }

        function triggerPhotoUpload() { document.getElementById('globalPhotoInput').click(); }

        function handlePhotoUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentUserAvatar = e.target.result;
                    updateAccountStatsUI();
                    alert('প্রোফাইল ছবি সফলভাবে আপডেট ও সেভ হয়েছে!');
                }
                reader.readAsDataURL(file);
            }
        }

        function openEditProfileModal() {
            document.getElementById('editNameInput').value = currentUserName;
            openModal('editProfileModal');
        }

        function saveProfileChanges() {
            const newName = document.getElementById('editNameInput').value.trim();
            if(newName) currentUserName = newName;
            const fileInput = document.getElementById('modalPhotoInput');
            if(fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentUserAvatar = e.target.result;
                    updateAccountStatsUI();
                    closeModal('editProfileModal');
                    alert('প্রোফাইল সফলভাবে আপডেট ও সেভ করা হয়েছে!');
                }
                reader.readAsDataURL(fileInput.files[0]);
                return;
            }
            updateAccountStatsUI();
            closeModal('editProfileModal');
            alert('প্রোফাইল সফলভাবে আপডেট ও সেভ করা হয়েছে!');
        }

        function copyRefLink() {
            const input = document.getElementById('refLinkInput');
            input.select();
            navigator.clipboard.writeText(input.value);
            alert('রেফারেল লিংক সফলভাবে কপি করা হয়েছে!');
        }

        function copyDepositNumber() {
            const num = document.getElementById('depositSendNumber').innerText;
            navigator.clipboard.writeText(num);
            alert('ডিপোজিট নম্বরটি সফলভাবে কপি করা হয়েছে: ' + num);
        }

        function setDepositAmt(val) {
            document.getElementById('depositInputAmt').value = val;
        }

        function setWithdrawAmt(val) {
            document.getElementById('withdrawInputAmt').value = val;
        }

        function checkInDaily() {
            userBalance += 10;
            todayEarnAmount += 10;
            totalTransactionsCount += 1;
            updateAccountStatsUI();
            alert('চেক-ইন সফল হয়েছে! +১০ টাকা আপনার অ্যাকাউন্টে যোগ হয়েছে।');
        }

        function openSupportPopup(type) {
            const titleEl = document.getElementById('supportPopupTitle');
            const descEl = document.getElementById('supportPopupDesc');
            if(type === 'deposit') {
                titleEl.innerText = "💳 ডিপোজিট সংক্রান্ত সমস্যা ও সমাধান";
                descEl.innerText = "১. ডিপোজিট সীমা ২০০ থেকে ৩০০০ টাকা।\n২. সঠিক TrxID ও শেষ ৩ ডিজিট প্রদান করুন।";
            } else if(type === 'withdraw') {
                titleEl.innerText = "🏦 উইথড্র সংক্রান্ত সমস্যা ও সমাধান";
                descEl.innerText = "১. উইথড্র সীমা ৩০০ থেকে ৫০০০ টাকা।\n২. অ্যাকাউন্টে নির্দিষ্ট পরিমাণের বেশি ব্যালেন্স থাকতে হবে।";
            } else if(type === 'bonus') {
                titleEl.innerText = "🎁 বোনাস সংক্রান্ত তথ্য";
                descEl.innerText = "১. রেফারেল ইনস্ট্যান্ট ১০০ কয়েন ও আজীবন ৩% কমিশন।";
            } else if(type === 'task') {
                titleEl.innerText = "📋 ডেইলি টাস্ক গাইডলাইন";
                descEl.innerText = "১. ২৪ ঘণ্টায় একবার ডেইলি টাস্ক ক্লেইম করা যায়।";
            }
            openModal('supportPopupModal');
        }

        function sendSupportMsg() {
            const txt = document.getElementById('supportInput').value.trim();
            if(!txt) { alert('দয়া করে আপনার সমস্যাটি লিখুন।'); return; }
            
            const chatContainer = document.getElementById('chatBoxContainer');
            const userMsgDiv = document.createElement('div');
            userMsgDiv.className = 'chat-msg user';
            userMsgDiv.innerText = txt;
            chatContainer.appendChild(userMsgDiv);
            document.getElementById('supportInput').value = '';
            chatContainer.scrollTop = chatContainer.scrollHeight;

            setTimeout(() => {
                const supportMsgDiv = document.createElement('div');
                supportMsgDiv.className = 'chat-msg support';
                supportMsgDiv.innerText = "আমাদের এই মুহূর্তে কাস্টমার কেয়ারে অনেক পরিমাণ কাস্টমানের চাপ আছে। আপনারা কিছুক্ষণ পরে আবার মেসেজ করুন।";
                chatContainer.appendChild(supportMsgDiv);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 1000);
        }

        function openModal(id) { document.getElementById(id).style.display = 'flex'; }
        function closeModal(id) { document.getElementById(id).style.display = 'none'; }

        function promptAdminLogin() {
            let pass = prompt("গোপন এডমিন পাসওয়ার্ড দিন:");
            if(pass === "mdrana321") {
                openModal('adminPanelModal');
                let savedNote = localStorage.getItem('rs_admin_note') || "";
                document.getElementById('adminNotebook').value = savedNote;
                renderAdminLiveLists();
            } else if(pass !== null) {
                alert("❌ ভুল পাসওয়ার্ড!");
            }
        }

        function saveAdminNote() {
            let note = document.getElementById('adminNotebook').value;
            localStorage.setItem('rs_admin_note', note);
            alert("✅ এডমিন নোট সফলভাবে সেভ করা হয়েছে!");
        }

        function isValidTrxId(trx) {
            if (!trx || trx.length < 4) return false;
            if (/^\\d+$/.test(trx)) return false;
            return true;
        }

        function submitDeposit() {
            const method = document.getElementById('depositMethodSelect').value;
            const amt = parseFloat(document.getElementById('depositInputAmt').value);
            const trx = document.getElementById('depositTrxId').value.trim();
            const last3 = document.getElementById('depositLast3Digits').value.trim();
            
            if(isNaN(amt) || amt < 200 || amt > 3000) { alert('⚠️ ডিপোজিট সীমা ২০০ টাকা থেকে ৩০০০ টাকার মধ্যে হতে হবে।'); return; }
            if(!isValidTrxId(trx)) { alert('❌ ভুল TrxID!'); return; }
            if(!last3 || last3.length !== 3 || !/^\\d+$/.test(last3)) { alert('❌ পেমেন্ট নাম্বারের সঠিক শেষ ৩ ডিজিট প্রদান করা বাধ্যতামূলক!'); return; }

            pendingAmount += amt;
            totalTransactionsCount += 1;

            const newTx = { method, amt, trx, last3, status: 'Pending', time: 'Just now', user: currentUserName };
            userDepositHistory.unshift(newTx);
            updateAccountStatsUI();
            renderHistoryLists();
            renderAdminLiveLists();

            alert(\`✅ সফল! \${method} মাধ্যমে ৳\${amt} ডিপোজিট রিকোয়েস্ট (শেষ ৩ ডিজিট: \${last3}) পেন্ডিং আছে।\`);
            closeModal('depositModal');
            document.getElementById('depositInputAmt').value = '';
            document.getElementById('depositTrxId').value = '';
            document.getElementById('depositLast3Digits').value = '';
        }

        function submitWithdraw() {
            const method = document.getElementById('withdrawMethodSelect').value;
            const amt = parseFloat(document.getElementById('withdrawInputAmt').value);
            const phone = document.getElementById('withdrawPhone').value.trim();

            if(isNaN(amt) || amt < 300 || amt > 5000) { alert('⚠️ উইথড্র সীমা ৩০০ টাকা থেকে ৫০০০ টাকার মধ্যে হতে হবে।'); return; }
            if(amt > userBalance) { alert('❌ অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!'); return; }
            if(!phone || phone.length !== 11 || !/^\\d+$/.test(phone)) { alert('❌ সঠিক ১১ ডিজিটের নম্বর দিন।'); return; }

            userBalance -= amt;
            pendingAmount += amt;
            totalTransactionsCount += 1;

            const newWd = { method, amt, phone, status: 'Pending', time: 'Just now', user: currentUserName };
            userWithdrawHistory.unshift(newWd);
            updateAccountStatsUI();
            renderHistoryLists();
            renderAdminLiveLists();

            alert(\`✅ উইথড্র রিকোয়েস্ট সফল! \${method}-এর মাধ্যমে ৳\${amt} পেন্ডিং আছে।\`);
            closeModal('withdrawModal');
            document.getElementById('withdrawInputAmt').value = '';
            document.getElementById('withdrawPhone').value = '';
        }

        function renderAdminLiveLists() {
            const depListEl = document.getElementById('adminDepositLiveList');
            const wdListEl = document.getElementById('adminWithdrawLiveList');
            if(!depListEl || !wdListEl) return;

            let pendingDeps = userDepositHistory.filter(d => d.status === 'Pending');
            let successDepsCount = userDepositHistory.filter(d => d.status === 'Success').length;
            let successWdsCount = userWithdrawHistory.filter(w => w.status === 'Success').length;
            
            document.getElementById('adminStatPendingCount').innerText = (pendingDeps.length + userWithdrawHistory.filter(w => w.status === 'Pending').length) + ' টি';
            document.getElementById('adminStatSuccessCount').innerText = (successDepsCount + successWdsCount) + ' টি';
            document.getElementById('adminStatTodayEarn').innerText = \`৳ \${todayEarnAmount}\`;

            if(pendingDeps.length === 0) {
                depListEl.innerHTML = '<p style="font-size: 10px; color: var(--text-muted); text-align: center;">কোনো পেন্ডিং ডিপোজিট নেই</p>';
            } else {
                let html = '';
                pendingDeps.forEach((d, idx) => {
                    html += \`
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; background: rgba(30,41,59,0.7); padding: 6px 8px; border-radius: 8px; margin-bottom: 6px;">
                            <span style="color:var(--text-main);">\${d.user} [\${d.method}]: ৳\${d.amt} [Trx: \${d.trx}] <b style="color:var(--accent-gold);">[3Digit: \${d.last3}]</b></span>
                            <div style="display:flex; gap:4px;">
                                <button type="button" class="tr-btn" style="padding: 3px 6px; font-size: 9px;" onclick="navigator.clipboard.writeText('\${d.trx}'); alert('কপি হয়েছে');">কপি</button>
                                <button type="button" class="tr-btn" style="padding: 3px 6px; font-size: 9px; background: var(--accent-green); color:#fff;" onclick="approveDeposit(\${idx})">সাবমিট</button>
                            </div>
                        </div>
                    \`;
                });
                depListEl.innerHTML = html;
            }

            let pendingWds = userWithdrawHistory.filter(w => w.status === 'Pending');
            if(pendingWds.length === 0) {
                wdListEl.innerHTML = '<p style="font-size: 10px; color: var(--text-muted); text-align: center;">কোনো পেন্ডিং উইথড্র নেই</p>';
            } else {
                let html = '';
                pendingWds.forEach((w, idx) => {
                    html += \`
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; background: rgba(30,41,59,0.7); padding: 6px 8px; border-radius: 8px; margin-bottom: 6px;">
                            <span style="color:var(--text-main);">\${w.user}: ৳\${w.amt} [Ph: \${w.phone}]</span>
                            <div style="display:flex; gap:4px;">
                                <button type="button" class="tr-btn" style="padding: 3px 6px; font-size: 9px;" onclick="navigator.clipboard.writeText('\${w.phone}'); alert('কপি হয়েছে');">কপি</button>
                                <button type="button" class="tr-btn" style="padding: 3px 6px; font-size: 9px; background: var(--accent-green); color:#fff;" onclick="approveWithdraw(\${idx})">সাবমিট</button>
                            </div>
                        </div>
                    \`;
                });
                wdListEl.innerHTML = html;
            }
        }

        function approveDeposit(idx) {
            let pendingDeps = userDepositHistory.filter(d => d.status === 'Pending');
            let item = pendingDeps[idx];
            if(item) {
                item.status = 'Success';
                userBalance += item.amt;
                pendingAmount -= item.amt;
                if(pendingAmount < 0) pendingAmount = 0;
                updateAccountStatsUI();
                renderHistoryLists();
                renderAdminLiveLists();
                alert('✅ ডিপোজিট সফলভাবে সাবমিট ও ইউজারের অ্যাকাউন্টে যোগ হয়েছে!');
            }
        }

        function approveWithdraw(idx) {
            let pendingWds = userWithdrawHistory.filter(w => w.status === 'Pending');
            let item = pendingWds[idx];
            if(item) {
                item.status = 'Success';
                pendingAmount -= item.amt;
                if(pendingAmount < 0) pendingAmount = 0;
                updateAccountStatsUI();
                renderHistoryLists();
                renderAdminLiveLists();
                alert('✅ উইথড্র সফলভাবে সাবমিট হয়েছে!');
            }
        }

        function verifyAdminTransaction() {
            let val = document.getElementById('adminUserSearch').value.trim();
            if(!val) { alert('দয়া করে নম্বর বা TrxID দিন।'); return; }
            alert(\`✅ সফল! "\${val}" ভেরিফাই ও কনফার্ম করা হয়েছে।\`);
            document.getElementById('adminUserSearch').value = '';
        }

        function renderHistoryLists() {
            const depContent = document.getElementById('depositHistoryPopupContent');
            if(userDepositHistory.length === 0) {
                depContent.innerHTML = '<p style="font-size: 11px; color: var(--text-muted); text-align: center;">কোনো ডিপোজিট হিস্ট্রি নেই</p>';
            } else {
                let html = '';
                userDepositHistory.forEach(item => {
                    html += \`<div class="ticker-item"><span class="t-dep">📥 (\${item.method}): +৳ \${item.amt.toLocaleString()} [3D: \${item.last3}]</span><span style="font-size:9px; color:var(--accent-gold);">\${item.status}</span></div>\`;
                });
                depContent.innerHTML = html;
            }

            const wdContent = document.getElementById('withdrawHistoryPopupContent');
            if(userWithdrawHistory.length === 0) {
                wdContent.innerHTML = '<p style="font-size: 11px; color: var(--text-muted); text-align: center;">কোনো উইথড্র হিস্ট্রি নেই</p>';
            } else {
                let html = '';
                userWithdrawHistory.forEach(item => {
                    html += \`<div class="ticker-item"><span class="t-wd">📤 (\${item.method}): -৳ \${item.amt.toLocaleString()}</span><span style="font-size:9px; color:var(--accent-gold);">\${item.status}</span></div>\`;
                });
                wdContent.innerHTML = html;
            }
        }

        setInterval(() => {
            let totalRate = 0;
            for(let pPrice in purchasedPackages) {
                let pData = purchasedPackages[pPrice];
                let rate = parseInt(pPrice) >= 3000 ? 1000 : (parseInt(pPrice) >= 2000 ? 500 : 200);
                pData.earnedCoins += rate;
                rsCoins += rate;
                totalRate += rate;
            }
            if(totalRate > 0) updateAccountStatsUI();
        }, 60000);

        const maleNames = ["Alexander", "Benjamin", "Christopher", "Daniel", "Ethan", "Felix", "Gabriel", "Harrison", "Ian", "Julian", "Kevin", "Liam", "Mason", "Nathan", "Oliver", "Patrick", "Quentin", "Ryan", "Samuel", "Tristan"];
        const femaleNames = ["Sophia", "Emma", "Olivia", "Ava", "Isabella", "Mia", "Harper", "Evelyn", "Abigail", "Emily", "Elizabeth", "Sofia", "Avery", "Ella", "Scarlett", "Grace", "Chloe", "Victoria", "Aria", "Luna"];
        
        let usersData = [];
        for(let i = 1; i <= 100; i++) {
            let isFemale = i % 2 === 0;
            let nameList = isFemale ? femaleNames : maleNames;
            let fName = nameList[i % nameList.length];
            let lName = ["Smith", "Johnson", "Brown", "Taylor", "Miller", "Wilson", "Moore", "Clark", "Hall"][i % 9];
            let fullName = \`\${fName} \${lName}\`;
            let score = 50000 - (i * 350) + Math.floor(Math.random() * 200);
            let rsCoinEarned = Math.floor(Math.random() * 5000) + 500;
            let avatarUrl = \`https://i.pravatar.cc/100?img=\${(i % 70) + 1}\`;
            usersData.push({ rank: i, name: fullName, score: score, rsCoins: rsCoinEarned, avatar: avatarUrl });
        }

        function renderLeaderboard() {
            usersData.forEach((u, index) => {
                u.score += Math.floor(Math.random() * 30) - 10;
                if(index < 10) {
                    u.rsCoins += Math.floor(Math.random() * 20) + 5;
                } else {
                    u.rsCoins += Math.floor(Math.random() * 10) - 4;
                    if(u.rsCoins < 0) u.rsCoins = 0;
                }
            });
            usersData.sort((a, b) => b.score - a.score);
            usersData.forEach((u, index) => u.rank = index + 1);

            let top3HTML = '';
            top3HTML += \`
                <div class="podium-col" style="border-color: #3b82f6;">
                    <div class="crown">👑</div>
                    <div class="p-ava" style="border-color: #3b82f6;"><img src="\${usersData[1].avatar}" alt="2"></div>
                    <h5 style="font-size: 11px;">\${usersData[1].name}</h5>
                    <p style="font-size: 9px; color: var(--accent-green);">৳ \${usersData[1].score.toLocaleString()}</p>
                    <p style="font-size: 8px; color: var(--accent-gold);">🪙 \${formatCoinNumber(usersData[1].rsCoins)} RS</p>
                    <span style="font-size: 9px; background: #3b82f6; padding: 1px 6px; border-radius: 8px; margin-top: 4px; display: inline-block;">#২</span>
                </div>
            \`;
            top3HTML += \`
                <div class="podium-col rank-1">
                    <div class="crown" style="font-size: 24px;">👑</div>
                    <div class="p-ava" style="border-color: var(--accent-gold); box-shadow: 0 0 15px var(--accent-gold);"><img src="\${usersData[0].avatar}" alt="1"></div>
                    <h5 style="font-size: 12px; color: var(--accent-gold); font-weight: bold;">\${usersData[0].name}</h5>
                    <p style="font-size: 10px; color: var(--accent-green);">৳ \${usersData[0].score.toLocaleString()}</p>
                    <p style="font-size: 9px; color: var(--accent-gold);">🪙 \${formatCoinNumber(usersData[0].rsCoins)} RS</p>
                    <span style="font-size: 9px; background: var(--accent-gold); color: #000; padding: 1px 6px; border-radius: 8px; margin-top: 4px; display: inline-block; font-weight: bold;">#১</span>
                </div>
            \`;
            top3HTML += \`
                <div class="podium-col" style="border-color: #b45309;">
                    <div class="crown">👑</div>
                    <div class="p-ava" style="border-color: #b45309;"><img src="\${usersData[2].avatar}" alt="3"></div>
                    <h5 style="font-size: 11px;">\${usersData[2].name}</h5>
                    <p style="font-size: 9px; color: var(--accent-green);">৳ \${usersData[2].score.toLocaleString()}</p>
                    <p style="font-size: 8px; color: var(--accent-gold);">🪙 \${formatCoinNumber(usersData[2].rsCoins)} RS</p>
                    <span style="font-size: 9px; background: #b45309; padding: 1px 6px; border-radius: 8px; margin-top: 4px; display: inline-block;">#৩</span>
                </div>
            \`;
            document.getElementById('podiumTop3Container').innerHTML = top3HTML;

            let remainingHTML = '';
            for(let i = 3; i < usersData.length; i++) {
                let u = usersData[i];
                remainingHTML += \`
                    <div class="transaction-row">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 11px; font-weight: bold; color: var(--accent-blue);">#\${u.rank}</span>
                            <img src="\${u.avatar}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">
                            <div>
                                <span style="font-size: 12px; display: block;">\${u.name}</span>
                                <span style="font-size: 9px; color: var(--accent-gold);">🪙 \${formatCoinNumber(u.rsCoins)} RS Collected</span>
                            </div>
                        </div>
                        <span style="font-size: 12px; color: var(--accent-green); font-weight: bold;">৳ \${u.score.toLocaleString()}</span>
                    </div>
                \`;
            }
            document.getElementById('rankingListContainer').innerHTML = remainingHTML;
        }

        renderLeaderboard();
        setInterval(renderLeaderboard, 4000);
    </script>
</body>
</html>`);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
