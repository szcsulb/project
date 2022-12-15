// Required modules 
const express = require("express");
const dblib = require("./dblib.js");
const fs = require( 'fs' );
const multer = require("multer");

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));

// Setup EJS
app.set("view engine", "ejs");

// Enable CORS (see https://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// Application folders
app.use(express.static("public"));

// Setup routes

app.get("/", (req, res) => {
    res.render("index");
});


app.get("/manage", async (req, res) => {
    const totRecs = await dblib.getTotalRecords();
    const cust = {
        cusId: "",
        cusFname: "",
        cusLname: "",
        cusState: "",
        cusSalesYTD: "",
        cusSalesPrev: ""
    };
    res.render("manage", {
        type: "get",
        totRecs: totRecs.totRecords,
        cust: cust
    });
});

app.post("/manage", async (req, res) => {
    const totRecs = await dblib.getTotalRecords();
    dblib.findCustomers( req.body )
        .then(result => {
            res.render("manage", {
                type: "post",
                totRecs: totRecs.totRecords,
                result: result.result,
                cust: req.body
            })
        })
        .catch(err => {
            res.render("manage", {
                type: "post",
                totRecs: totRecs.totRecords,
                result: `Unexpected Error: ${err.message}`,
                cust: req.body
            });
        });
});


app.get( "/create", ( req, res ) => {
    res.render( "create" , {
        type: "get",
        cusid: '',
        cusfname: '',
        cuslname: '',
        cusstate: '',
        cussalesytd: '',
        cussalesprev: '',
        message: ""
    });
});

app.post( "/create", (req, res ) => {
    dblib.insertCustomer( req.body )
        .then(result => {
            res.render("create", {
                type: "post",
                cusid: req.body.cusId,
                cusfname: req.body.cusFname,
                cuslname: req.body.cusLname,
                cusstate: req.body.cusState,
                cussalesytd: req.body.cusSalesYTD,
                cussalesprev: req.body.cusSalesPrev,
                message: "Customer Created Successfully!"
            })
        })
        .catch(err => {
            res.render("create", {
                type: "post",
                cusid: req.body.cusId,
                cusfname: req.body.cusFname,
                cuslname: req.body.cusLname,
                cusstate: req.body.cusState,
                cussalesytd: req.body.cusSalesYTD,
                cussalesprev: req.body.cusSalesPrev,
                message: "Customer Creation Failed!"
            })
        });
});

app.get("/edit/:cusId", (req, res) => {
    dblib.getCustomer( req.params.cusId )
        .then( result => {
            console.log( result );
            res.render("edit", {
                type: 'get',
                cusid: result.result[0].cusid,
                cusfname: result.result[0].cusfname,
                cuslname: result.result[0].cuslname,
                cusstate: result.result[0].cusstate,
                cussalesytd: result.result[0].cussalesytd,
                cussalesprev: result.result[0].cussalesprev,
                message: ''
            });
        })
        .catch( err => {
            res.render("edit", {
                type: 'get',
                cusid: '',
                cusfname: '',
                cuslname: '',
                cusstate: '',
                cussalesytd: '',
                cussalesprev: '',
                message: `Unexpected Error: ${err.message}`
            });
        });
});
app.post("/edit/:cusId", (req, res) => {
    console.log( req.body );
    dblib.updateCustomer( req.body );
    dblib.getCustomer( req.params.cusId )
        .then( result => {
            res.render("edit", {
                type: 'post',
                cusid: req.body.cusId,
                cusfname: req.body.cusFname,
                cuslname: req.body.cusLname,
                cusstate: req.body.cusState,
                cussalesytd: req.body.cusSalesYTD,
                cussalesprev: req.body.cusSalesPrev,
                message: 'Customer updated Successfully'
            });
        })
        .catch( err => {
            res.render("edit", {
                type: 'post',
                cusid: '',
                cusfname: '',
                cuslname: '',
                cusstate: '',
                cussalesytd: '',
                cussalesprev: '',
                message: `Unexpected Error: ${err.message}`
            });
        });
});

