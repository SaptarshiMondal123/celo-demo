# backend/utils/config_loader.py
from dotenv import dotenv_values

def load_env():
    return dotenv_values(".env")