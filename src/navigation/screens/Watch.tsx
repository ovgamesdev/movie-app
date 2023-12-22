import { ActivityIndicator } from '@components/atoms'
import { useActions } from '@hooks'
import { RootStackParamList } from '@navigation'
import { useFocusEffect } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useEffect } from 'react'
import { AppState, StatusBar, View } from 'react-native'
import { lockToLandscape, resetInterfaceOrientationSetting } from 'react-native-orientation-manager'
import SystemNavigationBar from 'react-native-system-navigation-bar'
import WebView from 'react-native-webview'

type Props = NativeStackScreenProps<RootStackParamList, 'Watch'>

const Loading = () => {
	return (
		<View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size='large' />
		</View>
	)
}

export const Watch = ({ navigation, route }: Props) => {
	const { data } = route.params

	const { mergeItem } = useActions()

	useFocusEffect(
		useCallback(() => {
			SystemNavigationBar.navigationHide()
			StatusBar.setHidden(true)
			lockToLandscape()

			const subscription = AppState.addEventListener('change', nextAppState => {
				if (nextAppState === 'active') {
					SystemNavigationBar.navigationHide()
					StatusBar.setHidden(true)
					lockToLandscape()
				}
			})

			return () => {
				subscription.remove()
				SystemNavigationBar.navigationShow()
				StatusBar.setHidden(false)
				resetInterfaceOrientationSetting()
			}
		}, [])
	)

	useEffect(() => {
		console.log('watchHistory init', { [`${data.id}:watch`]: { ...data, timestamp: Date.now() } })
		mergeItem({ watchHistory: { [`${data.id}:watch`]: { ...data, timestamp: Date.now() } } })

		const lastTime = Math.floor(Math.random() * 200) + 1
		const duration = Math.floor(Math.random() * 500) + lastTime

		setTimeout(() => {
			console.log('watchHistory loaded', { [`${data.id}:watch`]: { lastTime, duration } })
			mergeItem({ watchHistory: { [`${data.id}:watch`]: { lastTime, duration } } })
		}, 10 * 1000)

		const saveWatchStatus = () => {
			const newLastTime = Math.floor(Math.random() * (duration - lastTime)) + lastTime

			console.log('watchHistory end', { [`${data.id}:watch`]: { lastTime: newLastTime } })
			mergeItem({ watchHistory: { [`${data.id}:watch`]: { lastTime: newLastTime } } })
		}

		const subscription = AppState.addEventListener('change', nextAppState => nextAppState === 'background' && saveWatchStatus())
		return () => {
			resetInterfaceOrientationSetting() // TODO test
			subscription.remove()
			saveWatchStatus()
		}
	}, [])

	const run = `
		document.querySelector('head meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
		document.querySelector('#logo').setAttribute('style', 'display: none;');
		document.querySelector('#container').setAttribute('id', 'player_container');
		document.querySelector('#player_container').setAttribute('style', 'width: 100%; height: 100%;');
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
				allowsFullscreenVideo
				webviewDebuggingEnabled={__DEV__}
				startInLoadingState
				renderLoading={Loading}
			/>
		</View>
	)
}
