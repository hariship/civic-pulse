from typing import List, Dict, Optional
import json

class LocationService:
    def __init__(self):
        self.india_regions = {
            "country": {
                "id": "india",
                "name": "India",
                "coordinates": {"lat": 20.5937, "lng": 78.9629},
                "bounds": [[6.747, 68.162], [35.674, 97.403]]
            },
            "states": [
                {
                    "id": "delhi",
                    "name": "Delhi",
                    "coordinates": {"lat": 28.6139, "lng": 77.2090},
                    "parent": "india"
                },
                {
                    "id": "maharashtra",
                    "name": "Maharashtra",
                    "coordinates": {"lat": 19.7515, "lng": 75.7139},
                    "parent": "india",
                    "cities": ["Mumbai", "Pune", "Nagpur"]
                },
                {
                    "id": "karnataka",
                    "name": "Karnataka",
                    "coordinates": {"lat": 15.3173, "lng": 75.7139},
                    "parent": "india",
                    "cities": ["Bangalore", "Mysore", "Hubli"]
                },
                {
                    "id": "tamil_nadu",
                    "name": "Tamil Nadu",
                    "coordinates": {"lat": 11.1271, "lng": 78.6569},
                    "parent": "india",
                    "cities": ["Chennai", "Coimbatore", "Madurai"]
                },
                {
                    "id": "west_bengal",
                    "name": "West Bengal",
                    "coordinates": {"lat": 22.9868, "lng": 87.8550},
                    "parent": "india",
                    "cities": ["Kolkata", "Siliguri", "Durgapur"]
                },
                {
                    "id": "telangana",
                    "name": "Telangana",
                    "coordinates": {"lat": 18.1124, "lng": 79.0193},
                    "parent": "india",
                    "cities": ["Hyderabad", "Warangal", "Nizamabad"]
                }
            ],
            "cities": {
                "Mumbai": {"lat": 19.0760, "lng": 72.8777, "state": "maharashtra"},
                "Delhi": {"lat": 28.6139, "lng": 77.2090, "state": "delhi"},
                "Bangalore": {"lat": 12.9716, "lng": 77.5946, "state": "karnataka"},
                "Chennai": {"lat": 13.0827, "lng": 80.2707, "state": "tamil_nadu"},
                "Kolkata": {"lat": 22.5726, "lng": 88.3639, "state": "west_bengal"},
                "Hyderabad": {"lat": 17.3850, "lng": 78.4867, "state": "telangana"},
                "Pune": {"lat": 18.5204, "lng": 73.8567, "state": "maharashtra"},
                "Ahmedabad": {"lat": 23.0225, "lng": 72.5714, "state": "gujarat"},
                "Surat": {"lat": 21.1702, "lng": 72.8311, "state": "gujarat"}
            }
        }

    async def get_child_regions(self, parent_id: Optional[str] = None) -> List[Dict]:
        if not parent_id or parent_id == "india":
            return [{
                "id": state["id"],
                "name": state["name"],
                "coordinates": state["coordinates"],
                "type": "state",
                "parent": "india"
            } for state in self.india_regions["states"]]

        for state in self.india_regions["states"]:
            if state["id"] == parent_id and "cities" in state:
                return [{
                    "id": city.lower().replace(" ", "_"),
                    "name": city,
                    "coordinates": self.india_regions["cities"].get(city, {}),
                    "type": "city",
                    "parent": parent_id
                } for city in state["cities"]]

        return []

    def get_location_hierarchy(self, location_name: str) -> Dict:
        location_lower = location_name.lower()

        if location_lower in self.india_regions["cities"]:
            city_data = self.india_regions["cities"][location_lower]
            return {
                "city": location_name,
                "state": city_data.get("state"),
                "country": "india",
                "coordinates": {"lat": city_data["lat"], "lng": city_data["lng"]}
            }

        for state in self.india_regions["states"]:
            if state["name"].lower() == location_lower:
                return {
                    "state": state["name"],
                    "country": "india",
                    "coordinates": state["coordinates"]
                }

        return {
            "country": "india",
            "coordinates": self.india_regions["country"]["coordinates"]
        }

    def get_zoom_level(self, level: str) -> int:
        zoom_levels = {
            "country": 5,
            "state": 7,
            "city": 11,
            "district": 13,
            "ward": 15
        }
        return zoom_levels.get(level, 5)