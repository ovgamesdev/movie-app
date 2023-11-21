import { useWindowDimensions } from 'react-native'

type DeviceOrientation = { landscape: boolean; portrait: boolean }

export const useOrientation = (): DeviceOrientation => {
	const { width, height } = useWindowDimensions()

	if (width >= height) {
		return { landscape: true, portrait: false }
	}

	return { landscape: false, portrait: true }
}
