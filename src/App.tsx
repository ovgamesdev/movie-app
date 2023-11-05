import { GoogleSignin } from '@react-native-google-signin/google-signin'
import React from 'react'
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native'
import { Provider } from 'react-redux'
import { User } from './components/User'
import { useActions } from './hooks/useActions'
import { useTypedSelector } from './hooks/useTypedSelector'
import { ISettings } from './store/settings/settings.slice'
import { store } from './store/store'

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

const Temp: React.FC = () => {
	const { getSettings, saveSettings } = useActions()

	return (
		<>
			<Pressable onPress={getSettings} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, marginTop: 10 }}>
				<Text style={{ color: '#fff' }}>getSettings</Text>
			</Pressable>

			<Pressable onPress={saveSettings} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, marginTop: 10 }}>
				<Text style={{ color: '#fff' }}>saveSettings</Text>
			</Pressable>
		</>
	)
}

const MyInput: React.FC<{ item: keyof ISettings }> = ({ item }) => {
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

const MySwitch: React.FC<{ item: keyof ISettings }> = ({ item }) => {
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

const Settings: React.FC = () => {
	return (
		<View style={{ flex: 1 }}>
			<ScrollView>
				<MyInput item='testValue' />
				<MySwitch item='showDevOptions' />
			</ScrollView>
		</View>
	)
}

const LoadingSettings: React.FC = () => {
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

const App: React.FC = () => {
	return (
		<Provider store={store}>
			<View style={{ flex: 1, backgroundColor: '#333', padding: 16 }}>
				<LoadingSettings />
				<User />
				<Temp />
				<Settings />
			</View>
		</Provider>
	)
}

export default App
