import { Button, ImageBackground } from '@components/atoms'
import { useNavigation, useTheme } from '@hooks'
import { Kp3dIcon, KpImaxIcon } from '@icons'
import { IFilmBaseInfo, ITvSeriesBaseInfo } from '@store/kinopoisk'
import { declineSeasons, formatDuration, isSeries, pickIsSeries, ratingMPAA } from '@utils'
import React from 'react'
import { ScrollView, TVFocusGuideView, Text, View } from 'react-native'

// TODO EncyclopedicItem

export const Encyclopedic = ({ data }: { data: IFilmBaseInfo | ITvSeriesBaseInfo }) => {
	const navigation = useNavigation()
	const { colors } = useTheme()

	return (
		<>
			{!!data.productionYear && (
				<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Год производства</Text>
					<View style={{ flexDirection: 'row', flex: 1 }}>
						{!!data.productionYear && (
							<Button
								onPress={() => {
									const booleanFilterValues = [
										{ filterId: isSeries(data.__typename) ? 'series' : 'films', value: true },
										{ filterId: 'top', value: true }
									]
									const singleSelectFilterValues = data.productionYear !== null ? [{ filterId: 'year', value: data.productionYear.toString() }] : []

									navigation.push('MovieListSlug', { data: { slug: '', filters: { booleanFilterValues, intRangeFilterValues: [], multiSelectFilterValues: [], realRangeFilterValues: [], singleSelectFilterValues } } })
								}}
								padding={0}
								text={data.productionYear.toString()}
								transparent
							/>
						)}
						{'seasons' in data && (
							<Button padding={0} transparent focusable={false}>
								<Text style={{}}>{'(' + declineSeasons(data.seasons.total) + ')'}</Text>
							</Button>
						)}
					</View>
				</TVFocusGuideView>
			)}

			{data.distribution.originals.items.length > 0 && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Платформа</Text>
					<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.distribution.originals.items.map(it => it.companies.map(it => it.displayName).join(' ')).join(' ')} />
				</View>
			)}

			{data.countries.length > 0 && (
				<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Страна</Text>
					<ScrollView horizontal style={{ flex: 1 }}>
						{data.countries.map(it => (
							<Button
								onPress={() => {
									const booleanFilterValues = [
										{ filterId: isSeries(data.__typename) ? 'series' : 'films', value: true },
										{ filterId: 'top', value: true }
									]
									const singleSelectFilterValues = [{ filterId: 'country', value: it.id + '' }]

									navigation.push('MovieListSlug', { data: { slug: '', filters: { booleanFilterValues, intRangeFilterValues: [], multiSelectFilterValues: [], realRangeFilterValues: [], singleSelectFilterValues } } })
								}}
								padding={0}
								key={it.id}
								text={it.name}
								transparent
							/>
						))}
					</ScrollView>
				</TVFocusGuideView>
			)}

			{data.genres.length > 0 && (
				<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Жанр</Text>
					<ScrollView horizontal style={{ flex: 1 }}>
						{data.genres.map(it => (
							<Button
								padding={0}
								key={it.id}
								text={it.name}
								transparent
								onPress={() => {
									const booleanFilterValues = [
										{ filterId: isSeries(data.__typename) ? 'series' : 'films', value: true },
										{ filterId: 'top', value: true }
									]
									const singleSelectFilterValues = [{ filterId: 'genre', value: it.slug }]

									navigation.push('MovieListSlug', { data: { slug: '', filters: { booleanFilterValues, intRangeFilterValues: [], multiSelectFilterValues: [], realRangeFilterValues: [], singleSelectFilterValues } } })
								}}
							/>
						))}
					</ScrollView>
				</TVFocusGuideView>
			)}

			<View style={{ flexDirection: 'row' }}>
				<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Слоган</Text>
				<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.tagline ? `«${data.tagline.replace(/(\s+\(season \d+\))/gi, '').replace(/\.$/g, '')}»` : '—'} />
			</View>

			{data.actors.items.length > 0 && (
				<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>В главных ролях</Text>
					<ScrollView horizontal style={{ flex: 1 }}>
						{data.actors.items.map(({ person }) => (
							<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
						))}
					</ScrollView>
				</TVFocusGuideView>
			)}

			{data.voiceOverActors.total > 0 && (
				<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Роли дублировали</Text>
					<ScrollView horizontal style={{ flex: 1 }}>
						{data.voiceOverActors.items.map(({ person }) => (
							<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
						))}
					</ScrollView>
				</TVFocusGuideView>
			)}

			{data.directors.items.length > 0 && (
				<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Режиссер</Text>
					<ScrollView horizontal style={{ flex: 1 }}>
						{data.directors.items.map(({ person }) => (
							<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
						))}
					</ScrollView>
				</TVFocusGuideView>
			)}

			{data.writers.items.length > 0 && (
				<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Сценарий</Text>
					<ScrollView horizontal style={{ flex: 1 }}>
						{data.writers.items.map(({ person }) => (
							<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
						))}
					</ScrollView>
				</TVFocusGuideView>
			)}

			{data.producers.items.length > 0 && (
				<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Продюсер</Text>
					<ScrollView horizontal style={{ flex: 1 }}>
						{data.producers.items.map(({ person }) => (
							<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
						))}
					</ScrollView>
				</TVFocusGuideView>
			)}

			{data.operators.items.length > 0 && (
				<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Оператор</Text>
					<ScrollView horizontal style={{ flex: 1 }}>
						{data.operators.items.map(({ person }) => (
							<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
						))}
					</ScrollView>
				</TVFocusGuideView>
			)}

			{data.composers.items.length > 0 && (
				<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Композитор</Text>
					<ScrollView horizontal style={{ flex: 1 }}>
						{data.composers.items.map(({ person }) => (
							<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
						))}
					</ScrollView>
				</TVFocusGuideView>
			)}

			{data.designers.items.length > 0 && (
				<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Художник</Text>
					<ScrollView horizontal style={{ flex: 1 }}>
						{data.designers.items.map(({ person }) => (
							<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
						))}
					</ScrollView>
				</TVFocusGuideView>
			)}

			{data.filmEditors.items.length > 0 && (
				<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Монтаж</Text>
					<ScrollView horizontal style={{ flex: 1 }}>
						{data.filmEditors.items.map(({ person }) => (
							<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
						))}
					</ScrollView>
				</TVFocusGuideView>
			)}

			{data.boxOffice.budget && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Бюджет</Text>
					<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.boxOffice.budget.currency.symbol + data.boxOffice.budget.amount.toLocaleString()} />
				</View>
			)}

			{data.boxOffice.usaBox && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Сборы в США</Text>
					<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.boxOffice.usaBox.currency.symbol + data.boxOffice.usaBox.amount.toLocaleString()} />
				</View>
			)}

			{data.boxOffice.worldBox && data.boxOffice.usaBox && data.boxOffice.worldBox.amount !== data.boxOffice.usaBox.amount && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Сборы в мире</Text>
					<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={`+ ${data.boxOffice.usaBox.currency.symbol}${(data.boxOffice.worldBox.amount - data.boxOffice.usaBox.amount).toLocaleString()} = ${data.boxOffice.worldBox.currency.symbol}${data.boxOffice.worldBox.amount.toLocaleString()}`} />
				</View>
			)}

			{'audience' in data && data.audience.total > 0 && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Зрители</Text>
					<ScrollView horizontal style={{ flex: 1, paddingLeft: 5 }}>
						{data.audience.items.map((it, i) => (
							<View key={it.country.id} style={{ flexDirection: 'row' }}>
								<View style={{ marginLeft: i !== 0 ? 5 : undefined, flexDirection: 'row', alignItems: 'center' }}>
									<ImageBackground style={{ width: 16, height: 11, marginRight: 5 }} source={{ uri: `https://st.kp.yandex.net/images/flags/flag-${it.country.id}.gif` }} />
									<Text style={{ color: colors.text200, fontSize: 13 }}>{it.count >= 1000000 ? `${(it.count / 1000000).toFixed(1)} млн` : it.count >= 1000 ? `${(it.count / 1000).toFixed(1)} тыс` : it.count.toFixed(1)}</Text>
								</View>
								{data.audience.total !== i + 1 && <Text style={{ color: colors.text200, fontSize: 13, lineHeight: 18 }}>,</Text>}
							</View>
						))}
					</ScrollView>
				</View>
			)}

			{data.boxOffice.rusBox && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Сборы в России</Text>
					<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.boxOffice.rusBox.currency.symbol + data.boxOffice.rusBox.amount.toLocaleString()} />
				</View>
			)}

			{data.distribution.rusRelease.items.length > 0 && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Премьера в России</Text>
					<View style={{ flex: 1, flexDirection: 'row' }}>
						<Button padding={0} transparent focusable={false} textColor={colors.text200} text={[data.distribution.rusRelease.items.map(it => (it.date ? new Date(it.date.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '') : '')).join(' '), data.distribution.rusRelease.items.map(it => it.companies.map(it => `«${it.displayName}»`).join('')).join(' ')].filter(it => !!it).join(', ')} />
						{'releaseOptions' in data && data.releaseOptions.isImax && <KpImaxIcon width={40} height={16} style={{ marginLeft: 4, transform: [{ translateY: 3 }] }} viewBox='0 0 40 16' />}
						{'releaseOptions' in data && data.releaseOptions.is3d && <Kp3dIcon width={26} height={16} style={{ marginLeft: 4, transform: [{ translateY: 3 }] }} viewBox='0 0 26 16' />}
					</View>
				</View>
			)}

			{data.worldPremiere && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Премьера в мире</Text>
					<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={new Date(data.worldPremiere.incompleteDate.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')} />
				</View>
			)}

			{data.distribution.digitalRelease.items.length > 0 && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Цифровой релиз</Text>
					<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={[data.distribution.digitalRelease.items.map(it => (it.date ? new Date(it.date.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '') : '')).join(' '), data.distribution.digitalRelease.items.map(it => it.companies.map(it => `«${it.displayName}»`).join('')).join(' ')].filter(it => !!it).join(', ')} />
				</View>
			)}

			{data.distribution.reRelease.items.length > 0 && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Ре-релиз (РФ)</Text>
					<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={[data.distribution.reRelease.items.map(it => (it.date ? new Date(it.date.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '') : '')).join(' '), data.distribution.reRelease.items.map(it => it.companies.map(it => `«${it.displayName}»`).join('')).join(' ')].filter(it => !!it).join(', ')} />
				</View>
			)}

			{data.releases.find(it => it.type === 'DVD') && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Релиз на DVD</Text>
					<Button
						padding={0}
						flex={1}
						transparent
						focusable={false}
						textColor={colors.text200}
						text={
							new Date(data.releases.find(it => it.type === 'DVD')?.date ?? '').toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '') +
							data.releases
								.find(it => it.type === 'DVD')
								?.releasers.map(it => `, «${it.name}»`)
								.join(' ')
						}
					/>
				</View>
			)}

			{data.releases.find(it => it.type === 'BLURAY') && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Релиз на Blu-ray</Text>
					<Button
						padding={0}
						flex={1}
						transparent
						focusable={false}
						textColor={colors.text200}
						text={
							new Date(data.releases.find(it => it.type === 'BLURAY')?.date ?? '').toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '') +
							data.releases
								.find(it => it.type === 'BLURAY')
								?.releasers.map(it => `, «${it.name}»`)
								.join(' ')
						}
					/>
				</View>
			)}

			{data.restriction.age && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Возраст</Text>
					<View style={{ flex: 1, flexDirection: 'row', paddingLeft: 5 }}>
						<View style={{ borderColor: colors.text100 + 'cc', borderWidth: 1, paddingHorizontal: 4, paddingVertical: 3 }}>
							<Text style={{ fontWeight: '600', fontSize: 13, lineHeight: 13, color: colors.text100 + 'cc' }}>{data.restriction.age.replace('age', '')}+</Text>
						</View>
					</View>
				</View>
			)}

			{data.restriction.mpaa && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Рейтинг MPAA</Text>
					<View style={{ flex: 1, flexDirection: 'row', paddingLeft: 5 }}>
						<View style={{ borderColor: colors.text100 + 'cc', borderWidth: 1, paddingHorizontal: 4, paddingVertical: 3 }}>
							<Text style={{ fontWeight: '600', fontSize: 13, lineHeight: 13, color: colors.text100 + 'cc' }}>{ratingMPAA(data.restriction.mpaa).value}</Text>
						</View>
					</View>
				</View>
			)}

			{pickIsSeries(data, 'seriesDuration', 'duration') != null && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Время</Text>
					<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={`${pickIsSeries(data, 'seriesDuration', 'duration')} мин${pickIsSeries(data, 'seriesDuration', 'duration') > 60 ? '. / ' + formatDuration(pickIsSeries(data, 'seriesDuration', 'duration')) : ''}` + ('totalDuration' in data && 'seriesDuration' in data ? `${data.totalDuration && data.seriesDuration ? `. серия (${data.totalDuration} мин. всего)` : data.totalDuration ? '. всего' : ''}` : '')} />
				</View>
			)}
		</>
	)
}
