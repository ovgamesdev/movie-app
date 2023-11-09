import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { Unsubscribe } from '@reduxjs/toolkit'
import React, { FC, ReactNode, useEffect } from 'react'
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native'
import { ReduxNetworkProvider } from 'react-native-offline'
import { Provider } from 'react-redux'
import { NetInfo } from './components/NetInfo'
import UpdateApkModal from './components/UpdateApkModal'
import { UpdateApkProgress } from './components/UpdateApkProgress'
import { User } from './components/User'
import { useActions } from './hooks/useActions'
import { useTypedSelector } from './hooks/useTypedSelector'
import { startAppListening } from './store/listenerMiddleware'
import { ISettings, setupSettingsListeners } from './store/settings/settings.slice'
import { store } from './store/store'
import { setupUpdateListeners } from './store/update/update.slice'

GoogleSignin.configure({
	scopes: ['https://www.googleapis.com/auth/drive.appdata']
})

// export const defaultSettings = [
// 	{
// 		key: 'showDevSettings',
// 		label: 'Показать опции разработчика',
// 		type: 'Switch',
// 		defaultValue: false
// 	},
// 	{
// 		key: 'kinopoiskToken',
// 		label: 'Токен https://t.me/kinopoiskdev_bot',
// 		type: 'PasswordInput',
// 		defaultValue: ''
// 	},
// 	{
// 		key: 'theme',
// 		label: 'Тема приложения',
// 		type: 'Selector',
// 		defaultValue: null,
// 		options: [
// 			{ title: 'Светлая', value: 'light' },
// 			{ title: 'Темная', value: 'dark' },
// 			{ title: 'Системная тема', value: null }
// 		]
// 	},
// 	{
// 		key: 'tvUiMode',
// 		label: 'ТВ режим интерфейса для элементов управления плеера',
// 		type: 'Switch',
// 		defaultValue: false
// 	},
// 	{
// 		key: 'doubleTapRewindEnabled',
// 		label: 'Двойной тап, перемотка',
// 		type: 'Switch',
// 		defaultValue: true
// 	},
// 	{
// 		key: 'doubleTapRewind',
// 		label: 'Перемотка двойным нажатием',
// 		type: 'Selector',
// 		defaultValue: '10',
// 		options: [
// 			{ title: '3 секунды', value: '3' },
// 			{ title: '5 секунд', value: '5' },
// 			{ title: '10 секунд', value: '10' },
// 			{ title: '20 секунд', value: '20' },
// 			{ title: '30 секунд', value: '30' },
// 			{ title: '60 секунд', value: '60' }
// 		]
// 	},
// 	{
// 		key: 'doubleTapPauseEnabled',
// 		label: 'Двойной тап по центру, плей/пауза',
// 		type: 'Switch',
// 		defaultValue: true
// 	},
// 	{
// 		key: 'pitchToZoomEnabled',
// 		label: 'Масштабирование жестом (pitch to zoom)',
// 		type: 'Switch',
// 		defaultValue: true
// 	},
// 	{
// 		key: 'termsOfUseAccepted',
// 		label: null,
// 		type: 'Switch',
// 		defaultValue: false
// 	}
// ]

const Temp: FC = () => {
	const { getSettings, saveSettings, removeItem, setItem } = useActions()

	const setTestItem = () => {
		setItem({ key: 'test:123:qwerty', value: { id: 123, title: '123' } })
	}

	const removeTestItem = () => {
		removeItem({ key: 'test:123:qwerty' })
	}

	return (
		<>
			<View style={{ flexDirection: 'row', marginTop: 10 }}>
				<Pressable onPress={getSettings} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, marginRight: 2, flex: 1 }}>
					<Text style={{ color: '#fff' }}>getSettings</Text>
				</Pressable>

				<Pressable onPress={saveSettings} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, marginLeft: 2, flex: 1 }}>
					<Text style={{ color: '#fff' }}>saveSettings</Text>
				</Pressable>
			</View>

			<View style={{ flexDirection: 'row', marginTop: 10 }}>
				<Pressable onPress={setTestItem} style={{ backgroundColor: 'rgba(255,255,0,0.2)', padding: 10, marginRight: 2, flex: 1 }}>
					<Text style={{ color: '#fff' }}>setItem</Text>
				</Pressable>

				<Pressable onPress={removeTestItem} style={{ backgroundColor: 'rgba(255,255,0,0.2)', padding: 10, marginLeft: 2, flex: 1 }}>
					<Text style={{ color: '#fff' }}>removeItem</Text>
				</Pressable>
			</View>
		</>
	)
}

