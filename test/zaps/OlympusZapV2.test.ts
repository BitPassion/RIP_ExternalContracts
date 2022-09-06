/* eslint-disable node/no-missing-import */
import { network, ethers } from "hardhat";
import { constants, utils } from "ethers";

import { solidity } from "ethereum-waffle";
import chai from "chai";

import address from "../../libs/constants/address";
import { getSwapQuote } from "../../libs/quote/swap/swap";

import { getBalance } from "../../libs/token/token.helper";
import { exchangeAndApprove, exchange } from "../../libs/exchange/exchange.helper";

import { RipProtocolV2ZapIn, IBondDepoV2 } from "../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import BondId from "../../libs/constants/bondId";

chai.use(solidity);
const { expect } = chai;

const RipProtocolZapArtifact = "RipProtocol_V2_Zap_In";

describe("RipProtocolDAO Zap", () => {
  let ripZap: RipProtocolV2ZapIn;

  let deployer: SignerWithAddress;
  let user: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let RipProtocolDAO: SignerWithAddress;

  const { ETH, DAI, RIP, sRIP, gRIP, SPELL, ALCX, FRAX, UST } = address.tokens;

  before(async () => {
    [deployer, user, RipProtocolDAO, user2, user3] = await ethers.getSigners();

    ripZap = await ethers.getContractFactory(RipProtocolZapArtifact, deployer).then(async factory => {
      return (await factory.deploy(
        address.rip.DEPO_V2,
        address.rip.RipProtocolStaking,
        address.tokens.RIP,
        address.tokens.sRIP,
        address.tokens.gRIP,
      )) as RipProtocolV2ZapIn;
    });

    await ripZap.transferOwnership(RipProtocolDAO.address);
  });

  describe("ZapStake", () => {
    context("to sRIP", () => {
      it("should ZapIn to sRIP using ETH", async () => {
        const amountIn = utils.parseEther("1");
        const fromToken = ETH;
        const toToken = sRIP;

        const { to, data } = await getSwapQuote(fromToken, RIP, amountIn);
        const initialBalance = await getBalance(toToken, user.address);

        await ripZap
          .connect(user)
          .ZapStake(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero, {
            value: amountIn,
          });
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should ZapIn to sRIP using DAI", async () => {
        const fromETH = utils.parseEther("1");
        const fromToken = DAI;
        const toToken = sRIP;

        const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ripZap.address);
        const { to, data } = await getSwapQuote(fromToken, RIP, amountIn);

        const initialBalance = await getBalance(toToken, user.address);
        await ripZap
          .connect(user)
          .ZapStake(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero);
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should ZapIn to sRIP using RIP", async () => {
        const fromETH = utils.parseEther("1");
        const fromToken = RIP;
        const toToken = sRIP;

        const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ripZap.address);
        const { to, data } = await getSwapQuote(fromToken, RIP, amountIn);

        const initialBalance = await getBalance(toToken, user.address);
        await ripZap
          .connect(user)
          .ZapStake(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero);
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should Not allow ZapIn if swap Targets not approved", async () => {
        const fromETH = utils.parseEther("1");
        const fromToken = ETH;
        const toToken = sRIP;

        const { to, data } = await getSwapQuote(fromToken, RIP, fromETH);

        await expect(
          ripZap
            .connect(user2)
            .ZapStake(
              fromToken,
              fromETH,
              toToken,
              1,
              constants.AddressZero,
              data,
              constants.AddressZero,
              { value: fromETH },
            ),
        ).to.be.revertedWith("Target not Authorized");
      });
      it("should revert if slippage is exceeded", async () => {
        const fromETH = utils.parseEther("1");
        const fromToken = RIP;
        const toToken = sRIP;

        const amountIn = await exchangeAndApprove(user2, ETH, fromToken, fromETH, ripZap.address);
        const { to, data } = await getSwapQuote(fromToken, RIP, amountIn);

        await expect(
          ripZap
            .connect(user2)
            .ZapStake(
              fromToken,
              amountIn,
              toToken,
              constants.MaxUint256,
              to,
              data,
              constants.AddressZero,
            ),
        ).to.be.revertedWith("High Slippage");
      });
    });

    context("to gRIP", () => {
      it("should ZapIn to gRIP using ETH", async () => {
        const amountIn = utils.parseEther("1");
        const fromToken = ETH;
        const toToken = gRIP;

        const { to, data } = await getSwapQuote(fromToken, RIP, amountIn);

        const initialBalance = await getBalance(toToken, user.address);
        await ripZap
          .connect(user)
          .ZapStake(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero, {
            value: amountIn,
          });
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should ZapIn to gRIP using DAI", async () => {
        const fromETH = utils.parseEther("1");
        const fromToken = DAI;
        const toToken = gRIP;

        const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ripZap.address);
        const { to, data } = await getSwapQuote(fromToken, RIP, amountIn);

        const initialBalance = await getBalance(toToken, user.address);
        await ripZap
          .connect(user)
          .ZapStake(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero);
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should ZapIn to gRIP using RIP", async () => {
        const fromETH = utils.parseEther("1");
        const fromToken = RIP;
        const toToken = gRIP;

        const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ripZap.address);
        const { to, data } = await getSwapQuote(fromToken, RIP, amountIn);

        const initialBalance = await getBalance(toToken, user.address);
        await ripZap
          .connect(user)
          .ZapStake(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero);
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });
    });
  });

  describe("ZapBond", () => {
    let depository: IBondDepoV2;
    context("Tokens", () => {
      before(async () => {
        depository = (await ethers.getContractAt(
          "contracts/zaps/interfaces/IBondDepoV2.sol:IBondDepoV2",
          address.rip.DEPO_V2,
        )) as IBondDepoV2;
      });
      it("Should create bonds with DAI principal using ETH", async () => {
        const fromToken = ETH;
        const toToken = DAI;

        const bondId = BondId.DAI;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = utils.parseEther("5");

        // getZapInQuote returns an encoded sushiswap Zap in order to get the RIP-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const beforeVesting = (await depository.indexesFor(user.address)).length;

        const maxPrice = await depository.marketPrice(bondId);

        await ripZap
          .connect(user)
          .ZapBond(
            fromToken,
            amountIn,
            toToken,
            to,
            data,
            constants.AddressZero,
            maxPrice,
            bondId,
            {
              value: amountIn,
            },
          );

        const vesting = (await depository.indexesFor(user.address)).length;

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should create bonds with DAI principal using SPELL", async () => {
        const fromToken = SPELL;
        const toToken = DAI;

        const bondId = BondId.DAI;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = await exchangeAndApprove(
          user,
          ETH,
          fromToken,
          utils.parseEther("5"),
          ripZap.address,
        );

        // getZapInQuote returns an encoded sushiswap Zap in order to get the RIP-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const beforeVesting = (await depository.indexesFor(user.address)).length;

        const maxPrice = await depository.marketPrice(bondId);

        await ripZap
          .connect(user)
          .ZapBond(fromToken, amountIn, toToken, to, data, constants.AddressZero, maxPrice, bondId);

        const vesting = (await depository.indexesFor(user.address)).length;

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should create bonds with FRAX principal using ETH", async () => {
        const fromToken = ETH;
        const toToken = FRAX;

        const bondId = BondId.FRAX;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = utils.parseEther("5");

        // getZapInQuote returns an encoded sushiswap Zap in order to get the RIP-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const beforeVesting = (await depository.indexesFor(user.address)).length;

        const maxPrice = await depository.marketPrice(bondId);

        await ripZap
          .connect(user)
          .ZapBond(
            fromToken,
            amountIn,
            toToken,
            to,
            data,
            constants.AddressZero,
            maxPrice,
            bondId,
            { value: amountIn },
          );

        const vesting = (await depository.indexesFor(user.address)).length;

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should create bonds with FRAX principal using SPELL", async () => {
        const fromToken = SPELL;
        const toToken = FRAX;

        const bondId = BondId.FRAX;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = await exchangeAndApprove(
          user,
          ETH,
          fromToken,
          utils.parseEther("5"),
          ripZap.address,
        );

        // getZapInQuote returns an encoded sushiswap Zap in order to get the RIP-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const beforeVesting = (await depository.indexesFor(user.address)).length;

        const maxPrice = await depository.marketPrice(bondId);

        await ripZap
          .connect(user)
          .ZapBond(fromToken, amountIn, toToken, to, data, constants.AddressZero, maxPrice, bondId);

        const vesting = (await depository.indexesFor(user.address)).length;

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should create bonds with UST principal using ETH", async () => {
        const fromToken = ETH;
        const toToken = UST;

        const bondId = BondId.UST;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = utils.parseEther("5");

        // getZapInQuote returns an encoded sushiswap Zap in order to get the RIP-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const beforeVesting = (await depository.indexesFor(user.address)).length;

        const maxPrice = await depository.marketPrice(bondId);

        await ripZap
          .connect(user)
          .ZapBond(
            fromToken,
            amountIn,
            toToken,
            to,
            data,
            constants.AddressZero,
            maxPrice,
            bondId,
            { value: amountIn },
          );

        const vesting = (await depository.indexesFor(user.address)).length;

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should create bonds with UST principal using DAI", async () => {
        const fromToken = DAI;
        const toToken = UST;

        const bondId = BondId.UST;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = await exchangeAndApprove(
          user,
          ETH,
          fromToken,
          utils.parseEther("1"),
          ripZap.address,
        );

        // getZapInQuote returns an encoded sushiswap Zap in order to get the RIP-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const beforeVesting = (await depository.indexesFor(user.address)).length;

        const maxPrice = await depository.marketPrice(bondId);

        await ripZap
          .connect(user)
          .ZapBond(fromToken, amountIn, toToken, to, data, constants.AddressZero, maxPrice, bondId);

        const vesting = (await depository.indexesFor(user.address)).length;

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should not allow to create bonds if swap Target not approved", async () => {
        const fromToken = SPELL;
        const toToken = FRAX;

        const bondId = BondId.FRAX;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = await exchangeAndApprove(
          user3,
          ETH,
          fromToken,
          utils.parseEther("5"),
          ripZap.address,
        );

        // getZapInQuote returns an encoded sushiswap Zap in order to get the RIP-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const maxPrice = await depository.marketPrice(bondId);

        await expect(
          ripZap
            .connect(user3)
            .ZapBond(
              fromToken,
              amountIn,
              toToken,
              constants.AddressZero,
              data,
              constants.AddressZero,
              maxPrice,
              bondId,
            ),
        ).to.be.revertedWith("Target not Authorized");
      });
      it("should revert if slippage is exceeded", async () => {
        const fromToken = SPELL;
        const toToken = FRAX;

        const bondId = BondId.FRAX;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = await exchangeAndApprove(
          user3,
          ETH,
          fromToken,
          utils.parseEther("5"),
          ripZap.address,
        );

        // getZapInQuote returns an encoded sushiswap Zap in order to get the RIP-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const maxPrice = 0;

        await expect(
          ripZap
            .connect(user3)
            .ZapBond(
              fromToken,
              amountIn,
              toToken,
              to,
              data,
              constants.AddressZero,
              maxPrice,
              bondId,
            ),
        ).to.be.revertedWith("Depository: more than max price");
      });
    });
  });

  describe("Security", () => {
    context("Pausable", () => {
      before(async () => {
        await ripZap.connect(RipProtocolDAO).toggleContractActive();
      });
      after(async () => {
        await ripZap.connect(RipProtocolDAO).toggleContractActive();
      });
      it("Should pause ZapStake", async () => {
        const amountIn = utils.parseEther("5");
        const fromToken = ETH;
        const toToken = UST;

        await expect(
          ripZap
            .connect(user)
            .ZapStake(
              fromToken,
              amountIn,
              toToken,
              1,
              constants.AddressZero,
              constants.HashZero,
              constants.AddressZero,
              {
                value: amountIn,
              },
            ),
        ).to.be.revertedWith("Paused");
      });
      it("Should pause ZapBond", async () => {
        const amountIn = utils.parseEther("5");
        const fromToken = ETH;
        const toToken = UST;
        const bondId = BondId.UST;

        await expect(
          ripZap
            .connect(user)
            .ZapBond(
              fromToken,
              amountIn,
              toToken,
              constants.AddressZero,
              constants.HashZero,
              constants.AddressZero,
              0,
              bondId,
              {
                value: amountIn,
              },
            ),
        ).to.be.revertedWith("Paused");
      });

      it("Should only be pausable by RipProtocolDao", async () => {
        await ripZap.connect(RipProtocolDAO).toggleContractActive();
        await expect(ripZap.toggleContractActive()).to.be.revertedWith(
          "Ownable: caller is not the owner",
        );
        await ripZap.connect(RipProtocolDAO).toggleContractActive();
      });
    });
    context("onlyRipProtocolDAO", () => {
      it("Should only allow RipProtocolDAO to update depos", async () => {
        await expect(ripZap.connect(user).update_Depo(constants.AddressZero)).to.be.revertedWith(
          "Ownable: caller is not the owner",
        );
      });
      it("Should only allow RipProtocolDAO to update staking", async () => {
        await expect(ripZap.connect(user).update_Staking(ALCX)).to.be.revertedWith(
          "Ownable: caller is not the owner",
        );
      });
    });
  });
});
