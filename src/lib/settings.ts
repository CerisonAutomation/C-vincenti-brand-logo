/**
 * Checkout & booking settings — editable without redeploy.
 * Future: load from database singleton table.
 */

export interface CheckoutSettings {
  checkoutBaseUrl: string;
  checkoutLang: string;
  checkoutPathTemplate: string;
  checkoutParamKeys: {
    checkInKey: string;
    checkOutKey: string;
    guestsKey: string;
  };
  fallbackEnquiryEnabled: boolean;
}

const CHECKOUT_SETTINGS: CheckoutSettings = {
  checkoutBaseUrl: 'https://malta.guestybookings.com',
  checkoutLang: 'en',
  checkoutPathTemplate: '/properties/{listingId}',
  checkoutParamKeys: {
    checkInKey: 'checkIn',
    checkOutKey: 'checkOut',
    guestsKey: 'minOccupancy',
  },
  fallbackEnquiryEnabled: true,
};

export function getCheckoutSettings(): CheckoutSettings {
  return CHECKOUT_SETTINGS;
}

/**
 * Build a same-tab deep-link URL to Guesty checkout.
 */
export function buildCheckoutUrl(
  listingId: string,
  checkIn?: string,
  checkOut?: string,
  guests?: number,
): string {
  const s = CHECKOUT_SETTINGS;
  const path = s.checkoutPathTemplate.replace('{listingId}', listingId);
  const url = new URL(`${s.checkoutBaseUrl}/${s.checkoutLang}${path}`);

  if (checkIn) url.searchParams.set(s.checkoutParamKeys.checkInKey, checkIn);
  if (checkOut) url.searchParams.set(s.checkoutParamKeys.checkOutKey, checkOut);
  if (guests) url.searchParams.set(s.checkoutParamKeys.guestsKey, String(guests));

  return url.toString();
}
