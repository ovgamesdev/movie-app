import { useNavigation } from '@hooks'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, FlatList, FlatListProps, Platform } from 'react-native'

interface FocusableListRenderItemInfo<ItemT> {
	item: ItemT
	index: number

	separators: {
		highlight: () => void
		unhighlight: () => void
		updateProps: (select: 'leading' | 'trailing', newProps: any) => void
	}

	hasTVPreferredFocus: boolean
	onFocus: () => void
	onBlur: () => void
}

// TODO movie to types
export type AutoFocusableListRenderItem<ItemT> = (info: FocusableListRenderItemInfo<ItemT>) => React.ReactElement | null

export const AutoScrollFlatList = <ItemT,>({ renderItem, animated, autoScroll, data, ...props }: Omit<FlatListProps<ItemT>, 'renderItem'> & { renderItem: AutoFocusableListRenderItem<ItemT> | null | undefined; animated?: boolean; autoScroll?: number }) => {
	const navigation = useNavigation()
	const window = Dimensions.get('window')

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

	const scrollIndex = useRef<number>(0)
	const scrollInterval = useRef<NodeJS.Timer | null>(null)
	const totalIndex = data ? data.length - 1 : 1

	useEffect(() => {
		if (!data || data.length <= 1 || !autoScroll) return

		scrollInterval.current = setInterval(() => {
			scrollIndex.current++
			if (scrollIndex.current < totalIndex) {
				ref.current?.scrollToIndex({ animated: true, index: scrollIndex.current })
			} else {
				ref.current?.scrollToIndex({ animated: true, index: 0 })
			}
		}, autoScroll)

		return () => {
			scrollInterval.current && clearInterval(scrollInterval.current)
		}
	}, [autoScroll, data])

	const handleOnFocus = ({ index }: { index: number }) => {
		// if (data && index < data.length) {
		// 	TODO add scrollToIndex
		// 	ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })
		// }

		focusedItem.current = { index }
	}

	const handleOnBlur = () => {
		focusedItem.current = { index: -1 }
	}

	const FL = animated ? Animated.FlatList : FlatList

	const autoScrollData = autoScroll
		? {
				//
				onScroll: (e: any) => {
					scrollIndex.current = Math.round((e.nativeEvent.contentOffset.x || 0) / window.width)

					props.onScroll?.(e)
				},
				onScrollBeginDrag: (e: any) => {
					scrollInterval.current && clearInterval(scrollInterval.current)

					props.onScrollBeginDrag?.(e)
				},
				onScrollEndDrag: (e: any) => {
					scrollInterval.current = setInterval(() => {
						scrollIndex.current++
						if (scrollIndex.current < totalIndex) {
							ref.current?.scrollToIndex({ animated: true, index: scrollIndex.current })
						} else {
							ref.current?.scrollToIndex({ animated: true, index: 0 })
						}
					}, autoScroll)

					props.onScrollEndDrag?.(e)
				}
		  }
		: {}

	return (
		<FL
			{...props}
			data={data as (Animated.WithAnimatedObject<ItemT> & { length: number }) | null | undefined}
			ref={ref}
			{...autoScrollData}
			renderItem={
				renderItem
					? item =>
							renderItem({
								...item,
								hasTVPreferredFocus: item.index === refreshFocusedItem.focus.index,
								onFocus: () => handleOnFocus({ index: item.index }),
								onBlur: handleOnBlur
							})
					: undefined
			}
		/>
	)
}
