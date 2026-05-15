'use client';

import { useEffect, useMemo } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useBoardTaskTemplates(input: { boardId: string }) {
  const datastore = useRealtimeDatastore();
  const allTemplates = useRealtimeStore((state) => state.taskTemplates);

  useEffect(() => {
    if (input.boardId.length === 0) {
      return;
    }
    void datastore.taskTemplates.list({ boardId: input.boardId }).catch(() => undefined);
  }, [datastore, input.boardId]);

  const templates = useMemo(
    () => allTemplates.values().filter((template) => template.boardId === input.boardId),
    [allTemplates, input.boardId],
  );

  return { templates };
}

export function useTemplateDeliverables(input: { templateId: string }) {
  const datastore = useRealtimeDatastore();
  const allDeliverables = useRealtimeStore((state) => state.taskTemplateDeliverables);

  useEffect(() => {
    if (input.templateId.length === 0) {
      return;
    }
    void datastore.taskTemplates.deliverables.list({ templateId: input.templateId }).catch(() => undefined);
  }, [datastore, input.templateId]);

  const deliverables = useMemo(
    () =>
      allDeliverables
        .values()
        .filter((deliverable) => deliverable.templateId === input.templateId)
        .sort((left, right) => left.orderIndex - right.orderIndex),
    [allDeliverables, input.templateId],
  );

  return { deliverables };
}

export function useTaskDeliverables(input: { taskId: string }) {
  const datastore = useRealtimeDatastore();
  const allDeliverables = useRealtimeStore((state) => state.taskDeliverables);

  useEffect(() => {
    if (input.taskId.length === 0) {
      return;
    }
    void datastore.taskDeliverables.list({ taskId: input.taskId }).catch(() => undefined);
  }, [datastore, input.taskId]);

  const deliverables = useMemo(
    () =>
      allDeliverables
        .values()
        .filter((deliverable) => deliverable.taskId === input.taskId)
        .sort((left, right) => left.orderIndex - right.orderIndex),
    [allDeliverables, input.taskId],
  );

  return { deliverables };
}

export function useTaskDeliverableSubmissions(input: { taskId: string }) {
  const datastore = useRealtimeDatastore();
  const allSubmissions = useRealtimeStore((state) => state.taskDeliverableSubmissions);

  useEffect(() => {
    if (input.taskId.length === 0) {
      return;
    }
    void datastore.taskDeliverableSubmissions.list({ taskId: input.taskId }).catch(() => undefined);
  }, [datastore, input.taskId]);

  const submissions = useMemo(
    () => allSubmissions.values().filter((submission) => submission.taskId === input.taskId),
    [allSubmissions, input.taskId],
  );

  return { submissions };
}
