import React from 'react';
import ThemeApiLink from '@apify/docs-theme/src/theme/ApiLink';

const ApiLink = ({ to, children }) => {
    if (to.toString().startsWith('apify/')) {
        to = to.toString().substring('apify/'.length);
    }

    return <ThemeApiLink to={to}>{children}</ThemeApiLink>;
};

export default ApiLink;
