const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EchoDAO", function () {
    let Treasury;
    let EchoDAO;
    let treasury;
    let echoDAO;
    let owner; // The deployer, who is the initial DAO owner
    let addr1; // A regular voter/proposer
    let recipient; // The address to send funds to

    const ETH_AMOUNT = ethers.parseEther("1.0"); // 1 ETH

    // Setup function to deploy contracts before each test
    beforeEach(async function () {
        [owner, addr1, recipient] = await ethers.getSigners();

        // Deploy Treasury
        Treasury = await ethers.getContractFactory("Treasury");
        treasury = await Treasury.deploy();
        
        // Deploy DAO, passing Treasury address
        EchoDAO = await ethers.getContractFactory("EchoDAO");
        echoDAO = await EchoDAO.deploy(await treasury.getAddress());

        // Transfer Treasury ownership to the DAO contract (CRITICAL STEP)
        await treasury.transferOwnership(await echoDAO.getAddress());
        
        // Fund the Treasury for testing
        await owner.sendTransaction({
            to: await treasury.getAddress(),
            value: ETH_AMOUNT, 
        });
    });

    describe("Deployment and Setup", function () {
        it("Should set the correct Treasury address in EchoDAO", async function () {
            expect(await echoDAO.treasury()).to.equal(await treasury.getAddress());
        });

        it("Should transfer Treasury ownership to EchoDAO", async function () {
            expect(await treasury.owner()).to.equal(await echoDAO.getAddress());
        });

        it("Treasury should have the correct initial balance", async function () {
            expect(await treasury.getBalance()).to.equal(ETH_AMOUNT);
        });
    });

    describe("Proposals and Voting", function () {
        let proposalId;
        let callData;
        const releaseAmount = ethers.parseEther("0.5");

        beforeEach(async function () {
             // Encode the call to Treasury's releaseFunds function
            callData = treasury.interface.encodeFunctionData("releaseFunds", [
                recipient.address,
                releaseAmount,
            ]);

            // Create a proposal (addr1 is the proposer)
            const tx = await echoDAO.connect(addr1).createProposal(
                await treasury.getAddress(), // target
                0, // value (no ETH sent with the proposal itself)
                callData, // callData
                "Release 0.5 ETH to Recipient"
            );
            const receipt = await tx.wait();
            proposalId = receipt.events[0].args.id; // Get ID from the event

        });

        it("Should allow voting and update vote counts", async function () {
            // Vote Yes
            await echoDAO.connect(owner).vote(proposalId, true); 
            // Vote No
            await echoDAO.connect(addr1).vote(proposalId, false);

            const proposal = await echoDAO.proposals(proposalId);
            expect(proposal.yesVotes).to.equal(1);
            expect(proposal.noVotes).to.equal(1);
        });

        it("Should not allow double voting", async function () {
            await echoDAO.connect(addr1).vote(proposalId, true);
            await expect(echoDAO.connect(addr1).vote(proposalId, true))
                .to.be.revertedWith("Already voted");
        });
        
        // ... more tests for voting period, quorum, etc.
    });

    describe("Execution", function () {
        // ... test cases for successful execution
        it("Should successfully execute a passing proposal and release funds", async function () {
            // 1. Create Proposal
            const releaseAmount = ETH_AMOUNT;
            const callData = treasury.interface.encodeFunctionData("releaseFunds", [
                recipient.address,
                releaseAmount,
            ]);
            
            const createTx = await echoDAO.connect(owner).createProposal(
                await treasury.getAddress(), 0, callData, "Full Release"
            );
            const createReceipt = await createTx.wait();
            const proposalId = createReceipt.events[0].args.id;

            // 2. Vote (Must be enough YES votes to pass)
            await echoDAO.connect(owner).vote(proposalId, true); 

            // 3. Fast-forward time/blocks to end voting period
            const VOTING_PERIOD_BLOCKS = await echoDAO.VOTING_PERIOD_BLOCKS();
            for (let i = 0; i < VOTING_PERIOD_BLOCKS + 1; i++) {
                await ethers.provider.send('evm_mine');
            }

            // Record balances before execution
            const treasuryBalanceBefore = await ethers.provider.getBalance(await treasury.getAddress());
            const recipientBalanceBefore = await ethers.provider.getBalance(recipient.address);

            // 4. Execute Proposal
            await echoDAO.connect(owner).executeProposal(proposalId);

            // 5. Check results
            const treasuryBalanceAfter = await ethers.provider.getBalance(await treasury.getAddress());
            const recipientBalanceAfter = await ethers.provider.getBalance(recipient.address);
            
            expect(treasuryBalanceAfter).to.equal(0);
            expect(recipientBalanceAfter).to.equal(recipientBalanceBefore + releaseAmount);
        });

        // ... test cases for failed execution (not passed, already executed, not ended)
    });
});