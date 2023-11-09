import { useTypedSelector } from '@hooks'

export const useAuth = () => {
	const auth = useTypedSelector(state => state.auth)

	return auth
}
