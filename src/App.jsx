import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, remove } from 'firebase/database';
import { getAuth, sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';

// ตั้งค่า Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD-dgpKK9S2olFLawJ8MKYHi-NWB4GQv7U",
  authDomain: "cyber-topup-game.firebaseapp.com",
  databaseURL: "https://cyber-topup-game-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cyber-topup-game",
  storageBucket: "cyber-topup-game.firebasestorage.app",
  messagingSenderId: "191687954752",
  appId: "1:191687954752:web:063d8ce34df50b182feaa5",
  measurementId: "G-2VQP0N3PVZ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// สไตล์ CSS สำหรับเอฟเฟคปุ่มทุกปุ่มและองค์ประกอบที่คลิกได้ในเว็บ (Hover & Active Effects)
const cyberGlobalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;600;700;800;900&display=swap');

  body, input, button, select, textarea {
    font-family: 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif !important;
  }

  button, 
  [role="button"], 
  input[type="submit"], 
  input[type="button"],
  .cyber-btn {
    position: relative;
    cursor: pointer !important;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    outline: none !important;
  }

  button:hover:not(:disabled),
  [role="button"]:hover,
  input[type="submit"]:hover,
  input[type="button"]:hover,
  .cyber-btn:hover {
    transform: translateY(-3px) scale(1.025) !important;
    filter: brightness(1.08) !important;
    box-shadow: 0 10px 25px rgba(249, 115, 22, 0.35), 0 0 15px rgba(236, 72, 153, 0.25) !important;
  }

  button:active:not(:disabled),
  [role="button"]:active,
  input[type="submit"]:active,
  input[type="button"]:active,
  .cyber-btn:active {
    transform: translateY(1px) scale(0.97) !important;
    filter: brightness(0.95) !important;
    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.2) !important;
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  ::-webkit-scrollbar-track {
    background: #fff7ed;
    border-radius: 10px;
    border: 1px solid #fed7aa;
  }
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #f97316, #ec4899);
    border-radius: 10px;
    border: 2px solid #fff7ed;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #ea580c, #db2777);
  }

  .no-native-spin::-webkit-inner-spin-button,
  .no-native-spin::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .no-native-spin {
    -moz-appearance: textfield;
  }

  .cyber-select {
    appearance: none;
    -webkit-appearance: none;
    background-repeat: no-repeat !important;
    background-position: right 14px center !important;
    background-size: 16px !important;
    padding-right: 38px !important;
    cursor: pointer;
    background-color: #ffffff !important;
    color: #1e293b !important;
    border: 2px solid #fed7aa !important;
    border-radius: 12px !important;
  }
  .cyber-select-pink {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ec4899' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  }
  .cyber-select-cyan {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  }
  .cyber-select-purple {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238b5cf6' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  }

  .cyber-textarea {
    scrollbar-color: #f97316 #fff7ed;
    scrollbar-width: thin;
    transition: border-color 0.2s, box-shadow 0.2s;
    background-color: #ffffff !important;
    color: #1e293b !important;
  }
  .cyber-textarea:focus {
    border-color: #f97316 !important;
    box-shadow: 0 0 15px rgba(249, 115, 22, 0.25) !important;
  }

  /* Cat Game Card Styles */
  .cyber-game-card {
    position: relative;
    background: #ffffff !important;
    border: 2.5px solid #fed7aa !important;
    border-radius: 24px !important;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 10px 25px rgba(249, 115, 22, 0.08), 0 2px 6px rgba(0,0,0,0.03) !important;
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }

  .cyber-game-card:hover {
    transform: translateY(-8px) scale(1.025) !important;
    border-color: #f97316 !important;
    box-shadow: 0 20px 40px rgba(249, 115, 22, 0.22), 0 0 25px rgba(251, 191, 36, 0.3) !important;
  }

  .cyber-game-cover-wrap {
    height: 165px;
    overflow: hidden;
    position: relative;
    background-color: #fff7ed !important;
  }

  .cyber-game-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), filter 0.4s ease !important;
    filter: brightness(1) contrast(1.02);
  }

  .cyber-game-card:hover .cyber-game-cover-img {
    transform: scale(1.08) !important;
    filter: brightness(1.05) contrast(1.05) !important;
  }

  .cyber-game-cover-wrap::after {
    content: '';
    position: absolute;
    top: 0;
    left: -120%;
    width: 80%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
    transform: skewX(-25deg);
    transition: left 0.7s ease;
    pointer-events: none;
  }

  .cyber-game-card:hover .cyber-game-cover-wrap::after {
    left: 150%;
  }

  /* Cat Badge Pulse & Floating Paws */
  .cyber-badge-pulse {
    animation: catPawBounce 2.5s ease-in-out infinite;
  }

  @keyframes catPawBounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px) scale(1.04);
    }
  }

  @keyframes catCoinSpin {
    0% { transform: rotateY(0deg); }
    50% { transform: rotateY(180deg); }
    100% { transform: rotateY(360deg); }
  }

  .cat-coin-icon {
    display: inline-block;
    animation: catCoinSpin 6s linear infinite;
  }

  .line-floating-btn {
    animation: lineFloat 3.2s ease-in-out infinite, lineGlow 3.2s ease-in-out infinite;
  }

  @keyframes lineFloat {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-7px) rotate(1.5deg);
    }
  }

  @keyframes lineGlow {
    0%, 100% {
      box-shadow: 0 8px 25px rgba(6, 199, 85, 0.45), 0 0 15px rgba(6, 199, 85, 0.3);
    }
    50% {
      box-shadow: 0 14px 35px rgba(6, 199, 85, 0.75), 0 0 25px rgba(249, 115, 22, 0.4);
    }
  }

  @keyframes cyberPulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.08);
    }
  }
`;

// การตั้งค่าระดับแรงค์ลูกค้า (VIP Rank Tiers) พร้อมการตกแต่งสวยงามพิเศษทุกแรงค์
const RANK_TIERS = [
  {
    tier: 'CHALLENGER',
    level: 7,
    title: 'Mythic Legend',
    name: 'Challenger VIP',
    badge: 'CHALLENGER VIP',
    shortName: 'CHALLENGER',
    icon: '🏆',
    subIcon: '🔥',
    minSpend: 50000,
    maxSpend: Infinity,
    rateText: '฿50,000 ขึ้นไป',
    color: '#ff2d55',
    accentColor: '#fef08a',
    border: '#ff2d55',
    bg: 'linear-gradient(135deg, rgba(255, 45, 85, 0.25) 0%, rgba(245, 158, 11, 0.3) 100%)',
    cardBg: '#151d30',
    glow: '0 0 18px rgba(255, 45, 85, 0.65)',
    animationClass: 'rank-glow-challenger',
    perks: 'สิทธิ์รับโค้ดระดับตำนาน (Legendary Codes), บริการผู้ดูแลส่วนตัว VIP สูงสุด',
    rewardSummary: 'โค้ดแพ็กใหญ่สุด + สิทธิ์ร่วมกิจกรรมพิเศษลับ'
  },
  {
    tier: 'MASTER',
    level: 6,
    title: 'Grand Master',
    name: 'Master VIP',
    badge: 'MASTER VIP',
    shortName: 'MASTER',
    icon: '👑',
    subIcon: '⚡',
    minSpend: 25000,
    maxSpend: 49999,
    rateText: '฿25,000 - ฿49,999',
    color: '#f472b6',
    accentColor: '#fbcfe8',
    border: '#ec4899',
    bg: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
    cardBg: '#151d30',
    glow: '0 0 15px rgba(236, 72, 153, 0.6)',
    animationClass: 'rank-glow-master',
    perks: 'สิทธิ์รับโค้ดมาสเตอร์ VIP, สิทธิพิเศษกิจกรรมลับเฉพาะระดับสูง',
    rewardSummary: 'โค้ดส่วนลด 20% + โค้ดฟรี VIP ประจำเดือน'
  },
  {
    tier: 'DIAMOND',
    level: 5,
    title: 'Diamond Champion',
    name: 'Diamond VIP',
    badge: 'DIAMOND VIP',
    shortName: 'DIAMOND',
    icon: '💠',
    subIcon: '🔮',
    minSpend: 10000,
    maxSpend: 24999,
    rateText: '฿10,000 - ฿24,999',
    color: '#c084fc',
    accentColor: '#f3e8ff',
    border: '#a855f7',
    bg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.22) 0%, rgba(56, 189, 248, 0.22) 100%)',
    cardBg: '#151d30',
    glow: '0 0 14px rgba(168, 85, 247, 0.55)',
    animationClass: 'rank-glow-diamond',
    perks: 'สิทธิ์รับโค้ดเพชรหายาก (Rare Gift Codes), สิทธิ์ร่วมจับรางวัลใหญ่',
    rewardSummary: 'โค้ดเพชร/คูปองแรร์ประจำเดือน'
  },
  {
    tier: 'PLATINUM',
    level: 4,
    title: 'Platinum Elite',
    name: 'Platinum VIP',
    badge: 'PLATINUM VIP',
    shortName: 'PLATINUM',
    icon: '💎',
    subIcon: '✨',
    minSpend: 5000,
    maxSpend: 9999,
    rateText: '฿5,000 - ฿9,999',
    color: '#38bdf8',
    accentColor: '#e0f2fe',
    border: '#0ea5e9',
    bg: 'linear-gradient(135deg, rgba(56, 189, 248, 0.22) 0%, rgba(45, 212, 191, 0.2) 100%)',
    cardBg: '#151d30',
    glow: '0 0 12px rgba(56, 189, 248, 0.5)',
    animationClass: 'rank-glow-platinum',
    perks: 'สิทธิ์รับโค้ดแพ็กเกจพรีเมียม, สิทธิ์รับบริการคิวพิเศษ',
    rewardSummary: 'โค้ดแพ็กเกจเกมพรีเมียม'
  },
  {
    tier: 'GOLD',
    level: 3,
    title: 'Gold Commander',
    name: 'Gold VIP',
    badge: 'GOLD VIP',
    shortName: 'GOLD',
    icon: '🥇',
    subIcon: '🌟',
    minSpend: 2000,
    maxSpend: 4999,
    rateText: '฿2,000 - ฿4,999',
    color: '#fbbf24',
    accentColor: '#fef08a',
    border: '#f59e0b',
    bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.22) 100%)',
    cardBg: '#151d30',
    glow: '0 0 12px rgba(245, 158, 11, 0.5)',
    animationClass: 'rank-glow-gold',
    perks: 'สิทธิ์รับโค้ดของขวัญระดับโกลด์, ส่วนลดพิเศษในเทศกาล',
    rewardSummary: 'โค้ดส่วนลด 10% ประจำสัปดาห์'
  },
  {
    tier: 'SILVER',
    level: 2,
    title: 'Silver Knight',
    name: 'Silver VIP',
    badge: 'SILVER VIP',
    shortName: 'SILVER',
    icon: '🥈',
    subIcon: '🛡️',
    minSpend: 500,
    maxSpend: 1999,
    rateText: '฿500 - ฿1,999',
    color: '#e2e8f0',
    accentColor: '#ffffff',
    border: '#94a3b8',
    bg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(203, 213, 225, 0.18) 100%)',
    cardBg: '#151d30',
    glow: '0 0 10px rgba(148, 163, 184, 0.4)',
    animationClass: '',
    perks: 'สิทธิ์รับโค้ดของขวัญระดับซิลเวอร์, กิจกรรมลูกค้าสมาชิก',
    rewardSummary: 'โค้ดของขวัญซิลเวอร์'
  },
  {
    tier: 'BRONZE',
    level: 1,
    title: 'Bronze Scout',
    name: 'Bronze Member',
    badge: 'BRONZE MEMBER',
    shortName: 'BRONZE',
    icon: '🥉',
    subIcon: '🌱',
    minSpend: 0,
    maxSpend: 499,
    rateText: '฿0 - ฿499',
    color: '#f59e0b',
    accentColor: '#fef3c7',
    border: '#b45309',
    bg: 'linear-gradient(135deg, rgba(217, 119, 6, 0.18) 0%, rgba(180, 83, 9, 0.18) 100%)',
    cardBg: '#151d30',
    glow: '0 0 8px rgba(217, 119, 6, 0.35)',
    animationClass: '',
    perks: 'ระดับเริ่มต้น สิทธิ์รับโค้ดกิจกรรมทั่วไป, แจกของขวัญฟรี',
    rewardSummary: 'โค้ดกิจกรรมแจกฟรีทั่วไป'
  }
];

const getCustomerRank = (spending) => {
  const spend = Number(spending) || 0;
  for (let i = 0; i < RANK_TIERS.length; i++) {
    const tier = RANK_TIERS[i];
    if (spend >= tier.minSpend) {
      const prevTier = i > 0 ? RANK_TIERS[i - 1] : null;
      return {
        ...tier,
        currentSpend: spend,
        nextTier: prevTier ? prevTier.name : null,
        nextSpend: prevTier ? prevTier.minSpend : null,
        remainingToNext: prevTier ? Math.max(0, prevTier.minSpend - spend) : 0,
        progressPercent: prevTier 
          ? Math.min(100, Math.round(((spend - tier.minSpend) / (prevTier.minSpend - tier.minSpend)) * 100))
          : 100
      };
    }
  }
  return {
    ...RANK_TIERS[RANK_TIERS.length - 1],
    currentSpend: 0,
    nextTier: RANK_TIERS[RANK_TIERS.length - 2].name,
    nextSpend: RANK_TIERS[RANK_TIERS.length - 2].minSpend,
    remainingToNext: RANK_TIERS[RANK_TIERS.length - 2].minSpend,
    progressPercent: 0
  };
};

// คอมโพเนนต์เหรียญตราสัญลักษณ์ประจำแรงค์ (Rank Emblem Graphic) ดีไซน์เกมมิ่งพรีเมียม สวยงาม สว่าง คมชัดทุกแรงค์
function RankEmblem({ tier, size = 28, glow = true, className = '' }) {
  const t = (tier || '').toUpperCase();
  const s = size;

  // 🏆 1. CHALLENGER VIP: มงกุฎเปลวเพลิงทองคำ-แดงสุริยะประกายดาว
  if (t === 'CHALLENGER') {
    return (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} style={{ filter: glow ? 'drop-shadow(0 0 8px #ff0055) drop-shadow(0 0 16px #f59e0b)' : 'none', flexShrink: 0 }}>
        <defs>
          <linearGradient id="chFlame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff0055" />
            <stop offset="35%" stopColor="#e11d48" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
          <linearGradient id="chShield" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff176" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="chWings" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff0055" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        {/* Dragon / Phoenix Solar Wings */}
        <path d="M50 4 L64 26 L94 32 L74 54 L80 86 L50 72 L20 86 L26 54 L6 32 L36 26 Z" fill="url(#chWings)" stroke="#ffffff" strokeWidth="1.5" />
        {/* Inner Shield */}
        <polygon points="50,14 74,32 64,72 50,82 36,72 26,32" fill="#18050e" stroke="url(#chShield)" strokeWidth="3" />
        {/* Golden Trophy Crest Core */}
        <polygon points="50,22 66,38 50,56 34,38" fill="url(#chShield)" />
        {/* Radiant Central Legend Star */}
        <polygon points="50,28 53,38 63,38 55,44 58,54 50,48 42,54 45,44 37,38 47,38" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)" />
        {/* Flame Crown Jewels */}
        <circle cx="50" cy="8" r="4.5" fill="#fef08a" stroke="#b45309" strokeWidth="1" />
        <circle cx="22" cy="28" r="3" fill="#ff0055" />
        <circle cx="78" cy="28" r="3" fill="#ff0055" />
      </svg>
    );
  }

  // 👑 2. MASTER VIP: มงกุฎจักรพรรดิมาเจนต้า ประดับปีกคอสมิกและลูกแก้วเรืองแสง
  if (t === 'MASTER') {
    return (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} style={{ filter: glow ? 'drop-shadow(0 0 8px #f472b6) drop-shadow(0 0 14px #a855f7)' : 'none', flexShrink: 0 }}>
        <defs>
          <linearGradient id="msShield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="msCrown" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fdf2f8" />
            <stop offset="40%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#be185d" />
          </linearGradient>
        </defs>
        {/* Royal Crest Wings */}
        <path d="M50 8 L80 20 L90 46 L74 82 L50 94 L26 82 L10 46 L20 20 Z" fill="#1e0b24" stroke="url(#msShield)" strokeWidth="3.5" />
        {/* Crown Motif */}
        <path d="M26 66 L26 38 L38 50 L50 30 L62 50 L74 38 L74 66 Z" fill="url(#msCrown)" stroke="#ffffff" strokeWidth="1.8" />
        {/* Center Glowing Gem */}
        <circle cx="50" cy="62" r="9" fill="#ffffff" filter="drop-shadow(0 0 6px #f472b6)" />
        <circle cx="50" cy="62" r="5" fill="#ec4899" />
        <polygon points="50,18 53,24 60,24 55,28 57,34 50,30 43,34 45,28 40,24 47,24" fill="#ffffff" />
      </svg>
    );
  }

  // 💠 3. DIAMOND VIP: ผลึกอัญมณีม่วงอัลตราไวโอเลต แสงดวงดาวแปดแฉกเรืองรอง
  if (t === 'DIAMOND') {
    return (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} style={{ filter: glow ? 'drop-shadow(0 0 8px #c084fc) drop-shadow(0 0 14px #38bdf8)' : 'none', flexShrink: 0 }}>
        <defs>
          <linearGradient id="dmDiamond" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#e9d5ff" />
            <stop offset="55%" stopColor="#a855f7" />
            <stop offset="85%" stopColor="#6d28d9" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="dmCore" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>
        {/* Outer Radiant Octagon */}
        <polygon points="50,4 82,22 96,50 82,78 50,96 18,78 4,50 18,22" fill="#150a2a" stroke="url(#dmDiamond)" strokeWidth="3" />
        {/* Faceted Brilliant Diamond */}
        <polygon points="50,16 78,50 50,84 22,50" fill="url(#dmCore)" stroke="#ffffff" strokeWidth="1.8" />
        {/* Inner Star Facet */}
        <polygon points="50,26 66,50 50,74 34,50" fill="#ffffff" opacity="0.95" />
        <circle cx="50" cy="50" r="5" fill="#a855f7" />
        {/* Cosmic Prismatic Beams */}
        <line x1="50" y1="4" x2="50" y2="96" stroke="#ffffff" strokeWidth="1.8" opacity="0.75" />
        <line x1="4" y1="50" x2="96" y2="50" stroke="#ffffff" strokeWidth="1.8" opacity="0.75" />
      </svg>
    );
  }

  // 💎 4. PLATINUM VIP: โล่คริสตัลผลึกแก้วหกเหลี่ยมนีออนฟ้า Laser Crystal
  if (t === 'PLATINUM') {
    return (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} style={{ filter: glow ? 'drop-shadow(0 0 8px #38bdf8) drop-shadow(0 0 14px #0ea5e9)' : 'none', flexShrink: 0 }}>
        <defs>
          <linearGradient id="plCrystal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#bae6fd" />
            <stop offset="60%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="plCore" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="60%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>
        {/* Hexagonal Shield Plate */}
        <polygon points="50,6 88,26 88,74 50,94 12,74 12,26" fill="#041628" stroke="url(#plCrystal)" strokeWidth="3.5" />
        {/* Faceted Crystal Gem */}
        <polygon points="50,16 78,32 78,68 50,84 22,68 22,32" fill="url(#plCore)" stroke="#ffffff" strokeWidth="1.8" />
        {/* Inner Brilliant Diamond Core */}
        <polygon points="50,26 68,40 68,60 50,74 32,60 32,40" fill="#ffffff" opacity="0.95" />
        {/* Cyan Star Spark */}
        <polygon points="50,36 53,46 64,50 53,54 50,64 47,54 36,50 47,46" fill="#0284c7" />
      </svg>
    );
  }

  // 🥇 5. GOLD VIP: โล่มงกุฎทองคำแท้ 24K Cyber Gold ปีกทองและดาวประกาย
  if (t === 'GOLD') {
    return (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} style={{ filter: glow ? 'drop-shadow(0 0 8px #f59e0b) drop-shadow(0 0 14px #fbbf24)' : 'none', flexShrink: 0 }}>
        <defs>
          <linearGradient id="gdGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="gdShield" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
        </defs>
        {/* Royal Gold Shield */}
        <path d="M50 6 C70 6, 88 15, 88 36 C88 66, 50 94, 50 94 C50 94, 12 66, 12 36 C12 15, 30 6, 50 6 Z" fill="#241604" stroke="url(#gdGold)" strokeWidth="3.5" />
        {/* Inner Golden Plate */}
        <path d="M50 16 C64 16, 76 24, 76 40 C76 62, 50 82, 50 82 C50 82, 24 62, 24 40 C24 24, 36 16, 50 16 Z" fill="url(#gdShield)" stroke="#ffffff" strokeWidth="1.8" />
        {/* 5-Star Radiant Gold Star */}
        <polygon points="50,26 54,39 68,39 57,48 61,61 50,53 39,61 43,48 32,39 46,39" fill="#ffffff" filter="drop-shadow(0 0 4px #fbbf24)" />
        <circle cx="50" cy="50" r="5" fill="#f59e0b" />
        <circle cx="50" cy="11" r="3.5" fill="#fef08a" />
      </svg>
    );
  }

  // 🥈 6. SILVER VIP: โล่อัศวินโครเมียมเงาวับ ดาบคู่และประกายเงินพรีเมียม
  if (t === 'SILVER') {
    return (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} style={{ filter: glow ? 'drop-shadow(0 0 7px #cbd5e1) drop-shadow(0 0 12px #94a3b8)' : 'none', flexShrink: 0 }}>
        <defs>
          <linearGradient id="svSilver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#e2e8f0" />
            <stop offset="75%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="svPlate" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="60%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
        </defs>
        {/* Knight Shield Contour */}
        <path d="M50 8 L86 24 L86 56 C86 76, 50 94, 50 94 C50 94, 14 76, 14 56 L14 24 Z" fill="#0f172a" stroke="url(#svSilver)" strokeWidth="3.5" />
        {/* Inner Polished Plate */}
        <path d="M50 18 L76 30 L76 54 C76 70, 50 82, 50 82 C50 82, 24 70, 24 54 L24 30 Z" fill="url(#svPlate)" stroke="#ffffff" strokeWidth="1.8" />
        {/* Silver Crossed Crest / Star */}
        <polygon points="50,28 54,40 66,42 57,50 60,62 50,54 40,62 43,50 34,42 46,40" fill="#ffffff" filter="drop-shadow(0 0 4px #e2e8f0)" />
        <circle cx="50" cy="48" r="4" fill="#64748b" />
      </svg>
    );
  }

  // 🥉 7. BRONZE MEMBER: โล่เกราะทองแดงเมทัลลิกหนักแน่น สไตล์นักรบพร้อมดาวศึก
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} style={{ filter: glow ? 'drop-shadow(0 0 6px #d97706) drop-shadow(0 0 10px #b45309)' : 'none', flexShrink: 0 }}>
      <defs>
        <linearGradient id="bzBronze" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="30%" stopColor="#fbbf24" />
          <stop offset="65%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="bzPlate" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
      </defs>
      {/* Heavy Bronze Shield */}
      <polygon points="50,8 86,22 76,70 50,92 24,70 14,22" fill="#241003" stroke="url(#bzBronze)" strokeWidth="3.5" />
      {/* Inner Metallic Chevron */}
      <polygon points="50,18 76,28 68,66 50,82 32,66 24,28" fill="url(#bzPlate)" stroke="#ffffff" strokeWidth="1.5" />
      {/* Bronze Scout Crest Star */}
      <polygon points="50,30 53,41 64,43 55,51 58,62 50,55 42,62 45,51 36,43 47,41" fill="#ffffff" filter="drop-shadow(0 0 4px #fed7aa)" />
      <circle cx="50" cy="50" r="4.5" fill="#78350f" />
    </svg>
  );
}

// ฟังก์ชันสร้าง PromptPay EMVCo QR Code สำหรับพร้อมเพย์ 095-626-7172 / SCB 558-265124-6 (นาย ธนภูมิ รักษี)
const OFFICIAL_KPLUS_QR_IMAGE = "data:image/webp;base64,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";

// ฟังก์ชันตรวจสอบสลิปแบบ Dual-Engine (รองรับทั้งผ่านเซิร์ฟเวอร์ /api/verify-slip และเรียก SlipOK ตรงกรณีรันบนโดเมนพิเศษ/Iframe)
const verifySlipWithSlipOK = async (imageBase64Data, expectedAmount, metadata = {}) => {
  let cleanBase64 = imageBase64Data;
  if (cleanBase64.includes(',')) {
    cleanBase64 = cleanBase64.split(',')[1];
  }

  // 1. ลองยิงผ่าน /api/verify-slip ของ Vercel ก่อน
  try {
    let apiEndpoint = '/api/verify-slip';
    if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin.startsWith('http')) {
      apiEndpoint = `${window.location.origin}/api/verify-slip`;
    }

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: cleanBase64,
        expectedAmount: expectedAmount,
        ...metadata
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errData = await response.json().catch(() => ({}));
      if (errData.message) {
        return { success: false, message: errData.message };
      }
    }
  } catch (backendErr) {
    console.warn('Backend /api/verify-slip unreachable, falling back to direct SlipOK connection:', backendErr);
  }

  // 2. Fallback: ยิงตรงไปที่ SlipOK API (Branch: 80221, Key: SLIPOKQ4IRV70) โดยส่งเป็นรูปภาพ (files: File/Blob)
  try {
    const slipokBranch = '80221';
    const slipokKey = 'SLIPOKQ4IRV70';

    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    const directForm = new FormData();
    directForm.append('files', blob, 'slip.jpg');
    if (expectedAmount) {
      directForm.append('amount', parseFloat(expectedAmount).toString());
    }
    directForm.append('log', 'true');

    const directResponse = await fetch(`https://api.slipok.com/api/line/apikey/${slipokBranch}`, {
      method: 'POST',
      headers: {
        'x-authorization': slipokKey,
      },
      body: directForm,
    });

    const slipData = await directResponse.json();

    if (directResponse.ok && slipData.success) {
      return {
        success: true,
        message: 'ตรวจสอบสลิปสำเร็จ ยอดเงินเข้าบัญชีเรียบร้อยแล้ว',
        data: slipData.data
      };
    } else {
      return {
        success: false,
        message: slipData.message || 'สลิปไม่ถูกต้อง ยอดเงินไม่ตรง หรือไม่ได้โอนเข้าบัญชีร้าน'
      };
    }
  } catch (directErr) {
    console.error('Direct SlipOK API call error:', directErr);
    return {
      success: false,
      message: 'ไม่สามารถเชื่อมต่อระบบ SlipOK ได้ กรุณาตรวจสอบอินเทอร์เน็ตหรือติดต่อแอดมิน (' + directErr.message + ')'
    };
  }
};

const generatePromptPayQrPayload = (amount) => {
  const crc16 = (data) => {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
        } else {
          crc = (crc << 1) & 0xFFFF;
        }
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  };

  // เบอร์พร้อมเพย์ 095-626-7172 -> 0066956267172
  const ppTarget = '01130066956267172';
  const merchantInfo = `0016A000000677010111${ppTarget}`;
  const tag29 = `29${merchantInfo.length.toString().padStart(2, '0')}${merchantInfo}`;

  if (!amount || amount <= 0) {
    const rawStatic = `000201010211${tag29}5802TH53037646304`;
    return rawStatic + crc16(rawStatic);
  }
  const amtStr = parseFloat(amount).toFixed(2);
  const amtTag = `54${amtStr.length.toString().padStart(2, '0')}${amtStr}`;
  const raw = `000201010212${tag29}5802TH5303764${amtTag}6304`;
  return raw + crc16(raw);
};

