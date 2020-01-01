[![License](https://img.shields.io/github/license/mashape/apistatus.svg)](https://choosealicense.com/licenses/mit/)

# MagicMirror-Netatmo-Module

A module to integrate data from a Netatmo weather station into [MagicMirror](https://github.com/MichMich/MagicMirror).

![Netatmo visualisation](https://github.com/KrunchMuffin/MMM-Netatmo/blob/master/.github/preview.png)

## Usage

_Prerequisites_

- requires MagicMirror v2.0.0+
- Access to a Netatmo weather station account

To use this module, just clone this repository to your __modules__ folder of your MagicMirror:

`git clone https://github.com/KrunchMuffin/MMM-Netatmo.git`

Now just add the module to your config.js file ([config entries](#configuration)).

### Access Your Data

To be able to access your data, you need to have an Netatmo Application and grant this application access to your data.

#### Register an App

Your can register a new app [here](https://dev.netatmo.com/dev/createapp). Afterwards you will get an CLIENT_ID and an CLIENT_SECRET which you will need to enter in the [config entries](#configuration).

#### Grant Access to Your Data

To allow the app to access your data, you need to send a POST request to the auth server and register the app.

##### cURL

One option is to use the command line tool [cURL](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=2&cad=rja&uact=8&ved=0ahUKEwjqgN789KnaAhUBalAKHR-NDLoQFgg2MAE&url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FCURL&usg=AOvVaw27-lfQBHvLQPR2qsddIR6U). 

```
curl --data "grant_type=password&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&username=NETATMO_USERNAME&password=NETATMO_PASSWORD&scope=read_station" "https://api.netatmo.com/oauth2/token"
```

The POST request will return data similar to the following:

```
{"access_token":"xyzmdgidkd|jdkmfkgmklmfism9ims","refresh_token":"xyzmdgidkd|dmdjekrlslkdolsk","scope":["read_station"],"expires_in":10800,"expire_in":10800}
```

The REFRESH_TOKEN will be needed in the [config entries](#configuration).

You can also use [Postman](https://www.getpostman.com/) to get these values.
![Postman Visualisation](https://github.com/KrunchMuffin/MMM-Netatmo/blob/master/.github/postman.png)

### Configuration

The module needs the default configuration block in your config.js to work.

```
{
	module: 'MMM-Netatmo',
	position: 'top_right', // the location where the module should be displayed
	config: {
		clientId: '', // your app id
		clientSecret: '', // your app secret
		refreshToken: '' // your generated refresh token
	}
}
```

The following properties can be configured:

|Option|Description|
|---|---|
|clientId|The ID of your Netatmo [application](https://dev.netatmo.com/dev/listapps).<br><br>This value is **REQUIRED**|
|clientSecret|The app secret of your Netatmo [application](https://dev.netatmo.com/dev/listapps).<br><br>This value is **REQUIRED**|
|refreshToken|The generated refresh token you got from the POST request to the auth api.<br><br>This value is **REQUIRED**|
|refreshInterval|How often does the content needs to be updated? (Minutes)<br>Data is updated by netatmo every 10 minutes.<br><br>**Default value:** `10`|
|moduleOrder|The rendering order of your weather modules, ommit a module to hide the output.<br><br>**Example:** `["Kitchen","Kid's Bedroom","Garage","Garden"]` <br>Be aware that you need to use the module names that you set in the netatmo configuration.|
|dataOrder|The rendering order of the data types of a module, ommit a data type to hide the output.<br><br>**Example:** `["Noise","Pressure","CO2","Humidity","Temperature","Rain"]`|
