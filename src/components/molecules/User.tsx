import { Button } from '@components/atoms'
import { useActions, useAuth, useTheme } from '@hooks'
import { FC } from 'react'
import { Text, View } from 'react-native'

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
		return <Button text='Auth with Google' onPress={signInGoogleUser} />
	}

	return (
		<View style={{ backgroundColor: colors.bg300, padding: 10, borderRadius: 6 }}>
			<Text style={{ color: colors.text100, marginBottom: 10 }}>{user.user.name}</Text>
			<Button text='signOut' onPress={signOutGoogleUser} buttonColor={colors.warning} pressedButtonColor={colors.warning + '99'} textColor={colors.primary300} />
			{!isAllScopeAllowed ? <Button text='addScope' onPress={addScopeGoogleUser} style={{ marginTop: 5 }} /> : null}
		</View>
	)
}
