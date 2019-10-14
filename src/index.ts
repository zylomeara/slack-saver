
type Message = {
  /* 3301c037-2223-499c-95b3-75d5761dde3f */
  client_msg_id: string,
  /* T02A9K56P */
  team: string,
  text: string,
  /* 1570708949.005200 */
  ts: string,
  type: 'message' | any,
  /* UL7413NR1 - my username */
  user: string,
}

type Conversation = {
  channel_actions_count: number,
  channel_actions_ts: null,
  has_more: boolean,
  is_limited: boolean,
  messages: Message[],
  ok: boolean,
  pin_count: number,
}


function logURL(requestDetails) {
  console.log("Loading: " + requestDetails.url);
}

browser.webRequest.onBeforeRequest.addListener(
  logURL,
  {urls: ["<all_urls>"]}
);
