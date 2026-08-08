import Stripe from "stripe";
// import config from "../config";
import config from "../config/index";

export const stripe = new Stripe(config.stripe_secret_key)