/**功能：一道试题的数据结构
 * 输入参数: 无
 * 返回值：无
 * 创建信息：黎萍（2017-01-12）
 * 修改记录：无
 */
function OneTest() {
  this.testNO = 0;	//试题编号
  this.style = '';	//试题类型
  this.type = '';		//试题所属题型
  this.score = 0;	//每题分数

  /**
   * 以下三个索引用于定位json中的对应数据
   */
  this.styleItemIndex = 0;	// 题型ID,json数据中的StyleID
  this.testItemIndex = 0;	// 大标题ID,json数据中各种题型的ID
  this.subTestItemIndex = -1;	//小题ID,针对A3题型的A3TestItemIndex和B题型的BTestItemIndex; testNO 试题的编号

  /**
   * 下面字段值用于记录用户在做题过程中的答题信息
   */
  this.userReply = ''; //用户的答案
  this.isRight = -1; //是否回答正确:0对，1错，false未答
  this.state = 'uncommited'; //是否答题了
}
/**功能：一道试题显示时的数据结构
 * 输入参数: 无
 * 返回值：无
 * 创建信息：黎萍（2017-01-12）
 * 修改记录：无
 */
function OneTestShow() {
  this.allTestID = 0;	//试题的AllTestID
  this.subTestID = -1;	//小题id（针对A3题型、B题型）
  this.styleID = 0;	//试题类型ID
  this.testNO = 0;	//试题编号
  this.testType = '';	//试题所属题型
  this.subTestType = '';	//小题所属题型
  this.testStyle = '';	//试题类型
  this.styleExplain = '';	//试题类型说明
  this.frontTitle = '';	//共用题干，针对A3Test
  this.title = '';	//试题标题
  this.selectedItems = '';	//试题选项
  this.answer = '';	//试题答案
  this.testPoint = '';	//考试重点
  this.explain = '';	//解题思路
  this.isFav = 0;	//是否收藏
  this.userNote = '';	//用户笔记
  this.score = 0;	//每题分数

  /**
 * 下面字段值用于记录用户在做题过程中的答题信息
 */
  this.userReply = ''; //用户的答案
  this.isRight = -1; //是否回答正确
  this.state = 'uncommited'; //是否答题了
}

function TestData() {

}
var _index = 0; //试题数组索引
var _examTitle = ''; // 练习标题
var _jsonAllTest = {}; //试题json数据
var _arrAllTest = []; //试题数组:数组元素为OneTest结构体：通过TestNO找到StyleItemIndex,TestItemIndex,SubTestItemIndex，然后再定位到_jsonAllTest中的对应数据

TestData.prototype.loadTestData = function () {
  _init();
};
/**
 * 初始化数据
 */
function _init() {
  try {
    var jsonData = wx.getStorageSync('paperJson');
    if (jsonData) {
      _jsonAllTest = jsonData;
      _examTitle = jsonData.examList.ExamName;
      _initArrAllTest();
    }
  } catch (e) {
    wx.showModal({
      title: '提示',
      content: '解析试题信息异常，请退出答题页面重新进入！',
      showCancel: false,
      confirmColor: '#5BB8FF',
      success: function (res) {
        wx.navigateTo({
          url: '../share/share',
        })
      }
    })
  }
}
/**
 * 初始化试题结构体数组
 */
