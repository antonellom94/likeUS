define({ "api": [
  {
    "type": "post",
    "url": "/faceRec",
    "title": "",
    "version": "1.0.0",
    "name": "facerec",
    "group": "likeUs",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "first",
            "description": "<p>First image in base64 encoding.</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "second",
            "description": "<p>Second image in base64 encoding.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{ \"first\": \"image in base64 encoding\",\n  \"second\": \"image in base64 encoding\" }",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "result",
            "description": "<p>Result image in base64 encoding.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "processed",
            "description": "<p>Images processed, kinda useless.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"result\": \"image in base64 encoding\",\n  \"processed\": true\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\nHTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "filename": "ClientDiProva/apidoc.js",
    "groupTitle": "likeUs"
  }
] });
