//原生交互控制
cc.NativeMsg = {
    'isGetLocation': false,
    'lat': 0,
    'lng': 0,
    'address': '',
    'mobile': ''
};

/**
 * 微信登录成功后返回的用户数据（安卓）
 * @param sex 性别
 * @param unionid uid
 * @param nickname 昵称
 * @param url 头像url
 */
cc.NativeMsg.callBackUserInfo = function (sex, unionid, nickname, url) {
    cc.loadingControl.showWaiting(false);
    console.log("android返回信息：sex: " + sex + ' unionid: ' + unionid + ' nickname: ' + nickname);
    // cc.vv.http.sendGetAccess_token(url, 0);
    cc.vv.userData.uid = unionid;
    cc.vv.userData.sex = sex;
    cc.vv.userData.nickname = nickname;
    cc.vv.userData.avatarUrl = url;
    cc.loginControl.sendLoginGame();
};

/**
 * android返回经纬度
 * @param latitude 纬度
 * @param longitude 经度
 * @param address 地址
 * @param bra 手机品牌
 * @param mod 手机型号
 * @param dev 机器码
 */
cc.NativeMsg.getLocation = function (latitude, longitude, address, bra, mod, dev) {
    console.log('android返回定位', latitude, longitude, address, bra, mod, dev);

    cc.NativeMsg.lat = latitude;
    cc.NativeMsg.lng = longitude;
    cc.NativeMsg.address = address;
    cc.NativeMsg.mobile = bra + mod;
    cc.vv.userData.device = dev;
    cc.NativeMsg.isGetLocation = true;
};


/**
 * 微信登录成功后返回的用户数据（IOS）
 */
cc.NativeMsg.callBackIOSUserInfo = function () {
    cc.loadingControl.showWaiting(false);
    var nickname = jsb.reflection.callStaticMethod("RootViewController", "getNickName");
    var unionid = jsb.reflection.callStaticMethod("RootViewController", "getOpenId");
    var sex = jsb.reflection.callStaticMethod("RootViewController", "getSex");
    var url = jsb.reflection.callStaticMethod("RootViewController", "getHeadImgUrl");

    console.log("ios返回信息：sex" + sex + ' unionid: ' + unionid + ' nickname: ' + nickname);

    cc.vv.userData.uid = unionid;
    cc.vv.userData.sex = sex;
    cc.vv.userData.nickname = nickname;
    cc.vv.userData.avatarUrl = url;
    cc.loginControl.sendLoginGame();
};

/**
 * ios返回经纬度
 */
cc.NativeMsg.backLocation = function () {
    console.log('ios返回定位');
    var latitude = jsb.reflection.callStaticMethod("RootViewController", "getLatitude");
    var longitude = jsb.reflection.callStaticMethod("RootViewController", "getLongtiude");
    var address = jsb.reflection.callStaticMethod("RootViewController", "getAddress");
    var bra = jsb.reflection.callStaticMethod("RootViewController", "getBar");
    var mod = jsb.reflection.callStaticMethod("RootViewController", "getMod");

    cc.NativeMsg.lat = latitude;
    cc.NativeMsg.lng = longitude;
    cc.NativeMsg.address = address;
    cc.NativeMsg.mobile = bra + mod;
    cc.NativeMsg.isGetLocation = true;
};

/**
 * 闲聊登录返回（安卓）
 * @param code
 */
cc.NativeMsg.backXianLiao = function (code) {
    console.log("闲聊登录返回",code);
    cc.vv.userData.XLcode = code;
    cc.loginControl.sendXianLiao();
};