'use client';

export function SuccessStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

      .ckv-page {
        min-height: 100vh;
        background-color: #FAF7F2;
        padding-top: 80px;
        padding-bottom: 64px;
        font-family: 'DM Sans', sans-serif;
        color: #2C2420;
      }

      .ckv-success-title {
        font-family: 'Cormorant Garamond', serif;
        font-style: italic;
        font-weight: 500;
        font-size: 32px;
        color: #2C2420;
        margin: 24px 0 0;
      }
      @media (min-width: 640px) {
        .ckv-success-title { font-size: 38px; }
      }

      .ckv-order-number-box {
        display: inline-block;
        margin: 24px 0;
        padding: 10px 28px;
        border: 1px solid #E8E0D6;
        border-radius: 50px;
        font-family: 'DM Sans', sans-serif;
        font-size: 13px;
        font-weight: 500;
        color: #2C2420;
        letter-spacing: 0.03em;
      }

      .ckv-recap-card {
        background: #fff;
        border-radius: 12px;
        padding: 28px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        margin: 8px 0;
      }

      .ckv-recap-divider {
        height: 1px;
        background: #E8E0D6;
        margin: 16px 0;
      }

      /* Animated checkmark */
      .ckv-checkmark-wrap {
        width: 72px;
        height: 72px;
        margin: 0 auto;
      }
      .ckv-checkmark-svg {
        width: 72px;
        height: 72px;
      }
      .ckv-checkmark-circle {
        stroke-dasharray: 151;
        stroke-dashoffset: 151;
        animation: ckvCircleDraw 0.6s ease-out 0.2s forwards;
      }
      .ckv-checkmark-check {
        stroke-dasharray: 40;
        stroke-dashoffset: 40;
        animation: ckvCheckDraw 0.4s ease-out 0.7s forwards;
      }
      @keyframes ckvCircleDraw {
        to { stroke-dashoffset: 0; }
      }
      @keyframes ckvCheckDraw {
        to { stroke-dashoffset: 0; }
      }

      /* Staggered reveal */
      .ckv-reveal {
        opacity: 0;
        transform: translateY(12px);
        animation: ckvReveal 0.4s ease forwards;
      }
      @keyframes ckvReveal {
        to { opacity: 1; transform: translateY(0); }
      }

      /* Buttons */
      .ckv-success-btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 14px 32px;
        font-size: 14px;
        font-weight: 500;
        font-family: 'DM Sans', sans-serif;
        letter-spacing: 0.03em;
        color: #fff;
        background-color: #C4956A;
        border: none;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .ckv-success-btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(196,149,106,0.35);
      }

      .ckv-success-btn-outline {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 14px 28px;
        font-size: 14px;
        font-weight: 500;
        font-family: 'DM Sans', sans-serif;
        letter-spacing: 0.03em;
        color: #2C2420;
        background: transparent;
        border: 1px solid #E8E0D6;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .ckv-success-btn-outline:hover {
        border-color: #C4956A;
        color: #C4956A;
      }

      /* Shimmer skeleton */
      .ckv-shimmer {
        background: linear-gradient(
          90deg,
          #F0EBE4 0%,
          #F7F2EB 30%,
          rgba(196,149,106,0.15) 50%,
          #F7F2EB 70%,
          #F0EBE4 100%
        );
        background-size: 300% 100%;
        animation: ckvShimmer 1.8s ease-in-out infinite;
      }
      @keyframes ckvShimmer {
        0% { background-position: 100% 0; }
        100% { background-position: -100% 0; }
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
    `}</style>
  );
}
