   const Dao = artifacts.require ("Dao");
   const {expectRevert, time} = require("@openzeppelin/test-helpers");    
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
   let dao;

   contract("DAO", (accounts)=>{
      invone=accounts[1];
      invtwo=accounts[2];
      invthree=accounts[3];
      beforeEach(async ()=>{
         dao = await Dao.new(60,60,51)
         await dao.contribute({from:invone,value:web3.utils.toWei('1', 'ether')});
         await dao.contribute({from:invtwo,value:web3.utils.toWei('1', 'ether')});
         await dao.contribute({from:invthree,value:web3.utils.toWei('1', 'ether')})
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
     it("should vote", async ()=>{
         await dao.vote(0, {from:accounts[1]});
         let result = await dao.proposals(0);
         assert(result.votes.toNumber()==1,"shares are incremented for the selecteed proposal") 
    })

    it ("should not double vote for the same proposal", async ()=>{
      await dao.vote(0, {from:invone});

      await expectRevert ( dao.vote(0, {from:invone}),"You have already voted for this proposal") 
    })
    it ("should not allow voting after the proposal has concluded", async ()=>{
      time.increase(65000)
      await expectRevert ( dao.vote(0, {from:accounts[1]}), "Voting for this proposal is over" ) 
     })

     it('Should execute proposal', async () => {
      await dao.vote(0, {from:invone});
      await dao.vote(0, {from:invtwo});
      await dao.vote(0, {from:invthree});
      await time.increase(65000);
      await dao.executeProposal(0);
      let result = await dao.proposals(0);
      assert(result.isExecuted==true);
    });
  
    it('Should NOT execute proposal if not enough votes', async () => {
      dao = await Dao.new(60,60,51)
      await dao.contribute({from:invone,value:web3.utils.toWei('10', 'ether')});
      await dao.createProposal("test", 9999999999,accounts[9],{from:invone})
      await time.increase(65001);
      await expectRevert(
        dao.executeProposal(0),
        'Votes are less than the one,set by the quorum variable'
      );
    });
  
    it('Should NOT execute proposal twice', async () => {
      dao = await Dao.new(60,60,51)
      await dao.contribute({from:invone,value:web3.utils.toWei('10', 'ether')});
      await dao.contribute({from:invtwo,value:web3.utils.toWei('10', 'ether')});
      await dao.createProposal("test", 9999999999,accounts[9],{from:invone})
      await dao.vote(0, {from:invone});
      await dao.vote(0, {from:invtwo});
      await time.increase(65001);
      dao.executeProposal(0)
      await expectRevert(
        dao.executeProposal(0),
        'this proposal has already been executed'
      );  
    });
  
    it('Should NOT execute proposal before end date', async () => {
      dao = await Dao.new(60,60,51)
      await dao.contribute({from:invone,value:web3.utils.toWei('10', 'ether')});
      await dao.createProposal("test", 9999999999,accounts[9],{from:invone})
      expectRevert(
        dao.executeProposal(0),
        'voting for this proposal has not ended'
      );
    });
  
    it('Should withdraw ether', async () => {
      const balanceBefore = await web3.eth.getBalance(accounts[8]);
      await dao.withdraw(10, accounts[8]);
      const balanceAfter = await web3.eth.getBalance(accounts[8]);
      balanceAfterBN = web3.utils.toBN(balanceAfter);
      balanceBeforeBN = web3.utils.toBN(balanceBefore);
      assert(balanceAfterBN.sub(balanceBeforeBN).toNumber() === 10);
    });
  
    it('Should NOT withdraw ether if not admin', async () => {
      await expectRevert(
        dao.withdraw(10, accounts[8], {from: invone}),
        'You are not the admin the DAO!'
      );
    });
  
    it('Should NOT withdraw ether if trying to withdraw too much', async () => {
      await expectRevert(
        dao.withdraw(web3.utils.toWei('31','ether'), accounts[8]),
        'Not enough available funds'
      );
    });





})