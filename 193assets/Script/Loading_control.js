/**
 * 启动页
 */
cc.Class({
    extends: cc.Component,

    properties: {
        splashScene: cc.Node,
        node_layer: cc.Node
    },

    ctor: function () {
        this.login_scene = null; //登录界面
        this.hall_scene = null; //大厅界面
        this.game_scene = null; //游戏界面
        this.game_replay_scene = null; //游戏回放界面

        //公共界面
        this.notice_layer = null; //提示/退出
        this.msg_node = null; //提示
        this.waiting_layer = null; //等待层
        this.waiting_lab = null; //等待文本
        this.loading_layer = null; //加载

        this.setting_layer = null; //设置界面
        this.wanfa_layer = null; //玩法帮助界面
        this.photo_layer = null; //相机或者相册
        this.share_layer = null; //分享

        this.scene_arr = [null, null, null, null]; //0登录1大厅2游戏3回放
        this.scene_name_arr = ['login_scene', 'hall_scene', 'game_scene', 'game_replay_scene'];

        this.time_out = 0;
        this.currentTime = null;
        this.game_status = 0; //0启动1登录2大厅3游戏
        this.isHide = false;
        this.cid = null
    },

    onLoad: function () {
        // if (jsb) {
        //     var hotUpdateSearchPaths = localStorage.getItem('HotUpdateSearchPaths');
        //     if (hotUpdateSearchPaths) {
        //         jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths));
        //     }
        // }
        cc.loadingControl = this;
        this.game_status = 0;
        //初始化大厅主体类对象
        cc.vv = {};
        //玩家信息
        var UserMgr = require("UserDataMsg");
        cc.vv.userData = new UserMgr();
        //短连接
        var HTTP = require("HTTP");
        cc.vv.http = new HTTP();
        //全局变量控制
        var Global = require("Global");
        cc.vv.Global = new Global();
        //音频控制类
        var AudioMgr = require("AudioMsg");
        cc.vv.audioMgr = new AudioMgr();
        cc.vv.userData.getUserInfo();
        cc.vv.audioMgr.init();
        //语音控制类
        var VoiceMgr = require("VoiceMgr");
        cc.vv.voiceMgr = new VoiceMgr();
        cc.vv.voiceMgr.init();
        //长链接
        var WebSocketMgr = require("WebSocket_control");
        cc.vv.WebSocket = new WebSocketMgr();
        cc.vv.WebSocket.init(true);

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this); //回退按钮
        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);
    },

    start() {
        console.log("项目启动");
        this.onToggleView('waiting_layer');
        setTimeout(function () {
            this.loadSceneByName('login_scene');
        }.bind(this), 1000);
    },

    onGameHide: function () {
        cc.audioEngine.pauseAll();
        if (this.game_scene && this.game_scene.active) {
            this.isHide = true;
            cc.vv.WebSocket.onCloseWebSocket(true);
        }
    },

    onGameShow: function () {
        cc.audioEngine.resumeAll();
        if (!this.game_scene || !this.game_scene.active) {
            //let lab = "大赢家 房间号:[" + 457812 + "],\n（复制此消息打开游戏可直接进入该房间）";
            //let lab = "俱乐部[" + 100037 +  "]玩家[" + 124578 + "]邀请你加入俱乐部，打牌更方便，更便捷。(复制此消息打开游戏可直接申请加入俱乐部)";
            let lab = "";
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                lab = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getCopyStr", "()Ljava/lang/String;");
            } else if (cc.sys.os == cc.sys.OS_IOS) {
                lab = jsb.reflection.callStaticMethod("RootViewController", "getCopyStr");
            }
            if (36 < lab.length) {
                var str_0 = lab.substr(0, 3);
            } else {
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
                }
            } else if ("俱乐部" == str_0) {
                let str = lab.substr(4, 6);
                let reg = new RegExp("^[0-9]*$");
                this.cid = parseInt(str);
                if (reg.test(str)) {
                    var postData = {
                        "club_id": str
                    };
                    let url = cc.vv.http.URL;
                    cc.vv.http.sendRequest(url + "club_list", postData, this.onReturnCheckData.bind(this));
                    if (cc.sys.os == cc.sys.OS_ANDROID) {
                        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "copy", "(Ljava/lang/String;)V", "");
                    } else if (cc.sys.os == cc.sys.OS_IOS) {
                        jsb.reflection.callStaticMethod("oRootViewController", "copyStrSet:", "");
                    }
                }
            }
        }
        this.isHide = false;
    },

    onReturnCheckData: function (data) {
        if (1 == data.status) {
            let arr = data.data;
            cc.loadingControl.onToggleView('notice_layer', "是否申请加入 [" + arr[0].name + "] 俱乐部？", this.applicationClub.bind(this));
        }
    },

    /**
     * 申请加入俱乐部
     */
    applicationClub: function () {
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.cid
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_join", postData, function (data) {
            if (data.msg) cc.hallControl.showMsg(data.msg);
        }.bind(this));
    },

    onDestroy: function () {
        cc.loadingControl = null;
    },

    update: function () {
        if (this.time_out % 60 == 0) {
            //判断是否获取了地址相关信息
            if (cc.NativeMsg.isGetLocation) {
                cc.NativeMsg.isGetLocation = false;
                cc.vv.userData.latitude = cc.NativeMsg.lat;
                cc.vv.userData.longitude = cc.NativeMsg.lng;
                cc.vv.userData.address = cc.NativeMsg.address;
                cc.vv.userData.mobile = cc.NativeMsg.mobile;
            }
        }
        if (this.time_out && this.time_out % 600 == 0) {
            this.updateHeartbeat();
        }
        if (cc.vv.WebSocket.isWaiting && this.time_out % 60 == 0 && !this.isHide) {
            this.updateCheckConnect();
        }
        this.time_out++;
    },

    /**
     * 心跳
     */
    updateHeartbeat: function () {
        cc.vv.WebSocket.sendWS('RoomController', 'heartbeat', {
            'mid': cc.vv.userData.mid
        })
    },

    /**
     * 成功链接服务器
     */
    cancelReConnect: function () {
        if (this.waiting_layer) {
            this.waiting_layer.active = false;
        }
        if (cc.gameControl && this.game_scene && this.game_scene.active) {
            //处于游戏状态
            console.log("发送进入消息");
            cc.gameControl.sendJinru(); //让游戏绑定mid
        }
    },

    /**
     * 链接服务器断开
     */
    beginReConnect: function () {
        if (this.waiting_layer) {
            this.waiting_layer.active = true;
            this.waiting_lab.string = '开始断线重连';
        }
    },

    /**
     * 监听重连
     */
    updateCheckConnect: function () {
        if (cc.vv.WebSocket.isConnect == false) {
            this.waiting_layer.active = true;
            cc.vv.WebSocket.waitCount++;
            this.waiting_lab.string = '第' + cc.vv.WebSocket.waitCount + '次重连';
            if (cc.vv.WebSocket.waitCount >= cc.vv.WebSocket.MAX_WAIT) {
                cc.vv.WebSocket.isWaiting = false;
                this.onToggleView('notice_layer', '请检查您的网络！', function () {
                    cc.vv.WebSocket.waitCount = 0;
                    cc.vv.WebSocket.init(true);
                }.bind(this));
            } else {
                cc.vv.WebSocket.init(true);
            }
        } else {
            this.waiting_layer.active = false;
        }
    },

    /**
     * 加载场景
     */
    loadSceneByName: function (name, bool) {
        switch (name) {
            case 'login_scene': {
                this.hidOtherView(name);
                if (this.login_scene == null) {
                    let self = this;
                    cc.loader.loadRes('Prefab/login_scene', function (err, prefab) {
                        self.login_scene = cc.instantiate(prefab);
                        self.login_scene.parent = self.node_layer;
                    });
                } else {
                    this.fadeOutMask(this.login_scene, 'Login_control');
                }
                break;
            }
            case 'hall_scene': {
                // if (bool) {
                //     this.onToggleView('loading_layer');
                // }
                this.hidOtherView(name);
                if (this.hall_scene == null) {
                    let self = this;
                    cc.loader.loadRes('Prefab/hall_scene', function (err, prefab) {
                        self.hall_scene = cc.instantiate(prefab);
                        self.hall_scene.loadType = bool;
                        self.hall_scene.parent = self.node_layer;
                        self.scene_arr[1] = self.hall_scene;
                    });
                } else {
                    this.hall_scene.active = true;
                    this.hall_scene.loadType = bool;
                    if (bool) {
                        //切回前台调度器gg了，不清楚情况
                        this.loadingView(this.hall_scene, 'Hall_control');
                    } else {
                        this.fadeOutMask(this.hall_scene, 'Hall_control');
                    }
                }
                break;
            }
            case 'game_scene': {
                // if (bool) {
                //     this.onToggleView('loading_layer', '正在进入游戏');
                // } else {}
                this.hidOtherView(name);
                if (this.game_scene == null) {
                    let self = this;
                    cc.loader.loadRes('Prefab/game_scene', function (err, prefab) {
                        self.game_scene = cc.instantiate(prefab);
                        self.game_scene.loadType = bool;
                        self.game_scene.parent = self.node_layer;
                        self.scene_arr[2] = self.game_scene;
                        //self.game_scene.active = false;
                        cc.log("游戏房间已加载")
                    });
                } else {
                    this.game_scene.loadType = bool;
                    this.game_scene.active = true;
                    this.scene_arr[2] = this.game_scene;
                    if (bool) {
                        //切回前台调度器gg了，不清楚情况
                        this.loadingView(this.game_scene, 'Game_control');
                    } else {
                        this.fadeOutMask(this.game_scene, 'Game_control');
                    }
                }
                break;
            }
            case 'game_replay_scene': {
                // if (bool) {
                //     this.onToggleView('loading_layer', '正在进入回放界面');
                // } else {}
                this.hidOtherView(name);
                if (this.game_replay_scene == null) {
                    let self = this;
                    cc.loader.loadRes('Prefab/game_replay_scene', function (err, prefab) {
                        self.game_replay_scene = cc.instantiate(prefab);
                        self.game_replay_scene.loadType = bool;
                        self.game_replay_scene.parent = self.node_layer;
                        self.scene_arr[3] = self.game_replay_scene;
                        //self.game_replay_scene.active = false;
                    });
                } else {
                    //this.hidOtherView(name);
                    this.game_replay_scene.active = true;
                    this.game_replay_scene.loadType = bool;
                    if (bool) {
                        //切回前台调度器gg了，不清楚情况
                        this.loadingView(this.game_replay_scene, 'Game_replay_control');
                    } else {
                        this.fadeOutMask(this.game_replay_scene, 'Game_replay_control');
                    }
                }
                break;
            }
        }
    },

    /**
     * 隐藏其他场景
     */
    hidOtherView: function (name) {
        let index = this.scene_name_arr.indexOf(name.toString());
        let temp = ['Login_control', 'Hall_control', 'Game_control', 'Game_replay_control'];
        for (let i = 0; i < this.scene_arr.length; i++) {
            if (i == index) continue;
            let scene = this.scene_arr[i];
            if (scene != null && scene.active) {
                let control = scene.getChildByName('control');
                let js_name = temp[i];
                let js = control.getComponent(js_name);
                js.onClickView();
                js.enabled = false;
                scene.opacity = 0;
                scene.active = false;
            }
        }
    },

    /**
     * 加载界面
     */
    loadingView: function (node, func_name) {
        node.active = true;
        node.opacity = 255;
        if (func_name.toString() == 'login_scene') {
            var js = this.loading_layer.getComponent('Loading_layer');
            js.waitCompleted();
            //1秒后显示
            setTimeout(function () {
                var control = node.getChildByName('control');
                var js = control.getComponent(func_name);
                js.enabled = true;
                js.onOpenView();
            }.bind(this), 1000);
        } else {
            var control = node.getChildByName('control');
            var js = control.getComponent(func_name);
            js.enabled = true;
            js.onOpenView();
        }
    },

    /**
     * 淡出遮罩 显示场景
     */
    fadeOutMask: function (node, func_name) {
        node.active = true;
        node.opacity = 255;
        var control = node.getChildByName('control');
        var js = control.getComponent(func_name);
        js.enabled = true;
        js.onOpenView();
    },

    /**监听返回 */
    onKeyDown: function (event) {
        switch (event.keyCode) {
            case cc.KEY.back:
                cc.vv.userData.exitGame = true;
                this.onToggleView('notice_layer', '是否退出游戏？', this.callBackExit.bind(this));
                break;
        }
    },

    /**
     * 打开公共界面
     */
    onToggleView: function (type, data, callback) {
        switch (type) {
            case 'notice_layer': {
                if (this.notice_layer == null) {
                    let self = this;
                    cc.loader.loadRes('Prefab/common/notice_layer', function (err, prefab) {
                        self.notice_layer = cc.instantiate(prefab);
                        var js = self.notice_layer.getComponent('Notice_layer');
                        js.msg = data;
                        js.callBackFunc = callback;
                        self.notice_layer.parent = self.node_layer;
                    });
                } else {
                    this.notice_layer.active = true;
                    this.notice_layer.getComponent('Notice_layer').onOpenView(data, callback);
                }
                break;
            }
            case 'waiting_layer': {
                if (this.waiting_layer == null) {
                    let self = this;
                    cc.loader.loadRes('Prefab/common/waiting_layer', function (err, prefab) {
                        self.waiting_layer = cc.instantiate(prefab);
                        self.waiting_layer.parent = self.node_layer;
                        self.waiting_layer.active = false;
                        self.waiting_layer.zIndex = 98;
                        self.waiting_lab = self.waiting_layer.getChildByName('lab').getComponent(cc.Label);
                    });
                }
                break;
            }
            case 'msg_node': {
                if (this.msg_node == null) {
                    let self = this;
                    cc.loader.loadRes('Prefab/common/msg_node', function (err, prefab) {
                        self.msg_node = cc.instantiate(prefab);
                        self.msg_node.parent = self.node_layer;
                        self.msg_node.active = false;
                        self.msg_node.zIndex = 98;
                        self.showMsgAnimation(data);
                    });
                } else {
                    this.showMsgAnimation(data);
                }
                break;
            }
            case 'loading_layer': //加载节点
            {
                if (this.loading_layer == null) {
                    let self = this;
                    cc.loader.loadRes('Prefab/common/loading_layer', function (err, prefab) {
                        self.loading_layer = cc.instantiate(prefab);
                        self.loading_layer.parent = self.node_layer;
                        self.loading_layer.active = false;
                    });
                } else {
                    this.loading_layer.active = true;
                    let js = this.loading_layer.getComponent('Loading_layer');
                    js.onOpenView(data);
                }
                break;
            }
            case 'wanfa_layer': //玩法
            {
                if (this.wanfa_layer == null) {
                    this.waiting_layer.active = true;
                    this.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/common/wanfa_layer', function (err, prefab) {
                        self.wanfa_layer = cc.instantiate(prefab);
                        self.wanfa_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            self.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.wanfa_layer.active = true;
                    this.wanfa_layer.getComponent('Help_layer').onOpenView();
                }
                break;
            }
            case 'setting_layer': //设置
            {
                if (this.setting_layer == null) {
                    this.waiting_layer.active = true;
                    this.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/common/setting_layer', function (err, prefab) {
                        self.setting_layer = cc.instantiate(prefab);
                        self.setting_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            self.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.setting_layer.active = true;
                    this.setting_layer.getComponent('Setting_layer').onOpenView();
                }
                break;
            }
            case 'photo_layer': //选中相机或者相册选取照片
            {
                if (this.photo_layer == null) {
                    this.waiting_layer.active = true;
                    this.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/common/photo_layer', function (err, prefab) {
                        self.photo_layer = cc.instantiate(prefab);
                        self.photo_layer.parent = self.node_layer;
                        self.waiting_layer.active = false;
                    });
                } else {
                    this.photo_layer.active = true;
                    let js = this.photo_layer.getComponent('Photo_layer');
                    js.onOpenView();
                }
                break;
            }
            case 'share_layer': //分享
            {
                if (this.share_layer == null) {
                    this.waiting_layer.active = true;
                    this.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/common/share_layer', function (err, prefab) {
                        self.share_layer = cc.instantiate(prefab);
                        self.share_layer.parent = self.node_layer;
                        self.waiting_layer.active = false;
                    });
                } else {
                    this.share_layer.active = true;
                    let js = this.share_layer.getComponent('Share_layer');
                    js.onOpenView();
                }
                break;
            }
        }
    },

    callBackExit: function () {
        if (cc.sys.isNative) {
            cc.game.end();
        } else {
            window.close();
        }
    },

    /**
     * 消息提示
     */
    showMsg: function (msg) {
        this.onToggleView('msg_node', msg);
    },

    showMsgAnimation(msg) {
        this.msg_node.active = true;
        this.msg_node.stopAllActions();
        this.msg_node.position = cc.v2(0, -198);
        this.msg_node.opacity = 255;
        this.msg_node.getChildByName('lab').getComponent(cc.Label).string = msg;
        this.msg_node.runAction(cc.sequence(
            cc.delayTime(1),
            cc.spawn(
                cc.moveBy(2, cc.v2(0, 200)),
                cc.fadeOut(2)
            )
        ));
    },

    /**
     * dengdaiceng
     * @param bool
     */
    showWaiting: function (bool) {
        if (this.waiting_layer) {
            this.waiting_layer.active = bool;
        }
    }
});