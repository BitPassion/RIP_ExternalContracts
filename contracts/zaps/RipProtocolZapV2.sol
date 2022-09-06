// SPDX-License-Identifier: AGPL-3.0-or-later

/// @title RipProtocol V2 Zap In
/// @author Zapper, Cryptonomik, Dionysus
/// Review by: ZayenX
/// Copyright (C) 2021 Zapper
/// Copyright (C) 2022 RipProtocolDAO

pragma solidity 0.8.4;

import "./interfaces/IBondDepoV2.sol";
import "./interfaces/IStakingV2.sol";
import "./interfaces/IsRIP.sol";
import "./interfaces/IgRIP.sol";
import "./libraries/ZapBaseV3.sol";

contract RipProtocol_V2_Zap_In is ZapBaseV3 {
    using SafeERC20 for IERC20;

    ////////////////////////// STORAGE //////////////////////////

    address public depo;

    address public staking;

    address public immutable RIP;

    address public immutable sRIP;

    address public immutable gRIP;

    ////////////////////////// EVENTS //////////////////////////

    // Emitted when `sender` successfully calls ZapStake
    event zapStake(address sender, address token, uint256 tokensRec, address referral);

    // Emitted when `sender` successfully calls ZapBond
    event zapBond(address sender, address token, uint256 tokensRec, address referral);

    ////////////////////////// CONSTRUCTION //////////////////////////
    constructor(
        address _depo,
        address _staking,
        address _RIP,
        address _sRIP,
        address _gRIP
    ) ZapBaseV3(0, 0) {
        // 0x Proxy
        approvedTargets[0xDef1C0ded9bec7F1a1670819833240f027b25EfF] = true;
        depo = _depo;
        staking = _staking;
        RIP = _RIP;
        sRIP = _sRIP;
        gRIP = _gRIP;
    }

    ////////////////////////// PUBLIC //////////////////////////

    /// @notice This function acquires RIP with ETH or ERC20 tokens and stakes it for sRIP/gRIP
    /// @param fromToken The token used for entry (address(0) if ether)
    /// @param amountIn The quantity of fromToken being sent
    /// @param toToken The token fromToken is being converted to (i.e. sRIP or gRIP)
    /// @param minToToken The minimum acceptable quantity sRIP or gRIP to receive. Reverts otherwise
    /// @param swapTarget Excecution target for the swap
    /// @param swapData DEX swap data
    /// @param referral The front end operator address
    /// @return RIPRec The quantity of sRIP or gRIP received (depending on toToken)
    function ZapStake(
        address fromToken,
        uint256 amountIn,
        address toToken,
        uint256 minToToken,
        address swapTarget,
        bytes calldata swapData,
        address referral
    ) external payable pausable returns (uint256 RIPRec) {
        // pull users fromToken
        uint256 toInvest = _pullTokens(fromToken, amountIn, referral, true);

        // approve "swapTarget" to spend this contracts "fromToken" if needed
        _approveToken(fromToken, swapTarget, toInvest);

        // swap fromToken -> RIP
        uint256 tokensBought = _fillQuote(fromToken, RIP, toInvest, swapTarget, swapData);

        // stake RIP for sRIP or gRIP
        RIPRec = _stake(tokensBought, toToken);

        // Slippage check
        require(RIPRec > minToToken, "High Slippage");

        emit zapStake(msg.sender, toToken, RIPRec, referral);
    }

    /// @notice This function acquires RipProtocol bonds with ETH or ERC20 tokens
    /// @param fromToken The token used for entry (address(0) if ether)
    /// @param amountIn The quantity of fromToken being sent
    /// @param principal The token fromToken is being converted to (i.e. token or LP to bond)
    /// @param swapTarget Excecution target for the swap or Zap
    /// @param swapData DEX or Zap data
    /// @param referral The front end operator address
    /// @param maxPrice The maximum price at which to buy the bond
    /// @param bondId The ID of the market
    /// @return RIPRec The quantity of gRIP due
    function ZapBond(
        address fromToken,
        uint256 amountIn,
        address principal,
        address swapTarget,
        bytes calldata swapData,
        address referral,
        uint256 maxPrice,
        uint256 bondId
    ) external payable pausable returns (uint256 RIPRec) {
        // pull users fromToken
        uint256 toInvest = _pullTokens(fromToken, amountIn, referral, true);

        // make sure "swapTarget" is approved to spend this contracts "fromToken"
        _approveToken(fromToken, swapTarget, toInvest);
        // swap fromToken -> bond principal
        uint256 tokensBought = _fillQuote(
            fromToken,
            principal, // to token
            toInvest,
            swapTarget,
            swapData
        );

        // make sure bond depo is approved to spend this contracts "principal"
        _approveToken(principal, depo, tokensBought);

        // purchase bond
        (RIPRec, , ) = IBondDepoV2(depo).deposit(
            bondId,
            tokensBought,
            maxPrice,
            msg.sender, // depositor
            referral
        );

        emit zapBond(msg.sender, principal, RIPRec, referral);
    }

    ////////////////////////// INTERNAL //////////////////////////

    /// @param amount The quantity of RIP being staked
    /// @param toToken Either sRIP or gRIP
    /// @return RIPRec quantity of sRIP or gRIP  received (depending on toToken)
    function _stake(uint256 amount, address toToken) internal returns (uint256) {
        uint256 claimedTokens;
        // approve staking for RIP if needed
        _approveToken(RIP, staking, amount);

        if (toToken == gRIP) {
            // stake RIP -> gRIP
            claimedTokens = IStaking(staking).stake(address(this), amount, false, true);

            IERC20(toToken).safeTransfer(msg.sender, claimedTokens);

            return claimedTokens;
        }
        // stake RIP -> sRIP
        claimedTokens = IStaking(staking).stake(address(this), amount, true, true);

        IERC20(toToken).safeTransfer(msg.sender, claimedTokens);

        return claimedTokens;
    }

    ////////////////////////// RIPPROTOCOL ONLY //////////////////////////
    /// @notice update state for staking
    function update_Staking(address _staking) external onlyOwner {
        staking = _staking;
    }

    /// @notice update state for depo
    function update_Depo(address _depo) external onlyOwner {
        depo = _depo;
    }
}
