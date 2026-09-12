import express from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan("dev"));

const WORKDIR = "/workspace";

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Agent server is up and running",
    success: true,
    status: "OK",
  });
});

/**
 * @route GET /list-files
 * @description Lists all the files in the working directory and its subdirectories. Returns a JSON object with the file paths relative to the working directory. Exclude directories like node_modules, .git, dist etc.
 *
 * @example: {
 *    "files": [
 *        "file1.txt",
 *        "src/file2.txt"
 *        "src/subdir/file3.txt"
 *    ]
 * }
 */
app.get("/list-files", async (req, res) => {
  const listFiles = async (dir, baseDir) => {
    const entries = await fs.promises.readdir(dir, {
      withFileTypes: true,
    });

    const files = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);

      // Exclude certain directories
      if (
        entry.isDirectory() &&
        ["node_modules", ".git", "dist"].includes(entry.name)
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        files.push(...(await listFiles(fullPath, baseDir)));
      } else {
        files.push(relativePath);
      }
    }

    return files;
  };

  try {
    const files = await listFiles(WORKDIR, WORKDIR);

    return res.status(200).json({
      message: "Files listed successfully",
      files,
    });
  } catch (error) {
    console.error("Error listing files:", error);

    return res.status(500).json({
      message: `Error listing files: ${error.message}`,
      status: "error",
    });
  }
});

/**
 * @route GET /read-files
 * @description Reads the content of all files requested in the query parameter 'files' and returns their content as a JSON onject.
 * @example /read-files?files=file1.txt,file2.txt
 */
app.get("/read-files", async (req, res) => {
  const files = req.query.files;

  if (!files) {
    return res.status(400).json({
      message: "No files specified in query parameter",
      status: "error",
    });
  }

  const fileList = files.split(",");

  const results = await Promise.all(
    fileList.map(async (file) => {
      const filePath = path.join(WORKDIR, file);

      try {
        const content = await fs.promises.readFile(filePath, "utf-8");
        return {
          [filePath.replace(WORKDIR, '')]: content,
        };
      } catch (error) {
        return {
          [filePath.replace(WORKDIR, "")]:
            `Error reading file: ${error.message}`,
        };
      }
    }),
  );

  return res.status(200).json({
    message: "File contents",
    files: results,
  });
});

/**
 * @route PATCH /update-files
 * @description updates the content of files specified in the request body. The request body should be a JSON array of object, each object should have a 'file' property specifying the file path (relative to the working directory) and a 'content' property specifying the new content for the file.
 *
 */
app.patch("/update-files", async (req, res) => {
  const updates = req.body.updates;

  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({
      message:
        "Invalid request body. Expected a JSON object with an 'updates' property containing an array of file updates.",
      status: "error",
    });
  }

  const result = await Promise.all(
    updates.map(async (update) => {
      const { file, content } = update;
      const filePath = path.join(WORKDIR, file);

      try {
        await fs.promises.writeFile(filePath, content, "utf-8");
        return {
          [filePath]: "File updated successfully",
        };
      } catch (error) {
        return {
          [filePath]: `Error updating file: ${error.message}`,
        };
      }
    }),
  );

  return res.status(200).json({
    message: "File updated results",
    result,
  });
});

/**
 * @route POST /create-file
 * @description Creates new files with the content specified in the request body. The request body should contain a property 'files' with a JSON Array of objects, each object should have a 'file' property specifying the file path (relative to the working directory) and a 'content' property specifying the content for the new file.
 */
/**
 * @route POST /create-files
 * @description Creates new files in the working directory.
 *
 * @body
 * {
 *   "files": [
 *     {
 *       "file": "src/components/Hero.jsx",
 *       "content": "..."
 *     }
 *   ]
 * }
 */

app.post("/create-files", async (req, res) => {
  const files = req.body.files;

  if (!files || !Array.isArray(files)) {
    return res.status(400).json({
      message:
        "Invalid request body. Expected a JSON object with a 'files' array.",
      status: "error",
    });
  }

  if (files.length === 0) {
    return res.status(400).json({
      message: "No files provided.",
      status: "error",
    });
  }

  const results = await Promise.all(
    files.map(async (fileObj) => {
      const { file, content } = fileObj;

      // Validate input
      if (typeof file !== "string" || typeof content !== "string") {
        return {
          file,
          success: false,
          error: "'file' and 'content' must be strings.",
        };
      }

      // Resolve path safely
      const filePath = path.resolve(WORKDIR, file);

      // Prevent path traversal
      if (
        filePath !== WORKDIR &&
        !filePath.startsWith(`${WORKDIR}${path.sep}`)
      ) {
        return {
          file,
          success: false,
          error: "Invalid file path.",
        };
      }

      try {
        // Create parent directories if necessary
        await fs.promises.mkdir(path.dirname(filePath), {
          recursive: true,
        });

        // Create file
        await fs.promises.writeFile(filePath, content, "utf-8");

        return {
          file,
          success: true,
          message: "File created successfully",
        };
      } catch (error) {
        return {
          file,
          success: false,
          error: error.message,
        };
      }
    }),
  );

  return res.status(201).json({
    message: "File creation results",
    results,
  });
});

export default app;
