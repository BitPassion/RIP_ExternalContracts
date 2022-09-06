// /* eslint-disable node/no-missing-import */
// import { network, ethers } from "hardhat";
// import { constants, BigNumber, utils, Signer } from "ethers";

// import { solidity } from "ethereum-waffle";
// import chai from "chai";

// import address from "../../libs/constants/address";
// import { getSwapQuote } from "../../libs/quote/swap/swap";

// import { approveToken, getBalance } from "../../libs/token/token.helper";
// import { exchangeAndApprove } from "../../libs/exchange/exchange.helper";

// import { IBondDepository, RipProtocolZap } from "../../typechain";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { getZapInQuote } from "../../libs/quote/zap/zap";
// import protocol from "../../libs/quote/zap/protocol";

// chai.use(solidity);
// const { expect } = chai;

// const RipProtocolZapArtifact = "RipProtocol_Zap_V2";

// describe("RipProtocolDAO Zap", () => {
//   let ripZap: RipProtocolZap;

//   let deployer: SignerWithAddress;
//   let user: SignerWithAddress;
//   let RipProtocolDAO: SignerWithAddress;
//   let zapperAdmin: Signer;

//   const zapperAdminAddress = "0x3CE37278de6388532C3949ce4e886F365B14fB56";

//   const { ETH, DAI, RIP, sRIP, wsRIP, SPELL, ALCX } = address.tokens;
//   const { RIP_LUSD, RIP_DAI, ALCX_ETH } = address.sushiswap;
//   const { RIP_FRAX } = address.uniswap;

//   const { RIP_LUSD_DEPO, RIP_DAI_DEPO, DAI_DEPO, ALCX_ETH_DEPO, RIP_FRAX_DEPO } = address.rip;

//   before(async () => {
//     [deployer, user, RipProtocolDAO] = await ethers.getSigners();
//     // impersonate zapper admin
//     await network.provider.request({
//       method: "hardhat_impersonateAccount",
//       params: [zapperAdminAddress],
//     });
//     zapperAdmin = await ethers.provider.getSigner(zapperAdminAddress);

//     ripZap = await ethers.getContractFactory(RipProtocolZapArtifact, deployer).then(async factory => {
//       return (await factory.deploy(0, 0, RipProtocolDAO.address)) as RipProtocolZap;
//     });
//   });

//   describe("ZapIn", () => {
//     context("to sRIP", () => {
//       it("should ZapIn to sRIP using ETH", async () => {
//         const amountIn = utils.parseEther("1");
//         const fromToken = ETH;
//         const toToken = sRIP;

//         const { to, data } = await getSwapQuote(fromToken, RIP, amountIn);
//         const initialBalance = await getBalance(toToken, user.address);

//         await ripZap
//           .connect(user)
//           .ZapIn(
//             fromToken,
//             amountIn,
//             toToken,
//             1,
//             to,
//             data,
//             constants.AddressZero,
//             constants.AddressZero,
//             0,
//             false,
//             {
//               value: amountIn,
//             },
//           );
//         const finalBalance = await getBalance(toToken, user.address);
//         expect(finalBalance).to.be.gt(initialBalance);
//       });

//       it("should ZapIn to sRIP using DAI", async () => {
//         const fromETH = utils.parseEther("1");
//         const fromToken = DAI;
//         const toToken = sRIP;

//         const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ripZap.address);
//         const { to, data } = await getSwapQuote(fromToken, RIP, amountIn);

//         const initialBalance = await getBalance(toToken, user.address);
//         await ripZap
//           .connect(user)
//           .ZapIn(
//             fromToken,
//             amountIn,
//             toToken,
//             1,
//             to,
//             data,
//             constants.AddressZero,
//             constants.AddressZero,
//             0,
//             false,
//           );
//         const finalBalance = await getBalance(toToken, user.address);
//         expect(finalBalance).to.be.gt(initialBalance);
//       });

