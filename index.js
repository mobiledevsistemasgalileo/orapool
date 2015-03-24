// enarvaez. 25-Feb-2014. Create
//
// Descripcion:
//   Creates a conn pool to Oracle using node-oracle module
//
// Required NodeJS Modules
//   fs, generic-pool, oracle
//
var fs = require("fs");  // Usa el File System.
var poolModule = require('generic-pool');  // Usa el modulo generic-pool

// Functions that creates a pool.
// oradata expects a json {user:'USER', pwd:'PWD', tnd:'TNSSTRING'}
// pooldata expects a json {name:'oraclepool', max: 10, min:0, idleTimeoutMillis:30000, log:true}
exports.create = function(oradata,pooldata) {
    pool = poolModule.Pool({
        name     : pooldata.name,
        create   : function(callback) {  // Crea la conexion.
            var OraClient = require('oracle');
            // En este punto las variables deben estar grabadas
            connectData = { "tns": oradata.tns, "user": oradata.user, "password": oradata.pwd };
            OraClient.connect(connectData, function(err, connection) {
                callback(err,connection);
            });
        },
        destroy  : function(connection) { 
          try {
            connection.close(); 
          }
          catch (errRelease) {
            console.log('Error releasing the pool: '+errRelease);
          }
        },  // Se cierra la conexion.
        max      : pooldata.max, 
        min      : pooldata.min,  // optional. if you set this, make sure to drain() (see step 3)
        idleTimeoutMillis : pooldata.idelTimeoutMillis, // specifies how long a resource can stay idle in pool before being removed
        log : pooldata.log    // if true, logs via console.log - can also be a function
    });
    return pool;
}

// function that detects if a field is a string, a boolean or a date and formats accordingly
function formatColumnValue(jsonVAR) {
    if (typeof jsonVAR == 'string' || jsonVAR instanceof String) {
        return "'"+jsonVAR+"'";
    } else {
        return jsonVAR;
    }
}

// function that takes objects names in the JSON variable and format them for an INSERT
// it assumes the name of the variables is the columnname and the value of the variables is
// the column value.
exports.getInsertColumnNames = function(jsonIN) {
    var columnnames = '';
    for (var key in jsonIN) {
        columnnames = columnnames+key+',';
    }
    // take away the last comma
    columnnames = columnnames.substr(0,columnnames.length-1);    
    return columnnames;
}

// function that takes objects values in the JSON variable and format them for an INSERT
// it assumes the name of the variables is the columnname and the value of the variables is
// the column value.
exports.getInsertColumnValues = function (jsonIN) {
    var columnvalues = '';
    for (var key in jsonIN) {
        columnvalues = columnvalues+formatColumnValue(jsonIN[key])+',';
    }
    // take away the last comma
    columnvalues = columnvalues.substr(0,columnvalues.length-1);    
    return columnvalues;
}

// function that takes objects values in the JSON variable and format them for an INSERT
// it assumes the name of the variables is the columnname and the value of the variables is
// the column value.
exports.getUpdateColumnData = function (jsonIN) {
    var columnvalues = 'set ';
    for (var key in jsonIN) {
        columnvalues = columnvalues+key+'='+formatColumnValue(jsonIN[key])+' ,';
    }
    // take away the last comma
    columnvalues = columnvalues.substr(0,columnvalues.length-1);    
    return columnvalues;
}