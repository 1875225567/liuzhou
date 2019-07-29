var SETTING_WIDTH = 388;
/**
 * 设置层
 */
cc.Class({
    extends: cc.Component,

    properties: {
        name_lab: cc.Label,
        head: cc.Node,
        sound_slider: cc.Slider,
        sound_mask: cc.Node,
        music_slider: cc.Slider,
        music_mask: cc.Node,
        sound_toggle: cc.Toggle, //音效
        music_toggle: cc.Toggle, //音乐
        face_toggle: cc.Toggle, //互动表情
        change_toggle: cc.Toggle, //背景自动更换
        language_toggle_arr: [cc.Toggle]
    },

    ctor: function () {
        this.isShowing = false;
    },

    onLoad: function () {
        this.onOpenView();
    },

    initView: function () {
        this.sound_slider.progress = cc.vv.audioMgr.sfxVolume;
        this.music_slider.progress = cc.vv.audioMgr.bgmVolume;
        this.onSlider(null, 0);
        this.onSlider(null, 1);

        this.face_toggle.isChecked = cc.vv.userData.face_status == 1 ? true : false;
        this.change_toggle.isChecked = cc.vv.userData.change_bg == 1 ? true : false;

        for (let i = 0; i < this.language_toggle_arr.length; i++) {
            let toggle = this.language_toggle_arr[i];
            toggle.isChecked = i == cc.vv.userData.language_type ? true : false;
        }

        this.loadHeadTexture(this.head, cc.vv.userData.headimgurl);
        this.name_lab.string = cc.vv.Global.getNameStr(cc.vv.userData.nickname);
    },

    onOpenView: function () {
        //this.isShowing = true;
        //var bg = this.node.getChildByName('bg');
        //bg.scale = 0;
        this.initView();
        //bg.runAction(cc.sequence(
        //    cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
        //    cc.callFunc(function () {
        //        this.isShowing = false;
        //    }.bind(this))
        //));
    },

    onClickView: function () {
        //this.isShowing = true;
        //var bg = this.node.getChildByName('bg');
        //bg.scale = 1;
        //bg.runAction(cc.sequence(
        //    cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
        //    cc.callFunc(function () {
        //        this.isShowing = false;
                this.node.active = false;
                cc.vv.audioMgr.saveSetting();
                cc.hallControl.closeTime();
        //    }.bind(this))
        //));
    },

    onDestroy: function () {
        cc.loader.setAutoReleaseRecursively('Prefab/hall/setting_layer', true);
    },

    /**
     * 按钮点击监听
     */
    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        if (this.isShowing) return;
        switch (type.toString()) {
            case 'ok':
            case 'back':
            {
                this.onClickView();
                break;
            }
            case 'sound':
            {
                if (this.sound_toggle.isChecked) {
                    this.sound_slider.progress = 1;
                } else {
                    this.sound_slider.progress = 0;
                }
                let progress = this.sound_slider.progress;
                this.sound_mask.width = progress * SETTING_WIDTH;
                cc.vv.audioMgr.setSFXVolume(progress);
                break;
            }
            case 'music':
            {
                if (this.music_toggle.isChecked) {
                    this.music_slider.progress = 1;
                } else {
                    this.music_slider.progress = 0;
                }
                let progress = this.music_slider.progress;
                this.music_mask.width = progress * SETTING_WIDTH;
                cc.vv.audioMgr.setBGMVolume(progress);
                break;
            }
            case 'face_status':
            {
                cc.vv.userData.face_status = this.face_toggle.isChecked ? 1 : 0;
                break;
            }
            case 'change_bg':
            {
                cc.vv.userData.change_bg = this.change_toggle.isChecked ? 1 : 0;
                break;
            }
            case 'changeID':
            {
                cc.loadingControl.onToggleView('notice_layer', '是否切换账号？', function () {
                    var user_plugin = cc.vv.Global.protocolUser;
                    //调用用户系统登出功能
                    if (user_plugin && user_plugin.isFunctionSupported("logout")) {
                        user_plugin.callFuncWithParam("logout");
                    }
                    if (user_plugin && user_plugin.isFunctionSupported("accountSwitch")) {
                        user_plugin.callFuncWithParam("accountSwitch");
                    }
                }.bind(this));
                break;
            }
            case 'language_0':
            {
                let arr = type.toString().split('_');
                let index = parseInt(arr[1]);
                cc.log(arr);
                cc.vv.userData.language_type = parseInt(index);
                break;
            }
            case 'language_1':
            {
                let arr = type.toString().split('_');
                let index = parseInt(arr[1]);
                cc.log(arr);
                cc.vv.userData.language_type = parseInt(index);
                break;
            }
        }
    },

    /**
     * 滑动控制监听
     */
    onSlider: function (event, type) {
        if (type.toString() == '0') {
            let progress = this.sound_slider.progress;
            this.sound_mask.width = progress * SETTING_WIDTH;
            cc.vv.audioMgr.setSFXVolume(progress);
            if (progress <= 0) {
                this.sound_toggle.isChecked = false;
            } else {
                this.sound_toggle.isChecked = true;
            }
        } else {
            let progress = this.music_slider.progress;
            this.music_mask.width = progress * SETTING_WIDTH;
            cc.vv.audioMgr.setBGMVolume(progress);
            if (progress <= 0) {
                this.music_toggle.isChecked = false;
            } else {
                this.music_toggle.isChecked = true;
            }
        }
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
    }
});