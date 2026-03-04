// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MappingDemo
 * @notice 演示 Solidity 映射类型的使用
 * @dev 映射也是引用类型，用于学习映射的操作
 * 
 * 学习要点：
 * 1. 映射定义：mapping(key => value)
 * 2. 嵌套映射：mapping(key => mapping(key => value))
 * 3. 映射与数组结合
 * 4. 映射的遍历（通过数组）
 */
contract MappingDemo {
    // ═══════════════════════════════════════════════════════════
    // 基本映射
    // ═══════════════════════════════════════════════════════════
    
    mapping(address => uint256) public balances;
    mapping(uint256 => address) public idToAddress;
    mapping(address => bool) public isMember;
    mapping(string => uint256) public nameToId;
    
    // ═══════════════════════════════════════════════════════════
    // 嵌套映射
    // ═══════════════════════════════════════════════════════════
    
    mapping(address => mapping(address => uint256)) public allowances; // owner => spender => amount
    mapping(uint256 => mapping(string => bool)) public permissions;    // userId => permission => allowed
    
    // ═══════════════════════════════════════════════════════════
    // 映射与数组结合（用于遍历）
    // ═══════════════════════════════════════════════════════════
    
    address[] public allAddresses; // 存储所有地址，用于遍历映射
    mapping(address => bool) public addressExists; // 检查地址是否已存在
    
    uint256[] public allIds; // 存储所有ID
    mapping(uint256 => bool) public idExists;
    
    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════
    
    event BalanceUpdated(address indexed account, uint256 oldBalance, uint256 newBalance);
    event MemberAdded(address indexed member);
    event MemberRemoved(address indexed member);
    event AllowanceSet(address indexed owner, address indexed spender, uint256 amount);
    
    // ═══════════════════════════════════════════════════════════
    // 基本映射操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置余额
     * @param _account 账户地址
     * @param _amount 余额
     */
    function setBalance(address _account, uint256 _amount) public {
        uint256 oldBalance = balances[_account];
        balances[_account] = _amount;
        emit BalanceUpdated(_account, oldBalance, _amount);
        
        // 添加到地址列表（如果不存在）
        if (!addressExists[_account]) {
            allAddresses.push(_account);
            addressExists[_account] = true;
        }
    }
    
    /**
     * @notice 增加余额
     * @param _account 账户地址
     * @param _amount 增加的数量
     */
    function increaseBalance(address _account, uint256 _amount) public {
        balances[_account] += _amount;
        emit BalanceUpdated(_account, balances[_account] - _amount, balances[_account]);
        
        if (!addressExists[_account]) {
            allAddresses.push(_account);
            addressExists[_account] = true;
        }
    }
    
    /**
     * @notice 减少余额
     * @param _account 账户地址
     * @param _amount 减少的数量
     */
    function decreaseBalance(address _account, uint256 _amount) public {
        require(balances[_account] >= _amount, "Insufficient balance");
        balances[_account] -= _amount;
        emit BalanceUpdated(_account, balances[_account] + _amount, balances[_account]);
    }
    
    /**
     * @notice 设置ID到地址的映射
     * @param _id ID
     * @param _address 地址
     */
    function setIdToAddress(uint256 _id, address _address) public {
        idToAddress[_id] = _address;
        
        if (!idExists[_id]) {
            allIds.push(_id);
            idExists[_id] = true;
        }
    }
    
    /**
     * @notice 设置名称到ID的映射
     * @param _name 名称
     * @param _id ID
     */
    function setNameToId(string memory _name, uint256 _id) public {
        nameToId[_name] = _id;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 成员管理
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 添加成员
     * @param _member 成员地址
     */
    function addMember(address _member) public {
        require(!isMember[_member], "Already a member");
        isMember[_member] = true;
        emit MemberAdded(_member);
        
        if (!addressExists[_member]) {
            allAddresses.push(_member);
            addressExists[_member] = true;
        }
    }
    
    /**
     * @notice 移除成员
     * @param _member 成员地址
     */
    function removeMember(address _member) public {
        require(isMember[_member], "Not a member");
        isMember[_member] = false;
        emit MemberRemoved(_member);
    }
    
    /**
     * @notice 获取成员数量
     * @return 成员数量
     */
    function getMemberCount() public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < allAddresses.length; i++) {
            if (isMember[allAddresses[i]]) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @notice 获取所有成员
     * @return 成员地址数组
     */
    function getAllMembers() public view returns (address[] memory) {
        address[] memory members = new address[](getMemberCount());
        uint256 index = 0;
        for (uint256 i = 0; i < allAddresses.length; i++) {
            if (isMember[allAddresses[i]]) {
                members[index] = allAddresses[i];
                index++;
            }
        }
        return members;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 嵌套映射操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置授权额度（嵌套映射）
     * @param _owner 拥有者
     * @param _spender 被授权者
     * @param _amount 授权数量
     */
    function setAllowance(address _owner, address _spender, uint256 _amount) public {
        allowances[_owner][_spender] = _amount;
        emit AllowanceSet(_owner, _spender, _amount);
    }
    
    /**
     * @notice 获取授权额度
     * @param _owner 拥有者
     * @param _spender 被授权者
     * @return 授权数量
     */
    function getAllowance(address _owner, address _spender) public view returns (uint256) {
        return allowances[_owner][_spender];
    }
    
    /**
     * @notice 设置权限（嵌套映射）
     * @param _userId 用户ID
     * @param _permission 权限名称
     * @param _allowed 是否允许
     */
    function setPermission(uint256 _userId, string memory _permission, bool _allowed) public {
        permissions[_userId][_permission] = _allowed;
    }
    
    /**
     * @notice 检查权限
     * @param _userId 用户ID
     * @param _permission 权限名称
     * @return 是否允许
     */
    function hasPermission(uint256 _userId, string memory _permission) public view returns (bool) {
        return permissions[_userId][_permission];
    }
    
    // ═══════════════════════════════════════════════════════════
    // 映射遍历
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取所有地址
     * @return 地址数组
     */
    function getAllAddresses() public view returns (address[] memory) {
        return allAddresses;
    }
    
    /**
     * @notice 获取所有ID
     * @return ID数组
     */
    function getAllIds() public view returns (uint256[] memory) {
        return allIds;
    }
    
    /**
     * @notice 计算所有余额的总和
     * @return 总余额
     */
    function getTotalBalance() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < allAddresses.length; i++) {
            total += balances[allAddresses[i]];
        }
        return total;
    }
    
    /**
     * @notice 查找余额大于指定值的地址
     * @param _minBalance 最小余额
     * @return 符合条件的地址数组
     */
    function findAddressesWithBalance(uint256 _minBalance) public view returns (address[] memory) {
        uint256 count = 0;
        // 先计算数量
        for (uint256 i = 0; i < allAddresses.length; i++) {
            if (balances[allAddresses[i]] >= _minBalance) {
                count++;
            }
        }
        
        // 创建数组并填充
        address[] memory result = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allAddresses.length; i++) {
            if (balances[allAddresses[i]] >= _minBalance) {
                result[index] = allAddresses[i];
                index++;
            }
        }
        return result;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 映射查询
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 检查地址是否存在
     * @param _address 地址
     * @return 是否存在
     */
    function addressExistsInMapping(address _address) public view returns (bool) {
        return addressExists[_address];
    }
    
    /**
     * @notice 获取地址数量
     * @return 地址数量
     */
    function getAddressCount() public view returns (uint256) {
        return allAddresses.length;
    }
}

