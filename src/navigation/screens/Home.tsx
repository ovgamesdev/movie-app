import { ContinueWatchItemList, OttTop10Monthly, SlugItemList, TopItemsAllList } from '@components/organisms'
import { useTypedSelector } from '@hooks'
import { useScrollToTop } from '@react-navigation/native'
import { useRef } from 'react'
import { ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import Config from 'react-native-config'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const Home = () => {
	const insets = useSafeAreaInsets()
	const { styles } = useStyles(stylesheet)
	const ref = useRef<ScrollView>(null)

	const showDevOptions = useTypedSelector(state => state.settings.settings.showDevOptions)

	useScrollToTop(ref)

	return (
		<TVFocusGuideView style={styles.container} trapFocusLeft trapFocusRight trapFocusUp>
			{showDevOptions && (
				<View style={{ marginTop: 5 + insets.top, marginLeft: 5, padding: 5, position: 'absolute', zIndex: 999, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 6 }}>
					<Text style={styles.devText}>isTv: {String(Config.UI_MODE === 'tv')}</Text>
				</View>
			)}
			<ScrollView ref={ref}>
				<OttTop10Monthly />

				<View style={styles.scrollViewContainer}>
					<ContinueWatchItemList status='watch' title='Продолжить просмотр' />
					<TopItemsAllList />
					<SlugItemList slug='popular-films' title='Популярные фильмы' />
					<SlugItemList slug='popular-series' title='Популярные сериалы' />
				</View>
			</ScrollView>
		</TVFocusGuideView>
	)
}

const stylesheet = createStyleSheet({
	container: {
		flex: 1
	},
	scrollViewContainer: {
		padding: 10
	},
	devText: {
		color: 'rgba(255,255,255,0.65)'
	}
})
