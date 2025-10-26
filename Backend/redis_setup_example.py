# Example: Redis Setup for Proposal Tracking
# This is a REFERENCE file - NOT currently used by the system

"""
To use Redis for persistent storage:

1. Install Redis:
   - Windows: Download from https://github.com/microsoftarchive/redis/releases
   - Linux: sudo apt-get install redis-server
   - Mac: brew install redis

2. Install Python client:
   pip install redis

3. Start Redis server:
   redis-server
"""

import redis
import json
from datetime import datetime

# Redis connection
redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)

def check_user_proposal_limit_redis(user_address: str) -> dict:
    """Check proposal limits using Redis"""
    user_address = user_address.lower()
    key = f"proposals:{user_address}"
    
    # Get all timestamps for this user
    timestamps = redis_client.lrange(key, 0, -1)
    proposal_times = [datetime.fromisoformat(ts) for ts in timestamps]
    
    # Filter today's proposals
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_proposals = [t for t in proposal_times if t >= today_start]
    total_proposals = len(proposal_times)
    
    # Check daily limit (3 per day)
    if len(today_proposals) >= 3:
        return {
            "can_create": False,
            "is_free": False,
            "proposals_today": len(today_proposals),
            "total_proposals": total_proposals,
            "message": "Daily limit reached. You can only create 3 proposals per day."
        }
    
    # First proposal ever is free
    is_free = total_proposals == 0
    
    return {
        "can_create": True,
        "is_free": is_free,
        "proposals_today": len(today_proposals),
        "total_proposals": total_proposals,
        "message": "Free proposal" if is_free else "0.01 CELO fee required"
    }

def record_proposal_creation_redis(user_address: str, proposal_id: int = None, 
                                   tx_hash: str = None, amount_eth: float = 0):
    """Record proposal creation in Redis"""
    user_address = user_address.lower()
    key = f"proposals:{user_address}"
    
    # Add timestamp to list
    timestamp = datetime.now().isoformat()
    redis_client.rpush(key, timestamp)
    
    # Optionally store detailed info
    if proposal_id is not None:
        detail_key = f"proposal_detail:{user_address}:{proposal_id}"
        redis_client.hmset(detail_key, {
            "proposal_id": proposal_id,
            "tx_hash": tx_hash or "",
            "amount_eth": amount_eth,
            "created_at": timestamp
        })
        # Set expiration (optional) - 90 days
        redis_client.expire(detail_key, 90 * 24 * 60 * 60)

"""
4. To integrate into your app, replace in proposal_routes.py:

from redis_setup_example import (
    redis_client,
    check_user_proposal_limit_redis as check_user_proposal_limit,
    record_proposal_creation_redis as record_proposal_creation
)
"""
