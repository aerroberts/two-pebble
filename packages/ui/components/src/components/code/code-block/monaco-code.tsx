'use client';

import Editor, { type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useRef, useState, useSyncExternalStore } from 'react';

import { getIsDark, subscribeToTheme } from './theme-observer';

interface MonacoCodeProps {
  code: string;
  language: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  minHeight?: number;
  maxHeight?: number;
}

const DEFAULT_MIN_HEIGHT = 40;
const DEFAULT_MAX_HEIGHT = 800;
const INITIAL_HEIGHT = 80;

export function MonacoCode(props: MonacoCodeProps) {
  const isDark = useSyncExternalStore(subscribeToTheme, getIsDark, () => false);
  const minHeight = props.minHeight ?? DEFAULT_MIN_HEIGHT;
  const maxHeight = props.maxHeight ?? DEFAULT_MAX_HEIGHT;
  const [height, setHeight] = useState(INITIAL_HEIGHT);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const updateHeight = () => {
    if (!editorRef.current) return;
    const contentHeight = editorRef.current.getContentHeight();
    setHeight(Math.max(minHeight, Math.min(maxHeight, contentHeight)));
  };

  const handleMount: OnMount = (ed) => {
    editorRef.current = ed;
    updateHeight();
    ed.onDidContentSizeChange(() => updateHeight());
  };

  const readOnly = props.readOnly ?? true;

  return (
    <Editor
      height={`${height}px`}
      language={props.language}
      value={props.code}
      onChange={(val) => props.onChange?.(val ?? '')}
      onMount={handleMount}
      theme={isDark ? 'vs-dark' : 'vs-light'}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        scrollbar: { alwaysConsumeMouseWheel: false },
        renderLineHighlight: readOnly ? 'none' : 'line',
      }}
    />
  );
}
