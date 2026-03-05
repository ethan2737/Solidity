// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BytesStringDemo
 * @notice 演示 Solidity bytes 和 string 类型的使用
 * @dev 用于学习 bytes、string、切片的操作
 * 
 * 学习要点：
 * 1. bytes：动态字节数组
 * 2. bytes1 到 bytes32：固定长度字节数组
 * 3. string：UTF-8 编码的字符串
 * 4. 字节数组和字符串的转换
 * 5. 切片操作
 * 6. Storage vs Memory 的区别
 */
contract BytesStringDemo {
    // ═══════════════════════════════════════════════════════════
    // bytes 类型
    // ═══════════════════════════════════════════════════════════
    
    bytes public dynamicBytes;           // 动态字节数组
    bytes32 public fixedBytes32;         // 固定 32 字节
    bytes1 public fixedBytes1;           // 固定 1 字节
    
    // ═══════════════════════════════════════════════════════════
    // string 类型
    // ═══════════════════════════════════════════════════════════
    
    string public storageString;         // Storage 字符串
    string[] public stringArray;         // 字符串数组
    
    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════
    
    event BytesUpdated(bytes newBytes);
    event StringUpdated(string newString);
    
    // ═══════════════════════════════════════════════════════════
    // bytes 操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置动态 bytes
     * @param _bytes 字节数组
     */
    function setDynamicBytes(bytes memory _bytes) public {
        dynamicBytes = _bytes;
        emit BytesUpdated(_bytes);
    }
    
    /**
     * @notice 获取动态 bytes
     * @return 字节数组
     */
    function getDynamicBytes() public view returns (bytes memory) {
        return dynamicBytes;
    }
    
    /**
     * @notice 获取动态 bytes 长度
     * @return 长度
     */
    function getDynamicBytesLength() public view returns (uint256) {
        return dynamicBytes.length;
    }
    
    /**
     * @notice 添加字节到动态 bytes
     * @param _byte 字节值（0-255）
     */
    function pushByte(uint8 _byte) public {
        dynamicBytes.push(bytes1(_byte));
    }
    
    /**
     * @notice 移除最后一个字节
     */
    function popByte() public {
        require(dynamicBytes.length > 0, "Bytes array is empty");
        dynamicBytes.pop();
    }
    
    /**
     * @notice 获取指定索引的字节
     * @param _index 索引
     * @return 字节值
     */
    function getByte(uint256 _index) public view returns (bytes1) {
        require(_index < dynamicBytes.length, "Index out of bounds");
        return dynamicBytes[_index];
    }
    
    /**
     * @notice 设置固定长度 bytes32
     * @param _bytes32 32 字节数据
     */
    function setBytes32(bytes32 _bytes32) public {
        fixedBytes32 = _bytes32;
    }
    
    /**
     * @notice 获取 bytes32
     * @return 32 字节数据
     */
    function getBytes32() public view returns (bytes32) {
        return fixedBytes32;
    }
    
    /**
     * @notice 设置固定长度 bytes1
     * @param _byte 字节值
     */
    function setBytes1(bytes1 _byte) public {
        fixedBytes1 = _byte;
    }
    
    // ═══════════════════════════════════════════════════════════
    // string 操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置字符串
     * @param _str 字符串
     */
    function setString(string memory _str) public {
        storageString = _str;
        emit StringUpdated(_str);
    }
    
    /**
     * @notice 获取字符串
     * @return 字符串
     */
    function getString() public view returns (string memory) {
        return storageString;
    }
    
    /**
     * @notice 获取字符串长度
     * @return 长度（字节数）
     */
    function getStringLength() public view returns (uint256) {
        return bytes(storageString).length;
    }
    
    /**
     * @notice 添加字符串到数组
     * @param _str 字符串
     */
    function pushString(string memory _str) public {
        stringArray.push(_str);
    }
    
    /**
     * @notice 获取字符串数组
     * @return 字符串数组
     */
    function getStringArray() public view returns (string[] memory) {
        return stringArray;
    }
    
    // ═══════════════════════════════════════════════════════════
    // bytes 和 string 转换
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 将 string 转换为 bytes
     * @param _str 字符串
     * @return 字节数组
     */
    function stringToBytes(string memory _str) public pure returns (bytes memory) {
        return bytes(_str);
    }
    
    /**
     * @notice 将 bytes 转换为 string
     * @param _bytes 字节数组
     * @return 字符串
     */
    function bytesToString(bytes memory _bytes) public pure returns (string memory) {
        return string(_bytes);
    }
    
    /**
     * @notice 将 bytes32 转换为 string
     * @param _bytes32 32 字节数据
     * @return 字符串
     */
    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        // bytes32 需要先转换为 bytes，然后转换为 string
        bytes memory bytesArray = new bytes(32);
        for (uint256 i = 0; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }
    
    /**
     * @notice 将 string 转换为 bytes32（截断或填充）
     * @param _str 字符串
     * @return 32 字节数据
     */
    function stringToBytes32(string memory _str) public pure returns (bytes32) {
        bytes memory tempBytes = bytes(_str);
        bytes32 result;
        
        if (tempBytes.length >= 32) {
            // 如果字符串长度 >= 32，取前 32 字节
            assembly {
                result := mload(add(tempBytes, 32))
            }
        } else {
            // 如果字符串长度 < 32，填充零
            for (uint256 i = 0; i < tempBytes.length; i++) {
                result |= bytes32(tempBytes[i]) >> (i * 8);
            }
        }
        
        return result;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 切片操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取 bytes 切片
     * @param _start 起始索引
     * @param _end 结束索引（不包含）
     * @return 切片
     */
    function getBytesSlice(uint256 _start, uint256 _end) public view returns (bytes memory) {
        require(_start < dynamicBytes.length, "Start index out of bounds");
        require(_end <= dynamicBytes.length, "End index out of bounds");
        require(_start < _end, "Invalid range");
        
        bytes memory slice = new bytes(_end - _start);
        for (uint256 i = _start; i < _end; i++) {
            slice[i - _start] = dynamicBytes[i];
        }
        return slice;
    }
    
    /**
     * @notice 获取 string 切片
     * @param _start 起始索引
     * @param _end 结束索引（不包含）
     * @return 切片字符串
     */
    function getStringSlice(uint256 _start, uint256 _end) public view returns (string memory) {
        require(_start < bytes(storageString).length, "Start index out of bounds");
        require(_end <= bytes(storageString).length, "End index out of bounds");
        require(_start < _end, "Invalid range");
        
        bytes memory strBytes = bytes(storageString);
        bytes memory slice = new bytes(_end - _start);
        for (uint256 i = _start; i < _end; i++) {
            slice[i - _start] = strBytes[i];
        }
        return string(slice);
    }
    
    /**
     * @notice 获取字符串的前 N 个字符
     * @param _length 长度
     * @return 前缀字符串
     */
    function getStringPrefix(uint256 _length) public view returns (string memory) {
        bytes memory strBytes = bytes(storageString);
        require(_length <= strBytes.length, "Length exceeds string length");
        
        bytes memory prefix = new bytes(_length);
        for (uint256 i = 0; i < _length; i++) {
            prefix[i] = strBytes[i];
        }
        return string(prefix);
    }
    
    /**
     * @notice 获取字符串的后 N 个字符
     * @param _length 长度
     * @return 后缀字符串
     */
    function getStringSuffix(uint256 _length) public view returns (string memory) {
        bytes memory strBytes = bytes(storageString);
        require(_length <= strBytes.length, "Length exceeds string length");
        
        bytes memory suffix = new bytes(_length);
        uint256 start = strBytes.length - _length;
        for (uint256 i = 0; i < _length; i++) {
            suffix[i] = strBytes[start + i];
        }
        return string(suffix);
    }
    
    // ═══════════════════════════════════════════════════════════
    // bytes 比较和操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 比较两个 bytes
     * @param _bytes1 字节数组1
     * @param _bytes2 字节数组2
     * @return 是否相等
     */
    function compareBytes(bytes memory _bytes1, bytes memory _bytes2) public pure returns (bool) {
        if (_bytes1.length != _bytes2.length) {
            return false;
        }
        for (uint256 i = 0; i < _bytes1.length; i++) {
            if (_bytes1[i] != _bytes2[i]) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * @notice 连接两个 bytes
     * @param _bytes1 字节数组1
     * @param _bytes2 字节数组2
     * @return 连接后的字节数组
     */
    function concatBytes(bytes memory _bytes1, bytes memory _bytes2) public pure returns (bytes memory) {
        bytes memory result = new bytes(_bytes1.length + _bytes2.length);
        uint256 k = 0;
        for (uint256 i = 0; i < _bytes1.length; i++) {
            result[k++] = _bytes1[i];
        }
        for (uint256 i = 0; i < _bytes2.length; i++) {
            result[k++] = _bytes2[i];
        }
        return result;
    }
    
    /**
     * @notice 连接两个字符串
     * @param _str1 字符串1
     * @param _str2 字符串2
     * @return 连接后的字符串
     */
    function concatStrings(string memory _str1, string memory _str2) public pure returns (string memory) {
        bytes memory b1 = bytes(_str1);
        bytes memory b2 = bytes(_str2);
        bytes memory result = new bytes(b1.length + b2.length);

        uint256 k = 0;
        for (uint256 i = 0; i < b1.length; i++) {
            result[k++] = b1[i];
        }
        for (uint256 i = 0; i < b2.length; i++) {
            result[k++] = b2[i];
        }
        return string(result);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 字符串搜索
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 检查字符串是否包含子字符串
     * @param _str 主字符串
     * @param _substr 子字符串
     * @return 是否包含
     */
    function containsSubstring(string memory _str, string memory _substr) public pure returns (bool) {
        bytes memory strBytes = bytes(_str);
        bytes memory substrBytes = bytes(_substr);
        
        if (substrBytes.length > strBytes.length) {
            return false;
        }
        
        for (uint256 i = 0; i <= strBytes.length - substrBytes.length; i++) {
            bool isMatch = true;
            for (uint256 j = 0; j < substrBytes.length; j++) {
                if (strBytes[i + j] != substrBytes[j]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @notice 查找子字符串的位置
     * @param _str 主字符串
     * @param _substr 子字符串
     * @return 位置，如果未找到返回字符串长度
     */
    function findSubstring(string memory _str, string memory _substr) public pure returns (uint256) {
        bytes memory strBytes = bytes(_str);
        bytes memory substrBytes = bytes(_substr);
        
        if (substrBytes.length > strBytes.length) {
            return strBytes.length;
        }
        
        for (uint256 i = 0; i <= strBytes.length - substrBytes.length; i++) {
            bool isMatch = true;
            for (uint256 j = 0; j < substrBytes.length; j++) {
                if (strBytes[i + j] != substrBytes[j]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                return i;
            }
        }
        return strBytes.length;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 特殊 bytes 操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 将 uint256 转换为 bytes
     * @param _value 数值
     * @return 字节数组
     */
    function uintToBytes(uint256 _value) public pure returns (bytes memory) {
        bytes memory result = new bytes(32);
        for (uint256 i = 0; i < 32; i++) {
            result[31 - i] = bytes1(uint8(_value >> (i * 8)));
        }
        return result;
    }
    
    /**
     * @notice 将 address 转换为 bytes
     * @param _addr 地址
     * @return 字节数组（20 字节）
     */
    function addressToBytes(address _addr) public pure returns (bytes memory) {
        bytes20 addrBytes = bytes20(_addr);
        bytes memory result = new bytes(20);
        for (uint256 i = 0; i < 20; i++) {
            result[i] = addrBytes[i];
        }
        return result;
    }
    
    /**
     * @notice 将 bytes 转换为 uint256（前 32 字节）
     * @param _bytes 字节数组
     * @return 数值
     */
    function bytesToUint(bytes memory _bytes) public pure returns (uint256) {
        require(_bytes.length >= 32, "Bytes length insufficient");
        uint256 result = 0;
        for (uint256 i = 0; i < 32; i++) {
            result = result * 256 + uint256(uint8(_bytes[i]));
        }
        return result;
    }
}

