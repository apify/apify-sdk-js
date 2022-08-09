import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { PageMetadata } from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function NotFound() {
    const redirectedV2Url = useBaseUrl('/docs/api');
    const redirectedV1Url = useBaseUrl('/docs/1.3.1/api');
    const baseUrlForV2Redirect = useBaseUrl(`/docs/2.3/api/`);
    const baseUrlForV1Redirect = useBaseUrl(`/docs/1.3/api/`);
    const path = window.location.pathname;

    React.useEffect(() => {
        let href = '';
        let redirect = false;

        if (path.startsWith(redirectedV2Url)) {
            href = baseUrlForV2Redirect + path.substring(redirectedV2Url.length + 1);
            redirect = true;
        }

        if (path.match(/\/docs\/2\.\d+\.\d+\/api/)) {
            href = baseUrlForV1Redirect + path.substring(redirectedV1Url.length + 1);
            redirect = true;
        }

        if (path.match(/\/docs\/[01]\.\d+\.\d+\/api\/(.*)/)) {
            const id = path.match(/\/docs\/[01]\.\d+\.\d+\/api\/(.*)/)[1];
            href = baseUrlForV1Redirect + id;
            redirect = true;
        }

        if (redirect && window.location.href !== href) {
            window.location.href = href;
        }
    }, [baseUrlForV2Redirect, path, redirectedV2Url]);

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
