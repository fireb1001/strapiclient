import * as moment from "moment";
import "moment/locale/ar";
import { MarkdownData } from "./types";

export function readableTime(ts: Date) {
  const moment = require("moment");
  moment.locale("ar");
  return moment(ts).format("LLL");
}

export function mdFileBody({
  title,
  cover,
  author,
  createdAt,
  type,
  description,
  layout,
  content
}: MarkdownData) {
  return `+++
title= "${title}"
cover = "${cover}"
author = "${author}"
date = ${createdAt}
${type ? `type= "${type}"` : ""}
${layout ? `layout= "${layout}"` : ""}
description = """
${description ? description : ""}
"""
+++
${content}
`;
}
