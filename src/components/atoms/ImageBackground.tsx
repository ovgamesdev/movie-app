import { useTheme } from '@hooks'
import React from 'react'
import { ImageBackgroundProps, ImageBackground as RNImageBackground } from 'react-native'

export const ImageBackground = ({ style, ...props }: ImageBackgroundProps) => {
	const { colors } = useTheme()

	return <RNImageBackground {...props} style={[style, { backgroundColor: colors.bg200, borderRadius: props.borderRadius }]} />
}
