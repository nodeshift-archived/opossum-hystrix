# Hystrix Metrics for Opossum Circuit Breaker

[![CircleCI](https://circleci.com/gh/nodeshift/opossum-hystrix.svg?style=svg)](https://circleci.com/gh/nodeshift/opossum-hystrix)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/de288081beba4c9297b88e2057204149)](https://www.codacy.com/app/nodeshift/opossum-hystrix?utm_source=github.com&utm_medium=referral&utm_content=nodeshift/opossum-hystrix&utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/de288081beba4c9297b88e2057204149)](https://www.codacy.com/app/nodeshift/opossum-hystrix?utm_source=github.com&utm_medium=referral&utm_content=nodeshift/opossum-hystrix&utm_campaign=Badge_Coverage)
[![dependencies Status](https://david-dm.org/nodeshift/opossum-hystrix/status.svg)](https://david-dm.org/nodeshift/opossum-hystrix)
[![Known Vulnerabilities](https://snyk.io/test/npm/opossum-hystrix/badge.svg)](https://snyk.io/test/npm/opossum-hystrix)

[![NPM](https://nodei.co/npm/opossum-hystrix.png)](https://npmjs.org/package/opossum-hystrix) [![Greenkeeper badge](https://badges.greenkeeper.io/nodeshift/opossum-hystrix.svg)](https://greenkeeper.io/)

This module provides [Hystrix](https://github.com/Netflix/Hystrix) metrics for
[opossum](https://github.com/nodeshift/opossum) circuit breakers. To use
it with your circuit breakers, just pass them in to the `HystrixStats`
constructor.

## Hystrix Dashboard Stream

A Hystrix Stream is available for use with a Hystrix Dashboard using the
`HystrixStats#stream` property. This property provies a
[Node.js Stream](https://nodejs.org/api/stream.html), making it straightforward
to create an Server Side Event stream that will be compliant with a Hystrix Dashboard.

Additional Reading: [Hystrix Metrics Event Stream](https://github.com/Netflix/Hystrix/tree/master/hystrix-contrib/hystrix-metrics-event-stream), [Turbine](https://github.com/Netflix/Turbine/wiki), [Hystrix Dashboard](https://github.com/Netflix/Hystrix/wiki/Dashboard)

## Example Usage

This module would typically be used in an application that can provide
an endpoint for the Hystrix Dashboard to monitor.

```js
  const CircuitBreaker = require('opossum');
  const HystrixStats = require('opossum-hystrix');
  const express = require('express');

  const app = express();
  app.use('/hystrix.stream', hystrixStream);

  // create a couple of circuit breakers
  const c1 = new CircuitBreaker(someFunction);
  const c2 = new CircuitBreaker(someOtherfunction);

  // Provide them to the constructor
  const hystrixMetrics = new HystrixStats([c1, c2]);

  // Provide a Server Side Event stream of metrics data
  function hystrixStream (request, response) {
      response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
        });
      response.write('retry: 10000\n');
      response.write('event: connecttime\n');

      hystrixMetrics.getHystrixStream().pipe(response);
    };
  }
```
