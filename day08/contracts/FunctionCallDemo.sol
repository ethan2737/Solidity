// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title FunctionCallDemo
 * @notice 演示函数调用方式：内部调用 vs 外部调用
 * @dev 用于学习函数调用的不同方式和 Gas 消耗
 * 
 * 学习要点：
 * 1. 内部调用：直接调用，不产生 EVM 调用
 * 2. 外部调用：通过 this 或合约地址调用，产生 EVM 调用
 * 3. Gas 消耗差异
 * 4. 调用栈深度限制
 */
contract FunctionCallDemo {
    // ═══════════════════════════════════════════════════════════
    // 状态变量
    // ═══════════════════════════════════════════════════════════
    
    uint256 public value;
    uint256 public internalCallCount;
    uint256 public externalCallCount;
    
    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════
    
    event InternalCallMade(address indexed caller, uint256 value);
    event ExternalCallMade(address indexed caller, uint256 value);
    event CallStackDepth(uint256 depth);
    
    // ═══════════════════════════════════════════════════════════
    // 内部调用示例
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 内部函数：直接调用
     * @param _value 值
     */
    function _internalCall(uint256 _value) internal {
        value = _value;
        internalCallCount++;
        emit InternalCallMade(msg.sender, _value);
    }
    
    /**
     * @notice Public 函数：内部调用 internal 函数
     * @param _value 值
     */
    function makeInternalCall(uint256 _value) public {
        _internalCall(_value);  // 内部调用，不产生 EVM 调用
    }
    
    /**
     * @notice Public 函数：内部调用另一个 public 函数
     * @param _value 值
     */
    function internalCallPublic(uint256 _value) public {
        setValue(_value);  // 内部调用 public 函数
    }
    
    /**
     * @notice Public 函数：设置值
     * @param _value 值
     */
    function setValue(uint256 _value) public {
        value = _value;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 外部调用示例
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice External 函数：只能外部调用
     * @param _value 值
     */
    function externalCall(uint256 _value) external {
        value = _value;
        externalCallCount++;
        emit ExternalCallMade(msg.sender, _value);
    }
    
    /**
     * @notice Public 函数：通过 this 调用 external 函数（外部调用）
     * @param _value 值
     */
    function makeExternalCallViaThis(uint256 _value) public {
        this.externalCall(_value);  // 外部调用，产生 EVM 调用，消耗更多 Gas
    }
    
    /**
     * @notice Public 函数：通过 this 调用 public 函数（外部调用）
     * @param _value 值
     */
    function makeExternalCallPublic(uint256 _value) public {
        this.setValue(_value);  // 外部调用，产生 EVM 调用
    }
    
    // ═══════════════════════════════════════════════════════════
    // 调用其他合约示例
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 调用另一个合约的函数（外部调用）
     * @param _contract 合约地址
     * @param _value 值
     */
    function callOtherContract(address _contract, uint256 _value) public {
        FunctionCallDemo otherContract = FunctionCallDemo(_contract);
        otherContract.setValue(_value);  // 外部调用其他合约
    }
    
    /**
     * @notice 使用 call 调用其他合约（低级调用）
     * @param _contract 合约地址
     * @param _data 调用数据
     */
    function callOtherContractLowLevel(address _contract, bytes memory _data) public returns (bool) {
        (bool success, ) = _contract.call(_data);
        return success;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 调用栈深度示例
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 递归函数：演示调用栈深度
     * @param _depth 当前深度
     */
    function recursiveCall(uint256 _depth) public {
        emit CallStackDepth(_depth);
        
        if (_depth < 10) {
            recursiveCall(_depth + 1);  // 递归调用
        }
    }
    
    /**
     * @notice 外部递归调用：通过 this
     * @param _depth 当前深度
     */
    function recursiveExternalCall(uint256 _depth) public {
        emit CallStackDepth(_depth);
        
        if (_depth < 5) {  // 外部调用栈深度限制更严格
            this.recursiveExternalCall(_depth + 1);
        }
    }
    
    // ═══════════════════════════════════════════════════════════
    // Gas 消耗对比
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 内部调用链：消耗较少 Gas
     */
    function internalCallChain() public {
        _internalCall(100);
        _internalCall(200);
        _internalCall(300);
    }
    
    /**
     * @notice 外部调用链：消耗较多 Gas
     */
    function externalCallChain() public {
        this.externalCall(100);
        this.externalCall(200);
        this.externalCall(300);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 查询函数
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取调用计数
     * @return internalCount 内部调用次数
     * @return externalCount 外部调用次数
     */
    function getCallCounts() public view returns (uint256 internalCount, uint256 externalCount) {
        return (internalCallCount, externalCallCount);
    }
}

