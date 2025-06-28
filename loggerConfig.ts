import { InteractionManager } from 'react-native'
import RNFetchBlob from 'react-native-blob-util'
import { consoleTransport, logger, transportFunctionType } from 'react-native-logs'

const customTransport: transportFunctionType<{ fileName: string; filePath: string }> = async props => {
	if (!props.options) return false

	const today = new Date()
	const d = today.getDate()
	const m = today.getMonth() + 1
	const y = today.getFullYear()

	const output = `${props.msg}\n`
	const path = props.options.filePath + '/logs/' + props.options.fileName.replace('{date-today}', `${d}-${m}-${y}`)

	try {
		await RNFetchBlob.fs.appendFile(path, output, 'utf8')
	} catch (e) {
		console.error(e)
	}
}

const getAllKeys = (obj: any): string[] => {
	try {
		let keys = Object.getOwnPropertyNames(obj)
		keys.forEach(key => {
			if (typeof obj[key] === 'object') {
				const childKeys = getAllKeys(obj[key])
				keys = keys.concat(childKeys)
			}
		})
		return keys
	} catch (e) {
		// console.error('getAllKeys', e)
		return []
	}
}

const stringifyFunc = (msg: any): string => {
	let stringMsg = ''
	if (typeof msg === 'string') {
		stringMsg = msg + ' '
	} else if (typeof msg === 'function') {
		stringMsg = '[function ' + msg.name + '()] '
	} else if (msg?.stack && msg.message) {
		stringMsg = msg.message + ' '
	} else {
		try {
			stringMsg = '\n' + JSON.stringify(msg, getAllKeys(msg), 2) + '\n'
			// stringMsg = '\n' + JSON.stringify(msg, Object.getOwnPropertyNames(msg), 2) + '\n'
		} catch (error) {
			stringMsg += 'Undefined Message'
		}
	}
	return stringMsg
}

const LOG = logger.createLogger({
	async: true,
	asyncFunc: InteractionManager.runAfterInteractions,
	stringifyFunc,
	transport: [consoleTransport, customTransport], // __DEV__ ? consoleTransport : fileAsyncTransport,
	levels: {
		debug: 0,
		log: 1,
		warn: 2,
		error: 3
	},
	severity: 'log',
	fixedExtLvlLength: true,
	transportOptions: {
		colors: {
			debug: 'blueBright',
			log: 'whiteBright',
			warn: 'yellowBright',
			error: 'redBright'
		},
		extensionColors: {},
		fileName: `logs_{date-today}.txt`,
		filePath: RNFetchBlob.fs.dirs.DocumentDir
	}
})

LOG.patchConsole()

export { LOG }
