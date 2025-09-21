import httpx
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import asyncio
import os

class RealCivicAPIs:
    def __init__(self):
        # Real API endpoints
        self.apis = {
            # Air Quality
            "waqi": "https://api.waqi.info/feed/",
            "waqi_token": "demo",  # Replace with real token

            # Government APIs
            "data_gov_in": "https://api.data.gov.in/",
            "ncrb_api": "https://ncrb.gov.in/",

            # Open Data Sources
            "bangalore_open_data": "https://data.opencity.in/bangalore/",
            "karnataka_portal": "https://kppp.karnataka.gov.in/api/",

            # Weather & Environment
            "openweather": "https://api.openweathermap.org/data/2.5/",
            "openweather_key": "demo",  # Replace with real key
        }

        self.bangalore_coords = {
            "Electronic City": {"lat": 12.8440, "lng": 77.6630},
            "Whitefield": {"lat": 12.9698, "lng": 77.7500},
            "Koramangala": {"lat": 12.9279, "lng": 77.6271},
            "Indiranagar": {"lat": 12.9784, "lng": 77.6408},
            "Jayanagar": {"lat": 12.9237, "lng": 77.5838},
            "Hebbal": {"lat": 13.0356, "lng": 77.5970}
        }

    async def fetch_real_civic_data(self) -> Dict:
        """Fetch all real civic data from various APIs"""

        async with httpx.AsyncClient(timeout=30) as client:
            tasks = [
                self._fetch_real_air_quality(client),
                self._fetch_real_crime_data(client),
                self._fetch_real_infrastructure(client),
                self._fetch_real_water_data(client),
                self._fetch_real_transport(client)
            ]

            results = await asyncio.gather(*tasks, return_exceptions=True)

            return {
                "air_quality": results[0] if not isinstance(results[0], Exception) else None,
                "crime_stats": results[1] if not isinstance(results[1], Exception) else None,
                "infrastructure": results[2] if not isinstance(results[2], Exception) else None,
                "water_quality": results[3] if not isinstance(results[3], Exception) else None,
                "transport": results[4] if not isinstance(results[4], Exception) else None,
                "last_updated": datetime.now().isoformat(),
                "data_sources": self._get_data_sources()
            }

    async def _fetch_real_air_quality(self, client: httpx.AsyncClient) -> Dict:
        """Fetch real air quality data from WAQI API"""
        air_data = {
            "source": "World Air Quality Index (waqi.info)",
            "api_endpoint": "https://api.waqi.info/",
            "areas": {}
        }

        # Try to get real data for Bangalore
        try:
            response = await client.get(f"{self.apis['waqi']}bangalore/?token={self.apis['waqi_token']}")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok":
                    main_data = data.get("data", {})
                    air_data.update({
                        "current_aqi": main_data.get("aqi", 0),
                        "status": self._get_aqi_status(main_data.get("aqi", 0)),
                        "station": main_data.get("city", {}).get("name", "Bangalore"),
                        "pollutants": main_data.get("iaqi", {}),
                        "last_update": main_data.get("time", {}).get("s", "")
                    })

        except Exception as e:
            print(f"WAQI API error: {e}")

        # Try to get area-specific data (most APIs don't provide this granularity)
        for area, coords in self.bangalore_coords.items():
            try:
                # Some APIs allow lat/lng queries
                response = await client.get(f"{self.apis['waqi']}geo:{coords['lat']};{coords['lng']}/?token={self.apis['waqi_token']}")
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "ok":
                        area_data = data.get("data", {})
                        air_data["areas"][area] = {
                            "aqi": area_data.get("aqi", 0),
                            "status": self._get_aqi_status(area_data.get("aqi", 0)),
                            "station": area_data.get("city", {}).get("name", area)
                        }
            except:
                # If API fails, skip this area
                continue

        return air_data

    async def _fetch_real_crime_data(self, client: httpx.AsyncClient) -> Dict:
        """Fetch real crime data from government sources"""
        crime_data = {
            "source": "NCRB (National Crime Records Bureau) & Karnataka Police",
            "api_endpoint": "https://ncrb.gov.in/",
            "disclaimer": "Crime data is aggregated from public police records and FIR databases",
            "areas": {}
        }

        # Try Karnataka Police API
        try:
            # Most police APIs are not public, so we'll try open data portals
            response = await client.get("https://api.data.gov.in/resource/9a8bc0f4-8fb3-4dfe-ae8d-8863c9ba4a6e?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b")
            if response.status_code == 200:
                data = response.json()
                # Process real government crime data
                crime_data["real_data_available"] = True
                crime_data["government_data"] = data
        except Exception as e:
            print(f"Government API error: {e}")
            crime_data["real_data_available"] = False

        # If no real data available, mark as unavailable
        crime_data["status"] = "Real-time crime data requires police API access"
        crime_data["alternative_sources"] = [
            "RTI requests to local police stations",
            "Bangalore Police official statistics",
            "Karnataka State Police crime portal"
        ]

        return crime_data

    async def _fetch_real_infrastructure(self, client: httpx.AsyncClient) -> Dict:
        """Fetch real infrastructure data"""
        infra_data = {
            "source": "BESCOM, BWSSB, BBMP APIs",
            "areas": {}
        }

        # Try BESCOM (power) API
        try:
            # BESCOM doesn't have public API, but we can scrape status pages
            response = await client.get("https://bescom.karnataka.gov.in/")
            if response.status_code == 200:
                infra_data["power_status"] = "BESCOM website accessible"
        except:
            infra_data["power_status"] = "Unable to access BESCOM data"

        # Try BWSSB (water) API
        try:
            response = await client.get("https://bwssb.karnataka.gov.in/")
            if response.status_code == 200:
                infra_data["water_status"] = "BWSSB website accessible"
        except:
            infra_data["water_status"] = "Unable to access BWSSB data"

        infra_data["note"] = "Infrastructure APIs require government access credentials"
        return infra_data

    async def _fetch_real_water_data(self, client: httpx.AsyncClient) -> Dict:
        """Fetch real water quality data"""
        return {
            "source": "Central Pollution Control Board (CPCB)",
            "api_endpoint": "https://cpcb.nic.in/",
            "status": "Water quality APIs require CPCB authorization",
            "alternative": "Manual testing data from certified labs"
        }

    async def _fetch_real_transport(self, client: httpx.AsyncClient) -> Dict:
        """Fetch real transport data"""
        transport_data = {
            "source": "BMRCL (Bangalore Metro), BMTC (Bus)",
            "areas": {}
        }

        # Try Bangalore Metro API
        try:
            # Most transport APIs are not public
            response = await client.get("https://bmrcl.com/")
            if response.status_code == 200:
                transport_data["metro_status"] = "BMRCL website accessible"
        except:
            transport_data["metro_status"] = "Unable to access BMRCL data"

        transport_data["note"] = "Real-time transport data requires BMRCL/BMTC API access"
        return transport_data

    def _get_aqi_status(self, aqi: int) -> str:
        if aqi <= 50: return "Good"
        elif aqi <= 100: return "Moderate"
        elif aqi <= 150: return "Unhealthy for Sensitive"
        elif aqi <= 200: return "Unhealthy"
        elif aqi <= 300: return "Very Unhealthy"
        else: return "Hazardous"

    def _get_data_sources(self) -> Dict:
        return {
            "air_quality": {
                "primary": "World Air Quality Index (waqi.info)",
                "api_key_required": True,
                "real_time": True
            },
            "crime_data": {
                "primary": "NCRB & Karnataka Police",
                "api_key_required": True,
                "real_time": False,
                "note": "Requires government authorization"
            },
            "infrastructure": {
                "primary": "BESCOM, BWSSB, BBMP",
                "api_key_required": True,
                "real_time": True,
                "note": "Government utility APIs"
            },
            "water_quality": {
                "primary": "Central Pollution Control Board",
                "api_key_required": True,
                "real_time": False
            },
            "transport": {
                "primary": "BMRCL, BMTC",
                "api_key_required": True,
                "real_time": True
            }
        }