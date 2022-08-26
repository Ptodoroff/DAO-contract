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
uint public quorum;                                         //specifies the amount of votes in % needed for the proposal to pass. Must be an uint between 0 and 100 included

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

modifier onlyAdmin () {
        require(msg.sender ==admin, "You are not the admin the DAO!");
    _;
}


//constructor//
constructor (uint contributionTime,uint _voteTime, uint _quorum) payable {
    contributionEnd = block.timestamp + contributionTime; 
    admin=msg.sender;
    quorum=_quorum;
    voteTime=_voteTime;


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
    totalShares+= msg.value/ 1 ether;           // I set the shares ratio as 1 share per ether deposited
    shares[msg.sender] += msg.value/ 1 ether;
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

  function executeProposal (uint proposalId) external onlyAdmin {
    Proposal storage proposal=proposals[proposalId];
    require (proposal.isExecuted==false,"this proposal has already been executed");
    require (proposal.end  <= block.timestamp,"voting for this proposal has not ended");
    require ((proposal.votes/totalShares)*100 >=quorum, "Votes are less than the one,set by the quorum variable");                        // as quorum is an uint from 0 to 100, I calculate the the fraction of the votes from the total shares and then I multiply it by 100 to conver it into percent and compare it to the quorum variable
    transferEther(proposal.amount, proposal.proposalAddress);
  }

  function transferEther (uint _amount, address payable _address) private {
    require(_amount <= availableFunds, "Amount exceed the available funds in the DAO");
    availableFunds-=_amount;
    _address.transfer(_amount);
  }

  function withdraw (uint _amount, address payable _to) external onlyAdmin {                                                 // Altohugh a controversial function , as the admin may be corrupted, I believe it is better to have an option of transfering the funds than have them "stuck" forever in the contract, in case of a bug.
    transferEther( _amount, _to);
  }

  fallback () external payable {
    availableFunds+=msg.value;
  }




}