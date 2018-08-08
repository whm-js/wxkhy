var util = require('../../utils/util.js');
var TestData = require('testData.js');
Page({
  data: {
    arrTestObj: [],//滑动的预加载试题数组
    testCount: 0,  //试题数量
    userReplay: '',  //用户的答案
    isRight: '', //是否回答正确
    checkboxValue: [], // 多选题选择的项
    inputItemValue: [], //填空题项输入的内容
    textareaValue: '', //简答题项输入的内容
    fromType: '', // 继续答题标记
    currentIndex: 0, // 当前所在滑块的 index，即当前试题在数组中的索引
    swiperIndex: 0, // 第三方变量记录滑块index
    clientHeight: 0,

    testCardLists: [], //题卡数组
    modalFlag: true, // 题卡弹窗显示隐藏

    loadMore: 0,// 记录滚动条是否进行了下滑加载更多
    startX: 0,
    testGroups: [], // 试题组，将所有试题进行分组
    showTestCount: 50, //每一组展示的试题量
    showGroupIndex: 0 // 当前渲染的试题组索引
  },
  // 滑动事件处理
  listenSwiper: function (e) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })

    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          clientHeight: res.windowHeight
        });
      }
    });

    /**
     * tip: 如果在 bindchange 的事件回调函数中使用 setData 改变 current 值，则有可能导致 setData 被不停地调用，因而通常情况下请在改变 current 值前检测 source 字段来判断是否是由于用户触摸引起。
     */
     this.setData({
       swiperIndex: e.detail.current
     })
  },
  touchStart: function (e) {
    this.setData({
      startX: e.changedTouches[0].pageX
    })
  },
  // 当前已渲染的试题组的最后一题滑动时，渲染下一组试题
  touchEnd: function (e) {
    var currIndex = e.currentTarget.dataset.testindex;
    var moveEndX = e.changedTouches[0].pageX;
    var x = moveEndX - this.data.startX;

    /**
     * 分组渲染试题
     */
    if (x < 0) { // 右滑
      // 标记是否开始渲染下一组试题
      var isShow = this.data.arrTestObj.length - 1 == currIndex ? true : false;
      if (!isShow) {
        return;
      }
      this.loadPart(false,'right');
    } else if (x > 0) { //左滑
      // 标记是否开始渲染上一组试题
      var isShow = currIndex==0 ? true : false;
      if (!isShow) {
        return;
      }
      this.loadPart(false, 'left');
    }
  },
  //滚动到顶部: 加载更多题卡和试题
  scrolltoupper: function (e) {
    // 标记是否开始渲染上一组试题，第一组不再渲染
    var isShow = this.data.showGroupIndex;
    if (!isShow || this.data.loadMore == 1) {
      // 将上一次加载更多标记清零
      this.setData({
        loadMore: 0
      })
      return;
    }
    wx.showLoading({
      title: '加载中',
    })

    var that = this;
    setTimeout(function () {
      //向上滚动
      that.loadPart(false, 'top');
      that.loadCardData();
      wx.hideLoading()
    }, 2000)
  },
 //监听滚动到底部: 加载更多题卡和试题
  scrolltolower: function (e) {
    // 标记是否开始渲染下一组试题，最后一组不再渲染
    var isShow = this.data.showGroupIndex >= this.data.testGroups.length-1 ? true : false;
    if (isShow) {
      return;
    }
    wx.showLoading({
      title: '加载中',
    })

    this.setData({
      loadMore: 0
    })
    
    var that = this;
    // 因滚动到底部加载更多时，会连带触发scrolltoupper事件，故用loadMore变量控制事件的多次执行
    that.data.loadMore++;
    
    setTimeout(function () {
      //向下滚动 
      that.loadPart(false, 'down');
      that.loadCardData();
      wx.hideLoading()
    }, 2000)
  },
  // 渲染题卡数据
  loadCardData: function(){
    this.setData({
      testCardLists: []
    });
    var jsonData = this.data.arrTestObj;
    var testcount = jsonData.length;
    for (var i = 0; i < testcount; i++) {
      var styleObj = {
        styleType: '',
        styleName: '',
        cardLists: []
      }
      if (this.data.testCardLists.length == 0) {
        styleObj.styleType = jsonData[i].testType;
        styleObj.styleName = jsonData[i].testStyle
        styleObj.cardLists.push({ testNO: jsonData[i].testNO, isRight: jsonData[i].isRight });
        this.data.testCardLists.push(styleObj);
      } else {
        var count = 0; // 记录当前jsonData[i].testType在arrCardLists数组中出现的次数
        for (var k = 0; k < this.data.testCardLists.length; k++) {
          if (jsonData[i].testType == this.data.testCardLists[k].styleType && jsonData[i].testStyle == this.data.testCardLists[k].styleName) {//已存在题型，则添加题号
            this.data.testCardLists[k].cardLists.push({ testNO: jsonData[i].testNO, isRight: jsonData[i].isRight });
            count++;
          }
        }
        if (count == 0) { //未存在，则新增题型
          styleObj.styleType = jsonData[i].testType;
          styleObj.styleName = jsonData[i].testStyle
          styleObj.cardLists.push({ testNO: jsonData[i].testNO, isRight: jsonData[i].isRight });
          this.data.testCardLists.push(styleObj);
        }
      }
    }
    var that = this;
    setTimeout(function () {
      that.setData({
        testCardLists: that.data.testCardLists
      })
    }, 1)
  },
  // 展示题卡
  showTestCard: function () {
    this.setData({
      modalFlag: false
    });
    this.loadCardData();
  },
  // 题卡号单击事件
  testNOClick: function (e) {
    var testNO = e.target.dataset.testno;
    var testIndex = 0;
    // 根据试题编号，确定试题索引
    var count = this.data.arrTestObj.length;
    for (var i = 0; i < count; i++){
      if (this.data.arrTestObj[i].testNO == testNO){
        testIndex = i;
        break;
      }
    }
    this.setData({
      modalFlag: true,
      currentIndex: testIndex
    });
  },
  // 关闭题卡
  closeModal: function () {
    this.setData({
      modalFlag: true
    });
  },
  // 批阅，显示答题成绩
  showTestScore: function () {
    /*wx.redirectTo({
      url: 'testRead/testRead'
    })
    return;*/
    /**
     * 保存批阅记录
     */
    var openId = wx.getStorageSync('OpenId');
    var examId = wx.getStorageSync('ExamId');
    wx.request({
      url: util.baseUrl + 'test/setUserExamInfo',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openId: openId,
        examId: examId
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status === 201) {
          wx.showToast({
            title: res.data.data,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function () {
      }
    })
    wx.setStorageSync('showGroupIndex', this.data.showGroupIndex)
    wx.redirectTo({
      url: '../remark/remark?fromUrl="doExam"&index=' + this.data.swiperIndex
    })
  },
  // 单选题单击事件
  radioChange: function (e) {
    this.setData({
      currentIndex: this.data.swiperIndex,
      userReplay: e.currentTarget.dataset.selectedvalue
    });
    // 检验答案
    this.checkTestAnswers();
  },
  // 多选题选项选择事件
  checkboxChange: function (e) {
    var userReplay = e.currentTarget.dataset.selectedvalue;
    // 实现点击选项，当前选项处于选中状态
    var curTestIndex = this.data.swiperIndex;
    if (this.data.arrTestObj[curTestIndex].checkboxValue && this.data.arrTestObj[curTestIndex].checkboxValue.length > 0) {
      this.setData({
        checkboxValue: this.data.arrTestObj[curTestIndex].checkboxValue
      });
    } else {
      this.setData({
        checkboxValue: this.data.arrTestObj[curTestIndex].selectedItems
      });
    }

    for (var i = 0; i < this.data.checkboxValue.length; i++) {
      // 已选择，再次选择，取消选中在状态
      if (this.data.checkboxValue[i].checked) {
        if (userReplay == this.data.checkboxValue[i].ItemName) {
          this.data.checkboxValue[i].isRight = -1;
          this.data.checkboxValue[i].checked = false;
        }
      } else {
        if (userReplay == this.data.checkboxValue[i].ItemName) {
          this.data.checkboxValue[i].isRight = this.data.checkboxValue[i].isRight == -1 || this.data.checkboxValue[i].isRight == undefined ? 2 : this.data.checkboxValue[i].isRight;// 再次选择提交答案，保留之前的选项状态
          this.data.checkboxValue[i].checked = true;
        }
      }
    }
    this.data.arrTestObj[curTestIndex].checkboxValue = this.data.checkboxValue;
    this.data.arrTestObj[curTestIndex].state = !this.data.arrTestObj[curTestIndex].state ? 'selected' : this.data.arrTestObj[curTestIndex].state;

    // 局部刷新数据
    this.setData({
      currentIndex: curTestIndex,
      ['arrTestObj[' + curTestIndex + ']']: this.data.arrTestObj[curTestIndex]
    })
  },
  // 多选题提交按钮事件
  checkboxSubmit: function (e) {
    var newValue = [];
    var curTestIndex = this.data.swiperIndex;
    // 针对之前已经选择，再次点击按钮时数据处理
    if (this.data.checkboxValue.length == 0 && this.data.arrTestObj[curTestIndex].checkboxValue.length > 0) {
      this.setData({
        checkboxValue: this.data.arrTestObj[curTestIndex].checkboxValue
      });
    }
    for (var i = 0; i < this.data.checkboxValue.length; i++) {
      if (this.data.checkboxValue[i].isRight == 2 || this.data.checkboxValue[i].isRight == 1 || this.data.checkboxValue[i].isRight == 0) {
        newValue.push(this.data.checkboxValue[i].ItemName);
      }
    }
    newValue = newValue.join().replace(/,/g, '');
    newValue = newValue ? newValue : this.data.userReplay;
    this.setData({
      currentIndex: curTestIndex,
      userReplay: newValue
    });
    // 检验答案
    this.checkTestAnswers();

    // 清空之前的选项值
    this.setData({
      checkboxValue: []
    });
  },
  // 简答题文本域失去焦点事件
  textareaBlur: function (e) {
    // 因失去焦点事件的延迟性，故先在这里对当前试题的用户答案进行赋值
    var curTestIndex = this.data.swiperIndex;
    this.data.arrTestObj[curTestIndex].userReply = e.detail.value;

    // 局部刷新数据
    this.setData({
      currentIndex: curTestIndex,
      ['arrTestObj[' + curTestIndex + ']']: this.data.arrTestObj[curTestIndex],
      textareaValue: e.detail.value
    })
  },
  // 简答题提交按钮事件
  bindFormSubmit: function (e) {
    this.setData({
      currentIndex: this.data.swiperIndex,
      userReplay: this.data.textareaValue
    });
    // 检验答案
    this.checkTestAnswers();
  },
  // 填空题输入项失去焦点事件
  inputItemBlur: function (e) {
    var value = e.detail.value;
    // 已存在，再次编辑，则为修改内容
    var index = this.data.checkboxValue.indexOf(value) //当前选择的项在数组中的索引
    if (index != -1 && !value) {
      this.data.inputItemValue[index] = value;// 修改元素
    } else {
      this.data.inputItemValue.push(value);
    }
    // 因失去焦点事件的延迟性，故先在这里对当前试题的用户答案进行赋值
    var curTestIndex = this.data.swiperIndex;
    this.data.arrTestObj[curTestIndex].userReply = this.data.inputItemValue.join();
    this.data.arrTestObj[curTestIndex].inputItemValue = this.data.inputItemValue;

    // 局部刷新数据
    this.setData({
      currentIndex: curTestIndex,
      ['arrTestObj[' + curTestIndex + ']']: this.data.arrTestObj[curTestIndex]
    })
  },
  // 填空题提交按钮事件
  inputItemSubmit: function (e) {
    var userReplay = this.data.inputItemValue.join();
    this.setData({
      currentIndex: this.data.swiperIndex,
      userReplay: userReplay
    });
    // 检验答案
    this.checkTestAnswers();

    // 清空之前输入的值
    this.setData({
      inputItemValue: []
    });
  },
  /**
   * 检验用户的答案是否正确，并记录用户的操作
   * testIndex 当前试题在试题数组中的索引
   */
  checkTestAnswers: function () {
    var curTestIndex = this.data.currentIndex;
    var curTest = this.globalData.testData.getTest(curTestIndex);
    var answer = curTest.answer;
    var isRight = 1;
    var userScore = 0; // 用户的得分
    // 针对填空题的答案进行特殊处理
    if (curTest.testType == 'TKTEST') {
      var count = 0;
      for (var i = 0; i < answer.length; i++) {
        if (this.data.inputItemValue[i] == answer[i]) {
          count++;
        }
      }
      if (count == answer.length) {
        isRight = 0;
        userScore = curTest.score;
      }
    } else if (curTest.testType == 'XTEST' || curTest.subTestType == 'XTEST') {
      var count_r = 0; // 正确选项数量
      var count_w = 0; // 错误选项数量
      for (var i = 0; i < this.data.checkboxValue.length; i++) {
        if (this.data.checkboxValue[i].isRight == 2 || this.data.checkboxValue[i].isRight == 1 || this.data.checkboxValue[i].isRight == 0) {
          if (answer.indexOf(this.data.checkboxValue[i].ItemName) >= 0) {
            this.data.checkboxValue[i].isRight = 0;
            count_r++;
          } else {
            this.data.checkboxValue[i].isRight = 1;
            count_w++;
          }
        }
      }

      this.data.arrTestObj[curTestIndex].checkboxValue = this.data.checkboxValue;

      if (count_r == answer.length && count_w == 0) {
        isRight = 0;
        userScore = curTest.score;
      }
    } else {
      if (this.data.userReplay == answer) {
        isRight = 0;
        userScore = curTest.score;
      }
    }

    this.data.arrTestObj[curTestIndex].userReply = this.data.userReplay;
    this.data.arrTestObj[curTestIndex].isRight = isRight;
    this.data.arrTestObj[curTestIndex].userScore = userScore;
    this.data.arrTestObj[curTestIndex].state = 'commited';

    // 局部刷新数据
    this.setData({
      ['arrTestObj[' + curTestIndex + ']']: this.data.arrTestObj[curTestIndex]
    })

    /**
     * 保存答题记录
     */
    var openId = wx.getStorageSync('OpenId');
    var examId = wx.getStorageSync('ExamId');
    var testRecord = JSON.stringify(this.data.arrTestObj[curTestIndex]);
    var _this = this
    wx.request({
      url: util.baseUrl + 'test/setTestRecord',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openId: openId,
        examId: examId,
        paperTestId: _this.data.arrTestObj[curTestIndex].allTestID,
        subTestId: _this.data.arrTestObj[curTestIndex].subTestID,
        testRecord: testRecord
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status === 200) {
          var json = res.data.data;
        } else if (res.data.status === 201) {
          wx.showToast({
            title: res.data.data,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function () {
      }
    })
  },
  /**
   * 数据分组（每组showTestCount条）
   */
  setGroup: function (recordTests) {
    var that = this;
    var count = that.globalData.testData.getTestCount();
    var recordCount = recordTests.length;
    var result = [];
    var groupItem;
    for (var i = 0; i < count; i++) {
      if (i % that.data.showTestCount == 0) {
        groupItem != null && result.push(groupItem);
        groupItem = [];
      }
      var test = that.globalData.testData.getTest(i);
      // 将答题记录数据包规整到试题数据包中
      for (var j = 0; j < recordCount; j++) {
        if (test.allTestID == recordTests[j].allTestID && test.subTestID == recordTests[j].subTestID) {
          test = recordTests[j];
          break;
        }
      }
      groupItem.push(test);
    }
    result.push(groupItem);
    return result;
  },
  /**
   * 加载某一批数据
   * isFirst 是否为首次加载
   */
  loadPart: function (isFirst, direction) {
    var that = this;
    var showIndex = 0; //试题数组索引
    if(isFirst){
      showIndex = that.data.fromType == 'continue' ? that.data.showGroupIndex : 0;
    } else {
      showIndex = that.data.showGroupIndex;
      // 先把上一组数据还给试题组testGroups
      that.setData({
        ['testGroups[' + showIndex + ']']: that.data.testGroups[showIndex]
      })

      // 取新的试题组索引
      if (direction == 'right' || direction == 'down') { // 页面右滑/题卡下滑，加载下一组
        showIndex = showIndex + 1;
      } else if (direction == 'left' || direction == 'top') { // 页面左滑/题卡上滑，加载上一组
        showIndex = showIndex - 1;
      }
    }
    that.data.arrTestObj = that.data.testGroups[showIndex];
    var itemIndex = direction == 'left' || direction == 'top' ? that.data.arrTestObj.length-1 : 0; //滑动索引
     //如是继续答题，则用参数中的当前试题索引
    itemIndex = that.data.fromType == 'continue' ? that.data.currentIndex : itemIndex;
    setTimeout(function () {
      that.setData({
        showGroupIndex: showIndex,
        arrTestObj: that.data.arrTestObj,
        currentIndex: itemIndex
      })
    }, 1)
  },
  // 获取试卷答题记录数据包
  getTestRecordData: function () {
    var openId = wx.getStorageSync('OpenId');
    var examId = wx.getStorageSync('ExamId');
    var that = this
    wx.request({
      url: util.baseUrl + 'test/getTestRecord',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openId: openId,
        examId: examId
      },
      method: 'POST',
      success: function (res) {
        if (res.data.code === 200) {
          var recordTests = res.data.data;
          var testCount = that.globalData.testData.getTestCount();
          var groups = that.setGroup(recordTests); //获取试题组
          that.setData({
            testGroups: groups,
            testCount: testCount
          })

          if (that.data.fromType == 'continue') { // 继续答题，从缓存中获取试题数组索引
            var showIndex = wx.getStorageSync('showGroupIndex');
            showIndex = showIndex ? showIndex : 0;
            that.setData({
              showGroupIndex: showIndex
            })
            that.loadPart(true);
          }else{
            // 展示第一组数据
            that.loadPart(true);
          }
        } else {
          wx.showToast({
            title: JSON.stringify(res.data),
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function () {
      }
    })
  },
  // 页面加载完成
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    this.globalData.testData.loadTestData();

    // 获取从题卡页面传递过来的试题编号，定位跳转到对应的swiper索引
    if (options.index) {
      this.setData({
        currentIndex: Number(options.index)
      })
    }
    // 获取继续答题的标记
    if (options.fromType) {
      this.setData({
        fromType: options.fromType
      })
    }

    // 生成swiper组件的滑动试题数组
    this.getTestRecordData();

    setTimeout(function () {
      wx.hideLoading()
    }, 3000)

  },
  // 页面渲染完成
  onReady: function (options) {
    // 显示练习的标题
    wx.setNavigationBarTitle({
      title: this.globalData.testData.getExamTitle()
    })
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          clientHeight: res.windowHeight
        });
      }
    });
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  globalData: {
    testData: new TestData()
  }
})