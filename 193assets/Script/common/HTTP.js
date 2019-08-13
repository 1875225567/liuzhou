/**
 * 短连接控制类
 */
cc.Class({
    extends: cc.Component,

    ctor: function () {
        //this.www = "http://liuzhou.tumujinhua.com";//7.1备份
        this.www = "http://liuzhou2.tumujinhua.com";
        //this.web_url = "ws://liuzhou.tumujinhua.com:9532";//7.1备份
        this.web_url = "ws://liuzhou2.tumujinhua.com:9539";

        this.URL = this.www + "/api/";
        //登录网址url
        this.login_url = this.URL + "login";
        //刷新用户消息
        this.dating_url = this.URL + "dating";
        //商店
        this.goods_url = this.URL + "goods";

        //请求支付
        this.pay = this.URL + "pay";
        this.getAllMsg = this.URL + "getAllMsg"; //获取信息1:公告  2:通知 3:玩法
        this.getSet_url = this.URL + "getSet"; //获取绑定返回的钻石
        this.create_url_kwx = this.URL + "create_kwx"; //创建房间
        this.join_url = this.URL + "join"; //进入房间
        this.getRoom_url = this.URL + "getRoom"; //获取房间列表
        this.bind_url = this.URL + "bindAgent"; //绑定代理
        //战绩相关*******************
        this.zhanji_url = this.URL + "logs"; //战绩
        this.zhanjiInfo_url = this.URL + "logs_info"; //战绩详情
        this.replayInfo_url = this.URL + "playback"; //请求回放
        //分享地址
        this.share_app_url = this.www + "/fenxiang.html";

        this.huodong_url = this.www + "/tti/huodong.png"; //活动图片

        //正式服务端热更新地址
        this.server_hot_url = "http://hot-tmjh.oss-cn-hangzhou.aliyuncs.com/lzmj/";
        //下载链接
        this.download_url = 'https://xmvip.vip/29Wm43';
    },

    /**
     * POST短连接请求
     * @param path
     * @param postData
     * @param callback
     */
    sendRequest: function (path, postData, callback) {
        if (postData) {
            postData = (function (obj) {
                // 转成post需要的字符串.
                var str = "";
                for (var prop in obj) {
                    str += prop + "=" + obj[prop] + "&"
                }
                return str;
            })(postData);
        }
        // console.log("path=" + path);
        // console.log("str = " + postData);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", path, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            var XMLHttpReq = xhr;
            if (XMLHttpReq.readyState == 4 && XMLHttpReq.status == 200) {
                var data = JSON.parse(XMLHttpReq.responseText);
                if (callback != null) {
                    callback(data); //回调函数
                }
            }
        };
        if (postData == null) {
            xhr.send();
        } else {
            // console.log(path);
            xhr.send(postData);
        }
    },

    /**
     * GET登录短连接请求
     * @param path
     * @param postData
     * @param callback
     */
    sendRequestLogin: function (path, postData, callback) {
        var sendData = "";
        if (postData != null) {
            sendData += "?";
            for (let key in postData) {
                sendData += key + "=" + postData[key] + "&";
            }
            var len = sendData.length;
            sendData = sendData.slice(0, len - 1);
        }
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                if (callback != null) {
                    var data = JSON.parse(response);
                    callback(data); //回调函数
                }
            }
        };
        var url = path + sendData;
        xhr.open("GET", url, true);
        xhr.send();
    },

    /**
     * GET短连接请求
     * @param path
     * @param callback
     */
    sendGETRequest: function (path, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                xhr.responseType = 'json';
                var data = JSON.parse(xhr.responseText);
                callback(data);
            }
        }.bind(this);
        xhr.open("GET", path, true);
        xhr.send();
    }
});