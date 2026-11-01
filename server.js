const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 10000;

const SECRET = process.env.SECRET || crypto.randomBytes(32).toString('hex');
const ADMIN_PASS = process.env.ADMIN_PASSWORD || '';
const GID = process.env.GOOGLE_CLIENT_ID || '';

const ADGEM_APP_ID = process.env.ADGEM_APP_ID || '';
const ADGEM_POSTBACK_KEY = process.env.ADGEM_POSTBACK_KEY || '';

const CPAGRIP_USER_ID = process.env.CPAGRIP_USER_ID || '';
const CPAGRIP_KEY = process.env.CPAGRIP_KEY || '';
const CPAGRIP_FEED_URL = process.env.CPAGRIP_FEED_URL || '';

const RATE = Number(process.env.BDT_PER_USD) || 120;

const TW_SECRET = process.env.TIMEWALL_SECRET || '';
const TW_RATE = Number(process.env.TIMEWALL_RATE) || 65;
const TW_URL = process.env.TIMEWALL_URL || '';
const TW_IP_CHECK = false;
const TW_IPS = ['18.156.132.55', '51.81.120.73', '142.111.248.18'];

const MIN_AGE = 18;
const CO = {
  n: 'RS Growth Matrix', e: 'omg218063@gmail.com', p: '01764024069', y: 2026,
  tg: 'rkrana33', wa: '8801764024069', fb: 'https://www.facebook.com/share/1CAK8sYqDw/', age: MIN_AGE,
  d: 'RS Growth Matrix একটি টাস্কভিত্তিক রিওয়ার্ড প্ল্যাটফর্ম। এখানে সহজ টাস্ক, দৈনিক বোনাস, অ্যাড দেখে ইনকাম ও লাকি ড্রয়ের মাধ্যমে ব্যালেন্স জমিয়ে bKash বা Nagad-এ উত্তোলন করা যায়। এছাড়া আমাদের কোলাবোরেশন পার্টনার আর এস গ্যালারি শপ (RS Gallery Shop) থেকে আপনার জমানো ইনকামের টাকা দিয়ে খুব সহজেই দেশি-বিদেশি আকর্ষণীয় কাপড়চোপড় ও ফ্যাশন আইটেম কেনাকাটা করতে পারবেন।'
