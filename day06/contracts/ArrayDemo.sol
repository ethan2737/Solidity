// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ArrayDemo
 * @notice 演示 Solidity 数组类型的使用
 * @dev 用于学习数组的声明、操作和 storage vs memory
 * 
 * 学习要点：
 * 1. 固定长度数组：uint[5]
 * 2. 动态数组：uint[]
 * 3. 数组操作：push, pop, length
 * 4. 数组访问：索引访问
 * 5. 数组删除：delete
 */
contract ArrayDemo {
    // ═══════════════════════════════════════════════════════════
    // 固定长度数组
    // ═══════════════════════════════════════════════════════════
    
    uint[5] public fixedArray;           // 固定长度：5
    address[10] public addressArray;     // 固定长度：10
    bool[3] public boolArray;            // 固定长度：3
    
    // ═══════════════════════════════════════════════════════════
    // 动态数组
    // ═══════════════════════════════════════════════════════════
    
    uint[] public dynamicUintArray;      // 动态数组
    address[] public dynamicAddressArray; // 动态地址数组
    string[] public dynamicStringArray;   // 动态字符串数组
    
    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════
    
    event ElementAdded(uint256 index, uint256 value);
    event ElementRemoved(uint256 index);
    event ArrayCleared();
    
    // ═══════════════════════════════════════════════════════════
    // 固定长度数组操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置固定数组元素
     * @param _index 索引
     * @param _value 值
     */
    function setFixedArrayElement(uint256 _index, uint256 _value) public {
        require(_index < fixedArray.length, "Index out of bounds");
        fixedArray[_index] = _value;
    }
    
    /**
     * @notice 获取固定数组元素
     * @param _index 索引
     * @return 值
     */
    function getFixedArrayElement(uint256 _index) public view returns (uint256) {
        require(_index < fixedArray.length, "Index out of bounds");
        return fixedArray[_index];
    }
    
    /**
     * @notice 获取固定数组长度
     * @return 长度
     */
    function getFixedArrayLength() public view returns (uint256) {
        return fixedArray.length;
    }
    
    /**
     * @notice 设置地址数组元素
     * @param _index 索引
     * @param _address 地址
     */
    function setAddressArrayElement(uint256 _index, address _address) public {
        require(_index < addressArray.length, "Index out of bounds");
        addressArray[_index] = _address;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 动态数组操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 添加元素到动态数组（push）
     * @param _value 要添加的值
     */
    function pushToDynamicArray(uint256 _value) public {
        dynamicUintArray.push(_value);
        emit ElementAdded(dynamicUintArray.length - 1, _value);
    }
    
    /**
     * @notice 添加地址到动态数组
     * @param _address 要添加的地址
     */
    function pushAddress(address _address) public {
        require(_address != address(0), "Invalid address");
        dynamicAddressArray.push(_address);
        emit ElementAdded(dynamicAddressArray.length - 1, uint256(uint160(_address)));
    }
    
    /**
     * @notice 添加字符串到动态数组
     * @param _str 要添加的字符串
     */
    function pushString(string memory _str) public {
        dynamicStringArray.push(_str);
        emit ElementAdded(dynamicStringArray.length - 1, 0);
    }
    
    /**
     * @notice 移除最后一个元素（pop）
     */
    function popFromDynamicArray() public {
        require(dynamicUintArray.length > 0, "Array is empty");
        dynamicUintArray.pop();
    }
    
    /**
     * @notice 获取动态数组长度
     * @return 长度
     */
    function getDynamicArrayLength() public view returns (uint256) {
        return dynamicUintArray.length;
    }
    
    /**
     * @notice 获取动态数组元素
     * @param _index 索引
     * @return 值
     */
    function getDynamicArrayElement(uint256 _index) public view returns (uint256) {
        require(_index < dynamicUintArray.length, "Index out of bounds");
        return dynamicUintArray[_index];
    }
    
    /**
     * @notice 获取所有动态数组元素
     * @return 数组
     */
    function getAllDynamicArrayElements() public view returns (uint256[] memory) {
        return dynamicUintArray;
    }
    
    /**
     * @notice 获取所有地址数组元素
     * @return 地址数组
     */
    function getAllAddresses() public view returns (address[] memory) {
        return dynamicAddressArray;
    }
    
    /**
     * @notice 获取所有字符串数组元素
     * @return 字符串数组
     */
    function getAllStrings() public view returns (string[] memory) {
        return dynamicStringArray;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 数组修改操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 更新数组元素
     * @param _index 索引
     * @param _value 新值
     */
    function updateElement(uint256 _index, uint256 _value) public {
        require(_index < dynamicUintArray.length, "Index out of bounds");
        dynamicUintArray[_index] = _value;
    }
    
    /**
     * @notice 删除数组元素（设置为0，不改变长度）
     * @param _index 索引
     */
    function deleteElement(uint256 _index) public {
        require(_index < dynamicUintArray.length, "Index out of bounds");
        delete dynamicUintArray[_index];
    }
    
    /**
     * @notice 清空数组
     */
    function clearArray() public {
        delete dynamicUintArray;
        emit ArrayCleared();
    }
    
    // ═══════════════════════════════════════════════════════════
    // 数组搜索和过滤
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 查找元素索引
     * @param _value 要查找的值
     * @return 索引，如果不存在返回数组长度
     */
    function findIndex(uint256 _value) public view returns (uint256) {
        for (uint256 i = 0; i < dynamicUintArray.length; i++) {
            if (dynamicUintArray[i] == _value) {
                return i;
            }
        }
        return dynamicUintArray.length; // 未找到
    }
    
    /**
     * @notice 检查元素是否存在
     * @param _value 要检查的值
     * @return 是否存在
     */
    function contains(uint256 _value) public view returns (bool) {
        return findIndex(_value) < dynamicUintArray.length;
    }
    
    /**
     * @notice 查找地址索引
     * @param _address 要查找的地址
     * @return 索引，如果不存在返回数组长度
     */
    function findAddressIndex(address _address) public view returns (uint256) {
        for (uint256 i = 0; i < dynamicAddressArray.length; i++) {
            if (dynamicAddressArray[i] == _address) {
                return i;
            }
        }
        return dynamicAddressArray.length;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 数组统计
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 计算数组总和
     * @return 总和
     */
    function sumArray() public view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < dynamicUintArray.length; i++) {
            sum += dynamicUintArray[i];
        }
        return sum;
    }
    
    /**
     * @notice 计算数组平均值
     * @return 平均值
     */
    function averageArray() public view returns (uint256) {
        require(dynamicUintArray.length > 0, "Array is empty");
        return sumArray() / dynamicUintArray.length;
    }
    
    /**
     * @notice 查找最大值
     * @return 最大值
     */
    function findMax() public view returns (uint256) {
        require(dynamicUintArray.length > 0, "Array is empty");
        uint256 max = dynamicUintArray[0];
        for (uint256 i = 1; i < dynamicUintArray.length; i++) {
            if (dynamicUintArray[i] > max) {
                max = dynamicUintArray[i];
            }
        }
        return max;
    }
    
    /**
     * @notice 查找最小值
     * @return 最小值
     */
    function findMin() public view returns (uint256) {
        require(dynamicUintArray.length > 0, "Array is empty");
        uint256 min = dynamicUintArray[0];
        for (uint256 i = 1; i < dynamicUintArray.length; i++) {
            if (dynamicUintArray[i] < min) {
                min = dynamicUintArray[i];
            }
        }
        return min;
    }
}

