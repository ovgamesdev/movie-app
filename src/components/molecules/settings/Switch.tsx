import { useActions, useTheme, useTypedSelector } from '@hooks'
import { FC } from 'react'
import { Switch as RNSwitch, TVFocusGuideView, Text, View } from 'react-native'
import { SwitchSettingsKey } from 'src/store/settings/types'

export const Switch: FC<{ item: SwitchSettingsKey }> = ({ item }) => {
	const { setItem } = useActions()
	const value = useTypedSelector(state => state.settings.settings[item])
	const { colors } = useTheme()

	return (
		<>
			<TVFocusGuideView style={{ marginVertical: 5, height: 40, paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} trapFocusLeft trapFocusRight>
				<Text style={{ color: colors.text100 }}>{item}</Text>
				<RNSwitch
					onValueChange={e => {
						setItem({ [item]: e })
					}}
					value={value}
					thumbColor={value ? colors.accent100 : colors.text200}
					trackColor={{ false: colors.bg200, true: colors.bg300 }}
				/>
			</TVFocusGuideView>
			<View style={{ borderBlockColor: colors.bg300, borderBottomWidth: 1 }} />
		</>
	)
}
