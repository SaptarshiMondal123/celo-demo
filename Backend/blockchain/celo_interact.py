from web3 import Web3
from web3.exceptions import ContractLogicError
import json, os, traceback
from utils.config_loader import load_env
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache
import time

# -------------------------------
# Environment & Web3 Setup
# -------------------------------

env = load_env()
CELO_RPC = env["CELO_RPC"]
PRIVATE_KEY = env["PRIVATE_KEY"]
DAO_CONTRACT = env["DAO_CONTRACT"]
TREASURY_CONTRACT_ADDRESS = env["TREASURY_CONTRACT_ADDRESS"]

# Initialize Web3 with increased timeout and connection pooling
w3 = Web3(Web3.HTTPProvider(
    CELO_RPC, 
    request_kwargs={
        'timeout': 120,  # Increased to 120 seconds
    }
))
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

def fund_treasury(amount_eth: float):
    """
    Send CELO from your account to the DAO contract (with EIP-155 chainId for Alfajores).
    """
    try:
        # Use checksum address and let the node estimate gas for a contract transfer.
        to_addr = Web3.to_checksum_address(TREASURY_CONTRACT_ADDRESS)

        base_txn = {
            'to': to_addr,
            'value': Web3.to_wei(amount_eth, 'ether'),
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'chainId': 44787  # Alfajores testnet chainId
        }

        # Estimate gas for sending value to the contract (21000 is only valid for EOA transfers).
        try:
            estimated_gas = w3.eth.estimate_gas(base_txn)
            gas_limit = estimated_gas + 30000  # buffer for safe execution
        except Exception:
            # Fallback to a sensible default if estimate fails
            gas_limit = 150000

        base_txn['gas'] = gas_limit
        base_txn['gasPrice'] = w3.eth.gas_price

        signed = w3.eth.account.sign_transaction(base_txn, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)

        print("💰 Funding Treasury. TX hash:", w3.to_hex(tx_hash))

        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        print("⛏️ Funding mined. Gas used:", tx_receipt.gasUsed)

        # Fetch the raw transaction to confirm target and value
        try:
            tx = w3.eth.get_transaction(tx_hash)
            to_field = tx.get('to')
            value_field = tx.get('value')
            print(f"🔎 Transaction details: to={to_field}, value (wei)={value_field}, value (CELO)={w3.from_wei(value_field, 'ether')}")
        except Exception as e:
            print(f"⚠️ Could not fetch raw transaction details: {e}")

        # Check the treasury balance immediately after mining
        try:
            current_balance = w3.eth.get_balance(to_addr)
            print("🔎 On-chain balance for treasury after funding (CELO):", w3.from_wei(current_balance, 'ether'))
        except Exception as e:
            print(f"⚠️ Could not fetch treasury balance after funding: {e}")

        if tx_receipt.status == 0:
            raise Exception("Funding transaction reverted on-chain!")
        print("✅ Treasury funding confirmed.")
        return w3.to_hex(tx_hash)
    except Exception as e:
        print(f"❌ Treasury funding failed: {e}")
        traceback.print_exc()
        raise

