// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MultiDimensionalArray
 * @notice 演示 Solidity 多维数组的使用
 * @dev 用于学习二维数组、三维数组的操作
 * 
 * 学习要点：
 * 1. 二维数组：uint[][]
 * 2. 固定长度多维数组：uint[3][5]
 * 3. 多维数组的访问和修改
 * 4. 多维数组的遍历
 */
contract MultiDimensionalArray {
    // ═══════════════════════════════════════════════════════════
    // 二维数组
    // ═══════════════════════════════════════════════════════════
    
    // 动态二维数组
    uint[][] public dynamic2DArray;
    
    // 固定长度二维数组
    uint[3][5] public fixed2DArray; // 5 行，每行 3 列
    
    // 混合：固定行，动态列
    uint[][3] public mixed2DArray; // 3 行，每行动态长度
    
    // 地址二维数组
    address[][] public address2DArray;
    
    // ═══════════════════════════════════════════════════════════
    // 三维数组
    // ═══════════════════════════════════════════════════════════
    
    uint[][][] public dynamic3DArray;
    uint[2][3][4] public fixed3DArray; // 4 层，每层 3 行，每行 2 列
    
    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════
    
    event ArrayElementSet(uint256 row, uint256 col, uint256 value);
    event RowAdded(uint256 rowIndex);
    
    // ═══════════════════════════════════════════════════════════
    // 二维数组操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 添加一行到动态二维数组
     * @param _row 行数据
     */
    function addRow(uint256[] memory _row) public {
        dynamic2DArray.push(_row);
        emit RowAdded(dynamic2DArray.length - 1);
    }
    
    /**
     * @notice 设置动态二维数组元素
     * @param _row 行索引
     * @param _col 列索引
     * @param _value 值
     */
    function setDynamic2DElement(uint256 _row, uint256 _col, uint256 _value) public {
        require(_row < dynamic2DArray.length, "Row out of bounds");
        require(_col < dynamic2DArray[_row].length, "Column out of bounds");
        dynamic2DArray[_row][_col] = _value;
        emit ArrayElementSet(_row, _col, _value);
    }
    
    /**
     * @notice 获取动态二维数组元素
     * @param _row 行索引
     * @param _col 列索引
     * @return 值
     */
    function getDynamic2DElement(uint256 _row, uint256 _col) public view returns (uint256) {
        require(_row < dynamic2DArray.length, "Row out of bounds");
        require(_col < dynamic2DArray[_row].length, "Column out of bounds");
        return dynamic2DArray[_row][_col];
    }
    
    /**
     * @notice 获取动态二维数组的行
     * @param _row 行索引
     * @return 行数据
     */
    function getDynamic2DRow(uint256 _row) public view returns (uint256[] memory) {
        require(_row < dynamic2DArray.length, "Row out of bounds");
        return dynamic2DArray[_row];
    }
    
    /**
     * @notice 获取动态二维数组的行数
     * @return 行数
     */
    function getDynamic2DRowCount() public view returns (uint256) {
        return dynamic2DArray.length;
    }
    
    /**
     * @notice 获取动态二维数组的列数（指定行）
     * @param _row 行索引
     * @return 列数
     */
    function getDynamic2DColCount(uint256 _row) public view returns (uint256) {
        require(_row < dynamic2DArray.length, "Row out of bounds");
        return dynamic2DArray[_row].length;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 固定长度二维数组操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置固定二维数组元素
     * @param _row 行索引（0-4）
     * @param _col 列索引（0-2）
     * @param _value 值
     */
    function setFixed2DElement(uint256 _row, uint256 _col, uint256 _value) public {
        require(_row < 5, "Row out of bounds");
        require(_col < 3, "Column out of bounds");
        fixed2DArray[_row][_col] = _value;
        emit ArrayElementSet(_row, _col, _value);
    }
    
    /**
     * @notice 获取固定二维数组元素
     * @param _row 行索引
     * @param _col 列索引
     * @return 值
     */
    function getFixed2DElement(uint256 _row, uint256 _col) public view returns (uint256) {
        require(_row < 5, "Row out of bounds");
        require(_col < 3, "Column out of bounds");
        return fixed2DArray[_row][_col];
    }
    
    /**
     * @notice 获取固定二维数组的行
     * @param _row 行索引
     * @return 行数据
     */
    function getFixed2DRow(uint256 _row) public view returns (uint256[3] memory) {
        require(_row < 5, "Row out of bounds");
        return fixed2DArray[_row];
    }
    
    // ═══════════════════════════════════════════════════════════
    // 混合二维数组操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 添加元素到混合二维数组的指定行
     * @param _row 行索引（0-2）
     * @param _value 值
     */
    function addToMixed2DRow(uint256 _row, uint256 _value) public {
        require(_row < 3, "Row out of bounds");
        mixed2DArray[_row].push(_value);
    }
    
    /**
     * @notice 获取混合二维数组的行
     * @param _row 行索引
     * @return 行数据
     */
    function getMixed2DRow(uint256 _row) public view returns (uint256[] memory) {
        require(_row < 3, "Row out of bounds");
        return mixed2DArray[_row];
    }
    
    // ═══════════════════════════════════════════════════════════
    // 地址二维数组操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 添加地址行
     * @param _addresses 地址数组
     */
    function addAddressRow(address[] memory _addresses) public {
        address2DArray.push(_addresses);
    }
    
    /**
     * @notice 获取地址二维数组
     * @return 地址二维数组
     */
    function getAllAddresses() public view returns (address[][] memory) {
        return address2DArray;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 三维数组操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 添加二维数组到三维数组
     * @param _matrix 二维数组
     */
    function addMatrix(uint256[][] memory _matrix) public {
        dynamic3DArray.push(_matrix);
    }
    
    /**
     * @notice 设置三维数组元素
     * @param _layer 层索引
     * @param _row 行索引
     * @param _col 列索引
     * @param _value 值
     */
    function set3DElement(uint256 _layer, uint256 _row, uint256 _col, uint256 _value) public {
        require(_layer < dynamic3DArray.length, "Layer out of bounds");
        require(_row < dynamic3DArray[_layer].length, "Row out of bounds");
        require(_col < dynamic3DArray[_layer][_row].length, "Column out of bounds");
        dynamic3DArray[_layer][_row][_col] = _value;
    }
    
    /**
     * @notice 获取三维数组元素
     * @param _layer 层索引
     * @param _row 行索引
     * @param _col 列索引
     * @return 值
     */
    function get3DElement(uint256 _layer, uint256 _row, uint256 _col) public view returns (uint256) {
        require(_layer < dynamic3DArray.length, "Layer out of bounds");
        require(_row < dynamic3DArray[_layer].length, "Row out of bounds");
        require(_col < dynamic3DArray[_layer][_row].length, "Column out of bounds");
        return dynamic3DArray[_layer][_row][_col];
    }
    
    /**
     * @notice 设置固定三维数组元素
     * @param _layer 层索引（0-3）
     * @param _row 行索引（0-2）
     * @param _col 列索引（0-1）
     * @param _value 值
     */
    function setFixed3DElement(uint256 _layer, uint256 _row, uint256 _col, uint256 _value) public {
        require(_layer < 4, "Layer out of bounds");
        require(_row < 3, "Row out of bounds");
        require(_col < 2, "Column out of bounds");
        fixed3DArray[_layer][_row][_col] = _value;
    }
    
    /**
     * @notice 获取固定三维数组元素
     * @param _layer 层索引
     * @param _row 行索引
     * @param _col 列索引
     * @return 值
     */
    function getFixed3DElement(uint256 _layer, uint256 _row, uint256 _col) public view returns (uint256) {
        require(_layer < 4, "Layer out of bounds");
        require(_row < 3, "Row out of bounds");
        require(_col < 2, "Column out of bounds");
        return fixed3DArray[_layer][_row][_col];
    }
    
    // ═══════════════════════════════════════════════════════════
    // 数组遍历和统计
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 计算二维数组的总和
     * @return 总和
     */
    function sum2DArray() public view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < dynamic2DArray.length; i++) {
            for (uint256 j = 0; j < dynamic2DArray[i].length; j++) {
                sum += dynamic2DArray[i][j];
            }
        }
        return sum;
    }
    
    /**
     * @notice 计算指定行的总和
     * @param _row 行索引
     * @return 行总和
     */
    function sumRow(uint256 _row) public view returns (uint256) {
        require(_row < dynamic2DArray.length, "Row out of bounds");
        uint256 sum = 0;
        for (uint256 j = 0; j < dynamic2DArray[_row].length; j++) {
            sum += dynamic2DArray[_row][j];
        }
        return sum;
    }
    
    /**
     * @notice 计算指定列的总和（假设所有行长度相同）
     * @param _col 列索引
     * @return 列总和
     */
    function sumColumn(uint256 _col) public view returns (uint256) {
        require(dynamic2DArray.length > 0, "Array is empty");
        uint256 sum = 0;
        for (uint256 i = 0; i < dynamic2DArray.length; i++) {
            if (_col < dynamic2DArray[i].length) {
                sum += dynamic2DArray[i][_col];
            }
        }
        return sum;
    }
}

