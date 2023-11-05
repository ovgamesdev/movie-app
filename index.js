/**
 * @format
 */

import { AppRegistry } from 'react-native'
import { name as appName } from './app.json'
import App from './src/App'

// LogBox.ignoreLogs(['new NativeEventEmitter'])
// Platform.constants.uiMode = 'tv' // "tv" | "normal"

AppRegistry.registerComponent(appName, () => App)
