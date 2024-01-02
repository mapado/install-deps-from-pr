# install-deps-from-pr

Install dependencies according to PR description

## Installation

Create the following file in your root package repository `install-deps-from-pr.config.js` (or `install-deps-from-pr.config.mjs` if your package is not a module), with the following default export:

```js
const config = {
  currentRepo: 'owner/repo-name', // the current repository name
  prDescriptionRegex: /### Dépendances \(pull requests\) :([\s\S]*?)###/, // A regex that matches a block in your github description
  repos: {
    // an object of valid repositories containing the repository name as key, and an object with "install" and "build" scripts as value
    'owner/cart': {
      install: 'yarn install',
      build: 'yarn build && yarn build:types',
    },
    'owner/tools': {
      install: 'yarn install',
      build: 'yarn build',
    },
  },
};

export default config;
```

### Using typescript ?

You can use a typescript configuration file named `install-deps-from-pr.config.ts`

```ts
import { Config } from '@mapado/install-deps-from-pr';

const config: Config = {
  // your configuration
};

export default config;
```

## Usage

This script needs two environment variables:

- `GITHUB_ACCESS_TOKEN`
- `BRANCH_NAME`

Then execute the following script:

```sh
npx -y @mapado/install-deps-from-pr
```

It will create a `install-deps-from-pr` directory and install thoses dependencies in it.

Then it will launch the following commands:

- yarn install
- yarn build
- yarn build:types

And copy the folder into the `node_modules` directory

## Troubleshooting

You may encounter an issue with an infinite build with `npx` never finishing.

If you have this issue, you might want to install the package in your dev dependencies:

```sh
# install one time
yarn add --dev @mapado/install-deps-from-pr

# execute
yarn install-deps-from-pr
```
