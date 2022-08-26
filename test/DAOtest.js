   const Dao = artifacts.require ("Dao");
   const {expectRevert} = require("@openzeppelin/test-helpers");    
   let dao;

   contract("DAO", (accounts)=>{
      invone=accounts[1];
      invtwo=accounts[2];
      invthree=accounts[3];
      beforeEach(async ()=>{
         dao = await Dao.new(60,60,51)
         await dao.contribute({from:invone,value:web3.utils.toWei('10', 'ether')});
         await dao.contribute({from:invtwo,value:web3.utils.toWei('10', 'ether')});
         await dao.contribute({from:invthree,value:web3.utils.toWei('10', 'ether')})
         await dao.createProposal("test", 9999999999,accounts[9],{from:invone})
      });

      it ("Should contrbute to the total funds", async()=>{
         dao = await Dao.new(60,60,51)
         let fundsBefore = await dao.availableFunds();
         await dao.contribute({value:99});
         let fundsAfter = await dao.availableFunds();
         assert (fundsAfter.toNumber() == fundsBefore.toNumber() + 99 ,"Available funds are incremented")
      });

      it ("Should create a proposal", async()=>{
      let result = await dao.proposals(0);
      assert (result.name == "test", "Proposals are getting added to the proposals mapping")
      });

      it ("Should not create a proposal if msg.sender is not an investor", async()=>{
         await expectRevert (dao.createProposal("test", 9999999999,accounts[9],{from:accounts[5]}),"You are not an investor in the DAO!")

      });

      it ("Should not create a proposal if the requested amount is more than the available funds", async()=>{
         await expectRevert (dao.createProposal("test", web3.utils.toWei('50', 'ether'),accounts[1],{from:accounts[1]}),"Requested funding from this proposal exceeds the funds of the DAO")

      });
      it ("should vote", async ()=>{
         await dao.vote(0, {from:accounts[1]});
         let result = await dao.proposals(0);
         assert(result.votes.toNumber()==10,"shares are incremented for the selecteed proposal") 
    })

})