import { SlugItem } from '@components/molecules'
import { useNavigation, useTheme } from '@hooks'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Platform, TVFocusGuideView, Text, View } from 'react-native'
import { useGetListBySlugQuery } from '../../store/kinopoisk/kinopoisk.api'

const json_data = {
	id: 464963,
	alternativeName: 'Game of Thrones',
	countries: [
		{
			name: 'США'
		},
		{
			name: 'Великобритания'
		}
	],
	description: 'К концу подходит время благоденствия, и лето, длившееся почти десятилетие, угасает. Вокруг средоточия власти Семи королевств, Железного трона, зреет заговор, и в это непростое время король решает искать поддержки у друга юности Эддарда Старка. В мире, где все — от короля до наемника — рвутся к власти, плетут интриги и готовы вонзить нож в спину, есть место и благородству, состраданию и любви. Между тем никто не замечает пробуждение тьмы из легенд далеко на Севере — и лишь Стена защищает живых к югу от нее.',
	enName: 'Game of Thrones',
	genres: [
		{
			name: 'фэнтези'
		},
		{
			name: 'драма'
		},
		{
			name: 'боевик'
		},
		{
			name: 'мелодрама'
		},
		{
			name: 'приключения'
		}
	],
	movieLength: null,
	name: 'Игра престолов',
	names: [
		{
			name: 'Игра престолов'
		},
		{
			name: 'Game of Thrones'
		},
		{
			name: 'Froni i shpatave',
			language: 'AL',
			type: null
		},
		{
			name: 'El Juego de Tronos',
			language: 'AR',
			type: null
		},
		{
			name: 'A Guerra dos Tronos',
			language: 'BR',
			type: null
		},
		{
			name: '权利的游戏',
			language: 'CN',
			type: null
		},
		{
			name: '權力的遊戲',
			language: 'CN',
			type: null
		},
		{
			name: 'Game of Thrones: Das Lied von Eis und Feuer',
			language: 'DE',
			type: null
		},
		{
			name: 'Paihnidi tou stemmatos',
			language: 'DE',
			type: null
		},
		{
			name: 'Le Throne de fer',
			language: 'FR',
			type: null
		},
		{
			name: 'Game of Thrones - Le trône de fer',
			language: 'FR',
			type: null
		},
		{
			name: 'სატახტოთა თამაში',
			language: 'GE',
			type: null
		},
		{
			name: 'Παιχνίδι Του Στέμματος',
			language: 'GR',
			type: null
		},
		{
			name: '權力遊戲',
			language: 'HK',
			type: null
		},
		{
			name: 'Baziye tajo takht',
			language: 'IR',
			type: 'romanization'
		},
		{
			name: 'بازی تاج و تخت',
			language: 'IR',
			type: null
		},
		{
			name: 'گیم آف ترونز',
			language: 'IR',
			type: null
		},
		{
			name: '왕좌의 게임',
			language: 'KR',
			type: null
		},
		{
			name: 'Sostų žaidimas',
			language: 'LT',
			type: null
		},
		{
			name: 'Troņu spēle',
			language: 'LV',
			type: null
		},
		{
			name: 'Игра на тронови',
			language: 'MK',
			type: null
		},
		{
			name: 'Gra o tron',
			language: 'PL',
			type: null
		},
		{
			name: 'Igra prestolov',
			language: 'SI',
			type: null
		},
		{
			name: 'มหาศึกชิงบัลลังก์',
			language: 'TH',
			type: null
		},
		{
			name: 'Taht Oyunları',
			language: 'TR',
			type: null
		},
		{
			name: 'A Song of Ice and Fire',
			language: 'US',
			type: 'working title'
		},
		{
			name: 'GoT',
			language: 'US',
			type: 'common abbreviation'
		},
		{
			name: "Taxtlar o'yini",
			language: 'UZ',
			type: null
		},
		{
			name: "Taxt o'yinlari",
			language: 'UZ',
			type: null
		},
		{
			name: 'GOT',
			language: 'CN',
			type: null
		},
		{
			name: 'Gra o Tron',
			language: 'PL',
			type: null
		},
		{
			name: 'Гра Престолів',
			language: 'UA',
			type: null
		},
		{
			name: 'Game of Thrones .jpg',
			language: 'US',
			type: 'Alternative title'
		}
	],
	poster: {
		url: 'https://avatars.mds.yandex.net/get-kinopoisk-image/1777765/dd78edfd-6a1f-486c-9a86-6acbca940418/orig',
		previewUrl: 'https://avatars.mds.yandex.net/get-kinopoisk-image/1777765/dd78edfd-6a1f-486c-9a86-6acbca940418/x1000'
	},
	rating: {
		kp: 8.979,
		imdb: 9.2,
		filmCritics: 0,
		russianFilmCritics: 90,
		await: null
	},
	ratingMpaa: null,
	shortDescription: 'Рыцари, мертвецы и драконы — в эпической битве за судьбы мира. Сериал, который навсегда изменил телевидение',
	ticketsOnSale: false,
	type: 'tv-series',
	typeNumber: 2,
	votes: {
		kp: 945417,
		imdb: 2212431,
		filmCritics: 0,
		russianFilmCritics: 20,
		await: 1970
	},
	year: 2011,
	ageRating: 18,
	backdrop: {
		url: 'https://imagetmdb.com/t/p/original/8ykii0BhFxktfbS62fs7iFZxkCL.jpg',
		previewUrl: 'https://imagetmdb.com/t/p/w500/8ykii0BhFxktfbS62fs7iFZxkCL.jpg'
	},
	logo: {
		url: 'https://avatars.mds.yandex.net/get-ott/239697/2a00000170b077ba4dca5c9303185c5e8003/orig'
	},
	releaseYears: [
		{
			start: 2011,
			end: 2019
		}
	],
	top10: null,
	top250: 3,
	status: 'completed',
	isSeries: true,
	seriesLength: 55,
	totalSeriesLength: null
}

