---
id_old: version-1.3-request-transform
title: RequestTransform
id: request-transform
---

<a name="requesttransform"></a>

Takes an Apify [`RequestOptions`](./request-options) object and changes it's attributes in a desired way. This user-function is used
[`utils.enqueueLinks()`](../api/utils#enqueuelinks) to modify requests before enqueuing them.

**Parameters**:

-   **`original`**: [`RequestOptions`](../typedefs/request-options) - Request options to be modified.

**Returns**:

[`RequestOptions`](../typedefs/request-options) - The modified request options to enqueue.

---
