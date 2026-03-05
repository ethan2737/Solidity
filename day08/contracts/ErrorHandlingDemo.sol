// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ErrorHandlingDemo
 * @notice 演示 Solidity 错误处理
 * @dev 用于学习 require, revert, assert 的使用
 * 
 * 学习要点：
 * 1. require：用于输入验证和条件检查
 * 2. revert：无条件回滚
 * 3. assert：用于内部错误检查
 * 4. 自定义错误（Solidity 0.8.4+）
 */
contract ErrorHandlingDemo {
    // ═══════════════════════════════════════════════════════════
    // 状态变量
    // ═══════════════════════════════════════════════════════════
    
    uint256 public value;
    address public owner;
    mapping(address => uint256) public balances;
    
    // ═══════════════════════════════════════════════════════════
    // 自定义错误（Solidity 0.8.4+）
    // ═══════════════════════════════════════════════════════════
    
    error InsufficientBalance(uint256 requested, uint256 available);
    error Unauthorized(address caller);
    error InvalidValue(uint256 value);
    
    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════
    
    event ValueSet(uint256 oldValue, uint256 newValue);
    event BalanceUpdated(address indexed account, uint256 amount);
    
    // ═══════════════════════════════════════════════════════════
    // 构造函数
    // ═══════════════════════════════════════════════════════════
    
    constructor() {
        owner = msg.sender;
    }
    
    // ═══════════════════════════════════════════════════════════
    // Require 示例
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 使用 require 验证输入
     * @param _value 值
     */
    function setValueWithRequire(uint256 _value) public {
        require(_value > 0, "Value must be greater than 0");
        require(_value <= 1000, "Value must be less than or equal to 1000");
        
        uint256 oldValue = value;
        value = _value;
        emit ValueSet(oldValue, _value);
    }
    
    /**
     * @notice 使用 require 检查权限
     * @param _value 值
     */
    function setValueOwnerOnly(uint256 _value) public {
        require(msg.sender == owner, "Only owner can set value");
        value = _value;
    }
    
    /**
     * @notice 使用 require 检查余额
     * @param _amount 金额
     */
    function withdraw(uint256 _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        
        balances[msg.sender] -= _amount;
        emit BalanceUpdated(msg.sender, balances[msg.sender]);
    }
    
    // ═══════════════════════════════════════════════════════════
    // Revert 示例
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 使用 revert 无条件回滚
     * @param _value 值
     */
    function setValueWithRevert(uint256 _value) public {
        if (_value == 0) {
            revert("Value cannot be zero");
        }
        
        if (_value > 1000) {
            revert("Value exceeds maximum");
        }
        
        value = _value;
    }
    
    /**
     * @notice 使用 revert 和自定义错误
     * @param _amount 金额
     */
    function withdrawWithCustomError(uint256 _amount) public {
        uint256 balance = balances[msg.sender];
        
        if (balance < _amount) {
            revert InsufficientBalance(_amount, balance);
        }
        
        balances[msg.sender] -= _amount;
        emit BalanceUpdated(msg.sender, balances[msg.sender]);
    }
    
    /**
     * @notice 使用 revert 和自定义错误（权限检查）
     */
    function ownerOnlyWithCustomError() public {
        if (msg.sender != owner) {
            revert Unauthorized(msg.sender);
        }
        
        value = 9999;
    }
    
    // ═══════════════════════════════════════════════════════════
    // Assert 示例
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 使用 assert 检查内部状态
     * @param _value 值
     */
    function setValueWithAssert(uint256 _value) public {
        uint256 oldValue = value;
        value = _value;
        
        // assert 用于检查不应该发生的条件
        assert(value >= oldValue);  // 这个断言可能会失败
    }
    
    /**
     * @notice 使用 assert 检查不变量
     */
    function checkInvariant() public pure {
        // 检查不变量：总余额应该等于所有账户余额之和
        uint256 total = 0;
        // 注意：实际实现中需要遍历所有账户
        assert(total >= 0);  // 简单的示例
    }
    
    // ═══════════════════════════════════════════════════════════
    // Try-Catch 示例（外部调用）
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 使用 try-catch 处理外部调用错误
     * @param _contract 合约地址
     * @param _value 值
     */
    function callExternalWithTryCatch(address _contract, uint256 _value) public {
        ErrorHandlingDemo otherContract = ErrorHandlingDemo(_contract);
        
        try otherContract.setValueWithRequire(_value) {
            // 调用成功
            value = _value;
        } catch Error(string memory reason) {
            // 捕获 require/revert 错误
            revert(string(abi.encodePacked("External call failed: ", reason)));
        } catch (bytes memory /* lowLevelData */) {
            // 捕获低级错误
            revert("External call failed with low-level error");
        }
    }
    
    // ═══════════════════════════════════════════════════════════
    // 错误处理最佳实践
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 使用自定义错误（更省 Gas）
     * @param _value 值
     */
    function setValueWithCustomError(uint256 _value) public {
        if (_value == 0) {
            revert InvalidValue(_value);
        }
        
        value = _value;
    }
    
    /**
     * @notice 组合使用多种错误处理方式
     * @param _amount 金额
     */
    function complexWithdraw(uint256 _amount) public {
        // 使用 require 检查基本条件
        require(_amount > 0, "Amount must be greater than 0");
        
        uint256 balance = balances[msg.sender];
        
        // 使用自定义错误提供更多信息
        if (balance < _amount) {
            revert InsufficientBalance(_amount, balance);
        }
        
        // 执行操作
        balances[msg.sender] -= _amount;
        
        // 使用 assert 检查不变量
        assert(balances[msg.sender] <= balance);
        
        emit BalanceUpdated(msg.sender, balances[msg.sender]);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 辅助函数
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置余额
     * @param _account 账户地址
     * @param _amount 金额
     */
    function setBalance(address _account, uint256 _amount) public {
        balances[_account] = _amount;
    }
    
    /**
     * @notice 获取余额
     * @param _account 账户地址
     * @return 余额
     */
    function getBalance(address _account) public view returns (uint256) {
        return balances[_account];
    }
}

