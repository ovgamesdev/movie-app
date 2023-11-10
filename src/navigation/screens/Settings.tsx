import { SettingsInput, SettingsSelect, SettingsSwitch, User } from '@components/molecules'
import { useTheme, useTypedSelector } from '@hooks'
import { FC } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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

const LoaderSettings: FC = () => {
	const isLoading = useTypedSelector(state => state.settings.isLoading)
	const { colors } = useTheme()

	if (!isLoading) {
		return null
	}

	return (
		<View style={{ position: 'absolute', top: 20, left: 0, right: 0, zIndex: 10, alignItems: 'center' }}>
			<View style={{ backgroundColor: colors.bg200, borderRadius: 50, paddingHorizontal: 5 }}>
				<Text style={{ color: colors.text100, textAlign: 'center' }}>Loading...</Text>
			</View>
		</View>
	)
}

export const Settings = () => {
	const insets = useSafeAreaInsets()

	return (
		<View style={{ flex: 1, padding: 10, marginTop: insets.top }}>
			<LoaderSettings />

			<User />

			<SettingsSelect
				item='theme'
				options={[
					{ value: 'light', title: 'light' },
					{ value: 'dark', title: 'dark' },
					{ value: null, title: 'default' }
				]}
			/>
			<SettingsInput item='testValue' />
			<SettingsSwitch item='showDevOptions' />
		</View>
	)
}
