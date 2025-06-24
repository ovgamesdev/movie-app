import { Button, FocusableFlatList, FocusableListRenderItem } from '@components/atoms'
import { ContinueWatchItem } from '@components/molecules'
import { useTypedSelector } from '@hooks'
import { ArrowBackIcon, NavigateNextIcon } from '@icons'
import { navigation } from '@navigation'
import { WatchHistory, WatchHistoryStatus } from '@store/settings'
import React from 'react'
import { FC } from 'react'
import { Platform, TVFocusGuideView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = {
	status: 'all' | WatchHistoryStatus
	title: string
}

export const ContinueWatchItemList: FC<Props> = ({ status, title }) => {
	const { styles, theme } = useStyles(stylesheet)

	const watchHistory = useTypedSelector(state => state.settings.settings.watchHistory)

	const data = Object.values(watchHistory)
		.sort((a, b) => b.timestamp - a.timestamp)
		.filter(it => (status === 'all' ? it : it.status === status))
		.slice(0, 20)

	const isEmpty = data.length === 0

	const renderItem: FocusableListRenderItem<WatchHistory> = ({ item, index, hasTVPreferredFocus, onBlur, onFocus }) => {
		return <ContinueWatchItem data={item} index={index} onFocus={onFocus} onBlur={onBlur} onPress={data => navigation.push('Watch', { data })} onLongPress={data => navigation.push('ItemMenuModal', { data, lookAtHistory: Date.now() })} hasTVPreferredFocus={hasTVPreferredFocus} />
	}

	return (
		<>
			<Button focusable={false} animation='scale' transparent style={{ borderWidth: 0 }} flexDirection='row' onPress={() => navigation.navigate('Bookmarks', { screen: 'History' })}>
				<Text style={styles.button}>{title}</Text>
				{!Platform.isTV && <NavigateNextIcon width={20} height={20} fill={theme.colors.text100} style={styles.buttonIcon} />}
			</Button>
			<TVFocusGuideView autoFocus trapFocusLeft trapFocusRight>
				<FocusableFlatList
					keyExtractor={data => `list_continueWatch_${status}_item_${data.id}`}
					data={data}
					horizontal
					showsHorizontalScrollIndicator={!false}
					contentContainerStyle={{ flexGrow: 1 }}
					renderItem={renderItem}
					ListFooterComponent={
						<>
							{isEmpty ? (
								<View style={{ flexGrow: 1, backgroundColor: theme.colors.bg200, borderRadius: 6, height: 215.5, paddingHorizontal: 30, justifyContent: 'center', alignItems: 'center' }}>
									<Text style={{ color: theme.colors.text100, fontSize: 18, textAlign: 'center', fontWeight: '600' }}>История просмотров пуста</Text>
									<Text style={{ color: theme.colors.text200, fontSize: 15, textAlign: 'center' }}>Начни смотреть, я сохраню место {'\n'}на котором ты остановился.</Text>
								</View>
							) : (
								<Button onPress={() => navigation.navigate('Bookmarks', { screen: 'History' })} animation='scale' flex={0} padding={0} transparent alignItems='center' justifyContent='center' style={styles.skeletonItem}>
									<View style={styles.footerItemIconContainer}>
										<ArrowBackIcon width={30} height={30} fill={theme.colors.text200} rotation={180} />
									</View>
									<Text style={styles.footerItemText}>Показать все</Text>
								</Button>
							)}
						</>
					}
					ListFooterComponentStyle={styles.footerContainer}
				/>
			</TVFocusGuideView>
		</>
	)
}

const stylesheet = createStyleSheet(theme => ({
	button: {
		color: theme.colors.text100,
		fontSize: 14
	},
	buttonIcon: {
		marginLeft: 10
	},
	// FOOTER
	footerContainer: {
		flexGrow: 1
	},
	footerItemIconContainer: {
		borderRadius: 999,
		padding: 10,
		backgroundColor: theme.colors.bg200
	},
	footerItemText: {
		color: theme.colors.text200,
		fontSize: 14,
		paddingTop: 20,
		paddingBottom: 75.5
	},
	footerErrorContainer: {
		backgroundColor: theme.colors.bg200,
		height: 215.5
	},
	footerErrorText: {
		color: theme.colors.text100,
		fontSize: 16,
		paddingHorizontal: 10
	},
	footerErrorDescription: {
		color: theme.colors.text200,
		fontSize: 12,
		paddingHorizontal: 10,
		paddingTop: 5
	},
	// ITEM
	skeletonItem: {
		width: 110,
		height: 215.5
	},
	skeletonImage: {
		height: 140,
		aspectRatio: 667 / 1000,
		backgroundColor: theme.colors.bg200,
		borderRadius: 6
	},
	skeletonDetailContainer: {
		paddingTop: 5
	},
	skeletonDetailTitle: {
		width: '90%',
		height: 14,
		marginTop: 2,
		backgroundColor: theme.colors.bg200
	},
	skeletonDetailDescription: {
		width: '45%',
		height: 12,
		marginTop: 5 + 3,
		backgroundColor: theme.colors.bg200
	}
}))
