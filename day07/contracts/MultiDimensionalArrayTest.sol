// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MultiDimensionalArray {
    // 动态二维数组
    uint[][] public dynamic2DArray;

    // 固定长度二维数组
    uint[3][5] public fixed2DArray; // 5行3列：倒着看

    // 混合：固定行，动态列
    uint[][3] public mixed2DArray; // 3行，每行动态列

    // 地址二维数组
    address[][] public address2DArray;

    // 三维数组
    uint[][][] public dynamic3DArray;
    uint[2][3][4] public fixed3DArray; // 4层，每层3行，每行2列

    // 事件
    event ArrayElementSet(uint256 row, uint256 col, uint256 value);
    event RowAdded(uint256 rowIndex);

    // 添加一行到动态二维数组
    function addRow(uint256[] memory _row) public {
        dynamic2DArray.push(_row); // 向末尾添加一行数据
        emit RowAdded(dynamic2DArray.length - 1); // 记录新行的索引
    }

    // 设置动态二维数组元素
    function setDynamic2DElement(uint256 _row, uint256 _col, uint256 _value) public {
        require(_row < dynamic2DArray.length, "Row out of bounds");
        require(_col < dynamic2DArray[_col].length, "Column out of bounds");
        dynamic2DArray[_row][_col] = _value;
        emit ArrayElementSet(_row, _col, _value);
    }

    // 获取动态二维数组元素
    function getDynamic2DElement(uint256 _row, uint256 _col) public view returns (uint256) {
        require(_row < dynamic2DArray.length, "Row out of bounds");
        require(_col < dynamic2DArray[_row].length, "Column out of bounds");
        return dynamic2DArray[_row][_col];
    }

    // 获取动态二维数组的行
    function getDynamic2DRow(uint256 _row) public view returns (uint256[] memory) {
        require(_row < dynamic2DArray.length, "Row out of bounds");
        return dynamic2DArray[_row];
    }

    // 取动态二维数组的行数
    function getDynamic2DRowCount() public view returns (uint256) {
        return dynamic2DArray.length; // 长度即行数
    }

    // 获取动态二维数组的列数（指定行）
    function getDynamic2DColCount(uint256 _row) public view returns (uint256) {
        require(_row < dynamic2DArray.length, "Row out of bounds");
        return dynamic2DArray[_row].length;
    }

    // 设置固定二维数组元素
    function setFixed2DElement(uint256 _row, uint256 _col, uint256 _value) public {
        require(_row < 5, "Row out of bounds");
        require(_col < 3, "Column out of bounds");
        fixed2DArray[_row][_col] = _value;
        emit ArrayElementSet(_row, _col, _value);
    }

    // 获取固定二维数组元素
    function getFixed2DElement(uint256 _row, uint256 _col) public view returns (uint256) {
        require(_row < 5, "Row out of bounds");
        require(_col < 3, "Column out of bounds");
        return fixed2DArray[_row][_col];
    }

    // 获取固定二维数组的行
    function getFixed2DRow(uint256 _row) public view returns (uint256[3] memory) {
        require(_row < 5, "Row out of bounds");
        return fixed2DArray[_row];
    }


    // 添加元素到混合二维数组的指定行
    function addToMixed2DRow(uint256 _row, uint256 _value) public {
        require(_row < 3, "Row out of bounds");
        mixed2DArray[_row].push(_value);
    }

    // 获取混合二维数组的行
    function getMixed2DRow(uint256 _row) public view returns (uint256[] memory) {
        require(_row < 3, "Row out of bounds");
        return mixed2DArray[_row];
    }

    // 设置三维数组元素
    function set3DElement(uint256 _layer, uint256 _row, uint256 _col, uint256 _value) public {
        require(_layer < dynamic3DArray.length, "Layer out of bounds");
        require(_row < dynamic3DArray[_layer].length, "Row out of bounds");
        require(_col < dynamic3DArray[_layer][_row].length, "Column out of bounds");
        // 设置元素的顺序是从左往右的，层-行-列
        dynamic3DArray[_layer][_row][_col] = _value;
    }

    // 获取三维数组元素
    function get3DElement(uint256 _layer, uint256 _row, uint256 _col) public view returns (uint256) {
        require(_layer < dynamic3DArray.length, "Layer out of bounds");
        require(_row < dynamic3DArray[_layer].length, "Row out of bounds");
        require(_col < dynamic3DArray[_layer][_row].length, "Column out of bounds");
        return dynamic3DArray[_layer][_row][_col];
    }

    // 计算二维数组的总和
    function sum2DArray() public view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < dynamic2DArray.length; i++) {
            for (uint256 j = 0; j < dynamic2DArray[i].length; j++) {
                sum += dynamic2DArray[i][j];
            }   
        }
        return sum;
    }

}