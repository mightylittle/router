/*
 * Copyright (c) 2024 John Newton
 * SPDX-License-Identifier: Apache-2.0
 */
import type {
  RouteContext
} from "@mightylittle/router";
import type {
  DispatchData
} from "../types";
import van from "vanjs-core";
const { tags } = van;
const { a, div, h1, ul, li } = tags;

export default function Widget(context: RouteContext<DispatchData>): Element {
  console.log("widget", context);

  return div(
    {class: "view"},
    h1({class: "page-title"}, `Widget: ${context.binding.widget}`),
    ul(
      li(a({href: "/"}, "Home")),
      li(a({href: "/about"}, "About"))
    )
  );
};
