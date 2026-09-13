import axios from "axios";
import { tool } from "langchain";
import * as z from "zod";

const listFiles = tool(
  async () => {
    console.log("=======================");
    console.log("using list files tool");
    console.log("=======================");

    const response = await axios.get(
      "http://01a09933-cebe-76ce-84c6-5f0dc2985fa3.agent.localhost/list-files",
    );
    console.log("=======================");
    console.log(response.data);
    console.log("=======================");

    return JSON.stringify(response.data.files);
  },
  {
    name: "list_files",
    description:
      "List all the files in the project directory. This is useful for understanding what files are available to work with.",
    schema: z.object({}),
  },
);

// const readFile = tool(
//   async ({ files }) => {
//     console.log("=======================");
//     console.log("using read files tool");
//     console.log("=======================");

//     const response = await axios.get(
//       "http://01a09933-cebe-76ce-84c6-5f0dc2985fa3.agent.localhost/read-files?files=" +
//         files.join(","),
//     );
//     console.log("=======================");
//     console.log(response.data);
//     console.log("=======================");
//     return JSON.stringify(response.data.files);
//   },
//   {
//     name: "read_files",
//     description:
//       "Read the contents of specified files. This is useful for understanding the content of files that are relevant to the task at hand.",
//     schema: z.object({
//       files: z
//         .array(z.string())
//         .describe(
//           "The relative path of the file from the project working directory. These should be files that were listed using the list_files tool or created later",
//         ),
//     }),
//   },
// );

const readFile = tool(
  async ({ files }) => {
    console.log("=======================");
    console.log("using read files tool");
    console.log("=======================");

    const response = await axios.get(
      `http://01a09933-cebe-76ce-84c6-5f0dc2985fa3.agent.localhost/read-files?files=${files.join(",")}`,
    );

    console.log("=======================");
    console.log(response.data);
    console.log("=======================");

    return JSON.stringify(response.data.files);
  },
  {
    name: "read_files",
    description:
      "Read the contents of one or more files from the project workspace. Use relative file paths returned by list_files or paths of files created by the agent.",
    schema: z.object({
      files: z
        .array(z.string())
        .describe(
          "Relative file paths from the project working directory, for example ['src/App.jsx', 'package.json'].",
        ),
    }),
  },
);

// const updateFiles = tool(
//   async ({ files }) => {
//     console.log("=======================");
//     console.log("using update files tool");
//     console.log("=======================");

//     const response = await axios.patch(
//       "http://01a09933-cebe-76ce-84c6-5f0dc2985fa3.agent.localhost/update-files",
//       {
//         updates: files,
//       },
//     );
//     console.log("=======================");
//     console.log(response.data, files);
//     console.log("=======================");
//     return JSON.stringify(response.data.results);
//   },
//   {
//     name: "update_files",
//     description:
//       "Create or update files in the project workspace. Provide the relative file path and the complete new file content. Use this tool when you need to modify existing files or create new files.",
//     schema: z.object({
//       files: z
//         .array(
//           z.object({
//             file: z
//               .string()
//               .describe(
//                 "The new content that should completely replace the file contents",
//               ),
//             content: z
//               .string()
//               .describe("The complete new content of the file as a string."),
//           }),
//         )
//         .describe("The list of files to update and their new contents"),
//     }),
//   },
// );

const updateFiles = tool(
  async ({ files }) => {
    console.log("=======================");
    console.log("using update files tool");
    console.log("=======================");

    const response = await axios.patch(
      "http://01a09933-cebe-76ce-84c6-5f0dc2985fa3.agent.localhost/update-files",
      {
        updates: files,
      },
    );

    console.log("=======================");
    console.log(response.data, files);
    console.log("=======================");

    return JSON.stringify(response.data.results);
  },
  {
    name: "update_files",
 description: `
Modify project files.

IMPORTANT:
- Only modify files that are directly required to fulfill the user's request.
- Before modifying an existing file, you MUST read it using read_files.
- Never modify a file merely because it exists.
- Never modify test files unless the user explicitly requests tests.
- Never modify unrelated files.
- The "file" field must be a relative path from the project root.
- The "content" field must contain the COMPLETE final content of the file.
- Do not use placeholder content.
- Do not overwrite a file with arbitrary or incomplete content.
`,
    schema: z.object({
      files: z.array(
        z.object({
          file: z
            .string()
            .describe(
              "Relative file path from the project working directory, for example 'src/App.jsx'.",
            ),
          content: z.string().describe("The complete new content of the file."),
        }),
      ),
    }),
  },
);

export { listFiles, readFile, updateFiles };
