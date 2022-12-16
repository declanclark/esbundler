import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { bundle } from '../../lib/index.js';
import { getBundle } from '../../lib/client.js';
import * as Globals from './globals.js';

test('smoke test', async () => {
  const src = `
import {fn1, fn2, ob1} from './utils';
import * as myGlobals from './globals';

export const id = "src";

export const eg = () => {
  return fn1(2);
}

export const my_global_str = myGlobals.MY_GLOBAL;

export const my_global_hello = myGlobals.globalGreeting();

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
    globals: {
      './globals': {
        varName: 'myGlobals',
        type: 'cjs',
      },
    },
  });

  const result = getBundle(code, {
    myGlobals: Globals,
  });

  assert.equal(result.id, 'src');
  assert.equal(result.eg(), 2);
  assert.equal(result.demo, "Mambo's favourite number is: 5");
  assert.equal(result.my_global_str, 'this-is-a-global');
  assert.equal(result.my_global_hello, 'Hello, world! (global)');
});

test.run();
