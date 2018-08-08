var TestData = require('../testData.js');
var util = require('../../../utils/util.js');
Page({
  data: {
    arrTestObj: [],//滑动的预加载试题数组
    testCount: 0,  //试题数量
    currentIndex: 0, // 当前所在滑块的 index，即当前试题在数组中的索引
    clientHeight: 0,

    testCardLists: [], //题卡数组
    modalFlag: true, // 题卡弹窗显示隐藏

    loadMore: 0,// 记录滚动条是否进行了下滑加载更多
    startX: 0,
    testGroups: [], // 试题组，将所有试题进行分组
    showGroupIndex: 0, // 当前渲染的试题组索引
    showTestCount: 50 //每一组展示的试题量
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
      this.loadPart(false, 'right');
    } else if (x > 0) { //左滑
      // 标记是否开始渲染上一组试题
      var isShow = currIndex == 0 ? true : false;
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
    //向上滚动
    this.loadPart(false, 'top');
    this.loadCardData();

    setTimeout(function () {
      wx.hideLoading()
    }, 3000)
  },
  //监听滚动到底部: 加载更多题卡和试题
  scrolltolower: function (e) {
    // 标记是否开始渲染下一组试题，最后一组不再渲染
    var isShow = this.data.showGroupIndex >= this.data.testGroups.length - 1 ? true : false;
    if (isShow) {
      return;
    }
    wx.showLoading({
      title: '加载中',
    })

    this.setData({
      loadMore: 0
    })

    //向下滚动 
    this.loadPart(false, 'down');
    this.loadCardData();
    // 因滚动到底部加载更多时，会连带触发scrolltoupper事件，故用loadMore变量控制事件的多次执行
    this.data.loadMore++;

    setTimeout(function () {
      wx.hideLoading()
    }, 3000)
  },
  // 渲染题卡数据
  loadCardData: function (status) {
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
  cardNOClick: function (e) {
    var testNO = e.target.dataset.testno;
    var testIndex = 0;
    // 根据试题编号，确定试题索引
    var count = this.data.arrTestObj.length;
    for (var i = 0; i < count; i++) {
      if (this.data.arrTestObj[i].testNO == testNO) {
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
    wx.redirectTo({
      url: '../../remark/remark?index=' + this.data.currentIndex + '&fromUrl=testRead'
    })
  },
  /**
   * 数据分组（每组100条）
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
      if (test.state == 'uncommited') {
        // 处理未答的试题，将其isRight状态改为3，即这一类试题展示直接标记正确答案
        if (test.testType == 'XTEST' || test.subTestType == 'XTEST') {
          if (test.isRight == -1) {
            test.checkboxValue = test.selectedItems;
            var answers = test.answer.split('');
            for (var j = 0; j < test.checkboxValue.length; j++) {
              for (var z = 0; z < answers.length; z++) {
                if (test.checkboxValue[j].ItemName == answers[z]) {
                  test.checkboxValue[j].isRight = 3;
                }
              }
            }
          }
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
    if (isFirst) {
      showIndex = 0;
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
    var itemIndex = direction == 'left' || direction == 'top' ? that.data.arrTestObj.length - 1 : 0; //滑动索引
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
    wx.showLoading({
      title: '加载中',
    })
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
          // 生成swiper组件的滑动试题数组
          var testCount = that.globalData.testData.getTestCount();
          var groups = that.setGroup(recordTests); //获取试题组
          that.data.testGroups = groups;
          that.setData({
            testGroups: that.data.testGroups,
            testCount: testCount
          })

          // 展示第一组数据
          that.loadPart(true);
        } else {
          wx.showToast({
            title: JSON.stringify(res.data),
            icon: 'none',
            duration: 2000
          })
        }
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      },
      fail: function () {
        wx.hideLoading();
      }
    })
  },
  // 页面加载完成
  onLoad: function (options) {
    this.globalData.testData.loadTestData();
    // 获取从题卡页面传递过来的试题编号，定位跳转到对应的swiper索引
    if (options.index) {
      this.setData({
        currentIndex: Number(options.index)
      })
    }
    this.getTestRecordData();
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