// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title StructOperations
 * @notice 演示结构体的各种操作
 * @dev 用于学习结构体的创建、修改、比较、复制
 * 
 * 学习要点：
 * 1. 结构体的创建和初始化
 * 2. 结构体的修改
 * 3. 结构体的比较
 * 4. 结构体的复制
 * 5. Storage vs Memory 中的结构体
 */
contract StructOperations {
    // ═══════════════════════════════════════════════════════════
    // 结构体定义
    // ═══════════════════════════════════════════════════════════
    
    struct Person {
        string name;
        uint256 age;
        address addr;
        bool isActive;
    }
    
    struct Point {
        int256 x;
        int256 y;
    }
    
    struct Rectangle {
        Point topLeft;
        Point bottomRight;
    }
    
    // ═══════════════════════════════════════════════════════════
    // Storage 结构体
    // ═══════════════════════════════════════════════════════════
    
    Person public defaultPerson;
    Person[] public persons;
    mapping(address => Person) public addressToPerson;
    
    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════
    
    event PersonCreated(address indexed addr, string name, uint256 age);
    event PersonUpdated(address indexed addr, string name, uint256 age);
    
    // ═══════════════════════════════════════════════════════════
    // 结构体创建
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 创建 Person（使用命名参数）
     * @param _name 姓名
     * @param _age 年龄
     * @param _addr 地址
     * @return 创建的 Person
     */
    function createPersonNamed(
        string memory _name,
        uint256 _age,
        address _addr
    ) public pure returns (Person memory) {
        return Person({
            name: _name,
            age: _age,
            addr: _addr,
            isActive: true
        });
    }
    
    /**
     * @notice 创建 Person（使用位置参数）
     * @param _name 姓名
     * @param _age 年龄
     * @param _addr 地址
     * @return 创建的 Person
     */
    function createPersonPositional(
        string memory _name,
        uint256 _age,
        address _addr
    ) public pure returns (Person memory) {
        return Person(_name, _age, _addr, true);
    }
    
    /**
     * @notice 创建 Person 并存储到映射
     * @param _name 姓名
     * @param _age 年龄
     * @param _addr 地址
     */
    function createAndStorePerson(
        string memory _name,
        uint256 _age,
        address _addr
    ) public {
        require(_addr != address(0), "Invalid address");
        
        addressToPerson[_addr] = Person({
            name: _name,
            age: _age,
            addr: _addr,
            isActive: true
        });
        
        emit PersonCreated(_addr, _name, _age);
    }
    
    /**
     * @notice 添加 Person 到数组
     * @param _name 姓名
     * @param _age 年龄
     * @param _addr 地址
     */
    function addPersonToArray(
        string memory _name,
        uint256 _age,
        address _addr
    ) public {
        persons.push(Person({
            name: _name,
            age: _age,
            addr: _addr,
            isActive: true
        }));
    }
    
    // ═══════════════════════════════════════════════════════════
    // 结构体修改
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 修改映射中的结构体（Storage 引用）
     * @param _addr 地址
     * @param _name 新姓名
     * @param _age 新年龄
     */
    function updatePersonInMapping(
        address _addr,
        string memory _name,
        uint256 _age
    ) public {
        require(addressToPerson[_addr].addr != address(0), "Person does not exist");
        
        // 直接修改 Storage 引用
        addressToPerson[_addr].name = _name;
        addressToPerson[_addr].age = _age;
        
        emit PersonUpdated(_addr, _name, _age);
    }
    
    /**
     * @notice 修改数组中的结构体（Storage 引用）
     * @param _index 索引
     * @param _name 新姓名
     * @param _age 新年龄
     */
    function updatePersonInArray(
        uint256 _index,
        string memory _name,
        uint256 _age
    ) public {
        require(_index < persons.length, "Index out of bounds");
        
        // 直接修改 Storage 引用
        persons[_index].name = _name;
        persons[_index].age = _age;
    }
    
    /**
     * @notice 使用 Storage 引用修改结构体
     * @param _addr 地址
     * @param _name 新姓名
     */
    function updatePersonViaStorageReference(
        address _addr,
        string memory _name
    ) public {
        require(addressToPerson[_addr].addr != address(0), "Person does not exist");
        
        // 使用 Storage 引用
        Person storage person = addressToPerson[_addr];
        person.name = _name;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 结构体读取
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取映射中的 Person（返回 Memory 副本）
     * @param _addr 地址
     * @return Person 结构体
     */
    function getPersonFromMapping(address _addr) public view returns (Person memory) {
        require(addressToPerson[_addr].addr != address(0), "Person does not exist");
        return addressToPerson[_addr]; // 返回 Memory 副本
    }
    
    /**
     * @notice 获取数组中的 Person
     * @param _index 索引
     * @return Person 结构体
     */
    function getPersonFromArray(uint256 _index) public view returns (Person memory) {
        require(_index < persons.length, "Index out of bounds");
        return persons[_index];
    }
    
    // ═══════════════════════════════════════════════════════════
    // 结构体比较
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 比较两个 Person 是否相等
     * @param _person1 Person 1
     * @param _person2 Person 2
     * @return 是否相等
     */
    function comparePersons(Person calldata _person1, Person calldata _person2) public pure returns (bool) {
        return (
            keccak256(bytes(_person1.name)) == keccak256(bytes(_person2.name)) &&
            _person1.age == _person2.age &&
            _person1.addr == _person2.addr &&
            _person1.isActive == _person2.isActive
        );
    }
    
    /**
     * @notice 比较两个 Person 的地址
     * @param _person1 Person 1
     * @param _person2 Person 2
     * @return 是否地址相同
     */
    function comparePersonAddresses(Person calldata _person1, Person calldata _person2) public pure returns (bool) {
        return _person1.addr == _person2.addr;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 结构体复制
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 复制 Person（Memory 到 Memory）
     * @param _person 源 Person
     * @return 复制的 Person
     */
    function copyPerson(Person calldata _person) public pure returns (Person memory) {
        return Person({
            name: _person.name,
            age: _person.age,
            addr: _person.addr,
            isActive: _person.isActive
        });
    }
    
    /**
     * @notice 复制并修改 Person
     * @param _person 源 Person
     * @param _newName 新姓名
     * @return 修改后的 Person
     */
    function copyAndModifyPerson(Person calldata _person, string calldata _newName) public pure returns (Person memory) {
        Person memory newPerson = copyPerson(_person);
        newPerson.name = _newName;
        return newPerson;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 嵌套结构体
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 创建 Rectangle
     * @param _x1 左上角 x
     * @param _y1 左上角 y
     * @param _x2 右下角 x
     * @param _y2 右下角 y
     * @return Rectangle 结构体
     */
    function createRectangle(
        int256 _x1,
        int256 _y1,
        int256 _x2,
        int256 _y2
    ) public pure returns (Rectangle memory) {
        return Rectangle({
            topLeft: Point(_x1, _y1),
            bottomRight: Point(_x2, _y2)
        });
    }
    
    /**
     * @notice 计算 Rectangle 的面积
     * @param _rect Rectangle
     * @return 面积
     */
    function calculateRectangleArea(Rectangle memory _rect) public pure returns (uint256) {
        int256 width = _rect.bottomRight.x - _rect.topLeft.x;
        int256 height = _rect.topLeft.y - _rect.bottomRight.y;
        
        require(width > 0 && height > 0, "Invalid rectangle");
        
        return uint256(width * height);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 结构体数组操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取所有 Person
     * @return Person 数组
     */
    function getAllPersons() public view returns (Person[] memory) {
        return persons;
    }
    
    /**
     * @notice 获取 Person 数量
     * @return 数量
     */
    function getPersonCount() public view returns (uint256) {
        return persons.length;
    }
    
    /**
     * @notice 查找指定地址的 Person 在数组中的索引
     * @param _addr 地址
     * @return 索引，如果未找到返回数组长度
     */
    function findPersonIndex(address _addr) public view returns (uint256) {
        for (uint256 i = 0; i < persons.length; i++) {
            if (persons[i].addr == _addr) {
                return i;
            }
        }
        return persons.length;
    }
}

