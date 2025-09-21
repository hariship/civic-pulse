import httpx
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import asyncio
from .real_govt_apis import RealGovernmentAPIs

class RealBangaloreAPIs:
    def __init__(self):
        # Real Bangalore air quality stations from WAQI
        self.bangalore_stations = {
            "Silk Board": {"uid": 11293, "coords": [12.917348, 77.622813]},
            "Bapuji Nagar": {"uid": 11312, "coords": [12.951913, 77.539784]},
            "BTM": {"uid": 8190, "coords": [12.9135218, 77.5950804]},
            "Jayanagar": {"uid": 11276, "coords": [12.920984, 77.584908]},
            "Hebbal": {"uid": 11428, "coords": [13.029152, 77.585901]},
            "City Railway": {"uid": 8686, "coords": [12.9756843, 77.5660749]}
        }

        # Map stations to our areas
        self.area_to_station = {
            "Electronic City": "Silk Board",  # Closest station
            "Whitefield": "BTM",  # Closest available
            "Koramangala": "BTM",  # Direct match
            "Indiranagar": "City Railway",  # Close to railway station
            "Jayanagar": "Jayanagar",  # Direct match
            "Hebbal": "Hebbal"  # Direct match
        }

        # Initialize real government APIs
        self.govt_apis = RealGovernmentAPIs()

    async def fetch_real_bangalore_data(self) -> Dict:
        """Fetch real air quality data from actual Bangalore stations"""

        async with httpx.AsyncClient(timeout=30) as client:
            air_quality_data = await self._fetch_real_bangalore_air_quality(client)

            # Fetch real government data
            transport_data = await self.govt_apis.fetch_real_transport_data(client)
            water_quality_data = await self.govt_apis.fetch_real_water_quality_data(client)
            crime_data = await self.govt_apis.fetch_real_crime_data(client)

            return {
                "air_quality": air_quality_data,
                "crime_stats": crime_data,
                "infrastructure": self._get_sample_infrastructure_data(),
                "water_quality": water_quality_data,
                "transport": transport_data,
                "last_updated": datetime.now().isoformat(),
                "data_sources": self._get_real_data_sources()
            }

    async def _fetch_real_bangalore_air_quality(self, client: httpx.AsyncClient) -> Dict:
        """Fetch real air quality from actual Bangalore WAQI stations"""

        air_data = {
            "source": "World Air Quality Index - Real Bangalore Stations",
            "stations_count": len(self.bangalore_stations),
            "api_endpoint": "https://api.waqi.info/",
            "areas": {},
            "city_average": 0,
            "last_update": datetime.now().isoformat()
        }

        station_aqis = []

        # Fetch data from each real Bangalore station
        for area, station_name in self.area_to_station.items():
            if station_name in self.bangalore_stations:
                station_info = self.bangalore_stations[station_name]

                try:
                    # Fetch real data from specific station
                    response = await client.get(f"https://api.waqi.info/feed/@{station_info['uid']}/?token=demo")

                    if response.status_code == 200:
                        data = response.json()

                        if data.get("status") == "ok":
                            station_data = data.get("data", {})
                            aqi = station_data.get("aqi", 0)

                            if aqi > 0:  # Valid AQI reading
                                air_data["areas"][area] = {
                                    "aqi": aqi,
                                    "status": self._get_aqi_status(aqi),
                                    "station_name": station_name,  # Use our mapped station name
                                    "coordinates": station_info["coords"],
                                    "pollutants": station_data.get("iaqi", {}),
                                    "last_update": station_data.get("time", {}).get("s", ""),
                                    "source": f"WAQI Station UID {station_info['uid']}"
                                }
                                station_aqis.append(aqi)
                                print(f"✅ Real AQI for {area}: {aqi} from {station_name}")
                            else:
                                print(f"⚠️ No valid AQI for {area} from {station_name}")
                        else:
                            print(f"❌ API error for {station_name}: {data.get('status')}")
                    else:
                        print(f"❌ HTTP error for {station_name}: {response.status_code}")

                except Exception as e:
                    print(f"❌ Exception fetching {station_name}: {e}")

        # Calculate city average from real stations
        if station_aqis:
            air_data["city_average"] = round(sum(station_aqis) / len(station_aqis))
            air_data["total_stations_active"] = len(station_aqis)
        else:
            air_data["city_average"] = 0
            air_data["total_stations_active"] = 0
            air_data["error"] = "No stations returning valid data"

        return air_data

    def _get_real_crime_disclaimer(self) -> Dict:
        """Real crime data sources information"""
        return {
            "source": "Bangalore Police & Karnataka Police",
            "status": "Real-time crime data requires official police API access",
            "available_sources": [
                "FIR data from individual police stations",
                "NCRB district-wise statistics",
                "Karnataka Police portal data"
            ],
            "api_access": "Requires government authorization",
            "alternative": "RTI requests to local police stations for recent crime data"
        }

    def _get_real_infrastructure_disclaimer(self) -> Dict:
        """Real infrastructure data sources"""
        return {
            "power": {
                "source": "BESCOM (Bangalore Electricity Supply Company)",
                "website": "https://bescom.karnataka.gov.in/",
                "api_status": "No public API available",
                "data_access": "Requires utility partnership"
            },
            "water": {
                "source": "BWSSB (Bangalore Water Supply and Sewerage Board)",
                "website": "https://bwssb.karnataka.gov.in/",
                "api_status": "No public API available",
                "data_access": "Requires utility partnership"
            },
            "roads": {
                "source": "BBMP (Bruhat Bengaluru Mahanagara Palike)",
                "website": "https://bbmp.gov.in/",
                "api_status": "Tender data available, no real-time road status API"
            }
        }

    def _get_real_water_disclaimer(self) -> Dict:
        """Real water quality sources"""
        return {
            "source": "CPCB (Central Pollution Control Board)",
            "website": "https://cpcb.nic.in/",
            "api_status": "No public real-time API",
            "data_access": "Requires environmental clearance",
            "alternative": "Manual testing data from certified labs"
        }

    def _get_real_transport_disclaimer(self) -> Dict:
        """Real transport data sources"""
        return {
            "metro": {
                "source": "BMRCL (Bangalore Metro Rail Corporation)",
                "website": "https://bmrcl.com/",
                "api_status": "No public API for real-time data"
            },
            "bus": {
                "source": "BMTC (Bangalore Metropolitan Transport Corporation)",
                "website": "https://mybmtc.karnataka.gov.in/",
                "api_status": "No public API for real-time data"
            },
            "traffic": {
                "source": "Bangalore Traffic Police",
                "api_status": "No public API available"
            }
        }

    def _get_aqi_status(self, aqi: int) -> str:
        if aqi <= 50: return "Good"
        elif aqi <= 100: return "Moderate"
        elif aqi <= 150: return "Unhealthy for Sensitive"
        elif aqi <= 200: return "Unhealthy"
        elif aqi <= 300: return "Very Unhealthy"
        else: return "Hazardous"


    def _get_sample_infrastructure_data(self) -> Dict:
        """Sample infrastructure data for demonstration"""
        return {
            "source": "Sample Infrastructure Data - Requires Utility APIs",
            "areas": {
                "Electronic City": {
                    "power_status": "Good",
                    "water_status": "Fair",
                    "coordinates": [12.8440, 77.6630]
                },
                "Whitefield": {
                    "power_status": "Excellent",
                    "water_status": "Good",
                    "coordinates": [12.9698, 77.7500]
                },
                "Koramangala": {
                    "power_status": "Good",
                    "water_status": "Good",
                    "coordinates": [12.9279, 77.6271]
                },
                "Indiranagar": {
                    "power_status": "Excellent",
                    "water_status": "Good",
                    "coordinates": [12.9784, 77.6408]
                },
                "Jayanagar": {
                    "power_status": "Good",
                    "water_status": "Excellent",
                    "coordinates": [12.9237, 77.5838]
                },
                "Hebbal": {
                    "power_status": "Fair",
                    "water_status": "Good",
                    "coordinates": [13.0356, 77.5970]
                }
            }
        }



    def _get_real_data_sources(self) -> Dict:
        return {
            "air_quality": {
                "source": "World Air Quality Index",
                "stations": len(self.bangalore_stations),
                "real_time": True,
                "api_endpoint": "https://api.waqi.info/"
            },
            "crime_data": {
                "source": "Bangalore Police / NCRB",
                "real_time": False,
                "api_access": "Requires government authorization"
            },
            "infrastructure": {
                "source": "BESCOM, BWSSB, BBMP",
                "real_time": False,
                "api_access": "Requires utility partnerships"
            },
            "government_transparency": "Most civic APIs in India require official access",
            "recommendation": "Contact respective departments for real-time data access"
        }