import { SettingsInput, SettingsSelect, SettingsSwitch, User } from '@components/molecules'
import { useTheme, useTypedSelector } from '@hooks'
import { FC } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
