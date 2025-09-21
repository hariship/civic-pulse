from sqlalchemy import create_engine, Column, String, Float, DateTime, Integer, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

Base = declarative_base()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./civic_pulse.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Issue(Base):
    __tablename__ = "issues"

    id = Column(String, primary_key=True)
    type = Column(String)
    category = Column(String)
    title = Column(String)
    description = Column(String)
    location = Column(JSON)
    severity = Column(String)
    progress = Column(Float)
    trend = Column(String)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow)
    status = Column(String)
    source_count = Column(Integer)
    issue_metadata = Column(JSON)

class NewsItem(Base):
    __tablename__ = "news_items"

    id = Column(String, primary_key=True)
    issue_id = Column(String)
    title = Column(String)
    summary = Column(String)
    source = Column(String)
    link = Column(String)
    published = Column(DateTime)
    location = Column(JSON)
    category = Column(String)

class CivicData(Base):
    __tablename__ = "civic_data"

    id = Column(String, primary_key=True)
    type = Column(String)
    issue_id = Column(String)
    data = Column(JSON)
    location = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class LocationSummary(Base):
    __tablename__ = "location_summaries"

    location_id = Column(String, primary_key=True)
    name = Column(String)
    level = Column(String)
    coordinates = Column(JSON)
    total_issues = Column(Integer)
    critical_issues = Column(Integer)
    active_issues = Column(Integer)
    resolved_issues = Column(Integer)
    health_score = Column(Float)
    last_calculated = Column(DateTime, default=datetime.utcnow)

async def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()