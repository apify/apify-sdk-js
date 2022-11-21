import React from 'react';
import Link from '@docusaurus/Link';

const CrawleeApiLink = ({ to, children, version }) => {
    const baseUrl = 'https://crawlee.dev/api';

    return (
        <Link href={`${baseUrl}${version ? `/${version}` : ''}/${to}`}>{children}</Link>
    );
};

export default CrawleeApiLink;
