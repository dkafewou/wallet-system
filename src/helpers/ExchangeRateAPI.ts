import Config from './config';
import axios, { AxiosInstance } from 'axios';
import logger from './logger';
import { ExternalApiError } from "../errors"

const EXCHANGE_RATE_API_HOST = Config.shared.require('EXCHANGE_RATE_API_HOST');
const EXCHANGE_RATE_API_KEY = Config.shared.require('EXCHANGE_RATE_API_KEY');

let client: AxiosInstance | null;

export default class ExchangeRateAPI {
  static get shared(): AxiosInstance {
    if (client == null) {
      client = axios.create({
        baseURL: `${EXCHANGE_RATE_API_HOST}/${EXCHANGE_RATE_API_KEY}`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }

    return client;
  }

  static async getConversation(from: string, to: string): Promise<number> {
    try {
      const { data } = await this.shared.get(`/pair/${from}/${to}`);

      return data.conversion_rate
    } catch (err) {
      logger.error(`Failed to get conversation rate for ${from}/${to}: ${err}`);
      throw new ExternalApiError("Failed to get conversation rate", err)
    }
  }
}
