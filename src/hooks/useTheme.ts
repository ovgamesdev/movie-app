import { useTypedSelector } from '@hooks'
import { useEffect, useState } from 'react'
import { Appearance, ColorSchemeName } from 'react-native'
import { COLORS, ColorTypes } from '../theme/colors'

type colorValue = keyof ColorTypes | `rgb${string}` | `#${string}`

export const useTheme = () => {
	const [deviceTheme, setDeviceTheme] = useState<ColorSchemeName>(Appearance.getColorScheme())

	useEffect(() => {
		const listener = Appearance.addChangeListener(theme => setDeviceTheme(theme.colorScheme))

		return () => listener.remove()
	}, [])

	const theme = useTypedSelector(store => store.settings.settings.theme)

	const colors: ColorTypes = COLORS[theme ?? deviceTheme ?? 'light']
	const scale = {}

	const getColorForTheme = (keys: { [key in keyof typeof COLORS]: colorValue }): string => {
		const value = keys[colors.colorScheme]

		if (value in colors) {
			return colors[value as never]
		}

		return value
	}

	return { colors, scale, getColorForTheme }
}
