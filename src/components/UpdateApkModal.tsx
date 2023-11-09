import React, { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Modal from 'react-native-modal'
import { useActions } from '../hooks/useActions'
import { useTypedSelector } from '../hooks/useTypedSelector'
import { ExpandMoreIcon } from '../icons'

const UpdateApkModal = () => {
	const { canUpdate, remote, size, isVisibleModal } = useTypedSelector(store => store.update)
	const { setIsVisibleModal, downloadApk } = useActions()
	const [isExpand, setIsExpand] = useState(false)

	const onClose = () => {
		setIsVisibleModal(false)
	}

	const onStart = () => {
		downloadApk()
		onClose()
	}

	if (!canUpdate || !remote) return null

	return (
		<Modal isVisible={isVisibleModal} onSwipeComplete={onClose} onBackdropPress={onClose} onBackButtonPress={onClose} swipeDirection={['down']} useNativeDriverForBackdrop style={{ justifyContent: 'flex-end', margin: 0, padding: 0 }}>
			<View style={{ backgroundColor: '#262626', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 10, paddingTop: 0, paddingBottom: 35 }}>
				<View style={{ backgroundColor: '#7e7e7e', width: 30, height: 4, margin: 6, alignSelf: 'center', borderRadius: 10 }} />
				<Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', paddingTop: 5 }}>Доступно обновление</Text>

				<Pressable onPress={() => setIsExpand(is => !is)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
					<Text style={{ color: '#1db93c' }}>Что нового в {remote.versionName}</Text>
					<ExpandMoreIcon width={20} height={20} fill='#1db93c' rotation={isExpand ? 180 : 0} />
				</Pressable>

				{isExpand && (
					<View style={{ paddingTop: 10 }}>
						<Text style={{ color: '#fff' }}>{remote.whatsNew}</Text>

						{remote.whatsNewOptions?.map((option, i) => (
							<View key={i}>
								<Text style={{ color: '#fff', paddingVertical: 5 }}>{option.title}</Text>
								{option.options.map((option, i) => (
									<View key={i} style={{ flexDirection: 'row' }}>
										<Text style={{ color: '#fff', fontWeight: '700', padding: 5 }}>•</Text>
										<Text style={{ color: '#fff', padding: 5, flex: 1 }}>{option.title}</Text>
									</View>
								))}
							</View>
						))}
					</View>
				)}

				<Pressable onPress={onStart} style={{ padding: 15, marginTop: 10, backgroundColor: '#1db93c', borderRadius: 10 }}>
					<Text style={{ color: '#fff', textAlign: 'center' }}>Загрузить • {size} МБ</Text>
				</Pressable>
			</View>
		</Modal>
	)
}

export default UpdateApkModal
