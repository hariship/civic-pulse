from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel

from scrapers.real_data_sources import RealDataCollector
from database.models import init_db
from services.data_processor import DataProcessor

class IssueResponse(BaseModel):
    id: str
    type: str
    category: str
    title: str
    location: dict
    severity: str
    progress: float
    trend: str
    age_days: int
    update_count: int
    status: str
    last_updated: str
    metadata: Optional[dict] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    # Start background data collection every hour
    asyncio.create_task(background_real_data_collection())
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

real_collector = RealDataCollector()
data_processor = DataProcessor()

# Cache for real data (refresh every hour)
cached_issues = []
last_fetch_time = None

async def background_real_data_collection():
    global cached_issues, last_fetch_time

    while True:
        try:
            print("Fetching real data from sources...")

            # Fetch real Bangalore issues
            real_issues = await real_collector.fetch_real_bangalore_issues()

            # Process and cache
            cached_issues = real_issues
            last_fetch_time = datetime.now()

            print(f"Collected {len(real_issues)} real issues")

            # Store in database
            await data_processor.store_processed_data(real_issues)

        except Exception as e:
            print(f"Background collection error: {e}")

        # Wait 1 hour before next fetch
        await asyncio.sleep(3600)

@app.get("/")
async def root():
    return {"status": "Civic Pulse API - Real Data", "sources": "News RSS, Government Tenders, Court Cases"}

@app.get("/api/issues/map")
async def get_real_map_data(
    level: str = "city",
    location_id: Optional[str] = None
):
    global cached_issues

    # If no cached data, fetch immediately
    if not cached_issues:
        cached_issues = await real_collector.fetch_real_bangalore_issues()

    # Filter for Bangalore if specified
    filtered_issues = cached_issues
    if location_id and location_id.lower() == 'bangalore':
        filtered_issues = [issue for issue in cached_issues if 'bangalore' in issue['location']['name'].lower()]

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [issue["location"]["lng"], issue["location"]["lat"]]
                },
                "properties": {
                    "id": issue["id"],
                    "type": issue["type"],
                    "category": issue["category"],
                    "title": issue["title"],
                    "severity": issue["severity"],
                    "progress": issue["progress"],
                    "trend": issue["trend"],
                    "age_days": issue["age_days"],
                    "update_count": issue.get("update_count", 1),
                    "status": issue["status"],
                    "last_updated": issue["last_updated"],
                    "metadata": issue.get("metadata", {})
                }
            }
            for issue in filtered_issues
        ]
    }

@app.get("/api/issues/bangalore")
async def get_bangalore_issues():
    """Get all current Bangalore issues"""
    global cached_issues

    if not cached_issues:
        cached_issues = await real_collector.fetch_real_bangalore_issues()

    return {
        "issues": cached_issues,
        "total": len(cached_issues),
        "last_updated": last_fetch_time.isoformat() if last_fetch_time else None,
        "sources": {
            "news": "The Hindu, Deccan Herald, Times of India",
            "government": "BBMP Tenders, Karnataka Government",
            "legal": "Karnataka High Court"
        }
    }

@app.get("/api/issues/sectors")
async def get_sector_breakdown():
    """Get issues grouped by sector"""
    global cached_issues

    if not cached_issues:
        cached_issues = await real_collector.fetch_real_bangalore_issues()

    sectors = {}
    for issue in cached_issues:
        sector = issue["category"]
        if sector not in sectors:
            sectors[sector] = []
        sectors[sector].append(issue)

    sector_summary = {}
    for sector, issues in sectors.items():
        sector_summary[sector] = {
            "count": len(issues),
            "active": len([i for i in issues if i["trend"] == "active"]),
            "avg_progress": sum(i["progress"] for i in issues) / len(issues) if issues else 0,
            "latest_update": max(i["last_updated"] for i in issues) if issues else None
        }

    return sector_summary

@app.get("/api/refresh")
async def force_refresh():
    """Manually refresh data from sources"""
    global cached_issues, last_fetch_time

    try:
        cached_issues = await real_collector.fetch_real_bangalore_issues()
        last_fetch_time = datetime.now()
        return {
            "status": "refreshed",
            "issues_count": len(cached_issues),
            "timestamp": last_fetch_time.isoformat()
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/sources")
async def get_data_sources():
    """Show all data sources being used"""
    return {
        "news_sources": real_collector.news_sources,
        "government_sources": real_collector.govt_sources,
        "last_fetch": last_fetch_time.isoformat() if last_fetch_time else "Never",
        "refresh_interval": "1 hour"
    }