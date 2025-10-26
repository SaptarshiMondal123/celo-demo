#!/usr/bin/env python3
"""
Polls proposal status and executes it via backend when the voting period ends.
Run from the `Backend` folder with the same Python environment used by the app.
"""
import time
import requests
from web3 import Web3
from utils.config_loader import load_env

env = load_env()
RPC = env.get('CELO_RPC')
BACKEND = 'http://127.0.0.1:8000'  # adjust if your backend is different
PROPOSAL_ID = 3

w3 = Web3(Web3.HTTPProvider(RPC))


def run(proposal_id: int):
    r = requests.get(f'{BACKEND}/funds/proposal_status/{proposal_id}')
    r.raise_for_status()
    status = r.json()
    block_end = status['block_end']
    print('block_end:', block_end)

    while True:
        current = w3.eth.block_number
        remaining = block_end - current
        print(f'current block: {current} — remaining: {remaining}')
        if current > block_end:
            print('Voting ended — executing proposal now.')
            resp = requests.post(f'{BACKEND}/proposals/execute/{proposal_id}')
            print('execute response:', resp.status_code, resp.text)
            break
        time.sleep(30)


if __name__ == '__main__':
    run(PROPOSAL_ID)
