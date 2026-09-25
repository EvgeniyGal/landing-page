export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Flashcard Platform API",
    version: "1.0.0",
    description:
      "Bearer-authenticated REST API for mobile and third-party clients. Obtain a token via `/api/v1/auth/login` or `/api/v1/auth/google`, then send `Authorization: Bearer <token>`.",
  },
  servers: [{ url: "/", description: "Current host" }],
  tags: [
    { name: "Auth" },
    { name: "Me" },
    { name: "Decks" },
    { name: "Flashcards" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          code: { type: "string" },
        },
        required: ["error"],
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          name: { type: "string", nullable: true },
          role: { type: "string", enum: ["admin", "user"] },
          status: { type: "string", enum: ["invited", "active", "disabled"] },
        },
        required: ["id", "email", "role", "status"],
      },
      Flashcard: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          deckId: { type: "string", format: "uuid" },
          inputText: { type: "string" },
          outputText: { type: "string" },
          word: { type: "string" },
          partOfSpeech: { type: "string", nullable: true },
          transcription: { type: "string", nullable: true },
          irregularForms: { type: "string", nullable: true },
          examples: { type: "array", items: { type: "string" } },
          definition: { type: "string" },
          state: { type: "string", enum: ["new", "learning", "review", "relearning"] },
          dueAt: { type: "string", format: "date-time" },
          ease: { type: "number" },
          intervalDays: { type: "number" },
          audio: {
            type: "object",
            additionalProperties: { type: "string" },
          },
          intervals: {
            type: "object",
            additionalProperties: { type: "string" },
            nullable: true,
          },
        },
        required: ["id", "deckId", "inputText", "word", "state", "dueAt", "audio"],
      },
      FlashcardWrite: {
        type: "object",
        properties: {
          word: { type: "string", minLength: 1 },
          partOfSpeech: { type: "string", nullable: true },
          transcription: { type: "string", minLength: 1 },
          irregularForms: { type: "string", nullable: true },
          examples: {
            type: "array",
            minItems: 3,
            maxItems: 3,
            items: { type: "string", minLength: 1 },
          },
          definition: { type: "string", minLength: 1 },
        },
        required: ["word", "partOfSpeech", "transcription", "irregularForms", "examples", "definition"],
      },
      DeckSummary: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          isDefault: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          cardsDueToday: { type: "integer" },
          cardCount: { type: "integer" },
        },
      },
    },
  },
  paths: {
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Password login",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Access token issued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                  required: ["accessToken", "user"],
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/v1/auth/google": {
      post: {
        tags: ["Auth"],
        summary: "Google ID token login",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  idToken: { type: "string" },
                },
                required: ["idToken"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Access token issued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Invalid Google token",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/v1/me": {
      get: {
        tags: ["Me"],
        summary: "Current user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Authenticated user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { user: { $ref: "#/components/schemas/User" } },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/v1/decks": {
      get: {
        tags: ["Decks"],
        summary: "List decks",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Deck list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    decks: {
                      type: "array",
                      items: { $ref: "#/components/schemas/DeckSummary" },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
      post: {
        tags: ["Decks"],
        summary: "Create a dictionary (deck)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", minLength: 1, maxLength: 255 },
                },
                required: ["name"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Created deck",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    deck: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/decks/{id}": {
      get: {
        tags: ["Decks"],
        summary: "Deck detail with cards",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Deck detail",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    deck: { type: "object" },
                    counts: { type: "object" },
                    cards: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Flashcard" },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
      delete: {
        tags: ["Decks"],
        summary: "Delete a dictionary and all of its cards",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean" } },
                },
              },
            },
          },
          "404": {
            description: "Not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/v1/decks/{id}/study": {
      get: {
        tags: ["Decks"],
        summary: "Due cards for study",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Study queue",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    deck: { type: "object" },
                    cards: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Flashcard" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/flashcards": {
      post: {
        tags: ["Flashcards"],
        summary: "Generate and create a flashcard",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  inputText: { type: "string", minLength: 1, maxLength: 500 },
                  deckId: { type: "string", format: "uuid" },
                },
                required: ["inputText"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Created card",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { card: { $ref: "#/components/schemas/Flashcard" } },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/v1/flashcards/{id}": {
      get: {
        tags: ["Flashcards"],
        summary: "Get a flashcard",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Flashcard",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { card: { $ref: "#/components/schemas/Flashcard" } },
                },
              },
            },
          },
          "404": {
            description: "Not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
      patch: {
        tags: ["Flashcards"],
        summary: "Update a flashcard",
        description:
          "Updates card content fields. Changing the word or examples clears existing audio for that card.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FlashcardWrite" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated card",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { card: { $ref: "#/components/schemas/Flashcard" } },
                },
              },
            },
          },
          "400": {
            description: "Invalid payload",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "404": {
            description: "Not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
      delete: {
        tags: ["Flashcards"],
        summary: "Delete a flashcard",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean" } },
                },
              },
            },
          },
          "404": {
            description: "Not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/v1/flashcards/{id}/review": {
      post: {
        tags: ["Flashcards"],
        summary: "Submit an SM-2 review rating",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  rating: { type: "string", enum: ["again", "hard", "good", "easy"] },
                },
                required: ["rating"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated schedule",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { card: { $ref: "#/components/schemas/Flashcard" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/flashcards/{id}/audio": {
      post: {
        tags: ["Flashcards"],
        summary: "Generate audio for a card",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  kind: {
                    type: "string",
                    enum: ["word", "example_1", "example_2", "example_3", "all_examples"],
                  },
                  force: {
                    type: "boolean",
                    description: "When true, replaces any existing clip for the kind.",
                  },
                },
                required: ["kind"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Audio playback paths",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    audio: {
                      type: "object",
                      additionalProperties: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Flashcards"],
        summary: "Remove pronunciation audio for a card element",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  kind: {
                    type: "string",
                    enum: ["word", "example_1", "example_2", "example_3", "all_examples"],
                  },
                },
                required: ["kind"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Removed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean" },
                    removed: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/openapi": {
      get: {
        tags: ["Me"],
        summary: "OpenAPI document (JSON)",
        security: [],
        responses: {
          "200": {
            description: "OpenAPI 3.0 specification",
            content: {
              "application/json": {
                schema: { type: "object" },
              },
            },
          },
        },
      },
    },
  },
} as const;
