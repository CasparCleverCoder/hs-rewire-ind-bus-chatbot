//************************************************************************************ */
// 7.2.2018 add additional field to display translated output
//  add hsmessage1 to msgObj -- here I can put translated text in, when it is switched on
//      additional changes made to Message.js, Conversation.js and the corresponding css files

import React, { Component } from 'react'
import './App.css'
import 'react-chat-elements/dist/main.css';
import Conversation from './Conversation.js';
import DiscoveryResult from './DiscoveryResult.js';
import WeatherResult from './WeatherResults.js';
import axios from 'axios'

class App extends Component {
  constructor () {
    super()
    this.state = {
      username: 'username',
      //hugo: '123',
      context: {},
      // A Message Object consists of a message[, intent, date, isUser]
      messageObjectList: [],
      discoveryNumber: 0
    }
    this.handleClick = this.handleClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  callWatson(message) {
    /*** */
    //
    // here you have to specify the RESTAPI End point of your Function to invoke Watson Assistant
    //
    /*** */
    const watsonApiUrl = "https://openwhisk.eu-gb.bluemix.net/api/v1/web/bcw2018_dev/rewire-ind-bus/hs-seq1.json";
    
    const requestJson = JSON.stringify({
      input: {
        text: message
      },
      context: this.state.context
    });
    console.log("requestJson = ", requestJson);
    return fetch(watsonApiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: requestJson
      }
    ).then((response) => {
      if(!response.ok) {
        throw response;
      }
      return(response.json());
    })
      .then((responseJson) => {
        responseJson.date = new Date();
        console.log("responseJson =");
        if (typeof responseJson === "undefined") {
          console.log("response = undefined");
        } else {
          console.log(responseJson);
          this.handleResponse(responseJson);  
        }
        }).catch(function(error) {
        console.log("error");
        throw error;
      });
  }
  handleResponse(responseJson) {
    if(responseJson.hasOwnProperty('output') 
                  && responseJson.output.hasOwnProperty('action') 
                  && responseJson.output.action.hasOwnProperty('call_discovery')) {

      let display_msg = "Discovery";
      if (responseJson.input.language_detected=='de'){
        display_msg = "Sehr interessante Frage, Watson Discovery hat diese Info in den Dokumenten gefunden";
      } else {
        display_msg = "Interesting question - Watson Discovery gathered this info for you";
      }

      this.addMessage( { label: 'Discovery Ergebnis:', message: display_msg, date: (new Date()).toLocaleTimeString()});
      console.log(">>>>>>>>>>>>>>>>>>",responseJson.input.language_detected);
      this.formatDiscovery(responseJson.output.discoveryResults);
    } else if (responseJson.hasOwnProperty('output') 
                  && responseJson.output.hasOwnProperty('action') 
                  && responseJson.output.action.hasOwnProperty('call_weather')) {
      this.addMessage( { label: 'Weather Ergebnis:', message: 'Folgende Wetterdaten habe ich gefunden:', date: (new Date()).toLocaleTimeString()});
      this.formatWeather(responseJson.output.WeatherResults);
    
              
    } else {
      
      let outputMessage = responseJson.output.text.filter(text => text).join('\n');
      let translatedMessage = "";
      if (responseJson.output.hasOwnProperty('translated') && responseJson.output.translated.hasOwnProperty('payload')) {
         translatedMessage = responseJson.output.translated.payload.join('\n');
      }

      let htmllinkMessage = "";
      let htmllinkText = "";
      //if (responseJson.output.hasOwnProperty('textlink') && responseJson.output.textlink.hasOwnProperty('htmllink')) {
      if (responseJson.output.hasOwnProperty('textlink')) {
        htmllinkMessage = responseJson.output.textlink.join('\n');
      }
      if (responseJson.output.hasOwnProperty('linktext')) {
        htmllinkText = responseJson.output.linktext.join('\n');
      }
      let imagename = "";
      let imagefn = "";
      //if (responseJson.output.hasOwnProperty('textlink') && responseJson.output.textlink.hasOwnProperty('htmllink')) {
      if (responseJson.output.hasOwnProperty('imagename')) {
        imagename = responseJson.output.imagename.join('\n');
      }
      if (responseJson.output.hasOwnProperty('imagefn')) {
        imagefn = responseJson.output.imagefn.join('\n');
      }


        //outputMessage = outputMessage.split('<br/>').join('\n');
      //console.log("outputMessage", outputMessage);
      //console.log("translatedMessage", translatedMessage);
      const outputIntent = responseJson.intents[0] ? responseJson.intents[0]['intent'] : '';
      const outputDate = responseJson.date.toLocaleTimeString();
      const outputContext = responseJson.context;
      //console.log("outputContext", outputContext);
      this.setState({
        context: outputContext
      });
      const msgObj = {
        position: 'left',
        label: outputIntent,
        message: outputMessage,
        hsmessage1: translatedMessage,
        hshtmllink: htmllinkMessage,
        hslinktext: htmllinkText,
        hsimagename: imagename,
        hsimagefn: imagefn,
        date: outputDate,
        hasTail: true
      };
      console.log("appjs - handleResponse - msgObj=",msgObj)
      this.addMessage(msgObj);
    }
  }
  
