'use strict';

const test = require('tape');
const CircuitBreaker = require('opossum');
const HystrixStats = require('../');

test('A circuit should provide stats to a hystrix compatible stream', t => {
  t.plan(2);
  const circuitOne = new CircuitBreaker(passFail, {
    rollingCountTimeout: 100,
    rollingCountBuckets: 1,
    name: 'circuit one'
  });
  const circuitTwo = new CircuitBreaker(passFail, {
    rollingCountTimeout: 100,
    rollingCountBuckets: 1,
    name: 'circuit two'
  });
  const hystrixStats = new HystrixStats([circuitOne, circuitTwo]);
  const stream = hystrixStats.getHystrixStream();
  let circuitOneStatsSeen = false;
  let circuitTwoStatsSeen = false;
  stream.on('data', blob => {
    const obj = JSON.parse(blob.substring(6));
    if (obj.name === 'circuit one') circuitOneStatsSeen = true;
    else if (obj.name === 'circuit two') circuitTwoStatsSeen = true;
  });
  circuitOne.fire(10).then(_ => circuitTwo.fire(10)).then(_ => {
    t.ok(circuitOneStatsSeen, 'circuit one stats seen');
    t.ok(circuitTwoStatsSeen, 'circuit two stats seen');
    t.end();
  });
});

test('Hystrix stats should accept additional circuits', t => {
  t.plan(2);
  const circuitOne = new CircuitBreaker(passFail, {
    rollingCountTimeout: 100,
    rollingCountBuckets: 1,
    name: 'circuit one'
  });
  const circuitTwo = new CircuitBreaker(passFail, {
    rollingCountTimeout: 100,
    rollingCountBuckets: 1,
    name: 'circuit two'
  });
  const hystrixStats = new HystrixStats([circuitOne]);
  hystrixStats.add(circuitTwo);
  const stream = hystrixStats.getHystrixStream();
  let circuitOneStatsSeen = false;
  let circuitTwoStatsSeen = false;
  stream.on('data', blob => {
    const obj = JSON.parse(blob.substring(6));
    if (obj.name === 'circuit one') circuitOneStatsSeen = true;
    else if (obj.name === 'circuit two') circuitTwoStatsSeen = true;
  });
  circuitOne.fire(10).then(_ => circuitTwo.fire(10)).then(_ => {
    t.ok(circuitOneStatsSeen, 'circuit one stats seen');
    t.ok(circuitTwoStatsSeen, 'circuit two stats seen');
    t.end();
  });
});

/**
 * Returns a promise that resolves if the parameter
 * 'x' evaluates to >= 0. Otherwise the returned promise fails.
 */

/* eslint prefer-promise-reject-errors: "off" */
function passFail (x) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (x > 0) ? resolve(x) : reject(`Error: ${x} is < 0`);
    }, 100);
  });
}