function _initArrAllTest() {
  _arrAllTest = []; // 清空上一次试题解析数组数据
  var index = 0; //数组Numbers的索引
  var styleItems = _jsonAllTest.testList;
  if (styleItems.length === 0) {
    wx.showModal({
      title: '提示',
      content: '解析试题信息异常，请退出答题页面重新进入！',
      showCancel: false,
      confirmColor: '#5BB8FF',
      success: function (res) {
        wx.navigateTo({
          url: '../share/share',
        })
      }
    })
    return;
  }
  for (var i = 0; i < styleItems.length; i++) {
    var testType = styleItems[i].Type; //题型
    var testItems = styleItems[i].TestList;
    for (var j = 0; j < testItems.length; j++) {
      /**
       * 判断试题所属题型，调用对应的读取数据的函数
       * 对结构体的属性进行赋值，同时生成数组的值
       */
      if (testType === 'A3TEST') {
        var a3items = testItems[j].A3TestItem;
        for (var k = 0; k < a3items.length; k++) {
          _arrAllTest[index] = new OneTest();
          _arrAllTest[index].styleItemIndex = i;
          _arrAllTest[index].testItemIndex = j;
          _arrAllTest[index].subTestItemIndex = k;
          _arrAllTest[index].testNO = index + 1;
          _arrAllTest[index].style = styleItems[i].Style;
          _arrAllTest[index].type = testType;
          _arrAllTest[index].score = testItems[j].Score;
          index++;
        }
      } else if (testType === 'BTEST') {
        var bitems = testItems[j].BTestItem;
        for (var k = 0; k < bitems.length; k++) {
          _arrAllTest[index] = new OneTest();
          _arrAllTest[index].styleItemIndex = i;
          _arrAllTest[index].testItemIndex = j;
          _arrAllTest[index].subTestItemIndex = k;
          _arrAllTest[index].testNO = index + 1;
          _arrAllTest[index].style = styleItems[i].Style;
          _arrAllTest[index].type = testType;
          _arrAllTest[index].score = testItems[j].Score;
          index++;
        }
      } else if (testType === 'ATEST' || testType === 'JDTEST' || testType === 'PDTEST' || testType === 'TKTEST' || testType === 'XTEST') {
        _arrAllTest[index] = new OneTest();
        _arrAllTest[index].styleItemIndex = i;
        _arrAllTest[index].testItemIndex = j;
        _arrAllTest[index].testNO = index + 1;
        _arrAllTest[index].style = styleItems[i].Style;
        _arrAllTest[index].type = testType;
        _arrAllTest[index].score = testItems[j].Score;
        index++;
      } else {
        wx.showModal({
          title: '提示',
          content: '解析试题信息异常，请退出答题页面重新进入！',
          showCancel: false,
          confirmColor: '#5BB8FF',
          success: function (res) {
            wx.navigateTo({
              url: '../share/share',
            })
          }
        })
      }
    } //end for testItems
  } //end for styleItem	
}
/**
 * 功能：获取Atest型题试题信息
* 输入参数:curTest 当前试题数组
* 返回值：Atest型题单题试题对象
* 创建信息：黎萍（2017-01-12）
*/
function _getAtest(curTest) {
  var oneTestShow = new OneTestShow();
  var styleItemIndex = curTest.styleItemIndex; //题型ID,json数据中的StyleID
  var testItemIndex = curTest.testItemIndex; //大标题ID,json数据中题型的ATestID
  oneTestShow.testNO = curTest.testNO;
  var styleItems = _jsonAllTest.testList;
  var testItems = styleItems[styleItemIndex].TestList;

  oneTestShow.score = testItems[testItemIndex].Score;	//分数
  oneTestShow.testType = styleItems[styleItemIndex].Type; //题型
  oneTestShow.testStyle = styleItems[styleItemIndex].Style; //题型
  oneTestShow.styleID = testItems[testItemIndex].StyleID;
  oneTestShow.allTestID = testItems[testItemIndex].PaperTestID;
  oneTestShow.title = _imageUrlReplace(testItems[testItemIndex].Title); //标题
  var explain = testItems[testItemIndex].Explain; //解题思路
  explain = explain === null ? '无' : explain.trim();
  oneTestShow.explain = explain === '' ? '无' : _imageUrlReplace(explain); //没有解析，设置默认值
  var testPoint = testItems[testItemIndex].TestPoint.trim(); //考试重点
  testPoint = testPoint === null ? '无' : testPoint.trim();
  oneTestShow.testPoint = testPoint === '' ? '无' : testPoint; //没有解析，设置默认值
  oneTestShow.answer = testItems[testItemIndex].Answer; //答案
  var selectedItems = [];
  for (var i = 0; i < testItems[testItemIndex].SelectedItem.length; i++) {
    selectedItems.push({
      ItemName: String.fromCharCode(65 + i),
      Content: _imageUrlReplace(testItems[testItemIndex].SelectedItem[i])
    });
  }
  oneTestShow.selectedItems = selectedItems; //选项
  return oneTestShow;
}
/**
 * 功能：获取A3test型题试题信息
* 输入参数:curTest 当前试题数组
* 返回值：A3test型题单题试题对象
* 创建信息：黎萍（2017-01-12）
*/
function _getA3test(curTest) {
  var oneTestShow = new OneTestShow();
  var styleItemIndex = curTest.styleItemIndex; //题型ID,json数据中的StyleID
  var testItemIndex = curTest.testItemIndex; //大标题ID,json数据中题型的A3TestID
  var subTestItemIndex = curTest.subTestItemIndex; //小题ID,针对A3题型的A3TestItemIndex
  oneTestShow.testNO = curTest.testNO;
  var styleItems = _jsonAllTest.testList;
  var testItems = styleItems[styleItemIndex].TestList;
  var A3TestItems = testItems[testItemIndex].A3TestItem;

  oneTestShow.score = testItems[testItemIndex].Score;	//分数
  oneTestShow.testType = styleItems[styleItemIndex].Type; //题型
  oneTestShow.subTestType = A3TestItems[subTestItemIndex].TestType; //选项类型，值有：空，单项，多项，不定项
  oneTestShow.testStyle = styleItems[styleItemIndex].Style; //题型
  oneTestShow.styleID = testItems[testItemIndex].StyleID;
  oneTestShow.allTestID = testItems[testItemIndex].PaperTestID;
  oneTestShow.frontTitle = _imageUrlReplace(testItems[testItemIndex].MainTitle); //共用主标题
  oneTestShow.subTestID = A3TestItems[subTestItemIndex].ID;
  oneTestShow.answer = A3TestItems[subTestItemIndex].Answer[0]; //答案
  oneTestShow.title = _imageUrlReplace(A3TestItems[subTestItemIndex].Title); //小标题
  var explain = A3TestItems[subTestItemIndex].Explain; //解题思路
  explain = explain === null ? '无' : explain.trim();
  if (!explain.trim()) {
    explain = testItems[testItemIndex].Explain.trim();
  }
  oneTestShow.explain = explain === '' ? '无' : _imageUrlReplace(explain); //没有解析，设置默认值
  var testPoint = A3TestItems[subTestItemIndex].TestPoint; //考试重点
  testPoint = testPoint === null ? '无' : testPoint.trim();
  if (!testPoint.trim()) {
    testPoint = testItems[testItemIndex].TestPoint.trim();
  }
  oneTestShow.testPoint = testPoint === '' ? '无' : testPoint; //没有解析，设置默认值
  var selectedItems = [];
  for (var i = 0; i < A3TestItems[subTestItemIndex].SelectedItem.length; i++) {
    selectedItems.push({
      ItemName: String.fromCharCode(65 + i),
      Content: _imageUrlReplace(A3TestItems[subTestItemIndex].SelectedItem[i])
    });
  }
  oneTestShow.selectedItems = selectedItems; //选项
  return oneTestShow;
}
/**
 * 功能：获取Btest型题试题信息
* 输入参数:curTest 当前试题数组
* 返回值：Btest型题单题试题对象
* 创建信息：黎萍（2017-01-12）
*/
function _getBtest(curTest) {
  var oneTestShow = new OneTestShow();
  var styleItemIndex = curTest.styleItemIndex; //题型ID,json数据中的StyleID
  var testItemIndex = curTest.testItemIndex; //大标题ID,json数据中题型的BTestID
  var subTestItemIndex = curTest.subTestItemIndex; //小题ID,针对B题型的BTestItemIndex
  oneTestShow.testNO = curTest.testNO;
  var styleItems = _jsonAllTest.testList;
  var testItems = styleItems[styleItemIndex].TestList;
  var BTestItems = testItems[testItemIndex].BTestItem;

  oneTestShow.score = testItems[testItemIndex].Score;	//分数
  oneTestShow.testType = styleItems[styleItemIndex].Type; //题型
  oneTestShow.subTestType = BTestItems[subTestItemIndex].TestType; //选项类型，值有：空，单项，多项，不定项
  oneTestShow.testStyle = styleItems[styleItemIndex].Style; //题型定项
  oneTestShow.styleID = testItems[testItemIndex].StyleID;
  oneTestShow.allTestID = testItems[testItemIndex].PaperTestID;
  var selectedItems = [];
  for (var i = 0; i < testItems[testItemIndex].SelectedItem.length; i++) {
    selectedItems.push({
      ItemName: String.fromCharCode(65 + i),
      Content: _imageUrlReplace(testItems[testItemIndex].SelectedItem[i])
    });
  }
  oneTestShow.selectedItems = selectedItems; //共用选项
  oneTestShow.subTestID = BTestItems[subTestItemIndex].ID;
  oneTestShow.answer = BTestItems[subTestItemIndex].Answer; //答案
  oneTestShow.answer = oneTestShow.answer.substring(1, oneTestShow.answer.length-1);
  oneTestShow.title = _imageUrlReplace(BTestItems[subTestItemIndex].Title); //小标题
  var explain = BTestItems[subTestItemIndex].Explain; //解题思路
  explain = explain === null ? '无' : explain.trim();
  if (!explain.trim()) {
    explain = testItems[testItemIndex].Explain.trim();
  }
  oneTestShow.explain = explain === '' ? '无' : _imageUrlReplace(explain); //没有解析，设置默认值
  var testPoint = BTestItems[subTestItemIndex].TestPoint; //考试重点
  testPoint = testPoint === null ? '无' : testPoint.trim();
  if (!testPoint.trim()) {
    testPoint = testItems[testItemIndex].TestPoint.trim();
  }
  oneTestShow.testPoint = testPoint === '' ? '无' : testPoint; //没有解析，设置默认值
  return oneTestShow;
}
/**
 * 功能：获取JDtest型题试题信息
* 输入参数:curTest 当前试题数组
* 返回值：JDtest型题单题试题对象
* 创建信息：黎萍（2017-01-12）
*/
function _getJDtest(curTest) {
  var oneTestShow = new OneTestShow();
  var styleItemIndex = curTest.styleItemIndex; //题型ID,json数据中的StyleID
  var testItemIndex = curTest.testItemIndex; //大标题ID,json数据中题型的JDTestID
  oneTestShow.testNO = curTest.testNO;
  var styleItems = _jsonAllTest.testList;
  var testItems = styleItems[styleItemIndex].TestList;

  oneTestShow.score = testItems[testItemIndex].Score;	//分数
  oneTestShow.testType = styleItems[styleItemIndex].Type; //题型
  oneTestShow.testStyle = styleItems[styleItemIndex].Style; //题型
  oneTestShow.styleID = testItems[testItemIndex].StyleID;
  oneTestShow.allTestID = testItems[testItemIndex].PaperTestID;
  oneTestShow.title = _imageUrlReplace(testItems[testItemIndex].Title); //标题
  var explain = testItems[testItemIndex].Explain; //解题思路
  explain = explain === null ? '无' : explain.trim();
  oneTestShow.explain = explain === '' ? '无' : _imageUrlReplace(explain); //没有解析，设置默认值
  var testPoint = testItems[testItemIndex].TestPoint; //考试重点
  testPoint = testPoint === null ? '无' : testPoint.trim();
  oneTestShow.testPoint = testPoint === '' ? '无' : testPoint; //没有解析，设置默认值
  oneTestShow.answer = _imageUrlReplace(testItems[testItemIndex].Answer); //答案
  return oneTestShow;
}
/**
 * 功能：获取PDtest型题试题信息
* 输入参数:curTest 当前试题数组
* 返回值：PDtest型题单题试题对象
* 创建信息：黎萍（2017-01-12）
*/
function _getPDtest(curTest) {
  var oneTestShow = new OneTestShow();
  var styleItemIndex = curTest.styleItemIndex; //题型ID,json数据中的StyleID
  var testItemIndex = curTest.testItemIndex; //大标题ID,json数据中题型的PDTestID
  oneTestShow.testNO = curTest.testNO;
  var styleItems = _jsonAllTest.testList;
  var testItems = styleItems[styleItemIndex].TestList;

  oneTestShow.score = testItems[testItemIndex].Score;	//分数
  oneTestShow.testType = styleItems[styleItemIndex].Type; //题型
  oneTestShow.testStyle = styleItems[styleItemIndex].Style; //题型
  oneTestShow.styleID = testItems[testItemIndex].StyleID;
  oneTestShow.allTestID = testItems[testItemIndex].PaperTestID;
  oneTestShow.title = _imageUrlReplace(testItems[testItemIndex].Title); //标题
  var explain = testItems[testItemIndex].Explain; //解题思路
  explain = explain === null ? '无' : explain.trim();
  oneTestShow.explain = explain === '' ? '无' : _imageUrlReplace(explain); //没有解析，设置默认值
  var testPoint = testItems[testItemIndex].TestPoint; //考试重点
  testPoint = testPoint === null ? '无' : testPoint.trim();
  oneTestShow.testPoint = testPoint === '' ? '无' : testPoint; //没有解析，设置默认值
  oneTestShow.selectedItems = [{ Content: "对", ItemName: "A" }, { Content: "错", ItemName: "B" }];
  if (oneTestShow.selectedItems[0].Content == testItems[testItemIndex].Answer) {
    oneTestShow.answer = oneTestShow.selectedItems[0].ItemName; //答案
  } else if (oneTestShow.selectedItems[1].Content == testItems[testItemIndex].Answer) {
    oneTestShow.answer = oneTestShow.selectedItems[1].ItemName; //答案
  }
  return oneTestShow;
}
/**
 * 功能：获取TKtest型题试题信息
* 输入参数:curTest 当前试题数组
* 返回值：TKtest型题单题试题对象
* 创建信息：黎萍（2017-01-12）
*/
function _getTKtest(curTest) {
  var oneTestShow = new OneTestShow();
  var styleItemIndex = curTest.styleItemIndex; //题型ID,json数据中的StyleID
  var testItemIndex = curTest.testItemIndex; //大标题ID,json数据中题型的TKTestID
  oneTestShow.testNO = curTest.testNO;
  var styleItems = _jsonAllTest.testList;
  var testItems = styleItems[styleItemIndex].TestList;

  oneTestShow.score = testItems[testItemIndex].Score;	//分数
  oneTestShow.testType = styleItems[styleItemIndex].Type; //题型
  oneTestShow.testStyle = styleItems[styleItemIndex].Style; //题型
  oneTestShow.styleID = testItems[testItemIndex].StyleID;
  oneTestShow.allTestID = testItems[testItemIndex].PaperTestID;
  oneTestShow.title = _imageUrlReplace(testItems[testItemIndex].Title); //标题
  var explain = testItems[testItemIndex].Explain; //解题思路
  explain = explain === null ? '无' : explain.trim();
  oneTestShow.explain = explain === '' ? '无' : _imageUrlReplace(explain); //没有解析，设置默认值
  var testPoint = testItems[testItemIndex].TestPoint; //考试重点
  testPoint = testPoint === null ? '无' : testPoint.trim();
  oneTestShow.testPoint = testPoint === '' ? '无' : testPoint; //没有解析，设置默认值
  oneTestShow.answer = _imageUrlReplace(testItems[testItemIndex].Answer);
  oneTestShow.answerCount = testItems[testItemIndex].answerCount; // 填空题的答案数量，即输入框数量
  return oneTestShow;
}
/**
 * 功能：获取Xtest型题试题信息
* 输入参数:curTest 当前试题数组
* 返回值：Xtest型题单题试题对象
* 创建信息：黎萍（2017-01-12）
*/
function _getXtest(curTest) {
  var oneTestShow = new OneTestShow();
  var styleItemIndex = curTest.styleItemIndex; //题型ID,json数据中的StyleID
  var testItemIndex = curTest.testItemIndex; //大标题ID,json数据中题型的XTestID
  oneTestShow.testNO = curTest.testNO;
  var styleItems = _jsonAllTest.testList;
  var testItems = styleItems[styleItemIndex].TestList;

  oneTestShow.score = testItems[testItemIndex].Score;	//分数
  oneTestShow.testType = styleItems[styleItemIndex].Type; //题型
  oneTestShow.testStyle = styleItems[styleItemIndex].Style; //题型
  oneTestShow.styleID = testItems[testItemIndex].StyleID;
  oneTestShow.allTestID = testItems[testItemIndex].PaperTestID;
  oneTestShow.title = _imageUrlReplace(testItems[testItemIndex].Title); //标题
  var explain = testItems[testItemIndex].Explain; //解题思路
  explain = explain === null ? '无' : explain.trim();
  oneTestShow.explain = explain === '' ? '无' : _imageUrlReplace(explain); //没有解析，设置默认值
  var testPoint = testItems[testItemIndex].TestPoint; //考试重点
  testPoint = testPoint === null ? '无' : testPoint.trim();
  oneTestShow.testPoint = testPoint === '' ? '无' : testPoint; //没有解析，设置默认值
  oneTestShow.answer = _imageUrlReplace(testItems[testItemIndex].Answer); //答案
  var selectedItems = [];
  for (var i = 0; i < testItems[testItemIndex].SelectedItem.length; i++) {
    selectedItems.push({
      ItemName: String.fromCharCode(65 + i),
      Content: _imageUrlReplace(testItems[testItemIndex].SelectedItem[i])
    });
  }
  oneTestShow.selectedItems = selectedItems; //选项
  return oneTestShow;
}
/*题目图片*/
function _imageUrlReplace(string) {
  if (string != undefined) {
    if (string != "") {
      var a = String.fromCharCode(34);
      if (string instanceof Array) {
        string = string.join("");//字符串数组转为字符串
      }
      var result = '';
      if (string.length > 6) {//主要是排除 A3 B  题 的选项 [B]  ["B"] 
        var head = '<img style="max-width:100%;height:auto;vertical-align:middle;" src="http://t.api.ksbao.com/tk_img/';
        var foot = '"/>';
        result = string.replace(/\[([^\]]*)\]/g, function (word) {
          word = word.replace(/~/, '%7E').replace(/\+/, '%2B');//2017-11-2去除波浪号和‘+’号
          var len = word.length;
          return head + word.substring(1, len - 1) + foot;
        });
        return result;
      }
      return string;
    }
  } else {
    return "";
  }
}

