export const handleForwardGeocode = async (config) => {


    // after validating the lng and lat through backend
        // get form values
        // pass name as config query, and set proximity object to be lng and lat: {lat, lng}
        // that way we can use forward geocoding of name/place and choose closest feature. prob features[0]

    // gotta pass the proximity object somewhere before the call.

    const features = [];

    try {
        const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`;
        const response = await fetch(request);
        const geojson = await response.json();
        for (const feature of geojson.features) {
            const center = [
                feature.bbox[0] +
            (feature.bbox[2] - feature.bbox[0]) / 2,
                feature.bbox[1] +
            (feature.bbox[3] - feature.bbox[1]) / 2
            ];
            const point = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: center
                },
                place_name: feature.properties.display_name,
                properties: feature.properties,
                text: feature.properties.display_name,
                place_type: ['place'],
                center
            };
            features.push(point);
        }
    } catch (e) {
        console.error(`Failed to forwardGeocode with error: ${e}`);
    }
    return {
        // features: [features[0]]
        features
    };
}

export const handleReverseGeocode = async (config) => {
    const features = [];
    try {
        const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`;
        const response = await fetch(request);
        const geojson = await response.json();
        for (const feature of geojson.features) {
            const center = [
                feature.bbox[0] +
            (feature.bbox[2] - feature.bbox[0]) / 2,
                feature.bbox[1] +
            (feature.bbox[3] - feature.bbox[1]) / 2
            ];
            const point = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: center
                },
                place_name: feature.properties.display_name,
                properties: feature.properties,
                text: feature.properties.display_name,
                place_type: ['place'],
                center
            };
            features.push(point);
        }
    } catch (e) {
        console.error(`Failed to forwardGeocode with error: ${e}`);
    }

    console.log('features ->>', features)
    return {
        features
    };
}