app.get("/delete/:cusId", (req, res) => {
    dblib.getCustomer( req.params.cusId )
        .then( result => {
            res.render("delete", {
                type: 'get',
                cusid: result.result[0].cusid,
                cusfname: result.result[0].cusfname,
                cuslname: result.result[0].cuslname,
                cusstate: result.result[0].cusstate,
                cussalesytd: result.result[0].cussalesytd,
                cussalesprev: result.result[0].cussalesprev,
                message: ''
            });
        })
        .catch( err => {
            res.render("delete", {
                type: 'get',
                cusid: '',
                cusfname: '',
                cuslname: '',
                cusstate: '',
                cussalesytd: '',
                cussalesprev: '',
                message: `Unexpected Error: ${err.message}`
            });
        });
});

app.post("/delete/:cusId", (req, res) => {
    dblib.deleteCustomer( req.body.cusId )
        .then( result => {
            res.render("delete", {
                type: 'post',
                cusid: req.body.cusId,
                cusfname: req.body.cusFname,
                cuslname: req.body.cusLname,
                cusstate: req.body.cusState,
                cussalesytd: req.body.cusSalesYTD,
                cussalesprev: req.body.cusSalesPrev,
                message: 'Customer Deleted Successfully'
            });
        })
        .catch( err => {
            res.render("delete", {
                type: 'post',
                cusid: '',
                cusfname: '',
                cuslname: '',
                cusstate: '',
                cussalesytd: '',
                cussalesprev: '',
                message: `Unexpected Error: ${err.message}`
            });
        });
});

app.get( "/import", async ( req, res ) => {
    const totRecs = await dblib.getTotalRecords();
    res.render( "import", {
        type: 'get',
        totRecs: totRecs.totRecords
    });
});

app.post("/import", upload.single("filename"), async ( req, res, next ) => {
    const file = req.file; 
    let recsProcessed = 0;
    let recsSuccessful = 0;
    let recsFailed = 0;
    let errors = [];
    if (!file) { 
      const error = new Error("Please upload a file");
      error.httpStatusCode = 400;
      return req.next(error);
    }
    const multerText = Buffer.from(file.buffer).toString("utf-8"); 

    const customers = multerText.split( "\r\n" );
    for( customer of customers ) {
        recsProcessed++;
        await dblib.insertCustomer( customer.split( ',' ) )
            .then( result =>{
                if( result.trans == 'success' ) {
                    recsSuccessful++;
                } else if( result.trans == 'fail' ) {
                    recsFailed++;
                    errors.push( result.msg );
                }
            }).catch( err => {
                console.log( err.message );
            });
    };
    const totRecs = await dblib.getTotalRecords();
    res.render( "import", {
        type: 'post',
        totRecs: totRecs.totRecords,
        recsProcessed: recsProcessed,
        recsSuccessful: recsSuccessful,
        recsFailed: recsFailed,
        errors: errors
    });
});

app.get( "/export", async ( req, res ) => {
    const totRecs = await dblib.getTotalRecords();
    res.render( "export", {totRecs: totRecs.totRecords } );
});


app.post( "/export", (req, res ) => {
    let filename = req.body.filename;
    let textContent = '';
    dblib.findCustomers()
        .then(result => {
            //console.log( result );
            let i = 1;
            for( customer of result.result ) {
                if( i > 1 ) { prefix = '\r\n'; } else { prefix = ''; }
                textContent += `${prefix}${customer.cusid},${customer.cusfname},${customer.cuslname},${customer.cusstate},${customer.cussalesytd.replace(/\$/g, '').replace(/,/g, '')},${customer.cussalesprev.replace(/\$/g, '').replace(/,/g, '')}`
                i++;
            }
            res.setHeader('Content-type', "application/octet-stream");
            res.setHeader('Content-disposition', `attachment; filename=${filename}`);
            res.send( textContent );
        })
        .catch(err => {
            res.send( err.message );
        });
});



// Start listener
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});