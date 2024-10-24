// import { UnistylesRuntime } from 'react-native-unistyles'

// import { NativeEventEmitter, NativeModules } from 'react-native'
// import { useEffect, useState } from 'react'
// import { UnistylesEventType } from 'react-native-unistyles/lib/typescript/src/common'
// import { UnistylesEvents, UnistylesThemeEvent } from 'react-native-unistyles/lib/typescript/src/types'

// const unistylesEvents = new NativeEventEmitter(NativeModules.Unistyles)

// export const useTheme = () => {
// 	const [theme, setTheme] = useState(UnistylesRuntime.getTheme(UnistylesRuntime.themeName))

// 	useEffect(() => {
// 		const subscription = unistylesEvents.addListener('__unistylesOnChange', (event: UnistylesEvents) => {
// 			switch (event.type) {
// 				case UnistylesEventType.Theme: {
// 					const themeEvent = event as UnistylesThemeEvent

// 					return setTheme(UnistylesRuntime.getTheme(themeEvent.payload.themeName))
// 				}
// 				default:
// 					return
// 			}
// 		})

// 		return subscription.remove
// 	}, [])

// 	return
// 	theme
// }
