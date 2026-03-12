// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AdvancedSolidityDemo
 * @notice 综合演示：接口、继承、库和事件的高级用法
 * @dev 整合 day17 和 day18 的所有示例合约
 *
 * 学习要点：
 * 1. 接口（Interface）: 定义合约必须实现的函数签名
 * 2. 继承（Inheritance）: 通过继承复用代码，单继承、多继承、函数重写
 * 3. 库（Library）: 代码复用、Gas 优化、安全性
 * 4. 事件（Event）: 前端监听、日志审计、Gas 优化
 *
 * 小贴士：良好的合约设计有助于代码复用、维护和安全。
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 第一部分：库（Library）定义
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @title SafeMath
 * @notice 安全的数学运算库（虽然 Solidity 0.8+ 自带溢出检查，但这里演示库的用法）
 */
library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        return a - b;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: division by zero");
        return a / b;
    }
}

/**
 * @title ArrayUtils
 * @notice 数组工具库
 */
library ArrayUtils {
    function indexOf(uint256[] storage array, uint256 value) internal view returns (uint256) {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == value) {
                return i;
            }
        }
        revert("Value not found");
    }

    function remove(uint256[] storage array, uint256 index) internal {
        require(index < array.length, "Index out of bounds");
        for (uint256 i = index; i < array.length - 1; i++) {
            array[i] = array[i + 1];
        }
        array.pop();
    }

    function contains(uint256[] storage array, uint256 value) internal view returns (bool) {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == value) {
                return true;
            }
        }
        return false;
    }
}

/**
 * @title StringUtils
 * @notice 字符串工具库
 */
library StringUtils {
    function equal(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function concat(string memory a, string memory b) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }
}

/**
 * @title AddressUtils
 * @notice 地址工具库
 */
