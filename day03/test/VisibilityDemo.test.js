/**
 * 智能合约测试脚本详解
 *
 * 测试框架：Hardhat + Chai + Ethers.js
 * 测试对象：VisibilityDemo 合约的可见性修饰符
 */

// ═══════════════════════════════════════════════════════════
// 第1步：导入依赖模块
// ═══════════════════════════════════════════════════════════

// 从 Chai 断言库导入 expect 函数
// expect 用于编写可读性强的断言，如 expect(value).to.equal(expected)
const { expect } = require("chai");

// 从 Hardhat 导入 ethers 对象
// ethers 是与以太坊交互的库，用于部署合约、调用函数、发送交易等
const { ethers } = require("hardhat");

// ═══════════════════════════════════════════════════════════
// 第2步：定义测试套件 - 父合约 VisibilityDemo
// ═══════════════════════════════════════════════════════════

// describe 定义一个测试套件（test suite），将相关测试分组
// 第一个参数是套件描述，第二个参数是包含测试的函数
describe("VisibilityDemo", function () {
  // 声明变量，用于在测试间共享合约实例和账户
  let visibilityDemo;  // 合约实例
  let owner;           // 测试账户（签名者）

  // beforeEach 是一个钩子函数，在每个测试用例（it）执行前运行
  // 用于设置测试环境，确保每个测试都有干净的状态
  beforeEach(async function () {
    // ethers.getSigners() 获取 Hardhat 网络中的测试账户
    // 返回一个数组，这里我们取第一个账户赋值给 owner
    [owner] = await ethers.getSigners();

    // ethers.getContractFactory("合约名") 获取合约工厂
    // 合约工厂用于部署新合约实例
    const VisibilityDemo = await ethers.getContractFactory("VisibilityDemo");

    // 部署合约：创建并发送部署交易到网络
    // 返回一个合约实例，可以调用其函数
    visibilityDemo = await VisibilityDemo.deploy();

    // 等待部署完成：确保合约已在区块链上确认
    // 在 Hardhat 网络中几乎是瞬时的，但在真实网络需要等待
    await visibilityDemo.waitForDeployment();
  });

  // ═══════════════════════════════════════════════════════════
  // 子测试套件1：测试 public 可见性
  // ═══════════════════════════════════════════════════════════

  describe("Public 可见性", function () {
    // it 定义一个具体的测试用例
    // 第一个参数是测试描述，第二个参数是异步测试函数
    it("应该能够从外部访问 public 变量", async function () {
      // 访问 public 变量：Solidity 会自动生成 getter 函数
      // 在 JS 中就像调用异步函数一样：await contract.variableName()
      const publicVar = await visibilityDemo.publicVar();

      // 使用 expect 断言验证结果
      // .to.equal(100) 检查返回值是否等于 100
      // 注意：Solidity 的 uint256 在 JS 中变成 BigNumber，但小数字可以直接比较
      expect(publicVar).to.equal(100);
    });

    it("应该能够从外部调用 public 函数", async function () {
      // 调用 public 函数，获取返回值
      const result = await visibilityDemo.publicFunction();

      // 验证返回的字符串
      expect(result).to.equal("This is a public function");
    });

    it("应该能够从内部调用 public 函数", async function () {
      // 调用一个 public 函数，该函数内部再调用另一个 public 函数
      // 测试 public 函数可以从合约内部被调用
      const result = await visibilityDemo.callPublicFunction();
      expect(result).to.equal("This is a public function");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 子测试套件2：测试 private 可见性
  // ═══════════════════════════════════════════════════════════

  describe("Private 可见性", function () {
    it("应该能够通过函数访问 private 变量", async function () {
      // private 变量不能直接访问（没有自动生成的 getter）
      // 需要通过合约提供的 public 函数间接访问
      const privateVar = await visibilityDemo.getPrivateVar();
      expect(privateVar).to.equal(200);
    });

    it("应该能够通过函数设置 private 变量", async function () {
      // 调用 setter 函数修改 private 变量
      // 这是一个交易（transaction），会改变区块链状态
      await visibilityDemo.setPrivateVar(300);

      // 再次获取验证是否修改成功
      const newPrivateVar = await visibilityDemo.getPrivateVar();
      expect(newPrivateVar).to.equal(300);
    });

    it("应该能够从内部调用 private 函数", async function () {
      // private 函数不能从外部直接调用
      // 通过 public 函数间接调用 private 函数
      const result = await visibilityDemo.callPrivateFunction();
      expect(result).to.equal("This is a private function");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 子测试套件3：测试 internal 可见性
  // ═══════════════════════════════════════════════════════════

  describe("Internal 可见性", function () {
    it("应该能够通过函数访问 internal 变量", async function () {
      // internal 变量和 private 类似，需要通过函数访问
      const internalVar = await visibilityDemo.getInternalVar();
      expect(internalVar).to.equal(300);
    });

    it("应该能够通过函数设置 internal 变量", async function () {
      // 修改 internal 变量并验证
      await visibilityDemo.setInternalVar(400);
      const newInternalVar = await visibilityDemo.getInternalVar();
      expect(newInternalVar).to.equal(400);
    });

    it("应该能够从内部调用 internal 函数", async function () {
      // 通过 public 函数间接调用 internal 函数
      const result = await visibilityDemo.callInternalFunction();
      expect(result).to.equal("This is an internal function");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 子测试套件4：测试 external 可见性
  // ═══════════════════════════════════════════════════════════

  describe("External 可见性", function () {
    it("应该能够从外部调用 external 函数", async function () {
      // external 函数只能从外部调用（这正是我们在做的）
      const result = await visibilityDemo.externalFunction();
      expect(result).to.equal("This is an external function");
    });

    it("应该能够通过 this 关键字调用 external 函数", async function () {
      // 合约内部可以通过 this.externalFunc() 调用 external 函数
      // 这个测试调用一个 public 函数，该函数内部使用 this 调用 external
      const result = await visibilityDemo.callExternalFunctionViaThis();
      expect(result).to.equal("This is an external function");
    });
  });
});

// ═══════════════════════════════════════════════════════════
// 第3步：定义测试套件 - 子合约 VisibilityDemoChild
// ═══════════════════════════════════════════════════════════

// 第二个 describe 测试继承合约的行为
describe("VisibilityDemoChild", function () {
  let child;   // 子合约实例
  let owner;   // 测试账户

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    // 获取子合约工厂并部署
    // 子合约继承了父合约的所有 public 和 internal 成员
    const VisibilityDemoChild = await ethers.getContractFactory("VisibilityDemoChild");
    child = await VisibilityDemoChild.deploy();
    await child.waitForDeployment();
  });

  describe("继承中的可见性", function () {
    it("子合约应该能够访问父合约的 internal 变量", async function () {
      // internal 成员可以被子合约继承和访问
      const internalVar = await child.accessInternalFromChild();
      expect(internalVar).to.equal(300);
    });

    it("子合约应该能够调用父合约的 internal 函数", async function () {
      // internal 函数可以被子合约调用
      const result = await child.callInternalFromChild();
      expect(result).to.equal("This is an internal function");
    });

    it("子合约应该能够访问父合约的 public 变量", async function () {
      // public 成员自然也可以被子合约访问
      // 通过自动生成的 getter 访问
      const publicVar = await child.publicVar();
      expect(publicVar).to.equal(100);
    });
  });
});

/**
 * ═══════════════════════════════════════════════════════════
 * 智能合约测试编写指南总结
 * ═══════════════════════════════════════════════════════════
 *
 * 1. 基本结构
 *    - 使用 describe() 组织测试套件
 *    - 使用 it() 编写具体测试用例
 *    - 使用 beforeEach() 设置测试环境
 *
 * 2. 常用断言（Chai）
 *    - expect(value).to.equal(expected)     // 相等
 *    - expect(value).to.be.above(n)         // 大于
 *    - expect(value).to.be.below(n)         // 小于
 *    - expect(fn).to.be.reverted            // 期待回滚
 *    - expect(fn).to.be.revertedWith("msg") // 期待特定错误消息
 *
 * 3. Ethers.js 常用操作
 *    - await ethers.getSigners()            // 获取测试账户
 *    - await ethers.getContractFactory()    // 获取合约工厂
 *    - await contract.deploy()              // 部署合约
 *    - await contract.functionName()        // 调用 view/pure 函数
 *    - await contract.functionName(args)    // 发送交易
 *    - await contract.waitForDeployment()   // 等待部署完成
 *
 * 4. 测试最佳实践
 *    - 每个测试应该独立，不依赖其他测试
 *    - 使用 beforeEach 重置状态，确保测试隔离
 *    - 测试应该覆盖正常情况和异常情况
 *    - 描述要清晰，说明测试什么行为
 */
