import React, { FC, useEffect, useRef, useState } from 'react'
import { Animated, Pressable, Text } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { useTypedSelector } from '../hooks/useTypedSelector'

export const NetInfo: FC = () => {
	const isConnected = useTypedSelector(state => state.network.isConnected)
	const { colors } = useTheme()

	// TODO useSafeAreaInsets
	const bottom = 0

	const [isShowConnectedStatus, setIsShowConnectedStatus] = useState<boolean>(false)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)
	const animationRef = useRef<Animated.CompositeAnimation | null>(null)

	const [netInfoHeight] = useState<Animated.Value>(new Animated.Value(isConnected ? 0 : 24 + bottom))

	useEffect(() => {
		if (isConnected === true) {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
				timeoutRef.current = null
			}

			timeoutRef.current = setTimeout(hideAnimation, 1000)
		} else if (isConnected === false) {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
				timeoutRef.current = null
			}

			showAnimation()
		}
	}, [isConnected])

	const hideAnimation = () => {
		if (animationRef.current) {
			animationRef.current.stop()
			animationRef.current = null
		}

		animationRef.current = Animated.timing(netInfoHeight, { toValue: 0, duration: 500, useNativeDriver: false })
		animationRef.current.start(() =>
			// isConnected === true &&
			setIsShowConnectedStatus(false)
		)
	}

	const showAnimation = () => {
		if (animationRef.current) {
			animationRef.current.stop()
			animationRef.current = null
		}

		setIsShowConnectedStatus(true)
		animationRef.current = Animated.timing(netInfoHeight, { toValue: 24 + bottom, duration: 500, useNativeDriver: false })
		animationRef.current.start()
	}

	if (!isShowConnectedStatus) return null

	return (
		<Animated.View style={{ height: netInfoHeight, backgroundColor: isConnected ? colors.success : colors.warning }}>
			<Pressable onPress={hideAnimation}>
				<Text style={{ textAlign: 'center', textAlignVertical: 'center', fontSize: 14, color: colors.primary300, height: 24, marginBottom: bottom }}>{isConnected ? 'Подключение восстановлено' : 'Нет подключения'}</Text>
			</Pressable>
		</Animated.View>
	)
}
