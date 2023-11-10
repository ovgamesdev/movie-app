import { Button } from '@components/atoms'
import { NetInfo } from '@components/molecules'
import { UpdateApkModal } from '@components/organisms'
import { useActions, useTheme, useTypedSelector } from '@hooks'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { NavigationContainer } from '@react-navigation/native'
import { Unsubscribe } from '@reduxjs/toolkit'
import { FC, ReactNode, useEffect } from 'react'
import { Text, View } from 'react-native'
import { ReduxNetworkProvider } from 'react-native-offline'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { StackNavigator } from './navigation/StackNavigator'
import { startAppListening } from './store/listenerMiddleware'
import { setupSettingsListeners } from './store/settings/settings.slice'
import { store } from './store/store'
import { setupUpdateListeners } from './store/update/update.slice'

GoogleSignin.configure({
	scopes: ['https://www.googleapis.com/auth/drive.appdata']
})

const Temp: FC = () => {
	const { getSettings, saveSettings, removeItem, setItem } = useActions()

	const setTestItem = () => {
		setItem({ 'test:123:qwerty': { id: 123, name: '123' } })
	}

	const removeTestItem = () => {
		removeItem({ key: 'test:123:qwerty' })
	}

	return (
		<>
			<View style={{ flexDirection: 'row', marginTop: 10 }}>
				<Button text='getSettings' onPress={getSettings} flex={1} justifyContent='center' style={{ marginRight: 2 }} />
				<Button text='saveSettings' onPress={saveSettings} flex={1} justifyContent='center' style={{ marginLeft: 2 }} />
			</View>

			<View style={{ flexDirection: 'row', marginTop: 10 }}>
				<Button text='setItem' onPress={setTestItem} flex={1} justifyContent='center' style={{ marginRight: 2 }} />
				<Button text='removeItem' onPress={removeTestItem} flex={1} justifyContent='center' style={{ marginLeft: 2 }} />
			</View>
		</>
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

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg100 }}>
			<LoadingAppSettings>
				<SafeAreaProvider>
					{/* <View style={{ flex: 1, padding: 16 }}>
						<LoaderSettings />
						<User />
						<Temp />
						<UpdateApk />
						<Settings />
					</View> */}

					<NavigationContainer theme={{ dark: colors.colorScheme === 'dark', colors: { primary: colors.text100, background: colors.bg100, card: colors.bg100, text: colors.text200, border: colors.bg300, notification: colors.primary100 } }}>
						<StackNavigator />
					</NavigationContainer>
					<NetInfo />
				</SafeAreaProvider>
				<View>
					<UpdateApkModal />
				</View>
			</LoadingAppSettings>
		</View>
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
