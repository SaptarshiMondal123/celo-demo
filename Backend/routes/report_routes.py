# backend/routes/report_routes.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Union
from ai.summarizer import summarize_report
from ai.truth_verifier import verify_trust_score
from storage.ipfs_handler import upload_to_ipfs
from storage.verify_hash import calculate_file_hash

router = APIRouter()

class ReportResponse(BaseModel):
    filename: str
    ipfs_hash: str
    file_hash: str
    summary: str
    trust_score: int
    credibility: str

@router.post("/submit_report", response_model=ReportResponse)
async def submit_report(file: UploadFile = File(...)):
    """
    Accepts a file (txt/pdf/image), stores encrypted content on IPFS,
    runs AI summarization + trust scoring, and returns an audit payload.
    """
    try:
        # 1) Read as bytes
        content_bytes = await file.read()

        # Optional: handle text files safely
        if file.filename.endswith((".txt", ".csv")):
            try:
                content_text = content_bytes.decode("utf-8")
            except UnicodeDecodeError:
                content_text = ""  # fallback if decoding fails
        else:
            content_text = ""  # for PDFs/images/binary files, pass empty string to AI

        # 2) Calculate hash
        fhash = calculate_file_hash(content_bytes)

        # 3) Upload to IPFS
        ipfs_hash = upload_to_ipfs(content_bytes, file.filename)

        # 4) AI summarize & trust score
        summary = summarize_report(content_text or content_bytes)  # your function must accept bytes
        trust = verify_trust_score(content_text or content_bytes)

        return {
            "filename": file.filename,
            "ipfs_hash": ipfs_hash,
            "file_hash": fhash,
            "summary": summary,
            "trust_score": trust["trust_score"],
            "credibility": trust["credibility"],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process report: {str(e)}")

class VerifyRequest(BaseModel):
    content: str

class VerifyResponse(BaseModel):
    summary: str
    trust_score: int
    credibility: str

@router.post("/verify_report_ai", response_model=VerifyResponse)
async def verify_report_ai(payload: VerifyRequest):
    """
    Endpoint to verify a plain text report using the AI summarizer + trust model (no file).
    Useful for quick testing or frontend demos.
    """
    try:
        summary = summarize_report(payload.content)
        trust = verify_trust_score(payload.content)
        return {
            "summary": summary,
            "trust_score": trust["trust_score"],
            "credibility": trust["credibility"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))