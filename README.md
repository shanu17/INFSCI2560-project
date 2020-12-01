# INFSCI2560-project
A food ordering platform for INFSCI2560 Project


## References:

Carousel, Forms, Buttons, Navigation bar - https://getbootstrap.com/docs/4.0/components <br/>
Cart/Store page - https://youtu.be/YeFzkC2awTM <br/>
Passport authentication - https://github.com/manjeshpv/node-express-passport-mysql <br/>
Login/Signup page - https://epicbootstrap.com/snippets/registration <br/>

## DB Schema:

User (id, email, name, password, address), <br/>
customer (user_id, customer_id, profile_img), <br/>
Restaurant (seller) (user_id, rest_id, category), <br/>
menu (id, rest_id, title, summary, item_id), <br/>
orders (id, customer_id, rest_id, status, total), <br/>
order_items (id, order_id, item_id, quantity), <br/>
item (id, menu_id, title, summary, type, price), <br/>
Rating (id, rest_id, rating)

## Run Configurations:

### MySQL:
Follow the steps in the following video to download and install MySQL in your environment. (Highly recommend using the MySQL installer)
https://www.youtube.com/watch?v=GIRcpjg-3Eg
This video is for Windows only. <br/> For MAC:
https://www.youtube.com/watch?v=UcpHkYfWarM

After installing MySQL please open the MySQL Workbench and open your local MySQL Server and create a new Schema <br/>
![Creating new Schema](https://github.com/shanu17/INFSCI2560-project/blob/master/public/uploads/createSchema.PNG)
You can simply right click on the Schema navigator on the left and click on create Schema with the name as "foodapp" or whichever you feel is best (Remember to use the same name in the .env file).<br/> After creating the new schema run the following query:

`ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';`
Where root as your user, localhost as your URL, and password as your password
After running the query successfully, run the following query:
`flush privileges`;

### .env File:
Create an .env file in your root directory as shown below:
![Creating .env file](https://github.com/shanu17/INFSCI2560-project/blob/master/public/uploads/ENV.PNG)
In the .env file update your DB secrets in this manner:
![.env file example](https://github.com/shanu17/INFSCI2560-project/blob/master/public/uploads/ENVData.PNG)

### Installing Node JS:
Install node js for your system from the following link: https://nodejs.org/en/download/

### Running the Server:
Now drill into the root folder of this project and in the command line run these following commands to start the Server:
```
npm install
npm start
```
This will start the server and you can access the website by opening your browser and going to the URL - localhost:3000 <br/>

Please start by creating a few users and few restaurants with more than 1 menu item to order

## Admin Privilege:
To access admin functionality create a user with the name as "admin" and email ID as "admin@pitt.edu", the rest of the information needed to create an user is arbitrary.
