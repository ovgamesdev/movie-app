import { useActions, useTheme, useTypedSelector } from '@hooks'
import { FC } from 'react'
import { Switch as RNSwitch, Text, View } from 'react-native'
import { ISettings } from 'src/store/settings/settings.slice'

export const Switch: FC<{ item: keyof ISettings }> = ({ item }) => {
	const { setItem } = useActions()
	const value = useTypedSelector(state => state.settings.settings[item]) as boolean
	const { colors } = useTheme()

	return (
		<>
			<View style={{ marginVertical: 5, height: 40, paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<Text style={{ color: colors.text100 }}>{item}</Text>
				<RNSwitch
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
