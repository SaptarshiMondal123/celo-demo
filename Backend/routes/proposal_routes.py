# backend/routes/proposal_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from blockchain.celo_interact import create_proposal, vote_proposal, get_proposal, execute_proposal
from datetime import datetime, timedelta
from collections import defaultdict

router = APIRouter()

# In-memory storage for proposal tracking (user_address -> list of timestamps)
# In production, use a database like PostgreSQL or Redis
user_proposal_tracking = defaultdict(list)

def check_user_proposal_limit(user_address: str) -> dict:
    """
    Check if user can create a proposal and if they need to pay.
    Returns: {
        "can_create": bool,
        "is_free": bool,
        "proposals_today": int,
        "total_proposals": int,
        "message": str
    }
    """
    user_address = user_address.lower()
    now = datetime.now()
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

# We'll initialize Web3 inside the function to avoid module-level connection issues

# --- Request/Response Models ---
class ProposalCreateRequest(BaseModel):
    title: str = Field(..., description="Short summary title for the proposal")
    description: str = Field(..., description="Longer human-readable description")
    amount_eth: float = Field(..., ge=0, description="Amount to disburse in ETH (0 allowed for first-time users)")
    recipient: str = Field(..., description="Recipient address for funds (NGO / vetted org)")
    user_address: str = Field(..., description="Wallet address of the user creating the proposal")
    fee_paid: float = Field(default=0.0, description="Fee paid by user (0 for first proposal, 0.01+ for subsequent)")

class ProposalCreateResponse(BaseModel):
    tx_hash: str
    proposal_id: Optional[int]
    message: str
    fee_charged: float
    is_free: bool

class ProposalLimitCheckResponse(BaseModel):
    can_create: bool
    is_free: bool
    proposals_today: int
    total_proposals: int
    message: str
    minimum_fee: float

class VoteRequest(BaseModel):
    proposal_id: int
    support: bool

class VoteResponse(BaseModel):
    tx_hash: str
    message: str

class ExecuteResponse(BaseModel):
    tx_hash: str
    message: str
    events: Optional[dict] = None

class ProposalDetailResponse(BaseModel):
    proposal_id: int
    target: str
    value: float
    callData: str
    description: str
    blockStart: int
    blockEnd: int
    yesVotes: int
    noVotes: int
    executed: bool

class ProposalListResponse(BaseModel):
    proposals: List[ProposalDetailResponse]
    total_count: int

# --- Routes ---

@router.get("/check-limit/{user_address}", response_model=ProposalLimitCheckResponse)
async def check_proposal_limit(user_address: str):
    """
    Check if a user can create a proposal and whether it's free.
    """
    result = check_user_proposal_limit(user_address)
    return {
        **result,
        "minimum_fee": 0.0 if result["is_free"] else 0.01
    }

