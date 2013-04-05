# eslinker

Linker for JavaScript.


## Installation

```bash
$ npm install -g eslinker
```


## Usage

```bash
$ cat a.js
var b = require('./b');
console.log(b.value);
$ cat b.js
exports.value = 'BBB';
$ eslinker a.js b.js -o c.js
$ node c.js
BBB
```


## License

[MIT License](http://opensource.org/licenses/mit-license)
