import { ActivityIndicator } from '@components/atoms'
import { useTheme } from '@hooks'
import { RootStackParamList } from '@navigation'
import { useFocusEffect } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useCallback } from 'react'
import { AppState, Dimensions, StatusBar, View } from 'react-native'
import WebView from 'react-native-webview'

type Props = NativeStackScreenProps<RootStackParamList, 'MovieTrailer'>

export const MovieTrailer = ({ route }: Props) => {
	const { streamUrl, sourceVideoUrl } = route.params.data
	const { colors } = useTheme()

	useFocusEffect(
		useCallback(() => {
			StatusBar.setHidden(true)

			const subscription = AppState.addEventListener('change', nextAppState => {
				if (nextAppState === 'active') {
					StatusBar.setHidden(true)
				}
			})

			return () => {
				subscription.remove()
				StatusBar.setHidden(false)
			}
		}, [])
	)

	const window = Dimensions.get('window')

	return (
		<WebView
			source={{ uri: (streamUrl || sourceVideoUrl) ?? `https://via.placeholder.com/${window.width}x${window.height}` }}
			webviewDebuggingEnabled={__DEV__}
			startInLoadingState
			renderLoading={() => (
				<View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.bg200, justifyContent: 'center', alignItems: 'center' }}>
					<ActivityIndicator size='large' />
				</View>
			)}
		/>
	)
}
