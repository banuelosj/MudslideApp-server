const express = require('express');
const path = require("path");

const BuildingFootprintManager = require('./BuildingFootprintManager');
const bfpManager = new BuildingFootprintManager();

const app = express();
const port = process.env.PORT || 8500;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function(req, res) {
    // res.json({"version": "0.1"});
    res.sendFile(path.join(__dirname + '/public/index.html'));
});


app.get('/queryBuildings', function(req, res) {

    // http://localhost:8500/queryBuildings?geometry={%20%22xmin%22:-13266737.147852018,%20%22ymin%22:4046834.352006209,%20%22xmax%22:-13265819.903512599,%20%22ymax%22:4047751.59634563,%20%22spatialReference%22:{%22wkid%22:102100,%22latestWkid%22:3857}%20}

    const geometry = req.query.geometry;

    // console.log(req.query);

    if(!geometry){
        res.send({
            error: 'input geometry is required to query building addresses'
        });
    } else {

        bfpManager.getBuildingAddresses({
            geometry
        }).then(results=>{
            res.send(results);
        }).catch(error=>{
            res.send(error);
        });

        // geometry: {
        //     "xmin":-13266737.147852018,
        //     "ymin":4046834.352006209,
        //     "xmax":-13265819.903512599,
        //     "ymax":4047751.59634563,
        //     "spatialReference":{"wkid":102100,"latestWkid":3857}
        // }

        // geometry: {
        //     "rings" : 
        //     [
        //       [
        //         [-13266423.84, 4047681.77], 
        //         [-13266423.5, 4047714.72], 
        //         [-13266322.2, 4047713.91], 
        //         [-13266322.43, 4047680.83], 
        //         [-13266337.12, 4047680.96], 
        //         [-13266337.23, 4047658.37], 
        //         [-13266344.91, 4047658.37], 
        //         [-13266344.69, 4047680.42], 
        //         [-13266351.15, 4047680.56], 
        //         [-13266351.26, 4047657.69], 
        //         [-13266377.86, 4047657.96], 
        //         [-13266377.64, 4047681.36], 
        //         [-13266423.84, 4047681.77]
        //       ]
        //     ]
        //   }
    }

});

app.listen(port, function () {
    console.log('app is listening on port ' + port);
});