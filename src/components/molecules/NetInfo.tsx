import { Button } from '@components/atoms'
import { useActions, useTheme, useTypedSelector } from '@hooks'
import { FC, useEffect, useRef, useState } from 'react'
import { Animated, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const NetInfo: FC = () => {
	const isConnected = useTypedSelector(state => state.network.isConnected)
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)
	const { colors } = useTheme()
	const insets = useSafeAreaInsets()
	const { setIsShowNetInfo } = useActions()

	const timeoutRef = useRef<NodeJS.Timeout | null>(null)
	const animationRef = useRef<Animated.CompositeAnimation | null>(null)

	const [netInfoHeight] = useState<Animated.Value>(new Animated.Value(isConnected ? 0 : 24 + insets.bottom))

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
			setIsShowNetInfo(false)
		)
	}

	const showAnimation = () => {
		if (animationRef.current) {
			animationRef.current.stop()
			animationRef.current = null
		}

		setIsShowNetInfo(true)
		animationRef.current = Animated.timing(netInfoHeight, { toValue: 24 + insets.bottom, duration: 500, useNativeDriver: false })
		animationRef.current.start()
	}

	if (!isShowNetInfo || isConnected === null) return null

	return (
		<Animated.View style={{ height: netInfoHeight, backgroundColor: isConnected ? colors.success : colors.warning }}>
			<Button onPress={hideAnimation} transparent padding={0} justifyContent='center' style={{ height: 24, borderRadius: 0 }}>
				<Text style={{ textAlign: 'center', textAlignVertical: 'center', fontSize: 14, color: colors.primary300, height: 24 }}>{isConnected ? 'Подключение восстановлено' : 'Нет подключения'}</Text>
			</Button>
		</Animated.View>
	)
}
