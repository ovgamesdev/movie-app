import { useTheme } from '@hooks'
import React from 'react'
import { ActivityIndicator as AI, ActivityIndicatorProps } from 'react-native'

export const ActivityIndicator = (props: ActivityIndicatorProps) => {
	const { colors } = useTheme()

	return <AI color={colors.text200} {...props} />
}
