import { useTheme } from '@hooks'
import React from 'react'
import { ActivityIndicatorProps, ActivityIndicator as RNActivityIndicator } from 'react-native'

export const ActivityIndicator = (props: ActivityIndicatorProps) => {
	const { colors } = useTheme()

	return <RNActivityIndicator color={colors.text200} {...props} />
}
