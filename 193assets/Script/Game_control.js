var BATTERY_MAX = 43; //电池最大宽度
var RULE_BEGIN_X = -638; //规则开始坐标
var RULE_END_X = -359; //规则结束坐标
var TOOL_BEGIN_X = 638; //工具开始坐标
//var TOOL_END_X = 348; //工具结束坐标
//var TOOL_END_X = 470; //工具结束坐标
var TOOL_END_X = 401; //工具结束坐标
var PLAYER_POS = [
    [cc.v2(0, -208), cc.v2(318, 0), cc.v2(0, 208), cc.v2(-318, 0)],
    [cc.v2(-580, -138), cc.v2(580, 138), cc.v2(400, 298), cc.v2(-580, 138)]
];
var TEXT_ARR = [
    '速度定，得蛮',
    '我躲呼咯蛮夺八了哇哦',
    '盼盼夺是我爱，卖兰咯',
    '里呼打点得蛮',
    '里总封跑我给认歌呀',
    '很歌由咩根恩咯哦',
    '你理牌打嘞蒜吼撩'
];

/**
 * 游戏场景
 */
cc.Class({
    extends: cc.Component,

    properties: {
        pai_atlas: cc.SpriteAtlas, //资源图集
        emoji_atlas: cc.SpriteAtlas, //表情资源
        head_atlas: cc.SpriteAtlas, //头像资源
        main_node: cc.Node, //主体容器
        node_layer: cc.Node, //子界面容器
        //ui相关**********************
        background: cc.Node, //背景
        room_id_lab: cc.Label, //房间号
        time_lab: cc.Label, //时间
        net_speed_lab: cc.Label, //网速
        net_speed_parent: cc.Node, //网速父节点
        speed_color_arr: [cc.Color], //网速对应颜色0绿色1黄色2红色
        battery_mask: cc.Node, //电池遮罩节点
        rule_lab: cc.Label, //规则文本
        //重要的按钮
        btn_arr: [cc.Node], //0复制按钮 1邀请好友按钮 2返回大厅按钮 3解散房间按钮 4聊天按钮 5语音按钮
        rule_icon: cc.Node, //规则节点
        tool_icon: cc.Node, //右边工具栏节点
        waiting_layer: cc.Node, //等待层
        msg_node: cc.Node, //提示层
        prepare_layer: cc.Node,
        game_layer: cc.Node, //游戏玩家及牌面展示
        timer_layer: cc.Node, //时间指示
        chupai_prefab: cc.Prefab, //出牌的预制
        hu_pai_prefab: cc.Prefab, //胡牌提示的牌

        handleBtn_arr_layer: cc.Node, //操作按钮组
        caouo_tip_layer: cc.Node,
        select_special_pai: cc.Prefab, //选择操作的特殊牌预制
        special_maj_prefab: [cc.Prefab]
    },

    ctor: function () {
        this.isLoad = false;
        this.isShowing = false;
        this.auto_texture = []; //需要自动释放的自动

        this._lastTouchTime = null; //语言触摸
        this.count = 0;
        this.isTouchDown = false;
        this.isKaiju = false; //是否开局
        this.zhuang = null;
        this.zf = null;
        this.countTime = 0;
        this.ping_time = 0;

        this.maj_gang_space_arr = [85, 32, -50, -32]; //麻将碰杠牌的间隔
        this.maj_hand_begin_pos = [cc.v2(-620, -310), cc.v2(528, -130), cc.v2(308, 261), cc.v2(-501, 280)]; //手上牌麻将开始坐标        2/3/4人模式
        this.maj_out_begin_pos2 = [cc.v2(-415, -85), cc.v2(415, 90), cc.v2(415, 90), cc.v2(49.1, 112)]; //打出麻将开始坐标          2人模式
        this.maj_out_begin_pos = [cc.v2(-195, -85), cc.v2(250, -140), cc.v2(195, 90), cc.v2(-250, 140)]; //打出麻将开始坐标          3/4人模式

        this.maj_out_buhua_begin_pos = [cc.v2(360, -200), cc.v2(450, 100), cc.v2(-300, 200), cc.v2(-450, -100)]; //玩家补花出的牌

        this.maj_out_space = [43, 32, -43, -32]; //打出麻将间隔
        this.maj_out_row_space = [-50, 55, 50, -55]; //打出麻将二层间隔
        this.maj_hand_space_arr = [90, 27, -39, -27]; //手上牌的间隔
        this.maj_top_space_arr = [30, 50, 50, 50]; //出牌上升高度

        this.special_pai = [[], [], [], []]; //存放4个玩家操作的数据
        this.special_arr = [[], [], [], []]; //存放4个玩家碰杠牌
        this.maj_hand_pai = [[], 13, 13, 13]; //手上麻将数据
        this.maj_hand_arr = [[], [], [], []]; //四组在手上的麻将
        this.maj_out_arr = [[], [], [], []]; //四组打出来的麻将对象
        this.maj_out_pai = [0, 0, 0, 0]; //四组打出来的麻将数量
        this.maj_buhua_arr = [[], [], [], []]; //四组补花麻将对象
        this.maj_prefab = [[], [], [], []]; //四组麻将预制，0打出的牌，1碰的牌，2明杠牌，3暗杠牌，4背景牌
        this.chipenggang_dir = [
            [-1, 2, 1, 0],
            [0, -1, 2, 1],
            [1, 0, -1, 2],
            [2, 1, 0, -1]
        ];

        this.current_da = 0; //当前操作中谁打的牌
        this.current_type = 0; //当前操作发来的类型
        this.handle_status = []; //操作数组
        this.caozuo_tx_data = null; //操作提醒的类型及数据信息
        this.current_dir = -1; //当前出牌方向
        this.current_q = -1; //当前起牌状态 -1没有起牌 1起到牌

        this.isCanTouch = false; //当前是否可点击状态, 自己是庄家
        this.selectePai = 0; //当前选择的牌类型
        this.huPai = 0; //胡的牌
        this.isSendPai = false; //是否在出牌
        this.current_maj = null; //当前选中的麻将对象

        this.game_status = 0; //游戏状态，0未开始游戏，1已开始游戏，2结算游戏
        this.game_ren = 4; //人数
        this.chat_layer = null; //聊天
        this.gps_layer = null; //gps
        this.voice_layer = null; //语音
        this.load_voice = false; //语音
        this.set_layer = null; //设置
        this.interactive_layer = null; //互动表情
        this.hupaizhanji_layer = null; //小局战绩
        this.zhanji_layer = null; //大局战绩
        this.vote_layer = null; //投票解散弹窗
        this.fast_layer = null; //投票快速开始弹窗
        this.roomInfo = null; //房间数据
        this.userInfo = null; //玩家数据
        this.player_id_arr = []; //用户id数组
        this.player_node_arr = []; //用户头像节点数组（含聊天模块）
        this.sanbi = []; //三比玩家ID
        this.lixian = []; //离线玩家ID
        this.ting_hu = null; //听胡数据
        this.is_ting_hu = true; //听胡数量是否可以变化
        this.paiAndTing = null; //打的牌与操作牌的关系
        this.broadcostTime_arr = [-1, -1, -1, -1]; //离线时长数组
        this.interactive_time = 0; //互动表情限制时长
        this.player_number = 0; //互动表情限制时长
    },

    onLoad: function () {
        this.isLoad = true;
        cc.gameControl = this;
        if (this.main_node.loadType == true) {
            cc.loadingControl.loadingView(this.main_node, 'Game_control');
        } else {
            cc.loadingControl.fadeOutMask(this.main_node, 'Game_control');
        }
        //设置监听相关代码
        this.background.on(cc.Node.EventType.TOUCH_END, this.onClickBackGround, this);
        // this.btn_arr[5].on(cc.Node.EventType.TOUCH_START, this.onTouchVoiceStart, this);
        // this.btn_arr[5].on(cc.Node.EventType.TOUCH_END, this.onTouchVoiceEnd, this);
        // this.btn_arr[5].on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchVoiceEnd, this);
        this.btn_arr[5].on('touchstart', this.onTouchVoiceStart, this);
        this.btn_arr[5].on('touchend', this.onTouchVoiceEnd, this);
        this.btn_arr[5].on('touchcancel', this.onTouchVoiceEnd, this);
    },

    /**
     * 初始化游戏场景
     */
    onOpenView: function () {
        //this.loadResTexture(cc.loadingControl.splashScene, 'big_bg/pz_bj');
        this.loadResTexture(cc.loadingControl.splashScene, 'big_bg/roomBG_2');
        cc.vv.audioMgr.playBGM("bgm_game", "mp3");
        this.sendJinru();
    },

    /**
     * 加载本地图片
     */
    loadResTexture: function (node, url) {
        cc.loader.loadRes(url, function (err, texture2D) {
            node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture2D);
        });
    },

    onDestroy: function () {
        cc.vv.Global.room_id = null;
        //cc.vv.Global.club_id = null;
        this.background.off(cc.Node.EventType.TOUCH_END, this.onClickBackGround, this);
        // this.btn_arr[5].off(cc.Node.EventType.TOUCH_START, this.onTouchVoiceStart, this);
        // this.btn_arr[5].off(cc.Node.EventType.TOUCH_END, this.onTouchVoiceEnd, this);
        // this.btn_arr[5].off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchVoiceEnd, this);
        this.btn_arr[5].off('touchstart', this.onTouchVoiceStart, this);
        this.btn_arr[5].off('touchend', this.onTouchVoiceEnd, this);
        this.btn_arr[5].off('touchstart', this.onTouchVoiceEnd, this);
        this.unscheduleAllCallbacks();
        // while (this.auto_texture.length) {
        //     let textur2D = this.auto_texture.shift();
        //     cc.loader.setAutoReleaseRecursively(textur2D, true);
        // }
        cc.gameControl = null;
        cc.loadingControl.game_scene = null;
        // cc.loader.setAutoReleaseRecursively('Prefab/game_scene', true);
    },

    /**
     * 点击屏幕背景，用来隐藏规则和工具栏
     */
    onClickBackGround: function () {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        this.onToggleTool(false);
        this.onToggleRule(false);
    },

    /**
     * 点击确定解散房间
     */
    callBackJiesan: function () {
        //请求解散房间*******
        console.log("this.isKaiju" + this.isKaiju);
        if (this.isKaiju || cc.vv.userData.mid.toString() == this.roomInfo.fangzhu.toString()) { //房主  或者已经开局了
            cc.vv.WebSocket.sendWS('RoomController', 'jiesan', {
                mid: cc.vv.userData.mid,
                room_id: cc.vv.Global.room_id,
                status: 1
            });
        } else {
            cc.vv.WebSocket.sendWS('RoomController', 'lizuo', {
                mid: cc.vv.userData.mid,
                room_id: cc.vv.Global.room_id
            });
        }
    },

    /**
     * 点击确定返回大厅
     */
    callBackHall: function () {
        this.loadSceneByName('hall_scene');
        //this.onDestroy();
    },

    /**
     * 按钮点击事件
     * @param {*} event 点击的事件主体
     * @param {*} type 按钮自带的文本
     */
    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        if (this.isShowing == true) return;
        switch (type.toString()) {
            case 'gps_layer':
            case 'setting_layer':
            case 'chat_layer':
            {
                this.onToggleView(type.toString());
                break;
            }
            case 'jiesan':
            {
                cc.vv.Global.club_id = this.roomInfo.guize.club_id;
                cc.loadingControl.onToggleView('notice_layer', '您是否请求解散房间？', this.callBackJiesan.bind(this));
                break;
            }
            case 'restart':
            {
                cc.loadingControl.onToggleView('notice_layer', '您是否要刷新游戏？', function () {
                    cc.audioEngine.stopAll();
                    cc.game.restart()
                });
                break;
            }
            case 'back_0':
            case 'back_1':
            {
                //if(0 == type[type.length - 1])
                cc.vv.Global.club_id = this.roomInfo.guize.club_id;
                //else cc.vv.Global.club_id = "";
                cc.loadingControl.onToggleView('notice_layer', '是否返回大厅？', this.callBackHall.bind(this));
                break;
            }
            case 'add_wechat': //分享好友链接
            {
                if (cc.sys.isNative) {
                    //let sd_path = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + "downLoad/hall/icon/";
                    //let thumbImage64 = sd_path + "icon64.png";
                    //cc.vv.Global.shareSDK(
                    //    index,"2","【柳州麻将】",
                    //    "我在房间号：" + cc.vv.Global.room_id + " 等你来玩哟！",
                    //    index == "0" ? "null" : thumbImage64, "null"
                    //);
                    //let lab = cc.find("wenzi_bg/label_wanfa",this.node).getComponent(cc.Label).string;
                    //let str = "大赢家柳州麻将 房间号:[" + this.club_data.roomInfo.guize.room_id +  "]," + lab + "\n（复制此消息打开游戏可直接进入该房间）";
                    //cc.vv.Global.shareSDK();
                }
                break;
            }
            case 'copy_roomid': //复制房间号，并分享好友
            {
                let lab = "柳州麻将 " + this.game_ren + "人 " + (this.roomInfo.guize.jushu + "局 ") + (this.roomInfo.guize.menqing.toString() == "1" ? "门清 " : "") +
                    (this.roomInfo.guize.fangfei.toString() == "1" ? "房费均摊 " : this.roomInfo.guize.fangfei == 2 ? "房主支付 " : "俱乐部支付 ") +
                    (this.roomInfo.guize.yu_num.toString() == "1" ? "爆炸鱼 " : "钓" + this.roomInfo.guize.yu_num + "条鱼 ") +
                    (this.roomInfo.guize.fengding.toString() == "0" ? "无限番 " : "自摸" + this.roomInfo.guize.fengding + "封顶 ") +
                    (this.roomInfo.guize.yu_type == -1 ? "" : this.roomInfo.guize.yu_type.toString() == "1" ? "一五九钓鱼 " : "跟庄钓鱼 ") +
                    (this.roomInfo.guize.hua.toString() == "0" ? "" : "有花 ") + (this.roomInfo.guize.fenghu.toString() == "0" ? "" : "四笔封胡 ") +
                    (this.roomInfo.guize.wufeng.toString() == "0" ? "" : "无风");
                let str = "大赢家 房间号:[" + cc.vv.Global.room_id + "]," + lab + "\n（复制此消息打开游戏可直接进入该房间）";

                if (cc.sys.os == cc.sys.OS_ANDROID) {
                    cc.vv.Global.shareAndroid(str);
                } else if (cc.sys.os == cc.sys.OS_IOS) {
                    cc.vv.Global.shareIos(str);
                }
                break;
            }
            case 'rule_left':
            {
                this.onToggleRule(true);
                break;
            }
            case 'rule_right':
            {
                this.onToggleTool(true);
                break;
            }
            case 'player0':
            case 'player1':
            case 'player2':
            case 'player3':
            {
                this.loadInteractive(type.toString());
                break;
            }
        }
    },

    /**
     * 没有声音的打开界面
     */
    onToggleView: function (type, data /*, callback*/ ) {
        switch (type) {
            case 'chat_layer': //聊天
            {
                if (this.chat_layer == null) {
                    this.waiting_layer.active = true;
                    let self = this;
                    cc.loader.loadRes('Prefab/game/chat_layer', function (err, prefab) {
                        self.chat_layer = cc.instantiate(prefab);
                        self.chat_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            self.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.chat_layer.active = true;
                    this.chat_layer.getComponent('Chat_layer').onOpenView();
                }
                break;
            }
            case 'gps_layer': //gps
            {
                if (this.gps_layer == null) {
                    this.waiting_layer.active = true;
                    let self = this;
                    cc.loader.loadRes('Prefab/game/gps_layer', function (err, prefab) {
                        self.gps_layer = cc.instantiate(prefab);
                        self.gps_layer.parent = self.node_layer;
                        self.gps_layer.getComponent('Gps_layer').onOpenView(data);
                        self.scheduleOnce(function () {
                            self.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.gps_layer.active = true;
                    this.gps_layer.getComponent('Gps_layer').onOpenView(data);
                }
                break;
            }
            case 'setting_layer': //设置
            {
                if (this.set_layer == null) {
                    this.waiting_layer.active = true;
                    let self = this;
                    cc.loader.loadRes('Prefab/common/setting_layer', function (err, prefab) {
                        self.set_layer = cc.instantiate(prefab);
                        self.set_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            self.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.set_layer.active = true;
                    this.set_layer.getComponent('Setting_layer').onOpenView();
                }
                break;
            }
            case 'voice_layer': //语音层
            {
                if (this.voice_layer == null) {
                    // this.waiting_layer.active = true;
                    if (!this.load_voice) {
                        this.load_voice = true;
                        let self = this;
                        cc.loader.loadRes('Prefab/game/voice_layer', function (err, prefab) {
                            self.voice_layer = cc.instantiate(prefab);
                            self.voice_layer.parent = self.node_layer;
                            self.voice_layer.getComponent('Voice_layer').onOpenView(data);
                            self.load_voice = false;
                            // self.waiting_layer.active = false;
                        });
                    }
                } else {
                    this.voice_layer.active = true;
                    this.voice_layer.getComponent('Voice_layer').onOpenView(data);
                }
                break;
            }
            case 'interactive_layer': //互动表情层
            {
                if (this.interactive_layer == null) {
                    this.waiting_layer.active = true;
                    let self = this;
                    cc.loader.loadRes('Prefab/game/interactive_layer', function (err, prefab) {
                        self.interactive_layer = cc.instantiate(prefab);
                        self.interactive_layer.parent = self.node_layer;
                        self.interactive_layer.getComponent('interactive_layer').onOpenView(data);
                        self.waiting_layer.active = false;
                    });
                } else {
                    this.interactive_layer.active = true;
                    this.interactive_layer.getComponent('interactive_layer').onOpenView(data);
                }
                break;
            }
        }
    },

    /**
     * 消息提示
     */
    showMsg: function (msg) {
        this.msg_node.active = true;
        this.msg_node.stopAllActions();
        this.msg_node.position = cc.v2(0, -288);
        this.msg_node.opacity = 255;
        msg_node.getChildByName('lab').getComponent(cc.Label).string = msg;
        msg_node.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.moveBy(1, cc.v2(0, 100)),
            cc.spawn(
                cc.moveBy(1, cc.v2(0, 100)),
                cc.fadeOut(1)
            )
        ));
    },

    /**
     * 通用加载场景
     * @param sceneName
     */
    loadSceneByName: function (sceneName) {
        this.onClickView();
        this.main_node.opacity = 0;
        this.main_node.active = false; //隐藏该节点
        this.enabled = false; //十分重要，隐藏节点并中断节本执行
        cc.vv.audioMgr.playBGM("bgm_login" + cc.vv.userData.music_index, "mp3");
        cc.loadingControl.loadSceneByName(sceneName, true);
    },

    onClickView: function () {
        while (this.auto_texture.length) {
            let textur2D = this.auto_texture.shift();
            cc.loader.setAutoReleaseRecursively(textur2D, true);
        }
        if (this.chat_layer && this.chat_layer.active) {
            let js = this.chat_layer.getComponent('Chat_layer');
            js.onClickView();
        }
        if (this.gps_layer && this.gps_layer.active) {
            let js = this.gps_layer.getComponent('Gps_layer');
            js.onClickView();
        }
        if (this.voice_layer && this.voice_layer.active) {
            let js = this.voice_layer.getComponent('Voice_layer');
            js.onClickView();
        }
    },

    /**
     * 显示或隐藏工具栏
     */
    onToggleTool: function (bool) {
        //如果本身就是可见的，则不执行下去
        if (!bool && this.tool_icon.x >= (TOOL_BEGIN_X - 5)) {
            return;
        }
        if (bool && this.tool_icon.x <= (TOOL_END_X + 5)) {
            this.onToggleTool(false);
            return;
        }
        this.isShowing = true;
        let bg = this.tool_icon.getChildByName('bg');
        if (bool == true) {
            this.tool_icon.x = TOOL_BEGIN_X;
            bg.opacity = 0;
            this.tool_icon.runAction(cc.sequence(
                cc.moveTo(0.3, cc.v2(TOOL_END_X, 260)).easing(cc.easeBackOut()),
                cc.callFunc(function () {
                    this.isShowing = false;
                }.bind(this))
            ));
            bg.runAction(cc.fadeIn(0.3));
        } else {
            this.tool_icon.x = TOOL_END_X;
            bg.opacity = 255;
            this.tool_icon.runAction(cc.sequence(
                cc.moveTo(0.3, cc.v2(TOOL_BEGIN_X, 260)).easing(cc.easeBackIn()),
                cc.callFunc(function () {
                    this.isShowing = false;
                }.bind(this))
            ));
            bg.runAction(cc.fadeOut(0.3));
        }
    },

    /**
     * 显示或隐藏规则栏
     */
    onToggleRule: function (bool) {
        //如果本身就是可见的，则不执行下去
        if (!bool && this.rule_icon.x <= (RULE_BEGIN_X + 5)) {
            return;
        }
        if (bool && this.rule_icon.x >= (RULE_END_X - 5)) {
            this.onToggleRule(false);
            return;
        }
        this.isShowing = true;
        let bg = this.rule_icon.getChildByName('bg');
        if (bool == true) {
            this.rule_icon.x = RULE_BEGIN_X;
            bg.opacity = 0;
            this.rule_icon.runAction(cc.sequence(
                cc.moveTo(0.3, cc.v2(RULE_END_X, 260)).easing(cc.easeBackOut()),
                cc.callFunc(function () {
                    this.isShowing = false;
                }.bind(this))
            ));
            bg.runAction(cc.fadeIn(0.3));
        } else {
            this.rule_icon.x = RULE_END_X;
            bg.opacity = 255;
            this.rule_icon.runAction(cc.sequence(
                cc.moveTo(0.3, cc.v2(RULE_BEGIN_X, 260)).easing(cc.easeBackIn()),
                cc.callFunc(function () {
                    this.isShowing = false;
                }.bind(this))
            ));
            bg.runAction(cc.fadeOut(0.3));
        }
    },

    /**
     * 松开
     */
    onTouchVoiceEnd: function () {
        // cc.log("松开");
        this.onToggleView('voice_layer', 0);
        if (Date.now() - this._lastTouchTime < 1000 || Date.now() - this._lastTouchTime >= 15000) {
            if (this.load_voice) {
                setTimeout(function () {
                    if (!this.isTouchDown && this.voice_layer.active) {
                        this.voice_layer.active = false;
                    }
                }.bind(this), 500);
            }
            this.endVoiceTouch();
            cc.vv.voiceMgr.cancel();
        } else {
            this.onVoiceOK();
        }
    },

    /**
     * 开始触摸
     */
    onTouchVoiceStart: function () {
        // cc.log("开始触摸");
        cc.vv.voiceMgr.prepare(cc.vv.userData.mid + "_record.amr");
        if (!this.isTouchDown) {
            this.isTouchDown = true;
            // this.touch_y = 0;
            this._lastTouchTime = Date.now();
            this.onToggleView('voice_layer', 1);
        }
    },

    /**
     * 结束触摸
     */
    endVoiceTouch: function () {
        this._lastTouchTime = null;
        this.isTouchDown = false;
    },

    /**
     * 发送语音消息
     */
    onVoiceOK: function () {
        if (this._lastTouchTime != null) {
            cc.vv.voiceMgr.release();
            let time = Date.now() - this._lastTouchTime;
            //将保存在本地的语音数据转发
            let msg = cc.vv.voiceMgr.getVoiceData(cc.vv.userData.mid + "_record.amr");
            cc.vv.WebSocket.sendWS('RoomController', 'xiaoxi', {
                room_id: cc.vv.Global.room_id,
                mid: cc.vv.userData.mid,
                msg: msg,
                time: time,
                type: 3
            });
        }
        if (this.voice_layer) {
            this.voice_layer.active = false;
        }
        this.endVoiceTouch();
    },

    initView: function () {
        this.maj_hand_arr = [[], [], [], []]; //四组在手上的麻将
        for (var i = 0; i < 4; i++) {
            for (var h = 0; h < 14; h++) {
                var maj_hand = this.game_layer.getChildByName("player" + i).getChildByName("handpai").getChildByName("pai" + h);
                this.maj_hand_arr[i].push(maj_hand);
            }
            this.game_layer.getChildByName("player" + i).getChildByName("user").getChildByName("mask").getChildByName("quan").active = false;
        }
    },

    /*********************************************************游戏场景下的消息接受*********************************************************/
    /**
     * 返回进入房间信息(展示房间信息（2，3，4人）)
     * @param data
     */
    onReturnJinru: function (data) {
        console.log("进入房间数据",data);
        if (data.userInfo == this.userInfo && data.roomInfo == this.roomInfo) return;
        this.game_ren = data.roomInfo.guize.renshu;
        this.roomInfo = data.roomInfo;
        this.userInfo = data.userInfo;
        this.showNewBtn();
        this.room_id_lab.string = "房间号：" + cc.vv.Global.room_id;
        this.schedule(function () {
            var time = new Date();
            this.time_lab.string = cc.vv.Global.dateFtt(time);
        }.bind(this), 1);
        this.rule_lab.string = this.game_ren + "人  " + (this.roomInfo.guize.jushu + "局  ") + (this.roomInfo.guize.menqing.toString() == "1" ? "门清  " : "") +
            (this.roomInfo.guize.fangfei.toString() == "1" ? "房费均摊  " : this.roomInfo.guize.fangfei == 2 ? "房主支付  " : "俱乐部支付  ") +
            (this.roomInfo.guize.yu_num.toString() == "1" ? "爆炸鱼  " : "钓" + this.roomInfo.guize.yu_num + "条鱼  ") +
            (this.roomInfo.guize.fengding.toString() == "0" ? "无限番  " : "自摸" + this.roomInfo.guize.fengding + "封顶  ") +
            (this.roomInfo.guize.yu_type == -1 ? "" : this.roomInfo.guize.yu_type.toString() == "1" ? "一五九钓鱼  " : "跟庄钓鱼  ") +
            (this.roomInfo.guize.hua.toString() == "0" ? "" : "有花  ") + (this.roomInfo.guize.fenghu.toString() == "0" ? "" : "四笔封胡  ") +
            (this.roomInfo.guize.wufeng.toString() == "0" ? "" : "无风");
        this.player_node_arr[0] = this.prepare_layer.getChildByName("player0");
        if (this.game_ren == 2) {
            this.player_node_arr[1] = this.prepare_layer.getChildByName("player2");
            this.prepare_layer.getChildByName("player2").active = true;
        } else if (this.game_ren == 3) {
            this.player_node_arr[1] = this.prepare_layer.getChildByName("player1");
            this.player_node_arr[2] = this.prepare_layer.getChildByName("player2");
            this.prepare_layer.getChildByName("player1").active = true;
            this.prepare_layer.getChildByName("player2").active = true;
        } else {
            this.player_node_arr[1] = this.prepare_layer.getChildByName("player1");
            this.player_node_arr[2] = this.prepare_layer.getChildByName("player2");
            this.player_node_arr[3] = this.prepare_layer.getChildByName("player3");
            this.prepare_layer.getChildByName("player1").active = true;
            this.prepare_layer.getChildByName("player2").active = true;
            this.prepare_layer.getChildByName("player3").active = true;
        }
        this.initView();
        console.log(this.maj_hand_arr);
        this.showUserInfo();
    },

    /**
     * 返回进入房间信息
     * @param data
     */
    onReturnRuzuo: function (data) {
        console.log("返回了入座信息", data);
        this.roomInfo = data.roomInfo;
        this.userInfo = data.userInfo;
        this.showNewBtn();
        this.showUserInfo();
    },

    /**
     * 显示准备跟2/3人快速开始按钮
     */
    showNewBtn: function () {
        //cc.log("按钮显示更新中");
        let btn_0 = this.prepare_layer.getChildByName("btn_0");
        let btn_1 = this.prepare_layer.getChildByName("btn_1");
        btn_0.active = false;
        btn_1.active = false;

        if (!this.isKaiju) {
            let ready = this.roomInfo.zhunbei.indexOf(cc.vv.userData.mid);
            if ("1" == this.roomInfo.guize.zhunbei.toString() && -1 == ready) {
                btn_0.active = true;
            }

            let len = Object.getOwnPropertyNames(this.userInfo).length;
            let num = parseInt(this.roomInfo.guize.renshu);
            //cc.log(len,num);
            if ("1" == this.roomInfo.guize.fast.toString() && len != num) {
                btn_1.active = true;
            }
        }
    },

    onReturnJiesan: function (data) {
        console.log("收到了玩家解散房间信息", data);
        if (data.result == 1) {
            if (parseInt(data.ju) > 0) { //解散成功    待弹出战绩界面
                this.initView();
            } else {
                this.onDestroy();
                this.loadSceneByName('hall_scene');
            }
        } else {
            if (this.vote_layer != null) {
                this.vote_layer.active = false;
                this.vote_layer.getComponent('vote_layer').closeVote();
                for (var i = 0; i < 4; i++) {
                    var user = this.vote_layer.getChildByName("user" + i);
                    user.active = false;
                    user.getChildByName("status").getComponent(cc.Label).string = "等待中";
                    user.getChildByName("status").color = cc.color(0, 125, 125);
                }
            }
        }
    },

    /**
     * 玩家离坐返回信息
     * @param data
     */
    onReturnLizuo: function (data) {
        cc.log(data);
        if (data.mid.toString() == cc.vv.userData.mid.toString()) {
            this.onDestroy();
            this.loadSceneByName('hall_scene');
        } else {
            this.onReturnJinru(data);
        }
    },

    onReturnToupiao: function (data) {
        let len = Object.getOwnPropertyNames(this.userInfo).length;
        if (2 == len) return;
        if (this.vote_layer == null) {
            this.waiting_layer.active = true;
            var self = this;
            cc.loader.loadRes('Prefab/game/vote_layer', function (err, prefab) {
                self.vote_layer = cc.instantiate(prefab);
                self.vote_layer.parent = self.node_layer;
                self.vote_layer.getComponent('vote_layer').onOpenView(data);
                self.waiting_layer.active = false;
            });
        } else {
            if (this.vote_layer.active) {
                this.vote_layer.getComponent('vote_layer').onChangeView(data);
            } else {
                this.vote_layer.active = true;
                this.vote_layer.getComponent('vote_layer').onOpenView(data);
            }
        }
    },

    onReturnFast: function (data) {
        if (this.fast_layer == null) {
            this.waiting_layer.active = true;
            var self = this;
            cc.loader.loadRes('Prefab/game/fast_layer', function (err, prefab) {
                self.fast_layer = cc.instantiate(prefab);
                self.fast_layer.parent = self.node_layer;
                self.fast_layer.getComponent('fast_layer').onOpenView(data);
                self.waiting_layer.active = false;
            });
        } else {
            if (this.fast_layer.active) {
                this.fast_layer.getComponent('fast_layer').onChangeView(data);
            } else {
                this.fast_layer.active = true;
                this.fast_layer.getComponent('fast_layer').onOpenView(data);
            }
        }
    },

    /**
     * 返回开局信息
     * @param data
     */
    onReturnKaiju: function (data) {
        console.log("开局数据",data);
        cc.log(this.userInfo);
        this.isKaiju = true;
        this.detectIp();
        this.zhuang = data.zhuang;
        this.zf = data.zf;
        if (this.fast_layer && this.fast_layer.active) this.fast_layer.active = false;
        this.prepare_layer.active = false;
        this.game_layer.active = true;
        //console.log(this.player_id_arr);
        let arr = Object.keys(this.userInfo);
        cc.log(arr);
        this.game_ren = arr.length;
        this.player_node_arr = [];
        this.player_node_arr[0] = this.game_layer.getChildByName("player0");
        this.player_node_arr[1] = this.game_layer.getChildByName("player1");
        this.player_node_arr[2] = this.game_layer.getChildByName("player2");
        this.player_node_arr[3] = this.game_layer.getChildByName("player3");
        if (this.game_ren == 2) {
            this.player_node_arr[1] = this.game_layer.getChildByName("player2");
            this.game_layer.getChildByName("player2").active = true;
        } else if (this.game_ren == 3) {
            this.player_node_arr[1] = this.game_layer.getChildByName("player1");
            this.player_node_arr[2] = this.game_layer.getChildByName("player2");
            this.game_layer.getChildByName("player1").active = true;
            this.game_layer.getChildByName("player2").active = true;
        } else {
            this.player_node_arr[1] = this.game_layer.getChildByName("player1");
            this.player_node_arr[2] = this.game_layer.getChildByName("player2");
            this.player_node_arr[3] = this.game_layer.getChildByName("player3");
            this.game_layer.getChildByName("player1").active = true;
            this.game_layer.getChildByName("player2").active = true;
            this.game_layer.getChildByName("player3").active = true;
        }

        this.showUserInfo(); //展示用户信息   158595912

        for (let i = 0; i < 4; i++) {
            this.player_node_arr[i].getChildByName("handpai").active = true;
            this.player_node_arr[i].getChildByName("outpai").removeAllChildren();
            this.player_node_arr[i].getChildByName("buhua_pai").removeAllChildren();
        }
        this.maj_out_pai = [0, 0, 0, 0]; //重置打出的牌数据
        this.special_pai = [[], [], [], []]; //重置碰杠牌数据
        this.maj_hand_pai = [[], 13, 13, 13];
        this.timer_layer.getChildByName("pai_num").getChildByName("num").getComponent(cc.Label).string = data.pais_num;
        this.timer_layer.getChildByName("ju_num").getChildByName("num").getComponent(cc.Label).string = parseInt(this.roomInfo.guize.jushu) - parseInt(data.ju);
        //自己的牌数据
        var pai_arr = data.pais;
        pai_arr.sort(function (a, b) {
            return a - b
        }); //排序
        console.log(this.maj_hand_pai);
        this.maj_hand_pai[0] = pai_arr;
        //this.onShowBeginGame(data.zhuang);

        this.timer_layer.active = true;
        for (var i = 0; i < this.game_ren; i++) {
            var id = this.player_id_arr[i];
            if (id == 0 || id.toString() == "0") continue;
            if (this.game_ren == 2 && i == 1) {
                this.onShowHandPaiInfo(2);
            } else {
                this.onShowHandPaiInfo(i);
            }
        }
    },

    /**
     * 开局之后同ip检测，提醒
     */
    detectIp: function () {
        let arr = [];
        if ("1" == this.roomInfo.guize.ip.toString()) {
            for (let i = 0; i < this.player_id_arr.length; i++) {
                let id_0 = this.player_id_arr[i];
                if (id_0 != 0 && this.userInfo.hasOwnProperty(id_0)) {
                    let ip_0 = this.userInfo[id_0].ip;
                    let str_name = "";
                    for (let j = 0; j < this.player_id_arr.length; j++) {
                        let id_1 = this.player_id_arr[j];
                        if (id_1 != 0 && this.userInfo.hasOwnProperty(id_1)) {
                            let ip_1 = this.userInfo[id_1].ip;
                            if (ip_0 == ip_1) {
                                let name = this.userInfo[id_1].nickname;
                                str_name += name + "_";
                            }
                        }
                    }
                    if ("" != str_name && arr.indexOf(str_name) == -1) {
                        arr.push(str_name);
                    }
                }
            }
        }

        //let len = Object.getOwnPropertyNames(this.userInfo).length;
        let str = "";
        for (let i = 0; i < arr.length; i++) {
            let arr_2 = arr[i].split("_");
            for (let j = 0; j < arr_2.length; j++) {
                if ("" != arr_2[j]) {
                    str += "玩家【" + arr_2[j] + "】与"
                }
            }
            let str_0 = str[str.length - 1];
            if ("与" == str_0) {
                str = str.substring(0, str.length - 1);
                str += "ip相同，请其他玩家注意！\n"
            }
        }
        if("" != str) cc.loadingControl.onToggleView('notice_layer', str);
        cc.log(arr, str);
    },

    onReturnBuhua: function (data) {
        console.log(data);
        console.log(this.player_id_arr);
        if (this.game_ren == 2) {
            this.maj_buhua_arr[0] = data.hua[this.player_id_arr[0]];
            this.maj_buhua_arr[2] = data.hua[this.player_id_arr[1]]
        } else {
            for (let i = 0; i < this.player_id_arr.length; i++) {
                this.maj_buhua_arr[i] = data.hua[this.player_id_arr[i]]
            }
        }
        this.maj_hand_pai[0] = data.pais;
        console.log(this.maj_buhua_arr);
        for (let i = 0; i < this.maj_buhua_arr.length; i++) {
            if (this.maj_buhua_arr[i]) {
                this.showBuhua(i);
            }
        }
    },

    /**
     * 展示补花的牌
     */
    showBuhua: function (dir) {
        if (this.maj_buhua_arr[dir].length != 0) {
            this.player_node_arr[dir].getChildByName("buhua_pai").removeAllChildren();
            this.player_node_arr[dir].getChildByName("buhua_pai").active = true;
            var buhua_arr = this.maj_buhua_arr[dir]; //桌面上的牌对象
            console.log(buhua_arr);
            for (let j = 0; j < buhua_arr.length; j++) {
                this.onShowHandPaiInfo(dir);
                var buhua_pai = cc.instantiate(this.chupai_prefab);
                var x = this.maj_out_buhua_begin_pos[dir].x;
                var y = this.maj_out_buhua_begin_pos[dir].y;
                if (dir == 0 || dir == 2) {
                    buhua_pai.scale = 0.8;
                    x += j * this.maj_out_space[dir];
                } else {
                    buhua_pai.scale = 1.2;
                    y += j * this.maj_out_space[dir];
                    if (dir == 1) {
                        buhua_pai.zIndex = 4 - j;
                    }
                }
                buhua_pai.position = cc.v2(x, y);
                console.log(cc.v2(x, y));
                buhua_pai.parent = this.player_node_arr[dir].getChildByName("buhua_pai");
                buhua_pai.active = true;
                if (dir == 0 || dir == 2) {
                    this.showMajIcon(buhua_pai, buhua_arr[j], 2);
                } else {
                    this.showMajIcon(buhua_pai, buhua_arr[j], dir);
                }
            }
        }
    },

    onReturnGameOver: function () {
        this.onDestroy();
        this.loadSceneByName('hall_scene');
    },

    onReturnZhuapai: function (data) {
        console.log("收到抓牌信息-------------------------------------------");
        console.log(data);
        this.timer_layer.getChildByName("pai_num").getChildByName("num").getComponent(cc.Label).string = data.pais_num;
        this.beginChupaiTimeOut();
        this.onShowTimeDir(data.mid);
        this.onShowQiPai(data);

        if (data.mid.toString() == cc.vv.userData.mid.toString()) {
            cc.log("听胡预警：", this.ting_hu);
            if (this.ting_hu && 0 < this.ting_hu.length) {
                this.tingHuChange(this.ting_hu);
            }
            this.isZhuapai = true;
            this.zhuapai = data.pai;
        } else {
            this.isZhuapai = false;
            this.zhuapai = null;
        }
        if (data.tixing.toString() == "1") {
            cc.loadingControl.showMsg("最后四张");
        }
    },

    onReturnHua: function (data) {
        console.log(data);
        var dir = -1;
        console.log(this.player_id_arr);
        for (var i = 0; i < this.player_id_arr.length; i++) {
            var id = this.player_id_arr[i];
            if (id.toString() == data.mid.toString()) {
                if (this.game_ren == 2 && i == 1) {
                    dir = 2;
                } else {
                    dir = i;
                }
            }
        }
        this.maj_buhua_arr[dir].push(data.hua);
        this.showBuhua(dir);
        console.log(this.maj_buhua_arr);
        if (data.tixing.toString() == "1") {
            cc.loadingControl.showMsg("最后四张");
        }
    },

    /**
     * 返回打牌信息
     */
    onReturnDapai: function (data) {
        this.isZhuapai = false;
        this.isCaozuo = false;

        if (data.mid.toString() == cc.vv.userData.mid.toString()) {
            //console.log("好像要听胡了", data.hu);
            if (data.hu && [] != data.hu) {
                this.ting_hu = data.hu;
            }
            if (data.hu.length > 0) {
                this.tingHuChange(data.hu);
            } else {
                this.game_layer.getChildByName("hu").active = false;
                this.game_layer.getChildByName("hu").width = 70;
                this.game_layer.getChildByName("hu").getChildByName("view").removeAllChildren();
            }
            for (let i = 0; i < this.maj_hand_pai[0].length; i++) {
                var maj_arr = this.maj_hand_arr[0]; //手上的牌对象
                var maj_js = maj_arr[i].getComponent("maj_control");
                maj_js.setEnable(true)
            }
        } else {
            this.paiAndTing = data.pai;
            if (this.ting_hu && 0 < this.ting_hu.length) {
                for (let i in this.ting_hu) {
                    if (this.ting_hu[i].pai == data.pai) {
                        this.ting_hu[i].num -= 1;
                        break;
                    }
                }
                this.tingHuChange(this.ting_hu);
            }
        }

        this.onShowTimeDir(-1);
        this.beginChupaiTimeOut();
        this.clearOutPaiPointer();
        this.current_q = -1;
        var mid = data.mid; //出牌者
        var pai = data.pai; //牌

        var sex = this.userInfo[data.mid].sex; //获取到性别
        cc.vv.audioMgr.playSoundName(sex, 0, pai);

        for (let i = 0; i < 4; i++) {
            let id = this.player_id_arr[i];
            if (id.toString() == mid.toString()) {
                if (this.game_ren == 2 && i == 1) {
                    this.doChuPaiInHandPai(2, pai, mid);
                } else {
                    this.doChuPaiInHandPai(i, pai, mid);
                }
                if (i == 0) {
                    this.isSendPai = false;
                    this.selectePai = -1;
                    this.current_maj = null;
                    this.onTouchPaiFun(null);
                }
                break;
            }
        }
    },

    /**
     * 听胡界面更新 
     */
    tingHuChange: function (data) {
        this.game_layer.getChildByName("hu").active = true;
        this.game_layer.getChildByName("hu").getChildByName("view").removeAllChildren();
        this.game_layer.getChildByName("hu").width = 70 + data.length * 45;
        for (let i = 0; i < data.length; i++) {
            var hu_pai = cc.instantiate(this.hu_pai_prefab); //出的牌
            hu_pai.position = cc.v2(i * 45, -5);
            hu_pai.parent = this.game_layer.getChildByName("hu").getChildByName("view");
            this.showMajIcon(hu_pai, data[i].pai, 0);
            hu_pai.getChildByName("num").getComponent(cc.Label).string = data[i].num + "张";
            if (0 == data[i].num) {
                hu_pai.color = cc.color(96, 96, 96);
            } else {
                hu_pai.color = cc.color(255, 255, 255);
            }
            this.is_ting_hu = true;
        }
    },

    onReturnCaozuo_tx: function (data) {
        console.log("操作提醒 ", data);
        this.isCanTouch = false;
        this.caozuo_tx_data = data;
        if (data.mid.toString() != cc.vv.userData.mid.toString()) {
            return;
        }
        this.isCanSendpai = false;
        this.handle_status = data.status; //0过   1234吃碰杠胡
        this.caozuo_pai = data.pais.pai;

        //指向自己
        this.onShowTimeDir(cc.vv.userData.mid);
        for (var i = 0; i < 5; i++) {
            this.handleBtn_arr_layer.getChildByName("handler" + i).active = false;
        }
        var begin = cc.v2(200, 0);
        var len = this.handle_status.length;
        for (var j = len - 1; j >= 0; j--) {
            var type = this.handle_status[j];
            this.handleBtn_arr_layer.getChildByName("handler" + type).active = true;
            this.handleBtn_arr_layer.getChildByName("handler" + type).position = begin;
            begin.x -= 160;
        }

        this.handleBtn_arr_layer.getChildByName("handler0").active = true;
        this.showCaozuoPai();
    },

    /***
     *吃碰杠  返回操作信息
     * @param data
     */
    onReturnCaozuo: function (data) {
        cc.log("操作信息", data);
        this.isCanTouch = true;
        //this.beginChupaiTimeOut();
        var da = data.da_mid; //打出牌的人
        var mid = data.mid; //碰杠操作的人
        var pai = data.pai; //要处理的牌
        var chi = data.chi; //吃的牌
        this.sanbi = data.sanbi; //三比玩家ID
        var status = data.status; //1.吃 2碰 3杠
        var type = data.type; //(杠的时候参考  1明杠、2暗杠、3补杠、4痞子癞子杠)
        var dir = -1;

        for (let i = 0; i < 4; i++) {
            let id = this.player_id_arr[i];
            if (id.toString() == mid.toString()) {
                if (this.game_ren == 2 && i == 1) {
                    dir = 2;
                } else {
                    dir = i;
                }
                break;
            }
        }
        if (data.tixing_0.toString() != "0") {
            let name = this.userInfo[data.tixing_0].nickname;
            if (data.tixing_0.toString() == cc.vv.userData.mid.toString()) {
                cc.loadingControl.showMsg("玩家" + name + "被同一玩家吃碰了2次，请注意吃三比");
            }
        }
        if (data.tixing_1.toString() != "0") {
            let name = this.userInfo[data.tixing_1].nickname;
            cc.loadingControl.showMsg("玩家" + name + "被同一玩家吃碰了3次，达成吃三比关系");
        }

        if (this.ting_hu && 0 < this.ting_hu.length) {
            for (let i in this.ting_hu) {
                if (this.ting_hu[i].pai == data.pai) {
                    if (this.paiAndTing == data.pai) {
                        this.ting_hu[i].num += 1;
                    }
                    if (status == 1) {
                        this.ting_hu[i].num -= 1;
                    } else if (status == 2) {
                        this.ting_hu[i].num -= 3;
                    } else if (status == 3) {
                        this.ting_hu[i].num -= 4;
                    }
                    break;
                } else {
                    if (status == 1) {
                        for (let j in data.chi) {
                            if (this.ting_hu[i].pai == data.chi[j]) {
                                this.ting_hu[i].num -= 1;
                            }
                        }
                    }
                    break;
                }
            }
            this.tingHuChange(this.ting_hu);
        }
        if (this.paiAndTing) this.paiAndTing = null;

        var sex = this.userInfo[data.mid].sex;
        if (status == 1) {
            cc.vv.audioMgr.playSoundName(sex, "chi", pai);
            this.current_q = dir;
            this.cirrent_dir = dir;
        } else if (status == 2) {
            cc.vv.audioMgr.playSoundName(sex, "peng", pai);
            this.current_q = dir;
            this.cirrent_dir = dir;
        } else if (status == 3) {
            cc.vv.audioMgr.playSoundName(sex, "gang", pai);
        }

        this.onShowTimeDir(data.mid);
        this.showCaozuoAnimation(status, dir);

        if (status.toString() == "1" && mid.toString() == cc.vv.userData.mid.toString()) { //状态为4  这是胡牌
            this.setPaiUntouched(pai, chi);
        }
        var type_ziji = da == mid ? 0 : 1; //0自摸，1别人的
        if (da.toString() == "") type_ziji = 0;

        //var user = this.userInfo[mid];
        var da_dir = 0;
        for (let i = 0; i < this.player_id_arr.length; i++) {
            let id = this.player_id_arr[i];
            if (type_ziji.toString() == "1" && id.toString() == da.toString()) {
                if (this.game_ren == 2 && i == 1) {
                    da_dir = 2;
                } else {
                    da_dir = i;
                }
            }
        }
        console.log("type=" + type.toString());
        console.log("type_ziji=" + type_ziji.toString());
        this.sanbiChange();
        this.onShowPengGangPai(this.current_dir, pai, status, type_ziji, mid, da_dir, chi);
    },

    /** 
     * 吃啥限制的啥
     */
    setPaiUntouched: function (pai, chi) {
        console.log("执行了不能操作的牌是=" + pai);
        //1234567          4   7 , 1
        var index = -1;
        var arr = [];
        for (let i = 0; i < 3; i++) {
            arr[i] = parseInt(chi[i]);
        }
        arr.sort();
        for (let i = 0; i < 3; i++) {
            if (pai.toString() == arr[i].toString()) {
                index = i;
            }
        }
        var pai1 = 0;
        if (index == 0) { //吃的是第一张
            pai1 = parseInt(pai) + 3
        } else if (index == 2) { //吃的是第三张
            pai1 = parseInt(pai) - 3
        }
        if (pai1 % 10 == 0) {
            pai1 = 0;
        }

        console.log("吃啥限制的啥pai1=" + pai1);

        for (let i = 0; i < this.maj_hand_pai[0].length; i++) {
            var maj_arr = this.maj_hand_arr[0]; //手上的牌对象
            var pai_arr = this.maj_hand_pai[0]; //手上的牌数据
            if (pai.toString() == pai_arr[i].toString()) {
                console.log("执行了让牌不能出事件");
                let maj_js = maj_arr[i].getComponent("maj_control");
                maj_js.setEnable(false)
            }
            if (pai1.toString() == pai_arr[i].toString()) {
                console.log("执行了让牌不能出事件");
                let maj_js = maj_arr[i].getComponent("maj_control");
                maj_js.setEnable(false)
            }
        }
    },

    /** 
     * 碰啥牌限制的啥牌
     */
    setPengUntouched: function (pai) {
        console.log("碰啥限制的啥pai1=" + pai);

        for (let i = 0; i < this.maj_hand_pai[0].length; i++) {
            var maj_arr = this.maj_hand_arr[0]; //手上的牌对象
            var pai_arr = this.maj_hand_pai[0]; //手上的牌数据
            if (pai.toString() == pai_arr[i].toString()) {
                console.log("执行了让牌不能出事件");
                let maj_js = maj_arr[i].getComponent("maj_control");
                maj_js.setEnable(false)
            }
        }
    },

    /**
     * 胡了
     * @param data
     */
    onReturnHu: function (data) {
        this.sanbi = [];
        this.lixian = [];
        this.ting_hu = null;
        this.current_q = -1; //当前启牌状态  置空
        this.current_dir = -1; //当前出牌方向  置空
        for (let i = 0; i < 5; i++) {
            this.handleBtn_arr_layer.getChildByName("handler" + i).active = false;
        }
        this.handle_status = [];
        //展示胡牌效果
        if (data.hu_mid.length > 0) {
            var sex = this.userInfo[data.hu_mid[0]].sex;
            cc.vv.audioMgr.playSoundName(sex, "hu", "");
        }
        var isMine = false;
        for (let t = 0; t < data.hu_mid.length; t++) {
            var dir = -1;
            if (data.hu_mid[t].toString() == cc.vv.userData.mid.toString()) {
                isMine = true;
            }
            for (let i = 0; i < 4; i++) {
                var id = this.player_id_arr[i];
                if (id.toString() == data.hu_mid[t].toString()) {
                    if (this.game_ren == 2 && i == 1) {
                        dir = 2;
                    } else {
                        dir = i;
                    }
                    break;
                }
            }
            if (dir != -1) {
                this.showCaozuoAnimation(4, dir);
            }
        }

        //显示中鱼
        this.showFish(data);

        let num = 0;
        if(0 == cc.vv.userData.language_type) num = 4;
        else num = 2;
        //展示胡牌信息
        this.scheduleOnce(function () {
            if (isMine) {
                cc.vv.audioMgr.playSFX('win', 'mp3');
            } else {
                cc.vv.audioMgr.playSFX('lose', 'mp3');
            }

            if (this.hupaizhanji_layer == null) {
                this.waiting_layer.active = true;
                var self = this;
                cc.loader.loadRes('Prefab/game/hupaizhanji_layer', function (err, prefab) {
                    self.hupaizhanji_layer = cc.instantiate(prefab);
                    //cc.log(self.node_layer);
                    self.hupaizhanji_layer.parent = self.node_layer;
                    self.hupaizhanji_layer.getComponent('hupaizhanji_layer').onOpenView(data);
                    self.waiting_layer.active = false;
                });
            } else {
                this.hupaizhanji_layer.active = true;
                this.hupaizhanji_layer.getComponent('hupaizhanji_layer').onOpenView(data);
            }
        }.bind(this), num);
    },

    /**
     * 显示中鱼
     * */
    showFish: function (data) {
        cc.log(data);
        for (let i = 0; i < this.player_id_arr.length; i++) {
            let node = this.player_node_arr[i];
            cc.log(this.player_id_arr[i]);
            for (let t = 0; t < data.hu_mid.length; t++) {
                var yu_container = node.getChildByName("yu");
                yu_container.removeAllChildren();
                if (this.player_id_arr[i].toString() == data.hu_mid[t].toString()) {
                    yu_container.active = true;
                    for (let a = 0; a < data.fish[this.player_id_arr[i]].yu.length; a++) {
                        var pai = cc.instantiate(this.hu_pai_prefab);
                        this.showMajIcon(pai, data.fish[this.player_id_arr[i]].yu[a], 2);
                        pai.parent = yu_container;
                        pai.getChildByName("num").active = false;
                        pai.scale = 1;
                        pai.y = 0;
                        pai.color = cc.color(255, 255, 255);
                        for (let b = 0; b < data.fish[this.player_id_arr[i]].zhong.length; b++) {
                            if (data.fish[this.player_id_arr[i]].yu[a].toString() == data.fish[this.player_id_arr[i]].zhong[b].toString()) {
                                pai.color = cc.color(150, 255, 255);
                                break;
                            }
                        }
                    }
                    break;
                } else {
                    yu_container.active = false;
                }
            }
        }
    },

    /**
     * 返回玩家继续准备信息
     * @param data
     */
    onReturnJixu: function (data) {
        //todo   2018年11月12日17:56:00
    },

    /**
     *收到玩家发送的消息
     * @param data
     */
    onReturnXiaoxi: function (data) {
        var dir = -1;
        var _dir = -1;
        for (var i = 0; i < this.player_id_arr.length; i++) {
            var id = this.player_id_arr[i];
            if (data.mid.toString() == id.toString()) {
                if (this.game_ren == 2 && i == 1) {
                    dir = 2;
                } else {
                    dir = i;
                }
            } else if (data.toMid && data.toMid.toString() == id.toString()) {
                _dir = i;
            }
        }
        if (4 === data.type) {
            this.showInteractive(data, dir, _dir);
            return;
        }
        this.showChatMsg(data, dir);
    },

    /**
     * 播放互动表情
     */
    showInteractive: function (data, dir, _dir) {
        cc.log(dir, _dir);
        let user_chat = this.player_node_arr[dir].getChildByName("user").getChildByName("chat");
        user_chat.active = true;
        let other_chat = this.player_node_arr[_dir].getChildByName("user").getChildByName("chat");
        other_chat.active = true;
        let user_hudong = user_chat.getChildByName("hudong");
        let other_hudong = other_chat.getChildByName("hudong");
        let worldPos = other_hudong.parent.convertToWorldSpaceAR(other_hudong.position);
        let pos = user_hudong.convertToNodeSpaceAR(worldPos);

        let skeletonData = "";
        let msg_arr = ["meigui", "jidan", "feiwen", "tuoxie", "ganbei", "zhadan"];
        for (let i = 0; i < msg_arr.length; i++) {
            if (i == data.msg) {
                skeletonData = msg_arr[i];
                break;
            }
        }
        let animationName = "animation1";
        let _animationName = "animation2";

        cc.loader.loadRes("spine/hudongbiaoqing/" + skeletonData, sp.SkeletonData, function (err, spData) {
            let sp1 = user_hudong.getComponent(sp.Skeleton);
            let sp2 = other_hudong.getComponent(sp.Skeleton);
            sp1.skeletonData = spData;
            sp2.skeletonData = spData;
            sp1.clearTrack(0);
            sp2.clearTrack(0);
            user_hudong.active = true;
            sp1.setAnimation(0, animationName, true);
            var actionBy = cc.moveTo(1.5, pos);
            user_hudong.runAction(actionBy);

            setTimeout(function () {
                user_hudong.active = false;
                user_hudong.position = cc.v2(0, 0);
                other_hudong.active = true;
                sp2.setAnimation(0, _animationName, true);
            }.bind(this), 1500);
        }.bind(this));

        setTimeout(function () {
            other_hudong.active = false;
        }.bind(this), 3000);
    },

    /**
     *展示玩家消息    含  0表情    1快捷语    2文字   3,语音   （4互动表情）
     * @param data       msg     消息主体
     *                   type     类型
     *                   toMid
     * @param dir  谁发出的
     */
    showChatMsg: function (data, dir) {
        var user_chat = this.player_node_arr[dir].getChildByName("user").getChildByName("chat");
        user_chat.active = true;
        var delayTime = 2500;
        if (data.type == 0) {
            var emoji_view = user_chat.getChildByName("face");
            emoji_view.active = true;
            var emoji = emoji_view.getComponent(cc.Sprite);
            console.log(this.emoji_atlas);
            emoji.spriteFrame = this.emoji_atlas.getSpriteFrame("chat-chat_" + data.msg);
            emoji_view.runAction(cc.sequence(cc.moveBy(0.15, 0, 15), cc.moveBy(0.15, 0, -15), cc.moveBy(0.15, 0, 15), cc.moveBy(0.15, 0, -15), cc.moveBy(0.15, 0, 15),
                cc.moveBy(0.15, 0, -15), cc.moveBy(0.15, 0, 15), cc.moveBy(0.15, 0, -15)));
        } else if (data.type == 1) {
            user_chat.getChildByName("text").active = true;
            user_chat.getChildByName("text").getChildByName("lab").active = true;
            let text_lab = user_chat.getChildByName("text").getChildByName("lab").getComponent(cc.Label);
            text_lab.string = TEXT_ARR[parseInt(data.msg)];
            user_chat.getChildByName("text").width = user_chat.getChildByName("text").getChildByName("lab").width + 40;
        } else if (data.type == 2) {
            user_chat.getChildByName("text").active = true;
            user_chat.getChildByName("text").getChildByName("lab").active = true;
            let text_lab = user_chat.getChildByName("text").getChildByName("lab").getComponent(cc.Label);
            text_lab.string = data.msg;
            user_chat.getChildByName("text").width = user_chat.getChildByName("text").getChildByName("lab").width + 40;
        } else if (data.type == 3) {
            user_chat.getChildByName("text").active = true;
            user_chat.getChildByName("text").getChildByName("voice_ani").active = true;
            user_chat.getChildByName("text").width = 140;

            var msgfile = "voicemsg.amr";
            cc.vv.voiceMgr.writeVoice(msgfile, data.msg);
            cc.vv.voiceMgr.play(msgfile);
            delayTime = parseInt(data.time);
            setTimeout(function () {
                console.log("执行了播放录音" + delayTime + "时间后开始恢复背景音乐");
                cc.vv.audioMgr.playBGM("bgm_game", "mp3");
            }.bind(this), data.time);
            console.log("deleattime=" + delayTime);
        }
        setTimeout(function () {
            user_chat.getChildByName("face").active = false; //文字界面消失
            user_chat.getChildByName("text").active = false; //emoji界面消失
            user_chat.getChildByName("text").getChildByName("lab").active = false;
            user_chat.getChildByName("text").getChildByName("voice_ani").active = false;
            user_chat.getChildByName("text").width = 100;
            user_chat.active = false;
        }.bind(this), delayTime);
    },

    onReturnChonglian: function (data) {
        console.log("返回了重连信息", data);
        if (data.mid.toString() == cc.vv.userData.mid.toString()) {
            cc.vv.WebSocket.sendWS('GameController', 'getgame', {
                mid: cc.vv.userData.mid,
                room_id: cc.vv.Global.room_id
            });
        } else { //其他人重连上来
            this.onLixian(data.mid, false);
        }
    },

    /**
     * 更新离线玩家显示
     */
    updateLixian: function () {
        for (let i = 0; i < this.player_id_arr.length; i++) {
            let id = this.player_id_arr[i];
            if(this.lixian[id] && this.lixian[id] == id){
                this.onLixian(id, true)
            }else{
                let node = this.player_node_arr[i].getChildByName("user");
                let offline = node.getChildByName("offline");
                offline.active = false;
                let lab = offline.getChildByName("label").getComponent(cc.Label);
                lab.string = "已离线";
                this.broadcostTime_arr[i] = -1;
            }
        }
    },

    /**
     * 显示玩家离线
     * @param data
     */
    onLixian: function (data, bool) {
        for (var i = 0; i < this.player_id_arr.length; i++) {
            //cc.log("离线：", this.player_id_arr[i]);
            if (data == this.player_id_arr[i]) {
                let node = this.player_node_arr[i].getChildByName("user");
                let offline = node.getChildByName("offline");
                offline.active = bool;
                let str = "玩家" + node.getChildByName("lab0").getComponent(cc.Label).string;
                if (bool) {
                    str += "已离线";
                    this.broadcostTime_arr[i] = 0;
                } else {
                    this.broadcostTime_arr[i] = -1;
                    str += "已上线"
                }
                // this.schedule(this.doCountdownTime.bind(this), 1);
                // this.doCountdownTime();
                cc.loadingControl.showMsg(str);
                break;
            }
        }
    },

    //倒计时
    doCountdownTime: function () {
        //每秒更新显示信息
        let number = 0,
            tenNum = 0,
            res = 0;
            // num = 0,
        for (var i = 0; i < this.player_id_arr.length; i++) {
            let node = cc.find("user/offline/label", this.player_node_arr[i]).getComponent(cc.Label);
            number = this.broadcostTime_arr[i];
            if (-1 != number) {
                number += 1;
                this.broadcostTime_arr[i] = number;
                if (60 <= number) {
                    tenNum = Math.floor(number / 60);
                }
                res = number % 60;
                tenNum = "0" + tenNum;
                res = "0" + res;
                if (3 == tenNum.length && "0" == tenNum[0]) tenNum = tenNum.slice(1);
                if (3 == res.length && "0" == res[0]) res = res.slice(1);
                node.string = "已离线" + tenNum + ":" + res;
            } else {
                node.string = "已离线";
                // num += 1;
            }
        }
        // if (4 == num) {
        //     this.unschedule(this.doCountdownTime);
        // }
    },

    onReturnGetGame: function (data) {
        console.log("返回断线重连信息", data);

        //游戏已经开始
        if (data.status == 1) {
            //if (this.game_layer.getChildByName("player0").active) return;
            this.isKaiju = true;
            this.zhuang = data.zhuang;
            this.sanbi = data.sanbi;
            this.lixian = data.roomInfo.lixian;
            this.zf = data.roomInfo.zf;
            this.timer_layer.getChildByName("pai_num").getChildByName("num").getComponent(cc.Label).string = data.pais_num;
            this.timer_layer.getChildByName("ju_num").getChildByName("num").getComponent(cc.Label).string = parseInt(this.roomInfo.guize.jushu) - parseInt(data.ju);
            this.timer_layer.active = true;
            this.prepare_layer.active = false;
            this.game_layer.active = true;
            this.player_node_arr = [];
            this.player_node_arr[0] = this.game_layer.getChildByName("player0");
            this.player_node_arr[1] = this.game_layer.getChildByName("player1");
            this.player_node_arr[2] = this.game_layer.getChildByName("player2");
            this.player_node_arr[3] = this.game_layer.getChildByName("player3");
            if (this.game_ren == 2) {
                this.player_node_arr[1] = this.game_layer.getChildByName("player2");
                this.game_layer.getChildByName("player2").active = true;
            } else if (this.game_ren == 3) {
                this.player_node_arr[1] = this.game_layer.getChildByName("player1");
                this.player_node_arr[2] = this.game_layer.getChildByName("player2");
                this.game_layer.getChildByName("player1").active = true;
                this.game_layer.getChildByName("player2").active = true;
            } else {
                this.player_node_arr[1] = this.game_layer.getChildByName("player1");
                this.player_node_arr[2] = this.game_layer.getChildByName("player2");
                this.player_node_arr[3] = this.game_layer.getChildByName("player3");
                this.game_layer.getChildByName("player1").active = true;
                this.game_layer.getChildByName("player2").active = true;
                this.game_layer.getChildByName("player3").active = true;
            }

            this.updateLixian();
            this.showUserInfo(); //展示用户信息   158595912

            for (let i = 0; i < 4; i++) {
                this.player_node_arr[i].getChildByName("handpai").active = true;
                this.player_node_arr[i].getChildByName("outpai").removeAllChildren();
                this.player_node_arr[i].getChildByName("buhua_pai").removeAllChildren();
            }

            this.maj_out_arr = [[], [], [], []]; //四组打出来的麻将对象
            this.maj_out_pai = [0, 0, 0, 0]; //重置打出的牌数据
            this.special_pai = [[], [], [], []]; //重置碰杠牌数据
            this.maj_hand_pai = [[], 13, 13, 13];

            if (data.now != null && data.now.toString() == cc.vv.userData.mid.toString()) {
                this.isCanTouch = true;
                this.current_q = 1;
                this.current_dir = 0;
                //this.isSendPai == false;
                this.isSendPai = false;
                this.beginChupaiTimeOut();
            }
            this.onShowTimeDir(data.now);
            if (data.jx) {
                this.onJixuClicked();
                return;
            }
            this.timer_layer.getChildByName("pai_num").getChildByName("num").getComponent(cc.Label).string = data.pais_num;
            this.timer_layer.getChildByName("ju_num").getChildByName("num").getComponent(cc.Label).string = parseInt(this.roomInfo.guize.jushu) - parseInt(data.ju);
            for (let i = 0; i < this.game_ren; i++) {
                this.maj_hand_pai[i] = data.pais[this.player_id_arr[i]].s;
            }
            for (let i = 0; i < this.game_ren; i++) {
                var id = this.player_id_arr[i];
                var dir = -1;
                if (this.game_ren == 2 && i == 1) {
                    dir = 2;
                } else {
                    dir = i;
                }
                var hand_arr = this.special_pai[dir]; //麻将碰杠数据组
                if (id == 0 || id.toString() == "0") {
                    continue;
                }
                var element = data.pais[this.player_id_arr[i]];
                //显示打出的牌
                if (element.hasOwnProperty("d")) {
                    let d = element["d"]; //对象
                    this.onShowAllChuPai(dir, d);
                }
                //处理碰和明杠牌信息
                if (element.hasOwnProperty("z")) {
                    var z = element["z"]; //数组
                    var peng_arr = [];
                    for (var j = 0; j < z.length; j++) {
                        var type = z[j].status;
                        var count = z[j].pais.length;
                        let d = -1;
                        for (let s = 0; s < this.player_id_arr.length; s++) { //判断碰杠牌的指向
                            if (z[j].d_mid.toString() == this.player_id_arr[s].toString()) {
                                d = s;
                                if (this.game_ren == 2 && s == 1) {
                                    d = 2;
                                } else {
                                    d = s;
                                }
                            }
                        }
                        if (count == 3) { //碰
                            hand_arr.push({
                                status: type,
                                pai: z[j].pais,
                                gang: 0,
                                dir: d
                            });
                        } else if (count == 4) { //杠   分明杠  暗杠
                            if (z[j].d_mid.toString() == "") { //没有打牌mid信息即为暗杠
                                hand_arr.push({
                                    status: 3,
                                    pai: z[j].pais,
                                    gang: 1,
                                    dir: d
                                }); //暗杠
                            } else {
                                hand_arr.push({
                                    status: 3,
                                    pai: z[j].pais,
                                    gang: 0,
                                    dir: d
                                }); //明杠
                            }
                        }
                    }
                }
                //处理手上的牌
                if (element.hasOwnProperty("s")) {
                    let s = element["s"];
                    if (i == 0) {
                        this.maj_hand_pai[i] = s; //本人的是数组，里面是牌的内容
                        this.maj_hand_pai[i].sort(function (a, b) {
                            return a - b
                        }); //排序
                    } else {
                        if (s >= 14) {
                            s = 14;
                        }
                        this.maj_hand_pai[dir] = s; //不是本人的数据是数字.代表手上牌的长度
                    }
                }

                //处理起到手上的花牌
                if (element.hasOwnProperty("hua")) {
                    let hua = element["hua"];
                    this.maj_buhua_arr[dir] = hua;
                    console.log(this.maj_buhua_arr);
                    this.showBuhua(dir);
                }
                //处理起的牌
                var q = element["q"];
                if (q.toString() == "" || q == null) { //返回的起牌信息为空
                } else {
                    if (dir == 0) {
                        this.current_dir = 0;
                        this.current_q = q;
                        this.isCanTouch = true;
                        this.maj_hand_pai[i].push(q);
                    } else {
                        this.current_dir = dir;
                        this.current_q = 1;
                        //其他人的牌，在手牌中已经算上数量了
                        this.maj_hand_pai[dir]++;
                    }
                }
                //添加碰杠牌
                if (hand_arr.length > 0) {
                    for (var h = 0; h < hand_arr.length; h++) {
                        this.onCreateSpecialPai(dir, h, true);
                    }
                }
                this.onShowHandPaiInfo(dir);
            }
        }
    },

    /**
     * 显示某个方向所有的出牌内容
     */
    onShowAllChuPai: function (dir, data) {
        var len = data.length;
        this.maj_out_pai[dir] = len; //每位玩家打出牌数量
        console.log(this.maj_out_pai);
        var out_arr = this.maj_out_arr[dir]; //桌面上的牌对象
        for (var i = 0; i < len; i++) {
            var out_pai = cc.instantiate(this.chupai_prefab); //出的牌
            out_arr.push(out_pai);
            if (dir == 0 || dir == 2) {
                out_pai.scale = 0.8;
            } else {
                out_pai.scale = 1.2;
            }
            out_pai.position = this.getOutPaiPosByIndex(dir, i);
            out_pai.parent = this.player_node_arr[dir].getChildByName("outpai");
            out_pai.zIndex = this.getOutPaiZindexByIndex(dir, i);
            if (dir == 0 || dir == 2) {
                this.showMajIcon(out_pai, data[i], 2);
            } else {
                this.showMajIcon(out_pai, data[i], dir);
            }
        }
    },

    /**
     * 点击继续 ，清除桌面牌  手牌等信息，展示准备标志
     */
    onJixuClicked: function () {
        this.game_layer.getChildByName("hu").active = false;
        this.special_pai = [[], [], [], []]; //存放4个玩家操作的数据
        this.special_arr = [[], [], [], []]; //存放4个玩家碰杠牌
        this.maj_hand_pai = [[], 13, 13, 13]; //手上麻将数据
        this.maj_out_arr = [[], [], [], []]; //四组打出来的麻将对象
        this.maj_out_pai = [0, 0, 0, 0]; //四组打出来的麻将数量

        for (var i = 0; i < 4; i++) {
            this.player_node_arr[i].getChildByName("outpai").removeAllChildren();
            this.player_node_arr[i].getChildByName("buhua_pai").removeAllChildren();
            this.player_node_arr[i].getChildByName("handpai").active = false;
            this.player_node_arr[i].getChildByName("yu").active = false;
            this.player_node_arr[i].getChildByName("specialpai").removeAllChildren();
        }
        if (this.hupaizhanji_layer != null) {
            this.hupaizhanji_layer.active = false;
        }
        cc.vv.WebSocket.sendWS('GameController', 'jixu', {
            mid: cc.vv.userData.mid,
            room_id: cc.vv.Global.room_id
        });
    },

    /**
     * 局数打完  展示战绩
     * @param data
     */
    showZhanji: function (data) {
        if (this.zhanji_layer == null) {
            this.waiting_layer.active = true;
            var self = this;
            cc.loader.loadRes('Prefab/game/gamezhanji_layer', function (err, prefab) {
                self.zhanji_layer = cc.instantiate(prefab);
                self.zhanji_layer.parent = self.node_layer;
                self.zhanji_layer.getComponent("gamezhanji_layer").onOpenView(data);
                self.waiting_layer.active = false;
            });
        } else {
            this.zhanji_layer.active = true;
            this.zhanji_layer.getComponent("gamezhanji_layer").onOpenView(data);
        }
    },

    onReturnJszhanji: function (data) {
        if (this.zhanji_layer == null) {
            this.waiting_layer.active = true;
            var self = this;
            cc.loader.loadRes('Prefab/game/gamezhanji_layer', function (err, prefab) {
                self.zhanji_layer = cc.instantiate(prefab);
                self.zhanji_layer.parent = self.node_layer;
                self.zhanji_layer.getComponent("gamezhanji_layer").onOpenView(data);
                self.waiting_layer.active = false;
            });
        } else {
            this.zhanji_layer.active = true;
            this.zhanji_layer.getComponent("gamezhanji_layer").onOpenView(data);
        }
    },

    /**
     * 处理自摸或者碰杠别人的牌
     * status   1chi   2peng   3gang
     * type     1别人   0 自己
     */
    onShowPengGangPai: function (dir, pai, status, type, mid, da_dir, chi) {
        var special_data_arr = this.special_pai[dir]; //手上的碰杠牌数据
        var isCreate = false,
            change_index = 0,
            count = 0;

        if (status.toString() == "1") { //吃
            change_index = special_data_arr.length;
            for (let i = 0; i < 3; i++) {
                if (pai.toString() != chi[i].toString()) {
                    this.onSpliceHandPai(dir, chi[i], 1, change_index);
                }
            }
            isCreate = true;
            special_data_arr.push({
                status: status,
                pai: chi,
                gang: 0,
                dir: da_dir
            });
            cc.log("执行了创建吃牌操作");
            this.isCanTouch = true;
        } else if (status.toString() == "2") { //碰
            special_data_arr.push({
                status: status,
                pai: [pai, pai, pai],
                gang: 0,
                dir: da_dir
            });
            isCreate = true; //需要创建牌
            change_index = special_data_arr.length - 1;
            count = 2; //删除的手牌
            this.isCanTouch = true;
        } else if (status.toString() == "3") { //杠
            cc.log("type=" + type);
            cc.log("type.toString()=" + type.toString());
            if (type.toString() == "0") { //自摸明杠
                let len = special_data_arr.length;
                let isZiMo = false; //有碰，自摸杠
                cc.log("pai=" + pai.toString());
                for (let i = 0; i < len; i++) {
                    let obj = special_data_arr[i];
                    cc.log(obj.pai.toString());
                    if (obj.pai[0].toString() == pai.toString()) {
                        isZiMo = true;
                        obj.status = status;
                        obj.dir = da_dir;
                        //修改原有的牌
                        isCreate = false;
                        change_index = i;
                        count = 1;
                        cc.log("碰变杠执行");
                        break;
                    }
                }
                //自摸暗杠
                if (isZiMo == false) {
                    special_data_arr.push({
                        status: status,
                        pai: [pai, pai, pai, pai],
                        gang: 1,
                        dir: -1
                    });
                    isCreate = true; //创建新的
                    change_index = special_data_arr.length - 1;
                    count = 4;
                }
            } else {
                let len = special_data_arr.length;
                var isBugang = false;
                for (let i = 0; i < len; i++) {
                    let obj = special_data_arr[i];
                    cc.log(obj.pai.toString());
                    if (obj.pai[0].toString() == pai.toString()) { //遍历特殊牌 看是否相同
                        isBugang = true;
                        obj.status = status;
                        obj.dir = da_dir;
                        //修改原有的牌
                        isCreate = false;
                        change_index = i;
                        count = 1;
                        cc.log("碰变杠执行");
                        break;
                    }
                }
                if (isBugang == false) { //不是补杠
                    special_data_arr.push({
                        status: status,
                        pai: [pai, pai, pai, pai],
                        gang: 0,
                        dir: da_dir
                    });
                    isCreate = true;
                    change_index = special_data_arr.length - 1;
                    count = 3;
                }
            }
        }
        //先删除手上的牌数据
        if (status.toString() != "1") {
            this.onSpliceHandPai(dir, pai, count, change_index);
        }
        //吃别人打的牌(清除别人出牌区的碰杠牌)
        if (type.toString() == "1") {
            this.onCleanDeskTopPai(da_dir, dir, change_index, isCreate);
        }

        //创建吃碰杠牌
        this.scheduleOnce(function (dir, change_index, isCreate) {
            this.onCreateSpecialPai(dir, change_index, isCreate);
            this.onShowHandPaiInfo(dir);
        }.bind(this, dir, change_index, isCreate), 0.3);

        if (dir == 0) {
            this.scheduleOnce(function () {
                this.isSendPai = false;
            }, 0.1);
        }

        if (status.toString() == "2" && mid.toString() == cc.vv.userData.mid.toString()) {
            this.setPengUntouched(pai);
        }
    },

    /**
     * 清除桌面上的牌
     */
    onCleanDeskTopPai: function (dir, current_dir, change_index) {
        var out_arr = this.maj_out_arr[dir]; //桌面上的牌对象
        var space = this.maj_hand_space_arr[current_dir];
        var begin = this.getSpecialPaiPosByIndex(current_dir, change_index);
        //最后打出的一个牌
        var len = this.maj_out_pai[dir];
        var maj = out_arr[len - 1];
        this.maj_out_pai[dir]--;
        out_arr.splice(len - 1, 1);
        maj.active = false;
        maj.destroy();
    },

    /**
     * 删除手上的牌数据
     */
    onSpliceHandPai: function (dir, pai, count, change_index) {
        var maj_arr = this.maj_hand_arr[dir]; //手上的牌对象
        var pai_arr = this.maj_hand_pai[dir]; //手上的牌数据
        var top_space = this.maj_top_space_arr[dir];
        var space = this.maj_hand_space_arr[dir];
        var begin = this.getSpecialPaiPosByIndex(dir, change_index); //开始坐标
        var index = 0;
        var temp = [];
        var temp_maj = [];
        if (dir == 0) {
            var len = pai_arr.length;
            for (var i = 0; i < len; i++) {
                var type = pai_arr[i];
                if (type.toString() == pai.toString() && index < count) {
                    //处理要碰杠掉的牌，扣除的数量
                    let maj = maj_arr[i];
                    temp_maj.push(maj);
                    var action1 = cc.moveBy(0.1, cc.v2(0, top_space));
                    var action2 = cc.moveTo(0.2, begin);
                    var action3 = cc.callFunc(function () {
                        cc.log("maj.opacity = 0");
                        //this.opacity = 0;
                        maj.opacity = 0;
                    }.bind(maj));
                    maj.runAction(action1, action2, action3);
                    if (dir == 1 || dir == 3) {
                        begin.y += space;
                    } else {
                        begin.x += space;
                    }
                    index++;
                } else {
                    temp.push(type.toString()); //保存要留下的牌
                }
            }
            this.maj_hand_pai[dir] = temp; //新的手上牌数据
            while (temp_maj.length) {
                let maj = temp_maj.shift();
                var _index = maj_arr.indexOf(maj);
                maj_arr.splice(_index, 1);
                maj_arr.push(maj);
                maj.pai = 0;
            }
        } else {
            this.maj_hand_pai[dir] -= count;
        }
    },

    /**
     * 创建或改变碰杠牌
     * */
    onCreateSpecialPai: function (dir, change_index, isCreate) {
        var special_data_arr = this.special_pai[dir]; //手上的碰杠牌数据
        var special_maj_arr = this.special_arr[dir]; //手上的碰杠牌对象
        var maj_prefab = this.special_maj_prefab[dir]; //麻将预制组
        var pos = this.getHandlePaiPos(dir, change_index); //开始坐标
        var space = this.maj_gang_space_arr[dir]; //麻将手上牌的间隔
        var container = this.player_node_arr[dir].getChildByName("specialpai"); //麻将放的节点
        var obj = special_data_arr[change_index]; //碰杠牌数据

        var d = obj.dir;
        cc.log(obj, change_index);
        cc.log("当前出牌方向", dir);
        cc.log("上次出牌方向", d);
        cc.log(pos);
        if (isCreate == true) {
            var special_maj;
            var temp = cc.v2(pos.x, pos.y);
            special_maj = cc.instantiate(maj_prefab);
            if (obj.status.toString() == "1") {
                for (let i = 0; i < 3; i++) {
                    let pai = special_maj.getChildByName("pai" + i);
                    if (dir == 0) {
                        this.showMajIcon(pai, obj.pai[i], 2);
                    } else {
                        this.showMajIcon(pai, obj.pai[i], dir);
                    }
                    if (i == 0) {
                        pai.color = cc.color(140, 140, 255)
                    }
                }
            } else if (obj.status.toString() == "2") {
                for (let i = 0; i < 3; i++) {
                    let pai = special_maj.getChildByName("pai" + i);
                    if (dir == 0) {
                        this.showMajIcon(pai, obj.pai[i], 2);
                    } else {
                        this.showMajIcon(pai, obj.pai[i], dir);
                    }
                    if (i == this.chipenggang_dir[dir][d]) {
                        pai.color = cc.color(140, 140, 255);
                        pai.nc = false;
                        if (1 == this.chipenggang_dir[dir][d]) {
                            pai.nc = true;
                        }
                    }
                }
            } else if (obj.status.toString() == "3") {
                special_maj.getChildByName("pai3").active = true;
                if (obj.gang == 1) {
                    for (let i = 0; i < 4; i++) {
                        let pai = special_maj.getChildByName("pai" + i);
                        if (dir == 0) {
                            if (i == 3) {
                                this.showMajIcon(pai, obj.pai[i], 2);
                            } else {
                                this.showMajIcon(pai, -1, 2);
                            }
                        } else {
                            this.showMajIcon(pai, -1, dir);
                        }
                        //this.chipenggang_dir = [[-1,2,1,0],[0,-1,2,1],[1,0,-1,2],[2,1,0,-1]];
                        if (this.chipenggang_dir[dir][d] == 1 && i == 3) {
                            pai.color = cc.color(140, 140, 255)
                        } else if (i == this.chipenggang_dir[dir][d]) {
                            pai.color = cc.color(140, 140, 255)
                        }
                    }
                } else {
                    for (let i = 0; i < 4; i++) {
                        let pai = special_maj.getChildByName("pai" + i);
                        if (dir == 0) {
                            this.showMajIcon(pai, obj.pai[i], 2);
                        } else {
                            this.showMajIcon(pai, obj.pai[i], dir);
                        }
                        if (this.chipenggang_dir[dir][d] == 1 && i == 3) {
                            pai.color = cc.color(140, 140, 255)
                        } else if (i == this.chipenggang_dir[dir][d]) {
                            pai.color = cc.color(140, 140, 255)
                        }
                    }
                }
            }
            special_maj.parent = container;
            special_maj.position = temp;
            cc.log(special_maj.position);
            special_maj_arr.push(special_maj);
            if (dir == 1 || dir == 3) {
                temp.y += space;
            } else {
                temp.x += space;
            }
        } else {
            cc.log("执行了碰变杠牌面渲染操作");
            var maj = special_maj_arr[change_index];
            maj.getChildByName("pai3").active = true;
            if (dir == 0) {
                this.showMajIcon(maj.getChildByName("pai3"), obj.pai[0], 2);
            } else {
                this.showMajIcon(maj.getChildByName("pai3"), obj.pai[0], dir);
            }
            //if(this.chipenggang_dir[dir][d] == 1){
            //    maj.getChildByName("pai3").color = cc.color(140,140,255);
            //}
            //let nowColor = new cc.Color(140,140,255,255);
            //cc.log(maj.getChildByName("pai1").color,maj.getChildByName("pai1"),maj.getChildByName("pai1").color == nowColor);
            if (maj.getChildByName("pai1").nc == true) {
                maj.getChildByName("pai3").color = cc.color(140, 140, 255);
            }
            cc.log("这很严重");
        }
    },

    /**
     * 获取碰杠牌位置
     */
    getHandlePaiPos: function (dir, index) {
        var pos = this.maj_hand_begin_pos[dir]; //开始坐标
        var space = this.maj_gang_space_arr[dir]; //间隔
        var begin = cc.v2(pos.x, pos.y);
        //有碰杠牌
        if (dir == 1 || dir == 3) {
            begin.y += index * 3 * space;
        } else {
            begin.x += index * 3 * space;
        }
        return begin;
    },

    /**
     * 展示操作动画
     * @param type  操作类型
     * @param dir   方向
     */
    showCaozuoAnimation: function (type, dir) { //0过,1碰,2吃,3胡,4喂(扫),5提,6舵
        var animationName = "";
        var skeletonData = "";
        switch (type.toString()) {
            case "1": {
                animationName = "chi";
                skeletonData = "chipenggang_ani/chipeng";
                break;
            }
            case "2": {
                animationName = "peng";
                skeletonData = "chipenggang_ani/chipeng";
                break;
            }
            case "3": {
                animationName = "gang";
                skeletonData = "chipenggang_ani/chipeng";
                break;
            }
            case "4": { //胡牌
                animationName = "animation";
                skeletonData = "hu_ani/huuhx1";
                break;
            }
        }
        cc.loader.loadRes("spine/" + skeletonData /* + ".json"*/ , sp.SkeletonData, function (err, spData) {
            var emoji_view = this.player_node_arr[dir].getChildByName("caozuo");
            emoji_view.active = true;
            var emoji = emoji_view.getComponent(sp.Skeleton);
            emoji.skeletonData = spData;
            emoji.clearTrack(0);
            emoji.setAnimation(0, animationName, true);
        }.bind(this));

        setTimeout(function () {
            cc.log("执行了1.5秒后取消caozuo界面");
            this.player_node_arr[dir].getChildByName("caozuo").active = false;
        }.bind(this), 1500);
    },

    /**
     *随操作按钮同时牌面上升
     */
    showCaozuoPai: function () {
        var risePai = [];
    },

    /**
     * 点击了操作按钮
     */
    onHandlerBtnClicked: function (event, type) { //0过   1234吃碰杠胡
        switch (type.toString()) {
            case "0": {
                this.guoClicked();
                break;
            }
            case "1": {
                this.chiClicked();
                break;
            }
            case "2": {
                this.pengClicked();
                break;
            }
            case "3": {
                this.gangClicked();
                break;
            }
            case "4": {
                this.huClicked();
                break;
            }
        }
    },

    chiClicked: function () {
        var chi = this.caozuo_tx_data.pais.chi;
        cc.log("有人吃！！！", chi);
        if ([] == chi || 0 == chi.length) return;

        if (chi.length == 1) {
            this.caouo_tip_layer.removeAllChildren();
            cc.vv.WebSocket.sendWS('GameController', 'caozuo', {
                mid: cc.vv.userData.mid,
                room_id: cc.vv.Global.room_id,
                status: 1,
                pai: this.caozuo_tx_data.pais.pai,
                chi: chi[0]
            });
            for (var i = 0; i < 5; i++) {
                this.handleBtn_arr_layer.getChildByName("handler" + i).active = false;
            }
            this.handle_status = [];
            return;
        }
        cc.log("吃失败");
        this.chi_start_position = cc.v2(-400, -160);
        var startPosition = this.chi_start_position;
        this.caouo_tip_layer.removeAllChildren();
        for (let j = 0; j < chi.length; j++) {
            var select_chi_pai = cc.instantiate(this.select_special_pai);
            select_chi_pai.parent = this.caouo_tip_layer;
            select_chi_pai.position = startPosition;
            select_chi_pai.id = chi[j];
            select_chi_pai.pai = this.caozuo_tx_data.pais.pai;
            select_chi_pai.on(cc.Node.EventType.TOUCH_END, this.onSelectChi, this); //点击maj
            startPosition.x += 200; //每一列吃牌的间隔
            for (let i = 0; i < 3; i++) {
                var icon = select_chi_pai.getChildByName("pai" + i).getComponent(cc.Sprite);
                if (parseInt(chi[j][i]) == this.caozuo_tx_data.pais.pai) {
                    select_chi_pai.getChildByName("pai" + i).color = cc.color(140, 140, 255);
                }
                this.showMajIcon(icon, chi[j][i], 2);
            }
        }
    },

    gangClicked: function () {
        var gang = this.caozuo_tx_data.pais.gang;
        cc.log("杠之前：", gang);
        if (gang != [] && gang.length == 1) {
            cc.vv.WebSocket.sendWS('GameController', 'caozuo', {
                mid: cc.vv.userData.mid,
                room_id: cc.vv.Global.room_id,
                status: 3,
                pai: gang[0],
                chi: []
            });
            for (var i = 0; i < 5; i++) {
                this.handleBtn_arr_layer.getChildByName("handler" + i).active = false;
            }
            this.handle_status = [];
            return;
        }
        cc.log("杠失败");
        this.chi_start_position = cc.v2(-200, -160);
        var startPosition = this.chi_start_position;
        this.caouo_tip_layer.removeAllChildren();
        for (var j = 0; j < gang.length; j++) {
            var select_gang_pai = cc.instantiate(this.chupai_prefab);
            select_gang_pai.parent = this.caouo_tip_layer;
            select_gang_pai.position = startPosition;
            select_gang_pai.id = gang[j];
            select_gang_pai.pai = gang[j];
            select_gang_pai.on(cc.Node.EventType.TOUCH_END, this.onSelectGang, this); //点击maj
            startPosition.x += 200; //每一列吃牌的间隔
            select_gang_pai.scale = 1.5;
            this.showMajIcon(select_gang_pai, pai, 0);
        }
    },

    /**
     * 选杠后
     */
    onSelectGang: function (target) {
        cc.log(target.target.id);
        this.caouo_tip_layer.removeAllChildren();
        cc.vv.WebSocket.sendWS('GameController', 'caozuo', {
            mid: cc.vv.userData.mid,
            room_id: cc.vv.Global.room_id,
            status: 3,
            pai: target.target.pai,
            chi: target.target.id
        });

        for (var i = 0; i < 5; i++) {
            this.handleBtn_arr_layer.getChildByName("handler" + i).active = false;
        }
        this.handle_status = [];
    },

    huClicked: function () {
        this.game_layer.getChildByName("hu").active = false;
        cc.vv.WebSocket.sendWS('GameController', 'caozuo', {
            mid: cc.vv.userData.mid,
            room_id: cc.vv.Global.room_id,
            status: 4,
            pai: this.caozuo_tx_data.pais.pai,
            chi: []
        });
        for (var i = 0; i < 5; i++) {
            this.handleBtn_arr_layer.getChildByName("handler" + i).active = false;
        }
        this.handle_status = [];
    },

    guoClicked: function () {
        cc.vv.WebSocket.sendWS('GameController', 'caozuo', {
            mid: cc.vv.userData.mid,
            room_id: cc.vv.Global.room_id,
            status: 0,
            pai: this.caozuo_tx_data.pais.pai,
            chi: []
        });
        this.isCanTouch = true;
        this.caouo_tip_layer.removeAllChildren();
        for (var i = 0; i < 5; i++) {
            this.handleBtn_arr_layer.getChildByName("handler" + i).active = false;
        }
        this.handle_status = [];
    },

    pengClicked: function () {
        cc.vv.WebSocket.sendWS('GameController', 'caozuo', {
            mid: cc.vv.userData.mid,
            room_id: cc.vv.Global.room_id,
            status: 2,
            pai: this.caozuo_tx_data.pais.pai,
            chi: []
        });
        for (var i = 0; i < 5; i++) {
            this.handleBtn_arr_layer.getChildByName("handler" + i).active = false;
        }
        this.handle_status = [];
    },

    /**
     * 选吃后
     */
    onSelectChi: function (target) {
        cc.log(target.target.id);
        this.caouo_tip_layer.removeAllChildren();
        cc.vv.WebSocket.sendWS('GameController', 'caozuo', {
            mid: cc.vv.userData.mid,
            room_id: cc.vv.Global.room_id,
            status: 1,
            pai: target.target.pai,
            chi: target.target.id
        });

        for (var i = 0; i < 5; i++) {
            this.handleBtn_arr_layer.getChildByName("handler" + i).active = false;
        }
        this.handle_status = [];
    },

    clearOutPaiPointer: function () {
        cc.log(this.maj_out_arr,this.maj_out_pai);
        for (var i = 0; i < 4; i++) {
            var out_arr = this.maj_out_arr[i];
            var out_pai = this.maj_out_pai[i];
            for (var j = 0; j < out_pai; j++) {
                var out = out_arr[j];
                out.getChildByName("pointer").stopAllActions();
                out.getChildByName("pointer").active = false;
            }
        }
    },

    doChuPaiInHandPai: function (dir, pai, mid) {
        var pai_arr = this.maj_hand_pai[dir]; //手上的牌数据
        var maj_arr = this.maj_hand_arr[dir]; //手上的牌对象
        var index = 0; //出牌的索引
        if (dir == 0) {
            if (this.send_index == -1) {
                for (var i = 0; i < pai_arr.length; i++) {
                    if (pai.toString() == pai_arr[i].toString()) {
                        this.send_index = i;
                        break;
                    }
                }
            }
            index = this.send_index;
        } else {
            this.send_index = -1;
            index = Math.floor(Math.random() * pai_arr);
        }
        var maj = maj_arr[index]; //要出的牌
        //创建打出的牌
        this.maj_out_pai[dir]++;
        var out_arr = this.maj_out_arr[dir]; //桌面上的牌对象
        var out_len = this.maj_out_pai[dir];
        //cc.log(out_arr,out_len);
        var out_pai = cc.instantiate(this.chupai_prefab); //出的牌
        out_arr.push(out_pai);
        if (dir == 0 || dir == 2) {
            out_pai.scale = 0.8;
        } else {
            //out_pai.scale = 1.2;
            out_pai.scale = 1.1;
        }
        out_pai.position = this.getOutPaiPosByIndex(dir, out_len - 1);
        out_pai.parent = this.player_node_arr[dir].getChildByName("outpai");
        out_pai.zIndex = this.getOutPaiZindexByIndex(dir, out_len - 1);
        if (dir == 0 || dir == 2) {
            this.showMajIcon(out_pai, pai, 2);
        } else {
            this.showMajIcon(out_pai, pai, dir);
        }
        out_pai.runAction(cc.sequence(
            cc.delayTime(0.1),
            cc.callFunc(function () {
                //this.opacity = 255;
                cc.log("out_pai.opacity = 255");
                out_pai.opacity = 255;
            }.bind(out_pai)),
            cc.callFunc(function () {
                var dian = this.getChildByName("pointer");
                dian.active = true;
                dian.runAction(cc.sequence(
                    cc.jumpBy(200, cc.v2(0, 10), 20, 500),
                    cc.callFunc(function () {
                        //this.active = false;
                        cc.log("dian.active = false");
                        dian.active = false;
                    }.bind(dian))
                ))
            }.bind(out_pai))
        ));
        if (dir == 0) {
            pai_arr.splice(index, 1); //删除手中的牌
            pai_arr.sort(function (a, b) {
                return a - b
            }); //排序
        } else {
            pai_arr--;
            this.maj_hand_pai[dir]--;
        }
        maj_arr.splice(index, 1); //删除手中的麻将
        maj_arr.push(maj); //放入数组尾部
        maj.pai = 0;
        this.scheduleOnce(function (dir) {
            //("展示手牌")
            this.onShowHandPaiInfo(dir);
        }.bind(this, dir), 0.1);
    },

    //获取出牌的层级坐标
    getOutPaiZindexByIndex: function (dir, index) {
        var zIndex = 1;
        if (dir == 0 || dir == 3) {
            zIndex += index;
        } else if (dir == 2 || dir == 1) {
            zIndex = 100 - index;
        }
        return zIndex;
    },

    /**
     * 获取打出牌的位置
     */
    getOutPaiPosByIndex: function (dir, index) {
        var row_num = 10;
        if (this.game_ren == 2) {
            row_num = 20
        }
        var pos = null;
        if (this.game_ren == 2) {
            pos = this.maj_out_begin_pos2[dir];
        } else {
            pos = this.maj_out_begin_pos[dir];
        }

        var space = this.maj_out_space[dir];
        var row_space = this.maj_out_row_space[dir];
        var begin = cc.v2(pos.x, pos.y);
        var i = index % row_num;
        if (dir == 1 || dir == 3) {
            begin.y += i * space;
        } else {
            begin.x += i * space;
        }
        if (index >= row_num) {
            if (dir == 1 || dir == 3) {
                begin.x += Math.floor(index / row_num) * row_space;
            } else {
                begin.y += Math.floor(index / row_num) * row_space;
            }
        }
        return begin;
    },

    /**
     * 打出牌
     */
    onCheckChuPai: function (maj) {
        console.log("检查出牌: " + maj.pai + " 索引: " + maj.index);
        console.log(this.checkCanChuPai(maj));
        console.log(this.handle_status);
        if (this.checkCanChuPai(maj) == true) {
            if (this.handle_status.length != 0) { //you碰杠胡提示操作时候滑动出牌  不坐处理
                this.onTouchHandleBtn(null, 0); //点击过处理了
            } else {
                this.isSendPai = true;
                this.send_index = maj.index;
                cc.vv.WebSocket.sendWS("GameController", "dapai", {
                    "mid": cc.vv.userData.mid,
                    'room_id': cc.vv.Global.room_id,
                    'pai': maj.pai
                });
            }
        } else {
            this.onTouchMaj(maj, true);
        }
    },

    /**
     * 判断是否可以出牌
     */
    checkCanChuPai: function (maj) {
        //("判断是否可以出牌checkCanChuPai")
        if (this.isCanTouch == true && this.isSendPai == false && this.current_dir == 0 && maj == this.current_maj && maj.pai != 0) {
            return true;
        }
        return false;
    },

    /**
     * 触摸到麻将
     */
    onTouchMaj: function (maj, focus) {
        if (focus == true) {
            this.current_maj = maj;
        } else {
            if (this.current_maj != maj) {
                this.current_maj = maj;
            } else {
                return;
            }
        }
        var arr = this.maj_hand_arr[0];
        var maj_pai = this.maj_hand_pai[0];
        var space = this.maj_hand_space_arr[0];
        var pos = this.getHandPaiPosByIndex(0, 0);
        for (var i = 0; i < 14; i++) {
            var m = arr[i];
            var maj_js = m.getComponent("maj_control");
            if (maj == null || m != maj) {
                m.y = maj_js.begin_y;
                maj_js.isChecking = false;
            } else {
                m.y = maj_js.max_y;
                this.onTouchPaiFun(m);
            }
            if (i > 0) {
                pos.x += space;
                if (this.current_dir == 0 && i == maj_pai.length - 1 && this.current_q != -1 && this.handle_status.length == 0) {
                    pos.x += space * 0.5;
                }
            }
            m.x = pos.x;
        }
    },

    /**
     * 点击牌处理
     */
    onTouchPaiFun: function (maj) {
        //桌面麻将判断是否打出过
        for (var i = 0; i < 4; i++) {
            var out_arr = this.maj_out_arr[i];
            var out_pai = this.maj_out_pai[i];
            for (var j = 0; j < out_pai; j++) {
                var out = out_arr[j];
                if (maj && out.pai.toString() == maj.pai.toString()) {
                    //out.getChildByName("mask").active = true;
                    out.color = cc.color(140, 140, 255)
                } else {
                    out.color = cc.color(255, 255, 255)
                }
            }
        }
    },

    /**
     * 显示起牌
     */
    onShowQiPai: function (data) {
        var len = 0;
        var maj_pai = this.maj_hand_pai[this.current_dir];
        if (data.mid.toString() == cc.vv.userData.mid.toString()) {
            this.isCanTouch = true;
            this.isSendPai = false;
        } else {
            this.isCanTouch = false;
        }
        if (this.current_dir == 0) {
            this.current_q = data.pai;
            maj_pai.push(data.pai);
            len = maj_pai.length;
        } else {
            this.current_q = 1;
            this.maj_hand_pai[this.current_dir]++;
            len = this.maj_hand_pai[this.current_dir];
        }
        var pos = this.getHandPaiPosByIndex(this.current_dir, len - 1);
        var space = this.maj_hand_space_arr[this.current_dir];
        var maj_arr = this.maj_hand_arr[this.current_dir];
        //("起牌dir: " + this.current_dir + " len: " + len);
        var maj = maj_arr[len - 1];
        maj.opacity = 255;
        maj.index = len - 1;
        if (this.current_dir == 1 || this.current_dir == 3) {
            pos.y += space;
        } else {
            pos.x += space * 0.5;
            if (this.current_dir == 0) {
                this.showMajIcon(maj, this.current_q, this.current_dir);
            }
        }
        maj.position = pos;
    },

    /**
     * 显示指定出牌人
     */
    onShowTimeDir: function (mid) {
        for (var i = 0; i < this.player_id_arr.length; i++) {
            var id = this.player_id_arr[i];
            if (0 == id) continue;
            //cc.log(mid.toString(), id.toString(),this.player_node_arr,this.player_node_arr[i]);
            if (mid.toString() == id.toString()) {
                this.player_node_arr[i].getChildByName("user").getChildByName("mask").getChildByName("quan").active = true;
                if (this.game_ren == 2 && i == 1) {
                    this.current_dir = 2;
                    this.timer_layer.getChildByName("time2").active = true;
                } else {
                    this.current_dir = i;
                    this.timer_layer.getChildByName("time" + i).active = true;
                }
            } else {
                this.player_node_arr[i].getChildByName("user").getChildByName("mask").getChildByName("quan").active = false;
                if (this.game_ren == 2 && i == 1) {
                    this.timer_layer.getChildByName("time2").active = false;
                } else {
                    this.timer_layer.getChildByName("time" + i).active = false;
                }
            }
        }
    },

    /**
     * 开始出牌倒计时
     */
    beginChupaiTimeOut: function () {
        this.unschedule(this.updateChupaiTime);
        this.count = 15;
        this.timer_layer.getChildByName("time").getComponent(cc.Label).string = this.count;
        this.schedule(this.updateChupaiTime, 1);
    },

    /**
     * 更新出牌倒计时
     */
    updateChupaiTime: function () {
        this.count--;
        if (this.count < 0) {
            this.unschedule(this.updateChupaiTime);
            this.count = 0;
            this.timer_layer.getChildByName("time").getComponent(cc.Label).string = this.count;
        } else {
            this.timer_layer.getChildByName("time").getComponent(cc.Label).string = this.count;
        }
    },

    /**
     * 初始化牌的信息显示
     */
    onShowHandPaiInfo: function (dir) {
        var pos = this.getHandPaiPosByIndex(dir, 0);
        var space = this.maj_hand_space_arr[dir];
        var maj_arr = this.maj_hand_arr[dir];
        var maj_pai = this.maj_hand_pai[dir];
        var len = dir == 0 ? maj_pai.length : maj_pai;

        for (var i = 0; i < 14; i++) {
            var maj = maj_arr[i];
            maj.active = true;
            maj.index = i;
            maj.opacity = i >= len ? 0 : 255;
            if (dir == 0) {
                var pai = i >= len ? 0 : maj_pai[i];
                this.showMajIcon(maj, pai, dir);
            }
            if (i > 0) {
                if (dir == 1 || dir == 3) {
                    pos.y += space;
                    if (this.current_dir == dir && this.current_q != -1 && i == len - 1) {
                        pos.y += space;
                    }
                } else {
                    pos.x += space;
                    if (this.current_dir == dir && this.current_q != -1 && i == len - 1) {
                        pos.x += 0.5 * space;
                    }
                    if (dir == 0 && i > len - 1) {
                        pos.x += 5 * space;
                    }
                }
            }
            maj.position = pos;
        }
        this.showPaiZIndex(dir);
    },

    /**
     * 设置牌的层次
     */
    showPaiZIndex: function (dir) {
        var z = 0;
        //处理碰杠牌层次
        if (dir == 1 || dir == 3) {
            var special_arr = this.special_arr[dir];
            var maj;
            for (let i = 0; i < special_arr.length; i++) {
                maj = special_arr[i];
                maj.zIndex = z;
                if (dir == 1) {
                    z--;
                } else {
                    z++;
                }
            }
            var maj_arr = this.maj_hand_arr[dir];
            for (let i = 0; i < 14; i++) {
                maj = maj_arr[i];
                maj.zIndex = z;
                if (dir == 1) {
                    z--;
                } else {
                    z++;
                }
            }
        }
    },

    /**
     * 展示牌面（手牌，桌面拍，吃碰杠牌）
     * @param maj 节点
     * @param pai 牌面数据
     * @param dir 牌角度   0自己手牌
     *                     1右家的桌面牌（吃碰杠牌）
     *                     2自己和对家的桌面牌（吃碰杠牌）
     *                     3左家的桌面牌（吃碰杠牌）
     */
    showMajIcon: function (maj, pai, dir) {
        maj.pai = pai;
        var icon = maj.getComponent(cc.Sprite);
        if (pai == -1) {
            if (dir == 0) {
                icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian1-paibei_my_2");
            } else if (dir == 1) {
                icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian1-paibei_right_2");
            } else if (dir == 2) {
                icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian1-paibei_my_2");
            } else if (dir == 3) {
                icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian1-paibei_right_2");
            }
            return;
        }
        if (dir == 0) {
            icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian1-my_" + pai);
        } else if (dir == 1) {
            icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian1-right_" + pai);
        } else if (dir == 2) {
            icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian1-mydown_" + pai);
        } else if (dir == 3) {
            icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian1-left_" + pai);
        }
    },

    /**
     * 获取手上牌位置
     */
    getHandPaiPosByIndex: function (dir, index) {
        var space = this.maj_hand_space_arr[dir];
        var special_arr = this.special_pai[dir];
        var len = special_arr.length;
        var pos = this.getSpecialPaiPosByIndex(dir, len);
        if (len > 0) {
            if (dir == 1 || dir == 3) {
                if (dir == 1) {
                    pos.y += space;
                } else {
                    pos.y += 0.5 * space;
                }
            } else {
                if (dir == 0) {
                    pos.x += 20;
                } else {
                    pos.x += 0.5 * space;
                }
            }
        }
        if (dir == 1 || dir == 3) {
            pos.y += index * space;
        } else {
            pos.x += index * space;
        }
        return pos;
    },

    /**
     * 获取碰杠牌位置
     */
    getSpecialPaiPosByIndex: function (dir, index) {
        var pos = this.maj_hand_begin_pos[dir];
        var space = this.maj_gang_space_arr[dir];
        var begin = cc.v2(pos.x, pos.y);
        if (dir == 1 || dir == 3) {
            begin.y += index * 3 * space;
        } else {
            begin.x += index * 3 * space;
        }
        return begin;
    },

    /**
     * 处理头像显示
     */
    showUserInfo: function () {
        this.changePlayerId();
        this.loadHeadInfo(true);
    },

    /**
     * 改变玩家头像位置
     */
    changePlayerId: function () {
        cc.log("展示当前的用户信息");
        this.player_id_arr = [];
        for (let i = 0; i < this.game_ren; i++) {
            this.player_id_arr[i] = 0;
        }
        let id_arr = [];
        let ind = 0;
        for (let key in this.roomInfo.users) {
            id_arr[ind] = this.roomInfo.users[key];
            ind++;
        }
        var index;
        for (let i = 0; i < id_arr.length; i++) {
            let id = id_arr[i];
            if (id.toString() == cc.vv.userData.mid.toString()) {
                index = i;
                break;
            }
        }
        var num = id_arr.length;
        this.player_id_arr[0] = cc.vv.userData.mid;
        //cc.log(id_arr);
        if (num == 2) {
            if (index == 0) {
                this.player_id_arr[1] = id_arr[1];
            } else if (index == 1) {
                this.player_id_arr[(parseInt(this.game_ren) - 1)] = id_arr[0]; //我第二个进来，前面的人坐最后一个位置
            }
        }
        if (num == 3) {
            if (index == 0) {
                this.player_id_arr[1] = id_arr[1];
                this.player_id_arr[2] = id_arr[2];
            } else if (index == 1) {
                this.player_id_arr[(parseInt(this.game_ren) - 1)] = id_arr[0]; //我第二个进来，前面的人坐最后一个位置
                this.player_id_arr[1] = id_arr[2];
            } else if (index == 2) {
                this.player_id_arr[(parseInt(this.game_ren) - 2)] = id_arr[0]; //我第三个进来，前面的人坐最后一个位置
                this.player_id_arr[(parseInt(this.game_ren) - 1)] = id_arr[1]; //我第三个进来，前面的人坐最后一个位置
            }
        }
        if (num == 4) {
            if (index == 0) {
                this.player_id_arr[1] = id_arr[1];
                this.player_id_arr[2] = id_arr[2];
                this.player_id_arr[3] = id_arr[3];
            } else if (index == 1) {
                this.player_id_arr[3] = id_arr[0];
                this.player_id_arr[1] = id_arr[2];
                this.player_id_arr[2] = id_arr[3];
            } else if (index == 2) {
                this.player_id_arr[3] = id_arr[1];
                this.player_id_arr[2] = id_arr[0];
                this.player_id_arr[1] = id_arr[3];
            } else if (index == 3) {
                this.player_id_arr[3] = id_arr[2];
                this.player_id_arr[2] = id_arr[1];
                this.player_id_arr[1] = id_arr[0];
            }
        }
        cc.log(this.player_id_arr);
    },

    /**
     * 加载头像信息 isShow是否强制不显示状态图
     */
    loadHeadInfo: function (isShow) {
        for (var i = 0; i < this.player_id_arr.length; i++) {
            let id = this.player_id_arr[i];
            let ready = this.roomInfo.zhunbei.indexOf(id);
            if (id == null || id.toString() == "0" || !this.userInfo.hasOwnProperty(id)) {
                this.changePlayerView(id, this.player_node_arr[i], null);
            } else {
                this.changePlayerView(id, this.player_node_arr[i], this.userInfo[id], isShow, 1, ready);
            }
        }
    },

    /**
     * 玩家三比图标更新
     */
    sanbiChange: function () {
        for (let i = 0; i < this.player_id_arr.length; i++) {
            let id = this.player_id_arr[i];
            if (id != null && id.toString() != "0" && this.userInfo.hasOwnProperty(id)) {
                let node = this.player_node_arr[i];
                let data = this.userInfo[id];
                node.getChildByName("user").getChildByName("three").active = false;

                this.dealSanbi(data.id, node);
            }
        }
    },

    /**
     * 处理三比数据
     * @param id 玩家id
     * @param node 玩家节点
     */
    dealSanbi:function(id, node){
        let arr = [[], []];
        for (let j in this.sanbi) {
            let arr_0 = this.sanbi[j].split("-");
            arr[0].push(parseInt(arr_0[0]));
            arr[1].push(parseInt(arr_0[1]));
        }

        cc.log(arr);
        for (let x = 0; x < arr[0].length; x++) {
            let num_0 = arr[0][x];
            for (let y = 0; y < arr[1].length; y++) {
                let num_1 = arr[1][y];
                if (num_0 == num_1) {
                    arr[0].splice(x, 1);
                    x--;
                    break;
                }
            }
        }

        cc.log(arr);
        //return;
        for (let m = 0; m < arr[1].length; m++) {
            if (id == arr[0][m]) {
                cc.log("三比玩家有：", id.toString());
                let san = node.getChildByName("user").getChildByName("three");
                san.active = true;
                let str_0 = "game/sanbi" + 0;
                this.loadResTexture(san, str_0)
            }

            if (id == arr[1][m]) {
                cc.log("三比玩家有：", id.toString());
                let san = node.getChildByName("user").getChildByName("three");
                san.active = true;
                let str_1 = "game/sanbi" + 1;
                this.loadResTexture(san, str_1)
            }
        }
    },

    /**
     * 玩家头像部分信息显示
     */
    changePlayerView: function (id, node, data, isShow, status, ready) {
        //console.log(node);
        if (data == null) {
            let head_node = node.getChildByName("user").getChildByName("mask").getChildByName("head").getComponent(cc.Sprite);
            head_node.spriteFrame = this.head_atlas.getSpriteFrame("common-018");
            node.getChildByName("user").getChildByName("lab0").getComponent(cc.Label).string = "";
            node.getChildByName("user").getChildByName("lab1").getComponent(cc.Label).string = "";
            node.getChildByName("user").getChildByName("ready").active = false;
        } else {
            let head_node = node.getChildByName("user").getChildByName("mask").getChildByName("head");
            var name_node = node.getChildByName("user").getChildByName("lab0");
            var prepare_node = node.getChildByName("user").getChildByName("ready");
            if (this.zf != null) {
                node.getChildByName("user").getChildByName("lab1").active = true;
                node.getChildByName("user").getChildByName("lab1").getComponent(cc.Label).string = this.zf[id];
            }
            node.active = true;
            if (!this.isKaiju && "0" == this.roomInfo.guize.zhunbei && -1 != ready) {
                prepare_node.active = true;
            }
            if (this.zhuang != null && data.id.toString() == this.zhuang.toString()) {
                node.getChildByName("user").getChildByName("zhuang").active = true;
            } else {
                node.getChildByName("user").getChildByName("zhuang").active = false;
            }
            if (data.id.toString() == this.roomInfo.fangzhu.toString()) {
                node.getChildByName("user").getChildByName("fang").active = true;
            } else {
                node.getChildByName("user").getChildByName("fang").active = false;
            }
            node.getChildByName("user").getChildByName("three").active = false;
            if (node.getChildByName("yu")) node.getChildByName("yu").active = false;
            this.dealSanbi(data.id, node);
            // for (let i in this.sanbi) {
            //     if (data.id.toString() === this.sanbi[i].toString()) {
            //         cc.log("三比玩家有：", data.id.toString());
            //         node.getChildByName("user").getChildByName("three").active = true;
            //     }
            // }

            let head = head_node.getComponent(cc.Sprite);
            name_node.active = true;
            name_node.getComponent(cc.Label).string = cc.vv.Global.getNameStr(data.nickname);
            let head_url = data.headimgurl;
            cc.loader.load(head_url, function (err, texture) {
                head.spriteFrame = new cc.SpriteFrame(texture);
            });
            if (status.toString() != "1") {
                node.getChildByName("mask").active = true;
            }
        }
    },

    /**
     * 加载互动表情窗口
     */
    loadInteractive: function (name) {
        for (let i = 0; i < this.player_id_arr.length; i++) {
            if (name === this.player_node_arr[i].name) {
                let id = this.player_id_arr[i];
                //if(0 == id) continue;
                this.onToggleView("interactive_layer", this.userInfo[id]);
                break;
            }
        }
    },

    /**
     * 加载准备按钮显示
     */
    onReturnReady: function (mid) {
        for (var i = 0; i < this.player_id_arr.length; i++) {
            let id = this.player_id_arr[i];
            if (mid == id) {
                this.player_node_arr[i].getChildByName("user").getChildByName("ready").active = true;
                break;
            }
        }

        if (mid == cc.vv.userData.mid) {
            let btn = this.prepare_layer.getChildByName("btn_0");
            btn.active = false;
        }
    },

    /**************************************游戏场景下的消息发送*****************************************************/
    /**
     * 请求进入
     */
    sendJinru: function () {
        cc.vv.WebSocket.sendWS("GameController", "jinru", {
            "mid": cc.vv.userData.mid,
            'room_id': cc.vv.Global.room_id, //俱乐部id
            'jing': cc.vv.userData.longitude, //玩家经度
            'wei': cc.vv.userData.latitude, //玩家纬度
            'address': cc.vv.userData.address //玩家地址
        });
    },

    /**
     * 请求准备
     */
    sendReady: function () {
        cc.vv.WebSocket.sendWS("GameController", "ready", {
            "mid": cc.vv.userData.mid,
            'room_id': cc.vv.Global.room_id
        });
    },

    /**
     * 请求2/3人快速开始
     */
    sendFast: function () {
        cc.vv.WebSocket.sendWS("GameController", "fast", {
            "mid": cc.vv.userData.mid,
            'room_id': cc.vv.Global.room_id, //房间id
            'status': 1 //玩家经度
        });
    },

    update: function (dt) {
        //if (this.countTime % 3600 == 0) {
        //    this.updateTime(); //每隔一分钟校正一次时间
        //}
        if(0 == this.countTime % 60){
            //cc.log("一秒过去咯");
            let bool = false;
            for(let i = 0; i < this.broadcostTime_arr.length; i++){
                if(-1 != this.broadcostTime_arr[i]){
                    bool = true;
                    break
                }
            }
            if(bool) this.doCountdownTime();
        }
        if (this.countTime % 300 == 0) {
            this.updateCesu(); //每隔5秒测速一次
            this.updateBatteryLevel(); //每隔5秒更新一次电池电量
            this.countTime = 0;
            ////检查房主
            //if (this.isGetRoomInfo) {
            //    this.updateCheckBoss();
            //}
        }
        this.countTime++;
    },

    /**
     * 测网速
     */
    updateCesu: function () {
        this.ping_time = Date.now();
        this.sendCeSu();
    },

    /**
     * 更新电池电量
     */
    updateBatteryLevel: function () {
        let battteryLevel = 0;
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            battteryLevel = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getBatteryLevel", "()I");
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            battteryLevel = jsb.reflection.callStaticMethod("RootViewController", "batteryLevelGet");
        }
        let level = parseFloat(parseInt(battteryLevel) / 100);
        this.battery_mask.width = level * BATTERY_MAX;
    },

    /**
     * 请求测速
     */
    sendCeSu: function () {
        cc.vv.WebSocket.sendWS('RoomController', 'cesu', {
            'mid': cc.vv.userData.mid
        });
    },

    /**
     * 返回测速结果
     */
    onReturnCesu: function () {
        let speed = Date.now() - this.ping_time;
        let ping_speed = 4;
        if (speed <= 400) {
            ping_speed = 4;
        } else if (speed <= 1000) {
            ping_speed = 3;
        } else if (speed <= 1500) {
            ping_speed = 2;
        } else if (speed <= 3000) {
            ping_speed = 1;
        } else {
            ping_speed = 0;
        }

        for (let i = 0; i < 5; i++) {
            let node = this.net_speed_parent.getChildByName("newWork_" + i);
            if (ping_speed === i) {
                node.active = true;
            } else {
                node.active = false;
            }

        }
        //this.network.spriteFrame = this.altas.getSpriteFrame('game-00' + ping_speed);
    }
});