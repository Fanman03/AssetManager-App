const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Allows the app to connect to HTTP-only asset servers on Android.
 * This is a config plugin so EAS applies it when it generates the ignored
 * android/ directory during a cloud build.
 */
module.exports = function withCleartextTraffic(config) {
  return withAndroidManifest(config, (updatedConfig) => {
    const application = updatedConfig.modResults.manifest.application?.[0];
    if (application) {
      application.$['android:usesCleartextTraffic'] = 'true';
    }
    return updatedConfig;
  });
};
