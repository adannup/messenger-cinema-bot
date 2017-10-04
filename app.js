const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = 'FACEBOOK_TOKEN_API';

app.use(bodyParser.json());

app.use((req, res, next) => {
	var date = new Date().toString();
	var infoLog = `${date}: ${req.method} ${req.url}`;
	registerLog('requests.log', infoLog);
	next();
});

app.get('/', (req, res) => {
	res.send('Facebook bot app');
});

app.route('/webhook')
	.get((req, res) => {
		if(req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'token_key_facebook_app'){
			console.log('Validating webhook');
			res.status(200).send(req.query['hub.challenge']);
		}else{
			console.log('Failed validation. Make sure the validation tokens match.');
			res.sendStatus(403);
		}
	})
	.post((req, res) => {
		var data = req.body;

		if(data.object === 'page') {
			data.entry.forEach((entry) => {
				var pageID = entry.id;
				var timeOfEvent = entry.time;

				entry.messaging.forEach((event) => {
					if(event.message){
						receivedMessage(event);
					}else{
						console.log("Webhook received unknown event: ", event);
					}
				});
			});

			res.sendStatus(200);
		}
	})

var receivedMessage = (event) => {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	var infoLog = `Received message for user: ${senderID} and page: ${recipientID} at ${timeOfMessage} with message: ${JSON.stringify(message, 2, undefined)}`;
	registerLog('messages.log', infoLog);

	var messageID = message.mid;
	var messageText = message.text;
	var messageAttachments = message.attachments;

	if(messageText){
		evaluateMessage(senderID, messageText);
	}else if(messageAttachments) {
		evaluateMessage(senderID, "Message with attachment received");
	}
}

var evaluateMessage = (senderID, messageText) => {
	var finalMessage = '';

	if(isContain(messageText, 'ayuda')){
		finalMessage = 'Por el momento no te puedo ayudar';
		sendTextMessage(senderID, finalMessage);
	}else if( messageText === 'generic') {
		sendGenericMessage(senderID);
	}else if(messageText === 'it') {
		sendImageMessage(senderID);
	}else if(isContain(messageText, 'clima')) {
		getWeather((temperature) => {
			finalMessage = `La temperatura actual es ${temperature}`;
			sendTextMessage(senderID, finalMessage);
		});
	}else{
		finalMessage = `Solo se repetir las cosas ${messageText}`;
		sendTextMessage(senderID, finalMessage);
	}
	
}

var sendTextMessage = (recipientID, messageText) => {
	var messageData = {
		recipient: {
			id: recipientID
		},
		message: {
			text: messageText
		}
	}

	callSendAPI(messageData);
}

var sendGenericMessage = (recipientId) => {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

var sendImageMessage = (recipientID) => {
	var messageData = {
		recipient: {
			id: recipientID
		},
		message: {
			attachment: {
				type: 'image',
				payload: {
					url: 'http://images.indianexpress.com/2017/07/it-759.jpg'
				}
			}
		}
	}

	callSendAPI(messageData);
}

var callSendAPI = (messageData) => {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: PAGE_ACCESS_TOKEN },
		method: 'POST',
		json: messageData
	}, (error, response, body) => {
		if(!error && response.statusCode === 200) {
			var recipientId = body.recipient_id;
			var messageId = body.message_id;
			console.log(`Successfully sent generic message with id ${messageId} to recipient ${recipientId}`);
		}else{
			console.error("Unable to send message.");
      		console.error(response);
      		console.error(error);
		}
	})
}

var getWeather = (callback) => {
	request({
		url: 'https://api.darksky.net/forecast/f4f7024ab296cd31754544539871bf0d/22.1235044,-101.0261093',
		json: true
	}, (error, response, body) => {
		if(!error && response.statusCode === 200){
			var temperature = body.currently.temperature;
			callback(temperature);
		}else{
			console.log('Unable fetch weather from api', error);
		}
	});
}

var isContain = (messageText, keyWord) => {
	var message = messageText.toLowerCase();

	return message.indexOf(keyWord) > -1;
}

var registerLog = (fileName, text) => {
	var textNewLine = `${text} \n`;

	console.log(text);
	try {
		fs.appendFile(fileName, textNewLine, (err) => {
			if(err) throw err;
			console.log('The "data to append" was appended to file!');
		});
	}catch (err) {
		console.log('The log can\'t be fetch', err);
	}
}

app.listen(PORT, () => {
	console.log(`Server up on port: ${PORT}`);
});