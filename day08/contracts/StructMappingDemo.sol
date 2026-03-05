// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title StructMappingDemo
 * @notice 演示 Solidity 结构体和映射的使用
 * @dev 用于学习结构体定义、映射存储、结构体操作
 * 
 * 学习要点：
 * 1. 结构体定义：struct User {address addr; uint balance;}
 * 2. 映射存储：mapping(address => User)
 * 3. 结构体操作：创建、读取、更新
 * 4. 映射的高效性
 */
contract StructMappingDemo {
    // ═══════════════════════════════════════════════════════════
    // 结构体定义
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 用户结构体（如题目要求）
     * @dev 包含地址和余额
     */
    struct User {
        address addr;      // 用户地址
        uint256 balance;   // 用户余额
        uint256 createdAt; // 创建时间
        bool isActive;     // 是否激活
    }
    
    /**
     * @notice 订单结构体
     */
    struct Order {
        uint256 orderId;   // 订单ID
        address buyer;     // 买家地址
        address seller;    // 卖家地址
        uint256 amount;    // 订单金额
        uint256 timestamp; // 订单时间
        OrderStatus status; // 订单状态
    }
    
    /**
     * @notice 订单状态枚举
     */
    enum OrderStatus {
        Pending,    // 待处理
        Confirmed, // 已确认
        Shipped,   // 已发货
        Completed, // 已完成
        Cancelled  // 已取消
    }
    
    /**
     * @notice 产品结构体
     */
    struct Product {
        uint256 productId;  // 产品ID
        string name;        // 产品名称
        uint256 price;      // 产品价格
        uint256 stock;      // 库存数量
        address owner;      // 所有者地址
    }
    
    // ═══════════════════════════════════════════════════════════
    // 映射定义（如题目要求）
    // ═══════════════════════════════════════════════════════════
    
    // 地址到用户的映射
    mapping(address => User) public users;
    
    // 订单ID到订单的映射
    mapping(uint256 => Order) public orders;
    
    // 产品ID到产品的映射
    mapping(uint256 => Product) public products;
    
    // 嵌套映射：用户地址到产品ID到数量
    mapping(address => mapping(uint256 => uint256)) public userProducts;
    
    // ═══════════════════════════════════════════════════════════
    // 辅助数组（用于遍历映射）
    // ═══════════════════════════════════════════════════════════
    
    address[] public allUsers;           // 所有用户地址
    uint256[] public allOrderIds;       // 所有订单ID
    uint256[] public allProductIds;     // 所有产品ID
    
    // 检查地址是否已存在
    mapping(address => bool) public userExists;
    mapping(uint256 => bool) public orderExists;
    mapping(uint256 => bool) public productExists;
    
    // ═══════════════════════════════════════════════════════════
    // 计数器
    // ═══════════════════════════════════════════════════════════
    
    uint256 public nextOrderId = 1;
    uint256 public nextProductId = 1;
    
    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════
    
    event UserCreated(address indexed user, uint256 balance, uint256 timestamp);
    event UserUpdated(address indexed user, uint256 oldBalance, uint256 newBalance);
    event OrderCreated(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event OrderStatusChanged(uint256 indexed orderId, OrderStatus oldStatus, OrderStatus newStatus);
    event ProductCreated(uint256 indexed productId, string name, uint256 price);
    
    // ═══════════════════════════════════════════════════════════
    // 用户管理函数（如题目要求）
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 创建用户（如题目要求）
     * @param _addr 用户地址
     * @param _balance 初始余额
     */
    function createUser(address _addr, uint256 _balance) public {
        require(_addr != address(0), "Invalid address");
        require(!userExists[_addr], "User already exists");
        
        users[_addr] = User({
            addr: _addr,
            balance: _balance,
            createdAt: block.timestamp,
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
        require(userExists[_addr], "User does not exist");
        return users[_addr];
    }
    
    /**
     * @notice 更新用户余额
     * @param _addr 用户地址
     * @param _newBalance 新余额
     */
    function updateUserBalance(address _addr, uint256 _newBalance) public {
        require(userExists[_addr], "User does not exist");
        
        uint256 oldBalance = users[_addr].balance;
        users[_addr].balance = _newBalance;
        
        emit UserUpdated(_addr, oldBalance, _newBalance);
    }
    
    /**
     * @notice 增加用户余额
     * @param _addr 用户地址
     * @param _amount 增加的数量
     */
    function increaseUserBalance(address _addr, uint256 _amount) public {
        require(userExists[_addr], "User does not exist");
        
        uint256 oldBalance = users[_addr].balance;
        users[_addr].balance += _amount;
        
        emit UserUpdated(_addr, oldBalance, users[_addr].balance);
    }
    
    /**
     * @notice 减少用户余额
     * @param _addr 用户地址
     * @param _amount 减少的数量
     */
    function decreaseUserBalance(address _addr, uint256 _amount) public {
        require(userExists[_addr], "User does not exist");
        require(users[_addr].balance >= _amount, "Insufficient balance");
        
        uint256 oldBalance = users[_addr].balance;
        users[_addr].balance -= _amount;
        
        emit UserUpdated(_addr, oldBalance, users[_addr].balance);
    }
    
    /**
     * @notice 激活/停用用户
     * @param _addr 用户地址
     * @param _isActive 是否激活
     */
    function setUserActive(address _addr, bool _isActive) public {
        require(userExists[_addr], "User does not exist");
        users[_addr].isActive = _isActive;
    }
    
    /**
     * @notice 获取用户余额
     * @param _addr 用户地址
     * @return 余额
     */
    function getUserBalance(address _addr) public view returns (uint256) {
        require(userExists[_addr], "User does not exist");
        return users[_addr].balance;
    }
    
    /**
     * @notice 检查用户是否存在
     * @param _addr 用户地址
     * @return 是否存在
     */
    function userExistsCheck(address _addr) public view returns (bool) {
        return userExists[_addr];
    }
    
    // ═══════════════════════════════════════════════════════════
    // 订单管理函数
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 创建订单
     * @param _buyer 买家地址
     * @param _seller 卖家地址
     * @param _amount 订单金额
     * @return 订单ID
     */
    function createOrder(address _buyer, address _seller, uint256 _amount) public returns (uint256) {
        require(_buyer != address(0) && _seller != address(0), "Invalid address");
        require(_amount > 0, "Amount must be greater than 0");
        
        uint256 orderId = nextOrderId++;
        
        orders[orderId] = Order({
            orderId: orderId,
            buyer: _buyer,
            seller: _seller,
            amount: _amount,
            timestamp: block.timestamp,
            status: OrderStatus.Pending
        });
        
        allOrderIds.push(orderId);
        orderExists[orderId] = true;
        
        emit OrderCreated(orderId, _buyer, _amount);
        
        return orderId;
    }
    
    /**
     * @notice 获取订单信息
     * @param _orderId 订单ID
     * @return 订单结构体
     */
    function getOrder(uint256 _orderId) public view returns (Order memory) {
        require(orderExists[_orderId], "Order does not exist");
        return orders[_orderId];
    }
    
    /**
     * @notice 更新订单状态
     * @param _orderId 订单ID
     * @param _newStatus 新状态
     */
    function updateOrderStatus(uint256 _orderId, OrderStatus _newStatus) public {
        require(orderExists[_orderId], "Order does not exist");
        
        OrderStatus oldStatus = orders[_orderId].status;
        orders[_orderId].status = _newStatus;
        
        emit OrderStatusChanged(_orderId, oldStatus, _newStatus);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 产品管理函数
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 创建产品
     * @param _name 产品名称
     * @param _price 产品价格
     * @param _stock 库存数量
     * @return 产品ID
     */
    function createProduct(string memory _name, uint256 _price, uint256 _stock) public returns (uint256) {
        require(_price > 0, "Price must be greater than 0");
        
        uint256 productId = nextProductId++;
        
        products[productId] = Product({
            productId: productId,
            name: _name,
            price: _price,
            stock: _stock,
            owner: msg.sender
        });
        
        allProductIds.push(productId);
        productExists[productId] = true;
        
        emit ProductCreated(productId, _name, _price);
        
        return productId;
    }
    
    /**
     * @notice 获取产品信息
     * @param _productId 产品ID
     * @return 产品结构体
     */
    function getProduct(uint256 _productId) public view returns (Product memory) {
        require(productExists[_productId], "Product does not exist");
        return products[_productId];
    }
    
    /**
     * @notice 更新产品库存
     * @param _productId 产品ID
     * @param _newStock 新库存
     */
    function updateProductStock(uint256 _productId, uint256 _newStock) public {
        require(productExists[_productId], "Product does not exist");
        require(products[_productId].owner == msg.sender, "Only owner can update");
        
        products[_productId].stock = _newStock;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 嵌套映射操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置用户拥有的产品数量
     * @param _user 用户地址
     * @param _productId 产品ID
     * @param _quantity 数量
     */
    function setUserProduct(address _user, uint256 _productId, uint256 _quantity) public {
        require(userExists[_user], "User does not exist");
        require(productExists[_productId], "Product does not exist");
        
        userProducts[_user][_productId] = _quantity;
    }
    
    /**
     * @notice 获取用户拥有的产品数量
     * @param _user 用户地址
     * @param _productId 产品ID
     * @return 数量
     */
    function getUserProduct(address _user, uint256 _productId) public view returns (uint256) {
        return userProducts[_user][_productId];
    }
    
    // ═══════════════════════════════════════════════════════════
    // 查询函数
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取所有用户地址
     * @return 用户地址数组
     */
    function getAllUsers() public view returns (address[] memory) {
        return allUsers;
    }
    
    /**
     * @notice 获取用户数量
     * @return 用户数量
     */
    function getUserCount() public view returns (uint256) {
        return allUsers.length;
    }
    
    /**
     * @notice 获取所有订单ID
     * @return 订单ID数组
     */
    function getAllOrderIds() public view returns (uint256[] memory) {
        return allOrderIds;
    }
    
    /**
     * @notice 获取所有产品ID
     * @return 产品ID数组
     */
    function getAllProductIds() public view returns (uint256[] memory) {
        return allProductIds;
    }
    
    /**
     * @notice 计算所有用户的总余额
     * @return 总余额
     */
    function getTotalBalance() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < allUsers.length; i++) {
            total += users[allUsers[i]].balance;
        }
        return total;
    }
    
    /**
     * @notice 查找余额大于指定值的用户
     * @param _minBalance 最小余额
     * @return 符合条件的用户地址数组
     */
    function findUsersWithBalance(uint256 _minBalance) public view returns (address[] memory) {
        uint256 count = 0;
        
        // 先计算数量
        for (uint256 i = 0; i < allUsers.length; i++) {
            if (users[allUsers[i]].balance >= _minBalance) {
                count++;
            }
        }
        
        // 创建数组并填充
        address[] memory result = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allUsers.length; i++) {
            if (users[allUsers[i]].balance >= _minBalance) {
                result[index++] = allUsers[i];
            }
        }
        
        return result;
    }
}

