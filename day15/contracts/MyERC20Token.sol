// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// OpenZeppelin 官方 ERC20 实现（已通过安全审计）
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// 所有权管理（只有 owner 可以执行某些操作）
improt "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyERC20Token
 * @notice 一个基本的 ERC20 代币合约（使用 OpenZeppelin 模板改写）
 * @dev 用于学习 ERC20 代币标准的实现
 */

contract MyERC20Token is ERC20, Ownable {
    // 状态变量
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 100万代币
    uint256 public maxSupply; // 最大供应量
    bool public mintingFinished; // 铸造是否已结束

    // 事件
    // 铸造事件：从哪个地址，铸造了多少代币
    event Mint(adress indexed to, uint256 amount);
    // 销毁事件：从哪个地址，销毁了多少代币
    event Burn(address indexed from, uint256 amount);
    // 是否停止铸造事件
    event MintingFinished()


    /**
    * @notice 构造函数，初始化代币
    * @param _name 代币名称
    * @param _symbol 代币符号
    * @param _maxSupply 最大供应量（0表示无限制）
    */
    constructor(string memory _name, string memory _symbol, uint256 _maxSupply) ERC20(_name, _symbol) Ownable(msg.sender){
        // 初始化最大供应量
        maxSupply = _maxSupply;
        // 是否铸造完成：否
        mintingFinished = false;

        // 向部署者地址铸造初始供应量
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // ERC20 标准函数（继承自 OpenZeppelin）

    /**
     * @notice 转账代币（ERC20 标准函数）
     * @param to 接收地址
     * @param amount 转账数量
     * @return 是否成功
     * 
     * 继承自 ERC20，自动触发 Transfer 事件
     */
    function transfer(address to, uint256 amount) public override returns(bool){
        // 调用父合约（ERC20）中的转账方法
        return super.transfer(to, amount);
    }


    /**
     * @notice 授权其他地址使用代币（ERC20 标准函数）
     * @param spender 被授权地址
     * @param amount 授权数量
     * @return 是否成功
     */
    function approve(address spender, uint256 amount) public override returns(bool){
        // 调用父合约中的授权方法
        return super.approve(spender, amount);
    }


    /**
     * @notice 代理转账（ERC20 标准函数）
     * @param from 转出地址
     * @param to 接收地址
     * @param amount 转账数量
     * @return 是否成功
     */
    function transferFrom(address from, address to, uint256 amount) public override returns(bool){
        return super.transferFrom(from, to, amount);
    }


    // 铸造和销毁函数

     /**
     * @notice 铸造新代币（仅所有者）
     * @param to 接收地址
     * @param amount 铸造数量
     */
    function mint(address to, uint256 amount) public onlyOwner {
        // 判断铸造是否完成
        require(!mintingFinished, "Mintng is finished");
        require(to != address(0), "Cannot mint to zero address");

        // 判断最大供应量
        if (maxSupply > 0){
            require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        }
        _mint(to, amount);
        emit Mint(to, amount);
    }


    /**
     * @notice 销毁代币
     * @param amount 销毁数量
     */
    function burn(uint256 amount) public {
        // 该方法继承自 ERC20 标准库
        _burn(msg.sender, amount);
        emit Burn(msg.sender, amount);
    }

    /**
     * @notice 从指定地址销毁代币（仅所有者）
     * @param from 销毁地址
     * @param amount 销毁数量
     */
    function burnFrom(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
        emit Burn(from, amount);
    }
    
    /**
     * @notice 结束铸造（仅所有者）
     */
    function finishMinting() public onlyOwner {
        require(!mintingFinished, "Minting already finished");
        mintingFinished = true;
        emit MintingFinished();
    }


    // 查询函数


    /**
     * @notice 获取总供应量（ERC20 标准函数）
     * @return 总供应量
     */
    function totalSupply() public view override returns (uint256) {
        return super.totalSupply();
    }
    
    /**
     * @notice 获取账户余额（ERC20 标准函数）
     * @param account 账户地址
     * @return 余额
     */
    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account);
    }
    
    /**
     * @notice 获取授权额度（ERC20 标准函数）
     * @param owner 所有者地址
     * @param spender 被授权地址
     * @return 授权额度
     */
    function allowance(address owner, address spender) 
        public 
        view 
        override 
        returns (uint256) 
    {
        return super.allowance(owner, spender);
    }
}