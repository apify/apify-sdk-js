---
id_old: version-1.3-launch-puppeteer-options
title: LaunchPuppeteerOptions
id: launch-puppeteer-options
---

<a name="launchpuppeteeroptions"></a>

Apify extends the launch options of Puppeteer. You can use any of the Puppeteer compatible
[`LaunchOptions`](https://pptr.dev/#?product=Puppeteer&show=api-puppeteerlaunchoptions) options in the
[`Apify.launchPuppeteer()`](../api/apify#launchpuppeteer) function and in addition, all the options available below.

## Properties

### `proxyUrl`

**Type**: `string`

URL to a HTTP proxy server. It must define the port number, and it may also contain proxy username and password.

Example: `http://bob:pass123@proxy.example.com:1234`.

---

### `userAgent`

**Type**: `string`

The `User-Agent` HTTP header used by the browser. If not provided, the function sets `User-Agent` to a reasonable default to reduce the chance of
detection of the crawler.

---

### `useChrome`

**Type**: `boolean` <code> = false</code>

If `true` and `executablePath` is not set, Puppeteer will launch full Google Chrome browser available on the machine rather than the bundled Chromium.
The path to Chrome executable is taken from the `APIFY_CHROME_EXECUTABLE_PATH` environment variable if provided, or defaults to the typical Google
Chrome executable location specific for the operating system. By default, this option is `false`.

---

### `puppeteerModule`

**Type**: `string` | `Object`

Either a require path (`string`) to a package to be used instead of default `puppeteer`, or an already required module (`Object`). This enables usage
of various Puppeteer wrappers such as `puppeteer-extra`.

Take caution, because it can cause all kinds of unexpected errors and weird behavior. Apify SDK is not tested with any other library besides
`puppeteer` itself.

---

### `stealth`

**Type**: `boolean`

This setting hides most of the known properties that identify headless Chrome and makes it nearly undetectable. It is recommended to use it together
with the `useChrome` set to `true`.

---

### `stealthOptions`

**Type**: [`StealthOptions`](../typedefs/stealth-options)

Using this configuration, you can disable some of the hiding tricks. For these settings to take effect `stealth` must be set to true

---
