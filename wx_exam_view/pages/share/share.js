// pages/share/share.js
var util = require('../../utils/util.js');
Page({
  formatDate: function (date, fmt) {
    var padLeftZero = function (str) {
      return ('00' + str).substr(str.length);
    }
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    let o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds()
    };
    for (let k in o) {
      if (new RegExp(`(${k})`).test(fmt)) {
        let str = o[k] + '';
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
      }
    }
    return fmt;
  },
  setExamStatus: function () {//设置试题的状态 1：待学习2：开始学习3：学习结束
    var beginTime = this.data.ExamBeginTime;
    var endTime = this.data.ExamEndTime;
    var stat = 1;
    try {
      var res = wx.getSystemInfoSync();
    } catch (e) {
      // Do something when catch error
    } 
    
    if (res.system.indexOf('iOS') > -1) {
      beginTime = beginTime.replace(/-/g, '/');
      endTime = endTime.replace(/-/g, '/');
    }
    var _curTime = new Date().getTime();
    var _beginTime = new Date(beginTime).getTime();
    var _endTime = new Date(endTime).getTime();
    if (_curTime > _beginTime && _curTime < _endTime) {
      stat = 2;
    }
    if (_curTime > _endTime) stat = 3;
    this.setData({
      ExamStatus: stat
    })
  },
  turnToDoTest: function (options) {//跳转做题界面
    var _this = this
    wx.setStorageSync('ExamName', _this.data.ExamName);
    var _temp = function (userData) {//跳转的主体函数
      wx.getUserInfo({//获取用户昵称头像接口
        success: function (res) {
          _this.setTestInfo(res.rawData);
        }
      })
      if (_this.data.PaperData === false || _this.data.ExamStatus === 1) {//当试题状态为1和3，或者没有试题返回列表页
        wx.showToast({
          title: '当前试卷不在练习时间，将为您返回首页',
          icon: 'none',
          duration: 2000
        })
        setTimeout(function () {
          wx.reLaunch({
            url: '../paperList/paperList',
          })
        }, 2000)
        return;
      } else if (_this.data.ExamStatus === 3) {
        wx.navigateTo({
          url: `../test/testRead/testRead`,//跳转做题界面
        })
      } else {

        wx.navigateTo({
          url: `../test/doExam`,//跳转做题界面
        })
      }
    }
    wx.getSetting({
      success: function (res) {
        if (!res.authSetting['scope.userInfo']) {
          // 如果未授权，先获取授权
          wx.authorize({
            scope: 'scope.userInfo',
            success() {
              _temp();
            },
            fail: function () {
              console.log('reject');
            }
          })

        } else {
          _temp();
        }
      }
    })

  },
  getTestCount: function () {//试题总数
    var _testList = this.data.PaperData.testList;
    var _count = 0
    for (var i = 0; i < _testList.length; i++) {
      _count += _testList[i].TestCount * 1
    }
    this.setData({
      TestCount: _count
    })
  },
  getPaperData: function () {//获取试题
    var _this = this
    wx.request({
      url: 'https://xxyapi.tibosi.com/wxApi/paper',
      header: {
        'content-type': 'application/json'
      },
      data: { examID: this.data.ExamId },
      method: 'POST',
      success: function (res) {
        if (res.data.status === 200) {
          var paperJson = res.data.data;
          wx.setStorageSync('paperJson', paperJson);
          _this.setData({
            PaperData: paperJson,
            ExamName: paperJson.examList.ExamName,
            ExamBeginTime: _this.formatDate(new Date(paperJson.examList.BeginTime), "yyyy-MM-dd hh:mm"),
            ExamEndTime: _this.formatDate(new Date(paperJson.examList.EndTime), "yyyy-MM-dd hh:mm")
          });
          wx.setNavigationBarTitle({
            title: paperJson.examList.ExamName
          })
          _this.setExamStatus();
          _this.getTestCount();

        } else if (res.data.status === 201) {
          _this.setData({
            ExamStatus: 0
          })
          wx.showToast({
            title: res.data.data,
            icon: 'none',
            duration: 2000
          })
        }
        wx.hideLoading();
      },
      fail: function () {
        wx.hideLoading();
      }

    })

  },
  setTestInfo: function (options) {//用户访问试题统计
    var userData = options || '';
    var _this = this
    wx.request({
      url: util.baseUrl +'test/setTestInfo',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openId: wx.getStorageSync('OpenId'),
        userData: userData,
        examId: this.data.ExamId,
        examName: this.data.ExamName,
        beginTime: this.data.ExamBeginTime,
        endTime: this.data.ExamEndTime,
        passScore: this.data.PaperData.examList.PassScore,
        totalScore: this.data.PaperData.examList.TotalScore,
        examCount: this.data.TestCount
      },
      method: 'POST',
      success: function (res) {
        if (res.code === 200) {

        } else {

        }
      }

    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    PaperData: false,//试题数据
    src: '../images/paper.png',//图片路径
    ExamName: '',//试题名称
    TestCount: '',//试题数量
    ExamId: 0,
    ExamStauts: 1,//试题状态
    ExamBeginTime: '',//考试开始时间
    ExamEndTime: '',//考试结束时间
    examStatus: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var scene = decodeURIComponent(options.scene);//接收小程序码参数
    console.log('scene:' + scene)
    if (scene !== 'undefined') {//如果有小程序码参数，设置参数为examid
      wx.setStorageSync('ExamId', scene);
    } else if (options.fromUrl === 'list' || options.fromUrl === 'share') {//如果跳转源自列表页或者分享链接，设置参数为examid
      wx.setStorageSync('ExamId', options.examId);
    }
    var _this = this
    _this.setData({
      ExamId: wx.getStorageSync('ExamId')
    })
    wx.showLoading({
      title: '加载中',
      mask: true,
      success: function () {
        _this.getPaperData();
      }
    })
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
  onShareAppMessage: function (res) {
    return {
      title: '【' + this.data.ExamName + '】' + '练习已发来，点击加入！能不能考过就看现在了！',
      path: '/pages/share/share?fromUrl=share&examId=' + wx.getStorageSync('ExamId'),
      imageUrl: '../images/lianxi.png'
    }
  }
})