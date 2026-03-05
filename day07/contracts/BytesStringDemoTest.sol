// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BytesStringDemoTest {
    // bytes 类型
    bytes public dynamicBytes; // 动态字节数组
    bytes32 public fixedBytes32; // 固定 32 字节
    bytes1 public fixedBytes1; // 固定 1 字节


    function getBytesSlice(uint256 _start, uint256 _end) public view returns (bytes memory) {
        require(_start < dynamicBytes.length, "Start index out of bounds");
        require(_end <= dynamicBytes.length, "End index out of bounds");
        require(_start < _end, "Invalid range");

        bytes memory slice = new bytes(_end - _start); // 切片的容量
        // 通过索引赋值数组中的元素到对应位置的切片中
        for (uint256 i = _start; i< _end; i++){
            slice[i - _start] = dynamicBytes[i];
        }
        return slice;
    }
}