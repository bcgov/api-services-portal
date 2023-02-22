const winston = require('winston');

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = Logger('general');

function Logger(category) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    format: winston.format.combine(
      enumerateErrorFormat(),
      process.env.NODE_ENV === 'production'
        ? winston.format.uncolorize()
        : winston.format.colorize(),
      winston.format.splat(),
      winston.format.printf(
        ({ level, message, stack }) => `${level}: [${category}] ${message}`
      )
    ),
    transports: [
      new winston.transports.Console({
        stderrLevels: ['error'],
      }),
    ],
  });
}

module.exports = {
  Logger,
  logger,
};
