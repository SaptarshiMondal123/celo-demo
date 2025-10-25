from web3 import Web3
from web3.exceptions import ContractLogicError
import json, os, traceback
from utils.config_loader import load_env

# -------------------------------
# Environment & Web3 Setup
# -------------------------------

env = load_env()
CELO_RPC = env["CELO_RPC"]
PRIVATE_KEY = env["PRIVATE_KEY"]
DAO_CONTRACT = env["DAO_CONTRACT"]

w3 = Web3(Web3.HTTPProvider(CELO_RPC))
account = w3.eth.account.from_key(PRIVATE_KEY)

# Load DAO ABI
abi_path = os.path.join(os.path.dirname(__file__), "abi", "EchoDAO.json")
with open(abi_path, "r") as f:
    dao_json = json.load(f)
dao_abi = dao_json["abi"]

dao_contract = w3.eth.contract(address=Web3.to_checksum_address(DAO_CONTRACT), abi=dao_abi)

# -------------------------------
# Proposal Functions (Real)
# -------------------------------

def create_proposal(description: str, amount_eth: float, recipient: str):
    """
    Create a real proposal on the DAO contract.
    Returns the transaction hash and proposal ID if successful.
    """
    try:
        print(f"Creating proposal → {description}")
        print(f"Recipient: {recipient}")
        print(f"Amount (ETH): {amount_eth}")
        print(f"From: {account.address}")

        txn = dao_contract.functions.createProposal(
            recipient,
            Web3.to_wei(amount_eth, 'ether'),
            b"",
            description
        ).build_transaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': 3000000,
            'gasPrice': w3.eth.gas_price
        })

        signed = w3.eth.account.sign_transaction(txn, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        print("🚀 Sent! TX hash:", w3.to_hex(tx_hash))

        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print("⛏️ Mined. Status:", receipt.status)

        if receipt.status == 0:
            raise Exception("Transaction reverted on-chain!")

        # Try to parse ProposalCreated event
        proposal_id = None
        try:
            events = dao_contract.events.ProposalCreated().process_receipt(receipt)
            if events and len(events) > 0:
                proposal_id = dao_contract.functions.nextProposalId().call() - 1
            print("📜 ProposalCreated event logs:", events)
        except Exception as e:
            print("⚠️ Could not parse ProposalCreated event:", e)

        return w3.to_hex(tx_hash), proposal_id

    except Exception as e:
        print("❌ Blockchain error:", e)
        traceback.print_exc()
        raise

def vote_proposal(proposal_id: int, support: bool):
    """
    Cast a vote on a proposal on-chain.
    Returns the real transaction hash.
    """
    try:
        txn = dao_contract.functions.vote(proposal_id, support).build_transaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': 3000000,
            'gasPrice': w3.eth.gas_price
        })
        signed = w3.eth.account.sign_transaction(txn, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)

        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print("⛏️ Vote mined. Status:", receipt.status)

        if receipt.status == 0:
            raise Exception("Vote transaction reverted on-chain!")

        return w3.to_hex(tx_hash)

    except Exception as e:
        print(f"❌ Vote transaction failed: {e}")
        traceback.print_exc()
        raise

def execute_proposal(proposal_id: int):
    """
    Execute a proposal on-chain.
    Returns the real transaction hash.
    """
    try:
        txn = dao_contract.functions.executeProposal(proposal_id).build_transaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': 3000000,
            'gasPrice': w3.eth.gas_price
        })
        signed = w3.eth.account.sign_transaction(txn, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)

        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print("⛏️ Execution mined. Status:", receipt.status)

        if receipt.status == 0:
            raise Exception("Execute transaction reverted on-chain!")

        return w3.to_hex(tx_hash)

    except Exception as e:
        print(f"❌ Execute transaction failed: {e}")
        traceback.print_exc()
        raise

# -------------------------------
# Read-only Helpers
# -------------------------------

def get_proposal(proposal_id: int):
    p = dao_contract.functions.getProposal(proposal_id).call()
    return {
        "recipient": p[0],
        "amount": w3.from_wei(p[1], 'ether'),
        "description_bytes": p[2],
        "description_str": p[3],
        "votes_for": p[4],
        "votes_against": p[5],
        "executed": p[6]
    }

def get_treasury_balance():
    try:
        balance_wei = w3.eth.get_balance(DAO_CONTRACT)
        return w3.from_wei(balance_wei, 'ether')
    except Exception as e:
        print(f"❌ Failed to get treasury balance: {e}")
        return None

def get_proposal_status(proposal_id: int):
    try:
        status = dao_contract.functions.proposals(proposal_id).call()
        return status
    except Exception as e:
        print(f"❌ Failed to get proposal status: {e}")
        return None