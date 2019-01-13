const axios = require('axios');

const BuildFootprintManager = function(){

    // TODO: update this query to take polygon as input geometry instead of extent
    const queryBuildFootprintFeatures = (options={
        geometry: null
    })=>{
        // console.log('queryFeatures', options);

        if(!options.geometry){
            console.error('input geometry is required to query building foot print features');
            return;
        }

        const requestUrl = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/MSBFP2/FeatureServer/0/query';

        const params = {
            where: '1=1',
            geometry: options.geometry,
            geometryType: options.geometry.rings ? 'esriGeometryPolygon' : 'esriGeometryEnvelope',
            spatialRel: 'esriSpatialRelIntersects',
            returnGeometry: false,
            returnCentroid: true,
            f: 'pjson'
        };

        return new Promise((resolve, reject)=>{

            axios.get(requestUrl, {
                params
            }).then(function (response) {
                // console.log(response);
                if(response.data && response.data.features){
                    resolve(response.data.features);
                }
            })
            .catch(function (error) {
                // console.log(error);
                reject(error);
            });

        });

    };

    const batchReverseGeocode = (features)=>{

        const allRequests = features.map(d=>{

            const location = d.centroid;
            
            location.spatialReference = {
                "wkid": 3857
            };

            return reverseGeocode(location);
        });

        return new Promise((resolve, reject)=>{

            Promise.all(allRequests).then(function(values) {
                resolve(values);
            });
        });

    };

    const reverseGeocode = (location={
        x: -999,
        y: -999
    })=>{
        
        const requestUrl = 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode';

        return new Promise((resolve, reject)=>{

            axios.get(requestUrl, {
                params: {
                    location,
                    f: 'json'
                }
            }).then(function (response) {
                // console.log(response);
                if(response.data && response.data){
                    resolve(response.data);
                }
            })
            .catch(function (error) {
                // console.log(error);
                reject(error);
            });

        });

    };

    const getBuildingAddresses = (options={
        geometry: null
    })=>{
        // console.log('calling getBuildingAddresses');

        return new Promise((resolve, reject)=>{
            queryBuildFootprintFeatures({
                geometry: options.geometry
            })
            .then(batchReverseGeocode)
            .then(reverseGeocodeResults=>{
                // console.log('reverseGeocodeResults', reverseGeocodeResults);
                resolve(reverseGeocodeResults)
            })
            .catch(error=>{
                reject(error);
            });
        });

    };

    return {
        // queryBuildFootprintFeatures,
        // batchReverseGeocode,
        // reverseGeocode,
        getBuildingAddresses
    };

};

exports = module.exports = BuildFootprintManager;