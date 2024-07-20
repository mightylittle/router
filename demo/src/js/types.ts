/*
 * Copyright (c) 2024 John Newton
 * SPDX-License-Identifier: Apache-2.0
 */
export type RoutePaths =
  "/" |
  "/about" |
  "/widgets/:widget";

export type DispatchData = {
  prevURL: URL;
};
