export interface SelfContainedProtocol {
  name: 'selfContained';
  request: {
    value: string;
  };
  response: {
    ok: boolean;
  };
}
