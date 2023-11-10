import { useActions, useTheme, useTypedSelector } from '@hooks'
import { FC } from 'react'
import { Text, TextInput, View } from 'react-native'
import { ISettings } from 'src/store/settings/settings.slice'

export const Input: FC<{ item: keyof ISettings }> = ({ item }) => {
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
					style={{ paddingLeft: 10, height: 40, backgroundColor: colors.bg200, color: colors.text100, width: '50%', borderRadius: 6, borderBottomWidth: 1, borderBottomColor: colors.bg300 }}
					placeholderTextColor={colors.text200}
				/>
			</View>
			<View style={{ borderBlockColor: colors.bg300, borderBottomWidth: 1 }} />
		</>
	)
}
