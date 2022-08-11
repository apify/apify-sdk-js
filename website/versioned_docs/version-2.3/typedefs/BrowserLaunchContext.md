---
id: browser-launch-context
title: BrowserLaunchContext
---

<a name="browserlaunchcontext"></a>

## Properties

### `launchOptions`

**Type**: `Object<string, *>`

`Options passed to the browser launcher function. Options are based on underlying library.

---

### `proxyUrl`

**Type**: `string`

URL to a HTTP proxy server. It must define the port number, and it may also contain proxy username and password.

Example: `http://bob:pass123@proxy.example.com:1234`.

---

### `useChrome`

**Type**: `boolean` <code> = false</code>

If `true` and `executablePath` is not set, Playwright will launch full Google Chrome browser available on the machine rather than the bundled
Chromium. The path to Chrome executable is taken from the `APIFY_CHROME_EXECUTABLE_PATH` environment variable if provided, or defaults to the typical
Google Chrome executable location specific for the operating system. By default, this option is `false`.

---

### `useIncognitoPages`

**Type**: `boolean` <code> = false</code>

With this option selected, all pages will be opened in a new incognito browser context. This means they will not share cookies nor cache and their
resources will not be throttled by one another.

---

### `userDataDir`

**Type**: `string`

Sets the [User Data Directory](https://chromium.googlesource.com/chromium/src/+/master/docs/user_data_dir.md) path. The user data directory contains
profile data such as history, bookmarks, and cookies, as well as other per-installation local state. If not specified, a temporary directory is used
instead.

---

### `launcher`

**Type**: `*`

By default this function uses
require("playwright").chromium`. If you want to use a different browser you can pass it by this property as`require("playwright").firefox

---