library AddressUtils {
    function isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    function isZero(address account) internal pure returns (bool) {
        return account == address(0);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 第二部分：接口（Interface）定义
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @title IERC20Like
 * @notice 类似 ERC20 的接口定义
 */
interface IERC20Like {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title IStorable
 * @notice 存储接口
 */
interface IStorable {
    function store(uint256 value) external;
    function retrieve() external view returns (uint256);
}

/**
 * @title IWithdrawable
 * @notice 可提取接口
 */
interface IWithdrawable {
    function withdraw(uint256 amount) external;
    function deposit() external payable;
}

/**
 * @title IToken
 * @notice 代币接口
 */
interface IToken {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title IWallet
 * @notice 钱包接口
 */
interface IWallet {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function getBalance() external view returns (uint256);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 第三部分：基础合约（用于继承）
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @title Ownable
 * @notice 所有权管理基础合约
 */
contract Ownable {
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

/**
 * @title Pausable
 * @notice 可暂停功能基础合约
 */
contract Pausable {
    bool public paused;

    event Paused(address account);
    event Unpaused(address account);

    modifier whenNotPaused() {
        require(!paused, "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Pausable: not paused");
        _;
    }

    function pause() public virtual {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() public virtual {
        paused = false;
        emit Unpaused(msg.sender);
    }
}

/**
 * @title StorageBase
 * @notice 存储基础合约
 */
contract StorageBase {
    uint256 public storedValue;

    event ValueStored(uint256 oldValue, uint256 newValue);

    function store(uint256 value) public virtual {
        uint256 oldValue = storedValue;
        storedValue = value;
        emit ValueStored(oldValue, value);
    }

    function retrieve() public view virtual returns (uint256) {
        return storedValue;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 第四部分：事件定义
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @title TokenEvents
 * @notice 代币相关事件集合
 */
contract TokenEvents {
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
}

/**
 * @title UserEvents
 * @notice 用户相关事件集合
 */
contract UserEvents {
    event UserRegistered(address indexed user, string name, uint256 timestamp);
    event UserUpdated(address indexed user, string oldName, string newName, uint256 oldBalance, uint256 newBalance);
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
}

/**
 * @title BatchEvents
 * @notice 批量操作事件集合
 */
contract BatchEvents {
    event BatchOperation(address indexed operator, uint256 count, uint256 totalAmount) anonymous;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 第五部分：实现接口的合约
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @title SimpleToken
 * @notice 实现 IERC20Like 接口的简单代币合约
 */
contract SimpleToken is IERC20Like {
    using SafeMath for uint256;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;
    string public name;
    string public symbol;
    uint8 public decimals;

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        decimals = 18;
        _totalSupply = _initialSupply;
        _balances[msg.sender] = _initialSupply;
        emit Transfer(address(0), msg.sender, _initialSupply);
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        _balances[to] = _balances[to].add(amount);
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        require(_allowances[from][msg.sender] >= amount, "Insufficient allowance");
        require(_balances[from] >= amount, "Insufficient balance");

        _allowances[from][msg.sender] = _allowances[from][msg.sender].sub(amount);
        _balances[from] = _balances[from].sub(amount);
        _balances[to] = _balances[to].add(amount);

        emit Transfer(from, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }
}

/**
 * @title StorageContract
 * @notice 实现 IStorable 接口的存储合约
 */
contract StorageContract is IStorable {
    uint256 private storedValue;

    function store(uint256 value) external override {
        storedValue = value;
    }

    function retrieve() external view override returns (uint256) {
        return storedValue;
    }
}

/**
 * @title WalletContract
 * @notice 实现多个接口的钱包合约
 */
contract WalletContract is IStorable, IWithdrawable {
    using SafeMath for uint256;
    using AddressUtils for address;

    uint256 private storedValue;
    mapping(address => uint256) private balances;

    function store(uint256 value) external override {
        storedValue = value;
    }

    function retrieve() external view override returns (uint256) {
        return storedValue;
    }

    function deposit() external payable override {
        require(!address(0).isZero(), "Invalid address");
        balances[msg.sender] = balances[msg.sender].add(msg.value);
    }

    function withdraw(uint256 amount) external override {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] = balances[msg.sender].sub(amount);
        payable(msg.sender).transfer(amount);
    }

    function getBalance(address account) external view returns (uint256) {
        return balances[account];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 第六部分：继承示例合约
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @title OwnableStorage
 * @notice 继承 Ownable 的存储合约（单继承）
 */
contract OwnableStorage is Ownable {
    uint256 private _value;

    event ValueChanged(uint256 oldValue, uint256 newValue);

    function setValue(uint256 newValue) public onlyOwner {
        uint256 oldValue = _value;
        _value = newValue;
        emit ValueChanged(oldValue, newValue);
    }

    function getValue() public view returns (uint256) {
        return _value;
    }
}

/**
 * @title OwnablePausableStorage
 * @notice 继承多个合约的存储合约（多继承）
 */
contract OwnablePausableStorage is Ownable, Pausable, StorageBase {
    constructor(uint256 initialValue) Ownable() {
        storedValue = initialValue;
    }

    function store(uint256 value) public override whenNotPaused {
        super.store(value);
    }

    function pause() public override onlyOwner {
        super.pause();
    }

    function unpause() public override onlyOwner {
        super.unpause();
    }
}

/**
 * @title AdvancedStorage
 * @notice 继承并重写函数的存储合约
 */
contract AdvancedStorage is StorageBase {
    uint256 public maxValue;
    uint256 public minValue;

    constructor(uint256 _maxValue, uint256 _minValue) {
        maxValue = _maxValue;
        minValue = _minValue;
    }

    function store(uint256 value) public override {
        require(value >= minValue && value <= maxValue, "Value out of range");
        super.store(value);
    }

    function retrieve() public view override returns (uint256) {
        return super.retrieve();
    }
}

/**
 * @title AbstractToken
 * @notice 抽象合约，定义接口但不完全实现
 */
abstract contract AbstractToken {
    mapping(address => uint256) public balances;

    function transfer(address to, uint256 amount) public virtual returns (bool);

    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }
}

/**
 * @title ConcreteToken
 * @notice 实现抽象合约的具体合约
 */
contract ConcreteToken is AbstractToken {
    using SafeMath for uint256;

    function transfer(address to, uint256 amount) public override returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] = balances[msg.sender].sub(amount);
        balances[to] = balances[to].add(amount);
        return true;
    }

    function mint(address to, uint256 amount) public {
        balances[to] = balances[to].add(amount);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 第七部分：使用库的合约
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @title MathContract
 * @notice 使用 SafeMath 库的合约
 */
contract MathContract {
    using SafeMath for uint256;

    uint256 public value;

    function add(uint256 a, uint256 b) public pure returns (uint256) {
        return a.add(b);
    }

    function subtract(uint256 a, uint256 b) public pure returns (uint256) {
        return a.sub(b);
    }

    function multiply(uint256 a, uint256 b) public pure returns (uint256) {
        return a.mul(b);
    }

    function divide(uint256 a, uint256 b) public pure returns (uint256) {
        return a.div(b);
    }

    function setValue(uint256 newValue) public {
        value = SafeMath.add(value, newValue);
    }
}

/**
 * @title ArrayContract
 * @notice 使用 ArrayUtils 库的合约
 */
contract ArrayContract {
    using ArrayUtils for uint256[];

    uint256[] public numbers;

    function addNumber(uint256 number) public {
        numbers.push(number);
    }

    function removeNumber(uint256 number) public {
        uint256 index = numbers.indexOf(number);
        numbers.remove(index);
    }

    function containsNumber(uint256 number) public view returns (bool) {
        return numbers.contains(number);
    }

    function getNumbers() public view returns (uint256[] memory) {
        return numbers;
    }
}

/**
 * @title StringContract
 * @notice 使用 StringUtils 库的合约
 */
contract StringContract {
    using StringUtils for string;

    string public storedString;

    function setString(string memory newString) public {
        storedString = newString;
    }

    function compareStrings(string memory otherString) public view returns (bool) {
        return storedString.equal(otherString);
    }

    function appendString(string memory suffix) public {
        storedString = storedString.concat(suffix);
    }
}

/**
 * @title AddressContract
 * @notice 使用 AddressUtils 库的合约
 */
contract AddressContract {
    using AddressUtils for address;

    address public storedAddress;

    function setAddress(address newAddress) public {
        require(!newAddress.isZero(), "Cannot set zero address");
        storedAddress = newAddress;
    }

    function checkIfContract() public view returns (bool) {
        return storedAddress.isContract();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 第八部分：事件示例合约
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @title EventDemo
 * @notice 演示 Solidity Event 的基础用法
 */
contract EventDemo is TokenEvents {
    using SafeMath for uint256;
    address public owner;
    uint256 public totalSupply;
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;

    event BalanceUpdated(address indexed account, uint256 oldBalance, uint256 newBalance, uint256 timestamp);

    constructor(uint256 _initialSupply) {
        owner = msg.sender;
        totalSupply = _initialSupply;
        balances[msg.sender] = _initialSupply;
        emit Transfer(address(0), msg.sender, _initialSupply);
    }

    function transfer(address to, uint256 amount) public {
        require(to != address(0), "Cannot transfer to zero address");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        uint256 oldBalanceFrom = balances[msg.sender];
        uint256 oldBalanceTo = balances[to];

        balances[msg.sender] = balances[msg.sender].sub(amount);
        balances[to] = balances[to].add(amount);

        emit Transfer(msg.sender, to, amount);
        emit BalanceUpdated(msg.sender, oldBalanceFrom, balances[msg.sender], block.timestamp);
        emit BalanceUpdated(to, oldBalanceTo, balances[to], block.timestamp);
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == owner, "Only owner can mint");
        require(to != address(0), "Cannot mint to zero address");

        totalSupply = totalSupply.add(amount);
        balances[to] = balances[to].add(amount);

        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
    }

    function burn(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] = balances[msg.sender].sub(amount);
        totalSupply = totalSupply.sub(amount);

        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }

    function transferOwnership(address newOwner) public {
        require(msg.sender == owner, "Only owner can transfer ownership");
        require(newOwner != address(0), "New owner cannot be zero address");

        address oldOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        require(spender != address(0), "Cannot approve zero address");
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(from != address(0), "Cannot transfer from zero address");
        require(to != address(0), "Cannot transfer to zero address");
        require(balances[from] >= amount, "Insufficient balance");
        require(allowances[from][msg.sender] >= amount, "Insufficient allowance");

        balances[from] = balances[from].sub(amount);
        balances[to] = balances[to].add(amount);
        allowances[from][msg.sender] = allowances[from][msg.sender].sub(amount);

        emit Transfer(from, to, amount);
        return true;
    }

    function getBalance(address account) public view returns (uint256) {
        return balances[account];
    }
}

/**
 * @title EventAdvanced
 * @notice 演示 Solidity Event 的高级用法
 */
contract EventAdvanced is UserEvents, BatchEvents {
    using SafeMath for uint256;
    struct User {
        address addr;
        string name;
        uint256 balance;
        uint256 createdAt;
    }

    mapping(address => User) public users;
    address[] public userAddresses;
    uint256 public userCount;

    event ComplexTransaction(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId,
        uint256 amount,
        string metadata
    ) anonymous;

    event MultiLevelEvent(
        bytes32 indexed level1,
        bytes32 indexed level2,
        bytes data
    );

    constructor() {
        userCount = 0;
    }

    function registerUser(string memory name) public {
        require(users[msg.sender].addr == address(0), "User already registered");
        require(bytes(name).length > 0, "Name cannot be empty");

        users[msg.sender] = User({
            addr: msg.sender,
            name: name,
            balance: 0,
            createdAt: block.timestamp
        });

        userAddresses.push(msg.sender);
        userCount++;

        emit UserRegistered(msg.sender, name, block.timestamp);
    }

    function updateUserName(string memory newName) public {
        require(users[msg.sender].addr != address(0), "User not registered");
        require(bytes(newName).length > 0, "Name cannot be empty");

        string memory oldName = users[msg.sender].name;
        uint256 oldBalance = users[msg.sender].balance;

        users[msg.sender].name = newName;

        emit UserUpdated(msg.sender, oldName, newName, oldBalance, users[msg.sender].balance);
    }

    function updateUserBalance(uint256 newBalance) public {
        require(users[msg.sender].addr != address(0), "User not registered");

        string memory currentName = users[msg.sender].name;
        uint256 oldBalance = users[msg.sender].balance;

        users[msg.sender].balance = newBalance;

        emit UserUpdated(msg.sender, currentName, currentName, oldBalance, newBalance);
    }

    function executeComplexTransaction(
        address to,
        uint256 tokenId,
        uint256 amount,
        string memory metadata
    ) public {
        require(to != address(0), "Cannot transfer to zero address");

        emit ComplexTransaction(msg.sender, to, tokenId, amount, metadata);
    }

    function triggerMultiLevelEvent(
        bytes32 level1,
        bytes32 level2,
        bytes memory data
    ) public {
        emit MultiLevelEvent(level1, level2, data);
    }

    function batchUpdateBalances(
        address[] memory addresses,
        uint256[] memory amounts
    ) public {
        require(addresses.length == amounts.length, "Arrays length mismatch");

        uint256 totalAmount = 0;

        for (uint256 i = 0; i < addresses.length; i++) {
            if (users[addresses[i]].addr != address(0)) {
                users[addresses[i]].balance = users[addresses[i]].balance.add(amounts[i]);
                totalAmount = totalAmount.add(amounts[i]);
            }
        }

        emit BatchOperation(msg.sender, addresses.length, totalAmount);
    }

    function getUser(address userAddress) public view returns (User memory) {
        return users[userAddress];
    }

    function getAllUserAddresses() public view returns (address[] memory) {
        return userAddresses;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 第九部分：综合合约
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @title AdvancedWallet
 * @notice 高级钱包合约，综合使用接口、继承和库
 */
contract AdvancedWallet is Ownable, Pausable, IWallet {
    using SafeMath for uint256;
    using AddressUtils for address;

    mapping(address => uint256) private _balances;
    address[] private _users;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event TokenReceived(address indexed token, address indexed from, uint256 amount);

    constructor() Ownable() {}

    function deposit() external payable override whenNotPaused {
        require(msg.value > 0, "Amount must be greater than 0");

        if (_balances[msg.sender] == 0) {
            _users.push(msg.sender);
        }

        _balances[msg.sender] = _balances[msg.sender].add(msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external override whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(_balances[msg.sender] >= amount, "Insufficient balance");

        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        payable(msg.sender).transfer(amount);

        emit Withdraw(msg.sender, amount);
    }

    function getBalance() external view override returns (uint256) {
        return _balances[msg.sender];
    }

    function getTotalBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    function pause() public override onlyOwner {
        super.pause();
    }

    function unpause() public override onlyOwner {
        super.unpause();
    }

    address public tokenContract;

    function receiveToken(address token, uint256 amount) external {
        require(!token.isZero(), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");
        require(tokenContract != address(0), "Token contract not set");

        IToken(token).transfer(address(this), amount);
        emit TokenReceived(token, msg.sender, amount);
    }

    function getAllUsers() external view returns (address[] memory) {
        return _users;
    }

    function getUserCount() external view returns (uint256) {
        return _users.length;
    }

    function setTokenContract(address _tokenContract) external onlyOwner {
        require(!_tokenContract.isZero(), "Invalid address");
        tokenContract = _tokenContract;
    }
}

/**
 * @title TokenWallet
 * @notice 代币钱包合约，实现 IToken 接口并继承 Ownable
 */
contract TokenWallet is Ownable, IToken {
    using SafeMath for uint256;
    using AddressUtils for address;

    mapping(address => uint256) private _balances;
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 private _totalSupply;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) Ownable() {
        name = _name;
        symbol = _symbol;
        decimals = 18;
        _totalSupply = _initialSupply;
        _balances[msg.sender] = _initialSupply;
        emit Transfer(address(0), msg.sender, _initialSupply);
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        require(!to.isZero(), "Transfer to zero address");
        require(_balances[msg.sender] >= amount, "Insufficient balance");

        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        _balances[to] = _balances[to].add(amount);

        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(!to.isZero(), "Mint to zero address");
        _totalSupply = _totalSupply.add(amount);
        _balances[to] = _balances[to].add(amount);
        emit Transfer(address(0), to, amount);
    }

    function burn(uint256 amount) external {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        _totalSupply = _totalSupply.sub(amount);
        emit Transfer(msg.sender, address(0), amount);
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }
}

/**
 * @title ContractFactory
 * @notice 合约工厂，使用接口创建和管理合约
 */
contract ContractFactory is Ownable {
    using AddressUtils for address;

    address[] public wallets;
    address[] public tokens;

    event WalletCreated(address indexed wallet);
    event TokenCreated(address indexed token, string name, string symbol);

    function createWallet() external returns (address) {
        AdvancedWallet wallet = new AdvancedWallet();
        wallets.push(address(wallet));
        emit WalletCreated(address(wallet));
        return address(wallet);
    }

    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) external returns (address) {
        TokenWallet token = new TokenWallet(name, symbol, initialSupply);
        tokens.push(address(token));
        emit TokenCreated(address(token), name, symbol);
        return address(token);
    }

    function depositToWallet(address wallet, uint256 amount) external payable {
        require(!wallet.isZero(), "Invalid wallet address");
        require(msg.value == amount, "Amount mismatch");

        IWallet(wallet).deposit{value: amount}();
    }

    function transferToken(
        address token,
        address to,
        uint256 amount
    ) external returns (bool) {
        require(!token.isZero(), "Invalid token address");
        require(!to.isZero(), "Invalid recipient address");

        return IToken(token).transfer(to, amount);
    }

    function getAllWallets() external view returns (address[] memory) {
        return wallets;
    }

    function getAllTokens() external view returns (address[] memory) {
        return tokens;
    }
}

/**
 * @title InterfaceUser
 * @notice 演示如何使用接口与其他合约交互
 */
contract InterfaceUser {
    function storeViaInterface(address storageContract, uint256 value) external {
        IStorable(storageContract).store(value);
    }

    function retrieveViaInterface(address storageContract) external view returns (uint256) {
        return IStorable(storageContract).retrieve();
    }

    function transferToken(address token, address to, uint256 amount) external returns (bool) {
        return IERC20Like(token).transfer(to, amount);
    }

    function checkInterface(address contractAddress) external view returns (bool) {
        try IStorable(contractAddress).retrieve() returns (uint256) {
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * @title ComprehensiveContract
 * @notice 综合使用多个库的合约
 */
contract ComprehensiveContract {
    using SafeMath for uint256;
    using ArrayUtils for uint256[];
    using StringUtils for string;
    using AddressUtils for address;

    uint256[] public values;
    string public name;
    address public owner;
    mapping(address => uint256) public balances;

    event ValueAdded(uint256 value, uint256 total);
    event ValueRemoved(uint256 value, uint256 total);

    constructor(string memory _name) {
        name = _name;
        owner = msg.sender;
    }

    function addValue(uint256 value) public {
        require(!values.contains(value), "Value already exists");
        values.push(value);
        emit ValueAdded(value, calculateTotal());
    }

    function removeValue(uint256 value) public {
        uint256 index = values.indexOf(value);
        values.remove(index);
        emit ValueRemoved(value, calculateTotal());
    }

    function calculateTotal() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < values.length; i++) {
            total = total.add(values[i]);
        }
        return total;
    }

    function deposit(address account, uint256 amount) public {
        require(!account.isZero(), "Invalid address");
        balances[account] = balances[account].add(amount);
    }

    function withdraw(address account, uint256 amount) public {
        require(!account.isZero(), "Invalid address");
        balances[account] = balances[account].sub(amount);
    }

    function updateName(string memory suffix) public {
        name = name.concat(suffix);
    }
}
