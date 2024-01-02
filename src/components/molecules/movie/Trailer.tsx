import { Button, ImageBackground } from '@components/atoms'
import { useTheme } from '@hooks'
import { PlayIcon } from '@icons'
import { navigation } from '@navigation'
import { IMainTrailer } from '@store/kinopoisk'
import { normalizeUrlWithNull } from '@utils'
import { Text, View } from 'react-native'

export const Trailer = ({ mainTrailer, showTime, aspectRatio, disabled, showPlay = true }: { mainTrailer: IMainTrailer; showTime?: boolean; aspectRatio?: number; disabled?: boolean; showPlay?: boolean }) => {
	const { colors } = useTheme()

	const poster = normalizeUrlWithNull(mainTrailer.preview.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/600x380' })

	return (
		<Button padding={0} transparent animation={disabled ? undefined : 'scale'} style={{ margin: -4 }} onPress={() => !disabled && navigation.push('MovieTrailer', { data: mainTrailer })}>
			<ImageBackground source={{ uri: poster }} style={{ width: '100%', aspectRatio: aspectRatio ?? 302 / 169.708 }}>
				{showPlay && (
					<View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
						<View style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 99, padding: 10 }}>
							<PlayIcon width={40} height={40} fill={colors.primary300} />
						</View>
					</View>
				)}
				{showTime && <Text style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: colors.primary300, position: 'absolute', bottom: 0, right: 0, paddingHorizontal: 5, paddingVertical: 3, fontSize: 13 }}>{mainTrailer.duration < 60 ? `${mainTrailer.duration.toFixed()} сек` : `${(mainTrailer.duration / 60).toFixed()} мин`}</Text>}
			</ImageBackground>
		</Button>
	)
}
