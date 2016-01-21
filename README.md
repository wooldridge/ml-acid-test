# ml-acid-test

Here are a few tests of transactional isolation (the "I" in ACID) in MarkLogic. Requires MarkLogic version 8
and Node.js. Run the following from the project root to install dependencies:

`npm install`

Edit the authentication details as needed. The tests write to MarkLogic's default Documents database via REST.
View the results of the tests in the console.

1. Test for a DIRTY READ. A transaction (T1) creates a document. A concurrent transaction (T2) attempts to 
   read the same document. T1 then rolls back.

   `node dirty-read`
   
   MarkLogic DOES NOT ALLOW a dirty read here on account of a WRITE LOCK.
   
2. Test for a NON-REPEATABLE READ. A transaction (T1) reads data, a concurrent transaction (T2) attempts to 
   write the same data, and then T1 reads the data again.

   `node non-repeatable-read`
   
   MarkLogic DOES NOT ALLOW a non-repeatable read here on account of a READ LOCK.
   
3. Test for a PHANTOM READ. A transaction (T1) reads a set of documents, a concurrent second transaction (T2) 
   attempts to write the same data, and then T1 reads the data again.

   `node non-repeatable-read`
   
   MarkLogic DOES ALLOW a phantom read here.
