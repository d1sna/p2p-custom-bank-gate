import { Injectable, Post } from '@nestjs/common';
import axios from 'axios';
import { get } from 'lodash';

const ticketStore = new Map([]);
const payIdStore = new Map([]);

@Injectable()
export class AppService {
  async sendRequestToMPI(
    cardNumber: string,
    securityCode: string,
    expiryDate: string,
    moneyAmount: string,
  ): Promise<string> {
    const parsedCardNumber = cardNumber.split(' ').join('');

    const response = await axios({
      url: process.env.PAY_URL,
      params: {
        payParameters: {
          cardNumber: parsedCardNumber,
          securityCode,
          expiryDate,
          moneyAmount,
          formProcessingTime: '699',
          attachCard: 'false',
          moneyCommission: '40',
          provider: 'c2c-anytoany',
          currency: 'RUB',
          providerFields: { toCardNumber: process.env.RECEIVER_CARD },
          notificationUrl:
            'https://www.tinkoff.ru/cardtocard/3dsecure/end/?failUrl=%2Fcardtocard%2F',
          threeDSecureVersion: '1.0.0',
          userPaymentId: 1658933334937,
        },
      },
    });

    const MD = get(response, 'data.confirmationData.3DSecure.merchantData');
    const operationTicket = get(response, 'data.operationTicket');
    const url = get(response, 'data.confirmationData.3DSecure.url');
    const paReq = get(
      response,
      'data.confirmationData.3DSecure.requestSecretCode',
    );
    const paymentId = get(response, 'data.confirmationData.3DSecure.paymentId');

    ticketStore.set(MD, operationTicket);
    payIdStore.set(MD, paymentId);
    return this._buildRedirectPage(url, paReq, MD);
  }

  async confirmRequestToMPI(MD: string, PaRes: string): Promise<string> {
    const initialOperationTicket = ticketStore.get(MD);
    const paymentId = payIdStore.get(MD);

    const resPage = await axios({
      url: `https://www.tinkoff.ru/cardtocard/3dsecure/end/?paymentId=${paymentId}`,
      method: 'POST',
      params: {
        PaRes,
        MD,
      },
    });

    const confirmResult = await axios({
      url: process.env.CONFIRM_URL,
      method: 'POST',
      params: {
        initialOperation: 'pay',
        initialOperationTicket,
        confirmationData: {
          '3DSecure': PaRes.toString(),
        },
      },
    });

    return confirmResult.data;
  }

  async getCommission(amount: string, cardNumber: string): Promise<string> {
    const response = await axios({
      url: process.env.COMMISSION_URL,
      params: {
        payParameters: {
          currency: 'RUB',
          moneyAmount: amount,
          provider: 'c2c-anytoany',
          cardNumber: cardNumber,
          providerFields: { toCardNumber: process.env.RECEIVER_CARD },
        },
      },
    });

    const resultCode = get(response, 'data.resultCode');
    if (resultCode === 'OK') {
      return get(response, 'data.payload.shortDescription');
    }

    return '';
  }

  _buildRedirectPage(url: string, paReq: string, MD: string): string {
    return `<html>
    <body OnLoad="OnLoadEvent();">        
        <form name="mainform" action="${url}" method="POST">
          <input type="hidden" name="PaReq" value="${paReq}">
          <input type="hidden" name="TermUrl" value=${process.env.HOST}/confirm>
          <input type="hidden" name="MD" value="${MD}"> 
        </form>
        <SCRIPT LANGUAGE="Javascript">
          function OnLoadEvent() {
            document.mainform.submit();} 
        </SCRIPT>
      </body>
  </html>`;
  }
}
