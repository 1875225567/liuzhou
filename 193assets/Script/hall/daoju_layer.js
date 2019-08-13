/**
 * 道具
 */
cc.Class({
    extends: cc.Component,

    properties: {
        zuan_lab_arr: [cc.Label], //身上钻石数文本
        view_arr: [cc.Node], //三个界面
        content_arr: [cc.Node],
        play_btn: cc.Node, //播放按钮
        play_sprite_arr: [cc.SpriteFrame] //0正常1播放
    },

    ctor: function () {
        this.isShowing = false;
        this.play_status = 0; //当前状态0正常1播放
        this.bg_index = 0; //当前选中的背景0-4
        this.music_index = 0; //当前选中的音乐0-2
        this.head_skin = 0; //当期选中的头像0-8
    },

    onLoad: function () {
        this.onOpenView();
    },

    onOpenView: function () {
        this.isShowing = true;
        this.play_status = 0;
        this.bg_index = cc.vv.userData.bg_index;
        this.music_index = cc.vv.userData.music_index;
        this.head_skin = cc.vv.userData.head_skin;
        this.updateView(0);
        this.updatePlayBtn();
        //var bg = this.node.getChildByName('bg');
        //bg.scale = 0;
        this.node.opacity = 0;
        this.node.runAction(cc.sequence(
            //cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
            cc.fadeIn(0.5),
            cc.callFunc(function () {
                this.isShowing = false;
            }.bind(this))
        ));
    },

    onClickView: function () {
        this.isShowing = true;
        //var bg = this.node.getChildByName('bg');
        //bg.scale = 1;
        this.node.runAction(cc.sequence(
            //cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
            cc.fadeOut(0.5),
            cc.callFunc(function () {
                this.isShowing = false;
                let index0 = parseInt(cc.vv.userData.bg_index);
                if (index0 != this.bg_index && cc.vv.userData.checkHasBg(this.bg_index)) {
                    cc.vv.userData.bg_index = this.bg_index;
                    cc.hallControl.loadResTexture(cc.hallControl.background, 'big_bg/hallbg_' + this.bg_index);
                } else {
                    cc.hallControl.loadResTexture(cc.hallControl.background, 'big_bg/hallbg_' + index0);
                }

                let index1 = parseInt(cc.vv.userData.music_index);
                if (index1 != this.music_index && cc.vv.userData.checkHasMusic(this.music_index)) {
                    cc.vv.userData.music_index = this.music_index;
                    cc.vv.audioMgr.playBGM("bgm_login" + cc.vv.userData.music_index, "mp3");
                } else {
                    cc.vv.audioMgr.playBGM("bgm_login" + index1, "mp3");
                }

                let index2 = parseInt(cc.vv.userData.head_skin);
                if (index2 != this.head_skin && cc.vv.userData.checkHasHead(this.head_skin)) {
                    cc.vv.userData.head_skin = this.head_skin;
                }
                cc.hallControl.initPlayerView();

                this.node.active = false;
            }.bind(this))
        ));
    },

    onDestroy: function () {
        cc.loader.setAutoReleaseRecursively('Prefab/hall/daoju_layer', true);
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        if (this.isShowing) return;
        switch (type.toString()) {
            case 'back':
                {
                    this.onClickView();
                    break;
                }
            case 'daoju0':
            case 'daoju1':
            case 'daoju2':
                {
                    let len = type.toString().length;
                    let index = parseInt(type.toString().charAt(len - 1));
                    this.updateView(index);
                    break;
                }
            case 'bg0': //选中背景
            case 'bg1':
            case 'bg2':
            case 'bg3':
            case 'bg4':
                {
                    let len = type.toString().length;
                    let index = parseInt(type.toString().charAt(len - 1));
                    this.bg_index = index;
                    this.updateBg(0);
                    break;
                }
            case 'music0': //选中音乐
            case 'music1':
            case 'music2':
                {
                    let len = type.toString().length;
                    let index = parseInt(type.toString().charAt(len - 1));
                    this.music_index = index;
                    this.updateBg(1);
                    break;
                }
            case 'head_0':
            case 'head_1':
            case 'head_2':
            case 'head_3':
            case 'head_4':
            case 'head_5':
            case 'head_6':
            case 'head_7':
            case 'head_8':
                {
                    let arr = type.toString().split('_');
                    let index = parseInt(arr[1]);
                    this.head_skin = index;
                    this.updateHeadSkin();
                    break;
                }
            case 'duihuan_0': //请求兑换背景
            case 'duihuan_1': //请求兑换音乐
            case 'duihuan_2': //请求兑换头像
                {
                    break;
                }
            case 'play':
                {
                    this.play_status = this.play_status == 0 ? 1 : 0; //当前状态0正常1播放
                    //处理音乐播放
                    this.updatePlayBtn();
                    break;
                }
        }
    },

    initRightView: function () {
        for (var i = 0; i < this.view_arr.length; ++i) {
            this.view_arr[i].active = i == this.module_index ? true : false;
        }
        this.play_btn.active = this.module_index == 2 ? true : false;
    },

    /**
     * 更新容器
     */
    updateView: function (index) {
        for (let i = 0; i < this.view_arr.length; i++) {
            let view = this.view_arr[i];
            view.active = i == index ? true : false;
        }
        if (index != 2) {
            this.updateBg(index);
        } else {
            this.updateHeadSkin();
        }
    },

    /**
     * 更新二级界面
     */
    updateBg: function (index) {
        let content = this.content_arr[index];
        let children = content.children;
        let childrenCount = content.childrenCount;
        for (let i = 0; i < childrenCount; i++) {
            let node = children[i];
            let select = node.getChildByName('select');
            let checkmark = node.getChildByName('checkmark');
            if(index == 0){
                select.active = i == this.bg_index ? true : false;
            }else if(index == 1){
                select.active = i == this.music_index ? true : false;
            }else{
                select.active = i == this.head_skin ? true : false;
            }
            checkmark.active = select.active;
        }
        let btn = this.view_arr[index].getChildByName('btn').getComponent(cc.Button);
        let lab = this.view_arr[index].getChildByName('lab').getComponent(cc.Label);
        if (index == 0) {
            if (cc.vv.userData.checkHasBg(this.bg_index)) {
                lab.string = '已兑换';
                btn.ineractable = false;
            } else {
                lab.string = 'x1000';
                btn.ineractable = true;
            }
        } else if (index == 1) {
            if (cc.vv.userData.checkHasMusic(this.music_index)) {
                lab.string = '已兑换';
                btn.ineractable = false;
            } else {
                lab.string = 'x1000';
                btn.ineractable = true;
            }
        }
    },

    /**
     * 更新试听按钮
     */
    updatePlayBtn: function () {
        let icon = this.play_btn.getChildByName('icon').getComponent(cc.Sprite);
        icon.spriteFrame = this.play_sprite_arr[this.play_status];
        let lab = this.play_btn.getChildByName('lab').getComponent(cc.Label);
        lab.string = this.play_status == 0 ? '试听' : '暂停';
        if (this.play_status == 1) {
            cc.vv.audioMgr.playBGM("bgm_login" + this.music_index, "mp3");
        }
    },

    /**
     * 更新头像框
     */
    updateHeadSkin: function () {
        let index = Math.floor(this.head_skin / 3); //除3向下取整
        let index0 = this.head_skin % 3;
        let content = this.content_arr[2];
        let children = content.children;
        let childrenCount = content.childrenCount;
        for (let i = 0; i < childrenCount; i++) {
            let node = children[i];
            let icon = node.getChildByName('icon');
            let lab = node.getChildByName('lab');
            let btn = node.getChildByName('btn').getComponent(cc.Button);
            icon.active = i == index ? true : false;
            lab.active = icon.active;
            if (lab.active) {
                //根据配置修改需要兑换的值
                if (cc.vv.userData.checkHasHead(this.head_skin)) {
                    lab.getComponent(cc.Label).string = '已兑换';
                } else {
                    lab.getComponent(cc.Label).string = 'x1000';
                }
            }
            btn.interactable = icon.active;
            for (let j = 0; j < 3; j++) {
                let item = node.getChildByName('item' + j);
                let checkmark = item.getChildByName('checkmark');
                if (i == index) {
                    checkmark.active = j == index0 ? true : false;
                } else {
                    checkmark.active = false;
                }
            }
        }
    }
});