/**
 * @format
 */

import { AppRegistry, Platform } from 'react-native'
import Config from 'react-native-config'
import { name as appName } from './app.json'
import App from './src/App'

// LogBox.ignoreLogs(['new NativeEventEmitter'])
if (Config.UI_MODE) {
	Platform.constants.uiMode = Config.UI_MODE
}

AppRegistry.registerComponent(appName, () => App)
