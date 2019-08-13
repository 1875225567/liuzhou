cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {
        this.node.on("touchend", this.onTouchEnd.bind(this));
    },

    onOpenView: function (data,index,compent) {
        cc.log(data);
        this.parent = compent;
        let lab0 = this.node.getChildByName("lab0").getComponent(cc.Label);
        let lab1 = this.node.getChildByName("lab1").getComponent(cc.Label);
        lab0.string = data.num + '钻石';
        lab1.string = '￥' + data.money;

        let animationName = "zuanshi";
        if(6 > index){
            animationName += index;
        }else{
            animationName += 6;
        }
        let zuan = this.node.getChildByName("zuanshisc").getComponent(sp.Skeleton);
        zuan.clearTrack(0);
        zuan.setAnimation(0, animationName, true);
    },

    onTouchEnd: function () {
        this.parent.getChong();
    },
});
