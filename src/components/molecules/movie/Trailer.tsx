import { Button, ImageBackground } from '@components/atoms'
import { PlayIcon } from '@icons'
import { navigation } from '@navigation'
import { IMainTrailer } from '@store/kinopoisk'
import { normalizeUrlWithNull } from '@utils'
import { FC } from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface Props {
	mainTrailer: IMainTrailer
	borderRadius?: number
}

export const Trailer: FC<Props> = ({ mainTrailer, borderRadius }) => {
	const { styles, theme } = useStyles(stylesheet)

	const poster = normalizeUrlWithNull(mainTrailer.preview?.avatarsUrl, { isNull: 'https://dummyimage.com/{width}x{height}/eee/aaa', append: '/600x380' })

	return (
		<Button padding={0} transparent animation='scale' style={styles.container} onPress={() => navigation.push('MovieTrailer', { data: mainTrailer })}>
			<ImageBackground source={{ uri: poster }} style={{ width: '100%', aspectRatio: 302 / 169.708 }} borderRadius={borderRadius}>
				<View style={styles.playContainer}>
					<View style={styles.play}>
						<PlayIcon width={40} height={40} fill={theme.colors.primary300} />
					</View>
				</View>

				<Text style={styles.time}>{mainTrailer.duration < 60 ? `${mainTrailer.duration.toFixed()} сек` : `${(mainTrailer.duration / 60).toFixed()} мин`}</Text>
			</ImageBackground>
		</Button>
	)
}

const stylesheet = createStyleSheet(theme => ({
	container: {
		margin: -4
	},
	playContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1
	},
	play: {
		backgroundColor: 'rgba(0,0,0,0.4)',
		borderRadius: 99,
		padding: 10
	},
	time: {
		backgroundColor: 'rgba(0,0,0,0.4)',
		color: theme.colors.primary300,
		position: 'absolute',
		bottom: 0,
		right: 0,
		paddingHorizontal: 5,
		paddingVertical: 3,
		fontSize: 13
	}
}))
