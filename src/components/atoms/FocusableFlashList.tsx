import { useNavigation } from '@hooks'
import { AnimatedFlashList, FlashList, FlashListProps } from '@shopify/flash-list'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'

interface FocusableListRenderItemInfo<ItemT> {
	item: ItemT
	index: number

	// separators: {
	// 	highlight: () => void
	// 	unhighlight: () => void
	// 	updateProps: (select: 'leading' | 'trailing', newProps: any) => void
	// }

	hasTVPreferredFocus: boolean
	onFocus: () => void
	onBlur: () => void
}

// TODO movie to types
export type FocusableFlashListRenderItem<ItemT> = (info: FocusableListRenderItemInfo<ItemT>) => ReactElement | null

export const FocusableFlashList = <ItemT,>({ renderItem, animated, ...props }: Omit<FlashListProps<ItemT>, 'renderItem'> & { renderItem: FocusableFlashListRenderItem<ItemT> | null | undefined; animated?: boolean }) => {
	const navigation = useNavigation()

	const ref = useRef<FlashList<ItemT>>(null)
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

	const FL = animated ? AnimatedFlashList : FlashList

	return (
		<FL
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
