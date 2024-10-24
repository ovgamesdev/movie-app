import { HomeTabParamList, RootStackParamList } from '@navigation'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { CompositeNavigationProp, useNavigation as useNav } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

type NavigationProps = CompositeNavigationProp<NativeStackNavigationProp<RootStackParamList>, BottomTabNavigationProp<HomeTabParamList>>

export const useNavigation = useNav<NavigationProps>
