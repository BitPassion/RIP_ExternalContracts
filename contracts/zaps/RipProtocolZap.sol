// ███████╗░█████╗░██████╗░██████╗░███████╗██████╗░░░░███████╗██╗
// ╚════██║██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗░░░██╔════╝██║
// ░░███╔═╝███████║██████╔╝██████╔╝█████╗░░██████╔╝░░░█████╗░░██║
// ██╔══╝░░██╔══██║██╔═══╝░██╔═══╝░██╔══╝░░██╔══██╗░░░██╔══╝░░██║
// ███████╗██║░░██║██║░░░░░██║░░░░░███████╗██║░░██║██╗██║░░░░░██║
// ╚══════╝╚═╝░░╚═╝╚═╝░░░░░╚═╝░░░░░╚══════╝╚═╝░░╚═╝╚═╝╚═╝░░░░░╚═╝
// Copyright (C) 2021 zapper

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//

/// @author Zapper and RipProtocolDAO
/// @notice This contract enters/exits RipProtocolDAO Ω with/to any token.
/// Bonds can also be created on behalf of msg.sender using any input token.

// SPDX-License-Identifier: GPL-2.0
pragma solidity ^0.8.0;

import "./interfaces/IBondDepository.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/IwsRIP.sol";

import "./libraries/ZapBaseV2_2.sol";

