# <center>esbundler 🐿</center>

#### <center>Bundle up ts/js files and their dependencies!</center>

##### <center>🟢 _Pull Requests Welcome!_ 🟢</center>

---

## Installation

```
npm install --save esbundler
```

## Usage

```ts
import { bundle } from 'esbundler';

const src = `
import {fn1, fn2, ob1} from './utils';

export const id = "src";

export const eg = () => {
  return fn1(2);
}

export const demo = fn2(ob1);
`.trim();

const { code } = await bundle({
  source: src,
  files: {
    './utils': `
import {MY_NUMBER} from './num';

export const fn1 = (num: number) => num;

type Func2Args = {
  name: string;
  favouriteNumber: number;
};

export const fn2 = ({name, favouriteNumber}: Func2Args) => {
  return name + "'s favourite number is: " + favouriteNumber;
}

export const ob1: Func2Args = {
  name: "Mambo",
  favouriteNumber: MY_NUMBER,
};
`.trim(),
    './num': `
export const MY_NUMBER = 5;
`.trim(),
  },
});
```

Now you will have a nice, stringified, minified string representation of your bundle in `code`. All that is left to do is to send it to the client:

```ts
import { useMemo } from 'react';
import { getBundle } from 'esbundler';

function FavouriteNumberDisplay({ code }: { code: string }) {
  const bundle = useMemo(() => getBundle(code), [code]);
  return (
    <>
      <h1>A list of favourite numbers:</h1>
      <ul>
        <li>{bundle.demo}</li>
      </ul>
    </>
  );
}
```

This is what will render:

```html
<h1>A list of favourite numbers:</h1>
<ul>
  <li>Mambo's favourite number is: 5</li>
</ul>
```

## Inspiration

I came across a problem where I had a set of TypeScript files which generated content. This content could differ on each render because the outputs were non-deterministic. There were solutions to the problem other than the solution produced here, but they required sending the JavaScript for **every** route on each request; I wanted to only send the JavaScript required for the route that the user requested.

The inspiration for this exact solution came from [Kent C. Dodds'](https://kentcdodds.com) [`mdx-bundler`](https://github.com/kentcdodds/mdx-bundler). This is a great solution if you want to bundle dependencies to produce a React component from markdown but this was not applicable to my use case.

## License

MIT
