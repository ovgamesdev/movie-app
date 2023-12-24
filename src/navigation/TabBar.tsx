import { Button } from '@components/atoms'
import { useTheme } from '@hooks'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs'
import React, { useEffect, useRef } from 'react'
import { Animated, Dimensions, ScrollView, TVFocusGuideView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const tabWidth = Dimensions.get('window').width / 2 // 120

export const TabBar = ({ state, descriptors, navigation, position }: MaterialTopTabBarProps) => {
	const insets = useSafeAreaInsets()
	const bottomTabBarHeight = useBottomTabBarHeight()
	const { colors } = useTheme()
	const scrollView = useRef<ScrollView | null>(null)

	const inputRange = state.routes.map((_, i) => i)
	const indicatorTranslateX = position.interpolate({ inputRange, outputRange: inputRange.map(it => it * tabWidth + 10) })

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
		<ScrollView ref={scrollView} horizontal contentContainerStyle={{ flexGrow: 1, marginTop: insets.top }} style={{ flexGrow: 0 }}>
			<TVFocusGuideView style={{ flexDirection: 'row', borderBottomColor: colors.bg300, borderBottomWidth: 1 }} autoFocus>
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
							<Animated.Text style={{ opacity, fontSize: 14, color: colors.text100, textAlign: 'center' }}>{typeof label === 'function' ? label({ focused: isFocused, children: '', color: colors.text100 }) : label}</Animated.Text>
						</Button>
					)
				})}
				<Animated.View style={{ height: 1, position: 'absolute', bottom: -1, backgroundColor: colors.accent100, transform: [{ translateX: indicatorTranslateX }], width: tabWidth - 20 }} />
			</TVFocusGuideView>
		</ScrollView>
	)
}
