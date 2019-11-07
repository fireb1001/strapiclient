import * as moment from "moment";
import "moment/locale/ar";

export function readableTime(ts: Date) {
  const moment = require("moment");
  moment.locale("ar");
  return moment(ts).format("LLL");
}
