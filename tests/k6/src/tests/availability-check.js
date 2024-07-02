/*
    Test script for availability check in eformidling
    Command:
    podman compose run k6 run /src/tests/availability-check.js `
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

  response = integrationPointApi.GetAvailability();
  success = check(response, {
    "GET integration point availability. Status is 200 OK": (r) =>
      r.status === 200,
    "GET integration point availability. Response in 'UP'": (r) =>
      r.body === "UP",
  });

  addErrorCount(success);
  if (!success) {
    stopIterationOnFail(success);
  }
}
