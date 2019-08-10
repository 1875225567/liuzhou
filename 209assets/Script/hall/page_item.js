cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {
        this.item_data = null;

        this.node.on('touchend', this.node_click, this);
    },

    onOpenView:function(data){
        this.item_data = data;
    },

    node_click:function(){
        cc.hallControl.pageClick(this.item_data);
    }
});
