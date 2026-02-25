/**
 * Design System - Visual Guidelines & Design Tokens
 * Luxury Property Management Platform
 *
 * This file defines the complete visual identity, design tokens,
 * and guidelines for consistent UI implementation.
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Neutral Grays
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Luxury Golds & Accents
  gold: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308', // Main gold
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },

  // Status Colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    700: '#15803d',
  },

  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    700: '#b45309',
  },

  error: {
    50: '#fef2f2',
    500: '#ef4444',
    700: '#b91c1c',
  },

  // Semantic Colors
  background: '#ffffff',
  foreground: '#171717',
  muted: '#f5f5f5',
  mutedForeground: '#737373',
  border: '#e5e5e5',
  input: '#ffffff',
  ring: '#0ea5e9',
} as const;

// =============================================================================
// TYPOGRAPHY SYSTEM
// =============================================================================

export const typography = {
  // Font Families
  fonts: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    serif: ['Playfair Display', 'Georgia', 'serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },

  // Font Sizes (responsive scale)
  sizes: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px
    '8xl': ['6rem', { lineHeight: '1' }],         // 96px
    '9xl': ['8rem', { lineHeight: '1' }],         // 128px
  },

  // Font Weights
  weights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// =============================================================================
// SPACING SYSTEM
// =============================================================================

export const spacing = {
  // Base spacing scale (4px increments)
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
} as const;

// =============================================================================
// BORDER RADIUS SYSTEM
// =============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  base: '0.25rem',   // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
} as const;

// =============================================================================
// SHADOW SYSTEM
// =============================================================================

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
} as const;

// =============================================================================
// ANIMATION SYSTEM
// =============================================================================

export const animations = {
  // Durations
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Keyframe animations
  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    slideUp: {
      from: { transform: 'translateY(1rem)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    slideDown: {
      from: { transform: 'translateY(-1rem)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    scaleIn: {
      from: { transform: 'scale(0.95)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    },
  },
} as const;

// =============================================================================
// BREAKPOINT SYSTEM
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  60: '60',
  70: '70',
  80: '80',
  90: '90',
  100: '100',
} as const;

// =============================================================================
// COMPONENT VARIANTS
// =============================================================================

export const componentVariants = {
  button: {
    sizes: {
      sm: {
        height: '2rem',      // 32px
        paddingX: '0.75rem', // 12px
        fontSize: '0.875rem', // 14px
      },
      md: {
        height: '2.5rem',    // 40px
        paddingX: '1rem',    // 16px
        fontSize: '1rem',    // 16px
      },
      lg: {
        height: '3rem',      // 48px
        paddingX: '1.5rem',  // 24px
        fontSize: '1.125rem', // 18px
      },
    },
    variants: {
      primary: {
        backgroundColor: colors.primary[500],
        color: 'white',
        hover: { backgroundColor: colors.primary[600] },
      },
      secondary: {
        backgroundColor: 'transparent',
        color: colors.neutral[900],
        border: `1px solid ${colors.neutral[300]}`,
        hover: { backgroundColor: colors.neutral[50] },
      },
      luxury: {
        backgroundColor: colors.gold[500],
        color: colors.neutral[900],
        hover: { backgroundColor: colors.gold[600] },
      },
    },
  },

  input: {
    base: {
      border: `1px solid ${colors.neutral[300]}`,
      borderRadius: borderRadius.md,
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.sizes.base[0],
      transition: `border-color ${animations.duration[200]} ${animations.easing.out}`,
    },
    focus: {
      borderColor: colors.primary[500],
      ring: `0 0 0 2px ${colors.primary[100]}`,
    },
    error: {
      borderColor: colors.error[500],
    },
  },

  card: {
    base: {
      backgroundColor: 'white',
      borderRadius: borderRadius.lg,
      boxShadow: shadows.md,
      padding: spacing[6],
    },
    elevated: {
      boxShadow: shadows.lg,
    },
    luxury: {
      border: `1px solid ${colors.gold[200]}`,
      boxShadow: `${shadows.md}, 0 0 20px ${colors.gold[100]}`,
    },
  },
} as const;

// =============================================================================
// VISUAL HIERARCHY GUIDELINES
// =============================================================================

export const visualHierarchy = {
  // Page layouts
  layouts: {
    container: {
      maxWidth: '1280px',
      paddingX: spacing[4],
    },
    section: {
      paddingY: spacing[16],
    },
    hero: {
      minHeight: '80vh',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },

  // Content spacing
  content: {
    paragraph: {
      marginBottom: spacing[6],
      maxWidth: '65ch', // Optimal reading width
    },
    heading: {
      marginBottom: spacing[4],
    },
    list: {
      marginBottom: spacing[4],
      paddingLeft: spacing[6],
    },
  },

  // Grid systems
  grid: {
    columns: 12,
    gap: spacing[6],
    breakpoints: {
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4,
    },
  },
} as const;

// =============================================================================
// ACCESSIBILITY GUIDELINES
// =============================================================================

export const accessibility = {
  // Color contrast ratios (WCAG 2.1 AA)
  contrast: {
    normal: 4.5,
    large: 3.0,
  },

  // Focus indicators
  focus: {
    outline: `2px solid ${colors.primary[500]}`,
    outlineOffset: '2px',
    transition: `outline ${animations.duration[150]} ${animations.easing.out}`,
  },

  // Screen reader utilities
  sr: {
    only: {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    },
  },
} as const;

// =============================================================================
// ICON SYSTEM
// =============================================================================

export const icons = {
  // Icon sizes
  sizes: {
    xs: '0.75rem',  // 12px
    sm: '1rem',     // 16px
    md: '1.25rem',  // 20px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '2.5rem', // 40px
  },

  // Icon weights
  weights: {
    thin: 100,
    light: 200,
    regular: 300,
    medium: 400,
    semibold: 500,
    bold: 600,
    extrabold: 700,
  },
} as const;

// =============================================================================
// EXPORT DESIGN TOKENS
// =============================================================================

export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints,
  zIndex,
  componentVariants,
  visualHierarchy,
  accessibility,
  icons,
} as const;

export type DesignTokens = typeof designTokens;
