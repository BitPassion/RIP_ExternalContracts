// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.0;

import "./IStaking.sol";

interface IRipProtocolZap {
    function update_Staking(IStaking _staking) external;

    function update_sRIP(address _sRIP) external;

    function update_wsRIP(address _wsRIP) external;

    function update_gRIP(address _gRIP) external;

    function update_BondDepository(address principal, address depository) external;
}