def create_proposal(description: str, amount_eth: float, recipient: str):
    """
    Safely create a proposal on-chain.
    Steps:
    1. Ensure DAO treasury has enough CELO (skip for 0 CELO proposals).
    2. Estimate gas to catch potential revert issues.
    3. Send the transaction and wait for receipt.
    """
    import traceback
    try:
        # --- Check treasury balance (skip for 0 CELO proposals) ---
        balance = w3.eth.get_balance(account.address)
        print("Sender balance (in CELO):", float(w3.from_wei(balance, 'ether')))

        # Use checksum address when reading on-chain balances and normalize to float
        treasury_balance = w3.eth.get_balance(Web3.to_checksum_address(TREASURY_CONTRACT_ADDRESS))
        treasury_eth = float(w3.from_wei(treasury_balance, 'ether'))
        print("Treasury Contract Balance:", treasury_eth, "CELO")

        # Only check and fund treasury if amount > 0
        if amount_eth > 0 and treasury_eth < amount_eth:
            needed = amount_eth - treasury_eth
            print(f"⚠️ Treasury insufficient ({treasury_eth} CELO). Funding {needed} CELO...")
            tx_hash_fund = fund_treasury(needed)
            if not tx_hash_fund:
                raise Exception("Treasury funding failed or not confirmed yet.")

            # Refresh balance with a short polling loop (small block/time propagation delays can occur)
            import time
            attempts = 6
            treasury_addr = Web3.to_checksum_address(TREASURY_CONTRACT_ADDRESS)
            new_balance = None
            for i in range(attempts):
                treasury_balance = w3.eth.get_balance(treasury_addr)
                treasury_eth = float(w3.from_wei(treasury_balance, 'ether'))
                print(f"DAO Treasury attempt {i+1}/{attempts}: {treasury_eth} CELO")
                if treasury_eth >= amount_eth:
                    new_balance = treasury_eth
                    break
                # sleep briefly before retrying
                time.sleep(2)

            if new_balance is None:
                # Final diagnostics: show latest on-chain value and abort with helpful info
                raise Exception(f"Treasury funding not reflected yet on-chain. Last seen: {treasury_eth} CELO; expected >= {amount_eth} CELO. Check tx on explorer or node sync.")
        elif amount_eth == 0:
            print("ℹ️ Creating a 0 CELO proposal (no treasury funding needed)")

        print(f"Creating proposal → {description}")
        print(f"Recipient: {recipient}")
        print(f"Amount (ETH): {amount_eth}")
        print(f"From: {account.address}")

        # --- Estimate gas as a safe simulation ---
        try:
            gas_estimate = dao_contract.functions.createProposal(
                recipient,
                Web3.to_wei(amount_eth, 'ether'),
                b"",
                description
            ).estimate_gas({'from': account.address})
            print("✅ Gas estimate:", gas_estimate)
        except Exception as e:
            raise Exception(f"Transaction likely to fail: {e}")

        # --- Build the actual transaction ---
        txn = dao_contract.functions.createProposal(
            recipient,
            Web3.to_wei(amount_eth, 'ether'),
            b"",
            description
        ).build_transaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': gas_estimate + 10000,  # add buffer
            'gasPrice': w3.eth.gas_price
        })

        # --- Sign & send ---
        signed = w3.eth.account.sign_transaction(txn, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        print("🚀 Sent! TX hash:", w3.to_hex(tx_hash))

        # --- Wait for receipt ---
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print("Raw logs:", tx_receipt["logs"])
        print("⛏️ Mined. Status:", tx_receipt.status)
        if tx_receipt.status == 0:
            raise Exception("Transaction reverted on-chain!")

        # --- Parse proposal ID from event logs ---
        try:
            events = dao_contract.events.ProposalCreated().process_receipt(tx_receipt)
            proposal_id = dao_contract.functions.nextProposalId().call() - 1 if events else None
            print("📜 ProposalCreated event logs:", events)
        except Exception as e:
            print("⚠️ Could not parse ProposalCreated event:", e)
            proposal_id = None

        return w3.to_hex(tx_hash), proposal_id

    except Exception as e:
        print("❌ Blockchain error:", e)
        traceback.print_exc()
        return None, None

def vote_proposal(proposal_id: int, support: bool):
    """
    Cast a vote on a proposal on-chain.
    Returns the real transaction hash.
    """
    try:
        # --- Read proposal metadata to validate voting window and previous votes ---
        try:
            proposal = dao_contract.functions.proposals(proposal_id).call()
            # Proposal struct: target, value, callData, description, blockStart, blockEnd, yesVotes, noVotes, executed
            block_start = int(proposal[4])
            block_end = int(proposal[5])
            executed = bool(proposal[8])
            print(f"🔎 Proposal {proposal_id} metadata: block_start={block_start}, block_end={block_end}, executed={executed}")
        except Exception as e:
            print(f"⚠️ Could not fetch proposal metadata: {e}")

        # Check if caller already voted
        try:
            already_voted = dao_contract.functions.hasVoted(proposal_id, account.address).call()
            print(f"🔎 Caller already voted: {already_voted}")
            if already_voted:
                raise Exception("Address has already voted on this proposal")
        except Exception as e:
            # If the mapping call fails, continue to simulation which will catch on-chain reverts
            print(f"⚠️ Could not read hasVoted mapping: {e}")

        # Quick on-chain simulation to get revert reasons early
        try:
            # .call will raise ContractLogicError with a revert reason when the tx would revert
            dao_contract.functions.vote(proposal_id, support).call({'from': account.address})
            # estimate gas for realistic gas limit
            gas_estimate = dao_contract.functions.vote(proposal_id, support).estimate_gas({'from': account.address})
            gas_to_use = gas_estimate + 50000
            print(f"✅ Vote simulation passed. Gas estimate: {gas_estimate}, using gas: {gas_to_use}")
        except ContractLogicError as cle:
            # Surface the revert reason to the caller
            print(f"❌ Vote simulation failed (ContractLogicError): {cle}")
            raise
        except Exception as e:
            # Generic simulation/estimate failure
            print(f"⚠️ Vote simulation/estimate failed: {e}")
            raise

        # --- Build, sign and send transaction ---
        txn = dao_contract.functions.vote(proposal_id, support).build_transaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': gas_to_use,
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
    Execute a proposal on-chain. Returns the real transaction hash.
    """
    try:
        # --- Read proposal metadata and validate execution pre-conditions ---
        try:
            p = dao_contract.functions.proposals(proposal_id).call()
            block_start = int(p[4])
            block_end = int(p[5])
            yes_votes = int(p[6])
            no_votes = int(p[7])
            executed = bool(p[8])
            print(f"🔎 Proposal {proposal_id}: block_start={block_start}, block_end={block_end}, yes={yes_votes}, no={no_votes}, executed={executed}")
        except Exception as e:
            print(f"⚠️ Could not fetch proposal metadata: {e}")
            raise Exception("Failed to fetch proposal metadata")

        # Basic checks mirroring contract require()s
        if executed:
            raise Exception("Proposal already executed")

        current_block = w3.eth.block_number
        print(f"🔎 Current block: {current_block}")
        if current_block <= block_end:
            raise Exception("Voting not ended; cannot execute yet")

        if yes_votes <= no_votes:
            raise Exception("Proposal did not pass or quorum failed; cannot execute")

        # --- Ensure the DAO is the owner of the Treasury contract (otherwise releaseFunds will revert) ---
        try:
            treasury_addr = Web3.to_checksum_address(TREASURY_CONTRACT_ADDRESS)
            treasury_abi_min = [
                {"inputs": [], "name": "owner", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
                {"inputs": [], "name": "getBalance", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}
            ]
            treasury_contract = w3.eth.contract(address=treasury_addr, abi=treasury_abi_min)
            treasury_owner = treasury_contract.functions.owner().call()
            print(f"🔎 Treasury owner: {treasury_owner}")
            if treasury_owner.lower() != Web3.to_checksum_address(DAO_CONTRACT).lower():
                raise Exception(f"DAO ({DAO_CONTRACT}) is not owner of Treasury ({treasury_owner}); execution will likely revert")
        except Exception as e:
            print(f"⚠️ Could not verify treasury ownership: {e}")
            raise Exception("Failed to verify treasury ownership")

        # --- If the proposal targets the Treasury, decode callData to determine requested amount and
        #     ensure the treasury has sufficient funds before attempting execution (avoids revert).
        try:
            proposal_target = Web3.to_checksum_address(p[0])
            proposal_value_wei = int(p[1])
            call_data = p[2]
            if proposal_target.lower() == treasury_addr.lower() and call_data and len(call_data) >= 4:
                if isinstance(call_data, bytes):
                    calldata_bytes = call_data
                else:
                    calldata_bytes = bytes.fromhex(call_data[2:] if isinstance(call_data, str) and call_data.startswith('0x') else call_data)

                params_bytes = calldata_bytes[4:]
                try:
                    recipient_addr, amount_wei = w3.codec.decode_abi(['address', 'uint256'], params_bytes)
                    amount_wei = int(amount_wei)
                    print(f"🔎 Proposal calls Treasury.releaseFunds -> recipient={recipient_addr}, amount_wei={amount_wei}, amount_eth={w3.from_wei(amount_wei,'ether')}")
                    treasury_balance_wei = int(w3.eth.get_balance(treasury_addr))
                    print(f"🔎 Treasury balance (wei): {treasury_balance_wei}, (CELO): {w3.from_wei(treasury_balance_wei,'ether')}")
                    if treasury_balance_wei < amount_wei:
                        raise Exception(f"Treasury has insufficient funds: {w3.from_wei(treasury_balance_wei,'ether')} CELO < required {w3.from_wei(amount_wei,'ether')} CELO")
                except Exception as e:
                    print(f"⚠️ Could not decode Treasury callData or validate balance: {e}")
        except Exception as e:
            print(f"⚠️ Error while inspecting proposal target/callData: {e}")

        # --- Simulation to surface revert reasons and estimate gas ---
        try:
            dao_contract.functions.executeProposal(proposal_id).call({'from': account.address})
            gas_estimate = dao_contract.functions.executeProposal(proposal_id).estimate_gas({'from': account.address})
            gas_to_use = gas_estimate + 100000
            print(f"✅ Execute simulation passed. Gas estimate: {gas_estimate}, using gas: {gas_to_use}")
        except ContractLogicError as cle:
            print(f"❌ Execute simulation failed (ContractLogicError): {cle}")
            # Decode revert reason if possible
            if hasattr(cle, 'args') and len(cle.args) > 1:
                revert_reason = cle.args[1]
                print(f"🔎 Revert reason: {revert_reason}")
            raise Exception("Simulation failed due to contract logic error")
        except Exception as e:
            print(f"⚠️ Execute simulation/estimate failed: {e}")
            raise Exception("Simulation or gas estimation failed")

        # --- Build, sign & send ---
        try:
            txn = dao_contract.functions.executeProposal(proposal_id).build_transaction({
                'from': account.address,
                'nonce': w3.eth.get_transaction_count(account.address),
                'gas': gas_to_use,
                'gasPrice': w3.eth.gas_price
            })
            signed = w3.eth.account.sign_transaction(txn, PRIVATE_KEY)
            tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)

            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            print("⛏️ Execution mined. Status:", receipt.status)

            if receipt.status == 0:
                try:
                    print("Raw logs:", receipt.get('logs'))
                except Exception:
                    pass
                raise Exception("Execute transaction reverted on-chain!")

            events = None
            try:
                events = dao_contract.events.ProposalExecuted().process_receipt(receipt)
                print("📣 ProposalExecuted events:", events)
            except Exception as e:
                print(f"⚠️ Could not parse ProposalExecuted event: {e}")

            return w3.to_hex(tx_hash), events

        except Exception as e:
            print(f"❌ Transaction signing or sending failed: {e}")
            raise Exception("Failed to sign or send transaction")

    except Exception as e:
        print(f"❌ Execute transaction failed: {e}")
        traceback.print_exc()
        raise


def get_proposal(proposal_id: int):
    """
    Return a human-friendly proposal dict for a given proposal_id.
    Optimized with better error handling and timeout management.
    """
    try:
        p = dao_contract.functions.proposals(proposal_id).call()
        return {
            "target": p[0],
            "value": w3.from_wei(p[1], 'ether'),
            "callData": p[2],
            "description": p[3],
            "blockStart": p[4],
            "blockEnd": p[5],
            "yesVotes": p[6],
            "noVotes": p[7],
            "executed": p[8]
        }
    except Exception as e:
        print(f"❌ Failed to get proposal {proposal_id}: {e}")
        return None


def get_proposals_batch(proposal_ids: list) -> dict:
    """
    Fetch multiple proposals in parallel using ThreadPoolExecutor.
    Returns dict mapping proposal_id -> proposal_data
    """
    results = {}
    
    def fetch_single(pid):
        return pid, get_proposal(pid)
    
    # Use ThreadPoolExecutor for parallel fetching (max 10 concurrent)
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fetch_single, pid): pid for pid in proposal_ids}
        
        for future in as_completed(futures, timeout=100):
            try:
                pid, data = future.result()
                if data:
                    results[pid] = data
            except Exception as e:
                print(f"Error fetching proposal in batch: {e}")
                continue
    
    return results


def get_proposal_status(proposal_id: int):
    try:
        p = dao_contract.functions.proposals(proposal_id).call()
        # p: target, value, callData, description, blockStart, blockEnd, yesVotes, noVotes, executed
        return {
            "proposal_id": proposal_id,
            "yes_votes": int(p[6]),
            "no_votes": int(p[7]),
            "executed": bool(p[8]),
            "block_start": int(p[4]),
            "block_end": int(p[5])
        }
    except Exception as e:
        print(f"❌ Failed to get proposal status: {e}")
        traceback.print_exc()
        return None


def get_treasury_balance():
    """Return the treasury balance in wei (int)."""
    try:
        treasury_addr = Web3.to_checksum_address(TREASURY_CONTRACT_ADDRESS)
        balance_wei = w3.eth.get_balance(treasury_addr)
        return int(balance_wei)
    except Exception as e:
        print(f"❌ Failed to get treasury balance: {e}")
        traceback.print_exc()
        return None


def get_treasury_info():
    """Return treasury address, owner and balances (wei and eth)."""
    try:
        treasury_addr = Web3.to_checksum_address(TREASURY_CONTRACT_ADDRESS)
        treasury_abi_min = [
            {"inputs": [], "name": "owner", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
            {"inputs": [], "name": "getBalance", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}
        ]
        tc = w3.eth.contract(address=treasury_addr, abi=treasury_abi_min)
        owner = tc.functions.owner().call()
        bal = int(tc.functions.getBalance().call())
        return {
            "treasury": treasury_addr,
            "owner": owner,
            "balance_wei": bal,
            "balance_eth": float(w3.from_wei(bal, 'ether'))
        }
    except Exception as e:
        print(f"❌ Failed to get treasury info: {e}")
        traceback.print_exc()
        return None