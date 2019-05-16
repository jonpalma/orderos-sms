package com.smsgateway;

import com.facebook.react.ReactActivity;
import android.content.Intent; // <-- include if not already there

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "smsgateway";
    }
}
