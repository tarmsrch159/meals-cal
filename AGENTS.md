# AGENTS.md

## Primary Goal

Complete the requested task correctly while minimizing token usage,
context usage, unnecessary file reads, tool calls, and code changes.

Always prefer the smallest correct solution.

---

## Core Rules

- Read only files relevant to the current task.
- Do NOT scan the entire repository unless absolutely necessary.
- Do NOT recursively inspect directories without a clear reason.
- Search for filenames, symbols, routes, functions, components, or keywords first.
- Open only the files or code sections needed.
- Avoid reading large files completely when a relevant section is enough.
- Do NOT reread files unless they changed or important context is missing.
- Reuse information already discovered during the current task.
- Do NOT investigate unrelated code.
- Stop exploring once enough information is available to implement safely.

---

## Before Coding

Follow this order:

1. Understand the user's exact request.
2. Identify the likely affected area.
3. Search for relevant symbols/files.
4. Read the minimum required code.
5. Understand existing patterns from nearby code.
6. Make the smallest safe change.
7. Validate only what is relevant.
8. Stop when the task is complete.

Do NOT perform a full project analysis before simple tasks.

---

## Repository Exploration

Prefer targeted exploration.

Good:

- Search for the exact function name.
- Search for the route being modified.
- Search for the component being discussed.
- Search for the database table name.
- Search for imports/usages before modifying shared code.
- Inspect nearby files only when needed to understand an existing pattern.

Avoid:

- Reading every file in `src`.
- Reading every controller.
- Reading every model.
- Reading every route.
- Reading every migration.
- Reading all documentation.
- Exploring unrelated modules "just in case".

If the target file is already known, inspect it directly.

---

## Context Efficiency

Treat context as limited and expensive.

Keep only information necessary for the current task.

Do not repeatedly restate:

- the user's request
- repository structure
- code already inspected
- conclusions already established
- implementation plans already agreed upon

When previous findings are still valid, reuse them instead of verifying them again.

Do not generate large internal inventories of files unless necessary.

---

## Editing Strategy

Prefer minimal patches.

- Modify existing code instead of rewriting entire files.
- Preserve existing architecture.
- Preserve existing naming conventions.
- Preserve existing formatting and style.
- Preserve existing APIs unless a change is required.
- Preserve existing behavior outside the requested task.
- Avoid unrelated cleanup.
- Avoid opportunistic refactoring.
- Avoid renaming unrelated variables.
- Avoid moving files unless required.
- Avoid formatting entire files for a small change.
- Avoid changing working code without a reason.

If 5 lines can solve the problem safely, do not rewrite 100 lines.

---

## Architecture

Follow the architecture already used by the project.

Do NOT introduce:

- new architectural layers
- new abstractions
- new design patterns
- new libraries
- new frameworks
- new helper systems

unless they are necessary for the requested task.

Prefer existing project patterns over theoretically "better" architecture.

---

## Dependencies

Do NOT install new dependencies unless necessary.

Before adding a dependency:

1. Check whether the project already has a solution.
2. Check whether the standard library/framework can handle it.
3. Add a dependency only when it provides clear value.

Do not upgrade unrelated dependencies.

Do not regenerate lockfiles unless dependency changes require it.

---

## Documentation

Do NOT read all documentation automatically.

Read documentation only when relevant to the current task.

Example:

- architecture changes → architecture documentation
- database changes → database/schema documentation
- API changes → API documentation
- deployment changes → deployment documentation
- authentication changes → authentication documentation

Do not read unrelated docs.

Do NOT create or update documentation unless:

- the user requested it
- the change makes existing documentation incorrect
- project instructions explicitly require it

---

## Database Tasks

For database-related tasks:

1. Identify the relevant table/model/schema.
2. Inspect only related migrations/schema definitions.
3. Inspect related queries/services.
4. Make the minimum required database change.

Do NOT inspect the entire database schema unless necessary.

Do NOT modify unrelated tables.

Do NOT create migrations unless schema changes are actually required.

Preserve existing naming and relationship conventions.

Always prefer parameterized SQL queries.

Never concatenate request data directly into SQL.

Correct:

```js
const script = `
  SELECT *
  FROM tbl_example
  WHERE example_code = $1
`;

const result = await pgGetWithParams({
  script,
  params: [example_code],
});
```

Avoid:

```js
const script = `
  SELECT *
  FROM tbl_example
  WHERE example_code = '${example_code}'
`;
```

---

## Backend Tasks

For backend changes, trace only the relevant request path.

Typical order:

Route
→ Controller
→ Service
→ Model/Repository
→ Database

Only inspect layers that actually exist in the project.

Do not inspect every route/controller/service.

When debugging an endpoint:

1. Find the route.
2. Trace its handler.
3. Trace only functions called by that handler.
4. Inspect database/API interactions involved.
5. Fix the root cause with the smallest change.

---

