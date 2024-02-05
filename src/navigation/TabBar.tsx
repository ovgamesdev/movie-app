import { Button } from '@components/atoms'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs'
import { FC, useEffect, useRef } from 'react'
import { Animated, Dimensions, ScrollView, TVFocusGuideView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const TabBar: FC<MaterialTopTabBarProps> = ({ state, descriptors, navigation, position }) => {
	const tabWidth = Dimensions.get('window').width / 2 // 120

	const insets = useSafeAreaInsets()
	const bottomTabBarHeight = useBottomTabBarHeight()
	const scrollView = useRef<ScrollView | null>(null)
	const { styles, theme } = useStyles(stylesheet)

	const inputRange = state.routes.map((_, i) => i)
	const indicatorTranslateX = position.interpolate({ inputRange, outputRange: inputRange.map(it => it * tabWidth) })

	useEffect(() => {
		// const listener = position.addListener(({ value }: { value: number }) => {
		// 	if (!scrollView.current) return
		// 	scrollView.current.scrollTo({ x: value * (tabWidth / 2), animated: false })
		// })
		// console.log('change listener')
		// return () => position.removeListener(listener)

		if (!scrollView.current) return
		scrollView.current.scrollTo({ x: state.index * (tabWidth / 2) })
	}, [state.index])

	return (
		<ScrollView ref={scrollView} horizontal contentContainerStyle={[styles.scrollContainer, { marginTop: insets.top }]} style={styles.scrollContainerWrapper}>
			<TVFocusGuideView style={styles.container} autoFocus>
				{state.routes.map((route, index) => {
					const { options } = descriptors[route.key]
					const label = options.tabBarLabel ?? options.title ?? route.name

					const isFocused = state.index === index

					const onPress = () => {
						const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })

						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name, route.params)
						}
					}

					const onLongPress = () => {
						navigation.emit({ type: 'tabLongPress', target: route.key })
					}

					const opacity = position.interpolate({ inputRange, outputRange: inputRange.map(i => (i === index ? 1 : 0.6)) })

					return (
						<Button key={index} onPress={onPress} onLongPress={onLongPress} padding={0} alignItems='center' justifyContent='center' style={{ width: tabWidth, height: bottomTabBarHeight - insets.bottom - 2 }} transparent>
							<Animated.Text style={[styles.text, { opacity }]}>{typeof label === 'function' ? label({ focused: isFocused, children: '', color: theme.colors.text100 }) : label}</Animated.Text>
						</Button>
					)
				})}
				<Animated.View style={[styles.line, { transform: [{ translateX: indicatorTranslateX }], width: tabWidth }]} />
			</TVFocusGuideView>
		</ScrollView>
	)
}

const stylesheet = createStyleSheet(theme => ({
	scrollContainer: {
		flexGrow: 1
	},
	scrollContainerWrapper: {
		flexGrow: 0
	},
	container: {
		flexDirection: 'row',
		borderBottomColor: theme.colors.bg300,
		borderBottomWidth: 1
	},
	text: {
		fontSize: 14,
		color: theme.colors.text100,
		textAlign: 'center'
	},
	line: {
		height: 1,
		position: 'absolute',
		bottom: -1,
		backgroundColor: theme.colors.accent100
	}
}))
