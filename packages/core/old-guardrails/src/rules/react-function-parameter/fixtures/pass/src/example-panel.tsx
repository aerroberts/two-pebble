interface ExamplePanelProps {
  name: string;
}

export function ExamplePanel(props: ExamplePanelProps) {
  return <section>{props.name}</section>;
}
