import type { FC } from 'react'
import { ScrollView, TVFocusGuideView, Text, View } from 'react-native'

export const Favorites: FC = () => {
	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight>
			<ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
				<View style={{ flexDirection: 'row', padding: 10, paddingBottom: 5, paddingTop: 10, gap: 20 }}>
					<Text>Favorites</Text>
				</View>
			</ScrollView>
		</TVFocusGuideView>
	)
}
