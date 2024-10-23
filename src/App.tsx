import { Button } from '@components/atoms'
import { NetInfo } from '@components/molecules'
import { BackgroundRestrictionModal, UpdateApkModal } from '@components/organisms'
import { useActions, useBackgroundFetch, useTypedSelector } from '@hooks'
import { navigationRef } from '@navigation'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { NavigationContainer } from '@react-navigation/native'
import { Unsubscribe } from '@reduxjs/toolkit'
import { startAppListening, store } from '@store'
import { setupNoticesListeners } from '@store/notices'
import { setupSettingsListeners } from '@store/settings'
import { setupUpdateListeners } from '@store/update'
import { FC, ReactNode, useEffect } from 'react'
import { Text, View } from 'react-native'
import BootSplash from 'react-native-bootsplash'
import ErrorBoundary from 'react-native-error-boundary'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ReduxNetworkProvider } from 'react-native-offline'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useStyles } from 'react-native-unistyles'
import { Provider } from 'react-redux'
import { StackNavigator } from './navigation/StackNavigator'
import './theme/unistyles'

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
	const { theme } = useStyles()

	if (isLoaded) {
		return children
	}

	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<View style={{ backgroundColor: theme.colors.bg100, borderRadius: 50, paddingHorizontal: 5 }}>
				<Text style={{ color: theme.colors.text100, textAlign: 'center' }}>Loading...</Text>
			</View>
		</View>
	)
}

const AppContent: FC = () => {
	const { theme } = useStyles()
	const { getCurrentGoogleUser, getApkVersion, getNotices } = useActions()

	useEffect(() => {
		getCurrentGoogleUser()
		getApkVersion()
		getNotices()
	}, [])

	useBackgroundFetch()

	return (
		<GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.bg100 }}>
			<LoadingAppSettings>
				<View style={{ flex: 1 }}>
					{/* <View style={{ flex: 1, padding: 16 }}>
						<LoaderSettings />
						<User />
						<Temp />
						<UpdateApk />
						<Settings />
					</View> */}

					<NavigationContainer ref={navigationRef} onReady={async () => BootSplash.hide({ fade: true })} theme={{ dark: theme.colors.colorScheme === 'dark', colors: { primary: theme.colors.text100, background: theme.colors.bg100, card: theme.colors.bg100, text: theme.colors.text200, border: theme.colors.bg300, notification: theme.colors.warning } }}>
						<StackNavigator colors={theme.colors} />
					</NavigationContainer>
					<NetInfo />
				</View>
				<View>
					<UpdateApkModal />
					<BackgroundRestrictionModal />
				</View>
			</LoadingAppSettings>
		</GestureHandlerRootView>
	)
}

const ErrorFallback = (props: { error: Error; resetError: () => void }) => {
	const insets = useSafeAreaInsets()
	const { theme } = useStyles()

	return (
		<View style={{ backgroundColor: theme.colors.bg100, flex: 1, justifyContent: 'center' }}>
			<View style={{ marginHorizontal: 16, paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>
				<Text style={{ fontSize: 48, fontWeight: '300', paddingBottom: 16, color: theme.colors.text100 }}>Упс!</Text>
				<Text style={{ fontSize: 32, fontWeight: '800', color: theme.colors.text100 }}>Произошла ошибка</Text>
				<Text style={{ paddingVertical: 16, color: theme.colors.text200 }}>{props.error.toString()}</Text>
				<Button onPress={props.resetError} alignItems='center' padding={16} buttonColor={theme.colors.primary100} pressedButtonColor={theme.colors.primary200} textColor={theme.colors.primary300} text='Повторите попытку' hasTVPreferredFocus />
			</View>
		</View>
	)
}

const App: FC = () => {
	useEffect(() => {
		const subscriptions: Unsubscribe[] = [setupSettingsListeners(startAppListening), setupUpdateListeners(startAppListening), setupNoticesListeners(startAppListening)]

		return () => subscriptions.forEach(unsubscribe => unsubscribe())
	}, [])

	return (
		<SafeAreaProvider>
			<Provider store={store}>
				<ReduxNetworkProvider pingTimeout={10000} pingServerUrl='https://www.google.com/' shouldPing={true} pingInterval={30000} pingOnlyIfOffline={false} pingInBackground={false} httpMethod={'HEAD'}>
					<ErrorBoundary FallbackComponent={ErrorFallback}>
						<AppContent />
					</ErrorBoundary>
				</ReduxNetworkProvider>
			</Provider>
		</SafeAreaProvider>
	)
}

export default App

// utils

declare global {
	interface String {
		Capitalize(): string
	}
}

String.prototype.Capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1)
}

// TODO can help
// movie-view https://github.com/bamlab/react-native-image-header-scroll-view/tree/master
// image-view https://github.com/zachgibson/react-native-parallax-swiper/tree/master | https://github.com/merryjs/photo-viewer | https://github.com/leecade/react-native-swiper
// network-logger https://github.com/alexbrazier/react-native-network-logger
// console.time https://github.com/MaxGraey/react-native-console-time-polyfill

// https://reactnavigation.org/docs/deep-linking
