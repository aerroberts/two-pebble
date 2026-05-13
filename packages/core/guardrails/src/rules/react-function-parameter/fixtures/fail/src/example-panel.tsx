interface ExamplePanelProps {
  name: string;
}

export function ExamplePanel({ name }: ExamplePanelProps) {
  return <section>{name}</section>;
}

export function InlinePropsPanel(props: {
  integrationOptions: Array<{ icon: JSX.Element; label: string; value: string }>;
  name: string;
  onNameChange: (name: string) => void;
}) {
  return <section>{props.name}</section>;
}
