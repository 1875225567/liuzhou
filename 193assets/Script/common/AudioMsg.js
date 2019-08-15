/**
 * 音频控制类
 */
cc.Class({
    extends: cc.Component,

    properties: {
        bgmVolume: 1.0, //背景音量
        sfxVolume: 1.0, //音效音量
        bgmAudioID: -1  //背景音乐id
    },

    // use this for initialization
    init: function () {
        this.bgmVolume = parseFloat(cc.vv.userData.bgmVolume);
        this.sfxVolume = parseFloat(cc.vv.userData.sfxVolume);
    },

    /**获取声音地址*/
    getUrl: function (url, type) {
        //return cc.url.raw("resources/sound/" + url + "." + type);
        return "sound/" + url;
    },

    /**播放背景音乐*/
    playBGM: function (url, type) {
        var audioUrl = this.getUrl(url, type);
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.stop(this.bgmAudioID);
        }
        //this.bgmAudioID = cc.audioEngine.play(audioUrl, true, this.bgmVolume);
        var self = this;
        cc.loader.loadRes(audioUrl, cc.AudioClip, function (err, clip) {
            self.bgmAudioID = cc.audioEngine.play(clip, true, self.bgmVolume);
        });
    },

    /**播放音效*/
    playSFX: function (url, type) {
        var audioUrl = this.getUrl(url, type);
        if (this.sfxVolume > 0) {
            //var audioId = cc.audioEngine.play(audioUrl, false, this.sfxVolume);
            var self = this;
            //不关闭音效或者是语音播放
            cc.loader.loadRes(audioUrl, cc.AudioClip, function (err, clip) {
                /*let sfxId = */cc.audioEngine.play(clip, false, self.sfxVolume);
                //cc.log("音效长度哦",cc.audioEngine.getDuration(sfxId));
            });
        }
    },

    /**设置音效音量*/
    setSFXVolume: function (v) {
        if (this.sfxVolume != v) {
            this.sfxVolume = v;
        }
    },

    /**设置音乐音量*/
    setBGMVolume: function (v, force) {
        if (this.bgmAudioID >= 0) {
            if (this.bgmVolume != v || force) {
                this.bgmVolume = v;
            }
            cc.audioEngine.setVolume(this.bgmAudioID, this.bgmVolume);
        }
    },

    /**保存音量*/
    saveSetting: function () {
        cc.vv.userData.bgmVolume = this.bgmVolume;
        cc.vv.userData.sfxVolume = this.sfxVolume;
        cc.vv.userData.saveUserInfo();
    },

    stopBMG: function () {
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.stop(this.bgmAudioID);
        }
    },

    pauseBMG: function () {
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.pause(this.bgmAudioID);
        }
    },

    resumeBMG: function () {
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.resume(this.bgmAudioID);
        }
    },

    /**
     * 播放对应的音效
     * @param sex  性别
     * @param type 类型   0  打牌    chi/peng/gang/hu  对应相应操作
     * @param pai  牌
     */
    playSoundName:function (sex, type, pai) {
        var packagee  = "";
        var sexx = "";
        var soundName = "";
        // cc.log(cc.vv.Global.languageType);
        if(cc.vv.userData.language_type == 0){           //语言 type   0：普通话   1:方言
            packagee = "putonghua/";
        }else{
            packagee = "liuzhouhua/";
        }
        if(sex == 1){
            sexx = "man/man_"
        }else{
            sexx = "female/female_"
        }
        if(type == 0 || type.toString() == "0"){
            soundName = packagee + sexx + pai;
        }else{
            soundName = packagee + sexx + type;
        }
        console.log("soundName=" + soundName);
        this.playSFX(soundName,"mp3");
    }
});