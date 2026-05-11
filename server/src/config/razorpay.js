import { config } from './env.js';
import Razorpay from 'razorpay';

const instance = new Razorpay({
  key_id: config.payment.keyId || 'dummy_key_id_for_mock',
  key_secret: config.payment.secret || 'dummy_secret_for_mock'
});

export default instance;
