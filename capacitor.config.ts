import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sinceonearth.app',
  appName: 'Since On Earth',
  webDir: 'dist',
  server: {
    url: 'https://sinceonearth.com',
    cleartext: false,
  },
};

export default config;
