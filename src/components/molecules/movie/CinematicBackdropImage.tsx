import { BlurView, ImageBackground } from '@components/atoms'
import { FC } from 'react'
import { ImageBackgroundProps, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const CinematicBackdropImage: FC<Pick<ImageBackgroundProps, 'source' | 'children'>> = ({ source, children }) => {
	const insets = useSafeAreaInsets()

	return (
		<View>
			{insets.top > 0 ? (
				<View style={{ position: 'absolute' }}>
					<ImageBackground source={source} resizeMode='cover' style={{ width: '100%', aspectRatio: 16 / 9, marginTop: insets.top, marginBottom: 50, transform: [{ scale: 1.15 }] }} />
					<BlurView blurRadius={50} />
				</View>
			) : null}

			<ImageBackground source={source} resizeMode='cover' style={{ width: '100%', aspectRatio: 16 / 9, marginTop: insets.top, marginBottom: 50 }}>
				{children}
			</ImageBackground>
		</View>
	)
}
