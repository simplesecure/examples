import { createUserAccount, login, pinContent, fetchPinnedContent } from 'simpleid-js-sdk';
import { UserSession } from 'blockstack';
import { AppConfig } from 'blockstack'

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

export function signIn(params) {
  //Allow users to sign in to existing accounts
}

export function signUp(params) {

}

export function signOut() {
  //Allow users to sign out
}

export function saveContent() {
  //Save content to both Blockstack and IPFS
}

export function getContent(ipfs, hash) {
  //Fetch content with a boolean to indicate if it should be fetched from ipfs and a hash
}