import { Input as MyInput } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { InputSettingsKey } from '@store/settings'
import type { FC } from 'react'
import { TVFocusGuideView, Text, TextInputProps, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface Props extends TextInputProps {
	item: InputSettingsKey
}

export const Input: FC<Props> = ({ item, ...props }) => {
	const { setItem } = useActions()
	const value = useTypedSelector(state => state.settings.settings[item])
	const { styles } = useStyles(stylesheet)

	return (
		<>
			<TVFocusGuideView style={styles.container} autoFocus trapFocusLeft trapFocusRight>
				<Text style={styles.title}>{item}</Text>
				<MyInput onChange={e => setItem({ [item]: e.nativeEvent.text })} value={value} placeholder='Settings value' flex={1} {...props} />
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
		alignItems: 'center'
	},
	title: {
		color: theme.colors.text100,
		fontSize: 14,
		flex: 1
	},
	line: {
		borderBlockColor: theme.colors.bg300,
		borderBottomWidth: 1
	}
}))
