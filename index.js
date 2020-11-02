/** @format */

const fetch = require("node-fetch");
const moment = require("moment");

//constants
const ACCESS_TOKEN_URL = `https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`;
const RESOURCE_URL = `https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest`;
const TransactionType = "CustomerPayBillOnline";

const Task = (fork) => ({
  fork,
  ap: (other) =>
    Task((rej, res) => fork(rej, (f) => other.fork(rej, (x) => res(f(x))))),
  map: (f) => Task((rej, res) => fork(rej, (x) => res(f(x)))),
  chain: (f) => Task((rej, res) => fork(rej, (x) => f(x).fork(rej, res))),
  concat: (other) =>
    Task((rej, res) =>
      fork(rej, (x) =>
        other.fork(rej, (y) => {
          console.log("X", x, "Y", y);
          return res(x.concat(y));
        })
      )
    ),
  fold: (f, g) =>
    Task((rej, res) =>
      fork(
        (x) => f(x).fork(rej, res),
        (x) => g(x).fork(rej, res)
      )
    ),
});
Task.of = (x) => Task((rej, res) => res(x));

const format_time = (creds) => ({
  ...creds,
  Timestamp: moment().format("YYYYMMDDHHMMSS"),
});

const create_password = (creds) => {
  const encode_str = creds.ShortCode + creds.passkey + creds.Timestamp;
  return { ...creds, Password: Buffer.from(encode_str).toString("base64") };
};

//example of credentials required

// const credentials = {
//   ShortCode: "174379",
//   passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
//   PartyB: "174379",
//   CallBackURL: "https://9vlic.sse.codesandbox.io/api/mpesa-callback",
//   AccountReference: "Easy Shop",
//   TransactionDesc: "Products",
//   consumer_key: "EoDJq6WpLOmDXxRgGRLcBtsJdguSE4vy",
//   consumer_secret: "hDL7TyheQSxzrbox"
// };

const fetchJson = (...args) =>
  fetch(...args)
    .then((res) => {
      // console.log(res, "res");
      return res.json();
    })
    .then((data) => data)
    .catch((err) => err);

const initiate_transaction = ({
  ShortCode,
  Password,
  Timestamp,
  CallBackURL,
  AccountReference,
  TransactionDesc,
  TransactionType,
  RESOURCE_URL,
  access_token,
  PhoneNumber,
  Amount,
}) => {
  return Task((rej, res) =>
    fetchJson(RESOURCE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token} `,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: ShortCode,
        Password: Password,
        Timestamp: Timestamp,
        TransactionType: TransactionType,
        Amount: Amount,
        PartyA: PhoneNumber,
        PartyB: ShortCode,
        PhoneNumber: PhoneNumber,
        CallBackURL: CallBackURL,
        AccountReference: AccountReference,
        TransactionDesc: TransactionDesc,
      }),
    })
      // .then((result) => result.json())
      .then((data) => res(data))
      .catch((err) => rej(err))
  );
};

//format url in the mpesa format
const makeAuthUrl = (creds) => ({
  ...creds,
  authToken:
    "Basic " +
    Buffer.from(creds.consumer_key + ":" + creds.consumer_secret).toString(
      "base64"
    ),
});

//request access token required to initiate a transaction
const get_credentials = (creds) => {
  return Task((rej, res) =>
    fetchJson(creds.ACCESS_TOKEN_URL, {
      headers: {
        Authorization: creds.authToken,
      },
    })
      .then((result) => res({ ...creds, access_token: result.access_token }))
      .catch((err) => rej(err))
  );
};

/* procedure that composes 
  -format time
  -creates password required for the transaction
  - constructs auth url that is passed in Authorization
  headers
  -obtain access token required to initiate a transaction
  -finally initiates a transaction -
  returns a Task Result that we can fork to handle error or success

*/
export const transact = (creds) => ({ PhoneNumber, Amount }) =>
  Task.of({
    ...creds,
    ACCESS_TOKEN_URL,
    RESOURCE_URL,
    TransactionType,
    PhoneNumber,
    Amount,
  })
    .map(format_time)
    .map(create_password)
    .map(makeAuthUrl)
    .chain(get_credentials)
    .chain(initiate_transaction);
