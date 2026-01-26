package com.enlared.mobile;

import android.net.TrafficStats;
import android.os.Process;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

public class BandwidthModule extends ReactContextBaseJavaModule {
    public static final String NAME = "BandwidthModule";

    public BandwidthModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void getTotalBytes(Promise promise) {
        try {
            int uid = Process.myUid();
            long rxBytes = TrafficStats.getUidRxBytes(uid);
            long txBytes = TrafficStats.getUidTxBytes(uid);

            // TrafficStats returns -1 if not supported
            if (rxBytes == -1 || txBytes == -1) {
                promise.reject("UNSUPPORTED", "TrafficStats not supported on this device");
                return;
            }

            WritableMap map = Arguments.createMap();
            // JS numbers are doubles, but longs can exceed 2^53.
            // However, network usage is unlikely to exceed 9 petabytes in a mobile app
            // session/lifetime context easily tailored to double precision for now,
            // or we could send as strings. For simplicity and standard usage, double is
            // fine.
            map.putDouble("rx", (double) rxBytes);
            map.putDouble("tx", (double) txBytes);

            promise.resolve(map);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}
