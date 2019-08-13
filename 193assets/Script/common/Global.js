/***
 *全局控制类
 */
cc.Class({
    extends: cc.Component,

    ctor: function () {
        this.room_id = null;
        this.club_id = null;
        this.bindStatus = false;

        this.protocolUser = null;  //用户系统
        this.protocolShare = null; //分享系统
        this.replayData = null;    //回放数据

        this.date = new Date(); //日期
        this.isShowActivite = false; //是否显示过活动界面
        this.sceneShotFilePath = ''; //截图地址
        this.isChangeId = false;

        this.camera = null;
    },

    onLoad: function () {

    },

    /**************************************时间格式化处理************************************/
    dateFtt: function (date) {
        var year = date.getFullYear(); //获取完整的年份(4位,1970-????)
        var month = date.getMonth() + 1; //获取当前月份(0-11,0代表1月)
        var day = date.getDate(); //获取当前日(1-31)
        var hour = date.getHours(); //获取当前小时数(0-23)
        var minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes(); //获取当前分钟数(0-59)
        var second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds(); //获取当前秒数(0-59)
        let result = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
        return result;
    },

    /**
     * 每隔三位加逗号
     */
    getGoldStr: function (num) {
        var gold = parseInt(num).toString();
        var len = gold.length;
        var new_gold = '';
        var arr = [];
        if (len > 3) {
            var count = 1;
            for (var i = len - 1; i >= 0; i--) {
                var str = gold.charAt(i);
                arr.push(str);
                if (count % 3 == 0 && i > 0) {
                    arr.push(',');
                }
                count++;
            }
            arr.reverse();
            while (arr.length) {
                new_gold += arr.shift();
            }
        } else {
            new_gold = gold;
        }
        return new_gold;
    },

    /**
     * 名字5位截断
     */
    getNameStr: function (name) {
        var str = name;
        var name_str;
        if (name == null) {
            name_str = " ";
        } else {
            if (str.length > 6) {
                name_str = str.substr(0, 5);
                name_str += "...";
            } else {
                name_str = str;
            }
        }
        return name_str;
    },

    /**
     * 名字3位截断
     */
    getNameThree: function (name) {
        var str = name;
        var name_str;
        if (name == null) {
            name_str = "";
        } else {
            if (str.length > 4) {
                name_str = str.substr(0, 3);
                name_str += "...";
            } else {
                name_str = str;
            }
        }
        return name_str;
    },

    /**
     * 判断editbox输入的是否为数字，不是则删除
     */
    isNumber: function (str) {
        let reg = new RegExp("^[0-9]*$");
        let number;
        if (reg.test(str)) {
            number = str;
        } else {
            number = str.substring(0, str.length - 1)
        }

        return number;
    },

    /**
     * 获取倒计时形式
     */
    getTimeoutStr: function (count) {
        var min = Math.floor(count / 60);
        var sec = count - min * 60;
        var min_str = min >= 10 ? min : "0" + min;
        var sec_str = sec >= 10 ? sec : "0" + sec;
        return min_str + ":" + sec_str;
    },

    /**
     * 获取时间
     */
    getTimeLabStr: function () {
        var hours = this.date.getHours();
        var min = this.date.getMinutes();
        var hour_str = hours < 10 ? "0" + hours : hours;
        var min_str = min < 10 ? "0" + min : min;
        return hour_str + ":" + min_str;
    },

    /**
     * 对比版本号
     */
    compileVersion: function (v1, v) {
        let hasNewVersion = false; //是否有新版本
        let n_v = v.split(".");
        let m_v = v1.split(".");
        let n_version = "";
        let o_version = "";
        for (let i = 0; i < n_v.length; i++) {
            n_version += n_v[i];
        }
        for (let i = 0; i < m_v.length; i++) {
            o_version += m_v[i];
        }

        if (parseInt(n_version) > parseInt(o_version)) {
            hasNewVersion = true;
        }
        return hasNewVersion;
    },

    /**
     * 复制房间号，分享到微信(安卓)
     */
    shareAndroid: function (str) {
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "copy", "(Ljava/lang/String;)V", str);
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getWechatApi", "()V");
    },

    /**
     * 复制房间号，分享到微信（IOS）
     */
    shareIos: function (str) {
        jsb.reflection.callStaticMethod("oRootViewController", "copyStrSet:", str);
        jsb.reflection.callStaticMethod("oRootViewController", "getWechatApi", "()V");
    },

    /**
     * 分享微信
     * @param shareTo 0、好友 1、朋友圈
     * @param mediaType 分享类型"1" 图片，"2" 页面
     * @param title
     * @param text
     * @param imagePath
     */
    //shareWeChat: function (shareTo, mediaType, title, text, imagePath) {
    //    if (!cc.sys.isNative || this.protocolShare == null) {
    //        return;
    //    }
    //    this.protocolShare.setListener(this.onShareResult, this);
    //    let sd_path = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + "downLoad/hall/icon/";
    //    let thumbImage64 = sd_path + "icon64.png";
    //    let thumbImage96 = sd_path + "icon96.png";
    //    let share_url = cc.vv.http.share_app_url;
    //    let info = {};
    //    if (cc.sys.os == cc.sys.OS_ANDROID) {
    //        if (mediaType == 1) {
    //            //shareTo、mediaType、imagePath、thumbImage（或 thumbSize）
    //            info = {
    //                shareTo: shareTo,
    //                mediaType: mediaType,
    //                imagePath: imagePath,
    //                thumbImage: thumbImage64
    //            };
    //        } else {
    //            //shareTo、mediaType、thumbImage（或 imagePath、thumbSize）、url、title、text
    //            info = {
    //                shareTo: shareTo,//分享到什么位置，0 聊天 1 朋友圈 2 收藏 | 微信
    //                mediaType: mediaType,//分享类型
    //                thumbImage: thumbImage64,//本地的缩略图路径
    //                imagePath: thumbImage96,//本地的图片路径
    //                thumbSize: '64',//缩略图尺寸（不超过 127）                    url: share_url,//链接
    //                title: title,//标题
    //                text: text//分享文本
    //            };
    //        }
    //    } else if (cc.sys.os == cc.sys.OS_IOS) {
    //        if (mediaType == 1) {
    //            //shareTo、mediaType、imagePath、thumbImage
    //            info = {
    //                shareTo: shareTo,
    //                mediaType: mediaType,
    //                imagePath: imagePath,
    //                thumbImage: "icon64.png"
    //            };
    //        } else {
    //            //shareTo、mediaType、thumbImage、url、title、text
    //            info = {
    //                shareTo: shareTo,
    //                mediaType: mediaType,
    //                thumbImage: "icon64.png",
    //                url: share_url,
    //                title: title,
    //                text: text
    //            };
    //        }
    //    }
    //    this.protocolShare.share(info);
    //},

    /**
     * 分享微信
     * @param shareTo 0好友1朋友圈
     * @param mediaType 分享类型"1" 图片，"2" 页面
     * @param title 标题
     * @param text 内容
     * @param imagePath 本地图片`
     */
    shareWeChat: function (shareTo, mediaType, title, text, imagePath) {
        if (!cc.sys.isNative) {
            return;
        }
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "shareWeChat",
                "(IILjava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",
                shareTo, mediaType, title, text, cc.vv.http.share_app_url, imagePath);
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("RootViewController",
                "shareWeChat:mediaType:title:text:share_URL:imagePath:",
                shareTo, mediaType, title, text, cc.vv.http.share_app_url, imagePath);
        }
    },

    /**
     * 209版本截图
     * @param hasMask
     * @param callback
     */
    onShareSceneShot209: function (hasMask, callback) {
        if (!cc.sys.isNative) {
            return;
        }
        // 设置你想要的截图内容的 cullingMask
        this.camera.cullingMask = 0xffffffff;
        // 新建一个 RenderTexture，并且设置 camera 的 targetTexture 为新建的 RenderTexture，这样 camera 的内容将会渲染到新建的 RenderTexture 中。
        let texture = new cc.RenderTexture();
        let gl = cc.game._renderContext;
        // 如果截图内容中不包含 Mask 组件，可以不用传递第三个参数
        if (hasMask) {
            texture.initWithSize(cc.visibleRect.width, cc.visibleRect.height, gl.STENCIL_INDEX8);
        } else {
            texture.initWithSize(cc.visibleRect.width, cc.visibleRect.height);
        }
        this.camera.targetTexture = texture;
        // 渲染一次摄像机，即更新一次内容到 RenderTexture 中
        this.camera.render();
        // 这样我们就能从 RenderTexture 中获取到数据了
        let data = texture.readPixels();
        let width = texture.width;
        let height = texture.height;
        let picData = this.filpYImage(data, width, height);
        this.camera.targetTexture = null;

        var fullPath = jsb.fileUtils.getWritablePath() + 'Image.png';
        if (jsb.fileUtils.isFileExist(fullPath)) {
            jsb.fileUtils.removeFile(fullPath);
        }
        this.sceneShotFilePath = fullPath;
        let success = jsb.saveImageData(picData, width, height, fullPath);
        if (success) {
            if (callback) {
                callback();
            }
        } else {
            console.log("save image data failed!");
        }
    },

    /**
     * 截图分享
     * @param hasMask
     * @param callback
     */
    onShareSceneShot: function (hasMask, callback) {
        if (!cc.sys.isNative/* || this.protocolShare == null*/) {
            return;
        }
        let dirpath = jsb.fileUtils.getWritablePath() + 'ScreenShoot/';
        if (!jsb.fileUtils.isDirectoryExist(dirpath)) {
            jsb.fileUtils.createDirectory(dirpath);
        }
        var scene = cc.director.getScene();
        scene.rotation = -90;
        let name = 'ScreenShoot-' + (new Date()).valueOf() + '.png';
        this.sceneShotFilePath = dirpath + name;
        let renderTexture;
        if (hasMask) {
            renderTexture = cc.RenderTexture.create(1334, 750, cc.Texture2D.PIXEL_FORMAT_RGBA8888, gl.DEPTH24_STENCIL8_OES);
        } else {
            renderTexture = cc.RenderTexture.create(1334, 750);
        }
        renderTexture.begin();
        cc.director.getScene()._sgNode.visit();
        renderTexture.end();
        var self = this;
        renderTexture.saveToFile('ScreenShoot/' + name, cc.ImageFormat.PNG, true, function () {
            //保存图片完毕显示分享层
            var scene = cc.director.getScene();
            scene.rotation = 0;
            if (callback != null) {
                callback(self.sceneShotFilePath);
            }
        });
    },

    /**
     * 分享结果
     * @param code
     * @param msg
     */
    onShareResult: function (code, msg) {
        cc.log("share result, resultcode:" + code + ", msg: " + msg);
        switch (code) {
            case anysdk.ShareResultCode.kShareSuccess:
                //do something
                break;
            case anysdk.ShareResultCode.kShareFail:
                //do something
                break;
            case anysdk.ShareResultCode.kShareCancel:
                //do something
                break;
            case anysdk.ShareResultCode.kShareNetworkError:
                //do something
                break;
        }
    },

    setWeChatListener: function () {
        this.protocolUser.setListener(this.onUserResult, this);
    },

    /**
     * 请求返回
     */
    onUserResult: function (code, msg) {
        switch (code) {
            case anysdk.UserActionResultCode.kInitSuccess: //初始化成功
                console.log('初始化成功');
                this.protocolUser.login();
                break;
            case anysdk.UserActionResultCode.kLoginSuccess: //登录成功后
                //通过userPlugin的扩张方法callStringFuncWithParam获取用户信息
                var userinfo = this.protocolUser.callStringFuncWithParam('getUserInfo');
                var userMSG = JSON.parse(userinfo);
                cc.vv.userData.nickname = userMSG.nickName;
                cc.vv.userData.avatarUrl = userMSG.avatarUrl;
                cc.vv.userData.headimgurl = userMSG.avatarUrl + ".jpg";
                cc.vv.userData.uid = userMSG.uid;
                cc.vv.userData.sex = userMSG.sex;
                cc.loginControl.sendLoginGame();
                break;
            case anysdk.UserActionResultCode.kLoginFail: //登录失败
                if (this.loginControl) {
                    this.loginControl.showMsg("anysdk初始化失败");
                }
                console.log('code:' + code + " msg:" + msg);
                break;
            case anysdk.UserActionResultCode.kLogoutSuccess: //用户登出成功回调
                //登出成功，一般可以做初始化游戏，并且重新调用登录接口操作
                console.log('登出成功');
                this.isChangeId = true;
                // cc.loadingControl.loadSceneByName('Login_scene');
                if (cc.loadingControl.waiting_layer) cc.loadingControl.waiting_layer.active = false;
                cc.game.restart();
                break;
            case anysdk.UserActionResultCode.kLogoutFail: //用户登出失败回调
                //登出失败，游戏相关操作
                console.log('登出失败');
                break;
            case anysdk.UserActionResultCode.kAccountSwitchSuccess: //切换账号成功回调
                //切换账号成功，一般可以做重新获取用户ID，和初始化游戏操作
                console.log('切换账号成功');
                cc.loadingControl.loadSceneByName('Login_scene');
                break;
            case anysdk.UserActionResultCode.kAccountSwitchFail: //切换账号失败回调
                //切换账号失败，游戏相关操作
                console.log('切换账号失败');
                break;
        }
    }
});