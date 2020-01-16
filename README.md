# Casha [![Travis CI Build Status](https://img.shields.io/travis/com/Richienb/casha/master.svg?style=for-the-badge)](https://travis-ci.com/Richienb/casha)

Convert between currencies.

[![NPM Badge](https://nodei.co/npm/casha.png)](https://npmjs.com/package/casha)

## Install

```sh
npm install casha
```

## Usage

```js
const casha = require("casha");

(async () => {
    await casha(10, "nzd", "usd");
    //=> 6.6
})()
```

## API

### casha(amount, from, to, options?)

#### amount

Type: `number`

The amount to convert.

#### from

Type: `number`

The currency to convert from.

#### to

Type: `number`

The currency to convert to.

#### options

Type: `object`

##### date

Type: `string | number | Date | instanceof dayjs`\
Default: `latest`

The date to get the currency conversion information for.

##### precision

Type: `number`\
Default: `2`

The precision to round the number to.

##### provider

Type: `string` (exchangeratesapi, fixer, currencylayer, openexchangerates)\
Default: `exchangeratesapi`

The conversion rate provider to use.

##### apiKey

Type: `string`

The key/token/id to pass to the API (if any).
