import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "30s", target: 50 },   // ramp to 50
    { duration: "1m", target: 50 },
    { duration: "30s", target: 100 },  // ramp to 100
    { duration: "1m", target: 100 },
    { duration: "30s", target: 200 },  // ramp to 200
    { duration: "1m", target: 200 },
    { duration: "30s", target: 0 },    // ramp down
  ],
};


export default function () {
  let res = http.get("http://localhost:5000/"); // or /api/auth/login
  check(res, { "status is 200": (r) => r.status === 200 });
  sleep(1);
}
