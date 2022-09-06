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
/// @notice This contract enters RipProtocol Pro bonds

// SPDX-License-Identifier: GPL-2.0
pragma solidity ^0.8.0;

import "./interfaces/ICustomBondDepo.sol";

import "./libraries/ZapBaseV2_2.sol";

contract RipProtocolPro_Zap_V1 is ZapBaseV2_2 {
    using SafeERC20 for IERC20;

    /////////////// Events ///////////////

    // Emitted when `sender` Zaps In
    event zapIn(address sender, address token, uint256 tokensRec, address affiliate);

    // Emitted when `sender` Zaps Out
    event zapOut(address sender, address token, uint256 tokensRec, address affiliate);

    /////////////// State ///////////////

    address public ripprotocolDAO;

    // IE DAI => wanted payout token (IE RIP) => bond depo
    mapping(address => mapping(address => address)) public principalToDepository;

    // If a token can be paid out by RipProtocol Pro
    mapping(address => bool) public isRipProtocolProToken;

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
     * @param minToToken The minimum acceptable quantity sRIP or wsRIP or principal tokens to receive. Reverts otherwise
     * @param swapTarget Excecution target for the swap or zap
     * @param swapData DEX or Zap data. Must swap to ibToken underlying address
     * @param affiliate Affiliate address
     * @param maxBondPrice Max price for a bond denominated in toToken/principal. Ignored if not bonding.
     * @return bondTokensRec quantity of sRIP or wsRIP  received (depending on toToken) or the quantity RIP vesting (if bond is true)
     */
    function ZapIn(
        address fromToken,
        uint256 amountIn,
        address toToken,
        uint256 minToToken,
        address swapTarget,
        bytes calldata swapData,
        address affiliate,
        address bondPayoutToken,
        uint256 maxBondPrice
    ) external payable stopInEmergency returns (uint256 bondTokensRec) {
        // make sure payout token is OP bondable token
        require(isRipProtocolProToken[bondPayoutToken], "fromToken must be bondable using OP");

        // pull users fromToken
        uint256 toInvest = _pullTokens(fromToken, amountIn, affiliate, true);

        // swap fromToken -> toToken
        uint256 tokensBought = _fillQuote(fromToken, toToken, toInvest, swapTarget, swapData);
        require(tokensBought >= minToToken, "High Slippage");

        // get depo address
        address depo = principalToDepository[toToken][bondPayoutToken];
        require(depo != address(0), "Bond depo doesn't exist");

        // deposit bond on behalf of user, and return bondTokensRec
        bondTokensRec = ICustomBondDepo(depo).deposit(tokensBought, maxBondPrice, msg.sender);

        // emit zapIn
        emit zapIn(msg.sender, toToken, bondTokensRec, affiliate);
    }

    ///////////// ripprotocol only /////////////

    function update_RipProtocolDAO(address _ripprotocolDAO) external onlyRipProtocolDAO {
        ripprotocolDAO = _ripprotocolDAO;
    }

    string private ARRAY_LENGTH_ERROR = "array param lengths must match"; // save gas

    function update_isRipProtocolProToken(address[] memory _tokens, bool[] memory _isToken)
        external
        onlyRipProtocolDAO
    {
        require(_tokens.length == _isToken.length, ARRAY_LENGTH_ERROR);
        for (uint256 i; i < _tokens.length; i++) {
            isRipProtocolProToken[_tokens[i]] = _isToken[i];
        }
    }

    function update_BondDepos(
        address[] calldata principals,
        address[] calldata payoutTokens,
        address[] calldata depos
    ) external onlyRipProtocolDAO {
        require(
            principals.length == depos.length && depos.length == payoutTokens.length,
            ARRAY_LENGTH_ERROR
        );
        // update depos for each principal
        for (uint256 i; i < principals.length; i++) {
            require(isRipProtocolProToken[payoutTokens[i]], "payoutTokens must be on OP");

            principalToDepository[principals[i]][payoutTokens[i]] = depos[i];

            // max approve depo to save on gas
            _approveToken(principals[i], depos[i]);
        }
    }

    function bondPrice(address principal, address payoutToken) external view returns (uint256) {
        return ICustomBondDepo(principalToDepository[principal][payoutToken]).bondPrice();
    }

    function payoutFor(
        address principal,
        address payoutToken,
        uint256 value
    ) external view returns (uint256) {
        return ICustomBondDepo(principalToDepository[principal][payoutToken]).payoutFor(value);
    }
}