/**
 * 根据索引获取试题
 * 输入参数:试题索引
 * 返回值：当前索引试题
 * 创建信息：黎萍（2017-01-12）
 */
TestData.prototype.getTest = function (index) {
  var curTest = _arrAllTest[index];
  if (_arrAllTest.length==0) {
    wx.showModal({
      title: '提示',
      content: '解析试题信息异常，请退出答题页面重新进入！',
      showCancel: false,
      confirmColor: '#5BB8FF',
      success: function (res) {
        wx.navigateTo({
          url: '../share/share',
        })
      }
    })
    return;
  }
  var testType = _jsonAllTest.testList[curTest.styleItemIndex].Type; //根据试题编号获取试题所属题型
  var curTestShow = {};

  switch (testType) {
    case 'ATEST':
      curTestShow = _getAtest(curTest);
      break;
    case 'A3TEST':
      curTestShow = _getA3test(curTest);
      break;
    case 'BTEST':
      curTestShow = _getBtest(curTest);
      break;
    case 'JDTEST':
      curTestShow = _getJDtest(curTest);
      break;
    case 'PDTEST':
      curTestShow = _getPDtest(curTest);
      break;
    case 'TKTEST':
      curTestShow = _getTKtest(curTest);
      break;
    case 'XTEST':
      curTestShow = _getXtest(curTest);
      break;
    default:
    //G_Prg.throw('程序运行错误，TestData.getTest：testType = "' + testType + '",无法解析数据');
  }
  return curTestShow;
};
/**
 * 获取当前试题
 * 输入参数:无
 * 返回值： 当前试题
 * 创建信息：黎萍（2017-01-12）
 */
