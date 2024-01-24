import AsyncStorage from '@react-native-async-storage/async-storage'
import Reactotron, { networking } from 'reactotron-react-native'
import { reactotronRedux } from 'reactotron-redux'

const reactotron = Reactotron.setAsyncStorageHandler(AsyncStorage)
	.configure({
		name: 'Movie App'
	}) // controls connection & communication settings
	.useReactNative() // add all built-in react native plugins
	.use(
		networking({
			ignoreUrls: /(www.google.com)|\/(logs|symbolicate)$/
		}) as any
	)
	.use(reactotronRedux() as any)
	.connect() as any // let's connect!

export default reactotron
