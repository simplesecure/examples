import React, {Fragment} from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, TextInput, Button } from 'react-native';
import FS from 'react-native-fs'
import Textile, { ThreadAdd, AddThreadConfig } from '@textile/react-native-sdk';
const textileRepoPath = `${FS.DocumentDirectoryPath}/textile-go`
const config = {
  apiKey: "-LmCb96-TquOlN37LpM0",
  devId: "imanewdeveloper", 
  appOrigin: 'https://textile.io/', 
  development: true
}
//const priorSeed = "SXa35T7TwQZhd8Mm3droH37hHeg9r7P6kBvWc9H4FY5vFoNv";
//const simpleIDSeed = "SUndZ3QS53nrsmASHS6Qc2Sht12K5DFamCKTNuPk2BWYUdF4";
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      username: "", 
      password: "", 
      email: "", 
      loading: false, 
      ready: true, 
      threadId: "", 
      threads: [], 
      auth: false, 
      restore: false,
      threadsPage: false,
      welcomeScreen: true, 
      error: ""
    }
  }

  async componentDidMount() {
    const initialized = await Textile.isInitialized(textileRepoPath);
    if(initialized) {
      console.log("Textile already initialized, launching now...")
      this.setState({ initialized: true });
      await Textile.launch(textileRepoPath, true).catch(error => console.log(error));
    } else {  
      console.log("Textile not initialized, please initialize.");
    }
  }

  backupAccount = async () => {
    const { email, username, password } = this.state;
    //We should be sending SimpleID the Textile Seed
    this.setState({ loading: true });
    const app_origin = config.appOrigin;
    const devId = config.devId;
    let response = await fetch('https://i7sev8z82g.execute-api.us-west-2.amazonaws.com/dev/keychain', {
      method: 'POST',
      body: JSON.stringify({
          username,
          password, 
          development: config.development, 
          devId, 
          email
      }),
      headers: {
          'Content-Type': 'application/json',
          'Authorization': config.apiKey
      }
    })
    .then((resp) => {
      let text = resp.text(); // there's always a body
      if (resp.status >= 200 && resp.status < 300) {
        return text;
      } else {
       return text.then(Promise.reject.bind(Promise));
      }
    })
    .catch(error => console.log(error))
    console.log(response)
    if(response) {
      let profile = {
        '@type': 'Person',
        '@context': 'http://schema.org',
        'apps': {}
      }
      profile.apps[app_origin] = "";
      let appKeys = await fetch('https://i7sev8z82g.execute-api.us-west-2.amazonaws.com/dev/appkeys', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: '-LmCb96-TquOlN37LpM0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          profile,
          url: app_origin,
          development: 'true',
          devId: 'imanewdeveloper'
        }),
      })
      .then((resp) => {
        let text = resp.text(); // there's always a body
        if (resp.status >= 200 && resp.status < 300) {
          return text;
        } else {
         return text.then(Promise.reject.bind(Promise));
        }
      })
      .catch(error => console.log(error))
      let textileSeed = JSON.parse(appKeys).textile;
      console.log(textileSeed);
      await Textile.initialize(textileRepoPath, textileSeed, true, true);
      console.log("Textile should now be initialized!");
      console.log("Launching...");
      await Textile.launch(textileRepoPath, true);
    } else {
      console.log("Error creating identity");
    }
  }

  restoreAccount = async () => {
    this.setState({ loading: true, error: "" });
    const { username, password } = this.state;
    let profile = {
      '@type': 'Person',
      '@context': 'http://schema.org',
      'apps': {}
    }
    profile.apps[app_origin] = "";
    let appKeys = await fetch('https://i7sev8z82g.execute-api.us-west-2.amazonaws.com/dev/appkeys', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        profile,
        url: config.appOrigin,
        development: config.development,
        devId: config.devId
      }),
    })
    .then((resp) => {
      let text = resp.text(); // there's always a body
      if (resp.status >= 200 && resp.status < 300) {
        return text;
      } else {
       return text.then(Promise.reject.bind(Promise));
      }
    })
    .catch(error => {
      console.log(error);
      this.setState({ loading: false, error: "Trouble restoring account"});
    })
    let textileSeed = JSON.parse(appKeys).textile;
    console.log(textileSeed);
    await Textile.initialize(textileRepoPath, textileSeed, true, true);
    console.log("Textile should now be initialized!");
    console.log("Launching...");
    await Textile.launch(textileRepoPath, true);
    this.setState({ welcomeScreen: true, loading: false, auth: false });
  }

  createThread = async () => {
    const key = `textile_photos-shared-${Date.now()}`;
    const name = "My new thread";

    const config = {
      key,
      name,
      type: "private",
      sharing: false,
      schema: { id: '', json: '', preset: AddThreadConfig.Schema.Preset.MEDIA },
      force: false,
      whitelist: []
    }
    const thread = await Textile.threads.add(config);
    console.log(thread);
  }

  renderAuth() {
    const { restore, username, password, email, error } = this.state;
    if(restore) {
      return (
        <SafeAreaView>
          <View>
            <View style={{padding: 10}}>
              <Button title="Back" onPress={() => this.setState({ welcomeScreen: true, auth: false})} />
              <Text>Restore Account</Text>
              <TextInput
                style={{height: 40}}
                placeholder="Enter your username"
                onChangeText={(text) => this.setState({username: text})}
                value={username}
              />
              <TextInput
                style={{height: 40}}
                placeholder="Enter your password"
                onChangeText={(text) => this.setState({password: text})}
                value={password}
              />
              <Text>{error}</Text>
              <Button title="Restore" onPress={() => this.restoreAccount({email, password})} />
            </View>
          </View>
        </SafeAreaView>
      )
    } else {
      return (
        <SafeAreaView>
          <View>
            <View style={{padding: 10}}>
              <Button title="Back" onPress={() => this.setState({ welcomeScreen: true, auth: false})} />
              <Text>Backup Your Account</Text>
              <TextInput
                style={{height: 40}}
                placeholder="Choose a username"
                onChangeText={(text) => this.setState({username: text})}
                value={username}
              />
              <TextInput
                style={{height: 40}}
                placeholder="Make a strong password"
                onChangeText={(text) => this.setState({password: text})}
                value={password}
              />
              <TextInput
                style={{height: 40}}
                placeholder="Enter your email"
                onChangeText={(text) => this.setState({email: text})}
                value={email}
              />
              <Button title="Backup" onPress={() => this.backupAccount({email, password, username})} />
            </View>
          </View>
        </SafeAreaView>
      )
    }
  }

  renderThreads() {
    const { threads } = this.state;
    return (
      <View>
        <Button title="Back" onPress={() => this.setState({ threadsPage: false, welcomeScreen: true})} />
        <Text style={styles.heading}>Threads Here</Text>
        {
          threads.map(thread => {
            return (
              <View style={styles.threadCard} key={thread.id}>
                <Text style={styles.threadHeading}>{thread.name}</Text>
                <Button title="Add Files to Thread" />
                <Button title="View Files in Thread" />
              </View>
            )
          })
        }
      </View>
    )
  }

  renderWelcome() {
    const { initialized } = this.state;
    return (
      <View>
        {
          initialized ? 
          <View>
            <Text style={styles.heading}>Welcome! Let's Combine the powers of SimpleID and Textile and make something awesome!</Text>
            <Button onPress={() => this.setState({ threadsPage: true, welcomeScreen: false })} title="Go to your threads"/>
            <Button onPress={() => this.setState({ welcomeScreen: false, auth: true })} title="Settings"/>
          </View> : 
          <View>
            <Text style={styles.heading}>Welcome! Let's Combine the powers of SimpleID and Textile and make something awesome!</Text>
            <Text style={styles.marginBottom}>Looks like you haven't used SimpleID + Textile on this device yet. Let's get started.</Text>
            <Text>When you create an account, that account will only be available on this device until you back it up.</Text>
            <Button style={styles.marginBottom} title="Create New Account"/>
            <Text>Already have an account backed up via SimpleID? Restore it here.</Text>
            <Button onPress={() => this.setState({ welcomeScreen: false, auth: true, restore: true })} title="Restore Account"/>
          </View>
        }
        
      </View>
    )
  }

  render() {
    const { loading, welcomeScreen, auth } = this.state;
    Textile.events.addNodeStartedListener(async () => {
      const seed = await Textile.account.seed();
      console.log("Seed: ", seed);
      const threadList = await Textile.threads.list();
      this.setState({ threads: threadList.items });
      this.setState({ ready: true, loading: false });
    })
    return (
      <Fragment>
        {
          loading ? 
          <View style={styles.loading}>
            <View style={styles.body}>
              <Text style={styles.sectionTitle}>Loading...</Text>
            </View>
          </View> : 
          <SafeAreaView>
          <ScrollView>
            <View style={styles.container}>
              {
                welcomeScreen ? 
                <View>
                {this.renderWelcome()}
                </View> : 
                auth ? 
                <View>
                  {this.renderAuth()}
                </View> : 
                <View>
                  {this.renderThreads()}
                </View>
              }
            </View>
            
          </ScrollView>
        </SafeAreaView>
        }
      </Fragment>
    );
  }
};



const styles = StyleSheet.create({
  container: {
    marginTop: 65,
    maxWidth: "85%", 
    marginLeft: "7.5%", 
    marginRight: "7.5%"
  },
  marginBottom: {
    marginBottom: 15
  }, 
  heading: {
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 25, 
    textAlign: "center"
  }, 
  threadCard: {
    borderColor: "#282828", 
    borderWidth: 1, 
    padding: 15
  }, 
  threadHeading: {
    fontSize: 16, 
    fontWeight: "bold", 
    marginBottom: 25, 
    color: "grey",
    textAlign: "center"
  }, 
  header: {
    backgroundColor: "#eee",
    fontSize: 36,
    padding: 20
  }, 
  loading: {
    marginTop: 100,
    marginLeft: 25
  }
});

export default App;
