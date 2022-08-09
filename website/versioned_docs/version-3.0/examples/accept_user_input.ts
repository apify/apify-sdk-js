import { KeyValueStore } from '@crawlee/core';

const keyValueStore = await KeyValueStore.open();
const input = await keyValueStore.getValue('INPUT');

console.log(input);