//       it("should ZapIn to sRIP using RIP", async () => {
//         const fromETH = utils.parseEther("1");
//         const fromToken = RIP;
//         const toToken = sRIP;

//         const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ripZap.address);
//         const { to, data } = await getSwapQuote(fromToken, RIP, amountIn);

//         const initialBalance = await getBalance(toToken, user.address);
//         await ripZap
//           .connect(user)
//           .ZapIn(
//             fromToken,
//             amountIn,
//             toToken,
//             1,
//             to,
//             data,
//             constants.AddressZero,
//             constants.AddressZero,
//             0,
//             false,
//           );
//         const finalBalance = await getBalance(toToken, user.address);
//         expect(finalBalance).to.be.gt(initialBalance);
//       });
//     });

//     context("to wsRIP", () => {
//       it("should ZapIn to wsRIP using ETH", async () => {
//         const amountIn = utils.parseEther("1");
//         const fromToken = ETH;
//         const toToken = wsRIP;

//         const { to, data } = await getSwapQuote(fromToken, RIP, amountIn);

//         const initialBalance = await getBalance(toToken, user.address);
//         await ripZap
//           .connect(user)
//           .ZapIn(
//             fromToken,
//             amountIn,
//             toToken,
//             1,
//             to,
//             data,
//             constants.AddressZero,
//             constants.AddressZero,
//             0,
//             false,
//             {
//               value: amountIn,
//             },
//           );
//         const finalBalance = await getBalance(toToken, user.address);
//         expect(finalBalance).to.be.gt(initialBalance);
//       });

//       it("should ZapIn to wsRIP using DAI", async () => {
//         const fromETH = utils.parseEther("1");
//         const fromToken = DAI;
//         const toToken = wsRIP;

//         const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ripZap.address);
//         const { to, data } = await getSwapQuote(fromToken, RIP, amountIn);

//         const initialBalance = await getBalance(toToken, user.address);
//         await ripZap
//           .connect(user)
//           .ZapIn(
//             fromToken,
//             amountIn,
//             toToken,
//             1,
//             to,
//             data,
//             constants.AddressZero,
//             constants.AddressZero,
//             0,
//             false,
//           );
//         const finalBalance = await getBalance(toToken, user.address);
//         expect(finalBalance).to.be.gt(initialBalance);
//       });

//       it("should ZapIn to wsRIP using RIP", async () => {
//         const fromETH = utils.parseEther("1");
//         const fromToken = RIP;
//         const toToken = wsRIP;

//         const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ripZap.address);
//         const { to, data } = await getSwapQuote(fromToken, RIP, amountIn);

//         const initialBalance = await getBalance(toToken, user.address);
//         await ripZap
//           .connect(user)
//           .ZapIn(
//             fromToken,
//             amountIn,
//             toToken,
//             1,
//             to,
//             data,
//             constants.AddressZero,
//             constants.AddressZero,
//             0,
//             false,
//           );
//         const finalBalance = await getBalance(toToken, user.address);
//         expect(finalBalance).to.be.gt(initialBalance);
//       });
//     });
//   });

//   describe("ZapOut", () => {
//     context("from sRIP", () => {
//       let sRIPAmount: BigNumber;
//       before(async () => {
//         // ZapIn
//         const amountIn = utils.parseEther("1");
//         const fromToken = ETH;
//         const toToken = sRIP;

//         const quote = await getSwapQuote(fromToken, RIP, amountIn);
//         await ripZap
//           .connect(user)
//           .ZapIn(
//             fromToken,
//             amountIn,
//             toToken,
//             1,
//             quote.to,
//             quote.data,
//             constants.AddressZero,
//             constants.AddressZero,
//             0,
//             false,
//             {
//               value: amountIn,
//             },
//           );
//         const sRIPBalance = await getBalance(toToken, user.address);
//         sRIPAmount = sRIPBalance.div(4);

//         // approve Zap
//         await approveToken(sRIP, user, ripZap.address);
//       });

//       it("should ZapOut from sRIP to ETH", async () => {
//         const fromToken = sRIP;
//         const toToken = ETH;
//         const { to, data } = await getSwapQuote(RIP, toToken, sRIPAmount);

