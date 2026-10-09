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
        .auth-logo-img {
            width: 90px; height: 90px; border-radius: 50%; border: 2px solid var(--accent-gold);
            object-fit: cover; box-shadow: 0 0 20px rgba(251,191,36,0.5); margin-bottom: 8px; margin-top: 10px;
        }
        .auth-logo-title {
            font-size: 20px; font-weight: bold; color: var(--accent-gold);
            text-shadow: 0 0 15px rgba(251,191,36,0.4); margin-bottom: 2px;
        }
        .auth-subtitle {
            font-size: 10px; color: var(--text-muted); margin-bottom: 12px;
        }
        
        .auth-box-card {
            background: rgba(15, 23, 42, 0.85);
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

        .gmail-connect-btn {
            background: #ffffff; color: #1e293b; border: none; width: 100%; padding: 8px; border-radius: 10px;
            font-size: 11px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px;
            box-shadow: 0 4px 10px rgba(255,255,255,0.2); transition: 0.2s;
        }
        .gmail-connect-btn:hover { background: #f1f5f9; }

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
        .pkg-card.tier-1 { border: 2px solid #64748b; }
        .pkg-card.tier-2 { border: 2px solid #38bdf8; }
        .pkg-card.tier-3 { border: 2px solid #818cf8; }
        .pkg-card.tier-4 { border: 2px solid #a855f7; }
        .pkg-card.tier-5 { border: 2px solid #f472b6; }
        .pkg-card.tier-6 { border: 2px solid #fbbf24; }
        .pkg-card.tier-7 { border: 2px solid #f97316; }
        .pkg-card.tier-8 { border: 2px solid #ef4444; background: linear-gradient(145deg, #2a1b22, #0f172a); }

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
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 6px; margin-bottom: 10px;
        }
        .popup-amt-btn {
            background: rgba(30, 41, 59, 0.8); border: 1px solid var(--card-border); border-radius: 8px;
            padding: 6px; text-align: center; font-size: 11px; font-weight: bold; color: var(--accent-gold); cursor: pointer;
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
        .ticker-list { display: flex; flex-direction: column; gap: 8px; animation: scrollTicker 4s linear infinite; }
        @keyframes scrollTicker {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }
        .ticker-item {
            font-size: 11px; padding: 6px 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.6); display: flex; justify-content: space-between; align-items: center;
        }
        .t-dep { color: var(--accent-green); font-weight: 500; }
        .t-wd { color: #ef4444; font-weight: 500; }
        .t-ref { color: var(--accent-purple); font-weight: 500; }

        .acc-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 15px; text-align: center; }
        .acc-stat-card { background: rgba(30, 41, 59, 0.5); border: 1px solid var(--card-border); border-radius: 12px; padding: 10px 4px; }
        
        .transaction-row {
            background: rgba(30, 41, 59, 0.4); border: 1px solid var(--card-border); border-radius: 12px;
            padding: 10px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;
        }

        .top-nav {
            display: flex; justify-content: space-around; background: linear-gradient(180deg, #131d38, #0f172a);
            border-bottom: 1px solid rgba(56, 189, 248, 0.2); padding: 8px 4px; flex-shrink: 0; z-index: 100;
        }
        .nav-item { text-align: center; color: var(--text-muted); font-size: 10px; cursor: pointer; flex: 1; transition: 0.3s; }
        .nav-item div { font-size: 16px; margin-bottom: 2px; }
        .nav-item.active { color: var(--accent-gold); text-shadow: 0 0 12px rgba(251, 191, 36, 0.6); }

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
            background: linear-gradient(90deg, #a855f7, #6366f1); color: white; border: none; padding: 6px 12px; border-radius: 12px;
            font-size: 10px; font-weight: bold; cursor: pointer; margin-top: 8px; width: 100%;
        }
        .admin-dashboard-container {
            background: linear-gradient(145deg, #0f172a, #060913); border: 2px solid var(--accent-gold); border-radius: 18px; padding: 16px;
        }
        .admin-stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 14px; }
        .admin-stat-box { background: rgba(30, 41, 59, 0.9); border: 1px solid var(--card-border); border-radius: 14px; padding: 12px; text-align: center; }
        .admin-live-list-box { background: rgba(6, 9, 19, 0.9); border: 1px solid var(--card-border); border-radius: 12px; padding: 10px; max-height: 140px; overflow-y: auto; margin-top: 8px; margin-bottom: 14px; }
    </style>
</head>
<body>

    <!-- Authentication Screen with Official RS Logo -->
    <div id="authScreen" style="display: flex;">
        <img src="https://i.ibb.co/3s63L07/1041.png" alt="RS Growth Matrix Logo" class="auth-logo-img">
        <div class="auth-logo-title">RS Growth Matrix</div>
        <div class="auth-subtitle">নিরাপদ আর্নিং ও মাইনিং প্ল্যাটফর্ম ২০২৬</div>
        
        <div class="auth-box-card">
            <div class="auth-switch-tab">
                <div class="ast-btn active" id="tabRegBtn" onclick="switchAuthMode('reg')">রেজিস্ট্রেশন</div>
                <div class="ast-btn" id="tabLoginBtn" onclick="switchAuthMode('login')">লগইন</div>
            </div>

            <!-- Registration Form Section -->
            <div id="registrationFormSection">
                <button class="gmail-connect-btn" onclick="handleGmailConnect()">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.2 8.9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.8-2.5 1.3-4.3 1.3-3.1 0-5.8-2.2-6.7-5.3L1.6 15.9C3.5 19.7 7.4 23 12 23z"/></svg>
                    জিমেইল দিয়ে এক ক্লিকে কানেক্ট করুন
                </button>
                <div style="text-align: center; font-size: 9px; color: var(--text-muted); margin: 6px 0;">অথবা ম্যানুয়াল ফর্ম পূরণ করুন</div>

                <div class="auth-form-group">
                    <label>ইউজারনেম (নাম + সংখ্যা, যেমন: Saji78):</label>
                    <input type="text" id="regUsername" class="form-control" placeholder="আপনার ইউজারনেম">
                </div>
                <div class="auth-form-group">
                    <label>মোবাইল নম্বর (১১ ডিজিট):</label>
                    <input type="text" id="regPhone" class="form-control" placeholder="017xxxxxxxx" maxlength="11">
                </div>
                <div class="auth-form-group">
                    <label>পাসওয়ার্ড:</label>
                    <input type="password" id="regPass" class="form-control" placeholder="পাসওয়ার্ড দিন">
                </div>
                <div class="auth-form-group">
                    <label>কনফার্ম পাসওয়ার্ড:</label>
                    <input type="password" id="regConfirmPass" class="form-control" placeholder="পুনরায় পাসওয়ার্ড দিন">
                </div>
                <div class="auth-form-group">
                    <label>ভেরিফিকেশন কোড: <b style="color:var(--accent-green);">9482</b></label>
                    <input type="text" id="regCaptcha" class="form-control" placeholder="কোডটি লিখুন">
                </div>
                <button class="banner-btn" style="width:100%; justify-content:center; margin-top:8px; background:var(--accent-green); color:#fff;" onclick="submitManualRegistration()">রেজিস্ট্রেশন কনফার্ম করুন</button>
            </div>

            <!-- Login Form Section -->
            <div id="loginFormSection" style="display: none;">
                <div class="auth-form-group">
                    <label>আপনার মোবাইল নম্বর:</label>
                    <input type="text" id="loginPhone" class="form-control" placeholder="017xxxxxxxx" maxlength="11">
                </div>
                <div class="auth-form-group">
                    <label>আপনার পাসওয়ার্ড:</label>
                    <input type="password" id="loginPass" class="form-control" placeholder="পাসওয়ার্ড দিন">
                </div>
                <button class="banner-btn" style="width:100%; justify-content:center; margin-top:10px; background:var(--accent-gold); color:#000;" onclick="submitUserLogin()">লগইন করুন</button>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="top-user-bar">
            <div class="user-left">
                <div class="user-avatar-container">
                    <div class="user-avatar">
                        <img id="headerAvatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" alt="Avatar">
                    </div>
                    <div class="plus-upload-icon" onclick="triggerPhotoUpload()">+</div>
                    <input type="file" id="globalPhotoInput" style="display: none;" accept="image/*" onchange="handlePhotoUpload(event)">
                </div>
                <div class="user-info">
                    <h3 id="headerName" onclick="openEditProfileModal()">Rakibul Islam ✏️</h3>
                    <p>👑 VIP Member <span style="background:var(--accent-green); color:white; font-size:8px; padding:1px 4px; border-radius:4px;">Verified ✓</span></p>
                </div>
            </div>
            <div class="balance-pill">
                <div class="b-val" id="topBalanceDisplay">৳ ২৫.০০</div>
                <div class="rs-val" id="topRsDisplay">🪙 0.00 RS</div>
                <div class="b-lbl">Balance / RS Coin</div>
            </div>
        </div>

        <div class="top-nav">
            <div class="nav-item active" onclick="switchTab('home', this)"><div>🏠</div>হোম</div>
            <div class="nav-item" onclick="switchTab('packages', this)"><div>💎</div>প্যাকেজ</div>
            <div class="nav-item" onclick="switchTab('tasks', this)"><div>📋</div>টাস্ক</div>
            <div class="nav-item" onclick="switchTab('ranking', this)"><div>🏆</div>র‍্যাঙ্কিং</div>
            <div class="nav-item" onclick="switchTab('support', this)"><div>💬</div>সাপোর্ট</div>
            <div class="nav-item" onclick="switchTab('referral', this)"><div>👥</div>রেফার</div>
            <div class="nav-item" onclick="switchTab('account', this)"><div>👤</div>অ্যাকাউন্ট</div>
        </div>

        <div class="marquee-container">
            <marquee behavior="scroll" direction="left" scrollamount="4">
                📢 RS Growth Matrix-এ স্বাগতম! জিমেইল অথবা মোবাইল দিয়ে অ্যাকাউন্ট ভেরিফাই করুন এবং প্যাকেজ কিনে রিয়েল-টাইম RS কয়েন মাইন করুন।
            </marquee>
        </div>

        <div id="homeView" class="view-section active">
            <div class="banner-card">
                <h2>RS REWARDS CENTER</h2>
                <p>প্রতিদিন কাজ করুন, প্যাকেজ মাইন করুন আর আরও বেশি রিওয়ার্ড জিতুন!</p>
                <button class="banner-btn" onclick="switchTab('packages', document.querySelectorAll('.nav-item')[1])">🚀 প্যাকেজ দেখুন &rarr;</button>
            </div>
            <div class="section-heading"><span>⚡ আজকের কার্যক্রম</span></div>
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
        </div>

        <div id="packagesView" class="view-section">
            <div class="section-heading"><span>💎 এক্সক্লুসিভ মাইনিং প্যাকেজ</span></div>
            <div class="packages-grid-2x2" id="packagesGridContainer"></div>
        </div>

        <div id="tasksView" class="view-section">
            <div class="section-heading"><span>⚡ মাইক্রো জবস লাইভ টাস্ক</span></div>
            <div id="microJobsListContainer"></div>
        </div>

        <div id="rankingView" class="view-section">
            <div class="section-heading"><span>🏆 গ্লোবাল টপ র‍্যাঙ্কিং</span></div>
            <div class="podium-box" id="podiumTop3Container"></div>
            <div id="rankingListContainer"></div>
        </div>

        <div id="supportView" class="view-section">
            <div class="support-banner">
                <div style="font-size: 28px;">👩‍💼</div>
                <div>
                    <h4 style="font-size: 13px; font-weight: bold;">RS সাপোর্ট টিম</h4>
                    <p style="font-size: 10px; color: var(--text-muted);">সার্ভিস এজেন্ট: <span id="supportAgentNameDisplay" style="color: var(--accent-gold);">মাহিয়া</span> | ● অনলাইন</p>
                </div>
            </div>
            <div class="chat-box-area" id="chatBoxContainer">
                <div class="chat-msg support">হ্যালো! RS সাপোর্ট থেকে বলছি। আপনার যেকোনো সমস্যায় কথা বলুন।</div>
            </div>
            <div style="display: flex; gap: 6px; margin-top: 10px;">
                <input type="text" class="form-control" id="supportInput" placeholder="আপনার সমস্যা লিখুন..." style="margin-top:0;">
                <button class="banner-btn" onclick="sendSupportMsg()">প্রেরণ</button>
            </div>
        </div>

        <div id="referralView" class="view-section">
            <div class="ref-banner">
                <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">আজীবন ৩% কমিশন ও ১০০ আরএস কয়েন</h3>
                <p style="font-size: 11px; color: #cbd5e1;">আপনার কোম্পানির রেফারেল লিংক শেয়ার করুন:</p>
                <div class="ref-input-box">
                    <input type="text" id="refLinkInput" value="https://rs.taptoearn.app/ref/RS12345" readonly style="background:transparent; border:none; color:white; font-size:11px; width:100%; outline:none;">
                    <button class="tr-btn" onclick="copyRefLink()">কপি</button>
                </div>
            </div>
        </div>

        <div id="accountView" class="view-section">
            <div class="section-heading"><span>অ্যাকাউন্ট ওভারভিউ</span></div>
            <div class="update-card" style="align-items: center; background: rgba(30, 41, 59, 0.7);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img id="accScreenAvatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover;">
                    <div>
                        <h4 style="font-size: 13px;" id="accScreenName">Rakibul Islam</h4>
                        <p style="font-size: 10px; color: var(--accent-gold);" id="accScreenUserPhone">নম্বর: 01700000000</p>
                    </div>
                </div>
                <button class="tr-btn" onclick="openEditProfileModal()">এডিট</button>
            </div>
            <button class="admin-trigger-btn" onclick="promptAdminLogin()">🔐 এডমিন প্যানেল লগইন</button>
        </div>
    </div>

    <!-- Modals -->
    <div class="modal" id="adminPanelModal">
        <div class="modal-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="font-size: 14px; color: var(--accent-gold);">👑 RS RANA HASAN - ADMIN PANEL</h3>
                <span style="cursor: pointer; font-size: 20px;" onclick="closeModal('adminPanelModal')">&times;</span>
            </div>
            <div class="admin-dashboard-container">
                <div class="admin-stat-grid">
                    <div class="admin-stat-box"><div style="font-size: 10px; color: var(--text-muted);">পেন্ডিং</div><div style="font-size: 13px; font-weight: bold; color: var(--accent-gold);">০ টি</div></div>
                    <div class="admin-stat-box"><div style="font-size: 10px; color: var(--text-muted);">সাকসেস</div><div style="font-size: 13px; font-weight: bold; color: var(--accent-green);">০ টি</div></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentUserName = localStorage.getItem('rs_username') || "";
        let currentUserPhone = localStorage.getItem('rs_phone') || "";
        let currentUserAvatar = localStorage.getItem('rs_avatar') || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces";
        
        window.addEventListener('DOMContentLoaded', () => {
            if (!currentUserPhone) {
                document.getElementById('authScreen').style.display = 'flex';
            } else {
                document.getElementById('authScreen').style.display = 'none';
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

        function handleGmailConnect() {
            // Simulated Gmail Account Selector Popup simulation
            let emails = ["rs.rana.official@gmail.com", "rakibul.matrix@gmail.com", "growthmatrix2026@gmail.com"];
            let selectedEmail = prompt("আপনার জিমেইল অ্যাকাউন্ট সিলেক্ট করুন বা লিখুন:\\n1. " + emails[0] + "\\n2. " + emails[1] + "\\n(অথবা আপনার জিমেইল টাইপ করুন)", emails[0]);
            
            if(selectedEmail) {
                currentUserName = "Google User";
                currentUserPhone = "018" + Math.floor(10000000 + Math.random() * 90000000);
                
                localStorage.setItem('rs_username', currentUserName);
                localStorage.setItem('rs_phone', currentUserPhone);
                localStorage.setItem('rs_email', selectedEmail);

                document.getElementById('authScreen').style.display = 'none';
                updateAccountStatsUI();
                alert('✅ অ্যাকাউন্ট সফলভাবে ভেরিফাই ও জিমেইল কানেক্ট হয়েছে!');
            }
        }

        function submitManualRegistration() {
            let uname = document.getElementById('regUsername').value.trim();
            let phone = document.getElementById('regPhone').value.trim();
            let pass = document.getElementById('regPass').value.trim();
            let cpass = document.getElementById('regConfirmPass').value.trim();
            let captcha = document.getElementById('regCaptcha').value.trim();

            if (!uname || !phone || !pass || !cpass) {
                alert('⚠️ দয়া করে সব তথ্য পূরণ করুন।');
                return;
            }
            if (phone.length !== 11 || !/^\\d+$/.test(phone)) {
                alert('❌ সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন!');
                return;
            }
            if (pass !== cpass) {
                alert('❌ পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!');
                return;
            }
            if (captcha !== "9482") {
                alert('❌ ভেরিফিকেশন কোড ভুল হয়েছে!');
                return;
            }

            currentUserName = uname;
            currentUserPhone = phone;
            localStorage.setItem('rs_username', currentUserName);
            localStorage.setItem('rs_phone', currentUserPhone);
            localStorage.setItem('rs_password', pass);

            document.getElementById('authScreen').style.display = 'none';
            updateAccountStatsUI();
            alert('🎉 আপনার অ্যাকাউন্ট সাকসেসফুলি ভেরিফাই ও তৈরি হয়েছে!');
        }

        function submitUserLogin() {
            let phone = document.getElementById('loginPhone').value.trim();
            let pass = document.getElementById('loginPass').value.trim();

            if (!phone || !pass) {
                alert('⚠️ নম্বর এবং পাসওয়ার্ড দিন।');
                return;
            }

            let savedPhone = localStorage.getItem('rs_phone');
            let savedPass = localStorage.getItem('rs_password');

            if ((savedPhone && savedPhone === phone && savedPass === pass) || (phone.length === 11 && pass.length >= 4)) {
                currentUserPhone = phone;
                let storedName = localStorage.getItem('rs_username');
                if(storedName) currentUserName = storedName;
                else currentUserName = "User_" + phone.slice(-4);

                localStorage.setItem('rs_username', currentUserName);
                localStorage.setItem('rs_phone', currentUserPhone);

                document.getElementById('authScreen').style.display = 'none';
                updateAccountStatsUI();
                alert('✅ সফলভাবে লগইন হয়েছে!');
            } else {
                alert('❌ ভুল মোবাইল নম্বর বা পাসওয়ার্ড!');
            }
        }

        let userBalance = 25.00;
        let rsCoins = 0.00;

        function updateAccountStatsUI() {
            document.getElementById('topBalanceDisplay').innerText = \`৳ \${userBalance.toFixed(2)}\`;
            document.getElementById('topRsDisplay').innerText = \`🪙 \${rsCoins.toFixed(2)} RS\`;
            document.getElementById('headerName').innerText = (currentUserName || "Rakibul Islam") + " ✏️";
            document.getElementById('accScreenName').innerText = currentUserName || "Rakibul Islam";
            document.getElementById('accScreenUserPhone').innerText = "নম্বর: " + (currentUserPhone || "01700000000");
            document.getElementById('headerAvatar').src = currentUserAvatar;
            document.getElementById('accScreenAvatar').src = currentUserAvatar;
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
                    alert('প্রোফাইল ছবি আপডেট হয়েছে!');
                }
                reader.readAsDataURL(file);
            }
        }

        function copyRefLink() {
            navigator.clipboard.writeText(document.getElementById('refLinkInput').value);
            alert('কোম্পানির রেফারেল লিংক কপি করা হয়েছে!');
        }

        function openModal(id) { document.getElementById(id).style.display = 'flex'; }
        function closeModal(id) { document.getElementById(id).style.display = 'none'; }
        
        function promptAdminLogin() {
            let pass = prompt("এডমিন পাসওয়ার্ড দিন:");
            if(pass === "mdrana321") openModal('adminPanelModal');
            else if(pass !== null) alert("ভুল পাসওয়ার্ড!");
        }

        function sendSupportMsg() {
            let txt = document.getElementById('supportInput').value.trim();
            if(!txt) return;
            let chat = document.getElementById('chatBoxContainer');
            chat.innerHTML += \`<div class="chat-msg user">\${txt}</div>\`;
            document.getElementById('supportInput').value = '';
            chat.scrollTop = chat.scrollHeight;
            setTimeout(() => {
                chat.innerHTML += \`<div class="chat-msg support">আপনার মেসেজটি পেয়েছি, শীঘ্রই সমাধান করা হবে।</div>\`;
                chat.scrollTop = chat.scrollHeight;
            }, 1000);
        }

        function claimDailyTask() {
            userBalance += 30;
            updateAccountStatsUI();
            alert('🎉 ডেইলি টাস্ক থেকে +৩০ টাকা যোগ হয়েছে!');
        }
        function checkInDaily() {
            userBalance += 10;
            updateAccountStatsUI();
            alert('চেক-ইন সফল! +১০ টাকা যোগ হয়েছে।');
        }
    </script>
</body>
</html>`);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
