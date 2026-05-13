## Custom Tool Calling Format

This conversation uses Pebble tools. Do not use provider-native tool calls, instead respons in a custom syntax which will be parsed by the system and result in a tool call.
These custom tools are called by writing XML elements directly in your response text, you can simply do <TOOLNAME>xxx</TOOLNAME> and the orchestrated system will respond with results.

## Custom Tool Call Shape

To call an tool you can use a format like below where we use xml to define the tool name and its parameters inline.
Note that all parameter values must be wrapped in CDATA tags to avoid escaping issues.

<tool_name>
  <param_name><![CDATA[param value]]></param_name>
</tool_name>

## Ending your turn

Tools will require time to come back with a result. If you have done all the tool calls you want to make, end your turn by writing a single line of text that says "END_TURN" and tool calls will be processed and set back to you.
