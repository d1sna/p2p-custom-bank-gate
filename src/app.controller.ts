import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common';

import { AppService } from './app.service';
// const Zlib = require('zlib');

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/pay')
  async makePayment(@Query() params, @Res() res): Promise<void> {
    const { cardNumber, securityCode, expiryDate, moneyAmount } = params;

    if (!cardNumber || !securityCode || !expiryDate || !moneyAmount)
      throw new BadRequestException('Wrong data');

    const acsRedirectPage = await this.appService.sendRequestToMPI(
      cardNumber,
      securityCode,
      expiryDate,
      moneyAmount,
    );

    res.send(acsRedirectPage).end();
  }

  @Get('/commission')
  async getCommission(@Query() params, @Res() res) {
    const { moneyAmount, cardNumber } = params;

    if (!cardNumber) res.send('').end();
    const commission = await this.appService.getCommission(
      moneyAmount,
      cardNumber,
    );

    res.send(commission).end();
  }

  @Post('/confirm')
  async confirmPayment(@Body() params, @Res() res): Promise<void> {
    const resultMessage = await this.appService.confirmRequestToMPI(
      params.MD,
      params.PaRes,
    );

    res.send(resultMessage).end();

    // const XMLPaRes = Zlib.inflateSync(
    //   Buffer.from(params.PaRes, 'base64'),
    // ).toString();
  }
}
