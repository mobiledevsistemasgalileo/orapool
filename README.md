# Oracle Pool for Node.js

Taking generic-pool(https://github.com/coopernurse/node-pool) and the oracle driver (https://github.com/joeferner/node-oracle) to create a very basic pool of Oracle connections.

# Basic installation

* Prerequisites:
  * oracle
  * generic-pool 

* npm install ora-pool

# GIT Repository

https://github.com/mobiledevsistemasgalileo/orapool

# Example

### Basic example

```javascript
var orapool = require('ora-pool'); // Require the Package

// Oracle Conn Parameters
var oradata = {
  user:'TC', 
  pwd:'TCAP', 
  tns:'(DESCRIPTION = (ADDRESS_LIST = (ADDRESS = (COMMUNITY = tcp.world) (PROTOCOL = TCP) (Host = 10.3.1.238) (Port = 1525)))(CONNECT_DATA = (SID = TCAP)))'
};
// Pool Parameters
var pooldata = {
  name:'oraclepool',   // name of pool
  min: 0,              // min number of positions
  max: 10,             // max number of positions
  idleTimeoutMillis: 15000, // time before releasing resource and returning it to the pool
  log:true  // writes in console
};
// Pool creation
var pool = orapool.create(oradata, pooldata);
// Pool usage
pool.acquire(function(err, oraconn) {
  if (err) {
    console.log("Error connecting with ORACLE:" + err);
  } else {
    oraconn.execute("SELECT systimestamp FROM dual", [], function(err, results) {
      if (err) {  
      }
      else {
        console.log(results);
        pool.release(oraconn);  // Release conn and bring it back to the pool        
      }
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

