let P2PWAP = {};
P2PWAP.ui = {};
P2PWAP.ui.showErrorInstance_ = null;
P2PWAP.ui.showErrorInstanceTimer_ = null;
P2PWAP.ui.showErrorTip = function (msg) {
    if (P2PWAP.ui.showErrorInstance_) {
        clearTimeout(P2PWAP.ui.showErrorInstanceTimer_);
        P2PWAP.ui.showErrorInstance_.updateContent(msg);
    } else {
        P2PWAP.ui.showErrorInstance_ = new P2PWAP.ui.ErrorToaster_(msg);
        P2PWAP.ui.showErrorInstance_.show();
    }
    P2PWAP.ui.showErrorInstanceTimer_ = setTimeout(function () {
        P2PWAP.ui.showErrorInstance_.dispose();
        P2PWAP.ui.showErrorInstance_ = null;
        P2PWAP.ui.showErrorInstanceTimer_ = null;
    }, 2000);
};
P2PWAP.ui.toast = P2PWAP.ui.showErrorTip;

P2PWAP.ui.ErrorToaster_ = function (msgHtml) {
    this.ele = null;
    this.msgHtml = msgHtml;
};

P2PWAP.ui.ErrorToaster_.prototype.createDom = function () {
    this.ele = document.createElement("div");
    this.ele.innerHTML = "<span style=\"display: inline-block;color:white;max-width:250px;min-width:100px;word-break:break-word;padding:10px;background:rgba(0,0,0,0.7);border-radius:5px;\">" + this.msgHtml + "</span>";
    this.ele.setAttribute("style", "z-index:1002;position:fixed;width:100%;text-align:center;top:50%;-webkit-transition:opacity linear 0.5s;opacity:0;");
    document.body.appendChild(this.ele);
};

P2PWAP.ui.ErrorToaster_.prototype.updateContent = function (msgHtml) {
    this.msgHtml = msgHtml;
    if (!this.ele) return;
    $(this.ele).find("span").html(this.msgHtml);
};

P2PWAP.ui.ErrorToaster_.prototype.show = function () {
    if (!this.ele) {
        this.createDom();
    }
    let pThis = this;
    setTimeout(function () {
        if (!pThis.ele) return;
        pThis.ele.style.opacity = "1";
    }, 1);
};

P2PWAP.ui.ErrorToaster_.prototype.hide = function () {
    if (!this.ele) return;
    this.ele.style.opacity = "0";
    let ele = this.ele;
    delete this.ele;
    setTimeout(function () {
        document.body.removeChild(ele);
    }, 500);
};

P2PWAP.ui.ErrorToaster_.prototype.dispose = function () {
    this.hide();
};

P2PWAP.ui.popup = function (content, title, isConfirmBtn, isCancelBtn, confirmBtnTxt, cancelBtnTxt, confirmCallback, cancelCallback, popupClass) {
    let div = document.createElement("div");
    let html = ""
    html += '<div class="ui_mask_box ' + popupClass + '">';
    html += '<div class="ui_popup">';
    if (title) {
        html += '<div class="title">' + title + '</div>';
    }
    html += '<div class="content">' + content + '</div>';
    html += '<div class="btn_box">';
    if (isConfirmBtn) {
        html += '<div class="confirm_btn">' + confirmBtnTxt + '</div>';
    }
    if (isCancelBtn) {
        html += '<div class="cancel_btn">' + cancelBtnTxt + '</div>';
    }
    html += '</div>';
    html += '</div>';
    html += '</div>';
    div.innerHTML = html;
    document.body.appendChild(div);
    $(".confirm_btn").click(function () {
        if (confirmCallback) {
            confirmCallback.call(null, "", $(".ui_mask_box").hide())
        } else {
            $(".ui_mask_box").hide();
        }
    })
    $(".cancel_btn").click(function () {
        if (cancelCallback) {
            cancelCallback.call(null, "", $(".ui_mask_box").hide())
        } else {
            $(".ui_mask_box").hide();
        }
    })
}

P2PWAP.ui.triggerScheme = function (scheme) {
    let iframe = document.createElement("iframe");
    iframe.src = scheme;
    iframe.style.display = "none";
    document.body.appendChild(iframe);
};

let p2pBrowser = (function () {
    let u = navigator.userAgent
    return {
        wx: /MicroMessenger/i.test(u),
        webkit: /AppleWebKit/i.test(u),
        gecko: /gecko/i.test(u),
        ios: /\(i[^;]+;( U;)? CPU.+Mac OS X/.test(u),
        android: /android/i.test(u),
        iPhone: /iPhone/i.test(u),
        iPad: /iPad/i.test(u),
        app: /wx/i.test(u),
        androidApp: /wxAndroid/i.test(u),
        iosApp: /wxiOS/i.test(u)
    }
})();

// 获取页面地址参数
let unitObj = {
    urlPara: function () {
        function getParaObj(urlStr) {
            let paraObj = {};
            let curParaMap = null;
            let curParaKey = "";
            let curparaVal = "";
            let parArr = urlStr.split('&');
            for (let i = 0, max = parArr.length; i < max; i++) {
                curParaMap = parArr[i].split('=');
                curParaKey = curParaMap[0];
                if (typeof curParaMap[1] != "undefined") {
                    curparaVal = encodeURIComponent(curParaMap[1]);
                } else {
                    curparaVal = "";
                }
                paraObj[curParaKey] = curparaVal;
            }
            return paraObj;
        }

        return {
            getPara: function (urlStr, parName) {
                if (arguments.length = 1) {
                    parName = urlStr;
                    urlStr = location.search.slice(1);
                }
                return getParaObj(urlStr)[parName];
            },
            getAll: function (urlStr) {
                if (typeof urlStr == "undefined") {
                    urlStr = location.search.slice(1);
                }
                return getParaObj(urlStr);
            },
            getParaStr: function () {
                let urlString = window.location.href,
                    urlStr = urlString.substr(urlString.indexOf('?') + 1, urlString.length)
                return '?' + urlStr
            },
            urlEncode: function (param, key, encode) {
                if (param == null) return '';
                let paramStr = '';
                let t = typeof (param);
                if (t == 'string' || t == 'number' || t == 'boolean') {
                    paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
                } else {
                    for (let i in param) {
                        let k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
                        paramStr += unitObj.urlPara.urlEncode(param[i], k, encode);
                    }
                }
                return paramStr;
            }
        }
    }()
}

export {P2PWAP, p2pBrowser, unitObj}