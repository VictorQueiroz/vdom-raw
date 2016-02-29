# vdom-raw

Builds raw HTML into [virtual-dom](https://github.com/Matt-Esch/virtual-dom) syntax.

### Usage
```js
var raw = require('vdom-raw');
raw.parseString(`<div>
	<span dataBind="user.name"></span>
<div>`);
```

#### Results in
```js
h('div', {}, [
	h('span', {dataBind: 'user.name'}, [])
])
```