# Backend Service / CRUD Pattern

When creating or modifying backend services, controllers, CRUD endpoints, or database operations, use this pattern as the primary coding reference.

This pattern should be followed unless:

- the user explicitly requests another approach
- the target module already requires a different architecture
- the business logic requires a different implementation

Do not introduce a different service architecture simply because it is theoretically cleaner.

---

## General Service Structure

Prefer this execution order:

Request
→ Validate Parameters
→ Extract Parameters
→ Build SQL / Params
→ Duplicate Check if required
→ Execute Database Query
→ Check Database Result
→ Format Response
→ Send Response
→ Catch Unexpected Errors

Use existing project utilities where applicable:

```js
pgGetWithParams
pgExecuteWithParams
formatResponse
logMessage
```

Do not replace these utilities with another database abstraction unless explicitly required.

---

# HTTP Method Convention

Follow the project's existing API convention.

Primary CRUD convention:

```text
POST   → Get / List Data
PUT    → Add Data
PATCH  → Update Data
DELETE → Remove Data
```

Do NOT automatically replace this with conventional REST mappings if the project already follows the pattern above.

When editing an existing endpoint, preserve its existing HTTP method.

---

# POST - Get / List Data Pattern

For list/search endpoints, use the following pattern.

Expected capabilities when applicable:

- search
- pagination
- dynamic WHERE
- parameterized query
- COUNT query
- `rows_total`
- `page_total`
- null normalization
- formatted response
- error logging

Preferred starting structure:

```js
export const getAllExample = async (req, res, next) => {
  try {
    const {
      search = "",
      page_index = 1,
      page_limit = 10,
    } = req.query;

    const limit = parseInt(page_limit, 10) || 10;
    const page = parseInt(page_index, 10) || 1;
    const offset = (page - 1) * limit;

    const params = [];
    const whereConditions = [
      "example.example_flag IN ('1', '2')",
    ];

    if (search && String(search).trim() !== "") {
      params.push(
        `%${String(search).trim().toLowerCase()}%`,
      );

      const searchIdx = params.length;

      whereConditions.push(`
        (
          LOWER(example.example_code) LIKE $${searchIdx}
          OR LOWER(example.example_desc_th) LIKE $${searchIdx}
          OR LOWER(example.example_desc_en) LIKE $${searchIdx}
        )
      `);
    }

    const whereClause = whereConditions.join(" AND ");

    params.push(limit);
    const limitIdx = params.length;

    params.push(offset);
    const offsetIdx = params.length;

    const script = `
      SELECT
        example.example_code,
        example.example_desc_th,
        example.example_desc_en,
        example.example_flag,
        example.mdf_dt,
        example.ist_dt,
        example.rm_dt
      FROM tbl_example example
      WHERE ${whereClause}
      ORDER BY example.ist_dt, example.example_code ASC
      LIMIT $${limitIdx}
      OFFSET $${offsetIdx};
    `;

    const resulted = await pgGetWithParams({
      script,
      params,
    });

    if (resulted.error) {
      logMessage(
        "error",
        "Failed to get all example",
        {
          error: resulted.message,
        },
      );

      const errorResponse = formatResponse({
        status: "error",
        message: "ไม่สามารถดึงข้อมูลได้",
        data: [],
        rows_total: 0,
        page_total: 0,
      });

      return res.status(500).send(errorResponse);
    }

    const countParams = params.slice(
      0,
      params.length - 2,
    );

    const scriptCount = `
      SELECT COUNT(example.example_code)::int AS count
      FROM tbl_example example
      WHERE ${whereClause};
    `;

    const resultedCount = await pgGetWithParams({
      script: scriptCount,
      params: countParams,
    });

    if (resultedCount.error) {
      logMessage(
        "error",
        "Failed to get all example count",
        {
          error: resultedCount.message,
        },
      );

      const errorResponse = formatResponse({
        status: "error",
        message: "ไม่สามารถดึงข้อมูลได้",
        data: [],
        rows_total: 0,
        page_total: 0,
      });

      return res.status(500).send(errorResponse);
    }

    const rows_total = parseInt(
      resultedCount.data[0]?.count || 0,
      10,
    );

    const page_total = Math.ceil(
      rows_total / limit,
    );

    resulted.data = JSON.parse(
      JSON.stringify(resulted.data).replace(
        /\:null/gi,
        ':""',
      ),
    );

    const successResponse = formatResponse({
      status: "success",
      message: "",
      data: resulted.data,
      rows_total,
      page_total,
    });

    return res.status(200).send(successResponse);
  } catch (error) {
    logMessage(
      "error",
      "Catch in get all example",
      {
        error: error.message,
      },
    );

    const errorResponse = formatResponse({
      status: "error",
      invalidCode: "-99",
      message: "internal server error",
    });

    return res.status(500).send(errorResponse);
  }
};
```

---

## Search Pattern

Build search parameters dynamically.

