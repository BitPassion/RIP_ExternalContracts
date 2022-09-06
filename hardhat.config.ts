import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-tracer";
import "hardhat-deploy";
import address from "./libs/constants/address";

dotenv.config();

const DEPLOYER_ACCOUNT = 1; // Uses account 2 on all networks

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const contractName_Zap = "RipProtocol_V2_Zap_In";

task("deploy-zap-v2", "", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const { DEPO_V2, RipProtocolStaking } = address.rip;
  const { RIP, sRIP, gRIP } = address.tokens;

  const args: any[] = [DEPO_V2, RipProtocolStaking, RIP, sRIP, gRIP];

  console.log("Deploying", contractName_Zap, "with", accounts[0].address);

  const zap_v2 = await deploy(contractName_Zap, {
    from: accounts[0].address,
    args,
    log: true,
  });
  console.log("zap-v2 deployed: ", zap_v2.address);
  console.log(
    `To verify: npx hardhat verify ${zap_v2.address} ${DEPO_V2} ${RipProtocolStaking} ${RIP} ${sRIP} ${gRIP}`,
  );
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.7.5",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: DEPLOYER_ACCOUNT,
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
    deploy: "./scripts/deploy",
    deployments: "./deployments",
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAINNET_URL || "",
      },
    },
    mainnet: {
      url: process.env.MAINNET_URL || "",
      accounts: {
        mnemonic: process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY : "",
      },
    },
    bsc_test: {
      url: process.env.BSC_TEST_URL || "",
      accounts: [process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY : ""],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY,
  },
  mocha: {
    timeout: 600000,
  },
};

export default config;
