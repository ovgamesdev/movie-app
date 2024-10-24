import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'

type DeviceOrientation = { landscape: boolean; portrait: boolean }

export const useOrientation = (): DeviceOrientation => {
	const { width, height } = useWindowDimensions()

	const orientation = useMemo(() => (width >= height ? { landscape: true, portrait: false } : { landscape: false, portrait: true }), [width, height])

	return orientation
}
