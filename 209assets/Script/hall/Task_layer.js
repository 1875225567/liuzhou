var BEGIN_Y = 272;
/**
 * 任务层
 */
cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.Node,
        content: cc.Node,
        item_prefab: cc.Prefab,
        spriteFrame_arr: [cc.SpriteFrame], //0绿色1红色
    },
    ctor: function () {
        this.hallControl = cc.hallControl;
        this.space = 145;
        this.begin_y = -68;
    },
    onLoad: function () {
        this.scrollView.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.onOpenView();
    },
    onOpenView: function () {
        this.isShowing = true;
        var bg = this.node.getChildByName('bg');
        bg.scale = 0;
        bg.runAction(cc.sequence(
            cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
            cc.callFunc(function () {
                this.isShowing = false;
                this.sendRequest();
            }.bind(this))
        ));
    },
    onClickView: function () {
        this.isShowing = true;
        var bg = this.node.getChildByName('bg');
        bg.scale = 1;
        bg.runAction(cc.sequence(
            cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
            cc.callFunc(function () {
                this.isShowing = false;
                this.node.active = false;
            }.bind(this))
        ));
    },
    onDestroy: function () {
        this.scrollView.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.hallControl = null;
        cc.loader.setAutoReleaseRecursively('Prefab/hall/task_layer', true);
    },
    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('sound/ui_open', 'mp3');
        switch (type.toString()) {
            case 'back':
                {
                    this.onClickView();
                    break;
                }
        }
    },
    onTouchMove: function (event) {
        var delta = event.getDelta();
        this.content.y += delta.y;
        if (this.content.y >= BEGIN_Y + this.content.height - this.scrollView.height) {
            this.content.y = BEGIN_Y + this.content.height - this.scrollView.height;
        }
        if (this.content.y <= BEGIN_Y) {
            this.content.y = BEGIN_Y;
        }
    },
    /**
     * 点击领取
     */
    onClickAward: function (event) {
        cc.vv.audioMgr.playSFX('sound/ui_open', 'mp3');
        let btn = event.target;
        let obj = btn.obj;
        //请求领取奖励
        this.sendRequest2();
    },
    /**
     * 请求战绩数据
     */
    sendRequest: function () {

    },
    /**
     * 请求领取奖励
     */
    sendRequest2: function () {

    },
    /**
     * 返回扎你数据
     */
    onReturnListData: function (data) {
        if (data.status == 1) {
            var arr = data.data;
            var len = arr.length;
            var childCount = this.content.childrenCount;
            var children = this.content.children;
            var max_len = Math.max(len, childCount);
            this.content.y = BEGIN_Y;

            for (let i = 0; i < max_len; i++) {
                var item;
                if (len > 0) {
                    if (i < len) {
                        if (i < childCount) {
                            item = children[i];
                            item.active = true;
                        } else {
                            item = cc.instantiate(this.item_prefab);
                            item.parent = this.content;
                        }
                        item.y = this.begin_y - i * this.space;
                        this.showItem(item, arr[i]);
                    } else {
                        if (i < childCount) {
                            item = children[i];
                            item.active = false;
                        }
                    }
                } else {
                    if (i < childCount) {
                        item = children[i];
                        item.active = false;
                    }
                }
            }
            this.content.setContentSize(cc.size(this.scrollView.width, max_len * this.space));
        } else {
            this.hallControl.showMsg(data.msg);
        }
    },
    /**
     * 领取返回
     */
    onResturnGetAward: function (data) {
        if (data.status == 1) {
            this.hallControl.showMsg('领取成功');
            cc.vv.userData.num = data.num;
            //请求数据，刷新界面
        } else {
            this.hallControl.showMsg(data.msg);
        }
    },
    /**
     * 显示列表数据
     */
    showItem: function (item, obj) {
        let lab = item.getChildByName('reward_bg').getChildByName('lab');
        lab.getComponent(cc.Label).string = obj.gold;
        let lab0 = item.getChildByName('lab0');
        lab0.getComponent(cc.Label).string = obj.content;
        let btn = item.getChildByName('btn');
        let btn_lab = btn.getChildByName('lab').getComponent(cc.Label);
        if (obj.type == 1) {
            //可领取
            btn.getComponent(cc.Sprite).spriteFrame = this.spriteFrame_arr[1];
            btn.getComponent(cc.Button).interactable = true;
            btn_lab.string = '可领取';
            btn.obj = obj;
            btn.on(cc.Node.EventType.TOUCH_END, this.onClickAward, this);
        } else {
            btn.getComponent(cc.Sprite).spriteFrame = this.spriteFrame_arr[0];
            btn.getComponent(cc.Button).interactable = false;
            if (obj.type == 0) {
                btn_lab.string = '未完成';
            } else {
                btn_lab.string = '已完成';
            }
        }
        let progressBar = item.getChildByName('ProgressBar').getComponent(cc.ProgressBar);
        progressBar.progress = obj.num / obj.zong;
        let lab1 = item.getChildByName('lab1').getComponent(cc.Label);
        lab1.string = obj.num + "/" + obj.zong;
    }
});