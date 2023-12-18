/**
 * @format
 */

import { backgroundTask } from '@hooks'
import { AppRegistry, LogBox, Platform } from 'react-native'
import BackgroundFetch from 'react-native-background-fetch'
import Config from 'react-native-config'
import { name as appName } from './app.json'
import App from './src/App'

LogBox.ignoreLogs(['new NativeEventEmitter', '[notifee] no background event handler has been set. Set a handler via the "onBackgroundEvent" method.', 'SerializableStateInvariantMiddleware took'])
if (Config.UI_MODE) {
	Platform.constants.uiMode = Config.UI_MODE
}

BackgroundFetch.registerHeadlessTask(async ({ taskId }) => backgroundTask(taskId))
AppRegistry.registerComponent(appName, () => App)
