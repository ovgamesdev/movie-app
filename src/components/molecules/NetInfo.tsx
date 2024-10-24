import { Button } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { FC, useEffect, useRef } from 'react'
import { Animated, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const NetInfo: FC = () => {
	const isConnected = useTypedSelector(state => state.network.isConnected)
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)
	const { styles } = useStyles(stylesheet)
	const insets = useSafeAreaInsets()
	const { setIsShowNetInfo } = useActions()

	const timeoutRef = useRef<NodeJS.Timeout | null>(null)
	const animationRef = useRef<Animated.CompositeAnimation | null>(null)

	const netInfoHeight = useRef(new Animated.Value(isConnected ? 0 : 24 + insets.bottom)).current

	useEffect(() => {
		if (isConnected) {
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
		<Animated.View style={[{ height: netInfoHeight }, isConnected ? styles.containerConnected : styles.containerDisconnected]}>
			<Button onPress={hideAnimation} transparent padding={0} justifyContent='center' style={styles.button}>
				<Text style={styles.text}>{isConnected ? 'Подключение восстановлено' : 'Нет подключения'}</Text>
			</Button>
		</Animated.View>
	)
}

const stylesheet = createStyleSheet(theme => ({
	containerConnected: {
		backgroundColor: theme.colors.success
	},
	containerDisconnected: {
		backgroundColor: theme.colors.warning
	},
	button: {
		height: 24,
		borderRadius: 0
	},
	text: {
		textAlign: 'center',
		textAlignVertical: 'center',
		fontSize: 14,
		color: theme.colors.primary300,
		height: 24
	}
}))
