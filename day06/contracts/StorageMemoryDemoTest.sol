// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


contract StorageMemoryDemoTest{
    //  Storage 变量（存储在区块链上）
    uint[] public storageArray;
    mapping(uint256 => uint256) public storageMapping;

    struct User {
        uint256 id;
        address addr;
        string name;
    }

    User[] public storageUsers;
    mapping(address => User) public storageUserMap;

    // Storage 操作

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
        return storageArray;// 返回 memory 副本
    }

    /**
     * @notice 修改 storage 数组元素
     * @param _index 索引
     * @param _value 新值
     */
    function updateStorageArray(uint256 _index, uint256 _value) public {
        require(_index < storageArray.length, "index out of bounds");
        storageArray[_index] = _value;// 直接修改 storage
    }


    // Memory 操作

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


    // Calldata 操作

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
}