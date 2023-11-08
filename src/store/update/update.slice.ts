import { createSlice, PayloadAction, Unsubscribe } from '@reduxjs/toolkit'
import { Alert, NativeModules } from 'react-native'
import semver from 'semver'
import { AppStartListening } from '../listenerMiddleware'
import { IDownload, IOptions, IRemote } from './types'

const RNUpdateAPK = NativeModules.RNUpdateAPK

interface IInitialStateUpdate {
	options: IOptions
	remote: IRemote | null
	canUpdate: boolean
	download: IDownload | null
}

const initialState: IInitialStateUpdate = {
	options: {
		apkVersionUrl: 'https://raw.githubusercontent.com/ovgamesdev/res/main/apps/movie/version.json',
		fileProviderAuthority: 'com.reactnativetvosfocus.provider'
	},
	remote: null,
	canUpdate: false,
	download: null
}

const updateSlice = createSlice({
	name: 'update',
	initialState,
	reducers: {
		setDownloadProgress: (state, { payload }: PayloadAction<IDownload | null>) => {
			state.download = payload
		},
		getApkVersionSuccess: (state, { payload }: PayloadAction<IRemote>) => {
			state.remote = payload

			try {
				// TODO switch this to versionCode
				let outdated = false

				if (payload.versionCode > RNUpdateAPK.versionCode) {
					console.log('RNUpdateAPK::getApkVersionSuccess - outdated based on code, local/remote: ' + RNUpdateAPK.versionCode + '/' + payload.versionCode)
					outdated = true
				}
				const installVersionName = semver.valid(semver.coerce(RNUpdateAPK.versionName))
				const remoteVersionName = semver.valid(semver.coerce(payload.versionName))

				if (installVersionName !== null && remoteVersionName !== null && semver.lt(installVersionName, remoteVersionName)) {
					console.log('RNUpdateAPK::getApkVersionSuccess - APK outdated based on version name, local/remote: ' + RNUpdateAPK.versionName + '/' + payload.versionName)
					outdated = true
				}

				state.canUpdate = outdated

				// if (outdated) {
				//
				// 	if (remote.forceUpdate) {
				// 		options.forceUpdateApp?.()

				// 		downloadApk(remote)
				// 	} else if (options.needUpdateApp) {
				// TODO open modal
				// 		options.needUpdateApp(isUpdate => {
				// 			if (isUpdate) {
				// 				downloadApk(remote)
				// 			}
				// 		}, remote.whatsNew)
				// 	}
				// } else if (options.notNeedUpdateApp) {
				// 	options.notNeedUpdateApp()
				// }
			} catch (error) {
				console.error('RNUpdateAPK::getApkVersionSuccess - Unknown error:', error)
				Alert.alert('Произошла ошибка', 'Unknown error')
			}
		}
	}
})

export const { actions, reducer } = updateSlice

export const setupUpdateListeners = (startListening: AppStartListening): Unsubscribe =>
	startListening({
		actionCreator: actions.getApkVersionSuccess,
		effect: async (action, listenerApi) => {
			console.log('effect getApkVersionSuccess', action)
		}
	})
