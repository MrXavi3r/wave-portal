const main = async () => {
  // compile the contract and generates the files needed to interact with it in artifacts
  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");

  // deploy a fresh new contract to the blockchain w/hardhat each time this function runs
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.1"),
  });

  // wait until the contract is successfully deployed
  await waveContract.deployed();

  // this code will run automatically after the contract is deployed
  console.log("Contract deployed to:", waveContract.address);

  // get the current balance of the contract
  let contractBalance = await hre.ethers.provider.getBalance(
    waveContract.address
  );

  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance)
  );

  // send a wave
  let waveTxn = await waveContract.wave('wave #1');
  await waveTxn.wait();

  // send another wave 
  const waveTxn2 = await waveContract.wave("wave #2");
  await waveTxn2.wait();


  contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance)
  );

  let allWaves = await waveContract.getAllWaves();
  console.log(allWaves);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();

const wavePortalAddress = "0xc99e8D81413626c3C037aB632755EcE12805e14c";