// รูปภาพแบนเนอร์หลักประจำร้าน Meow Topup (ปรับขนาดและบีบอัดเป็น WebP เพื่อให้ไฟล์เบา แสดงผลบน GitHub และโหลดเว็บได้รวดเร็ว)
const HERO_BANNER_IMAGE = "data:image/webp;base64,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";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('meow_theme_mode') === 'dark';
    } catch (e) {
      return false;
    }
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      try { localStorage.setItem('meow_theme_mode', next ? 'dark' : 'light'); } catch (e) {}
      return next;
    });
  };

  const tColors = {
    bg: isDarkMode ? '#0b0f19' : '#fffaf5',
    bgPattern: isDarkMode 
      ? 'radial-gradient(#334155 1px, transparent 1px), radial-gradient(#1e293b 1px, #0b0f19 1px)'
      : 'radial-gradient(#fdba74 1px, transparent 1px), radial-gradient(#f472b6 1px, #fffaf5 1px)',
    textPrimary: isDarkMode ? '#f8fafc' : '#0f172a',
    textSecondary: isDarkMode ? '#94a3b8' : '#475569',
    headerBg: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(254, 243, 235, 0.96)',
    headerBorder: isDarkMode ? '2px solid #334155' : '2px solid #fed7aa',
    cardBg: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : '#ffffff',
    cardBorder: isDarkMode ? '2px solid rgba(249, 115, 22, 0.35)' : '2px solid #fed7aa',
    cardShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.6)' : '0 10px 25px rgba(249, 115, 22, 0.08)',
    inputBg: isDarkMode ? '#1e293b' : '#ffffff',
    inputBorder: isDarkMode ? '2px solid #f97316' : '2px solid #fdba74',
    badgeBg: isDarkMode ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255, 237, 213, 0.95)',
    badgeBorder: isDarkMode ? '#f97316' : '#ea580c'
  };

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cyber_current_logged_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  const [usernameInput, setUsernameInput] = useState(() => {
    return localStorage.getItem('cyber_remembered_user') || '';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [emailInput, setEmailInput] = useState('');
  const [regUsernameInput, setRegUsernameInput] = useState('');
  const [regPasswordInput, setRegPasswordInput] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmailInput, setForgotEmailInput] = useState('');
  const [forgotTargetUser, setForgotTargetUser] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [forgotOtpInput, setForgotOtpInput] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(300);
  const [otpResendCountdown, setOtpResendCountdown] = useState(60);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotStatusMsg, setForgotStatusMsg] = useState({ text: '', type: '' });
  const [emailVerifyMsg, setEmailVerifyMsg] = useState('');
  const resetForgotState = () => {
    setForgotStep(1);
    setForgotEmailInput('');
    setForgotTargetUser(null);
    setGeneratedOtp('');
    setForgotOtpInput('');
    setOtpCountdown(300);
    setOtpResendCountdown(60);
    setForgotNewPassword('');
    setShowForgotNewPassword(false);
    setForgotConfirmPassword('');
    setShowForgotConfirmPassword(false);
    setForgotStatusMsg({ text: '', type: '' });
  };

  useEffect(() => {
    let timer;
    if (forgotModalOpen && forgotStep === 2) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        setOtpResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [forgotModalOpen, forgotStep]);

  const formatOtpTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleResendEmailVerification = () => {
    setEmailVerifyMsg('');
    if (auth.currentUser) {
      sendEmailVerification(auth.currentUser)
        .then(() => {
          setEmailVerifyMsg(`📧 ส่งลิงก์ยืนยันอีเมลไปยัง ${user?.email || auth.currentUser.email} เรียบร้อยแล้ว! กรุณาตรวจสอบใน Inbox หรือ Junk Mail`);
          setTimeout(() => setEmailVerifyMsg(''), 7000);
        })
        .catch((err) => {
          setEmailVerifyMsg(`⚠️ ไม่สามารถส่งอีเมลยืนยันได้: ${err.message}`);
          setTimeout(() => setEmailVerifyMsg(''), 7000);
        });
    } else {
      setEmailVerifyMsg(`📧 กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่อีกครั้งเพื่อส่งลิงก์ยืนยันอีเมล`);
      setTimeout(() => setEmailVerifyMsg(''), 7000);
    }
  };

  const handleRequestOtpSubmit = (e) => {
    e.preventDefault();
    setForgotStatusMsg({ text: '', type: '' });

    const inputClean = forgotEmailInput.trim();
    if (!inputClean) {
      setForgotStatusMsg({ text: 'กรุณากรอกอีเมล หรือชื่อผู้ใช้ของคุณ', type: 'error' });
      return;
    }

    const matched = registeredUsers.find(
      (u) => (u.username && u.username.toLowerCase() === inputClean.toLowerCase()) ||
             (u.email && u.email.toLowerCase() === inputClean.toLowerCase())
    );

    if (!matched) {
      setForgotStatusMsg({ text: `ไม่พบบัญชีผู้ใช้ "${inputClean}" ในระบบ กรุณาตรวจสอบอีกครั้ง`, type: 'error' });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setForgotTargetUser(matched);
    setOtpCountdown(300);
    setOtpResendCountdown(60);
    setForgotOtpInput('');
    setForgotStep(2);
    setForgotStatusMsg({
      text: `📧 ส่งรหัส OTP 6 หลักไปยัง ${matched.email || matched.username} เรียบร้อยแล้ว (รหัส OTP ของคุณคือ: ${otp})`,
      type: 'success'
    });
  };

  const handleResendOtp = () => {
    if (otpResendCountdown > 0) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpCountdown(300);
    setOtpResendCountdown(60);
    setForgotOtpInput('');
    setForgotStatusMsg({
      text: `🔄 ส่งรหัส OTP ใหม่เรียบร้อยแล้ว (รหัส OTP: ${newOtp})`,
      type: 'success'
    });
  };

  const handleVerifyOtpSubmit = (e) => {
    e.preventDefault();
    setForgotStatusMsg({ text: '', type: '' });

    if (otpCountdown <= 0) {
      setForgotStatusMsg({ text: '⚠️ รหัส OTP หมดอายุแล้ว กรุณากดขอรหัส OTP ใหม่', type: 'error' });
      return;
    }

    if (!forgotOtpInput.trim() || forgotOtpInput.trim().length !== 6) {
      setForgotStatusMsg({ text: 'กรุณากรอกรหัส OTP ให้ครบ 6 หลัก', type: 'error' });
      return;
    }

    if (forgotOtpInput.trim() !== generatedOtp) {
      setForgotStatusMsg({ text: '❌ รหัส OTP ไม่ถูกต้อง กรุณากรอกรหัสให้ตรงกับที่ส่งให้', type: 'error' });
      return;
    }

    setForgotStep(3);
    setForgotStatusMsg({
      text: '✅ ยืนยันรหัส OTP ถูกต้องแล้ว! กรุณาตั้งรหัสผ่านใหม่ของคุณด้านล่างได้ทันที',
      type: 'success'
    });
  };

  const handleSetNewPasswordSubmit = (e) => {
    e.preventDefault();
    setForgotStatusMsg({ text: '', type: '' });

    if (!forgotNewPassword.trim() || !forgotConfirmPassword.trim()) {
      setForgotStatusMsg({ text: 'กรุณากรอกรหัสผ่านใหม่ให้ครบทั้งสองช่อง', type: 'error' });
      return;
    }

    if (forgotNewPassword.trim().length < 6) {
      setForgotStatusMsg({ text: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร', type: 'error' });
      return;
    }

    if (forgotNewPassword.trim() !== forgotConfirmPassword.trim()) {
      setForgotStatusMsg({ text: 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน', type: 'error' });
      return;
    }

    if (!forgotTargetUser || !forgotTargetUser.firebaseKey) {
      setForgotStatusMsg({ text: 'เกิดข้อผิดพลาด: ไม่พบข้อมูลบัญชี กรุณาลองใหม่อีกครั้ง', type: 'error' });
      return;
    }

    const newPass = forgotNewPassword.trim();
    set(ref(db, `users/${forgotTargetUser.firebaseKey}/password`), newPass)
      .then(() => {
        setUsernameInput(forgotTargetUser.username);
        setPasswordInput(newPass);

        setForgotStatusMsg({
          text: '🎉 เปลี่ยนรหัสผ่านใหม่สำเร็จเรียบร้อยแล้ว! ระบบได้กรอกรหัสผ่านใหม่ให้ในหน้าเข้าสู่ระบบแล้ว กำลังกลับสู่หน้าแรก...',
          type: 'success'
        });

        setTimeout(() => {
          setForgotModalOpen(false);
          resetForgotState();
        }, 2500);
      })
      .catch((err) => {
        setForgotStatusMsg({
          text: 'เกิดข้อผิดพลาดในการบันทึกรหัสผ่านใหม่: ' + err.message,
          type: 'error'
        });
      });
  };

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // อัตโนมัติ: ลบบัญชี nattapong ออกจากระบบเพื่อให้สามารถสมัครสมาชิกใหม่ได้ตามต้องการ
        Object.keys(data).forEach(key => {
          const u = data[key];
          if (u && (u.username?.toLowerCase() === 'nattapong' || u.email?.toLowerCase().includes('nattapong'))) {
            remove(ref(db, `users/${key}`));
          }
        });

        const userList = Object.keys(data)
          .filter(key => {
            const u = data[key];
            return !(u && (u.username?.toLowerCase() === 'nattapong' || u.email?.toLowerCase().includes('nattapong')));
          })
          .map(key => ({
            ...data[key],
            firebaseKey: key
          }));

        setRegisteredUsers(userList);
        setUser(prevUser => {
          if (!prevUser) return null;
          if (prevUser.username?.toLowerCase() === 'nattapong' || prevUser.email?.toLowerCase().includes('nattapong')) {
            try { localStorage.removeItem('cyber_current_logged_user'); } catch (e) {}
            return null;
          }
          const updated = userList.find(u =>
            (u.firebaseKey && u.firebaseKey === prevUser.firebaseKey) ||
            (u.username && prevUser.username && u.username.toLowerCase() === prevUser.username.toLowerCase())
          );
          if (updated) {
            try { localStorage.setItem('cyber_current_logged_user', JSON.stringify(updated)); } catch (e) {}
            return updated;
          }
          return prevUser;
        });
      } else {
        setRegisteredUsers([]);
      }
    });
    return () => unsubscribe();
  }, []);

// ระบบคงยอดเงินเครดิตร้านถาวร ไม่มีการรีเซ็ตอัตโนมัติ

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (authMode === 'login') {
      if (!usernameInput.trim() || !passwordInput.trim()) {
        setAuthError('กรุณากรอกชื่อผู้ใช้ และรหัสผ่าน');
        return;
      }
      
      const inputClean = usernameInput.trim().toLowerCase();
      const foundUser = registeredUsers.find(
        (u) => (u.username && u.username.toLowerCase() === inputClean) || 
               (u.email && u.email.toLowerCase() === inputClean)
      );

      if (!foundUser) {
        setAuthError('ไม่พบบัญชีผู้ใช้งานนี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้หรือสมัครสมาชิก');
        return;
      }

      if (foundUser.email) {
        signInWithEmailAndPassword(auth, foundUser.email, passwordInput)
          .then((userCredential) => {
            const isVerified = userCredential.user.emailVerified;
            
            if (foundUser.firebaseKey && foundUser.password !== passwordInput) {
              set(ref(db, `users/${foundUser.firebaseKey}/password`), passwordInput);
            }
            if (foundUser.firebaseKey && isVerified !== foundUser.emailVerified) {
              set(ref(db, `users/${foundUser.firebaseKey}/emailVerified`), isVerified);
            }

            const updatedUser = {
              ...foundUser,
              password: passwordInput,
              emailVerified: isVerified
            };

            if (rememberMe) {
              localStorage.setItem('cyber_remembered_user', usernameInput.trim());
            } else {
              localStorage.removeItem('cyber_remembered_user');
            }
            setUser(updatedUser);
            setShowAuthModal(false);
            localStorage.setItem('cyber_current_logged_user', JSON.stringify(updatedUser));
          })
          .catch((error) => {
            if (foundUser.password === passwordInput) {
              if (rememberMe) {
                localStorage.setItem('cyber_remembered_user', usernameInput.trim());
              } else {
                localStorage.removeItem('cyber_remembered_user');
              }
              setUser(foundUser);
              setShowAuthModal(false);
              localStorage.setItem('cyber_current_logged_user', JSON.stringify(foundUser));
            } else {
              if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setAuthError('รหัสผ่านไม่ถูกต้อง (หากคุณเพิ่งเปลี่ยนรหัสผ่านผ่านอีเมล กรุณากรอกรหัสผ่านใหม่ที่คุณตั้ง)');
              } else {
                setAuthError('ชื่อผู้ใช้งาน หรือรหัสผ่านไม่ถูกต้อง');
              }
            }
          });
      } else {
        if (foundUser.password === passwordInput) {
          if (rememberMe) {
            localStorage.setItem('cyber_remembered_user', usernameInput.trim());
          } else {
            localStorage.removeItem('cyber_remembered_user');
          }
          setUser(foundUser);
              setShowAuthModal(false);
          localStorage.setItem('cyber_current_logged_user', JSON.stringify(foundUser));
        } else {
          setAuthError('ชื่อผู้ใช้งาน หรือรหัสผ่านไม่ถูกต้อง');
        }
      }
    } else if (authMode === 'register') {
      if (!emailInput.trim() || !regUsernameInput.trim() || !regPasswordInput.trim() || !confirmPasswordInput.trim()) {
        setAuthError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
      }
      
      const emailClean = emailInput.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailClean)) {
        setAuthError('รูปแบบ Email สำหรับกู้คืนรหัสผ่านไม่ถูกต้อง (เช่น name@domain.com)');
        return;
      }

      if (regPasswordInput.length < 6) {
        setAuthError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        return;
      }

      if (regPasswordInput !== confirmPasswordInput) {
        setAuthError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
        return;
      }

      const isEmailExist = registeredUsers.some((u) => u.email && u.email.toLowerCase() === emailClean);
      if (isEmailExist) {
        setAuthError('อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น');
        return;
      }

      const usernameClean = regUsernameInput.trim();
      const isUserExist = registeredUsers.some((u) => u.username && u.username.toLowerCase() === usernameClean.toLowerCase());
      if (isUserExist) {
        setAuthError('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น');
        return;
      }

      createUserWithEmailAndPassword(auth, emailClean, regPasswordInput)
        .then((userCredential) => {
          sendEmailVerification(userCredential.user).catch((err) => {
            console.log("Email verification dispatch note:", err);
          });

          const newUser = { 
            username: usernameClean, 
            email: emailClean, 
            password: regPasswordInput, 
            emailVerified: false,
            balance: 0,
            createdAt: new Date().toISOString()
          };

          const usersRef = ref(db, 'users');
          return push(usersRef, newUser);
        })
        .then(() => {
          setUsernameInput(usernameClean);
          setPasswordInput(regPasswordInput);
          setEmailInput('');
          setRegUsernameInput('');
          setRegPasswordInput('');
          setConfirmPasswordInput('');
          setAuthSuccessMsg('🎉 สมัครสมาชิกสำเร็จ! ระบบได้ส่งอีเมลยืนยันตัวตนไปยัง ' + emailClean + ' เรียบร้อยแล้ว (สามารถนำอีเมลนี้ใช้กู้คืนรหัสผ่านได้ตลอด 24 ชม.)');
          setAuthMode('login');
        })
        .catch((error) => {
          if (error.code === 'auth/email-already-in-use') {
            setAuthError('อีเมลนี้ถูกใช้งานในระบบ Firebase Auth แล้ว');
          } else {
            setAuthError('เกิดข้อผิดพลาดในการสร้างบัญชีสมาชิก: ' + error.message);
          }
        });
    }
  };

  const [activeTab, setActiveTab] = useState('shop');
  const [gameCategory, setGameCategory] = useState('all');
  const [selectedGame, setSelectedGame] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageQuantity, setPackageQuantity] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [eventGame, setEventGame] = useState('VALORANT');
  const [eventPlayerId, setEventPlayerId] = useState('');
  const [eventGiftCode, setEventGiftCode] = useState('');
  const [eventMsg, setEventMsg] = useState({ text: '', type: '' });

  const [globalRedeemedPlayers, setGlobalRedeemedPlayers] = useState(() => {
    const saved = localStorage.getItem('cyber_global_redeemed_players');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return ['22'];
  });

  useEffect(() => {
    localStorage.setItem('cyber_global_redeemed_players', JSON.stringify(globalRedeemedPlayers));
  }, [globalRedeemedPlayers]);

  const [gamesData] = useState([
    {
      id: 'valorant',
      name: 'VALORANT',
      publisher: 'Riot Games',
      category: 'pc',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดฮิตอันดับ 1 🔥',
      packages: [
        { id: 'v1', name: '475 VP', price: 128, originalPrice: 130, cost: 125, profit: 3, bonus: '⚡ ประหยัด ฿2 +แต้ม VIP' },
        { id: 'v2', name: '1,000 VP', price: 255, originalPrice: 260, cost: 249, profit: 6, bonus: '🔥 ขายดี ประหยัด ฿5 +แรงค์ VIP' },
        { id: 'v3', name: '2,050 VP', price: 510, originalPrice: 520, cost: 499, profit: 11, bonus: '⚡ ยอดฮิต ประหยัด ฿10 +แรงค์ VIP' },
        { id: 'v4', name: '3,650 VP', price: 905, originalPrice: 920, cost: 882, profit: 23, bonus: '⭐ พรีเมียม ประหยัด ฿15 +VIP' },
        { id: 'v5', name: '5,350 VP', price: 1295, originalPrice: 1320, cost: 1263, profit: 32, bonus: '💥 สุดคุ้ม ประหยัด ฿25 +VIP' },
        { id: 'v6', name: '11,000 VP (Whale Pack)', price: 2580, originalPrice: 2640, cost: 2525, profit: 55, bonus: '👑 Whale คุ้มสุด ประหยัด ฿60 VIP' }
      ]
    },
    {
      id: 'rov',
      name: 'ROV (Arena of Valor)',
      publisher: 'Garena',
      category: 'mobile',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดฮิต MOBA ⚔️',
      packages: [
        { id: 'r1', name: '60 คูปอง', price: 49.5, originalPrice: 50, cost: 49, profit: 0.5, bonus: '⚡ คุ้มค่า ประหยัด ฿0.5' },
        { id: 'r2', name: '110 คูปอง', price: 89.5, originalPrice: 90, cost: 89, profit: 0.5, bonus: '⚡ เติมไว ประหยัด ฿0.5' },
        { id: 'r3', name: '185 คูปอง', price: 148, originalPrice: 150, cost: 145, profit: 3, bonus: '🔥 ขายดี ประหยัด ฿2' },
        { id: 'r4', name: '370 คูปอง', price: 296, originalPrice: 300, cost: 292, profit: 4, bonus: '⭐ ยอดฮิต ประหยัด ฿4' },
        { id: 'r5', name: '620 คูปอง', price: 493, originalPrice: 500, cost: 487, profit: 6, bonus: '💥 สุดคุ้ม ประหยัด ฿7' },
        { id: 'r6', name: '1,240 คูปอง (Big Pack)', price: 985, originalPrice: 1000, cost: 972, profit: 13, bonus: '👑 Big Pack ประหยัด ฿15 VIP' }
      ]
    },
    {
      id: 'freefire',
      name: 'Free Fire',
      publisher: 'Garena',
      category: 'mobile',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดนิยมอันดับ 1 🎯',
      packages: [
        { id: 'ff1', name: '172 เพชร', price: 49.5, originalPrice: 50, cost: 49, profit: 0.5, bonus: '⚡ เติมไว ประหยัด ฿0.5' },
        { id: 'ff2', name: '310 เพชร', price: 89, originalPrice: 90, cost: 88, profit: 1, bonus: '🔥 ขายดี ประหยัด ฿1' },
        { id: 'ff3', name: '517 เพชร', price: 148.5, originalPrice: 150, cost: 147, profit: 1.5, bonus: '⚡ ยอดฮิต ประหยัด ฿1.5' },
        { id: 'ff4', name: '690 เพชร', price: 197, originalPrice: 200, cost: 195, profit: 2, bonus: '⭐ ยอดนิยม ประหยัด ฿3' },
        { id: 'ff5', name: '1,052 เพชร', price: 296, originalPrice: 300, cost: 293, profit: 3, bonus: '💥 สุดคุ้ม ประหยัด ฿4' },
        { id: 'ff6', name: '1,801 เพชร', price: 493, originalPrice: 500, cost: 487, profit: 6, bonus: '🔥 โบนัสเพียบ ประหยัด ฿7' },
        { id: 'ff7', name: '3,698 เพชร (VIP Mega)', price: 986, originalPrice: 1000, cost: 975, profit: 11, bonus: '👑 VIP Mega ประหยัด ฿14' },
        { id: 'ff_w', name: 'สมาชิกเพชรรายสัปดาห์ (Weekly)', price: 64.5, originalPrice: 65, cost: 64, profit: 0.5, bonus: '⭐ รับเพชร 7 วัน ประหยัด ฿0.5' },
        { id: 'ff_m', name: 'สมาชิกเพชรรายเดือน (Monthly)', price: 310, originalPrice: 329, cost: 295, profit: 15, bonus: '💎 รับเพชร 30 วัน ประหยัด ฿19' }
      ]
    },
    {
      id: 'genshin',
      name: 'Genshin Impact',
      publisher: 'HoYoverse',
      category: 'pc',
      image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดฮิต Open World ✨',
      packages: [
        { id: 'g_welkin', name: 'พรแห่งดวงจันทร์ (Blessing 30 วัน)', price: 199, originalPrice: 219, cost: 179, profit: 20, bonus: '🔥 ขายดีสุด ประหยัด ฿20' },
        { id: 'g1', name: '60 Genesis Crystals', price: 42, originalPrice: 45, cost: 35, profit: 7, bonus: '⚡ เติมตรง ประหยัด ฿3' },
        { id: 'g2', name: '300 (+30) Genesis Crystals', price: 199, originalPrice: 219, cost: 179, profit: 20, bonus: '⚡ ยอดฮิต ประหยัด ฿20' },
        { id: 'g3', name: '980 (+110) Genesis Crystals', price: 599, originalPrice: 650, cost: 549, profit: 50, bonus: '⭐ พรีเมียม ประหยัด ฿51' },
        { id: 'g4', name: '1,980 (+260) Genesis Crystals', price: 1190, originalPrice: 1290, cost: 1100, profit: 90, bonus: '💥 สุดคุ้ม ประหยัด ฿100' },
        { id: 'g5', name: '3,280 (+600) Genesis Crystals', price: 1950, originalPrice: 2100, cost: 1800, profit: 150, bonus: '🔥 บิ๊กแพ็ก ประหยัด ฿150' },
        { id: 'g6', name: '6,480 (+1,600) Crystals (Whale)', price: 3990, originalPrice: 4300, cost: 3700, profit: 290, bonus: '👑 Whale Pack ประหยัด ฿310 VIP' }
      ]
    },
    
    {
      id: 'pubg',
      name: 'PUBG Mobile',
      publisher: 'Krafton / Tencent',
      category: 'mobile',
      image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=80',
      badge: 'Battle Royale 🪂',
      packages: [
        { id: 'p1', name: '60 UC', price: 32.5, originalPrice: 33, cost: 32, profit: 0.5, bonus: '⚡ เติมไว ประหยัด ฿0.5' },
        { id: 'p2', name: '325 UC', price: 162, originalPrice: 165, cost: 159, profit: 3, bonus: '🔥 ขายดี ประหยัด ฿3' },
        { id: 'p3', name: '660 UC (Royale Pass ทันที)', price: 322, originalPrice: 330, cost: 315, profit: 7, bonus: '⭐ ซื้อพาสได้ทันที ประหยัด ฿8' },
        { id: 'p4', name: '1,800 UC', price: 805, originalPrice: 825, cost: 789, profit: 16, bonus: '⚡ ยอดฮิต ประหยัด ฿20' },
        { id: 'p5', name: '3,850 UC', price: 1610, originalPrice: 1650, cost: 1573, profit: 37, bonus: '💥 สุดคุ้ม ประหยัด ฿40' },
        { id: 'p6', name: '8,100 UC (Whale Mega Pack)', price: 3219, originalPrice: 3300, cost: 3139, profit: 80, bonus: '👑 Whale Mega ประหยัด ฿81 VIP' }
      ]
    },
    {
      id: 'lol',
      name: 'League of Legends',
      publisher: 'Riot Games',
      category: 'pc',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80',
      badge: 'MOBA ยอดฮิต 🏆',
      packages: [
        { id: 'l1', name: '615 RP', price: 136, originalPrice: 139, cost: 133, profit: 3, bonus: '⚡ เติมไว ประหยัด ฿3' },
        { id: 'l2', name: '1,320 RP', price: 273, originalPrice: 279, cost: 267, profit: 6, bonus: '🔥 ขายดี ประหยัด ฿6' },
        { id: 'l3', name: '2,795 RP', price: 547, originalPrice: 559, cost: 536, profit: 11, bonus: '⚡ ยอดฮิต ประหยัด ฿12' },
        { id: 'l4', name: '4,985 RP', price: 959, originalPrice: 979, cost: 939, profit: 20, bonus: '⭐ พรีเมียม ประหยัด ฿20' },
        { id: 'l5', name: '7,295 RP', price: 1370, originalPrice: 1400, cost: 1344, profit: 26, bonus: '💥 ซูเปอร์คุ้ม ประหยัด ฿30' },
        { id: 'l6', name: '14,875 RP (Ultra Whale)', price: 2740, originalPrice: 2800, cost: 2688, profit: 52, bonus: '👑 Ultra Whale ประหยัด ฿60 VIP' }
      ]
    },
    {
      id: 'fcmobile',
      name: 'EA SPORTS FC Mobile',
      publisher: 'Electronic Arts',
      category: 'mobile',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=500&q=80',
      badge: 'ฟุตบอลอันดับ 1 ⚽',
      packages: [
        { id: 'fc1', name: '4,466 FC Points', price: 49, originalPrice: 50, cost: 48, profit: 1, bonus: '⚡ ประหยัด ฿1' },
        { id: 'fc2', name: '8,181 FC Points', price: 88.5, originalPrice: 90, cost: 87, profit: 1.5, bonus: '🔥 ขายดี ประหยัด ฿1.5' },
        { id: 'fc3', name: '15,000 FC Points', price: 147.5, originalPrice: 150, cost: 145, profit: 2.5, bonus: '⚡ ยอดนิยม ประหยัด ฿2.5' },
        { id: 'fc4', name: '30,000 FC Points', price: 295, originalPrice: 300, cost: 290, profit: 5, bonus: '⭐ คุ้มค่า ประหยัด ฿5' },
        { id: 'fc5', name: '50,000 FC Points', price: 490, originalPrice: 500, cost: 482, profit: 8, bonus: '💥 สุดคุ้ม ประหยัด ฿10' },
        { id: 'fc6', name: '100,000 FC Points (Pro Pack)', price: 980, originalPrice: 1000, cost: 965, profit: 15, bonus: '👑 Pro Pack ประหยัด ฿20 VIP' }
      ]
    },
    
    {
      id: 'razergold_card',
      name: 'Razer Gold PIN (e-Pin)',
      publisher: 'Razer Inc.',
      category: 'card',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80',
      badge: 'ส่งรหัส PIN ทันที ⚡',
      packages: [
        { id: 'rg50', name: '50 THB (Razer Gold PIN)', price: 49, originalPrice: 50, cost: 47.5, profit: 1.5, bonus: '⚡ ประหยัด ฿1 ส่งรหัสไว' },
        { id: 'rg100', name: '100 THB (Razer Gold PIN)', price: 98, originalPrice: 100, cost: 95, profit: 3, bonus: '🔥 ขายดี ประหยัด ฿2' },
        { id: 'rg300', name: '300 THB (Razer Gold PIN)', price: 292, originalPrice: 300, cost: 285, profit: 7, bonus: '⚡ ยอดฮิต ประหยัด ฿8' },
        { id: 'rg500', name: '500 THB (Razer Gold PIN)', price: 487, originalPrice: 500, cost: 475, profit: 12, bonus: '⭐ พรีเมียม ประหยัด ฿13' },
        { id: 'rg1000', name: '1,000 THB (Razer Gold PIN)', price: 975, originalPrice: 1000, cost: 950, profit: 25, bonus: '💥 สุดคุ้ม ประหยัด ฿25' },
        { id: 'rg3500', name: '3,500 THB (Razer Gold PIN)', price: 3410, originalPrice: 3500, cost: 3325, profit: 85, bonus: '👑 บิ๊กเซ็ต ประหยัด ฿90' },
        { id: 'rg5000', name: '5,000 THB (Razer Gold PIN)', price: 4875, originalPrice: 5000, cost: 4750, profit: 125, bonus: '👑 Big Whale ประหยัด ฿125' }
      ]
    }
  ]);
  const [giftCodes, setGiftCodes] = useState([]);

  useEffect(() => {
    const giftCodesRef = ref(db, 'giftCodes');
    const unsubscribe = onValue(giftCodesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const codeList = Object.keys(data).map(key => ({
          ...data[key],
          firebaseKey: key
        }));
        setGiftCodes(codeList.reverse());
      } else {
        setGiftCodes([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const [showLegacyStockAdmin, setShowLegacyStockAdmin] = useState(false);

  // ระบบจัดการสถานะสต็อกเกม (เปิดรับเติม / สต็อกหมด)
  const [gameStockStatus, setGameStockStatus] = useState(() => {
    try {
      const saved = localStorage.getItem('cyber_game_stock_status');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    const statusRef = ref(db, 'game_stock_status');
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameStockStatus(data);
        try { localStorage.setItem('cyber_game_stock_status', JSON.stringify(data)); } catch (e) {}
      }
    });
    return () => unsubscribe();
  }, []);

  const handleToggleGameStock = (gameId, gameName) => {
    const isCurrentlyOpen = gameStockStatus[gameId] !== false;
    const nextStatus = !isCurrentlyOpen;
    const updated = { ...gameStockStatus, [gameId]: nextStatus };
    setGameStockStatus(updated);
    try { localStorage.setItem('cyber_game_stock_status', JSON.stringify(updated)); } catch (e) {}

    const targetRef = ref(db, `game_stock_status/${gameId}`);
    set(targetRef, nextStatus);

    setAdminCodeMsg({
      text: nextStatus
        ? `🟢 เปิดรับเติมเกม "${gameName}" เรียบร้อยแล้ว (มีสต็อกพร้อมให้บริการ)`
        : `🔴 ตั้งค่าเกม "${gameName}" เป็น "สต็อกหมด" เรียบร้อยแล้ว (ลูกค้าจะไม่สามารถเติมเกมนี้ได้)`,
      type: 'success'
    });
    setTimeout(() => setAdminCodeMsg({ text: '', type: '' }), 5000);
  };

  const handleSetAllGameStock = (newStatus) => {
    const updated = {};
    gamesData.forEach(g => {
      updated[g.id] = newStatus;
    });
    setGameStockStatus(updated);
    try { localStorage.setItem('cyber_game_stock_status', JSON.stringify(updated)); } catch (e) {}

    const statusRef = ref(db, 'game_stock_status');
    set(statusRef, updated);

    setAdminCodeMsg({
      text: newStatus
        ? '🟢 เปิดรับเติมทุกเกมในระบบเรียบร้อยแล้ว (มีสต็อกพร้อมให้บริการทุกเกม)'
        : '🔴 ตั้งค่าทุกเกมในระบบเป็น "สต็อกหมด" เรียบร้อยแล้ว (ปิดรับเติมทุกเกมชั่วคราว)',
      type: 'success'
    });
    setTimeout(() => setAdminCodeMsg({ text: '', type: '' }), 5000);
  };

  // ระบบจัดการสถานะสต็อกรายแพ็กเกจ (Package-level stock status)
  const [packageStockStatus, setPackageStockStatus] = useState(() => {
    try {
      const saved = localStorage.getItem('cyber_package_stock_status');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [expandedStockGameId, setExpandedStockGameId] = useState(null);

  useEffect(() => {
    const pkgStatusRef = ref(db, 'package_stock_status');
    const unsubscribe = onValue(pkgStatusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPackageStockStatus(data);
        try { localStorage.setItem('cyber_package_stock_status', JSON.stringify(data)); } catch (e) {}
      }
    });
    return () => unsubscribe();
  }, []);

  const handleTogglePackageStock = (gameId, pkgId, gameName, pkgName) => {
    const pKey = `${gameId}_${pkgId}`;
    const isCurrentlyInStock = packageStockStatus[pKey] !== false;
    const nextStatus = !isCurrentlyInStock;
    const updated = { ...packageStockStatus, [pKey]: nextStatus };
    setPackageStockStatus(updated);
    try { localStorage.setItem('cyber_package_stock_status', JSON.stringify(updated)); } catch (e) {}

    const targetRef = ref(db, `package_stock_status/${pKey}`);
    set(targetRef, nextStatus);

    setAdminCodeMsg({
      text: nextStatus
        ? `🟢 เปิดรับเติมแพ็กเกจ "${pkgName}" (${gameName}) เรียบร้อยแล้ว (มีสต็อกพร้อมให้บริการ)`
        : `🔴 ตั้งค่าแพ็กเกจ "${pkgName}" (${gameName}) เป็น "สต็อกหมด" เรียบร้อยแล้ว (ลูกค้าจะไม่สามารถกดเติมแพ็กเกจนี้ได้)`,
      type: 'success'
    });
    setTimeout(() => setAdminCodeMsg({ text: '', type: '' }), 5000);
  };

  const handleSetAllPackagesStockForGame = (gameId, gameName, nextStatus) => {
    const targetGame = gamesData.find(g => g.id === gameId);
    if (!targetGame) return;
    const updated = { ...packageStockStatus };
    targetGame.packages.forEach(pkg => {
      const pKey = `${gameId}_${pkg.id}`;
      updated[pKey] = nextStatus;
      set(ref(db, `package_stock_status/${pKey}`), nextStatus);
    });
    setPackageStockStatus(updated);
    try { localStorage.setItem('cyber_package_stock_status', JSON.stringify(updated)); } catch (e) {}

    setAdminCodeMsg({
      text: nextStatus
        ? `🟢 เปิดสต็อกทุกแพ็กเกจของเกม "${gameName}" เรียบร้อยแล้ว (มีของครบทุกแพ็กเกจ)`
        : `🔴 ตั้งสต็อกหมดทุกแพ็กเกจของเกม "${gameName}" เรียบร้อยแล้ว (ปิดรับเติมทุกแพ็กเกจ)`,
      type: 'success'
    });
    setTimeout(() => setAdminCodeMsg({ text: '', type: '' }), 5000);
  };

  const [stockList, setStockList] = useState([]);
  const [stockGame, setStockGame] = useState('VALORANT');
  const [stockPackage, setStockPackage] = useState('1,000 VP');
  const [stockCodesInput, setStockCodesInput] = useState('');
  const [stockMsg, setStockMsg] = useState({ text: '', type: '' });
  const [stockFilterGame, setStockFilterGame] = useState('all');
  const [stockFilterStatus, setStockFilterStatus] = useState('all');
  const [stockPage, setStockPage] = useState(1);
  const [deliveredStockModal, setDeliveredStockModal] = useState(null);

  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [slipVerifying, setSlipVerifying] = useState(false);
  const [slipVerifyStepText, setSlipVerifyStepText] = useState('');
  const [slipVerifyError, setSlipVerifyError] = useState('');

  useEffect(() => {
    const stockRef = ref(db, 'stock');
    const unsubscribe = onValue(stockRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          firebaseKey: key,
          ...data[key]
        }));
        setStockList(list.reverse());
      } else {
        const defaultSamples = [
          { game: 'VALORANT', package: '1,000 VP', code: 'VAL-VP1000-FAST-8891-PROD' },
          { game: 'VALORANT', package: '125 VP', code: 'VAL-VP125-FAST-4420-OK24' },
          { game: 'VALORANT', package: '420 VP', code: 'VAL-VP420-CYBER-9912-FAST' },
          { game: 'ROV (Arena of Valor)', package: '40 Coupons', code: 'ROV-CP40-INSTANT-7712' },
          { game: 'ROV (Arena of Valor)', package: '90 Coupons', code: 'ROV-CP90-PROD-2026' },
          { game: 'Genshin Impact', package: '60 Genesis Crystals', code: 'GENSHIN-60GC-PROD-5501' }
        ];
        const now = new Date();
        const thaiTime = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} 12:00 น.`;
        defaultSamples.forEach(item => {
          push(stockRef, {
            ...item,
            status: 'available',
            createdAt: thaiTime,
            deliveredTo: null,
            orderId: null,
            deliveredAt: null
          });
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddStock = (e) => {
    e.preventDefault();
    setStockMsg({ text: '', type: '' });

    if (!stockPackage) {
      setStockMsg({ text: 'กรุณาเลือกแพ็กเกจที่ต้องการเพิ่มสต็อก', type: 'error' });
      return;
    }

    const lines = stockCodesInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      setStockMsg({ text: 'กรุณากรอกรหัส/โค้ดสินค้าอย่างน้อย 1 รายการ', type: 'error' });
      return;
    }

    const now = new Date();
    const thaiTime = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    const stockRef = ref(db, 'stock');
    lines.forEach(code => {
      push(stockRef, {
        game: stockGame,
        package: stockPackage,
        code: code,
        status: 'available',
        createdAt: thaiTime,
        deliveredTo: null,
        orderId: null,
        deliveredAt: null
      });
    });

    setStockCodesInput('');
    setStockMsg({ text: `✅ เพิ่มรหัสเข้าสต็อกสำเร็จ ${lines.length} รายการ เรียบร้อยแล้ว!`, type: 'success' });
  };

  const handleDeleteStock = (item) => {
    if (item.firebaseKey) {
      const targetRef = ref(db, `stock/${item.firebaseKey}`);
      set(targetRef, null);
    }
  };

  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeGame, setNewCodeGame] = useState('VALORANT');
  const [newCodeReward, setNewCodeReward] = useState('1,000 VP');
  const [newCodeMaxUses, setNewCodeMaxUses] = useState(10);
  const [newCodeMinRank, setNewCodeMinRank] = useState('BRONZE');
  const [isRankSelectOpen, setIsRankSelectOpen] = useState(false);
  const [adminCodeMsg, setAdminCodeMsg] = useState({ text: '', type: '' });
  const [adminGiftCodeSearch, setAdminGiftCodeSearch] = useState('');
  const [adminGiftCodeFilterGame, setAdminGiftCodeFilterGame] = useState('all');
  const [copiedCodeKey, setCopiedCodeKey] = useState(null);
  const [confirmDeleteCodeKey, setConfirmDeleteCodeKey] = useState(null);
  const [confirmClearAllGiftCodes, setConfirmClearAllGiftCodes] = useState(false);
  const [rankTooltipOpen, setRankTooltipOpen] = useState(false);
  const [adminAnalyticsTab, setAdminAnalyticsTab] = useState('all');
  const [showLineModal, setShowLineModal] = useState(false);
  const [copiedLineId, setCopiedLineId] = useState(false);
  const [confirmResetAllSystem, setConfirmResetAllSystem] = useState(false);
  const [confirmDeleteUserKey, setConfirmDeleteUserKey] = useState(null);
  const [adminUserSearch, setAdminUserSearch] = useState('');

  useEffect(() => {
    const found = gamesData.find(g => g.name === newCodeGame);
    if (found && found.packages.length > 0) {
      setNewCodeReward(found.packages[0].name);
    }
  }, [newCodeGame, gamesData]);

  const [showTopupWalletModal, setShowTopupWalletModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [walletPaymentMethod, setWalletPaymentMethod] = useState('qrcode');
  const [walletStep, setWalletStep] = useState(1);
  const [walletTimeLeft, setWalletTimeLeft] = useState(180);
  const [walletSlipFile, setWalletSlipFile] = useState(null);
  const [walletSlipPreview, setWalletSlipPreview] = useState(null);
  const [walletSlipVerifying, setWalletSlipVerifying] = useState(false);
  const [walletSlipError, setWalletSlipError] = useState('');
  const [walletSlipStepText, setWalletSlipStepText] = useState('');
  const [isWalletQrExpired, setIsWalletQrExpired] = useState(false);

  const [truemoneyPhone, setTruemoneyPhone] = useState('');
  const [customerBank, setCustomerBank] = useState('scb');
  const [customerAccountNo, setCustomerAccountNo] = useState('');
  const [trueMoneyOtpStep, setTrueMoneyOtpStep] = useState(false);
  const [trueMoneyOtpCode, setTrueMoneyOtpCode] = useState('');
  const [trueMoneyOtpError, setTrueMoneyOtpError] = useState('');

  const [truemoneyCard14, setTruemoneyCard14] = useState('');


  const [floatingTimer, setFloatingTimer] = useState(0);
  const [activeOrderFirebaseKey, setActiveOrderFirebaseKey] = useState(null);

  const [customerOrderSearch, setCustomerOrderSearch] = useState('');
  const [exactSearchQuery, setExactSearchQuery] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState('all');
  const [customerOrdersPage, setCustomerOrdersPage] = useState(1);
  const [isPastOrdersOpen, setIsPastOrdersOpen] = useState(true);
  const [isAdminOrdersOpen, setIsAdminOrdersOpen] = useState(true);

  const [adminOrdersPage, setAdminOrdersPage] = useState(1);
  const [orders, setOrders] = useState([]);


  // ลิงก์ช่องทางเติมเงินของแอดมินแยกตามเกม ยึดเว็บ LnwTRUE เป็นหลัก (Official & LnwTRUE Top-up Direct Links)
  const officialGameTopupLinks = {
    valorant: {
      name: 'VALORANT',
      provider: 'LnwTrue (เทพทรู Official)',
      url: 'https://www.lnwtrue.com/th/valorant',
      note: 'ใส่ Riot ID เช่น Name#TAG แล้วเลือกแพ็กเกจ VP หรือซื้อ e-Pin'
    },
    rov: {
      name: 'ROV (Arena of Valor)',
      provider: 'LnwTrue (เทพทรู Official)',
      url: 'https://www.lnwtrue.com/th/rov',
      note: 'ใส่ OpenID / UID หรือซื้อ e-Pin เติมคูปองเข้าเกมได้ทันที'
    },
    freefire: {
      name: 'Free Fire',
      provider: 'LnwTrue (เทพทรู Official)',
      url: 'https://www.lnwtrue.com/th/freefire',
      note: 'ใส่ UID ผู้เล่น Free Fire แล้วเลือกจำนวนเพชร หรือซื้อ e-Pin'
    },
    genshin: {
      name: 'Genshin Impact',
      provider: 'LnwTrue (เทพทรู Official)',
      url: 'https://www.lnwtrue.com/th/genshin',
      note: 'ใส่ UID และเลือกเซิร์ฟเวอร์ (เช่น Asia) เติม Genesis Crystals / พรแห่งดวงจันทร์'
    },
    pubg: {
      name: 'PUBG Mobile',
      provider: 'LnwTrue (เทพทรู Official)',
      url: 'https://www.lnwtrue.com/th/pubg-m',
      note: 'ใส่ Player ID ในเกม แล้วเลือกแพ็กเกจ UC จัดส่งทันที'
    },
    lol: {
      name: 'League of Legends (PC)',
      provider: 'LnwTrue (เทพทรู Official)',
      url: 'https://www.lnwtrue.com/th/lol-epin',
      note: 'ซื้อ e-Pin เติม Riot Points (RP) หรือเติมตรงเข้ารหัส'
    },
    fcmobile: {
      name: 'EA SPORTS FC Mobile / FC Online',
      provider: 'LnwTrue (เทพทรู Official)',
      url: 'https://www.lnwtrue.com/th/fc-online-m',
      note: 'ใส่ UID ของผู้เล่นในเกม หรือซื้อ e-Pin เติมแต้ม FC'
    },
    razergold_card: {
      name: 'Razer Gold PIN',
      provider: 'LnwTrue e-Pin Portal',
      url: 'https://www.lnwtrue.com/th/razer-gold-pin',
      note: 'ซื้อรหัส Serial & PIN ส่งให้ลูกค้าทันที'
    }
  };

  const getTopupLinkForGame = (gameName) => {
    if (!gameName) return null;
    const gn = gameName.toLowerCase();
    if (gn.includes('valo')) return officialGameTopupLinks.valorant;
    if (gn.includes('rov')) return officialGameTopupLinks.rov;
    if (gn.includes('free fire') || gn.includes('freefire') || gn.includes('ฟีฟาย')) return officialGameTopupLinks.freefire;
    if (gn.includes('genshin')) return officialGameTopupLinks.genshin;
    if (gn.includes('star rail') || gn.includes('hsr')) return officialGameTopupLinks.hsr;
    if (gn.includes('pubg')) return officialGameTopupLinks.pubg;
    if (gn.includes('league') || gn.includes('lol')) return officialGameTopupLinks.lol;
    if (gn.includes('fc mobile') || gn.includes('fcmobile')) return officialGameTopupLinks.fcmobile;
    if (gn.includes('avatar star') || gn.includes('avatarstar')) return officialGameTopupLinks.avatarstar;
    if (gn.includes('razer') || gn.includes('e-pin') || gn.includes('บัตรเติมเงิน')) return officialGameTopupLinks.razergold_card;
    return null;
  };

  const creditUserWallet = (targetPlayer, amount) => {
    const targetUser = registeredUsers.find(u => 
      (u.username && u.username.toLowerCase() === targetPlayer.toLowerCase()) ||
      (u.email && u.email.toLowerCase() === targetPlayer.toLowerCase())
    );
    if (targetUser && targetUser.firebaseKey) {
      const newBalance = (targetUser.balance || 0) + amount;
      const userRef = ref(db, `users/${targetUser.firebaseKey}/balance`);
      set(userRef, newBalance);
      if (user && user.firebaseKey === targetUser.firebaseKey) {
        const updated = { ...user, balance: newBalance };
        setUser(updated);
        try { localStorage.setItem('cyber_current_logged_user', JSON.stringify(updated)); } catch (e) {}
      }
    }
  };

  const deductUserWallet = (targetPlayer, amount) => {
    const targetUser = registeredUsers.find(u => 
      (u.username && u.username.toLowerCase() === targetPlayer.toLowerCase()) ||
      (u.email && u.email.toLowerCase() === targetPlayer.toLowerCase())
    );
    if (targetUser && targetUser.firebaseKey) {
      const currentBalance = targetUser.balance || 0;
      const newBalance = Math.max(0, currentBalance - amount);
      const userRef = ref(db, `users/${targetUser.firebaseKey}/balance`);
      set(userRef, newBalance);
      if (user && user.firebaseKey === targetUser.firebaseKey) {
        const updated = { ...user, balance: newBalance };
        setUser(updated);
        try { localStorage.setItem('cyber_current_logged_user', JSON.stringify(updated)); } catch (e) {}
      }
      return newBalance;
    }
    return null;
  };

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderList = Object.keys(data).map(key => ({
          firebaseKey: key,
          ...data[key]
        }));
        setOrders(orderList.reverse());
      } else {
        setOrders([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const createRealtimeOrder = (newOrderObj) => {
    const ordersRef = ref(db, 'orders');
    const newRef = push(ordersRef, newOrderObj);
    return newRef.key;
  };

  const updateRealtimeOrderStatus = (firebaseKey, newStatus) => {
    const orderRef = ref(db, `orders/${firebaseKey}/status`);
    set(orderRef, newStatus);
  };

  // ระบบความปลอดภัย: ปิดการอนุมัติเงินอัตโนมัติแบบ 10 วินาทีทิ้ง
  // ยอดเงินจะเข้าได้เฉพาะเมื่อ SlipOK ตรวจสอบสลิปผ่านจริง 100% หรือแอดมินกดอนุมัติในหน้าหลังบ้านเท่านั้น!
  useEffect(() => {
    // ไม่อนุมัติเงินแบบสุ่มสี่สุ่มห้าเด็ดขาด
  }, []);

  useEffect(() => {
    if (activeOrderFirebaseKey) {
      const currentOrd = orders.find(o => o.firebaseKey === activeOrderFirebaseKey);
      if (currentOrd && !currentOrd.status.includes('รอตรวจสอบ') && !currentOrd.status.includes('รอแอดมิน')) {
        setFloatingTimer(0);
        setActiveOrderFirebaseKey(null);
        if (currentOrd.type === 'game' && currentOrd.status.includes('AUTO 100%')) {
          setDeliveredStockModal({
            orderId: currentOrd.id,
            game: currentOrd.game,
            package: currentOrd.package,
            bonus: currentOrd.bonus || '',
            gameChar: currentOrd.gameChar,
            apiRef: currentOrd.apiRef,
            code: null
          });
        }
      }
    }
  }, [orders, activeOrderFirebaseKey]);

  useEffect(() => {
    let fTimer;
    if (floatingTimer > 0) {
      fTimer = setInterval(() => {
        setFloatingTimer((prev) => {
          if (prev <= 1) {
            setActiveOrderFirebaseKey(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(fTimer);
  }, [floatingTimer]);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('cyber_is_admin_logged') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('cyber_is_admin_logged', isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('cyber_admin_pin') || '123456';
  });
  const [inputAdminPin, setInputAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');
  const [changePinMessage, setChangePinMessage] = useState({ text: '', type: '' });

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutPassword, setCheckoutPassword] = useState('');
  const [showCheckoutPassword, setShowCheckoutPassword] = useState(false);
  const [checkoutPasswordError, setCheckoutPasswordError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isQrExpired, setIsQrExpired] = useState(false);

  const [adPlatform, setAdPlatform] = useState('Facebook Ads');
  const [adAmountInput, setAdAmountInput] = useState('');
  const [adPage, setAdPage] = useState(1);
  const [adPromotions, setAdPromotions] = useState(() => {
    const savedPromos = localStorage.getItem('cyber_ad_promotions_list');
    if (savedPromos) {
      try { return JSON.parse(savedPromos); } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cyber_ad_promotions_list', JSON.stringify(adPromotions));
  }, [adPromotions]);

  const adExpense = adPromotions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleAddAdPromotion = (e) => {
    e.preventDefault();
    const amt = parseFloat(adAmountInput);
    if (isNaN(amt) || amt <= 0) {
      return;
    }

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const thaiTime = `${day}/${month}/${year} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    const newItem = {
      id: Date.now().toString(),
      platform: adPlatform,
      amount: amt,
      time: thaiTime
    };

    setAdPromotions([newItem, ...adPromotions]);
    setAdAmountInput('');
    setAdPage(1);
  };

  const handleDeleteAdPromotion = (id) => {
    setAdPromotions(adPromotions.filter(item => item.id !== id));
  };

  const handleClearAllAdPromotions = () => {
    setAdPromotions([]);
    setAdPage(1);
  };

  const adItemsPerPage = 5;
  const totalAdPages = Math.ceil(adPromotions.length / adItemsPerPage) || 1;
  const paginatedAdPromotions = adPromotions.slice((adPage - 1) * adItemsPerPage, adPage * adItemsPerPage);

  const totalAdminSales = orders.reduce((sum, ord) => sum + (ord.type === 'game' ? ord.price : 0), 0);
  const totalAdminProfits = orders.reduce((sum, ord) => sum + (ord.profit || 0), 0);

  const netProfitAfterAd = Math.max(0, totalAdminProfits - (parseFloat(adExpense) || 0));

  const isVatThresholdReached = totalAdminSales >= 1800000;
  const totalAdminVat = isVatThresholdReached ? Math.round(netProfitAfterAd * 0.07) : 0;

  const profitForTaxCalculation = netProfitAfterAd - totalAdminVat;
  const taxableIncome = Math.max(0, profitForTaxCalculation - 150000);

  let calculatedTax = 0;
  if (taxableIncome > 0 && taxableIncome <= 150000) {
    calculatedTax = taxableIncome * 0.05;
  } else if (taxableIncome > 150000 && taxableIncome <= 350000) {
    calculatedTax = 7500 + (taxableIncome - 150000) * 0.10;
  } else if (taxableIncome > 350000 && taxableIncome <= 600000) {
    calculatedTax = 27500 + (taxableIncome - 350000) * 0.15;
  } else if (taxableIncome > 600000) {
    calculatedTax = 65000 + (taxableIncome - 600000) * 0.20;
  }
  const totalAdminTax = Math.round(calculatedTax);

  const paymentMethods = [
    { id: 'wallet', name: 'Cat Coin Wallet (เหรียญร้าน 🐱🪙)', desc: 'หักจากยอดเหรียญ Cat Coin ในบัญชีทันที (โอนไว ปลอดภัย 100%)' },
    { id: 'qrcode', name: 'โอนเงินธนาคาร (SCB) / พร้อมเพย์', desc: 'สแกน QR พร้อมเพย์ หรือโอนเลขบัญชี SCB (ตรวจสลิป 24 ชม.)' },
    { id: 'true', name: 'TrueMoney Wallet', desc: 'โอนเข้าวอลเล็ต 063-880-1739 (ฟรี 0%)' },
    { id: 'truemoneycard', name: 'บัตรเติมเงินทรูมันนี่', desc: 'เติมด้วยรหัสบัตร 14 หลัก' }
  ];

  const EyeIcon = ({ show }) => show ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  useEffect(() => {
    let timer;
    if (showCheckoutModal && checkoutStep === 2 && (selectedPayment?.id === 'qrcode' || selectedPayment?.id === 'true') && !isQrExpired) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { clearInterval(timer); setIsQrExpired(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showCheckoutModal, checkoutStep, selectedPayment, isQrExpired]);

  useEffect(() => {
    let timer;
    if (showTopupWalletModal && walletStep === 2 && (walletPaymentMethod === 'qrcode' || walletPaymentMethod === 'true') && !isWalletQrExpired) {
      timer = setInterval(() => {
        setWalletTimeLeft((prev) => {
          if (prev <= 1) { clearInterval(timer); setIsWalletQrExpired(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showTopupWalletModal, walletStep, walletPaymentMethod, isWalletQrExpired]);

  const handleLogout = () => {
    signOut(auth).catch(() => {});
    setUser(null);
    localStorage.removeItem('cyber_current_logged_user');
    setIsAdminLoggedIn(false);
    localStorage.removeItem('cyber_is_admin_logged');
    setPasswordInput('');
    setShowLoginPassword(false);
    setRegPasswordInput('');
    setConfirmPasswordInput('');
    setEmailInput('');
    setActiveTab('shop');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminPinError('');
    if (inputAdminPin === adminPin) {
      setIsAdminLoggedIn(true);
      setInputAdminPin('');
    } else {
      setAdminPinError('รหัส PIN ไม่ถูกต้อง');
    }
  };

  const handleChangePinSubmit = (e) => {
    e.preventDefault();
    setChangePinMessage({ text: '', type: '' });

    if (oldPinInput !== adminPin) {
      setChangePinMessage({ text: 'รหัส PIN เดิมไม่ถูกต้อง', type: 'error' });
      return;
    }
    if (newPinInput.length !== 6) {
      setChangePinMessage({ text: 'รหัส PIN ใหม่ต้องมี 6 หลัก', type: 'error' });
      return;
    }
    if (newPinInput !== confirmNewPinInput) {
      setChangePinMessage({ text: 'รหัส PIN ใหม่และยืนยันรหัส PIN ไม่ตรงกัน', type: 'error' });
      return;
    }

    setAdminPin(newPinInput);
    localStorage.setItem('cyber_admin_pin', newPinInput);
    setChangePinMessage({ text: 'เปลี่ยนรหัส PIN สำเร็จเรียบร้อย!', type: 'success' });
    setOldPinInput('');
    setNewPinInput('');
    setConfirmNewPinInput('');
  };

  const handleCreateGiftCode = (e) => {
    e.preventDefault();
    setAdminCodeMsg({ text: '', type: '' });

    if (!newCodeName.trim()) {
      setAdminCodeMsg({ text: 'กรุณากรอกชื่อโค้ดของขวัญที่ต้องการสร้าง (ไม่อนุญาตให้ระบบสุ่มสร้างอัตโนมัติ)', type: 'error' });
      return;
    }

    if (!newCodeReward.trim() || newCodeMaxUses <= 0) {
      setAdminCodeMsg({ text: 'กรุณาเลือกแพ็กเกจและจำนวนสิทธิ์ให้ถูกต้อง', type: 'error' });
      return;
    }

    const cleanCode = newCodeName.trim().toUpperCase();
    if (giftCodes.some(c => c.code === cleanCode)) {
      setAdminCodeMsg({ text: 'โค้ดนี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่อโค้ดอื่น', type: 'error' });
      return;
    }

    const newCodeObj = {
      code: cleanCode,
      game: newCodeGame,
      reward: newCodeReward,
      minRank: newCodeMinRank || 'BRONZE',
      maxUses: parseInt(newCodeMaxUses),
      usedCount: 0,
      timestamp: Date.now()
    };

    const giftCodesRef = ref(db, 'giftCodes');
    push(giftCodesRef, newCodeObj)
      .then(() => {
        const rankName = RANK_TIERS.find(t => t.tier === (newCodeMinRank || 'BRONZE'))?.name || 'ทุกระดับแรงค์';
        setAdminCodeMsg({ text: `สร้างโค้ด ${cleanCode} (สำหรับ ${rankName}) สำเร็จเรียบร้อย!`, type: 'success' });
        setNewCodeName('');
        setNewCodeMaxUses(10);
        setNewCodeMinRank('BRONZE');
      })
      .catch(() => {
        setAdminCodeMsg({ text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', type: 'error' });
      });
  };

  const handleDeleteGiftCode = (codeItem) => {
    const keyToDelete = codeItem.firebaseKey;
    const codeToDelete = codeItem.code;

    // 1. ลบออกจาก State ทันทีเพื่อให้การ์ดหายไปแบบเรียลไทม์ทันใจ (Optimistic Update)
    setGiftCodes((prev) =>
      prev.filter((c) => (keyToDelete ? c.firebaseKey !== keyToDelete : c.code !== codeToDelete))
    );
    setConfirmDeleteCodeKey(null);

    // 2. ส่งคำสั่งลบถาวรไปยัง Firebase Realtime Database
    if (keyToDelete) {
      const targetRef = ref(db, `giftCodes/${keyToDelete}`);
      remove(targetRef)
        .then(() => {
          setAdminCodeMsg({ text: `🗑️ ลบโค้ด "${codeToDelete}" ออกจากระบบถาวรเรียบร้อยแล้ว`, type: 'success' });
          setTimeout(() => setAdminCodeMsg({ text: '', type: '' }), 4000);
        })
        .catch((err) => {
          console.error("Firebase remove error:", err);
          set(targetRef, null);
          setAdminCodeMsg({ text: `🗑️ ลบโค้ด "${codeToDelete}" เรียบร้อยแล้ว`, type: 'success' });
          setTimeout(() => setAdminCodeMsg({ text: '', type: '' }), 4000);
        });
    } else {
      setAdminCodeMsg({ text: `🗑️ ลบโค้ด "${codeToDelete}" เรียบร้อยแล้ว`, type: 'success' });
      setTimeout(() => setAdminCodeMsg({ text: '', type: '' }), 4000);
    }
  };

  const handleClearAllGiftCodes = () => {
    // ล้างข้อมูลทั้งหมดในระบบให้เหลือ 0 ทันที
    setGiftCodes([]);
    setConfirmClearAllGiftCodes(false);

    const allGiftCodesRef = ref(db, 'giftCodes');
    remove(allGiftCodesRef)
      .then(() => {
        setAdminCodeMsg({ text: '🗑️ ลบโค้ดของขวัญทั้งหมดในระบบให้เหลือ 0 เรียบร้อยแล้ว! แอดมินสามารถสร้างโค้ดใหม่ได้ตามต้องการ', type: 'success' });
        setTimeout(() => setAdminCodeMsg({ text: '', type: '' }), 5000);
      })
      .catch((err) => {
        set(allGiftCodesRef, null);
        setAdminCodeMsg({ text: '🗑️ ลบโค้ดของขวัญทั้งหมดให้เหลือ 0 เรียบร้อยแล้ว', type: 'success' });
        setTimeout(() => setAdminCodeMsg({ text: '', type: '' }), 5000);
      });
  };

  const handleResetAllRedeemRights = () => {
    setGlobalRedeemedPlayers([]);
    try { localStorage.removeItem('cyber_global_redeemed_players'); } catch (e) {}
    setAdminCodeMsg({ 
      text: '✅ รีเซ็ตสิทธิ์การรับของขวัญของทุกบัญชีและทุก ID เกมเรียบร้อยแล้ว (ลูกค้าทุกคนสามารถรับของขวัญรอบใหม่ได้ทันที)', 
      type: 'success' 
    });
    setTimeout(() => setAdminCodeMsg({ text: '', type: '' }), 5000);
  };

  const handleRedeemEventCode = (e) => {
    e.preventDefault();
    setEventMsg({ text: '', type: '' });

    if (!eventPlayerId.trim()) {
      setEventMsg({ text: '⚠️ กรุณากรอก ชื่อในเกม หรือ UID ตัวละครที่ต้องการรับรางวัลให้เรียบร้อย', type: 'error' });
      return;
    }

    if (!eventGiftCode.trim()) {
      setEventMsg({ text: '⚠️ กรุณากรอกรหัสโค้ดของขวัญที่ได้รับ (พิมพ์ตัวพิมพ์ใหญ่ทั้งหมด เช่น GIFT2026)', type: 'error' });
      return;
    }

    const cleanPlayerId = eventPlayerId.trim().toLowerCase();
    const currentUsername = user && user.username ? user.username.trim().toLowerCase() : '';
    const targetCode = eventGiftCode.trim().toUpperCase();
    const foundCode = giftCodes.find(c => c.code && c.code.trim().toUpperCase() === targetCode);

    // 1. ตรวจสอบว่าพบโค้ดในระบบหรือไม่
    if (!foundCode) {
      setEventMsg({ 
        text: `❌ ไม่พบรหัสโค้ด "${targetCode}" ในระบบ: กรุณาตรวจสอบตัวสะกด พิมพ์ตัวพิมพ์ใหญ่ หรือสอบถามโค้ดที่ถูกต้องจากผู้ดูแลระบบ`, 
        type: 'error' 
      });
      return;
    }

    // 2. ตรวจสอบว่าเกมตรงกับที่เลือกหรือไม่
    if (foundCode.game !== eventGame) {
      setEventMsg({ 
        text: `⚠️ เกมไม่ถูกต้อง: โค้ด "${foundCode.code}" เป็นสิทธิ์สำหรับเกม "${foundCode.game}" เท่านั้น ไม่สามารถใช้กับ "${eventGame}" ได้ กรุณาเปลี่ยนตัวเลือกเกมด้านบนให้ตรงกับโค้ด`, 
        type: 'error' 
      });
      return;
    }

    // 3. ตรวจสอบจำนวนสิทธิ์ของโค้ด
    if ((foundCode.usedCount || 0) >= (foundCode.maxUses || 0)) {
      setEventMsg({ 
        text: `⚠️ สิทธิ์โค้ดเต็มแล้ว: โค้ดของขวัญ "${foundCode.code}" มีผู้ใช้สิทธิ์ครบจำนวนเต็ม (${foundCode.maxUses} สิทธิ์) แล้ว กรุณารอกิจกรรมรอบใหม่ หรือติดตามโค้ดอัปเดตทาง LINE Official`, 
        type: 'error' 
      });
      return;
    }

    // 4. ตรวจสอบระดับแรงค์ขั้นต่ำของลูกค้า (Rank Eligibility Check)
    const minTierKey = foundCode.minRank || 'BRONZE';
    const requiredTierObj = RANK_TIERS.find(t => t.tier === minTierKey) || RANK_TIERS[RANK_TIERS.length - 1];
    
    if (currentUserRank.level < requiredTierObj.level) {
      const remainingToTier = Math.max(0, requiredTierObj.minSpend - currentUserSpending);
      setEventMsg({ 
        text: `🔒 สิทธิ์ไม่เพียงพอ: โค้ด "${foundCode.code}" สงวนสิทธิ์เฉพาะสมาชิกระดับ "${requiredTierObj.name} ขึ้นไป" (ปัจจุบันคุณอยู่ระดับ "${currentUserRank.name}") 💡 คุณสามารถสะสมยอดเติมแพ็กเกจเกมอีกเพียง ฿${remainingToTier.toLocaleString()} เพื่อเลื่อนเป็นระดับ ${requiredTierObj.name} และรับสิทธิ์โค้ดนี้ได้ทันที`, 
        type: 'error' 
      });
      return;
    }

    // 5. ระบบกันการสุ่มกรอก / กันตัวไก่: 1 บัญชีผู้ใช้ หรือ 1 UID รับได้ครั้งเดียวจนกว่าแอดมินจะรีเซ็ต
    const isUidUsed = globalRedeemedPlayers.includes(cleanPlayerId);
    const isAccountUsed = currentUsername && globalRedeemedPlayers.includes(currentUsername);

    if (isUidUsed || isAccountUsed) {
      const usedTarget = isAccountUsed ? `บัญชีของคุณ (${user.username})` : `ID เกม (${eventPlayerId.trim()})`;
      setEventMsg({ 
        text: `⚠️ สิทธิ์ถูกใช้งานแล้ว: ${usedTarget} ได้รับสิทธิ์แพ็กเกจของขวัญกิจกรรมไปแล้ว (จำกัด 1 สิทธิ์ต่อบัญชีและไอดีเกม เพื่อป้องกันการสแปมไอดีไก่) 🔄 กรุณารอแอดมินรีเซ็ตสิทธิ์กิจกรรมรอบถัดไป หรือติดต่อแอดมินทาง LINE Official`, 
        type: 'error' 
      });
      return;
    }

    // บันทึกสิทธิ์ป้องกันการกรอกซ้ำทั้ง UID และ Username
    const updatedRedeemed = [...globalRedeemedPlayers, cleanPlayerId];
    if (currentUsername && !updatedRedeemed.includes(currentUsername)) {
      updatedRedeemed.push(currentUsername);
    }
    setGlobalRedeemedPlayers(updatedRedeemed);

    // ปรับจำนวนครั้งที่ใช้งานใน Firebase
    if (foundCode.firebaseKey) {
      const codeUsedRef = ref(db, `giftCodes/${foundCode.firebaseKey}/usedCount`);
      set(codeUsedRef, (foundCode.usedCount || 0) + 1);
    }

    const newOrderId = 'ORD-EVT-' + Math.floor(10000 + Math.random() * 90000);
    const apiRef = 'API-GIFT-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const thaiTime = `${day}/${month}/${year} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
    const dateKey = `${year}-${month}-${day}`;

    const newEventOrder = {
      id: newOrderId,
      game: `${eventGame}`,
      package: `โค้ดของขวัญ: ${foundCode.reward} [ระดับ ${requiredTierObj.shortName}]`,
      price: 0,
      profit: 0,
      player: user ? user.username : eventPlayerId.trim(),
      gameChar: eventPlayerId.trim(),
      paymentMethod: `🎁 โค้ดของขวัญ (${foundCode.code})`,
      status: '✅ สำเร็จ (แลกรับของขวัญแล้ว)',
      apiRef: apiRef,
      deliveryType: 'GIFT_CODE',
      type: 'event',
      time: thaiTime,
      dateKey: dateKey,
      timestamp: Date.now()
    };

    createRealtimeOrder(newEventOrder);

    setEventMsg({ 
      text: `🎉 แลกรับโค้ดของขวัญ "${foundCode.code}" (${foundCode.reward}) สำเร็จเรียบร้อยแล้ว! ข้อมูลได้ถูกบันทึกและส่งมอบให้ ID "${eventPlayerId.trim()}" เรียบร้อยแล้ว`, 
      type: 'success' 
    });
    setEventGiftCode('');
    setEventPlayerId('');
  };

  const handleWalletNextStep = () => {
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      return;
    }

    if (walletPaymentMethod === 'truemoneycard' && (!truemoneyCard14 || truemoneyCard14.length < 14)) {
      return;
    }

    setWalletTimeLeft(180);
    setIsWalletQrExpired(false);
    
    if (walletPaymentMethod === 'qrcode' || walletPaymentMethod === 'true') {
      setWalletStep(2);
    } else {
      handleWalletConfirmPayment();
    }
  };

  const sendLineOrderNotification = async (orderData) => {
    try {
      const endpoint = ['/api', 'line-webhook'].join('/');
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
    } catch (err) {
      console.warn('Line notification trigger note:', err);
    }
  };

  const handleTrueMoneyOtpSubmit = (e) => {
    e.preventDefault();
    setTrueMoneyOtpError('');

    if (!trueMoneyOtpCode || trueMoneyOtpCode.length !== 6) {
      setTrueMoneyOtpError('กรุณากรอกรหัส OTP 6 หลักให้ถูกต้อง');
      return;
    }

    setTrueMoneyOtpStep(false);

    if (showCheckoutModal) {
      handleFinalPaymentSubmit();
    } else {
      handleWalletConfirmPayment();
    }
  };

  const handleWalletConfirmPayment = () => {
    const amt = parseFloat(topupAmount) || 0;
    const newOrderId = 'ORD-W-' + Math.floor(10000 + Math.random() * 90000);
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const thaiTime = `${day}/${month}/${year} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
    const dateKey = `${year}-${month}-${day}`;

    const paymentLabelMap = {
      qrcode: 'QR PromptPay (เติมเครดิต)',
      true: 'TrueMoney Wallet (เติมเครดิต)',
      truemoneycard: 'บัตรทรูมันนี่ (เติมเครดิต)'
    };

    const targetUsername = user ? user.username : 'user11';

    const newWalletOrder = {
      id: newOrderId,
      game: `เติมเครดิตร้าน`,
      package: `+฿${amt.toLocaleString()}`,
      price: amt,
      profit: 0,
      player: targetUsername,
      gameChar: 'เติมเครดิตร้าน',
      paymentMethod: paymentLabelMap[walletPaymentMethod] || walletPaymentMethod.toUpperCase(),
      status: '⏳ รอตรวจสอบยอดเงิน',
      type: 'wallet',
      time: thaiTime,
      dateKey: dateKey,
      timestamp: Date.now()
    };

    const newKey = createRealtimeOrder(newWalletOrder);
    sendLineOrderNotification(newWalletOrder);
    setFloatingTimer(10);
    setActiveOrderFirebaseKey(newKey);
    setActiveTab('track');

    setShowTopupWalletModal(false);
    setWalletStep(1);
    setTopupAmount('');
    setTruemoneyPhone('');
    setTrueMoneyOtpStep(false);
    setTrueMoneyOtpCode('');
    setTruemoneyCard14('');
  };

    // ฟังก์ชันตรวจสอบสลิปสำหรับเติมเครดิตเข้า Cyber Wallet ผ่าน SlipOK จริง
  const handleWalletSlipScan = async (uploadedFile = null) => {
    const file = uploadedFile || walletSlipFile;
    if (!file && !walletSlipPreview) {
      setWalletSlipError('กรุณาเลือกรูปภาพสลิปโอนเงินก่อนทำการตรวจสอบ');
      return;
    }

    const amt = parseFloat(topupAmount) || 0;
    if (amt <= 0) {
      setWalletSlipError('จำนวนเงินไม่ถูกต้อง');
      return;
    }

    setWalletSlipVerifying(true);
    setWalletSlipError('');
    setWalletSlipStepText('🔍 กำลังเชื่อมต่อระบบ SlipOK ตรวจสอบสลิป...');

    const fileToBase64 = (f) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
      });
    };

    try {
      let imageBase64Data = '';
      if (file instanceof File || file instanceof Blob) {
        imageBase64Data = await fileToBase64(file);
      } else if (typeof walletSlipPreview === 'string' && walletSlipPreview.startsWith('data:')) {
        imageBase64Data = walletSlipPreview;
      }

      setWalletSlipStepText('🏦 กำลังตรวจสอบยอดเงินเข้าบัญชี SCB / พร้อมเพย์ กับธนาคารผ่าน SlipOK...');

      const result = await verifySlipWithSlipOK(imageBase64Data, amt, {
        orderId: 'W-TOPUP-' + Date.now(),
        userId: user?.firebaseKey || (user?.username ? user.username : 'guest'),
        game: 'เติมเครดิตร้าน',
        packageItem: `+฿${amt.toLocaleString()}`,
        playerId: user?.username || 'member',
      });

      if (result.success) {
        setWalletSlipStepText('✅ ตรวจสอบสลิปสำเร็จ! ยอดเงินเข้าบัญชีเรียบร้อย กำลังเพิ่มเครดิต...');
        
        // เติมเงินเข้ากระเป๋าจริง
        const targetUsername = user ? user.username : 'user11';
        creditUserWallet(targetUsername, amt);

        // บันทึกออเดอร์ประวัติ
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const thaiTime = `${day}/${month}/${year} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
        const dateKey = `${year}-${month}-${day}`;

        const newWalletOrder = {
          id: 'ORD-W-' + Math.floor(10000 + Math.random() * 90000),
          game: 'เติมเครดิตร้าน',
          package: `+฿${amt.toLocaleString()}`,
          price: amt,
          profit: 0,
          player: targetUsername,
          gameChar: 'เติมเครดิตร้าน',
          paymentMethod: walletPaymentMethod === 'true' ? 'TrueMoney Wallet (SlipOK ผ่าน)' : 'โอนเงินธนาคาร (SlipOK ผ่าน)',
          status: '✅ เติมเครดิตสำเร็จ (SlipOK ตรวจสอบแล้ว)',
          type: 'wallet',
          time: thaiTime,
          dateKey: dateKey,
          timestamp: Date.now()
        };
        createRealtimeOrder(newWalletOrder);
        sendLineOrderNotification(newWalletOrder);

        setTimeout(() => {
          setWalletSlipVerifying(false);
          setShowTopupWalletModal(false);
          setWalletStep(1);
          setTopupAmount('');
          setWalletSlipFile(null);
          setWalletSlipPreview(null);
          alert(`🎉 ตรวจสอบสลิปสำเร็จ! เติมเครดิตเข้ากระเป๋าจำนวน ฿${amt.toLocaleString()} เรียบร้อยแล้วครับ`);
        }, 800);
      } else {
        setWalletSlipVerifying(false);
        setWalletSlipError(`❌ ${result.message || 'สลิปไม่ถูกต้อง ยอดเงินไม่ตรง หรือไม่ได้โอนเข้าบัญชี SCB / พร้อมเพย์ ของร้าน'}`);
      }
    } catch (err) {
      console.warn('Wallet verify slip error:', err);
      setWalletSlipVerifying(false);
      setWalletSlipError(`⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อตรวจสอบสลิป: ${err.message || 'Network Error'}`);
    }
  };

  const resetWalletModal = () => {
    setShowTopupWalletModal(false);
    setWalletStep(1);
    setTopupAmount('');
    setWalletTimeLeft(180);
    setIsWalletQrExpired(false);
    setTruemoneyPhone('');
    setTrueMoneyOtpStep(false);
    setTrueMoneyOtpCode('');
    setTrueMoneyOtpError('');
    setTruemoneyCard14('');
  };

  const handleStartGamePayment = () => {
    if (!playerId.trim()) {
      return;
    }
    setCheckoutPasswordError('');
    
    const totalPrice = selectedPackage.price * packageQuantity;
    if (selectedPayment.id === 'wallet') {
      if (!user) {
        alert('กรุณาเข้าสู่ระบบก่อน เพื่อชำระเงินด้วย Cat Coin วอลเล็ต');
        setShowAuthModal(true);
        return;
      }
      if ((user.balance || 0) < totalPrice) {
        alert('ยอดเงินคงเหลือในกระเป๋าไม่เพียงพอ');
        return;
      }
    }

    if (selectedPayment.id === 'qrcode' || selectedPayment.id === 'true') {
      setTimeLeft(300);
      setIsQrExpired(false);
      setCheckoutStep(2); // ข้ามไปหน้าแนบสลิปทันที ไม่ต้องถามรหัสผ่านเว็บ
      setShowCheckoutModal(true);
    } else if (selectedPayment.id === 'wallet') {
      setTimeLeft(180);
      setIsQrExpired(false);
      setCheckoutStep(1);
      setShowCheckoutModal(true);
    } else {
      handleFinalPaymentSubmit();
    }
  };

  const handleVerifyPasswordStep = (e) => {
    e.preventDefault();
    setCheckoutPasswordError('');

    if (checkoutPassword !== user.password) {
      setCheckoutPasswordError('รหัสผ่านบัญชีไม่ถูกต้อง');
      return;
    }

    if (selectedPayment.id === 'qrcode') {
      setCheckoutStep(2);
    } else {
      handleFinalPaymentSubmit();
    }
  };

  const handleFinalPaymentSubmit = () => {
    const totalPrice = selectedPackage.price * packageQuantity;
    const totalProfit = (selectedPackage.profit || Math.round(selectedPackage.price * 0.15)) * packageQuantity;

    if (selectedPayment.id === 'wallet' && user && user.firebaseKey) {
      if ((user.balance || 0) < totalPrice) {
        return;
      }
      const newBalance = user.balance - totalPrice;
      const userRef = ref(db, `users/${user.firebaseKey}/balance`);
      set(userRef, newBalance);
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
            setShowAuthModal(false);
      try { localStorage.setItem('cyber_current_logged_user', JSON.stringify(updatedUser)); } catch (e) {}
    }

    setIsProcessing(true);

    setTimeout(() => {
      const newOrderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
      const apiRef = 'API-DIRECT-' + Math.floor(100000 + Math.random() * 900000);
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const thaiTime = `${day}/${month}/${year} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
      const dateKey = `${year}-${month}-${day}`;

      const targetGameChar = playerId.trim();
      const pkgSummary = `${selectedPackage.name} (x${packageQuantity} แพ็ก)`;
      const initialStatus = '⏳ รอตรวจสอบยอดเงิน';

      const newOrder = {
        id: newOrderId,
        game: selectedGame.name,
        package: pkgSummary,
        bonus: selectedPackage.bonus || '',
        price: totalPrice,
        profit: totalProfit,
        player: user ? user.username : 'user11',
        gameChar: targetGameChar,
        paymentMethod: selectedPayment.name,
        status: initialStatus,
        apiRef: apiRef,
        deliveryType: 'DIRECT_UID_AUTO_100',
        deliveredCode: null,
        type: 'game',
        time: thaiTime,
        dateKey: dateKey,
        timestamp: Date.now(),
      };

      const newKey = createRealtimeOrder(newOrder);
      setFloatingTimer(10);
      setActiveOrderFirebaseKey(newKey);

      sendLineOrderNotification({
        orderId: newOrderId,
        game: selectedGame.name,
        packageName: pkgSummary,
        price: totalPrice,
        player: user ? user.username : 'user11',
        gameChar: targetGameChar,
        paymentMethod: selectedPayment.name,
        apiRef: apiRef,
        deliveryMode: 'AUTO_100_DIRECT_UID'
      });

      setIsProcessing(false);
      setShowCheckoutModal(false);
      setCheckoutStep(1);
      setCheckoutPassword('');
      setPackageQuantity(1);
      setTruemoneyPhone('');
      setTruemoneyCard14('');
      setSlipFile(null);
      setSlipPreview(null);
      setSlipVerifying(false);
      setActiveTab('track');
    }, 900);
  };
  // ฟังก์ชันตรวจสอบสลิปจริง โดยส่งข้อมูลไปยัง /api/verify-slip บนเซิร์ฟเวอร์
  const handleSimulateSlipScan = async (uploadedFile = null) => {
    const file = uploadedFile || slipFile;
    if (!file && !slipPreview) {
      setSlipVerifyError('กรุณาเลือกรูปภาพสลิปโอนเงินก่อนทำการตรวจสอบ');
      return;
    }

    setSlipVerifying(true);
    setSlipVerifyError('');
    setSlipVerifyStepText('🔍 กำลังเชื่อมต่อระบบเซิร์ฟเวอร์ตรวจสอบสลิป (/api/verify-slip)...');

    const expectedAmount = selectedPackage ? (selectedPackage.price * packageQuantity) : 0;
    const generatedOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    // ฟังก์ชันแปลง File เป็น Base64
    const fileToBase64 = (f) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
      });
    };

    try {
      let imageBase64Data = '';
      if (file instanceof File || file instanceof Blob) {
        imageBase64Data = await fileToBase64(file);
      } else if (typeof slipPreview === 'string' && slipPreview.startsWith('data:')) {
        imageBase64Data = slipPreview;
      }

      setSlipVerifyStepText('🏦 กำลังส่งภาพสลิปให้ระบบตรวจสอบกับธนาคารและตัดยอดผ่าน SlipOK...');

      const result = await verifySlipWithSlipOK(imageBase64Data, expectedAmount, {
        orderId: generatedOrderId,
        userId: user?.firebaseKey || (user?.username ? user.username : 'guest_user'),
        game: selectedGame?.name || 'เกม',
        packageItem: selectedPackage?.name || 'แพ็กเกจ',
        playerId: playerId.trim() || 'UID',
      });

      if (result.success) {
        setSlipVerifyStepText('✅ ตรวจสอบสลิปสำเร็จ! ยอดเงินถูกต้อง กำลังส่งมอบแพ็กเกจเข้าไอดีเกม...');
        setTimeout(() => {
          handleFinalPaymentSubmit();
        }, 600);
        return;
      } else {
        setSlipVerifying(false);
        setSlipVerifyError(`❌ ${result.message || 'สลิปไม่ถูกต้อง หรือยอดเงินไม่ตรงกับราคาแพ็กเกจ'}`);
        return;
      }
    } catch (err) {
      console.warn('Call /api/verify-slip encountered network error:', err);
      setSlipVerifying(false);
      setSlipVerifyError(`⚠️ ไม่สามารถเชื่อมต่อกับ /api/verify-slip ได้ (${err.message || 'Network Error'}) กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดใช้งานแล้ว`);
    }
  };

  // ฟังก์ชันรีเซ็ตเครดิตและประวัติคำสั่งซื้อทุกไอดีให้เหลือ 0 แต่ยังคงบัญชีไว้ และลบ nattapong ให้สมัครใหม่
  const handleExecuteResetAll = () => {
    setConfirmResetAllSystem(false);
    registeredUsers.forEach(u => {
      if (u.firebaseKey) {
        if (u.username?.toLowerCase() === 'nattapong' || u.email?.toLowerCase().includes('nattapong')) {
          remove(ref(db, `users/${u.firebaseKey}`));
        } else {
          set(ref(db, `users/${u.firebaseKey}/balance`), 0);
        }
      }
    });
    remove(ref(db, 'orders'));
    setOrders([]);
    if (user) {
      if (user.username?.toLowerCase() === 'nattapong') {
        setUser(null);
        localStorage.removeItem('cyber_current_logged_user');
      } else {
        const resetU = { ...user, balance: 0 };
        setUser(resetU);
        try { localStorage.setItem('cyber_current_logged_user', JSON.stringify(resetU)); } catch (e) {}
      }
    }
    setAdminCodeMsg({
      text: '✅ รีเซ็ตยอดเครดิตและประวัติออเดอร์ทุกไอดีให้เหลือ 0 สำเร็จเรียบร้อยแล้ว (บัญชีเดิมยังคงอยู่ครบถ้วน) และลบไอดี nattapong ให้สมัครใหม่ได้แล้ว',
      type: 'success'
    });
    setTimeout(() => setAdminCodeMsg({ text: '', type: '' }), 6000);
  };

  // ฟังก์ชันลบบัญชีผู้ใช้รายบุคคล (เช่น ลบไอดี nattapong หรือไอดีอื่นๆ เพื่อให้สมัครใหม่)
  const handleDeleteUserAccount = (targetUser) => {
    if (targetUser && targetUser.firebaseKey) {
      remove(ref(db, `users/${targetUser.firebaseKey}`))
        .then(() => {
          setRegisteredUsers(prev => prev.filter(u => u.firebaseKey !== targetUser.firebaseKey));
          if (user && user.firebaseKey === targetUser.firebaseKey) {
            setUser(null);
            localStorage.removeItem('cyber_current_logged_user');
          }
          setAdminCodeMsg({
            text: `🗑️ ลบบัญชีผู้ใช้ "${targetUser.username}" สำเร็จเรียบร้อยแล้ว (สามารถสมัครใหม่ด้วยชื่อนี้ได้ทันที)`,
            type: 'success'
          });
          setTimeout(() => setAdminCodeMsg({ text: '', type: '' }), 5000);
        })
        .catch(err => {
          setAdminCodeMsg({ text: `เกิดข้อผิดพลาดในการลบบัญชี: ${err.message}`, type: 'error' });
        });
    }
  };

  const handleAdminApproveOrder = (order) => {
    if (order.firebaseKey) {
      if (order.type === 'wallet') {
        if (!order.status.includes('สำเร็จ')) {
          creditUserWallet(order.player, order.price);
        }
        updateRealtimeOrderStatus(order.firebaseKey, '✅ เติมเครดิตสำเร็จ (แอดมินอนุมัติแล้ว)');
      } else if (order.type === 'game') {
        updateRealtimeOrderStatus(order.firebaseKey, '✅ เติมเข้าไอดีเกมสำเร็จทันที (AUTO 100%)');
      } else {
        updateRealtimeOrderStatus(order.firebaseKey, '✅ สำเร็จ (แอดมินอนุมัติแล้ว)');
      }
      if (order.firebaseKey === activeOrderFirebaseKey) {
        setFloatingTimer(0);
        setActiveOrderFirebaseKey(null);
      }
    }
  };

  const handleAdminRejectOrder = (order) => {
    if (order.firebaseKey) {
      updateRealtimeOrderStatus(order.firebaseKey, '❌ ยกเลิก (ไม่พบยอดโอนเงิน)');
      if (order.firebaseKey === activeOrderFirebaseKey) {
        setFloatingTimer(0);
        setActiveOrderFirebaseKey(null);
      }
    }
  };

  const resetCheckoutModal = () => {
    setShowCheckoutModal(false);
    setCheckoutStep(1);
    setCheckoutPassword('');
    setShowCheckoutPassword(false);
    setCheckoutPasswordError('');
    setTimeLeft(180);
    setIsQrExpired(false);
    setPackageQuantity(1);
    setTruemoneyPhone('');
    setTruemoneyCard14('');
  };

  const filteredGames = gamesData.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = gameCategory === 'all' || game.category === gameCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter((ord) => {
    const q = adminSearchQuery.trim();
    if (!q) return true;

    const lowerQ = q.toLowerCase();
    const isOrderQuery = lowerQ.startsWith('ord');

    if (isOrderQuery) {
      return ord.id.toLowerCase() === lowerQ;
    } else {
      return ord.player.toLowerCase().includes(lowerQ);
    }
  });

  const adminItemsPerPage = 10;
  const totalAdminPages = Math.ceil(filteredOrders.length / adminItemsPerPage) || 1;
  const paginatedAdminOrders = filteredOrders.slice((adminOrdersPage - 1) * adminItemsPerPage, adminOrdersPage * adminItemsPerPage);

  const isUserAdmin = user && (user.username.toLowerCase() === 'thanphooms' || user.email?.toLowerCase() === 'thanphooms@gmail.com');

  const nowObj = new Date();
  const currentDayStr = `${nowObj.getFullYear()}-${String(nowObj.getMonth() + 1).padStart(2, '0')}-${String(nowObj.getDate()).padStart(2, '0')}`;

  const searchedOrders = orders.filter(o => {
    let matchUser = false;
    if (isUserAdmin) {
      const q = exactSearchQuery.trim().toLowerCase();
      matchUser = !q || (o.player.toLowerCase() === q) || (o.id.toLowerCase() === q);
    } else if (user) {
      matchUser = (o.player.toLowerCase() === user.username.toLowerCase());
    } else {
      // Guest mode: can search by Order ID or Player/UID
      const q = exactSearchQuery.trim().toLowerCase();
      const orderQ = customerOrderSearch.trim().toLowerCase();
      if (!q && !orderQ) {
        matchUser = true;
      } else {
        const matchUID = q ? (o.player.toLowerCase().includes(q) || (o.gameChar && o.gameChar.toLowerCase().includes(q))) : false;
        const matchO = orderQ ? o.id.toLowerCase().includes(orderQ) : false;
        matchUser = matchUID || matchO;
      }
    }

    const orderQuery = customerOrderSearch.trim();
    const matchOrder = !orderQuery || (orderQuery.toUpperCase().startsWith('ORD') ? o.id.toLowerCase() === orderQuery.toLowerCase() : o.id.toLowerCase().includes(orderQuery.toLowerCase()));
    const matchGame = selectedGameFilter === 'all' || o.game.toLowerCase() === selectedGameFilter.toLowerCase();

    return matchUser && matchOrder && matchGame;
  });

  const todayOrders = searchedOrders.filter(o => o.dateKey === currentDayStr);
  const pastOrders = searchedOrders.filter(o => o.dateKey !== currentDayStr);

  const customerItemsPerPage = 10;
  const totalCustomerTodayPages = Math.ceil(todayOrders.length / customerItemsPerPage) || 1;
  const paginatedTodayOrders = todayOrders.slice((customerOrdersPage - 1) * customerItemsPerPage, customerOrdersPage * customerItemsPerPage);

  const totalSpentInSearch = searchedOrders.reduce((sum, ord) => sum + ord.price, 0);
  const selectedGameForAdminCode = gamesData.find(g => g.name === newCodeGame);

  // คำนวณยอดเงินเติมแพ็กเกจเกมสะสมของลูกค้าปัจจุบัน และระดับแรงค์
  const currentUserSpending = React.useMemo(() => {
    if (!user || !user.username) return 0;
    const uname = user.username.trim().toLowerCase();
    return orders
      .filter(o => o.type === 'game' && !o.status?.includes('ยกเลิก') && o.player && o.player.trim().toLowerCase() === uname)
      .reduce((sum, o) => sum + (Number(o.price) || 0), 0);
  }, [orders, user]);

  const currentUserRank = React.useMemo(() => {
    return getCustomerRank(currentUserSpending);
  }, [currentUserSpending]);

  // สถิติหลังบ้าน: อันดับเกมที่ลูกค้าเติมเยอะสุด
  const topGamesStats = React.useMemo(() => {
    const gameMap = {};
    orders.forEach(o => {
      if (o.type === 'game' && !o.status?.includes('ยกเลิก')) {
        const gName = o.game || 'ไม่ระบุเกม';
        if (!gameMap[gName]) {
          gameMap[gName] = { name: gName, totalSpent: 0, orderCount: 0, totalProfit: 0 };
        }
        gameMap[gName].totalSpent += (Number(o.price) || 0);
        gameMap[gName].orderCount += 1;
        gameMap[gName].totalProfit += (Number(o.profit) || 0);
      }
    });
    return Object.values(gameMap).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // สถิติหลังบ้าน: อันดับแพ็กเกจที่ลูกค้าเติมเยอะสุด
  const topPackagesStats = React.useMemo(() => {
    const pkgMap = {};
    orders.forEach(o => {
      if (o.type === 'game' && !o.status?.includes('ยกเลิก')) {
        const pName = o.package || 'ไม่ระบุแพ็กเกจ';
        const gName = o.game || 'ไม่ระบุเกม';
        const key = `${gName} - ${pName}`;
        if (!pkgMap[key]) {
          pkgMap[key] = {
            key,
            game: gName,
            package: pName,
            totalSpent: 0,
            orderCount: 0
          };
        }
        pkgMap[key].totalSpent += (Number(o.price) || 0);
        pkgMap[key].orderCount += 1;
      }
    });
    return Object.values(pkgMap).sort((a, b) => b.orderCount - a.orderCount || b.totalSpent - a.totalSpent);
  }, [orders]);

  // สถิติหลังบ้าน: จัดอันดับและคำนวณแรงค์ลูกค้าทั้งหมด (Customer VIP Leaderboard)
  const customerRankStats = React.useMemo(() => {
    const customerMap = {};
    orders.forEach(o => {
      if (o.type === 'game' && !o.status?.includes('ยกเลิก') && o.player) {
        const p = o.player.trim().toLowerCase();
        if (!customerMap[p]) {
          customerMap[p] = { username: o.player.trim(), totalSpent: 0, orderCount: 0 };
        }
        customerMap[p].totalSpent += (Number(o.price) || 0);
        customerMap[p].orderCount += 1;
      }
    });
    registeredUsers.forEach(u => {
      if (u.username) {
        const p = u.username.trim().toLowerCase();
        if (!customerMap[p]) {
          customerMap[p] = { username: u.username.trim(), totalSpent: 0, orderCount: 0 };
        }
      }
    });

    const list = Object.values(customerMap).map(c => ({
      ...c,
      rank: getCustomerRank(c.totalSpent)
    }));
    return list.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders, registeredUsers]);

  const customerRankCounts = React.useMemo(() => {
    const counts = {
      CHALLENGER: 0,
      MASTER: 0,
      DIAMOND: 0,
      PLATINUM: 0,
      GOLD: 0,
      SILVER: 0,
      BRONZE: 0
    };
    customerRankStats.forEach(c => {
      if (counts[c.rank.tier] !== undefined) {
        counts[c.rank.tier] += 1;
      }
    });
    return counts;
  }, [customerRankStats]);

  const filteredGiftCodes = giftCodes.filter(c => {
    const matchGame = adminGiftCodeFilterGame === 'all' || c.game === adminGiftCodeFilterGame;
    const q = adminGiftCodeSearch.trim().toLowerCase();
    const matchSearch = !q ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.reward && c.reward.toLowerCase().includes(q)) ||
      (c.game && c.game.toLowerCase().includes(q));
    return matchGame && matchSearch;
  });

  const [selectedHistoryDate, setSelectedHistoryDate] = useState('all');
  const [historyPage, setHistoryPage] = useState(1);

  const groupedPastOrders = React.useMemo(() => {
    const groups = {};
    pastOrders.forEach((ord) => {
      const dateStr = ord.time ? ord.time.split(' ')[0] : (ord.dateKey || 'อื่นๆ');
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(ord);
    });
    return groups;
  }, [pastOrders]);

  const availableHistoryDates = Object.keys(groupedPastOrders);

  const filteredPastOrdersByDate = React.useMemo(() => {
    if (selectedHistoryDate === 'all') {
      return pastOrders;
    }
    return groupedPastOrders[selectedHistoryDate] || [];
  }, [pastOrders, groupedPastOrders, selectedHistoryDate]);

  const historyItemsPerPage = 5;
  const totalHistoryPages = Math.ceil(filteredPastOrdersByDate.length / historyItemsPerPage) || 1;

  const paginatedPastOrders = React.useMemo(() => {
    const startIndex = (historyPage - 1) * historyItemsPerPage;
    return filteredPastOrdersByDate.slice(startIndex, startIndex + historyItemsPerPage);
  }, [filteredPastOrdersByDate, historyPage]);

  const handleHistoryDateChange = (e) => {
    setSelectedHistoryDate(e.target.value);
    setHistoryPage(1);
  };

  
  return (
    <div style={{
      backgroundColor: tColors.bg,
      backgroundImage: tColors.bgPattern,
      backgroundSize: '32px 32px',
      backgroundPosition: '0 0, 16px 16px',
      color: tColors.textPrimary, minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '60px', position: 'relative',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      <style>{cyberGlobalStyles}</style>

      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
            backdropFilter: 'blur(20px)',
            border: isDarkMode ? '2px solid rgba(147, 51, 234, 0.4)' : '3px solid #fed7aa',
            borderRadius: '28px',
            padding: '40px 32px',
            maxWidth: '440px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: isDarkMode ? '0 25px 60px rgba(0,0,0,0.8)' : '0 25px 50px rgba(249, 115, 22, 0.15)',
            textAlign: 'center',
            color: isDarkMode ? '#ffffff' : '#1e293b'
          }}>
            <button
              type="button"
              onClick={() => { setShowAuthModal(false); setAuthError(''); setAuthSuccessMsg(''); }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                color: isDarkMode ? '#cbd5e1' : '#475569',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              ✕
            </button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
            <div style={{ 
              position: 'relative', width: '70px', height: '70px', borderRadius: '22px', 
              background: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)', 
              border: '3px solid #ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              boxShadow: '0 10px 25px rgba(249,115,22,0.4)', 
              marginBottom: '14px',
              fontSize: '36px'
            }}>
              🐱
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', background: 'linear-gradient(135deg, #ea580c 0%, #db2777 50%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px' }}>
              MEOW TOPUP
            </div>
            <div style={{ fontSize: '11px', fontWeight: '900', color: '#f59e0b', letterSpacing: '1.5px', marginTop: '3px' }}>
              🐾 CUTE & FAST GAME STORE 🪙
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 20px 0' }}>
            {authMode === 'login' && 'เข้าสู่ระบบด้วยชื่อผู้ใช้งานอัตโนมัติ 24 ชม.'}
            {authMode === 'register' && 'สมัครสมาชิกใหม่ (กรอกอีเมลกู้คืนขึ้นก่อน แล้วตามด้วยชื่อผู้ใช้งาน)'}
          </p>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {authError && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>{authError}</div>}
            {authSuccessMsg && <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', border: '1px solid #34d399', color: '#34d399', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>{authSuccessMsg}</div>}

            {authMode === 'login' ? (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>ชื่อผู้ใช้งาน (Username)</label>
                <input type="text" placeholder="กรอกชื่อผู้ใช้งานของคุณ..." value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', color: '#c084fc', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>1. อีเมลกู้คืนรหัสผ่าน (Email)</label>
                  <input type="email" placeholder="example@gmail.com (ใช้ยืนยันตอนลืมรหัส)" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>2. ชื่อผู้ใช้งาน (Username / Display Name)</label>
                  <input type="text" placeholder="ตั้งชื่อผู้ใช้งาน..." value={regUsernameInput} onChange={(e) => setRegUsernameInput(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </>
            )}

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                {authMode === 'register' ? '3. รหัสผ่าน (Password อย่างน้อย 6 ตัว)' : 'รหัสผ่าน (Password)'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={authMode === 'login' ? (showLoginPassword ? 'text' : 'password') : (showRegPassword ? 'text' : 'password')} 
                  placeholder="กรอกรหัสผ่าน..." 
                  value={authMode === 'login' ? passwordInput : regPasswordInput} 
                  onChange={(e) => authMode === 'login' ? setPasswordInput(e.target.value) : setRegPasswordInput(e.target.value)} 
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 42px 12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                />
                <button 
                  type="button" 
                  onClick={() => authMode === 'login' ? setShowLoginPassword(!showLoginPassword) : setShowRegPassword(!showRegPassword)} 
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                >
                  <EyeIcon show={authMode === 'login' ? showLoginPassword : showRegPassword} />
                </button>
              </div>
            </div>

            {authMode === 'register' && (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>4. ยืนยันรหัสผ่าน (Confirm Password)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    placeholder="กรอกรหัสผ่านอีกครั้ง..." 
                    value={confirmPasswordInput} 
                    onChange={(e) => setConfirmPasswordInput(e.target.value)} 
                    style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 42px 12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                  >
                    <EyeIcon show={showConfirmPassword} />
                  </button>
                </div>
              </div>
            )}

            {authMode === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af' }}>
                  <input type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ cursor: 'pointer' }} />
                  <label htmlFor="remember" style={{ cursor: 'pointer' }}>จดจำไอดีไว้</label>
                </div>
                <span onClick={() => { setForgotModalOpen(true); resetForgotState(); }} style={{ color: '#f472b6', cursor: 'pointer', fontWeight: 'bold' }}>ลืมรหัสผ่าน?</span>
              </div>
            )}

            <button 
              type="submit" 
              style={{ 
                backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', 
                fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px', 
                boxShadow: '0 0 15px rgba(147,51,234,0.5)', transition: 'all 0.25s ease', transform: 'scale(1)' 
              }}
            >
              {authMode === 'login' && 'เข้าสู่ระบบ (Login)'}
              {authMode === 'register' && 'สมัครสมาชิก'}
            </button>
          </form>

          <div style={{ marginTop: '15px', fontSize: '13px', color: '#9ca3af' }}>
            {authMode === 'login' && <>ยังไม่มีบัญชี? <span onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccessMsg(''); }} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>สมัครสมาชิก</span></>}
            {authMode === 'register' && <>มีบัญชีแล้ว? <span onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); }} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>เข้าสู่ระบบ</span></>}
          </div>
        </div>

        {forgotModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div style={{ backgroundColor: '#111827', border: '1.5px solid #a855f7', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '28px', textAlign: 'center', boxShadow: '0 0 40px rgba(168,85,247,0.45)', position: 'relative' }}>
              <button 
                type="button" 
                onClick={() => { setForgotModalOpen(false); resetForgotState(); }} 
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer', padding: '4px 8px' }}
              >
                ✕
              </button>

              <div style={{ width: '54px', height: '54px', margin: '0 auto 12px auto', borderRadius: '50%', backgroundColor: 'rgba(168,85,247,0.15)', border: '2px solid #c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                {forgotStep === 1 ? '🔐' : forgotStep === 2 ? '🔢' : '✨'}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold', backgroundColor: forgotStep === 1 ? '#9333ea' : 'rgba(55,65,81,0.5)', color: '#ffffff' }}>1. ขอรหัส OTP</span>
                <span style={{ color: '#4b5563', fontSize: '11px' }}>➔</span>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold', backgroundColor: forgotStep === 2 ? '#9333ea' : 'rgba(55,65,81,0.5)', color: '#ffffff' }}>2. ยืนยัน OTP</span>
                <span style={{ color: '#4b5563', fontSize: '11px' }}>➔</span>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold', backgroundColor: forgotStep === 3 ? '#9333ea' : 'rgba(55,65,81,0.5)', color: '#ffffff' }}>3. ตั้งรหัสใหม่</span>
              </div>

              <h3 style={{ fontSize: '19px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#ffffff' }}>
                {forgotStep === 1 && 'กู้คืนรหัสผ่านด้วยรหัส OTP'}
                {forgotStep === 2 && 'กรอกรหัสยืนยัน OTP 6 หลัก'}
                {forgotStep === 3 && 'ตั้งรหัสผ่านใหม่บนหน้าเว็บ'}
              </h3>
              
              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px', lineHeight: '1.4' }}>
                {forgotStep === 1 && 'กรอกอีเมล หรือ ชื่อผู้ใช้งานของคุณ เพื่อรับรหัส OTP 6 หลัก'}
                {forgotStep === 2 && (
                  <>
                    รหัส OTP ถูกส่งไปที่: <b style={{ color: '#38bdf8' }}>{forgotTargetUser?.email || forgotTargetUser?.username}</b>
                  </>
                )}
                {forgotStep === 3 && (
                  <>
                    ตั้งรหัสผ่านใหม่สำหรับบัญชี: <b style={{ color: '#c084fc' }}>{forgotTargetUser?.username}</b>
                  </>
                )}
              </p>

              {forgotStatusMsg.text && (
                <div style={{ backgroundColor: forgotStatusMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: `1px solid ${forgotStatusMsg.type === 'success' ? '#34d399' : '#ef4444'}`, color: forgotStatusMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '12px', borderRadius: '12px', fontSize: '12px', marginBottom: '16px', textAlign: 'left', lineHeight: '1.4' }}>
                  {forgotStatusMsg.text}
                </div>
              )}

              {forgotStep === 1 && (
                <form onSubmit={handleRequestOtpSubmit}>
                  <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '5px' }}>อีเมล หรือ ชื่อผู้ใช้งาน (Username)</label>
                    <input 
                      type="text" 
                      placeholder="เช่น user@example.com หรือชื่อผู้ใช้งาน" 
                      value={forgotEmailInput} 
                      onChange={(e) => setForgotEmailInput(e.target.value)} 
                      style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                      autoFocus
                    />
                  </div>

                  <div style={{ backgroundColor: 'rgba(55, 65, 81, 0.35)', borderRadius: '10px', padding: '10px 12px', fontSize: '11px', color: '#9ca3af', marginBottom: '18px', textAlign: 'left', border: '1px dashed #4b5563', lineHeight: '1.5' }}>
                    💡 <b>สะดวก รวดเร็ว จบในหน้าเดียว:</b><br/>
                    ระบบจะส่งรหัส OTP 6 หลัก และเปิดให้คุณเปลี่ยนรหัสผ่านใหม่ได้ทันทีบนหน้านี้ ไม่ต้องสลับจอไปมา
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={() => { setForgotModalOpen(false); resetForgotState(); }} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                    <button type="submit" style={{ flex: 1.5, backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(147,51,234,0.5)' }}>ขอรับรหัส OTP ➔</button>
                  </div>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtpSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>กรอกรหัสยืนยัน OTP 6 หลัก</label>
                    <input 
                      type="text" 
                      inputMode="numeric" 
                      maxLength={6} 
                      placeholder="• • • • • •" 
                      value={forgotOtpInput} 
                      onChange={(e) => setForgotOtpInput(e.target.value.replace(/[^0-9]/g, ''))} 
                      style={{ width: '100%', maxWidth: '240px', margin: '0 auto', backgroundColor: '#030712', border: '2px solid #a855f7', borderRadius: '12px', padding: '12px', color: '#ffffff', fontSize: '24px', fontWeight: '900', letterSpacing: '8px', textAlign: 'center', outline: 'none', boxSizing: 'border-box' }} 
                      autoFocus
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '18px', padding: '0 6px' }}>
                    <div style={{ color: otpCountdown > 60 ? '#38bdf8' : '#ef4444', fontWeight: 'bold' }}>
                      ⏳ หมดอายุใน: {formatOtpTime(otpCountdown)}
                    </div>
                    <button 
                      type="button" 
                      disabled={otpResendCountdown > 0} 
                      onClick={handleResendOtp} 
                      style={{ background: 'none', border: 'none', color: otpResendCountdown > 0 ? '#6b7280' : '#38bdf8', cursor: otpResendCountdown > 0 ? 'not-allowed' : 'pointer', fontSize: '12px', textDecoration: 'underline' }}
                    >
                      {otpResendCountdown > 0 ? `ขอรหัสใหม่ใน (${otpResendCountdown}s)` : '🔄 ขอรหัสใหม่อีกครั้ง'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={() => setForgotStep(1)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ย้อนกลับ</button>
                    <button type="submit" style={{ flex: 1.5, backgroundColor: '#34d399', color: '#000000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(52,211,153,0.5)' }}>ยืนยันรหัส OTP ➔</button>
                  </div>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleSetNewPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#c084fc', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>1. รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type={showForgotNewPassword ? 'text' : 'password'} 
                        placeholder="กรอกรหัสผ่านใหม่..." 
                        value={forgotNewPassword} 
                        onChange={(e) => setForgotNewPassword(e.target.value)} 
                        style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '12px', padding: '12px 42px 12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                        autoFocus
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)} 
                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                      >
                        <EyeIcon show={showForgotNewPassword} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>2. ยืนยันรหัสผ่านใหม่อีกครั้ง</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type={showForgotConfirmPassword ? 'text' : 'password'} 
                        placeholder="กรอกรหัสผ่านใหม่อีกครั้ง..." 
                        value={forgotConfirmPassword} 
                        onChange={(e) => setForgotConfirmPassword(e.target.value)} 
                        style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 42px 12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)} 
                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                      >
                        <EyeIcon show={showForgotConfirmPassword} />
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    style={{ 
                      backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', 
                      fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px', 
                      boxShadow: '0 0 20px rgba(147,51,234,0.6)' 
                    }}
                  >
                    💾 บันทึกรหัสผ่านใหม่ทันที
                  </button>
                </form>
              )}

            </div>
          </div>
        )}
      
        </div>
      )}

      
      {floatingTimer > 0 && (
        <div style={{
          position: 'fixed', bottom: '95px', right: '25px', zIndex: 98,
          backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '2px solid #34d399',
          borderRadius: '16px', padding: '12px 18px', boxShadow: '0 0 25px rgba(52, 211, 153, 0.6)',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{ fontSize: '22px' }}>⏳</div>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>ระบบกำลังเติมเงิน</div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#34d399' }}>กำลังรอแอดมินอนุมัติ ({floatingTimer}s)</div>
          </div>
        </div>
      )}

      <header style={{ backgroundColor: tColors.headerBg, backdropFilter: 'blur(16px)', borderBottom: tColors.headerBorder, padding: '10px 28px', position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 15px rgba(249, 115, 22, 0.06)', transition: 'all 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => { setActiveTab('shop'); setSelectedGame(null); }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '16px', 
            background: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)', 
            border: '2px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            boxShadow: '0 6px 20px rgba(249, 115, 22, 0.35)',
            fontSize: '24px'
          }}>
            🐱
          </div>

          <div>
            <div style={{ fontSize: '20px', fontWeight: '900', background: 'linear-gradient(135deg, #ea580c 0%, #db2777 50%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: '1.1', letterSpacing: '0.5px' }}>
              MEOW TOPUP
            </div>
            <div style={{ fontSize: '10px', fontWeight: '900', color: '#f59e0b', letterSpacing: '1px' }}>
              🐾 CUTE & FAST GAME STORE 🪙
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user ? (
            <div style={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', border: isDarkMode ? '2px solid #334155' : '2px solid #fed7aa', borderRadius: '16px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', position: 'relative', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af' }}>👤 ผู้ใช้: </span>
                <b style={{ color: '#c084fc', marginLeft: '4px' }}>{user.username && user.username.includes('@') ? user.username.split('@')[0] : user.username}</b>
              </div>
              {user.email && !user.emailVerified && (
                <div style={{ borderLeft: '1px solid #374151', paddingLeft: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button 
                    type="button" 
                    onClick={handleResendEmailVerification}
                    title="คลิกเพื่อส่งลิงก์ยืนยันตัวตนไปยังอีเมลที่ลงทะเบียนไว้"
                    style={{ 
                      backgroundColor: 'rgba(245, 158, 11, 0.25)', 
                      border: '1px solid #f59e0b', 
                      color: '#fbbf24', 
                      padding: '2px 8px', 
                      borderRadius: '6px', 
                      fontSize: '10px', 
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    ⚠️ ยืนยันเมล
                  </button>
                </div>
              )}
              <div style={{ borderLeft: '2px solid #fed7aa', paddingLeft: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#64748b' }}>🐱🪙 Cat Coin: </span>
                <b style={{ color: '#ea580c', fontSize: '14px', fontWeight: '900' }}>{(user.balance || 0).toLocaleString()} Coin</b>
                <span style={{ color: '#94a3b8', fontSize: '11px' }}>(฿{(user.balance || 0).toLocaleString()})</span>
              </div>
              
              <button 
                onClick={() => { setShowTopupWalletModal(true); setWalletStep(1); }} 
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>+ เติม Cat Coin</span>
                <span>🐾</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                type="button"
                onClick={() => { setShowAuthModal(true); setAuthMode('login'); }} 
                style={{ 
                  background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)', 
                  color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '12px', 
                  fontSize: '12px', fontWeight: '900', cursor: 'pointer', 
                  boxShadow: '0 4px 15px rgba(249, 115, 22, 0.35)', 
                  display: 'flex', alignItems: 'center', gap: '6px' 
                }}
              >
                <span>🔑 เข้าสู่ระบบ / สมาชิก</span>
              </button>
            </div>
          )}

          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* ☀️ / 🌙 THEME TOGGLE BUTTON */}
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: isDarkMode ? '#1e293b' : '#ffedd5',
                border: isDarkMode ? '2px solid #f97316' : '2px solid #ea580c',
                color: isDarkMode ? '#fbbf24' : '#c2410c',
                padding: '7px 14px',
                borderRadius: '14px',
                fontSize: '12px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: isDarkMode ? '0 0 12px rgba(249, 115, 22, 0.35)' : '0 2px 8px rgba(234, 88, 12, 0.15)',
                transition: 'all 0.25s ease'
              }}
              title="สลับธีม สว่าง / มืด"
            >
              <span style={{ fontSize: '15px' }}>{isDarkMode ? '🌙' : '☀️'}</span>
              <span>{isDarkMode ? 'โหมดมืด' : 'โหมดสว่าง'}</span>
              <span style={{ fontSize: '11px' }}>🐾</span>
            </button>
            <button onClick={() => { setActiveTab('shop'); setSelectedGame(null); }} style={{ background: activeTab === 'shop' ? 'linear-gradient(135deg, #f97316, #ec4899)' : '#ffffff', color: activeTab === 'shop' ? '#ffffff' : '#475569', border: '2px solid #fed7aa', padding: '8px 16px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '12px', boxShadow: activeTab === 'shop' ? '0 4px 15px rgba(249, 115, 22, 0.35)' : '0 2px 6px rgba(0,0,0,0.04)' }}>🐱 หน้าร้าน</button>
            <button onClick={() => setActiveTab('track')} style={{ background: activeTab === 'track' ? 'linear-gradient(135deg, #f97316, #ec4899)' : '#ffffff', color: activeTab === 'track' ? '#ffffff' : '#475569', border: '2px solid #fed7aa', padding: '8px 16px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '12px', boxShadow: activeTab === 'track' ? '0 4px 15px rgba(249, 115, 22, 0.35)' : '0 2px 6px rgba(0,0,0,0.04)' }}>📋 เช็คสถานะ</button>
            {isUserAdmin && (
              <button onClick={() => setActiveTab('admin')} style={{ background: activeTab === 'admin' ? 'linear-gradient(135deg, #f97316, #ec4899)' : '#ffffff', color: activeTab === 'admin' ? '#ffffff' : '#475569', border: '2px solid #fed7aa', padding: '8px 16px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '12px', boxShadow: activeTab === 'admin' ? '0 4px 15px rgba(249, 115, 22, 0.35)' : '0 2px 6px rgba(0,0,0,0.04)' }}>⚙️ หลังบ้าน</button>
            )}
            {user && <button onClick={handleLogout} style={{ backgroundColor: '#fee2e2', border: '2px solid #fca5a5', color: '#dc2626', padding: '8px 14px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '12px' }}>🚪 ออก</button>}
          </nav>
        </div>
      </header>
      {emailVerifyMsg && (
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.25)', borderBottom: '1px solid #10b981', color: '#6ee7b7', padding: '10px 20px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>
          {emailVerifyMsg}
        </div>
      )}



      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        {activeTab === 'shop' && !selectedGame && (
          <div>
            {/* 🐱 COOL CAT GAMER HERO COVER BANNER */}
            <div style={{ 
              position: 'relative',
              borderRadius: '28px', 
              overflow: 'hidden', 
              marginBottom: '35px', 
              boxShadow: isDarkMode ? '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(249, 115, 22, 0.2)' : '0 20px 45px rgba(249, 115, 22, 0.12)',
              border: isDarkMode ? '3px solid rgba(249, 115, 22, 0.4)' : '3px solid #fed7aa',
              backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                position: 'relative',
                minHeight: '350px',
                display: 'flex',
                alignItems: 'center',
                backgroundImage: isDarkMode 
                  ? `linear-gradient(to right, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.92) 48%, rgba(15, 23, 42, 0.55) 75%, rgba(15, 23, 42, 0.15) 100%), url("${HERO_BANNER_IMAGE}")`
                  : `linear-gradient(to right, rgba(255, 251, 245, 0.98) 0%, rgba(255, 251, 245, 0.93) 48%, rgba(255, 251, 245, 0.55) 75%, rgba(255, 251, 245, 0.1) 100%), url("${HERO_BANNER_IMAGE}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'right center',
                padding: '40px 45px'
              }}>
                <div style={{ maxWidth: '640px', zIndex: 2 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255, 237, 213, 0.95)', border: '1.5px solid #f97316', color: '#ea580c', padding: '6px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: '900', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.18)', marginBottom: '14px' }}>
                    <span style={{ fontSize: '16px' }}>🐱</span>
                    <span>MEOW TOPUP • ร้านเติมเกมสุดน่ารัก & เฟี้ยวสุดในสยาม 🐾</span>
                  </div>
                  
                  <h1 style={{ fontSize: '38px', fontWeight: '900', lineHeight: '1.2', margin: '0 0 12px 0', color: tColors.textPrimary }}>
                    เติมเกมสุดไว ได้แต้มสะสม <br/>
                    <span style={{ background: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
                      แลกรับ Cat Coin สุดคุ้ม 🐱🪙
                    </span>
                  </h1>
                  
                  <p style={{ fontSize: '14px', color: tColors.textSecondary, lineHeight: '1.6', margin: '0 0 20px 0' }}>
                    อาณาจักรเติมเกมของเหล่าทาสแมวและเกมเมอร์! เติมตรง ปลอดภัย 100% ผ่าน LnwTRUE รองรับทั้ง VALORANT, ROV, Free Fire, PUBG, Genshin Impact และอีกมากมาย
                  </p>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '22px' }}>
                    <span style={{ backgroundColor: '#ffffff', border: '1.5px solid #fed7aa', color: '#ea580c', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      ⚡ เติมไวใน 1 นาที
                    </span>
                    <span style={{ backgroundColor: '#ffffff', border: '1.5px solid #fbcfe8', color: '#db2777', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      🐱🪙 ใช้ Cat Coin ลดเพิ่ม
                    </span>
                    <span style={{ backgroundColor: '#ffffff', border: '1.5px solid #bbf7d0', color: '#16a34a', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      🛡️ ยึดราคาทางการ LnwTRUE
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                      <input 
                        type="text" 
                        placeholder="🐾 ค้นหาเกมโปรดของคุณ..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        style={{ 
                          width: '100%', 
                          backgroundColor: '#ffffff', 
                          border: '2px solid #fdba74', 
                          borderRadius: '16px', 
                          padding: '12px 18px', 
                          color: '#0f172a', 
                          outline: 'none', 
                          boxSizing: 'border-box',
                          fontSize: '14px',
                          boxShadow: '0 4px 15px rgba(249, 115, 22, 0.08)'
                        }} 
                      />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px', backgroundColor: '#ffffff', padding: '4px', borderRadius: '16px', border: '2px solid #fed7aa', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.08)' }}>
                      {[
                        { id: 'all', label: '🐱 ทั้งหมด' },
                        { id: 'pc', label: '🖥️ PC' },
                        { id: 'mobile', label: '📱 Mobile' },
                        { id: 'card', label: '💳 บัตร e-Pin' }
                      ].map((cat) => (
                        <button 
                          key={cat.id}
                          onClick={() => setGameCategory(cat.id)} 
                          style={{ 
                            background: gameCategory === cat.id ? 'linear-gradient(135deg, #f97316, #ec4899)' : 'transparent', 
                            color: gameCategory === cat.id ? '#ffffff' : '#64748b', 
                            border: 'none', 
                            padding: '8px 16px', 
                            borderRadius: '12px', 
                            fontWeight: '900', 
                            cursor: 'pointer', 
                            fontSize: '12px',
                            boxShadow: gameCategory === cat.id ? '0 4px 12px rgba(249, 115, 22, 0.35)' : 'none'
                          }}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
                🐾 เลือกเกมโปรดที่ต้องการเติม ({filteredGames.length} เกมพร้อมส่งทันที)
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '24px', marginBottom: '35px' }}>
              {filteredGames.map((game) => {
                const minPrice = game.packages && game.packages.length > 0 ? Math.min(...game.packages.map(p => p.price)) : 0;
                const isOutOfStock = gameStockStatus[game.id] === false;
                return (
                  <div 
                    key={game.id} 
                    className="cyber-game-card"
                    onClick={() => {
                      if (isOutOfStock) {
                        alert(`⚠️ ขออภัย ขณะนี้สต็อกของเกม "${game.name}" หมดชั่วคราว ทางร้านกำลังเร่งเติมสต็อก กรุณาเลือกรอหรือเติมเกมอื่นแทนครับ`);
                        return;
                      }
                      setSelectedGame(game); setSelectedPackage(null); setPackageQuantity(1); setPlayerId('');
                    }} 
                    style={{
                      opacity: isOutOfStock ? 0.78 : 1,
                      filter: isOutOfStock ? 'grayscale(0.25)' : 'none',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <div className="cyber-game-cover-wrap">
                      <img src={game.image} alt={game.name} className="cyber-game-cover-img" />
                      {/* Gradient bottom shadow on image */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70px', background: 'linear-gradient(to top, rgba(17, 24, 39, 0.98) 0%, rgba(17, 24, 39, 0.4) 60%, transparent 100%)', pointerEvents: 'none' }} />
                      
                      {/* Out of stock overlay */}
                      {isOutOfStock && (
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: 'rgba(3, 7, 18, 0.72)', backdropFilter: 'blur(3px)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          zIndex: 10, padding: '10px', textAlign: 'center'
                        }}>
                          <span style={{ fontSize: '26px', marginBottom: '4px' }}>🔒</span>
                          <span style={{
                            backgroundColor: '#dc2626', color: '#ffffff',
                            border: '1.5px solid #ef4444', padding: '4px 12px',
                            borderRadius: '8px', fontSize: '11px', fontWeight: '900',
                            boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)', letterSpacing: '0.5px'
                          }}>
                            🔴 สต็อกหมดชั่วคราว
                          </span>
                          <span style={{ fontSize: '10px', color: '#fca5a5', marginTop: '6px', fontWeight: 'bold' }}>
                            ปิดรับเติมชั่วคราว
                          </span>
                        </div>
                      )}

                      {/* Floating Badge */}
                      <span className="cyber-badge-pulse" style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(15, 23, 42, 0.9)', color: '#c084fc', border: '1px solid #c084fc', padding: '4px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', backdropFilter: 'blur(8px)', boxShadow: '0 0 12px rgba(168,85,247,0.5)' }}>
                        {game.badge}
                      </span>

                      {/* Category Chip */}
                      <span style={{ position: 'absolute', bottom: '10px', left: '12px', backgroundColor: 'rgba(3, 7, 18, 0.85)', color: '#38bdf8', border: '1px solid #0284c7', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {game.category === 'pc' ? '🖥️ PC GAMING' : game.category === 'card' ? '💳 E-PIN CARD' : '📱 MOBILE GAMING'}
                      </span>
                    </div>

                    <div style={{ padding: '18px', backgroundColor: '#ffffff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: '900', margin: 0, color: '#0f172a' }}>{game.name}</h3>
                        <span style={{ 
                          fontSize: '10px', 
                          color: isOutOfStock ? '#ef4444' : '#34d399', 
                          backgroundColor: isOutOfStock ? 'rgba(239,68,68,0.15)' : 'rgba(52,211,153,0.15)', 
                          border: `1px solid ${isOutOfStock ? '#ef4444' : '#34d399'}`, 
                          padding: '2px 6px', 
                          borderRadius: '6px', 
                          fontWeight: 'bold' 
                        }}>
                          {isOutOfStock ? '🔴 สต็อกหมด' : game.category === 'card' ? '⚡ รหัส e-PIN ทันที' : '⚡ เติมตรง UID'}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 14px 0', display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                        <span>🐾 ค่าย: {game.publisher}</span>
                        <span style={{ color: '#ea580c', fontWeight: '900', fontSize: '12px' }}>เริ่มต้น ฿{minPrice.toLocaleString()} (Cat Coin 🪙)</span>
                      </p>
                      
                      {isOutOfStock ? (
                        <button 
                          type="button"
                          style={{ 
                            width: '100%', 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #ef4444', 
                            color: '#f87171', 
                            padding: '11px', 
                            borderRadius: '12px', 
                            fontWeight: '900', 
                            fontSize: '12px', 
                            cursor: 'not-allowed', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '6px' 
                          }}
                        >
                          <span>❌ สต็อกหมด (ปิดรับเติม)</span>
                        </button>
                      ) : (
                        <button style={{ width: '100%', background: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)', border: 'none', color: '#ffffff', padding: '11px', borderRadius: '14px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(249,115,22,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <span>คลิกเติมเกม 🐾</span>
                          <span style={{ fontSize: '15px' }}>→</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            
          </div>
        )}

        {activeTab === 'shop' && selectedGame && (
          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.98)', borderRadius: '28px', padding: '35px', border: '1.5px solid rgba(147, 51, 234, 0.35)', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)' }}>
            <button onClick={() => setSelectedGame(null)} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fb923c', padding: '8px 18px', borderRadius: '12px', cursor: 'pointer', marginBottom: '24px', fontWeight: '900', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span>🐾</span>
              <span>← กลับไปหน้าเลือกเกม</span>
            </button>

            {/* แบนเนอร์เตือนหากเกมนี้สต็อกหมด */}
            {gameStockStatus[selectedGame.id] === false && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '2px solid #ef4444', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 0 25px rgba(239,68,68,0.3)' }}>
                <div style={{ fontSize: '32px' }}>🔒</div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#fca5a5' }}>
                    ขณะนี้สต็อกของเกม "{selectedGame.name}" หมดชั่วคราว (ปิดรับเติม)
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                    ทางร้านอยู่ระหว่างการเติมสต็อกสินค้า กรุณาเลือกเกมอื่นหรือติดต่อสอบถามแอดมินทาง LINE Official
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
              <img src={selectedGame.image} alt={selectedGame.name} style={{ width: '100px', height: '100px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #a855f7' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 6px 0', color: '#ffffff' }}>{selectedGame.name}</h2>
                  {gameStockStatus[selectedGame.id] === false && (
                    <span style={{ backgroundColor: '#ef4444', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                      สต็อกหมดชั่วคราว
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>ผู้ให้บริการ: {selectedGame.publisher} | เลือกแพ็กเกจด้านล่างเพื่อเติมเงิน</p>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ fontSize: '13px', color: '#c084fc', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                {selectedGame.category === 'card' 
                  ? '1. เบอร์โทร หรือ อีเมล / LINE ID (สำหรับรับรหัส PIN)' 
                  : '1. ชื่อในเกม หรือ UID'}
              </label>
              <input 
                type="text" 
                placeholder={selectedGame.category === 'card' ? "ระบุเบอร์โทร หรือ LINE ID สำหรับรับรหัส..." : "ระบุชื่อในเกม หรือ UID ของท่าน..."} 
                value={playerId} 
                onChange={(e) => setPlayerId(e.target.value)} 
                style={{ width: '100%', maxWidth: '400px', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ fontSize: '13px', color: '#c084fc', display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>2. เลือกแพ็กเกจเติมเกม</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
                {selectedGame.packages.map((pkg) => {
                  const isPkgOutOfStock = packageStockStatus[`${selectedGame.id}_${pkg.id}`] === false;
                  const isSelected = selectedPackage?.id === pkg.id;
                  return (
                    <div 
                      key={pkg.id} 
                      onClick={() => {
                        if (isPkgOutOfStock) {
                          alert(`⚠️ ขออภัย ขณะนี้แพ็กเกจ "${pkg.name}" สินค้าหมดสต็อกชั่วคราว ทางร้านกำลังเร่งเติมสต็อก กรุณาเลือกแพ็กเกจอื่นหรือรอสักครู่ครับ`);
                          return;
                        }
                        setSelectedPackage(pkg); 
                        setPackageQuantity(1); 
                      }} 
                      style={{ 
                        backgroundColor: isPkgOutOfStock ? 'rgba(239, 68, 68, 0.1)' : isSelected ? 'rgba(249, 115, 22, 0.15)' : '#030712', 
                        border: isPkgOutOfStock ? '1.5px solid #ef4444' : isSelected ? '2px solid #f97316' : '1px solid #1f2937', 
                        borderRadius: '18px', padding: '16px', 
                        cursor: isPkgOutOfStock ? 'not-allowed' : 'pointer',
                        transition: 'all 0.25s', position: 'relative', overflow: 'hidden',
                        opacity: isPkgOutOfStock ? 0.75 : 1,
                        boxShadow: isSelected ? '0 0 20px rgba(249, 115, 22, 0.3)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: isPkgOutOfStock ? '#fca5a5' : '#ffffff' }}>
                          {pkg.name}
                        </div>
                        <span style={{ 
                          fontSize: '10px', fontWeight: 'bold', 
                          padding: '2px 8px', borderRadius: '6px',
                          backgroundColor: isPkgOutOfStock ? 'rgba(239, 68, 68, 0.25)' : 'rgba(52, 211, 153, 0.2)',
                          color: isPkgOutOfStock ? '#fca5a5' : '#34d399',
                          border: `1px solid ${isPkgOutOfStock ? '#ef4444' : '#34d399'}`
                        }}>
                          {isPkgOutOfStock ? '🔴 สต็อกหมด' : '⚡ เติมตรง 100%'}
                        </span>
                      </div>
<div style={{ fontSize: '12px', color: isPkgOutOfStock ? '#9ca3af' : '#34d399', marginBottom: '8px' }}>
                        {isPkgOutOfStock ? '⚠️ สินค้าหมดสต็อกชั่วคราว' : `สิทธิพิเศษ: ${pkg.bonus}`}
                      </div>

                      {/* แสดงราคาขาย พร้อมราคาเดิมขีดฆ่า และป้ายประหยัดเงิน */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '19px', fontWeight: '900', color: isPkgOutOfStock ? '#9ca3af' : '#38bdf8' }}>
                          ฿{pkg.price.toLocaleString()}
                        </span>

                        {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                          <span style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through' }}>
                            ฿{pkg.originalPrice.toLocaleString()}
                          </span>
                        )}

                        {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                          <span style={{ 
                            fontSize: '10px', 
                            color: '#f472b6', 
                            fontWeight: 'bold', 
                            backgroundColor: 'rgba(236, 72, 153, 0.15)', 
                            border: '1px solid rgba(236, 72, 153, 0.3)',
                            padding: '1px 6px', 
                            borderRadius: '4px' 
                          }}>
                            ประหยัด ฿{(pkg.originalPrice - pkg.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedPackage && (
              <div style={{ backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '16px', padding: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 'bold' }}>📦 แพ็กเกจที่เลือก: <span style={{ color: '#c084fc' }}>{selectedPackage.name}</span></div>
                  <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '2px' }}>ราคาต่อ 1 แพ็ก: ฿{selectedPackage.price.toLocaleString()}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold' }}>จำนวนแพ็กเกจ:</span>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', overflow: 'hidden' }}>
                    <button type="button" onClick={() => setPackageQuantity(Math.max(1, packageQuantity - 1))} style={{ backgroundColor: 'rgba(147,51,234,0.3)', color: '#a855f7', border: 'none', padding: '8px 14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>-</button>
                    <input type="text" readOnly value={packageQuantity} style={{ width: '45px', backgroundColor: 'transparent', border: 'none', color: '#ffffff', textAlign: 'center', fontWeight: 'bold', fontSize: '15px', outline: 'none' }} />
                    <button type="button" onClick={() => setPackageQuantity(packageQuantity + 1)} style={{ backgroundColor: 'rgba(147,51,234,0.3)', color: '#a855f7', border: 'none', padding: '8px 14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#34d399', minWidth: '100px', textAlign: 'right' }}>
                    รวม ฿{(selectedPackage.price * packageQuantity).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '30px' }}>
              <label style={{ fontSize: '13px', color: '#c084fc', display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>3. เลือกช่องทางชำระเงิน</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="cyber-card-clickable" onClick={() => setSelectedPayment(pm)} style={{ 
                      backgroundColor: selectedPayment?.id === pm.id ? 'rgba(56, 189, 248, 0.2)' : '#030712', 
                      border: selectedPayment?.id === pm.id ? '2px solid #38bdf8' : '1px solid #374151', 
                      borderRadius: '14px', padding: '14px', cursor: 'pointer' 
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>{pm.name}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{pm.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPayment && (
              <div style={{ backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '16px', padding: '20px', marginBottom: '30px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '12px' }}>
                  📝 กรอกข้อมูลช่องทาง: {selectedPayment.name}
                </div>
                {selectedPayment.id === 'true' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ backgroundColor: '#111827', border: '1.5px solid #f97316', borderRadius: '14px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ backgroundColor: '#f97316', color: '#ffffff', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px' }}>TrueMoney</span>
                          <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: 'bold' }}>TrueMoney Wallet</span>
                        </div>
                        <span style={{ fontSize: '13px', color: '#fb923c', fontWeight: 'bold' }}>นาย ธนภูมิ รักษี</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#030712', padding: '12px 14px', borderRadius: '10px', border: '1px solid #374151' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>เบอร์ TrueMoney Wallet ร้านค้า (ฟรีค่าธรรมเนียม 0%)</div>
                          <div style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', letterSpacing: '1.5px', fontFamily: 'monospace' }}>063-880-1739</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('0638801739');
                            alert('📋 คัดลอกเบอร์ TrueMoney 0638801739 (นาย ธนภูมิ รักษี) เรียบร้อยแล้ว');
                          }}
                          style={{ backgroundColor: '#f97316', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                        >
                          📋 คัดลอกเบอร์
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>เบอร์ TrueMoney ของคุณที่ใช้โอน (ระบุเพื่ออ้างอิง - ไม่บังคับ)</label>
                      <input type="text" inputMode="numeric" maxLength={10} placeholder="เช่น 0812345678" value={truemoneyPhone} onChange={(e) => setTruemoneyPhone(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', maxWidth: '350px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ fontSize: '12px', color: '#fb923c', backgroundColor: 'rgba(249,115,22,0.1)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(249,115,22,0.25)' }}>
                      💡 เมื่อกดปุ่มยืนยันชำระเงิน ระบบจะเปิดหน้าต่างให้แนบสลิป TrueMoney เพื่อตรวจสอบยอดเงินทันที
                    </div>
                  </div>
                )}
                {selectedPayment.id === 'truemoneycard' && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>รหัสบัตรเติมเงิน TrueMoney (14 หลัก)</label>
                    <input type="text" inputMode="numeric" maxLength={14} placeholder="กรอกรหัสบัตร 14 หลัก..." value={truemoneyCard14} onChange={(e) => setTruemoneyCard14(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', maxWidth: '350px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', letterSpacing: '2px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}
                {selectedPayment.id === 'qrcode' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* ข้อมูลบัญชีร้านค้าสำหรับรับเงิน (SCB & PromptPay) */}
                    <div style={{ backgroundColor: '#111827', border: '1.5px solid #9333ea', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ backgroundColor: '#4e2a84', color: '#ffffff', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px', border: '1px solid #a855f7' }}>SCB</span>
                          <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: 'bold' }}>ธนาคารไทยพาณิชย์ & พร้อมเพย์</span>
                        </div>
                        <span style={{ fontSize: '13px', color: '#c084fc', fontWeight: 'bold' }}>นาย ธนภูมิ รักษี</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#030712', padding: '12px 14px', borderRadius: '10px', border: '1px solid #374151' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>เลขที่บัญชีร้านค้า (ไทยพาณิชย์ SCB)</div>
                          <div style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', letterSpacing: '1.5px', fontFamily: 'monospace' }}>558-265124-6</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('5582651246');
                            alert('📋 คัดลอกเลขบัญชีไทยพาณิชย์ (SCB) 5582651246 เรียบร้อยแล้ว');
                          }}
                          style={{ backgroundColor: '#7c3aed', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          📋 คัดลอกเลขบัญชี
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#030712', padding: '12px 14px', borderRadius: '10px', border: '1px solid #374151' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#38bdf8' }}>เบอร์พร้อมเพย์ (PromptPay สแกน/โอนได้ทุกธนาคาร)</div>
                          <div style={{ fontSize: '20px', fontWeight: '900', color: '#38bdf8', letterSpacing: '1.5px', fontFamily: 'monospace' }}>095-626-7172</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('0956267172');
                            alert('📋 คัดลอกเบอร์พร้อมเพย์ 0956267172 เรียบร้อยแล้ว');
                          }}
                          style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          📋 คัดลอกพร้อมเพย์
                        </button>
                      </div>
                    </div>

                    {/* ฟอร์มกรอกข้อมูลบัญชีของผู้โอนเงิน */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>ธนาคารที่คุณใช้โอน</label>
                        <select
                          value={customerBank}
                          onChange={(e) => setCustomerBank(e.target.value)}
                          style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px 12px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                        >
                          <option value="kbank">ธนาคารกสิกรไทย (KBank)</option>
                          <option value="scb">ธนาคารไทยพาณิชย์ (SCB)</option>
                          <option value="ktb">ธนาคารกรุงไทย (Krungthai)</option>
                          <option value="bbl">ธนาคารกรุงเทพ (Bangkok Bank)</option>
                          <option value="bay">ธนาคารกรุงศรีอยุธยา (Krungsri)</option>
                          <option value="ttb">ธนาคารทหารไทยธนชาต (ttb)</option>
                          <option value="gsb">ธนาคารออมสิน (GSB)</option>
                          <option value="other">ธนาคารอื่น ๆ / วอลเล็ต</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>เลขที่บัญชีของคุณ หรือ เบอร์ผู้โอน (4 ตัวท้าย)</label>
                        <input
                          type="text"
                          placeholder="เช่น 1234 หรือ 0812345678"
                          value={customerAccountNo}
                          onChange={(e) => setCustomerAccountNo(e.target.value)}
                          style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px 12px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.1)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.2)' }}>
                      💡 เมื่อกดปุ่มสั่งซื้อ ระบบจะพาคุณไปแนบสลิปเพื่อตรวจยอดเงินผ่าน SlipOK อัตโนมัติ 24 ชม.
                    </div>
                  </div>
                )}
                {selectedPayment.id === 'wallet' && (
                  <div style={{ fontSize: '13px', color: '#34d399' }}>🔒 เพื่อความปลอดภัย ระบบจะให้ท่านยืนยันรหัสผ่านบัญชีก่อนหักเงินจากเครดิตร้าน (ยอดคงเหลือ: ฿{(user.balance || 0).toLocaleString()})</div>
                )}
              </div>
            )}

            {(() => {
              const isGameOut = gameStockStatus[selectedGame?.id] === false;
              const isPkgOut = selectedPackage && packageStockStatus[`${selectedGame?.id}_${selectedPackage.id}`] === false;
              const isDisabled = !playerId.trim() || !selectedPackage || !selectedPayment || isGameOut || isPkgOut;

              return (
                <button 
                  disabled={isDisabled}
                  onClick={() => {
                    if (isGameOut) {
                      alert(`⚠️ ขออภัย สต็อกของเกม "${selectedGame.name}" หมดชั่วคราว ไม่สามารถทำรายการสั่งซื้อได้`);
                      return;
                    }
                    if (isPkgOut) {
                      alert(`⚠️ ขออภัย แพ็กเกจ "${selectedPackage.name}" สินค้าหมดสต็อกชั่วคราว กรุณาเลือกแพ็กเกจอื่นครับ`);
                      return;
                    }
                    handleStartGamePayment();
                  }} 
                  style={{ 
                    width: '100%', 
                    backgroundColor: isDisabled ? '#374151' : '#9333ea', 
                    color: '#ffffff', border: 'none', padding: '16px', borderRadius: '14px', 
                    fontWeight: 'bold', fontSize: '16px', 
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    boxShadow: isDisabled ? 'none' : '0 0 25px rgba(147,51,234,0.6)'
                  }}
                >
                  {isGameOut 
                    ? `❌ สต็อกเกม ${selectedGame.name} หมดชั่วคราว (ไม่สามารถเติมได้)` 
                    : isPkgOut 
                    ? `❌ แพ็กเกจ "${selectedPackage.name}" สินค้าหมดชั่วคราว (ไม่สามารถซื้อได้)`
                    : !playerId.trim() 
                    ? (selectedGame?.category === 'card' ? 'กรุณากรอกเบอร์โทรหรือ LINE ID เพื่อรับรหัส PIN' : 'กรุณากรอกชื่อในเกม หรือ UID (ห้ามเว้นว่าง)') 
                    : !selectedPackage 
                    ? 'กรุณาเลือกแพ็กเกจเติมเกม' 
                    : !selectedPayment 
                    ? 'กรุณาเลือกช่องทางชำระเงิน' 
                    : `ยืนยันชำระเงิน ฿${(selectedPackage.price * packageQuantity).toLocaleString()} (${packageQuantity} แพ็ก)`}
                </button>
              );
            })()}
          </div>
        )}

        {activeTab === 'track' && (
          <div style={{ maxWidth: '850px', margin: '0 auto', backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '30px', border: '1.5px solid rgba(147,51,234,0.4)', boxShadow: '0 0 35px rgba(0,0,0,0.7)' }}>
            <div style={{ borderBottom: '1px solid #374151', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0' }}>📋 เช็คสถานะคำสั่งซื้อและประวัติการทำรายการ</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c084fc', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: currentUserRank.bg,
                  border: `1.5px solid ${currentUserRank.border}`,
                  color: currentUserRank.color,
                  padding: '3px 10px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: '900',
                  boxShadow: currentUserRank.glow
                }}>
                  <RankEmblem tier={currentUserRank.tier} size={18} />
                  <span>{currentUserRank.name}</span>
                </span>
                <span>👤 บัญชีผู้ใช้งาน:</span>
                <b style={{ color: '#ffffff', backgroundColor: 'rgba(147,51,234,0.3)', padding: '2px 10px', borderRadius: '6px', border: '1px solid #9333ea' }}>{user.username && user.username.includes('@') ? user.username.split('@')[0] : user.username}</b>
                <span style={{ fontSize: '11px', color: '#38bdf8', marginLeft: '4px' }}>(ยอดเติมแพ็กเกจสะสม: ฿{currentUserSpending.toLocaleString()})</span>
                {!isUserAdmin && <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '4px' }}>| แสดงเฉพาะประวัติของคุณ</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder={isUserAdmin ? "🔍 ค้นหาชื่อบัญชีลูกค้า..." : (user ? user.username : "🔍 ค้นหาด้วยชื่อในเกม หรือ UID")}
                value={isUserAdmin ? exactSearchQuery : (user ? (user.username && user.username.includes('@') ? user.username.split('@')[0] : user.username) : exactSearchQuery)} 
                disabled={!isUserAdmin && !!user}
                onChange={(e) => (isUserAdmin || !user) && setExactSearchQuery(e.target.value)} 
                style={{ flex: 1, minWidth: '180px', backgroundColor: isUserAdmin ? '#030712' : '#1f2937', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '12px', color: '#ffffff', outline: 'none', cursor: isUserAdmin ? 'text' : 'not-allowed', fontWeight: 'bold', boxSizing: 'border-box' }} 
              />
              <input 
                type="text" 
                placeholder="🔍 กรอกเลขออร์เดอร์ เช่น ORD-14969..." 
                value={customerOrderSearch} 
                onChange={(e) => setCustomerOrderSearch(e.target.value)} 
                style={{ flex: 1.5, minWidth: '220px', backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '12px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} 
              />
              <select value={selectedGameFilter} onChange={(e) => setSelectedGameFilter(e.target.value)} style={{ flex: 1, minWidth: '150px', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', outline: 'none', cursor: 'pointer' }}>
                <option value="all">🎮 เลือกดูเกม (ทั้งหมด)</option>
                {gamesData.map((g) => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>

            <div style={{ backgroundColor: '#030712', border: '1px solid #9333ea', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>ผลการค้นหา: <b style={{ color: '#ffffff' }}>{searchedOrders.length}</b> รายการ (วันนี้: {todayOrders.length} | ประวัติย้อนหลัง: {pastOrders.length})</span>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>ยอดรวมเงินที่เติม: <b style={{ color: '#34d399', fontSize: '18px' }}>฿{totalSpentInSearch.toLocaleString()}</b></span>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '12px' }}>📅 รายการประจำวัน (วันนี้ {currentDayStr})</h3>
              {paginatedTodayOrders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
                  {paginatedTodayOrders.map((ord, idx) => {
                    const globalIdx = (customerOrdersPage - 1) * customerItemsPerPage + idx + 1;
                    let countdownSec = 0;
                    if (ord.status.includes('รอตรวจสอบ') && ord.timestamp) {
                      const elapsed = Math.floor((Date.now() - ord.timestamp) / 1000);
                      countdownSec = Math.max(0, 10 - elapsed);
                    }
                    return (
                      <div key={ord.firebaseKey || idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ color: '#9333ea', fontWeight: 'bold', fontSize: '12px', marginRight: '4px' }}>#{globalIdx}</span>
                            <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                            <span style={{ fontSize: '12px', color: '#38bdf8' }}>📅 {ord.time}</span>
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: '#ffffff' }}>🎮 {ord.game} <span style={{ color: '#c084fc', fontSize: '13px' }}>({ord.package})</span></div>
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>บัญชีทำรายการ: <b style={{ color: '#38bdf8' }}>{ord.player}</b> {ord.gameChar && <span style={{ color: '#34d399' }}>| ตัวละคร/UID: {ord.gameChar}</span>} | ช่องทางจ่าย: <span style={{ color: '#f472b6', fontWeight: 'bold' }}>{ord.paymentMethod || 'Cyber Wallet'}</span></div>
                          {ord.type !== 'wallet' && (
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', color: '#34d399', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                                ⚡ เติมเข้าไอดี/UID ({ord.gameChar || ord.player}) สำเร็จ 100%[cite: 1, 2]
                              </span>
                              {ord.apiRef && (
                                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>Ref: {ord.apiRef}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '18px', fontWeight: '900', color: '#34d399' }}>฿{ord.price.toLocaleString()}</div>
                          {ord.status.includes('รอตรวจสอบ') ? (
                            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', borderRadius: '8px', padding: '4px 8px', marginTop: '4px' }}>
                              <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold' }}>⏱️ ตรวจสอบใน ({countdownSec}s)</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: ord.status.includes('สำเร็จ') ? '#34d399' : '#f59e0b', fontWeight: 'bold' }}>{ord.status}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af', backgroundColor: '#030712', borderRadius: '14px', border: '1px dashed #374151', marginBottom: '15px' }}>ไม่มีรายการคำสั่งซื้อใหม่ในวันนี้</div>
              )}

              {totalCustomerTodayPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
                  {Array.from({ length: totalCustomerTodayPages }, (_, i) => i + 1).map((pageNum) => (
                    <button key={pageNum} onClick={() => setCustomerOrdersPage(pageNum)} style={{ backgroundColor: customerOrdersPage === pageNum ? '#9333ea' : '#030712', color: '#ffffff', border: '1px solid ' + (customerOrdersPage === pageNum ? '#a855f7' : '#374151'), borderRadius: '8px', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{pageNum}</button>
                  ))}
                </div>
              )}
            </div>

            {pastOrders.length > 0 && (
              <div style={{ backgroundColor: '#030712', border: '1.5px solid rgba(168,85,247,0.4)', borderRadius: '16px', overflow: 'hidden' }}>
                <div onClick={() => setIsPastOrdersOpen(!isPastOrdersOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', padding: '16px 20px', backgroundColor: 'rgba(147, 51, 234, 0.12)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(168,85,247,0.3)', border: '1px solid #c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#c084fc', fontWeight: 'bold' }}>{isPastOrdersOpen ? '▼' : '▶'}</div>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>📂 ประวัติย้อนหลัง (รายการจากวันก่อนหน้า)</h3>
                  </div>
                  <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{pastOrders.length} รายการ</span>
                </div>

                {isPastOrdersOpen && (
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#c084fc', fontWeight: 'bold' }}>📅 เลือกวันที่ประวัติ:</span>
                      <select value={selectedHistoryDate} onChange={handleHistoryDateChange} style={{ backgroundColor: '#111827', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '8px 14px', color: '#38bdf8', fontWeight: 'bold', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
                        <option value="all">🌐 แสดงประวัติย้อนหลังทั้งหมด ({pastOrders.length} รายการ)</option>
                        {availableHistoryDates.map((dateStr) => (
                          <option key={dateStr} value={dateStr}>📅 วันที่ {dateStr} ({groupedPastOrders[dateStr].length} รายการ)</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {paginatedPastOrders.map((ord, idx) => {
                        const globalIdx = (historyPage - 1) * historyItemsPerPage + idx + 1;
                        return (
                          <div key={ord.firebaseKey || idx} style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 'bold' }}>#{globalIdx}</span>
                                <span style={{ backgroundColor: '#374151', color: '#d1d5db', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                                <span style={{ fontSize: '12px', color: '#9ca3af' }}>📅 {ord.time}</span>
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#d1d5db' }}>🎮 {ord.game} <span style={{ color: '#a855f7', fontSize: '12px' }}>({ord.package})</span></div>
                              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>บัญชีทำรายการ: {ord.player} {ord.gameChar && <span style={{ color: '#34d399' }}>| ตัวละคร/UID: {ord.gameChar}</span>} | ช่องทางจ่าย: <span style={{ color: '#f472b6', fontWeight: 'bold' }}>{ord.paymentMethod || 'Cyber Wallet'}</span></div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '16px', fontWeight: '900', color: '#34d399' }}>฿{ord.price.toLocaleString()}</div>
                              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold' }}>{ord.status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {totalHistoryPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '18px' }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af', marginRight: '6px' }}>หน้า {historyPage} จาก {totalHistoryPages}:</span>
                        {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map((pageNum) => (
                          <button key={pageNum} onClick={() => setHistoryPage(pageNum)} style={{ backgroundColor: historyPage === pageNum ? '#9333ea' : '#111827', color: '#ffffff', border: '1px solid ' + (historyPage === pageNum ? '#a855f7' : '#374151'), borderRadius: '8px', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{pageNum}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && isUserAdmin && (
          <div style={{ maxWidth: '950px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {!isAdminLoggedIn ? (
              <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '24px', padding: '35px 30px', textAlign: 'center', border: '1.5px solid #9333ea', boxShadow: '0 0 35px rgba(147,51,234,0.5)' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(147, 51, 234, 0.2)', border: '2px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 15px auto' }}>🔐</div>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: '0 0 6px 0' }}>ยืนยันสิทธิ์แอดมิน</h2>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>กรุณากรอกรหัส PIN 6 หลักเพื่อเข้าหลังบ้าน</p>
                <form onSubmit={handleAdminLogin}>
                  {adminPinError && <div style={{ color: '#fca5a5', marginBottom: '12px', fontSize: '12px', backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '8px' }}>{adminPinError}</div>}
                  <input type="password" maxLength={6} placeholder="PIN 6 หลัก" value={inputAdminPin} onChange={(e) => setInputAdminPin(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #374151', borderRadius: '12px', padding: '14px', color: '#ffffff', textAlign: 'center', fontSize: '22px', letterSpacing: '6px', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }} />
                  <button type="submit" style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                    เข้าสู่ระบบแอดมิน
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                  <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #38bdf8', boxShadow: '0 0 25px rgba(56,189,248,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>🔐 เปลี่ยนรหัส PIN 6 หลัก</h3>
                        <button onClick={() => { setIsAdminLoggedIn(false); localStorage.removeItem('cyber_is_admin_logged'); }} style={{ backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                          ล็อกเอาท์ PIN
                        </button>
                      </div>
                      {changePinMessage.text && (
                        <div style={{ backgroundColor: changePinMessage.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: changePinMessage.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '15px' }}>{changePinMessage.text}</div>
                      )}
                    </div>
                    <form onSubmit={handleChangePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                        <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', width: '100%', boxSizing: 'border-box' }}>
                          <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>1. PIN เดิม</label>
                          <input type="password" maxLength={6} placeholder="------" value={oldPinInput} onChange={(e) => setOldPinInput(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#ffffff', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', letterSpacing: '6px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ backgroundColor: '#030712', border: '1px solid #38bdf8', borderRadius: '12px', padding: '12px', width: '100%', boxSizing: 'border-box' }}>
                          <label style={{ fontSize: '11px', color: '#38bdf8', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>2. PIN ใหม่</label>
                          <input type="password" maxLength={6} placeholder="------" value={newPinInput} onChange={(e) => setNewPinInput(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#ffffff', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', letterSpacing: '6px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ backgroundColor: '#030712', border: '1px solid #34d399', borderRadius: '12px', padding: '12px', width: '100%', boxSizing: 'border-box' }}>
                          <label style={{ fontSize: '11px', color: '#34d399', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>3. ยืนยัน PIN</label>
                          <input type="password" maxLength={6} placeholder="------" value={confirmNewPinInput} onChange={(e) => setConfirmNewPinInput(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#ffffff', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', letterSpacing: '6px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>
                        ✨ บันทึกเปลี่ยนรหัส PIN ใหม่
                      </button>
                    </form>
                  </div>

                  <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #ec4899', boxShadow: '0 0 25px rgba(236,72,153,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f472b6', margin: 0 }}>📢 บันทึกรายการโปรโมทเว็บ / ค่าโฆษณา</h3>
                      {adPromotions.length > 0 && (
                        <button 
                          type="button" 
                          onClick={handleClearAllAdPromotions}
                          style={{ backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          🗑️ ลบทั้งหมด
                        </button>
                      )}
                    </div>
                    <form onSubmit={handleAddAdPromotion} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr auto', gap: '8px', marginBottom: '15px' }}>
                      <select 
                        value={adPlatform} 
                        onChange={(e) => setAdPlatform(e.target.value)} 
                        className="cyber-select cyber-select-pink"
                        style={{ backgroundColor: '#030712', border: '1px solid #ec4899', borderRadius: '10px', padding: '10px 36px 10px 12px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                      >
                        <option value="Facebook Ads">Facebook Ads</option>
                        <option value="TikTok Ads">TikTok Ads</option>
                        <option value="Google / YouTube Ads">Google / YouTube Ads</option>
                        <option value="Instagram Ads">Instagram Ads</option>
                        <option value="LINE Official Account">LINE Official Account</option>
                        <option value="อื่นๆ (Custom)">อื่นๆ (Custom)</option>
                      </select>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input 
                          type="number" 
                          placeholder="ยอดเงิน (บาท)" 
                          value={adAmountInput} 
                          onChange={(e) => setAdAmountInput(e.target.value)} 
                          className="no-native-spin"
                          style={{ backgroundColor: '#030712', border: '1px solid #ec4899', borderRadius: '10px', padding: '10px 28px 10px 12px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', width: '100%' }} 
                        />
                        <div style={{ position: 'absolute', right: '5px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <button 
                            type="button" 
                            onClick={() => setAdAmountInput(prev => String(Math.max(0, (parseFloat(prev) || 0) + 100)))}
                            title="เพิ่มยอดเงิน"
                            style={{ background: 'rgba(236,72,153,0.25)', border: '1px solid #ec4899', borderRadius: '3px', width: '18px', height: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6', fontSize: '8px', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                          >
                            ▲
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setAdAmountInput(prev => String(Math.max(0, (parseFloat(prev) || 0) - 100)))}
                            title="ลดยอดเงิน"
                            style={{ background: 'rgba(236,72,153,0.25)', border: '1px solid #ec4899', borderRadius: '3px', width: '18px', height: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6', fontSize: '8px', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                      <button type="submit" style={{ backgroundColor: '#ec4899', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>+ เพิ่ม</button>
                    </form>
                    <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '10px', minHeight: '165px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      {adPromotions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {paginatedAdPromotions.map((item, index) => {
                            const globalIndex = (adPage - 1) * adItemsPerPage + index + 1;
                            return (
                              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '6px 10px', borderRadius: '8px', fontSize: '11px' }}>
                                <div>
                                  <span style={{ color: '#f472b6', fontWeight: 'bold', marginRight: '6px' }}>{globalIndex}.</span>
                                  <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{item.platform}</span>
                                  <span style={{ color: '#9ca3af', marginLeft: '8px', fontSize: '10px' }}>({item.time})</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ color: '#f472b6', fontWeight: 'bold' }}>-฿{parseFloat(item.amount).toLocaleString()}</span>
                                  <button type="button" onClick={() => handleDeleteAdPromotion(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', padding: '0 2px' }}>✕</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '11px', padding: '20px 0' }}>ยังไม่มีรายการค่าโปรโมท (ว่างเปล่า)</div>
                      )}
                      {totalAdPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #1f2937', paddingTop: '8px' }}>
                          {Array.from({ length: totalAdPages }, (_, i) => i + 1).map((pageNum) => (
                            <button key={pageNum} onClick={() => setAdPage(pageNum)} style={{ backgroundColor: adPage === pageNum ? '#ec4899' : '#111827', color: '#ffffff', border: '1px solid ' + (adPage === pageNum ? '#f472b6' : '#374151'), borderRadius: '6px', padding: '3px 8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>{pageNum}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
                  <div style={{ backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '16px', padding: '18px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>💵 ยอดขายรวมทั้งหมด</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#38bdf8' }}>฿{totalAdminSales.toLocaleString()}</div>
                  </div>
                  <div style={{ backgroundColor: '#030712', border: '1.5px solid #34d399', borderRadius: '16px', padding: '18px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>📈 กำไรสุทธิ (หักโฆษณา)</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#34d399' }}>+฿{netProfitAfterAd.toLocaleString()}</div>
                  </div>
                  <div style={{ backgroundColor: '#030712', border: '1.5px solid #ec4899', borderRadius: '16px', padding: '18px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>📢 ค่าโฆษณา/โปรโมท</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#f472b6' }}>-฿{adExpense.toLocaleString()}</div>
                  </div>
                  <div style={{ backgroundColor: '#030712', border: isVatThresholdReached ? '1.5px solid #c084fc' : '1.5px dashed #4b5563', borderRadius: '16px', padding: '18px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>🏛️ VAT 7% จากกำไร</div>
                    <div style={{ fontSize: isVatThresholdReached ? '18px' : '12px', fontWeight: '900', color: isVatThresholdReached ? '#c084fc' : '#9ca3af', marginTop: isVatThresholdReached ? '0' : '4px' }}>
                      {isVatThresholdReached ? `-฿${totalAdminVat.toLocaleString()}` : '฿0 (ยังไม่ถึงเกณฑ์ 1.8M)'}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#030712', border: '1.5px solid #f59e0b', borderRadius: '16px', padding: '18px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>📋 เสียภาษีประจำปี</div>
                    <div style={{ fontSize: totalAdminTax > 0 ? '18px' : '12px', fontWeight: '900', color: '#f59e0b', marginTop: totalAdminTax > 0 ? '0' : '4px' }}>
                      {totalAdminTax > 0 ? `-฿${totalAdminTax.toLocaleString()}` : '฿0 (ยกเว้น 150k แรก)'}
                    </div>
                  </div>
                </div>

                {/* ส่วนสรุปสถิติหลังบ้าน: เกมที่ลูกค้าเติมเยอะสุด, แพ็กเกจที่เติมเยอะสุด, และระบบแรงค์ลูกค้า VIP */}
                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #38bdf8', boxShadow: '0 0 30px rgba(56, 189, 248, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📊 สรุปสถิติเกม & แพ็กเกจยอดนิยม + ระบบแรงค์ลูกค้า (VIP Leaderboard)</span>
                      </h2>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                        วิเคราะห์ว่าเกมไหนขายดีสุด แพ็กเกจไหนลูกค้าเติมเยอะสุด และคำนวณระดับแรงค์ของลูกค้าเพื่อเตรียมแจกโค้ดของขวัญตามแรงค์
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', backgroundColor: '#030712', padding: '4px', borderRadius: '12px', border: '1px solid #374151' }}>
                      <button
                        type="button"
                        onClick={() => setAdminAnalyticsTab('all')}
                        style={{
                          backgroundColor: adminAnalyticsTab === 'all' ? '#0284c7' : 'transparent',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        🌟 ดูทั้งหมด
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminAnalyticsTab('games')}
                        style={{
                          backgroundColor: adminAnalyticsTab === 'games' ? '#0284c7' : 'transparent',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        🎮 เกมยอดนิยม
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminAnalyticsTab('packages')}
                        style={{
                          backgroundColor: adminAnalyticsTab === 'packages' ? '#0284c7' : 'transparent',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        📦 แพ็กเกจขายดี
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminAnalyticsTab('ranks')}
                        style={{
                          backgroundColor: adminAnalyticsTab === 'ranks' ? '#0284c7' : 'transparent',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        🏆 แรงค์ลูกค้า VIP
                      </button>
                    </div>
                  </div>

                  {/* HIGHLIGHT BANNER: ยอดนิยมอันดับ 1 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '22px' }}>
                    {/* TOP GAME BANNER */}
                    <div style={{ backgroundColor: '#030712', border: '1.5px solid #f59e0b', borderRadius: '16px', padding: '16px', position: 'relative', overflow: 'hidden', boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)' }}>
                      <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '64px', opacity: 0.12 }}>👑</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#fbbf24', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                          👑 เกมที่เติมเยอะที่สุด อันดับ 1
                        </span>
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', marginBottom: '6px' }}>
                        {topGamesStats.length > 0 ? topGamesStats[0].name : 'ยังไม่มีข้อมูลการเติม'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <span style={{ color: '#9ca3af' }}>ยอดเติมสะสม:</span>
                        <b style={{ color: '#38bdf8', fontSize: '16px' }}>฿{topGamesStats.length > 0 ? topGamesStats[0].totalSpent.toLocaleString() : 0}</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                        <span>จำนวนออเดอร์:</span>
                        <b style={{ color: '#34d399' }}>{topGamesStats.length > 0 ? topGamesStats[0].orderCount : 0} รายการ</b>
                      </div>
                    </div>

                    {/* TOP PACKAGE BANNER */}
                    <div style={{ backgroundColor: '#030712', border: '1.5px solid #ec4899', borderRadius: '16px', padding: '16px', position: 'relative', overflow: 'hidden', boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)' }}>
                      <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '64px', opacity: 0.12 }}>🔥</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ backgroundColor: 'rgba(236, 72, 153, 0.2)', border: '1px solid #ec4899', color: '#f472b6', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                          🔥 แพ็กเกจที่เติมเยอะที่สุด อันดับ 1
                        </span>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', marginBottom: '6px' }}>
                        {topPackagesStats.length > 0 ? topPackagesStats[0].package : 'ยังไม่มีข้อมูลการเติม'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <span style={{ color: '#9ca3af' }}>จากเกม: <b style={{ color: '#ffffff' }}>{topPackagesStats.length > 0 ? topPackagesStats[0].game : '-'}</b></span>
                        <b style={{ color: '#f472b6', fontSize: '16px' }}>เติมแล้ว {topPackagesStats.length > 0 ? topPackagesStats[0].orderCount : 0} ครั้ง</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                        <span>ยอดขายรวมแพ็กนี้:</span>
                        <b style={{ color: '#38bdf8' }}>฿{topPackagesStats.length > 0 ? topPackagesStats[0].totalSpent.toLocaleString() : 0}</b>
                      </div>
                    </div>

                    {/* TOP VIP SPENDER BANNER */}
                    <div style={{ backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '16px', padding: '16px', position: 'relative', overflow: 'hidden', boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)' }}>
                      <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '64px', opacity: 0.12 }}>🏆</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', border: '1px solid #a855f7', color: '#c084fc', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                          🏆 ลูกค้ายอดเติมสูงสุด (Top VIP Spender)
                        </span>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {customerRankStats.length > 0 ? (
                          <>
                            <span>{customerRankStats[0].username}</span>
                            <span style={{ fontSize: '10px', background: customerRankStats[0].rank.bg, border: `1px solid ${customerRankStats[0].rank.border}`, color: customerRankStats[0].rank.color, padding: '2px 6px', borderRadius: '6px' }}>
                              {customerRankStats[0].rank.shortName}
                            </span>
                          </>
                        ) : 'ยังไม่มีข้อมูลลูกค้า'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <span style={{ color: '#9ca3af' }}>ยอดเติมแพ็กสะสม:</span>
                        <b style={{ color: '#34d399', fontSize: '16px' }}>฿{customerRankStats.length > 0 ? customerRankStats[0].totalSpent.toLocaleString() : 0}</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                        <span>จำนวนครั้งที่เติม:</span>
                        <b style={{ color: '#c084fc' }}>{customerRankStats.length > 0 ? customerRankStats[0].orderCount : 0} ครั้ง</b>
                      </div>
                    </div>
                  </div>

                  {/* SUMMARY TABLES GRID */}
                  <div style={{ display: 'grid', gridTemplateColumns: adminAnalyticsTab === 'all' ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr', gap: '18px' }}>
                    {/* TABLE 1: สรุปอันดับเกมที่ลูกค้าเติมเยอะสุด */}
                    {(adminAnalyticsTab === 'all' || adminAnalyticsTab === 'games') && (
                      <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '16px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>
                            🎮 อันดับเกมที่ลูกค้าเติมเยอะที่สุด
                          </h4>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>{topGamesStats.length} เกมที่มีการเติม</span>
                        </div>

                        {topGamesStats.length === 0 ? (
                          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '30px', fontSize: '12px' }}>ยังไม่มีประวัติการเติมเกม</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {topGamesStats.map((item, idx) => {
                              const maxSpend = topGamesStats[0].totalSpent || 1;
                              const pct = Math.round((item.totalSpent / maxSpend) * 100);
                              return (
                                <div key={item.name} style={{ backgroundColor: '#111827', border: '1px solid ' + (idx === 0 ? '#f59e0b' : '#1f2937'), borderRadius: '10px', padding: '10px 12px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{
                                        width: '22px', height: '22px', borderRadius: '50%',
                                        backgroundColor: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : '#374151',
                                        color: '#030712', fontWeight: '900', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                      }}>
                                        {idx + 1}
                                      </span>
                                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff' }}>{item.name}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                      <b style={{ color: '#38bdf8', fontSize: '13px' }}>฿{item.totalSpent.toLocaleString()}</b>
                                      <span style={{ fontSize: '10px', color: '#9ca3af', marginLeft: '6px' }}>({item.orderCount} ออเดอร์)</span>
                                    </div>
                                  </div>
                                  <div style={{ width: '100%', height: '5px', backgroundColor: '#030712', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: idx === 0 ? '#f59e0b' : '#38bdf8', borderRadius: '3px' }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TABLE 2: สรุปอันดับแพ็กเกจที่ลูกค้าเติมเยอะสุด */}
                    {(adminAnalyticsTab === 'all' || adminAnalyticsTab === 'packages') && (
                      <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '16px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#ec4899', margin: 0 }}>
                            📦 อันดับแพ็กเกจที่ลูกค้าเติมเยอะที่สุด
                          </h4>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>{topPackagesStats.length} รายการ</span>
                        </div>

                        {topPackagesStats.length === 0 ? (
                          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '30px', fontSize: '12px' }}>ยังไม่มีประวัติการเติมแพ็กเกจ</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {topPackagesStats.slice(0, 10).map((item, idx) => {
                              const maxCount = topPackagesStats[0].orderCount || 1;
                              const pct = Math.round((item.orderCount / maxCount) * 100);
                              return (
                                <div key={item.key} style={{ backgroundColor: '#111827', border: '1px solid ' + (idx === 0 ? '#ec4899' : '#1f2937'), borderRadius: '10px', padding: '10px 12px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{
                                        width: '22px', height: '22px', borderRadius: '50%',
                                        backgroundColor: idx === 0 ? '#ec4899' : idx === 1 ? '#c084fc' : idx === 2 ? '#38bdf8' : '#374151',
                                        color: '#ffffff', fontWeight: '900', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                      }}>
                                        {idx + 1}
                                      </span>
                                      <div>
                                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}>{item.package}</div>
                                        <div style={{ fontSize: '10px', color: '#9ca3af' }}>🎮 {item.game}</div>
                                      </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                      <b style={{ color: '#f472b6', fontSize: '13px' }}>เติม {item.orderCount} ครั้ง</b>
                                      <div style={{ fontSize: '10px', color: '#38bdf8' }}>รวม ฿{item.totalSpent.toLocaleString()}</div>
                                    </div>
                                  </div>
                                  <div style={{ width: '100%', height: '5px', backgroundColor: '#030712', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: idx === 0 ? '#ec4899' : '#c084fc', borderRadius: '3px' }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TABLE 3: สรุปแรงค์ลูกค้าทั้งหมด (Customer VIP Leaderboard & Tier Distribution) */}
                    {(adminAnalyticsTab === 'all' || adminAnalyticsTab === 'ranks') && (
                      <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '16px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#a855f7', margin: 0 }}>
                            🏆 อันดับแรงค์ลูกค้า VIP ทั้งหมด (พร้อมแจกโค้ด)
                          </h4>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>{customerRankStats.length} บัญชี</span>
                        </div>

                        {/* RANK DISTRIBUTION: 7 DECORATED TIER CARDS (ตกแต่งสวยงามพิเศษทุกแรงค์ในหน้าแอดมิน) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                          {RANK_TIERS.map(t => (
                            <div
                              key={t.tier}
                              className={t.animationClass ? 'rank-tier-card' : 'rank-tier-card'}
                              style={{
                                background: t.cardBg,
                                border: `1.5px solid ${t.border}`,
                                borderRadius: '12px',
                                padding: '10px 8px',
                                textAlign: 'center',
                                boxShadow: t.glow,
                                position: 'relative'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                                <RankEmblem tier={t.tier} size={36} />
                              </div>
                              <div style={{ fontSize: '11px', fontWeight: '900', color: t.color, textShadow: `0 0 6px ${t.border}` }}>
                                {t.shortName}
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff', margin: '4px 0 2px 0' }}>
                                {customerRankCounts[t.tier] || 0} <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 'normal' }}>คน</span>
                              </div>
                              <div style={{ fontSize: '9px', color: '#9ca3af' }}>
                                {t.rateText}
                              </div>
                            </div>
                          ))}
                        </div>

                        {customerRankStats.length === 0 ? (
                          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '30px', fontSize: '12px' }}>ยังไม่มีข้อมูลลูกค้า</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                            {customerRankStats.slice(0, 15).map((item, idx) => (
                              <div key={item.username} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', border: `1px solid ${item.rank.border}`, borderRadius: '10px', padding: '8px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', width: '16px' }}>#{idx + 1}</span>
                                  <div>
                                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff' }}>{item.username}</div>
                                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>เติมไปแล้ว {item.orderCount} ออเดอร์</div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '900', color: '#34d399' }}>฿{item.totalSpent.toLocaleString()}</div>
                                    <div style={{ fontSize: '9px', color: '#9ca3af' }}>ยอดเติมสะสม</div>
                                  </div>
                                  <span style={{
                                    fontSize: '10px',
                                    fontWeight: '900',
                                    background: item.rank.bg,
                                    border: `1.5px solid ${item.rank.border}`,
                                    color: item.rank.color,
                                    padding: '3px 8px',
                                    borderRadius: '10px',
                                    boxShadow: item.rank.glow,
                                    whiteSpace: 'nowrap',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}>
                                    <RankEmblem tier={item.rank.tier} size={15} />
                                    <span>{item.rank.shortName}</span>
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* การ์ดศูนย์รวมลิงก์เว็บเติมเกมทางการสำหรับแอดมิน */}
                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', border: '1.5px solid #10b981', padding: '22px', boxShadow: '0 0 25px rgba(16,185,129,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#34d399', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🌐 ลิงก์เว็บเติมเกมหลังบ้านสำหรับแอดมิน (ยึดเว็บ LnwTRUE เป็นหลัก)</span>
                      </h3>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                        เมื่อลูกค้าสั่งซื้อและโอนเงินแล้ว แอดมินสามารถกดปุ่มเปิดเว็บ LnwTRUE (หรือเว็บทางการ) ของแต่ละเกม เพื่อก๊อปปี้ UID ลูกค้าไปวางเติมได้ทันที
                      </p>
                    </div>
                    <span style={{ fontSize: '11px', backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '8px', border: '1px solid #10b981', fontWeight: 'bold' }}>
                      ⚡ 10 หมวดหมู่พร้อมใช้งาน (LnwTRUE เป็นหลัก)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {Object.entries(officialGameTopupLinks).map(([key, item]) => (
                      <div key={key} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff' }}>🎮 {item.name}</div>
                          <div style={{ fontSize: '10px', color: '#38bdf8', marginTop: '2px' }}>ผู้ให้บริการ: {item.provider}</div>
                          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '1px' }}>{item.note}</div>
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            padding: '7px 12px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 0 10px rgba(16,185,129,0.3)',
                            flexShrink: 0
                          }}
                        >
                          🔗 เปิดเว็บเติม ↗
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', border: '1.5px solid rgba(147,51,234,0.5)', overflow: 'hidden' }}>
                  <div onClick={() => setIsAdminOrdersOpen(!isAdminOrdersOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', padding: '20px 25px', backgroundColor: 'rgba(147, 51, 234, 0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px', color: '#c084fc', fontWeight: 'bold' }}>{isAdminOrdersOpen ? '▼' : '▶'}</span>
                      <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#ffffff' }}>📊 รายการทำรายการหลังบ้าน + ช่องทางที่ลูกค้าชำระเงิน</h2>
                    </div>
                    <span style={{ backgroundColor: 'rgba(147, 51, 234, 0.3)', color: '#c084fc', border: '1px solid #9333ea', padding: '4px 12px', borderRadius: '14px', fontSize: '12px', fontWeight: 'bold' }}>{filteredOrders.length} รายการ</span>
                  </div>

                  {isAdminOrdersOpen && (
                    <div style={{ padding: '25px' }}>
                      <input type="text" placeholder="🔍 ค้นหาเลขออร์เดอร์ หรือชื่อบัญชีลูกค้า..." value={adminSearchQuery} onChange={(e) => { setAdminSearchQuery(e.target.value); setAdminOrdersPage(1); }} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }} />
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                        {paginatedAdminOrders.map((ord, idx) => {
                          let adminCountdownSec = 0;
                          if (ord.status.includes('รอตรวจสอบ') && ord.timestamp) {
                            const elapsed = Math.floor((Date.now() - ord.timestamp) / 1000);
                            adminCountdownSec = Math.max(0, 10 - elapsed);
                          }
                          return (
                            <div key={ord.firebaseKey || idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                                  <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                                  <span style={{ fontSize: '12px', color: '#38bdf8' }}>📅 {ord.time}</span>
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span>{ord.game}</span>
                                  <span style={{ color: '#c084fc', fontSize: '14px' }}>({ord.package})</span>
                                  {(() => {
                                    const linkInfo = getTopupLinkForGame(ord.game);
                                    if (linkInfo) {
                                      return (
                                        <a
                                          href={linkInfo.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{
                                            backgroundColor: '#0284c7',
                                            color: '#ffffff',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                            boxShadow: '0 0 8px rgba(2,132,199,0.3)'
                                          }}
                                          title={`คลิกเพื่อเปิดเว็บ ${linkInfo.provider} เพื่อเติมเกม ${linkInfo.name}`}
                                        >
                                          🚀 เปิดเว็บเติม {linkInfo.name} ↗
                                        </a>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>บัญชีทำรายการ: <b style={{ color: '#38bdf8' }}>{ord.player}</b> {ord.gameChar && <span style={{ color: '#34d399', fontWeight: 'bold' }}>| UID ลูกค้า: {ord.gameChar}</span>} | ยอดขาย: <b style={{ color: '#ffffff' }}>฿{ord.price.toLocaleString()}</b></div>
                                <div style={{ fontSize: '12px', color: '#f472b6', marginTop: '4px', fontWeight: 'bold' }}>💳 ช่องทางชำระเงิน: {ord.paymentMethod || 'Cyber Wallet (เครดิตร้าน)'}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                {ord.type === 'game' ? (
                                  <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: '10px', padding: '6px 12px', marginBottom: '6px', display: 'inline-block' }}>
                                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>📈 กำไรสุทธิ: </span>
                                    <b style={{ color: '#34d399', fontSize: '14px' }}>+฿{(ord.profit || 0).toLocaleString()}</b>
                                  </div>
                                ) : ord.type === 'event' ? (
                                  <div style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '6px', fontWeight: 'bold' }}>🎁 ของขวัญฟรี</div>
                                ) : (
                                  <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>💳 เติมเครดิตร้าน</div>
                                )}

                                {ord.status.includes('รอตรวจสอบ') ? (
                                  <div>
                                    <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold', marginBottom: '6px' }}>⏱️ ตรวจสอบใน ({adminCountdownSec}s)</div>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                      <button onClick={() => handleAdminApproveOrder(ord)} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>✅ อนุมัติ</button>
                                      <button onClick={() => handleAdminRejectOrder(ord)} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>❌ ยกเลิก</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 'bold' }}>{ord.status}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {totalAdminPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                          {Array.from({ length: totalAdminPages }, (_, i) => i + 1).map((pageNum) => (
                            <button key={pageNum} onClick={() => setAdminOrdersPage(pageNum)} style={{ backgroundColor: adminOrdersPage === pageNum ? '#9333ea' : '#030712', color: '#ffffff', border: '1px solid ' + (adminOrdersPage === pageNum ? '#a855f7' : '#374151'), borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>{pageNum}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #10b981', boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#34d399', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚡ จัดการสถานะสต็อก & เปิด-ปิดรับเติมเกม (ทุกเกมในระบบ)</span>
                      </h3>
                      <p style={{ fontSize: '12px', color: '#d1d5db', margin: '4px 0 0 0' }}>
                        แอดมินสามารถคลิกตั้งค่าเกมเป็น "สต็อกหมด" เพื่อปิดรับเติมชั่วคราวได้ทันที ลูกค้าจะไม่สามารถกดเติมเกมนั้นได้จนกว่าแอดมินจะกดเปิด
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* ปุ่มคำสั่งเปิด/ปิดทั้งหมด */}
                      <button
                        type="button"
                        onClick={() => handleSetAllGameStock(true)}
                        style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', color: '#34d399', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        title="เปิดรับเติมทุกเกมพร้อมกัน"
                      >
                        🟢 เปิดรับเติมทุกเกม
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetAllGameStock(false)}
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        title="ตั้งสต็อกหมดทุกเกมพร้อมกัน"
                      >
                        🔴 ตั้งสต็อกหมดทุกเกม
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowLegacyStockAdmin(!showLegacyStockAdmin)}
                        style={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#9ca3af', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        {showLegacyStockAdmin ? 'ซ่อนโหมดโค้ดสำรอง ▲' : 'ดูโหมดโค้ดสำรอง ▼'}
                      </button>
                    </div>
                  </div>

                  {/* สรุปจำนวนเกมที่พร้อมรับเติม vs สต็อกหมด */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', fontSize: '12px' }}>
                    <span style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', border: '1px solid #34d399', color: '#34d399', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold' }}>
                      🟢 พร้อมให้บริการ: {gamesData.filter(g => gameStockStatus[g.id] !== false).length} เกม
                    </span>
                    <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold' }}>
                      🔴 สต็อกหมด (ปิดรับเติม): {gamesData.filter(g => gameStockStatus[g.id] === false).length} เกม
                    </span>
                  </div>

                  {/* ตารางแสดงการ์ดเกมทุกเกม พร้อมปุ่มสลับสถานะสต็อกรายเกม และระบบเปิด/ปิดสต็อกรายแพ็กเกจทุกแพ็ก */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px', marginBottom: showLegacyStockAdmin ? '20px' : '0' }}>
                    {gamesData.map((g) => {
                      const isGameOutOfStock = gameStockStatus[g.id] === false;
                      const isExpanded = expandedStockGameId === g.id;
                      const outOfStockPkgsCount = g.packages.filter(p => packageStockStatus[`${g.id}_${p.id}`] === false).length;
                      const inStockPkgsCount = g.packages.length - outOfStockPkgsCount;

                      return (
                        <div 
                          key={g.id} 
                          style={{ 
                            backgroundColor: isGameOutOfStock ? 'rgba(30, 20, 25, 0.95)' : '#030712', 
                            border: isGameOutOfStock ? '1.5px solid #ef4444' : '1.5px solid rgba(52, 211, 153, 0.4)', 
                            borderRadius: '14px', 
                            padding: '14px', 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: '10px',
                            boxShadow: isGameOutOfStock ? '0 0 15px rgba(239, 68, 68, 0.25)' : 'none',
                            transition: 'all 0.25s'
                          }}
                        >
                          {/* แถวหัวการ์ดเกม */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={g.image} alt={g.name} style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', border: `1.5px solid ${isGameOutOfStock ? '#ef4444' : '#34d399'}` }} />
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>{g.name}</div>
                                <div style={{ fontSize: '10px', color: '#9ca3af' }}>{g.packages.length} แพ็กเกจในระบบ</div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ 
                                fontSize: '10px', 
                                fontWeight: 'bold', 
                                color: isGameOutOfStock ? '#fca5a5' : '#34d399', 
                                backgroundColor: isGameOutOfStock ? 'rgba(239, 68, 68, 0.2)' : 'rgba(52, 211, 153, 0.15)', 
                                padding: '3px 8px', 
                                borderRadius: '6px', 
                                border: `1px solid ${isGameOutOfStock ? '#ef4444' : '#34d399'}` 
                              }}>
                                {isGameOutOfStock ? '🔴 ปิดทั้งเกม' : '🟢 เปิดทั้งเกม'}
                              </span>
                            </div>
                          </div>

                          {/* สรุปสถานะสต็อกรายแพ็กเกจของเกมนี้ */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', borderRadius: '8px', padding: '6px 10px', fontSize: '11px' }}>
                            <span style={{ color: '#d1d5db' }}>
                              สถานะแพ็กเกจ: <b style={{ color: inStockPkgsCount > 0 ? '#34d399' : '#ef4444' }}>{inStockPkgsCount}/{g.packages.length} มีของ</b>
                            </span>
                            {outOfStockPkgsCount > 0 && (
                              <span style={{ color: '#f87171', fontWeight: 'bold' }}>
                                (หมด {outOfStockPkgsCount} แพ็ก)
                              </span>
                            )}
                          </div>

                          {/* ปุ่มควบคุมสต็อกทั้งเกม + ปุ่มคลี่ดูแพ็กเกจย่อย */}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleGameStock(g.id, g.name)}
                              style={{
                                flex: 1,
                                backgroundColor: isGameOutOfStock ? '#059669' : 'rgba(239, 68, 68, 0.18)',
                                border: `1px solid ${isGameOutOfStock ? '#34d399' : '#ef4444'}`,
                                color: isGameOutOfStock ? '#ffffff' : '#f87171',
                                padding: '7px 10px',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                            >
                              {isGameOutOfStock ? '🟢 เปิดทั้งเกม' : '🔴 ปิดทั้งเกม'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpandedStockGameId(isExpanded ? null : g.id)}
                              style={{
                                flex: 1.3,
                                backgroundColor: isExpanded ? '#9333ea' : '#1f2937',
                                border: `1px solid ${isExpanded ? '#c084fc' : '#374151'}`,
                                color: '#ffffff',
                                padding: '7px 10px',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>📦 จัดการรายแพ็กเกจ</span>
                              <span>{isExpanded ? '▲' : '▼'}</span>
                            </button>
                          </div>

                          {/* ลิ้นชักรายละเอียดสต็อกรายแพ็กเกจ (สำหรับเลือกกดมี/ไม่มี ได้ทุกแพ็ก) */}
                          {isExpanded && (
                            <div style={{ backgroundColor: '#090d16', border: '1px solid #374151', borderRadius: '10px', padding: '10px', marginTop: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #1f2937' }}>
                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#38bdf8' }}>
                                  รายการแพ็กเกจ ({g.packages.length} รายการ):
                                </span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleSetAllPackagesStockForGame(g.id, g.name, true)}
                                    style={{ backgroundColor: 'rgba(52,211,153,0.15)', border: '1px solid #34d399', color: '#34d399', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                                    title="เปิดขายทุกแพ็กเกจ"
                                  >
                                    มีของทุกแพ็ก
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSetAllPackagesStockForGame(g.id, g.name, false)}
                                    style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                                    title="ตั้งหมดทุกแพ็กเกจ"
                                  >
                                    หมดทุกแพ็ก
                                  </button>
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                                {g.packages.map((pkg) => {
                                  const pKey = `${g.id}_${pkg.id}`;
                                  const isPkgOutOfStock = packageStockStatus[pKey] === false;
                                  return (
                                    <div
                                      key={pkg.id}
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: isPkgOutOfStock ? 'rgba(239, 68, 68, 0.12)' : '#111827',
                                        border: `1px solid ${isPkgOutOfStock ? '#ef4444' : '#1f2937'}`,
                                        borderRadius: '8px',
                                        padding: '6px 8px',
                                        fontSize: '11px'
                                      }}
                                    >
                                      <div>
                                        <div style={{ fontWeight: 'bold', color: isPkgOutOfStock ? '#fca5a5' : '#ffffff' }}>
                                          {pkg.name}
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                                          ฿{pkg.price.toLocaleString()} ({pkg.bonus})
                                        </div>
                                      </div>

                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{
                                          fontSize: '9px',
                                          fontWeight: 'bold',
                                          color: isPkgOutOfStock ? '#ef4444' : '#34d399',
                                          backgroundColor: isPkgOutOfStock ? 'rgba(239,68,68,0.2)' : 'rgba(52,211,153,0.2)',
                                          padding: '2px 6px',
                                          borderRadius: '4px'
                                        }}>
                                          {isPkgOutOfStock ? 'หมด' : 'มีของ'}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleTogglePackageStock(g.id, pkg.id, g.name, pkg.name)}
                                          style={{
                                            backgroundColor: isPkgOutOfStock ? '#059669' : 'rgba(239, 68, 68, 0.25)',
                                            border: `1px solid ${isPkgOutOfStock ? '#34d399' : '#ef4444'}`,
                                            color: isPkgOutOfStock ? '#ffffff' : '#f87171',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                          }}
                                          title={isPkgOutOfStock ? 'คลิกเพื่อเปิดว่ามีของ' : 'คลิกเพื่อตั้งว่าสินค้าหมด'}
                                        >
                                          {isPkgOutOfStock ? 'เปิดขาย' : 'ตั้งหมด'}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* การจัดการสมาชิก & รีเซ็ตข้อมูลระบบ (User Management & Reset System) */}
                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #ec4899', boxShadow: '0 0 30px rgba(236,72,153,0.25)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f472b6', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>👥 จัดการบัญชีสมาชิก & รีเซ็ตข้อมูลระบบ</span>
                      </h3>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                        ควบคุมบัญชีผู้ใช้ ลบบัญชีเพื่อให้ลูกค้าสมัครใหม่ และรีเซ็ตยอดเครดิต/ประวัติออเดอร์ให้เหลือ 0 โดยยังคงบัญชีสมาชิกไว้
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {confirmResetAllSystem ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={handleExecuteResetAll}
                            style={{
                              backgroundColor: '#dc2626',
                              border: '1px solid #ef4444',
                              color: '#ffffff',
                              padding: '8px 16px',
                              borderRadius: '10px',
                              fontWeight: 'bold',
                              fontSize: '12px',
                              cursor: 'pointer',
                              boxShadow: '0 0 15px rgba(239, 68, 68, 0.7)'
                            }}
                          >
                            ⚠️ ยืนยันรีเซ็ตทุกไอดีเป็น 0!
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmResetAllSystem(false)}
                            style={{
                              backgroundColor: '#374151',
                              border: '1px solid #4b5563',
                              color: '#d1d5db',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              fontWeight: 'bold',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmResetAllSystem(true)}
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            border: '1.5px solid #ef4444',
                            color: '#f87171',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          🔄 รีเซ็ตเครดิต & ประวัติทุกไอดีเป็น 0 (คงบัญชีไว้)
                        </button>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const filteredRegisteredUsers = registeredUsers.filter(u => {
                      if (!adminUserSearch.trim()) return true;
                      const term = adminUserSearch.toLowerCase().trim();
                      return (u.username && u.username.toLowerCase().includes(term)) ||
                             (u.email && u.email.toLowerCase().includes(term)) ||
                             (u.firebaseKey && u.firebaseKey.toLowerCase().includes(term));
                    });

                    return (
                  <div style={{ backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '16px', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8' }}>
                          👥 จัดการยอดเครดิตสมาชิก ({filteredRegisteredUsers.length}/{registeredUsers.length} บัญชี)
                        </span>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                          💡 ค้นหาชื่อบัญชีเพื่อกด <b>+ เติมเงิน</b> หรือ <b>➖ ลดเงิน</b> กรณีเติมผิดบัญชีได้ทันที
                        </div>
                      </div>

                      {/* ช่องค้นหาชื่อบัญชีเพื่อเติม/ลดเงิน */}
                      <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
                        <input
                          type="text"
                          placeholder="🔍 ค้นหาชื่อบัญชี หรือ อีเมล..."
                          value={adminUserSearch}
                          onChange={(e) => setAdminUserSearch(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: '#111827',
                            border: '1.5px solid #38bdf8',
                            borderRadius: '10px',
                            padding: '8px 32px 8px 12px',
                            color: '#ffffff',
                            fontSize: '12px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            boxShadow: '0 0 12px rgba(56,189,248,0.25)'
                          }}
                        />
                        {adminUserSearch && (
                          <button
                            type="button"
                            onClick={() => setAdminUserSearch('')}
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: '#9ca3af',
                              cursor: 'pointer',
                              fontSize: '13px',
                              padding: 0
                            }}
                            title="ล้างคำค้นหา"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
                      {filteredRegisteredUsers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#9ca3af', fontSize: '13px', gridColumn: '1 / -1' }}>
                          🔍 ไม่พบบัญชีผู้ใช้ที่ตรงกับคำค้นหา <b style={{ color: '#38bdf8' }}>"{adminUserSearch}"</b>
                        </div>
                      ) : (
                        filteredRegisteredUsers.map(u => {
                        const isNattapong = u.username?.toLowerCase() === 'nattapong';
                        const isDeletingThis = confirmDeleteUserKey === u.firebaseKey;
                        return (
                          <div 
                            key={u.firebaseKey || u.username}
                            style={{
                              backgroundColor: isNattapong ? 'rgba(239, 68, 68, 0.15)' : '#111827',
                              border: `1px solid ${isNattapong ? '#ef4444' : '#1f2937'}`,
                              borderRadius: '10px',
                              padding: '10px 14px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>👤 {u.username}</span>
                                {isNattapong && (
                                  <span style={{ fontSize: '9px', backgroundColor: '#ef4444', color: '#ffffff', padding: '1px 5px', borderRadius: '4px', fontWeight: '900' }}>
                                    เป้าหมายลบ
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                                📧 {u.email || 'ไม่มีอีเมล'} | เครดิต: <b style={{ color: '#34d399' }}>฿{(u.balance || 0).toLocaleString()}</b>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const val = prompt(`ระบุจำนวนเครดิต (บาท) ที่ต้องการเพิ่มให้ "${u.username}" (ยอดปัจจุบัน: ฿${(u.balance || 0).toLocaleString()}):`, "100");
                                  if (val && !isNaN(parseFloat(val)) && parseFloat(val) > 0) {
                                    const amt = parseFloat(val);
                                    creditUserWallet(u.username, amt);
                                    alert(`✅ เพิ่มเครดิตให้คุณ ${u.username} จำนวน ฿${amt.toLocaleString()} สำเร็จแล้ว (ยอดใหม่: ฿${((u.balance || 0) + amt).toLocaleString()})`);
                                  }
                                }}
                                style={{
                                  backgroundColor: '#059669',
                                  border: '1px solid #10b981',
                                  color: '#ffffff',
                                  padding: '5px 8px',
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  boxShadow: '0 0 10px rgba(16,185,129,0.3)'
                                }}
                                title="เพิ่มเครดิตเข้ากระเป๋าบัญชีนี้"
                              >
                                + เติมเงิน
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = u.balance || 0;
                                  const val = prompt(`ระบุจำนวนเครดิต (บาท) ที่ต้องการหัก/ลดจาก "${u.username}" (ยอดปัจจุบันมี: ฿${cur.toLocaleString()}):`, cur > 0 ? cur.toString() : "50");
                                  if (val && !isNaN(parseFloat(val)) && parseFloat(val) > 0) {
                                    const amt = parseFloat(val);
                                    if (amt > cur) {
                                      const confirmExceed = confirm(`⚠️ ยอดที่ต้องการหัก (฿${amt.toLocaleString()}) มากกว่ายอดคงเหลือ (฿${cur.toLocaleString()}) ต้องการลดยอดจนเหลือ ฿0 หรือไม่?`);
                                      if (!confirmExceed) return;
                                    }
                                    const newBal = deductUserWallet(u.username, amt);
                                    alert(`➖ ลดเครดิตคุณ ${u.username} จำนวน ฿${amt.toLocaleString()} สำเร็จแล้ว (ยอดคงเหลือใหม่: ฿${(newBal !== null ? newBal : 0).toLocaleString()})`);
                                  }
                                }}
                                style={{
                                  backgroundColor: '#d97706',
                                  border: '1px solid #f59e0b',
                                  color: '#ffffff',
                                  padding: '5px 8px',
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  boxShadow: '0 0 10px rgba(245,158,11,0.3)'
                                }}
                                title="ลดเงินหรือหักยอดเครดิตกรณีเติมผิดบัญชี"
                              >
                                ➖ ลดเงิน
                              </button>
                              {isDeletingThis ? (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUserAccount(u)}
                                    style={{
                                      backgroundColor: '#dc2626',
                                      border: 'none',
                                      color: '#ffffff',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      fontSize: '10px',
                                      fontWeight: 'bold',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    ยืนยัน
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteUserKey(null)}
                                    style={{
                                      backgroundColor: '#374151',
                                      border: 'none',
                                      color: '#ffffff',
                                      padding: '4px 6px',
                                      borderRadius: '6px',
                                      fontSize: '10px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteUserKey(u.firebaseKey)}
                                  style={{
                                    backgroundColor: isNattapong ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid #ef4444',
                                    color: isNattapong ? '#ffffff' : '#f87171',
                                    padding: '5px 10px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                  }}
                                >
                                  🗑️ ลบบัญชี
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      }))}
                    </div>
                  </div>
                    );
                  })()}
                </div>


                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #38bdf8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>🎁 สร้างและจัดการโค้ดของขวัญพิเศษ (Realtime Cloud)</h3>
                    <button onClick={handleResetAllRedeemRights} style={{ backgroundColor: '#f59e0b', color: '#000000', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} title="คลิกเพื่อปลดล็อคให้ทุกบัญชีและทุก UID สามารถรับของขวัญรอบใหม่ได้">
                      <span>🔄 รีเซ็ตสิทธิ์รับของขวัญทั้งหมด</span>
                      <span style={{ backgroundColor: '#000000', color: '#fbbf24', padding: '1px 7px', borderRadius: '10px', fontSize: '10px' }}>
                        {globalRedeemedPlayers.length} รายการติดสิทธิ์
                      </span>
                    </button>
                  </div>

                  {adminCodeMsg.text && (
                    <div style={{ backgroundColor: adminCodeMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: adminCodeMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '15px' }}>{adminCodeMsg.text}</div>
                  )}

                  <form onSubmit={handleCreateGiftCode} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>1. ชื่อโค้ด (Code Name)</label>
                      <input type="text" placeholder="ระบุชื่อโค้ด เช่น GIFT2026 (บังคับกรอก)" value={newCodeName} onChange={(e) => setNewCodeName(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>2. เลือกเกม</label>
                      <select value={newCodeGame} onChange={(e) => setNewCodeGame(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}>
                        {gamesData.map((g) => (
                          <option key={g.id} value={g.name}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>3. เลือกแพ็กเกจของรางวัล</label>
                      <select value={newCodeReward} onChange={(e) => setNewCodeReward(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#38bdf8', fontWeight: 'bold', outline: 'none', boxSizing: 'border-box' }}>
                        {selectedGameForAdminCode?.packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.name}>{pkg.name} (฿{pkg.price})</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <label style={{ fontSize: '11px', color: '#c084fc', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                        4. กำหนดแรงค์ขั้นต่ำที่กรอกได้
                      </label>
                      {(() => {
                        const selTier = RANK_TIERS.find(t => t.tier === newCodeMinRank) || RANK_TIERS[RANK_TIERS.length - 1];
                        return (
                          <div style={{ position: 'relative' }}>
                            {/* กล่องเลือกแรงค์ที่ปรับแต่งใหม่ แสดงรูปตราสัญลักษณ์ คมชัด สวยงาม 100% */}
                            <div
                              onClick={() => setIsRankSelectOpen(prev => !prev)}
                              style={{
                                width: '100%',
                                backgroundColor: '#030712',
                                border: `1.5px solid ${isRankSelectOpen ? '#a855f7' : selTier.border}`,
                                borderRadius: '10px',
                                padding: '8px 12px',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                boxSizing: 'border-box',
                                boxShadow: selTier.glow,
                                transition: 'all 0.2s ease',
                                userSelect: 'none',
                                minHeight: '44px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                <RankEmblem tier={selTier.tier} size={22} />
                                <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                                  <div style={{ fontSize: '12px', fontWeight: '900', color: selTier.color, whiteSpace: 'nowrap' }}>
                                    {selTier.tier === 'BRONZE' ? 'ทุกระดับแรงค์ (Bronze Member)' : `เฉพาะ ${selTier.badge} ขึ้นไป`}
                                  </div>
                                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                    ยอดเติมสะสม {selTier.rateText}
                                  </div>
                                </div>
                              </div>
                              <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 'bold', marginLeft: '6px' }}>
                                {isRankSelectOpen ? '▲' : '▼'}
                              </span>
                            </div>

                            {/* เมนูดรอปดาวน์แสดงตราสัญลักษณ์ประจำแรงค์ทุกระดับ ไม่มีกล่องสี่เหลี่ยมตกหล่น */}
                            {isRankSelectOpen && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 'calc(100% + 6px)',
                                  left: 0,
                                  right: 0,
                                  minWidth: '290px',
                                  zIndex: 200,
                                  backgroundColor: '#0b101d',
                                  border: '1.5px solid #a855f7',
                                  borderRadius: '14px',
                                  padding: '6px',
                                  boxShadow: '0 16px 45px rgba(0,0,0,0.95), 0 0 25px rgba(168,85,247,0.4)',
                                  backdropFilter: 'blur(16px)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px',
                                  maxHeight: '320px',
                                  overflowY: 'auto'
                                }}
                              >
                                {RANK_TIERS.map(t => {
                                  const isSelected = newCodeMinRank === t.tier;
                                  return (
                                    <div
                                      key={t.tier}
                                      onClick={() => {
                                        setNewCodeMinRank(t.tier);
                                        setIsRankSelectOpen(false);
                                      }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 10px',
                                        borderRadius: '8px',
                                        backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                                        border: isSelected ? `1px solid ${t.border}` : '1px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <RankEmblem tier={t.tier} size={22} />
                                        <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                                          <div style={{ fontSize: '12px', fontWeight: '900', color: t.color }}>
                                            {t.tier === 'BRONZE' ? 'ทุกระดับแรงค์ (Bronze Member)' : `เฉพาะ ${t.badge}`}
                                          </div>
                                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                            ยอดเติมสะสม {t.rateText}
                                          </div>
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 'bold' }}>✓</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>5. จำนวนสิทธิ์ทั้งหมด</label>
                      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', overflow: 'hidden' }}>
                        <button type="button" onClick={() => setNewCodeMaxUses(Math.max(1, newCodeMaxUses - 1))} style={{ backgroundColor: 'rgba(147,51,234,0.3)', color: '#a855f7', border: 'none', padding: '8px 14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>-</button>
                        <input type="text" readOnly value={newCodeMaxUses} style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#ffffff', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', outline: 'none' }} />
                        <button type="button" onClick={() => setNewCodeMaxUses(newCodeMaxUses + 1)} style={{ backgroundColor: 'rgba(147,51,234,0.3)', color: '#a855f7', border: 'none', padding: '8px 14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                        + สร้างโค้ดของขวัญใหม่ (กำหนดแรงค์ & บันทึกเรียลไทม์)
                      </button>
                    </div>
                  </form>

                  {/* รายการโค้ดของขวัญทั้งหมดที่สร้างไว้ พร้อมปุ่มลบโค้ด */}
                  <div style={{ marginTop: '28px', borderTop: '1px solid #374151', paddingTop: '22px' }}>
                    {adminCodeMsg.text && (
                      <div style={{ backgroundColor: adminCodeMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: adminCodeMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{adminCodeMsg.text}</span>
                        <button type="button" onClick={() => setAdminCodeMsg({ text: '', type: '' })} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📋 โค้ดของขวัญในระบบทั้งหมด</span>
                          <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 'normal' }}>({giftCodes.length} รายการ)</span>
                        </h4>
                        <span style={{ fontSize: '11px', backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid #34d399', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                          พร้อมใช้งาน: {giftCodes.filter(c => c.usedCount < c.maxUses).length} โค้ด
                        </span>
                        {giftCodes.filter(c => c.usedCount >= c.maxUses).length > 0 && (
                          <span style={{ fontSize: '11px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                            สิทธิ์เต็มแล้ว: {giftCodes.filter(c => c.usedCount >= c.maxUses).length} โค้ด
                          </span>
                        )}

                        {giftCodes.length > 0 && (
                          confirmClearAllGiftCodes ? (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginLeft: '6px' }}>
                              <button
                                type="button"
                                onClick={handleClearAllGiftCodes}
                                style={{
                                  backgroundColor: '#dc2626',
                                  border: '1px solid #ef4444',
                                  color: '#ffffff',
                                  padding: '5px 12px',
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)'
                                }}
                              >
                                ⚠️ ยืนยันล้างทั้งหมด (เหลือ 0)?
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmClearAllGiftCodes(false)}
                                style={{
                                  backgroundColor: '#374151',
                                  border: '1px solid #4b5563',
                                  color: '#d1d5db',
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer'
                                }}
                              >
                                ยกเลิก
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmClearAllGiftCodes(true)}
                              style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid #ef4444',
                                color: '#f87171',
                                padding: '5px 12px',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginLeft: '6px',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#ef4444';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                                e.currentTarget.style.color = '#f87171';
                              }}
                            >
                              🗑️ ลบโค้ดทั้งหมด (เคลียร์ให้เหลือ 0)
                            </button>
                          )
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="🔍 ค้นหาโค้ด / รางวัล..."
                          value={adminGiftCodeSearch}
                          onChange={(e) => setAdminGiftCodeSearch(e.target.value)}
                          style={{
                            backgroundColor: '#030712',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            padding: '7px 12px',
                            color: '#ffffff',
                            fontSize: '12px',
                            outline: 'none',
                            minWidth: '170px'
                          }}
                        />
                        <select
                          value={adminGiftCodeFilterGame}
                          onChange={(e) => setAdminGiftCodeFilterGame(e.target.value)}
                          style={{
                            backgroundColor: '#030712',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            padding: '7px 12px',
                            color: '#ffffff',
                            fontSize: '12px',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="all">🎮 ทุกเกม</option>
                          {gamesData.map(g => (
                            <option key={g.id} value={g.name}>{g.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {filteredGiftCodes.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '35px 20px', backgroundColor: '#030712', borderRadius: '14px', border: '1px dashed #374151', color: '#9ca3af', fontSize: '13px' }}>
                        {giftCodes.length === 0 ? 'ยังไม่มีการสร้างโค้ดของขวัญในระบบ สามารถสร้างโค้ดใหม่ได้จากแบบฟอร์มด้านบน' : 'ไม่พบโค้ดของขวัญที่ตรงกับคำค้นหาหรือตัวกรองที่เลือก'}
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '14px' }}>
                        {filteredGiftCodes.map((codeItem) => {
                          const isExhausted = (codeItem.usedCount || 0) >= (codeItem.maxUses || 1);
                          const remaining = Math.max(0, (codeItem.maxUses || 0) - (codeItem.usedCount || 0));
                          const percentUsed = Math.min(100, Math.round(((codeItem.usedCount || 0) / (codeItem.maxUses || 1)) * 100));
                          const isCopied = copiedCodeKey === (codeItem.firebaseKey || codeItem.code);

                          return (
                            <div
                              key={codeItem.firebaseKey || codeItem.code}
                              style={{
                                backgroundColor: '#030712',
                                border: `1.5px solid ${isExhausted ? '#ef4444' : '#374151'}`,
                                borderRadius: '14px',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxShadow: isExhausted ? '0 0 15px rgba(239, 68, 68, 0.15)' : 'none',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span style={{
                                      backgroundColor: 'rgba(147, 51, 234, 0.2)',
                                      border: '1px solid #9333ea',
                                      color: '#c084fc',
                                      padding: '4px 10px',
                                      borderRadius: '8px',
                                      fontWeight: 'bold',
                                      fontSize: '13px',
                                      fontFamily: 'monospace',
                                      letterSpacing: '0.5px'
                                    }}>
                                      {codeItem.code}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (navigator && navigator.clipboard) {
                                          navigator.clipboard.writeText(codeItem.code);
                                          setCopiedCodeKey(codeItem.firebaseKey || codeItem.code);
                                          setTimeout(() => setCopiedCodeKey(null), 2000);
                                        }
                                      }}
                                      title="คัดลอกโค้ด"
                                      style={{
                                        backgroundColor: isCopied ? '#10b981' : '#1f2937',
                                        color: isCopied ? '#ffffff' : '#9ca3af',
                                        border: '1px solid #374151',
                                        borderRadius: '6px',
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        transition: 'all 0.2s'
                                      }}
                                    >
                                      {isCopied ? '✓ คัดลอกแล้ว' : '📋 คัดลอก'}
                                    </button>
                                  </div>

                                  <span style={{
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: isExhausted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                                    color: isExhausted ? '#fca5a5' : '#34d399',
                                    border: `1px solid ${isExhausted ? '#ef4444' : '#34d399'}`
                                  }}>
                                    {isExhausted ? '🔴 สิทธิ์เต็ม' : '🟢 ใช้งานได้'}
                                  </span>
                                </div>

                                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff', marginBottom: '4px' }}>
                                  🎮 เกม: <span style={{ color: '#ffffff' }}>{codeItem.game}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#38bdf8', marginBottom: '8px' }}>
                                  🎁 รางวัล: <b>{codeItem.reward}</b>
                                </div>
                                {/* ป้ายระดับแรงค์ขั้นต่ำที่กำหนด */}
                                <div style={{ marginBottom: '10px' }}>
                                  {(() => {
                                    const rKey = codeItem.minRank || 'BRONZE';
                                    const rObj = RANK_TIERS.find(t => t.tier === rKey) || RANK_TIERS[RANK_TIERS.length - 1];
                                    return (
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        backgroundColor: rObj.bg,
                                        border: `1px solid ${rObj.border}`,
                                        color: rObj.color,
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        fontSize: '10px',
                                        fontWeight: '900'
                                      }}>
                                        <RankEmblem tier={rObj.tier} size={14} />
                                        <span>{rKey === 'BRONZE' ? 'สิทธิ์: ทุกระดับแรงค์' : `สิทธิ์: ${rObj.name} ขึ้นไป`}</span>
                                      </span>
                                    );
                                  })()}
                                </div>

                                {/* หลอดแสดงจำนวนสิทธิ์คงเหลือ */}
                                <div style={{ marginBottom: '12px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                                    <span>ใช้ไปแล้ว: <b style={{ color: '#ffffff' }}>{codeItem.usedCount || 0}</b> / {codeItem.maxUses} สิทธิ์</span>
                                    <span style={{ color: isExhausted ? '#ef4444' : '#34d399', fontWeight: 'bold' }}>
                                      {isExhausted ? 'หมดแล้ว' : `เหลือ ${remaining} สิทธิ์`}
                                    </span>
                                  </div>
                                  <div style={{ width: '100%', height: '6px', backgroundColor: '#1f2937', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                      width: `${percentUsed}%`,
                                      height: '100%',
                                      backgroundColor: isExhausted ? '#ef4444' : percentUsed > 80 ? '#f59e0b' : '#38bdf8',
                                      borderRadius: '3px',
                                      transition: 'width 0.3s ease'
                                    }} />
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #1f2937', marginTop: '4px' }}>
                                <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                  {codeItem.timestamp ? new Date(codeItem.timestamp).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                </span>
                                {confirmDeleteCodeKey === (codeItem.firebaseKey || codeItem.code) ? (
                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteGiftCode(codeItem)}
                                      style={{
                                        backgroundColor: '#dc2626',
                                        border: '1px solid #ef4444',
                                        color: '#ffffff',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                                        transition: 'all 0.15s ease'
                                      }}
                                    >
                                      ⚠️ ยืนยันลบ
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteCodeKey(null)}
                                      style={{
                                        backgroundColor: '#374151',
                                        border: '1px solid #4b5563',
                                        color: '#d1d5db',
                                        padding: '6px 10px',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      ยกเลิก
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteCodeKey(codeItem.firebaseKey || codeItem.code)}
                                    style={{
                                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                      border: '1px solid #ef4444',
                                      color: '#f87171',
                                      padding: '6px 14px',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      fontWeight: 'bold',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#ef4444';
                                      e.currentTarget.style.color = '#ffffff';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                                      e.currentTarget.style.color = '#f87171';
                                    }}
                                  >
                                    🗑️ ลบโค้ด
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
            {/* LINE OFFICIAL FLOATING CONTACT WIDGET (เอฟเฟกต์ลอยขยับได้นิดหน่อย สวยงาม ดูเป็นทางการ) */}
      <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 99 }}>
        <div
          onClick={() => setShowLineModal(true)}
          className="line-floating-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#06c755',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '30px',
            cursor: 'pointer',
            userSelect: 'none',
            border: '2px solid rgba(255, 255, 255, 0.45)',
            boxShadow: '0 8px 25px rgba(6, 199, 85, 0.5), 0 0 15px rgba(6, 199, 85, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          title="ติดต่อแอดมินผ่าน LINE Official 24 ชม."
        >
          {/* Official LINE Speech Bubble SVG */}
          <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M19.365 9.863c.349.001.685.034 1.01.096C20.842 5.093 16.31 1.25 10.75 1.25 4.675 1.25 0 5.438 0 10.75c0 4.744 3.733 8.654 8.795 9.388.384.084.908.257 1.04.589.12.302.079.774.039 1.079l-.167 1.006c-.052.31-.247 1.213 1.063.661 1.309-.551 7.054-4.156 9.626-7.114 1.637-1.884 2.535-4.156 2.535-6.495 0-.001 0-.001 0-.001zM7.228 13.064H5.321a.58.58 0 0 1-.58-.58V8.625a.58.58 0 0 1 .58-.58h1.907a.58.58 0 1 1 0 1.16H5.901v1.139h1.327a.58.58 0 1 1 0 1.16H5.901v1.139h1.327a.58.58 0 1 1 0 1.16zm3.329 0a.58.58 0 0 1-.58-.58V8.625a.58.58 0 1 1 1.16 0v3.859a.58.58 0 0 1-.58.58zm4.492 0a.58.58 0 0 1-.464-.233L12.5 9.998v2.486a.58.58 0 1 1-1.16 0V8.625a.58.58 0 0 1 .936-.457l2.193 2.943V8.625a.58.58 0 1 1 1.16 0v3.859a.58.58 0 0 1-.58.58zm3.805 0h-1.907a.58.58 0 0 1-.58-.58V8.625a.58.58 0 0 1 .58-.58h1.907a.58.58 0 1 1 0 1.16h-1.327v1.139h1.327a.58.58 0 1 1 0 1.16h-1.327v1.139h1.327a.58.58 0 1 1 0 1.16z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '900', lineHeight: '1.2', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>LINE Official</span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffffff', animation: 'cyberPulse 1.6s infinite' }} />
            </div>
            <div style={{ fontSize: '10px', opacity: 0.95, letterSpacing: '0.5px' }}>
              @catcointopup (พี่เหมียวดูแล 24 ชม. 🐱)
            </div>
          </div>
        </div>
      </div>

      {/* LINE OFFICIAL CONTACT MODAL */}
      {showLineModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '2px solid #06c755', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center', boxShadow: '0 0 45px rgba(6,199,85,0.4)', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowLineModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer', padding: '4px 8px' }}
            >
              ✕
            </button>

            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#06c755', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto', boxShadow: '0 0 20px rgba(6,199,85,0.6)' }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M19.365 9.863c.349.001.685.034 1.01.096C20.842 5.093 16.31 1.25 10.75 1.25 4.675 1.25 0 5.438 0 10.75c0 4.744 3.733 8.654 8.795 9.388.384.084.908.257 1.04.589.12.302.079.774.039 1.079l-.167 1.006c-.052.31-.247 1.213 1.063.661 1.309-.551 7.054-4.156 9.626-7.114 1.637-1.884 2.535-4.156 2.535-6.495 0-.001 0-.001 0-.001zM7.228 13.064H5.321a.58.58 0 0 1-.58-.58V8.625a.58.58 0 0 1 .58-.58h1.907a.58.58 0 1 1 0 1.16H5.901v1.139h1.327a.58.58 0 1 1 0 1.16H5.901v1.139h1.327a.58.58 0 1 1 0 1.16zm3.329 0a.58.58 0 0 1-.58-.58V8.625a.58.58 0 1 1 1.16 0v3.859a.58.58 0 0 1-.58.58zm4.492 0a.58.58 0 0 1-.464-.233L12.5 9.998v2.486a.58.58 0 1 1-1.16 0V8.625a.58.58 0 0 1 .936-.457l2.193 2.943V8.625a.58.58 0 1 1 1.16 0v3.859a.58.58 0 0 1-.58.58zm3.805 0h-1.907a.58.58 0 0 1-.58-.58V8.625a.58.58 0 0 1 .58-.58h1.907a.58.58 0 1 1 0 1.16h-1.327v1.139h1.327a.58.58 0 1 1 0 1.16h-1.327v1.139h1.327a.58.58 0 1 1 0 1.16z"/>
              </svg>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', margin: '0 0 4px 0' }}>
              LINE Official Account
            </h3>
            <p style={{ fontSize: '12px', color: '#34d399', margin: '0 0 18px 0', fontWeight: 'bold' }}>
              🟢 แอดมินและฝ่ายบริการลูกค้า พร้อมดูแลตลอด 24 ชม.
            </p>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', width: '170px', height: '170px', margin: '0 auto 18px auto', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://lin.ee/Nn1UeBC" 
                alt="LINE QR Code" 
                style={{ width: '150px', height: '150px', display: 'block' }} 
              />
            </div>

            <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>LINE ID ทางการ:</div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#06c755', letterSpacing: '0.5px' }}>@catcointopup</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (navigator && navigator.clipboard) {
                    navigator.clipboard.writeText('@catcointopup');
                    setCopiedLineId(true);
                    setTimeout(() => setCopiedLineId(false), 2000);
                  }
                }}
                style={{
                  backgroundColor: copiedLineId ? '#10b981' : '#1f2937',
                  border: '1px solid #374151',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {copiedLineId ? '✓ คัดลอกแล้ว' : '📋 คัดลอก ID'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowLineModal(false)}
                style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                ปิดหน้าต่าง
              </button>
              <a
                href="https://lin.ee/Nn1UeBC"
                target="_blank"
                rel="noreferrer"
                style={{ flex: 1.5, backgroundColor: '#06c755', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(6,199,85,0.4)' }}
              >
                <span>📲 แอด LINE ทันที</span>
              </a>
            </div>
          </div>
        </div>
      )}

      </main>

      {showCheckoutModal && selectedGame && selectedPackage && selectedPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1.5px solid #9333ea', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center', boxShadow: '0 0 30px rgba(147,51,234,0.4)' }}>
            {checkoutStep === 1 && (
              <form onSubmit={handleVerifyPasswordStep}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#c084fc' }}>🔐 ยืนยันรหัสผ่านบัญชี</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>กรุณากรอกรหัสผ่านบัญชีของคุณเพื่อยืนยันการทำรายการ</p>

                <div style={{ backgroundColor: '#030712', borderRadius: '12px', padding: '14px', marginBottom: '20px', textAlign: 'left', border: '1px solid #374151' }}>
                  <div style={{ fontSize: '13px', color: '#ffffff', marginBottom: '4px' }}>🎮 เกม: <b>{selectedGame.name}</b></div>
                  <div style={{ fontSize: '13px', color: '#38bdf8', marginBottom: '4px' }}>📦 แพ็กเกจ: <b>{selectedPackage.name} (x{packageQuantity} แพ็ก)</b></div>
                  <div style={{ fontSize: '13px', color: '#34d399', marginBottom: '4px' }}>💰 ยอดชำระ: <b>฿{(selectedPackage.price * packageQuantity).toLocaleString()}</b></div>
                  <div style={{ fontSize: '13px', color: '#c084fc', marginBottom: '4px' }}>💳 ช่องทาง: <b>{selectedPayment.name}</b></div>
                  <div style={{ fontSize: '13px', color: '#c084fc' }}>👤 ตัวละคร/UID: <b>{playerId}</b></div>
                </div>

                {checkoutPasswordError && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px', borderRadius: '8px', fontSize: '12px', marginBottom: '15px' }}>{checkoutPasswordError}</div>}

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <input type={showCheckoutPassword ? 'text' : 'password'} placeholder="กรอกรหัสผ่านบัญชีของคุณ..." value={checkoutPassword} onChange={(e) => setCheckoutPassword(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 42px 12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  <button type="button" onClick={() => setShowCheckoutPassword(!showCheckoutPassword)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer' }}><EyeIcon show={showCheckoutPassword} /></button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={resetCheckoutModal} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                  <button type="submit" style={{ flex: 1, backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>{selectedPayment.id === 'wallet' ? 'ยืนยันหักเครดิตร้าน' : 'ถัดไป →'}</button>
                </div>
              </form>
            )}

            {checkoutStep === 2 && (selectedPayment?.id === 'qrcode' || selectedPayment?.id === 'true') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: selectedPayment?.id === 'true' ? '#fb923c' : '#38bdf8' }}>
                    {selectedPayment?.id === 'true' ? '🧡 โอนเงินผ่าน TrueMoney Wallet' : '💳 โอนเงินผ่านบัญชีธนาคาร'}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold', backgroundColor: 'rgba(52,211,153,0.15)', padding: '3px 10px', borderRadius: '8px', border: '1px solid #34d399' }}>
                    ⚡ ตรวจสลิปอัตโนมัติ 24 ชม.
                  </span>
                </div>

                {selectedPayment?.id === 'true' ? (
                  /* การ์ดบัญชี TrueMoney Wallet */
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', marginBottom: '16px', border: '2px solid #f97316' }}>
                    <div style={{ backgroundColor: '#f97316', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ backgroundColor: '#ffffff', color: '#ea580c', fontWeight: '900', fontSize: '12px', padding: '3px 8px', borderRadius: '6px' }}>TrueMoney</span>
                        <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>TrueMoney Wallet</span>
                      </div>
                      <span style={{ color: '#ffffff', fontSize: '11px', opacity: 0.95 }}>ฟรีค่าธรรมเนียม 0%</span>
                    </div>

                    <div style={{ padding: '18px', textAlign: 'center', color: '#111827' }}>
                      <div style={{ fontSize: '12px', color: '#4b5563', marginBottom: '4px' }}>ชื่อบัญชีผู้รับเงิน</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ea580c', marginBottom: '14px' }}>นาย ธนภูมิ รักษี</div>

                      {/* กล่องเบอร์วอลเล็ตพร้อมปุ่มคัดลอก */}
                      <div style={{ backgroundColor: '#fff7ed', border: '1.5px dashed #f97316', borderRadius: '14px', padding: '12px', marginBottom: '14px' }}>
                        <div style={{ fontSize: '11px', color: '#9a3412', marginBottom: '4px', fontWeight: 'bold' }}>เบอร์ TrueMoney Wallet ร้านค้า</div>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#111827', letterSpacing: '2px', fontFamily: 'monospace', marginBottom: '8px' }}>
                          063-880-1739
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('0638801739');
                            alert('📋 คัดลอกเบอร์ TrueMoney 0638801739 เรียบร้อยแล้ว นำไปวางโอนในแอป TrueMoney ได้เลยครับ');
                          }}
                          style={{ width: '100%', backgroundColor: '#f97316', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}
                        >
                          <span>📋 กดเพื่อคัดลอกเบอร์ TrueMoney</span>
                        </button>
                      </div>

                      {/* ยอดเงินสุทธิ */}
                      <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#4b5563', fontWeight: 'bold' }}>ยอดเงินที่ต้องโอน:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#ea580c', fontSize: '22px', fontWeight: '900' }}>฿{(selectedPackage.price * packageQuantity).toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText((selectedPackage.price * packageQuantity).toString());
                              alert(`📋 คัดลอกยอดเงิน ${selectedPackage.price * packageQuantity} บาท เรียบร้อยแล้ว`);
                            }}
                            style={{ backgroundColor: '#e5e7eb', color: '#374151', border: 'none', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            คัดลอกยอด
                          </button>
                        </div>
                      </div>

                      {/* ขั้นตอนการโอน */}
                      <div style={{ textAlign: 'left', backgroundColor: '#fff7ed', borderRadius: '10px', padding: '10px 12px', border: '1px solid #fed7aa' }}>
                        <div style={{ fontSize: '11px', color: '#9a3412', fontWeight: 'bold', marginBottom: '4px' }}>💡 ขั้นตอนการโอนผ่าน TrueMoney Wallet:</div>
                        <div style={{ fontSize: '11px', color: '#7c2d12', lineHeight: '1.5' }}>
                          1. คัดลอกเบอร์ <b>063-880-1739</b> (นาย ธนภูมิ รักษี)<br/>
                          2. เปิดแอป TrueMoney เลือก <b>โอนเงิน</b> ยอด <b>฿{(selectedPackage.price * packageQuantity).toLocaleString()}</b><br/>
                          3. บันทึกรูปสลิป แล้วนำมาแนบด้านล่าง ระบบจะเติมเข้าเกมทันที
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* การ์ดบัญชีธนาคารไทยพาณิชย์ (SCB) & QR พร้อมเพย์ */
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', marginBottom: '16px', border: '2px solid #4e2a84' }}>
                    <div style={{ backgroundColor: '#4e2a84', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ backgroundColor: '#ffffff', color: '#4e2a84', fontWeight: '900', fontSize: '12px', padding: '3px 8px', borderRadius: '6px' }}>SCB</span>
                        <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>ไทยพาณิชย์ & พร้อมเพย์</span>
                      </div>
                      <span style={{ color: '#ffffff', fontSize: '11px', opacity: 0.95 }}>สแกน/โอนได้ทุกธนาคาร</span>
                    </div>

                    <div style={{ padding: '16px', textAlign: 'center', color: '#111827' }}>
                      <div style={{ fontSize: '12px', color: '#4b5563', marginBottom: '2px' }}>ชื่อบัญชีผู้รับเงิน</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4e2a84', marginBottom: '12px' }}>นาย ธนภูมิ รักษี</div>

                      {/* QR Code พร้อมเพย์ สแกนได้ทุกธนาคาร */}
                      <div style={{ backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '10px', marginBottom: '12px', display: 'inline-block' }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#0284c7', marginBottom: '6px' }}>📱 สแกน QR พร้อมเพย์ (ระบุยอดเงินอัตโนมัติ)</div>
                        <img
                          src={`https://promptpay.io/0956267172/${selectedPackage.price * packageQuantity}.png`}
                          alt="PromptPay QR Code"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(generatePromptPayQrPayload(selectedPackage.price * packageQuantity))}`;
                          }}
                          style={{ width: '165px', height: '165px', objectFit: 'contain', display: 'block', margin: '0 auto', borderRadius: '8px' }}
                        />
                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>พร้อมเพย์: <b>095-626-7172</b></div>
                      </div>

                      {/* กล่องเลขบัญชี SCB และ พร้อมเพย์ พร้อมปุ่มคัดลอก */}
                      <div style={{ backgroundColor: '#f5f3ff', border: '1.5px dashed #7c3aed', borderRadius: '14px', padding: '10px 12px', marginBottom: '10px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: '#5b21b6', fontWeight: 'bold' }}>เลขบัญชี ธ.ไทยพาณิชย์ (SCB)</div>
                            <div style={{ fontSize: '18px', fontWeight: '900', color: '#111827', letterSpacing: '1px', fontFamily: 'monospace' }}>558-265124-6</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('5582651246');
                              alert('📋 คัดลอกเลขบัญชี SCB 5582651246 เรียบร้อยแล้ว');
                            }}
                            style={{ backgroundColor: '#4e2a84', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
                          >
                            📋 คัดลอกเลขบัญชี
                          </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #ddd6fe', paddingTop: '8px' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: 'bold' }}>เบอร์พร้อมเพย์ (PromptPay)</div>
                            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284c7', letterSpacing: '1px', fontFamily: 'monospace' }}>095-626-7172</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('0956267172');
                              alert('📋 คัดลอกเบอร์พร้อมเพย์ 0956267172 เรียบร้อยแล้ว');
                            }}
                            style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
                          >
                            📋 คัดลอกพร้อมเพย์
                          </button>
                        </div>
                      </div>

                      {/* ยอดเงินสุทธิ */}
                      <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', color: '#4b5563', fontWeight: 'bold' }}>ยอดเงินที่ต้องโอน:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#4e2a84', fontSize: '22px', fontWeight: '900' }}>฿{(selectedPackage.price * packageQuantity).toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText((selectedPackage.price * packageQuantity).toString());
                              alert(`📋 คัดลอกยอดเงิน ${selectedPackage.price * packageQuantity} บาท เรียบร้อยแล้ว`);
                            }}
                            style={{ backgroundColor: '#e5e7eb', color: '#374151', border: 'none', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            คัดลอกยอด
                          </button>
                        </div>
                      </div>

                      {/* ขั้นตอนการโอน */}
                      <div style={{ textAlign: 'left', backgroundColor: '#eff6ff', borderRadius: '10px', padding: '10px 12px', border: '1px solid #bfdbfe' }}>
                        <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 'bold', marginBottom: '4px' }}>💡 ขั้นตอนการโอนและรับของ:</div>
                        <div style={{ fontSize: '11px', color: '#1e3a8a', lineHeight: '1.5' }}>
                          1. สแกน QR พร้อมเพย์ หรือโอนเข้า <b>SCB 558-265124-6</b> (หรือพร้อมเพย์ <b>095-626-7172</b>)<br/>
                          2. ตรวจสอบชื่อผู้รับ <b>นาย ธนภูมิ รักษี</b> ยอด <b>฿{(selectedPackage.price * packageQuantity).toLocaleString()}</b><br/>
                          3. บันทึกสลิป แล้วนำรูปมาแนบด้านล่าง ระบบจะเติมเข้าเกมทันที
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '14px', marginBottom: '16px', textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '4px' }}>📸 แนบสลิปโอนเงิน (ตรวจสอบสลิปและเติมเข้า UID)</div>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 10px 0' }}>แนบรูปสลิปแล้วระบบจะส่งไปตรวจสอบที่ /api/verify-slip และเติมแพ็กเกจเข้าไอดีเกมของคุณโดยตรงทันที</p>

                  {slipVerifyError && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', marginBottom: '12px', lineHeight: '1.4' }}>
                      {slipVerifyError}
                    </div>
                  )}

                  {slipVerifying ? (
                    <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '22px', marginBottom: '6px' }}>⚡</div>
                      <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{slipVerifyStepText}</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', border: '1.5px dashed #38bdf8', borderRadius: '10px', cursor: 'pointer', backgroundColor: 'rgba(56, 189, 248, 0.05)' }}>
                        <span style={{ fontSize: '14px' }}>📁</span>
                        <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>{slipFile ? slipFile.name : 'แตะเพื่อเลือกรูปสลิปโอนเงิน...'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const chosenFile = e.target.files[0];
                              setSlipFile(chosenFile);
                              setSlipPreview(URL.createObjectURL(chosenFile));
                              handleSimulateSlipScan(chosenFile);
                            }
                          }} 
                        />
                      </label>

                      {slipPreview && (
                        <div style={{ textAlign: 'center' }}>
                          <img src={slipPreview} alt="Slip Preview" style={{ maxHeight: '90px', borderRadius: '6px', border: '1px solid #374151' }} />
                        </div>
                      )}

                      <button 
                        type="button" 
                        onClick={handleSimulateSlipScan}
                        style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '11px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}
                      >
                        ⚡ ตรวจสอบสลิป & เติมเข้าไอดีเกมทันที
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setCheckoutStep(1)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: '1.5px solid #374151', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>← ย้อนกลับ</button>
                  <button onClick={handleFinalPaymentSubmit} style={{ flex: 1, backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>ข้ามไปส่งมอบ</button>
                </div>
              </div>
            )}

            {isProcessing && (
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔄</div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>กำลังดำเนินการสั่งซื้อ...</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {(showTopupWalletModal || trueMoneyOtpStep) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1.5px solid #9333ea', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center', boxShadow: '0 0 30px rgba(147,51,234,0.4)' }}>
            {trueMoneyOtpStep ? (
              <form onSubmit={handleTrueMoneyOtpSubmit}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#38bdf8' }}>🔐 กรอกรหัส OTP</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '15px' }}>ระบบได้ส่งรหัส OTP ไปยังเบอร์ <b style={{ color: '#ffffff' }}>{truemoneyPhone}</b> แล้ว</p>
                {trueMoneyOtpError && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px', borderRadius: '8px', fontSize: '12px', marginBottom: '15px' }}>{trueMoneyOtpError}</div>}
                <input type="text" inputMode="numeric" maxLength={6} placeholder="------" value={trueMoneyOtpCode} onChange={(e) => setTrueMoneyOtpCode(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '12px', padding: '14px', color: '#ffffff', fontSize: '24px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '8px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setTrueMoneyOtpStep(false)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>← ย้อนกลับ</button>
                  <button type="submit" style={{ flex: 1, backgroundColor: '#34d399', color: '#000000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยืนยัน OTP</button>
                </div>
              </form>
            ) : walletStep === 1 ? (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#c084fc' }}>💳 เติมเหรียญเข้า Cat Coin Wallet 🐱🪙</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '15px' }}>กรอกจำนวนเงินและเลือกช่องทางชำระเงิน</p>
                <input type="text" inputMode="numeric" placeholder="ระบุจำนวนเงิน (บาท)..." value={topupAmount} onChange={(e) => setTopupAmount(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', fontSize: '20px', textAlign: 'center', fontWeight: 'bold', outline: 'none', marginBottom: '15px', boxSizing: 'border-box' }} />
                <div style={{ textAlign: 'left', marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>เลือกช่องทางชำระเงิน</label>
                  <select value={walletPaymentMethod} onChange={(e) => setWalletPaymentMethod(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '13px', outline: 'none' }}>
                    <option value="qrcode">โอนเงินธนาคาร (SCB 558-265124-6 / พร้อมเพย์ 095-626-7172)</option>
                    <option value="true">TrueMoney Wallet (063-880-1739 ฟรี 0%)</option>
                    <option value="truemoneycard">บัตรเติมเงินทรูมันนี่ (14 หลัก)</option>
                  </select>
                </div>
                {walletPaymentMethod === 'true' && (
                  <div style={{ textAlign: 'left', marginBottom: '15px', backgroundColor: '#030712', padding: '12px', borderRadius: '10px', border: '1px solid #f97316' }}>
                    <div style={{ fontSize: '12px', color: '#fb923c', fontWeight: 'bold', marginBottom: '4px' }}>🧡 โอนเข้า TrueMoney Wallet ร้านค้า (ฟรี 0%)</div>
                    <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 'bold' }}>063-880-1739 (นาย ธนภูมิ รักษี)</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>กดปุ่มถัดไปเพื่อคัดลอกเบอร์และแนบสลิปโอนเงิน</div>
                  </div>
                )}
                {walletPaymentMethod === 'truemoneycard' && (
                  <div style={{ textAlign: 'left', marginBottom: '15px', backgroundColor: '#030712', padding: '10px', borderRadius: '10px', border: '1px solid #374151' }}>
                    <input type="text" placeholder="รหัสบัตรเติมเงิน 14 หลัก" value={truemoneyCard14} onChange={(e) => setTruemoneyCard14(e.target.value.replace(/[^0-9]/g, ''))} maxLength={14} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', letterSpacing: '2px' }} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={resetWalletModal} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                  <button 
                    disabled={!topupAmount || parseFloat(topupAmount) <= 0} 
                    onClick={(walletPaymentMethod === 'qrcode' || walletPaymentMethod === 'true') ? () => setWalletStep(2) : handleWalletConfirmPayment} 
                    style={{ flex: 1, backgroundColor: (!topupAmount || parseFloat(topupAmount) <= 0) ? '#374151' : '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {(walletPaymentMethod === 'qrcode' || walletPaymentMethod === 'true') ? 'ถัดไป (โอน & แนบสลิป) →' : 'ยืนยันการเติมเงิน'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 6px 0', color: walletPaymentMethod === 'true' ? '#fb923c' : '#38bdf8' }}>
                  {walletPaymentMethod === 'true' ? '🧡 โอน TrueMoney เติมเครดิต' : '💳 โอนเงินแลกรับเหรียญ Cat Coin 🐱🪙'}
                </h3>
                
                {walletPaymentMethod === 'true' ? (
                  /* การ์ดบัญชี TrueMoney Wallet */
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', overflow: 'hidden', marginBottom: '14px', border: '2px solid #f97316', textAlign: 'left', color: '#111827' }}>
                    <div style={{ backgroundColor: '#f97316', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '12px' }}>TrueMoney Wallet (ฟรี 0%)</span>
                      <span style={{ color: '#ffffff', fontSize: '11px', opacity: 0.95 }}>นาย ธนภูมิ รักษี</span>
                    </div>
                    <div style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '900', color: '#111827', fontFamily: 'monospace' }}>063-880-1739</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('0638801739');
                            alert('📋 คัดลอกเบอร์ TrueMoney 0638801739 เรียบร้อยแล้ว');
                          }}
                          style={{ backgroundColor: '#f97316', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          📋 คัดลอกเบอร์
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff7ed', padding: '6px 10px', borderRadius: '8px', border: '1px solid #fdba74' }}>
                        <span style={{ fontSize: '12px', color: '#9a3412', fontWeight: 'bold' }}>ยอดที่ต้องโอน:</span>
                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#ea580c' }}>฿{parseFloat(topupAmount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* การ์ดบัญชีธนาคารไทยพาณิชย์ (SCB) & พร้อมเพย์ */
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', overflow: 'hidden', marginBottom: '14px', border: '2px solid #4e2a84', textAlign: 'left', color: '#111827' }}>
                    <div style={{ backgroundColor: '#4e2a84', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '12px' }}>ไทยพาณิชย์ (SCB) & พร้อมเพย์</span>
                      <span style={{ color: '#ffffff', fontSize: '11px', opacity: 0.95 }}>นาย ธนภูมิ รักษี</span>
                    </div>
                    <div style={{ padding: '12px' }}>
                      <div style={{ textAlign: 'center', marginBottom: '10px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#0284c7', marginBottom: '4px' }}>📱 สแกน QR พร้อมเพย์ (095-626-7172)</div>
                        <img
                          src={`https://promptpay.io/0956267172/${parseFloat(topupAmount) || 0}.png`}
                          alt="PromptPay QR"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(generatePromptPayQrPayload(parseFloat(topupAmount) || 0))}`;
                          }}
                          style={{ width: '140px', height: '140px', objectFit: 'contain', display: 'block', margin: '0 auto', borderRadius: '6px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div>
                          <div style={{ fontSize: '10px', color: '#5b21b6', fontWeight: 'bold' }}>เลขบัญชี SCB</div>
                          <span style={{ fontSize: '15px', fontWeight: '900', color: '#111827', fontFamily: 'monospace' }}>558-265124-6</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('5582651246');
                            alert('📋 คัดลอกเลขบัญชี SCB 5582651246 เรียบร้อยแล้ว');
                          }}
                          style={{ backgroundColor: '#4e2a84', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          📋 คัดลอกเลขบัญชี
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingTop: '6px', borderTop: '1px solid #e5e7eb' }}>
                        <div>
                          <div style={{ fontSize: '10px', color: '#0369a1', fontWeight: 'bold' }}>เบอร์พร้อมเพย์</div>
                          <span style={{ fontSize: '15px', fontWeight: '900', color: '#0284c7', fontFamily: 'monospace' }}>095-626-7172</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('0956267172');
                            alert('📋 คัดลอกเบอร์พร้อมเพย์ 0956267172 เรียบร้อยแล้ว');
                          }}
                          style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          📋 คัดลอกพร้อมเพย์
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f3ff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #c4b5fd' }}>
                        <span style={{ fontSize: '12px', color: '#4e2a84', fontWeight: 'bold' }}>ยอดที่ต้องโอน:</span>
                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#4e2a84' }}>฿{parseFloat(topupAmount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* กล่องแนบสลิป SlipOK สำหรับเติมเครดิต */}
                <div style={{ backgroundColor: '#030712', border: '1.5px dashed #34d399', borderRadius: '14px', padding: '14px', marginBottom: '16px', textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 'bold', marginBottom: '4px' }}>📸 แนบสลิปโอนเงิน (ตรวจสลิปอัตโนมัติด้วย SlipOK)</div>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 10px 0' }}>แนบสลิปจริง ระบบจะเช็คยอดเงินเข้าบัญชีร้าน ถ้าถูกต้องจะเพิ่มเครดิตให้ทันที</p>

                  {walletSlipError && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px 10px', borderRadius: '8px', fontSize: '11px', marginBottom: '10px', lineHeight: '1.4' }}>
                      {walletSlipError}
                    </div>
                  )}

                  {walletSlipVerifying ? (
                    <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>🔄</div>
                      <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{walletSlipStepText}</div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        id="wallet-slip-input"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setWalletSlipFile(file);
                            const reader = new FileReader();
                            reader.onload = () => setWalletSlipPreview(reader.result);
                            reader.readAsDataURL(file);
                            setWalletSlipError('');
                          }
                        }}
                      />

                      {walletSlipPreview ? (
                        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                          <img src={walletSlipPreview} alt="Slip Preview" style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '8px', border: '1px solid #374151', display: 'inline-block' }} />
                          <div style={{ marginTop: '6px' }}>
                            <label htmlFor="wallet-slip-input" style={{ fontSize: '11px', color: '#38bdf8', textDecoration: 'underline', cursor: 'pointer' }}>
                              🔄 เปลี่ยนรูปสลิป
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="wallet-slip-input"
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            padding: '16px', border: '1.5px dashed #4b5563', borderRadius: '10px', cursor: 'pointer',
                            backgroundColor: '#111827', marginBottom: '10px'
                          }}
                        >
                          <span style={{ fontSize: '24px', marginBottom: '4px' }}>📁</span>
                          <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 'bold' }}>คลิกเพื่อเลือกไฟล์รูปภาพสลิป</span>
                          <span style={{ fontSize: '10px', color: '#9ca3af' }}>รองรับไฟล์ JPG, PNG</span>
                        </label>
                      )}

                      <button
                        type="button"
                        disabled={!walletSlipFile && !walletSlipPreview}
                        onClick={() => handleWalletSlipScan()}
                        style={{
                          width: '100%',
                          backgroundColor: (!walletSlipFile && !walletSlipPreview) ? '#374151' : '#34d399',
                          color: (!walletSlipFile && !walletSlipPreview) ? '#9ca3af' : '#000000',
                          border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '900', fontSize: '13px',
                          cursor: (!walletSlipFile && !walletSlipPreview) ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          boxShadow: (!walletSlipFile && !walletSlipPreview) ? 'none' : '0 4px 15px rgba(52,211,153,0.3)'
                        }}
                      >
                        <span>🔍 ตรวจสอบสลิปและเพิ่มเครดิตทันที (SlipOK)</span>
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { setWalletStep(1); setWalletSlipFile(null); setWalletSlipPreview(null); setWalletSlipError(''); }} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>← ย้อนกลับ</button>
                  <button onClick={resetWalletModal} style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>ยกเลิก</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {deliveredStockModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '2px solid #34d399', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '30px', textAlign: 'center', boxShadow: '0 0 40px rgba(52,211,153,0.45)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(52,211,153,0.2)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 15px auto' }}>
              ⚡
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0', color: '#34d399' }}>เติมเข้าไอดีเกมสำเร็จทันที! (AUTO 100%)</h3>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>ระบบยิงแพ็กเกจเข้าสู่บัญชีเกมของคุณโดยตรงเรียบร้อยแล้ว ไม่ต้องก๊อปโค้ดไปกรอกเอง!</p>
            
            <div style={{ backgroundColor: '#030712', border: '1.5px dashed #34d399', borderRadius: '16px', padding: '18px', marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>🎮 เกม: <b style={{ color: '#ffffff' }}>{deliveredStockModal.game}</b></div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>👤 ไอดี / UID ที่รับพอยต์: <b style={{ color: '#34d399', fontSize: '14px' }}>{deliveredStockModal.gameChar || playerId}</b></div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>📦 แพ็กเกจที่เติมเข้าเกม: <b style={{ color: '#38bdf8' }}>{deliveredStockModal.package}</b></div>
              {deliveredStockModal.bonus && (
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px' }}>✨ โบนัสที่ได้รับเพิ่ม: <b style={{ color: '#c084fc' }}>{deliveredStockModal.bonus}</b></div>
              )}
              <div style={{ backgroundColor: '#111827', border: '1.5px solid #34d399', borderRadius: '10px', padding: '12px', color: '#34d399', fontSize: '14px', fontWeight: '900', textAlign: 'center' }}>
                ✅ โอนพอยต์เข้าบัญชีเกมโดยตรงสำเร็จ 100%
                <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'normal', marginTop: '4px' }}>
                  เลขอ้างอิง API: {deliveredStockModal.apiRef || deliveredStockModal.orderId}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                💡 เข้าเกมเช็คยอดพอยต์/เพชร/คูปองได้ทันที ไม่ต้องใส่โค้ดใดๆ ทั้งสิ้น!
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {deliveredStockModal.code ? (
                <button 
                  type="button" 
                  onClick={() => {
                    navigator.clipboard.writeText(deliveredStockModal.code);
                  }} 
                  style={{ flex: 1.2, backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}
                >
                  📋 คัดลอกรหัสทันที
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={() => {
                    setDeliveredStockModal(null);
                    setSelectedGame(null);
                    setActiveTab('track');
                  }} 
                  style={{ flex: 1.2, backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}
                >
                  📋 ดูสถานะการเติมเงิน
                </button>
              )}
              <button 
                type="button" 
                onClick={() => setDeliveredStockModal(null)} 
                style={{ flex: 0.8, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', marginTop: '50px', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#9ca3af', fontSize: '13px' }}>
        <p style={{ margin: 0 }}>🐱 <b>MEOW TOPUP</b> - บริการเติมเกมออนไลน์ สดใส รวดเร็ว เติมง่ายด้วย Cat Coin ตลอด 24 ชั่วโมง 🐾</p>
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
          {!user && (
            <button 
              type="button" 
              onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              ⚙️ เข้าสู่ระบบแอดมินหลังบ้าน
            </button>
          )}
        </div>
</footer>
    </div>
  );
}
