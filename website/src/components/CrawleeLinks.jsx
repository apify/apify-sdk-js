import React from 'react';
import Link from '@docusaurus/Link';

const baseUrl = 'https://crawlee.dev';

export const CrawleeApiLink = ({ to, children, version }) => {
    return (
        <Link href={`${baseUrl}/api${version ? `/${version}` : ''}/${to}`}>{children}</Link>
    );
};

export const CrawleeLink = ({ to, children }) => {
    return (
        <Link href={`${baseUrl}/${to}`}>{children}</Link>
    );
};
