/*
 * Copyright (c) 2024 John Newton
 * SPDX-License-Identifier: Apache-2.0
 */
import type {
  RouteContext,
  RouteData,
  RouterConfig
} from "@mightylittle/router";
import type {
  RoutePaths,
  DispatchData
} from "./types";
import Router from "@mightylittle/router";
import van from "vanjs-core";
const { add } = van;

let appEl: HTMLElement | null;

const router = new Router<RoutePaths, Promise<Element>, DispatchData>({
  notFound: async (context: RouteContext<DispatchData>): Promise<Element> => {
    const NotFound = (await import("./view/NotFound.js")).default;
    return NotFound(context);
  },
  routes: {
    "/": async (context: RouteContext<DispatchData>): Promise<Element> => {
      const Home = (await import("./view/Home.js")).default;
      return Home(context);
    },
    "/about": async (context: RouteContext<DispatchData>): Promise<Element> => {
      const About = (await import("./view/About.js")).default;
      return About(context);
    },
    "/widgets/:widget": async (context: RouteContext<DispatchData>): Promise<Element> => {
      const Widget = (await import("./view/Widget.js")).default;
      return Widget(context);
    }
  }
});

const render = async (url: URL, data?: DispatchData): Promise<void> => {
  const viewEl: Element = await router.dispatch(url, data || {
    prevURL: new URL(location.href)
  });
  appEl!.textContent = "";
  appEl!.appendChild(viewEl);
};

const navigate = async (url: URL, data?: DispatchData): Promise<void> => {
  await render(url, data);
  history.pushState({}, "", url.href);
};

const start = async () => {
  appEl = document.getElementById("app");

  if (!appEl) throw new Error("#app not found.");

  await render(new URL(location.href));
};

addEventListener("click", async (event: MouseEvent) => {
  const target = event.target! as HTMLElement;
  const anchor: HTMLAnchorElement | null =  target.closest("a");
  if (!anchor) return;
  event.preventDefault();
  await navigate(new URL(anchor.href));
});

addEventListener("popstate", async (event: Event) => {
  await render(new URL(location.href));
});

start();
