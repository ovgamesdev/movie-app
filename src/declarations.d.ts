declare module '*.svg' {
	import type { FC } from 'react'
	import { SvgProps } from 'react-native-svg'
	const content: FC<SvgProps>
	export default content
}

declare module 'react-native-config' {
	export interface NativeConfig {
		UI_MODE?: string
		KINOBOX_TOKEN: string
		THEMOVIEDB_TOKEN: string
		//
		ALLOHA_TOKEN: string
		COLLAPS_TOKEN: string
		KODIK_TOKEN: string
	}

	export const Config: NativeConfig
	export default Config
}

declare module 'merge-options' {
	export default {
		call: (value: { concatArrays: boolean; ignoreUndefined: boolean }, object: object, object: object) => object
	}
}
