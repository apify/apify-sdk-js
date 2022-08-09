import React from 'react';
import { PageMetadata } from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function NotFound() {
    return (
        <>
            <PageMetadata title={'Page Not Found'} />
            <Layout>
                <main className="container margin-vert--xl">
                    <div className="row">
                        <div className="col col--6 col--offset-3">
                            <h1 className="hero__title">
                                Page Not Found
                            </h1>
                            <p>
                                We could not find what you were looking for. Maybe you got redirected from the old website?
                                Check out the <Link to={'/'}>homepage</Link>!
                            </p>
                            <p>
                                Please contact the owner of the site that linked you to the
                                original URL and let them know their link is broken.
                            </p>
                        </div>
                    </div>
                </main>
            </Layout>
        </>
    );
}
