# @mighty-little/router

> Simple regex-based URL dispatcher for browser apps

This router is suitable for running in the main window or in a web worker.

There is no built-in integration with pushState or any other DOM API, so
you are expected to write your own code to call the dispatch method. See
the demo subdirectory for an example SPA.

## Usage

JavaScript example:

```javascript
const router = new Router({
  notFound: () => {
    console.log("404");
  },
  routes: {
    "/": () => {
      console.log("base route");
    },
    "/widgets/:widget": (context) => {
      console.log("widgetId", context.binding.widget); // => xyz
      console.log("url", context.url); // => http://www.example.net/widgets/xyz?hello=world
      console.log("data", context.data); // => {foo: "bar"}
    }
  }
});

router.dispatch(new URL("http://www.example.net/widgets/xyz?hello=world"), {foo: "bar"});
```

## Installation

```sh
npm install
```

## Development

Build:

```sh
npm run build
```

Run tests:

```sh
npm run test
```

Build docs:

```sh
npm run typedoc
```

## Author

* John Newton

## Copyright

* John Newton

## License

Apache-2.0
