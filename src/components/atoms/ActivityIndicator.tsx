import React from 'react'
import { ActivityIndicatorProps, ActivityIndicator as RNActivityIndicator } from 'react-native'
import { useStyles } from 'react-native-unistyles'

export const ActivityIndicator = (props: ActivityIndicatorProps) => {
	const { theme } = useStyles()

	return <RNActivityIndicator color={theme.colors.text200} {...props} />
}
