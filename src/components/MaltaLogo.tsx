import React from 'react';

interface MaltaLogoProps {
  width?: number;
  height?: number;
  className?: string;
  withText?: boolean;
  mirrored?: boolean;
  animated?: boolean;
}

const MaltaLogo: React.FC<MaltaLogoProps> = ({
  width = 400,
  height = 285,
  className = '',
  withText = false,
  mirrored = false,
  animated = false
}) => {
  const transform = mirrored ? `scaleX(-1)` : '';

  return (
    <div className={`relative ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 2072 1480"
        className={animated ? 'animate-pulse' : ''}
        style={{ transform }}
      >
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f7d77a"/>
            <stop offset="45%" stopColor="#d4af37"/>
            <stop offset="100%" stopColor="#b8860b"/>
          </linearGradient>
          <filter id="edge" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#000" floodOpacity="0.25"/>
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#edge)">
          <path
            d="M 612 529 L 600 553 L 614 544 L 618 548 L 618 560 L 613 565 L 601 559 L 619 584 L 646 584 L 662 592 L 673 592 L 680 610 L 688 594 L 699 608 L 701 595 L 705 591 L 710 596 L 706 601 L 708 621 L 703 627 L 703 640 L 697 644 L 679 631 L 695 651 L 687 662 L 695 662 L 698 670 L 686 682 L 676 675 L 668 686 L 656 685 L 645 691 L 653 699 L 647 708 L 635 700 L 636 695 L 633 697 L 657 729 L 672 732 L 708 759 L 699 768 L 699 777 L 704 785 L 713 786 L 718 796 L 714 810 L 688 798 L 675 799 L 663 809 L 674 826 L 667 838 L 689 859 L 686 866 L 662 865 L 651 859 L 653 871 L 646 879 L 634 874 L 647 895 L 640 931 L 670 977 L 683 983 L 678 1013 L 729 1064 L 791 1105 L 805 1108 L 832 1135 L 872 1163 L 885 1162 L 923 1200 L 962 1217 L 993 1223 L 1014 1247 L 1052 1262 L 1084 1266 L 1119 1295 L 1167 1314 L 1177 1313 L 1187 1321 L 1232 1329 L 1273 1345 L 1290 1340 L 1298 1349 L 1389 1379 L 1410 1370 L 1425 1383 L 1448 1384 L 1510 1401 L 1525 1398 L 1535 1407 L 1554 1409 L 1581 1423 L 1610 1417 L 1625 1423 L 1647 1419 L 1668 1423 L 1685 1410 L 1706 1407 L 1721 1399 L 1759 1364 L 1762 1354 L 1758 1348 L 1706 1322 L 1694 1333 L 1663 1324 L 1650 1312 L 1675 1295 L 1665 1277 L 1669 1271 L 1701 1270 L 1727 1285 L 1735 1283 L 1750 1264 L 1744 1244 L 1748 1240 L 1778 1268 L 1778 1284 L 1798 1296 L 1798 1310 L 1814 1340 L 1823 1343 L 1834 1333 L 1832 1315 L 1841 1291 L 1829 1274 L 1840 1258 L 1822 1241 L 1822 1233 L 1832 1227 L 1841 1237 L 1851 1239 L 1855 1222 L 1878 1234 L 1900 1220 L 1899 1214 L 1874 1193 L 1886 1182 L 1881 1169 L 1869 1162 L 1852 1161 L 1844 1154 L 1883 1121 L 1909 1106 L 1909 1099 L 1899 1088 L 1915 1077 L 1912 1068 L 1847 1013 L 1785 975 L 1773 975 L 1716 935 L 1701 928 L 1691 930 L 1678 921 L 1662 928 L 1646 912 L 1630 910 L 1619 900 L 1611 902 L 1619 908 L 1615 916 L 1605 908 L 1601 913 L 1610 925 L 1604 933 L 1573 933 L 1569 929 L 1583 913 L 1588 880 L 1579 877 L 1560 885 L 1556 881 L 1559 872 L 1524 831 L 1478 807 L 1454 821 L 1443 807 L 1464 785 L 1457 779 L 1459 772 L 1...[truncated]"
            fill="url(#goldGrad)"
            filter="url(#glow)"
          />
          <path
            d="M 56 143 L 61 159 L 76 172 L 83 167 L 87 171 L 83 177 L 95 186 L 85 208 L 93 226 L 82 235 L 89 254 L 84 263 L 85 275 L 78 283 L 80 294 L 114 317 L 158 314 L 179 325 L 202 329 L 207 343 L 250 384 L 268 381 L 310 388 L 336 398 L 404 408 L 423 418 L 443 415 L 460 422 L 518 409 L 530 398 L 588 399 L 645 367 L 655 354 L 714 360 L 738 344 L 761 344 L 795 327 L 792 294 L 747 262 L 736 245 L 719 231 L 701 230 L 682 212 L 677 194 L 645 184 L 636 186 L 626 177 L 593 166 L 597 175 L 613 178 L 625 186 L 609 198 L 603 186 L 595 186 L 588 178 L 561 166 L 563 153 L 556 159 L 547 151 L 526 153 L 515 139 L 519 160 L 512 163 L 440 122 L 448 115 L 484 131 L 496 141 L 502 134 L 447 111 L 434 116 L 399 87 L 360 71 L 317 67 L 261 74 L 246 70 L 236 76 L 226 74 L 170 86 L 131 107 L 71 112 L 63 120 Z"
            fill="url(#goldGrad)"
            filter="url(#glow)"
          />
        </g>

        {withText && (
          <g>
            <text
              x="1036"
              y="1350"
              fontFamily="serif"
              fontSize="120"
              fontWeight="bold"
              fill="url(#goldGrad)"
              textAnchor="middle"
              filter="url(#glow)"
              className={animated ? 'animate-bounce' : ''}
            >
              CHRISTIANO
            </text>
            <text
              x="1036"
              y="1420"
              fontFamily="sans-serif"
              fontSize="60"
              fill="#ffffff"
              textAnchor="middle"
              opacity="0.8"
            >
              Property Management
            </text>
          </g>
        )}
      </svg>

      {mirrored && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={width}
          height={height}
          viewBox="0 0 2072 1480"
          className={`absolute inset-0 ${animated ? 'animate-pulse' : ''}`}
          style={{ transform: 'scaleX(-1)', opacity: 0.3 }}
        >
          <defs>
            <linearGradient id="goldGradMirror" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f7d77a"/>
              <stop offset="45%" stopColor="#d4af37"/>
              <stop offset="100%" stopColor="#b8860b"/>
            </linearGradient>
          </defs>
          <g>
            <path
              d="M 612 529 L 600 553 L 614 544 L 618 548 L 618 560 L 613 565 L 601 559 L 619 584 L 646 584 L 662 592 L 673 592 L 680 610 L 688 594 L 699 608 L 701 595 L 705 591 L 710 596 L 706 601 L 708 621 L 703 627 L 703 640 L 697 644 L 679 631 L 695 651 L 687 662 L 695 662 L 698 670 L 686 682 L 676 675 L 668 686 L 656 685 L 645 691 L 653 699 L 647 708 L 635 700 L 636 695 L 633 697 L 657 729 L 672 732 L 708 759 L 699 768 L 699 777 L 704 785 L 713 786 L 718 796 L 714 810 L 688 798 L 675 799 L 663 809 L 674 826 L 667 838 L 689 859 L 686 866 L 662 865 L 651 859 L 653 871 L 646 879 L 634 874 L 647 895 L 640 931 L 670 977 L 683 983 L 678 1013 L 729 1064 L 791 1105 L 805 1108 L 832 1135 L 872 1163 L 885 1162 L 923 1200 L 962 1217 L 993 1223 L 1014 1247 L 1052 1262 L 1084 1266 L 1119 1295 L 1167 1314 L 1177 1313 L 1187 1321 L 1232 1329 L 1273 1345 L 1290 1340 L 1298 1349 L 1389 1379 L 1410 1370 L 1425 1383 L 1448 1384 L 1510 1401 L 1525 1398 L 1535 1407 L 1554 1409 L 1581 1423 L 1610 1417 L 1625 1423 L 1647 1419 L 1668 1423 L 1685 1410 L 1706 1407 L 1721 1399 L 1759 1364 L 1762 1354 L 1758 1348 L 1706 1322 L 1694 1333 L 1663 1324 L 1650 1312 L 1675 1295 L 1665 1277 L 1669 1271 L 1701 1270 L 1727 1285 L 1735 1283 L 1750 1264 L 1744 1244 L 1748 1240 L 1778 1268 L 1778 1284 L 1798 1296 L 1798 1310 L 1814 1340 L 1823 1343 L 1834 1333 L 1832 1315 L 1841 1291 L 1829 1274 L 1840 1258 L 1822 1241 L 1822 1233 L 1832 1227 L 1841 1237 L 1851 1239 L 1855 1222 L 1878 1234 L 1900 1220 L 1899 1214 L 1874 1193 L 1886 1182 L 1881 1169 L 1869 1162 L 1852 1161 L 1844 1154 L 1883 1121 L 1909 1106 L 1909 1099 L 1899 1088 L 1915 1077 L 1912 1068 L 1847 1013 L 1785 975 L 1773 975 L 1716 935 L 1701 928 L 1691 930 L 1678 921 L 1662 928 L 1646 912 L 1630 910 L 1619 900 L 1611 902 L 1619 908 L 1615 916 L 1605 908 L 1601 913 L 1610 925 L 1604 933 L 1573 933 L 1569 929 L 1583 913 L 1588 880 L 1579 877 L 1560 885 L 1556 881 L 1559 872 L 1524 831 L 1478 807 L 1454 821 L 1443 807 L 1464 785 L 1457 779 L 1459 772 L 1...[truncated]"
              fill="url(#goldGradMirror)"
              opacity="0.5"
            />
            <path
              d="M 56 143 L 61 159 L 76 172 L 83 167 L 87 171 L 83 177 L 95 186 L 85 208 L 93 226 L 82 235 L 89 254 L 84 263 L 85 275 L 78 283 L 80 294 L 114 317 L 158 314 L 179 325 L 202 329 L 207 343 L 250 384 L 268 381 L 310 388 L 336 398 L 404 408 L 423 418 L 443 415 L 460 422 L 518 409 L 530 398 L 588 399 L 645 367 L 655 354 L 714 360 L 738 344 L 761 344 L 795 327 L 792 294 L 747 262 L 736 245 L 719 231 L 701 230 L 682 212 L 677 194 L 645 184 L 636 186 L 626 177 L 593 166 L 597 175 L 613 178 L 625 186 L 609 198 L 603 186 L 595 186 L 588 178 L 561 166 L 563 153 L 556 159 L 547 151 L 526 153 L 515 139 L 519 160 L 512 163 L 440 122 L 448 115 L 484 131 L 496 141 L 502 134 L 447 111 L 434 116 L 399 87 L 360 71 L 317 67 L 261 74 L 246 70 L 236 76 L 226 74 L 170 86 L 131 107 L 71 112 L 63 120 Z"
              fill="url(#goldGradMirror)"
              opacity="0.5"
            />
          </g>
        </svg>
      )}
    </div>
  );
};

export default MaltaLogo;
