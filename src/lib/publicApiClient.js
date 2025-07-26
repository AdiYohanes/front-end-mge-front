// src/lib/publicApiClient.js

import axios from "axios";

const publicApiClient = axios.create({
  baseURL: "http://lg84oss0kw4gc80kk8skk8c8.168.231.84.221.sslip.io",
  headers: {
    "Content-Type": "application/json",
  },
});

export default publicApiClient;
