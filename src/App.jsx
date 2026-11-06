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
  button, 
  [role="button"], 
  input[type="submit"], 
  input[type="button"],
  .cyber-btn {
    position: relative;
    cursor: pointer !important;
    transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    outline: none !important;
  }

  button:hover:not(:disabled),
  [role="button"]:hover,
  input[type="submit"]:hover,
  input[type="button"]:hover,
  .cyber-btn:hover {
    transform: translateY(-2.5px) scale(1.025) !important;
    filter: brightness(1.18) contrast(1.05) !important;
    box-shadow: 0 8px 25px rgba(168, 85, 247, 0.45), 0 0 15px rgba(56, 189, 248, 0.35) !important;
  }

  button:active:not(:disabled),
  [role="button"]:active,
  input[type="submit"]:active,
  input[type="button"]:active,
  .cyber-btn:active {
    transform: translateY(1px) scale(0.97) !important;
    filter: brightness(0.95) !important;
    box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3) !important;
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  ::-webkit-scrollbar-track {
    background: #090d16;
    border-radius: 8px;
    border: 1px solid #1f2937;
  }
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #9333ea, #38bdf8);
    border-radius: 8px;
    border: 2px solid #090d16;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #c084fc, #0284c7);
  }

  ::-webkit-scrollbar-button:single-button:vertical:decrement {
    height: 16px;
    width: 10px;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #111827;
    border: 1px solid #38bdf8;
    border-radius: 4px;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='18 15 12 9 6 15'%3e%3c/polyline%3e%3c/svg%3e");
    cursor: pointer;
  }
  ::-webkit-scrollbar-button:single-button:vertical:increment {
    height: 16px;
    width: 10px;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #111827;
    border: 1px solid #38bdf8;
    border-radius: 4px;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    cursor: pointer;
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
    background-position: right 12px center !important;
    background-size: 14px !important;
    padding-right: 36px !important;
    cursor: pointer;
  }
  .cyber-select-pink {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f472b6' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  }
  .cyber-select-cyan {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  }
  .cyber-select-purple {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23c084fc' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  }

  .cyber-textarea {
    scrollbar-color: #38bdf8 #090d16;
    scrollbar-width: thin;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .cyber-textarea:focus {
    border-color: #38bdf8 !important;
    box-shadow: 0 0 15px rgba(56, 189, 248, 0.35) !important;
  }

  /* Game Card & Cover Image Effects (เอฟเฟกต์ปกเกมสวยงาม ดูเป็นทางการ) */
  .cyber-game-card {
    position: relative;
    background: rgba(17, 24, 39, 0.88);
    border: 1.5px solid rgba(168, 85, 247, 0.35);
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }

  .cyber-game-card:hover {
    transform: translateY(-8px) scale(1.025) !important;
    border-color: #38bdf8 !important;
    box-shadow: 0 18px 45px rgba(168, 85, 247, 0.5), 0 0 30px rgba(56, 189, 248, 0.45) !important;
  }

  .cyber-game-cover-wrap {
    height: 165px;
    overflow: hidden;
    position: relative;
    background-color: #030712;
  }

  .cyber-game-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), filter 0.4s ease !important;
    filter: brightness(0.96) contrast(1.03);
  }

  .cyber-game-card:hover .cyber-game-cover-img {
    transform: scale(1.09) !important;
    filter: brightness(1.12) contrast(1.08) !important;
  }

  /* Cyber Shimmer Light Sweep Effect on Game Covers */
  .cyber-game-cover-wrap::after {
    content: '';
    position: absolute;
    top: 0;
    left: -120%;
    width: 80%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
    transform: skewX(-25deg);
    transition: left 0.7s ease;
    pointer-events: none;
  }

  .cyber-game-card:hover .cyber-game-cover-wrap::after {
    left: 150%;
  }

  /* Badge Animation */
  .cyber-badge-pulse {
    animation: cyberBadgeFloat 2.8s ease-in-out infinite;
  }

  @keyframes cyberBadgeFloat {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-3px);
    }
  }

  /* LINE Floating Button Animations (เอฟเฟกต์ไลน์ลอยขยับได้นิดหน่อย สวยงามเป็นทางการ) */
  .line-floating-btn {
    animation: lineFloat 3.2s ease-in-out infinite, lineGlow 3.2s ease-in-out infinite;
  }

  @keyframes lineFloat {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-7px) rotate(1deg);
    }
  }

  @keyframes lineGlow {
    0%, 100% {
      box-shadow: 0 8px 25px rgba(6, 199, 85, 0.45), 0 0 15px rgba(6, 199, 85, 0.3);
    }
    50% {
      box-shadow: 0 14px 35px rgba(6, 199, 85, 0.75), 0 0 25px rgba(56, 189, 248, 0.45);
    }
  }

  @keyframes cyberPulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.4;
      transform: scale(1.3);
    }
  }

  /* Rank Glow & Aura Animations for Decorated Ranks (เอฟเฟกต์แสงเรืองรองทุกระดับแรงค์) */
  .rank-glow-challenger {
    animation: glowChallenger 2.4s ease-in-out infinite;
  }
  @keyframes glowChallenger {
    0%, 100% {
      box-shadow: 0 0 15px rgba(255, 0, 85, 0.75), 0 0 30px rgba(245, 158, 11, 0.45);
      border-color: #ff0055 !important;
    }
    50% {
      box-shadow: 0 0 25px rgba(255, 0, 85, 1), 0 0 45px rgba(245, 158, 11, 0.8);
      border-color: #fbbf24 !important;
    }
  }

  .rank-glow-master {
    animation: glowMaster 2.6s ease-in-out infinite;
  }
  @keyframes glowMaster {
    0%, 100% {
      box-shadow: 0 0 12px rgba(236, 72, 153, 0.65);
      border-color: #ec4899 !important;
    }
    50% {
      box-shadow: 0 0 22px rgba(236, 72, 153, 0.95), 0 0 35px rgba(168, 85, 247, 0.5);
      border-color: #f472b6 !important;
    }
  }

  .rank-glow-diamond {
    animation: glowDiamond 2.8s ease-in-out infinite;
  }
  @keyframes glowDiamond {
    0%, 100% {
      box-shadow: 0 0 12px rgba(168, 85, 247, 0.6);
      border-color: #a855f7 !important;
    }
    50% {
      box-shadow: 0 0 22px rgba(192, 132, 252, 0.9), 0 0 35px rgba(56, 189, 248, 0.5);
      border-color: #c084fc !important;
    }
  }

  .rank-glow-platinum {
    animation: glowPlatinum 3s ease-in-out infinite;
  }
  @keyframes glowPlatinum {
    0%, 100% {
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.55);
      border-color: #0284c7 !important;
    }
    50% {
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.9);
      border-color: #38bdf8 !important;
    }
  }

  .rank-glow-gold {
    animation: glowGold 3.2s ease-in-out infinite;
  }
  @keyframes glowGold {
    0%, 100% {
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
      border-color: #f59e0b !important;
    }
    50% {
      box-shadow: 0 0 18px rgba(251, 191, 36, 0.85);
      border-color: #fbbf24 !important;
    }
  }

  .rank-tier-card {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }
  .rank-tier-card:hover {
    transform: translateY(-3px) scale(1.015) !important;
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

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cyber_current_logged_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [registeredUsers, setRegisteredUsers] = useState([]);
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
      id: 'hsr',
      name: 'Honkai: Star Rail',
      publisher: 'HoYoverse',
      category: 'pc',
      image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดฮิต Turn-Based 🚂',
      packages: [
        { id: 'h_pass', name: 'บัตรผ่านรถไฟ 30 วัน (Express Pass)', price: 199, originalPrice: 219, cost: 179, profit: 20, bonus: '🔥 ขายดีสุด ประหยัด ฿20' },
        { id: 'h1', name: '60 Oneiric Shards', price: 42, originalPrice: 45, cost: 35, profit: 7, bonus: '⚡ เติมตรง ประหยัด ฿3' },
        { id: 'h2', name: '300 (+30) Oneiric Shards', price: 199, originalPrice: 219, cost: 179, profit: 20, bonus: '⚡ ยอดฮิต ประหยัด ฿20' },
        { id: 'h3', name: '980 (+110) Oneiric Shards', price: 599, originalPrice: 650, cost: 549, profit: 50, bonus: '⭐ พรีเมียม ประหยัด ฿51' },
        { id: 'h4', name: '1,980 (+260) Oneiric Shards', price: 1190, originalPrice: 1290, cost: 1100, profit: 90, bonus: '💥 สุดคุ้ม ประหยัด ฿100' },
        { id: 'h5', name: '3,280 (+600) Oneiric Shards', price: 1950, originalPrice: 2100, cost: 1800, profit: 150, bonus: '🔥 บิ๊กแพ็ก ประหยัด ฿150' },
        { id: 'h6', name: '6,480 (+1,600) Shards (Whale)', price: 3990, originalPrice: 4300, cost: 3700, profit: 290, bonus: '👑 Whale Pack ประหยัด ฿310 VIP' }
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
      id: 'avatarstar',
      name: 'Avatar Star',
      publisher: 'AS Global',
      category: 'pc',
      image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=500&q=80',
      badge: 'ยิงปืนสุดมันส์ ⚡',
      packages: [
        { id: 'as1', name: '300 Diamonds', price: 45, originalPrice: 50, cost: 35, profit: 10, bonus: '⚡ เติมตรง ประหยัด ฿5' },
        { id: 'as2', name: '1,000 Diamonds', price: 120, originalPrice: 135, cost: 100, profit: 20, bonus: '🔥 ขายดี ประหยัด ฿15' },
        { id: 'as3', name: '2,100 Diamonds', price: 235, originalPrice: 260, cost: 200, profit: 35, bonus: '⚡ ยอดฮิต ประหยัด ฿25' },
        { id: 'as4', name: '3,600 Diamonds', price: 399, originalPrice: 440, cost: 350, profit: 49, bonus: '⭐ สุดคุ้ม ประหยัด ฿41' },
        { id: 'as5', name: '7,500 Diamonds', price: 790, originalPrice: 870, cost: 700, profit: 90, bonus: '💥 โบนัสจุใจ ประหยัด ฿80' },
        { id: 'as6', name: '16,000 Diamonds (Super VIP)', price: 1680, originalPrice: 1850, cost: 1500, profit: 180, bonus: '👑 Super VIP ประหยัด ฿170 VIP' }
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
    hsr: {
      name: 'Honkai: Star Rail',
      provider: 'LnwTrue (เทพทรู Official)',
      url: 'https://www.lnwtrue.com/th/hsr',
      note: 'ใส่ UID และเลือกเซิร์ฟเวอร์ (เช่น Asia) เติม Oneiric Shard / บัตรผ่านรถไฟ'
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
    avatarstar: {
      name: 'Avatar Star',
      provider: 'AS Global Top-up Portal (ทางการ)',
      url: 'https://asglobal.com/',
      note: 'เข้าเว็บทางการ ล็อกอินไอดีหรือใส่ UID เพื่อเติม Diamonds (เกมนี้เติมตรงผ่าน AS Global)'
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
    { id: 'wallet', name: 'Cyber Wallet (เครดิตร้าน)', desc: 'หักจากยอดเงินในบัญชีทันที' },
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
    if (selectedPayment.id === 'wallet' && user.balance < totalPrice) {
      return;
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
    if (!isUserAdmin) {
      matchUser = user && (o.player.toLowerCase() === user.username.toLowerCase());
    } else {
      const q = exactSearchQuery.trim().toLowerCase();
      matchUser = !q || (o.player.toLowerCase() === q) || (o.id.toLowerCase() === q);
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

  if (!user) {
    return (
      <div style={{
        backgroundColor: '#070a12',
        backgroundImage: `linear-gradient(to bottom, rgba(7, 10, 18, 0.85), rgba(7, 10, 18, 0.95)), url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <style>{cyberGlobalStyles}</style>
        <div style={{
          backgroundColor: 'rgba(17, 24, 39, 0.95)', backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(168, 85, 247, 0.5)', borderRadius: '24px',
          padding: '40px 30px', maxWidth: '420px', width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 35px rgba(147,51,234,0.4)', textAlign: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ 
              position: 'relative', width: '65px', height: '65px', borderRadius: '18px', 
              background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #1d4ed8 100%)', 
              border: '2px solid #c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              boxShadow: '0 0 30px rgba(168,85,247,0.9), 0 0 15px rgba(56,189,248,0.7)', 
              marginBottom: '12px'
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#38bdf8" stroke="#ffffff" strokeWidth="1"></polygon>
              </svg>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', letterSpacing: '3px', textShadow: '0 0 15px rgba(168,85,247,0.8)' }}>CYBER TOPUP</div>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#38bdf8', letterSpacing: '2px', marginTop: '2px' }}>FAST & SECURE GAMING</div>
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
    );
  }
  return (
    <div style={{
      backgroundColor: '#070a12',
      backgroundImage: `linear-gradient(to bottom, rgba(7, 10, 18, 0.85), rgba(7, 10, 18, 0.95)), url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80')`,
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
      color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '60px', position: 'relative'
    }}>
      <style>{cyberGlobalStyles}</style>
      
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

      <header style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(147, 51, 234, 0.3)', padding: '12px 30px', position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => { setActiveTab('shop'); setSelectedGame(null); }}>
          <div style={{ 
            width: '45px', height: '45px', borderRadius: '14px', 
            background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #1d4ed8 100%)', 
            border: '2px solid #c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            boxShadow: '0 0 25px rgba(168,85,247,0.9), 0 0 10px rgba(56,189,248,0.7)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#38bdf8" stroke="#ffffff" strokeWidth="1"></polygon>
            </svg>
          </div>

          <div>
            <div style={{ fontSize: '19px', fontWeight: '900', color: '#ffffff', lineHeight: '1', textShadow: '0 0 12px rgba(168,85,247,0.8), 0 0 5px rgba(56,189,248,0.5)' }}>CYBER TOPUP</div>
            <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#38bdf8', letterSpacing: '1.5px' }}>FAST & SECURE GAMING</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: '#030712', border: '1px solid #9333ea', borderRadius: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', position: 'relative' }}>
            <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
              {/* RANK BADGE WITH '!' ICON & HOVER TOOLTIP */}
              <div 
                style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginRight: '8px' }}
                onMouseEnter={() => setRankTooltipOpen(true)}
                onMouseLeave={() => setRankTooltipOpen(false)}
              >
                <div
                  onClick={() => setRankTooltipOpen(prev => !prev)}
                  className={currentUserRank.animationClass || ''}
                  style={{
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
                    boxShadow: currentUserRank.glow,
                    cursor: 'pointer',
                    userSelect: 'none',
                    letterSpacing: '0.5px',
                    transition: 'all 0.25s ease'
                  }}
                  title="คลิกหรือชี้เมาส์เพื่อดูเรทเติมของแต่ละแรงค์"
                >
                  <RankEmblem tier={currentUserRank.tier} size={18} />
                  <span style={{ textShadow: `0 0 8px ${currentUserRank.border}`, letterSpacing: '0.5px' }}>{currentUserRank.shortName}</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      backgroundColor: currentUserRank.border,
                      color: '#030712',
                      fontSize: '10px',
                      fontWeight: '900',
                      marginLeft: '3px',
                      boxShadow: '0 0 8px rgba(255,255,255,0.7)',
                      animation: 'cyberPulse 2s infinite'
                    }}
                  >
                    !
                  </span>
                </div>

                {/* THE TOOLTIP (ออกแบบใหม่ให้ชัดเจน ตัวหนังสือเด่น อ่านง่าย สบายตา ไม่ทับซ้อน) */}
                {rankTooltipOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 14px)',
                      left: '0',
                      zIndex: 9999,
                      width: '450px',
                      maxWidth: '94vw',
                      backgroundColor: '#0c111e',
                      border: '2px solid #a855f7',
                      borderRadius: '20px',
                      padding: '20px',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.95), 0 0 35px rgba(168, 85, 247, 0.4)',
                      backdropFilter: 'blur(25px)',
                      color: '#ffffff',
                      animation: 'fadeIn 0.2s ease-in-out'
                    }}
                  >
                    {/* TOOLTIP HEADER */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #9333ea, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                          🏆
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '900', color: '#ffffff', letterSpacing: '0.3px' }}>
                            ระดับแรงค์ลูกค้า VIP & เรทเติมสะสม
                          </div>
                          <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '2px' }}>
                            คำนวณจากยอดเติมแพ็กเกจเกมสะสมจริงทั้งหมด
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setRankTooltipOpen(false); }}
                        style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* CURRENT USER STATUS BOX (กล่องสรุปสถานะปัจจุบัน ชัดเจน ตัวหนังสือใหญ่ สบายตา) */}
                    <div style={{ backgroundColor: '#141c2e', border: `2px solid ${currentUserRank.border}`, borderRadius: '14px', padding: '14px 16px', marginBottom: '16px', boxShadow: `0 4px 20px ${currentUserRank.border}30` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <RankEmblem tier={currentUserRank.tier} size={42} />
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: '900', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{currentUserRank.name}</span>
                              <span style={{ fontSize: '10px', backgroundColor: currentUserRank.border, color: '#030712', padding: '2px 6px', borderRadius: '4px', fontWeight: '900' }}>
                                TIER {currentUserRank.level}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: currentUserRank.color, fontWeight: 'bold', marginTop: '2px' }}>
                              ฉายา: {currentUserRank.title}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>ยอดเติมสะสมของคุณ</div>
                          <div style={{ fontSize: '19px', fontWeight: '900', color: '#34d399', letterSpacing: '0.5px' }}>
                            ฿{currentUserSpending.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar To Next Tier */}
                      {currentUserRank.nextTier ? (
                        <div style={{ backgroundColor: '#090d16', borderRadius: '10px', padding: '8px 12px', border: '1px solid #1e293b' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                            <span style={{ color: '#cbd5e1' }}>
                              เป้าหมายถัดไป: <b style={{ color: '#38bdf8' }}>{currentUserRank.nextTier}</b>
                            </span>
                            <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                              ขาดอีก ฿{currentUserRank.remainingToNext.toLocaleString()}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${currentUserRank.progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #a855f7)', transition: 'width 0.4s ease' }} />
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#090d16', padding: '6px 10px', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                          🏆 ยินดีด้วย! ท่านคือสมาชิกระดับสูงสุด (Challenger VIP) ของร้าน
                        </div>
                      )}
                    </div>

                    {/* ALL TIERS RATE TABLE (รายการเรทเติมทุกแรงค์ ชัดเจน 100% ไม่ทับซ้อน) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8' }}>
                        📋 เกณฑ์เรทเติมและสิทธิ์โค้ดทั้ง 7 ระดับ:
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>เลื่อนดูได้ 7 แรงค์</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', maxHeight: '310px', overflowY: 'auto', paddingRight: '6px' }}>
                      {RANK_TIERS.map(tier => {
                        const isCurrent = currentUserRank.tier === tier.tier;
                        return (
                          <div
                            key={tier.tier}
                            style={{
                              backgroundColor: isCurrent ? '#192238' : '#101726',
                              border: isCurrent ? `2px solid ${tier.border}` : '1px solid #1e293b',
                              borderLeft: `5px solid ${tier.border}`,
                              borderRadius: '12px',
                              padding: '12px 14px',
                              boxShadow: isCurrent ? `0 0 16px ${tier.border}45` : '0 3px 10px rgba(0,0,0,0.4)',
                              position: 'relative'
                            }}
                          >
                            {/* ROW 1: Emblem + Rank Name + Price Pill */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <RankEmblem tier={tier.tier} size={30} />
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ color: tier.color }}>{tier.badge}</span>
                                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'normal' }}>
                                      ({tier.title})
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Price Rate Pill (ชัดเจน ตัวหนาใหญ่ ไม่ทับข้อความ) */}
                              <div style={{
                                backgroundColor: '#070b14',
                                border: `1.5px solid ${tier.border}`,
                                color: '#ffffff',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '900',
                                whiteSpace: 'nowrap',
                                boxShadow: `0 0 8px ${tier.border}30`
                              }}>
                                {tier.rateText}
                              </div>
                            </div>

                            {/* ROW 2: Perk Description */}
                            <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4', paddingLeft: '40px' }}>
                              <span style={{ color: tier.color, fontWeight: 'bold' }}>🎁 สิทธิ์โค้ด: </span>
                              <span>{tier.rewardSummary}</span>
                            </div>

                            {/* ROW 3: Active Tag if this is current tier */}
                            {isCurrent && (
                              <div style={{ marginTop: '6px', marginLeft: '40px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: '900',
                                  backgroundColor: tier.border,
                                  color: '#070b14',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: `0 0 8px ${tier.border}`
                                }}>
                                  ⭐ แรงค์ปัจจุบันของคุณ (ACTIVE)
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px', textAlign: 'center', borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
                      🎁 ในอนาคตระบบจะใช้ระดับแรงค์นี้เพื่อแจกโค้ดของขวัญตามแรงค์ลูกค้า
                    </div>
                  </div>
                )}
              </div>

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
            <div style={{ borderLeft: '1px solid #374151', paddingLeft: '12px', fontSize: '12px' }}><span style={{ color: '#9ca3af' }}>💰 เครดิตร้าน: </span><b style={{ color: '#34d399' }}>฿{(user.balance || 0).toLocaleString()}</b></div>
            
            <button 
              onClick={() => { setShowTopupWalletModal(true); setWalletStep(1); }} 
              style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px rgba(147,51,234,0.5)' }}
            >
              + เติมเครดิต
            </button>
          </div>

          <nav style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setActiveTab('shop'); setSelectedGame(null); }} style={{ backgroundColor: activeTab === 'shop' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>✨ หน้าแรก</button>
            <button onClick={() => setActiveTab('track')} style={{ backgroundColor: activeTab === 'track' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>📋 เช็คสถานะ</button>
            {isUserAdmin && (
              <button onClick={() => setActiveTab('admin')} style={{ backgroundColor: activeTab === 'admin' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>⚙️ หลังบ้าน</button>
            )}
            <button onClick={handleLogout} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px 12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>🚪 ออกจากระบบ</button>
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
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)', 
              border: '2px solid rgba(168, 85, 247, 0.8)', 
              borderRadius: '24px', 
              padding: '40px', 
              marginBottom: '35px', 
              boxShadow: '0 0 50px rgba(168, 85, 247, 0.4), inset 0 0 30px rgba(56, 189, 248, 0.2)',
              position: 'hidden'
            }}>
              <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.3)', color: '#c084fc', border: '1px solid #c084fc', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                ⚡ ระบบเติมเกมอัตโนมัติออนไลน์ 24 ชั่วโมง
              </span>
              <h1 style={{ fontSize: '38px', fontWeight: '900', margin: '16px 0 10px 0', textShadow: '0 0 25px rgba(168,85,247,0.8)' }}>
                เติมเกมสะดวกรวดเร็ว <br/><span style={{ color: '#38bdf8' }}>ราคาถูกที่สุด คุ้มค่าที่สุด</span>
              </h1>
              <p style={{ fontSize: '14px', color: '#d1d5db', margin: '0 0 25px 0', maxWidth: '650px' }}>
                เลือกเกมโปรดของคุณ เติมไวภายใน 1 นาที รองรับทั้ง VALORANT, PUBG, ROV, Avatar Star, Genshin Impact และเกมดังอื่นๆ อีกมากมาย
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '450px' }}>
                  <input type="text" placeholder="🔍 ค้นหาชื่อเกม..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(3, 7, 18, 0.9)', border: '1.5px solid #a855f7', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(3, 7, 18, 0.9)', padding: '5px', borderRadius: '14px', border: '1.5px solid rgba(168, 85, 247, 0.5)' }}>
                  {[
                    { id: 'all', label: '🎮 ทั้งหมด' },
                    { id: 'pc', label: '🖥️ PC' },
                    { id: 'mobile', label: '📱 Mobile' },
                    { id: 'card', label: '💳 บัตรเติมเงิน (e-Pin)' }
                  ].map((cat) => (
                    <button 
                      key={cat.id}
                      onClick={() => setGameCategory(cat.id)} 
                      style={{ 
                        backgroundColor: gameCategory === cat.id ? '#9333ea' : 'transparent', 
                        color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '10px', 
                        fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' 
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
                🔥 เลือกเกมที่ต้องการเติมเงิน ({filteredGames.length} เกม)
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

                    <div style={{ padding: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 'bold', margin: 0, color: '#ffffff' }}>{game.name}</h3>
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
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 14px 0', display: 'flex', justifyContent: 'space-between' }}>
                        <span>ค่ายเกม: {game.publisher}</span>
                        <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>เริ่มต้น ฿{minPrice.toLocaleString()}</span>
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
                        <button style={{ width: '100%', background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)', border: '1px solid #c084fc', color: '#ffffff', padding: '11px', borderRadius: '12px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(147,51,234,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <span>คลิกเพื่อเติมเงิน</span>
                          <span style={{ fontSize: '15px' }}>→</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1.5px solid rgba(56, 189, 248, 0.6)', borderRadius: '20px', padding: '25px 30px', marginBottom: '35px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>📊 รายการเกมที่รองรับโค้ดของขวัญ</h3>
                <span style={{ fontSize: '11px', color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold' }}>
                  🎁 ระบบกรอกโค้ดรับรางวัล
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '14px' }}>
                {gamesData.map((g) => {
                  const codesForGame = giftCodes.filter(c => c.game === g.name && c.usedCount < c.maxUses);
                  const totalRemainingForGame = codesForGame.reduce((sum, c) => sum + Math.max(0, c.maxUses - c.usedCount), 0);
                  const isGameSelected = eventGame === g.name;
                  return (
                    <div
                      key={g.id}
                      onClick={() => setEventGame(g.name)}
                      style={{ backgroundColor: isGameSelected ? 'rgba(56, 189, 248, 0.15)' : '#030712', border: isGameSelected ? '1.5px solid #38bdf8' : '1px solid #374151', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '52px', boxSizing: 'border-box', cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff', marginRight: '10px', lineHeight: '1.3', flex: 1 }}>{g.name}</span>
                      <span style={{ backgroundColor: totalRemainingForGame > 0 ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)', color: totalRemainingForGame > 0 ? '#34d399' : '#fca5a5', border: `1px solid ${totalRemainingForGame > 0 ? '#34d399' : '#ef4444'}`, padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0, textAlign: 'center' }}>
                        {totalRemainingForGame > 0 ? `มีโค้ดแจก (${totalRemainingForGame} สิทธิ์)` : 'หมดแล้ว'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1.5px solid rgba(56, 189, 248, 0.6)', borderRadius: '20px', padding: '25px 30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>🎁 กรอกโค้ดของขวัญแลกรับรางวัล (Redeem Gift Code)</h3>
                <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 'bold' }}>✨ กรอก UID และรหัสโค้ดเพื่อรับรางวัลเข้าเกม</span>
              </div>

              {/* ป้ายแสดงระดับแรงค์ของลูกค้าปัจจุบัน พร้อมระบุยอดเติมสะสม */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>ระดับแรงค์ของคุณ:</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: currentUserRank.bg, border: `1.5px solid ${currentUserRank.border}`, color: currentUserRank.color, padding: '2px 8px', borderRadius: '14px', fontSize: '11px', fontWeight: '900', boxShadow: currentUserRank.glow }}>
                    <RankEmblem tier={currentUserRank.tier} size={16} />
                    <span>{currentUserRank.name}</span>
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>({currentUserRank.title})</span>
                </div>
                <div style={{ fontSize: '11px', color: '#38bdf8' }}>
                  ยอดเติมแพ็กสะสม: <b style={{ color: '#34d399', fontSize: '13px' }}>฿{currentUserSpending.toLocaleString()}</b>
                </div>
              </div>
              {eventMsg.text && (
                <div style={{ backgroundColor: eventMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: `1px solid ${eventMsg.type === 'success' ? '#34d399' : '#ef4444'}`, color: eventMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '15px' }}>
                  {eventMsg.text}
                </div>
              )}
              <form onSubmit={handleRedeemEventCode} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#c084fc', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>1. เลือกเกม</label>
                  <select value={eventGame} onChange={(e) => setEventGame(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}>
                    {gamesData.map((g) => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#c084fc', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>2. ชื่อในเกม หรือ UID</label>
                  <input type="text" placeholder="ระบุไอดีหรือ UID ตัวละคร..." value={eventPlayerId} onChange={(e) => setEventPlayerId(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#34d399', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>3. กรอกรหัสโค้ดของขวัญ</label>
                  <input
                    type="text"
                    placeholder="เช่น GIFT-VAL-125..."
                    value={eventGiftCode}
                    onChange={(e) => setEventGiftCode(e.target.value.toUpperCase())}
                    style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #34d399', borderRadius: '10px', padding: '12px', color: '#34d399', fontWeight: 'bold', fontSize: '13px', outline: 'none', boxSizing: 'border-box', letterSpacing: '0.5px' }}
                  />
                </div>
                <div>
                  <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                    🎁 แลกรับของขวัญ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'shop' && selectedGame && (
          <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '24px', padding: '30px', border: '1.5px solid rgba(147,51,234,0.5)' }}>
            <button onClick={() => setSelectedGame(null)} style={{ backgroundColor: 'transparent', border: '1px solid #374151', color: '#9ca3af', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>
              ← กลับไปหน้าเลือกเกม
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
                  <h2 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 6px 0' }}>{selectedGame.name}</h2>
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
                        backgroundColor: isPkgOutOfStock ? 'rgba(30, 20, 25, 0.85)' : isSelected ? 'rgba(147, 51, 234, 0.25)' : '#030712', 
                        border: isPkgOutOfStock ? '1.5px solid #ef4444' : isSelected ? '2px solid #a855f7' : '1px solid #374151', 
                        borderRadius: '16px', padding: '16px', 
                        cursor: isPkgOutOfStock ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                        opacity: isPkgOutOfStock ? 0.75 : 1
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
                placeholder={isUserAdmin ? "🔍 ค้นหาชื่อบัญชีลูกค้า..." : user.username}
                value={isUserAdmin ? exactSearchQuery : (user.username && user.username.includes('@') ? user.username.split('@')[0] : user.username)} 
                disabled={!isUserAdmin}
                onChange={(e) => isUserAdmin && setExactSearchQuery(e.target.value)} 
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
              @cybertopup (แอดมิน 24 ชม.)
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
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#06c755', letterSpacing: '0.5px' }}>@cybertopup</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (navigator && navigator.clipboard) {
                    navigator.clipboard.writeText('@cybertopup');
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
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#c084fc' }}>💳 เติมเครดิตเข้า Cyber Wallet</h3>
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
                  {walletPaymentMethod === 'true' ? '🧡 โอน TrueMoney เติมเครดิต' : '💳 โอนเงินเติมเครดิตเข้า Cyber Wallet'}
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
        <p style={{ margin: 0 }}>⚡ <b>CYBER TOPUP</b> - บริการเติมเกมออนไลน์ ตลอด 24 ชั่วโมง</p>
      </footer>
    </div>
  );
}
