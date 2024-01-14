import { ContinueWatchItemList, SlugItemList } from '@components/organisms'
import { ScrollView, TVFocusGuideView, Text } from 'react-native'
import Config from 'react-native-config'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const Home = () => {
	const insets = useSafeAreaInsets()
	const { styles } = useStyles(stylesheet)

	return (
		<TVFocusGuideView style={styles.container} trapFocusLeft trapFocusRight trapFocusUp>
			<ScrollView contentContainerStyle={{ ...styles.scrollViewContainer, paddingTop: 10 + insets.top }}>
				<Text style={styles.devText}>isTv: {String(Config.UI_MODE === 'tv')}</Text>

				<ContinueWatchItemList status='watch' title='Продолжить просмотр' />
				<SlugItemList slug='popular-films' title='Популярные фильмы' />
				<SlugItemList slug='popular-series' title='Популярные сериалы' />
			</ScrollView>
		</TVFocusGuideView>
	)
}

const stylesheet = createStyleSheet(theme => ({
	container: {
		flex: 1
	},
	scrollViewContainer: {
		padding: 10
	},
	devText: {
		color: theme.colors.text100,
		paddingBottom: 10
	}
}))
