# Civic Pulse

Real-time civic data platform for Bangalore, India. Displays authentic government data through an interactive map interface with emphasis on data transparency and source attribution.

## Features

- **Real-time Air Quality Data** - Live data from WAQI stations across Bangalore
- **Interactive Map Visualization** - Geographic display of civic metrics by area
- **Mobile-Responsive Design** - Optimized for all device sizes
- **Dark/Light Theme** - User preference with system detection
- **Data Transparency** - Complete source attribution and methodology
- **Real Government APIs** - Direct integration with official data sources

## Tech Stack

### Frontend
- **Next.js 15.5.3** with TypeScript
- **Tailwind CSS** for styling
- **React Context** for theme management
- **Responsive design** with mobile-first approach

### Backend
- **FastAPI** with Python 3.10+
- **Real-time data collection** every 15 minutes
- **Government API integrations** (WAQI, CPCB, etc.)
- **Caching layer** for performance
- **GeoJSON** for map data

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hariship/civic-pulse.git
   cd civic-pulse
   ```

2. **Setup Backend**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Development

1. **Start Backend Server**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main_fixed:app --reload --port 8000
   ```

2. **Start Frontend Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## Data Sources

- **Air Quality**: World Air Quality Index (WAQI) - Real-time data from verified stations
- **Other Metrics**: Sample data (requires government API partnerships)

## Architecture

### Real API First Approach
The application prioritizes authentic government data over hardcoded values:

1. **Air Quality**: Real-time from WAQI stations in Bangalore
2. **Transport**: BMTC/BMRCL APIs (sample data currently)
3. **Water Quality**: CPCB/BWSSB monitoring (sample data currently)
4. **Crime/Safety**: Karnataka Police APIs (sample data currently)
5. **Infrastructure**: BESCOM/BWSSB utilities (sample data currently)

### Mobile Responsive Design
- **Breakpoints**: Mobile-first with sm: (640px+), md: (768px+), lg: (1024px+)
- **Map Legend**: Compact mobile layout with smaller text and icons
- **Navigation**: Horizontal scrolling for data layer buttons
- **Optimized Touch**: Larger touch targets and proper spacing

## API Endpoints

- `GET /api/bangalore/map-data` - GeoJSON data for map visualization
- `GET /api/bangalore/area/{area_name}` - Detailed area information
- `GET /api/bangalore/real-data` - Real-time civic metrics
- `GET /api/bangalore/sources` - Data source transparency

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Commands

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint check
```

### Backend
```bash
uvicorn main_fixed:app --reload --port 8000  # Development server
python -m pytest                             # Run tests (if available)
```

## Data Transparency

This platform emphasizes complete transparency about data sources and methodologies. Each metric includes:
- Source attribution
- Collection methodology
- Update frequency
- Quality indicators
- Sample vs. real-time status

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- World Air Quality Index (WAQI) for real-time air quality data
- Government of Karnataka for public data initiatives
- Open source community for the tools and libraries used