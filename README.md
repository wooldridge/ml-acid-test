# ml-acid-test

Here are a few tests of transactional isolation (the "I" in ACID) in MarkLogic. Requires MarkLogic version 8
and Node.js. Run the following from the project root to install dependencies:

`npm install`

Edit the authentication details as needed. The tests write to MarkLogic's default Documents database via REST.

1. Test for a DIRTY READ. A transaction (T1) creates a document. A concurrent transaction (T2) attempts to 
   read the same document. T1 then rolls back.

   `node dirty-read`
   
   MarkLogic DOES NOT ALLOW a dirty read here on account of a WRITE LOCK. T2 cannot see the document until
   T1 is finished, at which time the document does not exist.
   
2. Test for a NON-REPEATABLE READ. A transaction (T1) reads a document. A concurrent transaction (T2) attempts 
   to write the same document. Then T1 reads the document again.

   `node non-repeatable-read`
   
   MarkLogic DOES NOT ALLOW a non-repeatable read here on account of a READ LOCK. T2 is blocked from writing
   the document until T1 has committed.
   
3. Test for a PHANTOM READ. A transaction (T1) reads a collection of documents. A concurrent transaction (T2) 
   attempts to write to the collection. Then T1 reads the collection again.

   `node non-repeatable-read`
   
   MarkLogic DOES ALLOW a phantom read here. T1 reads a different collection the second time on account of the 
   document insert by T2.