Preferred:

```js
if (search && String(search).trim() !== "") {
  params.push(
    `%${String(search).trim().toLowerCase()}%`,
  );

  const searchIdx = params.length;

  whereConditions.push(`
    (
      LOWER(table.column_a) LIKE $${searchIdx}
      OR LOWER(table.column_b) LIKE $${searchIdx}
      OR LOWER(table.column_c) LIKE $${searchIdx}
    )
  `);
}
```

Do not manually assume `$1`, `$2`, `$3` when query conditions are dynamic.

Use:

```js
const searchIdx = params.length;
```

and then:

```js
$${searchIdx}
```

---

## Pagination Pattern

Default:

```js
const {
  page_index = 1,
  page_limit = 10,
} = req.query;

const limit = parseInt(page_limit, 10) || 10;
const page = parseInt(page_index, 10) || 1;
const offset = (page - 1) * limit;
```

Add pagination parameters after search/filter parameters:

```js
params.push(limit);
const limitIdx = params.length;

params.push(offset);
const offsetIdx = params.length;
```

SQL:

```sql
LIMIT $${limitIdx}
OFFSET $${offsetIdx}
```

Do not directly inject `limit` or `offset` values into SQL.

---

## COUNT Pattern

When pagination is used, execute a separate COUNT query.

The COUNT query must use the same filtering conditions as the main query.

Do NOT include LIMIT/OFFSET parameters.

Preferred:

```js
const countParams = params.slice(
  0,
  params.length - 2,
);
```

Then:

```js
const scriptCount = `
  SELECT COUNT(example_code)::int AS count
  FROM tbl_example
  WHERE ${whereClause};
`;
```

Calculate:

```js
const rows_total = parseInt(
  resultedCount.data[0]?.count || 0,
  10,
);

const page_total = Math.ceil(
  rows_total / limit,
);
```

---

# PUT - Add Data Pattern

For create operations:

1. Validate required parameters.
2. Extract values.
3. Query database directly for duplicate data if required.
4. Handle duplicate database query errors.
5. Return `invalidCode: "-2"` for duplicate business data.
6. Execute INSERT.
7. Check `result.error`.
8. Check `result.rowaction`.
9. Return formatted response.

Preferred structure:

```js
export const addExample = async (req, res, next) => {
  try {
    if (
      req.body?.[0].example_code == undefined ||
      req.body?.[0].example_name == undefined ||
      req.body?.[0].example_code == ""
    ) {
      const errorResponse = formatResponse({
        status: "error",
        invalidCode: "-1",
        message:
          "ไม่สามารถเพิ่มข้อมูลได้, เนื่องจากข้อมูลพารามิเตอร์ไม่ถูกต้อง",
        data: [],
      });

      return res.status(400).send(errorResponse);
    }

    const {
      example_code,
      example_name,
    } = req.body[0];

    const duplicateScript = `
      SELECT example_code
      FROM tbl_example
      WHERE example_code = $1
        AND example_flag IN ('1', '2')
      LIMIT 1;
    `;

    const duplicateResult = await pgGetWithParams({
      script: duplicateScript,
      params: [example_code],
    });

    if (duplicateResult.error) {
      logMessage(
        "error",
        "Failed to check duplicate example",
        {
          error: duplicateResult.message,
        },
      );

      const errorResponse = formatResponse({
        status: "error",
        message: "ไม่สามารถตรวจสอบข้อมูลซ้ำได้",
      });

      return res.status(500).send(errorResponse);
    }

    if (duplicateResult.data?.length > 0) {
      const errorResponse = formatResponse({
        status: "error",
        invalidCode: "-2",
        message:
          "ไม่สามารถเพิ่มข้อมูลได้, example code ซ้ำกับข้อมูลเดิม",
      });

      return res.status(400).send(errorResponse);
    }

    const script = `
      INSERT INTO tbl_example (
        example_code,
        example_name,
        example_flag
      )
      VALUES ($1, $2, $3)
      RETURNING example_code;
    `;

    const result = await pgExecuteWithParams({
      script,
      params: [
        example_code,
        example_name,
        "1",
      ],
    });

    if (result.error || result.rowaction <= 0) {
      logMessage(
        "error",
        "Failed to add example",
        {
          error: result.message,
        },
      );

      const errorResponse = formatResponse({
        status: "error",
        message: "ไม่สามารถเพิ่มข้อมูลได้",
      });

      return res.status(500).send(errorResponse);
    }

    const successResponse = formatResponse({
      status: "success",
      message: "เพิ่มข้อมูลเรียบร้อยแล้ว",
      data: result.data,
    });

    return res.status(200).send(successResponse);
  } catch (error) {
    logMessage(
      "error",
      "Catch in add example",
      {
        error: error.message,
      },
    );

    const errorResponse = formatResponse({
      status: "error",
      invalidCode: "-99",
      message: "internal server error",
    });

    return res.status(500).send(errorResponse);
  }
};
```

