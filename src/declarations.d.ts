declare module '*.svg' {
	import { FC } from 'react'
	import { SvgProps } from 'react-native-svg'
	const content: FC<SvgProps>
	export default content
}

declare module 'react-native-config' {
	export interface NativeConfig {
		UI_MODE?: string
	}

	export const Config: NativeConfig
	export default Config
}
