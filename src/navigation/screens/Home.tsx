import { SlugItemList } from '@components/organisms'
import { useTheme } from '@hooks'
import { ScrollView, TVFocusGuideView, Text } from 'react-native'
import Config from 'react-native-config'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const Home = () => {
	const insets = useSafeAreaInsets()
	const { colors } = useTheme()

	return (
		<TVFocusGuideView style={{ flex: 1 }} trapFocusLeft trapFocusRight trapFocusUp>
			<ScrollView contentContainerStyle={{ padding: 10, paddingTop: 10 + insets.top }}>
				<Text style={{ color: colors.text100, paddingBottom: 10 }}>isTv: {String(Config.UI_MODE === 'tv')}</Text>

				<SlugItemList slug='popular-films' title='Популярные фильмы' />
				<SlugItemList slug='popular-series' title='Популярные сериалы' />
			</ScrollView>
		</TVFocusGuideView>
	)
}