type Props = {
	slug: string
	title: string
	onPress: ({ id }: { id: number }) => void
}

export const SlugItemList = ({ slug, title, onPress }: Props) => {
	const navigation = useNavigation()
	const { colors } = useTheme()
	const ref = useRef<FlatList>(null)
	const focusedItem = useRef<{ index: number }>({ index: -1 })
	const [refreshFocusedItem, setRefreshFocusedItem] = useState({ focus: { index: -1 }, blur: { index: -1 } })

	useEffect(() => {
		if (!Platform.isTV) return

		const listenerFocus = navigation.addListener('focus', () => setRefreshFocusedItem(it => ({ focus: it.blur, blur: { index: -1 } })))
		const listenerBlur = navigation.addListener('blur', () => setRefreshFocusedItem({ focus: { index: -1 }, blur: focusedItem.current }))

		return () => {
			listenerFocus()
			listenerBlur()
		}
	}, [focusedItem.current, navigation])

	// { isFetching: false, data: { docs: Array(10).fill(json_data) }, isError: false, error: undefined }
	const { isFetching, data, isError, error } = useGetListBySlugQuery(slug)

	if (isError) {
		console.log(error)
	}

	const isEmpty = data ? data.docs.length === 0 : false

	const handleOnFocus = ({ index }: { index: number }) => {
		ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })

		focusedItem.current = { index }
	}

	const handleOnBlur = () => {
		focusedItem.current = { index: -1 }
	}

	const renderItem = ({ item, index }: { item: any; index: number }) => <SlugItem data={item} index={index} onFocus={handleOnFocus} onBlur={handleOnBlur} onPress={onPress} hasTVPreferredFocus={index === refreshFocusedItem.focus.index} />

	return (
		<>
			<Text style={{ color: colors.text100, paddingVertical: 5 }}>{title}</Text>
			<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus trapFocusLeft trapFocusRight>
				<FlatList
					keyExtractor={data => `list_${slug}_item_${data.id}`}
					ref={ref}
					data={data?.docs ?? []}
					horizontal
					showsHorizontalScrollIndicator={!false}
					contentContainerStyle={{ flexGrow: 1 }}
					renderItem={renderItem}
					ListEmptyComponent={
						isFetching ? null : (
							<View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: 215.5, backgroundColor: colors.bg200, borderRadius: 6, padding: 5, flexGrow: 1 }}>
								<Text style={{ textAlign: 'center', color: colors.text100 }}>Лист пуст</Text>
								{/* <Text style={{ textAlign: 'center', color: colors.text200 }}></Text> */}
							</View>
						)
					}
					ListFooterComponent={
						!isFetching ? null : (
							<View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: 215.5, backgroundColor: isEmpty ? colors.bg200 : undefined, borderRadius: 6, padding: 5 }}>
								<ActivityIndicator size={data?.docs.length !== 0 ? 'small' : 'large'} color={colors.text200} style={{ paddingHorizontal: 10, paddingTop: 20, paddingBottom: 75.5 }} />
							</View>
						)
					}
					ListFooterComponentStyle={{ flexGrow: 1 }}
				/>
			</TVFocusGuideView>
		</>
	)
}
