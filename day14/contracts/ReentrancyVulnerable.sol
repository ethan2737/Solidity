// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ReentrancyVulnerable
 * @notice 演示重入攻击漏洞的合约（仅用于教学）
 * @dev 展示状态更新在外部调用之后的危险
 */
contract ReentrancyVulnerable {
    // 用户余额映射
    mapping(address => uint256) public balances;

    // 存款事件
    event Deposit(address indexed user, uint256 amount);
    // 提现事件
    event Withdraw(address indexed user, uint256 amount);

    /**
     * @notice 存款函数
     * @dev 用户存入 ETH，增加余额
     */
    function deposit() public payable {
        require(msg.value > 0, unicode"存款金额必须大于0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice 提现函数 - 存在重入漏洞 ⚠️
     * @dev 漏洞：在更新余额之前就发送了 ETH
     *      攻击者可以在 receive() 中再次调用此函数
     *
     * 攻击流程：
     * 1. 攻击者调用 deposit() 存入 ETH
     * 2. 攻击者调用 withdraw() 提取 ETH
     * 3. 合约发送 ETH 到攻击者地址
     * 4. 攻击者的 receive() 被触发，再次调用 withdraw()
     * 5. 由于 balances[msg.sender] 还未更新为0，检查通过
     * 6. 重复步骤3-5，直到合约资金耗尽
     */
    function withdraw() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, unicode"余额不足");

        // ⚠️ 漏洞：先发送 ETH，后更新余额
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, unicode"转账失败");

        // ❌ 状态更新在外部调用之后，存在重入风险
        balances[msg.sender] = 0;

        emit Withdraw(msg.sender, amount);
    }

    /**
     * @notice 获取合约余额
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
