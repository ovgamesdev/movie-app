import { Button } from '@components/atoms'
import { NetInfo, UpdateApk, User } from '@components/molecules'
import { UpdateApkModal } from '@components/organisms'
import { useActions, useTheme, useTypedSelector } from '@hooks'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { Unsubscribe } from '@reduxjs/toolkit'
import React, { FC, ReactNode, useEffect } from 'react'
import { ScrollView, Switch, Text, TextInput, View } from 'react-native'
import { ReduxNetworkProvider } from 'react-native-offline'
import { Provider } from 'react-redux'
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

const MyInput: FC<{ item: keyof ISettings }> = ({ item }) => {
	const { setItem } = useActions()
	const value = useTypedSelector(state => state.settings.settings[item]) as string
	const { colors } = useTheme()

	return (
		<>
			<View style={{ marginVertical: 5, height: 40, paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<Text style={{ color: colors.text100 }}>{item}</Text>
				<TextInput
					onChange={e => {
						setItem({ key: item, value: e.nativeEvent.text })
					}}
					value={value}
					placeholder='Settings value'
					style={{ padding: 5, paddingLeft: 10, backgroundColor: colors.bg200, color: colors.text100, width: '50%', borderRadius: 6 }}
					placeholderTextColor={colors.text200}
				/>
			</View>
			<View style={{ borderBlockColor: colors.bg300, borderBottomWidth: 1 }} />
		</>
	)
}

const MySwitch: FC<{ item: keyof ISettings }> = ({ item }) => {
	const { setItem } = useActions()
	const value = useTypedSelector(state => state.settings.settings[item]) as boolean
	const { colors } = useTheme()

	return (
		<>
			<View style={{ marginVertical: 5, height: 40, paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<Text style={{ color: colors.text100 }}>{item}</Text>
				<Switch
					onValueChange={e => {
						setItem({ key: item, value: e })
					}}
					value={value}
					thumbColor={value ? colors.accent100 : colors.text200}
					trackColor={{ false: colors.bg200, true: colors.bg300 }}
				/>
			</View>
			<View style={{ borderBlockColor: colors.bg300, borderBottomWidth: 1 }} />
		</>
	)
}

const MySelect: FC<{ item: keyof ISettings; options: { value: unknown; title: string }[] }> = ({ item, options }) => {
	const { setItem } = useActions()
	const value = useTypedSelector(state => state.settings.settings[item]) as any
	const { colors } = useTheme()

	return (
		<>
			<View style={{ marginVertical: 5, height: 40, paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<Text style={{ color: colors.text100 }}>theme: {value}</Text>
				<View style={{ flexDirection: 'row', borderRadius: 6 }}>
					{options.map((option, i) => {
						const isEnd = options.length - 1 === i
						const isStart = 0 === i
						const isActive = value === option.value

						return (
							<Button
								key={i}
								text={option.title}
								onPress={() => setItem({ key: item, value: option.value })}
								justifyContent='center'
								padding={0}
								paddingHorizontal={10}
								isActive={isActive}
								textColor={colors.text100}
								activeTextColor={colors.primary300}
								buttonColor={colors.bg200}
								activeButtonColor={colors.primary100}
								pressedButtonColor={colors.bg300}
								activePressedButtonColor={colors.primary200}
								borderStyle={{
									borderTopLeftRadius: isStart ? 10 : 0,
									borderBottomLeftRadius: isStart ? 10 : 0,
									borderTopRightRadius: isEnd ? 10 : 0,
									borderBottomRightRadius: isEnd ? 10 : 0,
									borderTopColor: isActive ? colors.primary200 : colors.bg300,
									borderBottomColor: isActive ? colors.primary200 : colors.bg300,
									borderRightColor: isActive && isEnd ? colors.primary200 : colors.bg300,
									borderLeftColor: isActive && isStart ? colors.primary200 : colors.bg300,
									borderTopWidth: 1,
									borderBottomWidth: 1,
									borderRightWidth: 1,
									borderLeftWidth: isStart ? 1 : 0
								}}
							/>
						)
					})}
				</View>
			</View>
			<View style={{ borderBlockColor: colors.bg300, borderBottomWidth: 1 }} />
		</>
	)
}

const Settings: FC = () => {
	return (
		<View style={{ flex: 1 }}>
			<ScrollView>
				<MySelect
					item='theme'
					options={[
						{ value: 'light', title: 'light' },
						{ value: 'dark', title: 'dark' },
						{ value: null, title: 'default' }
					]}
				/>
				<MyInput item='testValue' />
				<MySwitch item='showDevOptions' />
			</ScrollView>
		</View>
	)
}

const LoaderSettings: FC = () => {
	const isLoading = useTypedSelector(state => state.settings.isLoading)
	const { colors } = useTheme()

	if (!isLoading) {
		return null
	}

	return (
		<View style={{ position: 'absolute', top: 10, left: 0, right: 0, zIndex: 10, alignItems: 'center' }}>
			<View style={{ backgroundColor: colors.bg200, borderRadius: 50, paddingHorizontal: 5 }}>
				<Text style={{ color: colors.text100, textAlign: 'center' }}>Loading...</Text>
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

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg100 }}>
			<LoadingAppSettings>
				<View style={{ flex: 1 }}>
					<View style={{ flex: 1, padding: 16 }}>
						<LoaderSettings />
						<User />
						<Temp />
						<UpdateApk />
						<Settings />
					</View>
					<NetInfo />
				</View>
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

// tsrnfs

// TODO can help
// movie-view https://github.com/bamlab/react-native-image-header-scroll-view/tree/master
// image-view https://github.com/zachgibson/react-native-parallax-swiper/tree/master | https://github.com/merryjs/photo-viewer | https://github.com/leecade/react-native-swiper
// network-logger https://github.com/alexbrazier/react-native-network-logger
// console.time https://github.com/MaxGraey/react-native-console-time-polyfill
// splash-screens https://blog.logrocket.com/building-splash-screens-react-native/

// https://reactnavigation.org/docs/deep-linking
