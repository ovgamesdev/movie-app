import { PowerManagerInfo } from '@notifee/react-native/dist/types/PowerManagerInfo'

export interface IInitialStateBackgroundRestriction {
	isVisibleModal: boolean
	isInDontKillMyApp: boolean
	powerManagerInfo: PowerManagerInfo | null
}
