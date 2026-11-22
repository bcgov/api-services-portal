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
    // Process exclusions first so they can wrap existing conditional sections.
    const html = fs
      .readFileSync(
        path.resolve(__dirname, `templates/${templateName}.html`),
        'utf8'
      )
      .replace(
        /[ \t]*{{#unless (\w+)}}\n?([\s\S]*?)[ \t]*{{\/unless}}\n?/g,
        (_block, key, content) => (values[key] ? '' : content)
      )
      .replace(
        /[ \t]*{{#if (\w+)}}\n?([\s\S]*?)[ \t]*{{\/if}}\n?/g,
        (_block, key, content) => (values[key] ? content : '')
      );
    // Substituted values are escaped and never interpreted as placeholders.
    const rendered = html.replace(
      /{{#each (\w+)}}([\s\S]*?){{\/each}}|{{(\w+)}}/g,
      (placeholder, listKey: string, content: string, key: string) => {
        if (listKey) {
          const rows = values[listKey];
          return Array.isArray(rows)
            ? rows
                .map((row) =>
                  content.replace(/{{(\w+)}}/g, (token, field) =>
                    Object.prototype.hasOwnProperty.call(row, field)
                      ? escapeHtml(row[field])
                      : token
                  )
                )
                .join('')
            : '';
        }
        const value = values[key];
        return value !== undefined && !Array.isArray(value) ? escapeHtml(value) : placeholder;
      }
    );
    // Expand table rows before parsing the HTML to inline styles for email clients.
    const stylesheet = path.resolve(__dirname, `templates/${templateName}.css`);
    return fs.existsSync(stylesheet)
      ? juice.inlineContent(rendered, fs.readFileSync(stylesheet, 'utf8'))
      : rendered;
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
