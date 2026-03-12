// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TargetContract
 * @notice 被调用的目标合约，用于演示 call 和 delegatecall 的区别
 * @dev 包含基础状态变量和函数，作为合约间交互的测试目标
 */
contract TargetContract {
    // ═══════════════════════════════════════════════════════════
    // 状态变量
    // ═══════════════════════════════════════════════════════════

    uint256 public value;      // slot 0 - 存储值
    address public owner;       // slot 1 - 所有者地址
    uint256 public counter;     // slot 2 - 计数器
    string public name;         // slot 3 - 名称

    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════

    event ValueSet(uint256 oldValue, uint256 newValue);
    event CounterIncremented(uint256 newCounter);
    event OwnerChanged(address oldOwner, address newOwner);
    event NameSet(string oldName, string newName);

    // ═══════════════════════════════════════════════════════════
    // 构造函数
    // ═══════════════════════════════════════════════════════════

    constructor(string memory _name) {
        owner = msg.sender;
        value = 100;  // 初始值
        counter = 0;
        name = _name;
    }

    // ═══════════════════════════════════════════════════════════
    // 公共函数
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 设置值
     * @param _value 新值
     */
    function setValue(uint256 _value) public {
        uint256 oldValue = value;
        value = _value;
        emit ValueSet(oldValue, _value);
    }

    /**
     * @notice 增加计数器
     */
    function incrementCounter() public {
        counter++;
        emit CounterIncremented(counter);
    }

    /**
     * @notice 设置所有者
     * @param _owner 新所有者地址
     */
    function setOwner(address _owner) public {
        address oldOwner = owner;
        owner = _owner;
        emit OwnerChanged(oldOwner, _owner);
    }

    /**
     * @notice 设置名称
     * @param _name 新名称
     */
    function setName(string memory _name) public {
        string memory oldName = name;
        name = _name;
        emit NameSet(oldName, _name);
    }

    /**
     * @notice 获取合约信息
     * @return _value 当前值
     * @return _owner 当前所有者
     * @return _counter 当前计数器
     * @return _contractAddress 合约地址
     */
    function getInfo() public view returns (
        uint256 _value,
        address _owner,
        uint256 _counter,
        address _contractAddress
    ) {
        return (value, owner, counter, address(this));
    }

    /**
     * @notice 批量设置多个值
     * @param _value 值
     * @param _name 名称
     */
    function setValueAndName(uint256 _value, string memory _name) public {
        value = _value;
        name = _name;
    }
}
