import { Button, Input, InputProps } from '@components/atoms'
import { fetchNewSeries, useActions, useTypedSelector } from '@hooks'
import { navigation } from '@navigation'
import { WatchHistory } from '@store/settings'
import { isSeries } from '@utils'
import { FC, memo, useRef, useState } from 'react'
import { Dimensions, ScrollView, Text, ToastAndroid, View, useWindowDimensions } from 'react-native'
import Modal from 'react-native-modal'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface Props {
	item: WatchHistory
}

const ModalContent = memo<Props>(({ item }) => {
	const { removeItemByPath, mergeItem, isBatteryOptimizationEnabled, setItemHiddenModal } = useActions()
	const { styles } = useStyles(stylesheet)

	const showDevOptions = useTypedSelector(state => state.settings.settings.showDevOptions)

	const [showTranslations, setShowTranslations] = useState<string[] | null>(null)
	const [isLoadingTranslations, setIsLoadingTranslations] = useState<boolean>(false)

	const [changeTime, setChangeTime] = useState<'create' | 'update' | null>(null)

	const windowDimensions = useWindowDimensions()

	const onClose = () => {
		setItemHiddenModal()
	}

	const loadTranslations = async () => {
		setIsLoadingTranslations(true)

		const newSeries = await fetchNewSeries(item)
		if (newSeries && newSeries.translations.length > 0) {
			setShowTranslations(newSeries.translations)
			setIsLoadingTranslations(false)
		} else {
			const newWatchHistoryData: Partial<WatchHistory> = {
				notify: !item.notify
			}

			if (newWatchHistoryData.notify) {
				if (newSeries && newSeries.total > 0) {
					newWatchHistoryData.releasedEpisodes = newSeries.total
				}
			} else {
				newWatchHistoryData.notifyTranslation = null
			}

			onClose()

			mergeItem({ watchHistory: { [`${item.id}`]: newWatchHistoryData } })
			isBatteryOptimizationEnabled()
		}
	}

	const selectTranslation = async (translation: string | null) => {
		setIsLoadingTranslations(true)

		const newWatchHistoryData: Partial<WatchHistory> = {
			notify: !item.notify
		}

		if (newWatchHistoryData.notify) {
			const newSeries = await fetchNewSeries({ ...item, notifyTranslation: translation })
			if (newSeries && newSeries.total > 0) {
				newWatchHistoryData.releasedEpisodes = newSeries.total
				newWatchHistoryData.notifyTranslation = translation
			}
		} else {
			newWatchHistoryData.notifyTranslation = null
		}

		onClose()

		mergeItem({ watchHistory: { [`${item.id}`]: newWatchHistoryData } })
		isBatteryOptimizationEnabled()
	}

	// Translations
	if (isLoadingTranslations) {
		return (
			<View style={styles.container}>
				<View style={styles.header} />
				<Text style={styles.title}>«{item.title}»</Text>

				<Text style={styles.detailText}>loading..</Text>
			</View>
		)
	}
	if (showTranslations !== null) {
		return (
			<View style={styles.container}>
				<View style={styles.header} />
				<Text style={styles.title}>«{item.title}»</Text>

				<Text style={styles.detailText}>Выберите озвучку:</Text>
				<View style={{ maxHeight: Dimensions.get('window').height / 2 }}>
					<ScrollView contentContainerStyle={{ gap: 5 }}>
						{showTranslations.map(translation => (
							<Button key={translation} text={translation} onPress={async () => selectTranslation(translation)} />
						))}
					</ScrollView>
				</View>
				<View style={{ height: 10 }} />
				<Button text='Все озвучки' onPress={async () => selectTranslation(null)} />
			</View>
		)
	}

	// Time
	if (changeTime) {
		return (
			<View style={styles.container}>
				<View style={styles.header} />
				<Text style={styles.title}>«{item.title}»</Text>

				<Text style={styles.detailText}>Изменить время {changeTime}</Text>

				<DateInput
					onSubmitEditing={value => {
						const date = new Date(value)
						const timestamp = date.getTime()

						if (isNaN(timestamp)) {
							ToastAndroid.show(`Это не похоже на дату.`, ToastAndroid.SHORT)
							return
						}

						onClose()
						const newWatchHistoryData: Partial<WatchHistory> = {
							[changeTime === 'create' ? 'startTimestamp' : 'timestamp']: timestamp
						}

						mergeItem({ watchHistory: { [`${item.id}`]: newWatchHistoryData } })

						ToastAndroid.show(`Дата для ${isSeries(item.type) ? 'сериала' : 'фильма'} была изменена на ${date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })}.`, ToastAndroid.SHORT)
					}}
				/>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<View style={styles.header} />
			<Text style={styles.title} selectable>
				«{item.title}»
			</Text>
			<ScrollView style={{ maxHeight: windowDimensions.height - 100 }}>
				{showDevOptions && (
					<Text style={styles.detailText} selectable>
						id: {item.id}
					</Text>
				)}
				<Text style={styles.detailText}>created: {new Date(item.startTimestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</Text>
				<Text style={styles.detailText}>updated: {new Date(item.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</Text>
				{showDevOptions && item.notify && (
					<View>
						<Text style={styles.detailText}>notifyTranslation: {item.notifyTranslation ?? 'Все'}</Text>
						<Text style={styles.detailText}>releasedEpisodes: {item.releasedEpisodes ?? 'Нет'}</Text>
					</View>
				)}

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
						onPress={
							isSeries(item.type) && !item.notify
								? loadTranslations
								: async () => {
										onClose()
										const newWatchHistoryData: Partial<WatchHistory> = {
											notify: !item.notify
										}

										if (newWatchHistoryData.notify) {
											const newSeries = await fetchNewSeries(item)
											if (newSeries && newSeries.total > 0) {
												newWatchHistoryData.releasedEpisodes = newSeries.total
											}
										} else {
											newWatchHistoryData.notifyTranslation = null
										}

										mergeItem({ watchHistory: { [`${item.id}`]: newWatchHistoryData } })
										isBatteryOptimizationEnabled()
								  }
						}
					/>
					<View style={{ flexDirection: 'row', gap: 10 }}>
						<Button text='Изменить created' flex={1} onPress={() => setChangeTime('create')} />
						<Button text='Изменить updated' flex={1} onPress={() => setChangeTime('update')} />
					</View>
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

							if (item.notify) {
								newWatchHistoryData.notify = false
								newWatchHistoryData.notifyTranslation = null
							}

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
			</ScrollView>
		</View>
	)
})

const DateInput: FC<{ onChange?: (value: string) => void; onSubmitEditing: (value: string) => void } & Omit<InputProps, 'onChange' | 'onSubmitEditing'>> = ({ onChange, onSubmitEditing, ...props }) => {
	const [value, setValue] = useState('')
	const [date, setDate] = useState<Date | null>(null)

	const dateNow = useRef(new Date()).current

	return (
		<View style={{ gap: 5 }}>
			<Text>дата: {date && !isNaN(date.getTime()) ? date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' }) : 'Ошибка преобразования даты'}</Text>
			<Text>дата в формате: {dateNow.toISOString()}</Text>
			<Input
				value={value}
				onChangeText={setValue}
				onChange={e => {
					onChange?.(e.nativeEvent.text)
					setDate(new Date(e.nativeEvent.text))
				}}
				onSubmitEditing={e => onSubmitEditing(e.nativeEvent.text)}
				placeholder=''
				{...props}
			/>
		</View>
	)
}

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
