import { Switch as CustomSwitch } from '@components/atoms'
import { useActions, useTheme, useTypedSelector } from '@hooks'
import { FC } from 'react'
import { TVFocusGuideView, Text, View } from 'react-native'
import { SwitchSettingsKey } from 'src/store/settings/settings.types'

export const Switch: FC<{ item: SwitchSettingsKey }> = ({ item }) => {
	const { setItem } = useActions()
	const value = useTypedSelector(state => state.settings.settings[item])
	const { colors } = useTheme()

	return (
		<>
			<TVFocusGuideView style={{ marginVertical: 5, height: 40, paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} autoFocus trapFocusLeft trapFocusRight>
				<Text style={{ color: colors.text100 }}>{item}</Text>
				<CustomSwitch onValueChange={e => setItem({ [item]: e })} value={value} />
			</TVFocusGuideView>
			<View style={{ borderBlockColor: colors.bg300, borderBottomWidth: 1 }} />
		</>
	)
}
