import React from 'react';
import { createUserAccount, login, pinContent } from 'simpleid-js-sdk';
import './App.css';
import { UserSession } from 'blockstack';
import { AppConfig } from 'blockstack'
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';

const appConfig = new AppConfig(['store_write', 'publish_data', 'email']);
const userSession = new UserSession({ appConfig });
const config = {
  apiKey: "-LmCb96-TquOlN37LpM0", //found in your SimpleID account page
  devId: "imanewdeveloper", //found in your SimpleID account page
  authProviders: ['blockstack'], //array of auth providers that matches your modules selected
  storageProviders: ['blockstack', 'pinata'], //array of storage providers that match the modules you selected
  appOrigin: "https://yourapp.com", //This should match the url you provided in your dev account sign up
  scopes: ['publish_data', 'store_write', 'email'],  //array of permission you are requesting from the user
  development: true
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userSession,
      content: "", 
      versions: [],
      selectedVersionContent: "", 
      pageRoute: "signup",
      versionPane: false, 
      versionModal: false, 
      username: "", 
      password: "", 
      email: "",
      loading: false , 
      error: ""
    }
  }

  async componentDidMount() {
    const { userSession } = this.state;
    const content = await userSession.getFile('note.json', {decrypt: false});
    const decryptedContent = userSession.decryptContent(JSON.parse(content), {privateKey: userSession.loadUserData().appPrivateKey});
    const versions = await userSession.getFile('version_history.json', {decrypt: true});
    this.setState({ content: JSON.parse(decryptedContent), versions: JSON.parse(versions) });
    var editor = new window.MediumEditor('.editable');
    //We'll load our content here soon
    editor.subscribe('editableInput', (event, editable) => {
      this.setState({ content: editor.getContent(0) });
    });

    editor.setContent(JSON.parse(decryptedContent), 0);
  }

  saveContent = async () => {
    const { content, userSession, versions } = this.state;
    //First we save to IPFS
    const encryptedContent = userSession.encryptContent(JSON.stringify(content), {publicKey: getPublicKeyFromPrivate(userSession.loadUserData().appPrivateKey)});
    const contentToPin = {
      pinnedContent: JSON.stringify(encryptedContent)
    }
    const params = {
      devId: config.devId, //your dev ID found in your SimpleID account page
      username: userSession.loadUserData().username, //you logged in user's username
      id: Date.now(), //an identifier you can use to reference your content later
      content: contentToPin, //the content we discussed previously
      apiKey: config.apiKey,  //the api key found in your SimpleID account page
      development: true
    }
    const pinnedContent = await pinContent(params);
    console.log(pinnedContent);
    if(pinnedContent.message === "content successfully pinned") {
      const newVersion = {
        timestamp: Date.now(), 
        hash: pinnedContent.body
      }
      versions.push(newVersion);
      this.setState({ versions });
      const savedVersion = await userSession.putFile("version_history.json", JSON.stringify(versions), {encrypt: true});
      console.log(savedVersion);
      const savedContent = await userSession.putFile('note.json', JSON.stringify(encryptedContent), {encrypt: false});
      console.log(savedContent);
    } else {
      console.log("Error saving content");
    }
  }

  handleVersionModal = (hash) => {
    const { userSession } = this.state;
    this.setState({ selectedVersionContent: "", versionModal: true });
    fetch(`https://gateway.pinata.cloud/ipfs/${hash}`)
    .then(function(response) {
      return response.json();
    })
    .then((myJson) => {
      console.log(myJson);
      const encryptedContent = myJson.pinnedContent;
      console.log(encryptedContent);
      const decryptedContent = userSession.decryptContent(JSON.parse(encryptedContent), {privateKey: userSession.loadUserData().appPrivateKey});
      this.setState({ selectedVersionContent: JSON.parse(decryptedContent)});
    });
  }

  handleUsername = (e) => {
    this.setState({ username: e.target.value });
  }

  handlePassword = (e) => {
    this.setState({ password: e.target.value });
  }

  handleEmail = (e) => {
    this.setState({ email: e.target.value });
  }

  handleSignIn = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, error: "" });
    const { username, password } = this.state;
    const credObj = {
      id: username, 
      password: password, 
      hubUrl: 'https://hub.blockstack.org' //This is the default Blockstack storage hub
    }
    const params = {
      credObj,
      appObj: config,
      userPayload: {} //this can be left as an empty object
    }
    try {
      const signIn = await login(params);
      if(signIn.message === "user session created") {
        localStorage.setItem('blockstack-session', JSON.stringify(signIn.body.store.sessionData));
        window.location.reload();
      } else {
        this.setState({ loading: false, error: signIn.body })
      }
    } catch(err) {
      console.log(err);
      this.setState({ error: "Trouble signing in..."})
    }
  }

  handleSignUp = async (e) => {
    e.preventDefault();
    console.log("doing it")
    this.setState({ loading: true, error: "" });
    const { username, password, email } = this.state;
    const credObj = {
      id: username, 
      password: password, 
      hubUrl: 'https://hub.blockstack.org', //This is the default Blockstack storage hub
      email: email
    }
    try {
      const account = await createUserAccount(credObj, config);
      if(account.message === "user session created") {
        localStorage.setItem('blockstack-session', JSON.stringify(account.body.store.sessionData));
        window.location.reload();
      } else {
        this.setState({ loading: false, error: account.message })
      }
    } catch(err) {
      console.log(err);
      this.setState({ error: "Trouble signing up..."})
    }
  }

  handleSignOut = () => {
    localStorage.removeItem('blockstack-session');
    window.location.reload();
  }

  render() {
    const { pageRoute, userSession, username, password, email, loading, error, versions, versionPane, versionModal, selectedVersionContent } = this.state;
    return (
      <div className="App">
        {
          loading ? 
          <div>
            <h1>Loading...</h1>
          </div> : 
          <div>
          {
            pageRoute === "signup" && !userSession.isUserSignedIn() ? 
            <div>
              <form onSubmit={this.handleSignUp} className="auth-form">
                <input placeholder="username" id="username-sign-up" type="text" value={username} onChange={this.handleUsername} />
                <input placeholder="password" id="password-sign-up" type="password" value={password} onChange={this.handlePassword} />
                <input placeholder="email" id="password-sign-up" type="email" value={email} onChange={this.handleEmail} />
                <button type="submit">Sign Up</button>
              </form>
              <p>Already have an account? <button onClick={() => this.setState({ pageRoute: "signin" })} className="button-link">Sign In.</button></p>
              <p>{error}</p>
            </div> : 
            pageRoute === "signin" && !userSession.isUserSignedIn() ?
            <div>
              <form onSubmit={this.handleSignIn} className="auth-form">
                <input placeholder="username" id="username-sign-in" type="text" value={username} onChange={this.handleUsername} />
                <input placeholder="password" id="password-sign-in" type="password" value={password} onChange={this.handlePassword} />
                <button type="submit">Sign In</button>
              </form>
              <p>Need to sign up? <button onClick={() => this.setState({ pageRoute: "signup" })} className="button-link">Register.</button></p>
              <p>{error}</p>
            </div> : 
            <div>
              <button onClick={this.handleSignOut}>Sign Out</button>
              <button onClick={this.saveContent}>Save</button>
              <button onClick={() => this.setState({ versionPane: !versionPane })}>Version History</button>
              <div className="editor">
                <h1>NoteStream</h1>
                <p>Start where you left off or shove your thoughts in the middle somewhere. It's up to you!</p>
                <div className="editable"></div>

                <div className={versionPane ? "versionPaneOpen" : "versionPaneClosed"}>
                  <ul>
                  {
                    versions.map(v => {
                      return(
                        <li key={v.timestamp}><a href="#" onClick={() => this.handleVersionModal(v.hash)}>{v.timestamp}</a></li>
                      )
                    })
                  }
                  </ul>
                </div>
                <div className={versionModal ? "versionModalOpen" : "versionModalClosed"}>
                  <span onClick={() => this.setState({versionModal: false})} id="version-close">Close</span>
                  {
                    selectedVersionContent ? 
                    <div dangerouslySetInnerHTML={{__html: selectedVersionContent}} />: 
                    <h3>Loading content for selected version...</h3>
                  }
                </div>
              </div>
            </div>
          }
          </div>
        }
      </div>
    );
  }
}

export default App;
