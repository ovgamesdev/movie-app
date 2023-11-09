import { FC } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useActions } from '../hooks/useActions'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

export const User: FC = () => {
	const { user, isAllScopeAllowed, isLoading } = useAuth()
	const { signInGoogleUser, signOutGoogleUser, addScopeGoogleUser } = useActions()
	const { colors } = useTheme()

	if (isLoading) {
		return (
			<View style={{ backgroundColor: colors.bg200, padding: 10, borderRadius: 6 }}>
				<Text style={{ color: colors.text100 }}>Loading...</Text>
			</View>
		)
	}

	if (user == null) {
		return (
			<Pressable onPress={signInGoogleUser} style={{ backgroundColor: colors.bg200, padding: 10, borderRadius: 6 }}>
				<Text style={{ color: colors.text100 }}>Auth with Google</Text>
			</Pressable>
		)
	}

	return (
		<View style={{ backgroundColor: colors.bg300, padding: 10, borderRadius: 6 }}>
			<Text style={{ color: colors.text100, marginBottom: 10 }}>{user.user.name}</Text>
			<Pressable onPress={signOutGoogleUser} style={{ backgroundColor: colors.warning, padding: 10, borderRadius: 6 }}>
				<Text style={{ color: colors.primary300 }}>signOut</Text>
			</Pressable>
			{!isAllScopeAllowed ? (
				<Pressable onPress={addScopeGoogleUser} style={{ backgroundColor: colors.bg200, padding: 10, borderRadius: 6, marginTop: 5 }}>
					<Text style={{ color: colors.text100 }}>addScope</Text>
				</Pressable>
			) : null}
		</View>
	)
}
