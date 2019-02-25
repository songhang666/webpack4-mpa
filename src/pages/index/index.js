import '@/assets/js/flexible.js'
import './index.scss'
import '@/assets/css/normalize.css'
import '@/assets/css/swiper-4.3.5.min.css'
import $ from 'zepto'
import Swiper from '@/assets/js/swiper-4.3.5.min.js';
import indexArt from './index.art'
import {P2PWAP, p2pBrowser, unitObj} from "@/assets/js/util.js";
import wx from 'weixin-js-sdk';

$(function () {
    Index.init();
    eruda.init();
});

let Index = {
    init: function () {
        this.commonData = {
            urlPara: unitObj.urlPara.getAll(),
            isAndroid: p2pBrowser.android,
            isWechat: p2pBrowser.wx
        };
        this.playApiData = {};
        this.playApiCode = 0;
        this.pCode = 0;
        this.giftArray = [];
        this.canFetchBind = false;
        this.canCallback = false;
        this.serialRightCnt = 0;
        this.serialWrongCnt = 0;
        this.IOSNoShare();
        this.initData();
        this.showHideRule();
        this.goRiddle();
        this.closeMask();
        this.receivePrize();
        this.handleLink();
        this.handleInput();
        this.handleBind();
    },
    // IOS禁止分享
    IOSNoShare: function () {
        if (!this.commonData.isWechat) P2PWAP.ui.triggerScheme("firstp2p://api?type=rightbtn&title=");
    },
    // 点击开始玩游戏
    goRiddle: function () {
        $('.go-riddle').on('click', function () {
            $("#home").hide();
            $("#play").show();
        });
    },
    // 展示活动规则
    showHideRule: function () {
        $('#ruleBtn').on('click', function () {
            $('#ruleMask').css('display', 'block');
        });
        $('#backBtn').on('click', function () {
            $('#ruleMask').css('display', 'none');
        });
    },
    // 关闭引导分享浮层
    closeMask: function () {
        $(".close-mask").click(function () {
            $("#revivalMask").hide();
            $("#play").show();
        })
    },
    // 下一题
    nextRiddle: function () {
        let me = this;
        $('#nextRiddle').on('click', function () {
            let playData = me.playApiData,
                answerWrongCnt = playData.answerWrongCnt,
                answerRightCnt = playData.answerRightCnt,
                isShared = playData.isShared,
                isBind = playData.isBind,
                currentNumber = $("#nextRiddle").data("number");
            isBind == undefined || isBind == true ? $(".get-prize").show() : $(".bind-phone-wrapper").show();
            $(".personalNumber").text(playData.userInfo && playData.userInfo.mobile_num);
            $("#rightNum").text(playData.answerRightCnt);
            $("#prompt").attr('src', '').removeClass("tipshake");//信仔提示为空
            if (me.playApiCode === 30001) {//活动结束
                me.lanternOnOff(false, playData.answerList, playData.isAnswerRight)
                $(".main-des").text("祝您猪年大吉，财源广进!");
                $(".sub-des").text("猜灯谜活动结束啦");
                $("#play").hide();
                $(".challenge-failure").show()
                $("#result").show();
            } else if (playData.isNoPrize) {//无库存
                me.lanternOnOff(false, playData.answerList, playData.isAnswerRight);
                $(".main-des").text("祝您猪年大吉，财源广进!");
                $(".sub-des").text("新年快乐");
                $("#play").hide();
                $(".challenge-failure").show();
                $("#result").show();
            } else if (me.riddleSwiper.activeIndex + 1 != currentNumber) {
                $("#prompt").attr('src', '../../assets/image/prompt7.png').addClass("tipshake");
            } else if (answerRightCnt < 3 && answerWrongCnt == 2 && !isShared) {// 错误两题走复活
                $("#play").hide();
                $("#revivalMask").show();
                me.canCallback = true;
            } else if ((answerRightCnt == 1 || answerRightCnt == 2) && answerWrongCnt == 2 && isShared) {// (正一或者正二)错二分享过
                riddleSwiper.slideNext();
            } else if (answerRightCnt <= 2 && isShared && (answerWrongCnt == 3 || answerWrongCnt == 2)) {// 错三或错二分享过,结束
                $("#play").hide();
                $(".challenge-failure").show();
                $("#result").show();
                me.lanternOnOff(false, playData.answerList, playData.isAnswerRight)
            } else if ((answerRightCnt <= 4 && answerWrongCnt == 0) || (answerRightCnt <= 3 && answerWrongCnt == 1)) {
                me.riddleSwiper.slideNext();
            } else {//答对3,4,5领奖
                $("#play").hide();
                $("#prizeImg").attr('src', me.giftArray[answerRightCnt - 3]);
                $(".challenge-success").show();
                $("#result").show();
                me.lanternOnOff(false, playData.answerList, playData.isAnswerRight)
            }
        });
    },
    // fetch init数据
    initData: function () {
        let me = this,
            requestPara = this.commonData.urlPara,
            url = "../../assets/json/init.json";
        // url = "/app/init";
        // url = "http://test22.sparow.firstp2plocal.com/app/init?code=88CuHp&from=ncfwx&preview=1&token=preview";
        me.doAjax(url, requestPara, function (res) {
            $("#loadingContainer").hide();
            $("#home").hide();
            zhuge.track('猜灯谜-开始');
            let data = res.data,
                answerRightCnt = data.answerRightCnt,
                answerWrongCnt = data.answerWrongCnt,
                questions = data.question,
                html = indexArt({model: questions}),
                // 是否全部答完
                isCompleted = answerRightCnt + answerWrongCnt >= data.questionTotal,
                isUnReceived = data.times,
                isBind = data.isBind,
                answerListLength = data.answerList && data.answerList.length;
            me.pCode = data.pCode;
            //初始化swiper
            $("#initTemplate").html(html);
            me.swiperConfig();
            //设置当前题号
            answerListLength ? $("#nextRiddle").attr("data-number", answerListLength) : $("#nextRiddle").attr("data-number", 0)
            isBind == undefined || isBind == true ? $(".get-prize").show() : $(".bind-phone-wrapper").show();
            $(".personalNumber").text(data.userInfo && data.userInfo.mobile_num);
            $("#rightNum").text(answerRightCnt);
            $("#answerRightCnt").text(answerRightCnt);
            $("#answerWrongCnt").text(answerWrongCnt);
            if (data.prizeList) me.setGiftArray(data.prizeList);
            if (res.code === 30001) {//活动结束
                me.lanternOnOff(true, data.answerList);
                $(".main-des").text("祝您猪年大吉，财源广进!");
                $(".sub-des").text("猜灯谜活动结束啦");
                $(".challenge-failure").show();
                $("#result").show();
            } else if (res.code === 30008) {//活动未开始
                me.lanternOnOff(true, data.answerList);
                $(".main-des").text("祝您猪年大吉，财源广进!");
                $(".sub-des").text("猜灯谜活动上午10点开始");
                $(".challenge-failure").show();
                $("#result").show();
            } else if (res.code === 10004) {//在非app非微信环境
                P2PWAP.ui.toast("请在网信APP或微信客户端中打开");
            } else if (data.isNoPrize) {//无库存
                me.lanternOnOff(true, data.answerList)
                $(".main-des").text("祝您猪年大吉，财源广进!");
                $(".sub-des").text("新年快乐");
                $(".challenge-failure").show();
                $("#result").show();
            } else if (res.code === 30006) {
                $("#home").show();
                window.location.replace(res.data.authLink);
                // window.location.href = res.data.authLink;
            } else if (answerWrongCnt >= 3) {//错3失败
                me.lanternOnOff(true, data.answerList)
                $(".challenge-failure").show();
                $("#result").show();
            } else if (answerRightCnt < 3 && answerWrongCnt == 2 && !data.isShared) {// 错误两题走复活
                riddleSwiper.slideTo(answerListLength - 1, 50, false);
                $("#revivalMask").show();
                $(".close-mask").hide();
                me.canCallback = true;
            } else if (isCompleted && isUnReceived == 1 && answerRightCnt >= 3) {//答完没领
                $("#prizeImg").attr('src', me.giftArray[answerRightCnt - 3]);
                $(".challenge-success").show();
                me.lanternOnOff(true, data.answerList)
                $("#result").show();
            } else if (isCompleted && isUnReceived == 0 && answerRightCnt >= 3) {//答完领过
                $("#titleDes").text("您已经参加过该活动");
                $("#prizeImg").attr('src', me.giftArray[answerRightCnt - 3]);
                $(".status").text("已");
                $(".challenge-success").show();
                $("#receivePrize").hide();
                me.lanternOnOff(true, data.answerList)
                $("#result").show()
            } else if (answerListLength && answerListLength < 5) {//没答完
                riddleSwiper.slideTo(answerListLength, 50, false);
                $("#play").show();
            } else {
                $("#home").show();
            }
            me.wechatShare(data);
            me.inAppShare(data);
        })
    },
    // 初始化swiper
    swiperConfig: function () {
        let me = this;
        me.riddleSwiper = new Swiper('.swiper-container', {
            direction: 'horizontal',
            loop: false,
            effect: 'slide',
            // noSwiping : true,
            observer: true,
            observeParents: true
        })
        this.chooseAnswer();
        this.nextRiddle();
    },
    // 选择答案
    chooseAnswer: function () {
        let me = this;
        $('.answer-wrapper').on('click', 'li', function () {
            let currentClick = $(this),
                requestPara = $.extend(
                    me.commonData.urlPara,
                    {questionId: currentClick.data("questionid")},
                    {answer: currentClick.data("optionid")}
                ),
                currentRightImg = "../../assets/image/choose-true.png",
                // url = "http://test22.sparow.firstp2plocal.com/app/answer?code=88CuHp&from=ncfwx&preview=1&token=preview";
                url = "../../assets/json/answer.json";
            // url = "/app/answer";
            currentClick.parent().prev().show();// 蒙层禁止瞎鸡点
            me.doAjax(url, requestPara, function (res) {
                let data = res.data,
                    currentNum = $("#nextRiddle").data("number");
                //题号加1
                $("#nextRiddle").attr("data-number", currentNum + 1)
                me.playApiData = data;
                me.pCode = data.pCode;
                me.playApiCode = res.code;
                $("#answerRightCnt").text(data.answerRightCnt);
                $("#answerWrongCnt").text(data.answerWrongCnt);
                if (data.isAnswerRight) {
                    me.serialRightCnt += 1;
                    me.letterBoyTip(true);
                    currentClick.css({
                        "background-image": "url(" + currentRightImg + ")", "color": "#ffffff"
                    });
                } else {
                    me.serialRightCnt = 0;
                    me.serialWrongCnt += 1;
                    me.letterBoyTip(false);
                    currentClick.css({
                        "background-image": "url('../../assets/image/choose_false.png')", "color": "#ffffff"
                    });
                    currentClick.parent().siblings(".question-background").css(
                        "background-image", "url('../../assets/image/lantern_no.png')"
                    );
                    $("li[data-optionid = '" + data.rightIds[0] + "']").css({
                        "background-image": "url('../../assets/image/choose_true.png')", "color": "#ffffff"
                    })
                }

            });
        })
    },
    //result页 灯笼显示规则
    lanternOnOff: function (isInit, answerList, currentAnswer) {
        let lanternArr = [false, false, false, false, false];
        for (let i = 0; i < answerList.length; i++) {
            lanternArr[i] = (answerList[i].isTrue)
        }
        if (!isInit) lanternArr[answerList.length] = currentAnswer;
        let html = template("lanternTemplate", {model: lanternArr});
        $('#lanternWrapper').html(html);
    },
    //组装奖品列表
    setGiftArray: function (prizeList) {
        let giftArray = [];
        Object.keys(prizeList).forEach(function (key) {
            giftArray.push(prizeList[key][0].image);
        });
        this.giftArray = giftArray;
    },
    //非aap环境绑定手机号并且领取奖励
    handleBind: function () {
        let me = this,
            $bindPhone = $("#bindPhone"),
            // bindUrl = "/app/bind";
            bindUrl = "../../assets/json/bind.json";
        $bindPhone.click(function () {
            let phoneNumber = {mobile: $("#phoneNumber").val()},
                fetchBindPara = $.extend(me.commonData.urlPara, phoneNumber);
            if (me.canFetchBind) me.doAjax(bindUrl, fetchBindPara, function (res) {
                $bindPhone.removeAttr("disabled");
                if (!res.code) {
                    me.pCode = res.data.pCode;
                    me.receiveAjax();
                    $(".personalNumber").text(phoneNumber.mobile);
                    $("#tipMessage").show();
                } else {
                    P2PWAP.ui.toast(res.msg);
                }
            }, function () {
                $bindPhone.attr({disabled: "disabled"});
            });
        })
    },
    // 点击领取=>领取奖励
    receivePrize: function () {
        let me = this;
        $("#receivePrize").click(function () {
            me.receiveAjax();
        })
    },
    //领取奖励Ajax
    receiveAjax: function () {
        let me = this,
            fetchPara = $.extend(me.commonData.urlPara, {pCode: me.pCode}),
            playData = me.playApiData,
            $bindPhone = $("#bindPhone"),
            receiveUrl = "json/receive.json";
        // receiveUrl = "/app/play";
        me.doAjax(receiveUrl, fetchPara,
            function (res) {
                let data = res.data;
                if (!data.isSurprise) {//无库存
                    me.lanternOnOff(false, playData.answerList, playData.isAnswerRight);
                    $(".main-des").text("祝您猪年大吉，财源广进!");
                    $(".sub-des").text("新年快乐");
                    $(".challenge-success").hide();
                    $(".challenge-failure").show();
                } else if (res.code === 30001) {//活动结束
                    me.lanternOnOff(false, playData.answerList, playData.isAnswerRight)
                    $(".main-des").text("祝您猪年大吉，财源广进!");
                    $(".sub-des").text("猜灯谜活动结束啦");
                    $(".challenge-success").hide();
                    $(".challenge-failure").show()
                } else if (!res.code && data.isSurprise) {//领取成功
                    zhuge.track('猜灯谜-领取奖品');
                    $("#titleDes").text("奖励领取成功");
                    $(".status").text("已");
                    $(".personalNumber").text(data.userInfo && data.userInfo.mobile_num);
                    $(".bind-phone-wrapper").hide();
                    $("#receivePrize").hide();
                }
            }, function () {
                $bindPhone.attr({disabled: "disabled"});
                $("#receivePrize").attr({disabled: "disabled"});
            }, function () {
                $bindPhone.removeAttr("disabled");
                $("#receivePrize").removeAttr("disabled");
            });
    },
    // 微信分享
    wechatShare: function (data) {
        let me = this;
        wx.config({
            debug: false,
            appId: data.shareAppId,
            timestamp: data.shareTimeStamp,
            nonceStr: data.shareNonceStr,
            signature: data.shareSign,
            jsApiList: [
                'onMenuShareTimeline',
                'onMenuShareAppMessage'
            ]
        });
        wx.ready(function () {
            wx.onMenuShareAppMessage({
                title: data.shareTitle,
                desc: data.shareContent,
                link: data.shareLink,
                imgUrl: data.shareImg,
                success: function () {
                    setTimeout(function () {
                        me.shareCallback()
                    }, 500);
                },
                cancel: function () {
                    setTimeout(function () {
                        me.shareCallback()
                    }, 500);
                }
            });
            wx.onMenuShareTimeline({
                title: data.shareTitle,
                link: data.shareLink,
                imgUrl: data.shareImg,
                success: function () {
                    setTimeout(function () {
                        me.shareCallback()
                    }, 500);
                },
                cancel: function () {
                    setTimeout(function () {
                        me.shareCallback()
                    }, 500);
                }
            });
        });
    },
    // 网信app内微信分享
    inAppShare: function (data) {
        let link = this.commonData.isAndroid ? 'wechat' : 'bonus';
        if (this.commonData.isWechat) {
            $(".share-bar").hide();
        } else {
            $(".wechat-share").hide();
            this.setHref('friend', data, link, 'session', '元宵节');
            this.setHref('time-line', data, link, 'timeline', '元宵节')
        }
    },
    //设置scheme链接
    setHref: function (dom, data, link, type, activityNmme) {
        $("." + dom).attr("href", link + "://api?title=" + encodeURIComponent(data.shareTitle) + "&content=" +
            encodeURIComponent(data.shareContent) + "&face=" + encodeURIComponent(data.shareImg) + "&url=" +
            encodeURIComponent(data.shareLink) + "&type=" + type + "&trackname=" +
            encodeURIComponent(activityNmme));
    },
    //信仔提示文案
    letterBoyTip: function (isRight) {
        let me = this,
            $prompt = $("#prompt"),
            tipRightImgUrl = '../../assets/image/prompt-right' + me.serialRightCnt + '.png',
            tipWrongImgUrl = '../../assets/image/prompt-wrong' + me.serialWrongCnt + '.png';
        isRight ? $prompt.attr('src', tipRightImgUrl).addClass("tipshake") : $prompt.attr('src', tipWrongImgUrl).addClass("tipshake");
    },
    // 微信分享回调sharesuccess
    shareCallback: function () {
        let me = this,
            url = "/app/sharesuccess";
        me.doAjax(url, this.commonData.urlPara, function (res) {
            me.serialWrongCnt = 0;
            me.pCode = res.data && res.data.pCode;
            if (me.canCallback) {
                $("#revivalMask").hide();
                $("#play").show();
                riddleSwiper.slideNext();
                me.canCallback = false;
            }
        });

    },
    // a点击认为是分享成功下一题
    handleLink: function () {
        let me = this;
        $(".friend,.time-line").click(function () {
            me.shareCallback()
        })
    },
    // 监听input的input,blur事件
    handleInput: function () {
        let me = this,
            $phoneNumber = $("#phoneNumber");
        $phoneNumber.on('input', function () {
            if ($(this).val()) {
                $("#bindPhone").addClass("can-bind")
                me.canFetchBind = true;
            } else {
                me.canFetchBind = false;
                $("#bindPhone").removeClass("can-bind");
            }
        });
        // ios键盘弹起时,顶上去影响布局
        $phoneNumber.on('blur', function () {
            window.scroll(0, 0);
            $("#bindPhone").trigger("click");
        });
    },
    doAjax: function (url, data, okCallBack, beforeCallBack, completeCallBack) {
        $.ajax({
            type: 'GET',
            url: url,
            data: data,
            dataType: 'json',
            beforeSend: function () {
                beforeCallBack && beforeCallBack()
            },
            success: function (res) {
                if (res && okCallBack) {
                    okCallBack(res);
                }
            },
            error: function (error) {
                console.log("ajax failed")
            },
            complete: function () {
                completeCallBack && completeCallBack()
            }
        })
    },
};