import { RootStackParamList } from '@navigation'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TabNavigator } from './TabNavigator'
import { Movie, MovieListSlug, Watch } from './screens'

const Stack = createNativeStackNavigator<RootStackParamList>()

export const StackNavigator = () => {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name='Home' component={TabNavigator} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true }} />
			<Stack.Screen name='Movie' component={Movie} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true }} />
			<Stack.Screen name='Watch' component={Watch} options={{ orientation: 'landscape', statusBarHidden: true }} />
			<Stack.Screen name='MovieListSlug' component={MovieListSlug} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true }} />
		</Stack.Navigator>
	)
}
