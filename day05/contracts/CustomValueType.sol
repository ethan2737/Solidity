// SPDX-License-Identifier: MIT
// 许可证标识：MIT 是最常见的开源许可证，允许代码自由使用、修改和分发

pragma solidity ^0.8.24;
// Solidity 编译器版本要求：使用 0.8.24 及以上版本
// ^ 表示向上兼容，即 0.8.24 到 0.9.0 之间的版本都可以

/**
 * @title CustomValueType
 * @notice 演示 Solidity 自定义值类型（Solidity 0.8.0+）
 * @dev 用于学习用户定义的值类型
 *
 * 学习要点：
 * 1. 自定义值类型定义
 * 2. 值类型的包装和展开
 * 3. 值类型的转换
 * 4. 值类型的使用场景
 *
 * ═══════════════════════════════════════════════════════════════════
 * 什么是自定义值类型？
 * ═══════════════════════════════════════════════════════════════════
 *
 * 自定义值类型（Custom Value Types）是 Solidity 0.8 引入的新特性。
 * 它允许开发者基于内置类型创建新的类型，带来以下好处：
 *
 * 1. 类型安全：编译器会检查类型匹配，防止意外的类型混用
 *    - 例如：不能直接把 OrderId 当作 UserId 使用
 *
 * 2. 代码可读性：用 Price 而不是 uint256 表示价格，用 UserId 而不是 uint256 表示用户ID
 *
 * 3. 语义明确：代码意图更清晰，代码审查更简单
 *
 * 4. IDE 支持：更好的自动补全和类型检查
 *
 * 语法：
 * type TypeName is UnderlyingType;
 *
 * 示例：
 * type Price is uint256;      // 基于 uint256 创建 Price 类型
 * type UserId is uint128;    // 基于 uint128 创建 UserId 类型
 *
 * 注意：
 * - 底层类型只能是整数类型（uint/int/uint8...uint256）
 * - 不能基于 address、bytes、string 等创建自定义类型
 *
 */