//         const initialBalance = await user.getBalance();
//         await ripZap
//           .connect(user)
//           .ZapOut(fromToken, sRIPAmount, toToken, 1, to, data, constants.AddressZero);
//         const finalBalance = await user.getBalance();
//         expect(finalBalance).to.be.gt(initialBalance);
//       });

//       it("should ZapOut from sRIP to DAI", async () => {
//         const fromToken = sRIP;
//         const toToken = DAI;
//         const { to, data } = await getSwapQuote(RIP, toToken, sRIPAmount);

//         const initialBalance = await getBalance(toToken, user.address);
//         await ripZap
//           .connect(user)
//           .ZapOut(fromToken, sRIPAmount, toToken, 1, to, data, constants.AddressZero);
//         const finalBalance = await getBalance(toToken, user.address);
//         expect(finalBalance).to.be.gt(initialBalance);
//       });

//       it("should ZapOut from sRIP to RIP", async () => {
//         const fromToken = sRIP;
//         const toToken = RIP;
//         const { to, data } = await getSwapQuote(RIP, toToken, sRIPAmount);

//         const initialBalance = await getBalance(toToken, user.address);
//         await ripZap
//           .connect(user)
//           .ZapOut(fromToken, sRIPAmount, toToken, 1, to, data, constants.AddressZero);
//         const finalBalance = await getBalance(toToken, user.address);
//         expect(finalBalance).to.be.gt(initialBalance);
//       });
//     });

//     context("from wsRIP", () => {
//       let wsRIPAmount: BigNumber;
//       before(async () => {
//         // ZapIn
//         const amountIn = utils.parseEther("1");
//         const fromToken = ETH;
//         const toToken = wsRIP;

//         const quote = await getSwapQuote(fromToken, RIP, amountIn);
//         await ripZap
//           .connect(user)
//           .ZapIn(
//             fromToken,
//             amountIn,
//             toToken,
//             1,
//             quote.to,
//             quote.data,
//             constants.AddressZero,
//             constants.AddressZero,
//             0,
//             false,
//             {
//               value: amountIn,
//             },
//           );
//         const wsRIPBalance = await getBalance(toToken, user.address);
//         wsRIPAmount = wsRIPBalance.div(4);

//         // approve Zap
//         await approveToken(wsRIP, user, ripZap.address);
//       });

//       it("should ZapOut from wsRIP to ETH", async () => {
//         const fromToken = wsRIP;
//         const toToken = ETH;
//         const ripEquivalent = await ripZap.removeLiquidityReturn(fromToken, wsRIPAmount);
//         const { to, data } = await getSwapQuote(RIP, toToken, ripEquivalent);

//         const initialBalance = await user.getBalance();
//         await ripZap
//           .connect(user)
//           .ZapOut(fromToken, wsRIPAmount, toToken, 1, to, data, constants.AddressZero);
//         const finalBalance = await user.getBalance();
//         expect(finalBalance).to.be.gt(initialBalance);
//       });

//       it("should ZapOut from wsRIP to DAI", async () => {
//         const fromToken = wsRIP;
//         const toToken = DAI;
//         const ripEquivalent = await ripZap.removeLiquidityReturn(fromToken, wsRIPAmount);
//         const { to, data } = await getSwapQuote(RIP, toToken, ripEquivalent);

//         const initialBalance = await getBalance(toToken, user.address);
//         await ripZap
//           .connect(user)
//           .ZapOut(fromToken, wsRIPAmount, toToken, 1, to, data, constants.AddressZero);
//         const finalBalance = await getBalance(toToken, user.address);
//         expect(finalBalance).to.be.gt(initialBalance);
//       });

//       it("should ZapOut from wsRIP to RIP", async () => {
//         const fromToken = wsRIP;
//         const toToken = RIP;
//         const ripEquivalent = await ripZap.removeLiquidityReturn(fromToken, wsRIPAmount);
//         const { to, data } = await getSwapQuote(RIP, toToken, ripEquivalent);

