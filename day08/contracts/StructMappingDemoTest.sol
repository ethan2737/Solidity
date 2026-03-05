// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract StructMappingDemoTest {
    // 用户结构体
    struct User {
        address addr; // 用户地址
        uint256 balance; // 用户余额
        uint256 createAt; // 创建时间
        bool isActive; // 是否激活
    }

    // 订单结构体
    struct Order {
        uint256 orderID; // 订单Id
        address buger; // 买家地址
        address seller; // 买家地址
        uint256 amount; // 订单金额
        uint256 timestamp; // 订单时间
        OrderStatus status; // 订单状态
    }

    // 订单状态枚举
    enum OrderStatus {
        Pending, // 待处理
        Confirmed, // 已确认
        Shipped, // 已发货
        Completed, // 已完成
        Cancelled // 已取消
    }

    // 产品结构体
    struct Product {
        uint256 productID; // 产品ID
        string name; // 产品名称
        uint256 price; // 产品价格
        uint256 stock; // 库存数量
        address owner; // 所有者地址
    }

    // 地址到用户的映射
    mapping(address => User) public users;

    // 订单ID到订单的映射
    mapping(uint256 => Order) public orders;

    // 产品ID到产品的映射
    mapping(uint256 => Product) public products;

    // 嵌套映射：用户地址到产品ID到数量
    mapping(address => mapping(uint256 => uint256)) public userProducts;

    // 辅助数组，用于遍历映射
    address[] public allUsers; // 所有用户地址
    uint256[] public allOrderIds; // 所有订单ID
    uint256[] public allProductIds; // 所有产品ID

    // 检查地址是否已经存在
    mapping(address => bool) public userExists;
    // 检查订单是否存在
    mapping(uint256 => bool) public orderExists;
    // 检查产品是否存在
    mapping(uint256 => bool) public productExists;

    // 计数器
    uint256 public nextOrderId = 1;
    uint256 public nextProductId = 1;

    // 事件
    event UserCreated(address indexed user, uint256 balance, uint256 timestamp);
    event UserUpdated(
        address indexed user,
        uint256 oldBalance,
        uint256 newBalance
    );
    event OrderCreated(
        uint256 indexed orderId,
        address indexed buyer,
        uint256 amount
    );
    event OrderStatusChanged(
        uint256 indexed orderId,
        OrderStatus oldStatus,
        OrderStatus newStatus
    );
    event ProductCreated(uint256 indexed productId, string name, uint256 price);

    /**
     * @notice 创建用户（如题目要求）
     * @param _addr 用户地址
     * @param _balance 初始余额
     */
    function createUser(address _addr, uint256 _balance) public {
        require(_addr != address(0), "Invalid address");
        require(!userExists[_addr], "user already exists");

        users[_addr] = User({
            addr: _addr,
            balance: _balance,
            createAt: block.timestamp,
            isActive: true
        });

        allUsers.push(_addr);
        userExists[_addr] = true;

        emit UserCreated(_addr, _balance, block.timestamp);
    }


    /**
     * @notice 获取用户信息
     * @param _addr 用户地址
     * @return 用户结构体
     */
    function getUser(address _addr) public view returns (User memory) {
        require(userExists[_addr], "user does not exist");
        return users[_addr];
    }

    /**
     * @notice 更新用户余额
     * @param _addr 用户地址
     * @param _newBalance 新余额
     */
     

}
