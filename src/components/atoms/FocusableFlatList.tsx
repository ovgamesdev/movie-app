import { useNavigation } from '@hooks'
import React, { useEffect, useRef, useState } from 'react'
import { FlatList, FlatListProps, Platform } from 'react-native'

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
export type FocusableListRenderItem<ItemT> = (info: FocusableListRenderItemInfo<ItemT>) => React.ReactElement | null

export const FocusableFlatList = <ItemT,>({ renderItem, ...props }: Omit<FlatListProps<ItemT>, 'renderItem'> & { renderItem: FocusableListRenderItem<ItemT> | null | undefined }) => {
	const navigation = useNavigation()

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

	const handleOnFocus = ({ index }: { index: number }) => {
		// if (props.data && index < props.data.length) {
		// 	TODO add scrollToIndex
		// 	ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })
		// }

		focusedItem.current = { index }
	}

	const handleOnBlur = () => {
		focusedItem.current = { index: -1 }
	}

	return (
		<FlatList
			{...props}
			ref={ref}
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
