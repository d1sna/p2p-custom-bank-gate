import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { get } from 'lodash';

const Store = new Map([]);

@Injectable()
export class AppService {
  async sendRequestToMPI(
    cardNumber: string,
    securityCode: string,
    expiryDate: string,
    moneyAmount: string,
  ): Promise<string> {
    const response = await axios({
      url: 'https://www.tinkoff.ru/api/common/v1/pay?appName=paymentsc2c&appVersion=2.9.6&origin=web%2Cib5%2Cplatform',
      params: {
        payParameters: {
          cardNumber,
          securityCode,
          expiryDate,
          moneyAmount,
          formProcessingTime: '699',
          attachCard: 'false',
          moneyCommission: '40',
          provider: 'c2c-anytoany',
          currency: 'RUB',
          providerFields: { toCardNumber: '4790043142218391' },
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

    [MD, operationTicket, url, paReq].forEach((value) => {
      if (!value) throw new Error('Wrong response!');
    });

    Store.set(MD, operationTicket);
    // console.log(Store.values());

    return this._buildRedirectPage(url, paReq, MD);
  }

  async confirmRequestToMPI(MD: string, PaRes: string): Promise<string> {
    const initialOperationTicket = Store.get(MD);

    const confirmResult = await axios({
      url: 'https://www.tinkoff.ru/api/common/v1/confirm?appName=paymentsc2c&appVersion=2.9.6&origin=web%2Cib5%2Cplatform',
      params: {
        initialOperation: 'pay',
        initialOperationTicket,
        confirmationData: {
          '3DSecure': PaRes,
        },
      },
    });

    return confirmResult.data.plainMessage;
  }

  _buildRedirectPage(url, paReq, MD) {
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
