// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SecureBank
 * @notice 使用 Checks-Effects-Interactions 模式修复重入漏洞
 */
contract SecureBank {
    // 用户余额映射
    mapping(address => uint256) public balances;

    // 事件
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    /**
     * @notice 存款函数
     */
    function deposit() public payable {
        require(msg.value > 0, unicode"存款金额必须大于0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice 提现函数 - 已修复重入漏洞 ✅
     * @dev 使用 Checks-Effects-Interactions 模式
     *
     * 正确顺序：
     * 1. Checks: 检查余额
     * 2. Effects: 更新余额（在发送 ETH 之前）
     * 3. Interactions: 发送 ETH（在更新状态之后）
     */
    function withdraw() public {
        uint256 amount = balances[msg.sender];

        // ✅ Checks: 检查余额
        require(amount > 0, unicode"余额不足");

        // ✅ Effects: 先更新余额（在发送 ETH 之前）
        // 这是关键修复：即使攻击者重入，此时余额已为0，第二次调用会失败
        balances[msg.sender] = 0;

        // ✅ Interactions: 后发送 ETH（在更新状态之后）
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, unicode"转账失败");

        emit Withdraw(msg.sender, amount);
    }

    /**
     * @notice 获取合约余额
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
