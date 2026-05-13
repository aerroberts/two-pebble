import { Button, ButtonGroup, Header, PageLayout, Section, Surface } from '@two-pebble/components';
import { Navigate } from 'react-router-dom';
import { MODEL_CALL_VIEW_OPTIONS } from './model-call-detail.types';
import { ModelCallDetailContent } from './model-call-detail-content';
import { useModelCallDetailPageState } from './use-model-call-detail-page-state';

export function ModelCallDetailPage() {
  const state = useModelCallDetailPageState();

  if (state.redirectToAgents) {
    return <Navigate to="/agents" replace />;
  }

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <>
            <ButtonGroup
              options={MODEL_CALL_VIEW_OPTIONS}
              value={state.viewMode}
              onChange={state.setViewModeFromValue}
            />
            <Button
              disabled={state.threadPointer.length === 0}
              rightIcon="arrow-right"
              onClick={() => state.openThreadSnapshot(state.threadPointer)}
            >
              View Thread
            </Button>
          </>
        }
      >
        Model Call
      </Header>
      {state.visibleCall === null ? (
        <Section>
          <Surface>{state.calls.status === 'loading' ? 'Loading model call.' : 'Model call not found.'}</Surface>
        </Section>
      ) : (
        <ModelCallDetailContent
          call={state.visibleCall}
          data={state.modelCallData}
          mode={state.viewMode}
          onOpenThreadSnapshot={state.openThreadSnapshot}
          priceLineItems={state.priceLineItems}
          priceLineItemsLoading={state.priceLineItemsLoading}
        />
      )}
      {state.visibleCall?.errorMessage ? (
        <Section title="Error">
          <Surface>{state.visibleCall.errorMessage}</Surface>
        </Section>
      ) : null}
    </PageLayout>
  );
}
