import fs from 'fs';
import path from 'path';

import nodemailer from 'nodemailer';

import { Logger } from '../../logger';

import { NotificationConfig, EmailNotification, User } from './config';

import { ConfigService } from '../config.service';

const isEmpty = (str: string) => !str?.length;

export class NotificationService {
  private notifyConfig: NotificationConfig;
  constructor(private readonly config: ConfigService) {
    this.notifyConfig = this.config.getConfig().notification;
  }

  private templateToContent(to: User, templateName: string) {
    const { logger } = this;
    const name = isEmpty(to.name) ? 'Portal User' : to.name;

    logger.debug('Notification triggered [%s] %j', name, to);
    const template = fs.readFileSync(
      path.resolve(__dirname, `templates/${templateName}.html`),
      'utf8'
    );
    return template.replace('{{name}}', name);
  }

  public async notify(user: User, email: EmailNotification) {
    const { logger } = this;
    try {
      if (!this.notifyConfig.enabled) {
        return;
      }

      //we don't notify the active user at all as they made the change
      var emailContent = this.templateToContent(user, email.template);

      var transportOpts = {
        host: this.notifyConfig.host,
        port: this.notifyConfig.port,
        secure: this.notifyConfig.secure,
        tls: { rejectUnauthorized: true },
        auth: { user: null as any, pass: null as any },
      };

      if (!this.notifyConfig.secure) {
        transportOpts['tls'] = {
          rejectUnauthorized: false,
        };
      }

      if (this.notifyConfig.user !== '' && this.notifyConfig.pass !== '') {
        transportOpts['auth'] = {
          user: this.notifyConfig.user,
          pass: this.notifyConfig.pass,
        };
      }

      var transporter = nodemailer.createTransport(transportOpts);

      var mailOptions = {
        from: this.notifyConfig.from,
        to: user.email,
        subject: email.subject,
        html: emailContent,
      };

      await transporter.sendMail(mailOptions);

      logger.info('[SUCCESS] Notification sent to ' + user.email);

      // , function (error : any, info : any) {
      //     if (error) {
      //         this.logger.error("Error sending email to " + mailOptions.to, error);
      //         return;
      //     }
      //     this.logger.debug("Email sent: " + info.response);
      // })
    } catch (err) {
      logger.error('[FAILED] Notification to %s failed - %s', user.email, err);
    }
  }

  logger = Logger('notification.service');
}