//         const initialBalance = await getBalance(toToken, user.address);
//         await ripZap
//           .connect(user)
//           .ZapOut(fromToken, wsRIPAmount, toToken, 1, to, data, constants.AddressZero);
//         const finalBalance = await getBalance(toToken, user.address);
//         expect(finalBalance).to.be.gt(initialBalance);
//       });
//     });
//   });
//   describe("Bonds", () => {
//     context("Sushiswap LPs", () => {
//       before(async () => {
//         await ripZap
//           .connect(RipProtocolDAO)
//           .update_BondDepos(
//             [RIP_LUSD, RIP_DAI, ALCX_ETH],
//             [RIP, RIP, ALCX],
//             [RIP_LUSD_DEPO, RIP_DAI_DEPO, ALCX_ETH_DEPO],
//           );
//       });
//       // it("Should create bonds with RIP-LUSD using ETH", async () => {
//       //   const amountIn = utils.parseEther("5");
//       //   const fromToken = ETH;
//       //   const toToken = RIP_LUSD;

//       //   const { to, data } = await getZapInQuote({
//       //     toWhomToIssue: user.address,
//       //     sellToken: fromToken,
//       //     sellAmount: amountIn,
//       //     poolAddress: toToken,
//       //     protocol: protocol.sushiswap,
//       //   });

//       //   const depositoryAddress = await ripZap.principalToDepository(toToken, RIP);

//       //   const depository = (await ethers.getContractAt(
//       //     "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
//       //     depositoryAddress,
//       //   )) as IBondDepository;

//       //   const maxBondPrice = await depository.bondPrice();

//       //   const beforeVesting = (await depository.bondInfo(user.address))[0];

//       //   await ripZap
//       //     .connect(user)
//       //     .ZapIn(
//       //       fromToken,
//       //       amountIn,
//       //       toToken,
//       //       1,
//       //       to,
//       //       data,
//       //       constants.AddressZero,
//       //       RIP_LUSD,
//       //       maxBondPrice,
//       //       true,
//       //       {
//       //         value: amountIn,
//       //       },
//       //     );

//       //   const vesting = (await depository.bondInfo(user.address))[0];

//       //   expect(vesting).to.be.gt(beforeVesting);
//       // });
//       it("Should create bonds with RIP-DAI using ETH", async () => {
//         const amountIn = utils.parseEther("5");
//         const fromToken = ETH;
//         const toToken = RIP_DAI;

//         const { to, data } = await getZapInQuote({
//           toWhomToIssue: user.address,
//           sellToken: fromToken,
//           sellAmount: amountIn,
//           poolAddress: toToken,
//           protocol: protocol.sushiswap,
//         });

//         const depositoryAddress = await ripZap.principalToDepository(toToken, RIP);

//         const depository = (await ethers.getContractAt(
//           "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
//           depositoryAddress,
//         )) as IBondDepository;

//         const maxBondPrice = await depository.bondPrice();

//         const beforeVesting = (await depository.bondInfo(user.address))[0];

//         await ripZap
//           .connect(user)
//           .ZapIn(
//             fromToken,
//             amountIn,
//             toToken,
//             1,
//             to,
//             data,
//             constants.AddressZero,
//             RIP,
//             maxBondPrice,
//             true,
//             {
//               value: amountIn,
//             },
//           );
//         const vesting = (await depository.bondInfo(user.address))[0];

//         expect(vesting).to.be.gt(beforeVesting);
//       });
//       //   it("Should create bonds with RIP-LUSD using DAI", async () => {
//       //     const fromToken = DAI;
//       //     const toToken = RIP_LUSD;

//       //     const amountIn = await exchangeAndApprove(
//       //       user,
//       //       ETH,
//       //       fromToken,
//       //       utils.parseEther("5"),
//       //       ripZap.address,
//       //     );

