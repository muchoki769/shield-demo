const request = require('supertest');
const express = require('express');

describe('Basic server test', () => {
  let app;
  beforeAll(() => {
    app = require('./server'); // Adjust if your server exports the app
  });

  it('should respond to GET /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});