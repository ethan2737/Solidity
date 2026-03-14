// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AccessControlDemo
 * @notice 演示访问控制与权限管理
 */
contract AccessControlDemo is Ownable {
    // 管理员值（仅所有者可修改）
    uint256 public adminValue;
    // 公共值（所有人可修改）
    uint256 public publicValue;
    // 用户余额
    mapping(address => uint256) public userBalances;
    // 合约暂停状态
    bool public paused;

    // 事件
    event AdminValueUpdated(uint256 oldValue, uint256 newValue);
    event PublicValueUpdated(uint256 oldValue, uint256 newValue, address indexed updater);
    event ContractPaused(bool paused);

    /**
     * @notice 构造函数
     * @param _initialOwner 初始所有者地址
     */
    constructor(address _initialOwner) {
        if (_initialOwner != msg.sender) {
            _transferOwnership(_initialOwner);
        }
    }

    /**
     * @notice 设置管理员值 - 仅所有者可调用
     */
    function setAdminValue(uint256 _value) public onlyOwner {
        uint256 oldValue = adminValue;
        adminValue = _value;
        emit AdminValueUpdated(oldValue, _value);
    }

    /**
     * @notice 暂停合约 - 仅所有者可调用
     */
    function pause() public onlyOwner {
        require(!paused, unicode"合约已暂停");
        paused = true;
        emit ContractPaused(true);
    }

    /**
     * @notice 恢复合约 - 仅所有者可调用
     */
    function unpause() public onlyOwner {
        require(paused, unicode"合约未暂停");
        paused = false;
        emit ContractPaused(false);
    }

    /**
     * @notice 紧急提取资金 - 仅所有者可调用
     */
    function emergencyWithdraw(address payable _to, uint256 _amount) public onlyOwner {
        require(_to != address(0), unicode"无效地址");
        require(address(this).balance >= _amount, unicode"余额不足");

        (bool success, ) = _to.call{value: _amount}("");
        require(success, unicode"转账失败");
    }

    /**
     * @notice 设置公共值 - 所有人可调用（但合约不能暂停）
     */
    function setPublicValue(uint256 _value) public {
        require(!paused, unicode"合约已暂停");

        uint256 oldValue = publicValue;
        publicValue = _value;
        emit PublicValueUpdated(oldValue, _value, msg.sender);
    }

    /**
     * @notice 接收 ETH
     */
    receive() external payable {}

    /**
     * @notice 获取合约余额
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
