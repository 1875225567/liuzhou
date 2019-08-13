/**
 * 大厅控制类
 */
cc.Class({
    extends: cc.Component,

    properties: {
        main_node: cc.Node,
        ui_layer: cc.Node,
        node_layer: cc.Node,
        //ui部分
        head_node: cc.Node,
        board_node: cc.Node,
        id_lab: cc.Label,
        name_lab: cc.Label,
        diamon_lab: cc.Label,
        laba_node: cc.Node, //喇叭节点
        pageView: cc.PageView,
        page_item: cc.Prefab,
        pageSprite: cc.Node,
        atlas: cc.SpriteAtlas, //存放头像框 一般在common
        bg_arr: [cc.SpriteFrame], //白天跟晚上的背景图
        lab_win: cc.Label, //大赢家分数显示
        progress: cc.ProgressBar //白天跟晚上的背景图
    },

    ctor: function () {
        this.isLoad = false;
        this.begin_x = 700;  //喇叭开始坐标
        this.end_x = -25;    //喇叭初始结束坐标

        this.turn_count = 0; //翻页倒计时 
        this.turn_len = 0;
        this.time_count = 0;

        this.zhanji_layer = null;  //战绩界面
        this.smrz_layer = null;    //实名认证
        this.shop_layer = null;    //商城界面
        this.join_layer = null;    //加入游戏
        this.create_layer = null;  //创建游戏
        this.club_layer = null;    //俱乐部列表
        this.club_scene = null;    //俱乐部
        this.club_notice_layer = null; //俱乐部弹窗
        this.gold_layer = null;    //金币场
        this.task_layer = null;    //任务
        //this.yqm_layer = null;    //邀请码
        this.daoju_layer = null;   //道具
        this.kefu_layer = null;    //客服
        this.rank_layer = null;    //排行
        this.club_level = null;    //俱乐部管理级别
        this.club_status = null;   //俱乐部功能是否解锁
        this.exch_layer = null;    //兑换
        this.daili_layer = null;   //代理
        this.win_number = 0;        //大赢家积分
        this.member_data = 0;       //玩家数据
        this.daili_call = null;    //代开房函数
        this.daili_shu = null;     //代开房数量
        this.hall_bg = 3;          //大厅背景编号

        this.auto_texture = [];
    },

    onLoad: function () {
        this.isLoad = true;
        cc.hallControl = this;
        if (this.main_node.loadType == true) {
            cc.loadingControl.loadingView(this.main_node, 'Hall_control');
        } else {
            cc.loadingControl.fadeOutMask(this.main_node, 'Hall_control');
        }
    },

    pageClick: function (data) {
        //let page_view = this.pageView.getComponent(cc.PageView);
        this.pageView.horizontal = false;
        //page_view.horizontal = false;
        cc.log(data.img);
        this.loadHeadTexture(this.pageSprite, data.img);
        this.pageSprite.active = true;
    },

    pageClose: function () {
        this.pageView.horizontal = true;
        this.pageSprite.active = false;
    },

    onOpenView: function () {
        if(!this.ui_layer.active) this.ui_layer.active = true;
        //计算喇叭翻转的位置
        this.end_x -= this.laba_node.width;
        this.laba_node.x = this.begin_x;

        this.loadResTexture(cc.loadingControl.splashScene, 'big_bg/hallbg_' + cc.vv.userData.bg_index);
        this.change_bg();
        if (1 == cc.vv.userData.change_bg) {
            this.schedule(this.doCountdownTime, 1);
        }

        let lab = "";
        //let lab = "俱乐部[" + 100037 +  "]玩家[" + 124578 + "]邀请你加入俱乐部，打牌更方便，更便捷。(复制此消息打开游戏可直接申请加入俱乐部)";
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            lab = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getCopyStr", "()Ljava/lang/String;");
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            lab = jsb.reflection.callStaticMethod("RootViewController", "getCopyStr");
        }
        if (36 < lab.length) {
            var str_0 = lab.substr(0, 3);
        }

        if ("俱乐部" == str_0) {
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
    },

    onReturnCheckData: function (data) {
        if (1 == data.status) {
            cc.log(data);
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
            cc.log(data);
            if (data.msg) cc.hallControl.showMsg(data.msg);
        }.bind(this));
    },

    /**
     * 倒计时
     */
    doCountdownTime: function () {
        this.change_bg();
        cc.log("倒计时哦");
    },

    /**
     * 关闭倒计时
     */
    closeTime: function () {
        if (1 != cc.vv.userData.change_bg) {
            this.unschedule(this.doCountdownTime);
        } else if(this.main_node.active) {
            this.schedule(this.doCountdownTime, 1);
        }
    },

    change_bg: function () {
        let time = new Date();
        let hour = time.getHours();
        var index = 0;
        if (6 < hour < 18) {
            index = 1;
        } else {
            index = 0;
        }
        if(this.hall_bg != index){
            cc.loadingControl.splashScene.getComponent(cc.Sprite).spriteFrame = this.bg_arr[index];
            this.hall_bg = index
        }
    },

    update: function () {
        if ((this.time_count % 3600) == 0) {
            this.sendDating();
        }
        if (this.time_count > 0 && (this.time_count % 60) == 0) {
            this.diamon_lab.string = cc.vv.userData.num;
        }
        if (this.turn_count > 60 && (this.turn_count % 300) == 0) {
            this.turn_len = this.pageView.getPages().length;
            var index = this.pageView.getCurrentPageIndex();
            if (index >= this.turn_len - 1) {
                index = 0;
            } else {
                index++;
            }
            this.pageView.scrollToPage(index, 0.3);
        }
        this.updateLaba();
        this.time_count++;
        this.turn_count++;
    },

    /**
     * 触发翻页倒计时
     */
    pageTurning: function () {
        this.turn_count = 0;
    },

    /**
     * 更新喇叭位置
     */
    updateLaba: function () {
        this.laba_node.x -= 1;
        if (this.laba_node.x <= this.end_x) {
            this.laba_node.x = this.begin_x;
        }
    },

    /**
     * 初始化玩家信息 包括ui大厅，玩家信息面板，商店信息
     */
    initPlayerView: function () {
        this.loadHeadTexture(this.head_node, cc.vv.userData.headimgurl, 90);
        this.name_lab.string = cc.vv.Global.getNameStr(cc.vv.userData.nickname);
        this.diamon_lab.string = cc.vv.userData.num.toString();
        this.id_lab.string = "ID:" + cc.vv.userData.mid.toString();
        // this.board_node.getComponent(cc.Sprite).spriteFrame = this.altas.getSpriteFrame('head_' + cc.vv.userData.head_skin);
    },

    /**
     * 加载网络图片
     */
    loadHeadTexture: function (node, url) {
        //var self = this;
        cc.loader.load(url, function (err, texture2D) {
            node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture2D);
            //if (self.auto_texture.indexOf(texture2D) == -1) {
            //    self.auto_texture.push(texture2D);
            //}
        });
    },

    /**
     * 加载本地图片
     */
    loadResTexture: function (node, url) {
        //var self = this;
        cc.loader.loadRes(url, function (err, texture2D) {
            node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture2D);
            //if (self.auto_texture.indexOf(texture2D) == -1) {
            //    self.auto_texture.push(texture2D);
            //}
        });
    },

    onDestroy: function () {
        this.unscheduleAllCallbacks();
        // while (this.auto_texture.length) {
        //     let textur2D = this.auto_texture.shift();
        //     cc.loader.setAutoReleaseRecursively(textur2D, true);
        // }
        cc.hallControl = null;
        // cc.loader.setAutoReleaseRecursively('Prefab/hall_scene', true);
    },

    /**
     * 确认切换账号 解除授权
     */
    callBackChange: function () {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "removeAccount", "()V");
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "removeAccount");
        }
        this.loadSceneByName('Login_scene');
    },

    /**
     * 点击按钮
     * @param event
     * @param type
     */
    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case 'notice_layer': {
                cc.loadingControl.onToggleView('notice_layer', '是否切换账号？', this.callBackChange.bind(this));
                break;
            }
            case 'wanfa_layer':
            case 'zhanji_layer':
            case 'setting_layer':
            case 'smrz_layer':
            case 'shop_layer':
            case 'join_layer':
            case 'create_layer':
            case 'club_layer':
            case 'club_notice_layer':
            case 'gold_layer':
            case 'task_layer':
            case 'daili_layer':
            case 'rank_layer':
            case 'kefu_layer':
            case 'activity_layer': {
                this.onToggleView(type.toString());
                break;
            }
            case 'share_layer':
            case 'exch_layer':
            case 'more_layer':
            case 'daoju_layer':
            case 'win_jia': {
                cc.loadingControl.onToggleView('notice_layer', '此功能正在开发中，敬请期待');
                break;
            }
        }
    },

    /**
     * 没有声音的打开界面
     */
    onToggleView: function (type, data /*, callback*/ ) {
        switch (type) {
            case 'wanfa_layer': //玩法
            {
                cc.loadingControl.onToggleView('wanfa_layer');
                break;
            }
            case 'rank_layer': //排行榜
            {
                if (this.rank_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/rank_layer', function (err, prefab) {
                        self.rank_layer = cc.instantiate(prefab);
                        self.rank_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.rank_layer.active = true;
                    this.rank_layer.getComponent('Rank_layer').onOpenView();
                }
                break;
            }
            case 'zhanji_layer': //战绩
            {
                this.showZhanji("zhan");
                break;
            }
            case 'setting_layer': //设置
            {
                cc.loadingControl.onToggleView('setting_layer');
                break;
            }
            case 'share_layer': //分享
            {
                cc.loadingControl.onToggleView('share_layer');
                break;
            }
            case 'shop_layer': //商城
            {
                if (this.shop_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/shop_layer', function (err, prefab) {
                        self.shop_layer = cc.instantiate(prefab);
                        self.shop_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.shop_layer.active = true;
                    this.shop_layer.getComponent('Shop_layer').onOpenView();
                }
                break;
            }
            case 'join_layer': //加入房间
            {
                if (cc.vv.Global.room_id != null && cc.vv.Global.room_id.toString() != "0") {
                    console.log("cc.vv.Global.room_id=" + cc.vv.Global.room_id);
                    console.log("进入之前存在的房间");
                    this.loadSceneByName('game_scene');
                    return;
                }
                if (this.join_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/join_layer', function (err, prefab) {
                        self.join_layer = cc.instantiate(prefab);
                        self.join_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.join_layer.active = true;
                    this.join_layer.getComponent('Join_layer').onOpenView();
                }
                break;
            }
            case 'create_layer': //创建房间
            {
                if (cc.vv.Global.room_id != null && cc.vv.Global.room_id.toString() != "0") {
                    console.log("cc.vv.Global.room_id=" + cc.vv.Global.room_id);
                    console.log("进入之前存在的房间");
                    this.loadSceneByName('game_scene');
                    return;
                }
                if (this.create_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/create_layer', function (err, prefab) {
                        self.create_layer = cc.instantiate(prefab);
                        self.create_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.create_layer.active = true;
                    this.create_layer.getComponent('Create_layer').onOpenView();
                }
                break;
            }
            case 'club_layer': //俱乐部
            {
                if (this.club_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/club_layer', function (err, prefab) {
                        self.club_layer = cc.instantiate(prefab);
                        self.club_layer.parent = self.node_layer;
                    });
                } else {
                    this.club_layer.active = true;
                    this.club_layer.getComponent('Club_layer').onOpenView();
                }
                break;
            }
            case 'club_scene': //俱乐部界面
            {
                this.club_layer.active = false;
                if (this.club_scene == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/club_scene', function (err, prefab) {
                        self.club_scene = cc.instantiate(prefab);
                        self.club_scene.parent = self.node_layer;
                        self.club_scene.getComponent('club_scene').onOpenView(data);
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.2);
                    });
                } else {
                    this.club_scene.active = true;
                    this.club_scene.getComponent('club_scene').onOpenView(data);
                }
                break;
            }
            case 'gold_layer': //金币场、比赛场
            {
                if (this.gold_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/gold_layer', function (err, prefab) {
                        self.gold_layer = cc.instantiate(prefab);
                        self.gold_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.gold_layer.active = true;
                    //this.gold_layer.getComponent('Gold_layer').onOpenView();
                }
                break;
            }
            case 'task_layer': //任务
            {
                if (this.task_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/task_layer', function (err, prefab) {
                        self.task_layer = cc.instantiate(prefab);
                        self.task_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.task_layer.active = true;
                    this.task_layer.getComponent('Task_layer').onOpenView();
                }
                break;
            }
            case 'yqm_layer': //邀请码
            {
                if (this.yqm_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/yqm_layer', function (err, prefab) {
                        self.yqm_layer = cc.instantiate(prefab);
                        self.yqm_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.yqm_layer.active = true;
                    this.yqm_layer.getComponent('yqm_layer').onOpenView();
                }
                break;
            }
            case 'exch_layer': //兑换
            {
                if (this.exch_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/exchange_layer', function (err, prefab) {
                        self.exch_layer = cc.instantiate(prefab);
                        self.exch_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.exch_layer.active = true;
                    this.exch_layer.getComponent('exchange_layer').onOpenView();
                }
                break;
            }
            case 'daoju_layer': //道具层
            {
                if (this.daoju_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/daoju_layer', function (err, prefab) {
                        self.daoju_layer = cc.instantiate(prefab);
                        self.daoju_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.daoju_layer.active = true;
                    this.daoju_layer.getComponent('daoju_layer').onOpenView();
                }
                break;
            }
            case 'kefu_layer': //客服
            {
                if (this.kefu_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/kefu_layer', function (err, prefab) {
                        self.kefu_layer = cc.instantiate(prefab);
                        self.kefu_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.kefu_layer.active = true;
                    this.kefu_layer.getComponent('Kefu_layer').onOpenView();
                }
                break;
            }
            case 'daili_layer': //代理
            {
                //if(1 == cc.vv.userData.is_agency){
                if (this.daili_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/daili_layer', function (err, prefab) {
                        self.daili_layer = cc.instantiate(prefab);
                        self.daili_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.daili_layer.active = true;
                    this.daili_layer.getComponent('daili_layer').onOpenView();
                }
                //}
                break;
            }
            case 'activity_layer': //代理
            {
                if (this.activity_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/activity_layer', function (err, prefab) {
                        self.activity_layer = cc.instantiate(prefab);
                        self.activity_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.activity_layer.active = true;
                    this.activity_layer.getComponent('activity_layer').onOpenView();
                }
                break;
            }
        }
    },

    /**
     * 打开战绩界面，自己战绩或者代开房战绩
     */
    showZhanji: function (msg) {
        if (this.zhanji_layer == null) {
            cc.loadingControl.waiting_layer.active = true;
            cc.loadingControl.waiting_lab.string = '加载中';
            let self = this;
            cc.loader.loadRes('Prefab/hall/zhanji_layer', function (err, prefab) {
                self.zhanji_layer = cc.instantiate(prefab);
                self.zhanji_layer.parent = self.node_layer;
                self.zhanji_layer.getComponent('Zhanji_layer').onOpenView(msg);
                self.scheduleOnce(function () {
                    cc.loadingControl.waiting_layer.active = false;
                }, 0.5);
            });
        } else {
            this.zhanji_layer.active = true;
            this.zhanji_layer.getComponent('Zhanji_layer').onOpenView(msg);
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
        if (this.zhanji_layer && this.zhanji_layer.active) {
            let js = this.zhanji_layer.getComponent('Zhanji_layer');
            js.onClickView();
        }
        if (this.smrz_layer && this.smrz_layer.active) {
            let js = this.smrz_layer.getComponent('Smrz_layer');
            js.onClickView();
        }
        if (this.shop_layer && this.shop_layer.active) {
            let js = this.shop_layer.getComponent('Shop_layer');
            js.onClickView();
        }
        if (this.join_layer && this.join_layer.active) {
            let js = this.join_layer.getComponent('Join_layer');
            js.onClickView();
        }
        if (this.create_layer && this.create_layer.active) {
            let js = this.create_layer.getComponent('Create_layer');
            js.onClickView();
        }
        if (this.club_layer && this.club_layer.active) {
            let js = this.club_layer.getComponent('Club_layer');
            js.onClickView();
        }
        if (this.club_notice_layer && this.club_notice_layer.active) {
            let js = this.club_notice_layer.getComponent('Club_notice_layer');
            js.onClickView();
        }
        if (this.gold_layer && this.gold_layer.active) {
            let js = this.gold_layer.getComponent('Gold_layer');
            js.onClickView();
        }
        if (this.task_layer && this.task_layer.active) {
            let js = this.task_layer.getComponent('Task_layer');
            js.onClickView();
        }
        if (this.yqm_layer && this.yqm_layer.active) {
            this.task_layer.getComponent('Task_layer').onClickView();
        }

        // while (this.auto_texture.length) {
        //     let textur2D = this.auto_texture.shift();
        //     cc.loader.setAutoReleaseRecursively(textur2D, true);
        // }
    },

    /***请求消息***********************************************/
    /**
     * 请求大厅信息
     */
    sendDating: function () {
        var postData = {
            "mid": cc.vv.userData.mid
        };
        cc.vv.http.sendRequest(cc.vv.http.dating_url, postData, this.onReturnDatingInfo.bind(this));
    },

    /*****************返回消息********************************/
    /**
     * 返回大厅信息
     * @param data
     */
    onReturnDatingInfo: function (data) {
        console.log(data);
        if (data.status == 1) {
            var member = data.data.member;
            var banner = data.data.banner;
            this.member_data = member;
            cc.vv.userData.headimgurl = member.headimgurl;
            cc.vv.userData.ip = member.ip;
            cc.vv.userData.nickname = member.nickname;
            cc.vv.userData.num = member.num;
            cc.vv.userData.is_agency = member.is_agent;
            cc.vv.userData.phone = member.phone;
            cc.vv.userData.pid = member.pid;
            cc.vv.userData.user_level = member.level;
            this.win_number = member.win;
            // this.laba_node.getComponent(cc.Label).string = data.data.msg.content;
            let str = this.laba_node.getComponent(cc.Label).string;
            if(str != data.data.msg[0].content) {
                this.laba_node.getComponent(cc.Label).string = data.data.msg[0].content;
                this.end_x = -25 - this.laba_node.width;
                this.laba_node.x = this.begin_x;
            }
            let arr = [488, 1088, 1888, 3088, 4588, 6666, 9999, 18888, 28888];
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] > member.win) {
                    this.lab_win.string = member.win + "/" + arr[i];
                    let num = member.win / arr[i];
                    this.progress.progress = num;
                    break;
                }
            }
            this.initPlayerView();
            //let arr = this.pageView.content.children;
            //for (let i = 0; i < arr.length; i++) {
            //    let page = arr[i];
            //    // this.loadHeadTexture(page, banner[i].imageurl);
            //    this.loadHeadTexture(page, banner[i].img);
            //}
            let child_arr = this.pageView.content.children;
            let child_len = this.pageView.content.childrenCount;
            let len = banner.length;
            let max_len = Math.max(len, child_len);
            for (let i = 0; i < max_len; ++i) {
                let item = null;
                if (len && i < len) {
                    if (i < child_len) {
                        item = child_arr[i];
                        item.active = true;
                    } else {
                        item = cc.instantiate(this.page_item);
                        item.parent = this.pageView.content;
                    }
                    this.loadHeadTexture(item, banner[i].img);
                    let js = item.getComponent('page_item');
                    js.onOpenView(banner[i]);
                } else {
                    if (i < child_len) {
                        item = child_arr[i];
                        item.active = false;
                    }
                }
            }
        } else {
            this.showMsg(data.msg);
        }
    },

    /**
     * 返回创建房间结果
     */
    onReturnCreate: function (data) {
        //if (data.status == 1 && "" == data.club_id) {
        //    cc.vv.Global.room_id = data.room_id;
        //    cc.vv.Global.club_id = data.club_id;
        //    this.create_layer.active = false;
        //    this.loadSceneByName('game_scene');
        //}else if(data.club_id && "" != data.club_id){
        //    cc.clubControl.changeClubRoom();
        //}else {
        //    this.showMsg(data.msg);
        //}
        if (data.status == 1) {
            if (this.club_scene && this.club_scene.active) {
                cc.clubControl.changeClubRoom();
            } else {
                cc.vv.Global.room_id = data.room_id;
                cc.vv.Global.club_id = data.club_id;
                this.create_layer.active = false;
                this.loadSceneByName('game_scene');
            }
        } else {
            this.showMsg(data.msg);
        }
    },

    /**
     * 返回进入房间结果
     */
    onReturnJoin: function (data) {
        cc.loadingControl.waiting_layer.active = false;
        if (this.join_layer) {
            let js = this.join_layer.getComponent('Join_layer');
            js.resetLabNum();
        }
        if (data.status == 1) {
            cc.vv.Global.room_id = data.room_id;
            cc.vv.Global.club_id = data.club_id;
            if (this.join_layer) {
                this.join_layer.active = false;
            } else if (this.club_scene) {
                this.club_scene.active = false;
            }
            this.loadSceneByName('game_scene');
        } else {
            this.showMsg(data.msg);
        }
    }
});