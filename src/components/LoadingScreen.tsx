import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

// Exact Malta path from uploaded SVG
const MALTA_D = "M 612 529 L 600 553 L 614 544 L 618 548 L 618 560 L 613 565 L 601 559 L 619 584 L 646 584 L 662 592 L 673 592 L 680 610 L 688 594 L 699 608 L 701 595 L 705 591 L 710 596 L 706 601 L 708 621 L 703 627 L 703 640 L 697 644 L 679 631 L 695 651 L 687 662 L 695 662 L 698 670 L 686 682 L 676 675 L 668 686 L 656 685 L 645 691 L 653 699 L 647 708 L 635 700 L 636 695 L 633 697 L 657 729 L 672 732 L 708 759 L 699 768 L 699 777 L 704 785 L 713 786 L 718 796 L 714 810 L 688 798 L 675 799 L 663 809 L 674 826 L 667 838 L 689 859 L 686 866 L 662 865 L 651 859 L 653 871 L 646 879 L 634 874 L 647 895 L 640 931 L 670 977 L 683 983 L 678 1013 L 729 1064 L 791 1105 L 805 1108 L 832 1135 L 872 1163 L 885 1162 L 923 1200 L 962 1217 L 993 1223 L 1014 1247 L 1052 1262 L 1084 1266 L 1119 1295 L 1167 1314 L 1177 1313 L 1187 1321 L 1232 1329 L 1273 1345 L 1290 1340 L 1298 1349 L 1389 1379 L 1410 1370 L 1425 1383 L 1448 1384 L 1510 1401 L 1525 1398 L 1535 1407 L 1554 1409 L 1581 1423 L 1610 1417 L 1625 1423 L 1647 1419 L 1668 1423 L 1685 1410 L 1706 1407 L 1721 1399 L 1759 1364 L 1762 1354 L 1758 1348 L 1706 1322 L 1694 1333 L 1663 1324 L 1650 1312 L 1675 1295 L 1665 1277 L 1669 1271 L 1701 1270 L 1727 1285 L 1735 1283 L 1750 1264 L 1744 1244 L 1748 1240 L 1778 1268 L 1778 1284 L 1798 1296 L 1798 1310 L 1814 1340 L 1823 1343 L 1834 1333 L 1832 1315 L 1841 1291 L 1829 1274 L 1840 1258 L 1822 1241 L 1822 1233 L 1832 1227 L 1841 1237 L 1851 1239 L 1855 1222 L 1878 1234 L 1900 1220 L 1899 1214 L 1874 1193 L 1886 1182 L 1881 1169 L 1869 1162 L 1852 1161 L 1844 1154 L 1883 1121 L 1909 1106 L 1909 1099 L 1899 1088 L 1915 1077 L 1912 1068 L 1847 1013 L 1785 975 L 1773 975 L 1716 935 L 1701 928 L 1691 930 L 1678 921 L 1662 928 L 1646 912 L 1630 910 L 1619 900 L 1611 902 L 1619 908 L 1615 916 L 1605 908 L 1601 913 L 1610 925 L 1604 933 L 1573 933 L 1569 929 L 1583 913 L 1588 880 L 1579 877 L 1560 885 L 1556 881 L 1559 872 L 1524 831 L 1478 807 L 1454 821 L 1443 807 L 1464 785 L 1457 779 L 1459 772 L 1439 764 L 1439 750 L 1425 749 L 1400 738 L 1379 718 L 1361 718 L 1345 709 L 1335 710 L 1325 720 L 1314 718 L 1307 723 L 1293 715 L 1277 715 L 1264 701 L 1252 702 L 1248 698 L 1262 677 L 1259 671 L 1220 661 L 1206 669 L 1197 654 L 1177 646 L 1167 636 L 1153 637 L 1145 630 L 1145 637 L 1134 643 L 1118 626 L 1124 636 L 1118 643 L 1118 652 L 1067 695 L 1063 691 L 1091 654 L 1091 618 L 1081 623 L 1075 617 L 1081 607 L 1077 605 L 1041 622 L 1036 633 L 1024 642 L 1008 640 L 989 653 L 978 651 L 939 670 L 909 677 L 905 673 L 935 644 L 938 636 L 986 593 L 974 597 L 970 593 L 982 576 L 963 589 L 952 574 L 922 572 L 913 567 L 915 577 L 908 581 L 904 577 L 905 567 L 890 576 L 877 558 L 866 557 L 808 581 L 760 584 L 752 577 L 750 564 L 789 547 L 825 513 L 862 498 L 872 489 L 859 495 L 851 490 L 864 471 L 874 473 L 863 456 L 864 418 L 837 392 L 820 389 L 805 373 L 783 372 L 768 380 L 748 369 L 715 396 L 724 406 L 717 412 L 712 410 L 712 415 L 748 425 L 753 430 L 750 449 L 769 465 L 756 473 L 761 487 L 757 492 L 744 478 L 727 485 L 712 482 L 697 491 L 676 479 L 681 490 L 677 496 L 652 492 L 654 498 L 633 519 Z";

