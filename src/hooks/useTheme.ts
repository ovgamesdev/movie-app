import { useTypedSelector } from '@hooks'
import { useEffect, useState } from 'react'
import { Appearance, ColorSchemeName } from 'react-native'
import { COLORS, ColorTypes } from '../theme/colors'

export const useTheme = () => {
	const [deviceTheme, setDeviceTheme] = useState<ColorSchemeName>(Appearance.getColorScheme())

	useEffect(() => {
		const listener = Appearance.addChangeListener(theme => setDeviceTheme(theme.colorScheme))

		return () => listener.remove()
	}, [])

	const theme = useTypedSelector(store => store.settings.settings.theme)

	const colors: ColorTypes = COLORS[theme ?? deviceTheme ?? 'light']
	const scale = {}

	return { colors, scale }
}
