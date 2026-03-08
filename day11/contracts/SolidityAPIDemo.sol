// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SolidityAPIDemo
 * @notice 合并演示合约：全局变量与错误处理
 * @dev 整合 Day13 (全局函数与变量) + Day14 (错误处理) 的核心功能
 *
 * 学习要点：
 * 1. msg.sender / msg.value / tx.origin 的使用与安全
 * 2. block.* 区块相关全局变量
 * 3. abi.encode / keccak256 / ecrecover 编码函数
 * 4. require / revert / assert / try/catch 错误处理
 * 5. 自定义错误与 Gas 优化
 * 6. tx.origin 攻击原理与防护
 */
contract SolidityAPIDemo {
    // ═══════════════════════════════════════════════════════════
    // 状态变量
    // ═══════════════════════════════════════════════════════════

    address public owner;                    // 合约所有者
    uint256 public value;                    // 存储的值
    mapping(address => uint256) public balances;  // 用户余额
    mapping(address => uint256) public nonces;    // 签名 nonce（防止重放攻击）

    // ═══════════════════════════════════════════════════════════
    // 自定义错误（Solidity 0.8.4+）
    // ═══════════════════════════════════════════════════════════

    error InsufficientBalance(uint256 requested, uint256 available);
    error Unauthorized(address caller);
    error InvalidValue(uint256 value);
    error ZeroAmountNotAllowed();
    error ContractPaused();
    error CallFailed(string reason);
    error HashAlreadyUsed(bytes32 hash);

    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════

    event Deposit(address indexed sender, uint256 amount, address txOrigin);
    event Withdraw(address indexed sender, uint256 amount);
    event ValueSet(uint256 oldValue, uint256 newValue);
    event SignatureVerified(address indexed signer, bytes32 messageHash);
    event HashUsed(bytes32 indexed hash);
    event CallSucceeded(address indexed target);
    event CallFailedEvent(address indexed target, string reason);

    // ═══════════════════════════════════════════════════════════
    // 构造函数
    // ═══════════════════════════════════════════════════════════

    constructor() {
        owner = msg.sender;
    }

    // ═══════════════════════════════════════════════════════════
    // 第一部分：msg.sender / msg.value / tx.origin 演示
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 演示 msg.sender 和 msg.value 的使用
     * @dev 存款功能，展示如何获取调用者地址和发送的 ETH 数量
     *
     * msg.sender: 直接调用当前函数的账户地址（可以是 EOA 或合约）
     * msg.value: 随消息发送的以太币数量（单位：wei）
     */
    function deposit() public payable {
        // 检查发送的 ETH 数量大于 0
        if (msg.value == 0) {
            revert ZeroAmountNotAllowed();
        }

        // 记录存款
        balances[msg.sender] += msg.value;

        // 记录交易 origin 用于调试
        emit Deposit(msg.sender, msg.value, tx.origin);
    }

    /**
     * @notice 获取 msg.sender 和 tx.origin 信息
     * @return sender 调用者地址
     * @return origin 交易原始发起者地址
     */
    function getMsgInfo() public view returns (address sender, address origin) {
        return (msg.sender, tx.origin);
    }

    /**
     * @notice 演示 tx.origin 的使用
     * @dev tx.origin: 整个交易链的原始发起者地址
     *
     * 注意：在正常情况下，msg.sender == tx.origin
     * 但通过合约调用时，两者不同
     */
    function getTxOrigin() public view returns (address) {
        return tx.origin;
    }

    /**
     * @notice 比较 msg.sender 和 tx.origin
     * @dev 用于理解两者的区别
     *
     * 直接调用：msg.sender == tx.origin
     * 通过合约调用：msg.sender != tx.origin
     *
     * @return msgSender 直接调用者地址
     * @return origin 交易原始发起者
     * @return isSame 是否相同
     */
    function compareSenderAndOrigin() public view returns (
        address msgSender,
        address origin,
        bool isSame
    ) {
        msgSender = msg.sender;
        origin = tx.origin;
        isSame = (msgSender == origin);
    }

    /**
     * @notice 使用 msg.sender 安全提取资金
     * @dev 这是正确的实现方式
     *
     * @param amount 提取数量
     */
    function withdraw(uint256 amount) public {
        // 使用 msg.sender 进行权限检查（安全）
        if (amount == 0) {
            revert ZeroAmountNotAllowed();
        }
        if (balances[msg.sender] < amount) {
            revert InsufficientBalance({
                requested: amount,
                available: balances[msg.sender]
            });
        }

        balances[msg.sender] -= amount;

        // 转账
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdraw(msg.sender, amount);
    }

    // ═══════════════════════════════════════════════════════════
    // 第二部分：block.* 区块相关全局变量
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 获取当前区块时间戳
     * @dev block.timestamp: 当前区块的时间戳（Unix 时间，秒）
     *
     * 注意事项：
     * - 矿工可以操纵 block.timestamp ±15 秒
     * - 不应用于精确的时间判断
     * - 适用于大致的时间范围判断
     *
     * @return 当前区块时间戳
     */
    function getBlockTimestamp() public view returns (uint256) {
        return block.timestamp;
    }

    /**
     * @notice 获取当前区块号
     * @dev block.number: 当前区块号
     *
     * 注意事项：
     * - 区块号是递增的，相对可靠
     * - 可用于时间估算（假设每块约 12 秒）
     *
     * @return 当前区块号
     */
    function getBlockNumber() public view returns (uint256) {
        return block.number;
    }

    /**
     * @notice 获取当前区块矿工地址
     * @dev block.coinbase: 当前区块的矿工/验证者地址
     *
     * @return 当前区块矿工地址
     */
    function getBlockCoinbase() public view returns (address) {
        return block.coinbase;
    }

    /**
     * @notice 获取当前区块随机数
     * @dev block.prevrandao: PoS 随机数（前身为 block.difficulty）
     *
     * 注意：以太坊转向 PoS 后，使用 block.prevrandao 替代了 block.difficulty
     *
     * @return 当前区块随机数
     */
    function getBlockDifficulty() public view returns (uint256) {
        return block.prevrandao;
    }

    /**
     * @notice 获取当前区块 Gas 上限
     * @dev block.gaslimit: 当前区块的 Gas 上限
     *
     * @return 当前区块 Gas 上限
     */
    function getBlockGasLimit() public view returns (uint256) {
        return block.gaslimit;
    }

    /**
     * @notice 获取所有区块信息
     * @return timestamp 时间戳
     * @return number 区块号
     * @return coinbase 矿工地址
     * @return prevrandao 随机数
     * @return gaslimit Gas 上限
     */
    function getAllBlockInfo() public view returns (
        uint256 timestamp,
        uint256 number,
        address coinbase,
        uint256 prevrandao,
        uint256 gaslimit
    ) {
        return (
            block.timestamp,
            block.number,
            block.coinbase,
            block.prevrandao,
            block.gaslimit
        );
    }

    // ═══════════════════════════════════════════════════════════
    // 第三部分：地址与合约相关全局变量
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 获取当前合约地址
     * @dev address(this): 当前合约的地址
     *
     * @return 当前合约地址
     */
    function getContractAddress() public view returns (address) {
        return address(this);
    }

    /**
     * @notice 获取当前合约余额
     * @dev address(this).balance: 当前合约持有的 ETH 数量
     *
     * @return 当前合约余额（wei）
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice 获取剩余 Gas
     * @dev gasleft(): 当前调用剩余的 Gas 数量
     *
     * @return 剩余 Gas 数量
     */
    function getGasLeft() public view returns (uint256) {
        return gasleft();
    }

    // ═══════════════════════════════════════════════════════════
    // 第四部分：abi 编码与哈希函数
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 演示 abi.encode（标准 ABI 编码）
     * @dev abi.encode: 对参数进行 ABI 编码，结果长度固定
     *
     * 特点：
     * - 每个参数都会补齐到 32 字节
     * - 编码结果长度可预测
     * - 适用于函数调用参数编码
     *
     * @param a 第一个参数
     * @param b 第二个参数
     * @return 编码后的字节数组
     */
    function encodeWithAbi(uint256 a, uint256 b) public pure returns (bytes memory) {
        return abi.encode(a, b);
    }

    /**
     * @notice 演示 abi.encodePacked（紧密编码）
     * @dev abi.encodePacked: 对参数进行紧密编码（无填充）
     *
     * 特点：
     * - 参数紧密排列，不补齐
     * - 结果长度可变
     * - 用于哈希计算，但注意碰撞风险
     *
     * @param a 第一个参数
     * @param b 第二个参数
     * @return 编码后的字节数组
     */
    function encodePacked(uint256 a, uint256 b) public pure returns (bytes memory) {
        return abi.encodePacked(a, b);
    }

    /**
     * @notice 演示 keccak256 哈希函数
     * @dev keccak256: 计算 Keccak-256 哈希
     *
     * 特点：
     * - 单向哈希函数
     * - 不可逆
     * - 用于数据完整性验证
     *
     * @param data 要哈希的数据
     * @return 哈希值（32 字节）
     */
    function computeHash(bytes memory data) public pure returns (bytes32) {
        return keccak256(data);
    }

    /**
     * @notice 演示字符串哈希
     * @param message 消息字符串
     * @return 哈希值
     */
    function hashString(string memory message) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(message));
    }

    /**
     * @notice 演示多参数哈希
     * @param a 第一个参数
     * @param b 第二个参数（地址类型）
     * @param c 第三个参数（字符串）
     * @return 哈希值
     */
    function hashMultiple(uint256 a, address b, string memory c) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(a, b, c));
    }


    /**
     * @notice 使用哈希防止重放攻击（一次性哈希）
     * @dev 记录已使用的哈希，防止重复使用
     *
     * @param hash 要使用的哈希
     * @return 使用的哈希
     */
    function useHashOnce(bytes32 hash) public returns (bytes32) {
        // 检查哈希是否已使用（通过 nonce 机制）
        if (hash == bytes32(nonces[msg.sender])) {
            revert HashAlreadyUsed(hash);
        }
        nonces[msg.sender]++;
        emit HashUsed(hash);
        return hash;
    }

    /**
     * @notice 演示 ecrecover（签名恢复）
     * @dev ecrecover: 从签名中恢复签名者地址
     *
     * 用途：
     * - 验证消息签名
     * - 实现签名授权
     *
     * 注意事项：
     * - 需要防止重放攻击（加入 nonce 和 chainid）
     * - 签名应包含足够的信息防止误解
     *
     * @param messageHash 消息哈希
     * @param v 签名 v 值
     * @param r 签名 r 值
     * @param s 签名 s 值
     * @return 恢复的地址
     */
    function recoverAddress(
        bytes32 messageHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public pure returns (address) {
        return ecrecover(messageHash, v, r, s);
    }

    /**
     * @notice 验证签名（带防重放保护）
     * @dev 消息包含 nonce 和合约地址，防止重放攻击
     *
     * @param signer 预期签名者地址
     * @param message 消息内容
     * @param v 签名 v 值
     * @param r 签名 r 值
     * @param s 签名 s 值
     * @return 是否验证成功
     */
    function verifySignature(
        address signer,
        string memory message,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public returns (bool) {
        // 生成包含 nonce 和合约地址的消息哈希，防止重放攻击
        uint256 nonce = nonces[signer];
        bytes32 messageHash = keccak256(abi.encodePacked(message, nonce, address(this)));

        // 恢复签名者地址
        address recovered = ecrecover(messageHash, v, r, s);

        if (recovered == signer) {
            // 增加 nonce，防止重放攻击
            nonces[signer]++;
            emit SignatureVerified(signer, messageHash);
            return true;
        }

        return false;
    }

    // ═══════════════════════════════════════════════════════════
    // 第五部分：require 错误处理
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 使用 require 进行输入验证
     * @dev require: 用于输入验证和条件检查，失败时回滚所有状态变化
     *
     * 使用场景：
     * - 输入参数验证
     * - 权限检查
     * - 前置条件检查
     *
     * @param _value 要设置的值
     */
    function setValueWithRequire(uint256 _value) public {
        // require 用于输入验证
        require(_value > 0, "Value must be greater than 0");
        require(_value <= 1000, "Value must be less than or equal to 1000");

        uint256 oldValue = value;
        value = _value;

        emit ValueSet(oldValue, _value);
    }

    /**
     * @notice 使用 require 进行权限检查
     * @param _value 要设置的值
     */
    function setValueWithOwnerCheck(uint256 _value) public {
        // require 用于权限检查
        require(msg.sender == owner, "Only owner can set value");
        require(_value > 0, "Value must be greater than 0");

        uint256 oldValue = value;
        value = _value;

        emit ValueSet(oldValue, _value);
    }

    // ═══════════════════════════════════════════════════════════
    // 第六部分：revert 错误处理
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 使用 revert 无条件回滚
     * @dev revert: 用于无条件回滚，可以带消息或自定义错误
     *
     * 使用场景：
     * - 复杂条件检查
     * - 需要多个分支判断
     *
     * @param _value 要设置的值
     */
    function setValueWithRevert(uint256 _value) public {
        // revert 用于复杂条件检查
        if (_value == 0) {
            revert("Value cannot be zero");
        }

        if (_value > 1000) {
            revert("Value exceeds maximum");
        }

        uint256 oldValue = value;
        value = _value;

        emit ValueSet(oldValue, _value);
    }

    /**
     * @notice 使用 revert 和自定义错误
     * @dev 自定义错误比字符串错误更节省 Gas
     *
     * @param amount 提取金额
     */
    function withdrawWithCustomError(uint256 amount) public {
        // 使用自定义错误进行复杂条件检查
        if (amount == 0) {
            revert InvalidValue(amount);
        }

        if (balances[msg.sender] < amount) {
            revert InsufficientBalance(amount, balances[msg.sender]);
        }

        balances[msg.sender] -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert CallFailed("Transfer failed");
        }

        emit Withdraw(msg.sender, amount);
    }

    // ═══════════════════════════════════════════════════════════
    // 第七部分：assert 错误处理
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 使用 assert 检查不变量
     * @dev assert: 用于内部错误检查，不应该失败
     *
     * 使用场景：
     * - 检查合约内部不变量
     * - 验证数学运算正确性
     * - 确保状态一致性
     *
     * 注意：assert 失败表示合约存在 bug！
     *
     * @param amount 存款金额
     */
    function depositWithAssert(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");

        uint256 oldBalance = balances[msg.sender];
        balances[msg.sender] += amount;

        // assert 检查不变量：余额应该增加
        assert(balances[msg.sender] > oldBalance);

        emit Deposit(msg.sender, amount, tx.origin);
    }

    /**
     * @notice 使用 assert 检查数学运算
     * @dev 在 Solidity 0.8+ 中，算术溢出自动检查
     *      这里演示 assert 的用法
     *
     * @param a 第一个数
     * @param b 第二个数
     * @return 结果
     */
    function safeAdd(uint256 a, uint256 b) public pure returns (uint256) {
        uint256 result = a + b;

        // assert 检查不溢出（Solidity 0.8+ 其实会自动检查）
        assert(result >= a);

        return result;
    }

    // ═══════════════════════════════════════════════════════════
    // 第八部分：try/catch 错误处理（Solidity 0.6+）
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 使用 try/catch 处理外部调用错误
     * @dev try/catch: 用于处理外部合约调用错误
     *
     * 使用场景：
     * - 调用外部合约
     * - 批量操作
     * - 错误恢复
     *
     * catch 分支：
     * - Error(string): 捕获 require/revert 错误
     * - Panic(uint): 捕获 assert 失败（0.8+）
     * - bytes: 捕获低级错误
     *
     * @param _target 目标合约地址
     * @param _value 要设置的值
     */
    function callExternalWithTryCatch(address payable _target, uint256 _value) public {
        // 声明外部合约接口
        SolidityAPIDemo target = SolidityAPIDemo(_target);

        // try/catch 处理外部调用
        try target.setValueWithRequire(_value) {
            // 调用成功
            value = _value;
            emit CallSucceeded(_target);
        } catch Error(string memory reason) {
            // 捕获 require/revert 字符串错误
            emit CallFailedEvent(_target, reason);
        } catch (bytes memory) {
            // 捕获低级错误（assert 失败等）
            emit CallFailedEvent(_target, "Low-level error");
        }
    }

    /**
     * @notice 使用 try/catch 处理外部调用，不中断执行
     * @dev 返回成功/失败状态和错误消息
     *
     * @param _target 目标合约地址
     * @param _value 要设置的值
     * @return success 是否成功
     * @return errorMessage 错误消息（如果有）
     */
    function callExternalNoRevert(
        address payable _target,
        uint256 _value
    ) public returns (bool success, string memory errorMessage) {
        SolidityAPIDemo target = SolidityAPIDemo(_target);

        try target.setValueWithRequire(_value) {
            value = _value;
            return (true, "");
        } catch Error(string memory reason) {
            return (false, reason);
        } catch (bytes memory) {
            return (false, "Low-level error");
        }
    }

    /**
     * @notice 使用 try/catch 处理批量操作
     * @dev 部分失败不影响其他调用
     *
     * @param targets 目标合约地址数组
     * @param values 要设置的值数组
     * @return successCount 成功次数
     */
    function batchCall(
        address payable[] memory targets,
        uint256[] memory values
    ) public returns (uint256 successCount) {
        require(targets.length == values.length, "Array length mismatch");

        successCount = 0;

        // 遍历所有目标合约
        for (uint256 i = 0; i < targets.length; i++) {
            SolidityAPIDemo target = SolidityAPIDemo(targets[i]);

            try target.setValueWithRequire(values[i]) {
                successCount++;
            } catch {
                // 忽略错误，继续执行
            }
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 辅助函数
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 获取用户余额
     * @param account 账户地址
     * @return 余额
     */
    function getBalance(address account) public view returns (uint256) {
        return balances[account];
    }

    /**
     * @notice 获取用户 nonce
     * @param account 账户地址
     * @return nonce
     */
    function getNonce(address account) public view returns (uint256) {
        return nonces[account];
    }

    /**
     * @notice 接收 ETH
     */
    receive() external payable {
        balances[msg.sender] += msg.value;
    }

    /**
     * @notice 获取当前存储的值
     * @return 当前值
     */
    function getValue() public view returns (uint256) {
        return value;
    }
}

// ═══════════════════════════════════════════════════════════
// 第九部分：tx.origin 攻击演示合约
// ═══════════════════════════════════════════════════════════

/**
 * @title VulnerableWallet
 * @notice 易受攻击的钱包合约（演示 tx.origin 漏洞）
 * ⚠️ 仅用于学习，不要在实际项目中使用
 *
 * 漏洞原理：
 * 使用 tx.origin 进行权限检查，攻击者可以通过中间合约绕过检查
 */
contract VulnerableWallet {
    address public owner;                    // 钱包所有者
    mapping(address => uint256) public balances;

    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice 存款功能
     */
    function deposit() public payable {
        require(msg.value > 0, "Must send ETH");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice 提取功能（危险 - 使用 tx.origin）
     * ⚠️ 漏洞：使用 tx.origin 进行权限检查
     *
     * 攻击场景：
     * 1. 攻击者诱骗 owner 调用 AttackerContract
     * 2. AttackerContract 调用此函数的 withdraw
     * 3. tx.origin == owner，检查通过
     * 4. 攻击者成功提取 owner 的资金
     */
    function withdraw(uint256 amount) public {
        // ⚠️ 危险：使用 tx.origin 进行权限检查
        require(tx.origin == owner, "Only owner can withdraw");
        require(balances[tx.origin] >= amount, "Insufficient balance");

        balances[tx.origin] -= amount;

        (bool success, ) = payable(tx.origin).call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdraw(tx.origin, amount);
    }

    /**
     * @notice 获取合约余额
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}

/**
 * @title SafeWallet
 * @notice 安全的钱包合约（正确使用 msg.sender）
 *
 * 安全做法：
 * - 使用 msg.sender 而非 tx.origin
 * - 权限检查基于直接调用者
 */
contract SafeWallet {
    address public owner;
    mapping(address => uint256) public balances;

    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice 存款功能
     */
    function deposit() public payable {
        require(msg.value > 0, "Must send ETH");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice 提取功能（安全 - 使用 msg.sender）
     * ✅ 正确：使用 msg.sender 进行权限检查
     *
     * 安全性：
     * - 只有直接调用者可以提取自己的资金
     * - 通过合约调用时，msg.sender 是合约地址
     * - 攻击者无法通过中间合约绕过检查
     */
    function withdraw(uint256 amount) public {
        // ✅ 安全：使用 msg.sender
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdraw(msg.sender, amount);
    }

    /**
     * @notice owner 提取所有资金
     */
    function withdrawAll() public {
        require(msg.sender == owner, "Only owner");
        payable(owner).transfer(address(this).balance);
    }

    /**
     * @notice 获取合约余额
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}

/**
 * @title AttackerContract
 * @notice 攻击者合约（演示 tx.origin 攻击）
 *
 * 攻击流程：
 * 1. 攻击者诱骗 owner 调用本合约的某个函数
 * 2. 本合约调用 VulnerableWallet.withdraw()
 * 3. VulnerableWallet 检查 tx.origin == owner，通过
 * 4. 资金被提取（虽然最终回到 owner，但展示了漏洞）
 */
contract AttackerContract {
    VulnerableWallet public vulnerableWallet;

    event AttackAttempted(address indexed target, uint256 amount);

    constructor(address _vulnerableWallet) {
        vulnerableWallet = VulnerableWallet(_vulnerableWallet);
    }

    /**
     * @notice 攻击函数
     * @dev 演示如何利用 tx.origin 漏洞
     *
     * 攻击流程：
     * 1. 用户（owner）被诱骗调用此函数
     * 2. 此函数内部调用 vulnerableWallet.withdraw()
     * 3. vulnerableWallet 检查 tx.origin == owner（owner 调用了本合约）
     * 4. 检查通过，资金被提取
     */
    function attack(uint256 amount) public {
        emit AttackAttempted(address(vulnerableWallet), amount);
        vulnerableWallet.withdraw(amount);
    }

    /**
     * @notice 接收以太币
     */
    receive() external payable {}

    /**
     * @notice 获取合约余额
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
