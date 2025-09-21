from typing import List, Dict, Optional
from datetime import datetime, timedelta
from database.models import Issue, NewsItem, CivicData, LocationSummary, get_db
from sqlalchemy.orm import Session
import json

class DataProcessor:
    def __init__(self):
        self.severity_levels = {
            "critical": {"color": "#FF0000", "priority": 1},
            "high": {"color": "#FF6600", "priority": 2},
            "medium": {"color": "#FFAA00", "priority": 3},
            "low": {"color": "#00AA00", "priority": 4}
        }

    async def process_all(self, news_data: List[Dict], civic_data: Dict) -> List[Dict]:
        processed_issues = []

        for news_item in news_data:
            issue = self._create_issue_from_news(news_item)
            processed_issues.append(issue)

        for court_case in civic_data.get("court_cases", []):
            issue = self._create_issue_from_court_case(court_case)
            processed_issues.append(issue)

        for crime in civic_data.get("crime_reports", []):
            issue = self._create_issue_from_crime(crime)
            processed_issues.append(issue)

        for infra in civic_data.get("infrastructure", []):
            issue = self._create_issue_from_infrastructure(infra)
            processed_issues.append(issue)

        return processed_issues

    def _create_issue_from_news(self, news_item: Dict) -> Dict:
        age_days = (datetime.now() - news_item["first_seen"]).days
        update_frequency = news_item["update_count"] / max(age_days, 1)

        severity = self._calculate_severity(news_item["type"], update_frequency)
        trend = self._calculate_trend(news_item["update_count"], age_days)

        return {
            "id": news_item["id"],
            "type": "news",
            "category": news_item["type"],
            "title": news_item["titles"][0] if news_item["titles"] else "News Update",
            "location": news_item["location"],
            "severity": severity,
            "progress": 0.0,
            "trend": trend,
            "first_seen": news_item["first_seen"],
            "last_updated": news_item["last_updated"],
            "age_days": age_days,
            "source_count": len(set(news_item["sources"]))
        }

    def _create_issue_from_court_case(self, case: Dict) -> Dict:
        age_days = (datetime.now() - datetime.strptime(case["filed_date"], "%Y-%m-%d")).days

        return {
            "id": case["id"],
            "type": "legal",
            "category": case.get("category", "legal"),
            "title": case["title"],
            "location": case["location"],
            "severity": "high" if age_days > 365 else "medium",
            "progress": case["progress"],
            "trend": "stable" if case["status"] == "ongoing" else "improving",
            "first_seen": datetime.strptime(case["filed_date"], "%Y-%m-%d"),
            "last_updated": datetime.now(),
            "age_days": age_days,
            "metadata": {
                "court": case["court"],
                "next_hearing": case.get("next_hearing")
            }
        }

    def _create_issue_from_crime(self, crime: Dict) -> Dict:
        return {
            "id": crime["id"],
            "type": "crime",
            "category": "security",
            "title": f"{crime['type'].title()} - {crime['area']}",
            "location": crime["location"],
            "severity": "critical" if crime["frequency"] > 10 else "high",
            "progress": 0.2 if crime["status"] == "fir_filed" else 0.5,
            "trend": "worsening" if crime["frequency"] > 5 else "stable",
            "first_seen": datetime.strptime(crime["reported_date"], "%Y-%m-%d"),
            "last_updated": datetime.now(),
            "age_days": (datetime.now() - datetime.strptime(crime["reported_date"], "%Y-%m-%d")).days,
            "metadata": {"frequency": crime["frequency"]}
        }

    def _create_issue_from_infrastructure(self, infra: Dict) -> Dict:
        return {
            "id": infra["id"],
            "type": "infrastructure",
            "category": "development",
            "title": infra["name"],
            "location": infra["location"],
            "severity": "high" if infra["status"] == "delayed" else "low",
            "progress": infra["progress"],
            "trend": "improving" if infra["status"] == "on_track" else "worsening",
            "first_seen": datetime.strptime(infra["started"], "%Y-%m-%d"),
            "last_updated": datetime.now(),
            "age_days": (datetime.now() - datetime.strptime(infra["started"], "%Y-%m-%d")).days,
            "metadata": {
                "expected_completion": infra["expected_completion"],
                "budget": infra.get("budget")
            }
        }

    def _calculate_severity(self, category: str, update_frequency: float) -> str:
        if category in ["crime", "health"] and update_frequency > 1:
            return "critical"
        elif category in ["legal", "governance"] and update_frequency > 0.5:
            return "high"
        elif update_frequency > 0.2:
            return "medium"
        else:
            return "low"

    def _calculate_trend(self, update_count: int, age_days: int) -> str:
        recent_rate = update_count / max(age_days, 1)

        if recent_rate > 1:
            return "worsening"
        elif recent_rate > 0.5:
            return "active"
        elif recent_rate > 0.1:
            return "stable"
        else:
            return "improving"

    async def store_processed_data(self, processed_data: List[Dict]):
        db = next(get_db())

        try:
            for item in processed_data:
                existing = db.query(Issue).filter(Issue.id == item["id"]).first()

                if existing:
                    for key, value in item.items():
                        if key != "id" and hasattr(existing, key):
                            setattr(existing, key, value)
                else:
                    issue = Issue(**{k: v for k, v in item.items() if k != "metadata"})
                    if "metadata" in item:
                        issue.issue_metadata = item["metadata"]
                    db.add(issue)

            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Database error: {e}")
        finally:
            db.close()

    async def get_issues_by_location(self, level: str, location_id: Optional[str]) -> List[Issue]:
        db = next(get_db())

        try:
            query = db.query(Issue)

            if location_id:
                query = query.filter(Issue.location["name"].astext == location_id)

            issues = query.all()
            return issues
        finally:
            db.close()

    async def get_location_summary(self, location_id: str) -> Dict:
        db = next(get_db())

        try:
            issues = db.query(Issue).filter(
                Issue.location["name"].astext == location_id
            ).all()

            summary = {
                "location_id": location_id,
                "total_issues": len(issues),
                "critical_issues": len([i for i in issues if i.severity == "critical"]),
                "active_issues": len([i for i in issues if i.trend in ["worsening", "active"]]),
                "resolved_issues": len([i for i in issues if i.progress >= 1.0]),
                "categories": {}
            }

            for issue in issues:
                if issue.category not in summary["categories"]:
                    summary["categories"][issue.category] = 0
                summary["categories"][issue.category] += 1

            return summary
        finally:
            db.close()

    async def get_live_updates(self) -> List[Dict]:
        db = next(get_db())

        try:
            recent = datetime.now() - timedelta(minutes=5)
            updates = db.query(Issue).filter(Issue.last_updated >= recent).all()

            return [{
                "id": u.id,
                "type": u.type,
                "location": u.location,
                "severity": u.severity,
                "title": u.title
            } for u in updates]
        finally:
            db.close()

    async def get_issue_details(self, issue_id: str) -> Dict:
        db = next(get_db())

        try:
            issue = db.query(Issue).filter(Issue.id == issue_id).first()

            if issue:
                return {
                    "id": issue.id,
                    "type": issue.type,
                    "category": issue.category,
                    "title": issue.title,
                    "description": issue.description,
                    "location": issue.location,
                    "severity": issue.severity,
                    "progress": issue.progress,
                    "trend": issue.trend,
                    "first_seen": issue.first_seen.isoformat(),
                    "last_updated": issue.last_updated.isoformat(),
                    "age_days": (datetime.now() - issue.first_seen).days,
                    "metadata": issue.issue_metadata
                }
            return {}
        finally:
            db.close()