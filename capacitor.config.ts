import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.prunance.pro',
  appName: 'Prunance Pro',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#3b82f6",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
