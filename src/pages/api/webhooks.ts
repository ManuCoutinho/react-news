import { NextApiResponse, NextApiRequest } from 'next'
import { Readable } from 'stream'
import Stripe from 'stripe'
import { stripe } from '../../services/stripe'
import { saveSubscription } from './_lib/manageSubscription'

async function buffer(readable: Readable) {
  const chunks = []

  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export const config = {
  api: {
    bodyParser: false,
  },
}

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req)
    const secret = req.headers['stripe-signature']

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        buf,
        secret,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`)
    }

    const { type } = event

    if (relevantEvents.has(type)) {
      try {
        switch (type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription

            await saveSubscription({
              subscriptionId: subscription.id,
              customerId: subscription.customer.toString(),
              createAction: false,
            })

            break

          case 'checkout.session.completed':
            const checkoutSession = event.data.object as Stripe.Checkout.Session
            console.log(`checkout session AQUI ${checkoutSession}`)

            await saveSubscription({
              subscriptionId: checkoutSession.subscription.toString(),
              customerId: checkoutSession.customer.toString(),
              createAction: true,
            })
            break
          default:
            throw new Error('Unhandled event.')
        }
      } catch (err) {
        console.log(`catch webhooks ${err}`)
        return res.json({ error: 'Webhook handler failed.' })
      }
    }
    res.json({ received: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
}
