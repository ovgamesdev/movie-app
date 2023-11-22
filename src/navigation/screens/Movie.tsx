import { Button } from '@components/atoms'
import { useTheme, useTypedSelector } from '@hooks'
import { RootStackParamList } from '@navigation'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = NativeStackScreenProps<RootStackParamList, 'Movie'>

export const Movie = ({ navigation, route }: Props) => {
	const { data } = route.params
	const insets = useSafeAreaInsets()
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)
	const { colors } = useTheme()

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 10 + (isShowNetInfo ? 0 : insets.bottom) }}>
				<View style={{ paddingTop: insets.top, paddingBottom: 5 }}>
					<Text style={{ color: colors.text100 }}>Movie {data.id}</Text>
					<Button text='watch' onPress={() => navigation.navigate('Watch', { data })} hasTVPreferredFocus />
				</View>
				<View style={{ gap: 5 }}>
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
					<Button text='back' onPress={() => navigation.pop()} />
				</View>
			</ScrollView>
		</TVFocusGuideView>
	)
}
