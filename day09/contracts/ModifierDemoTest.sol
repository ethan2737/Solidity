// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


contract ModifierDemoTest {

    address public owner;
    uint256 public value;


    event ValueSet(address indexed caller, uint256 oldValue, uint256 newValue);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    // 带前置逻辑和后置逻辑的修改器
    modifier withLogging(){
        // 前置逻辑
        uint256 oldValue = value;
        // 执行函数体
        _;
        // 后置逻辑
        emit ValueSet(msg.sender, oldValue, value);
    }

    function getBalance(address _account) public modifierA modifierBview return(uint256){
        return balances[_account];
    }
}