contract RipProtocol_Zap_V2 is ZapBaseV2_2 {
    using SafeERC20 for IERC20;

    /////////////// storage ///////////////

    address public ripprotocolDAO;

    address public staking = 0xFd31c7d00Ca47653c6Ce64Af53c1571f9C36566a;

    address public constant RIP = 0x383518188C0C6d7730D91b2c03a03C837814a899;

    address public sRIP = 0x04F2694C8fcee23e8Fd0dfEA1d4f5Bb8c352111F;

    address public wsRIP = 0xCa76543Cf381ebBB277bE79574059e32108e3E65;

    // IE DAI => wanted payout token (IE RIP) => bond depo
    mapping(address => mapping(address => address)) public principalToDepository;

    /////////////// Events ///////////////

    // Emitted when `sender` Zaps In
    event zapIn(address sender, address token, uint256 tokensRec, address affiliate);

    // Emitted when `sender` Zaps Out
    event zapOut(address sender, address token, uint256 tokensRec, address affiliate);

    /////////////// Modifiers ///////////////

    modifier onlyRipProtocolDAO() {
        require(msg.sender == ripprotocolDAO, "Only RipProtocolDAO");
        _;
    }

    /////////////// Construction ///////////////

    constructor(
        uint256 _goodwill,
        uint256 _affiliateSplit,
        address _ripprotocolDAO
    ) ZapBaseV2_2(_goodwill, _affiliateSplit) {
        // 0x Proxy
        approvedTargets[0xDef1C0ded9bec7F1a1670819833240f027b25EfF] = true;
        // Zapper Sushiswap Zap In
        approvedTargets[0x5abfbE56553a5d794330EACCF556Ca1d2a55647C] = true;
        // Zapper Uniswap V2 Zap In
        approvedTargets[0x6D9893fa101CD2b1F8D1A12DE3189ff7b80FdC10] = true;

        ripprotocolDAO = _ripprotocolDAO;

        transferOwnership(ZapperAdmin);
    }

    /**
     * @notice This function deposits assets into RipProtocolDAO with ETH or ERC20 tokens
     * @param fromToken The token used for entry (address(0) if ether)
     * @param amountIn The amount of fromToken to invest
     * @param toToken The token fromToken is getting converted to.
     * @param minToToken The minimum acceptable quantity sRIP
     * or wsRIP or principal tokens to receive. Reverts otherwise
     * @param swapTarget Excecution target for the swap or zap
     * @param swapData DEX or Zap data. Must swap to ibToken underlying address
     * @param affiliate Affiliate address
     * @param maxBondPrice Max price for a bond denominated in toToken/principal. Ignored if not bonding.
     * @param bond if toToken is being used to purchase a bond.
     * @return RIPRec quantity of sRIP or wsRIP  received (depending on toToken)
     * or the quantity RIP vesting (if bond is true)
     */
    function ZapIn(
        address fromToken,
        uint256 amountIn,
        address toToken,
        uint256 minToToken,
        address swapTarget,
        bytes calldata swapData,
        address affiliate,
        address bondPayoutToken, // ignored if not bonding
        uint256 maxBondPrice, // ignored if not bonding
        bool bond
    ) external payable stopInEmergency returns (uint256 RIPRec) {
        if (bond) {
            // pull users fromToken
            uint256 toInvest = _pullTokens(fromToken, amountIn, affiliate, true);

            // swap fromToken -> toToken
            uint256 tokensBought = _fillQuote(fromToken, toToken, toInvest, swapTarget, swapData);
            require(tokensBought >= minToToken, "High Slippage");

            // get depo address
            address depo = principalToDepository[toToken][bondPayoutToken];
            require(depo != address(0), "Bond depo doesn't exist");

            // deposit bond on behalf of user, and return RIPRec
            RIPRec = IBondDepository(depo).deposit(tokensBought, maxBondPrice, msg.sender);

            // emit zapIn
            emit zapIn(msg.sender, toToken, RIPRec, affiliate);
        } else {
            require(toToken == sRIP || toToken == wsRIP, "toToken must be sRIP or wsRIP");

            uint256 toInvest = _pullTokens(fromToken, amountIn, affiliate, true);

            uint256 tokensBought = _fillQuote(fromToken, RIP, toInvest, swapTarget, swapData);

            RIPRec = _enterRipProtocol(tokensBought, toToken);
            require(RIPRec > minToToken, "High Slippage");

            emit zapIn(msg.sender, sRIP, RIPRec, affiliate);
        }
    }

    /**
     * @notice This function withdraws assets from RipProtocolDAO, receiving tokens or ETH
     * @param fromToken The ibToken being withdrawn
     * @param amountIn The quantity of fromToken to withdraw
     * @param toToken Address of the token to receive (0 address if ETH)
     * @param minToTokens The minimum acceptable quantity of tokens to receive. Reverts otherwise
     * @param swapTarget Excecution target for the swap or zap
     * @param swapData DEX or Zap data
     * @param affiliate Affiliate address
     * @return tokensRec Quantity of aTokens received
     */
    function ZapOut(
        address fromToken,
        uint256 amountIn,
        address toToken,
        uint256 minToTokens,
        address swapTarget,
        bytes calldata swapData,
        address affiliate
    ) external stopInEmergency returns (uint256 tokensRec) {
        require(fromToken == sRIP || fromToken == wsRIP, "fromToken must be sRIP or wsRIP");

        amountIn = _pullTokens(fromToken, amountIn);

        uint256 RIPRec = _exitRipProtocol(fromToken, amountIn);

        tokensRec = _fillQuote(RIP, toToken, RIPRec, swapTarget, swapData);
        require(tokensRec >= minToTokens, "High Slippage");

        uint256 totalGoodwillPortion;
        if (toToken == address(0)) {
            totalGoodwillPortion = _subtractGoodwill(ETHAddress, tokensRec, affiliate, true);

            payable(msg.sender).transfer(tokensRec - totalGoodwillPortion);
        } else {
            totalGoodwillPortion = _subtractGoodwill(toToken, tokensRec, affiliate, true);

            IERC20(toToken).safeTransfer(msg.sender, tokensRec - totalGoodwillPortion);
        }
        tokensRec = tokensRec - totalGoodwillPortion;

        emit zapOut(msg.sender, toToken, tokensRec, affiliate);
    }

    function _enterRipProtocol(uint256 amount, address toToken) internal returns (uint256) {
        _approveToken(RIP, staking, amount);

        if (toToken == wsRIP) {
            IStaking(staking).stake(amount, address(this));
            IStaking(staking).claim(address(this));

            _approveToken(sRIP, wsRIP, amount);

            uint256 beforeBalance = _getBalance(wsRIP);

            IwsRIP(wsRIP).wrap(amount);

            uint256 wsRIPRec = _getBalance(wsRIP) - beforeBalance;

            IERC20(wsRIP).safeTransfer(msg.sender, wsRIPRec);

            return wsRIPRec;
        }
        IStaking(staking).stake(amount, msg.sender);
        IStaking(staking).claim(msg.sender);

        return amount;
    }

    function _exitRipProtocol(address fromToken, uint256 amount) internal returns (uint256) {
        if (fromToken == wsRIP) {
            uint256 sRIPRec = IwsRIP(wsRIP).unwrap(amount);

            _approveToken(sRIP, address(staking), sRIPRec);

            IStaking(staking).unstake(sRIPRec, true);

            return sRIPRec;
        }
        _approveToken(sRIP, address(staking), amount);

        IStaking(staking).unstake(amount, true);

        return amount;
    }

    function removeLiquidityReturn(address fromToken, uint256 fromAmount)
        external
        view
        returns (uint256 ripAmount)
    {
        if (fromToken == sRIP) {
            return fromAmount;
        } else if (fromToken == wsRIP) {
            return IwsRIP(wsRIP).wRIPTosRIP(fromAmount);
        }
    }

    ///////////// ripprotocol only /////////////

    function update_RipProtocolDAO(address _ripprotocolDAO) external onlyRipProtocolDAO {
        ripprotocolDAO = _ripprotocolDAO;
    }

    function update_Staking(address _staking) external onlyRipProtocolDAO {
        staking = _staking;
    }

    function update_sRIP(address _sRIP) external onlyRipProtocolDAO {
        sRIP = _sRIP;
    }

    function update_wsRIP(address _wsRIP) external onlyRipProtocolDAO {
        wsRIP = _wsRIP;
    }

    function update_BondDepos(
        address[] calldata principals,
        address[] calldata payoutTokens,
        address[] calldata depos
    ) external onlyRipProtocolDAO {
        require(
            principals.length == depos.length && depos.length == payoutTokens.length,
            "array param lengths must match"
        );
        // update depos for each principal
        for (uint256 i; i < principals.length; i++) {
            principalToDepository[principals[i]][payoutTokens[i]] = depos[i];

            // max approve depo to save on gas
            _approveToken(principals[i], depos[i]);
        }
    }

    function bondPrice(address principal, address payoutToken) external view returns (uint256) {
        return IBondDepository(principalToDepository[principal][payoutToken]).bondPrice();
    }
}
