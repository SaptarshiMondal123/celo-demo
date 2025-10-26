# backend/routes/fund_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from blockchain.celo_interact import get_treasury_balance, get_proposal_status, get_treasury_info
import asyncio
from concurrent.futures import ThreadPoolExecutor

router = APIRouter()

# Thread pool for running blocking blockchain calls
executor = ThreadPoolExecutor(max_workers=5)

class BalanceResponse(BaseModel):
    balance_wei: int
    balance_eth: float

@router.get("/treasury_balance", response_model=BalanceResponse)
async def treasury_balance():
    """
    Returns current treasury balance (on Celo / local node).
    Optimized with async execution.
    """
    try:
        # Run blocking call in thread pool
        loop = asyncio.get_event_loop()
        bal = await loop.run_in_executor(executor, get_treasury_balance)
        
        if bal is None:
            raise HTTPException(status_code=500, detail="Failed to fetch treasury balance")
            
        return {"balance_wei": bal, "balance_eth": bal / (10 ** 18)}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching treasury balance: {e}")
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
    Optimized with async execution.
    """
    try:
        # Run blocking call in thread pool
        loop = asyncio.get_event_loop()
        status = await loop.run_in_executor(executor, get_proposal_status, proposal_id)
        
        if not status:
            raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")
            
        return status
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching proposal status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch proposal status: {e}")


class TreasuryInfoResponse(BaseModel):
    treasury: str
    owner: str
    balance_wei: int
    balance_eth: float


@router.get("/treasury_info", response_model=TreasuryInfoResponse)
async def treasury_info():
    """
    Get detailed treasury information.
    Optimized with async execution.
    """
    try:
        # Run blocking call in thread pool
        loop = asyncio.get_event_loop()
        info = await loop.run_in_executor(executor, get_treasury_info)
        
        if not info:
            raise HTTPException(status_code=500, detail="Could not fetch treasury info")
            
        return info
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching treasury info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch treasury info: {e}")