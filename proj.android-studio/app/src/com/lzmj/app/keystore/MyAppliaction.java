package com.lzmj.app.keystore;

import android.app.Application;

import cn.jiguang.share.android.api.JShareInterface;
import cn.jiguang.share.android.api.PlatformConfig;

public class MyAppliaction extends Application {
    @Override
    public void onCreate() {
        super.onCreate();

        JShareInterface.setDebugMode(true);
        PlatformConfig platformConfig = new PlatformConfig()
                .setWechat("wxf205e04421c08ba3", "1b28d8e7f85831ba812b643db0de432c");

        JShareInterface.init(this, platformConfig);
    }
}
