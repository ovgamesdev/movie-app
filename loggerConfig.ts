import { InteractionManager } from 'react-native'
import RNFetchBlob from 'react-native-blob-util'
import { configLoggerType, consoleTransport, logger, transportFunctionType } from 'react-native-logs'

const customTransport: transportFunctionType = async props => {
	let _b, _c
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!props) return false

	let fileName = 'log'
	let filePath = RNFetchBlob.fs.dirs.DocumentDir

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if ((_b = props === null || props === void 0 ? void 0 : props.options) === null || _b === void 0 ? void 0 : _b.fileName) {
		const today = new Date()
		const d = today.getDate()
		const m = today.getMonth() + 1
		const y = today.getFullYear()
		fileName = props.options.fileName
		fileName = fileName.replace('{date-today}', `${d}-${m}-${y}`)
	}

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if ((_c = props === null || props === void 0 ? void 0 : props.options) === null || _c === void 0 ? void 0 : _c.filePath) {
		filePath = props.options.filePath
	}

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	const output = `${props === null || props === void 0 ? void 0 : props.msg}\n`
	const path = filePath + '/logs/' + fileName

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

const config: configLoggerType = {
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
		fileName: `logs_{date-today}.txt`
	}
}

const LOG = logger.createLogger(config)

LOG.patchConsole()

export { LOG }