const MyInput: FC<{ item: keyof ISettings }> = ({ item }) => {
	const { setItem } = useActions()
	const value = useTypedSelector(state => state.settings.settings[item]) as string

	return (
		<View style={{ marginVertical: 5, marginTop: 10, backgroundColor: 'rgba(22,64,14,0.5)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
			<Text style={{ color: '#fff' }}>{item}</Text>
			<TextInput
				onChange={e => {
					setItem({ key: item, value: e.nativeEvent.text })
				}}
				value={value}
				placeholder='Settings value'
				style={{ padding: 5, backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', width: '50%' }}
				placeholderTextColor={'#999'}
			/>
		</View>
	)
}

const MySwitch: FC<{ item: keyof ISettings }> = ({ item }) => {
	const { setItem } = useActions()
	const value = useTypedSelector(state => state.settings.settings[item]) as boolean

	return (
		<View style={{ marginVertical: 5, marginTop: 10, backgroundColor: 'rgba(22,64,14,0.5)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
			<Text style={{ color: '#fff' }}>{item}</Text>
			<Switch
				onValueChange={e => {
					setItem({ key: item, value: e })
				}}
				value={value}
				thumbColor={value ? 'white' : '#666'}
			/>
		</View>
	)
}

const Settings: FC = () => {
	return (
		<View style={{ flex: 1 }}>
			<ScrollView>
				<MyInput item='testValue' />
				<MySwitch item='showDevOptions' />
			</ScrollView>
		</View>
	)
}

const LoaderSettings: FC = () => {
	const isLoading = useTypedSelector(state => state.settings.isLoading)

	if (!isLoading) {
		return null
	}

	return (
		<View style={{ position: 'absolute', top: 10, left: 0, right: 0, zIndex: 10, alignItems: 'center' }}>
			<View style={{ backgroundColor: '#999', borderRadius: 50, paddingHorizontal: 5 }}>
				<Text style={{ color: '#fff', textAlign: 'center' }}>Loading...</Text>
			</View>
		</View>
	)
}

interface LoadingAppSettingsProps {
	children: ReactNode
}
const LoadingAppSettings: FC<LoadingAppSettingsProps> = ({ children }) => {
	const isLoaded = useTypedSelector(state => state.settings.isLoaded)

	if (isLoaded) {
		return children
	}

	return (
		<View style={{ flex: 1, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' }}>
			<View style={{ backgroundColor: '#999', borderRadius: 50, paddingHorizontal: 5 }}>
				<Text style={{ color: '#fff', textAlign: 'center' }}>Loading...</Text>
			</View>
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
				<LoadingAppSettings>
					<View style={{ flex: 1, backgroundColor: '#333' }}>
						<View style={{ flex: 1, padding: 16 }}>
							<LoaderSettings />
							<User />
							<Temp />
							<UpdateApkProgress />
							<Settings />
						</View>
						<NetInfo />
					</View>
					<View>
						<UpdateApkModal />
					</View>
				</LoadingAppSettings>
			</ReduxNetworkProvider>
		</Provider>
	)
}

export default App

// tsrnfs

// TODO can help
// movie-view https://github.com/bamlab/react-native-image-header-scroll-view/tree/master
// image-view https://github.com/zachgibson/react-native-parallax-swiper/tree/master | https://github.com/merryjs/photo-viewer | https://github.com/leecade/react-native-swiper
// network-logger https://github.com/alexbrazier/react-native-network-logger
// console.time https://github.com/MaxGraey/react-native-console-time-polyfill
// splash-screens https://blog.logrocket.com/building-splash-screens-react-native/

// https://reactnavigation.org/docs/deep-linking
