const DAO = artifacts.require("DAO");

module.exports = function (deployer) {
  deployer.deploy(DAO, 60, 60, 51);
};
