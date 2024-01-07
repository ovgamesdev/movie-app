import React from 'react'
import { ImageBackgroundProps, ImageBackground as RNImageBackground } from 'react-native'
import { useStyles } from 'react-native-unistyles'

export const ImageBackground = ({ style, source, ...props }: ImageBackgroundProps) => {
	const { theme } = useStyles()

	return <RNImageBackground {...props} source={typeof source === 'object' && 'uri' in source ? { ...source, headers: { Accept: '*/*' } } : source} style={[style, { backgroundColor: theme.colors.bg200, borderRadius: props.borderRadius }]} onError={e => console.log(`[image] loading error url (${typeof source === 'object' && 'uri' in source ? source.uri : ''}):`, e)} />
}
