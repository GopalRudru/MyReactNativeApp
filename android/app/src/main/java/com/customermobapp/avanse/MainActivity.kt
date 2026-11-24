package com.customermobapp.avanse

import android.os.Build
import android.os.Bundle
import android.view.View
import androidx.core.view.WindowCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.devio.rn.splashscreen.SplashScreen

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "avanseCustomerApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun onCreate(savedInstanceState: Bundle?) {
      SplashScreen.show(this) // <- Show splash screen
      // ✅ Tell system we want to handle insets manually (edge-to-edge mode)
      if (Build.VERSION.SDK_INT >= 35)
          WindowCompat.setDecorFitsSystemWindows(window, false)

      //super.onCreate(savedInstanceState)
      super.onCreate(null)

      // ✅ Apply padding so RN root view doesn't overlap status/navigation bars
      // Only run on API level 35 and above
      if (Build.VERSION.SDK_INT >= 35) {
          val rootView = findViewById<View>(android.R.id.content)
          ViewCompat.setOnApplyWindowInsetsListener(rootView) { view, insets ->
              val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
              view.updatePadding(
                  top = systemBars.top,       // Status bar
                  bottom = systemBars.bottom  // Navigation bar
              )
              insets
          }
      }
  }


  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
