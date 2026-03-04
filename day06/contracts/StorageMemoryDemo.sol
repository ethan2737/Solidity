// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title StorageMemoryDemo
 * @notice 演示 Storage vs Memory vs Calldata 的区别
 * @dev 用于理解引用类型的传递方式
 * 
 * 学习要点：
 * 1. Storage：存储在区块链上，持久化
 * 2. Memory：临时变量，函数执行期间存在
 * 3. Calldata：函数参数，只读
 * 4. 数组、映射、结构体的传递方式
 */
contract StorageMemoryDemo {
    // ═══════════════════════════════════════════════════════════
    // Storage 变量（存储在区块链上）
    // ═══════════════════════════════════════════════════════════
    
    uint[] public storageArray;
    mapping(uint256 => uint256) public storageMapping;
    
    struct User {
        uint256 id;
        address addr;
        string name;
    }
    
    User[] public storageUsers;
    mapping(address => User) public storageUserMap;
    
    // ═══════════════════════════════════════════════════════════
    // Storage 操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 添加元素到 storage 数组
     * @param _value 值
     */
    function addToStorageArray(uint256 _value) public {
        storageArray.push(_value);
    }
    
    /**
     * @notice 获取 storage 数组
     * @return 数组（返回 memory 副本）
     */
    function getStorageArray() public view returns (uint256[] memory) {
        return storageArray; // 返回 memory 副本
    }
    
    /**
     * @notice 修改 storage 数组元素
     * @param _index 索引
     * @param _value 新值
     */
    function updateStorageArray(uint256 _index, uint256 _value) public {
        require(_index < storageArray.length, "Index out of bounds");
        storageArray[_index] = _value; // 直接修改 storage
    }
    
    // ═══════════════════════════════════════════════════════════
    // Memory 操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 使用 memory 数组（临时变量）
     * @param _values 输入数组
     * @return 处理后的数组
     */
    function processMemoryArray(uint256[] memory _values) public pure returns (uint256[] memory) {
        // _values 是 memory，可以修改，但不会影响原始数据
        for (uint256 i = 0; i < _values.length; i++) {
            _values[i] = _values[i] * 2;
        }
        return _values;
    }
    
    /**
     * @notice 创建 memory 数组
     * @param _size 数组大小
     * @return 新数组
     */
    function createMemoryArray(uint256 _size) public pure returns (uint256[] memory) {
        uint256[] memory newArray = new uint256[](_size);
        for (uint256 i = 0; i < _size; i++) {
            newArray[i] = i * 10;
        }
        return newArray;
    }
    
    /**
     * @notice 复制 storage 到 memory
     * @return memory 数组
     */
    function copyStorageToMemory() public view returns (uint256[] memory) {
        uint256[] memory memoryArray = new uint256[](storageArray.length);
        for (uint256 i = 0; i < storageArray.length; i++) {
            memoryArray[i] = storageArray[i];
        }
        return memoryArray;
    }
    
    // ═══════════════════════════════════════════════════════════
    // Calldata 操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 使用 calldata 参数（只读）
     * @param _values calldata 数组
     * @return 总和
     */
    function sumCalldataArray(uint256[] calldata _values) public pure returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < _values.length; i++) {
            sum += _values[i];
        }
        return sum;
    }
    
    /**
     * @notice 使用 calldata 字符串
     * @param _str calldata 字符串
     * @return 字符串长度
     */
    function getStringLength(string calldata _str) public pure returns (uint256) {
        return bytes(_str).length;
    }
    
    // ═══════════════════════════════════════════════════════════
    // Storage 引用操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 通过 storage 引用修改数组
     * @param _index 索引
     * @param _value 新值
     */
    function modifyViaStorageReference(uint256 _index, uint256 _value) public {
        require(_index < storageArray.length, "Index out of bounds");
        uint256[] storage arr = storageArray; // storage 引用
        arr[_index] = _value; // 修改会影响原始数组
    }
    
    // ═══════════════════════════════════════════════════════════
    // 结构体操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 添加用户（storage）
     * @param _id 用户ID
     * @param _addr 用户地址
     * @param _name 用户名称
     */
    function addUser(uint256 _id, address _addr, string memory _name) public {
        storageUsers.push(User({
            id: _id,
            addr: _addr,
            name: _name
        }));
    }
    
    /**
     * @notice 获取用户（返回 memory）
     * @param _index 索引
     * @return 用户结构体
     */
    function getUser(uint256 _index) public view returns (User memory) {
        require(_index < storageUsers.length, "Index out of bounds");
        return storageUsers[_index]; // 返回 memory 副本
    }
    
    /**
     * @notice 修改用户（storage 引用）
     * @param _index 索引
     * @param _name 新名称
     */
    function updateUserName(uint256 _index, string memory _name) public {
        require(_index < storageUsers.length, "Index out of bounds");
        User storage user = storageUsers[_index]; // storage 引用
        user.name = _name; // 修改会影响原始数据
    }
    
    /**
     * @notice 使用 memory 结构体
     * @param _user memory 用户
     * @return 处理后的用户
     */
    function processMemoryUser(User memory _user) public pure returns (User memory) {
        _user.id = _user.id * 2; // 修改 memory 副本，不影响原始数据
        return _user;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 映射操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置映射值
     * @param _key 键
     * @param _value 值
     */
    function setMappingValue(uint256 _key, uint256 _value) public {
        storageMapping[_key] = _value;
    }
    
    /**
     * @notice 获取映射值
     * @param _key 键
     * @return 值
     */
    function getMappingValue(uint256 _key) public view returns (uint256) {
        return storageMapping[_key];
    }
    
    // ═══════════════════════════════════════════════════════════
    // 对比函数：展示不同传递方式的影响
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 演示 storage 引用修改
     */
    function demonstrateStorageReference() public {
        storageArray.push(100);
        storageArray.push(200);
        
        uint256[] storage ref = storageArray; // storage 引用
        ref[0] = 999; // 修改会影响原始数组
        
        // storageArray[0] 现在是 999
    }
    
    /**
     * @notice 演示 memory 副本
     * @param _values memory 数组
     * @return 原始数组不变
     */
    function demonstrateMemoryCopy(uint256[] memory _values) public pure returns (uint256[] memory) {
        uint256[] memory copy = _values; // memory 引用（实际上是副本）
        copy[0] = 999; // 只修改副本
        return copy; // 返回修改后的副本
        // _values 不变
    }
}

