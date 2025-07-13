import { Button, ImageBackground } from '@components/atoms'
import { Kp3dIcon, KpImaxIcon } from '@icons'
import { navigation } from '@navigation'
import { Audience, Country, Genre, IFilmBaseInfo, ITvSeriesBaseInfo, MoneyAmount, MovieType, Person, Release, Releases } from '@store/kinopoisk'
import { declineSeasons, formatDate, formatDuration, isSeries, ratingMPAA } from '@utils'
import { ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import { useStyles } from 'react-native-unistyles'

// TODO EncyclopedicItem

const PersonItem = ({ title, data, isReq = false }: { title: string; data: { items: { person: Pick<Person, 'id' | 'name' | 'originalName'> }[]; total?: number }; isReq?: boolean }) => {
	const { theme } = useStyles()

	if (data.items.length === 0 && !isReq) return null

	return (
		<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
			<Text style={{ width: 130, color: theme.colors.text200, fontSize: 13 }}>{title}</Text>
			{data.items.length === 0 ? (
				<Button padding={0} flex={1} transparent focusable={false} textColor={theme.colors.text200} text={'—'} />
			) : (
				<ScrollView horizontal style={{ flex: 1 }}>
					{data.items.map(({ person }, i, { length }) => (
						<Button padding={0} key={person.id} text={(person.name ?? person.originalName) + (i !== length - 1 ? ', ' : '')} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
					))}
				</ScrollView>
			)}
		</TVFocusGuideView>
	)
}

export const YearItem = ({ id, title, productionYear, seasons, type, tmdbId }: { id: number | `tt${number}` | `ALLOHA:${string}` | `COLLAPS:${string}` | `KODIK:${string}`; title: string; productionYear: number | null; seasons?: { total: number }; type: MovieType; tmdbId: number | null }) => {
	const { theme } = useStyles()

	const episodesDisabled = tmdbId === null

	return (
		<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
			<Text style={{ width: 130, color: theme.colors.text200, fontSize: 13 }}>{title}</Text>
			<View style={{ flexDirection: 'row', flex: 1 }}>
				{!productionYear ? (
					<Button padding={0} transparent focusable={false} textColor={theme.colors.text200} text='—' />
				) : (
					<Button
						onPress={() => {
							const booleanFilterValues = [
								{ filterId: isSeries(type) ? 'series' : 'films', value: true },
								{ filterId: 'top', value: true }
							]
							const singleSelectFilterValues = [{ filterId: 'year', value: productionYear.toString() }]

							navigation.push('MovieListSlug', { data: { slug: '', filters: { booleanFilterValues, intRangeFilterValues: [], multiSelectFilterValues: [], realRangeFilterValues: [], singleSelectFilterValues } } })
						}}
						padding={0}
						text={productionYear.toString()}
						transparent
					/>
				)}
				{seasons && seasons.total > 0 && (
					<Button padding={0} transparent focusable={!episodesDisabled} disabled={episodesDisabled} onPress={() => tmdbId !== null && navigation.push('Episodes', { data: { id, tmdb_id: tmdbId, type } })}>
						<Text style={{ color: episodesDisabled ? theme.colors.text200 : theme.colors.text100, fontSize: 13 }}>{'(' + declineSeasons(seasons.total) + ')'}</Text>
					</Button>
				)}
			</View>
		</TVFocusGuideView>
	)
}

const OriginalsItem = ({ title, items }: { title: string; items: Release[] }) => {
	const { theme } = useStyles()

	if (items.length === 0) return null

	return (
		<View style={{ flexDirection: 'row' }}>
			<Text style={{ width: 130, color: theme.colors.text200, fontSize: 13 }}>{title}</Text>
			<ScrollView horizontal style={{ flex: 1 }}>
				{items
					.map(it => it.companies)
					.flat()
					.map((it, i, { length }) =>
						'originalsMovieList' in it ? (
							<Button
								onPress={() => {
									const data = it.originalsMovieList.url.split('/').filter(it => it)
									navigation.push('MovieListSlug', { data: { slug: data[data.length - 1] } })
								}}
								padding={0}
								key={it.id}
								text={it.displayName + (i !== length - 1 ? ', ' : '')}
								transparent
							/>
						) : null
					)}
			</ScrollView>
		</View>
	)
}

const CountriesItem = ({ title, items, type }: { title: string; items: Country[]; type: MovieType }) => {
	const { theme } = useStyles()

	return (
		<View style={{ flexDirection: 'row' }}>
			<Text style={{ width: 130, color: theme.colors.text200, fontSize: 13 }}>{title}</Text>
			{items.length === 0 ? (
				<Button padding={0} flex={1} transparent focusable={false} textColor={theme.colors.text200} text={'—'} />
			) : (
				<ScrollView horizontal style={{ flex: 1 }}>
					{items.map((it, i, { length }) => (
						<Button
							onPress={() => {
								const booleanFilterValues = [
									{ filterId: isSeries(type) ? 'series' : 'films', value: true },
									{ filterId: 'top', value: true }
								]
								const singleSelectFilterValues = [{ filterId: 'country', value: it.id + '' }]

								navigation.push('MovieListSlug', { data: { slug: '', filters: { booleanFilterValues, intRangeFilterValues: [], multiSelectFilterValues: [], realRangeFilterValues: [], singleSelectFilterValues } } })
							}}
							padding={0}
							key={it.id}
							text={it.name + (i !== length - 1 ? ', ' : '')}
							transparent
						/>
					))}
				</ScrollView>
			)}
		</View>
	)
}

const GenresItem = ({ title, items, type }: { title: string; items: Genre[]; type: MovieType }) => {
	const { theme } = useStyles()

	return (
		<View style={{ flexDirection: 'row' }}>
			<Text style={{ width: 130, color: theme.colors.text200, fontSize: 13 }}>{title}</Text>

			{items.length === 0 ? (
				<Button padding={0} flex={1} transparent focusable={false} textColor={theme.colors.text200} text={'—'} />
			) : (
				<ScrollView horizontal style={{ flex: 1 }}>
					{items.map((it, i, { length }) => (
						<Button
							padding={0}
							key={it.id}
							text={it.name + (i !== length - 1 ? ', ' : '')}
							transparent
							onPress={() => {
								const booleanFilterValues = [
									{ filterId: isSeries(type) ? 'series' : 'films', value: true },
									{ filterId: 'top', value: true }
								]
								const singleSelectFilterValues = [{ filterId: 'genre', value: it.slug }]

								navigation.push('MovieListSlug', { data: { slug: '', filters: { booleanFilterValues, intRangeFilterValues: [], multiSelectFilterValues: [], realRangeFilterValues: [], singleSelectFilterValues } } })
							}}
						/>
					))}
				</ScrollView>
			)}
		</View>
	)
}

const TaglineItem = ({ title, tagline }: { title: string; tagline: string | null }) => {
	const { theme } = useStyles()

	return (
		<View style={{ flexDirection: 'row' }}>
			<Text style={{ width: 130, color: theme.colors.text200, fontSize: 13 }}>{title}</Text>
			<Button padding={0} flex={1} transparent focusable={false} textColor={theme.colors.text200} text={tagline ? `«${tagline.replace(/(\s+\(season \d+\))/gi, '').replace(/\.$/g, '')}»` : '—'} />
		</View>
	)
}

const BudgetItem = ({ title, budget }: { title: string; budget: MoneyAmount | null }) => {
	const { theme } = useStyles()

	if (!budget || budget.amount === 0) return null

	return (
		<View style={{ flexDirection: 'row' }}>
			<Text style={{ width: 130, color: theme.colors.text200, fontSize: 13 }}>{title}</Text>
			<Button padding={0} flex={1} transparent focusable={false} textColor={theme.colors.text200} text={budget.currency.symbol + budget.amount.toLocaleString()} />
		</View>
	)
}

const WorldBudgetItem = ({ title, usaBudget, worldBudget }: { title: string; usaBudget: MoneyAmount | null; worldBudget: MoneyAmount | null }) => {
	const { theme } = useStyles()

	if (!(worldBudget && worldBudget.amount !== usaBudget?.amount)) return null

	return (
		<View style={{ flexDirection: 'row' }}>
			<Text style={{ width: 130, color: theme.colors.text200, fontSize: 13 }}>{title}</Text>
			<Button padding={0} flex={1} transparent focusable={false} textColor={theme.colors.text200} text={usaBudget ? `+ ${usaBudget.currency.symbol}${(worldBudget.amount - usaBudget.amount).toLocaleString()} = ${worldBudget.currency.symbol}${worldBudget.amount.toLocaleString()}` : `${worldBudget.currency.symbol}${worldBudget.amount.toLocaleString()}`} />
		</View>
	)
}

const AudienceItem = ({ title, audience }: { title: string; audience?: Audience }) => {
	const { theme } = useStyles()

	if (!audience || audience.items.length === 0) return null

	return (
		<View style={{ flexDirection: 'row' }}>
			<Text style={{ width: 130, color: theme.colors.text200, fontSize: 13 }}>{title}</Text>
			<ScrollView horizontal style={{ flex: 1, paddingLeft: 5 }}>
				{audience.items.map((it, i) => (
					<View key={it.country.id} style={{ flexDirection: 'row' }}>
						<View style={{ marginLeft: i !== 0 ? 5 : undefined, flexDirection: 'row', alignItems: 'center' }}>
							<ImageBackground style={{ width: 16, height: 11, marginRight: 5 }} source={{ uri: `https://st.kp.yandex.net/images/flags/flag-${it.country.id}.gif` }} />
							<Text style={{ color: theme.colors.text200, fontSize: 13 }}>{it.count >= 1000000 ? `${(it.count / 1000000).toFixed(1)} млн` : it.count >= 1000 ? `${(it.count / 1000).toFixed(1)} тыс` : it.count.toFixed(1)}</Text>
						</View>
						{audience.total !== i + 1 && <Text style={{ color: theme.colors.text200, fontSize: 13, lineHeight: 18 }}>,</Text>}
					</View>
				))}
			</ScrollView>
		</View>
	)
}

const RusReleaseItem = ({ title, items, isImax, is3d }: { title: string; items: Release[]; isImax: boolean; is3d: boolean }) => {
	const { theme } = useStyles()

	if (items.length === 0) return null

	return (
		<View style={{ flexDirection: 'row' }}>
			<Text style={{ width: 130, color: theme.colors.text200, fontSize: 13 }}>{title}</Text>
			<View style={{ flex: 1, flexDirection: 'row' }}>
				<Button padding={0} transparent focusable={false}>
					<Text style={{ color: theme.colors.text200 }}>
						{[items.map(it => (it.date ? formatDate(it.date.date) : '')).join(' '), items.map(it => it.companies.map(it => `«${it.displayName}»`).join(', ')).join(' ')].filter(it => !!it).join(', ')} {isImax && <KpImaxIcon width={40} height={16} style={{ marginLeft: 4, transform: [{ translateY: 3 }] }} viewBox={`${0 - 4} 0 ${40 + 4 * 2} 16`} />}
						{is3d && <Kp3dIcon width={26} height={16} style={{ marginLeft: 4, transform: [{ translateY: 3 }] }} viewBox={`${0 - 4} 0 ${26 + 4 * 2} 16`} />}
					</Text>
				</Button>
			</View>
		</View>
	)
}

const WorldPremiereItem = ({ title, date }: { title: string; date: string | null }) => {
	const { theme } = useStyles()

	if (!date) return null

	return (
		<View style={{ flexDirection: 'row' }}>
			<Text style={{ width: 130, color: theme.colors.text200, fontSize: 13 }}>{title}</Text>
			<Button padding={0} flex={1} transparent focusable={false} textColor={theme.colors.text200} text={formatDate(date)} />
		</View>
	)
}

const DistributionReleaseItem = ({ title, items }: { title: string; items: Release[] }) => {
	const { theme } = useStyles()

	if (items.length === 0) return null

	return (
		<View style={{ flexDirection: 'row' }}>
			<Text style={{ width: 130, color: theme.colors.text200, fontSize: 13 }}>{title}</Text>
			<Button padding={0} flex={1} transparent focusable={false} textColor={theme.colors.text200} text={[items.map(it => (it.date ? formatDate(it.date.date) : '')).join(' '), items.map(it => it.companies.map(it => `«${it.displayName}»`).join(', ')).join(' ')].filter(it => !!it).join(', ')} />
		</View>
	)
}

const ReleasesItem = ({ title, releases, type }: { title: string; releases: Releases[]; type: string }) => {
	const { theme } = useStyles()

	const item = releases.find(it => it.type === type)

	if (!item) return null

	return (
		<View style={{ flexDirection: 'row' }}>
			<Text style={{ width: 130, color: theme.colors.text200, fontSize: 13 }}>{title}</Text>
			<Button padding={0} flex={1} transparent focusable={false} textColor={theme.colors.text200} text={formatDate(item.date) + item.releasers.map(it => `, «${it.name}»`).join(' ')} />
		</View>
	)
}

const RestrictionItem = ({ title, value }: { title: string; value: string | null }) => {
	const { theme } = useStyles()

	if (!value) return null

	return (
		<View style={{ flexDirection: 'row' }}>
			<Text style={{ width: 130, color: theme.colors.text200, fontSize: 13 }}>{title}</Text>
			<View style={{ flex: 1, flexDirection: 'row', paddingLeft: 5 }}>
				<View style={{ borderColor: theme.colors.text100 + 'cc', borderWidth: 1, paddingHorizontal: 4, paddingVertical: 3 }}>
					<Text style={{ fontWeight: '600', fontSize: 13, lineHeight: 13, color: theme.colors.text100 + 'cc' }}>{value}</Text>
				</View>
			</View>
		</View>
	)
}

const DurationItem = ({ title, duration, seriesDuration, totalDuration }: { title: string; duration: number | null; seriesDuration: number | null; totalDuration: number | null }) => {
	const { theme } = useStyles()

	const durationValue = duration ?? seriesDuration

	return (
		<View style={{ flexDirection: 'row' }}>
			<Text style={{ width: 130, color: theme.colors.text200, fontSize: 13 }}>{title}</Text>
			<Button padding={0} flex={1} transparent focusable={false} textColor={theme.colors.text200} text={(durationValue === null ? (totalDuration === null ? '—' : `${totalDuration} мин. всего`) : `${durationValue} мин${durationValue > 60 ? '. / ' + formatDuration(durationValue) : ''}`) + (totalDuration && seriesDuration ? `${totalDuration && seriesDuration ? `. серия (${totalDuration} мин. всего)` : totalDuration ? '. всего' : ''}` : '')} />
		</View>
	)
}

export const Encyclopedic = ({ data, tmdbId }: { data: IFilmBaseInfo | ITvSeriesBaseInfo; tmdbId: number | null }) => {
	return (
		<>
			<YearItem productionYear={data.productionYear} title='Год производства' type={data.__typename} seasons={'seasons' in data ? data.seasons : undefined} id={data.id} tmdbId={tmdbId} />
			<OriginalsItem items={data.distribution.originals.items} title='Платформа' />

			<CountriesItem items={data.countries} title='Страна' type={data.__typename} />

			<GenresItem items={data.genres} title='Жанр' type={data.__typename} />

			<TaglineItem tagline={data.tagline} title='Слоган' />

			<PersonItem data={data.actors} title='В главных ролях' />
			<PersonItem data={data.voiceOverActors} title='Роли дублировали' />
			<PersonItem data={data.directors} title='Режиссер' isReq />
			<PersonItem data={data.writers} title='Сценарий' isReq />
			<PersonItem data={data.producers} title='Продюсер' isReq />
			<PersonItem data={data.operators} title='Оператор' />
			<PersonItem data={data.composers} title='Композитор' isReq />
			<PersonItem data={data.designers} title='Художник' />
			<PersonItem data={data.filmEditors} title='Монтаж' />

			<BudgetItem budget={data.boxOffice.budget} title='Бюджет' />
			<BudgetItem budget={data.boxOffice.usaBox} title='Сборы в США' />

			<WorldBudgetItem usaBudget={data.boxOffice.usaBox} worldBudget={data.boxOffice.worldBox} title='Сборы в мире' />

			<AudienceItem title='Зрители' audience={'audience' in data ? data.audience : undefined} />

			<BudgetItem budget={data.boxOffice.rusBox} title='Сборы в России' />

			<RusReleaseItem title='Премьера в России' items={data.distribution.rusRelease.items} is3d={'releaseOptions' in data && data.releaseOptions.is3d} isImax={'releaseOptions' in data && data.releaseOptions.isImax} />

			<WorldPremiereItem title='Премьера в мире' date={data.worldPremiere?.incompleteDate.date ?? null} />

			<DistributionReleaseItem title='Цифровой релиз' items={data.distribution.digitalRelease.items} />
			<DistributionReleaseItem title='Ре-релиз (РФ)' items={data.distribution.reRelease.items} />

			<ReleasesItem releases={data.releases} type='DVD' title='Релиз на DVD' />
			<ReleasesItem releases={data.releases} type='BLURAY' title='Релиз на Blu-ray' />

			<RestrictionItem title='Возраст' value={data.restriction.age ? data.restriction.age.replace('age', '') + '+' : null} />
			<RestrictionItem title='Рейтинг MPAA' value={data.restriction.mpaa ? ratingMPAA(data.restriction.mpaa).value : null} />

			<DurationItem title='Время' duration={'duration' in data ? data.duration : null} seriesDuration={'seriesDuration' in data ? data.seriesDuration : null} totalDuration={'totalDuration' in data ? data.totalDuration : null} />
		</>
	)
}
