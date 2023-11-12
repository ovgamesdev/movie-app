import { Button } from '@components/atoms'
import { useNavigation, useTheme } from '@hooks'
import { useEffect, useRef, useState } from 'react'
import { FlatList, Platform, TVFocusGuideView, Text } from 'react-native'
import Config from 'react-native-config'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface IData {
	id: number
}

export const Home = () => {
	const navigation = useNavigation()
	const insets = useSafeAreaInsets()
	const { colors } = useTheme()

	const focusedItem = useRef<{ index: number }>({ index: -1 })
	const [refreshFocusedItem, setRefreshFocusedItem] = useState({ focus: { index: -1 }, blur: { index: -1 } })

	const [data] = useState<IData[]>([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }])

	const _renderItem = ({ item, index }: { item: IData; index: number }) => {
		return <Button text={`to movie ${item.id}`} onPress={() => navigation.push('Movie', { data: item })} hasTVPreferredFocus={index === refreshFocusedItem.focus.index} onFocus={() => (focusedItem.current = { index })} onBlur={() => (focusedItem.current = { index: -1 })} />
	}

	useEffect(() => {
		if (!Platform.isTV) return

		const listenerFocus = navigation.addListener('focus', () => setRefreshFocusedItem(it => ({ focus: it.blur, blur: { index: -1 } })))
		const listenerBlur = navigation.addListener('blur', () => setRefreshFocusedItem({ focus: { index: -1 }, blur: focusedItem.current }))

		return () => {
			listenerFocus()
			listenerBlur()
		}
	}, [focusedItem.current, navigation])

	return (
		<TVFocusGuideView style={{ flex: 1, padding: 10, marginTop: insets.top }} trapFocusLeft trapFocusRight trapFocusUp>
			<Text style={{ color: colors.text100, paddingBottom: 10 }}>
				focus: {refreshFocusedItem.focus.index} | blur: {refreshFocusedItem.blur.index} | isTv: {String(Config.UI_MODE === 'tv')}
			</Text>

			<FlatList data={data} renderItem={_renderItem} keyExtractor={item => `movie_${item.id}`} contentContainerStyle={{ gap: 5 }} />
		</TVFocusGuideView>
	)
}
