// Required modules 
const express = require("express");
const dblib = require("./dblib.js");

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
    //res.send("Root resource - Up and running!")
    res.render("index");
});

app.get("/edit/:cusId", (req, res) => {
    dblib.getCustomer( req.params.cusId )
        .then( result => {
            res.render("edit", {
                cusId: req.params.cusId,
                result: result.result
            });
        })
        .catch( err => {
            res.render("edit", {
                cusId: req.params.cusId,
                cust: `Unexpected Error: ${err.message}`
            });
        });
});

app.get( "/import", async ( req, res ) => {
    const totRecs = await dblib.getTotalRecords();
    res.render( "import", {totRecs: totRecs.totRecords } );
});
app.post("/import", upload.single("filename"), async ( req, res, next ) => { // myFile should be the same value as used in HTML name attribute of input
    const file = req.file; // We get the file in req.file
  
    if (!file) { // in case we do not get a file we return
      const error = new Error("Please upload a file");
      error.httpStatusCode = 400;
      return req.next(error);
    }
    const multerText = Buffer.from(file.buffer).toString("utf-8"); // this reads and converts the contents of the text file into string

    const customers = multerText.split( "\r\n" );
    customers.forEach( customer => {
        dblib.insertCustomer( customer.split( ',' ) );
    });
    const totRecs = await dblib.getTotalRecords();
    res.render( "import", { totRecs: totRecs.totRecords } );
});

app.get( "/create", ( req, res ) => {
    res.render( "create" );
});

app.post( "/create", (req, res ) => {
    dblib.insertCustomer( req.body )
        .then(result => {
            res.render("create", {
                type: "post",
                message: "Customer Created Successfully!"
            })
        })
        .catch(err => {
            res.render("create", {
                type: "post",
                message: "Customer Creation Failed!"
            })
        });
});

app.get("/manage", async (req, res) => {
    // Omitted validation check
    const totRecs = await dblib.getTotalRecords();
    //Create an empty product object (To populate form with values)
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
    // Omitted validation check
    //  Can get totRecs from the page rather than using another DB call.
    //  Add it as a hidden form value.
    const totRecs = await dblib.getTotalRecords();

    dblib.findCustomers(req.body)
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

app.get("/searchajax", async (req, res) => {
    // Omitted validation check
    const totRecs = await dblib.getTotalRecords();
    res.render("searchajax", {
        totRecs: totRecs.totRecords,
    });
});
app.post("/searchajax", upload.array(), async (req, res) => {
    dblib.findProducts(req.body)
        .then(result => res.send(result))
        .catch(err => res.send({trans: "Error", result: err.message}));

});
// Start listener
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});