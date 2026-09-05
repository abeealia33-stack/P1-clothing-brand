/** Prices are whole rupees everywhere — no paisa in this catalogue. */
export const rupees = (amount: number) => amount.toLocaleString("en-PK");

export const priceLabel = (amount: number) => `PKR ${rupees(amount)}`;
