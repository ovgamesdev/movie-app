import { useTheme } from '@hooks'
import { View } from 'react-native'

export const Progress = ({ duration, lastTime }: { duration: number; lastTime: number }) => {
	const position = Math.max(2, (lastTime / duration) * 100)
	const { colors } = useTheme()

	return (
		<View style={{ backgroundColor: colors.bg300, height: 4, borderRadius: 8 }}>
			<View style={{ backgroundColor: colors.primary100, height: 4, borderRadius: 4, width: `${position}%` }} />
		</View>
	)
}
