# Super MYSQL funtimes:

This is a very simple set of weird and fun mysql experiments. Well, more accurately, two mysql experiments.

The first is a series of very simple string constructors, allowing simple find, insert, update, and delete queries.

**Specialized query chains**

They work through chaining like so:

Find(<table>, [<columns>]).condition(<column>, <symbol>, <value>).execute()

Insert(<table>).value(<column>, <value>).execute()

Delete(<table>)(<column>, <symbol>, <value>).execute()

Update(<table>).value(<column>, <value>).condition(<column>, <symbol>, <value>).execute()

You can chain conditions and values indefinitely in the above examples.

When chaining conditions you can also add joiners (optionally)

**Generalized query proxies**

**This is one of the approaches I haven’t seen before, so I gave it a shot.**

**This uses proxies to make SQL queries behave in a more “typescript” kinda way. So this is a lot more flexible in usage and application, it’s become my goto for easy queries.**

**Start by creating a query**

**Var <name of query object> = new Query(<table>)**

**then add constraints and/or parameters. Parameters are used when inserting or updating. Constraints are used in where statements by Updates, Deletions and Selections.**

**<name of query object>.parameter = {<column>: value}**
 **<name of query object>.parameter.<column> = value.**
 **<name of query object>.constraint = {<column>: value}**
 **<name of query object>.constraint.<column> = value**

**You can also upfront define your where statement if you find simple constraints lacking**

**<query object>.WHERE(‘where columnA \* columnB = value’)**

**Finally, once your constraints and/or parameters are set, you can run your query**

**Const myFunRow = await queryObject.findOne()**

**Const myFunTable = await queryObject.find(columnA)**

**Await queryObject.insert()**

**Await queryObject.delete()**

**Await queryObject.update()**

### **Why I made this**

Basically… intellisense. I’ve found it frustrating to have to check my notes for how my table is structured. Some kind of global interface for all my tables is the easiest way to navigate them.

If you find this kinda thing interesting and exciting you should also check out scratchdb/database by omgimalexis because it’s likely going to be a much more advanced and robust version of this concept that is more javascript friendly than something by a C# programmer :P