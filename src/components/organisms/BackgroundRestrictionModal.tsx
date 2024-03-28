import { Button } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import notifee from '@notifee/react-native'
import { Text, View } from 'react-native'
import Modal from 'react-native-modal'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import WebView from 'react-native-webview'

export const BackgroundRestrictionModal = () => {
	const { isVisibleModal, isInDontKillMyApp, powerManagerInfo } = useTypedSelector(state => state.backgroundRestriction)
	const { setIsVisibleBackgroundRestrictionModal: setIsVisibleModal } = useActions()
	const { styles } = useStyles(stylesheet)

	const onClose = () => {
		setIsVisibleModal(false)
	}

	if (!isVisibleModal) return null

	const uri = `https://dontkillmyapp-com.translate.goog/${isInDontKillMyApp ? powerManagerInfo?.manufacturer?.toLocaleLowerCase() ?? '' : 'general'}?_x_tr_sl=en&_x_tr_tl=ru&_x_tr_hl=ru&_x_tr_pto=sc#user-solution-section`

	return (
		<Modal
			isVisible={isVisibleModal}
			onSwipeComplete={onClose}
			onBackdropPress={onClose}
			onBackButtonPress={onClose}
			// swipeDirection={['down']}
			useNativeDriverForBackdrop
			style={styles.modal}>
			<View style={styles.container}>
				<View style={styles.header} />
				<Text style={styles.title}>Обнаружены ограничения</Text>
				<Text style={styles.detailText}>Чтобы удостовериться в доставке уведомлений, отключите оптимизацию батареи для приложения и измените настройки, чтобы избежать закрытия приложения.</Text>
				{powerManagerInfo?.version && <Text style={styles.detailText}>Ваша версия Android: {powerManagerInfo.version}</Text>}

				<View style={styles.webViewContainer}>
					<WebView
						source={{ uri }}
						style={styles.webView}
						cacheEnabled={false}
						onShouldStartLoadWithRequest={({ url }: { url: string }) => url.startsWith('https://dontkillmyapp')}
						injectedJavaScript={`
							document.querySelector('head meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
							// document.querySelector('iframe[id*="gt"]').remove()
						`}
					/>
				</View>
				<View style={styles.buttonContainer}>
					<Button hasTVPreferredFocus onPress={notifee.openBatteryOptimizationSettings} text='Открыть «Оптимизация батареи»' />
					<Button onPress={notifee.openPowerManagerSettings} text='Открыть «Диспетчер питания»' />
				</View>
			</View>
		</Modal>
	)
}

const stylesheet = createStyleSheet(theme => ({
	modal: {
		justifyContent: 'flex-end',
		margin: 0,
		padding: 0
	},
	container: {
		backgroundColor: theme.colors.bg100,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 10,
		paddingTop: 0,
		paddingBottom: 35
	},
	header: {
		backgroundColor: theme.colors.bg300,
		width: 30,
		height: 4,
		margin: 6,
		alignSelf: 'center',
		borderRadius: 10
	},
	title: {
		color: theme.colors.text100,
		fontSize: 16,
		fontWeight: '700',
		paddingTop: 5
	},
	detailText: {
		color: theme.colors.text200,
		paddingTop: 5
	},
	webViewContainer: {
		width: '100%',
		aspectRatio: 9 / 10,
		paddingVertical: 10
	},
	webView: {
		flex: 1
	},
	buttonContainer: {
		// flexDirection: 'row',
		gap: 10
	}
}))
