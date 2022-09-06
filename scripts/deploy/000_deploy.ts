/* eslint-disable node/no-unpublished-import */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import address from "../../libs/constants/address";

import "hardhat-deploy";

const contractName = "RipProtocol_V2_Zap_In";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const { DEPO_V2, RipProtocolStaking } = address.rip;
  const { RIP, sRIP, gRIP } = address.tokens;

  const args: any[] = [DEPO_V2, RipProtocolStaking, RIP, sRIP, gRIP];

  console.log("Deploying", contractName, "with", deployer);

  await deploy(contractName, {
    from: deployer,
    args,
    log: true,
  });
};
export default func;
func.tags = [contractName];
