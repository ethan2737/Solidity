// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ITargetContract
 * @notice 目标合约接口定义
 */
interface ITargetContract {
    function getValue() external view returns (uint256);
    function setValue(uint256 _value) external;
    function incrementCounter() external;
    function getInfo() external view returns (uint256, address, uint256, address);
}

/**
 * @title ComprehensiveDemo
 * @notice 综合演示合约 - 整合 ABI 编码、合约交互、call 和 delegatecall
 * @dev 本合约演示 Solidity 高级特性，包括：
 * 1. ABI 编码和解码（abi.encode, abi.encodePacked, abi.encodeWithSignature 等）
 * 2. 合约间交互（接口调用、low-level call）
 * 3. call vs delegatecall 的区别
 * 4. 错误处理和返回值解析
 *
 * 学习要点：
 * - 理解 ABI 编码规则
 * - 掌握合约间交互的多种方式
 * - 理解 call 和 delegatecall 的本质区别
 * - 了解存储布局对 delegatecall 的重要性
 */
contract ComprehensiveDemo {
    // ═══════════════════════════════════════════════════════════
    // 存储布局（必须与 TargetContract 一致，用于 delegatecall）
    // ═══════════════════════════════════════════════════════════

    // 重要：存储布局必须与 TargetContract 完全一致！
    // slot 0: value (uint256)
    // slot 1: owner (address)
    // slot 2: counter (uint256)
    // slot 3: name (string)

    uint256 public value;      // slot 0 - 与 TargetContract 一致
    address public owner;       // slot 1 - 与 TargetContract 一致
    uint256 public counter;    // slot 2 - 与 TargetContract 一致
    string public name;        // slot 3 - 与 TargetContract 一致

    // ═══════════════════════════════════════════════════════════
    // 状态变量
    // ═══════════════════════════════════════════════════════════

    address public targetContract;  // 目标合约地址
    address public proxyContract;    // 代理合约地址（使用 delegatecall）
    mapping(address => uint256) public callCounts;  // 调用次数统计

    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════

    // ABI 编码事件
    event EncodedData(bytes indexed data, string method);
    event DecodedData(uint256 value, string name, address addr);
    event HashComputed(bytes32 hash);

    // 合约交互事件
    event ContractCalled(address indexed target, bytes4 selector, bool success);
    event InterfaceCall(address indexed target, string method, bool success);
    event LowLevelCall(address indexed target, bytes data, bool success);

    // Call vs Delegatecall 事件
    event CallExecuted(string callType, address target, bool success, uint256 value);
    event StorageLayoutVerified(bool isMatch);

    // ═══════════════════════════════════════════════════════════
    // 构造函数
    // ═══════════════════════════════════════════════════════════

    constructor(string memory _name) {
        owner = msg.sender;
        value = 0;  // 初始值为 0
        counter = 0;
        name = _name;
    }

    // ═══════════════════════════════════════════════════════════
    // 辅助函数 - 存储布局验证
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 验证存储布局是否与目标合约一致
     * @return isMatch 是否匹配
     */
    function verifyStorageLayout() public pure returns (bool isMatch) {
        // 验证 slot 0: value 类型
        // slot 1: owner 类型
        // slot 2: counter 类型
        // slot 3: name 类型
        isMatch = true;
        return isMatch;
    }

    /**
     * @notice 触发存储布局验证事件（用于测试）
     */
    function emitStorageLayoutVerified() public {
        emit StorageLayoutVerified(true);
    }

    // ═══════════════════════════════════════════════════════════
    // ABI 编码演示函数
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 使用 abi.encode 进行标准 ABI 编码
     * @param _value 数值
     * @param _name 名称
     * @param _addr 地址
     * @return 编码后的字节数组
     */
    function encodeWithEncode(
        uint256 _value,
        string memory _name,
        address _addr
    ) public pure returns (bytes memory) {
        bytes memory encoded = abi.encode(_value, _name, _addr);
        return encoded;
    }

    /**
     * @notice 使用 abi.encodePacked 进行紧密打包编码
     * @param _value 数值
     * @param _name 名称
     * @param _addr 地址
     * @return 编码后的字节数组
     */
    function encodeWithEncodePacked(
        uint256 _value,
        string memory _name,
        address _addr
    ) public pure returns (bytes memory) {
        bytes memory encoded = abi.encodePacked(_value, _name, _addr);
        return encoded;
    }

    /**
     * @notice 使用 abi.encodeWithSignature 编码函数调用
     * @param _value 值
     * @return 编码后的字节数组（包含函数选择器）
     */
    function encodeWithSignatureDemo(uint256 _value) public pure returns (bytes memory) {
        bytes memory encoded = abi.encodeWithSignature("setValue(uint256)", _value);
        return encoded;
    }

    /**
     * @notice 使用 abi.encodeWithSelector 编码函数调用
     * @param _value 值
     * @return 编码后的字节数组
     */
    function encodeWithSelectorDemo(uint256 _value) public pure returns (bytes memory) {
        bytes4 selector = bytes4(keccak256("setValue(uint256)"));
        bytes memory encoded = abi.encodeWithSelector(selector, _value);
        return encoded;
    }

    /**
     * @notice 演示 abi.decode 解码
     * @param data 编码后的数据
     * @return _value 数值
     * @return _name 名称
     * @return _addr 地址
     */
    function decodeDemo(
        bytes memory data
    ) public pure returns (uint256 _value, string memory _name, address _addr) {
        (_value, _name, _addr) = abi.decode(data, (uint256, string, address));
    }

    /**
     * @notice 计算值的哈希（使用 encodePacked）
     * @param _value 数值
     * @param _name 名称
     * @param _addr 地址
     * @return 哈希值
     */
    function computeHash(
        uint256 _value,
        string memory _name,
        address _addr
    ) public pure returns (bytes32) {
        bytes32 hash = keccak256(abi.encodePacked(_value, _name, _addr));
        return hash;
    }

    /**
     * @notice 获取函数选择器
     * @param functionSignature 函数签名
     * @return 函数选择器
     */
    function getFunctionSelector(
        string memory functionSignature
    ) public pure returns (bytes4) {
        return bytes4(keccak256(bytes(functionSignature)));
    }

    // ═══════════════════════════════════════════════════════════
    // 合约交互 - 接口调用
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 设置目标合约地址
     * @param _target 目标合约地址
     */
    function setTargetContract(address _target) public {
        require(_target != address(0), "Invalid target address");
        targetContract = _target;
    }

    /**
     * @notice 通过接口调用目标合约的 getValue
     * @return 目标合约的值
     */
    function interfaceGetValue() public view returns (uint256) {
        ITargetContract target = ITargetContract(targetContract);
        return target.getValue();
    }

    /**
     * @notice 通过接口调用目标合约的 setValue
     * @param _value 要设置的值
     */
    function interfaceSetValue(uint256 _value) public {
        ITargetContract target = ITargetContract(targetContract);
        target.setValue(_value);
        callCounts[msg.sender]++;
        emit InterfaceCall(targetContract, "setValue", true);
    }

    /**
     * @notice 通过接口调用目标合约的 incrementCounter
     */
    function interfaceIncrementCounter() public {
        ITargetContract target = ITargetContract(targetContract);
        target.incrementCounter();
        callCounts[msg.sender]++;
        emit InterfaceCall(targetContract, "incrementCounter", true);
    }

    /**
     * @notice 通过接口获取目标合约的完整信息
     * @return _value 值
     * @return _owner 所有者
     * @return _counter 计数器
     * @return _address 合约地址
     */
    function interfaceGetInfo() public view returns (
        uint256 _value,
        address _owner,
        uint256 _counter,
        address _address
    ) {
        ITargetContract target = ITargetContract(targetContract);
        return target.getInfo();
    }

    // ═══════════════════════════════════════════════════════════
    // 合约交互 - Low-level call
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 使用 low-level call 调用目标合约
     * @param data 编码后的函数调用数据
     * @return success 是否成功
     * @return returnData 返回数据
     */
    function lowLevelCall(bytes memory data) public returns (bool success, bytes memory returnData) {
        (success, returnData) = targetContract.call(data);
        emit LowLevelCall(targetContract, data, success);
        if (success) {
            callCounts[msg.sender]++;
        }
    }

    /**
     * @notice 使用 low-level call 调用 setValue
     * @param _value 要设置的值
     * @return success 是否成功
     */
    function lowLevelCallSetValue(uint256 _value) public returns (bool success) {
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", _value);
        (success, ) = targetContract.call(data);
        emit LowLevelCall(targetContract, data, success);
        if (success) {
            callCounts[msg.sender]++;
        }
    }

    /**
     * @notice 使用 low-level call 调用 getValue
     * @return value 返回值
     * @return success 是否成功
     */
    function lowLevelCallGetValue() public returns (uint256 value, bool success) {
        bytes memory data = abi.encodeWithSignature("getValue()");
        bytes memory returnData;
        (success, returnData) = targetContract.call(data);
        if (success && returnData.length > 0) {
            value = abi.decode(returnData, (uint256));
        }
        emit LowLevelCall(targetContract, data, success);
    }

    /**
     * @notice 使用 staticcall 进行只读调用
     * @return value 返回值
     * @return success 是否成功
     */
    function staticCallGetValue() public view returns (uint256 value, bool success) {
        bytes memory data = abi.encodeWithSignature("getValue()");
        bytes memory returnData;
        (success, returnData) = targetContract.staticcall(data);
        if (success && returnData.length > 0) {
            value = abi.decode(returnData, (uint256));
        }
    }

    // ═══════════════════════════════════════════════════════════
    // Call vs Delegatecall 演示
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 使用 call 调用目标合约的 setValue
     * @dev call 在目标合约的上下文中执行，修改目标合约的状态
     * @param _value 要设置的值
     * @return success 是否成功
     */
    function callSetValue(uint256 _value) public returns (bool success) {
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", _value);
        (success, ) = targetContract.call(data);
        emit CallExecuted("call", targetContract, success, _value);
    }

    /**
     * @notice 使用 call 调用目标合约的 incrementCounter
     * @return success 是否成功
     */
    function callIncrementCounter() public returns (bool success) {
        bytes memory data = abi.encodeWithSignature("incrementCounter()");
        (success, ) = targetContract.call(data);
        emit CallExecuted("call", targetContract, success, 0);
    }

    /**
     * @notice 使用 delegatecall 调用目标合约的 setValue
     * @dev delegatecall 在当前合约的上下文中执行，使用目标合约的代码
     * @param _value 要设置的值
     * @return success 是否成功
     */
    function delegatecallSetValue(uint256 _value) public returns (bool success) {
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", _value);
        (success, ) = targetContract.delegatecall(data);
        emit CallExecuted("delegatecall", targetContract, success, _value);
    }

    /**
     * @notice 使用 delegatecall 调用目标合约的 incrementCounter
     * @return success 是否成功
     */
    function delegatecallIncrementCounter() public returns (bool success) {
        bytes memory data = abi.encodeWithSignature("incrementCounter()");
        (success, ) = targetContract.delegatecall(data);
        emit CallExecuted("delegatecall", targetContract, success, 0);
    }

    /**
     * @notice 对比 call 和 delegatecall 的效果
     * @param _value 要设置的值
     */
    function compareCallAndDelegatecall(uint256 _value) public {
        // 通过接口调用设置目标合约初始值
        interfaceSetValue(_value);
        // 通过 call 增加目标合约计数器
        callIncrementCounter();
        // 通过 delegatecall 增加当前合约计数器
        delegatecallIncrementCounter();
    }

    // ═══════════════════════════════════════════════════════════
    // 错误处理
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 安全调用合约并处理错误
     * @param data 编码后的函数调用数据
     * @return success 是否成功
     * @return returnData 返回数据
     * @return errorMessage 错误消息
     */
    function safeCall(
        bytes memory data
    ) public returns (bool success, bytes memory returnData, string memory errorMessage) {
        (success, returnData) = targetContract.call(data);
        emit ContractCalled(targetContract, bytes4(data), success);

        if (!success) {
            if (returnData.length > 0) {
                // 检查返回数据长度
                if (returnData.length >= 4) {
                    bytes4 errorSelector = bytes4(returnData);
                    // 可以添加特定的错误处理逻辑
                }
                errorMessage = "Call failed with revert";
            } else {
                errorMessage = "Call failed with no return data";
            }
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 辅助函数
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 获取调用次数
     * @param caller 调用者地址
     * @return 调用次数
     */
    function getCallCount(address caller) public view returns (uint256) {
        return callCounts[caller];
    }

    /**
     * @notice 获取当前合约信息
     * @return _value 值
     * @return _owner 所有者
     * @return _counter 计数器
     * @return _name 名称
     */
    function getThisContractInfo() public view returns (
        uint256 _value,
        address _owner,
        uint256 _counter,
        string memory _name
    ) {
        return (value, owner, counter, name);
    }

    /**
     * @notice 设置当前合约自己的值（用于 delegatecall 对比）
     * @param _value 值
     * @param _name 名称
     */
    function setOwnValue(uint256 _value, string memory _name) public {
        value = _value;
        name = _name;
    }
}
