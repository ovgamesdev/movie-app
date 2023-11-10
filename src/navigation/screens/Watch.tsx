import { Button } from '@components/atoms'
import { useTheme } from '@hooks'
import { RootStackParamList } from '@navigation'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Text, View } from 'react-native'

type Props = NativeStackScreenProps<RootStackParamList, 'Watch'>

export const Watch = ({ navigation, route }: Props) => {
	const { data } = route.params
	const { colors } = useTheme()

	return (
		<View style={{ flex: 1, padding: 10 }}>
			<Text style={{ color: colors.text100 }}>Watch</Text>

			<Button text='back' onPress={() => navigation.pop()} />
		</View>
	)
}
