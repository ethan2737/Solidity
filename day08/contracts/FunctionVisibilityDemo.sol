// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title FunctionVisibilityDemo
 * @notice 演示 Solidity 函数可见性和调用方式
 * @dev 用于学习 internal, external, public, private 函数
 * 
 * 学习要点：
 * 1. 函数可见性：internal, external, public, private
 * 2. 内部调用 vs 外部调用
 * 3. 函数调用方式对 Gas 的影响
 * 4. 函数可见性对安全的影响
 */
contract FunctionVisibilityDemo {
    // ═══════════════════════════════════════════════════════════
    // 状态变量
    // ═══════════════════════════════════════════════════════════
    
    uint256 public publicValue;
    uint256 private privateValue;
    uint256 internal internalValue;
    
    address public owner;
    
    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════
    
    event PublicFunctionCalled(address indexed caller, uint256 value);
    event ExternalFunctionCalled(address indexed caller, uint256 value);
    event InternalFunctionCalled(address indexed caller, uint256 value);
    event PrivateFunctionCalled(address indexed caller, uint256 value);
    
    // ═══════════════════════════════════════════════════════════
    // 构造函数
    // ═══════════════════════════════════════════════════════════
    
    constructor() {
        owner = msg.sender;
        publicValue = 100;
        privateValue = 200;
        internalValue = 300;
    }
    
    // ═══════════════════════════════════════════════════════════
    // Public 函数（如题目要求）
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice Public 函数：可以从内部和外部调用
     * @param _value 值
     */
    function publicFunction(uint256 _value) public {
        publicValue = _value;
        emit PublicFunctionCalled(msg.sender, _value);
    }
    
    /**
     * @notice Public view 函数：可以从内部和外部调用
     * @return 公共值
     */
    function getPublicValue() public view returns (uint256) {
        return publicValue;
    }
    
    /**
     * @notice Public 函数调用其他函数
     */
    function publicCallInternal() public {
        _internalFunction(100);
    }
    
    /**
     * @notice Public 函数调用 private 函数
     */
    function publicCallPrivate() public {
        _privateFunction(200);
    }
    
    // ═══════════════════════════════════════════════════════════
    // External 函数（如题目要求）
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice External 函数：只能从外部调用
     * @param _value 值
     */
    function externalFunction(uint256 _value) external {
        publicValue = _value;
        emit ExternalFunctionCalled(msg.sender, _value);
    }
    
    /**
     * @notice External view 函数：只能从外部调用
     * @return 公共值
     */
    function getPublicValueExternal() external view returns (uint256) {
        return publicValue;
    }
    
    /**
     * @notice 尝试从内部调用 external 函数（会失败）
     * @dev 这个函数演示了如何通过 this 调用 external 函数
     */
    function internalCallExternalViaThis() public {
        // 通过 this 调用 external 函数（会产生外部调用，消耗更多 Gas）
        this.externalFunction(300);
    }
    
    // ═══════════════════════════════════════════════════════════
    // Internal 函数（如题目要求）
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice Internal 函数：只能从当前合约和继承合约调用
     * @param _value 值
     */
    function _internalFunction(uint256 _value) internal {
        internalValue = _value;
        emit InternalFunctionCalled(msg.sender, _value);
    }
    
    /**
     * @notice Internal view 函数
     * @return 内部值
     */
    function _getInternalValue() internal view returns (uint256) {
        return internalValue;
    }
    
    /**
     * @notice Public 函数调用 internal 函数
     */
    function callInternalFromPublic() public {
        _internalFunction(400);
    }
    
    /**
     * @notice Internal 函数调用另一个 internal 函数
     */
    function _internalCallInternal() internal {
        _internalFunction(500);
    }
    
    /**
     * @notice Public 函数调用 internal 函数链
     */
    function callInternalChain() public {
        _internalCallInternal();
    }
    
    // ═══════════════════════════════════════════════════════════
    // Private 函数（如题目要求）
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice Private 函数：只能从当前合约调用
     * @param _value 值
     */
    function _privateFunction(uint256 _value) private {
        privateValue = _value;
        emit PrivateFunctionCalled(msg.sender, _value);
    }
    
    /**
     * @notice Private view 函数
     * @return 私有值
     */
    function _getPrivateValue() private view returns (uint256) {
        return privateValue;
    }
    
    /**
     * @notice Public 函数调用 private 函数
     */
    function callPrivateFromPublic() public {
        _privateFunction(600);
    }
    
    /**
     * @notice Private 函数调用另一个 private 函数
     */
    function _privateCallPrivate() private {
        _privateFunction(700);
    }
    
    /**
     * @notice Public 函数调用 private 函数链
     */
    function callPrivateChain() public {
        _privateCallPrivate();
    }
    
    // ═══════════════════════════════════════════════════════════
    // 函数调用组合示例
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 演示函数调用链：public -> internal -> private
     */
    function callChain() public {
        _internalFunction(800);
        _privateFunction(900);
    }
    
    /**
     * @notice 演示从 public 函数调用所有类型的函数
     */
    function callAllTypes() public {
        publicFunction(1000);
        _internalFunction(1100);
        _privateFunction(1200);
        // externalFunction(1300); // 不能直接调用，需要通过 this
        this.externalFunction(1300);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 访问控制示例
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 只有 owner 可以调用的 public 函数
     */
    function ownerOnlyFunction() public {
        require(msg.sender == owner, "Only owner");
        publicValue = 9999;
    }
    
    /**
     * @notice 只有 owner 可以调用的 external 函数
     */
    function ownerOnlyExternal() external {
        require(msg.sender == owner, "Only owner");
        publicValue = 8888;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 查询函数
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取所有值（通过 internal 函数）
     * @return pubValue 公共值
     * @return privValue 私有值
     * @return internValue 内部值
     */
    function getAllValues() public view returns (
        uint256 pubValue,
        uint256 privValue,
        uint256 internValue
    ) {
        return (
            publicValue,
            _getPrivateValue(),  // 通过 private 函数获取
            _getInternalValue()  // 通过 internal 函数获取
        );
    }
    
    /**
     * @notice 获取私有值（通过 public 函数）
     * @return 私有值
     */
    function getPrivateValuePublic() public view returns (uint256) {
        return _getPrivateValue();
    }
    
    /**
     * @notice 获取内部值（通过 public 函数）
     * @return 内部值
     */
    function getInternalValuePublic() public view returns (uint256) {
        return _getInternalValue();
    }
}

