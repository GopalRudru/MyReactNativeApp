#import "AppDelegate.h"
#import "RNSplashScreen.h"
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <Firebase.h>
@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"avanseCustomerApp";
  self.initialProps = @{};

  BOOL result = [super application:application didFinishLaunchingWithOptions:launchOptions];
  [FIRApp configure];
#if DEBUG
  [[FIRCrashlytics crashlytics] setCrashlyticsCollectionEnabled:YES];
#endif

  [RNSplashScreen show]; // <-- ADD THIS LINE

  return result;
}

// Old architecture (Paper) entry point. RCTAppDelegate requires this when
// RCT_NEW_ARCH_ENABLED is off; the new-arch path uses -bundleURL instead.
- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
