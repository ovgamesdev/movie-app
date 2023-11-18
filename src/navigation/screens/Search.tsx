import { Button } from '@components/atoms'
import { useTheme } from '@hooks'
import { HomeTabParamList } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = NativeStackScreenProps<HomeTabParamList, 'Search'>

export const Search = ({ navigation, route }: Props) => {
	const defaultFilters = route.params?.data ?? {}

	const insets = useSafeAreaInsets()
	const { colors } = useTheme()

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 10 + insets.bottom }}>
				<View style={{ paddingTop: insets.top, paddingBottom: 5 }}>
					<Text style={{ color: colors.text100 }}>Search</Text>
					<Button text='watch' onPress={() => {}} hasTVPreferredFocus />
				</View>
			</ScrollView>
		</TVFocusGuideView>
	)
}
