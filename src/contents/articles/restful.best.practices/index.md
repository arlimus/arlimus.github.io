---
title: REST design summary
author: arlimus
date: 2014-08-03
template: article.jade
---

It feels like this has been done so many times, it could replace your favorite "Hello World" code. But since I'm a sucker for summaries, here goes.

<span class="more"></span>

<script>
$app.directive('flow', function() {
  return {
    template: '\
<div class="flow clearfix">\
  <div class="request" ng-show="!!request">\
    <div class="rheader">{{request}}</div>\
    <div class="rbody">{{requestBody}}</div>\
  </div>\
  <div class="connection" ng-show="!!request"></div>\
  <div class="response response-type-{{responseType}}">\
    <div class="rheader">{{response}}</div>\
    <div class="rbody">{{responseBody}}</div>\
  </div>\
  <div class="help" ng-show="!!help">{{help}}</div>\
</div>\
',
    scope: {
      request: '@', requestBody: '@',
      response: '@', responseBody: '@',
      help: '@'
    },
    link: function (scope, element, attrs) {
      var r = (/^([2345])\d\d/).exec(scope.response)
      if(r == null){
        scope.responseType = "0"
      }else {
        scope.responseType = r[1]
      }
    }
  }
})
</script>

## Read

Get a list of items. If successful, it responds with an array of IDs or objects.

<div flow request="GET /items" response="200 OK" response-body='["1","2","3"]' ></div>
<div flow request="GET /missing" response="404 Not Found" ></div>

Get a specific item. If successful, returns the object.

<div flow request="GET /items/1" response="200 OK" response-body='{"message", "I am an item"}' ></div>
<div flow request="GET /items/?" response="404 Not Found" ></div>

## Create

If you want to create an new item (making sure it doesn't exist):

<div flow request="POST /items" request-body='{"id": "4", "key": "val"}' response="200 OK" ></div>
<div flow request="POST /items" request-body='incorrect data body' response="400 Bad Request" ></div>

If the item already exists:

<div flow request="POST /items" request-body='{"id": "1", "key": "val"}' response="409 Conflict" ></div>

## Update

If you want to replace an existing item:

<div flow request="PUT /items/1" request-body='{"message": "hello"}' response="200 OK" ></div>
<div flow request="PUT /items/1" request-body='incorrect data body' response="400 Bad Request" ></div>
<div flow request="PUT /items/4" request-body='{"key": "val"}' response="404 Not Found" ></div>

## Update (change some fields)

If you want to update some fields of an existing item:

<div flow request="PATCH /items/1" request-body='{"message": "hello"}' response="200 OK" ></div>
<div flow request="PATCH /items/1" request-body='incorrect data body' response="400 Bad Request" ></div>
<div flow request="PATCH /items/4" request-body='{"message": "hello"}' response="404 Not Found" ></div>

## Delete

If you want to remove an existing item:

<div flow request="DELETE /items/1" response="200 OK" ></div>
<div flow request="DELETE /items/4" response="404 Not Found" ></div>

## Other responses

<div flow response="401 Unauthorized" help="Not authenticated; Please log in first" ></div>
<div flow response="403 Forbidden" help="Not authorized; Get more permissions or leave" ></div>
<div flow response="500 Internal Server Error" help="Something went wrong. Marbles dropped on the floor." ></div>

## Rarities

<div flow response="402 Payment Required" help="If someone is willing to pay for your endpoint"></div>
<div flow response="418 I'm a teapot" help="Obvious response if you're teapot."></div>
<div flow response="501 Not Implemented" help="Possible, but almost never seen in the wild. Stick to 404."></div>
<div flow response="503 Service Unavailable" help="Try again later. Also seldomly seen in the wild."></div>

## Final words

This will cover 80%+ of what you need in your daily REST work. Users will expect this behavior and will feel comfortable with it. It also helps design clean APIs.

If you want a longer + more comprehensive list, go [here](www.restapitutorial.com) or [here](restpatterns.org).