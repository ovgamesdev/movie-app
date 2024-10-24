/* eslint-disable no-undef */
if (__DEV__) {
	import('./ReactotronConfig').then(() => console.log('Reactotron Configured'))
}

import { backgroundTask } from '@hooks'
import { AppRegistry, FlatList, LogBox, Platform, ScrollView, SectionList } from 'react-native'
import BackgroundFetch from 'react-native-background-fetch'
import Config from 'react-native-config'
import 'react-native-gesture-handler'
import { name as appName } from './app.json'
import './loggerConfig'
import App from './src/App'

// temp fix https://github.com/software-mansion/react-native-screens/issues/2341
FlatList.defaultProps = FlatList.defaultProps || {}
FlatList.defaultProps.removeClippedSubviews = false
ScrollView.defaultProps = ScrollView.defaultProps || {}
ScrollView.defaultProps.removeClippedSubviews = false
SectionList.defaultProps = SectionList.defaultProps || {}
SectionList.defaultProps.removeClippedSubviews = false

LogBox.ignoreLogs(['new NativeEventEmitter', '[notifee] no background event handler has been set. Set a handler via the "onBackgroundEvent" method.', 'SerializableStateInvariantMiddleware took'])
if (Config.UI_MODE) {
	Platform.constants.uiMode = Config.UI_MODE
}

BackgroundFetch.registerHeadlessTask(async ({ taskId }) => backgroundTask(taskId))
AppRegistry.registerComponent(appName, () => App)