//       //     const { to, data } = await getZapInQuote({
//       //       toWhomToIssue: user.address,
//       //       sellToken: fromToken,
//       //       sellAmount: amountIn,
//       //       poolAddress: toToken,
//       //       protocol: protocol.sushiswap,
//       //     });

//       //     const depositoryAddress = await ripZap.principalToDepository(toToken, RIP);

//       //     const depository = (await ethers.getContractAt(
//       //       "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
//       //       depositoryAddress,
//       //     )) as IBondDepository;

//       //     const maxBondPrice = await depository.bondPrice();

//       //     const beforeVesting = (await depository.bondInfo(user.address))[0];

//       //     await ripZap
//       //       .connect(user)
//       //       .ZapIn(
//       //         fromToken,
//       //         amountIn,
//       //         toToken,
//       //         1,
//       //         to,
//       //         data,
//       //         constants.AddressZero,
//       //         RIP_LUSD,
//       //         maxBondPrice,
//       //         true,
//       //       );

//       //     const vesting = (await depository.bondInfo(user.address))[0];

//       //     expect(vesting).to.be.gt(beforeVesting);
//       //   });
//       // });
//     });
//     context("Uniswap V2 LPs", () => {
//       before(async () => {
//         await ripZap.connect(RipProtocolDAO).update_BondDepos([RIP_FRAX], [RIP], [RIP_FRAX_DEPO]);
//       });
//       it("Should create bonds with RIP-FRAX using ETH", async () => {
//         const amountIn = utils.parseEther("5");
//         const fromToken = ETH;
//         const toToken = RIP_FRAX;

//         const { to, data } = await getZapInQuote({
//           toWhomToIssue: user.address,
//           sellToken: fromToken,
//           sellAmount: amountIn,
//           poolAddress: toToken,
//           protocol: protocol.uniswap,
//         });

//         const depositoryAddress = await ripZap.principalToDepository(toToken, RIP);

//         const depository = (await ethers.getContractAt(
//           "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
//           depositoryAddress,
//         )) as IBondDepository;

//         const maxBondPrice = await depository.bondPrice();

//         const beforeVesting = (await depository.bondInfo(user.address))[0];

//         await ripZap
//           .connect(user)
//           .ZapIn(
//             fromToken,
//             amountIn,
//             toToken,
//             1,
//             to,
//             data,
//             constants.AddressZero,
//             RIP,
//             maxBondPrice,
//             true,
//             {
//               value: amountIn,
//             },
//           );
//         const vesting = (await depository.bondInfo(user.address))[0];

//         expect(vesting).to.be.gt(beforeVesting);
//       });
//       it("Should create bonds with RIP-FRAX using DAI", async () => {
//         const fromToken = DAI;
//         const toToken = RIP_FRAX;

//         const amountIn = await exchangeAndApprove(
//           user,
//           ETH,
//           fromToken,
//           utils.parseEther("5"),
//           ripZap.address,
//         );

//         const { to, data } = await getZapInQuote({
//           toWhomToIssue: user.address,
//           sellToken: fromToken,
//           sellAmount: amountIn,
//           poolAddress: toToken,
//           protocol: protocol.uniswap,
//         });

//         const depositoryAddress = await ripZap.principalToDepository(toToken, RIP);

//         const depository = (await ethers.getContractAt(
//           "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
//           depositoryAddress,
//         )) as IBondDepository;

//         const maxBondPrice = await depository.bondPrice();

//         const beforeVesting = (await depository.bondInfo(user.address))[0];

//         await ripZap
//           .connect(user)
//           .ZapIn(
//             fromToken,
//             amountIn,
//             toToken,
//             1,
//             to,
//             data,
//             constants.AddressZero,
//             RIP,
//             maxBondPrice,
//             true,
//           );

//         const vesting = (await depository.bondInfo(user.address))[0];

//         expect(vesting).to.be.gt(beforeVesting);
//       });
//     });

