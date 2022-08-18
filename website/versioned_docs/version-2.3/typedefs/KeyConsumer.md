---
id: key-consumer
title: KeyConsumer
---

<a name="keyconsumer"></a>

User-function used in the [`KeyValueStore.forEachKey()`](../api/key-value-store#foreachkey) method.

**Parameters**:

-   **`key`**: `string` - Current {KeyValue} key being processed.
-   **`index`**: `number` - Position of the current key in [`KeyValueStore`](../api/key-value-store).
-   **`info`**: `*` - Information about the current [`KeyValueStore`](../api/key-value-store) entry.
    -   **`size`**: `number` - Size of the value associated with the current key in bytes.

---
