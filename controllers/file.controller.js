const axios = require("axios");
const SHA256 = require("sha256");
const connectToDatabase = require("../misc/db");

// require("dotenv").config();

//.env variables recieve
const API_REDIRECT_URL = "https://payrollapi-new.onrender.com/checkOrder";
const PHONEPE_MID = "M2306160483220000000";
const PHONEPE_SALT_KEY = "b1b2b3b4b5b6b7b8b9b0";
const PHONEPE_SALT_INDEX = "1";
const PHONEPE_URL = "https://api.phonepe.com/apis/hermes";
// const REDIRECT_URL = process.env.REDIRECT_URL;

function errorchecker(errorMessage) {
  return { error: errorMessage };
}

async function makeOrder(req, res, next) {
  // console.log("__filename=" + __filename + " => makeOrder()");

  try {
    const { id, planname, amount, phone, email, transactionid, muid, url } =
      req.body;

    let redirectUrl = `${API_REDIRECT_URL}?transactionid=${transactionid}&&userid=${id}&&plan=${planname}&&amount=${amount}&&email=${email}&&url=${url}`;

    const payload = {
      merchantId: PHONEPE_MID,
      merchantTransactionId: transactionid,
      merchantUserId: muid,
      amount: amount * 100,
      redirectUrl: redirectUrl,
      redirectMode: "POST",
      callbackUrl: redirectUrl,
      mobileNumber: phone,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    console.log(payload);

    const dataPayload = JSON.stringify(payload);
    const dataBase64 = Buffer.from(dataPayload).toString("base64");
    const fullURL = dataBase64 + "/pg/v1/pay" + PHONEPE_SALT_KEY;
    const dataSha256 = SHA256(fullURL);
    const checksum = dataSha256 + "###" + PHONEPE_SALT_INDEX;

    const UAT_PAY_API_URL = `${PHONEPE_URL}/pg/v1/pay`;

    const options = {
      method: "POST",
      url: UAT_PAY_API_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: dataBase64,
      },
    };

    const response = await axios.request(options);
    console.log(response.data);
    return res.json(response.data);
  } catch (error) {
    console.log("Error:", error);
    return res.status(202).json(errorchecker(error.message || error));
  }
}

async function checkOrder(req, res, next) {
  // console.log("__filename=" + __filename + " => checkOrder()");

  try {
    const { PaymentService } = await connectToDatabase();
    const { transactionid, userid, plan, amount, email, url } = req.query;
    const merchantId = PHONEPE_MID;

    const fullURL =
      `/pg/v1/status/${merchantId}/${transactionid}` + PHONEPE_SALT_KEY;
    console.log("fullURL=" + fullURL);
    const dataSha256 = SHA256(fullURL);
    const checksum = dataSha256 + "###" + PHONEPE_SALT_INDEX;

    const options = {
      method: "GET",
      url: `${PHONEPE_URL}/pg/v1/status/${merchantId}/${transactionid}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": `${merchantId}`,
      },
    };

    console.log(options);

    const response = await axios.request(options);
    console.log(response);

    if (
      response.data.success === true &&
      response.data.code === "PAYMENT_SUCCESS"
    ) {
      // update subscription in database
      const update_subscription = await PaymentService.update({
        is_subscribed: 1,
        transaction_id: transactionid,
        subscribed_on: Date.now(),
        subscribe_expired_on: Date.now().getMonth() + plan,
        plan_months: plan,
        payment_status: "Successful",
        amount: amount,
      }, { where: { genarate_id: userid } });
      console.log(update_subscription);

      const data_url = `${url}payment-successful`;
      return res.redirect(data_url);
      // return res.status(200).Json({ message: "payment successfull" });
    } else {
      const data_url = `${url}payment-failed`;
      return res.redirect(data_url);
      // return res.status(500).Json({ message: "Your payment is failed" });
    }
  } catch (error) {
    console.log("Error: ", error.message);
    return res.status(202).json(errorchecker(error.message || error));
  }
}

module.exports = { makeOrder, checkOrder };
