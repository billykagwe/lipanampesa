# lipanampesa
simplifies lipa na mpesa integration to your javascript app

### Inspiration
Following the docs for daraja api is challenging and overwhelming. I spent a whole day trying to figure out what the workflow.
After overcoming the struggle, i felt like its something that can be simplified.

### How it works
Safaricom documentation requires a couple of steps
 -format time
  -creates password required for the transaction
  - constructs auth url that is passed in Authorization
  headers
  -obtain access token required to initiate a transaction
  -finally initiates a transaction -
  
However, i have composed the whole workflow, meaning you only require 2 simple steps to get up and running
-first import the package
const lipanampesa = require('lipanampesa_simplified')

//Required credentials
- You can use the test shortcode and passkey obtained from this site - https://developer.safaricom.co.ke/test_credentials
- consumer_key and consumer_secret are provided after you register your app in daraja api portal
- AccountReference is name that appears on pop up alert on phone ('keep it to max of 12 characters)
- TransactionDesc - Description of your transaction (max of 13 characters)


-You would probably put the credentials in .env file and import them


const credentials = {
  ShortCode: "174379",
  passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
  PartyB: "174379",
  CallBackURL: "https://9vlic.sse.codesandbox.io/api/mpesa-callback",
  AccountReference: "Easy Shop",
  TransactionDesc: "Products",
  consumer_key: "EoDJq6WpLOmDXxRgGRLcBtsJdguSE4vy",
  consumer_secret: "hDL7TyheQSxzrbox"
};

const initiate_transaction = lnp.transact(credentials);

//fork method runs the transaction. 
-it requires two functions on left and right
(both methods receive a response from safaricom api) - you can choose how to handle each case

- on the left you handle error - this could be like display an error
- on the right you handle success - this could be like send a success msg -(transaction loading)

initiate_transaction({ PhoneNumber: "254714415603", Amount: "1" })
.fork(
  console.log, //handle failure
  console.log //handle success
);

The package removes obvious code and gives you minimal and necessary input to achieve your goal
I do not work at safaricom and may have missed something. 
Its open, you are welcome to contribute

Reach out to me
https://twitter.com/billmwas2 or billmwas2@gmail.com

Have fun Hacking!!

