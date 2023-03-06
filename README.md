# Proxy server for SAP MII
This proxy act as a connector between MII server and local webserver. With the use of this proxy we can consume data from MII in local ui5 application developed in VS code.

![proxyseverformii](https://user-images.githubusercontent.com/79074273/222799920-db142598-67af-48fc-84f4-16fc06fd882b.jpg)


## Prerequasites
1. Install latest version of node js from [official website](https://nodejs.org/en/download/)
2. Install VS code from [official website](https://code.visualstudio.com/download)

## Server setup
1. Download the project files from [link](https://github.com/subrahmanyam-pampana/SAPMII-Node-Proxy-Server/blob/main/downloads/v1.0.0/miiproxy.zip?raw=true) and extract the files.
2. open config.json file and configure your mii user name, mii server details and your ui5 root folder path.

  - by default given illumnator and Runner servers end points in the configs file. in case your using any other mii services, include them in the endpoints

  <img width="809" alt="image" src="https://user-images.githubusercontent.com/79074273/222801576-41c28712-19d0-41c2-b2a4-4b0cf3f5dd54.png">

3. Replace the webapp folder with your ui5 webapp folder and make sure your webapp folder contains index.html page.

  ![image](https://user-images.githubusercontent.com/79074273/222804037-4a9a45da-d97e-459e-a692-d11ad185c94d.png)

4. open the terminal in vs code by pressing ```ctrl+shift+` ``` . Make sure your in the root folder(i.e miiproxyserver folder)
5. run ```npm install``` in terminal. this will install all the required modules.

  <img width="960" alt="image" src="https://user-images.githubusercontent.com/79074273/222802511-ddd5bd9c-ecf6-42b7-ac07-b14a0e71a1d6.png">

6. run ```node server.js``` command in terminal. This will start node server at port 3000. in case this port is already used by any other application or service change the port number in configs.json file. it will ask for your mii server password. enter your password in the terminal and press enter.

  <img width="960" alt="image" src="https://user-images.githubusercontent.com/79074273/222802873-fbbc0615-23ee-4d2a-a4c5-c0af51550d2c.png">

7. Open any browser and run ```http://localhost:3000/index.html``` 

  - it will show the starting page of your ui5 app. that means your server is correctly configured.

  <img width="959" alt="image" src="https://user-images.githubusercontent.com/79074273/222803544-26d82d2d-76ed-496b-b805-aa4f2a53d7f3.png">
  









