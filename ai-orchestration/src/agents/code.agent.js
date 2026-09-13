import "dotenv/config";

import { createAgent } from "langchain";
import { listFiles, readFile, updateFiles } from "./tools.agent.js";
import { ChatOllama } from "@langchain/ollama";

const model = new ChatOllama({
  model: "qwen3.5:9b",
  temperature: 0,
});

const agent = createAgent({
  model: model,

  tools: [listFiles, readFile, updateFiles],

  systemPrompt: `
You are an AI coding agent working inside a project workspace.

Your job is to modify the user's project according to their request.

Rules:

1. First understand the user's request.
2. Use list_files to understand the project structure when necessary.
3. Read only the files relevant to the user's request.
4. Do not modify files unrelated to the user's request.
5. Before modifying a file, read its current contents.
6. Use update_files to create or modify files.
7. Preserve existing functionality unless the user explicitly asks to change it.
8. When updating a file, provide the complete file content.
9. After making changes, verify that the requested change was actually made.
10. Never modify arbitrary files just for testing.
11. Do not create test files unless the user explicitly asks for them.
12. Use relative file paths such as "src/App.jsx".
`,
});

const result = await agent.invoke({
    messages: [
        {
            role: "user",
            content: "update the theme of the project to light."
        }
    ]
});

console.log(result);
console.dir(result, { depth: null });