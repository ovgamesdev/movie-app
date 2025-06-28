import { Button } from '@components/atoms'
import { useActions, useAuth } from '@hooks'
import type { FC } from 'react'
import { TVFocusGuideView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const User: FC = () => {
	const { user, isAllScopeAllowed, isLoading } = useAuth()
	const { signInGoogleUser, signOutGoogleUser, addScopeGoogleUser } = useActions()
	const { styles, theme } = useStyles(stylesheet)

	if (isLoading) {
		return (
			<View style={styles.loading}>
				<Text style={styles.loadingText}>Loading...</Text>
			</View>
		)
	}

	if (user == null) {
		return <Button text='Auth with Google' onPress={() => signInGoogleUser()} />
	}

	return (
		<TVFocusGuideView style={styles.container} trapFocusLeft trapFocusRight>
			<Text style={styles.name}>{user.user.name}</Text>
			<Button text='signOut' onPress={() => signOutGoogleUser()} buttonColor={theme.colors.warning} pressedButtonColor={theme.colors.warning + '99'} textColor={theme.colors.primary300} />
			{!isAllScopeAllowed ? <Button text='addScope' onPress={() => addScopeGoogleUser()} style={styles.button} /> : null}
		</TVFocusGuideView>
	)
}

const stylesheet = createStyleSheet(theme => ({
	loading: {
		backgroundColor: theme.colors.bg200,
		padding: 10,
		borderRadius: 6
	},
	loadingText: {
		color: theme.colors.text100
	},
	container: {
		padding: 10,
		backgroundColor: theme.colors.bg300,
		borderRadius: 6
	},
	name: {
		color: theme.colors.text100,
		marginBottom: 10
	},
	button: {
		marginTop: 5
	}
}))