//     context("Tokens", () => {
//       before(async () => {
//         await ripZap.connect(RipProtocolDAO).update_BondDepos([DAI], [RIP], [DAI_DEPO]);
//       });
//       it("Should create bonds with DAI using ETH", async () => {
//         const amountIn = utils.parseEther("10");
//         const fromToken = ETH;
//         const toToken = DAI;

//         const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

//         const depositoryAddress = await ripZap.principalToDepository(toToken, RIP);

//         const depository = (await ethers.getContractAt(
//           "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
//           depositoryAddress,
//         )) as IBondDepository;

//         const maxBondPrice = await depository.bondPrice();

//         const beforeVesting = (await depository.bondInfo(user.address))[0];

//         await ripZap
//           .connect(user)
//           .ZapIn(
//             fromToken,
//             amountIn,
//             toToken,
//             1,
//             to,
//             data,
//             constants.AddressZero,
//             RIP,
//             maxBondPrice,
//             true,
//             { value: amountIn },
//           );

//         const vesting = (await depository.bondInfo(user.address))[0];

//         expect(vesting).to.be.gt(beforeVesting);
//       });
//       it("Should create bonds with DAI using SPELL", async () => {
//         const fromToken = SPELL;
//         const toToken = DAI;

//         const amountIn = await exchangeAndApprove(
//           user,
//           ETH,
//           fromToken,
//           utils.parseEther("5"),
//           ripZap.address,
//         );

//         const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

//         const depositoryAddress = await ripZap.principalToDepository(toToken, RIP);

//         const depository = (await ethers.getContractAt(
//           "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
//           depositoryAddress,
//         )) as IBondDepository;

//         const maxBondPrice = await depository.bondPrice();

//         const beforeVesting = (await depository.bondInfo(user.address))[0];

//         await ripZap
//           .connect(user)
//           .ZapIn(
//             fromToken,
//             amountIn,
//             toToken,
//             1,
//             to,
//             data,
//             constants.AddressZero,
//             RIP,
//             maxBondPrice,
//             true,
//           );

//         const vesting = (await depository.bondInfo(user.address))[0];

//         expect(vesting).to.be.gt(beforeVesting);
//       });
//     });
//     describe("RipProtocol Pro Bonds", () => {
//       context("Sushiswap LPs", () => {
//         before(async () => {
//           await ripZap.connect(RipProtocolDAO).update_BondDepos([ALCX_ETH], [ALCX], [ALCX_ETH_DEPO]);
//         });
//         it("Should create bonds with ETH_ALCX using ETH", async () => {
//           const amountIn = utils.parseEther("5");
//           const fromToken = ETH;
//           const toToken = ALCX_ETH;

//           const { to, data } = await getZapInQuote({
//             toWhomToIssue: user.address,
//             sellToken: fromToken,
//             sellAmount: amountIn,
//             poolAddress: toToken,
//             protocol: protocol.sushiswap,
//           });

//           const depositoryAddress = await ripZap.principalToDepository(toToken, ALCX);

//           const depository = (await ethers.getContractAt(
//             "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
//             depositoryAddress,
//           )) as IBondDepository;

//           // Skip slippage check
//           const maxBondPrice = constants.MaxUint256;
//           // const maxBondPrice = await depository.bondPrice();

//           const beforeVesting = (await depository.bondInfo(user.address))[0];

//           await ripZap
//             .connect(user)
//             .ZapIn(
//               fromToken,
//               amountIn,
//               toToken,
//               1,
//               to,
//               data,
//               constants.AddressZero,
//               ALCX,
//               maxBondPrice,
//               true,
//               {
//                 value: amountIn,
//               },
//             );
//           const vesting = (await depository.bondInfo(user.address))[0];

//           expect(vesting).to.be.gt(beforeVesting);
//         });
//         it("Should create bonds with ETH_ALCX using SPELL", async () => {
//           const fromToken = SPELL;
//           const toToken = ALCX_ETH;

//           const amountIn = await exchangeAndApprove(
//             user,
//             ETH,
//             fromToken,
//             utils.parseEther("5"),
//             ripZap.address,
//           );

