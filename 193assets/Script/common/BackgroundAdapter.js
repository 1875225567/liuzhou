/**
 * 背景自适应
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

	ctor (){
		
	},

    onLoad () {
        let srcScaleForShowAll = Math.min(cc.view.getCanvasSize().width / this.node.width, cc.view.getCanvasSize().height / this.node.height);
        let realWidth = this.node.width * srcScaleForShowAll;
        let realHeight = this.node.height * srcScaleForShowAll;

        // 2. 基于第一步的数据，再做缩放适配
        this.node.scale = Math.max(cc.view.getCanvasSize().width / realWidth, cc.view.getCanvasSize().height / realHeight);
	},

    start () {

    },

    update (dt) {
		
	},
});
