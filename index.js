/* eslint-disable no-undef */
if (__DEV__) {
	import('./ReactotronConfig').then(() => console.log('Reactotron Configured'))
}

import { backgroundTask } from '@hooks'
import { AppRegistry, Platform } from 'react-native'
import BackgroundFetch from 'react-native-background-fetch'
import Config from 'react-native-config'
import 'react-native-gesture-handler'
import { name as appName } from './app.json'
import './loggerConfig'
import App from './src/App'

// LogBox.ignoreLogs(['new NativeEventEmitter', 'SerializableStateInvariantMiddleware took'])
if (Config.UI_MODE) {
	Platform.constants.uiMode = Config.UI_MODE
}

AppRegistry.registerComponent(appName, () => App)
BackgroundFetch.registerHeadlessTask(backgroundTask)
