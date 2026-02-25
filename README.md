# Christiano Vincenti Property Management

## Project Overview

**Christiano Vincenti Property Management** - Malta's premier luxury property management platform. Full-service short-let management across Malta & Gozo with modern React-based booking system.

**Live Site**: https://christiano-vincenti.com

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Radix UI components
- **Styling**: TailwindCSS with luxury design system
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **API Integration**: Guesty Booking Engine & Open API
- **Deployment**: Vercel

## Key Features

- Property listing and search functionality
- Real-time availability calendar
- Online booking and payment processing
- Owner dashboard with analytics
- Multi-language support (English/Italian)
- Responsive design with luxury aesthetics
- Cookie consent compliance
- SEO optimization

## Getting Started

### Prerequisites

- Node.js 18+
- npm or Bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/CerisonAutomation/C-vincenti-brand-logo.git
cd C-vincenti-brand-logo

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun run dev
```

### Environment Setup

Create a `.env` file with:

```env
VITE_SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_key"
VITE_SUPABASE_PROJECT_ID="your_project_id"
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Architecture

### Performance Optimizations

- **Code Splitting**: Lazy loading for non-critical routes
- **Bundle Optimization**: Manual chunks for vendor libraries
- **Image Optimization**: WebP conversion and lazy loading
- **Caching**: Service Worker and HTTP caching strategies

### Key Components

- **Navbar**: Main navigation with booking wizard trigger
- **Hero**: Landing section with property search
- **PropertyGrid**: Property listings with filtering
- **BookingFlow**: Multi-step checkout process
- **OwnerPortal**: Dashboard for property owners

### API Integration

The application integrates with Guesty's APIs through Supabase Edge Functions:

- **Booking Engine API**: Property search, availability, quotes
- **Open API**: Reservation management, admin functions

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Set environment variables
3. Deploy automatically on push to main

### Manual Build

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## Development Guidelines

### Code Style

- TypeScript strict mode enabled
- ESLint + React hooks rules
- Prettier for formatting
- Component-driven architecture

### Performance Budget

- Initial JS: < 150KB
- Total JS: < 500KB
- LCP: < 2.5s
- FID: < 100ms

## Support

For support or inquiries:

- Email: info@christiano-vincenti.com
- Phone: +356 1234 5678

## License

© 2024 Christiano Vincenti Property Management. All rights reserved.
