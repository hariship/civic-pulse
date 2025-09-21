# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Architecture

This is a **Civic Pulse** application - a real-time civic intelligence system that displays authentic government data for Bangalore, India through an interactive map interface. The system prioritizes data transparency, source attribution, and real government API integration over hardcoded values.

### Two-Tier Architecture

**Backend (FastAPI)**:
- `main_fixed.py` - Production server with real government API integration
- `scrapers/real_bangalore_apis.py` - Core data orchestration layer
- `scrapers/real_govt_apis.py` - Individual government API implementations
- Background data collection every 15 minutes with caching

**Frontend (Next.js + TypeScript)**:
- `src/pages/indexFixed.tsx` - Main application interface
- `src/components/CivicMap.tsx` - Geographic visualization component
- Real-time data display with comprehensive source transparency

### Data Flow & Integration Strategy

The application follows a **Real API First** approach:

1. **Air Quality**: Real-time from WAQI (World Air Quality Index) stations in Bangalore
2. **Transport**: BMTC/BMRCL government APIs for bus routes and metro connectivity
3. **Water Quality**: CPCB/BWSSB monitoring stations for real-time water quality
4. **Crime/Safety**: Karnataka State Police FIR database integration
5. **Infrastructure**: BESCOM/BWSSB utility APIs (requires partnerships)

Each data source includes complete methodology transparency and source attribution.

## Development Commands

### Backend Development

```bash
# Setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run production server (recommended)
uvicorn main_fixed:app --reload --port 8000

# Alternative servers for testing
uvicorn main:app --reload --port 8000          # Legacy version
uvicorn main_real:app --reload --port 8000     # Development version
```

### Frontend Development

```bash
# Setup
cd frontend
npm install

# Development server
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

### Full Stack Development

The application expects:
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:3001`
- CORS configured for cross-origin requests

## Key Implementation Principles

### Data Authenticity Requirements

1. **No Hardcoded Values**: All civic data must come from real APIs or be clearly marked as sample data
2. **Source Attribution**: Every data point requires complete source information
3. **Methodology Transparency**: Clear explanation of how metrics are calculated
4. **Update Timestamps**: All data includes last update times
5. **Real-time Status**: Clear indicators distinguishing real-time vs sample data

### Government API Integration Pattern

When adding new government APIs:

1. Add endpoint configuration in `RealGovernmentAPIs.__init__()`
2. Implement data fetching method with proper error handling
3. Include methodology documentation and source attribution
4. Add transparency indicators (real-time vs sample)
5. Update frontend to display source information

### Safety/Crime Data Requirements

Safety scores must include detailed methodology explaining:
- FIR data analysis components
- Crime rate calculations (per 1000 residents)
- Police patrol frequency factors
- Response time considerations
- Recent incident tracking with case numbers

## Critical Architecture Notes

### Server Selection

- **Use `main_fixed.py` for all development** - this is the production server with complete government API integration
- Other `main_*.py` files are legacy/experimental versions
- The `real_bangalore_apis.py` orchestrates all data sources
- Background collection runs automatically every 15 minutes

### Frontend Data Transparency

The UI emphasizes complete source transparency:
- Expandable methodology panels explaining data calculations
- Source badges for each data type (Real-time, Police, CPCB, etc.)
- Detailed area sidebars showing source attribution
- Recent incident tracking with actual FIR numbers

### API Endpoint Structure

Core endpoints (all prefixed with `/api/bangalore/`):
- `/map-data` - GeoJSON formatted for map visualization
- `/area/{area_name}` - Detailed data for specific areas
- `/sources` - Complete transparency about data sources
- `/refresh` - Manual data refresh trigger

## Development Workflow

1. **Backend First**: Always verify backend data structure before frontend changes
2. **Source Transparency**: Every new data point must include source attribution
3. **Real Data**: Prioritize real government APIs over sample data
4. **Error Handling**: Government APIs can be unreliable - include proper fallbacks
5. **User Trust**: The application's core value is data authenticity and transparency

## Testing Real APIs

To test government API integrations:

```bash
# Test main map data endpoint
curl http://localhost:8000/api/bangalore/map-data | python3 -m json.tool

# Test specific area data
curl "http://localhost:8000/api/bangalore/area/Electronic%20City" | python3 -m json.tool

# Test data sources transparency
curl http://localhost:8000/api/bangalore/sources | python3 -m json.tool
```

The system is designed to provide citizens with trustworthy, transparent civic information by integrating directly with official government data sources rather than relying on estimates or hardcoded values.

## Mobile Responsive Design

The application is fully optimized for mobile devices with the following responsive design patterns:

### Global CSS Settings
- `width: 100%` (not 100vw) to prevent horizontal overflow
- `overflow-x: auto` for proper scrolling behavior
- `.scrollbar-hide` utility for clean horizontal scrolling

### Mobile-First Responsive Breakpoints
```css
Mobile: default styles (320px+)
sm: 640px+
md: 768px+
lg: 1024px+
xl: 1280px+
```

### Component-Specific Mobile Optimizations

**CivicMap Legend (`src/components/CivicMap.tsx`)**:
- Mobile: `text-[8px]`, `w-2 h-2` dots, `space-x-1`, `p-1.5`, `max-w-[45%]`
- Desktop: `text-xs`, `w-3 h-3` dots, `space-x-2`, `p-4`, no width limit

**Map Container (`src/pages/index.tsx`)**:
- Mobile: `min-h-[450px]` with `pb-12` bottom padding
- Desktop: `min-h-[500px]` with `pb-8` bottom padding

**Data Layer Buttons**:
- Horizontal scrolling: `overflow-x-auto scrollbar-hide`
- Mobile padding: `px-3` vs desktop `px-4`

**Pagination (`src/components/ui/Pagination.tsx`)**:
- Bottom padding: `pb-4 sm:pb-8 lg:pb-4`
- Margin spacing: `mb-6 sm:mb-4`

### Mobile Testing Checklist
- [ ] Map legend is readable and properly sized
- [ ] Horizontal scrolling works for data layer buttons
- [ ] Bottom padding allows full content visibility
- [ ] Pagination is accessible on both mobile and desktop
- [ ] No horizontal overflow on any screen size