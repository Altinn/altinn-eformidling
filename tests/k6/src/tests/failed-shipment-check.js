/*
    Test script for failed shipment check in eformidling
    Command:
    podman compose run k6 run /src/tests/failed-shipment-check.js `
    -e env=*** `
    -e apimSubscriptionKey=*** `
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
  let failedMessages = [];

  let messages = GetLevetidUtloptMessages();

  messages.forEach((message) => {
    let id = message.messageId;

    // only outgoing conversations should be considered. We don't expect any incoming messages
    if (IsOutgoingConversation(id)) {
      failedMessages.push(id);
    }
  });

  if (failedMessages.length > 0){
    console.log("Levetid utløpt registered for messageId(s):", failedMessages);
  }

  let success = check(failedMessages, {
    "GET levetid utløpt instances. No failed shipments": (failedMessages) =>
      failedMessages.length === 0,
  });
  addErrorCount(success);

}

function GetLevetidUtloptMessages() {
  var response, success;

  response = integrationPointApi.GetLevetidUtloptLast20();
  success = check(response, {
    "GET levetid utløpt instances. Status is 200 OK": (r) => r.status === 200,
  });

  addErrorCount(success);
  if (!success) {
    stopIterationOnFail('GET levetid utløpt messages request failed',success);
  }

  let messages = JSON.parse(response.body)["content"];

  return messages;
}

function IsOutgoingConversation(messageId) {
  let response = integrationPointApi.GetConversation(messageId);
  let conversationDir = JSON.parse(response.body).content[0].direction;

  return conversationDir === "OUTGOING";
}
