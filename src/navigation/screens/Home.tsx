import { Button } from '@components/atoms'
import { useNavigation } from '@hooks'
import { useEffect, useRef, useState } from 'react'
import { FlatList, Platform, TVFocusGuideView, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface IData {
	id: number
}

export const Home = () => {
	const navigation = useNavigation()
	const insets = useSafeAreaInsets()

	const focusedItem = useRef<{ index: number }>({ index: -1 })
	const [refreshFocusedItem, setRefreshFocusedItem] = useState(-1)

	const [data] = useState<IData[]>([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }])

	const _renderItem = ({ item, index }: { item: IData; index: number }) => {
		return <Button text={`to movie ${item.id}`} onPress={() => navigation.push('Movie', { data: item })} hasTVPreferredFocus={index === refreshFocusedItem} onFocus={() => (focusedItem.current = { index })} />
	}

	useEffect(() => {
		if (!Platform.isTV) return

		const listenerFocus = navigation.addListener('focus', () => setRefreshFocusedItem(focusedItem.current.index))
		const listenerBlur = navigation.addListener('blur', () => setRefreshFocusedItem(-1))

		return () => {
			listenerFocus()
			listenerBlur()
		}
	}, [focusedItem.current, navigation])

	return (
		<TVFocusGuideView style={{ flex: 1, padding: 10, marginTop: insets.top }} trapFocusLeft trapFocusRight trapFocusUp>
			<Text>focused: {refreshFocusedItem}</Text>

			<FlatList data={data} renderItem={_renderItem} keyExtractor={item => `movie_${item.id}`} contentContainerStyle={{ gap: 5 }} />
		</TVFocusGuideView>
	)
}
