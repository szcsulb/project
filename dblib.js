// Add packages
require("dotenv").config();
// Add database package and connection string
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const getTotalRecords = () => {
    sql = "SELECT COUNT(*) FROM customer";
    return pool.query( sql )
        .then(result => {
            return {
                msg: "success",
                totRecords: result.rows[0].count
            }
        })
        .catch(err => {
            return {
                msg: `Error: ${err.message}`
            }
        });
};

const insertCustomer = (cust) => {
    if (cust instanceof Array) {
        params = cust;
    } else {
        params = Object.values(cust);
    };

    const sql = `INSERT INTO customer (cusId, cusFname, cusLname, cusState, cusSalesYTD, cusSalesPrev)
                 VALUES ($1, $2, $3, $4, $5, $6)`;

    return pool.query(sql, params)
        .then(res => {
            return {
                trans: "success", 
                msg: `Customer id ${params[0]} successfully inserted`
            };
        })
        .catch(err => {
            return {
                trans: "fail", 
                msg: `Error on insert of customer id ${params[0]}.  ${err.message}`
            };
        });
};
const updateCustomer = (cust) => {
    if (cust instanceof Array) {
        params = cust;
    } else {
        params = Object.values(cust);
    };

    const sql = `UPDATE customer SET cusFname = $2, cusLname = $3,  cusState = $4, cusSalesYTD = $5, cusSalesPrev = $6 WHERE cusId = $1`;

    return pool.query(sql, params)
        .then(res => {
            console.log( res );
            return {
                status: "success", 
                msg: `Customer id ${params[0]} successfully updated`
            };
        })
        .catch(err => {
            console.log( err );
            return {
                status: "fail", 
                msg: `Error on update of customer id ${params[0]}.  ${err.message}`
            };
        });
};


const deleteCustomer = ( cusId ) => {
    //console.log( cusId );
    params = [cusId];
    const sql = `DELETE FROM customer WHERE cusId IN ($1)`;
console.log( params );
    return pool.query(sql, params)
        .then(res => {
            return {
                trans: "success", 
                msg: `Customer id ${params[0]} successfully deleted`
            };
        })
        .catch(err => {
            return {
                trans: "fail", 
                msg: `Error on insert of customer id ${params[0]}.  ${err.message}`
            };
        });
};

const getCustomer = ( cusId ) => {
    //console.log( cusId );
    params = [cusId];
    sql = "SELECT * FROM customer WHERE cusId = $1";
    return pool.query(sql, params)
        .then( result => {
            //console.log( result );
            return { 
                status: "success",
                result: result.rows,
                message: ''
            }
        })
        .catch(err => {
            return {
                status: "Error",
                result: '',
                message: `Error: ${err.message}`
            }
        });

}

const findCustomers = (cust) => {
    var i = 1;
    params = [];
    sql = "SELECT * FROM customer WHERE true";
    if( typeof( cust ) !== 'undefined' ){
        if (cust.cusId !== "") {
            params.push(Number(cust.cusId));
            sql += ` AND cusId = $${i}`;
            i++;
        };
        if (cust.cusFname !== "") {
            params.push(`${cust.cusFname}%`);
            sql += ` AND UPPER(cusFname) LIKE UPPER($${i})`;
            i++;
        };
        if (cust.cusLname !== "") {
            params.push(`${cust.cusLname}%`);
            sql += ` AND UPPER(cusLname) LIKE UPPER($${i})`;
            i++;
        };
        if (cust.cusState !== "") {
            params.push(`${cust.cusState}`);
            sql += ` AND UPPER(cusState) = UPPER($${i})`;
            i++;
        };
        if (cust.cusSalesYTD !== "") {
            params.push(parseFloat(cust.cusSalesYTD));
            sql += ` AND cusSalesYTD >= $${i}`;
            i++;
        };
        if (cust.cusSalesPrev !== "") {
            params.push(parseFloat(cust.cusSalesPrev));
            sql += ` AND cusSalesPrev >= $${i}`;
            i++;
        };
    }

    sql += ` ORDER BY cusId`;
    // for debugging
    // console.log("sql: " + sql);
    // console.log("params: " + params);

    return pool.query(sql, params)
        .then(result => {
            return { 
                trans: "success",
                result: result.rows
            }
        })
        .catch(err => {
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};

// Add towards the bottom of the page
module.exports.getCustomer = getCustomer;
module.exports.updateCustomer = updateCustomer;
module.exports.findCustomers = findCustomers;
module.exports.deleteCustomer = deleteCustomer;
module.exports.insertCustomer = insertCustomer;
module.exports.getTotalRecords = getTotalRecords;