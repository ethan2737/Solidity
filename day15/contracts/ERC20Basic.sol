// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ERC20Basic
 * @notice 一个最基本的 ERC20 合约实现（不使用 OpenZeppelin）
 * @dev 用于深入理解 ERC20 标准的底层实现
 * 
 * 学习要点：
 * 1. ERC20 标准接口的完整实现
 * 2. approve/transferFrom 机制的底层实现
 * 3. 事件的定义和触发
 * 4. 余额管理和授权管理
 * 
 * 小贴士：代币是 DeFi 基础，理解 ERC20 的 approve/transferFrom 等机制很重要。
 */

contract ERC20Basic {
    // ERC20 标准状态变量
    string public name;             // 代币名称
    string public symbol;           // 代币符号
    uint8 public decimals;          // 小数位数
    uint256 public totalSupply;     // 代币总供应量

    mapping(address => uint256) public balanceOf;       // 地址-余额的映射
    mapping(address => mapping(address => uint256)) public allowance;   // 地址-地址-授权金额的映射

    // ERC20 标准事件
    // Transfer 事件：当代币从一个地址转移到另一个地址时触发
    event Transfer(address indexed from, address indexed to, uint256 value);
    // Approval 事件：当代币所有者授权给另一个地址时触发
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
        @dev 构造函数，初始化代币名称、符号、小数位数和总供应量
        @param _name 代币名称
        @param _symbol 代币符号
        @param _decimals 小数位数
        @param _initialSupply 总供应量
     */
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _initialSupply){
        // 初始化代币名称、符号、小数位数和总供应量
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _initialSupply;

        // 初始化合约创建者的余额
        balanceOf[msg.sender] = _initialSupply;

        // 触发初始化事件：从 0 地址转移到合约创建者
        emit Transfer(address(0), msg.sender, _initialSupply);  
    }

    /**
     * @notice 转账代币
     * @param _to 接收地址
     * @param _value 转账数量
     * @return 是否成功
    */
    function transfer(address _to, uint256 _value) public returns(bool) {
        // 检查发送者地址是否为0地址
        require(_to != address(0), "ERC20: transfer to the zero address");
        // 检查发送者余额是否足够
        require(balanceOf[msg.sender] >= _value, "ERC20: insufficient balance");
        // 扣除发送者余额
        balanceOf[msg.sender] -= _value;
        // 增加接收者余额
        balanceOf[_to] += _value;

        // 触发转账事件
        emit Transfer(msg.sender, _to, _value);

        // 返回成功
        return true;
    }


    /**
     * @notice 授权其他地址使用代币
     * @param _spender 被授权地址
     * @param _value 授权金额
     * @return 是否成功
    */
    function approve(address _spender, uint256 _value) public returns(bool) {
        // 检查被授权地址是否为0地址
        require(_spender != address(0), "ERC20: approve to the zero address");

        // 更新授权金额
        allowance[msg.sender][_spender] = _value;

        // 触发授权事件
        emit Approval(msg.sender, _spender, _value);

        // 返回成功
        return true;
    }


    /**
     * @notice 代理转账
     * @param _from 转出地址
     * @param _to 接收地址
     * @param _value 转账数量
     * @return 是否成功
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns(bool){
        // 检查转出地址是否为0地址
        require(_from != address(0), "ERC20: transfer from the zero address");
        // 检查接收地址是否为0地址
        require(_to != address(0), "ERC20: transfer to the zero address");
        // 检查转出地址余额是否足够
        require(balanceOf[_from] >= _value, "ERC20: insufficient balance");
        // 检查授权金额是否足够
        require(allowance[_from][msg.sender] >= _value, "ERC20: allowance exceeded");

        // 扣除转出地址余额
        balanceOf[_from] -= _value;

        // 扣除授权金额
        allowance[_from][msg.sender] -= _value;

        // 增加接收者余额
        balanceOf[_to] += _value;

        // 触发转账事件
        emit Transfer(_from, _to, _value);

        // 返回成功
        return true;
    }

    // 辅助函数
    /**
     * @notice 增加授权额度（安全方式）
     * @param _spender 被授权地址
     * @param _addedValue 增加的授权数量
     * @return 是否成功
     * 
     * 避免 approve 的前置攻击（front-running attack）
     */
    function increaseAllowance(address _spender, uint256 _addedValue) public returns(bool){
        // 检查被授权地址是否为0地址
        require(_spender != address(0), "ERC20: increase allowance to the zero address");
        // 获取当前授权金额
        uint256 currentAllowance = allowance[msg.sender][_spender];
        // 计算新的授权金额
        uint256 newAllowance = currentAllowance + _addedValue;
        // 更新授权金额
        allowance[msg.sender][_spender] = newAllowance;

        // 触发授权事件
        emit Approval(msg.sender, _spender, newAllowance);
        // 返回成功
        return true;
    }

    /**
     * @notice 减少授权额度
     * @param _spender 被授权地址
     * @param _subtractedValue 减少的授权数量
     * @return 是否成功
     */
    function decreaseAllowance(address _spender, uint256 _subtractedValue) public returns(bool){
        // 判断被授权地址是否是零定制
        require( _spender != address(0), "ERC20: approve to zore address");
        // 获取当前的授权金额
        uint256 currentAllowance = allowance[msg.sender][_spender];
        // 判断当前授权金额是否大于减少的金额
        require(currentAllowance >= _subtractedValue, "ERC20: decreased allowance below zero");
        // 计算授权后的额度
        uint256 newAllowance = currentAllowance - _subtractedValue;
        // 更新授权金额
        allowance[msg.sender][_spender] = newAllowance;

        // 出发授权事件
        emit Approval(msg.sender, _spender, newAllowance);
        return true;
    }
}