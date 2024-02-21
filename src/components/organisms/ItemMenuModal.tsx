import { Button } from '@components/atoms'
import { fetchNewSeries, useActions, useTypedSelector } from '@hooks'
import { navigation } from '@navigation'
import { WatchHistory } from '@store/settings'
import { isSeries } from '@utils'
import { memo } from 'react'
import { Text, ToastAndroid, View } from 'react-native'
import Modal from 'react-native-modal'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface Props {
	item: WatchHistory
}

const ModalContent = memo<Props>(({ item }) => {
	const { removeItemByPath, mergeItem, isBatteryOptimizationEnabled, setItemHiddenModal } = useActions()
	const { styles } = useStyles(stylesheet)

	const onClose = () => {
		setItemHiddenModal()
	}

	return (
		<View style={styles.container}>
			<View style={styles.header} />
			<Text style={styles.title}>«{item.title}»</Text>
			<Text style={styles.detailText}>created: {new Date(item.startTimestamp).toLocaleDateString()}</Text>
			<Text style={styles.detailText}>updated: {new Date(item.timestamp).toLocaleDateString()}</Text>

			<View style={{ height: 10 }} />

			<View style={styles.buttonContainer}>
				<Button
					hasTVPreferredFocus
					text='Детали'
					onPress={() => {
						onClose()
						if (typeof item.id === 'number') {
							navigation.push('Movie', { data: { id: item.id, type: item.type } })
						} else {
							ToastAndroid.show(`Детали ${isSeries(item.type) ? 'сериала' : 'фильма'} из IMDB недоступны`, ToastAndroid.SHORT)
							return
						}
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
							newWatchHistoryData.releasedEpisodes = newSeries?.total ?? 1
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
							status: 'new',
							timestamp: Date.now()
						}
						mergeItem({ watchHistory: { [`${item.id}`]: newWatchHistoryData } })
					}}
				/>
				<View style={{ height: 1 }} />
				<Button
					text='Закрыть'
					onPress={() => {
						onClose()
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

	return (
		<Modal isVisible={isVisibleModal} onSwipeComplete={onClose} onBackdropPress={onClose} onBackButtonPress={onClose} swipeDirection={['down']} useNativeDriverForBackdrop style={styles.modal}>
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
