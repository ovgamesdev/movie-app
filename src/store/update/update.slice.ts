import { PayloadAction, Unsubscribe, createSlice } from '@reduxjs/toolkit'
import { Alert, NativeModules } from 'react-native'
import semver from 'semver'
import { AppStartListening } from '../listenerMiddleware'
import { IDownload, IInitialStateUpdate, IRemote } from './update.types'

const RNUpdateAPK = NativeModules.RNUpdateAPK

const initialState: IInitialStateUpdate = {
	options: {
		apkVersionUrl: 'https://raw.githubusercontent.com/ovgamesdev/res/main/apps/movie/version.json',
		fileProviderAuthority: 'com.movieapp.provider'
	},
	remote: null,
	canUpdate: false,
	download: null,
	size: null,
	isVisibleModal: false
}

const updateSlice = createSlice({
	name: 'update',
	initialState,
	reducers: {
		setDownloadProgress: (state, { payload }: PayloadAction<IDownload | null>) => {
			state.download = payload
		},
		setIsVisibleModal: (state, { payload }: PayloadAction<boolean>) => {
			state.isVisibleModal = payload
		},
		getApkVersionSuccess: (state, { payload }: PayloadAction<{ size: number | null; remote: IRemote }>) => {
			state.remote = payload.remote
			state.size = payload.size

			try {
				// TODO switch this to versionCode
				let outdated = false

				if (payload.remote.versionCode > RNUpdateAPK.versionCode) {
					console.log('RNUpdateAPK::getApkVersionSuccess - outdated based on code, local/remote: ' + RNUpdateAPK.versionCode + '/' + payload.remote.versionCode)
					outdated = true
				}
				const installVersionName = semver.valid(semver.coerce(RNUpdateAPK.versionName))
				const remoteVersionName = semver.valid(semver.coerce(payload.remote.versionName))

				if (installVersionName !== null && remoteVersionName !== null && semver.lt(installVersionName, remoteVersionName)) {
					console.log('RNUpdateAPK::getApkVersionSuccess - APK outdated based on version name, local/remote: ' + RNUpdateAPK.versionName + '/' + payload.remote.versionName)
					outdated = true
				}

				state.canUpdate = outdated

				if (outdated) {
					// TODO show modal every day is can update
					state.isVisibleModal = true
					//
					// 	if (remote.forceUpdate) {
					// 		options.forceUpdateApp?.()

					// 		downloadApk(remote)
					// 	} else if (options.needUpdateApp) {
					// 		options.needUpdateApp(isUpdate => {
					// 			if (isUpdate) {
					// 				downloadApk(remote)
					// 			}
					// 		}, remote.whatsNew)
					// 	}
					// } else if (options.notNeedUpdateApp) {
					// 	options.notNeedUpdateApp()
				}
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
