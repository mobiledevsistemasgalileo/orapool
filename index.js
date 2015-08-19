// enarvaez. 25-Feb-2014. Creation
//           02-Jul-2015. Handling of some conn problems
//           19-Ago-2015. Usage of oracledb (Official Oracle component) instead of oracle.
//
// Descripcion:
//   Creates a conn pool to Oracle using oracledb module
//
// Required NodeJS Modules
//   generic-pool, oracledb
//
var poolModule = require('generic-pool');  // Usa el modulo generic-pool
var OracleDB = require('oracledb');

// Oracle Errors that may indicate a good connection turned bad.
var ORAInvalidConnErrors = ['ORA-00028','ORA-00022','ORA-12203','ORA-01041',
  'ORA-01012','ORA-03114','ORA-03113'];

exports.STRING = OracleDB.STRING;
exports.NUMBER = OracleDB.NUMBER;
exports.DATE = OracleDB.DATE;
exports.CURSOR = OracleDB.CURSOR;
exports.OBJECT = OracleDB.OBJECT;
exports.BIND_IN = OracleDB.BIND_IN;
exports.BIND_OUT = OracleDB.BIND_OUT;
exports.BIND_INOUT = OracleDB.BIND_INOUT;
exports.OBJECT = OracleDB.OBJECT;
exports.ARRAY = OracleDB.ARRAY;
OracleDB.outFormat = OracleDB.OBJECT;
exports.outFormat = OracleDB.outFormat;

exports.OutParam = function(vartype) {
  var bindvar = {type: vartype, dir: OracleDB.BIND_OUT}
  return bindvar;
}
exports.InOutParam = function(varval, vartype) {
  var bindvar = {val: varval, type: vartype, dir: OracleDB.BIND_INOUT}
  return bindvar;
}

// Functions that creates a pool.
// oradata expects a json {user:'USER', pwd:'PWD', tnd:'TNSSTRING'}
// pooldata expects a json {name:'oraclepool', max: 10, min:0, idleTimeoutMillis:30000, log:true}
exports.create = function(oradata,pooldata) {
  pool = poolModule.Pool({
    name     : pooldata.name,
    create   : function(callback) {  // Crea la conexion.
      OracleDB.getConnection({
        user : oradata.user, password  : oradata.pwd, connectString : oradata.tns
      }, function(err, connection) {
        if (!err) {  // If not error creating connection
          // Add isValid property
          connection.isValid = true;
          // Redefine execute function
          connection.orclexecute = connection.execute;
          connection.execute = function(sqlstr,paramarray,conncallback) {
            connection.orclexecute(sqlstr,paramarray,
              {autoCommit: true}, 
              function(err, results) {
              if (err) {
                // Check the error type against defined array.
                var found = false;
                try {
                  for (i=0; i<=ORAInvalidConnErrors.length && !found; i++) {
                    if (err.toString().indexOf(ORAInvalidConnErrors[i]) >= 0) {
                      // If the error is an invalid connection
                      found = true;
                    }
                  }
                }
                catch(errCompare) {
                  found = false;
                }
                // Assign to validation property
                connection.isValid = !found;
                // Call original callback
                conncallback(err,results); // Send only the data
              }
              else {
                if (results.outBinds) {
                  // Call original callback
                  var outresults = {resultParams: results.outBinds};
                  conncallback(err,outresults); // Send the outParams
                }
                else {
                  // Call original callback
                  conncallback(err,results.rows); // Send only the data
                }
              }
            });
          };
        }
        // Return connection object in callback
        callback(err,connection);
      });
    },
    destroy  : function(connection) { 
      try {
        connection.release(function(err) {console.log('Error releasing the pool'+err)}); 
      }
      catch (errRelease) {
        console.log('Error releasing the pool: '+errRelease);
      }
    },  // Se cierra la conexion.
    validate : function(connection) { 
      // enarvaez. Se valida la propiedad de validacion que puede ser cambiada por el cliente.
      return connection.isValid;
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
