# backend/utils/encryptor.py
from cryptography.fernet import Fernet

def generate_key() -> bytes:
    return Fernet.generate_key()

def encrypt_data(data: bytes, key: bytes) -> bytes:
    return Fernet(key).encrypt(data)

def decrypt_data(token: bytes, key: bytes) -> bytes:
    return Fernet(key).decrypt(token)