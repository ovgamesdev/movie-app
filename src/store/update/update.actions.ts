import { createAsyncThunk } from '@reduxjs/toolkit'
import { Alert, NativeModules } from 'react-native'
import RNFetchBlob from 'react-native-blob-util'
import { AppDispatch, RootState } from '../store'
import { IRemote } from './types'
import { actions } from './update.slice'

const RNUpdateAPK = NativeModules.RNUpdateAPK

let isInstalling = false
let showStartProgress = false

const createAppAsyncThunk = createAsyncThunk.withTypes<{
	state: RootState
	dispatch: AppDispatch
}>()

export const getApkVersion = createAppAsyncThunk('update/get-apk-version', async (_, thunkAPI) => {
	const { apkVersionUrl } = thunkAPI.getState().update.options
	let apkSize: number | null = null

	if (__DEV__ === true) {
		// return thunkAPI.dispatch(actions.getApkVersionSuccess({ size: 23, remote: { versionName: '999.999', versionCode: 999, apkUrl: 'https://github.com/ovgamesdev/res/releases/download/V1.1/app-release-V1_1.apk', forceUpdate: false, whatsNew: 'Initial commit', whatsNewOptions: [{ title: 'Другое:', options: [{ title: 'Добавлено что-то новое' }] }] } }))
		return console.log('RNUpdateAPK::getApkVersion - disabled in dev mode.')
	}

	if (apkVersionUrl.length === 0) return console.log("RNUpdateAPK::getApkVersion - apkVersionUrl doesn't exist.")

	try {
		const response = await fetch(apkVersionUrl, { method: 'HEAD' })
		const size = Number(response.headers.get('content-length')) / (1024 * 1024)
		apkSize = isNaN(size) ? null : Math.round(size)
	} catch (error: any) {}

	try {
		const data: IRemote = await fetch(apkVersionUrl)
			.then(response => {
				if (!response.ok) {
					let message
					if (response.statusText.length > 0) {
						message = `${response.url} ${response.statusText}`
					} else {
						message = `${response.url} Status Code:${response.status}`
					}
					throw Error(message)
				}
				return response
			})
			.then(response => response.json())

		return thunkAPI.dispatch(actions.getApkVersionSuccess({ size: apkSize, remote: data }))
	} catch (error: any) {
		console.error('RNUpdateAPK::getApkVersion', error)
		Alert.alert('Произошла ошибка', error.toString())
		return
	}
})

export const downloadApk = createAppAsyncThunk('update/download-apk', async (_, thunkAPI) => {
	const { remote, options } = thunkAPI.getState().update

	if (!remote) return console.log("RNUpdateAPK::getApkVersion - remote doesn't exist.")

	if (isInstalling) return console.log('RNUpdateAPK::getApkVersion - already installing.')
	isInstalling = true

	const downloadDestPath = `${RNFetchBlob.fs.dirs.CacheDir}/NewApp.apk`

	const task = RNFetchBlob.config({ fileCache: true, path: downloadDestPath }).fetch('GET', remote.apkUrl)

	showStartProgress = false

	task
		.progress({ interval: 250 }, (received, total) => {
			if (!showStartProgress) {
				showStartProgress = true
				// console.log('RNUpdateAPK::downloadApk - downloadApkStart')
				thunkAPI.dispatch(actions.setDownloadProgress({ completed: false, progress: { received: 0, total: 100 } }))
			} else {
				thunkAPI.dispatch(actions.setDownloadProgress({ completed: false, progress: { received, total } }))
			}
		})
		.then(res => {
			if (res.respInfo.status !== 200) {
				throw 'Failed to Download APK. Server returned with ' + res.respInfo.status + ' statusCode'
			}

			// console.log('RNUpdateAPK::downloadApk - downloadApkEnd')
			thunkAPI.dispatch(actions.setDownloadProgress({ completed: true }))
			RNUpdateAPK.getApkInfo(downloadDestPath)
				.then((res: any) => {
					console.log('RNUpdateAPK::downloadApk - Old Cert SHA-256: ' + RNUpdateAPK.signatures[0].thumbprint)
					console.log('RNUpdateAPK::downloadApk - New Cert SHA-256: ' + res.signatures[0].thumbprint)
					if (res.signatures[0].thumbprint !== RNUpdateAPK.signatures[0].thumbprint) {
						// FIXME should add extra callback for this
						console.log('The signature thumbprints seem unequal. Install will fail')
					}
				})
				.catch((rej: any) => {
					console.log('RNUpdateAPK::downloadApk - apk info error:', rej)
					Alert.alert('Произошла ошибка', 'Failed to get Downloaded APK Info')
					// re-throw so we don't attempt to install the APK, this will call the downloadApkError handler
					throw rej
				})
			RNUpdateAPK.installApk(downloadDestPath, options.fileProviderAuthority)

			isInstalling = false
		})
		.catch(err => {
			console.log('RNUpdateAPK::downloadApkError - downloadApkError', err)
			Alert.alert('Произошла ошибка', err.toString())
			thunkAPI.dispatch(actions.setDownloadProgress({ completed: false, error: err.toString() }))

			isInstalling = false
		})
})

export const installDownloadedApk = createAppAsyncThunk('update/install-apk', async (_, thunkAPI) => {
	const { options } = thunkAPI.getState().update
	const downloadDestPath = `${RNFetchBlob.fs.dirs.CacheDir}/NewApp.apk`

	RNUpdateAPK.installApk(downloadDestPath, options.fileProviderAuthority)
})
