const nock = require("nock");

export function mockGoogleMapsGeocodeRequest() {
    nock("https://maps.googleapis.com")
        .persist()
        .get("/maps/api/geocode/json")
        .query(true) // enable query string matching
        .reply(200, {
            // mock response object
            results: [
                {
                    address_components: [
                        {
                            long_name: "New York",
                            short_name: "NY",
                            types: ["locality", "political"],
                        },
                        {
                            long_name: "New York",
                            short_name: "NY",
                            types: ["administrative_area_level_1", "political"],
                        },
                        {
                            long_name: "United States",
                            short_name: "US",
                            types: ["country", "political"],
                        },
                    ],
                    formatted_address: "New York, NY, USA",
                    geometry: {
                        bounds: {
                            northeast: { lat: 40.9175771, lng: -73.70027209999999 },
                            southwest: { lat: 40.4773991, lng: -74.2590899 },
                        },
                        location: { lat: 40.7127753, lng: -74.0059728 },
                        location_type: "APPROXIMATE",
                        viewport: {
                            northeast: { lat: 40.9175771, lng: -73.70027209999999 },
                            southwest: { lat: 40.4773991, lng: -74.2590899 },
                        },
                    },
                    place_id: "ChIJOwg_06VPwokRYv534QaPC8g",
                    types: ["locality", "political"],
                },
            ],
            status: "OK",
        });
}

export function mockGoogleMapsDistanceMatrixRequest() {
    nock("https://maps.googleapis.com")
        .persist()
        .get("/maps/api/distancematrix/json")
        .query(true) // enable query string matching
        .reply(200, {
            rows: [
                {
                    elements: [
                        {
                            distance: {
                                text: parseInt((Math.random() * 200).toString())
                            }
                        }
                    ]
                }
            ],
            status: "OK",
        });
}
