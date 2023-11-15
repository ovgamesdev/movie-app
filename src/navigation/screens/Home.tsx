import { SlugItemList } from '@components/organisms'
import { useNavigation, useTheme } from '@hooks'
import { TVFocusGuideView, Text } from 'react-native'
import Config from 'react-native-config'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const Home = () => {
	const insets = useSafeAreaInsets()
	const { colors } = useTheme()

	return (
		<TVFocusGuideView style={{ flex: 1, padding: 10, marginTop: insets.top }} trapFocusLeft trapFocusRight trapFocusUp>
			<Text style={{ color: colors.text100, paddingBottom: 10 }}>isTv: {String(Config.UI_MODE === 'tv')}</Text>

			<SlugItemList slug='popular-films' title='Популярные фильмы' />
			<SlugItemList slug='popular-series' title='Популярные сериалы' />
		</TVFocusGuideView>
	)
}
