// pages/remark/remark.js
var util = require('../../utils/util.js');
Page({
  turnToList: function () {//返回列表
    wx.reLaunch({
      url: '../paperList/paperList',
    })
  },
  turnToDoTest: function (options) {//返回做题界面
    var _url = '../test/doExam'
    if (options.currentTarget.id === 'redo') {//重做
      wx.removeStorageSync('arrTestObj');//清除做题记录
      var _this = this
      wx.request({
        url: util.baseUrl + 'test/delTestRecord',
        header: {
          'content-type': 'application/json'
        },
        data: {
          openId: wx.getStorageSync('OpenId'),
          examId: wx.getStorageSync('ExamId')
        },
        method: 'POST',
        success: function (res) {
          if (res.data.code === 200) {
            // console.log(res)
          }
          wx.hideLoading();
        },
        fail: function () {
          wx.hideLoading();
        }
      })
    }
    if (options.currentTarget.id === 'start') {//继续做题
      _url += '?fromType=continue&index=' + this.data.examIdx//返回试题索引
    }
    wx.redirectTo({
      url: _url
    })

  },
  backDoTest:function(){
    wx.redirectTo({
      url: `../test/testRead/testRead`
    })
  },
  getScore: function () {
    var _this = this
    wx.request({
      url: util.baseUrl + 'test/getUserExamInfo',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openId: wx.getStorageSync('OpenId'),
        examId: wx.getStorageSync('ExamId')
      },
      method: 'POST',
      success: function (res) {
        // console.log(res)
        if (res.data.code === 200) {
          var data = res.data.data[0]
          // console.log(data)
          var url = '../../static/bujige.png'
          if (data.UserTotalScore >= _this.data.passScore){
            url = '../../static/tongguo.png'
          }
          _this.setData({
            userScore: data.UserTotalScore || 0,
            passsrc: url,
            totalScore: data.TotalScore,
            AnswerRightCount: data.UserRightNum || 0,
            testCount: data.ExamCount
          })

        }
        wx.hideLoading();
      },
      fail: function () {
        wx.hideLoading();
      }
    })
  },
  analyseTestData: function () {//答题数据解析
    var arrAllTest = wx.getStorageSync('arrTestObj');//获取做题记录
    var num = 0;//答对题数
    var doneNum = 0;//已答题数
    for (var i = 0; i < arrAllTest.length; i++) {
      if (arrAllTest[i].isRight === 0) {//0代表答对
        num++;
      }
      if (arrAllTest[i].state === 'commited') {//commited代表已答
        doneNum++;
      }
    }
    var _accuracy = (Math.round(num * 100) / doneNum).toFixed(2)//计算正确率
    if (_accuracy === 'NaN') { return; }
    this.setData({
      testCount: arrAllTest.length,
      AnswerRightCount: num,
      Accuracy: _accuracy + '%'
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    fromUrl: '',
    testCount: 0,
    AnswerRightCount: 0,//答对题数
    Accuracy: '0%',//正确率
    src: '../images/remark.png',
    passsrc: '../../static/bujige.png',
    totalScore: 0,
    passScore:0,
    userScore: 0,
    examIdx: 0//试题索引
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      examIdx: options.index,
      fromUrl: options.fromUrl,
      totalScore: wx.getStorageSync('paperJson').examList.TotalScore,
      passScore: wx.getStorageSync('paperJson').examList.PassScore
    })
    this.getScore();
    // this.analyseTestData();

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '【' + wx.getStorageSync('ExamName') + '】' + '练习已发来，点击加入！能不能考过就看现在了！',
      path: '/pages/share/share?fromUrl=share&examId=' + wx.getStorageSync('ExamId'),
      imageUrl: '../images/lianxi.png'
    }
  }
})