---

# Duplicate Data Checking

## Important Rule

When checking duplicate database records:

**DO NOT use generic duplicate helper functions such as `checkDuplicate()`.**

Avoid:

```js
const [existingCode] = await Promise.all([
  checkDuplicate({
    name: example_code,
  }),
]);

if (existingCode) {
  // duplicate
}
```

Also avoid creating a new helper merely to wrap a simple duplicate SELECT.

Instead, query the database directly inside the relevant service/controller.

---

## Preferred Duplicate Pattern

Use:

```js
const duplicateScript = `
  SELECT example_code
  FROM tbl_example
  WHERE example_code = $1
    AND example_flag IN ('1', '2')
  LIMIT 1;
`;

const duplicateResult = await pgGetWithParams({
  script: duplicateScript,
  params: [example_code],
});
```

First check query errors:

```js
if (duplicateResult.error) {
  logMessage(
    "error",
    "Failed to check duplicate example",
    {
      error: duplicateResult.message,
    },
  );

  const errorResponse = formatResponse({
    status: "error",
    message: "ไม่สามารถตรวจสอบข้อมูลซ้ำได้",
  });

  return res.status(500).send(errorResponse);
}
```

Then check duplicate data:

```js
if (duplicateResult.data?.length > 0) {
  const errorResponse = formatResponse({
    status: "error",
    invalidCode: "-2",
    message:
      "ไม่สามารถเพิ่มข้อมูลได้, example code ซ้ำกับข้อมูลเดิม",
  });

  return res.status(400).send(errorResponse);
}
```

---

## Duplicate Query Rules

Duplicate checks must:

- Query the database at request time.
- Use `pgGetWithParams`.
- Use parameterized SQL.
- Query only relevant duplicate columns.
- Respect the table's flag/status business rules.
- Use `LIMIT 1` when only existence is needed.
- Handle database errors separately.
- Never treat database errors as "not duplicate".
- Avoid unnecessary joins.
- Avoid fetching unnecessary columns.
- Avoid generic duplicate helpers for simple duplicate checks.

Prefer:

```sql
SELECT example_code
```

instead of:

```sql
SELECT *
```

when only existence needs to be checked.

---

# Duplicate Check During Update

When updating a record and checking a field that must remain unique, exclude the current record.

Example:

```js
const duplicateScript = `
  SELECT example_code
  FROM tbl_example
  WHERE example_name = $1
    AND example_code <> $2
    AND example_flag IN ('1', '2')
  LIMIT 1;
`;

const duplicateResult = await pgGetWithParams({
  script: duplicateScript,
  params: [
    example_name,
    example_code,
  ],
});
```

This prevents the current record from detecting itself as duplicate.

Only perform duplicate checking when the field actually has a duplicate business constraint.

Do not add meaningless duplicate queries.

---

# PATCH - Update Data Pattern

For update operations:

1. Validate required parameters.
2. Validate the record identifier.
3. Extract body/query parameters.
4. Perform direct database duplicate check if required.
5. Exclude the current record from duplicate checking.
6. Execute UPDATE.
7. Set `mdf_dt = CURRENT_TIMESTAMP` when the table uses this convention.
8. Respect active flag conditions.
9. Use `RETURNING`.
10. Check database error and `rowaction`.
11. Return formatted response.

Preferred structure:

