import { Button, ButtonType } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { ExpandMoreIcon } from '@icons'
import { useRef, useState } from 'react'
import { Text, View } from 'react-native'
import Modal from 'react-native-modal'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const UpdateApkModal = () => {
	const { canUpdate, remote, size, isVisibleModal } = useTypedSelector(state => state.update)
	const { setIsVisibleModal, downloadApk } = useActions()
	const [isExpand, setIsExpand] = useState(false)
	const { styles, theme } = useStyles(stylesheet)

	const buttonRef = useRef<ButtonType>(null)

	const onClose = () => {
		setIsVisibleModal(false)
	}

	const onStart = () => {
		downloadApk()
		onClose()
	}

	const _onShow = () => {
		buttonRef.current?.requestTVFocus()
	}

	if (!canUpdate || !remote) return null

	return (
		<Modal isVisible={isVisibleModal} onShow={_onShow} onSwipeComplete={onClose} onBackdropPress={onClose} onBackButtonPress={onClose} swipeDirection={['down']} useNativeDriverForBackdrop style={styles.modal}>
			<View style={styles.container}>
				<View style={styles.header} />
				<Text style={styles.title}>Доступно обновление</Text>

				<Button onPress={() => setIsExpand(is => !is)} padding={0} paddingVertical={7} transparent flexDirection='row'>
					<Text style={styles.expandButtonText}>Что нового в {remote.versionName}</Text>
					<ExpandMoreIcon width={18} height={18} fill={theme.colors.primary100} rotation={isExpand ? 180 : 0} />
				</Button>

				{isExpand && (
					<View style={styles.expandContainer}>
						<Text style={styles.expandText}>{remote.whatsNew}</Text>

						{remote.whatsNewOptions?.map((option, i) => (
							<View key={i}>
								<Text style={styles.optionTitle}>{option.title}</Text>
								{option.options.map((option, i) => (
									<View key={i} style={styles.optionDetailContainer}>
										<Text style={styles.optionDetailMarker}>•</Text>
										<Text style={styles.optionDetailText}>{option.title}</Text>
									</View>
								))}
							</View>
						))}
					</View>
				)}

				<Button ref={buttonRef} text={`Загрузить • ${size} МБ`} onPress={onStart} alignItems='center' padding={12} buttonColor={theme.colors.primary100} pressedButtonColor={theme.colors.primary200} textColor={theme.colors.primary300} style={{ marginTop: 10 }} />
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
	expandButtonText: {
		color: theme.colors.primary100,
		fontSize: 14
	},
	expandContainer: {
		paddingTop: 10
	},
	expandText: {
		color: theme.colors.text100
	},
	optionTitle: {
		color: theme.colors.text100,
		paddingVertical: 5
	},
	optionDetailContainer: {
		flexDirection: 'row'
	},
	optionDetailMarker: {
		color: theme.colors.text100,
		fontWeight: '700',
		padding: 5
	},
	optionDetailText: {
		color: theme.colors.text100,
		padding: 5,
		flex: 1
	}
}))
