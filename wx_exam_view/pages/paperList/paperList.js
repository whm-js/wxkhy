// pages/paperList/paperList.js
var util = require('../../utils/util.js');
Page({
  toShare:function(options){//跳转分享页面
    wx.removeStorageSync('ExamId');
    var exam,idx;
    if (options.currentTarget.id.indexOf('waittest')>-1){
      exam = this.data.WaitTestListData
      idx = options.currentTarget.id.replace('waittest-', '')
    } else if (options.currentTarget.id.indexOf('starttest') > -1){
      exam = this.data.StartTestListData
      idx = options.currentTarget.id.replace('starttest-', '')
    }else{
      exam = this.data.EndTestListData
      idx = options.currentTarget.id.replace('endtest-', '')
    }
    // var idx = options.currentTarget.id.replace('itm-','');//通过元素id获取列表项索引
    var examId = exam[idx].ExamId;
    var status = exam[idx].Status;
    // if (status == 1 || status == 3){
    //   return;
    // }
    wx.navigateTo({
      url: `../share/share?fromUrl=list&examId=${examId}`
    })
  },
  showpage:function(e){
    this.setData({
      pageshow: e.currentTarget.dataset.page
    })
    if (e.currentTarget.dataset.page=='page1'){
      this.getPaperListData()
    }else{
      this.getEndPaperListData()
    }
  },
  bindPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      monthindex: e.detail.value
    })
    this.getEndPaperListData(this.data.monthList[e.detail.value])
  },
  getPaperListData:function(){//获取用户做题历史信息
    var _this = this
    wx.request({
      url: util.baseUrl + 'test/getTestInfo',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openId: wx.getStorageSync('OpenId')
      },
      method: 'POST',
      success: function (res) {
        console.log(res)
        if (res.data.code === 200) {
          var _paperListData = res.data.data
          var noTest=false;
          if (_paperListData.WaitTest.length == 0 && _paperListData.StartTest.length == 0) noTest = true;//没有试题隐藏列表显示提示
          _this.setData({ 
            WaitTestListData: _paperListData.WaitTest,
            StartTestListData: _paperListData.StartTest,
            NoTest: noTest
          })

        }
        wx.hideLoading();
      },
      fail:function(){
        wx.hideLoading();
      }

    })


  },
  getEndPaperListData: function (month='') {//获取用户做题历史信息
    var _this = this
    wx.request({
      url: util.baseUrl + 'test/getEndTestByTime',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openId: wx.getStorageSync('OpenId'),
        month: month
      },
      method: 'POST',
      success: function (res) {
        console.log(res)
        if (res.data.code === 200) {
          var _paperListData = res.data.data
          var noTest = false;
          // if (_paperListData.EndTest.length == 0) {
          //   noTest = true;//没有试题隐藏列表显示提示
          //   return;
          //   }
          _this.setData({
            EndTestListData: _paperListData.EndTest,
            monthList: _paperListData.Months,
            month: _paperListData.Months[0],
            NoTest: noTest
          })
        }
        wx.hideLoading();
      },
      fail: function () {
        wx.hideLoading();
      }

    })


  },
  /**
   * 页面的初始数据
   */
  data: {
    WaitTestListData:[],
    StartTestListData:[],
    // PaperListData:[],//试题数据
    EndTestListData: [],//已结束试题数据
    NoTest: false,//控制提示的显示隐藏
    monthList:[],
    monthindex:0,
    month:'',
    pageshow:'page1'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      

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
    var _this = this
    var _temp = function () {
      wx.showLoading({
        title: '加载中',
        mask: true,
        success: function () {
          _this.getPaperListData();
        }
      })
    }
    if (wx.getStorageSync('OpenId') === '') {//storage中没有openid就去获取
      setTimeout(function () {
        _temp();
      }, 1000)
    } else {
      _temp()
    }
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
      title: '医院给你发来一波练习，不练考不过扣绩效了！',
      path: '/pages/paperList/paperList',
      imageUrl:'../images/xiaochengxu.png'
    }
  }
})