import { Switch as CustomSwitch } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { SwitchSettingsKey } from '@store/settings'
import type { FC } from 'react'
import { TVFocusGuideView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const Switch: FC<{ item: SwitchSettingsKey }> = ({ item }) => {
	const { setItem } = useActions()
	const value = useTypedSelector(state => state.settings.settings[item])
	const { styles } = useStyles(stylesheet)

	return (
		<>
			<TVFocusGuideView style={styles.container} autoFocus trapFocusLeft trapFocusRight>
				<Text style={styles.title}>{item}</Text>
				<CustomSwitch onValueChange={e => setItem({ [item]: e })} value={value} />
			</TVFocusGuideView>
			<View style={styles.line} />
		</>
	)
}

const stylesheet = createStyleSheet(theme => ({
	container: {
		marginVertical: 5,
		height: 40,
		paddingVertical: 5,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	title: {
		color: theme.colors.text100,
		fontSize: 14
	},
	line: {
		borderBlockColor: theme.colors.bg300,
		borderBottomWidth: 1
	}
}))
