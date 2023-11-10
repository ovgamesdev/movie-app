import { Button } from '@components/atoms'
import { useNavigation } from '@hooks'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const Home = () => {
	const navigation = useNavigation()
	const insets = useSafeAreaInsets()

	return (
		<View style={{ flex: 1, padding: 10, marginTop: insets.top, gap: 5 }}>
			<Button text='to movie 1' onPress={() => navigation.push('Movie', { data: { id: 1 } })} />
			<Button text='to movie 2' onPress={() => navigation.push('Movie', { data: { id: 2 } })} />
			<Button text='to movie 3' onPress={() => navigation.push('Movie', { data: { id: 3 } })} />
			<Button text='to movie 4' onPress={() => navigation.push('Movie', { data: { id: 4 } })} />
			<Button text='to movie 5' onPress={() => navigation.push('Movie', { data: { id: 5 } })} />
		</View>
	)
}