```js
export const updateExample = async (
  req,
  res,
  next,
) => {
  try {
    if (
      req.body?.[0].example_name == undefined
    ) {
      const errorResponse = formatResponse({
        status: "error",
        invalidCode: "-1",
        message:
          "ไม่สามารถแก้ไขข้อมูลได้, เนื่องจากข้อมูลพารามิเตอร์ไม่ถูกต้อง",
        data: [],
      });

      return res.status(400).send(errorResponse);
    }

    const {
      example_name,
    } = req.body[0];

    const {
      example_code,
    } = req.query;

    if (
      example_code == undefined ||
      example_code == ""
    ) {
      const errorResponse = formatResponse({
        status: "error",
        invalidCode: "-1",
        message:
          "ไม่สามารถแก้ไขข้อมูลได้, เนื่องจากข้อมูลพารามิเตอร์ไม่ถูกต้อง",
        data: [],
      });

      return res.status(400).send(errorResponse);
    }

    const duplicateScript = `
      SELECT example_code
      FROM tbl_example
      WHERE example_name = $1
        AND example_code <> $2
        AND example_flag IN ('1', '2')
      LIMIT 1;
    `;

    const duplicateResult = await pgGetWithParams({
      script: duplicateScript,
      params: [
        example_name,
        example_code,
      ],
    });

    if (duplicateResult.error) {
      logMessage(
        "error",
        "Failed to check duplicate example",
        {
          error: duplicateResult.message,
        },
      );

      const errorResponse = formatResponse({
        status: "error",
        message: "ไม่สามารถตรวจสอบข้อมูลซ้ำได้",
      });

      return res.status(500).send(errorResponse);
    }

    if (duplicateResult.data?.length > 0) {
      const errorResponse = formatResponse({
        status: "error",
        invalidCode: "-2",
        message: "ข้อมูลซ้ำกับข้อมูลเดิม",
      });

      return res.status(400).send(errorResponse);
    }

    const script = `
      UPDATE tbl_example
      SET
        example_name = $1,
        mdf_dt = CURRENT_TIMESTAMP
      WHERE example_code = $2
        AND example_flag = '1'
      RETURNING example_code;
    `;

    const result = await pgExecuteWithParams({
      script,
      params: [
        example_name,
        example_code,
      ],
    });

    if (result.error || result.rowaction <= 0) {
      logMessage(
        "error",
        "Failed to update example",
        {
          error: result.message,
        },
      );

      const errorResponse = formatResponse({
        status: "error",
        message: "ไม่สามารถแก้ไขข้อมูลได้",
      });

      return res.status(500).send(errorResponse);
    }

    const successResponse = formatResponse({
      status: "success",
      message: "แก้ไขข้อมูลสำเร็จ",
      data: result.data,
    });

    return res.status(200).send(successResponse);
  } catch (error) {
    logMessage(
      "error",
      "Catch in update example",
      {
        error: error.message,
      },
    );

    const errorResponse = formatResponse({
      status: "error",
      invalidCode: "-99",
      message: "internal server error",
    });

    return res.status(500).send(errorResponse);
  }
};
```

---

# DELETE - Remove Data Pattern

Prefer soft delete when the table uses flag-based deletion.

Do NOT physically delete records unless business requirements explicitly require it.

Preferred structure:

```js
export const deleteExample = async (
  req,
  res,
  next,
) => {
  try {
    if (
      !req.body?.[0] ||
      !req.body?.[0].example_code
    ) {
      const errorResponse = formatResponse({
        status: "error",
        invalidCode: "-1",
        message:
          "ไม่สามารถลบข้อมูลได้, เนื่องจากข้อมูลพารามิเตอร์ไม่ถูกต้อง",
        data: [],
      });

      return res.status(400).send(errorResponse);
    }

    const {
      example_code,
    } = req.body[0];

    const script = `
      UPDATE tbl_example
      SET
        example_flag = '0',
        rm_dt = CURRENT_TIMESTAMP
      WHERE example_code = $1
        AND example_flag = '1'
      RETURNING example_code;
    `;

    const result = await pgExecuteWithParams({
      script,
      params: [example_code],
    });

    if (result.error || result.rowaction <= 0) {
      logMessage(
        "error",
        "Failed to delete example",
        {
          error: result.message,
        },
      );

      const errorResponse = formatResponse({
        status: "error",
        message: "ไม่สามารถลบข้อมูลได้",
      });

      return res.status(500).send(errorResponse);
    }

    const successResponse = formatResponse({
      status: "success",
      message: "ลบข้อมูลสำเร็จ",
    });

    return res.status(200).send(successResponse);
  } catch (error) {
    logMessage(
      "error",
      "Catch in delete example",
      {
        error: error.message,
      },
    );

    const errorResponse = formatResponse({
      status: "error",
      invalidCode: "-99",
      message: "internal server error",
    });

    return res.status(500).send(errorResponse);
  }
};
```

---

# Soft Delete Rule

When the existing table uses flag-based deletion, prefer:

```sql
UPDATE tbl_example
SET
  example_flag = '0',
  rm_dt = CURRENT_TIMESTAMP
WHERE example_code = $1
  AND example_flag = '1'
RETURNING example_code;
```

Do NOT automatically use:

```sql
DELETE FROM tbl_example
WHERE example_code = $1;
```

Physical DELETE should only be used when the existing business logic explicitly requires it.

---

# Flag Convention

When a table follows the project's flag convention, preserve it.

Typical pattern:

```text
'0' = removed / inactive
'1' = active
'2' = another valid business state
```

Do NOT assume the exact business meaning of `'2'`.

Inspect the related service/table usage when necessary.

GET/list queries may commonly use:

```sql
flag IN ('1', '2')
```

Duplicate queries may commonly use:

```sql
flag IN ('1', '2')
```

UPDATE may commonly use:

```sql
flag = '1'
```

DELETE may commonly use:

```sql
flag = '1'
```

and change it to:

```sql
flag = '0'
```

Preserve existing table-specific behavior.

---

# Timestamp Convention

When the table contains standard audit timestamps, preserve the existing convention.

Typical fields:

```text
ist_dt = insert/create datetime
mdf_dt = modified datetime
rm_dt  = removed datetime
```

For UPDATE:

```sql
mdf_dt = CURRENT_TIMESTAMP
```

For soft DELETE:

```sql
rm_dt = CURRENT_TIMESTAMP
```

