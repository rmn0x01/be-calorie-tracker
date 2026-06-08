You are working on an Express.js backend project.

Architecture Rules:
- Follow this folder structure strictly:
  /config
  /db/migrations
  /db/seeders
  /src/commands
  /src/controllers
  /src/errors
  /src/helpers
  /src/middlewares
  /src/models
  /src/routers
  /src/services
  /src/tests
- Do not create new top-level folders unless explicitly requested.
- Do not mix business logic inside controllers.
- Controllers must only handle request/response.
- Services contain all business logic.
- Models handle database access only.

Database Migration Rules:
- Table name should be in snake case (user_token)
- Model name should be in lower case (userToken)

Code Rules:
- Use async/await only (no .then chains).
- All async handlers must use try/catch or centralized error wrapper.
- Use proper HTTP status codes.
- Validate request input.
- Do not introduce unnecessary abstraction.
- Keep files under 200 lines when possible.

Testing Rules:
- When generating new feature logic, also generate Jest tests.
- Include edge cases and invalid input tests.

General:
- Keep implementation simple.
- Avoid overengineering.
- This is a single-user MVP unless specified otherwise.