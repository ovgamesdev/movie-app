import { Button, ButtonType } from '@components/atoms'
import { useActions, useTheme, useTypedSelector } from '@hooks'
import { ExpandMoreIcon } from '@icons'
import { useRef, useState } from 'react'
import { Text, View } from 'react-native'
import Modal from 'react-native-modal'

export const UpdateApkModal = () => {
	const { canUpdate, remote, size, isVisibleModal } = useTypedSelector(store => store.update)
	const { setIsVisibleModal, downloadApk } = useActions()
	const [isExpand, setIsExpand] = useState(false)
	const { colors } = useTheme()

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
		<Modal isVisible={isVisibleModal} onShow={_onShow} onSwipeComplete={onClose} onBackdropPress={onClose} onBackButtonPress={onClose} swipeDirection={['down']} useNativeDriverForBackdrop style={{ justifyContent: 'flex-end', margin: 0, padding: 0 }}>
			<View style={{ backgroundColor: colors.bg100, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 10, paddingTop: 0, paddingBottom: 35 }}>
				<View style={{ backgroundColor: colors.bg300, width: 30, height: 4, margin: 6, alignSelf: 'center', borderRadius: 10 }} />
				<Text style={{ color: colors.text100, fontSize: 16, fontWeight: '700', paddingTop: 5 }}>Доступно обновление</Text>

				<Button onPress={() => setIsExpand(is => !is)} padding={0} paddingVertical={7} transparent flexDirection='row'>
					<Text style={{ color: colors.primary100 }}>Что нового в {remote.versionName}</Text>
					<ExpandMoreIcon width={18} height={18} fill={colors.primary100} rotation={isExpand ? 180 : 0} />
				</Button>

				{isExpand && (
					<View style={{ paddingTop: 10 }}>
						<Text style={{ color: colors.text100 }}>{remote.whatsNew}</Text>

						{remote.whatsNewOptions?.map((option, i) => (
							<View key={i}>
								<Text style={{ color: colors.text100, paddingVertical: 5 }}>{option.title}</Text>
								{option.options.map((option, i) => (
									<View key={i} style={{ flexDirection: 'row' }}>
										<Text style={{ color: colors.text100, fontWeight: '700', padding: 5 }}>•</Text>
										<Text style={{ color: colors.text100, padding: 5, flex: 1 }}>{option.title}</Text>
									</View>
								))}
							</View>
						))}
					</View>
				)}

				<Button ref={buttonRef} text={`Загрузить • ${size} МБ`} onPress={onStart} alignItems='center' padding={12} buttonColor={colors.primary100} pressedButtonColor={colors.primary200} textColor={colors.primary300} style={{ marginTop: 10 }} />
			</View>
		</Modal>
	)
}
