// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ArrayDemoTest {
    // 固定长度数组
    uint[5] public fixedArray;
    address[10] public addressArray;
    bool[3] public boolArray;

    // 动态长度数组
    uint[] public dynamicUintArray;
    address[] public dynamicAddressArray;
    string[] public dynamicStringArray;

    // 事件
    event ElementAdded(uint256 index, uint256 value);
    event ElementRemoved(uint256 value);
    event ArrayCleared();

    // 固定长度数组操作

    // 设置固定数组元素
    function setFiexedArrayElement(uint256 _index, uint256 _value) public {
        require(_index < fixedArray.length, "Index out of bounds");
        fixedArray[_index] = _value;
    }

    // 获取固定数组元素
    function getFixedArrayElement(
        uint256 _index
    ) public view returns (uint256) {
        require(_index < fixedArray.length, "index out of bounds");
        return fixedArray[_index];
    }

    // 获取固定长度数组
    function getFixedArrayLength() public view returns (uint256) {
        return fixedArray.length;
    }

    // 设置地址数组元素
    function setAddressArrayElement(uint256 _index, address _address) public {
        require(_index < addressArray.length, "Index out of bounds");
        addressArray[_index] = _address;
    }

    // 动态数组操作

    // 添加元素到动态数组 push
    function pushToDynamicArray(uint256 _value) public {
        dynamicUintArray.push(_value);
        emit ElementAdded(dynamicUintArray.length - 1, _value);
    }

    // 添加地址到动态数组
    function pushAddress(address _address) public {
        require(_address != address(0), "Invalide address");
        dynamicAddressArray.push(_address);
        emit ElementAdded(
            dynamicAddressArray.length - 1,
            uint256(uint160(_address))
        );
    }

    // 添加字符串到动态数组
    function pushString(string memory _str) public {
        dynamicStringArray.push(_str);
        emit ElementAdded(dynamicStringArray.length - 1, 0);
    }

    // 移除最后一个元素 pop
    function popFromDynamicArray() public {
        require(dynamicUintArray.length > 0, "Array is empty");
        dynamicUintArray.pop();
    }

    // 获取动态数组的长度
    function getDynamicArrayLength() public view returns (uint256) {
        return dynamicUintArray.length;
    }

    // 获取动态数组的元素
    function getDynamicArrayElement(
        uint256 _index
    ) public view returns (uint256) {
        require(_index < dynamicUintArray.length, "Index out of bounds");
        return dynamicUintArray[_index];
    }

    // 获取所有动态数组元素
    function getAllDynamicArrayElement()
        public
        view
        returns (uint256[] memory)
    {
        return dynamicUintArray;
    }

    // 获取所有地址数组元素
    function getAllAddress() public view returns (address[] memory) {
        return dynamicAddressArray;
    }

    // 获取所有字符串数组元素
    function getAllStrings() public view returns (string[] memory) {
        return dynamicStringArray;
    }

    // 数组修改操作

    // 更新数组元素：索引，新值
    function updateElement(uint256 _index, uint256 _value) public {
        require(_index < dynamicUintArray.length, "Index out of bounds");
        dynamicUintArray[_index] = _value;
    }

    // 删除数组元素（设置为0，不改变长度）
    function deleteElement(uint256 _index) public {
        require(_index < dynamicUintArray.length, "Index out of bounds");
        delete dynamicUintArray[_index];
    }

    // 清空数组
    function clearArray() public {
        delete dynamicUintArray;
        emit ArrayCleared();
    }

    // 数组搜索和过滤

    // 查找元素索引:查找的值,索引，如果不存在返回数组长度
    function findIndex(uint256 _value) public view returns (uint256) {
        for (uint256 i = 0; i < dynamicUintArray.length; i++) {
            if (dynamicUintArray[i] == _value) {
                return i;
            }
        }
        return dynamicUintArray.length;
    }

    // 检查元素是否存在,要检查的值,是否存在
    function contains(uint256 _value) public view returns (bool) {
        return findIndex(_value) < dynamicUintArray.length;
    }

    // 查找地址索引,要查找的地址,索引，如果不存在返回数组长度
    function findAddressIndex(address _address) public view returns (uint256) {
        for (uint256 i = 0; i < dynamicAddressArray.length; i++) {
            if (dynamicAddressArray[i] == _address) {
                return i;
            }
        }
        return dynamicAddressArray.length;
    }

    // 数组统计

    // 计算数组总和
    function sumArray() public view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < dynamicUintArray.length; i++) {
            sum += dynamicUintArray[i];
        }
        return sum;
    }

    // 计算数组平均值
    function averageArray() public view returns (uint256) {
        require(dynamicUintArray.length > 0, "Array is empty");
        return sumArray() / dynamicUintArray.length;
    }

    // 查找最大值
    function findMax() public view returns (uint256) {
        require(dynamicUintArray.length > 0, "Array is empty");
        uint256 max = dynamicUintArray[0];
        for (uint256 i = 0; i < dynamicUintArray.length; i++) {
            if (dynamicUintArray[i] > max) {
                max = dynamicUintArray[i];
            }
        }
        return max;
    }

    // 查找最小值
    function findMin() public view returns (uint256) {
        require(dynamicUintArray.length > 0, "Array is empty");
        uint256 min = dynamicUintArray[0];
        for (uint256 i = 0; i < dynamicUintArray.length; i++) {
            if (dynamicUintArray[i] < min) {
                min = dynamicUintArray[i];
            }
        }
        return min;
    }
}
