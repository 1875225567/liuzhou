/**
 * 加载场景层 注意：本界面收到通知，只显示1.5秒
 */
cc.Class({
    extends: cc.Component,

    properties: {
        zIndex: 97,
        loading_lab: cc.Label,
        loading_progress: cc.ProgressBar,
        loading_ani: cc.Animation
    },

    ctor: function () {
        this.progress = 0;
        this.rate = 0;
        this.progress0 = 0;
        this.progress1 = 0;
        this.isFirst = false;
        this.isEnd = false;
        this.timeCout = 0;
        this.ani_arr = [];
        this.begin_x = -406;
        this.max_len = 812;
    },

    onLoad: function () {
        this.node.zIndex = this.zIndex;
        this.ani_arr = this.loading_ani.getClips();
    },

    onOpenView: function () {
        this.loading_progress.progress = 0;
        this.progress0 = 0.3 + parseFloat((Math.random() * 0.3).toFixed(2)); //随机进度
        this.rate = this.progress0 / 30; //0.5秒内完成第一次进度
        let index = Math.floor(Math.random() * this.ani_arr.length);
        let clip = this.ani_arr[index];
        this.loading_ani.play(clip._name);
        this.loading_ani.node.x = this.begin_x;

        this.progress = 0;
        this.progress1 = 0;
        this.isFirst = true;
        this.isEnd = false;
        this.timeCout = 0;
    },

    /**
     * 等待完成，进入后续加载
     */
    waitCompleted: function () {
        this.isFirst = false;
        this.progress1 = 1 - this.progress; //计算剩下的
        this.rate = this.progress1 / 60; //用1秒完成
        this.isEnd = true;
    },

    /**
     * 加载完成，隐藏界面
     */
    loadingCompleted: function () {
        this.scheduleOnce(function () {
            this.node.active = false;
        }, 0.3);
    },

    update: function () {
        this.progress += this.rate;
        this.loading_progress.progress = this.progress;
        if (this.isFirst && this.progress >= this.progress0) {
            this.rate = 0;
        }
        if (this.isEnd && this.progress >= 1) {
            this.progress = 1;
            this.rate = 0;
            this.isEnd = false;
            this.loadingCompleted();
        }
        this.loading_lab.string = (this.progress * 100).toFixed(0) + '%';
        this.loading_ani.node.x = this.begin_x + this.max_len * this.progress;
        this.timeCout++;
    },

    onDestroy: function () {
        cc.loader.setAutoReleaseRecursively('Prefab/common/loading_layer', true);
    }
});