import React from 'react';
import Link from '@docusaurus/Link';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useDocsVersion } from '@docusaurus/theme-common/internal';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const ApiLink = ({ to, children }) => {
    const { version, isLast } = useDocsVersion();
    const { siteConfig } = useDocusaurusContext();

    if (to.toString().startsWith('apify/')) {
        to = to.toString().substring('apify/'.length);
    }

    if (siteConfig.presets[0][1].docs.disableVersioning) {
        return (
            <Link to={`/reference/${to}`}>{children}</Link>
        );
    }

    let versionSlug = `${version}/`;

    if (version === 'current') {
        versionSlug = 'next/';
    } else if (isLast) {
        versionSlug = '';
    }

    return (
        <Link to={`/reference/${versionSlug}${to}`}>{children}</Link>
    );
};

export default ApiLink;
