import React from 'react';
import { Redirect as RouterRedirect } from 'react-router-dom';

import { routes } from '@deriv/shared';
import { observer } from '@deriv/stores';

const RootComponent = observer(() => {
    return <RouterRedirect to={routes.trade} />;
});

export default RootComponent;
