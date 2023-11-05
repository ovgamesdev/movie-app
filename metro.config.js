/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

// const { getDefaultConfig } = require('metro-config')

// module.exports = (async () => {
// 	const {
// 		resolver: { sourceExts, assetExts }
// 	} = await getDefaultConfig()
// 	return {
// 		transformer: {
// 			babelTransformerPath: require.resolve('react-native-svg-transformer'),
// 			getTransformOptions: async () => ({
// 				transform: {
// 					experimentalImportSupport: false,
// 					inlineRequires: true
// 				}
// 			})
// 		},
// 		resolver: {
// 			assetExts: assetExts.filter(ext => ext !== 'svg'),
// 			sourceExts: [...sourceExts, 'svg']
// 		}
// 	}
// })()

/* default */
// module.exports = {
// 	transformer: {
// 		getTransformOptions: async () => ({
// 			transform: {
// 				experimentalImportSupport: false,
// 				inlineRequires: true
// 			}
// 		})
// 	}
// }

/* NEW default */
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')

const config = {}

module.exports = mergeConfig(getDefaultConfig(__dirname), config)
