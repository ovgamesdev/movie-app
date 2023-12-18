package com.movieapp

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import android.os.Build
import android.os.Bundle
import android.view.WindowManager


class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "MovieApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  // TODO TEST
  override fun onCreate(savedInstanceState: Bundle?) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        val layoutParams = WindowManager.LayoutParams()
        layoutParams.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        window.attributes = layoutParams
        // window.addFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS)
        window.addFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION)
    }

    // fix https://github.com/software-mansion/react-native-screens/issues/17#issuecomment-424704067  
    super.onCreate(null)
  }


  /**
  * // NOTE Java version
  * @Override
  * protected void onCreate(Bundle savedInstanceState) {
  *     if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
  *         WindowManager.LayoutParams layoutParams = new WindowManager.LayoutParams();
  *         layoutParams.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
  *         getWindow().setAttributes(layoutParams);
  *       // getWindow().addFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
  *         getWindow().addFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
  *     }
  *
  *     // fix https://github.com/software-mansion/react-native-screens/issues/17#issuecomment-424704067
  *     super.onCreate(null);
  * }
  */

}

