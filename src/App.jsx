import React, { useState, useEffect, useRef, useCallback } from 'react';

// ==========================================================
// HELPER: EXTRACT YOUTUBE VIDEO ID FROM ANY YOUTUBE URL/ID
// ==========================================================
function extractYoutubeId(input) {
  if (!input) return '';
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}

// ==========================================================
// HELPER: SYNTHESIZE ROMANTIC HARP CHIME VIA WEB AUDIO API
// ==========================================================
function playRomanticChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const startTime = ctx.currentTime + index * 0.11;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.11, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.45);
    });
  } catch (e) {
    // Ignore audio auto-play restriction errors
  }
}

export default function App() {
  // ==========================================================
  // REACT STATE: ENVELOPE TRANSITION & SCROLL VISIBILITY
  // ==========================================================
  const [envelopeStep, setEnvelopeStep] = useState('sealed'); // 'sealed' | 'opening' | 'letter-up' | 'flash' | 'opened'
  const [visibleSections, setVisibleSections] = useState({
    section2: false,
    section3: false,
    section4: false,
    section5: false,
    section6: false,
    section7: false,
  });

  // Floating heart particles triggered on wax seal tap
  const [hearts, setHearts] = useState([]);

  // Modals state
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [isVinylSpinning, setIsVinylSpinning] = useState(true);

  // ==========================================================
  // REACT STATE: CUSTOMIZABLE CONTENT (LIVE PREVIEW)
  // ==========================================================
  const [content, setContent] = useState({
    scene1Bg:
      'https://i.pinimg.com/736x/6c/d2/7d/6cd27d4409e7515fcceb50780516c8a3.jpg',
    scene2Bg:
      'https://i.pinimg.com/736x/dc/f3/dc/dcf3dc777cc128cb1057504135c1b493.jpg',
    heroTitle1: 'Happy',
    heroOrdinal: '6th',
    heroTitle2: 'Anniversary',
    heroSub: 'My Love!',
    letterHeading: 'HAPPY 6TH ANNIVERSARY, MY\nLOVE!',
    letterBody:
      'It’s kind of amazing how six years have already passed. It doesn’t feel that long, but at the same time, we’ve already shared so many memories together. From the random conversations to the small moments that might seem simple to others, they all mean a lot to me because I experienced them with you.',
    leftLetterImg:
      'https://i.pinimg.com/736x/80/ae/e2/80aee2f5bdb0450beb536297d2174152.jpg',
    rightLetterImg:
      'https://i.pinimg.com/736x/b3/c0/c5/b3c0c53879e093ef9655284195a8a744.jpg',
    galleryTitle: 'Our 6 Years Together',
    polaroids: [
      {
        url: 'https://i.pinimg.com/1200x/1d/66/1f/1d661f0e05ba4c7a6c3f152c4a882f6c.jpg',
        tilt: '-4.2deg',
        delay: '0.06s',
        grayscale: false,
      },
      {
        url: 'https://i.pinimg.com/736x/8c/aa/1d/8caa1dfff5ff1b1732e60ab0c7d316ad.jpg',
        tilt: '1.8deg',
        delay: '0.14s',
        grayscale: false,
      },
      {
        url: 'https://i.pinimg.com/736x/9b/21/ca/9b21caa0c32deb1eac45db468fae6fb4.jpg',
        tilt: '-3.1deg',
        delay: '0.22s',
        grayscale: false,
      },
      {
        url: 'https://i.pinimg.com/736x/4e/ad/89/4ead8954d1706819a795109622c3649a.jpg',
        tilt: '3.2deg',
        delay: '0.30s',
        grayscale: false,
      },
      {
        url: 'https://i.pinimg.com/736x/a1/4e/34/a14e347e8ecb9c4ff23eaf09f73ca4d2.jpg',
        tilt: '3.4deg',
        delay: '0.38s',
        grayscale: false,
      },
      {
        url: 'https://i.pinimg.com/736x/3c/cd/60/3ccd60b3cc846942aad7798eb05be542.jpg',
        tilt: '-4.8deg',
        delay: '0.46s',
        grayscale: false,
      },
      {
        url: 'https://i.pinimg.com/736x/ad/80/43/ad8043d32fc205aaecf0790ca061e1b6.jpg',
        tilt: '2.5deg',
        delay: '0.54s',
        grayscale: false,
      },
      {
        url: 'https://i.pinimg.com/736x/92/1c/20/921c2052974cfd5ff37dadf15dfe2527.jpg',
        tilt: '-4.4deg',
        delay: '0.62s',
        grayscale: false,
      },
    ],
    favPersonTitle: 'MY FAVORITE PERSON',
    favPersonSub: 'I LOVE YOU SO MUCH!',
    filmImgLeft:
      'https://i.pinimg.com/736x/ce/14/3d/ce143d43802613b795bf85b2cd55a6ad.jpg',
    filmImgRight:
      'https://i.pinimg.com/736x/86/ee/d0/86eed0cd6974577668072546ed79561b.jpg',
    journalPolaroidImg:
      'https://i.pinimg.com/1200x/49/ef/e0/49efe0c9cbd99c65a20047722d58068e.jpg',
    journalGreeting: 'Hi love,\nHappy 6th anniversary!',
    journalPara1:
      'Thank you for being patient with me, for understanding me even when I’m hard to understand, and for staying by my side through everything. I appreciate all the little things you do, even the ones you think I don’t notice—because I do. These past six years haven’t been perfect, but I think that’s what makes what we have real. We’re learning, growing, and figuring things out together, and that matters more than anything.',
    journalPara2:
      'I’m really grateful to have you in my life. You’ve made my days brighter and my problems feel lighter just by being there. I hope we continue to grow together, support each other, and create more memories in the years ahead.',
    songHeading: 'This song reminds me of you',
    youtubeVideoId: 'fLexgOxsZu0',
    youtubeUrlInput: 'https://www.youtube.com/watch?v=fLexgOxsZu0',
    youtubeTitle: 'Bruno Mars - Risk It All [Official Music Video]',
    youtubeArtist: 'Bruno Mars',
    youtubeThumb:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=85',
  });



  // Refs for smooth scrolling & scroll-spy animation triggers
  const sectionRefs = {
    section2: useRef(null),
    section3: useRef(null),
    section4: useRef(null),
    section5: useRef(null),
    section6: useRef(null),
    section7: useRef(null),
  };

  // ==========================================================
  // SPAWN FLOATING ROMANTIC HEART PARTICLES
  // ==========================================================
  const spawnHeartBurst = useCallback(() => {
    const symbols = ['♥', '♡', '❤'];
    const batch = Array.from({ length: 24 }).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      symbol: symbols[i % symbols.length],
      left: 24 + Math.random() * 52,
      top: 50 + Math.random() * 14,
      size: 15 + Math.random() * 21,
      duration: 1.6 + Math.random() * 1.4,
      rot: `${(Math.random() * 50 - 25).toFixed(1)}deg`,
      color: i % 2 === 0 ? '#ffd7dc' : '#f9e8b2',
    }));
    setHearts(batch);
    setTimeout(() => {
      setHearts([]);
    }, 3100);
  }, []);

  // ==========================================================
  // OPEN ENVELOPE HANDLER
  // ==========================================================
  const handleOpenEnvelope = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (envelopeStep !== 'sealed') return;

    playRomanticChime();
    setEnvelopeStep('opening');

    setTimeout(() => {
      setEnvelopeStep('letter-up');
      spawnHeartBurst();
    }, 180);

    setTimeout(() => {
      setEnvelopeStep('flash');
    }, 850);

    setTimeout(() => {
      setEnvelopeStep('opened');
      setVisibleSections((prev) => ({ ...prev, section2: true }));
    }, 1150);
  };



  // ==========================================================
  // SCROLL OBSERVER FOR SECTIONS 3 TO 7
  // ==========================================================
  const checkScrollAnimations = useCallback(() => {
    if (envelopeStep !== 'opened') return;
    const triggerBottom = window.innerHeight * 0.82;

    Object.entries(sectionRefs).forEach(([key, ref]) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        if (rect.top < triggerBottom) {
          setVisibleSections((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
        }
      }
    });
  }, [envelopeStep]);

  useEffect(() => {
    if (envelopeStep === 'opened') {
      checkScrollAnimations();
      window.addEventListener('scroll', checkScrollAnimations, { passive: true });
      window.addEventListener('resize', checkScrollAnimations);
      return () => {
        window.removeEventListener('scroll', checkScrollAnimations);
        window.removeEventListener('resize', checkScrollAnimations);
      };
    }
  }, [envelopeStep, checkScrollAnimations]);

  const scrollToSection = (sectionKey) => {
    const target = sectionRefs[sectionKey]?.current;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };



  const isEnvelopeOpen = envelopeStep === 'opened';

  return (
    <div className="min-h-screen w-full bg-[#8f1119] text-white overflow-x-hidden selection:bg-[#f9e8b2] selection:text-[#65120f]">
      {/* Google Fonts & Custom Keyframe Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Great+Vibes&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600&display=swap');

        html, body {
          margin: 0;
          padding: 0;
          background-color: #8f1119;
          font-family: 'Cormorant Garamond', Georgia, serif;
          scroll-behavior: smooth;
          overflow-x: hidden;
        }

        .font-script {
          font-family: 'Great Vibes', cursive;
        }
        .font-serif-editorial {
          font-family: 'Playfair Display', Georgia, serif;
        }
        .font-garamond {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }

        /* 3D Envelope & Wax Seal */
        .envelope-stage {
          perspective: 1400px;
        }
        .envelope-box {
          position: relative;
          width: min(88vw, 490px);
          height: min(56vw, 315px);
          background: linear-gradient(165deg, #7c1814 0%, #5c0f0c 100%);
          border-radius: 7px;
          box-shadow: 0 28px 60px rgba(15, 2, 2, 0.55);
          transform-style: preserve-3d;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          cursor: pointer;
        }
        .envelope-box:hover {
          transform: translateY(-4px) scale(1.01);
        }
        .envelope-letter {
          position: absolute;
          left: 6%;
          right: 6%;
          top: 8%;
          bottom: 8%;
          background: linear-gradient(to bottom, #fffdf9 0%, #f5ece0 100%);
          border-radius: 5px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.2);
          transition: transform 0.9s cubic-bezier(0.34, 1.45, 0.64, 1);
        }
        .envelope-letter.letter-slide-up {
          transform: translateY(-58%) scale(1.02);
        }
        .pocket-left {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #8b1c18 0%, #6b120f 100%);
          clip-path: polygon(0 0, 52% 52%, 0 100%);
          border-radius: 7px 0 0 7px;
          z-index: 3;
        }
        .pocket-right {
          position: absolute;
          inset: 0;
          background: linear-gradient(225deg, #871a16 0%, #65100d 100%);
          clip-path: polygon(100% 0, 48% 52%, 100% 100%);
          border-radius: 0 7px 7px 0;
          z-index: 3;
        }
        .pocket-bottom {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, #560d0a 0%, #7d1814 90%, #8c1e19 100%);
          clip-path: polygon(0 100%, 50% 47%, 100% 100%);
          border-radius: 0 0 7px 7px;
          z-index: 4;
        }
        .envelope-flap {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 60%;
          background: linear-gradient(180deg, #9b241f 0%, #7f1915 55%, #67110e 100%);
          clip-path: polygon(0 0, 100% 0, 50% 94%);
          border-radius: 7px 7px 0 0;
          transform-origin: top center;
          transition: transform 0.85s cubic-bezier(0.4, 0, 0.2, 1), z-index 0.2s 0.3s;
          z-index: 5;
        }
        .envelope-flap.flap-open {
          transform: rotateX(180deg);
          z-index: 1;
        }
        .wax-seal-btn {
          position: absolute;
          top: 53%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 84px;
          height: 84px;
          z-index: 10;
          cursor: pointer;
          background: transparent;
          border: none;
          padding: 0;
          outline: none;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.45s ease;
          animation: sealPulse 2.8s infinite ease-in-out;
        }
        .wax-seal-btn:hover {
          transform: translate(-50%, -50%) scale(1.1);
        }
        .wax-seal-btn.unsealing {
          animation: none;
          transform: translate(-50%, -50%) scale(1.35) rotate(15deg);
          opacity: 0;
          pointer-events: none;
        }
        @keyframes sealPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            filter: drop-shadow(0 8px 16px rgba(25, 4, 4, 0.6));
          }
          50% {
            transform: translate(-50%, -50%) scale(1.05);
            filter: drop-shadow(0 10px 24px rgba(248, 224, 156, 0.48));
          }
        }

        /* Section 2 Heart Drawing & Title Shadow */
        .anniversary-title-shadow,
        .Monthsary-title-shadow {
          text-shadow: 0 2px 12px rgba(255, 250, 245, 0.45);
        }
        .draw-heart-path {
          stroke-dasharray: 500;
          stroke-dashoffset: 500;
          transition: stroke-dashoffset 1.7s cubic-bezier(0.35, 0, 0.25, 1);
        }
        .draw-heart-active-1 {
          stroke-dashoffset: 0;
          transition-delay: 0.45s;
        }
        .draw-heart-active-2 {
          stroke-dashoffset: 0;
          transition-delay: 0.7s;
        }

        /* Section 4 Polaroid Frame */
        .polaroid-card {
          background: #f6f2eb;
          padding: 10px 10px 34px 10px;
          border-radius: 2px;
          box-shadow: 0 12px 26px rgba(35, 3, 5, 0.32);
          transition: opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.75s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.35s ease;
          cursor: pointer;
        }
        .polaroid-card:hover {
          transform: translateY(-8px) scale(1.05) rotate(0deg) !important;
          box-shadow: 0 20px 38px rgba(30, 2, 4, 0.45);
          z-index: 30;
          transition-delay: 0s !important;
        }

        /* Section 5 Kodak Film Strip */
        .kodak-meta-text {
          font-family: 'Courier New', Courier, monospace;
          letter-spacing: 0.08em;
          color: #d6c5b3;
          font-size: 11px;
          font-weight: 700;
        }

        /* Section 6 Lined Paper & Curled Corner */
        .lined-paper-left {
          background-color: #fbfaf8;
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 25px,
            rgba(218, 185, 185, 0.42) 26px
          );
          background-position: 0 28px;
          clip-path: polygon(0 0, calc(100% - 66px) 0, 100% 66px, 100% 100%, 0 100%);
          box-shadow: 0 18px 38px rgba(35, 3, 5, 0.32);
        }
        .paper-corner-curl {
          position: absolute;
          top: 0;
          right: 0;
          width: 66px;
          height: 66px;
          background: linear-gradient(225deg, transparent 48%, #e2ddd7 50%, #ffffff 72%, #d5cfc8 100%);
          border-bottom-left-radius: 6px;
          box-shadow: -5px 6px 12px rgba(0, 0, 0, 0.14);
          pointer-events: none;
          z-index: 25;
        }

        /* Section 7 Realistic Vinyl Record */
        .vinyl-disc-realistic {
          border-radius: 50%;
          background:
            radial-gradient(circle at center,
              #190506 0%,
              #190506 3.5%,
              #f5f5f5 3.7%,
              #eaeaea 27%,
              #0d0d0d 27.4%,
              #141414 31%,
              #050505 100%
            ),
            repeating-radial-gradient(circle at center,
              rgba(255, 255, 255, 0.06) 0px,
              rgba(255, 255, 255, 0.06) 1px,
              transparent 1.5px,
              transparent 4px
            );
          position: relative;
          box-shadow: 0 22px 52px rgba(20, 2, 3, 0.65), inset 0 0 0 3px rgba(255, 255, 255, 0.15);
          animation: spinRecordSlow 18s linear infinite;
        }
        .vinyl-disc-realistic.paused {
          animation-play-state: paused;
        }
        .vinyl-disc-realistic::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(
            from 35deg,
            transparent 0deg,
            rgba(255, 255, 255, 0.22) 22deg,
            transparent 48deg,
            transparent 180deg,
            rgba(255, 255, 255, 0.22) 202deg,
            transparent 228deg,
            transparent 360deg
          );
          pointer-events: none;
        }
        @keyframes spinRecordSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .glowing-song-heading {
          color: #ffffff;
          text-shadow:
            0 0 12px rgba(255, 215, 220, 0.9),
            0 0 26px rgba(255, 130, 145, 0.65);
        }
        .glowing-music-note {
          filter: drop-shadow(0 0 8px rgba(255, 210, 220, 0.95))
                  drop-shadow(0 0 16px rgba(255, 120, 140, 0.75));
          animation: floatMusicNote 3.4s ease-in-out infinite;
        }
        @keyframes floatMusicNote {
          0%, 100% { transform: translateY(0px) rotate(-4deg); }
          50% { transform: translateY(-9px) rotate(6deg); }
        }
        .heart-particle {
          position: fixed;
          pointer-events: none;
          z-index: 90;
          animation: floatUpHeart forwards ease-out;
        }
        @keyframes floatUpHeart {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.4) rotate(0deg);
          }
          20% {
            opacity: 0.95;
          }
          100% {
            opacity: 0;
            transform: translateY(-280px) scale(1.25) rotate(var(--rot, 15deg));
          }
        }
      `}</style>

      {/* ==========================================================
          FLOATING HEART BURST PARTICLES
         ========================================================== */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {hearts.map((h) => (
          <span
            key={h.id}
            className="heart-particle"
            style={{
              left: `${h.left}vw`,
              top: `${h.top}vh`,
              fontSize: `${h.size}px`,
              color: h.color,
              animationDuration: `${h.duration}s`,
              '--rot': h.rot,
            }}
          >
            {h.symbol}
          </span>
        ))}
      </div>

      {/* ==========================================================
          WARM CROSSFADE FLASH OVERLAY
         ========================================================== */}
      <div
        className={`fixed inset-0 bg-[#fff5eb] pointer-events-none z-40 transition-opacity duration-700 ${
          envelopeStep === 'flash' ? 'opacity-55' : 'opacity-0'
        }`}
      />

      {/* ==========================================================
          SECTION 1: ENVELOPE INTRO OVERLAY ("You got a mail!")
         ========================================================== */}
      {!isEnvelopeOpen && (
        <section
          className={`fixed inset-0 z-30 w-full h-full flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${
            envelopeStep === 'flash' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Warm Backdrop */}
          <div className="absolute inset-0 -z-10 overflow-hidden bg-[#4d2427]">
            <img
              src={content.scene1Bg}
              alt="Romantic Backdrop"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105"
              style={{
                filter: 'brightness(0.85) contrast(1.05)',
              }}
              onError={(e) => {
                e.currentTarget.src =
                  'https://placehold.co/1920x1080/5e2b30/f8e6d8?text=Welcome+Love';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#25080b]/50 via-[#420f14]/30 to-[#1e0508]/65" />
            <div className="absolute inset-0 bg-[#8f1119]/15" />
          </div>

          {/* Envelope Center Stage */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-2xl">
            <h1
              className={`font-script text-white text-5xl sm:text-6xl md:text-7xl tracking-wide mb-5 sm:mb-7 select-none transition-all duration-500 ${
                envelopeStep !== 'sealed'
                  ? 'opacity-0 -translate-y-4'
                  : 'opacity-100 translate-y-0'
              }`}
              style={{ textShadow: '0 4px 20px rgba(25, 4, 6, 0.65)' }}
            >
              You got a mail!
            </h1>

            <div className="envelope-stage flex flex-col items-center">
              <div className="envelope-box" onClick={handleOpenEnvelope}>
                {/* Hidden Love Note inside Envelope */}
                <div
                  className={`envelope-letter ${
                    envelopeStep === 'letter-up' || envelopeStep === 'flash'
                      ? 'letter-slide-up'
                      : ''
                  }`}
                >
                  <span className="font-script text-3xl sm:text-4xl text-[#7a1612] mb-1">
                    My Dearest Love,
                  </span>
                  <p className="font-serif-editorial italic text-xs sm:text-sm text-[#8a332e] tracking-widest uppercase">
                    6 Years of Pure Magic ♥
                  </p>
                </div>

                {/* Envelope Folds */}
                <div className="pocket-left" />
                <div className="pocket-right" />
                <div className="pocket-bottom" />

                {/* Top Opening 3D Flap */}
                <div
                  className={`envelope-flap ${
                    envelopeStep !== 'sealed' ? 'flap-open' : ''
                  }`}
                />

                {/* Metallic Gold Wax Seal Button */}
                <button
                  type="button"
                  aria-label="Click the wax to open"
                  onClick={handleOpenEnvelope}
                  className={`wax-seal-btn ${
                    envelopeStep !== 'sealed' ? 'unsealing' : ''
                  }`}
                >
                  <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
                    <defs>
                      <radialGradient id="goldWaxGrad" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#fff4ca" />
                        <stop offset="28%" stopColor="#e5c578" />
                        <stop offset="68%" stopColor="#b89241" />
                        <stop offset="100%" stopColor="#7c5b1a" />
                      </radialGradient>
                      <linearGradient id="innerRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8a6721" />
                        <stop offset="50%" stopColor="#f6e3ac" />
                        <stop offset="100%" stopColor="#735314" />
                      </linearGradient>
                      <radialGradient id="innerCoinGrad" cx="60%" cy="65%" r="65%">
                        <stop offset="0%" stopColor="#f3dca2" />
                        <stop offset="55%" stopColor="#c9a456" />
                        <stop offset="100%" stopColor="#926e27" />
                      </radialGradient>
                    </defs>
                    <path
                      d="M60,6 C73,5 85,11 95,19 C105,27 114,40 113,54 C112,67 116,82 107,93 C98,104 84,111 70,113 C57,115 43,115 31,108 C19,101 10,89 7,75 C4,61 7,46 14,33 C21,20 33,12 46,8 C51,6 55,6 60,6 Z"
                      fill="url(#goldWaxGrad)"
                    />
                    <path
                      d="M58,10 C71,9 82,15 91,23 C100,31 108,42 107,55 C106,67 110,80 102,90 C94,100 81,106 68,108 C56,110 43,109 33,103 C22,97 14,86 12,73 C10,60 12,47 19,35 C26,23 36,15 48,12 C52,10 55,10 58,10 Z"
                      fill="none"
                      stroke="#fff6d6"
                      strokeWidth="1.2"
                      opacity="0.55"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="35"
                      fill="url(#innerCoinGrad)"
                      stroke="url(#innerRimGrad)"
                      strokeWidth="3.5"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="31"
                      fill="none"
                      stroke="#6c4d12"
                      strokeWidth="0.9"
                      opacity="0.55"
                    />
                  </svg>
                </button>
              </div>

              <p
                onClick={handleOpenEnvelope}
                className={`mt-6 text-white/95 font-serif-editorial text-sm sm:text-base tracking-wide cursor-pointer hover:text-[#f9e8b2] transition-all duration-300 ${
                  envelopeStep !== 'sealed' ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)' }}
              >
                Click the wax to open.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ==========================================================
          MAIN SCROLLABLE JOURNEY (SECTIONS 2 TO 7)
          Unified #8f1119 Crimson Flow with ZERO Borders or Shadows
         ========================================================== */}
      {isEnvelopeOpen && (
        <main className="w-full m-0 p-0 bg-[#8f1119] animate-fadeIn">
          {/* ======================================================
              SECTION 2: "Happy 6th Anniversary My Love!"
             ====================================================== */}
          <section
            ref={sectionRefs.section2}
            className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-[#8f1119]"
          >
            {/* Homepage Couple Backdrop */}
            <div className="absolute inset-0 overflow-hidden bg-[#e6dfd3]">
              <img
                src={content.scene2Bg}
                alt="Homepage Couple Memory"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center scale-105"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://placehold.co/1920x1080/e6dfd5/65120f?text=Happy+6th+Anniversary';
                }}
              />
              <div className="absolute inset-0 bg-[#ebe5d8]/55 backdrop-blur-[0.5px]" />
            </div>

            {/* Deep Crimson Calligraphy Overlay */}
            <div className="relative z-10 w-full max-w-4xl px-4 sm:px-8 flex flex-col items-center justify-center">
              {/* Line 1: "Happy 6th [Heart]" */}
              <div
                className={`flex items-baseline justify-center gap-3 sm:gap-5 -mb-3 sm:-mb-6 transition-all duration-1000 delay-100 ${
                  visibleSections.section2
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-6 scale-95'
                }`}
              >
                <span className="font-script text-[#65120f] text-7xl sm:text-8xl md:text-[7.2rem] leading-none Monthsary-title-shadow">
                  {content.heroTitle1}
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-serif-editorial text-[#65120f] text-3xl sm:text-5xl md:text-[3.35rem] font-semibold tracking-tight Monthsary-title-shadow">
                    {content.heroOrdinal}
                  </span>
                  <svg
                    viewBox="0 0 85 95"
                    className="w-10 h-11 sm:w-14 sm:h-16 md:w-16 md:h-20 -mt-3 sm:-mt-5 overflow-visible"
                  >
                    <path
                      className={`draw-heart-path ${
                        visibleSections.section2 ? 'draw-heart-active-1' : ''
                      }`}
                      d="M40,76 C33,62 12,43 13,26 C14,15 24,13 31,22 C36,28 39,37 40,43 C42,32 49,13 61,11 C71,10 76,20 72,34 C67,50 51,66 40,78 C39,79 42,74 44,71"
                      fill="none"
                      stroke="#5c1310"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      className={`draw-heart-path ${
                        visibleSections.section2 ? 'draw-heart-active-1' : ''
                      }`}
                      d="M15,28 C16,18 25,16 32,24 C38,31 39,41 39,41 C43,27 51,14 61,14 C69,14 72,23 68,35 C63,50 48,65 39,76"
                      fill="none"
                      stroke="#5c1310"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      opacity="0.75"
                    />
                  </svg>
                </div>
              </div>

              {/* Line 2: "Monthsary" */}
              <div
                className={`my-0 transition-all duration-1000 delay-300 ${
                  visibleSections.section2
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-6 scale-95'
                }`}
              >
                <span className="font-script text-[#65120f] text-7xl sm:text-8xl md:text-[7.5rem] leading-none Monthsary-title-shadow block">
                  {content.heroTitle2}
                </span>
              </div>

              {/* Line 3: Looped Heart Sketch + "My Love!" */}
              <div
                className={`flex items-center justify-center gap-4 sm:gap-8 -mt-1 sm:-mt-2 transition-all duration-1000 delay-500 ${
                  visibleSections.section2
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-6 scale-95'
                }`}
              >
                <svg
                  viewBox="0 0 160 110"
                  className="w-24 h-16 sm:w-32 sm:h-22 md:w-36 md:h-24 overflow-visible"
                >
                  <path
                    className={`draw-heart-path ${
                      visibleSections.section2 ? 'draw-heart-active-2' : ''
                    }`}
                    d="M14,96 C46,96 74,92 92,74 C109,57 115,31 101,19 C89,9 73,20 71,36 C70,42 72,47 73,44 C75,30 62,13 48,18 C33,23 32,47 46,66 C61,85 88,92 135,90"
                    fill="none"
                    stroke="#2e1615"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    className={`draw-heart-path ${
                      visibleSections.section2 ? 'draw-heart-active-2' : ''
                    }`}
                    d="M22,95 C52,95 77,90 94,72 C108,57 113,33 100,21 C89,12 74,22 72,37 C72,37 62,16 49,20 C35,24 35,48 49,66 C63,83 89,91 129,89"
                    fill="none"
                    stroke="#5c1310"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                </svg>

                <span className="font-script text-[#65120f] text-4xl sm:text-6xl md:text-[4.2rem] leading-none Monthsary-title-shadow">
                  {content.heroSub}
                </span>
              </div>
            </div>


          </section>

          {/* ======================================================
              SECTION 3: LOVE LETTER & SLIDING PORTRAITS
             ====================================================== */}
          <section
            ref={sectionRefs.section3}
            className="relative w-full min-h-screen bg-[#8f1119] text-white flex flex-col items-center justify-center py-16 px-4 sm:px-8 lg:px-14 overflow-hidden"
          >
            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
              {/* Top Ornamental Heart Flourish SVG */}
              <div className="mb-3 sm:mb-4">
                <svg viewBox="0 0 260 48" className="w-44 sm:w-56 h-auto overflow-visible">
                  <path
                    d="M130,34 C124,26 112,14 117,7 C121,2 128,6 130,13 C132,6 139,2 143,7 C148,14 136,26 130,34 Z"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M130,34 C112,34 98,17 78,19 C64,20 58,31 67,35 C74,38 80,31 75,27 M130,34 C105,37 85,28 52,29 C35,30 22,22 18,30 C15,35 23,40 28,35"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M130,34 C148,34 162,17 182,19 C196,20 202,31 193,35 C186,38 180,31 185,27 M130,34 C155,37 175,28 208,29 C225,30 238,22 242,30 C245,35 237,40 232,35"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* 3-Column Grid: Left Portrait | Center Framed Letter | Right Portrait */}
              <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 items-center justify-items-center">
                {/* Left Portrait Sliding In From Left */}
                <div
                  className={`lg:col-span-4 w-full max-w-[300px] sm:max-w-[320px] transition-all duration-1000 ease-out delay-100 ${
                    visibleSections.section3
                      ? 'opacity-100 translate-x-0 rotate-0 scale-100'
                      : 'opacity-0 -translate-x-28 -rotate-6 scale-95'
                  }`}
                >
                  <div className="rounded-[24px] overflow-hidden aspect-[3/4.1] bg-[#6b0d12]">
                    <img
                      src={content.leftLetterImg}
                      alt="Couple Memory Left"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://placehold.co/600x820/701418/fce8e6?text=Our+Memory+1';
                      }}
                    />
                  </div>
                </div>

                {/* Central Bordered Love Letter */}
                <div
                  className={`lg:col-span-4 w-full max-w-[375px] sm:max-w-[400px] transition-all duration-1000 ease-out ${
                    visibleSections.section3
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-12 scale-95'
                  }`}
                >
                  <div className="border-[2.5px] border-white rounded-[26px] px-6 sm:px-8 py-8 sm:py-10 bg-[#8f1119] text-center flex flex-col items-center justify-center min-h-[450px] sm:min-h-[490px]">
                    <h2
                      className={`font-serif-editorial font-bold text-white text-lg sm:text-xl md:text-[1.35rem] tracking-[0.06em] uppercase leading-snug mb-6 whitespace-pre-line transition-all duration-700 delay-300 ${
                        visibleSections.section3
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-4'
                      }`}
                    >
                      {content.letterHeading}
                    </h2>

                    <p
                      className={`font-garamond text-white/95 text-[1.12rem] sm:text-[1.24rem] leading-[1.62] font-normal tracking-wide transition-all duration-700 delay-500 ${
                        visibleSections.section3
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-4'
                      }`}
                    >
                      {content.letterBody}
                    </p>
                  </div>
                </div>

                {/* Right Portrait Sliding In From Right */}
                <div
                  className={`lg:col-span-4 w-full max-w-[300px] sm:max-w-[320px] transition-all duration-1000 ease-out delay-200 ${
                    visibleSections.section3
                      ? 'opacity-100 translate-x-0 rotate-0 scale-100'
                      : 'opacity-0 translate-x-28 rotate-6 scale-95'
                  }`}
                >
                  <div className="rounded-[24px] overflow-hidden aspect-[3/4.1] bg-[#6b0d12]">
                    <img
                      src={content.rightLetterImg}
                      alt="Couple Memory Right"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://placehold.co/600x820/701418/fce8e6?text=Our+Memory+2';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cute Stick-Figure Couple Holding Hands SVG (Bottom Left) */}
            <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-7 z-20 pointer-events-none opacity-95">
              <svg viewBox="0 0 140 165" className="w-24 sm:w-28 md:w-32 h-auto overflow-visible">
                <path
                  d="M68,26 C65,22 59,17 62,13 C64,10 67,13 68,16 C69,13 72,10 74,13 C77,17 71,22 68,26 Z"
                  fill="#ffffff"
                />
                <path
                  d="M56,37 C54,34 51,31 53,29 C54,27 56,29 56,31 C57,29 59,27 60,29 C62,31 58,34 56,37 Z"
                  fill="#ffffff"
                />
                <path
                  d="M77,36 C75,34 73,31 74,29 C75,28 77,29 77,31 C78,29 80,28 81,29 C82,31 79,34 77,36 Z"
                  fill="#ffffff"
                />

                {/* Boy */}
                <circle cx="40" cy="62" r="16" fill="none" stroke="#ffffff" strokeWidth="2.6" />
                <path
                  d="M27,52 L22,45 L31,48 L30,39 L38,46 L44,39 L45,47 L53,44 L49,51"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="44" cy="60" r="1.7" fill="#ffffff" />
                <path
                  d="M41,67 Q46,70 49,66"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M38,78 L34,122 L45,122 L42,78"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M36,84 L24,114"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M43,84 L67,114"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M36,122 L33,156 M42,122 L44,156"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Girl */}
                <circle cx="92" cy="65" r="15.5" fill="none" stroke="#ffffff" strokeWidth="2.6" />
                <path
                  d="M80,55 C85,46 102,47 107,58 C112,68 114,82 117,87 M82,53 C77,61 75,74 73,82"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                />
                <circle cx="87" cy="63" r="1.7" fill="#ffffff" />
                <path
                  d="M83,69 Q87,72 91,69"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M91,81 L78,124 L105,124 Z"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M89,85 L67,114"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M95,85 L109,115"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M87,124 L86,156 M96,124 L98,156"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </section>

          {/* ======================================================
              SECTION 4: "Our 6 Years Together" POLAROID GALLERY
             ====================================================== */}
          <section
            ref={sectionRefs.section4}
            className="relative w-full min-h-screen bg-[#8f1119] flex flex-col items-center justify-center py-16 px-4 sm:px-8 lg:px-14 overflow-hidden"
          >
            {/* Soft Tinted Backdrop with Seamless Top & Bottom #8f1119 Fade */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src={content.scene2Bg}
                alt="Gallery Backdrop"
                className="w-full h-full object-cover scale-105 opacity-25"
                style={{
                  filter: 'sepia(0.35) hue-rotate(-25deg) saturate(1.4) brightness(0.95)',
                }}
              />
              <div className="absolute inset-0 bg-[#8f1119]/75" />
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#8f1119] via-[#8f1119]/90 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#8f1119] via-[#8f1119]/90 to-transparent" />
            </div>

            {/* Winding Dashed Love Trail & Location Pin SVG */}
            <div
              className={` absolute inset-0 pointer-events-none z-10 hidden md:block transition-opacity duration-1000 delay-500 ${
                visibleSections.section4 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <svg viewBox="0 0 1200 760" className="w-full h-full" preserveAspectRatio="none">
                <g transform="translate(285, 210)">
                  <path
                    d="M22,0 C9.8,0 0,9.8 0,22 C0,38.5 22,58 22,58 C22,58 44,38.5 44,22 C44,9.8 34.2,0 22,0 Z"
                    fill="#6e090e"
                  />
                  <path
                    d="M22,31 C19,27 12,21 12,15 C12,11 15.5,9 18.5,11.5 C20,12.8 21.2,14.5 22,16 C22.8,14.5 24,12.8 25.5,11.5 C28.5,9 32,11 32,15 C32,21 25,27 22,31 Z"
                    fill="#fff6ee"
                  />
                </g>
                <path
                  d="M 307 272 C 302 315, 345 292, 378 308 C 405 322, 392 350, 366 368 C 338 386, 355 418, 395 405 C 435 392, 466 392, 456 426 C 445 456, 480 468, 512 444"
                  fill="none"
                  stroke="#5e070b"
                  strokeWidth="3.2"
                  strokeDasharray="9 8"
                  strokeLinecap="round"
                />
                <g transform="translate(502, 412) rotate(12)">
                  <path
                    d="M20,36 C16,31 4,21 4,12 C4,6 9,3 14,6.5 C17,8.5 18.8,11 20,13.5 C21.2,11 23,8.5 26,6.5 C31,3 36,6 36,12 C36,21 24,31 20,36 Z"
                    fill="#6e090e"
                  />
                </g>
                <path
                  d="M 926 485 C 942 480, 962 490, 956 512 C 948 534, 988 530, 984 552 C 980 572, 922 572, 916 598 C 912 612, 906 624, 904 632"
                  fill="none"
                  stroke="#5e070b"
                  strokeWidth="3.2"
                  strokeDasharray="9 8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="relative z-20 w-full max-w-6xl mx-auto flex flex-col items-center">
              <h2
                className="font-script text-white text-5xl sm:text-6xl md:text-7xl tracking-wide text-center mb-8 sm:mb-11"
                style={{ textShadow: '0 4px 18px rgba(40, 4, 6, 0.45)' }}
              >
                {content.galleryTitle}
              </h2>

              {/* 2x4 Tilted Polaroid Frames Grid */}
              <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-x-5 sm:gap-x-9 lg:gap-x-12 gap-y-8 sm:gap-y-12 items-center justify-items-center">
                {content.polaroids.map((item, idx) => (
                  <div
                    key={idx}
                    className="polaroid-card w-full max-w-[195px] sm:max-w-[215px]"
                    style={{
                      opacity: visibleSections.section4 ? 1 : 0,
                      transform: visibleSections.section4
                        ? `translateY(0) scale(1) rotate(${item.tilt})`
                        : 'translateY(45px) scale(0.88) rotate(0deg)',
                      transitionDelay: visibleSections.section4 ? item.delay : '0s',
                    }}
                  >
                    <div className="w-full aspect-[1/0.96] overflow-hidden bg-[#2b1817]">
                      <img
                        src={item.url}
                        alt={`Memory ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover ${
                          item.grayscale ? 'grayscale contrast-125' : ''
                        }`}
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/400x400/701418/fce8e6?text=Memory+${
                            idx + 1
                          }`;
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ======================================================
              SECTION 5: "MY FAVORITE PERSON" KODAK FILM STRIP
             ====================================================== */}
          <section
            ref={sectionRefs.section5}
            className="relative w-full min-h-screen bg-[#8f1119] text-white flex flex-col items-center justify-center py-16 px-4 sm:px-8 overflow-hidden"
          >
            <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
              {/* Top Row: Dancing Hearts (Left) | Title (Center) | Cuddling Penguins (Right) */}
              <div className="w-full flex items-end justify-between mb-3 sm:mb-4 px-2 sm:px-6">
                {/* Cute Dancing Heart Characters SVG */}
                <div className="w-24 sm:w-32 md:w-36 -mb-2">
                  <svg viewBox="0 0 150 110" className="w-full h-auto overflow-visible" fill="none">
                    <path
                      d="M 35,64 C 20,52 10,33 17,21 C 23,12 34,15 38,24 C 42,15 53,12 59,21 C 66,33 54,52 35,64 Z"
                      stroke="#ffffff"
                      strokeWidth="2.6"
                      fill="#8f1119"
                    />
                    <circle cx="31" cy="34" r="1.8" fill="#ffffff" />
                    <circle cx="43" cy="34" r="1.8" fill="#ffffff" />
                    <path
                      d="M 34,40 Q 37,43 41,40"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 32,63 L 30,94 L 23,95 M 39,63 L 40,94 L 47,95"
                      stroke="#ffffff"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 24,46 Q 36,52 46,45"
                      stroke="#ffffff"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                    />

                    <path
                      d="M 102,72 C 86,60 75,41 83,28 C 89,19 100,22 104,31 C 108,22 119,19 125,28 C 133,41 120,60 102,72 Z"
                      stroke="#ffffff"
                      strokeWidth="2.6"
                      fill="#8f1119"
                    />
                    <circle cx="97" cy="41" r="1.8" fill="#ffffff" />
                    <circle cx="110" cy="41" r="1.8" fill="#ffffff" />
                    <path
                      d="M 100,47 Q 104,51 108,47"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 94,71 L 84,84 L 84,95 L 78,95 M 109,71 L 116,92 L 125,92"
                      stroke="#ffffff"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 82,52 L 68,54"
                      stroke="#ffffff"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 68,62 L 68,42"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="68"
                      cy="39"
                      r="4"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      fill="#8f1119"
                    />
                  </svg>
                </div>

                <h2 className="font-serif-editorial text-white text-2xl sm:text-4xl md:text-[2.65rem] tracking-[0.06em] uppercase font-bold text-center pb-2">
                  {content.favPersonTitle}
                </h2>

                {/* Cuddling Penguins SVG */}
                <div className="w-24 sm:w-28 md:w-32 -mb-2">
                  <svg viewBox="0 0 130 120" className="w-full h-auto overflow-visible">
                    <path
                      d="M62,18 C59,14 54,9 57,5 C59,2 62,5 62,8 C63,5 66,2 68,5 C71,9 65,14 62,18 Z"
                      fill="#ffffff"
                    />
                    <path
                      d="M75,26 C73,23 70,20 72,17 C73,15 75,17 75,19 C76,17 78,15 79,17 C81,20 77,23 75,26 Z"
                      fill="#ffffff"
                    />

                    <ellipse
                      cx="44"
                      cy="72"
                      rx="24"
                      ry="33"
                      fill="#1b1717"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <ellipse cx="45" cy="76" rx="15" ry="23" fill="#ffffff" />
                    <circle cx="39" cy="52" r="2.2" fill="#1b1717" />
                    <circle cx="50" cy="52" r="2.2" fill="#1b1717" />
                    <ellipse cx="35" cy="55" rx="3" ry="1.8" fill="#f4979c" />
                    <ellipse cx="54" cy="55" rx="3" ry="1.8" fill="#f4979c" />
                    <polygon points="42,54 48,54 45,59" fill="#f59e0b" />
                    <ellipse cx="34" cy="104" rx="6" ry="3" fill="#f59e0b" />
                    <ellipse cx="52" cy="104" rx="6" ry="3" fill="#f59e0b" />

                    <g transform="rotate(-10 82 76)">
                      <ellipse
                        cx="82"
                        cy="76"
                        rx="22"
                        ry="30"
                        fill="#1b1717"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <ellipse cx="80" cy="80" rx="14" ry="21" fill="#ffffff" />
                      <path
                        d="M72,57 Q75,54 78,57"
                        stroke="#1b1717"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                      />
                      <path
                        d="M83,57 Q86,54 89,57"
                        stroke="#1b1717"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                      />
                      <ellipse cx="71" cy="60" rx="3" ry="1.8" fill="#f4979c" />
                      <ellipse cx="90" cy="60" rx="3" ry="1.8" fill="#f4979c" />
                      <polygon points="78,59 84,59 81,64" fill="#f59e0b" />
                    </g>
                    <ellipse cx="75" cy="104" rx="6" ry="3" fill="#f59e0b" />
                    <ellipse cx="92" cy="104" rx="6" ry="3" fill="#f59e0b" />
                  </svg>
                </div>
              </div>

              {/* Realistic Kodak Portal 601 Film Strip */}
              <div
                className={`w-full bg-[#210e0c] p-6 rounded-[3px] shadow-[0_18px_42px_rgba(30,2,4,0.38)] transition-all duration-1000 delay-150 ${
                  visibleSections.section5
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-9 scale-95'
                }`}
              >
                <div className="grid grid-cols-2 gap-4 pb-1.5 px-2">
                  <div className="flex items-center justify-between kodak-meta-text">
                    <span>400</span>
                    <span>23</span>
                    <span>KODAK PORTAL 601</span>
                  </div>
                  <div className="flex items-center justify-between kodak-meta-text">
                    <span>400</span>
                    <span>23</span>
                    <span>KODAK PORTAL 601</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="w-full aspect-[4/3.1] overflow-hidden bg-[#120706]">
                    <img
                      src={content.filmImgLeft}
                      alt="Kodak Memory Left"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full aspect-[4/3.1] overflow-hidden bg-[#120706]">
                    <img
                      src={content.filmImgRight}
                      alt="Kodak Memory Right"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1.5 px-12">
                  <div className="flex items-center justify-between kodak-meta-text">
                    <span>►</span>
                    <span>► 10</span>
                  </div>
                  <div className="flex items-center justify-between kodak-meta-text">
                    <span>►</span>
                    <span>► 10</span>
                  </div>
                </div>
              </div>

              {/* Bottom Caption + Double Heart Flourish SVG */}
              <div className="mt-6 flex flex-col items-center">
                <h3 className="font-serif-editorial text-white text-xl sm:text-3xl md:text-[2.05rem] tracking-[0.06em] uppercase font-bold text-center">
                  {content.favPersonSub}
                </h3>

                <svg
                  viewBox="0 0 260 65"
                  className="w-48 sm:w-60 h-auto mt-2 overflow-visible"
                  fill="none"
                >
                  <path
                    d="M 18,46 Q 35,32 52,44 T 95,42 C 108,32 102,12 116,12 C 124,12 128,22 128,26 C 128,22 132,12 140,12 C 154,12 148,34 128,48 C 115,36 108,22 116,12"
                    stroke="#ffffff"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 142,50 C 132,42 125,28 132,20 C 137,15 143,20 145,25 C 147,20 153,15 158,20 C 165,28 156,42 142,50 Z"
                    stroke="#ffffff"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 155,44 Q 178,30 194,42 T 238,44"
                    stroke="#ffffff"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Interactive "Click" Tilted Mini Love Note (Bottom Right) */}
            <div
              onClick={() => scrollToSection('section6')}
              className="absolute bottom-4 right-5 sm:bottom-6 sm:right-10 z-20 flex items-center gap-3 cursor-pointer group"
              title="Click to read notebook letter"
            >
              <div className="flex flex-col items-end">
                <svg
                  viewBox="0 0 70 36"
                  className="w-12 sm:w-14 h-auto -mb-1 text-white group-hover:translate-x-1 transition-transform"
                  fill="none"
                >
                  <path
                    d="M6,30 C16,10 38,8 58,18"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M50,10 L60,19 L47,23"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-serif-editorial text-white text-base sm:text-lg tracking-wide">
                  Click
                </span>
              </div>
              <div className="w-16 h-22 sm:w-20 sm:h-26 bg-[#f8f1e7] rounded p-2 shadow-xl transform rotate-[18deg] group-hover:rotate-[8deg] group-hover:scale-105 transition-all border border-[#d9c5b2]">
                <div className="flex justify-center gap-1 text-[#8f1119] text-[9px] mb-1">
                  <span>♥</span>
                  <span>♥</span>
                  <span>♥</span>
                </div>
                <div className="space-y-1">
                  <div className="h-1 bg-[#8a332e]/40 rounded" />
                  <div className="h-1 bg-[#8a332e]/40 rounded w-5/6 mx-auto" />
                  <div className="h-1 bg-[#8a332e]/40 rounded" />
                  <div className="h-1 bg-[#8a332e]/40 rounded w-4/5 mx-auto" />
                </div>
                <div className="mt-2 text-[7px] text-center font-script text-[#65120f]">
                  Forever Yours
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================
              SECTION 6: OPEN NOTEBOOK JOURNAL SPREAD
             ====================================================== */}
          <section
            ref={sectionRefs.section6}
            className="relative w-full min-h-screen bg-[#8f1119] text-[#2b1e1d] flex flex-col items-center justify-center py-16 px-4 sm:px-8 overflow-hidden"
          >
            <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-center">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center justify-items-center">
                {/* Left Lined Page with Curled Corner & Taped Polaroid */}
                <div
                  className={`relative w-full max-w-[390px] sm:max-w-[425px] min-h-[510px] sm:min-h-[555px] lined-paper-left p-6 sm:p-8 flex flex-col items-center justify-between transition-all duration-1000 ease-out ${
                    visibleSections.section6
                      ? 'opacity-100 translate-x-0 -rotate-[2.5deg] scale-100'
                      : 'opacity-0 -translate-x-28 -rotate-6 scale-95'
                  }`}
                >
                  <div className="paper-corner-curl" />

                  {/* Polaroid Photo with Red Heart-Patterned Washi Tape */}
                  <div
                    className={`relative mt-6 sm:mt-8 bg-[#f5f2eb] p-3 pb-10 shadow-md border border-stone-200/80 w-[76%] max-w-[265px] transform -rotate-1 transition-all duration-700 delay-300 ${
                      visibleSections.section6
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-6 scale-95'
                    }`}
                  >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#b42025] shadow-sm flex items-center justify-around px-2 border-x-2 border-dashed border-[#f5f2eb]">
                      <span className="text-white text-xs">♥</span>
                      <span className="text-white text-xs">♥</span>
                      <span className="text-white text-xs">♥</span>
                      <span className="text-white text-xs">♥</span>
                      <span className="text-white text-xs">♥</span>
                    </div>

                    <div className="w-full aspect-square overflow-hidden bg-stone-800">
                      <img
                        src={content.journalPolaroidImg}
                        alt="Journal Polaroid"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Stick-Figure Couple Doodle with Floating Hearts */}
                  <div
                    className={`self-start ml-6 sm:ml-10 mt-3 transition-all duration-700 delay-500 ${
                      visibleSections.section6
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-5 scale-95'
                    }`}
                  >
                    <svg viewBox="0 0 120 130" className="w-24 sm:w-28 h-auto overflow-visible">
                      <path
                        d="M52,18 C49,13 43,9 46,5 C48,2 51,5 52,8 C53,5 56,2 58,5 C61,9 55,13 52,18 Z"
                        fill="#8f1119"
                        stroke="#231f20"
                        strokeWidth="1.2"
                      />
                      <circle cx="34" cy="14" r="2" fill="#231f20" />
                      <circle cx="72" cy="14" r="2.2" fill="#231f20" />
                      <circle cx="22" cy="40" r="1.5" fill="#8f1119" />
                      <circle cx="84" cy="42" r="1.8" fill="#8f1119" />

                      <circle
                        cx="42"
                        cy="44"
                        r="11"
                        fill="#ffffff"
                        stroke="#231f20"
                        strokeWidth="2"
                      />
                      <path
                        d="M33,38 L37,33 L41,37 L46,32 L49,37"
                        fill="none"
                        stroke="#231f20"
                        strokeWidth="1.8"
                      />
                      <circle cx="44" cy="43" r="1.3" fill="#231f20" />
                      <path
                        d="M41,47 Q44,50 47,47"
                        fill="none"
                        stroke="#231f20"
                        strokeWidth="1.5"
                      />
                      <rect
                        x="36"
                        y="55"
                        width="12"
                        height="28"
                        rx="2"
                        fill="#ffffff"
                        stroke="#231f20"
                        strokeWidth="2"
                      />
                      <path
                        d="M36,58 L28,78 M48,58 L55,78"
                        stroke="#231f20"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M39,83 L38,112 M45,83 L45,112"
                        stroke="#231f20"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      <circle
                        cx="64"
                        cy="46"
                        r="10.5"
                        fill="#ffffff"
                        stroke="#231f20"
                        strokeWidth="2"
                      />
                      <path
                        d="M55,40 C60,33 71,35 74,45 C77,53 79,62 80,66"
                        fill="none"
                        stroke="#231f20"
                        strokeWidth="1.8"
                      />
                      <circle cx="61" cy="45" r="1.3" fill="#231f20" />
                      <path
                        d="M59,49 Q62,51 65,49"
                        fill="none"
                        stroke="#231f20"
                        strokeWidth="1.5"
                      />
                      <polygon
                        points="64,57 54,84 73,84"
                        fill="#ffffff"
                        stroke="#231f20"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M59,60 L55,78 M68,60 L75,78"
                        stroke="#231f20"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M61,84 L60,112 M67,84 L68,112"
                        stroke="#231f20"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Right Crisp White Letter Page */}
                <div
                  className={`relative w-full max-w-[390px] sm:max-w-[425px] min-h-[510px] sm:min-h-[555px] bg-[#fbfaf8] shadow-2xl p-7 sm:p-10 flex flex-col justify-center transition-all duration-1000 ease-out delay-150 ${
                    visibleSections.section6
                      ? 'opacity-100 translate-x-0 rotate-[1.5deg] scale-100'
                      : 'opacity-0 translate-x-28 rotate-6 scale-95'
                  }`}
                >
                  <div
                    className={`font-garamond text-[#1f1615] text-[1.05rem] sm:text-[1.14rem] leading-[1.48] space-y-3 font-medium transition-all duration-700 delay-500 ${
                      visibleSections.section6
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-5'
                    }`}
                  >
                    <p className="font-semibold whitespace-pre-line">{content.journalGreeting}</p>
                    <p>{content.journalPara1}</p>
                    <p>{content.journalPara2}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================
              SECTION 7: "This song reminds me of you"
              Spinning Vinyl Record + Overlapping YouTube Player Card
             ====================================================== */}
          <section
            ref={sectionRefs.section7}
            className="relative w-full min-h-screen bg-[#8f1119] text-white flex flex-col items-center justify-center py-14 px-4 sm:px-8 overflow-hidden"
          >
            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center justify-center">
              {/* Glowing Cursive Heading on Top Right */}
              <div className="w-full flex justify-center lg:justify-end mb-4 lg:mb-2 lg:pr-8">
                <h2 className="font-script glowing-song-heading text-5xl sm:text-6xl md:text-7xl tracking-wide text-center lg:text-right select-none">
                  {content.songHeading}
                </h2>
              </div>

              {/* Overlapping Vinyl Disc + YouTube Player Card */}
              <div className="relative w-full flex flex-col lg:flex-row items-center justify-center my-2 sm:my-4">
                {/* Realistic Spinning Vinyl Record (Click to Toggle Spin) */}
                <div
                  onClick={() => setIsVinylSpinning((prev) => !prev)}
                  title="Click to play/pause vinyl spin"
                  className="relative z-10 w-[290px] h-[290px] sm:w-[430px] sm:h-[430px] md:w-[500px] md:h-[500px] lg:mr-[-150px] flex-shrink-0 cursor-pointer"
                >
                  <div
                    className={`vinyl-disc-realistic w-full h-full ${
                      isVinylSpinning ? '' : 'paused'
                    }`}
                  />
                </div>

                {/* Overlapping YouTube Music Video Card */}
                <div className="relative z-20 w-full max-w-[590px] bg-black rounded-[14px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.75)] border border-white/15 -mt-12 lg:mt-6">
                  <div
                    onClick={() => setIsYoutubeModalOpen(true)}
                    className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={content.youtubeThumb}
                      alt={content.youtubeTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/65" />

                    {/* YouTube Card Top Header Bar */}
                    <div className="absolute top-0 inset-x-0 p-3.5 sm:p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-stone-700 border border-white/30 flex-shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                            alt="Artist"
                            className="w-full h-full object-cover grayscale"
                          />
                        </div>
                        <div className="truncate">
                          <p className="text-white font-sans font-semibold text-sm sm:text-base truncate drop-shadow">
                            {content.youtubeTitle}
                          </p>
                          <p className="text-white/80 font-sans text-xs truncate">
                            {content.youtubeArtist}
                          </p>
                        </div>
                      </div>
                      <div className="text-white/90 p-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </div>
                    </div>

                    {/* Red YouTube Play Button */}
                    <div className="relative z-10 w-16 h-11 sm:w-20 sm:h-14 bg-[#ff0000] rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <polygon points="8,5 19,12 8,19" />
                      </svg>
                    </div>

                    {/* Bottom Bar: Link Icon + Watch on YouTube Badge */}
                    <div className="absolute bottom-3 inset-x-3.5 flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-black/65 border border-white/15 flex items-center justify-center text-white">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      </div>

                      <div className="bg-black/75 backdrop-blur-sm px-3.5 py-1.5 rounded-md border border-white/15 flex items-center gap-2 text-white text-xs sm:text-sm font-sans">
                        <span>Watch on</span>
                        <span className="font-bold flex items-center gap-1">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                          YouTube
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom "Click here ->" Action Link */}
              <div className="mt-6 sm:mt-8 flex items-center justify-center lg:pl-44">
                <button
                  type="button"
                  onClick={() => setIsYoutubeModalOpen(true)}
                  className="group flex items-center gap-3 text-white text-xl sm:text-2xl font-serif-editorial tracking-wide cursor-pointer"
                >
                  <span className="border-b-2 border-white pb-0.5 group-hover:text-[#f9e8b2] group-hover:border-[#f9e8b2] transition-colors">
                    Click here
                  </span>
                  <span className="group-hover:translate-x-1.5 transition-transform text-2xl">
                    →
                  </span>
                </button>
              </div>
            </div>

            {/* Glowing Musical Notes SVG on Bottom Right */}
            <div className="absolute bottom-8 right-6 sm:bottom-12 sm:right-12 pointer-events-none select-none z-20">
              <div className="relative w-24 h-28 sm:w-28 sm:h-32">
                <span className="glowing-music-note absolute top-0 left-2 text-white text-4xl sm:text-5xl">
                  ♫
                </span>
                <span
                  className="glowing-music-note absolute top-5 right-1 text-white text-3xl sm:text-4xl"
                  style={{ animationDelay: '0.6s' }}
                >
                  ♪
                </span>
                <span
                  className="glowing-music-note absolute bottom-0 left-6 text-white text-4xl sm:text-5xl"
                  style={{ animationDelay: '1.2s' }}
                >
                  ♪
                </span>
              </div>
            </div>
          </section>
        </main>
      )}



      {/* ==========================================================
          MODAL 1: EMBEDDED YOUTUBE VIDEO PLAYER
         ========================================================== */}
      {isYoutubeModalOpen && (
        <div
          onClick={() => setIsYoutubeModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-[#1a090a] rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
              <span className="font-script text-2xl sm:text-3xl text-white">
                {content.songHeading} ♥
              </span>
              <button
                type="button"
                onClick={() => setIsYoutubeModalOpen(false)}
                className="text-white/80 hover:text-white text-2xl leading-none px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="w-full aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${content.youtubeVideoId}?autoplay=1&rel=0`}
                title="Romantic Song Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}


    </div>
  );
}