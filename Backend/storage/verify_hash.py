# backend/storage/verify_hash.py
import hashlib

def calculate_file_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def verify_file_hash(data: bytes, expected_hash: str) -> bool:
    return calculate_file_hash(data) == expected_hash