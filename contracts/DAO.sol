pragma solidity 0.8.15;

contract DAO {

// variables //
mapping(address=>bool) public isInvestor ;
mapping (address=>uint) public shares;
mapping (uint=>Proposal) public proposals;                  //a mapping to track the created proposals
mapping (address=>mapping(uint=>bool)) public votes;        //stores a bool for if a certain address has voted for a specific proposal
uint public totalShares;
uint public availableFunds;
uint public contributionEnd;                                //following the closed contribution model for this DAO contract, I define a time , after which, contribution is not possible
uint public nextProposalId;
uint public voteTime;
uint public quorum;                                         //specifies the amount of votes needed for the proposal to pass

address public admin;

struct Proposal {                                            // each proposal represents a struct with the following data
    uint id;
    string name;
    uint amount;
    address payable proposalAddress;
    uint votes;
    uint end;
    bool isExecuted;

}

//modifiers//

modifier onlyInvestor (){
    require(isInvestor[msg.sender]==true, "You are not an investor in the DAO!");
    _;
}


//constructor//
constructor (uint contributionTime) {
    contributionEnd = block.timestamp + contributionTime; 

}
 //functions //

 function createProposal (string memory _name,uint _amount,address payable _proposalAddress) external  onlyInvestor{
    require(isInvestor[msg.sender], "The proposer is not an investor");
    require(availableFunds<=_amount, "Requested funding from this proposal exceeds the funds of the DAO"); 
    proposals[nextProposalId] = Proposal (
        nextProposalId,
        _name,
        _amount,
        _proposalAddress,
         0,
        block.timestamp + voteTime,
        false
    );
    availableFunds -= _amount;                         //allocating funds for the proposal upon its creation
    nextProposalId ++;
 }

 function vote (uint proposalId) external  onlyInvestor {
    Proposal storage proposal = proposals[proposalId];
    require (votes[msg.sender][proposalId]==false, "You have already voted for this proposal");
    require (block.timestamp < proposal.end ,"Voting for this proposal is over");
    votes[msg.sender][proposalId]==true;
    proposal.votes += shares[msg.sender];           // I could also define it as shares[msg.sender]/totalShares but chose the former for simplicity reasons
 }


 function contribute () external payable {
    require(block.timestamp < contributionEnd, "The contribution period is over");
    availableFunds+=msg.value;
    isInvestor[msg.sender]=true;
    totalShares= msg.value/ 1 ether;           // I set the shares ratio as 1 share per ether deposited
    shares[msg.sender] = msg.value/ 1 ether;
 }

  function redeemShare (uint _amount ) external {
    require (shares[msg.sender]>=_amount, "Not enough shares");
    require (availableFunds >= _amount, "Not enough available funds");
    shares[msg.sender] -= _amount;
    availableFunds-=_amount;
    payable(msg.sender).transfer(_amount * 1 ether);

  }

  function transferShare (uint _amount, address _to) external {
   require (shares[msg.sender]>=_amount, "Not enough shares");
   shares[msg.sender]-= _amount;
   shares[_to] += _amount;
   isInvestor[_to]= true;


  }



}