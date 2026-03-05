const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultiDimensionalArray", function () {
  let multiDimensionalArray;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const MultiDimensionalArray = await ethers.getContractFactory("MultiDimensionalArray");
    multiDimensionalArray = await MultiDimensionalArray.deploy();
    await multiDimensionalArray.waitForDeployment();
  });

  describe("动态二维数组", function () {
    it("应该能够添加行", async function () {
      await multiDimensionalArray.addRow([1, 2, 3]);
      const rowCount = await multiDimensionalArray.getDynamic2DRowCount();
      expect(rowCount).to.equal(1);
    });

    it("应该能够设置和获取元素", async function () {
      await multiDimensionalArray.addRow([1, 2, 3]);
      await multiDimensionalArray.setDynamic2DElement(0, 0, 100);
      const value = await multiDimensionalArray.getDynamic2DElement(0, 0);
      expect(value).to.equal(100);
    });

    it("应该能够获取整行", async function () {
      await multiDimensionalArray.addRow([1, 2, 3]);
      const row = await multiDimensionalArray.getDynamic2DRow(0);
      expect(row.length).to.equal(3);
      expect(row[0]).to.equal(1);
      expect(row[1]).to.equal(2);
      expect(row[2]).to.equal(3);
    });

    it("应该拒绝超出范围的索引", async function () {
      await multiDimensionalArray.addRow([1, 2, 3]);
      await expect(
        multiDimensionalArray.setDynamic2DElement(1, 0, 100)
      ).to.be.revertedWith("Row out of bounds");
    });
  });

  describe("固定长度二维数组", function () {
    it("应该能够设置和获取元素", async function () {
      await multiDimensionalArray.setFixed2DElement(0, 0, 100);
      const value = await multiDimensionalArray.getFixed2DElement(0, 0);
      expect(value).to.equal(100);
    });

    it("应该能够获取整行", async function () {
      await multiDimensionalArray.setFixed2DElement(0, 0, 10);
      await multiDimensionalArray.setFixed2DElement(0, 1, 20);
      await multiDimensionalArray.setFixed2DElement(0, 2, 30);
      
      const row = await multiDimensionalArray.getFixed2DRow(0);
      expect(row.length).to.equal(3);
      expect(row[0]).to.equal(10);
      expect(row[1]).to.equal(20);
      expect(row[2]).to.equal(30);
    });

    it("应该拒绝超出范围的索引", async function () {
      await expect(
        multiDimensionalArray.setFixed2DElement(5, 0, 100)
      ).to.be.revertedWith("Row out of bounds");
    });
  });

  describe("混合二维数组", function () {
    it("应该能够添加元素到指定行", async function () {
      await multiDimensionalArray.addToMixed2DRow(0, 100);
      await multiDimensionalArray.addToMixed2DRow(0, 200);
      
      const row = await multiDimensionalArray.getMixed2DRow(0);
      expect(row.length).to.equal(2);
      expect(row[0]).to.equal(100);
      expect(row[1]).to.equal(200);
    });
  });

  describe("数组统计", function () {
    it("应该能够计算二维数组总和", async function () {
      await multiDimensionalArray.addRow([1, 2, 3]);
      await multiDimensionalArray.addRow([4, 5, 6]);
      
      const sum = await multiDimensionalArray.sum2DArray();
      expect(sum).to.equal(21); // 1+2+3+4+5+6
    });

    it("应该能够计算行的总和", async function () {
      await multiDimensionalArray.addRow([1, 2, 3]);
      const rowSum = await multiDimensionalArray.sumRow(0);
      expect(rowSum).to.equal(6);
    });

    it("应该能够计算列的总和", async function () {
      await multiDimensionalArray.addRow([1, 2, 3]);
      await multiDimensionalArray.addRow([4, 5, 6]);
      
      const colSum = await multiDimensionalArray.sumColumn(0);
      expect(colSum).to.equal(5); // 1+4
    });
  });
});

