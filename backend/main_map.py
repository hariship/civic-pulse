from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel

from scrapers.civic_apis import CivicDataAPIs

class CivicLayer(BaseModel):
    name: str
    type: str
    data: dict
    last_updated: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background data collection every 30 minutes
    asyncio.create_task(background_civic_data_collection())
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

civic_apis = CivicDataAPIs()

# Cache for civic layers
civic_cache = {}
last_fetch_time = None

async def background_civic_data_collection():
    global civic_cache, last_fetch_time

    while True:
        try:
            print("Fetching civic data layers...")

            # Fetch all civic data layers
            civic_data = await civic_apis.fetch_bangalore_civic_layers()
            civic_cache = civic_data
            last_fetch_time = datetime.now()

            print(f"Updated civic layers: {list(civic_data.keys())}")

        except Exception as e:
            print(f"Background civic collection error: {e}")

        # Wait 30 minutes before next fetch
        await asyncio.sleep(1800)

@app.get("/")
async def root():
    return {
        "status": "Civic Map API - Location-based Civic Intelligence",
        "layers": ["air_quality", "crime_stats", "infrastructure", "water_quality", "transport"]
    }

@app.get("/api/civic/layers")
async def get_civic_layers():
    """Get all available civic data layers for Bangalore"""
    global civic_cache

    if not civic_cache:
        civic_cache = await civic_apis.fetch_bangalore_civic_layers()

    return {
        "layers": civic_cache,
        "areas": [
            "Electronic City",
            "Whitefield",
            "Koramangala",
            "Indiranagar",
            "Jayanagar",
            "Hebbal"
        ],
        "last_updated": last_fetch_time.isoformat() if last_fetch_time else None
    }

@app.get("/api/civic/area/{area_name}")
async def get_area_details(area_name: str):
    """Get all civic data for a specific area"""
    global civic_cache

    if not civic_cache:
        civic_cache = await civic_apis.fetch_bangalore_civic_layers()

    area_data = {}

    for layer_name, layer_data in civic_cache.items():
        if isinstance(layer_data, dict) and "areas" in layer_data:
            if area_name in layer_data["areas"]:
                area_data[layer_name] = layer_data["areas"][area_name]

    return {
        "area": area_name,
        "data": area_data,
        "last_updated": civic_cache.get("last_updated")
    }

@app.get("/api/civic/layer/{layer_name}")
async def get_layer_data(layer_name: str):
    """Get data for a specific civic layer"""
    global civic_cache

    if not civic_cache:
        civic_cache = await civic_apis.fetch_bangalore_civic_layers()

    if layer_name in civic_cache:
        return {
            "layer": layer_name,
            "data": civic_cache[layer_name],
            "last_updated": civic_cache.get("last_updated")
        }

    return {"error": f"Layer {layer_name} not found"}

@app.get("/api/civic/overview")
async def get_civic_overview():
    """Get city-wide overview of all civic indicators"""
    global civic_cache

    if not civic_cache:
        civic_cache = await civic_apis.fetch_bangalore_civic_layers()

    overview = {}

    # Air Quality Summary
    if "air_quality" in civic_cache:
        aq = civic_cache["air_quality"]
        overview["air_quality"] = {
            "city_aqi": aq.get("current_aqi", 0),
            "status": aq.get("status", "Unknown"),
            "worst_area": max(aq.get("areas", {}).items(), key=lambda x: x[1]["aqi"])[0] if aq.get("areas") else None
        }

    # Crime Summary
    if "crime_stats" in civic_cache:
        crime = civic_cache["crime_stats"]
        overview["safety"] = {
            "total_cases": crime.get("total_cases_this_month", 0),
            "safest_area": max(crime.get("areas", {}).items(), key=lambda x: x[1]["safety_score"])[0] if crime.get("areas") else None
        }

    # Infrastructure Summary
    if "infrastructure" in civic_cache:
        infra = civic_cache["infrastructure"]
        overview["infrastructure"] = {
            "power_cuts": infra.get("power_cuts_today", 0),
            "water_issues": infra.get("water_supply_issues", 0),
            "road_closures": infra.get("road_closures", 0)
        }

    # Transport Summary
    if "transport" in civic_cache:
        transport = civic_cache["transport"]
        overview["transport"] = {
            "metro_status": transport.get("metro_status", "Unknown"),
            "bus_delays": transport.get("bus_delays", 0),
            "traffic_level": transport.get("traffic_congestion", "Unknown")
        }

    return {
        "city": "Bangalore",
        "overview": overview,
        "last_updated": civic_cache.get("last_updated")
    }

@app.get("/api/civic/alerts")
async def get_civic_alerts():
    """Get current civic alerts and issues requiring attention"""
    global civic_cache

    if not civic_cache:
        civic_cache = await civic_apis.fetch_bangalore_civic_layers()

    alerts = []

    # Check air quality alerts
    if "air_quality" in civic_cache:
        aq = civic_cache["air_quality"]
        if aq.get("current_aqi", 0) > 150:
            alerts.append({
                "type": "air_quality",
                "severity": "high",
                "message": f"Air quality unhealthy (AQI: {aq.get('current_aqi')})",
                "areas_affected": [area for area, data in aq.get("areas", {}).items() if data.get("aqi", 0) > 150]
            })

    # Check infrastructure alerts
    if "infrastructure" in civic_cache:
        infra = civic_cache["infrastructure"]
        if infra.get("power_cuts_today", 0) > 2:
            alerts.append({
                "type": "infrastructure",
                "severity": "medium",
                "message": f"{infra.get('power_cuts_today')} power cuts reported today",
                "areas_affected": []
            })

    # Check transport alerts
    if "transport" in civic_cache:
        transport = civic_cache["transport"]
        if transport.get("bus_delays", 0) > 10:
            alerts.append({
                "type": "transport",
                "severity": "medium",
                "message": f"{transport.get('bus_delays')} bus routes experiencing delays",
                "areas_affected": []
            })

    return {
        "alerts": alerts,
        "total": len(alerts),
        "last_updated": civic_cache.get("last_updated")
    }

@app.get("/api/civic/refresh")
async def force_refresh():
    """Manually refresh all civic data"""
    global civic_cache, last_fetch_time

    try:
        civic_cache = await civic_apis.fetch_bangalore_civic_layers()
        last_fetch_time = datetime.now()
        return {
            "status": "refreshed",
            "layers": list(civic_cache.keys()),
            "timestamp": last_fetch_time.isoformat()
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}