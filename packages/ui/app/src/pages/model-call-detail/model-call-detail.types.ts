export type ModelCallViewMode = 'overview' | 'price' | 'raw';
type ModelCallStatusViewState = 'failed' | 'in-progress' | 'success';
type ModelCallStatusMap = {
  completed: ModelCallStatusViewState;
  failed: ModelCallStatusViewState;
  in_progress: ModelCallStatusViewState;
};

export const MODEL_CALL_VIEW_OPTIONS = [
  { value: 'overview', label: 'Overview' },
  { value: 'price', label: 'Price' },
  { value: 'raw', label: 'Raw' },
];

export const modelCallStatus: ModelCallStatusMap = {
  completed: 'success',
  failed: 'failed',
  in_progress: 'in-progress',
};

export function parseModelCallViewMode(value: string): ModelCallViewMode {
  if (value === 'price') {
    return value;
  }

  if (value === 'raw') {
    return value;
  }

  return 'overview';
}
