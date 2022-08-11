---
id: log
title: utils.log
---

<a name="log"></a>

The log instance enables level aware logging of messages and we advise to use it instead of `console.log()` and its aliases in most development
scenarios.

A very useful use case for `log` is using `log.debug` liberally throughout the codebase to get useful logging messages only when appropriate log level
is set and keeping the console tidy in production environments.

The available logging levels are, in this order: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `OFF` and can be referenced from the `log.LEVELS` constant, such
as `log.LEVELS.ERROR`.

To log messages to the system console, use the `log.level(message)` invocation, such as `log.debug('this is a debug message')`.

To prevent writing of messages above a certain log level to the console, simply set the appropriate level. The default log level is `INFO`, which
means that `DEBUG` messages will not be printed, unless enabled.

**Example:**

```js
const Apify = require('apify');
const { log } = Apify.utils;

log.info('Information message', { someData: 123 }); // prints message
log.debug('Debug message', { debugData: 'hello' }); // doesn't print anything

log.setLevel(log.LEVELS.DEBUG);
log.debug('Debug message'); // prints message

log.setLevel(log.LEVELS.ERROR);
log.debug('Debug message'); // doesn't print anything
log.info('Info message'); // doesn't print anything

log.error('Error message', { errorDetails: 'This is bad!' }); // prints message
try {
    throw new Error('Not good!');
} catch (e) {
    log.exception(e, 'Exception occurred', { errorDetails: 'This is really bad!' }); // prints message
}

log.setOptions({ prefix: 'My actor' });
log.info('I am running!'); // prints "My actor: I am running"

const childLog = log.child({ prefix: 'Crawler' });
log.info('I am crawling!'); // prints "My actor:Crawler: I am crawling"
```

Another very useful way of setting the log level is by setting the `APIFY_LOG_LEVEL` environment variable, such as `APIFY_LOG_LEVEL=DEBUG`. This way,
no code changes are necessary to turn on your debug messages and start debugging right away.

To add timestamps to your logs, you can override the default logger settings:

```js
log.setOptions({
    logger: new log.LoggerText({ skipTime: false }),
});
```

You can customize your logging further by extending or replacing the default logger instances with your own implementations.

---

<a name="levels"></a>

## `log.LEVELS`

Map of available log levels that's useful for easy setting of appropriate log levels. Each log level is represented internally by a number. Eg.
`log.LEVELS.DEBUG === 5`.

---

<a name="setlevel"></a>

## `log.setLevel(level)`

Sets the log level to the given value, preventing messages from less important log levels from being printed to the console. Use in conjunction with
the `log.LEVELS` constants such as

```
log.setLevel(log.LEVELS.DEBUG);
```

Default log level is INFO.

**Parameters**:

-   **`level`**: `number`

---

<a name="getlevel"></a>

## `log.getLevel()`

Returns the currently selected logging level. This is useful for checking whether a message will actually be printed to the console before one
actually performs a resource intensive operation to construct the message, such as querying a DB for some metadata that need to be added. If the log
level is not high enough at the moment, it doesn't make sense to execute the query.

---

<a name="setoptions"></a>

## `log.setOptions(options)`

Configures logger.

**Parameters**:

-   **`options`**: [`LoggerOptions`](../typedefs/logger-options)

---

<a name="child"></a>

## `log.child([options])`

Creates a new instance of logger that inherits settings from a parent logger.

**Parameters**:

-   **`[options]`**: [`LoggerOptions`](../typedefs/logger-options) - Supports the same options as the `setOptions()` method.

---

<a name="getoptions"></a>

## `log.getOptions()`

Returns the logger configuration.

**Returns**:

[`LoggerOptions`](../typedefs/logger-options)

---

<a name="debug"></a>

## `log.debug(message, [data])`

Logs a `DEBUG` message. By default, it will not be written to the console. To see `DEBUG` messages in the console, set the log level to `DEBUG` either
using the `log.setLevel(log.LEVELS.DEBUG)` method or using the environment variable `APIFY_LOG_LEVEL=DEBUG`. Data are stringified and appended to the
message.

**Parameters**:

-   **`message`**: `string`
-   **`[data]`**: `object`

---

<a name="info"></a>

## `log.info(message, [data])`

Logs an `INFO` message. `INFO` is the default log level so info messages will be always logged, unless the log level is changed. Data are stringified
and appended to the message.

**Parameters**:

-   **`message`**: `string`
-   **`[data]`**: `object`

---

<a name="warning"></a>

## `log.warning(message, [data])`

Logs a `WARNING` level message. Data are stringified and appended to the message.

**Parameters**:

-   **`message`**: `string`
-   **`[data]`**: `object`

---

<a name="error"></a>

## `log.error(message, [data])`

Logs an `ERROR` message. Use this method to log error messages that are not directly connected to an exception. For logging exceptions, use the
`log.exception` method.

**Parameters**:

-   **`message`**: `string`
-   **`[data]`**: `object`

---

<a name="exception"></a>

## `log.exception(exception, [message], [data])`

Logs an `ERROR` level message with a nicely formatted exception. Note that the exception is the first parameter here and an additional message is only
optional.

**Parameters**:

-   **`exception`**: `Error`
-   **`[message]`**: `string`
-   **`[data]`**: `object`

---
