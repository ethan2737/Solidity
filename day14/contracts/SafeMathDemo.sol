// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SafeMath.sol";

/**
 * @title SafeMathDemo
 * @notice 演示整数溢出防护：Solidity 0.8+ vs SafeMath
 */
contract SafeMathDemo {
    // 使用 SafeMath 库
    using SafeMath for uint256;

    // 状态变量
    uint256 public value;
    uint256 public balance;

    // 事件
    event ValueUpdated(uint256 oldValue, uint256 newValue, string method);
    event BalanceUpdated(uint256 oldBalance, uint256 newBalance, string operation);

    /**
     * @notice 使用 Solidity 0.8+ 内置溢出防护进行加法
     * @dev 0.8+ 会自动检测溢出并 revert
     */
    function addWithBuiltIn(uint256 _amount) public {
        uint256 oldValue = value;
        value = value + _amount;  // 自动溢出检查
        emit ValueUpdated(oldValue, value, "addWithBuiltIn");
    }

    /**
     * @notice 使用 Solidity 0.8+ 内置溢出防护进行减法
     */
    function subtractWithBuiltIn(uint256 _amount) public {
        uint256 oldValue = value;
        value = value - _amount;  // 自动下溢检查
        emit ValueUpdated(oldValue, value, "subtractWithBuiltIn");
    }

    /**
     * @notice 使用 SafeMath 进行加法（演示旧版本方式）
     */
    function addWithSafeMath(uint256 _amount) public {
        uint256 oldBalance = balance;
        balance = balance.add(_amount);  // SafeMath.add
        emit BalanceUpdated(oldBalance, balance, "addWithSafeMath");
    }

    /**
     * @notice 使用 SafeMath 进行减法（演示旧版本方式）
     */
    function subtractWithSafeMath(uint256 _amount) public {
        uint256 oldBalance = balance;
        balance = balance.sub(_amount);  // SafeMath.sub
        emit BalanceUpdated(oldBalance, balance, "subtractWithSafeMath");
    }

    /**
     * @notice 演示 unchecked 块（谨慎使用）
     * @dev 仅在确定不会溢出时使用
     */
    function uncheckedAdd(uint256 a, uint256 b) public pure returns (uint256) {
        unchecked {
            return a + b;  // 不检查溢出
        }
    }

    /**
     * @notice 获取当前值
     */
    function getValue() public view returns (uint256) {
        return value;
    }

    /**
     * @notice 获取当前余额
     */
    function getBalance() public view returns (uint256) {
        return balance;
    }
}
