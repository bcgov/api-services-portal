import fs from 'fs';
import path from 'path';

import juice from 'juice';
import nodemailer from 'nodemailer';

import { Logger } from '../../logger';

import { NotificationConfig, EmailNotification, User } from './config';

import { ConfigService } from '../config.service';

const isEmpty = (str: string) => !str?.length;

const escapeHtml = (value: string | number | boolean) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export class NotificationService {
  private notifyConfig: NotificationConfig;
  constructor(private readonly config: ConfigService) {
    this.notifyConfig = this.config.getConfig().notification;
  }

  private templateToContent(
    to: User,
    templateName: string,
    context: EmailNotification['context'] = {}
  ) {
    const { logger } = this;
    const name = isEmpty(to.name) ? 'Portal User' : to.name;

    logger.debug('Notification triggered [%s] %j', name, to);
    const values: EmailNotification['context'] = { name, ...context };
    // {{#if key}}...{{/if}} blocks are kept only when the context value is truthy
    const html = fs
      .readFileSync(
        path.resolve(__dirname, `templates/${templateName}.html`),
        'utf8'
      )
      .replace(
        /[ \t]*{{#if (\w+)}}\n?([\s\S]*?)[ \t]*{{\/if}}\n?/g,
        (_block, key, content) => (values[key] ? content : '')
      );
    // Mail clients ignore linked stylesheets, so a template's companion .css
    // file is inlined into style attributes before values are substituted
    const stylesheet = path.resolve(__dirname, `templates/${templateName}.css`);
    const template = fs.existsSync(stylesheet)
      ? juice.inlineContent(html, fs.readFileSync(stylesheet, 'utf8'))
      : html;
    // Single pass so substituted values can never introduce new placeholders
    return template.replace(/{{(\w+)}}/g, (placeholder, key) =>
      key in values ? escapeHtml(values[key]) : placeholder
    );
  }

  public async notify(user: User, email: EmailNotification) {
    const { logger } = this;
    try {
      if (!this.notifyConfig.enabled) {
        return;
      }

      //we don't notify the active user at all as they made the change
      var emailContent = this.templateToContent(
        user,
        email.template,
        email.context
      );

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
