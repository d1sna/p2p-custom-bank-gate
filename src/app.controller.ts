import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
// const Zlib = require('zlib');

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/pay')
  async makePayment(@Query() params, @Res() res): Promise<void> {
    const { cardNumber, securityCode, expiryDate, moneyAmount } = params;

    const acsRedirectPage = await this.appService.sendRequestToMPI(
      cardNumber,
      securityCode,
      expiryDate,
      moneyAmount,
    );

    res.send(acsRedirectPage).end();
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
