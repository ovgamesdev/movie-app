import { Button } from '@components/atoms'
import { useTheme } from '@hooks'
import { RootStackParamList } from '@navigation'
import { useFocusEffect } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback } from 'react'
import { AppState, StatusBar, Text, View } from 'react-native'
import SystemNavigationBar from 'react-native-system-navigation-bar'

type Props = NativeStackScreenProps<RootStackParamList, 'Watch'>

export const Watch = ({ navigation, route }: Props) => {
	const { data } = route.params
	const { colors } = useTheme()

	useFocusEffect(
		useCallback(() => {
			SystemNavigationBar.navigationHide()
			StatusBar.setHidden(true)

			const subscription = AppState.addEventListener('change', nextAppState => {
				if (nextAppState === 'active') {
					SystemNavigationBar.navigationHide()
					StatusBar.setHidden(true)
				}
			})

			return () => {
				subscription.remove()
				SystemNavigationBar.navigationShow()
				StatusBar.setHidden(false)
			}
		}, [])
	)

	return (
		<View style={{ flex: 1, padding: 10 }}>
			<Text style={{ color: colors.text100 }}>Watch</Text>

			<Button text='back' onPress={() => navigation.pop()} hasTVPreferredFocus />
		</View>
	)
}
