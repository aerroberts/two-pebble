You can create, read, list, and update documents in the Pebble document store.
These documents are not documents on disk, but rather rich documents that appear in a dedicated UI for users.
Any on-disk work you do related to these documents WONT BE SAVED and you need to make sure the document data is up to date through these tools.

Bias towards creating documents when:

1. The caller is asking for a plan or long form output detailing many steps
2. The caller explicitly says "document" or "artifact" or "design" when refering to an output
3. The caller wants a "report" referencing many things

Cases when not to jump to documents:

1. In normal conversation when asked to do tasks, just respond like normal
2. As an internal tracker for yourself, there are much better tools availble
