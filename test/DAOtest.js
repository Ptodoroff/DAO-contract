const Dao = artifacts.require ("Dao");
const {expectRevert} = require("@openzeppelin/test-helpers");    
let dao;

contract("DAO", (accounts)=>{
    invone=accounts[1];
    invtwo=accounts[2];
    invthree=accounts[3];
    beforeEach(async ()=>{
       dao = await Dao.new(60,60,51)
        await dao.contribute({from:invone,value:9999999999});
        await dao.contribute({from:invtwo,value:9999999999});
        await dao.contribute({from:invthree,value:9999999999});
       await dao.createProposal("test", 9999999999,accounts[9],{from:invone})
    });

    it ("Should create a proposal", async()=>{
    let result = await dao.proposals(0);
    assert (result.name == "test", "Proposals are getting added to the proposals mapping")
   });

   it ("Should contrbute to the total funds", async()=>{
      let fundsBefore = await dao.availableFunds();
       await dao.contribute({value:999999});
      let fundsAfter = await dao.availableFunds();
      assert ((fundsAfter).toNumber()  == (fundsBefore).toNumber() + 999999 ,"Available funds are incremented")
     });

})