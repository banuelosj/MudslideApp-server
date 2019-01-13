const axios = require('axios');

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

    return {
        // queryPrecipLayer,
        // queryMudslideHex,
        // isHexInPrecipZone,
        // filterHexByPrecipArea,
        getRiskAreasByExtent
    };

};

exports = module.exports = MudslideRiskAreaFinder;