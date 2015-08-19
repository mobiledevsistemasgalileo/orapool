# Oracle Pool for Node.js

Taking generic-pool(https://github.com/coopernurse/node-pool) and the official oracle driver (https://github.com/oracle/node-oracledb) to create a very basic pool of Oracle connections.

# Basic installation

* Prerequisites:
  * oracledb
  * generic-pool 
  
* npm install orapool
  
# GIT Repository

https://github.com/mobiledevsistemasgalileo/orapool

# Example

### Basic example

```javascript
var
  orapool = require('orapool');


var oradata = {
  user : "FS_REGHORAS",
  pwd  : "FSREGHORAS",
  tns  : "TNSDATA"
};
var pooldata = {
  name              : 'fspool',
  min               : 0,
  max               : 3,
  idleTimeoutMillis : 30000,
  log               : true
};
// Creacion del pool
var pool = orapool.create(oradata, pooldata);

pool.acquire(function (err, oraconn) {
  if (err) {
    response = { code: 'error', message: 'Error .getTimeSheetbyDay> Could not connect to the Database..' };
    res.send(response);
    console.log("Error connecting to ORACLE:" + err);
  }
  else {
    console.log("Connection Pool Aquired.");
    var bindvars = {
      a : new orapool.OutParam(orapool.NUMBER),  
      c  : new orapool.OutParam(orapool.CURSOR)
    } 
    // Executing a stored procedure with 2 OUT parameters
    // If there is only a IN parameter, just specify the value, like this..
    //
    //  a: 'entrada'
    //
    // If there is a INOUT parameter, use the InOutParam function, like this...
    //
    //  a: new orapool.InOutParam('test',orapool.STRING)
    //
    oraconn.execute('call testproc(:a, :c)', bindvars, function(err, result) {
      if (err) {
        console.log('Error' + err);
      }
      else {
        console.log(result.resultParams.a); // a is a number
        // Since c is a cursor, we need to fetch the rows...
        result.resultParams.c.getRows(10000, function(err, rows) {
          if (err) {
            console.log(err);
          }
          else {
            console.log(rows);  // rows is an object array...
          }
        })
      }
      pool.release(oraconn);  // Connection Pool Released
    });
  }
});

```

# Limitations/Caveats

* Ensure you always release your connection at the end of use to avoid random false oracle errors.
* This is our first component so please have mercy!.

# Development
* Clone the source repo
* Go wild
