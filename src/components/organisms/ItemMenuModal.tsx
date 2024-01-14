import { Button } from '@components/atoms'
import { fetchNewSeries, useActions, useTypedSelector } from '@hooks'
import { navigation } from '@navigation'
import { WatchHistory } from '@store/settings'
import { memo } from 'react'
import { Text, View } from 'react-native'
import Modal from 'react-native-modal'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const ModalContent = memo(({ item }: { item: WatchHistory }) => {
	const { removeItemByPath, mergeItem, isBatteryOptimizationEnabled, setItemHiddenModal } = useActions()
	const { styles } = useStyles(stylesheet)

	const onClose = () => {
		setItemHiddenModal()
	}

	return (
		<View style={styles.container}>
			<View style={styles.header} />
			<Text style={styles.title}>«{item.title}»</Text>
			<Text style={styles.detailText}>{new Date(item.timestamp).toLocaleDateString()}</Text>

			<View style={{ height: 10 }} />

			<View style={styles.buttonContainer}>
				<Button
					text='Детали'
					onPress={() => {
						onClose()

						navigation.push('Movie', { data: item })
					}}
				/>
				<Button
					text='Notifee'
					onPress={async () => {
						onClose()

						const newWatchHistoryData: Partial<WatchHistory> = {
							notify: !item.notify
						}

						if (newWatchHistoryData.notify) {
							const newSeries = await fetchNewSeries(item)
							if (newSeries) newWatchHistoryData.releasedEpisodes = newSeries
						}

						mergeItem({ watchHistory: { [`${item.id}`]: newWatchHistoryData } })
						isBatteryOptimizationEnabled()
					}}
				/>
				<Button
					text='Удалить'
					onPress={() => {
						onClose()

						removeItemByPath(['watchHistory', `${item.id}`])
					}}
				/>
				<View style={{ height: 1 }} />
				<Button
					text='Отмерить как просмотрено'
					onPress={() => {
						onClose()

						const newWatchHistoryData: Partial<WatchHistory> = {
							status: 'end'
						}

						if (item.notify) newWatchHistoryData.notify = false

						mergeItem({ watchHistory: { [`${item.id}`]: newWatchHistoryData } })
					}}
				/>
				<Button
					text='Отмерить как смотрю'
					onPress={() => {
						onClose()

						const newWatchHistoryData: Partial<WatchHistory> = {
							status: 'watch'
						}
						mergeItem({ watchHistory: { [`${item.id}`]: newWatchHistoryData } })
					}}
				/>
				<Button
					text='Отмерить как пауза'
					onPress={() => {
						onClose()

						const newWatchHistoryData: Partial<WatchHistory> = {
							status: 'pause'
						}
						mergeItem({ watchHistory: { [`${item.id}`]: newWatchHistoryData } })
					}}
				/>
				<Button
					text='Отмерить как новое'
					onPress={() => {
						onClose()

						const newWatchHistoryData: Partial<WatchHistory> = {
							status: 'new'
						}
						mergeItem({ watchHistory: { [`${item.id}`]: newWatchHistoryData } })
					}}
				/>
			</View>
		</View>
	)
})

export const ItemMenuModal = () => {
	const { isVisibleModal, item } = useTypedSelector(state => state.itemMenuModal)
	const { setItemHiddenModal } = useActions()
	const { styles } = useStyles(stylesheet)

	const onClose = () => {
		setItemHiddenModal()
	}

	const _onShow = () => {
		//
	}

	return (
		<Modal isVisible={isVisibleModal} onShow={_onShow} onSwipeComplete={onClose} onBackdropPress={onClose} onBackButtonPress={onClose} swipeDirection={['down']} useNativeDriverForBackdrop style={styles.modal}>
			{item ? <ModalContent item={item} /> : <View />}
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
	buttonContainer: {
		// flexDirection: 'row',
		gap: 10
	}
}))