//           const { to, data } = await getZapInQuote({
//             toWhomToIssue: user.address,
//             sellToken: fromToken,
//             sellAmount: amountIn,
//             poolAddress: toToken,
//             protocol: protocol.sushiswap,
//           });

//           const depositoryAddress = await ripZap.principalToDepository(toToken, ALCX);

//           const depository = (await ethers.getContractAt(
//             "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
//             depositoryAddress,
//           )) as IBondDepository;

//           // Skip slippage check
//           const maxBondPrice = constants.MaxUint256;
//           // const maxBondPrice = await depository.bondPrice();

//           const beforeVesting = (await depository.bondInfo(user.address))[0];

//           await ripZap
//             .connect(user)
//             .ZapIn(
//               fromToken,
//               amountIn,
//               toToken,
//               1,
//               to,
//               data,
//               constants.AddressZero,
//               ALCX,
//               maxBondPrice,
//               true,
//             );

//           const vesting = (await depository.bondInfo(user.address))[0];

//           expect(vesting).to.be.gt(beforeVesting);
//         });
//       });
//     });
//   });
//   describe("Security", () => {
//     context("Pausable", () => {
//       before(async () => {
//         await ripZap.connect(zapperAdmin).toggleContractActive();
//       });
//       after(async () => {
//         await ripZap.connect(zapperAdmin).toggleContractActive();
//       });
//       it("Should pause ZapIns", async () => {
//         const amountIn = utils.parseEther("5");
//         const fromToken = ETH;
//         const toToken = ALCX_ETH;

//         await expect(
//           ripZap
//             .connect(user)
//             .ZapIn(
//               fromToken,
//               amountIn,
//               toToken,
//               1,
//               constants.AddressZero,
//               constants.HashZero,
//               constants.AddressZero,
//               constants.AddressZero,
//               0,
//               false,
//               {
//                 value: amountIn,
//               },
//             ),
//         ).to.be.revertedWith("Paused");
//       });
//       it("Should pause ZapIns", async () => {
//         const amountIn = utils.parseEther("5");
//         const fromToken = ETH;
//         const toToken = ALCX_ETH;

//         await expect(
//           ripZap
//             .connect(user)
//             .ZapOut(
//               fromToken,
//               amountIn,
//               toToken,
//               1,
//               constants.AddressZero,
//               constants.HashZero,
//               constants.AddressZero,
//             ),
//         ).to.be.revertedWith("Paused");
//       });
//       it("Should only be pausable by Zapper Admin", async () => {
//         await ripZap.connect(zapperAdmin).toggleContractActive();
//         await expect(ripZap.toggleContractActive()).to.be.revertedWith(
//           "Ownable: caller is not the owner",
//         );
//         await ripZap.connect(zapperAdmin).toggleContractActive();
//       });
//     });
//     context("onlyRipProtocolDAO", () => {
//       it("Should only allow RipProtocolDAO to update depos", async () => {
//         await expect(ripZap.connect(user).update_BondDepos([], [], [])).to.be.revertedWith(
//           "Only RipProtocolDAO",
//         );
//       });
//       it("Should only allow RipProtocolDAO to update staking", async () => {
//         await expect(ripZap.connect(user).update_Staking(ALCX)).to.be.revertedWith(
//           "Only RipProtocolDAO",
//         );
//       });
//       it("Should only allow RipProtocolDAO to update sRIP", async () => {
//         await expect(ripZap.connect(user).update_sRIP(ALCX)).to.be.revertedWith("Only RipProtocolDAO");
//       });
//       it("Should only allow RipProtocolDAO to update wsRIP", async () => {
//         await expect(ripZap.connect(user).update_wsRIP(ALCX)).to.be.revertedWith("Only RipProtocolDAO");
//       });
//       it("Should only allow RipProtocolDAO to update wsRIP", async () => {
//         await expect(ripZap.connect(user).update_wsRIP(ALCX)).to.be.revertedWith("Only RipProtocolDAO");
//       });
//     });
//   });
// });
