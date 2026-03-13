import winston from 'winston';

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

export const logger = Logger('general');

export function Logger(category: string) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    format: winston.format.combine(
      enumerateErrorFormat(),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      process.env.NODE_ENV === 'production'
        ? winston.format.uncolorize()
        : winston.format.colorize(),
      winston.format.splat(),
      winston.format.printf(
        (info) => {
          const { timestamp, level, message, stack } = info as any;
          return `${timestamp} ${level}: [${category}] ${message}`;
        }
      )
    ),
    transports: [
      new winston.transports.Console({
        stderrLevels: ['error'],
      }),
    ],
  });
}
