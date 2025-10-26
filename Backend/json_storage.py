# Simple JSON File Storage for Proposal Tracking
# This is a QUICK FIX for testing - NOT recommended for production!

import json
import os
from datetime import datetime
from collections import defaultdict
from threading import Lock

# File path for storage
STORAGE_FILE = "proposal_tracking.json"
file_lock = Lock()

def load_proposal_data():
    """Load proposal tracking data from JSON file"""
    if os.path.exists(STORAGE_FILE):
        try:
            with open(STORAGE_FILE, 'r') as f:
                data = json.load(f)
                # Convert ISO strings back to datetime
                result = defaultdict(list)
                for address, timestamps in data.items():
                    result[address] = [datetime.fromisoformat(ts) for ts in timestamps]
                return result
        except Exception as e:
            print(f"Error loading proposal data: {e}")
            return defaultdict(list)
    return defaultdict(list)

def save_proposal_data(data):
    """Save proposal tracking data to JSON file"""
    try:
        # Convert datetime to ISO strings for JSON serialization
        json_data = {}
        for address, timestamps in data.items():
            json_data[address] = [ts.isoformat() for ts in timestamps]
        
        with file_lock:
            with open(STORAGE_FILE, 'w') as f:
                json.dump(json_data, f, indent=2)
    except Exception as e:
        print(f"Error saving proposal data: {e}")

# Load existing data on module import
user_proposal_tracking = load_proposal_data()

def check_user_proposal_limit(user_address: str) -> dict:
    """Check if user can create a proposal and if they need to pay."""
    user_address = user_address.lower()
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Get user's proposal history
    proposal_times = user_proposal_tracking[user_address]
    
    # Filter proposals from today
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

def record_proposal_creation(user_address: str):
    """Record that user created a proposal"""
    user_address = user_address.lower()
    user_proposal_tracking[user_address].append(datetime.now())
    
    # Save to file
    save_proposal_data(user_proposal_tracking)

"""
To use this, replace the functions in proposal_routes.py with:

from json_storage import (
    check_user_proposal_limit,
    record_proposal_creation
)
"""
