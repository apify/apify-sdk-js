---
id: accept-user-input
title: Accept user input
---

This example accepts and logs user input:

```javascript
const { Actor } = require('apify');

Actor.main(async () => {
    const input = await Actor.getInput();
    console.log(input);
});
```

To provide the actor with input, create a `INPUT.json` file inside the "default" key-value store:

```bash
{PROJECT_FOLDER}/apify_storage/key_value_stores/default/INPUT.json
```

Anything in this file will be available to the actor when it runs.

To learn about other ways to provide an actor with input, refer to 
the [Apify Platform Documentation](https://apify.com/docs/actor#run).
