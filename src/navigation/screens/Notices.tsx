import { Button, FocusableFlashList, FocusableFlashListRenderItem, FocusableFlashListType, ImageBackground } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { HomeTabParamList, navigation } from '@navigation'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { useScrollToTop } from '@react-navigation/native'
import { NoticesItem } from '@store/notices'
import { WatchHistory } from '@store/settings'
import { getTimeAgo, newSeriesToString } from '@utils'
import { FC, useCallback, useEffect, useMemo, useRef } from 'react'
import { AppState, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = BottomTabScreenProps<HomeTabParamList, 'Notices'>

export const Notices: FC<Props> = ({ navigation: nav }) => {
	const insets = useSafeAreaInsets()
	const { styles, theme } = useStyles(stylesheet)
	const { setReadNotices } = useActions()

	const notifications = useTypedSelector(state => state.notices.notifications)
	const watchHistory = useTypedSelector(state => state.settings.settings.watchHistory)

	const ref = useRef<FocusableFlashListType>(null)

	const data = useMemo(() => notifications.filter(it => !!(watchHistory[`${it.data.id}`] as WatchHistory | undefined)), [notifications, watchHistory])

	const subscribe = useCallback(() => {
		const subscription = AppState.addEventListener('change', nextAppState => {
			if (nextAppState !== 'active') {
				setReadNotices()
			}
		})

		const unsubscribe = nav.addListener('blur', () => setReadNotices())

		return () => {
			subscription.remove()
			unsubscribe()
		}
	}, [])

	useEffect(subscribe, [])

	const renderItem: FocusableFlashListRenderItem<NoticesItem> = useCallback(
		({ item, index, hasTVPreferredFocus, onBlur, onFocus }) => {
			return (
				<>
					{index !== 0 && <View style={{ borderTopWidth: 1, borderColor: theme.colors.bg300 }} />}
					<Button
						animation='scale'
						transparent
						flexDirection='row'
						paddingHorizontal={0}
						paddingVertical={10}
						onFocus={onFocus}
						onBlur={onBlur}
						onLongPress={() => {
							navigation.push('ItemMenuModal', { data: watchHistory[`${item.data.id}`], lookAtHistory: Date.now() })
						}}
						onPress={() => navigation.navigate('Watch', { data: { id: item.data.id, type: item.data.type } })}
						hasTVPreferredFocus={hasTVPreferredFocus}>
						<ImageBackground source={{ uri: item.poster }} style={{ height: 120, aspectRatio: 667 / 1000 }} borderRadius={6} />
						<View style={{ marginLeft: 20, flex: 1, minHeight: 92, maxHeight: 120 }}>
							<Text style={{ fontSize: 18, fontWeight: '500', lineHeight: 22, color: theme.colors.text100, marginBottom: 4 }} numberOfLines={2}>
								{item.data.title || item.title}
							</Text>

							<Text style={{ fontSize: 13, fontWeight: '400', lineHeight: 16, color: theme.colors.text200 }} numberOfLines={4}>
								{[getTimeAgo(item.timestamp), item.data.newSeries ? newSeriesToString(item.data.newSeries)?.replaceAll('(', '').replaceAll(')', '') : null].filter(it => !!it).join(' • ')}
							</Text>
						</View>
						{!item.read && (
							<View style={{ position: 'absolute', right: 0, top: 10 }}>
								<View style={{ width: 8, height: 8, marginRight: 6, marginTop: 6, backgroundColor: 'red', borderRadius: 99 }} />
							</View>
						)}
					</Button>
				</>
			)
		},
		[theme]
	)

	const keyExtractor = useCallback((item: NoticesItem) => `${item.timestamp}_${item.id}`, [])

	useScrollToTop(
		useRef({
			scrollToTop: () => {
				ref.current?.scrollToOffset({ offset: 0, animated: true })
			}
		})
	)

	return (
		<TVFocusGuideView style={styles.container} trapFocusLeft trapFocusRight trapFocusUp>
			<FocusableFlashList
				ref={ref}
				data={data}
				keyExtractor={keyExtractor}
				renderItem={renderItem}
				estimatedItemSize={146}
				bounces={false}
				overScrollMode='never'
				contentContainerStyle={{ ...styles.contentContainer, paddingTop: insets.top }}
				// ListEmptyComponent={ListEmptyComponent}
				animated
				// onScroll={handleOnScroll}
				//
			/>
			{/* <Input onChangeText={text => navigation.setOptions({ tabBarBadge: text === '' ? undefined : text })} /> */}
		</TVFocusGuideView>
	)
}

const stylesheet = createStyleSheet(theme => ({
	container: {
		flex: 1,
		marginTop: 0,
		marginBottom: 0
	},
	contentContainer: {
		padding: 10,
		paddingBottom: 0
		// flexGrow: 1
	},
	emptyContainer: {
		padding: 10,
		paddingHorizontal: 30,
		paddingTop: 57
	},
	emptyTitle: {
		color: theme.colors.text100,
		fontSize: 18,
		textAlign: 'center',
		fontWeight: '600'
	},
	emptyDescription: {
		color: theme.colors.text200,
		fontSize: 15,
		textAlign: 'center'
	}
}))
