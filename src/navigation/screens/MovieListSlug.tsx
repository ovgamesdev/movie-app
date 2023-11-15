import { Button } from '@components/atoms'
import { useInfiniteScroll, useTheme } from '@hooks'
import { RootStackParamList } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Platform, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGetListBySlugQuery } from '../../store/kinopoisk/kinopoisk.api'
import { IGraphqlMovie } from '../../store/kinopoisk/types'

type Props = NativeStackScreenProps<RootStackParamList, 'MovieListSlug'>

export const MovieListSlug = ({ navigation, route }: Props) => {
	const { slug } = route.params.data

	const insets = useSafeAreaInsets()
	const { colors } = useTheme()
	const ref = useRef<FlatList>(null)
	const focusedItem = useRef<{ index: number }>({ index: -1 })
	const [refreshFocusedItem, setRefreshFocusedItem] = useState({ focus: { index: -1 }, blur: { index: -1 } })

	useEffect(() => {
		if (!Platform.isTV) return

		const listenerFocus = navigation.addListener('focus', () => setRefreshFocusedItem(it => ({ focus: it.blur, blur: { index: -1 } })))
		const listenerBlur = navigation.addListener('blur', () => setRefreshFocusedItem({ focus: { index: -1 }, blur: focusedItem.current }))

		return () => {
			listenerFocus()
			listenerBlur()
		}
	}, [focusedItem.current, navigation])

	const { isFetching, data, readMore } = useInfiniteScroll<{ movie: IGraphqlMovie; positionDiff: number }>(useGetListBySlugQuery, { limit: 50, slug })
	const isEmpty = data.length === 0

	const handleOnFocus = ({ index }: { index: number }) => {
		if (index < data.length) {
			ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })
		}

		focusedItem.current = { index }

		if (!isFetching && index > data.length - 1 - 10) {
			readMore()
		}
	}

	const handleOnBlur = () => {
		focusedItem.current = { index: -1 }
	}

	const handleScrollEnd = () => {
		if (!isFetching) {
			readMore()
		}
	}

	const renderItem = ({ item, index }: { item: { movie: IGraphqlMovie; positionDiff: number }; index: number }) => {
		return <Button text={`${index + 1} (${item.positionDiff}) ${item.movie.title.russian}`} onFocus={() => handleOnFocus({ index })} onBlur={handleOnBlur} onPress={() => navigation.push('Movie', { data: { id: item.movie.id } })} hasTVPreferredFocus={index === refreshFocusedItem.focus.index} />
		// return <SlugItem data={item.movie} index={index} onFocus={handleOnFocus} onBlur={handleOnBlur} onPress={data => navigation.push('Movie', { data })} hasTVPreferredFocus={index === refreshFocusedItem.focus.index} />
	}

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} autoFocus trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<FlatList
				keyExtractor={data => `list_${slug}_item_${data.movie.id}`}
				ref={ref}
				data={data}
				showsHorizontalScrollIndicator={!false}
				onEndReached={handleScrollEnd}
				onEndReachedThreshold={1}
				contentContainerStyle={{ padding: 10, paddingBottom: 10 + insets.bottom, flexGrow: 1 }}
				renderItem={renderItem}
				ListEmptyComponent={
					isFetching ? null : (
						<View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', flexGrow: isEmpty ? 1 : undefined, backgroundColor: colors.bg200, borderRadius: 6, padding: 5 }}>
							<Text style={{ textAlign: 'center', color: colors.text100 }}>Лист пуст</Text>
							{/* <Text style={{ textAlign: 'center', color: colors.text200 }}></Text> */}
						</View>
					)
				}
				ListFooterComponent={
					!isFetching ? null : (
						<View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', flexGrow: isEmpty ? 1 : undefined, backgroundColor: isEmpty ? colors.bg200 : undefined, borderRadius: 6, padding: 5 }}>
							<ActivityIndicator size={!isEmpty ? 'large' : 'small'} color={colors.text200} style={{ padding: 10 }} />
						</View>
					)
				}
				ListFooterComponentStyle={{ flexGrow: 1 }}
				ListHeaderComponent={<Button text='back' onPress={() => navigation.pop()} />}
				ListHeaderComponentStyle={{ marginTop: insets.top, marginBottom: 5 }}
			/>
		</TVFocusGuideView>
	)
}
