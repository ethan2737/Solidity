// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ChainlinkVRFDemo
 * @notice 演示 Chainlink VRF 生成安全随机数
 * @dev 展示如何请求可验证的随机数
 */
contract ChainlinkVRFDemo {
    // VRF 请求结构
    struct VRFRequest {
        bool fulfilled;
        uint256 randomNumber;
        address requester;
    }

    // 请求映射
    mapping(uint256 => VRFRequest) public vrfRequests;
    // 请求计数器
    uint256 public requestCounter;
    // VRF Coordinator 地址
    address public vrfCoordinator;
    // VRF Key Hash
    bytes32 public keyHash;
    // VRF 费用
    uint256 public fee;

    // 事件
    event RandomNumberRequested(uint256 indexed requestId, address indexed requester);
    event RandomNumberFulfilled(uint256 indexed requestId, uint256 randomNumber);

    /**
     * @notice 构造函数
     * @param _vrfCoordinator VRF Coordinator 地址
     * @param _keyHash VRF Key Hash
     * @param _fee VRF 费用
     */
    constructor(address _vrfCoordinator, bytes32 _keyHash, uint256 _fee) {
        vrfCoordinator = _vrfCoordinator;
        keyHash = _keyHash;
        fee = _fee;
    }

    /**
     * @notice 请求随机数
     * @dev 实际项目中会调用 Chainlink VRF Coordinator
     * @return requestId 请求 ID
     */
    function requestRandomNumber() public returns (uint256) {
        uint256 requestId = requestCounter++;

        vrfRequests[requestId] = VRFRequest({
            fulfilled: false,
            randomNumber: 0,
            requester: msg.sender
        });

        emit RandomNumberRequested(requestId, msg.sender);

        // 模拟：直接填充随机数
        _fulfillRequest(requestId);

        return requestId;
    }

    /**
     * @notice 模拟随机数生成（仅用于演示）
     */
    function _fulfillRequest(uint256 requestId) internal {
        // 模拟随机数
        uint256 mockRandom = uint256(
            keccak256(abi.encodePacked(block.timestamp, requestId, msg.sender))
        ) % 1000000;

        // 直接更新状态
        vrfRequests[requestId].fulfilled = true;
        vrfRequests[requestId].randomNumber = mockRandom;

        emit RandomNumberFulfilled(requestId, mockRandom);
    }

    /**
     * @notice 获取随机数
     */
    function getRandomNumber(uint256 requestId) public view returns (bool fulfilled, uint256 randomNumber) {
        VRFRequest memory request = vrfRequests[requestId];
        return (request.fulfilled, request.randomNumber);
    }

    /**
     * @notice 生成 0 到 maxValue-1 之间的随机数
     */
    function getRandomValue(uint256 requestId, uint256 maxValue) public view returns (uint256) {
        require(vrfRequests[requestId].fulfilled, unicode"随机数未完成");
        require(maxValue > 0, unicode"最大值必须大于0");

        return vrfRequests[requestId].randomNumber % maxValue;
    }

    /**
     * @notice 生成指定范围内的随机数
     */
    function getRandomValueInRange(uint256 requestId, uint256 minValue, uint256 maxValue) public view returns (uint256) {
        require(vrfRequests[requestId].fulfilled, unicode"随机数未完成");
        require(maxValue > minValue, unicode"最大值必须大于最小值");

        uint256 range = maxValue - minValue;
        return minValue + (vrfRequests[requestId].randomNumber % range);
    }
}
