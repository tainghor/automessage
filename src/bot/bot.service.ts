import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import * as moment from 'moment';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;

  // Customize your cross-day time range for weekdays here
  private weekdayStartTime = '13:00:00'; // Start time for weekday auto-reply
  private weekdayEndTime = '06:00:00'; // End time for weekday auto-reply (next day)
  
  private weekendMessage = 'It’s the weekend! Relax and enjoy!';
  private weekdayMessage = 'Hello Team, Happy working day! We are available to help you!';

  constructor(private configService: ConfigService) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    this.bot = new Telegraf(token);
  }

  async onModuleInit() {
    this.bot.start((ctx) => ctx.reply('Welcome to Hor Telegram Bot!'));

    this.bot.on('text', (ctx) => {
      const currentDateTime = moment();
      const currentTime = currentDateTime.format('HH:mm:ss');
      const dayOfWeek = currentDateTime.day(); // Sunday = 0, Monday = 1, ..., Saturday = 6

      if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend (Saturday or Sunday)
        // Always auto-reply on weekends
        ctx.reply(this.weekendMessage);
      } else { // Weekdays (Monday to Friday)
        if (this.isTimeInRange(currentTime, this.weekdayStartTime, this.weekdayEndTime)) {
          ctx.reply(this.weekdayMessage);
        }
      }
    });

    await this.bot.launch();
  }

  private isTimeInRange(currentTime: string, startTime: string, endTime: string): boolean {
    const start = moment(startTime, 'HH:mm:ss');
    const end = moment(endTime, 'HH:mm:ss');
    const current = moment(currentTime, 'HH:mm:ss');

    if (end.isBefore(start)) {
      // The time range crosses midnight
      return current.isBetween(start, moment().endOf('day'), null, '[)') || 
             current.isBetween(moment().startOf('day'), end, null, '(]');
    } else {
      // The time range does not cross midnight
      return current.isBetween(start, end, null, '[)');
    }
  }
}
