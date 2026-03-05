// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SliceDemo
 * @notice 演示 Solidity 切片操作
 * @dev 用于学习如何对 bytes 和 string 进行切片
 * 
 * 学习要点：
 * 1. bytes 切片
 * 2. string 切片
 * 3. 切片操作的实际应用
 * 4. Storage vs Memory 中的切片
 */
contract SliceDemo {
    // ═══════════════════════════════════════════════════════════
    // 状态变量
    // ═══════════════════════════════════════════════════════════
    
    bytes public dataBytes;
    string public dataString;
    
    // ═══════════════════════════════════════════════════════════
    // 初始化数据
    // ═══════════════════════════════════════════════════════════
    
    constructor() {
        // 初始化一些测试数据
        dataBytes = "Hello, World!";
        dataString = "Hello, Solidity!";
    }
    
    // ═══════════════════════════════════════════════════════════
    // bytes 切片操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取 bytes 切片（使用循环）
     * @param _start 起始索引
     * @param _length 长度
     * @return 切片
     */
    function getBytesSlice(uint256 _start, uint256 _length) public view returns (bytes memory) {
        require(_start + _length <= dataBytes.length, "Slice out of bounds");
        
        bytes memory slice = new bytes(_length);
        for (uint256 i = 0; i < _length; i++) {
            slice[i] = dataBytes[_start + i];
        }
        return slice;
    }
    
    /**
     * @notice 获取 bytes 前缀
     * @param _length 长度
     * @return 前缀切片
     */
    function getBytesPrefix(uint256 _length) public view returns (bytes memory) {
        require(_length <= dataBytes.length, "Length exceeds bytes length");
        return getBytesSlice(0, _length);
    }
    
    /**
     * @notice 获取 bytes 后缀
     * @param _length 长度
     * @return 后缀切片
     */
    function getBytesSuffix(uint256 _length) public view returns (bytes memory) {
        require(_length <= dataBytes.length, "Length exceeds bytes length");
        uint256 start = dataBytes.length - _length;
        return getBytesSlice(start, _length);
    }
    
    /**
     * @notice 获取 bytes 中间部分
     * @param _start 起始索引
     * @param _end 结束索引（不包含）
     * @return 中间切片
     */
    function getBytesMiddle(uint256 _start, uint256 _end) public view returns (bytes memory) {
        require(_end <= dataBytes.length, "End index out of bounds");
        require(_start < _end, "Invalid range");
        return getBytesSlice(_start, _end - _start);
    }
    
    // ═══════════════════════════════════════════════════════════
    // string 切片操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取 string 切片
     * @param _start 起始索引
     * @param _length 长度
     * @return 切片字符串
     */
    function getStringSlice(uint256 _start, uint256 _length) public view returns (string memory) {
        bytes memory strBytes = bytes(dataString);
        require(_start + _length <= strBytes.length, "Slice out of bounds");
        
        bytes memory slice = new bytes(_length);
        for (uint256 i = 0; i < _length; i++) {
            slice[i] = strBytes[_start + i];
        }
        return string(slice);
    }
    
    /**
     * @notice 获取 string 前缀
     * @param _length 长度
     * @return 前缀字符串
     */
    function getStringPrefix(uint256 _length) public view returns (string memory) {
        bytes memory strBytes = bytes(dataString);
        require(_length <= strBytes.length, "Length exceeds string length");
        return getStringSlice(0, _length);
    }
    
    /**
     * @notice 获取 string 后缀
     * @param _length 长度
     * @return 后缀字符串
     */
    function getStringSuffix(uint256 _length) public view returns (string memory) {
        bytes memory strBytes = bytes(dataString);
        require(_length <= strBytes.length, "Length exceeds string length");
        uint256 start = strBytes.length - _length;
        return getStringSlice(start, _length);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 高级切片操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 从 bytes 中提取指定位置的字节
     * @param _indices 索引数组
     * @return 提取的字节数组
     */
    function extractBytes(uint256[] memory _indices) public view returns (bytes memory) {
        bytes memory result = new bytes(_indices.length);
        for (uint256 i = 0; i < _indices.length; i++) {
            require(_indices[i] < dataBytes.length, "Index out of bounds");
            result[i] = dataBytes[_indices[i]];
        }
        return result;
    }
    
    /**
     * @notice 分割 bytes（按分隔符）
     * @param _separator 分隔符字节
     * @return 分割后的字节数组数组
     */
    function splitBytes(bytes1 _separator) public view returns (bytes[] memory) {
        // 先计算分割后的数量
        uint256 count = 1;
        for (uint256 i = 0; i < dataBytes.length; i++) {
            if (dataBytes[i] == _separator) {
                count++;
            }
        }
        
        bytes[] memory parts = new bytes[](count);
        uint256 partIndex = 0;
        uint256 start = 0;
        
        for (uint256 i = 0; i < dataBytes.length; i++) {
            if (dataBytes[i] == _separator) {
                uint256 length = i - start;
                parts[partIndex] = getBytesSlice(start, length);
                start = i + 1;
                partIndex++;
            }
        }
        
        // 添加最后一部分
        parts[partIndex] = getBytesSlice(start, dataBytes.length - start);
        
        return parts;
    }
    
    /**
     * @notice 替换 bytes 中的字节
     * @param _oldByte 旧字节
     * @param _newByte 新字节
     * @return 替换后的字节数组
     */
    function replaceByte(bytes1 _oldByte, bytes1 _newByte) public view returns (bytes memory) {
        bytes memory result = new bytes(dataBytes.length);
        for (uint256 i = 0; i < dataBytes.length; i++) {
            result[i] = (dataBytes[i] == _oldByte) ? _newByte : dataBytes[i];
        }
        return result;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 字符串切片应用
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 提取字符串中的数字部分
     * @return 数字字符串
     */
    function extractNumbers() public view returns (string memory) {
        bytes memory strBytes = bytes(dataString);
        bytes memory numbers = new bytes(strBytes.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < strBytes.length; i++) {
            bytes1 char = strBytes[i];
            if (char >= 0x30 && char <= 0x39) { // '0' to '9'
                numbers[count++] = char;
            }
        }
        
        // 调整数组大小
        bytes memory result = new bytes(count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = numbers[i];
        }
        
        return string(result);
    }
    
    /**
     * @notice 反转字符串
     * @return 反转后的字符串
     */
    function reverseString() public view returns (string memory) {
        bytes memory strBytes = bytes(dataString);
        bytes memory reversed = new bytes(strBytes.length);
        
        for (uint256 i = 0; i < strBytes.length; i++) {
            reversed[i] = strBytes[strBytes.length - 1 - i];
        }
        
        return string(reversed);
    }
    
    /**
     * @notice 移除字符串中的空格
     * @return 移除空格后的字符串
     */
    function removeSpaces() public view returns (string memory) {
        bytes memory strBytes = bytes(dataString);
        bytes memory result = new bytes(strBytes.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] != 0x20) { // 不是空格
                result[count++] = strBytes[i];
            }
        }
        
        // 调整数组大小
        bytes memory trimmed = new bytes(count);
        for (uint256 i = 0; i < count; i++) {
            trimmed[i] = result[i];
        }
        
        return string(trimmed);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 工具函数
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置数据 bytes
     * @param _bytes 字节数组
     */
    function setDataBytes(bytes memory _bytes) public {
        dataBytes = _bytes;
    }
    
    /**
     * @notice 设置数据 string
     * @param _str 字符串
     */
    function setDataString(string memory _str) public {
        dataString = _str;
    }
    
    /**
     * @notice 获取数据 bytes 长度
     * @return 长度
     */
    function getDataBytesLength() public view returns (uint256) {
        return dataBytes.length;
    }
    
    /**
     * @notice 获取数据 string 长度
     * @return 长度
     */
    function getDataStringLength() public view returns (uint256) {
        return bytes(dataString).length;
    }
}