  addMessage(msgObj) {
    console.log("app.js - addMessage - msgObj = ", msgObj);
    this.setState({
      messageObjectList: [ ...this.state.messageObjectList , msgObj]
    });
  }
  
  handleSubmit(e) {
    const inputMessage = e.target.value;
    const inputDate = new Date();
    const formattedDate = inputDate.toLocaleTimeString();
    const msgObj = {
      position: 'right',
      message: inputMessage,
      date: formattedDate,
      hasTail: true
    };
    //console.log(msgObj);
    //console.log(process.env);
    this.addMessage(msgObj);
    e.target.value = '';
    this.callWatson(inputMessage);
  }
  
  formatDiscovery(resultArr) {
    resultArr.map(function(result, index) {




      const formattedResult = <DiscoveryResult key={'d' + this.state.discoveryNumber + index} 
                                                        title={result.title} 
                                                        preview={result.bodySnippet} 
                                                        link={result.sourceUrl} 
                                                        linkText={'See full manual here / vollständiges Dokument'} />;
      this.addMessage({ message: formattedResult });
    }.bind(this));
        
    this.setState({
      discoveryNumber: this.state.discoveryNumber + 1
    });
    return(true);
  }

  formatWeather(resultArr) {
    resultArr.map(function(result, index) {
      const formattedResult = <WeatherResult key={'d' + this.state.discoveryNumber + index} 
                               day={result.day} 
                               weather={result.weather}
                               linkText={'Das sind die Wetterdaten'} />;
      //console.log("formatWeather =", result.body);
      this.addMessage({ message: formattedResult });
    }.bind(this));
        
    this.setState({
      discoveryNumber: this.state.discoveryNumber + 1
    });
    return(true);
  }



  handleClick () {
    axios.post('https://service.us.apiconnect.ibmcloud.com/gws/apigateway/api/d21d08ef7a8fdb0ae4716bd18586fa968d8111326ce83e0cd93b73c0e2503e46/text-bot-openwhisk/conversation1',
               {"conversation": {"input": {"text": "how about new york"}}}
              )
      .then(response => this.setState(
        //console.log(response);
                            {username: response.data.conversation.output.text[0],
                             hugo: response.data.conversation.output.text[1]}))
  }
  handleAddTodo(todo) {
    this.setState({todos: [...this.state.todos, todo]});
  }
  
  render () {
    return (
      <div className='button__container'>      
        <p className='conversation__intro'>
           <img src={ require('./images/ibmcloud_icon.png') } />
           <br/>Hello and welcome to Rewire Industrial Business - Developer UnConference June 7th at IBM Germany
            <br/><br/>
            <br/>Try it and enjoy the conversation 
            <br/>e.g. ask me about Ehningen, Restaurants, Sports, etc.
            <br/>Keep in mind, you have to train Watson assistant to get valuable infos from the chatbot
            <br/>To train Watson Assistant go to IBM Cloud and the Watson Assistant Launch tool
            <br/>
            <br/>To get a more sophisticated chatbot combine other services like Watson Discovery, Weather Channel, Watson Language Translation, etc. Feel free to enhance it.

        </p>
        <p className='conversation__intro_links'>
            <br/> <a href="https://console.bluemix.net/openwhisk/" target='_blank'>IBM Cloud Functions     <img src={ require('./images/functions_icon.png' )} /></a>
            <br/> <a href="https://www.ibm.com/watson/services/conversation/" target='_blank'>IBM Watson Assistant     <img src={ require('./images/conversation_icon.png') } /></a>
            <br/> <a href="https://www.ibm.com/watson/services/discovery/" target='_blank'>IBM Watson Discovery</a> <img src={ require('./images/discovery_icon.png') } />
            <br/> <a href="https://console.bluemix.net/docs/services/Weather/weather_overview.html#about_weather"target='_blank'>IBM Weather Channel <img src={ require('./images/weathercompany.png') } /></a>
        </p>
        <Conversation
          onSubmit={this.handleSubmit}
          messageObjectList={this.state.messageObjectList}
        />
      </div>

    );
  }
}

export default App
