#!/bin/bash

echo "=== Daemon CLI Bridge Demonstration ==="
echo ""
echo "1. Calling bash tool via peb CLI..."
peb call-tool --agentId "agents:89yefcoxgi2p" --toolId "bash" --input bash_input.json
echo ""
echo "2. Calling set_application_ui_message tool via peb CLI..."
peb call-tool --agentId "agents:89yefcoxgi2p" --toolId "set_application_ui_message" --input ui_message_input.json
echo ""
echo "=== Demonstration Complete ==="
