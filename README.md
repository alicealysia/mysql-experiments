Some weird experiments I've done with mysql.

The classes find, insert, delete, and update use interface keys and chaining to navigate and query your database.
For example, the find class would be used like this:
Find('users', ['name']).condition('user_id', '=', 1).execute();

Another experiment can be found in the proxy-query file.
Where I use a proxy to 'handle' queries.
This concept is pretty rough at the moment, but the basic concept is:
1. props can be used so that you don't need to place anything in quote marks.
2. you can get and set values like you would any other. (this includes constraints)
3. ideally, you could write constraints like you would an if statement (this idea may be impossible, but I'm insane enough to give it a shot.)

To that end, here are some examples of what you could eventually do if I can figure this out.

Set constraint as basic 'this = that' then find one (currently possible):
const userquery = new query('users');
userquery.constraints.user_id = 1;
const username = userquery.parameters.username;

Obviously adding a populate command might be more intelligent as it would allow you to do this:
userquery.populate();
const {username, role} = userquery.parameters;

here's some stuff I'd like to add... eventually.
querying multiple lines at once, this would of course, give you proper intellisense and typing on your query columns without needing to specify type:
userquery.constraints.role = RoleName.administrator;
userquery.populate();
const usernameOfThirdAdmin = userquery.line[4].username;

constraints based off actual javascript operations:
userquery.addConstraint(userquery.parameters.role === RoleName.administrator);

Like I said, not sure if the last one is possible.

Finally, inserting and updating based on setting variables!
userquery.parameters = {
	name: 'Alice Alysia',
	role: RoleName.yourAbsoluteGoddess
};

userquery.constraints.id = 1;
userquery.parameters.role = RoleName.guest; 