import axios from "axios";

export default axios.create({
    baseURL: "http://vanguard.sitict.net:8000",
    headers: {
        "Content-type": "application/json",
        'Access-Control-Allow-Origin': '*'
    }
});