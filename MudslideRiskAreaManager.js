const axios = require('axios');

const BuildingFootprintManager = require('./BuildingFootprintManager');
const bfpManager = new BuildingFootprintManager();

const MudslideRiskAreaFinder = function(){


    // const queryPrecipLayer = (mapPoint)=>{

    //     const requestUrl = 'https://utility.arcgis.com/usrsvcs/servers/d9835527647f4419ab113c95d29fce88/rest/services/LiveFeeds/NDFD_Precipitation/MapServer/0/query';

    //     const params = {
    //         f: 'json',
    //         returnGeometry: true,
    //         geometry: {
    //             "x": mapPoint.x,
    //             "y": mapPoint.y,
    //             "spatialReference":{"wkid":102100,"latestWkid":3857}
    //         },
    //         geometryType: 'esriGeometryPoint',
    //         spatialRel: 'esriSpatialRelIntersects',
    //         outFields: '*',
    //         where: '1=1'
    //     };

    //     return new Promise((resolve, reject)=>{
    //         axios.get(requestUrl, {
    //             params
    //         }).then( (response)=>{
    //             // console.log(response);

    //             if(response.data && response.data.features && response.data.features.length){
                    
    //                 resolve(filterPrecipFeatures(response.data.features));
    //             } else {
    //                 reject({
    //                     error: 'no precip features found'
    //                 });
    //             }
    //         })
    //     });

    // };

    const queryMudslideHex = (options)=>{
        // console.log('queryMudslideHexByPrecipFeature', JSON.stringify(feature.geometry));
        // const ext = getExtent(feature.geometry);

        const requestUrl = 'https://services1.arcgis.com/yfahUFAYAdeS5rmM/ArcGIS/rest/services/Mudslide_Prone_Hex_Bins/FeatureServer/0/query';

        const params = {
            f: 'json',
            returnGeometry: true,
            geometry: options.geometry,
            geometryType: 'esriGeometryEnvelope',
            spatialRel: 'esriSpatialRelIntersects',
            // outFields: '*'
        };

        return new Promise((resolve, reject)=>{
            axios.get(requestUrl, {
                params
            }).then( (response)=>{
                
                if(response.data && response.data.features && response.data.features.length){
                    // console.log('queryMudslideHex', response.data);
                    resolve(response.data.features);
                } else {
                    reject({
                        error: 'no hex found'
                    });
                }
            })
        });
    };

    const filterHexByPrecipArea = (features)=>{


        const allRequests = features.map(feature=>{
            return isHexInPrecipZone(feature);
        });

        return new Promise((resolve, reject)=>{

            Promise.all(allRequests).then(function(values) {
                const validHex = values.filter(v=>{
                    return v.isHexInPrecipZone;
                })

                if(values.length){
                    resolve(validHex);
                } else {
                    reject({
                        error: 'no hex returned'
                    });
                }
                
                // console.log(values);
            });
        });


        // features.forEach(feature => {

        //     console.log(JSON.stringify(feature.geometry));
    
        //     mf.isHexInPrecipZone(feature).then(result=>{
        //         console.log(result);
        //     }).catch(error=>{
        //         console.error(error);
        //     });
    
        // });
    };

    const isHexInPrecipZone = (feature)=>{
        const requestUrl = 'https://services1.arcgis.com/4yjifSiIG17X0gW4/ArcGIS/rest/services/PrecipitationForecastMondayJanuary14_2pm_2019/FeatureServer/0/query';

        const params = {
            f: 'json',
            returnGeometry: false,
            geometry: feature.geometry,
            geometryType: 'esriGeometryPolygon',
            spatialRel: 'esriSpatialRelIntersects',
            where: '1=1',
            outFields: '*'
        };

        return new Promise((resolve, reject)=>{
            axios.get(requestUrl, {
                params
            }).then( (response)=>{
                
                if(response.data && response.data.features && response.data.features.length){
                    resolve({
                        feature,
                        isHexInPrecipZone: true
                    });
                } else {
                    reject({
                        feature,
                        isHexInPrecipZone: false
                    });
                }
            })
        });
    };

    const getRiskAreasByExtent = (extent)=>{

        return new Promise((resolve, reject)=>{

            queryMudslideHex({
                geometry: extent
            })
            .then(filterHexByPrecipArea)
            .then(hex=>{
                // console.log(hex);
                resolve(hex)
            })
            .catch(error=>{
                // console.error(error);
                reject(error);
            });
        });

    };

    const getAddressesInRiskArea = (hexFeatures)=>{
        // console.log('calling getAddressesInRiskArea', hexFeatures);

        const allRequests = hexFeatures.map(hex=>{

            const geometry = hex.feature.geometry;
            
            return bfpManager.getBuildingAddresses({
                geometry
            });
        });

        return new Promise((resolve, reject)=>{

            Promise.all(allRequests).then(function(values) {
                // console.log(values);
                let allAddresses = [];

                values.forEach(v=>{
                    allAddresses = allAddresses.concat(v);
                });

                resolve(allAddresses);
            });
        });

    };

    return {
        getRiskAreasByExtent,
        getAddressesInRiskArea
    };

};

// const ms = new MudslideRiskAreaFinder();
// ms.getRiskAreasByExtent({"xmin": -13322883.293076182,"ymin": 4084351.745245313,"xmax": -13314704.531049678,"ymax": 4089281.9335697,"spatialReference":{"wkid":102100,"latestWkid":3857}})
// .then(ms.getAddressesInRiskArea)
// .catch(error=>{
//     console.log(error);
// });

// const foo = ()=>{
//     console.log('calling foo');
//     // const geometry = {
//     //     "rings" : 
//     //     [
//     //         [
//     //         [-13266423.84, 4047681.77], 
//     //         [-13266423.5, 4047714.72], 
//     //         [-13266322.2, 4047713.91], 
//     //         [-13266322.43, 4047680.83], 
//     //         [-13266337.12, 4047680.96], 
//     //         [-13266337.23, 4047658.37], 
//     //         [-13266344.91, 4047658.37], 
//     //         [-13266344.69, 4047680.42], 
//     //         [-13266351.15, 4047680.56], 
//     //         [-13266351.26, 4047657.69], 
//     //         [-13266377.86, 4047657.96], 
//     //         [-13266377.64, 4047681.36], 
//     //         [-13266423.84, 4047681.77]
//     //         ]
//     //     ]
//     // };

//     const geometry = {
//         "xmin":-13266737.147852018,
//         "ymin":4046834.352006209,
//         "xmax":-13265819.903512599,
//         "ymax":4047751.59634563,
//         "spatialReference":{"wkid":102100,"latestWkid":3857}
//     }

//     bfpManager.getBuildingAddresses({
//         geometry
//     }).then(results=>{
//         // res.send(results);
//         console.log(results)
//     }).catch(error=>{
//         console.log(error);
//     });
// };

// foo();


exports = module.exports = MudslideRiskAreaFinder;