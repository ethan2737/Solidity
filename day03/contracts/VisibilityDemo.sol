// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title VisibilityDemo
 * @notice 演示 Solidity 可见性修饰符
 * @dev 用于理解 public, private, internal, external 的区别
 * 
 * 学习要点：
 * 1. public: 外部和内部都可访问，自动生成 getter
 * 2. private: 只能在同一合约内访问
 * 3. internal: 合约内部和继承合约可访问（默认）
 * 4. external: 只能从外部调用
 */
contract VisibilityDemo {
    // ═══════════════════════════════════════════════════════════
    // 不同可见性的状态变量
    // ═══════════════════════════════════════════════════════════
    
    uint256 public publicVar = 100;      // 外部可访问，自动生成 getter
    uint256 private privateVar = 200;    // 只能合约内部访问
    uint256 internal internalVar = 300;   // 合约内部和继承合约可访问
    
    // ═══════════════════════════════════════════════════════════
    // Public 函数：外部和内部都可调用
    // ═══════════════════════════════════════════════════════════
    
    function publicFunction() public pure returns (string memory) {
        return "This is a public function";
    }
    
    function callPublicFunction() public view returns (string memory) {
        // public 函数可以从内部调用
        return publicFunction();
    }
    
    // ═══════════════════════════════════════════════════════════
    // Private 函数：只能在同一合约内调用
    // ═══════════════════════════════════════════════════════════
    
    function privateFunction() private pure returns (string memory) {
        return "This is a private function";
    }
    
    function callPrivateFunction() public view returns (string memory) {
        // private 函数可以从合约内部调用
        return privateFunction();
    }
    
    function getPrivateVar() public view returns (uint256) {
        // private 变量可以从合约内部访问
        return privateVar;
    }
    
    function setPrivateVar(uint256 _value) public {
        // private 变量可以从合约内部修改
        privateVar = _value;
    }
    
    // ═══════════════════════════════════════════════════════════
    // Internal 函数：合约内部和继承合约可调用
    // ═══════════════════════════════════════════════════════════
    
    function internalFunction() internal pure returns (string memory) {
        return "This is an internal function";
    }
    
    function callInternalFunction() public view returns (string memory) {
        // internal 函数可以从合约内部调用
        return internalFunction();
    }
    
    function getInternalVar() public view returns (uint256) {
        // internal 变量可以从合约内部访问
        return internalVar;
    }
    
    function setInternalVar(uint256 _value) public {
        // internal 变量可以从合约内部修改
        internalVar = _value;
    }
    
    // ═══════════════════════════════════════════════════════════
    // External 函数：只能从外部调用
    // ═══════════════════════════════════════════════════════════
    
    function externalFunction() external pure returns (string memory) {
        return "This is an external function";
    }
    
    // 注意：external 函数不能从合约内部直接调用
    // 下面的代码会编译错误：
    // function callExternalFunction() public view returns (string memory) {
    //     return externalFunction(); // ❌ 编译错误！
    // }
    
    // 但可以通过 this 关键字调用：
    function callExternalFunctionViaThis() public view returns (string memory) {
        return this.externalFunction(); // ✅ 通过 this 调用
    }
}

/**
 * @title VisibilityDemoChild
 * @notice 继承合约，演示 internal 的可见性
 */
contract VisibilityDemoChild is VisibilityDemo {
    /**
     * @notice 子合约可以访问父合约的 internal 成员
     */
    function accessInternalFromChild() public view returns (uint256) {
        return internalVar; // ✅ 可以访问 internal 变量
    }
    
    function callInternalFromChild() public view returns (string memory) {
        return internalFunction(); // ✅ 可以调用 internal 函数
    }
    
    // 注意：子合约不能访问父合约的 private 成员
    // function accessPrivateFromChild() public view returns (uint256) {
    //     return privateVar; // ❌ 编译错误！
    // }
}