Do not manually generate application timestamps when PostgreSQL already manages them through `CURRENT_TIMESTAMP`, unless existing code requires otherwise.

---

# NULL / Empty Date Handling

When an optional timestamp may arrive as an empty string, prefer the existing PostgreSQL pattern:

```sql
NULLIF($1, '')::timestamp
```

Example:

```sql
INSERT INTO tbl_example (
  example_date
)
VALUES (
  NULLIF($1, '')::timestamp
);
```

Do not convert an empty string directly to timestamp.

---

# Database Query Pattern

## SELECT

Use:

```js
const result = await pgGetWithParams({
  script,
  params,
});
```

Check:

```js
if (result.error) {
  // log + error response
}
```

An empty SELECT result is not automatically an error.

---

## INSERT / UPDATE / DELETE

Use:

```js
const result = await pgExecuteWithParams({
  script,
  params,
});
```

Check:

```js
if (result.error || result.rowaction <= 0) {
  // log + error response
}
```

Do not ignore `rowaction`.

---

# SQL Parameter Rules

Always use parameterized queries.

Correct:

```js
const script = `
  SELECT example_code
  FROM tbl_example
  WHERE example_code = $1
`;

const result = await pgGetWithParams({
  script,
  params: [example_code],
});
```

Incorrect:

```js
const script = `
  SELECT example_code
  FROM tbl_example
  WHERE example_code = '${example_code}'
`;
```

Never directly interpolate:

- `req.body`
- `req.query`
- `req.params`
- user search values
- identifiers supplied by users

into SQL values.

Dynamic SQL structure such as generated WHERE conditions may be constructed in code, but actual user values must remain parameterized.

---

# Validation Pattern

Follow the existing project's lightweight validation style unless another validation system already exists in the target module.

Example:

```js
if (
  req.body?.[0].example_code == undefined ||
  req.body?.[0].example_name == undefined ||
  req.body?.[0].example_code == ""
) {
  const errorResponse = formatResponse({
    status: "error",
    invalidCode: "-1",
    message:
      "ไม่สามารถดำเนินการได้, เนื่องจากข้อมูลพารามิเตอร์ไม่ถูกต้อง",
    data: [],
  });

  return res.status(400).send(errorResponse);
}
```

Do not introduce Joi, Zod, Yup, or another validation library merely for a small endpoint unless the project already uses it.

Preserve existing request structure.

If the existing API uses:

```js
req.body[0]
```

continue using it unless the user explicitly requests an API contract change.

---

# Response Pattern

Always prefer the project's `formatResponse`.

---

## Invalid Parameters

Use:

```js
const errorResponse = formatResponse({
  status: "error",
  invalidCode: "-1",
  message:
    "ไม่สามารถดำเนินการได้, เนื่องจากข้อมูลพารามิเตอร์ไม่ถูกต้อง",
  data: [],
});

return res.status(400).send(errorResponse);
```

---

## Duplicate Data

Use:

```js
const errorResponse = formatResponse({
  status: "error",
  invalidCode: "-2",
  message: "ข้อมูลซ้ำกับข้อมูลเดิม",
});

return res.status(400).send(errorResponse);
```

Endpoint-specific Thai messages should be preserved when modifying existing code.

---

## Database Error

Example:

```js
const errorResponse = formatResponse({
  status: "error",
  message: "ไม่สามารถดำเนินการได้",
});

return res.status(500).send(errorResponse);
```

---

## Unexpected Exception

Use:

```js
const errorResponse = formatResponse({
  status: "error",
  invalidCode: "-99",
  message: "internal server error",
});

return res.status(500).send(errorResponse);
```

---

## Success

Example:

```js
const successResponse = formatResponse({
  status: "success",
  message: "ดำเนินการสำเร็จ",
  data: result.data,
});

return res.status(200).send(successResponse);
```

Preserve existing endpoint-specific messages whenever possible.

---

# Error Logging Pattern

Database errors should use:

```js
logMessage(
  "error",
  "Failed to add example",
  {
    error: result.message,
  },
);
```

Unexpected exceptions should use:

```js
logMessage(
  "error",
  "Catch in add example",
  {
    error: error.message,
  },
);
```

Do not log:

- passwords
- access tokens
- refresh tokens
- API keys
- authorization headers
- secrets
- private credentials

Do not add unnecessary success logging unless the module already requires it.

---

# JOIN Pattern

When related information is required, preserve explicit JOIN conditions.

Example:

```sql
SELECT
  air.acraft_code,
  air.acraft_aline_icao_code,
  air.acraft_aline_iata_code,
  aline.aline_desc_th,
  aline.aline_desc_en
FROM tbl_aircraft air
LEFT JOIN tbl_airline aline
  ON air.acraft_aline_icao_code = aline.aline_icao_code
  AND air.acraft_aline_iata_code = aline.aline_iata_code
  AND aline.aline_flag IN ('1', '2')
WHERE air.acraft_flag IN ('1', '2');
```

