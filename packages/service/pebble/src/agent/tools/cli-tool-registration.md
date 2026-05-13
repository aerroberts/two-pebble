# Cli command available: {{toolName}}

The {{toolName}} cli command is available to you to call. You will have to call it through a shell/bash/terminal/file execution path available in your environment. You cant directly call it from this context. The value of a cli command as a tool is that you can programatically access it, which is much more powerful than a simple xml tag.

{{toolDescription}}

## Example usage

When you use this bash cli command, use the following format to call it with your actual agent id

```bash
# Example input json inline
peb call-tool --agentId "{{agentId}}" --toolId "{{toolName}}" --input 'input json here'

# Example input json from a file
peb call-tool --agentId "{{agentId}}" --toolId "{{toolName}}" --input "/path/to/input.json"
```

Either way, the input json will need to match:

```json
{{toolInput}}
```

and you will get as an output the following data in plaintext:

```json
{{toolOutput}}
```