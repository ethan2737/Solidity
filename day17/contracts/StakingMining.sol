// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// 导入合约接口
import "./IERC20.sol";

/**
* @title StakingMining
* @notice 流动性挖矿合约：用户stake代币，定期领取奖励
* @dev 实现了完整的 staking/mining 功能，包含安全机制
*
* 学习要点：
* 1. reward速率管理：可调整的奖励发放速率
* 2. 质押退出逻辑：安全的unstake机制
* 3. 防范 flash loan攻击： 使用 checks-effects-interactions模型，记录staking时的余额快照
* 4. 停损机制：紧急暂停功能
*/
contract StakingMining {
    // 状态变量
    IERC20 public stakingToken;     // 质押的代币
    IERC20 public rewardToken;      // 奖励代币

    address public owner;           // 合约所有者
    bool public paused;             // 停损机制：紧急暂停

    // Reward速率管理
    uint256 public rewardRate;      // 每秒奖励速率（单位： wei persecond）
    uint256 public lastUpdateTime;  // 上次更新时间
    uint256 public periodFinish;    // 奖励发放结束时间
    uint256 public rewardPerTokenStored;    // 累计每token奖励

    // 用户质押信息
    struct UserInfo {
        uint256 stakedAmount;               // 质押数量
        uint256 rewardPerTokenPaid;         // 用户已支付的每token奖励
        uint256 rewards;                    // 待领取奖励
        uint256 lastStakeTime;              // 上次质押时间（用于防范 flash loan）
    }


    // 用户信息与地址的映射
    mapping(address => UserInfo) public userinfo;

    // 总质押量
    uint256 public totalStaked;


    // 自定义错误
    error Unauthorized(address caller);         // 未经授权
    error ContractPausedError();                     // 合约已暂停
    error InvalidAddress();                     // 无效的地址
    error InvalidAmount();                      // 无效的数量
    error InsufficientBalance();                // 余额不足
    error FlashLoanAttackDetected();            // 检测到闪电贷攻击
    error NoRewardsToClaim();                   // 无奖励可领取
    error TransferFailed();                     // 转账失败


    // 事件
    event Staked(address indexed user, uint256 amount);                 // 质押：用户地址--数量
    event Unstaked(address indexed user, uint256 amount);               // 解除质押：用户地址--数量
    event RewardClaimed(address indexed user, uint256 amount);          // 领取奖励：用户地址--数量
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);          // 奖励率已更新: 旧速率 -- 新速率
    event ContractPaused(bool paused);                                  // 合约已暂停
    event EmergencyWithdraw(address indexed token, uint256 amount);     // 紧急提取


    // 修改器
    // 权限控制修改器：限制只有合约所有者才能调用合约
    modifier onlyOwner() {
        // 检查 msg.sender（当前调用者）是否等于 owner
        // 如果不相等，立即 revert 并抛出 Unauthorized 错误，包含调用者地址
        if (msg.sender != owner) revert Unauthorized(msg.sender);
        // 如果通过检查，执行 _（函数体）
        _;
    }

    // 紧急暂停修改器：当合约处于暂停状态时，阻止用户操作（停损机制）
    modifier whenNotPaused(){
        // 检查 paused 状态变量
        // 如果为 true（已暂停），revert 并抛出 ContractPaused 错误
        if (paused) revert ContractPausedError();
        // 如果为 false（正常运行），执行 _（函数体）
        _;
    }


    // 奖励更新修改器（最核心）： 在执行函数前后，自动更新和计算用户应得奖励
    modifier updateReward(address account){
        // 更新全局累计每 token 奖励
        rewardPerTokenStored = rewardPerToken();
        // 更新最后时间戳为当前 block.timestamp
        lastUpdateTime = lastTimeRewardApplicable();

        // 如果账户是非零地址，更新该用户奖励信息
        if (account != address(0)){
            // 计算用户当前待领取奖励
            userinfo[account].rewards = earned(account);
            // 记录用户已支付的每 token 奖励
            userinfo[account].rewardPerTokenPaid = rewardPerTokenStored;
        }
        // 执行实际函数体
        _;
    }


    /**
    * @notice 构造函数
    * @param _stakingToken  用户用来质押的代币合约地址（如 USDT、DAI）
    * @param _rewardToken   用来发放奖励的代币合约地址（如项目代币）
    * @param _rewardRate    奖励发放速率，单位是 wei/秒
    */
    constructor(address _stakingToken, address _rewardToken, uint256 _rewardRate){
        // 参数验证:防止传入零地址
        // 使用 revert + 自定义错误 InvalidAddress() 比 require 更省 gas
        if (_stakingToken == address(0)) revert InvalidAddress();
        if (_rewardToken == address(0)) revert InvalidAddress();

        // 初始化代币合约
        // 将传入的地址转换为 IERC20 接口类型
        // 之后合约可以通过 .transferFrom() 调用 ERC20 标准函数
        stakingToken = IERC20(_stakingToken);
        rewardToken =  IERC20(_rewardToken);

        // 将部署合约的人设置为 owner
        owner = msg.sender;
        // 初始化奖励速率
        rewardRate = _rewardRate;
        // 初始化时间戳:记录奖励计算的起始时间点
        lastUpdateTime = block.timestamp;
        // 初始化奖励发放结束时间（设置为最大uint256，表示持续发放）
        periodFinish = type(uint256).max;
        // 初始化暂停状态:合约部署后默认处于正常运行状态，用户可以 stake/unstake/claim
        paused = false;
    }


    // 核心功能

    /**
    * @notice 质押代币
    * @param amount 质押数量
    * @dev 使用checks-effects-interactions模式防范重入攻击，记录staking时的余额快照，防范flash loan攻击
    * 
    * 1. 只能从外部调用，不能用 this.stake() 内部调用
    * 2. 合约必须处于运行状态，不能暂停
    * 3. updateReward(msg.sender) 先更新用户奖励，再执行质押逻辑
    */
    function stake(uint256 amount) external whenNotPaused updateReward(msg.sender) {
        // 防止质押 0 数量，无意义操作
        if (amount == 0) revert InvalidAmount();

        // checks 检查余额
        // 记录合约在质押之前的代币余额（用于后续防闪电贷攻击验证）
        uint256 balanceBefore = stakingToken.balanceOf(address(this));
        // 检查用户是否有足够的代币余额
        if (stakingToken.balanceOf(msg.sender) < amount) revert InsufficientBalance();

        // Effects: 更新状态（先更新状态，在交互）
        UserInfo storage user = userinfo[msg.sender];       // storage 引用：直接使用存储引用，避免复制到 memory
        user.stakedAmount += amount;                        // 在外部调用之前就修改状态，即使后续调用失败，状态已记录
        user.lastStakeTime = block.timestamp;               // 记录用户最后一次质押时间，用于防范闪电贷攻击
        totalStaked += amount;                              // 更新质押总数

        // Interactions: 外部调用（最后执行）
        // 调用 ERC20 代币合约的 transferFrom 函数，从用户的钱包转账 amount 数量的代币到合约地址。
        // 如果这个函数返回 false（表示转账失败），就立即 revert 整个交易，并抛出 TransferFailed 错误。
        if (!stakingToken.transferFrom(msg.sender, address(this), amount)) {    // 如果转账失败
            revert TransferFailed();                                            // 回滚，抛出异常
        }

        // 验证余额变化（防范 flash loan攻击）
        uint256 balanceAfer = stakingToken.balanceOf(address(this));        // 转账后的余额
        if (balanceAfer != balanceBefore + amount){                         // 转账后的余额 = 转账前的余额 + 用户质押的数量
            revert FlashLoanAttackDetected();                               // 如果不相等，说明有人通过某种方式（如闪电贷）在转账过程中把代币转走了，这是一种攻击行为，立即 revert 整个交易。
        }

        emit Staked(msg.sender, amount);
    }


    /**
    * @notice 退出质押
    * @param amount 退出数量
    * @dev 质押退出逻辑：先更新奖励，在提取代币
    * 1. 用户调用这个函数来提取质押的代币
    * 2. whenNotPaused  如果合约被 pause 了，调用会失败
    * 3. updateReward 在执行 unstake 之前，先结算用户应得的奖励
    */
    function unstake(uint256 amount) external whenNotPaused updateReward(msg.sender) {
        // 检查退出数量,如果（退出数量 等于 0）,就回滚交易，抛出错误"无效数量"
        if (amount == 0) revert InvalidAmount();

        // 获取用户质押信息
        // storage：直接引用存储，不复制到内存，节省 gas
        UserInfo storage user = userinfo[msg.sender];                   // 从 userInfo 映射中取出当前调用者的质押信息
        // 如果（用户质押数量 < 想退出的数量）, 就回滚交易，抛出错误"质押不足" 
        if (user.stakedAmount < amount) revert InsufficientBalance();

        // CEI 模式
        // Effects: 更新状态
        user.stakedAmount -= amount;
        totalStaked -= amount;

        // interactions 外部调用:将代币从合约转账给用户
        if (!stakingToken.transfer(msg.sender, amount)){ // 如果（质押代币.转账给 (调用者，数量) 返回 false）
            // 就回滚交易，抛出错误"转账失败" 
            revert TransferFailed();
        }

        emit Unstaked(msg.sender, amount);
    }


    /**
    * @notice 退出全部质押
    * 1. 用户调用这个函数来提取所有质押的代币
    * 2. 修改器：当合约未被暂停时
    */
    function unstakeAll() external whenNotPaused updateReward(msg.sender) {
        // 声明一个 UserInfo 结构体变量 user，使用 storage 引用
        // 从 userInfo 映射中取出当前调用者的质押信息, 获取用户当前质押了多少代币
        UserInfo storage user = userinfo[msg.sender];
        uint256 amount = user.stakedAmount;
        if (amount == 0) revert InvalidAmount();
        user.stakedAmount = 0;
        totalStaked -= amount;
        if (!stakingToken.transfer(msg.sender, amount)){
            revert TransferFailed();
        }
        emit Unstaked(msg.sender, amount);
    }


    /**
    * @notice 领取奖励
    * @dev 定期领取奖励：计算并发放用户累计的奖励
    */
    function claimReward() external whenNotPaused updateReward(msg.sender) {
        // 获取用户的质押信息
        UserInfo storage user = userinfo[msg.sender];
        uint256 reward = user.rewards;

        // 判断奖励是否为0
        if (reward == 0) revert NoRewardsToClaim();

        // Effects 更新奖励，清零
        user.rewards = 0;

        // interactions 发放奖励
        if (!rewardToken.transfer(msg.sender, reward)){
            revert TransferFailed();
        }

        // 触发广播事件
        emit RewardClaimed(msg.sender, reward);
    }


    /**
    * @notice 退出质押并领取奖励
    * @param amount 退出数量
    */
    function exit(uint256 amount) external whenNotPaused updateReward(msg.sender) {
        // 退出质押
        UserInfo storage user = userinfo[msg.sender];
        if (amount == 0) revert InvalidAmount();
        if (user.stakedAmount < amount) revert InsufficientBalance();
        user.stakedAmount -= amount;
        totalStaked -= amount;
        if (!stakingToken.transfer(msg.sender, amount)){
            revert TransferFailed();
        }
        emit Unstaked(msg.sender, amount);

        // 领取奖励
        uint256 reward = user.rewards;
        if (reward == 0) revert NoRewardsToClaim();
        user.rewards = 0;
        if (!rewardToken.transfer(msg.sender, reward)){
            revert TransferFailed();
        }
        emit RewardClaimed(msg.sender, reward);
    }


    /**
    * @notice 更新奖励速率
    * @param newRate 新的奖励速率（每秒）
    * @dev 只有 owner 可以领取，用于调整奖励发放速率
    */
    function setRewardRate(uint256 newRate) external onlyOwner updateReward(address(0)){
        // 获取当前的速率
        uint256 oldRate = rewardRate;
        // 更新速率
        rewardRate = newRate;
        // 触发奖励更新速率事件
        emit RewardRateUpdated(oldRate, newRate);
    }


    /**
    * @notice 获取最后一个可领取奖励的时间
    * @return 返回当前区块时间和奖励结束时间的较小值
    */
    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }


    /**
    * @notice 计算用户当前可领取的奖励
    * @param account 用户地址
    * @return 返回用户当前可领取的奖励数量
    */
    function earned(address account) public view returns (uint256) {
        UserInfo storage user = userinfo[account];
        uint256 rewardPerTokenPaid = user.rewardPerTokenPaid;
        // 如果总质押量为0，直接返回用户已记录的奖励
        if (totalStaked == 0) {
            return user.rewards;
        }
        // 计算从上次更新到现在的累计每 token 奖励
        uint256 currentRewardPerToken = rewardPerToken() - rewardPerTokenPaid;
        // 用户应得奖励 = 质押数量 × 累计每token奖励 + 已记录的奖励
        uint256 newRewards = user.stakedAmount * currentRewardPerToken / 1e18;
        return user.rewards + newRewards;
    }


    /**
    * @notice 计算每质押 1 个代币能获得多少奖励
    * @return 返回值是每 token 累积的奖励（单位：wei）
    */
    function rewardPerToken() public view returns (uint256) {
        // 如果（总质押量 等于 0）
        if (totalStaked == 0) {
            // 就返回 已存储的每 token 奖励
            return rewardPerTokenStored;
        }
        // 计算从上次更新到现在，经过了多少秒：经过的时间 = 当前区块的时间 - 上次更新奖励的时间戳
        uint256 timeElapsed = block.timestamp - lastUpdateTime;
        // 计算新增的每 token 奖励： 新增的奖励 = 经过的时间（秒）× 每秒奖励速率× 10^18（精度转换）÷ 总质押量
        // 作用：计算在这段时间内，每质押 1 个代币能分到多少奖励
        uint256 reward = timeElapsed * rewardRate * 1e18 / totalStaked;
        // 返回 已存储的累计奖励 + 新增奖励
        return rewardPerTokenStored + reward;
    }


    /**
    * @notice 暂停合约（停损机制）
    * @dev 紧急情况下暂停所有操作
    */
    function pasue() external onlyOwner{
        paused = true;
        emit ContractPaused(true);
    }


    /**
    * @notice 回复合约
    */
    function unpause() external onlyOwner{
        paused = false;
        emit ContractPaused(false);
    }


    /**
    * @notice 紧急提取代币（停损机制）
    * @param token 代币地址
    * @param amount 提取数量
    * @dev 只有 owner 可以调用，用于紧急情况
    */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner{
        if (token == address(0)) revert InvalidAddress();

        IERC20(token).transfer(owner, amount);
        emit EmergencyWithdraw(token, amount);
    }

    /**
    * @notice 获取用户质押信息
    * @param account 用户地址
    * @return stakedAmount 质押数量
    * @return pendingRewards 待领取的奖励
    * @return lastStakeTime 上次质押时间
    */
    function getUserInfo(address account) external view returns(uint256 stakedAmount, uint256 pendingRewards, uint256 lastStakeTime){
        UserInfo memory user = userinfo[account];
        return (user.stakedAmount, earned(account), user.lastStakeTime);
    }


    /**
    * @notice 获取合约中奖励代币余额
    * @return 余额
    */
    function getRewardTokenBalance() external view returns(uint256) {
        return rewardToken.balanceOf(address(this));
    }

    /**
    * @notice 获取合约中质押代币余额
    * @return 余额
    */
    function getStakingTokenBalance() external view returns (uint256) {
        return stakingToken.balanceOf(address(this));
    }
}
