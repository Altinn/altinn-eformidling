/*
    Test script of platform notifications api with org token
    Command:
    podman compose run k6 run /src/tests/eformidling.js `
    -e env=*** `
    -e subscriptionKey=*** `
*/
import { check } from "k6";
import { addErrorCount, stopIterationOnFail } from "../errorhandler.js";
import * as integrationPointApi from "../api/integrationPoint.js";

export const options = {
  thresholds: {
    errors: ["count<1"],
  },
};

export default function () {
  var response, success;

  response = integrationPointApi.GetLevetidUtloptLast20();
  success = check(response, {
    "GET levetid utløpt instances. Status is 200 OK": (r) => r.status === 200,
  });

  addErrorCount(success);
  if (!success) {
    stopIterationOnFail(success);
  }

  success = check(JSON.parse(response.body), {
    "GET levetid utløpt instances. No failed shipments": (object) =>
      object.totalElements === 0,
  });
  addErrorCount(success);
}
