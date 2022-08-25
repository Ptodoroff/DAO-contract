pragma solidity 0.8.15;

contract DAO {

// variables //
mapping(address=>bool) public isInvestor ;
mapping (address=>uint) public shares;
uint public totalShares;
uint public totalBalance;
uint public contributionEnd;


//constructor//
constructor (uint contributionTime) {
    contributionEnd = block.timestamp + contributionTime; 

}
 //functions //

 function contribute () external payable {
    require(block.timestamp < contributionEnd, "The contribution period is over");
    totalBalance+=msg.value;
    isInvestor[msg.sender]=true;
    totalShares= msg.value/ 1 ether;           // I set the shares ratio as 1 share per ether deposited
    shares[msg.sender] = msg.value/ 1 ether;
 }



}