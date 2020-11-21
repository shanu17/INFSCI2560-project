# INFSCI2560-project
A food ordering platform for INFSCI2560 Project


## References:

Carousel, Forms, Buttons, Navigation bar - https://getbootstrap.com/docs/4.0/components
Cart/Store page - https://youtu.be/YeFzkC2awTM
Passport authentication - https://github.com/manjeshpv/node-express-passport-mysql
Login/Signup page - https://epicbootstrap.com/snippets/registration

## DB Schema:

User (id, email, name, password, address),
customer (user_id, customer_id, profile_img), 
Restaurant (seller) (user_id, rest_id, category), 
menu (id, rest_id, title, summary, item_id),
orders (id, customer_id, rest_id, status, total), 
order_items (id, order_id, item_id, quantity),
item (id, menu_id, title, summary, type, price),
Rating (id, rest_id, rating)
