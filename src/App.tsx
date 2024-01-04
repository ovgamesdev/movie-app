import { Button } from '@components/atoms'
import { NetInfo } from '@components/molecules'
import { UpdateApkModal } from '@components/organisms'
import { useActions, useBackgroundFetch, useTheme, useTypedSelector } from '@hooks'
import { navigationRef } from '@navigation'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { NavigationContainer } from '@react-navigation/native'
import { Unsubscribe } from '@reduxjs/toolkit'
import { startAppListening, store } from '@store'
import { setupSettingsListeners } from '@store/settings'
import { setupUpdateListeners } from '@store/update'
import { FC, ReactNode, useEffect } from 'react'
import { Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ReduxNetworkProvider } from 'react-native-offline'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { StackNavigator } from './navigation/StackNavigator'

GoogleSignin.configure({
	scopes: ['https://www.googleapis.com/auth/drive.appdata']
})

const Temp: FC = () => {
	const insets = useSafeAreaInsets()
	const { getSettings, saveSettings, removeItem, setItem, mergeItem } = useActions()

	function generateRandomString(length: number): string {
		const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
		let result = ''

		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length)
			result += characters.charAt(randomIndex)
		}

		return result
	}

	const setTestItem = () => {
		setItem({ 'test:123:qwerty': { id: 123, name: '123' } })
	}

	const removeTestItem = () => {
		removeItem({ key: 'test:123:qwerty' })
	}

	const setTestMergeItem = () => {
		const randomNumber = Math.floor(Math.random() * 5) + 1

		console.log('add value', randomNumber)
		mergeItem({ 'test:123:qwerty': { value: randomNumber } })
	}

	const setTestMergeArray = () => {
		const randomNumber = Math.floor(Math.random() * 5) + 1
		const randomString = generateRandomString(5)

		console.log('add testArray', randomNumber, randomString)
		mergeItem({ 'test:123:qwerty': { testArray: [{ id: randomNumber }], name: randomString } })
	}

	return (
		<View style={{ marginTop: insets.top, marginHorizontal: 10 }}>
			<View style={{ flexDirection: 'row', marginTop: 10 }}>
				<Button text='getSettings' onPress={getSettings} flex={1} justifyContent='center' style={{ marginRight: 2 }} />
				<Button text='saveSettings' onPress={saveSettings} flex={1} justifyContent='center' style={{ marginLeft: 2 }} />
			</View>

			<View style={{ flexDirection: 'row', marginTop: 10 }}>
				<Button text='setItem' onPress={setTestItem} flex={1} justifyContent='center' style={{ marginRight: 2 }} />
				<Button text='removeItem' onPress={removeTestItem} flex={1} justifyContent='center' style={{ marginLeft: 2 }} />
			</View>

			<View style={{ flexDirection: 'row', marginTop: 10 }}>
				<Button text='mergeItem' onPress={setTestMergeItem} flex={1} justifyContent='center' style={{ marginRight: 2 }} />
				<Button text='mergeItem array' onPress={setTestMergeArray} flex={1} justifyContent='center' style={{ marginLeft: 2 }} />
			</View>
		</View>
	)
}

interface LoadingAppSettingsProps {
	children: ReactNode
}
const LoadingAppSettings: FC<LoadingAppSettingsProps> = ({ children }) => {
	const isLoaded = useTypedSelector(state => state.settings.isLoaded)
	const { colors } = useTheme()

	if (isLoaded) {
		return children
	}

	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<View style={{ backgroundColor: colors.bg200, borderRadius: 50, paddingHorizontal: 5 }}>
				<Text style={{ color: colors.text100, textAlign: 'center' }}>Loading...</Text>
			</View>
		</View>
	)
}

const AppContent: FC = () => {
	const { colors } = useTheme()
	const { getCurrentGoogleUser, getApkVersion } = useActions()

	useEffect(() => {
		getCurrentGoogleUser()
		getApkVersion()
	}, [])

	useBackgroundFetch()

	return (
		<GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg100 }}>
			<LoadingAppSettings>
				<SafeAreaProvider>
					{/* <View style={{ flex: 1, padding: 16 }}>
						<LoaderSettings />
						<User />
						<Temp />
						<UpdateApk />
						<Settings />
					</View> */}

					<NavigationContainer ref={navigationRef} theme={{ dark: colors.colorScheme === 'dark', colors: { primary: colors.text100, background: colors.bg100, card: colors.bg100, text: colors.text200, border: colors.bg300, notification: colors.primary100 } }}>
						<StackNavigator colors={colors} />
					</NavigationContainer>
					<NetInfo />
				</SafeAreaProvider>
				<View>
					<UpdateApkModal />
				</View>
			</LoadingAppSettings>
		</GestureHandlerRootView>
	)
}

const App: FC = () => {
	useEffect(() => {
		const subscriptions: Unsubscribe[] = [setupSettingsListeners(startAppListening), setupUpdateListeners(startAppListening)]

		return () => subscriptions.forEach(unsubscribe => unsubscribe())
	}, [])

	return (
		<Provider store={store}>
			<ReduxNetworkProvider pingTimeout={10000} pingServerUrl='https://www.google.com/' shouldPing={true} pingInterval={30000} pingOnlyIfOffline={false} pingInBackground={false} httpMethod={'HEAD'}>
				<AppContent />
			</ReduxNetworkProvider>
		</Provider>
	)
}

export default App

// TODO can help
// movie-view https://github.com/bamlab/react-native-image-header-scroll-view/tree/master
// image-view https://github.com/zachgibson/react-native-parallax-swiper/tree/master | https://github.com/merryjs/photo-viewer | https://github.com/leecade/react-native-swiper
// network-logger https://github.com/alexbrazier/react-native-network-logger
// console.time https://github.com/MaxGraey/react-native-console-time-polyfill
// splash-screens https://blog.logrocket.com/building-splash-screens-react-native/

// https://reactnavigation.org/docs/deep-linking
