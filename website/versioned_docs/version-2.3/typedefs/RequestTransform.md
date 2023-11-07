---
id: request-transform
title: RequestTransform
---

<a name="requesttransform"></a>

Takes an Apify [`RequestOptions`](./request-options) object and changes it's attributes in a desired way. This user-function is used
[`utils.enqueueLinks()`](../api/utils#enqueuelinks) to modify requests before enqueuing them.

**Parameters**:

-   **`original`**: [`RequestOptions`](../typedefs/request-options) - Request options to be modified.

**Returns**:

[`RequestOptions`](../typedefs/request-options) \| `null` \| `undefined` \| `false` - The modified request options to enqueue.

---