TestData.prototype.getCurTest = function () {
  return this.getTest(_index);
};
/**
 * 获取试题结构体数组
 * 输入参数:无
 * 返回值： 试题结构体数组
 * 创建信息：黎萍（2017-01-12）
 */
TestData.prototype.getArrAllTest = function () {
  return _arrAllTest;
};
/**
 * 功能：获取试题
 * 输入参数:无
 * 返回值： 试题数据
 * 创建信息：黎萍（2017-01-12）
 */
TestData.prototype.getAllJsonTest = function () {
  return _jsonAllTest;
};
/**
 * 功能：获取练习的标题
 * 输入参数:无
 * 返回值： 试题数据
 * 创建信息：黎萍（2018-05-10）
 */
TestData.prototype.getExamTitle = function () {
  return _examTitle;
}; 
/**
 * 功能：获取试题编号
 * 输入参数:无
 * 返回值： 试题编号
 * 创建信息：黎萍（2017-01-12）
 */
TestData.prototype.getCurIndex = function () {
  return _index;
};

TestData.prototype.setCurIndex = function (index) {
  return _index = index;
};
/**
 * 功能：获取试题数量
 * 输入参数:无
 * 返回值： 试题数量
 * 创建信息：黎萍（2017-01-12）
 */
TestData.prototype.getTestCount = function () {
  if (!_arrAllTest.length) {
    //G_Prg.throw('试题数组为空，请联系客服QQ:4007278800！');
  }
  return _arrAllTest.length; //试题数量
};
/**
 * 功能：移动到上一题
 * 输入参数:无
 * 返回值： 成功返回true，如果已经是第一题则返回false，操作页面对返回值进行判断，进行提示“已经是第一题”
 * 创建信息：黎萍（2017-01-12）
 */
