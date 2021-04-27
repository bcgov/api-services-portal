import winston from 'winston'


const enumerateErrorFormat = winston.format((info) => {
    if (info instanceof Error) {
      Object.assign(info, { message: info.stack });
    }
    return info;
  });

export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      enumerateErrorFormat(),
      process.env.NODE_ENV === 'production' ? winston.format.uncolorize() : winston.format.colorize(),
      winston.format.splat(),
      winston.format.printf(({ level, message }) => `${level}: ${message}`)
    ),
    transports: [
      new winston.transports.Console({
        stderrLevels: ['error'],
      }),
    ],
});

export function Logger (category: string) {
    return winston.createLogger({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        format: winston.format.combine(
          enumerateErrorFormat(),
          process.env.NODE_ENV === 'production' ? winston.format.uncolorize() : winston.format.colorize(),
          winston.format.splat(),
          winston.format.printf(({ level, message }) => `${level}: [${category}] ${message}`)
        ),
        transports: [
          new winston.transports.Console({
            stderrLevels: ['error'],
          }),
        ],
    })
}
