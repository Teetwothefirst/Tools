/**
 * Vercel Serverless Function Entry Point
 * Exports the Express application to be run as an AWS Lambda serverless handler on Vercel.
 */

const app = require('../server');

module.exports = app;
