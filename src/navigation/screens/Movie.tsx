import { Button } from '@components/atoms'
import { useTheme } from '@hooks'
import { RootStackParamList } from '@navigation'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = NativeStackScreenProps<RootStackParamList, 'Movie'>

export const Movie = ({ navigation, route }: Props) => {
	const { data } = route.params
	const insets = useSafeAreaInsets()
	const { colors } = useTheme()

	return (
		<View style={{ flex: 1, marginTop: 0, marginBottom: 0 }}>
			<ScrollView contentContainerStyle={{ padding: 10 }}>
				<View style={{ paddingTop: insets.top, paddingBottom: 5 }}>
					<Text style={{ color: colors.text100 }}>Movie {data.id}</Text>
					<Button text='watch' onPress={() => navigation.navigate('Watch', { data })} />
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
		</View>
	)
}
