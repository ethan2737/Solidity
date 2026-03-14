// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SafeMath
 * @notice SafeMath 库（演示用）
 * @dev 在 Solidity 0.8+ 中已内置溢出检查，此库用于学习旧版本代码
 */
library SafeMath {
    /**
     * @notice 安全的加法运算
     * @param a 被加数
     * @param b 加数
     * @return 和
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, unicode"SafeMath: 加法溢出");
        return c;
    }

    /**
     * @notice 安全的减法运算
     * @param a 被减数
     * @param b 减数
     * @return 差
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, unicode"SafeMath: 减法下溢");
        return a - b;
    }

    /**
     * @notice 安全的乘法运算
     * @param a 被乘数
     * @param b 乘数
     * @return 积
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) return 0;
        uint256 c = a * b;
        require(c / a == b, unicode"SafeMath: 乘法溢出");
        return c;
    }
}
