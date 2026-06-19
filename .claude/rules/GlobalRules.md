# 🛑 Global Rules & Constraints for Claude Code

## 1. Communication & Interaction
* **Language:** Answer in English unless the user explicitly asks to switch to Ukrainian.
* **Conciseness:** Keep responses strictly concise and focused on the immediate request. Avoid unnecessary filler text.
* **Reasoning:** Always include a brief reasoning summary when making technical or architectural recommendations.
* **No Repetition:** Never repeat the same answer multiple times. Before sending a final response, ensure the final text is emitted once and does not duplicate earlier wording in the same turn.
* **Batch Clarifications:** If multiple clarifications are needed before proceeding, ask them all at once in a concise bulleted list to minimize conversational turns. Do not pace questions one by one.

## 2. Workflow & Execution
* **Read Before Write:** Always use read tools (like `grep`, `ls`, or reading the file directly) to inspect the current state of a file or directory before proposing changes or executing writes.
* **Explicit Consent & Approval Shortcut:** Treat a single `+` from the user as absolute approval to proceed. Do not execute deep code research, structural changes, or destructive commands without explicit confirmation.
* **Plan First:** For complex architectural tasks or new features, output a step-by-step implementation plan in a `[Plan]` block first. Wait for approval (e.g., `+`) before writing code.
* **Atomic Changes & Formatting:** When updating code, do not rewrite the entire file if you only need to change a few lines. Preserve existing formatting and comments. Automatically run the project's standard formatters and linters (e.g., `gofmt`/`goimports` for Go, `ruff`/`black` for Python) if they are available in the environment.
* **Test-Driven:** When writing new business logic or complex services, proactively offer to write or include corresponding unit tests (`_test.go` using the standard `testing` package in Go, or `pytest` in Python).

## 3. Technology Stack & Boundaries
* **Go & Routing:** Always use `chi` as the router. Avoid heavy frameworks like Gin or Fiber unless explicitly requested. Stick to the standard library wherever possible. Always use `context.Context` as the first parameter for I/O functions. Manage goroutine lifecycles carefully to prevent leaks.
* **Python Microservices:** Write strictly asynchronous code. Use FastAPI for web services and modern async ORMs (e.g., Tortoise-ORM or SQLAlchemy). Strictly no Flask or synchronous code.
* **Strict Type Hinting (Python):** Enforce strict Type Hinting in Python. All function signatures must include parameter and return types.
* **Databases:** Always use connection pooling for PostgreSQL. Database schema changes must be done via migrations. Destructive operations (e.g., `DROP TABLE`, `DELETE` without `WHERE`) require explicit user confirmation.
* **Caching:** Consider Redis for caching by default when dealing with high-load endpoints.
* **Dependency Management:** Always read `go.mod` or `requirements.txt` before suggesting new libraries to utilize existing installed packages. After adding a Go dependency, automatically run `go mod tidy` to ensure the module file is clean.
* **Containerization:** If creating a new microservice or adding a system dependency, always check if the `Dockerfile` needs updating. Use multi-stage builds to minimize the final image size.
* **Logic Isolation:** Always extract business logic from handlers. Follow Clean Architecture principles: handlers only deal with HTTP/routing, while all database operations and business computations occur in the service layers.
* **Error Handling & Logging:** Always use structured logging. In Go, wrap errors with context using `fmt.Errorf("...: %w", err)` rather than returning bare errors. In Python, raise specific HTTP exceptions at the handler level, not in the service layer.
* **Secrets Management:** Never hardcode secrets, API keys, or database credentials. Always use environment variables (e.g., `os.Getenv` or `pydantic-settings`). Do not log sensitive user data.

## 4. Team Standards
* **Commits:** Always use the Conventional Commits format when generating Git commit messages (e.g., `feat:`, `fix:`, `refactor:`, `chore:`). Messages should be concise and reflect the core of the changes.
* **Documentation:** Any new public interface, API endpoint, or complex data structure must be accompanied by clear comments. If creating a new service, you must generate a basic `README.md` with instructions for local setup.
* **English in Code:** All variable names, function names, inline comments, and commit messages must be written exclusively in English.
* **Commenting Strategy:** Delete all explanatory comments detailing *how* the code works; retain only comments explaining *why* a decision was made, and strictly limit them to a maximum of one sentence.

## 5. Agent Orchestration & Governance

* **Orchestrator Reference**: Every architectural design, technical plan, or project initiation must explicitly include a reference to the `Agent Orchestrator` as the governing entity responsible for task routing, scope enforcement, and collaborative handoff protocols.
* **Verification**: Before initiating any multi-agent workflow, explicitly verify that the task routing aligns with the defined domain boundaries in the `Engineering Agent Roster` to prevent domain bleed.