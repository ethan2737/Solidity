const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HelloWorld", function () {
    it("应该设置和获取消息", async function () {
        const HelloWorld = await ethers.getContractFactory("HelloWorld");
        const helloWorld = await HelloWorld.deploy("Hello, Hardhat!");
        await helloWorld.waitForDeployment();

        expect(await helloWorld.getMessage()).to.equal("Hello, Hardhat!");

        await helloWorld.setMessage("New Message");
        expect(await helloWorld.getMessage()).to.equal("New Message");
    });
});