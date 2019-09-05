const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const request = require("request");

const simple = require('simpleid-node-sdk');
const config = {
  apiKey: YourSimpleIDKey, //found in your SimpleID account page
  devId: YourSimpleIDDevID, //found in your SimpleID account page
  authProviders: ['ethereum'], //array of auth providers that matches your modules selected
  storageProviders: ['pinata'], //array of storage providers that match the modules you selected
  appOrigin: YourAppOrigin, //even if using SimpleID on a server or as a desktop/mobile app, you'll need to pass an origin for reference
  scopes: ['publish_data', 'store_write'], //array of permission you are requesting from the user
  development: true ///flip to false if in production
}

const accountSid = YourTwilioAccountSid;
const authToken = YourTwilioAuthToken;
const client = require('twilio')(accountSid, authToken);

app.use(bodyParser.json());

app.get('/content', async (req, res) => {
  const username = req.query.username;
  console.log(username);
  const params = {
    devId: config.devId, //your dev ID found in your SimpleID account page
    username, //you logged in user's username
    id: "ipfs-text", //the identifier you used for reference of the pinned content
    apiKey: config.apiKey, //the api key found in your SimpleID account page
    development: true //flip to false if in production
  }

  const fetchedContent = await simple.fetchPinnedContent(params);
  res.send(fetchedContent);
});

app.post('/auth/create', async (req, res) => {
  const { email, id, password } = req.body;
  const credObj = {
    email, 
    id, 
    password, 
    hubUrl: "https://hub.blockstack.org" //this is for blockstack storage, but needs to be sent even when not in use
  }
  const account = await simple.createUserAccount(credObj, config)
  res.send(account);
})
app.post('/auth/login', async (req, res) => {
  const { id, password } = req.body;
  const credObj = {
    id, 
    password,
    hubUrl: "https://hub.blockstack.org"
  }
  const params = {
    credObj, 
    appObj: config
  }

  const loggedIn = await simple.login(params);
  res.send(loggedIn);
})
app.post('/postContent', async (req, res) => {
  const { id, ethAddr, content } = req.body;
  const contentToPin = {
    id,
    date: Date.now(), 
    address: ethAddr, 
    content
  }
  const params = {
    devId: config.devId, //your dev ID found in your SimpleID account page
    username: id, //you logged in user's username
    id: "ipfs-text", //an identifier you can use to reference your content later
    content: contentToPin, //the content we discussed previously
    apiKey: config.apiKey, //the api key found in your SimpleID account page
    development: true //flip to false if in production
  }

  const postedContent = await simple.pinContent(params);
  const postData = {
    from: params.username, 
    content: params.content.content
  }

  var options = { method: 'POST',
  url: 'http://localhost:3000/sendText',
  headers: 
   { Host: 'localhost:3000',
     'Content-Type': 'application/json' },
  body: postData,
  json: true };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
  });

  res.send(postedContent);
})

app.post('/sendText', async (req, res) => {
  const { content, from } = req.body;
  client.messages
    .create({
      body: `New post from ${from}: ${content}`,
      from: YourTwilioNumber,
      to: YourCellNumber
    })
    .then(message => res.send(message))
    .catch(error => console.log(error));
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`))