// Exact Gozo path from uploaded SVG
const GOZO_D = "M 56 143 L 61 159 L 76 172 L 83 167 L 87 171 L 83 177 L 95 186 L 85 208 L 93 226 L 82 235 L 89 254 L 84 263 L 85 275 L 78 283 L 80 294 L 114 317 L 158 314 L 179 325 L 202 329 L 207 343 L 250 384 L 268 381 L 310 388 L 336 398 L 404 408 L 423 418 L 443 415 L 460 422 L 518 409 L 530 398 L 588 399 L 645 367 L 655 354 L 714 360 L 738 344 L 761 344 L 795 327 L 792 294 L 747 262 L 736 245 L 719 231 L 701 230 L 682 212 L 677 194 L 645 184 L 636 186 L 626 177 L 593 166 L 597 175 L 613 178 L 625 186 L 609 198 L 603 186 L 595 186 L 588 178 L 561 166 L 563 153 L 556 159 L 547 151 L 526 153 L 515 139 L 519 160 L 512 163 L 440 122 L 448 115 L 484 131 L 496 141 L 502 134 L 447 111 L 434 116 L 399 87 L 360 71 L 317 67 L 261 74 L 246 70 L 236 76 L 226 74 L 170 86 L 131 107 L 71 112 L 63 120 Z";

