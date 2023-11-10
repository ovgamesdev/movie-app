import { useActions, useTheme, useTypedSelector } from '@hooks'
import { FC } from 'react'
import { Text, TextInput, View } from 'react-native'
import { InputSettingsKey } from 'src/store/settings/types'

export const Input: FC<{ item: InputSettingsKey }> = ({ item }) => {
	const { setItem } = useActions()
	const value = useTypedSelector(state => state.settings.settings[item])
	const { colors } = useTheme()

	return (
		<>
			<View style={{ marginVertical: 5, height: 40, paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<Text style={{ color: colors.text100 }}>{item}</Text>
				<TextInput
					onChange={e => {
						setItem({ [item]: e.nativeEvent.text })
					}}
					value={value}
					placeholder='Settings value'
					style={{ paddingLeft: 10, height: 40, backgroundColor: colors.bg200, color: colors.text100, width: '50%', borderRadius: 6, borderBottomWidth: 1, borderBottomColor: colors.bg300 }}
					placeholderTextColor={colors.text200}
				/>
			</View>
			<View style={{ borderBlockColor: colors.bg300, borderBottomWidth: 1 }} />
		</>
	)
}
