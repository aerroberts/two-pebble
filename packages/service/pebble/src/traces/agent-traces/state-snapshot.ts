type StateSnapshotPrimitive = boolean | null | number | string;
type StateSnapshotValue =
  | StateSnapshotPrimitive
  | StateSnapshotValue[]
  | { [key: string]: StateSnapshotValue | undefined };

export interface PebbleAgentStateSnapshotTrace {
  type: 'state-snapshot';
  data: {
    capabilityId: string;
    name: string;
    value: StateSnapshotValue;
  };
}
