"use strict";
const { exec } = require("child_process");

module.exports.handler = async (event) => {
  console.log("time requested:", event.time);
  await sleep(1000 * event.time);
  let responseText = "";
  if (event.cmd) {
    let { stdout } = await sh(event.cmd);
    console.log("stdout was:", stdout);
    responseText = stdout;
  } else {
    console.log("no cmd was passed");
  }
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
