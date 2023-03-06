# Proxy server for SAP MII
This proxy act as a connector between MII server and local webserver. With the use of this proxy we can consume data from MII in local ui5 application developed in VS code and pull/push code from mii workbench.

<img width="671" alt="image" src="https://user-images.githubusercontent.com/79074273/223067506-c663acdc-f989-4a38-b85d-c8fa47e3df12.png">

## commands
- `npm run pull` to pull the code from mii workbench folder
- `npm run start` to start the node server
- `npm run push` to push changes back to mii workbench.


## Prerequasites
1. Install latest version of node js from [official website](https://nodejs.org/en/download/). Make sure you configured path environment variable.
2. Install VS code from [official website](https://code.visualstudio.com/download)

## Server setup
1. Download the project files from [link](https://github.com/subrahmanyam-pampana/miiproxyserver/archive/refs/heads/master.zip) and extract the files.
2. open config.json file and configure your mii user name, mii server details and your ui5 root folder path.

  - by default given illumnator and Runner servers end points in the configs file. in case your using any other mii services, include them in the endpoints

  <img width="863" alt="image" src="https://user-images.githubusercontent.com/79074273/223064416-e9368785-7a97-4c92-9428-893425f45424.png">

3. open the terminal in vs code by pressing ```ctrl+shift+` ``` . Make sure your in the root folder(i.e miiproxyserver folder)
4. run ```npm install``` in terminal. this will install all the required modules.

  <img width="960" alt="image" src="https://user-images.githubusercontent.com/79074273/222802511-ddd5bd9c-ecf6-42b7-ac07-b14a0e71a1d6.png">
  
5. Open the terminal in the vs code and run the cmd `npm run pull`. This will pull the code from your mii server and place in the webapp folder.

 <img width="865" alt="image" src="https://user-images.githubusercontent.com/79074273/223065269-ccbd126b-a327-4480-a234-a2195a0534c2.png">

6. run ```npm run start``` command in terminal. This will start node server at port 3000. in case this port is already used by any other application or service change the port number in configs.json file. it will ask for your mii server password. enter your password in the terminal and press enter.

  <img width="960" alt="image" src="https://user-images.githubusercontent.com/79074273/222802873-fbbc0615-23ee-4d2a-a4c5-c0af51550d2c.png">

7. Open any browser and run ```http://localhost:3000/index.html``` 

  - it will show the your ui5 app. that means your server is correctly configured.
  
8.Once you done with your changes, run the cmd `npn run push` to push your changes back to mii workbench.(before pushing check all the changed file at ./data/modifiedFiles.json file. it containes all the modified files.)  
  
