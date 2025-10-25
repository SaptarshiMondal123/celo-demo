# backend/utils/validator.py
def is_valid_eth_address(address: str) -> bool:
    return address.startswith("0x") and len(address) == 42