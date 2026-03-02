//SPEX License-Identifier: MIT
pragma solidity ^0.8.24;

/**
* @title AddressDemo
* @notice 演示 Solidity 地址类型的使用
* @dev 用于学习 adress 类型、msg.sender、msg.value 等预定义变量
* 
* 学习要点：
* 1. address 类型：20字节的地址
* 2. address payable：可以接受 ETH 的地址
* 3. msg.sender: 交易发送者
* 4. msg.value: 发送的ETH数量
* 5. address（this）: 当前合约地址
* 6. 地址比较和转换
*/

contract AddressDemo {
    // 地址变量类型
    // 普通地址：不能直接接收ETH
    address public owner;
    address public manager;

    // payable地址：可以接收ETH
    address payable public treasury;

    // 地址数组
    address[] public members;

    // 地址映射：用于存储地址相关的数据
    // address => bool 就是 key-value的形式
    mapping(address => bool) public isMember; // 白名单
    mapping(address => uint256) public balance; // 记录余额

    // 事件 : 是智能合约的 广播通知 机制，当合约里发生了某些事情，它会向区块链外部喊话，让外界指导发生了什么。
    // indexed:表示这个参数可以被索引搜索
    // 非indexed参数：只能读取，不能直接搜索
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event MemberAdded(address indexed member);
    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);

    // 构造函数:合约在部署时自动执行一次的函数，用于初始化合约状态
    // 构造函数不是必须写的，但如果没有，Solidity会自动生成空的
    constructor(address _manager){
        // msg.sender 是部署者地址
        owner = msg.sender; // 记录谁部署了这个合约
        manager = _manager; // 外部传入的管理员地址

        // 将部署者转换为 payable 地址作为 Treasury
        treasury = payable(msg.sender); // 财务地址设为部署者
    }
    /*
    部署时的流程：
    1. 你运行 npx hardhat run deploy.js
    2. Hardhat 把合约发到区块链
    3. 构造函数自动执行，完成初始化
    4. 合约地址生成，部署完成
    */

    // 地址函数操作
    // 获取当前合约地址
    function getContractAddress() public view returns (address) {
        return address(this);
    }

    // 获取交易发送者地址
    function getSender() public view returns(address){
        return msg.sender;
    }

    // 获取发送的ETH数量
    function getValue() public payable returns(uint256){
        return msg.value;
    }

    // 获取所有信息：合约地址、发送者地址、发送的ETH数量
    function getAllInfo() public payable returns(
        address constantAddress,
        address sender,
        uint256 value
    ){
        return(address(this), msg.sender, msg.value);
    }

    // 地址比较
    
}