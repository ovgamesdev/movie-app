import { FC } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useActions } from '../hooks/useActions'
import { useAuth } from '../hooks/useAuth'

export const User: FC = () => {
	const { user, isAllScopeAllowed, isLoading } = useAuth()
	const { signInGoogleUser, signOutGoogleUser, addScopeGoogleUser } = useActions()

	if (isLoading) {
		return (
			<View style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: 10 }}>
				<Text style={{ color: '#fff' }}>Loading...</Text>
			</View>
		)
	}

	if (user == null)
		return (
			<Pressable onPress={signInGoogleUser} style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: 10 }}>
				<Text style={{ color: '#fff' }}>Auth with Google</Text>
			</Pressable>
		)

	return (
		<View style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: 10 }}>
			<Text style={{ color: '#fff', marginBottom: 10 }}>{user.user.name}</Text>
			<Pressable onPress={signOutGoogleUser} style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: 10 }}>
				<Text style={{ color: '#fff' }}>signOut</Text>
			</Pressable>
			{!isAllScopeAllowed ? (
				<Pressable onPress={addScopeGoogleUser} style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: 10 }}>
					<Text style={{ color: '#fff' }}>addScope</Text>
				</Pressable>
			) : null}
		</View>
	)
}