contract CustomValueType {
    // ═══════════════════════════════════════════════════════════
    // 自定义值类型定义（在合约外部）
    // ═══════════════════════════════════════════════════════════
    // 注意：类型定义必须在合约外部，位于合约之前的代码中

    // 定义用户ID类型（基于 uint128）
    // 用途：用于标识用户身份，比 uint256 更节省存储空间
    // 说明：uint128 足以存储数十亿级别的用户数量
    type UserId is uint128;

    // 定义订单ID类型（基于 uint256）
    // 用途：用于标识订单，因为订单数量可能非常多
    // 说明：uint256 提供最大的灵活性，支持海量订单
    type OrderId is uint256;

    // 定义价格类型（基于 uint256，表示 wei）
    // 用途：用于表示加密货币价格，单位为 wei
    // 说明：1 ether = 10^18 wei，uint256 可以存储最大约 10^59 ether
    type Price is uint256;

    // 定义百分比类型（基于 uint8，0-100）
    // 用途：用于表示折扣百分比，范围 0-100
    // 说明：uint8 足以存储 0-255，正好满足 0-100 的需求，更节省 gas
    type Percentage is uint8;

    // ═══════════════════════════════════════════════════════════
    // 状态变量
    // ═══════════════════════════════════════════════════════════

    // 当前用户ID（UserId 类型）
    // 初始值为 0，表示还没有创建任何用户
    UserId public currentUserId;

    // 当前订单ID（OrderId 类型）
    // 初始值为 0，表示还没有创建任何订单
    OrderId public currentOrderId;

    // 当前价格（Price 类型）
    // 用于存储当前设置的价格
    Price public currentPrice;

    // 当前折扣（Percentage 类型）
    // 用于存储当前的折扣百分比
    Percentage public discount;

    // 映射：用户ID到地址
    // key 是 UserId 类型，value 是 address 类型
    // 场景：存储每个用户ID对应的区块链地址
    mapping(UserId => address) public userIdToAddress;

    // 映射：订单ID到价格
    // key 是 OrderId 类型，value 是 Price 类型
    // 场景：存储每个订单的价格信息
    mapping(OrderId => Price) public orderPrices;

    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════

    // 用户ID创建事件
    // indexed userId：可被索引，方便按用户ID搜索
    event UserIdCreated(UserId indexed userId, address user);

    // 订单创建事件
    event OrderCreated(OrderId indexed orderId, Price price);

    // 价格更新事件
    event PriceUpdated(Price oldPrice, Price newPrice);

    // ═══════════════════════════════════════════════════════════
    // 构造函数
    // ═══════════════════════════════════════════════════════════

    constructor() {
        // 初始化值类型
        // 使用 UserId.wrap() 将底层 uint128 包装为 UserId 类型
        // 初始值 0 表示"无用户"
        currentUserId = UserId.wrap(0);

        // 初始化订单ID，0 表示"无订单"
        currentOrderId = OrderId.wrap(0);

        // 初始化价格，0 表示"未设置价格"
        currentPrice = Price.wrap(0);

        // 初始化折扣，0 表示"无折扣"
        discount = Percentage.wrap(0);
    }

    // ═══════════════════════════════════════════════════════════
    // UserId 操作
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 创建新用户ID
     * @dev 递增当前用户ID并关联到用户地址
     *
     * 流程：
     * 1. 验证地址有效性（不能是零地址）
     * 2. 递增用户ID（使用 unwrap 取出值，加1，再包装回去）
     * 3. 存储地址映射
     * 4. 触发事件
     *
     * 包装（wrap）和展开（unwrap）：
     * - UserId.wrap(value)：将 uint128 值转换为 UserId 类型
     * - UserId.unwrap(userId)：将 UserId 类型转换回 uint128 值
     *
     * @param _user 用户地址
     * @return 新的用户ID
     */
    function createUserId(address _user) public returns (UserId) {
        require(_user != address(0), "Invalid address");

        // 递增用户ID
        // 步骤1: UserId.unwrap(currentUserId) 取出当前的 uint128 值
        // 步骤2: + 1 递增
        // 步骤3: UserId.wrap(...) 包装回 UserId 类型
        currentUserId = UserId.wrap(UserId.unwrap(currentUserId) + 1);

        // 将用户ID映射到地址
        userIdToAddress[currentUserId] = _user;

        // 触发事件，记录创建的用户ID和地址
        emit UserIdCreated(currentUserId, _user);

        // 返回新创建的用户ID
        return currentUserId;
    }

    /**
     * @notice 获取用户地址
     * @dev 通过用户ID查询对应的区块链地址
     *
     * @param _userId 用户ID
     * @return 用户地址
     */
    function getUserAddress(UserId _userId) public view returns (address) {
        return userIdToAddress[_userId];
    }

    /**
     * @notice 获取当前用户ID
     * @dev 返回当前最大的用户ID（已创建的最高ID）
     *
     * @return 当前用户ID
     */
    function getCurrentUserId() public view returns (UserId) {
        return currentUserId;
    }

    // ═══════════════════════════════════════════════════════════
    // OrderId 操作
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 创建新订单
     * @dev 递增订单ID并关联价格
     *
     * 流程：
     * 1. 递增订单ID
     * 2. 存储订单价格映射
     * 3. 触发事件
     *
     * @param _price 订单价格（Price 类型）
     * @return 新的订单ID（OrderId 类型）
     */
    function createOrder(Price _price) public returns (OrderId) {
        // 递增订单ID
        // 与 UserId 相同的包装/展开模式
        currentOrderId = OrderId.wrap(OrderId.unwrap(currentOrderId) + 1);

        // 存储订单价格
        orderPrices[currentOrderId] = _price;

        // 触发事件
        emit OrderCreated(currentOrderId, _price);

        // 返回新创建的订单ID
        return currentOrderId;
    }

    /**
     * @notice 获取订单价格
     * @dev 通过订单ID查询对应的价格
     *
     * @param _orderId 订单ID
     * @return 订单价格（Price 类型）
     */
    function getOrderPrice(OrderId _orderId) public view returns (Price) {
        return orderPrices[_orderId];
    }

    // ═══════════════════════════════════════════════════════════
    // Price 操作
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 设置价格
     * @dev 更新当前价格，触发价格更新事件
     *
     * @param _price 新价格（Price 类型）
     */
    function setPrice(Price _price) public {
        Price oldPrice = currentPrice;
        currentPrice = _price;
        emit PriceUpdated(oldPrice, _price);
    }

    /**
     * @notice 获取价格（以 wei 为单位）
     * @dev 返回底层的 uint256 值（wei 为单位）
     *
     * 为什么要 unwrap？
     * 因为映射和函数返回类型需要底层的整数类型
     *
     * @return 价格（wei）
     */
    function getPriceInWei() public view returns (uint256) {
        return Price.unwrap(currentPrice);
    }

    /**
     * @notice 获取价格（以 ether 为单位）
     * @dev 将 wei 转换为 ether（除以 10^18）
     *
     * 转换说明：
     * - 1 ether = 10^18 wei
     * - 例如：1.5 ether = 1.5 * 10^18 wei = 1500000000000000000 wei
     *
     * @return 价格（ether）
     */
    function getPriceInEther() public view returns (uint256) {
        // Price.unwrap() 取出底层的 uint256 值
        // 除以 1e18 将 wei 转换为 ether
        return Price.unwrap(currentPrice) / 1e18;
    }

    /**
     * @notice 计算折扣后的价格
     * @dev pure 函数，不读取也不修改状态
     *
     * pure 函数的特点：
     * - 不读取区块链状态（不使用 view 函数）
     * - 不修改状态变量
     * - 相同的输入总是产生相同的输出
     * - 不消耗 gas（当被外部调用时）
     *
     * @param _price 原价格（Price 类型）
     * @param _discount 折扣百分比（Percentage 类型）
     * @return 折扣后的价格（Price 类型）
     *
     * 计算公式：
     * discountedPrice = originalPrice * (100 - discountPercent) / 100
     *
     * 示例：
     * 原价 100 ether，折扣 10%
     * 折后价 = 100 * (100 - 10) / 100 = 90 ether
     */
    function applyDiscount(Price _price, Percentage _discount) public pure returns (Price) {
        // 展开为底层类型进行计算
        uint256 priceValue = Price.unwrap(_price);
        uint8 discountValue = Percentage.unwrap(_discount);

        // 验证折扣不超过 100%
        require(discountValue <= 100, "Discount cannot exceed 100%");

        // 计算折后价格
        // 注意：先乘后除，避免精度损失
        uint256 discountedPrice = priceValue * (100 - discountValue) / 100;

        // 包装回 Price 类型并返回
        return Price.wrap(discountedPrice);
    }

    // ═══════════════════════════════════════════════════════════
    // Percentage 操作
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 设置折扣
     * @dev 更新当前折扣百分比
     *
     * 验证：
     * - 折扣必须在 0-100 范围内
     * - 100 表示全额折扣（免费）
     * - 0 表示无折扣
     *
     * @param _discount 折扣百分比（0-100）
     */
    function setDiscount(Percentage _discount) public {
        // 验证折扣值
        require(Percentage.unwrap(_discount) <= 100, "Discount cannot exceed 100%");
        discount = _discount;
    }

    /**
     * @notice 获取折扣值
     * @dev 返回当前的折扣百分比
     *
     * @return 折扣百分比（uint8 类型）
     */
    function getDiscount() public view returns (uint8) {
        return Percentage.unwrap(discount);
    }

    // ═══════════════════════════════════════════════════════════
    // 类型转换和工具函数
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 从 uint256 创建 Price
     * @dev 将 wei 单位的价格包装为 Price 类型
     *
     * 用途：
     * - 从外部输入或计算结果创建 Price
     * - 用于与合约交互时
     *
     * @param _value 价格值（wei）
     * @return Price 类型
     */
    function createPriceFromWei(uint256 _value) public pure returns (Price) {
        return Price.wrap(_value);
    }

    /**
     * @notice 从 ether 创建 Price
     * @dev 将 ether 单位的价格转换为 wei 并包装为 Price 类型
     *
     * 用途：
     * - 方便用户以 ether 为单位输入价格
     * - 内部自动转换为 wei 存储
     *
     * @param _etherValue 价格值（ether）
     * @return Price 类型（wei）
     *
     * 示例：
     * 输入 1.5 ether
     * 存储为 1500000000000000000 wei
     */
    function createPriceFromEther(uint256 _etherValue) public pure returns (Price) {
        return Price.wrap(_etherValue * 1e18);
    }

    /**
     * @notice 比较两个价格
     * @dev 比较两个 Price 类型的值是否相等
     *
     * 为什么要 unwrap？
     * 因为 == 运算符不能直接用于自定义值类型
     *
     * @param _price1 价格1
     * @param _price2 价格2
     * @return 是否相等
     */
    function comparePrices(Price _price1, Price _price2) public pure returns (bool) {
        return Price.unwrap(_price1) == Price.unwrap(_price2);
    }

    /**
     * @notice 计算两个价格的差
     * @dev 返回两个价格差的绝对值
     *
     * 用途：
     * - 计算价格波动
     * - 计算差价
     *
     * @param _price1 价格1
     * @param _price2 价格2
     * @return 价格差（绝对值）
     */
    function priceDifference(Price _price1, Price _price2) public pure returns (Price) {
        // 取出底层值进行比较
        uint256 p1 = Price.unwrap(_price1);
        uint256 p2 = Price.unwrap(_price2);

        // 计算绝对值（避免负数）
        uint256 diff = p1 > p2 ? p1 - p2 : p2 - p1;

        // 包装回 Price 类型
        return Price.wrap(diff);
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * 学习要点总结
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. 自定义值类型定义
 *    - 语法：type TypeName is UnderlyingType;
 *    - 位置：在合约外部、pragmas 之后、合约之前定义
 *    - 底层类型：只能是整数类型（uint/int/uint8...uint256）
 *    - 命名：首字母大写的驼峰命名（Price, UserId, OrderId）
 *
 *    示例：
 *    type Price is uint256;           // 基于 uint256 的价格类型
 *    type UserId is uint128;          // 基于 uint128 的用户ID类型
 *    type Percentage is uint8;         // 基于 uint8 的百分比类型（0-100）
 *
 * 2. 值类型的包装和展开
 *    - 包装（wrap）：将底层类型包装为自定义类型
 *      * Price.wrap(value) - 将 uint256 包装为 Price
 *      * UserId.wrap(value) - 将 uint128 包装为 UserId
 *
 *    - 展开（unwrap）：将自定义类型还原为底层类型
 *      * Price.unwrap(priceValue) - 将 Price 还原为 uint256
 *      * User.unwrap(userId) - 将 UserId 还原为 uint128
 *
 *    - 使用场景：
 *      * 创建新值：Price.wrap(1000)
 *      * 取出值计算：Price.unwrap(currentPrice) + 1
 *      * 存储到映射：userIdToAddress[userId] = address
 *
 *    示例代码：
 *    // 创建
 *    Price price = Price.wrap(1000);
 *
 *    // 计算（需要先展开）
 *    uint256 rawValue = Price.unwrap(price);
 *    uint256 newValue = rawValue + 100;
 *    Price newPrice = Price.wrap(newValue);
 *
 *    // 存储
 *    mapping(Price => uint256) public priceToAmount;
 *    priceToAmount[price] = 100;
 *
 * 3. 值类型的转换
 *    - 自定义类型 → 底层类型：使用 .unwrap() 方法
 *    - 底层类型 → 自定义类型：使用 .wrap() 方法
 *    - 不能直接在自定义类型之间转换，必须通过底层类型
 *
 *    注意：
 *    - Price 和 OrderId 都是 uint256 底层，但不能直接混用
 *    - 这样设计正是为了类型安全！
 *
 * 4. 值类型的使用场景
 *    - 价格表示：Price 类型明确表示货币金额
 *    - ID 表示：UserId、OrderId 区分不同的 ID 类型
 *    - 百分比：Percentage 表示百分比（0-100）
 *    - 数量：TokenId、Amount 等
 *
 *    优势：
 *    - 类型安全：防止把订单ID当作用户ID使用
 *    - 代码可读性：Price price 比 uint256 price 更清晰
 *    - IDE 支持：更好的类型检查和自动补全
 *    - 语义明确：函数签名更清晰，调用者知道期望的类型
 *
 * ═══════════════════════════════════════════════════════════════════
 * 包装/展开模式详解
 * ═══════════════════════════════════════════════════════════════════
 *
 * 为什么需要包装和展开？
 * Solidity 中的自定义值类型本质上还是底层类型，
 * 但编译器会确保类型安全，不允许直接混用不同自定义类型。
 *
 * 包装（Wrap）：底层类型 → 自定义类型
 *   Price.wrap(1000)  // uint256 1000 → Price 类型
 *
 * 展开（Unwrap）：自定义类型 → 底层类型
 *   Price.unwrap(priceValue)  // Price 类型 → uint256
 *
 * 为什么要这样设计？
 * 1. 保持类型安全：不能把 OrderId 当作 UserId
 * 2. 保留底层操作：展开后可以进行数学运算
 * 3. 明确语义：函数参数和返回值类型更清晰
 *
 * ═══════════════════════════════════════════════════════════════════
 * 最佳实践
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. 选择合适的底层类型
 *    - 根据数据范围选择：Percentage 用 uint8 就够了
 *    - 考虑 gas 优化：能用小类型就不用大类型
 *    - 考虑溢出安全：Solidity 0.8+ 自动检查溢出
 *
 * 2. 保持一致的命名规范
 *    - 类型名：首字母大写（Price, UserId）
 *    - 变量名：小驼峰（currentPrice, userId）
 *    - 函数名：小驼峰（createPrice, getUserAddress）
 *
 * 3. 提供便捷的构造函数
 *    - 创建 Price 时常用 wei 或 ether 单位
 *    - 提供多种输入方式的函数
 *
 * 4. 善用 pure/view 函数
 *    - 计算类函数用 pure
 *    - 读取类函数用 view
 *    - 节省 gas
 *
 * 5. 使用事件记录重要操作
 *    - 创建/更新时触发事件
 *    - 便于前端监听和调试
 *
 * ═══════════════════════════════════════════════════════════════════
 */
