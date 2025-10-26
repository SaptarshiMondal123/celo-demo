# Example: PostgreSQL Database Setup for Proposal Tracking
# This is a REFERENCE file - NOT currently used by the system

"""
To use PostgreSQL for persistent storage:

1. Install dependencies:
   pip install psycopg2-binary sqlalchemy

2. Create database schema:
"""

from sqlalchemy import create_engine, Column, String, DateTime, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

Base = declarative_base()

class ProposalCreation(Base):
    """Track when users create proposals"""
    __tablename__ = 'proposal_creations'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_address = Column(String(42), nullable=False, index=True)  # Ethereum address
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    proposal_id = Column(Integer, nullable=True)  # Blockchain proposal ID
    tx_hash = Column(String(66), nullable=True)  # Transaction hash
    amount_eth = Column(Integer, nullable=False)  # Amount in wei
    fee_paid = Column(Integer, nullable=False)  # Fee paid in wei
    is_free = Column(Integer, nullable=False)  # 1 for free, 0 for paid

# Database connection
DATABASE_URL = "postgresql://user:password@localhost:5432/echodao"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Create tables
Base.metadata.create_all(engine)

"""
3. Update proposal_routes.py to use database:

def check_user_proposal_limit_db(user_address: str) -> dict:
    db = SessionLocal()
    try:
        # Get all proposals for this user
        proposals = db.query(ProposalCreation).filter(
            ProposalCreation.user_address == user_address.lower()
        ).all()
        
        # Filter today's proposals
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_proposals = [p for p in proposals if p.created_at >= today_start]
        
        return {
            "can_create": len(today_proposals) < 3,
            "is_free": len(proposals) == 0,
            "proposals_today": len(today_proposals),
            "total_proposals": len(proposals),
            "message": "Free proposal" if len(proposals) == 0 else "0.01 CELO fee required"
        }
    finally:
        db.close()

def record_proposal_creation_db(user_address: str, proposal_id: int, tx_hash: str, 
                                 amount_eth: float, fee_paid: float, is_free: bool):
    db = SessionLocal()
    try:
        record = ProposalCreation(
            user_address=user_address.lower(),
            created_at=datetime.now(),
            proposal_id=proposal_id,
            tx_hash=tx_hash,
            amount_eth=int(amount_eth * 10**18),  # Convert to wei
            fee_paid=int(fee_paid * 10**18),
            is_free=1 if is_free else 0
        )
        db.add(record)
        db.commit()
    finally:
        db.close()
"""
