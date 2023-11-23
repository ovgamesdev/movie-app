import { User } from '@react-native-google-signin/google-signin'

export interface IInitialStateAuth {
	user: User | null
	isLoading: boolean
	isAllScopeAllowed: boolean
}
