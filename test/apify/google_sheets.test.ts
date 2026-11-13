import { fixGoogleSheetsUrls, toGoogleSheetsCsvUrl } from '../../src/google_sheets.js';

const id = '11UGSBOSXy5Ov2WEP9nr4kSIxQJmH18zh-5onKtBsovU';
const csvUrl = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`;

describe('toGoogleSheetsCsvUrl()', () => {
    test.each([
        `https://docs.google.com/spreadsheets/d/${id}`,
        `https://docs.google.com/spreadsheets/d/${id}/`,
        `https://docs.google.com/spreadsheets/d/${id}/edit?usp=sharing`,
        `https://docs.google.com/spreadsheets/d/${id}/123123132`,
        `https://docs.google.com/spreadsheets/d/${id}/?q=blablabla`,
        `https://docs.google.com/spreadsheets/d/${id}/edit#gid=0`,
    ])('rewrites the sharing link %s to the CSV export', (url) => {
        expect(toGoogleSheetsCsvUrl(url)).toBe(csvUrl);
    });

    test.each([
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vSabc_DEF-123/pub?gid=0&single=true&output=csv',
        `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=Second`,
        `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=123`,
        'https://example.com/urls.txt',
    ])('keeps %s', (url) => {
        expect(toGoogleSheetsCsvUrl(url)).toBe(url);
    });
});

describe('fixGoogleSheetsUrls()', () => {
    test('rewrites only the requestsFromUrl entries of array fields', () => {
        const sharingUrl = `https://docs.google.com/spreadsheets/d/${id}/edit?usp=sharing`;

        expect(
            fixGoogleSheetsUrls({
                startUrls: [
                    { url: sharingUrl },
                    { requestsFromUrl: sharingUrl, method: 'POST', userData: { label: 'LIST' } },
                    { requestsFromUrl: 'https://example.com/urls.txt' },
                    'https://example.com',
                ],
                sheetUrl: sharingUrl,
                nested: { requestsFromUrl: sharingUrl },
            }),
        ).toEqual({
            startUrls: [
                { url: sharingUrl },
                { requestsFromUrl: csvUrl, method: 'POST', userData: { label: 'LIST' } },
                { requestsFromUrl: 'https://example.com/urls.txt' },
                'https://example.com',
            ],
            sheetUrl: sharingUrl,
            nested: { requestsFromUrl: sharingUrl },
        });
    });
});
