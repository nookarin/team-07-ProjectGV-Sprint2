import axios from "axios";

// Fetches dynamic EMVCo PromptPay QR Code calculated for active cart
export async function fetchPromptPayQR(url) {
  const response = await axios.get(`${url}/payments/promptpay-qr`, {
    withCredentials: true,
  });
  return response.data;
}

// Submits payment (supports card, stripe, bank_transfer, promptpay with optional slip)
export async function submitPayment(
  url,
  { shipping_address, payment_method, card, bank, slipFile },
) {
  let requestData;
  let headers = {};

  if (slipFile) {
    const formData = new FormData();
    formData.append("shipping_address", JSON.stringify(shipping_address));
    formData.append("payment_method", payment_method);
    if (card) formData.append("card", JSON.stringify(card));
    if (bank) formData.append("bank", JSON.stringify(bank));
    formData.append("slip", slipFile);
    requestData = formData;
    headers["Content-Type"] = "multipart/form-data";
  } else {
    requestData = { shipping_address, payment_method, card, bank };
  }

  const response = await axios.post(`${url}/payments/checkout`, requestData, {
    headers,
    withCredentials: true,
  });
  return response.data;
}
