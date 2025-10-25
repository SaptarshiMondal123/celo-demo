# backend/routes/fund_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from blockchain.celo_interact import get_treasury_balance, get_proposal_status

router = APIRouter()

class BalanceResponse(BaseModel):
    balance_wei: int
    balance_eth: float

@router.get("/treasury_balance", response_model=BalanceResponse)
async def treasury_balance():
    """
    Returns current treasury balance (on Celo / local node).
    """
    try:
        bal = get_treasury_balance()
        return {"balance_wei": bal, "balance_eth": bal / (10 ** 18)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch treasury balance: {e}")

class ProposalStatusResponse(BaseModel):
    proposal_id: int
    yes_votes: int
    no_votes: int
    executed: bool
    block_start: int
    block_end: int

@router.get("/proposal_status/{proposal_id}", response_model=ProposalStatusResponse)
async def proposal_status(proposal_id: int):
    """
    Returns basic on-chain status for a proposal (redacted values only).
    """
    try:
        status = get_proposal_status(proposal_id)
        # expected dict keys: proposal_id, yes_votes, no_votes, executed, block_start, block_end
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch proposal status: {e}")