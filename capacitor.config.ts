
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fiNotes.app',
  appName: 'fiNotes',
  webDir: 'dist',

  android: {
    buildOptions: {
      keystorePath: 'android.keystore',
      keystoreAlias: 'fiNotes',
    }
  },
  // ios: {
  //   scheme: 'fiNotes'
  // }

  plugins: {
    Keyboard: {
      resize: "none"
    }
  }

};

export default config;
