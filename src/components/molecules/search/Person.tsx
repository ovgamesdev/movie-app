import { Button, ImageBackground } from '@components/atoms'
import { IGraphqlSuggestPerson } from '@store/kinopoisk'
import { SearchHistoryPerson } from '@store/settings'
import { normalizeUrlWithNull } from '@utils'
import React from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = {
	item: IGraphqlSuggestPerson
	onPress: (item: Omit<SearchHistoryPerson, 'timestamp'>) => void
}

export const Person = ({ item, onPress }: Props) => {
	const { styles } = useStyles(stylesheet)

	const poster = normalizeUrlWithNull(item.poster?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/80x120' })

	const handleOnPress = () => {
		onPress({
			id: item.id,
			type: 'Person',
			title: item.name ?? item.originalName,
			poster: item.poster?.avatarsUrl ?? null
		})
	}

	return (
		<Button onPress={handleOnPress} paddingHorizontal={16} animation='scale' transparent alignItems='stretch' flexDirection='row'>
			<ImageBackground source={{ uri: poster }} resizeMode='contain' style={styles.image} />
			<View style={styles.container}>
				<Text numberOfLines={2} style={styles.title}>
					{item.name ?? item.originalName}
				</Text>
				<Text style={styles.details}>{[item.name ? item.originalName : null, item.birthDate ? new Date(item.birthDate).getFullYear() : null].filter(it => it).join(', ')}</Text>
			</View>
		</Button>
	)
}

const stylesheet = createStyleSheet(theme => ({
	image: {
		width: 32,
		height: 48,
		marginRight: 16
	},
	container: {
		paddingVertical: 4,
		flex: 1,
		justifyContent: 'center'
	},
	title: {
		color: theme.colors.text100,
		fontSize: 15
	},
	details: {
		color: theme.colors.text200,
		fontSize: 13
	}
}))
