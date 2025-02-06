import { bindActionCreators } from '@reduxjs/toolkit'
import { useMemo } from 'react'
import { useDispatch } from 'react-redux'

import { authActions, authExtraActions } from '@store/auth'
import { backgroundRestrictionActions, backgroundRestrictionExtraActions } from '@store/backgroundRestriction'
import { noticesActions, noticesExtraActions } from '@store/notices'
import { safeAreaActions } from '@store/safeArea'
import { settingsActions, settingsExtraActions } from '@store/settings'
import { updateActions, updateExtraActions } from '@store/update'

const rootActions = {
	...authActions,
	...authExtraActions,
	...settingsActions,
	...settingsExtraActions,
	...updateActions,
	...updateExtraActions,
	...safeAreaActions,
	...backgroundRestrictionActions,
	...backgroundRestrictionExtraActions,
	...noticesActions,
	...noticesExtraActions
}

export const useActions = () => {
	const dispatch = useDispatch()

	return useMemo(() => bindActionCreators(rootActions, dispatch), [dispatch])
}