Do not move JOIN business conditions into unrelated places unless required.

Avoid unnecessary JOINs in:

- duplicate queries
- existence checks
- simple UPDATE operations
- simple DELETE operations

---

# Service Coding Priority

When generating or modifying backend code, use this priority:

1. User's explicit request.
2. Backend Service / CRUD Pattern in this file.
3. Existing pattern in the target module.
4. Existing project architecture.
5. General engineering best practices.

Do NOT replace the project's service style merely because another architecture is theoretically cleaner.

In particular, do not automatically introduce:

- ORM
- Prisma
- Sequelize
- TypeORM
- Knex
- Repository pattern
- DAO layer
- query builder
- generic CRUD abstraction
- generic duplicate helper
- validation framework
- additional service layers

unless explicitly required.

---

# Default CRUD Reference

For new CRUD work, think in this form:

```text
POST
Get/List
↓
query params
↓
search
↓
whereConditions
↓
parameterized SELECT
↓
COUNT
↓
rows_total/page_total
↓
formatResponse
```

```text
PUT
Add
↓
validate
↓
extract body
↓
direct duplicate SELECT
↓
INSERT
↓
RETURNING
↓
formatResponse
```

```text
PATCH
Update
↓
validate
↓
extract body/query
↓
direct duplicate SELECT
↓
exclude current record
↓
UPDATE
↓
mdf_dt
↓
RETURNING
↓
formatResponse
```

```text
DELETE
Remove
↓
validate
↓
soft DELETE via UPDATE
↓
flag = '0'
↓
rm_dt
↓
RETURNING
↓
formatResponse
```

This is the default service pattern.

---

# Frontend Tasks

For frontend changes:

1. Find the target page/component.
2. Inspect its direct dependencies when necessary.
3. Inspect related store/API code only if the behavior depends on them.
4. Modify the smallest relevant component set.

Do NOT inspect the entire component tree.

Do NOT redesign unrelated UI.

Preserve the project's existing:

- component patterns
- state management
- styling approach
- naming conventions
- API patterns

---

## Bug Fixing

When fixing bugs:

1. Reproduce or understand the reported behavior.
2. Locate the most likely source.
3. Trace only the relevant execution path.
4. Identify the root cause.
5. Apply the smallest safe fix.
6. Test the affected behavior.

Do not refactor surrounding code unless required for the fix.

Do not fix unrelated bugs unless the user asks.

If another serious issue is discovered, mention it briefly instead of automatically expanding the task.

---

## Error Investigation

Start from the actual error.

Prefer:

Error message
→ Stack trace
→ Relevant function
→ Caller
→ Related state/data

Do NOT begin with a full repository scan.

Search exact error messages before broad investigation.

---

## Testing

Run the smallest useful validation first.

Prefer:

- targeted test
- affected module test
- type check for affected code
- lint on affected files
- relevant build step

Avoid expensive full-project commands unless necessary.

Do NOT repeatedly run the same test when nothing relevant changed.

If a targeted test passes and broader validation is unnecessary, stop.

---

## Build Commands

Do not run full builds automatically after every small edit.

Run a full build when:

- the change can affect compilation globally
- targeted validation is unavailable
- project instructions require it
- the user explicitly asks

Avoid repeated builds.

---

## Tool Usage

Minimize tool calls.

Before calling a tool, ask:

"Do I already have enough information?"

If yes, continue without another call.

Prefer one targeted search over several broad searches.

Batch related searches when practical.

Do not call tools merely to confirm information already established.

---

## Large Files

For large files:

- search inside the file first
- inspect relevant ranges
- avoid loading the entire file when possible

Read additional sections only when dependencies require it.

---

## Generated Files

Do NOT generate unnecessary files.

Do not create:

- summaries
- reports
- temporary documentation
- architecture documents
- changelogs
- helper scripts

unless required by the task.

Clean up temporary files if they were needed during implementation.

---

## Comments

Do not over-comment code.

Add comments only when they explain:

- non-obvious behavior
- important business rules
- unusual constraints
- necessary workarounds

Do not add comments that simply restate the code.

Good:

```js
// Exclude current record from duplicate check
```

Avoid:

```js
// Set example_name to $1
```

---

## Refactoring

Do NOT refactor unrelated code.

Refactor only when:

- required to implement the requested change safely
- existing structure directly prevents the change
- the user explicitly requests refactoring

Keep refactoring scope minimal.

---

## Security

Do not weaken existing security for convenience.

Never expose:

- passwords
- tokens
- API keys
- secrets
- private credentials

Do not hardcode secrets.

Preserve existing authentication and authorization behavior unless the task explicitly changes it.

Always use parameterized SQL for request-derived database values.

---

## Configuration

Avoid modifying configuration unless necessary.

Before changing configuration:

