export const isSlackData = (data: any) => {
  return typeof data === 'object'
  && data.channels
  && data.members
  && data.messages
};
