import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

/**
 * ==== Setting Up All Necessary middlewares ====
 * @returns
 */
export default function setupMiddlewares() {
  const middlewares = [
    morgan('dev'),
    cors(),
    express.json(),
    cookieParser(),
    express.urlencoded({ extended: true }),
  ];

  return middlewares;
}