1. Confirm it affects the requested behavior.
2. Prefer the smallest configuration change.
3. Avoid touching unrelated environments/settings.

Do not rewrite configuration files unnecessarily.

---

## Existing Code Style

Use nearby code as the primary style reference.

Match existing:

- naming
- formatting
- folder structure
- error handling
- API response format
- validation patterns
- database patterns
- component patterns

Do not introduce a new style for a small feature.

For backend CRUD code, also follow the Backend Service / CRUD Pattern defined in this file.

---

## Uncertainty

Do not explore endlessly.

If information is missing:

1. Search the most likely location.
2. Inspect the most relevant code.
3. Make a reasonable conclusion from existing patterns.

Ask the user only when a missing decision materially affects the result and cannot safely be inferred.

Do not ask unnecessary questions.

---

## Scope Control

Stay strictly within the requested scope.

If the user asks to fix one feature:

- fix that feature
- validate that feature
- stop

Do not automatically:

- redesign the architecture
- clean the repository
- update dependencies
- fix unrelated warnings
- rewrite documentation
- optimize unrelated code

---

## Performance Optimization

Do not optimize code unless:

- performance is part of the request
- there is an obvious serious performance bug
- optimization is required for correctness

Avoid speculative optimization.

For existence/duplicate database checks, avoid unnecessarily fetching full records.

Prefer:

```sql
SELECT example_code
FROM tbl_example
WHERE example_code = $1
LIMIT 1;
```

instead of:

```sql
SELECT *
FROM tbl_example
WHERE example_code = $1;
```

---

## Reuse

Prefer existing:

- utilities
- services
- components
- hooks
- helpers
- validators
- middleware
- types
- schemas

before creating new ones.

Exception:

Do NOT reuse a generic `checkDuplicate()` helper for simple database duplicate checks.

Duplicate checks should normally query the database directly using `pgGetWithParams` as defined in the Backend Service / CRUD Pattern.

Do not spend excessive time searching for reuse when a small local implementation is clearly appropriate.

---

## Task Planning

For simple tasks, do not produce a long plan.

Simple task:

Locate → Edit → Validate → Finish

Use detailed planning only for tasks involving multiple systems or significant architectural changes.

Do not repeatedly rewrite the plan during execution.

---

## Communication

Keep responses concise.

Do NOT:

- repeat the original request
- explain obvious code
- narrate every tool call
- provide long progress updates
- provide tutorials unless requested
- provide lengthy summaries

During work, communicate only when useful.

---

## Final Response

Keep the final response short.

Preferred format:

### Changed

- `path/to/file` — short description

### Result

One or two sentences describing the outcome.

### Notes

Only include this section if there is something important the user needs to know.

Do not include large code blocks in the final response when the code has already been edited.

Do not explain unchanged code.

---

## Token-Saving Priority

When multiple approaches are equally correct, prefer the one requiring:

1. Less repository exploration
2. Fewer file reads
3. Fewer tool calls
4. Less generated text
5. Smaller code changes
6. Fewer tests while maintaining confidence

Correctness comes first, but unnecessary context usage should always be avoided.

---

## Stop Conditions

Stop working when:

- the requested behavior is implemented
- relevant validation passes
- no required task remains

Do not continue exploring after completion.

Do not search for additional improvements after the task is solved.

---

# Backend Quick Reference

When writing backend code, remember:

```text
GET DATA
POST
→ query
→ search
→ pagination
→ SELECT
→ COUNT
→ response
```

```text
ADD DATA
PUT
→ validate
→ duplicate SELECT
→ INSERT
→ response
```

```text
UPDATE DATA
PATCH
→ validate
→ duplicate SELECT
→ exclude current record
→ UPDATE
→ response
```

```text
REMOVE DATA
DELETE
→ validate
→ soft delete
→ flag = '0'
→ rm_dt
→ response
```

Database:

```text
SELECT
→ pgGetWithParams
```

```text
INSERT / UPDATE / SOFT DELETE
→ pgExecuteWithParams
```

Duplicate:

```text
DO:
Direct SELECT + pgGetWithParams
```

```text
DO NOT:
checkDuplicate()
generic duplicate helper
Promise.all([checkDuplicate(...)])
```

Response:

```text
-1  → invalid parameters
-2  → duplicate data
-99 → unexpected/internal error
```

Always preserve:

```text
formatResponse
logMessage
parameterized SQL
existing flag rules
existing timestamp rules
existing request/response structure
```

---

## Default Behavior Summary

SEARCH narrowly.

READ minimally.

FOLLOW existing project patterns.

FOR BACKEND CRUD, FOLLOW the Backend Service / CRUD Pattern.

QUERY duplicate data directly from the database.

DO NOT use generic `checkDuplicate()` helpers.

USE parameterized SQL.

PRESERVE existing API conventions.

EDIT minimally.

TEST narrowly.

RESPOND briefly.

STOP when done.