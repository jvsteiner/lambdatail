"use strict";
const { exec } = require("child_process");

module.exports.handler = async (event) => {
  await sh(
    "/var/runtime/tailscale up --authkey=${TAILSCALE_AUTHKEY} --advertise-tags=tag:exit --hostname=lambdatail --advertise-exit-node --accept-dns=true"
  );
  console.log("time requested:", event.time);
  await sleep(1000 * event.time);
  let responseText = "";
  if (event.cmd) {
    let { stdout, stderr } = await sh(event.cmd);
    console.log("stdout was:", stdout);
    console.log("stderr was:", stderr);
    responseText = "stdout\n" + stdout + "stderr\n" + stderr;
  } else {
    console.log("no cmd was passed");
  }
  await sh("/var/runtime/tailscale logout || true");
  return {
    statusCode: 200,
    body: Buffer.from(responseText, "binary").toString("base64"),
  };
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sh(cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}
