// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EnumDemo {
    // 状态枚举
    enum State {
        Created, // 0 初始状态--已创建
        Locked, // 1 锁定状态--已锁定
        Inactive // 2 非活跃状态--已停用
    }

    // 订单状态枚举
    enum OrderStatus {
        Pending, // 0 待确认
        Confirmed, // 1 已确认
        Shipped, // 2 已发货
        Delivered, // 3 已送达
        Cancelled // 4 已取消
    }

    // 用户角色枚举
    enum UserRole {
        Guest, // 0 访客
        Member, // 1 会员
        Admin, // 2 管理员
        Owner // 3 合约所有者，最高权限
    }

    // 定义初始状态变量
    State public currentState = State.Created; // 默认为已创建
    OrderStatus public orderStatus = OrderStatus.Pending; // 默认为待确认
    UserRole public userRole = UserRole.Guest; // 默认为访客

    // 确定用户角色映射关系
    mapping(address => UserRole) public userRoles;
    // 订单状态映射
    mapping(uint256 => OrderStatus) public orders;

    // 定义事件：状态变更、订单状态变更、用户角色变更
    event StateChanged(State oldState, State newState);
    event OrderChanged(
        uint256 indexed orderID,
        OrderStatus oldStatus,
        OrderStatus newStatus
    );
    event UserRoleChanged(
        address indexed user,
        UserRole oldRole,
        UserRole newRole
    );

    // 状态管理函数
    // 设置状态
    function setState(State _newState) public {
        State oldState = currentState;
        currentState = _newState;
        emit StateChanged(oldState, _newState);
    }

    // 停用状态
    function deactivate() public {
        require(
            currentState == State.Created || currentState == State.Locked,
            "can only deactivate from Created or Locked state"
        );
        State oldState = currentState;
        currentState = State.Inactive;
        emit StateChanged(oldState, State.Inactive);
    }
}
