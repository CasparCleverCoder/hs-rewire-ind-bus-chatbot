# Chatbot for the Rewire Industrial Business Developer Unconference

The this Chatbot ist based on a React App and for more info see[Create React App](https://github.com/facebookincubator/create-react-app).

## Dependencies
This application uses:
1. IBM Cloud Functions (openwhisk) to invoke the Watson Services
2. IBM Watson Assistant Servicee

##The following IBM Cloud Functions are neccessary to run the application

1. A web endpoint which can be invoked from the React application to start the Function sequence
2. The Function sequence to invoke the Watson Assistant Function (Openwhisk action)
3. The Watson Assistant service with a corresponding workspace to handle the user dialog

You can copy the code of the Functions from the actions directory Parameters of the action definitions!!

##Setup

1. Create a service instance of Watson Assistant Service in IBM Cloud
2. Create Assistant Service Workspace for English Language
3. An alternative would be to load the initial Rewire Ind. Bus. Workspace Starter Package and extent it related to your needs
4. Using the IBM Watson Launch tool, define Intents, Utterances and Dialogs and test the conversation.

5. Create an IBM Function to invoke the Watson Assistant via NodeJS API call
6. Copy the javascript code from Github and create a new Function and specify the paramter of username, password and ws-id in the parameter section of the Action
7. Make sure to use NodeJS 6 as the runtime for the Function
8. Define a IBM Function Sequence and invoke the Action
9. Web enable the Sequence you created - save the url for later usage

## Using a REACT App as a front end application

10. Deploy this REACT Application direct to Bluemix

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/HartmutSeitter/hs-rewire-ind-bus-chatbot)


## Important - Before you run the build process you have to specify
In the creadet toolchain selet the GIT box
select the src folder
open the App.js file in the editor and specify the correct Endpoint address into the const watsonApiUrl


```
  callWatson(message) {
    /*** */
    //
    // here you have to specify the RESTAPI End point of your Function to invoke Watson Assistant
    //
    /*** */
    const watsonApiUrl = "put here your IBM Function sequence Endpoint address";

```


A DevOps toolchain will be created and you have to specify the following deployment scripts

## Build script

Spceify npm in the builder type
Specify build in the 'build archive directory'
Copy this code into the build script box

```
#Set up required version of Node and NPM
export NVM_DIR=/home/pipeline/nvm
export NODE_VERSION=7.0.0
export NVM_VERSION=0.33.0

npm config delete prefix \
  && curl https://raw.githubusercontent.com/creationix/nvm/v${NVM_VERSION}/install.sh | sh \
  && . $NVM_DIR/nvm.sh \
  && nvm install $NODE_VERSION \
  && nvm alias default $NODE_VERSION \
  && nvm use default \
  && node -v \
  && npm -v

#Install & build
npm install && npm install watson-react-components && npm run build
```
7. Set Build archive directory to build

8. In the Deploy stage specify the deploy config appropriate and use the following Deploy Script

Copy this code into the deployment script box
```
#!/bin/bash
# Push app
if ! cf app $CF_APP; then
  cf push $CF_APP -b https://github.com/cloudfoundry-community/staticfile-buildpack.git
else
  OLD_CF_APP=${CF_APP}-OLD-$(date +"%s")
  rollback() {
    set +e
    if cf app $OLD_CF_APP; then
      cf logs $CF_APP --recent
      cf delete $CF_APP -f
      cf rename $OLD_CF_APP $CF_APP
    fi
    exit 1
  }
  set -e
  trap rollback ERR
  cf rename $CF_APP $OLD_CF_APP
  cf push $CF_APP -b https://github.com/cloudfoundry-community/staticfile-buildpack.git
  cf delete $OLD_CF_APP -f
fi
# Export app name and URL for use in later Pipeline jobs
export CF_APP_NAME="$CF_APP"
export APP_URL=http://$(cf app $CF_APP_NAME | grep urls: | awk '{print $2}')
```
#Run the Build and Deploy Process and the app should be deployed to the IBM Cloud env. you specified in the Deploy Config