@router.post("/create", response_model=ProposalCreateResponse)
async def create_proposal_endpoint(payload: ProposalCreateRequest):
    try:
        # Check user's proposal limit
        limit_check = check_user_proposal_limit(payload.user_address)
        
        if not limit_check["can_create"]:
            raise HTTPException(status_code=429, detail=limit_check["message"])
        
        # Determine required fee
        required_fee = 0.0 if limit_check["is_free"] else 0.01
        
        # Only validate fee payment if it's not free (i.e., not first proposal)
        if not limit_check["is_free"]:
            if payload.fee_paid < required_fee:
                raise HTTPException(
                    status_code=402, 
                    detail=f"Payment required: {required_fee} CELO for proposal #{limit_check['total_proposals'] + 1}."
                )
        
        # Create the proposal on blockchain
        tx_hash, proposal_id = create_proposal(payload.description, payload.amount_eth, payload.recipient)
        if not tx_hash:
            raise HTTPException(status_code=500, detail="Transaction failed, no tx_hash returned.")

        # Record the proposal creation
        record_proposal_creation(payload.user_address)

        return {
            "tx_hash": tx_hash,
            "proposal_id": proposal_id,
            "message": f"Proposal submitted successfully. {'First proposal - FREE!' if limit_check['is_free'] else f'Fee: {required_fee} CELO'}",
            "fee_charged": required_fee,
            "is_free": limit_check["is_free"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blockchain error: {str(e)}")

@router.post("/vote", response_model=VoteResponse)
async def vote_endpoint(payload: VoteRequest):
    """
    Cast a vote on a given proposal.
    """
    try:
        tx_hash = vote_proposal(payload.proposal_id, payload.support)
        if not tx_hash or not isinstance(tx_hash, str):
            raise HTTPException(status_code=500, detail="Vote transaction failed, no tx_hash returned.")
        return {"tx_hash": tx_hash, "message": "Vote submitted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vote failed: {str(e)}")


@router.post("/execute/{proposal_id}", response_model=ExecuteResponse)
async def execute_endpoint(proposal_id: int):
    """
    Attempts to execute a passed proposal (triggers DAO execution function).
    """
    try:
        result = execute_proposal(proposal_id)
        if not result:
            raise HTTPException(status_code=500, detail="Execute transaction failed, no result returned.")

        # execute_proposal now returns (tx_hash, events)
        if isinstance(result, tuple):
            tx_hash, events = result
        else:
            tx_hash = result
            events = None

        if not tx_hash or not isinstance(tx_hash, str):
            raise HTTPException(status_code=500, detail="Execute transaction failed, no tx_hash returned.")

        return {"tx_hash": tx_hash, "message": "Execute transaction submitted successfully.", "events": events}
    except Exception as e:
        # Surface client-friendly errors for known cases
        msg = str(e)
        if "Voting not ended" in msg or "Proposal already executed" in msg or "did not pass" in msg:
            raise HTTPException(status_code=400, detail=f"Execute failed: {msg}")
        raise HTTPException(status_code=500, detail=f"Execute failed: {msg}")


@router.get("/list", response_model=ProposalListResponse)
async def list_proposals():
    """
    Get all proposals from the blockchain.
    Optimized with batch fetching and caching.
    """
    try:
        # Lazy load Web3 and contract
        from web3 import Web3
        import json, os
        from utils.config_loader import load_env
        from blockchain.celo_interact import get_proposals_batch
        
        env = load_env()
        CELO_RPC = env["CELO_RPC"]
        DAO_CONTRACT = env["DAO_CONTRACT"]
        
        # Increase timeout for connection
        w3 = Web3(Web3.HTTPProvider(CELO_RPC, request_kwargs={'timeout': 120}))
        abi_path = os.path.join(os.path.dirname(__file__), "..", "blockchain", "abi", "EchoDAO.json")
        
        with open(abi_path, "r") as f:
            dao_json = json.load(f)
        dao_abi = dao_json["abi"]
        dao_contract = w3.eth.contract(address=Web3.to_checksum_address(DAO_CONTRACT), abi=dao_abi)
        
        # Get the next proposal ID to know how many proposals exist
        try:
            next_id = dao_contract.functions.nextProposalId().call()
        except Exception as e:
            # If we can't get nextProposalId, there might be no proposals or connection issue
            print(f"Warning: Could not get nextProposalId: {e}")
            return {
                "proposals": [],
                "total_count": 0
            }
        
        total_count = next_id
        
        if total_count == 0:
            return {
                "proposals": [],
                "total_count": 0
            }
        
        # Fetch all proposals in batch (parallel)
        proposal_ids = list(range(total_count))
        proposals_dict = get_proposals_batch(proposal_ids)
        
        # Convert to list format
        proposals = []
        for pid in range(total_count):
            if pid in proposals_dict:
                proposals.append({
                    "proposal_id": pid,
                    **proposals_dict[pid]
                })
        
        return {
            "proposals": proposals,
            "total_count": total_count
        }
    except Exception as e:
        print(f"Error in list_proposals: {e}")
        import traceback
        traceback.print_exc()
        # Return empty list instead of error to avoid frontend timeout
        return {
            "proposals": [],
            "total_count": 0
        }



@router.get("/{proposal_id}", response_model=ProposalDetailResponse)
async def get_proposal_detail(proposal_id: int):
    """
    Get details of a specific proposal by ID.
    """
    try:
        proposal_data = get_proposal(proposal_id)
        if not proposal_data:
            raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")
        
        return {
            "proposal_id": proposal_id,
            **proposal_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch proposal: {str(e)}")