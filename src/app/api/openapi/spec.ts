export const openApiDocument = {
  "openapi": "3.0.3",
  "info": {
    "title": "ihale-sistemi-v2 API",
    "version": "0.1.0"
  },
  "servers": [
    {
      "url": "/"
    }
  ],
  "components": {
    "securitySchemes": {
      "cookieAuth": {
        "type": "apiKey",
        "in": "cookie",
        "name": "session"
      },
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer"
      }
    }
  },
  "paths": {
    "/api/audit-logs": {
      "get": {
        "operationId": "get_api_audit_logs",
        "summary": "GET /api/audit-logs",
        "tags": [
          "audit-logs"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/auth/error": {
      "get": {
        "operationId": "get_api_auth_error",
        "summary": "GET /api/auth/error",
        "tags": [
          "auth"
        ],
        "parameters": [
          {
            "name": "error",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/auth/register": {
      "post": {
        "operationId": "post_api_auth_register",
        "summary": "POST /api/auth/register",
        "tags": [
          "auth"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      }
    },
    "/api/auth/session": {
      "get": {
        "operationId": "get_api_auth_session",
        "summary": "GET /api/auth/session",
        "tags": [
          "auth"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ayarlar/onmadde-sablon": {
      "get": {
        "operationId": "get_api_ayarlar_onmadde_sablon",
        "summary": "GET /api/ayarlar/onmadde-sablon",
        "tags": [
          "ayarlar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_ayarlar_onmadde_sablon",
        "summary": "POST /api/ayarlar/onmadde-sablon",
        "tags": [
          "ayarlar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_ayarlar_onmadde_sablon",
        "summary": "PUT /api/ayarlar/onmadde-sablon",
        "tags": [
          "ayarlar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_ayarlar_onmadde_sablon",
        "summary": "DELETE /api/ayarlar/onmadde-sablon",
        "tags": [
          "ayarlar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/bankalar/rapor": {
      "get": {
        "operationId": "get_api_bankalar_rapor",
        "summary": "GET /api/bankalar/rapor",
        "tags": [
          "bankalar"
        ],
        "parameters": [
          {
            "name": "format",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "section",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/csv": {
                "schema": {
                  "type": "string"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/bankalar": {
      "get": {
        "operationId": "get_api_bankalar",
        "summary": "GET /api/bankalar",
        "tags": [
          "bankalar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_bankalar",
        "summary": "POST /api/bankalar",
        "tags": [
          "bankalar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_bankalar",
        "summary": "PUT /api/bankalar",
        "tags": [
          "bankalar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_bankalar",
        "summary": "DELETE /api/bankalar",
        "tags": [
          "bankalar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/dashboard/analiz/export": {
      "get": {
        "operationId": "get_api_dashboard_analiz_export",
        "summary": "GET /api/dashboard/analiz/export",
        "tags": [
          "dashboard"
        ],
        "parameters": [
          {
            "name": "months",
            "in": "query",
            "required": false,
            "schema": {
              "type": "number"
            }
          },
          {
            "name": "type",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/csv": {
                "schema": {
                  "type": "string"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/dashboard/analiz": {
      "get": {
        "operationId": "get_api_dashboard_analiz",
        "summary": "GET /api/dashboard/analiz",
        "tags": [
          "dashboard"
        ],
        "parameters": [
          {
            "name": "months",
            "in": "query",
            "required": false,
            "schema": {
              "type": "number"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/docs": {
      "get": {
        "operationId": "get_api_docs",
        "summary": "GET /api/docs",
        "tags": [
          "docs"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/evraklar/expiration": {
      "get": {
        "operationId": "get_api_evraklar_expiration",
        "summary": "GET /api/evraklar/expiration",
        "tags": [
          "evraklar"
        ],
        "parameters": [
          {
            "name": "days",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_evraklar_expiration",
        "summary": "POST /api/evraklar/expiration",
        "tags": [
          "evraklar"
        ],
        "parameters": [
          {
            "name": "days",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      }
    },
    "/api/health/queues": {
      "post": {
        "operationId": "post_api_health_queues",
        "summary": "POST /api/health/queues",
        "tags": [
          "health"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      }
    },
    "/api/health/rls": {
      "get": {
        "operationId": "get_api_health_rls",
        "summary": "GET /api/health/rls",
        "tags": [
          "health"
        ],
        "parameters": [
          {
            "name": "selftest",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "tenantId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "x-rls-test",
            "in": "header",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ihaleler/{id}/atama": {
      "post": {
        "operationId": "post_api_ihaleler_id_atama",
        "summary": "POST /api/ihaleler/{id}/atama",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "kurumKisiId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_ihaleler_id_atama",
        "summary": "DELETE /api/ihaleler/{id}/atama",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "kurumKisiId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ihaleler/{id}/dosya": {
      "get": {
        "operationId": "get_api_ihaleler_id_dosya",
        "summary": "GET /api/ihaleler/{id}/dosya",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "file",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "fileId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "includeInactive",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "meta",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_ihaleler_id_dosya",
        "summary": "POST /api/ihaleler/{id}/dosya",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "file",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "fileId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "includeInactive",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "meta",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "additionalProperties": true
              }
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_ihaleler_id_dosya",
        "summary": "PUT /api/ihaleler/{id}/dosya",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "file",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "fileId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "includeInactive",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "meta",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "additionalProperties": true
              }
            }
          }
        }
      },
      "patch": {
        "operationId": "patch_api_ihaleler_id_dosya",
        "summary": "PATCH /api/ihaleler/{id}/dosya",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "file",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "fileId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "includeInactive",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "meta",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "additionalProperties": true
              }
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_ihaleler_id_dosya",
        "summary": "DELETE /api/ihaleler/{id}/dosya",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "file",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "fileId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "includeInactive",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "meta",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ihaleler/{id}/gecici-teminat": {
      "post": {
        "operationId": "post_api_ihaleler_id_gecici_teminat",
        "summary": "POST /api/ihaleler/{id}/gecici-teminat",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_ihaleler_id_gecici_teminat",
        "summary": "DELETE /api/ihaleler/{id}/gecici-teminat",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ihaleler/{id}/hakedis/dosya": {
      "get": {
        "operationId": "get_api_ihaleler_id_hakedis_dosya",
        "summary": "GET /api/ihaleler/{id}/hakedis/dosya",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "ay",
            "in": "query",
            "required": false,
            "schema": {
              "type": "number"
            }
          },
          {
            "name": "file",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "yil",
            "in": "query",
            "required": false,
            "schema": {
              "type": "number"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_ihaleler_id_hakedis_dosya",
        "summary": "POST /api/ihaleler/{id}/hakedis/dosya",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "ay",
            "in": "query",
            "required": false,
            "schema": {
              "type": "number"
            }
          },
          {
            "name": "file",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "yil",
            "in": "query",
            "required": false,
            "schema": {
              "type": "number"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "additionalProperties": true
              }
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_ihaleler_id_hakedis_dosya",
        "summary": "DELETE /api/ihaleler/{id}/hakedis/dosya",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "ay",
            "in": "query",
            "required": false,
            "schema": {
              "type": "number"
            }
          },
          {
            "name": "file",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "yil",
            "in": "query",
            "required": false,
            "schema": {
              "type": "number"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ihaleler/{id}/hakedis/export": {
      "get": {
        "operationId": "get_api_ihaleler_id_hakedis_export",
        "summary": "GET /api/ihaleler/{id}/hakedis/export",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "year",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/csv": {
                "schema": {
                  "type": "string"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ihaleler/{id}/hakedis": {
      "get": {
        "operationId": "get_api_ihaleler_id_hakedis",
        "summary": "GET /api/ihaleler/{id}/hakedis",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_ihaleler_id_hakedis",
        "summary": "POST /api/ihaleler/{id}/hakedis",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_ihaleler_id_hakedis",
        "summary": "PUT /api/ihaleler/{id}/hakedis",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_ihaleler_id_hakedis",
        "summary": "DELETE /api/ihaleler/{id}/hakedis",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ihaleler/{id}/itiraz/{itirazId}/dosya": {
      "get": {
        "operationId": "get_api_ihaleler_id_itiraz_itirazId_dosya",
        "summary": "GET /api/ihaleler/{id}/itiraz/{itirazId}/dosya",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "itirazId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "fileId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_ihaleler_id_itiraz_itirazId_dosya",
        "summary": "POST /api/ihaleler/{id}/itiraz/{itirazId}/dosya",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "itirazId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "fileId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "additionalProperties": true
              }
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_ihaleler_id_itiraz_itirazId_dosya",
        "summary": "PUT /api/ihaleler/{id}/itiraz/{itirazId}/dosya",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "itirazId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "fileId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "additionalProperties": true
              }
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_ihaleler_id_itiraz_itirazId_dosya",
        "summary": "DELETE /api/ihaleler/{id}/itiraz/{itirazId}/dosya",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "itirazId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "fileId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ihaleler/{id}/itiraz": {
      "get": {
        "operationId": "get_api_ihaleler_id_itiraz",
        "summary": "GET /api/ihaleler/{id}/itiraz",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_ihaleler_id_itiraz",
        "summary": "POST /api/ihaleler/{id}/itiraz",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_ihaleler_id_itiraz",
        "summary": "PUT /api/ihaleler/{id}/itiraz",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_ihaleler_id_itiraz",
        "summary": "DELETE /api/ihaleler/{id}/itiraz",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ihaleler/{id}/not": {
      "post": {
        "operationId": "post_api_ihaleler_id_not",
        "summary": "POST /api/ihaleler/{id}/not",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_ihaleler_id_not",
        "summary": "PUT /api/ihaleler/{id}/not",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_ihaleler_id_not",
        "summary": "DELETE /api/ihaleler/{id}/not",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ihaleler/{id}/onmadde": {
      "get": {
        "operationId": "get_api_ihaleler_id_onmadde",
        "summary": "GET /api/ihaleler/{id}/onmadde",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "file",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_ihaleler_id_onmadde",
        "summary": "POST /api/ihaleler/{id}/onmadde",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "file",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "additionalProperties": true
              }
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_ihaleler_id_onmadde",
        "summary": "DELETE /api/ihaleler/{id}/onmadde",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "file",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ihaleler/{id}/personel": {
      "get": {
        "operationId": "get_api_ihaleler_id_personel",
        "summary": "GET /api/ihaleler/{id}/personel",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "put": {
        "operationId": "put_api_ihaleler_id_personel",
        "summary": "PUT /api/ihaleler/{id}/personel",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      }
    },
    "/api/ihaleler/{id}/puantaj/export": {
      "get": {
        "operationId": "get_api_ihaleler_id_puantaj_export",
        "summary": "GET /api/ihaleler/{id}/puantaj/export",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "year",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/csv": {
                "schema": {
                  "type": "string"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ihaleler/{id}/puantaj": {
      "get": {
        "operationId": "get_api_ihaleler_id_puantaj",
        "summary": "GET /api/ihaleler/{id}/puantaj",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_ihaleler_id_puantaj",
        "summary": "POST /api/ihaleler/{id}/puantaj",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_ihaleler_id_puantaj",
        "summary": "DELETE /api/ihaleler/{id}/puantaj",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ihaleler/{id}/rakip": {
      "post": {
        "operationId": "post_api_ihaleler_id_rakip",
        "summary": "POST /api/ihaleler/{id}/rakip",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_ihaleler_id_rakip",
        "summary": "DELETE /api/ihaleler/{id}/rakip",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ihaleler/{id}": {
      "get": {
        "operationId": "get_api_ihaleler_id",
        "summary": "GET /api/ihaleler/{id}",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "put": {
        "operationId": "put_api_ihaleler_id",
        "summary": "PUT /api/ihaleler/{id}",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_ihaleler_id",
        "summary": "DELETE /api/ihaleler/{id}",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/ihaleler/{id}/yan-hak": {
      "get": {
        "operationId": "get_api_ihaleler_id_yan_hak",
        "summary": "GET /api/ihaleler/{id}/yan-hak",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "put": {
        "operationId": "put_api_ihaleler_id_yan_hak",
        "summary": "PUT /api/ihaleler/{id}/yan-hak",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      }
    },
    "/api/ihaleler": {
      "get": {
        "operationId": "get_api_ihaleler",
        "summary": "GET /api/ihaleler",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "durum",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "offset",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_ihaleler",
        "summary": "POST /api/ihaleler",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "durum",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "offset",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_ihaleler",
        "summary": "PUT /api/ihaleler",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "durum",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "offset",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_ihaleler",
        "summary": "DELETE /api/ihaleler",
        "tags": [
          "ihaleler"
        ],
        "parameters": [
          {
            "name": "durum",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "offset",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/kurumlar/{id}/arama-loglari": {
      "post": {
        "operationId": "post_api_kurumlar_id_arama_loglari",
        "summary": "POST /api/kurumlar/{id}/arama-loglari",
        "tags": [
          "kurumlar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "logId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_kurumlar_id_arama_loglari",
        "summary": "DELETE /api/kurumlar/{id}/arama-loglari",
        "tags": [
          "kurumlar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "logId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/kurumlar/{id}/hafiza-notlari": {
      "post": {
        "operationId": "post_api_kurumlar_id_hafiza_notlari",
        "summary": "POST /api/kurumlar/{id}/hafiza-notlari",
        "tags": [
          "kurumlar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "notId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_kurumlar_id_hafiza_notlari",
        "summary": "PUT /api/kurumlar/{id}/hafiza-notlari",
        "tags": [
          "kurumlar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "notId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_kurumlar_id_hafiza_notlari",
        "summary": "DELETE /api/kurumlar/{id}/hafiza-notlari",
        "tags": [
          "kurumlar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "notId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/kurumlar/{id}/kisiler": {
      "post": {
        "operationId": "post_api_kurumlar_id_kisiler",
        "summary": "POST /api/kurumlar/{id}/kisiler",
        "tags": [
          "kurumlar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "kisiId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_kurumlar_id_kisiler",
        "summary": "DELETE /api/kurumlar/{id}/kisiler",
        "tags": [
          "kurumlar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "kisiId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/kurumlar": {
      "get": {
        "operationId": "get_api_kurumlar",
        "summary": "GET /api/kurumlar",
        "tags": [
          "kurumlar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_kurumlar",
        "summary": "POST /api/kurumlar",
        "tags": [
          "kurumlar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_kurumlar",
        "summary": "PUT /api/kurumlar",
        "tags": [
          "kurumlar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_kurumlar",
        "summary": "DELETE /api/kurumlar",
        "tags": [
          "kurumlar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/notifications/evrak-expiration": {
      "get": {
        "operationId": "get_api_notifications_evrak_expiration",
        "summary": "GET /api/notifications/evrak-expiration",
        "tags": [
          "notifications"
        ],
        "parameters": [
          {
            "name": "days",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_notifications_evrak_expiration",
        "summary": "POST /api/notifications/evrak-expiration",
        "tags": [
          "notifications"
        ],
        "parameters": [
          {
            "name": "days",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      }
    },
    "/api/notifications": {
      "get": {
        "operationId": "get_api_notifications",
        "summary": "GET /api/notifications",
        "tags": [
          "notifications"
        ],
        "parameters": [
          {
            "name": "countOnly",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "includeRead",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "number"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "patch": {
        "operationId": "patch_api_notifications",
        "summary": "PATCH /api/notifications",
        "tags": [
          "notifications"
        ],
        "parameters": [
          {
            "name": "countOnly",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "includeRead",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "number"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      }
    },
    "/api/openapi": {
      "get": {
        "operationId": "get_api_openapi",
        "summary": "GET /api/openapi",
        "tags": [
          "openapi"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/rakip-firmalar": {
      "get": {
        "operationId": "get_api_rakip_firmalar",
        "summary": "GET /api/rakip-firmalar",
        "tags": [
          "rakip-firmalar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_rakip_firmalar",
        "summary": "POST /api/rakip-firmalar",
        "tags": [
          "rakip-firmalar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_rakip_firmalar",
        "summary": "PUT /api/rakip-firmalar",
        "tags": [
          "rakip-firmalar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_rakip_firmalar",
        "summary": "DELETE /api/rakip-firmalar",
        "tags": [
          "rakip-firmalar"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/resmi-tatiller": {
      "get": {
        "operationId": "get_api_resmi_tatiller",
        "summary": "GET /api/resmi-tatiller",
        "tags": [
          "resmi-tatiller"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "year",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_resmi_tatiller",
        "summary": "POST /api/resmi-tatiller",
        "tags": [
          "resmi-tatiller"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "year",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_resmi_tatiller",
        "summary": "PUT /api/resmi-tatiller",
        "tags": [
          "resmi-tatiller"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "year",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_resmi_tatiller",
        "summary": "DELETE /api/resmi-tatiller",
        "tags": [
          "resmi-tatiller"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "year",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/sirket-evraklari/download/{id}": {
      "get": {
        "operationId": "get_api_sirket_evraklari_download_id",
        "summary": "GET /api/sirket-evraklari/download/{id}",
        "tags": [
          "sirket-evraklari"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "user-agent",
            "in": "header",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "x-forwarded-for",
            "in": "header",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/sirket-evraklari/preview/{id}": {
      "get": {
        "operationId": "get_api_sirket_evraklari_preview_id",
        "summary": "GET /api/sirket-evraklari/preview/{id}",
        "tags": [
          "sirket-evraklari"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/sirket-evraklari": {
      "get": {
        "operationId": "get_api_sirket_evraklari",
        "summary": "GET /api/sirket-evraklari",
        "tags": [
          "sirket-evraklari"
        ],
        "parameters": [
          {
            "name": "arama",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "durum",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "kategori",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "offset",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "tip",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_sirket_evraklari",
        "summary": "POST /api/sirket-evraklari",
        "tags": [
          "sirket-evraklari"
        ],
        "parameters": [
          {
            "name": "arama",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "durum",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "kategori",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "offset",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "tip",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_sirket_evraklari",
        "summary": "PUT /api/sirket-evraklari",
        "tags": [
          "sirket-evraklari"
        ],
        "parameters": [
          {
            "name": "arama",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "durum",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "kategori",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "offset",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "tip",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_sirket_evraklari",
        "summary": "DELETE /api/sirket-evraklari",
        "tags": [
          "sirket-evraklari"
        ],
        "parameters": [
          {
            "name": "arama",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "durum",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "kategori",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "offset",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "tip",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/sirket-evraklari/upload": {
      "post": {
        "operationId": "post_api_sirket_evraklari_upload",
        "summary": "POST /api/sirket-evraklari/upload",
        "tags": [
          "sirket-evraklari"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "additionalProperties": true
              }
            }
          }
        }
      }
    },
    "/api/sozlesmeler/{id}/dosya": {
      "get": {
        "operationId": "get_api_sozlesmeler_id_dosya",
        "summary": "GET /api/sozlesmeler/{id}/dosya",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "fileId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_sozlesmeler_id_dosya",
        "summary": "POST /api/sozlesmeler/{id}/dosya",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "fileId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "additionalProperties": true
              }
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_sozlesmeler_id_dosya",
        "summary": "DELETE /api/sozlesmeler/{id}/dosya",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "fileId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/sozlesmeler/{id}/not": {
      "post": {
        "operationId": "post_api_sozlesmeler_id_not",
        "summary": "POST /api/sozlesmeler/{id}/not",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_sozlesmeler_id_not",
        "summary": "PUT /api/sozlesmeler/{id}/not",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_sozlesmeler_id_not",
        "summary": "DELETE /api/sozlesmeler/{id}/not",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/sozlesmeler/{id}/onmadde": {
      "get": {
        "operationId": "get_api_sozlesmeler_id_onmadde",
        "summary": "GET /api/sozlesmeler/{id}/onmadde",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "belgeAdi",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "file",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_sozlesmeler_id_onmadde",
        "summary": "POST /api/sozlesmeler/{id}/onmadde",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "belgeAdi",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "file",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "additionalProperties": true
              }
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_sozlesmeler_id_onmadde",
        "summary": "DELETE /api/sozlesmeler/{id}/onmadde",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "belgeAdi",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "file",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/sozlesmeler/{id}": {
      "get": {
        "operationId": "get_api_sozlesmeler_id",
        "summary": "GET /api/sozlesmeler/{id}",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/sozlesmeler": {
      "get": {
        "operationId": "get_api_sozlesmeler",
        "summary": "GET /api/sozlesmeler",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_sozlesmeler",
        "summary": "POST /api/sozlesmeler",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_sozlesmeler",
        "summary": "PUT /api/sozlesmeler",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_sozlesmeler",
        "summary": "DELETE /api/sozlesmeler",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/sozlesmeler/teminatlar": {
      "post": {
        "operationId": "post_api_sozlesmeler_teminatlar",
        "summary": "POST /api/sozlesmeler/teminatlar",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_sozlesmeler_teminatlar",
        "summary": "PUT /api/sozlesmeler/teminatlar",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "delete": {
        "operationId": "delete_api_sozlesmeler_teminatlar",
        "summary": "DELETE /api/sozlesmeler/teminatlar",
        "tags": [
          "sozlesmeler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/yaklasik-maliyetler/{id}/dosya": {
      "get": {
        "operationId": "get_api_yaklasik_maliyetler_id_dosya",
        "summary": "GET /api/yaklasik-maliyetler/{id}/dosya",
        "tags": [
          "yaklasik-maliyetler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_yaklasik_maliyetler_id_dosya",
        "summary": "POST /api/yaklasik-maliyetler/{id}/dosya",
        "tags": [
          "yaklasik-maliyetler"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "additionalProperties": true
              }
            }
          }
        }
      }
    },
    "/api/yaklasik-maliyetler": {
      "get": {
        "operationId": "get_api_yaklasik_maliyetler",
        "summary": "GET /api/yaklasik-maliyetler",
        "tags": [
          "yaklasik-maliyetler"
        ],
        "parameters": [
          {
            "name": "aktifMi",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "ihaleId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "kurumId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "operationId": "post_api_yaklasik_maliyetler",
        "summary": "POST /api/yaklasik-maliyetler",
        "tags": [
          "yaklasik-maliyetler"
        ],
        "parameters": [
          {
            "name": "aktifMi",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "ihaleId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "kurumId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      },
      "put": {
        "operationId": "put_api_yaklasik_maliyetler",
        "summary": "PUT /api/yaklasik-maliyetler",
        "tags": [
          "yaklasik-maliyetler"
        ],
        "parameters": [
          {
            "name": "aktifMi",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "ihaleId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "kurumId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "201": {
            "description": "HTTP 201"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        },
        "security": [
          {
            "cookieAuth": []
          },
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        }
      }
    }
  }
} as const
