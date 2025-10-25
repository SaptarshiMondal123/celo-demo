pragma solidity ^0.8.0;

interface IEchoDAO {
    // --- Functions ---
    function createProposal(
        address _target,
        uint256 _value,
        bytes calldata _callData,
        string calldata _description
    ) external returns (uint256);

    function vote(uint256 _proposalId, bool _support) external;

    function executeProposal(uint256 _proposalId) external;
}