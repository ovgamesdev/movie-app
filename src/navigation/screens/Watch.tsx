import { ActivityIndicator } from '@components/atoms'
import { useTheme } from '@hooks'
import { RootStackParamList } from '@navigation'
import { useFocusEffect } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback } from 'react'
import { AppState, StatusBar, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import SystemNavigationBar from 'react-native-system-navigation-bar'
import WebView from 'react-native-webview'

type Props = NativeStackScreenProps<RootStackParamList, 'Watch'>

export const Watch = ({ navigation, route }: Props) => {
	const { data } = route.params
	const { colors } = useTheme()
	const insets = useSafeAreaInsets()

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

	const run = `
		document.querySelector('#logo').setAttribute('style', 'display: none;')
		document.querySelector('#container').setAttribute('id', 'player_container')
		document.querySelector('#player_container').setAttribute('style', 'width: 100%; height: 100%;')
		
		true;
	`

	return (
		<View style={{ flex: 1 }}>
			<WebView
				source={{
					uri: `https://kinopoisk-watch.org/player/?id=${data.id}`
				}}
				style={{ flex: 1 }}
				injectedJavaScript={run}
				startInLoadingState
				scalesPageToFit={false}
				allowsFullscreenVideo={true}
				showsVerticalScrollIndicator={false}
				nestedScrollEnabled={true}
				setBuiltInZoomControls={false}
				contentInset={insets}
				webviewDebuggingEnabled
				renderLoading={() => (
					<View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.bg200, justifyContent: 'center', alignItems: 'center' }}>
						<ActivityIndicator size='large' />
					</View>
				)}
			/>
		</View>
	)
}
