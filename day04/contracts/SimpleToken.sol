// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SimpleToken
 * @notice 一个简单的 ERC20 代币，用于演示合约类型引用
 * @dev 这是被引用的合约示例
 */
contract SimpleToken {
    string public name = "Simple Token";
    string public symbol = "ST";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
        emit Transfer(address(0), msg.sender, _initialSupply);
    }
    
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}