const NAME_CHARS = 'Christiano Vincenti'.split('');

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState(0);
  const maltaRef = useRef<SVGPathElement>(null);
  const gozoRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),    // Map draws
      setTimeout(() => setPhase(2), 2400),   // Name reveals
      setTimeout(() => setPhase(3), 3800),   // Hold / subtitle
      setTimeout(() => setPhase(4), 5000),   // Exit
      setTimeout(() => onComplete(), 5800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Measure stroke lengths
  useEffect(() => {
    [maltaRef, gozoRef].forEach(ref => {
      if (ref.current) {
        const len = ref.current.getTotalLength();
        ref.current.style.setProperty('--len', `${len}`);
      }
    });
  }, []);

  return (
    <AnimatePresence>
      {phase < 5 ? (
        <motion.div
          key="loader"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-[9999] overflow-hidden"
          style={{ background: '#07060A' }}
        >
          {/* Warm ambient */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 60% 55% at 50% 52%, rgba(55,28,5,.20) 0%, rgba(25,10,2,.10) 50%, transparent 100%)'
          }} />

          {/* Film grain */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: '-200px',
              width: 'calc(100% + 400px)',
              height: 'calc(100% + 400px)',
              zIndex: 1,
              opacity: 0.055,
              animation: 'grain 0.09s steps(1) infinite',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='512' height='512' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '180px 180px',
            }}
          />

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{
            zIndex: 2,
            background: 'radial-gradient(ellipse 75% 72% at 50% 50%, transparent 0%, rgba(4,3,7,.52) 58%, rgba(2,1,4,.98) 100%)'
          }} />

          {/* Corner marks */}
          {(['tl','tr','bl','br'] as const).map((pos) => (
            <svg
              key={pos}
              className="fixed pointer-events-none transition-opacity duration-[2500ms]"
              style={{
                width: 'clamp(22px, 2.6vw, 36px)',
                height: 'clamp(22px, 2.6vw, 36px)',
                opacity: phase >= 1 ? 0.2 : 0,
                zIndex: 20,
                ...(pos === 'tl' ? { top: 'clamp(18px,2.4vw,30px)', left: 'clamp(18px,2.4vw,30px)' } :
                  pos === 'tr' ? { top: 'clamp(18px,2.4vw,30px)', right: 'clamp(18px,2.4vw,30px)', transform: 'scaleX(-1)' } :
                  pos === 'bl' ? { bottom: 'clamp(18px,2.4vw,30px)', left: 'clamp(18px,2.4vw,30px)', transform: 'scaleY(-1)' } :
                  { bottom: 'clamp(18px,2.4vw,30px)', right: 'clamp(18px,2.4vw,30px)', transform: 'scale(-1,-1)' })
              }}
              viewBox="0 0 36 36"
              fill="none"
              stroke="rgba(200,169,110,.4)"
              strokeWidth="1"
            >
              <path d="M 0 12 L 0 0 L 12 0" />
            </svg>
          ))}

          {/* Stage */}
          <div className="fixed inset-0 z-10 flex flex-col items-center justify-center gap-0">

            {/* MALTA title */}
            <div
              className="transition-all duration-[2000ms]"
              style={{
                fontFamily: "'Raleway', sans-serif",
                fontWeight: 100,
                fontSize: 'clamp(10px, 1.1vw, 14px)',
                letterSpacing: '0.75em',
                textIndent: '0.75em',
                color: 'rgba(200,169,110,.5)',
                marginBottom: 'clamp(22px, 3.5vh, 44px)',
                opacity: phase >= 1 ? 1 : 0,
                transform: phase >= 1 ? 'translateY(0)' : 'translateY(-10px)',
              }}
            >
              M &nbsp;&nbsp; A &nbsp;&nbsp; L &nbsp;&nbsp; T &nbsp;&nbsp; A
            </div>

            {/* SVG Map — using exact uploaded paths */}
            <div
              className="relative transition-all duration-1000"
              style={{
                width: 'min(520px, 58vw, 52vh)',
                opacity: phase >= 1 ? 1 : 0,
                transform: phase >= 1 ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
              }}
            >
              {/* Warm glow */}
              <div
                className="absolute pointer-events-none transition-opacity duration-[3500ms]"
                style={{
                  bottom: '-18%', left: '8%', right: '8%', height: '42%',
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(140,80,15,.16) 0%, rgba(90,45,5,.06) 55%, transparent 100%)',
                  filter: 'blur(32px)',
                  opacity: phase >= 1 ? 1 : 0,
                  transitionDelay: '1s',
                }}
              />

              <svg
                viewBox="0 0 2072 1480"
                className="w-full h-auto block overflow-visible"
                style={{
                  filter: 'drop-shadow(0 28px 70px rgba(0,0,0,.99)) drop-shadow(0 6px 18px rgba(0,0,0,.9))',
                  animation: phase >= 3 ? 'floatMap 8s ease-in-out infinite' : 'none',
                }}
              >
                <defs>
                  <linearGradient id="luxGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f7d77a" />
                    <stop offset="45%" stopColor="#d4af37" />
                    <stop offset="100%" stopColor="#b8860b" />
                  </linearGradient>
                  <linearGradient id="luxGoldFaint" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(247,215,122,0.20)" />
                    <stop offset="45%" stopColor="rgba(212,175,55,0.14)" />
                    <stop offset="100%" stopColor="rgba(184,134,11,0.08)" />
                  </linearGradient>
                </defs>

                {/* Gozo */}
                <path
                  ref={gozoRef}
                  d={GOZO_D}
                  style={{
                    fill: phase >= 2 ? 'url(#luxGoldFaint)' : 'transparent',
                    stroke: 'rgba(200,160,60,.55)',
                    strokeWidth: 3,
                    strokeLinejoin: 'round' as const,
                    strokeDasharray: 'var(--len, 3000)',
                    strokeDashoffset: phase >= 1 ? '0' : 'var(--len, 3000)',
                    transition: 'stroke-dashoffset 2.8s cubic-bezier(.4,0,.2,1), fill 2.5s ease',
                  }}
                />

                {/* Malta */}
                <path
                  ref={maltaRef}
                  d={MALTA_D}
                  style={{
                    fill: phase >= 2 ? 'url(#luxGoldFaint)' : 'transparent',
                    stroke: 'rgba(200,160,60,.55)',
                    strokeWidth: 3,
                    strokeLinejoin: 'round' as const,
                    strokeDasharray: 'var(--len, 6000)',
                    strokeDashoffset: phase >= 1 ? '0' : 'var(--len, 6000)',
                    transition: 'stroke-dashoffset 2.8s cubic-bezier(.4,0,.2,1), fill 2.5s ease',
                  }}
                />
              </svg>
            </div>

            {/* Name block */}
            <div className="flex flex-col items-center" style={{ marginTop: 'clamp(28px, 4.2vh, 50px)' }}>

              {/* Top decorative rule */}
              <div
                className="flex items-center overflow-hidden transition-all duration-[2400ms]"
                style={{
                  gap: 'clamp(10px, 1.4vw, 18px)',
                  marginBottom: 'clamp(14px, 2vh, 24px)',
                  width: phase >= 2 ? 'min(360px, 48vw)' : '0px',
                  transitionTimingFunction: 'cubic-bezier(.4,0,.2,1)',
                }}
              >
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(180,130,55,.55))' }} />
                <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(180,130,55,.5)' }} />
                <div className="flex-shrink-0" style={{
                  width: 5, height: 5,
                  background: '#C8A96E',
                  transform: 'rotate(45deg)',
                  boxShadow: '0 0 8px rgba(200,169,110,.5)',
                }} />
                <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(180,130,55,.5)' }} />
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(180,130,55,.55), transparent)' }} />
              </div>

              {/* Name — letter by letter */}
              <div
                className="flex overflow-hidden select-none"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 'clamp(36px, 6.2vw, 80px)',
                  letterSpacing: '.025em',
                  lineHeight: 1,
                  color: '#EDE5D2',
                  textShadow: '0 2px 50px rgba(0,0,0,.9), 0 0 80px rgba(200,169,110,.08)',
                }}
              >
                {NAME_CHARS.map((char, i) => (
                  <span
                    key={i}
                    className="inline-block"
                    style={{
                      opacity: phase >= 2 ? 1 : 0,
                      transform: phase >= 2 ? 'translateY(0)' : 'translateY(100%)',
                      transition: `opacity 0.5s ease ${i * 0.04}s, transform 0.5s cubic-bezier(.16,1,.3,1) ${i * 0.04}s`,
                      width: char === ' ' ? '0.22em' : undefined,
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </div>

              {/* Subtitle */}
              <div
                className="transition-opacity duration-[2500ms]"
                style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontWeight: 200,
                  fontSize: 'clamp(7px, .76vw, 9.5px)',
                  letterSpacing: '.52em',
                  textIndent: '.52em',
                  color: 'rgba(180,150,100,.42)',
                  marginTop: 'clamp(10px, 1.5vh, 16px)',
                  opacity: phase >= 3 ? 1 : 0,
                }}
              >
                P R O P E R T Y &nbsp; M A N A G E M E N T
              </div>

              {/* Bottom rule */}
              <div
                className="h-px transition-all duration-[2000ms]"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(140,100,40,.32) 35%, rgba(160,120,55,.4) 50%, rgba(140,100,40,.32) 65%, transparent)',
                  marginTop: 'clamp(12px, 1.8vh, 20px)',
                  width: phase >= 2 ? 'min(110px, 15vw)' : '0px',
                  transitionDelay: '0.4s',
                  transitionTimingFunction: 'cubic-bezier(.4,0,.2,1)',
                }}
              />
            </div>
          </div>

          {/* Bottom counter */}
          <div
            className="fixed z-20 transition-opacity duration-[1200ms]"
            style={{
              bottom: 'clamp(26px, 4vh, 46px)',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: "'Raleway', sans-serif",
              fontWeight: 100,
              fontSize: 'clamp(7.5px, .78vw, 9.5px)',
              letterSpacing: '.55em',
              textIndent: '.55em',
              color: 'rgba(160,120,50,.3)',
              opacity: phase >= 3 ? 1 : 0,
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            CHRISTIANO VINCENTI — EST. MMXXIV
          </div>

          {/* Exit veil */}
          <div
            className="fixed inset-0 z-50 pointer-events-none"
            style={{
              background: '#07060A',
              transformOrigin: 'top',
              transform: phase >= 4 ? 'scaleY(1)' : 'scaleY(0)',
              transition: phase >= 4 ? 'transform 1.5s cubic-bezier(.76,0,.24,1)' : 'none',
            }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
