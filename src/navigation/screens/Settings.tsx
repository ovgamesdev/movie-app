import { UpdateApk, User } from '@components/molecules'
import { Switch } from '@components/molecules/settings'
import { useTypedSelector } from '@hooks'
import { FC } from 'react'
import { TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const LoaderSettings: FC = () => {
	const isLoading = useTypedSelector(state => state.settings.isLoading)
	const { styles } = useStyles(stylesheet)

	if (!isLoading) {
		return null
	}

	return (
		<View style={styles.loadingContainer}>
			<View style={styles.loading}>
				<Text style={styles.loadingText}>Loading...</Text>
			</View>
		</View>
	)
}

export const Settings = () => {
	const insets = useSafeAreaInsets()
	const { styles } = useStyles(stylesheet)

	return (
		<TVFocusGuideView style={[styles.container, { marginTop: insets.top }]} trapFocusLeft trapFocusRight trapFocusUp>
			<LoaderSettings />

			<View style={styles.updateContainer}>
				<UpdateApk />
			</View>

			<User />

			{/* <Select
				item='theme'
				options={[
					{ value: 'light', title: 'light' },
					{ value: 'dark', title: 'dark' },
					{ value: null, title: 'default' }
				]}
				onChange={value => {
					if (value === null) {
						UnistylesRuntime.setAdaptiveThemes(true)
					} else {
						UnistylesRuntime.setAdaptiveThemes(false)
						UnistylesRuntime.setTheme(value)
					}
				}}
			/> */}
			<Switch item='showDevOptions' />
		</TVFocusGuideView>
	)
}

const stylesheet = createStyleSheet(theme => ({
	loadingContainer: {
		position: 'absolute',
		top: 20,
		left: 0,
		right: 0,
		zIndex: 10,
		alignItems: 'center'
	},
	loading: {
		backgroundColor: theme.colors.bg200,
		borderRadius: 50,
		paddingHorizontal: 5
	},
	loadingText: {
		color: theme.colors.text100,
		textAlign: 'center'
	},
	container: {
		flex: 1,
		padding: 10
	},
	updateContainer: {
		paddingBottom: 10
	}
}))
