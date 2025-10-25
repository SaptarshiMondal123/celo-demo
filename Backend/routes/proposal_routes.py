# backend/routes/proposal_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from blockchain.celo_interact import create_proposal, vote_proposal, get_proposal, execute_proposal

router = APIRouter()

# --- Request/Response Models ---
class ProposalCreateRequest(BaseModel):
    title: str = Field(..., description="Short summary title for the proposal")
    description: str = Field(..., description="Longer human-readable description")
    amount_eth: float = Field(..., gt=0, description="Amount to disburse in ETH")
    recipient: str = Field(..., description="Recipient address for funds (NGO / vetted org)")

class ProposalCreateResponse(BaseModel):
    tx_hash: str
    proposal_id: Optional[int]
    message: str

class VoteRequest(BaseModel):
    proposal_id: int
    support: bool

class VoteResponse(BaseModel):
    tx_hash: str
    message: str

class ExecuteResponse(BaseModel):
    tx_hash: str
    message: str

# --- Routes ---
@router.post("/create", response_model=ProposalCreateResponse)
async def create_proposal_endpoint(payload: ProposalCreateRequest):
    try:
        tx_hash, proposal_id = create_proposal(payload.description, payload.amount_eth, payload.recipient)
        if not tx_hash:
            raise HTTPException(status_code=500, detail="Transaction failed, no tx_hash returned.")
        return {
            "tx_hash": tx_hash,
            "proposal_id": proposal_id,
            "message": "Proposal submitted successfully."
        }
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
        tx_hash = execute_proposal(proposal_id)
        if not tx_hash or not isinstance(tx_hash, str):
            raise HTTPException(status_code=500, detail="Execute transaction failed, no tx_hash returned.")
        return {"tx_hash": tx_hash, "message": "Execute transaction submitted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execute failed: {str(e)}")