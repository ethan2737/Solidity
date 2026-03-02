// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SimpleToken.sol";

/**
 * @title ContractTypeDemo
 * @notice 演示 Solidity 合约类型的使用
 * @dev 用于学习如何引用和交互其他合约
 * 
 * 学习要点：
 * 1. 合约类型变量声明
 * 2. 通过地址引用合约
 * 3. 调用其他合约的函数
 * 4. 接口（interface）的使用
 * 5. 合约部署和引用
 */
contract ContractTypeDemo {
    // ═══════════════════════════════════════════════════════════
    // 合约类型变量
    // ═══════════════════════════════════════════════════════════
    
    // 直接引用合约类型
    SimpleToken public token;
    
    // 通过地址存储合约
    address public tokenAddress;
    
    // 多个合约引用
    SimpleToken public token1;
    SimpleToken public token2;
    
    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════
    
    event TokenSet(address indexed tokenAddress);
    event TokenCreated(address indexed tokenAddress, uint256 initialSupply);
    
    // ═══════════════════════════════════════════════════════════
    // 构造函数
    // ═══════════════════════════════════════════════════════════
    
    constructor() {
        // 构造函数中可以为空，稍后设置
    }
    
    // ═══════════════════════════════════════════════════════════
    // 设置合约引用（通过地址）
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 通过地址设置合约引用
     * @param _tokenAddress 合约地址
     */
    function setToken(address _tokenAddress) public {
        require(_tokenAddress != address(0), "Invalid address");
        
        // 将地址转换为合约类型
        token = SimpleToken(_tokenAddress);
        tokenAddress = _tokenAddress;
        
        emit TokenSet(_tokenAddress);
    }
    
    /**
     * @notice 设置多个合约引用
     * @param _token1Address 第一个合约地址
     * @param _token2Address 第二个合约地址
     */
    function setTokens(address _token1Address, address _token2Address) public {
        require(_token1Address != address(0), "Invalid address");
        require(_token2Address != address(0), "Invalid address");
        
        token1 = SimpleToken(_token1Address);
        token2 = SimpleToken(_token2Address);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 调用其他合约的函数
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取代币名称
     * @return 代币名称
     */
    function getTokenName() public view returns (string memory) {
        require(address(token) != address(0), "Token not set");
        return token.name();
    }
    
    /**
     * @notice 获取代币符号
     * @return 代币符号
     */
    function getTokenSymbol() public view returns (string memory) {
        require(address(token) != address(0), "Token not set");
        return token.symbol();
    }
    
    /**
     * @notice 获取代币总供应量
     * @return 总供应量
     */
    function getTokenTotalSupply() public view returns (uint256) {
        require(address(token) != address(0), "Token not set");
        return token.totalSupply();
    }
    
    /**
     * @notice 获取账户代币余额
     * @param _account 账户地址
     * @return 余额
     */
    function getTokenBalance(address _account) public view returns (uint256) {
        require(address(token) != address(0), "Token not set");
        return token.balanceOf(_account);
    }
    
    /**
     * @notice 通过当前合约转账代币
     * @param _to 接收地址
     * @param _amount 转账数量
     */
    function transferToken(address _to, uint256 _amount) public returns (bool) {
        require(address(token) != address(0), "Token not set");
        // 注意：这需要当前合约有足够的代币余额
        return token.transfer(_to, _amount);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 部署新合约
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 部署新的 SimpleToken 合约
     * @param _initialSupply 初始供应量
     * @return 新合约地址
     */
    function createToken(uint256 _initialSupply) public returns (address) {
        SimpleToken newToken = new SimpleToken(_initialSupply);
        address newTokenAddress = address(newToken);
        
        // 自动设置为当前 token
        token = newToken;
        tokenAddress = newTokenAddress;
        
        emit TokenCreated(newTokenAddress, _initialSupply);
        
        return newTokenAddress;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 合约地址操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取合约地址
     * @return 合约地址
     */
    function getTokenAddress() public view returns (address) {
        return address(token);
    }
    
    /**
     * @notice 检查合约是否已设置
     * @return 是否已设置
     */
    function isTokenSet() public view returns (bool) {
        return address(token) != address(0);
    }
    
    /**
     * @notice 比较两个合约地址
     * @param _token1Address 第一个合约地址
     * @param _token2Address 第二个合约地址
     * @return 是否相等
     */
    function compareTokenAddresses(address _token1Address, address _token2Address) public pure returns (bool) {
        return _token1Address == _token2Address;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 批量操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取多个代币的余额
     * @param _account 账户地址
     * @return balance1 第一个代币余额
     * @return balance2 第二个代币余额
     */
    function getMultipleTokenBalances(address _account) public view returns (uint256 balance1, uint256 balance2) {
        require(address(token1) != address(0), "Token1 not set");
        require(address(token2) != address(0), "Token2 not set");
        
        return (token1.balanceOf(_account), token2.balanceOf(_account));
    }
}

