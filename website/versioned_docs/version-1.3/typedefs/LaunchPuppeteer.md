---
id_old: version-1.3-launch-puppeteer
title: LaunchPuppeteer
id: launch-puppeteer
---

<a name="launchpuppeteer"></a>

**Parameters**:

- **`inputs`**: [`LaunchPuppeteerOptions`](../typedefs/launch-puppeteer-options) - Arguments passed to this callback.

**Returns**:

`Promise<Browser>` - Promise that resolves to Puppeteer's `Browser` instance. This might be obtained by calling
[puppeteer.launch()](https://pptr.dev/#?product=Puppeteer&version=v2.0.0&show=api-puppeteerlaunchoptions) directly, or by delegating to
[`Apify.launchPuppeteer()`](../api/apify#launchpuppeteer).

---
