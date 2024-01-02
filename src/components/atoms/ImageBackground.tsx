import { useTheme } from '@hooks'
import React from 'react'
import { ImageBackgroundProps, ImageBackground as RNImageBackground } from 'react-native'

export const ImageBackground = ({ style, source, ...props }: ImageBackgroundProps) => {
	const { colors } = useTheme()

	return <RNImageBackground {...props} source={typeof source === 'object' && 'uri' in source ? { ...source, headers: { Accept: '*/*' } } : source} style={[style, { backgroundColor: colors.bg200, borderRadius: props.borderRadius }]} onError={e => console.log(`[image] loading error url (${typeof source === 'object' && 'uri' in source ? source.uri : ''}):`, e)} />
}
