//原生交互控制
cc.NativeMsg = {
    'isGetLocation': false,
    'lat': 0,
    'lng': 0,
    'address': '',
    'mobile': '',
};

//android通知用户信息
cc.NativeMsg.callBackUserInfo = function (sex, unionid, nickname, url) {
    cc.loadingControl.showWaiting(false);
    console.log("android返回信息：sex" + sex + ' unionid: ' + unionid + ' nickname: ' + nickname);
    // cc.vv.http.sendGetAccess_token(url, 0);
    cc.vv.userData.uid = unionid;
    cc.vv.userData.sex = sex;
    cc.vv.userData.nickname = nickname;
    cc.vv.userData.avatarUrl = url;
    cc.loginControl.sendLoginGame();
};

/**
 * android返回经纬度
 * @param latitude
 * @param longitude
 * @param address
 * @param bra
 * @param mod
 */
cc.NativeMsg.getLocation = function (latitude, longitude, address, bra, mod) {
    console.log('android返回定位', latitude, longitude, address, bra, mod);

    cc.NativeMsg.lat = latitude;
    cc.NativeMsg.lng = longitude;
    cc.NativeMsg.address = address;
    cc.NativeMsg.mobile = bra + mod;
    cc.NativeMsg.isGetLocation = true;
};

//IOS通知用户信息
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
 * @param latitude
 * @param longitude
 * @param address
 * @param bra
 * @param mod
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