/**
 * 比赛场/金币场
 */
cc.Class({
    extends: cc.Component,

    properties: {

    },
    ctor: function () {
        this.hallControl = cc.hallControl;
    },
    onLoad: function () {

    },
    onDestroy: function () {
        this.hallControl = null;
        cc.loader.setAutoReleaseRecursively('Prefab/hall/gold_layer', true);
    },
    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case 'back':
                {
                    this.onClickView();
                    break;
                }
            case 'gold_0':
            case 'gold_1':
            case 'gold_2':
            case 'gold_3':
                {

                    break;
                }
            case 'club':
                {
                    this.hallControl.onToggleView('club_layer');
                    this.onClickView();
                    break;
                }
            case 'shop':
                {
                    this.hallControl.onToggleView('shop_layer');
                    this.onClickView();
                    break;
                }
            case 'task':
                {
                    this.hallControl.onToggleView('task_layer');
                    this.onClickView();
                    break;
                }
        }
    },
    onClickView: function () {
        this.node.active = !this.node.active;
    },
});