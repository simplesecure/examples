import React from 'react';
import './App.css';
const Box = require('3box');
const request = require('request-promise');
const address = "0xA89fBf7cb4AED9b5516402B7E94c2643cAA100D0";
const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };

class App extends React.Component {
  async componentDidMount() {
    const ethProvider = () => {
      return {
        send: (data, callback) => {
          console.log("doing it")
          const payload = JSON.stringify({
            tx: {
              data: data.params[0]
            }
          })
          const options = { url: "http://localhost:5000/v1/signTx", method: 'POST', headers: headers, body: payload };
          console.log("maiking the request");
          request(options)
          .then(async (body) => {
            console.log(body);
            // POST succeeded...
            callback(null, { result: body })
          })
          .catch(error => {
            // POST failed...
            console.log('ERROR: ', error)
  
          });
        }
      }
    }
    console.log("here we go");
    let box = await Box.openBox(address, ethProvider());
    box.onSyncDone(async () => {
      console.log("done");
      await box.public.set('name', 'oed')
      const nickname = await box.public.get('name')
      console.log(nickname);
    })
  }
  render() {
    return (
      <div className="App">
       
      </div>
    );
  }
}

export default App;
