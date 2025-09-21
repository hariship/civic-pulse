import feedparser
import httpx
from datetime import datetime, timedelta
from typing import List, Dict
import asyncio
from bs4 import BeautifulSoup
import re

class NewsAggregator:
    def __init__(self):
        self.sources = {
            "hindu": {
                "url": "https://www.thehindu.com/news/national/feeder/default.rss",
                "name": "The Hindu"
            },
            "indian_express": {
                "url": "https://indianexpress.com/feed/",
                "name": "Indian Express"
            },
            "hindustan_times": {
                "url": "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
                "name": "Hindustan Times"
            }
        }

        self.categories = {
            "legal": ["court", "supreme", "high court", "verdict", "petition", "case", "judge"],
            "health": ["disease", "hospital", "doctor", "vaccine", "outbreak", "health"],
            "infrastructure": ["road", "bridge", "construction", "metro", "highway", "building"],
            "crime": ["police", "fir", "arrest", "crime", "murder", "theft"],
            "governance": ["policy", "government", "minister", "election", "bill", "parliament"]
        }

    async def fetch_latest(self) -> List[Dict]:
        all_news = []

        async with httpx.AsyncClient() as client:
            tasks = []
            for source_key, source_info in self.sources.items():
                tasks.append(self._fetch_feed(client, source_key, source_info))

            results = await asyncio.gather(*tasks, return_exceptions=True)

            for result in results:
                if isinstance(result, list):
                    all_news.extend(result)

        return self._process_and_categorize(all_news)

    async def _fetch_feed(self, client: httpx.AsyncClient, source_key: str, source_info: Dict) -> List[Dict]:
        try:
            response = await client.get(source_info["url"], timeout=10)
            feed = feedparser.parse(response.content)

            news_items = []
            for entry in feed.entries[:20]:
                location = self._extract_location(entry.title + " " + entry.get("summary", ""))
                category = self._categorize_news(entry.title + " " + entry.get("summary", ""))

                news_items.append({
                    "id": f"{source_key}_{entry.get('id', entry.link)}",
                    "title": entry.title,
                    "summary": entry.get("summary", "")[:200],
                    "link": entry.link,
                    "published": datetime.strptime(entry.published, "%a, %d %b %Y %H:%M:%S %z") if hasattr(entry, 'published') else datetime.now(),
                    "source": source_info["name"],
                    "category": category,
                    "location": location
                })

            return news_items
        except Exception as e:
            print(f"Error fetching {source_key}: {e}")
            return []

    def _extract_location(self, text: str) -> Dict:
        states = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad",
                 "Maharashtra", "Karnataka", "Tamil Nadu", "Kerala", "Gujarat",
                 "Rajasthan", "Uttar Pradesh", "Bihar", "West Bengal"]

        text_lower = text.lower()
        for state in states:
            if state.lower() in text_lower:
                return self._get_coordinates(state)

        return {"name": "India", "lat": 20.5937, "lng": 78.9629, "level": "country"}

    def _get_coordinates(self, location: str) -> Dict:
        coords = {
            "Delhi": {"lat": 28.6139, "lng": 77.2090},
            "Mumbai": {"lat": 19.0760, "lng": 72.8777},
            "Bangalore": {"lat": 12.9716, "lng": 77.5946},
            "Chennai": {"lat": 13.0827, "lng": 80.2707},
            "Kolkata": {"lat": 22.5726, "lng": 88.3639},
            "Hyderabad": {"lat": 17.3850, "lng": 78.4867},
        }

        if location in coords:
            return {"name": location, **coords[location], "level": "city"}

        return {"name": location, "lat": 20.5937, "lng": 78.9629, "level": "state"}

    def _categorize_news(self, text: str) -> str:
        text_lower = text.lower()

        for category, keywords in self.categories.items():
            if any(keyword in text_lower for keyword in keywords):
                return category

        return "general"

    def _process_and_categorize(self, news_items: List[Dict]) -> List[Dict]:
        grouped_stories = {}

        for item in news_items:
            story_key = self._generate_story_key(item)

            if story_key not in grouped_stories:
                grouped_stories[story_key] = {
                    "id": story_key,
                    "type": item["category"],
                    "location": item["location"],
                    "first_seen": item["published"],
                    "last_updated": item["published"],
                    "sources": [],
                    "titles": [],
                    "update_count": 0
                }

            grouped_stories[story_key]["sources"].append(item["source"])
            grouped_stories[story_key]["titles"].append(item["title"])
            grouped_stories[story_key]["update_count"] += 1

            if item["published"] > grouped_stories[story_key]["last_updated"]:
                grouped_stories[story_key]["last_updated"] = item["published"]

        return list(grouped_stories.values())

    def _generate_story_key(self, item: Dict) -> str:
        title_words = set(item["title"].lower().split())

        important_words = [word for word in title_words
                          if len(word) > 4 and word not in ["their", "there", "which", "where"]]

        key_parts = [
            item["category"],
            item["location"]["name"],
            "_".join(sorted(important_words[:3]))
        ]

        return "_".join(key_parts)