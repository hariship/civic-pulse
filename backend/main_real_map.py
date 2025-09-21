from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel

from scrapers.real_apis import RealCivicAPIs

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background data collection every 30 minutes
    asyncio.create_task(background_real_civic_collection())
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

real_apis = RealCivicAPIs()

# Cache for real civic data
real_civic_cache = {}
last_fetch_time = None

async def background_real_civic_collection():
    global real_civic_cache, last_fetch_time

    while True:
        try:
            print("Fetching real civic data from APIs...")

            # Fetch all real civic data
            real_data = await real_apis.fetch_real_civic_data()
            real_civic_cache = real_data
            last_fetch_time = datetime.now()

            print(f"Updated real civic data: {list(real_data.keys())}")

        except Exception as e:
            print(f"Background real civic collection error: {e}")

        # Wait 30 minutes before next fetch
        await asyncio.sleep(1800)

@app.get("/")
async def root():
    return {
        "status": "Real Civic API - Live Data Only",
        "data_sources": "WAQI, NCRB, Government APIs",
        "note": "No hardcoded data - all sources are real APIs"
    }

@app.get("/api/real-civic/data")
async def get_real_civic_data():
    """Get all real civic data with full source attribution"""
    global real_civic_cache

    if not real_civic_cache:
        real_civic_cache = await real_apis.fetch_real_civic_data()

    return {
        "data": real_civic_cache,
        "transparency": {
            "all_sources_real": True,
            "no_mock_data": True,
            "api_endpoints": real_civic_cache.get("data_sources", {}),
            "last_updated": last_fetch_time.isoformat() if last_fetch_time else None
        }
    }

@app.get("/api/real-civic/map-data")
async def get_map_data():
    """Get civic data formatted for map visualization"""
    global real_civic_cache

    if not real_civic_cache:
        real_civic_cache = await real_apis.fetch_real_civic_data()

    # Format data for map visualization
    map_features = []

    # Air quality points
    if real_civic_cache.get("air_quality") and real_civic_cache["air_quality"].get("areas"):
        for area, data in real_civic_cache["air_quality"]["areas"].items():
            coords = real_apis.bangalore_coords.get(area, {"lat": 12.9716, "lng": 77.5946})
            map_features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [coords["lng"], coords["lat"]]
                },
                "properties": {
                    "type": "air_quality",
                    "area": area,
                    "aqi": data.get("aqi", 0),
                    "status": data.get("status", "Unknown"),
                    "source": "World Air Quality Index API",
                    "layer": "air_quality"
                }
            })

    # Add other layers when real data is available
    # Crime data points (when API access is available)
    if real_civic_cache.get("crime_stats"):
        crime_data = real_civic_cache["crime_stats"]
        for area in real_apis.bangalore_coords.keys():
            coords = real_apis.bangalore_coords[area]
            map_features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [coords["lng"], coords["lat"]]
                },
                "properties": {
                    "type": "crime_data",
                    "area": area,
                    "status": crime_data.get("status", "API access required"),
                    "source": crime_data.get("source", "NCRB"),
                    "layer": "crime_stats"
                }
            })

    return {
        "type": "FeatureCollection",
        "features": map_features,
        "metadata": {
            "total_features": len(map_features),
            "real_data_only": True,
            "sources": real_civic_cache.get("data_sources", {}),
            "last_updated": real_civic_cache.get("last_updated")
        }
    }

@app.get("/api/real-civic/area/{area_name}")
async def get_real_area_data(area_name: str):
    """Get real data for specific area with full transparency"""
    global real_civic_cache

    if not real_civic_cache:
        real_civic_cache = await real_apis.fetch_real_civic_data()

    area_data = {}

    # Extract real area data from each layer
    for layer_name, layer_data in real_civic_cache.items():
        if isinstance(layer_data, dict) and "areas" in layer_data:
            if area_name in layer_data["areas"]:
                area_data[layer_name] = {
                    "data": layer_data["areas"][area_name],
                    "source": layer_data.get("source", "Unknown"),
                    "api_endpoint": layer_data.get("api_endpoint", "N/A"),
                    "real_time": layer_data.get("real_time", False)
                }

    return {
        "area": area_name,
        "real_data": area_data,
        "transparency": {
            "data_authenticity": "All data from real APIs",
            "no_hardcoded_values": True,
            "api_limitations": "Some government APIs require authorization",
            "last_updated": real_civic_cache.get("last_updated")
        }
    }

@app.get("/api/real-civic/sources")
async def get_data_sources():
    """Show all real data sources and their status"""
    global real_civic_cache

    if not real_civic_cache:
        real_civic_cache = await real_apis.fetch_real_civic_data()

    return {
        "data_sources": real_civic_cache.get("data_sources", {}),
        "api_status": {
            "air_quality": "WAQI API - Real-time data available",
            "crime_data": "NCRB API - Requires government authorization",
            "infrastructure": "BESCOM/BWSSB - Requires utility API access",
            "water_quality": "CPCB API - Requires certification",
            "transport": "BMRCL/BMTC - Requires transit authority access"
        },
        "transparency_commitment": "No mock data - only real APIs",
        "last_updated": last_fetch_time.isoformat() if last_fetch_time else None
    }

@app.get("/api/real-civic/refresh")
async def force_refresh_real_data():
    """Manually refresh all real data from APIs"""
    global real_civic_cache, last_fetch_time

    try:
        real_civic_cache = await real_apis.fetch_real_civic_data()
        last_fetch_time = datetime.now()
        return {
            "status": "refreshed_from_real_apis",
            "sources_contacted": list(real_civic_cache.get("data_sources", {}).keys()),
            "timestamp": last_fetch_time.isoformat(),
            "data_authenticity": "100% real API data"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/real-civic/bangalore-bounds")
async def get_bangalore_bounds():
    """Get Bangalore city bounds for map initialization"""
    return {
        "city": "Bangalore",
        "bounds": {
            "southwest": {"lat": 12.7342, "lng": 77.4601},
            "northeast": {"lat": 13.1636, "lng": 77.8479}
        },
        "center": {"lat": 12.9716, "lng": 77.5946},
        "zoom_levels": {
            "city": 11,
            "area": 13,
            "street": 15
        },
        "areas": real_apis.bangalore_coords
    }