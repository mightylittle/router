/*
 * Copyright (c) 2024 John Newton
 * SPDX-License-Identifier: Apache-2.0
 */
import { assert } from "chai";
import { fake, match, spy } from "sinon";
import { describe, it } from "mocha";
import Router from "@mightylittle/router";

describe("Router", () => {
  describe("#dispatch", () => {
    it("dispatches to the callback registered to the root route", () => {
      const callback = spy();
      const router = new Router({
        notFound: () => {},
        routes: {
          "/": callback
        }
      });

      router.dispatch(new URL("http://example.net/"));

      assert(callback.calledOnce);
    });

    it("dispatches to the base route when given no pathname", () => {
      const callback = spy();
      const router = new Router({
        notFound: () => {},
        routes: {
          "/": callback
        }
      });

      router.dispatch(new URL("http://example.net"));

      assert(callback.calledOnce);
    });

    it("dispatches to a route with a trailing slash", () => {
      const callback = spy();
      const router = new Router({
        notFound: () => {},
        routes: {
          "/": fake(),
          "/example/": callback,
          "/example/quux": fake(),
          "/example/:example": fake(),
          "/foo/:bar": fake()
        }
      });

      router.dispatch(new URL("http://example.net/example/"));

      assert(callback.calledOnce);
    });

    it("dispatches to a route with a wildcard component", () => {
      const callback = spy();
      const router = new Router({
        notFound: () => {},
        routes: {
          "/": fake(),
          "/example": fake(),
          "/example/quux": fake(),
          "/example/:example": callback,
          "/foo/:bar": fake()
        }
      });

      router.dispatch(new URL("http://example.net/example/abc"));

      assert(callback.calledOnce);
    });

    it("dispatches to a route with a wildcard component and a trailing slash", () => {
      const callback = spy();
      const router = new Router({
        notFound: () => {},
        routes: {
          "/": fake(),
          "/example": fake(),
          "/example/quux": fake(),
          "/example/:example/": callback,
          "/foo/:bar": fake()
        }
      });

      router.dispatch(new URL("http://example.net/example/abc/"));

      assert(callback.calledOnce);
    });

    it("dispatches to a route with a wildcard component (with a numeric named group)", () => {
      const callback = spy();
      const router = new Router({
        notFound: () => {},
        routes: {
          "/": fake(),
          "/example": fake(),
          "/example/quux": fake(),
          "/example/:example": callback,
          "/foo/:bar": fake()
        }
      });

      router.dispatch(new URL("http://example.net/example/123"));

      assert(callback.calledOnce);
    });

    it("dispatches to the notFound handler as a catch-all fallback", () => {
      const callback = spy();
      const router = new Router({
        notFound: callback,
        routes: {
          "/": fake(),
          "/example/:xyz": fake()
        }
      });

      router.dispatch(new URL("http://example.net/example/hello/bogus"));

      assert(callback.calledOnce);
    });

    it("dispatches to the matching path-pattern when the URL includes query parameters", () => {
      const callback = spy();
      const router = new Router({
        notFound: () => {},
        routes: {
          "/": callback,
          "/example/:xyz": fake()
        }
      });

      router.dispatch(new URL("http://example.net/?hello=world"));

      assert(callback.calledOnce);
    });

    it("dispatches with case-sensitivity", () => {
      const callback = spy();
      const router = new Router({
        notFound: () => {},
        routes: {
          "/": fake(),
          "/example": fake(),
          "/EXAMPLE": callback
        }
      });

      router.dispatch(new URL("http://example.net/EXAMPLE"));

      assert(callback.calledOnce);
    });

    it("dispatches to URL-encoded representations of the route path-pattern", () => {
      const callback = spy();
      const router = new Router({
        notFound: () => {},
        routes: {
          "/": fake(),
          "/你好": fake(),
          "/你好，世界": callback
        }
      });

      const url = new URL("http://example.net/你好，世界");
      // percent-encoded to: http://example.net/%E4%BD%A0%E5%A5%BD%EF%BC%8C%E4%B8%96%E7%95%8C

      router.dispatch(url);

      assert(callback.calledOnce);
    });

    it("dispatches to URL-encoded representations of the route path-pattern with wildcards", () => {
      const callback = spy();
      const router = new Router({
        notFound: () => {},
        routes: {
          "/": fake(),
          "/你好/:foo": callback,
          "/你好，世界": fake()
        }
      });

      const url = new URL("http://example.net/你好/foobar");

      router.dispatch(url);

      assert(callback.calledOnce);
    });
  });
});
