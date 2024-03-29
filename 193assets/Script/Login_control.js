var CHECK_MAX = 50;
/**
 *启动类
 */
cc.Class({
    extends: cc.Component,

    properties: {
        main_node: cc.Node,
        btn_arr: [cc.Button],
        toggle_btn: cc.Toggle,
        //ui部分
        ui_layer: cc.Node,
        //热更新加载部分
        loading_layer: cc.Node,
        loading_progress: cc.ProgressBar,
        loading_lab: cc.Label,
        //预制容器
        node_layer: cc.Node,
        //版本
        version_lab: cc.Label
    },

    ctor: function () {
        this.isLoad = false;
        this.isBake = false;
        this.isCheck = false;
        this.checkCount = 0;

        this.storagePath = "";
        this.assetsManager = null;
        this.updateListener = null;
        this.checkListener = null;
        this.isUpdating = false; //是否在更新中

        this.xieyi_layer = null;
        this.user_phone = null;
        this.is_autoLogin = true;
        this.xianliaoid = "";
    },

    onLoad: function () {
        this.isLoad = true;
        cc.loginControl = this;
        cc.loadingControl.fadeOutMask(this.main_node, 'Login_control');

        this.schedule(this.checkJoin, 2);
    },

    /**
     * 2秒自动登录
     */
    checkJoin:function(){
        //cc.log(cc.sys.isNative, this.is_autoLogin);
        if (cc.sys.isNative && this.is_autoLogin) {
            this.wechatLogin();
        }
        this.closeCheckJoin();
    },

    /**
     * 关闭自动登录
     */
    closeCheckJoin: function () {
        this.is_autoLogin = false;
        this.unschedule(this.checkJoin);
    },

    getLongest: function () {
        let arr_0 = [1, 3, 5, 10, 8, 2, 5, 10, 62, 78, 1, 9, 562, 15, 25, 5, 6, 3];
        let arr = [];
        for (let i = 0; i < arr_0.length; i++) {
            let arr_1 = [arr_0[i]];
            for (let j = i + 1; j < arr_0.length; j++) {
                let num = arr_1[arr_1.length - 1];
                let num_0 = arr_0[j];
                if (num < num_0) {
                    arr_1.push(num_0);
                    arr_0.splice(j, 1);
                    j--;
                } else {
                    break;
                }
            }
            arr.push(arr_1);
        }
        cc.log(arr);
        let longest_arr = null;
        for (let i = 0; i < arr.length; i++) {
            longest_arr = arr[i];
            for (let j = 0; j < arr.length; j++) {
                let num_0 = arr[j];
                if (longest_arr.length < num_0.length) {
                    longest_arr = num_0;
                }
            }
        }
        cc.log(longest_arr);
    },

    onOpenView: function () {
        //this.ui_layer.getChildByName("EditBox").active = true;
        this.loadResTexture(cc.loadingControl.splashScene, 'big_bg/login_bg');
        cc.loadingControl.onToggleView('loading_layer');
        if (cc.sys.isNative) {
            this.loading_progress.progress = 0.5;
            this.loading_lab.string = '检查更新版本中...';
            this.storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + "downLoad/hall";
            //获取本地已下载的服务器版本号
            var version_url = this.storagePath + "/res/version.manifest";
            if (jsb.fileUtils.isFileExist(version_url)) {
                var v = jsb.fileUtils.getStringFromFile(version_url);
                var data = JSON.parse(v);
                cc.vv.userData.version = data.version;
            } else {
                cc.vv.userData.version = "1.2.2";
            }
            this.isBake = false;
            this.isCheck = false;
            this.checkCount = 0;
            this.closeCheckJoin();
            this.getNewVersion();
        } else {
            this.ui_layer.getChildByName("EditBox").active = true;
            this.loading_layer.active = false;
            this.ui_layer.active = true;
            cc.vv.audioMgr.playBGM("bgm_login" + cc.vv.userData.music_index, "mp3");
        }
        this.version_lab.string = "当前版本:" + cc.vv.userData.version;
    },

    /**
     * 加载本地图片
     */
    loadResTexture: function (node, url) {
        cc.loader.loadRes(url, function (err, texture2D) {
            node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture2D);
        });
    },

    /**
     * 清理
     */
    onDestroy: function () {
        this.xieyi_layer = null;
        cc.loginControl = null;
        this.removeListener();
    },

    /**
     * 确认退出游戏
     */
    callBackExit: function () {
        if (cc.sys.isNative) {
            cc.game.end();
        } else {
            window.close();
        }
    },

    /**
     * 确认修复游戏
     */
    callBackRestart: function () {
        if (cc.sys.isNative) {
            cc.audioEngine.stopAll();
            cc.game.restart();
            //this.removeHotDirectory();
        }
    },

    /**
     * 点击按钮
     * @param event
     * @param type
     */
    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case "xieyi_layer": //用户协议
            {
                this.onToggleView('xieyi_layer');
                break;
            }
            case 'restart': //一键修复
            {
                this.closeCheckJoin();
                cc.loadingControl.onToggleView('notice_layer', '是否修复游戏？', this.callBackRestart.bind(this));
                break;
            }
            case 'phone': //手机登录
            {
                this.closeCheckJoin();
                var userData = JSON.parse(cc.sys.localStorage.getItem('userData'));
                if("" == userData.login_phone){
                    let pop = this.main_node.getChildByName("switch");
                    let lab = pop.getChildByName("label_title").getComponent(cc.Label);
                    lab.string = "手机号登录";
                    let btn_0 = pop.getChildByName("btn_bind");
                    let btn_1 = pop.getChildByName("btn_login");
                    btn_0.active = false;
                    btn_1.active = true;
                    pop.active = true;
                }else{
                    this.easyLoginPhone();
                }
                break;
            }
            case 'xianliao': //闲聊登录
            {
                this.closeCheckJoin();
                this.xianLiaoLogin();
                break;
            }
            case "wechat": //微信登录
            {
                this.closeCheckJoin();
                this.wechatLogin();
                break;
            }
            case "xieyi": //复选
            {
                for (let i = 0; i < 3; i++) {
                    this.btn_arr[i].interactable = this.toggle_btn.isChecked;
                }
                break;
            }
            case "switch": //绑定手机号界面关闭
            {
                let pop = this.main_node.getChildByName("switch");
                pop.active = false;
                break;
            }
            case "bind": //绑定手机号
            {
                this.bindingPhone();
                break;
            }
            case "get_code": //获取绑定验证码
            {
                if ("0" == this.user_phone) {
                    this.getBindCode();
                } else if(-1 == this.user_phone){
                    this.getXianCode();
                } else {
                    this.getLoginCode();
                }
                break;
            }
            case "phone_login": //手机号验证登录
            {
                if(-1 == this.user_phone){
                    this.loginXian();
                } else {
                    this.loginPhone();
                }
                break;
            }
        }
    },

    /**
     * 没有声音的打开界面
     */
    onToggleView: function (type, data, callback) {
        switch (type) {
            case "xieyi_layer": //协议
            {
                if (this.xieyi_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    var self = this;
                    cc.loader.loadRes('Prefab/login/xieyi_layer', function (err, prefab) {
                        self.xieyi_layer = cc.instantiate(prefab);
                        self.xieyi_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.xieyi_layer.active = true;
                    this.xieyi_layer.getComponent('Xieyi_layer').onOpenView();
                }
                break;
            }
        }
    },

    /**
     * 微信登录
     */
    wechatLogin: function () {
        cc.loadingControl.waiting_layer.active = true;
        cc.loadingControl.waiting_lab.string = '请求登录微信';
        if (cc.sys.isNative) {
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "loginWeChat", "()V");
            } else if (cc.sys.os == cc.sys.OS_IOS) {
                jsb.reflection.callStaticMethod("RootViewController", "loginWeChat");
            }
        } else {
            var id = this.ui_layer.getChildByName("EditBox").getComponent(cc.EditBox).string;
            let mid = '1000' + id;
            //let len = mid.toString().length;
            cc.vv.userData.uid = 'ceshi00-ceshi0' + mid;
            cc.vv.userData.nickname = '测试' + id;
            // cc.vv.userData.uid = 'opSX90sBzNGinPiDe73PYokEOhIw';
            // cc.vv.userData.nickname = '杨雪（APP开发）';
            // cc.vv.userData.uid = 'opSX90n5jeR96tOAGNgZNfjH1G-E';
            // cc.vv.userData.nickname = 'app开发';
            // cc.vv.userData.mid = mid;
            cc.vv.userData.sex = 1;
            cc.vv.userData.version = "1.2.2";
            this.sendLoginGame();
        }
    },

    /**
     * 闲聊登录
     */
    xianLiaoLogin: function () {
        cc.loadingControl.waiting_layer.active = true;
        cc.loadingControl.waiting_lab.string = '请求登录闲聊';
        if (cc.sys.isNative) {
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "loginXianLiao", "()V");
            } else if (cc.sys.os == cc.sys.OS_IOS) {
                jsb.reflection.callStaticMethod("RootViewController", "loginWeChat");
            }
        } else {
            var id = this.ui_layer.getChildByName("EditBox").getComponent(cc.EditBox).string;
            let mid = '1000' + id;
            //let len = mid.toString().length;
            cc.vv.userData.uid = 'ceshi00-ceshi0' + mid;
            cc.vv.userData.nickname = '测试' + id;
            // cc.vv.userData.uid = 'opSX90sBzNGinPiDe73PYokEOhIw';
            // cc.vv.userData.nickname = '杨雪（APP开发）';
            // cc.vv.userData.uid = 'opSX90n5jeR96tOAGNgZNfjH1G-E';
            // cc.vv.userData.nickname = 'app开发';
            // cc.vv.userData.mid = mid;
            cc.vv.userData.sex = 1;
            cc.vv.userData.version = "1.2.2";
            this.sendLoginGame();
        }
    },

    /**
     * 请求登录
     */
    sendLoginGame: function () {
        cc.loadingControl.waiting_layer.active = true;
        cc.loadingControl.waiting_lab.string = '请求登录中';
        var postData = {
            "openid": cc.vv.userData.uid,
            "sex": cc.vv.userData.sex,
            "nickname": cc.vv.userData.nickname,
            "headimgurl": cc.vv.userData.avatarUrl,
            "version": cc.vv.userData.version,
            "address": cc.vv.userData.address,
            "mobile": cc.vv.userData.mobile
            // "city": cc.vv.userData.version
        };
        //cc.vv.http.sendRequest(cc.vv.http.login_url, postData, this.onReturnLogin.bind(this));
        cc.vv.http.sendRequest(cc.vv.http.login_url, postData, this.onReturnLogin.bind(this));
    },

    /**
     * 请求登录返回
     */
    onReturnLogin: function (data) {
        console.log(data);
        cc.loadingControl.waiting_layer.active = false;
        if (data.status == 0) {
            this.showMsg(data.msg);
        } else if (data.status == 1) {
            cc.vv.userData.headimgurl = data.data.headimgurl; //收到后端的玩家头像
            cc.vv.userData.ip = data.data.ip; //收到后端的唯一id编号
            cc.vv.userData.mid = data.data.mid; //收到后端的唯一id编号
            cc.vv.userData.nickname = data.data.nickname; //收到后端的玩家昵称
            cc.vv.userData.num = data.data.num; //收到后端的房卡数量
            cc.vv.Global.room_id = data.data.room_id;
            cc.vv.userData.sex = data.data.sex; //收到后端的玩家性别
            cc.vv.userData.token = data.data.token; //收到后端token
            cc.vv.Global.gid = data.data.hasOwnProperty('gid') ? data.data.gid : 0;
            this.user_phone = data.data.phone; //收到后端的玩家手机号
            cc.vv.userData.login_phone = "";
            cc.vv.userData.saveUserInfo();
            this.checkLoginData();
        }
    },

    /**
     * 请求闲聊登录
     */
    sendXianLiao: function () {
        console.log("请求闲聊登录");
        cc.loadingControl.waiting_layer.active = true;
        cc.loadingControl.waiting_lab.string = '请求登录中';
        var postData = {
            "xianliao_code": cc.vv.userData.XLcode,
            "version": cc.vv.userData.version,
            "address": cc.vv.userData.address,
            "mobile": cc.vv.userData.mobile
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "xianliao_login", postData, this.onReturnXianLiao.bind(this));
    },

    /**
     * 闲聊登录返回
     */
    onReturnXianLiao: function (data) {
        console.log(data,data.status);
        cc.loadingControl.waiting_layer.active = false;
        if (data.status == 0) {
            this.showMsg(data.msg);
        } else if (data.status == 1) {
            cc.vv.userData.headimgurl = data.data.headimgurl; //收到后端的玩家头像
            cc.vv.userData.ip = data.data.ip; //收到后端的唯一id编号
            cc.vv.userData.mid = data.data.mid; //收到后端的唯一id编号
            cc.vv.userData.nickname = data.data.nickname; //收到后端的玩家昵称
            cc.vv.userData.num = data.data.num; //收到后端的房卡数量
            cc.vv.Global.room_id = data.data.room_id;
            cc.vv.userData.sex = data.data.sex; //收到后端的玩家性别
            cc.vv.userData.token = data.data.token; //收到后端token
            cc.vv.Global.gid = data.data.hasOwnProperty('gid') ? data.data.gid : 0;
            this.user_phone = data.data.phone; //收到后端的玩家手机号
            this.checkLoginData();
        } else if(2 == data.status){
            console.log(data.data.xianliaoid);
            this.xianliaoid = data.data.xianliaoid;
            cc.vv.userData.headimgurl = data.data.headimgurl; //收到后端的玩家头像
            cc.vv.userData.nickname = data.data.nickname; //收到后端的玩家昵称
            this.user_phone = -1;
            let pop = this.main_node.getChildByName("switch");
            let lab = pop.getChildByName("label_title").getComponent(cc.Label);
            lab.string = "手机号绑定";
            let btn_0 = pop.getChildByName("btn_bind");
            let btn_1 = pop.getChildByName("btn_login");
            btn_0.active = false;
            btn_1.active = true;
            pop.active = true;
        }
    },

    /**
     * 获取闲聊登录验证码
     */
    getXianCode: function () {
        let pop = this.main_node.getChildByName("switch");
        let lab_0 = pop.getChildByName("editBox_0").getComponent(cc.EditBox);
        if("" == lab_0.string){
            this.showMsg("请输入手机号");
            return
        }
        var postData = {
            "phone": parseInt(lab_0.string),
            "xianliaoid": this.xianliaoid
        };
        cc.log(postData);
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "xianliao_code", postData, function (data) {
            cc.log(data);
            if (data.msg) this.showMsg(data.msg);
        }.bind(this));
    },

    /**
     * 登录之后的检查，是否有游戏未完成，是否复制了俱乐部号码或房号
     */
    checkLoginData:function(){
        if (cc.vv.Global.room_id) {
            //this.loadSceneByName("game_scene");
            this.sendJoinRoom(cc.vv.Global.room_id);
        } else {
            let lab = "";
            //let lab = "俱乐部[" + 100037 +  "]玩家[" + 124578 + "]邀请你加入俱乐部，打牌更方便，更便捷。(复制此消息打开游戏可直接申请加入俱乐部)";
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                lab = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getCopyStr", "()Ljava/lang/String;");
            } else if (cc.sys.os == cc.sys.OS_IOS) {
                lab = jsb.reflection.callStaticMethod("RootViewController", "getCopyStr");
            }
            if (36 < lab.length) {
                var str_0 = lab.substr(0, 3);
            } else {
                this.bindPhone();
                return;
            }
            if ("大赢家" == str_0) {
                let str = lab.substr(9, 6);
                let reg = new RegExp("^[0-9]*$");
                let num = parseInt(str);
                if (reg.test(str)) {
                    cc.loadingControl.onToggleView('notice_layer', "是否进入该房间[" + str + "]？", function () {
                        cc.vv.WebSocket.sendWS("RoomController", "join", {
                            "mid": cc.vv.userData.mid,
                            'room_id': num
                        });
                    }.bind(this));
                    if (cc.sys.os == cc.sys.OS_ANDROID) {
                        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "copy", "(Ljava/lang/String;)V", "");
                    } else if (cc.sys.os == cc.sys.OS_IOS) {
                        jsb.reflection.callStaticMethod("oRootViewController", "copyStrSet:", "");
                    }
                } else {
                    this.bindPhone();
                }
            } else {
                this.bindPhone();
            }
        }
    },

    /**
     * 判断手机号是否绑定
     */
    bindPhone: function () {
        if ("0" == this.user_phone) {
            //this.showMsg("微信登陆成功，绑定手机号后才能正常游戏。");
            let pop = this.main_node.getChildByName("switch");
            let lab = pop.getChildByName("label_title").getComponent(cc.Label);
            lab.string = "手机号绑定";
            let btn_0 = pop.getChildByName("btn_bind");
            let btn_1 = pop.getChildByName("btn_login");
            btn_0.active = true;
            btn_1.active = false;
            pop.active = true;
        } else {
            this.loadSceneByName("hall_scene");
        }
    },

    /**
     * 获取绑定验证码
     */
    getBindCode: function () {
        let pop = this.main_node.getChildByName("switch");
        let lab_0 = pop.getChildByName("editBox_0").getComponent(cc.EditBox);
        if("" == lab_0.string){
            this.showMsg("请输入手机号");
            return
        }
        var postData = {
            "mid": cc.vv.userData.mid,
            "phone": parseInt(lab_0.string)
        };
        cc.log(postData);
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "bind_code", postData, function (data) {
            cc.log(data);
            if (data.msg) this.showMsg(data.msg);
        }.bind(this));
    },

    /**
     * 绑定手机号
     */
    bindingPhone: function () {
        let pop = this.main_node.getChildByName("switch");
        let lab_0 = pop.getChildByName("editBox_0").getComponent(cc.EditBox);
        let lab_1 = pop.getChildByName("editBox_1").getComponent(cc.EditBox);
        if("" == lab_0.string){
            this.showMsg("请输入手机号");
            return
        }
        if("" == lab_1.string){
            this.showMsg("请输入验证码");
            return
        }
        var postData = {
            "mid": cc.vv.userData.mid,
            "phone": lab_0.string,
            "code": lab_1.string
        };
        cc.log(postData);
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "bind_phone", postData, function (data) {
            cc.log(data);
            if (data.msg) this.showMsg(data.msg);
            if (1 == data.status) {
                pop.active = false;
                lab_0.string = "";
                lab_1.string = "";
                this.loadSceneByName("hall_scene");
            }
        }.bind(this));
    },

    /**
     * 获取登录验证码
     */
    getLoginCode: function () {
        let pop = this.main_node.getChildByName("switch");
        let lab_0 = pop.getChildByName("editBox_0").getComponent(cc.EditBox);
        if("" == lab_0.string){
            this.showMsg("请输入手机号");
            return
        }
        var postData = {
            "phone": parseInt(lab_0.string)
        };
        cc.log(postData);
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "login_code", postData, function (data) {
            cc.log(data);
            if (data.msg) this.showMsg(data.msg);
        }.bind(this));
    },

    /**
     * 手机号登录
     */
    loginPhone: function () {
        let pop = this.main_node.getChildByName("switch");
        let lab_0 = pop.getChildByName("editBox_0").getComponent(cc.EditBox);
        let lab_1 = pop.getChildByName("editBox_1").getComponent(cc.EditBox);
        if("" == lab_0.string) this.showMsg("请输入手机号");
        if("" == lab_1.string) this.showMsg("请输入验证码");
        var postData = {
            "phone": lab_0.string,
            "code": lab_1.string,
            "address": cc.vv.userData.address,
            "version": cc.vv.userData.version,
            "mobile": cc.vv.userData.mobile,
            "mechine_code": cc.vv.userData.device
            //"mechine_code": "12458755ff457ff1dd285d4d1d"
        };
        cc.log(postData);
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "login_phone", postData, function (data) {
            cc.log(data);
            if (data.msg) this.showMsg(data.msg);
            if (1 == data.status) {
                cc.vv.userData.headimgurl = data.data.headimgurl; //收到后端的玩家头像
                cc.vv.userData.ip = data.data.ip; //收到后端的ip地址
                cc.vv.userData.mid = data.data.mid; //收到后端的唯一id编号
                cc.vv.userData.nickname = data.data.nickname; //收到后端的玩家昵称
                cc.vv.userData.num = data.data.num; //收到后端的房卡数量
                cc.vv.Global.room_id = data.data.room_id;
                cc.vv.userData.sex = data.data.sex; //收到后端的玩家性别
                cc.vv.userData.token = data.data.token; //收到后端token
                cc.vv.Global.gid = data.data.hasOwnProperty('gid') ? data.data.gid : 0;
                cc.vv.userData.login_phone = lab_0.string;
                cc.vv.userData.saveUserInfo();
                lab_0.string = "";
                lab_1.string = "";
                pop.active = false;
                this.checkLoginData();
            }
        }.bind(this));
    },

    /**
     * 闲聊绑定并登录
     */
    loginXian: function () {
        let pop = this.main_node.getChildByName("switch");
        let lab_0 = pop.getChildByName("editBox_0").getComponent(cc.EditBox);
        let lab_1 = pop.getChildByName("editBox_1").getComponent(cc.EditBox);
        if("" == lab_0.string){
            this.showMsg("请输入手机号");
            return
        }
        if("" == lab_1.string){
            this.showMsg("请输入验证码");
            return
        }
        var postData = {
            "phone": lab_0.string,
            "code": lab_1.string,
            "address": cc.vv.userData.address,
            "version": cc.vv.userData.version,
            "mobile": cc.vv.userData.mobile,
            "nickname": cc.vv.userData.nickname,
            "headimgurl": cc.vv.userData.headimgurl,
            "xianliaoid": this.xianliaoid
        };
        cc.log(postData);
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "xianliao_bind", postData, function (data) {
            cc.log(data);
            if (data.msg) this.showMsg(data.msg);
            if (1 == data.status) {
                cc.vv.userData.headimgurl = data.data.headimgurl; //收到后端的玩家头像
                cc.vv.userData.ip = data.data.ip; //收到后端的ip地址
                cc.vv.userData.mid = data.data.mid; //收到后端的唯一id编号
                cc.vv.userData.nickname = data.data.nickname; //收到后端的玩家昵称
                cc.vv.userData.num = data.data.num; //收到后端的房卡数量
                cc.vv.Global.room_id = data.data.room_id;
                cc.vv.userData.sex = data.data.sex; //收到后端的玩家性别
                cc.vv.userData.token = data.data.token; //收到后端token
                cc.vv.Global.gid = data.data.hasOwnProperty('gid') ? data.data.gid : 0;
                lab_0.string = "";
                lab_1.string = "";
                pop.active = false;
                this.checkLoginData();
            }
        }.bind(this));
    },

    /**
     * 免验证手机号登录
     */
    easyLoginPhone: function () {
        var userData = JSON.parse(cc.sys.localStorage.getItem('userData'));
        cc.log(userData);
        var postData = {
            "phone": userData.login_phone,
            "version": cc.vv.userData.version,
            "mechine_code": cc.vv.userData.device
            //"mechine_code": "12458755ff457ff1dd285d4d1d"
        };
        //console.log(postData.mechine_code);
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "huanxing", postData, function (data) {
            cc.log(data);
            if (data.msg) this.showMsg(data.msg);
            if (1 == data.status) {
                cc.vv.userData.headimgurl = data.data.headimgurl; //收到后端的玩家头像
                cc.vv.userData.ip = data.data.ip; //收到后端的唯一id编号
                cc.vv.userData.mid = data.data.mid; //收到后端的唯一id编号
                cc.vv.userData.nickname = data.data.nickname; //收到后端的玩家昵称
                cc.vv.userData.num = data.data.num; //收到后端的房卡数量
                cc.vv.Global.room_id = data.data.room_id;
                cc.vv.userData.sex = data.data.sex; //收到后端的玩家性别
                cc.vv.userData.token = data.data.token; //收到后端token
                cc.vv.Global.gid = data.data.hasOwnProperty('gid') ? data.data.gid : 0;
                this.checkLoginData();
            }
        }.bind(this));
    },

    /**
     * 强制输入框只能输入数字
     * @param str 玩家实时输入的字符串
     * @param lab 输入框
     */
    testNumber_0: function (str, lab) {
        let number = cc.vv.Global.isNumber(str);
        lab.string = number;
    },

    /**
     * 请求进入房间
     * @param roomId
     */
    sendJoinRoom: function (roomId) {
        cc.loadingControl.waiting_layer.active = true;
        cc.loadingControl.waiting_lab.string = '请求加入房间';
        cc.vv.WebSocket.sendWS("RoomController", "join", {
            "mid": cc.vv.userData.mid,
            "room_id": roomId
        });
    },

    /**
     * 返回加入房间信息
     */
    onReturnCreate: function (data) {
        if (data.status == 1) {
            var club_id = data.club_id;
            let room_id = data.room_id;
            cc.vv.Global.room_id = room_id;
            cc.vv.Global.club_id = club_id;
            this.loadSceneByName('game_scene');
            cc.loadingControl.waiting_layer.active = false;
        } else {
            this.showMsg(data.msg);
        }
    },

    /**
     * 返回加入房间
     * @param data
     */
    onReturnJoin: function (data) {
        cc.loadingControl.waiting_layer.active = false;
        if (data.status == 1) {
            let room_id = data.data;
            cc.vv.Global.room_id = room_id;
            this.loadSceneByName('game_scene');
        } else {
            this.showMsg(data.msg);
        }
    },

    /**
     * 消息提示
     */
    showMsg: function (msg) {
        cc.loadingControl.showMsg(msg);
    },

    /**
     * 通用加载场景
     * @param sceneName
     */
    loadSceneByName: function (sceneName) {
        this.onClickView();
        this.main_node.opacity = 0;
        this.main_node.active = false;
        this.enabled = false;
        cc.loadingControl.loadSceneByName(sceneName, true);
    },

    onClickView: function () {
        if (this.xieyi_layer && this.xieyi_layer.active) {
            let js = this.xieyi_layer.getComponent('Xieyi_layer');
            js.onClickView();
        }
    },

    //热更新部分代码******************************************************
    /**
     * 获取最新的版本号
     */
    getNewVersion: function () {
        if (this.isCheck == false) {
            this.isCheck = true;
            this.schedule(this.getNewVersion, 3.0);
        }
        if (this.isBake) {
            return;
        }
        if (this.checkCount >= 30) {
            this.unschedule(this.getNewVersion);
            this.showMsg('请检查网络');
            this.isCheck = false;
            this.isBake = false;
            this.checkCount = 0;
            return;
        }
        this.checkCount++;
        var url = cc.vv.http.server_hot_url + "hall/version.manifest";
        cc.vv.http.sendGETRequest(url, this.onReturnVersion.bind(this));
    },

    /**
     * 返回服务端版本号
     * @param data
     */
    onReturnVersion: function (data) {
        this.isBake = true;
        if (this.isCheck) {
            this.unschedule(this.getNewVersion);
        }
        this.isCheck = false;
        console.log('本地版本: ' + cc.vv.userData.version + " 原生版本: " + data.version);
        if (cc.vv.Global.compileVersion(cc.vv.userData.version, data.version) == true) {
            this.hotUpdate();
        } else {
            //已经是最新版本
            //if (cc.sys.os == cc.sys.OS_ANDROID) {
            //    this.loadIcon("icon96"); //加载分享图标
            //    this.loadIcon("icon64"); //加载分享图标
            //}
            cc.vv.audioMgr.playBGM("bgm_login" + cc.vv.userData.music_index, "mp3");
        }
    },

    /**
     * 移除监听
     */
    removeListener: function () {
        //if (this.updateListener) {
        //    cc.eventManager.removeListener(this.updateListener);
        //    this.updateListener = null;
        //}
        //if (this.checkListener) {
        //    cc.eventManager.removeListener(this.checkListener);
        //    this.checkListener = null;
        //}
        //if (this.assetsManager && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
        //    this.assetsManager.release();
        //}
        //this.assetsManager = null;
        //this.isUpdating = false;
        if (this.assetsManager) {
            this.assetsManager.setEventCallback(null);
        }
        this.assetsManager = null;
        this.isUpdating = false;
    },

    /**
     * 初始化大厅加载控制器
     */
    createJSBAssetsManager: function () {
        this.removeListener();
        //对比版本号
        var versionCompareHandle = function (versionA, versionB) {
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || 0);
                if (a === b) {
                    continue;
                } else {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            } else {
                return 0;
            }
        };
        this.assetsManager = new jsb.AssetsManager('', this.storagePath, versionCompareHandle);
        if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
           this.assetsManager.retain();
        }
        this.assetsManager.setVerifyCallback(function (path, asset) {
            var compressed = asset.compressed;
            var expectedMD5 = asset.md5;
            var relativePath = asset.path;
            var size = asset.size;
            if (compressed) {
                return true;
            } else {
                return true;
            }
        });
        //安卓系统注意
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            this.assetsManager.setMaxConcurrentTask(2);
        }
        this.isUpdating = false;
    },

    /**
     * 更新执行
     */
    hotUpdate: function () {
        console.log("更新开始");
        this.createJSBAssetsManager();

        this.checkCount = 0;
        this.loading_layer.active = true;
        this.ui_layer.active = false;
        this.loading_progress.progress = 0;
        this.loading_lab.string = '更新版本中...';

        this.updateListener = new jsb.EventListenerAssetsManager(this.assetsManager, this.updateCb.bind(this));
        cc.eventManager.addListener(this.updateListener, 1);

        // this.assetsManager.setEventCallback(this.updateCb.bind(this));
        var url = cc.vv.http.server_hot_url + "hall";
        //自定义一个本地配置，是全部加载子游戏
        var tempManifestStr = JSON.stringify({
            "packageUrl": url + "/",
            "remoteManifestUrl": url + "/project.manifest",
            "remoteVersionUrl": url + "/version.manifest",
            "version": "1.2.2",
            "assets": {},
            "searchPaths": []
        });
        if (this.assetsManager.getState() === jsb.AssetsManager.State.UNINITED) {
            var manifest = new jsb.Manifest(tempManifestStr, this.storagePath);
            this.assetsManager.loadLocalManifest(manifest, this.storagePath);
        }
        this.assetsManager.update();
        this.isUpdating = true;
    },

    /**
     * 加载更新监听
     */
    updateCb: function (event) {
        var needRestart = false;
        var failed = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                var rate = event.getPercentByFile();
                if (!isNaN(rate)) {
                    var per = parseFloat(rate.toFixed(2));
                    this.loading_progress.progress = per;
                    this.loading_lab.string = "更新 " + (per * 100).toFixed(0) + "%";
                }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this.loading_progress.progress = 1;
                this.loading_lab.string = "更新完毕";
                needRestart = true;
                failed = false;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                failed = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                failed = true;
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                failed = true;
                break;
            default:
                break;
        }
        if (failed) {
            //继续加载失败的文件
            this.checkCount++;
            if (this.checkCount >= CHECK_MAX) {
                //删除热更新缓存
                if (jsb.fileUtils.removeDirectory(this.storagePath + "/")) {
                    this.createJSBAssetsManager();
                    this.scheduleOnce(function () {
                        this.hotUpdate();
                    }, 1.0);
                }
            } else {
                this.assetsManager.downloadFailedAssets();
            }
        }
        if (needRestart) {
            // this.assetsManager.setEventCallback(null);
            this.updateListener = null;

            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this.assetsManager.getLocalManifest().getSearchPaths();
            console.log(JSON.stringify(newPaths));
            Array.prototype.unshift.apply(searchPaths, newPaths);
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);

            cc.audioEngine.stopAll();
            cc.game.restart()
        }
    },

    /**
     * 加载icon图片
     */
    loadIcon: function (iconName) {
        var dirpath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'downLoad/hall/icon/';
        var filepath = dirpath + iconName + ".png";
        //判断有没有图片
        if (jsb.fileUtils.isFileExist(filepath)) {
            //存在图片
        } else {
            //没有文件则去加载
            var saveFile = function (data) {
                if (typeof data !== 'undefined') {
                    //创建文件夹目录
                    if (!jsb.fileUtils.isDirectoryExist(dirpath)) {
                        jsb.fileUtils.createDirectory(dirpath);
                    }
                    //保存图片到本地
                    jsb.fileUtils.writeDataToFile(new Uint8Array(data), filepath);
                }
            };
            var url = cc.vv.http.server_hot_url + "icon/" + iconName + ".png";
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        saveFile(xhr.response);
                    } else {
                        saveFile(null);
                    }
                }
            }.bind(this);
            xhr.open("GET", url, true);
            xhr.send();
        }
    },

    /**
     * 删除热更新目录
     */
    removeHotDirectory: function () {
        if (jsb.fileUtils.isFileExist(this.storagePath)) {
            cc.loadingControl.showWaiting(true, "修复中");
            if (jsb.fileUtils.removeDirectory(this.storagePath + "/")) {
                var searchPaths = jsb.fileUtils.getSearchPaths();
                console.log('旧版searchPaths: ' + searchPaths);
                if (searchPaths.length > 1) {
                    searchPaths.shift();
                    console.log('新版searchPaths: ' + searchPaths);
                    jsb.fileUtils.setSearchPaths(searchPaths);
                }
                cc.sys.localStorage.removeItem('HotUpdateSearchPaths');
                cc.audioEngine.stopAll();
                cc.game.restart();
            }
        } else {
            cc.loadingControl.showWaiting(false, "修复中");
            cc.loadingControl.onToggleView('notice_layer', '已经删除本地缓存，请前往下载最新版本!', function () {
                cc.sys.openURL(cc.vv.http.download_url);
            }.bind(this))
        }
    }
});