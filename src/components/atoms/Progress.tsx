import { FC } from 'react'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface Props {
	duration: number
	lastTime: number
}

export const Progress: FC<Props> = ({ duration, lastTime }) => {
	const position = Math.max(2, (lastTime / duration) * 100)
	const { styles } = useStyles(stylesheet)

	return (
		<View style={styles.container}>
			<View style={{ ...styles.progress, width: `${position}%` }} />
		</View>
	)
}

const stylesheet = createStyleSheet(theme => ({
	container: {
		backgroundColor: theme.colors.bg300,
		height: 4,
		borderRadius: 8
	},
	progress: {
		backgroundColor: theme.colors.primary100,
		height: 4,
		borderRadius: 4
	}
}))
