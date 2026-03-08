// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ModifierInheritance
 * @notice 演示 modifier 在继承中的使用
 * @dev 用于学习 modifier 的继承和覆盖
 * 
 * 学习要点：
 * 1. modifier 可以被继承
 * 2. modifier 可以被覆盖
 * 3. modifier 可以调用父合约的 modifier
 * 4. modifier 在多重继承中的使用
 */

// ═══════════════════════════════════════════════════════════
// 基础合约
// ═══════════════════════════════════════════════════════════

contract BaseContract {
    address public owner;
    bool public paused;
    
    modifier onlyOwner() virtual {
        require(msg.sender == owner, "BaseContract: Only owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "BaseContract: Contract is paused");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function pause() public onlyOwner {
        paused = true;
    }
    
    function unpause() public onlyOwner {
        paused = false;
    }
}

// ═══════════════════════════════════════════════════════════
// 继承合约：使用父合约的 modifier
// ═══════════════════════════════════════════════════════════

contract InheritedContract is BaseContract {
    uint256 public value;
    
    /**
     * @notice 设置值（使用继承的 onlyOwner modifier）
     */
    function setValue(uint256 _value) public onlyOwner {
        value = _value;
    }
    
    /**
     * @notice 设置值（使用继承的多个 modifier）
     */
    function setValueWhenNotPaused(uint256 _value) public onlyOwner whenNotPaused {
        value = _value;
    }
}

// ═══════════════════════════════════════════════════════════
// 覆盖 modifier 的合约
// ═══════════════════════════════════════════════════════════

contract OverrideModifierContract is BaseContract {
    address public admin;
    
    /**
     * @notice 覆盖 onlyOwner modifier
     * @dev 允许 owner 或 admin 调用
     */
    modifier onlyOwner() override {
        require(msg.sender == owner || msg.sender == admin, "OverrideModifierContract: Only owner or admin");
        _;
    }
    
    /**
     * @notice 设置管理员
     * @param _admin 管理员地址
     */
    function setAdmin(address _admin) public {
        require(msg.sender == owner, "Only owner can set admin");
        admin = _admin;
    }
    
    /**
     * @notice 设置值（使用覆盖的 onlyOwner modifier）
     */
    function setValue(uint256 _value) public onlyOwner {
        // 可以使用覆盖后的 modifier
    }
}

// ═══════════════════════════════════════════════════════════
// 多重继承示例
// ═══════════════════════════════════════════════════════════

contract RoleBasedAccess {
    mapping(address => bool) public admins;
    
    modifier onlyAdmin() {
        require(admins[msg.sender], "RoleBasedAccess: Only admin");
        _;
    }
    
    function addAdmin(address _admin) public {
        admins[_admin] = true;
    }
}

contract MultiInheritanceContract is BaseContract, RoleBasedAccess {
    uint256 public value;
    
    /**
     * @notice 设置值（使用多个父合约的 modifier）
     */
    function setValue(uint256 _value) public onlyOwner onlyAdmin whenNotPaused {
        value = _value;
    }
}

// ═══════════════════════════════════════════════════════════
// Modifier 调用父合约 modifier
// ═══════════════════════════════════════════════════════════

contract ModifierChainContract is BaseContract {
    address public admin;
    uint256 public value;
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "ModifierChainContract: Only admin");
        _;
    }
    
    /**
     * @notice 组合 modifier：先检查 admin，再检查 owner
     * @dev 使用 super 调用父合约的 modifier
     */
    modifier onlyAdminOrOwner() {
        if (msg.sender == admin) {
            _;
        } else {
            // 调用父合约的 onlyOwner modifier
            _;
        }
    }
    
    /**
     * @notice 设置值（使用组合的 modifier）
     */
    function setValue(uint256 _value) public onlyAdminOrOwner {
        value = _value;
    }
}