TestData.prototype.movePre = function () {
  if (_index <= 0) {
    return false;
  } else {
    _index--;
    return true;
  }
};
/**
 * 功能： 移动到下一题
 * 输入参数:无
 * 返回值：成功返回true，如果已经是第一题则返回false，操作页面对返回值进行判断，进行提示"已经是最后一题"
 * 创建信息：黎萍（2017-01-12）
 */
TestData.prototype.moveNext = function () {
  if (_index >= (_arrAllTest.length - 1)) {
    return false;
  } else {
    _index++;
    return true;
  }
};
/**
 * 功能： 移动到指定的答题卡上题号
 * 输入参数:index 试题数组索引
 * 返回值：成功返回true，如果已经是第一题则返回false
 * 创建信息：黎萍（2017-01-12）
 */
TestData.prototype.move = function (index) {
  if ((index < 0) || (index >= _arrAllTest.length)) {
    return false;
  } else {
    _index = index;
    return true;
  }
};
/**
 * 获取用户答案是否正确
 * 输入参数：当前试题索引
 * 返回值：当前试题是否正确
 * 创建信息：黎萍（2017-01-12）
 */
TestData.prototype.getIsRight = function (index) {
  var isRight = '';
  if (_arrAllTest[index]) {
    isRight = _arrAllTest[index].isRight;
  }
  return isRight;
  //return _arrAllTest[index].isRight;
};
/**
 * 设置用户答案是否正确
 * 输入参数：答案是否正确
 * 返回值：无
 * 创建信息：黎萍（2017-01-12）
 */
TestData.prototype.setIsRight = function (isRight) {
  _arrAllTest[_index].isRight = isRight;
};
/**
 * 获取用户的答案
 * 输入参数：当前试题索引
 * 返回值：用户的答案
 * 创建信息：黎萍（2017-01-12）
 */
TestData.prototype.getUserReply = function (index) {
  var userReply = '';
  if (_arrAllTest[index]) {
    userReply = _arrAllTest[index].userReply;
  }
  return userReply;
};
/**
 * 功能：设置用户的答案
 * 输入参数：用户的答案
 * 返回值：无
 * 创建信息：黎萍（2017-01-12）
 */
TestData.prototype.setUserReply = function (userReply) {
  _arrAllTest[_index].userReply = userReply;
};
/**
 * 功能：设置是否显示试题的答案解析
 * 输入参数：是否显示，true\false
 * 返回值：无
 * 创建信息：黎萍（2018-5-10）
 */
TestData.prototype.setState = function (state) {
  _arrAllTest[_index].state = state;
};

module.exports = TestData;
