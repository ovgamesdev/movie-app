import { Button } from '@components/atoms'
import { useTypedSelector } from '@hooks'
import { BookmarksTabParamList } from '@navigation'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { FC } from 'react'
import { Dimensions, TVFocusGuideView, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface Props {
	activeTab: keyof BookmarksTabParamList
	setActiveTab: (tab: keyof BookmarksTabParamList) => void
}

export const TabBarTv: FC<Props> = ({ activeTab, setActiveTab }) => {
	const insets = useSafeAreaInsets()
	const bottomTabBarHeight = useBottomTabBarHeight()
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)
	const { styles } = useStyles(stylesheet)

	const tabWidth = Dimensions.get('window').width / 2 // 120

	const tabs: Record<keyof BookmarksTabParamList, string> = {
		Favorites: 'Избранное',
		History: 'История'
	}

	const objectTabs = Object.values(tabs)
	const objectTabKeys = Object.keys(tabs) as (keyof BookmarksTabParamList)[]

	return (
		<TVFocusGuideView autoFocus trapFocusLeft trapFocusRight style={{ ...styles.container, marginTop: insets.top }}>
			{objectTabs.map((tab, index) => {
				const key = objectTabKeys[index]
				const isActive = key === activeTab

				return (
					<Button key={index} onPress={() => !isActive && setActiveTab(key)} isActive={isActive} padding={0} alignItems='center' justifyContent='center' style={{ width: tabWidth, height: bottomTabBarHeight + 2 - (isShowNetInfo ? 0 : insets.bottom) }} transparent>
						<Text style={styles.text(isActive)}>{tab}</Text>
					</Button>
				)
			})}
		</TVFocusGuideView>
	)
}

const stylesheet = createStyleSheet(theme => ({
	container: {
		flexDirection: 'row',
		borderBottomColor: theme.colors.bg300,
		borderBottomWidth: 1
	},
	text: (isActive: boolean) => ({
		color: isActive ? theme.colors.text100 : theme.colors.text200,
		fontSize: 14,
		textAlign: 'center'
	})
}))
