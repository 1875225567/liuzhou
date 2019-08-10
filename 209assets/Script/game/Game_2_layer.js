/***
 * 二人游戏控制场景引用
 */

cc.Class({
    extends: cc.Component,

    properties: {
        //头像节点组
        player_node_arr: [cc.Node],
        timer_node:cc.Node,
    },

    ctor: function () {
        this.player_id_arr = [];            //用户id数组
    },


    onLoad () {
        cc.gameCardControl = this;
     },

    start () {

    },
     update (dt) {

     },
});
