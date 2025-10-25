// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Treasury.sol";
import "./interfaces/IEchoDAO.sol";

/**
 * @title EchoDAO
 * @dev Main contract for proposal, voting, and execution logic.
 */
contract EchoDAO is Ownable, IEchoDAO {
    // --- State variables ---
    Treasury public immutable treasury;
    uint256 public nextProposalId = 1;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Configuration
    uint256 public constant QUORUM_PERCENTAGE = 4; // 4% of total supply must vote 'Yes'
    uint256 public constant VOTING_PERIOD_BLOCKS = 1000; // Approx 4 hours @ 14s/block

    // --- Events ---
    event ProposalCreated(uint256 id, address proposer, uint256 blockStart, uint256 blockEnd, string description);
    event Voted(uint256 id, address voter, bool support);
    event ProposalExecuted(uint256 id);

    // --- Internal Struct ---
    struct Proposal {
        address target;
        uint256 value;
        bytes callData;
        string description;
        uint256 blockStart;
        uint256 blockEnd;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
    }

    // --- Constructor ---
    constructor(address _treasury) Ownable(msg.sender) {
        treasury = Treasury(payable(_treasury));
    }

    // --- Functions ---
    function createProposal(
        address _target,
        uint256 _value,
        bytes calldata _callData,
        string calldata _description
    ) external override returns (uint256) {
        uint256 id = nextProposalId;
        proposals[id] = Proposal({
            target: _target,
            value: _value,
            callData: _callData,
            description: _description,
            blockStart: block.number,
            blockEnd: block.number + VOTING_PERIOD_BLOCKS,
            yesVotes: 0,
            noVotes: 0,
            executed: false
        });

        nextProposalId++;
        emit ProposalCreated(id, msg.sender, block.number, block.number + VOTING_PERIOD_BLOCKS, _description);
        return id;
    }

    function vote(uint256 _proposalId, bool _support) external override {
        Proposal storage proposal = proposals[_proposalId];

        require(proposal.blockStart > 0, "Proposal does not exist");
        require(block.number >= proposal.blockStart, "Voting not started");
        require(block.number <= proposal.blockEnd, "Voting has ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");

        hasVoted[_proposalId][msg.sender] = true;
        if (_support) proposal.yesVotes++;
        else proposal.noVotes++;

        emit Voted(_proposalId, msg.sender, _support);
    }

    function executeProposal(uint256 _proposalId) external override {
        Proposal storage proposal = proposals[_proposalId];

        require(block.number > proposal.blockEnd, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.yesVotes > proposal.noVotes, "Proposal did not pass or quorum failed");

        proposal.executed = true;
        (bool success, ) = proposal.target.call{value: proposal.value}(proposal.callData);
        require(success, "Execution failed");

        emit ProposalExecuted(_proposalId);
    }
}