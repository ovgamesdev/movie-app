import { ActivityIndicator } from '@components/atoms'
import { RootStackParamList } from '@navigation'
import { useFocusEffect } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { FC, useCallback } from 'react'
import { AppState, Dimensions, StatusBar, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import WebView from 'react-native-webview'

type Props = NativeStackScreenProps<RootStackParamList, 'MovieTrailer'>

export const MovieTrailer: FC<Props> = ({ route }) => {
	const { streamUrl, sourceVideoUrl } = route.params.data
	const { styles } = useStyles(stylesheet)

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
				<View style={styles.loading}>
					<ActivityIndicator size='large' />
				</View>
			)}
		/>
	)
}

const stylesheet = createStyleSheet(theme => ({
	loading: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		backgroundColor: theme.colors.bg200,
		justifyContent: 'center',
		alignItems: 'center'
	}
}))
