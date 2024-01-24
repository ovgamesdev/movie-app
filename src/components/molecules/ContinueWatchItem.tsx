import { Button, ImageBackground, Progress } from '@components/atoms'
import { WatchHistory } from '@store/settings'
import { normalizeUrlWithNull } from '@utils'
import { FC } from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = {
	data: WatchHistory
	index: number
	hasTVPreferredFocus: boolean
	onFocus: ({ index }: { index: number }) => void
	onBlur: ({ index }: { index: number }) => void
	onPress: (value: WatchHistory) => void
}

export const ContinueWatchItem: FC<Props> = ({ data, index, hasTVPreferredFocus, onFocus, onBlur, onPress }) => {
	const poster = normalizeUrlWithNull(data.poster, { isNull: 'https://via.placeholder.com', append: '/300x450' })
	const { styles } = useStyles(stylesheet)

	return (
		<Button onFocus={() => onFocus({ index })} onBlur={() => onBlur({ index })} onPress={() => onPress(data)} hasTVPreferredFocus={hasTVPreferredFocus} animation='scale' flex={0} padding={5} transparent style={styles.container}>
			<ImageBackground source={{ uri: poster }} style={styles.image} borderRadius={6}>
				{data.duration && data.lastTime && (
					<View style={styles.progressContainer}>
						<Progress duration={data.status === 'end' ? data.lastTime : data.duration} lastTime={data.lastTime} />
					</View>
				)}
			</ImageBackground>

			<View style={styles.detail}>
				<Text style={styles.detailTitle} numberOfLines={2}>
					{data.title}
				</Text>
				<Text style={styles.detailDescription} numberOfLines={1}>
					{data.year}
				</Text>
			</View>
		</Button>
	)
}

const stylesheet = createStyleSheet(theme => ({
	container: {
		width: 110,
		height: 215.5
	},
	image: {
		height: 140,
		// width: 93.5
		aspectRatio: 667 / 1000
	},
	detail: {
		paddingTop: 5
	},
	detailTitle: {
		color: theme.colors.text100,
		fontSize: 14
	},
	detailDescription: {
		color: theme.colors.text200,
		fontSize: 14
	},
	progressContainer: {
		position: 'absolute',
		bottom: 2.5,
		left: 2.5,
		right: 2.5,
		borderRadius: 8
	},
	progressGradient: {
		// TODO
		// height: 25,
	}
}))
