import { Notification, NotificationAndroid } from '@notifee/react-native'
import { MovieType } from '@store/kinopoisk'

export interface IInitialStateNotices {
	Notices: number
	notifications: NoticesItem[]
}

export interface NoticesItem {
	timestamp: number
	id: string
	title: string
	body: string
	data: {
		type: MovieType
		id: number | `tt${number}`
		title: string
		newSeries?: NewEpisodesType
	}
	poster: string
	read?: boolean
}

interface NotificationAndroidType extends NotificationAndroid {
	channelId: 'content-release-channel'
	largeIcon: string
	pressAction: {
		id: 'movie'
		launchActivity: 'default'
	}
	actions: { title: string; pressAction: { id: 'watch'; launchActivity: 'default' } }[]
	timestamp: number
	showTimestamp: true
}

export interface NotificationType extends Notification {
	id: string
	title: string
	body: string
	data: NoticesItem['data']
	android: NotificationAndroidType
}

export type NewEpisodesType = { [key: string]: string[] }
