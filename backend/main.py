from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel
import json

from scrapers.news_scraper import NewsAggregator
from scrapers.civic_data import CivicDataCollector
from database.models import init_db
from services.data_processor import DataProcessor
from services.location_service import LocationService

class IssueStatus(BaseModel):
    id: str
    type: str
    location: dict
    severity: str
    progress: float
    trend: str
    last_updated: datetime
    age_days: int
    title: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    asyncio.create_task(background_data_collection())
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

news_aggregator = NewsAggregator()
civic_collector = CivicDataCollector()
data_processor = DataProcessor()
location_service = LocationService()

async def background_data_collection():
    while True:
        try:
            news_data = await news_aggregator.fetch_latest()
            civic_data = await civic_collector.fetch_civic_data()

            processed_data = await data_processor.process_all(news_data, civic_data)
            await data_processor.store_processed_data(processed_data)

        except Exception as e:
            print(f"Background collection error: {e}")

        await asyncio.sleep(3600)

@app.get("/")
async def root():
    return {"status": "Civic Pulse API Running"}

@app.get("/api/issues/map")
async def get_map_data(
    level: str = "country",
    location_id: Optional[str] = None
):
    issues = await data_processor.get_issues_by_location(level, location_id)

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [issue.location["lng"], issue.location["lat"]]
                },
                "properties": {
                    "id": issue.id,
                    "type": issue.type,
                    "severity": issue.severity,
                    "progress": issue.progress,
                    "trend": issue.trend,
                    "age_days": issue.age_days,
                    "title": issue.title
                }
            }
            for issue in issues
        ]
    }

@app.get("/api/issues/summary/{location_id}")
async def get_location_summary(location_id: str):
    summary = await data_processor.get_location_summary(location_id)
    return summary

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            updates = await data_processor.get_live_updates()
            await websocket.send_json(updates)
            await asyncio.sleep(10)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

@app.get("/api/regions")
async def get_regions(parent_id: Optional[str] = None):
    regions = await location_service.get_child_regions(parent_id)
    return regions

@app.get("/api/issues/{issue_id}")
async def get_issue_details(issue_id: str):
    details = await data_processor.get_issue_details(issue_id)
    return details