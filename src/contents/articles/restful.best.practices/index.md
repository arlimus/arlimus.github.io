---
title: REST design summary
author: arlimus
date: 2014-08-03
template: article.jade
---

It feels like this has been done so many times, it could replace your favorite "Hello World" code. But since I'm a sucker for summaries, here goes:

<span class="more"></span>

## Read

+------------------+---------------+------------------------------+
| **GET /items**   | 200 OK        | `["1","2","3"]`              |
+------------------+---------------+------------------------------+
|                  | 404 Not Found |                              |
+------------------+---------------+------------------------------+
| **GET /items/1** | 200 OK        | `{"message", "I'm an item"}` |
+------------------+---------------+------------------------------+
|                  | 404 Not Found |                              |
+------------------+---------------+------------------------------+

## Create

+-----------------+-------------------------+-----------------+
| **POST /items** | `{"id": "4", ...}`      | 201 Created     |
+-----------------+-------------------------+-----------------+
|                 | "Wrong data"            | 400 Bad Request |
+-----------------+-------------------------+-----------------+
|                 | Resource already exists | 409 Conflict    |
+-----------------+-------------------------+-----------------+

## Update (replace)

+------------------+---------------------+-----------------+
| **PUT /items/1** | `{...}`             | 200 OK          |
+------------------+---------------------+-----------------+
|                  | "Wrong data"        | 400 Bad Request |
+------------------+---------------------+-----------------+
|                  | If it doesn't exist | 404 Not Found   |
+------------------+---------------------+-----------------+

## Update (change some fields)

+--------------------+--------------------------+-----------------+
| **PATCH /items/1** | `{"message": "changed"}` | 200 OK          |
+--------------------+--------------------------+-----------------+
|                    | "Wrong data"             | 400 Bad Request |
+--------------------+--------------------------+-----------------+
|                    | If it doesn't exist      | 404 Not Found   |
+--------------------+--------------------------+-----------------+

## Delete

+---------------------+---------------------+---------------+
| **DELETE /items/1** | If it exists        | 200 OK        |
+---------------------+---------------------+---------------+
|                     | If it doesn't exist | 404 Not Found |
+---------------------+---------------------+---------------+


## Other responses

+---------------------------+-----------------------------------------------------+
| 401 Unauthorized          | Not authenticated; Please log in first              |
+---------------------------+-----------------------------------------------------+
| 403 Forbidden             | Not authorized; Get more permissions or leave       |
+---------------------------+-----------------------------------------------------+
| 500 Internal Server Error | Something went wrong. Marbles dropped on the floor. |
+---------------------------+-----------------------------------------------------+

## Rarities

+---------------------------+------------------------------------------------------------+
| 402 Payment Required      | If someone is willing to pay for your endpoint             |
+---------------------------+------------------------------------------------------------+
| 418 I'm a teapot          | Obvious response if you're teapot.                         |
+---------------------------+------------------------------------------------------------+
| 501 Not Implemented       | Possible, but almost never seen in the wild. Stick to 404. |
+---------------------------+------------------------------------------------------------+
| 503 Service Unavailable   | Try again later. Also seldomly seen in the wild.           |
+---------------------------+------------------------------------------------------------+

## Final words

This will cover 80%+ of what you need in your daily REST work. Users will expect this behavior and will feel comfortable with it. It also helps design clean APIs.

If you want a longer + more comprehensive list, go [here](www.restapitutorial.com) or [here](restpatterns.org).