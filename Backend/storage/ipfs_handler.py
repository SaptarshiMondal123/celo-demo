# backend/storage/ipfs_handler.py
import requests
import json
from utils.config_loader import load_env

env = load_env()
PINATA_API_KEY = env["PINATA_API_KEY"]
PINATA_SECRET = env["PINATA_SECRET"]

def upload_to_ipfs(file_content: bytes, filename: str):
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    files = {'file': (filename, file_content)}
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET
    }
    response = requests.post(url, files=files, headers=headers)
    response.raise_for_status()
    return response.json()["IpfsHash"]

def fetch_from_ipfs(ipfs_hash: str):
    url = f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}"
    return requests.get(url).content