# Serverless Tailscale Exit Node

This is a Serverless Framework project that deploys a Lambda function that connects to a Tailscale VPN. We presume you are already familiar with Tailscale and the serverless framework on AWS Lambda.

This project installs a Lambda function that connects to your Tailscale VPN and acts as an ephemeral exit node.

Lambda functions are limited to run for 15 minutes at a time, so this is not a good solution for a long-running VPN connection. However, it is a good solution for a short-lived VPN connection, such as a VPN connection that is only needed for a few minutes of access or less.

In the future, it could be improved so that it can be used as a long-running VPN connection, through an orchestration service.

## Deployment instructions

### Pre-requisites

1. Install the [Serverless Framework](https://www.serverless.com/framework/docs/getting-started/)
2. Install Tailscale on your local machine and create a Tailscale account.
3. Have Docker installed and running.

### Configure your Tailscale network

1. Modify your Tailscale Access control config JSON by adding the following:

```json
	"tagOwners": {
		"tag:exit": ["autogroup:admin"],
	},
        "autoApprovers": {
		"exitNode": ["tag:exit"],
	},
```

2. Follow the directions here to create an ephemeral auth key: https://tailscale.com/kb/1085/auth-keys/ You should create a key that is both ephemeral, and reuseable, and you should assign the tag `tag:exit` to it. I suggest a nice long one - say 90 days. You will have to get a new one manually, when it expires.
3. In the project root, create a file called `config.json` which has the same contents as the `config.example.json` file, but with your ephemeral auth key in it from step 2.
4. Make any modifications that you would like to the `serverless.yml` file. For example, you may want to change the region that the Lambda function is deployed to.

```
sls deploy
```

## Test your service

After successful deployment, you can test your service remotely by using the following command:

```
sls invoke --function start --data '{"time":1}'
```

The time parameter configures, in seconds, how long the lambda function will execute form and therefore, how long the Tailscale node will work. The above invocation will bring up the service for one second - not too useful, but it's a start. You can pass in any number, but Lambda is limited to 15 minutes, or 900 seconds.

You can change the amount of time the service is up by changing the `time` parameter.

You can also pass a 'cmd' parameter to the function to run a command inside the container. For example, to run `ls -la` inside the lambda function while it's running, you can run:

```
sls invoke --function start --data '{"time":1,"cmd":"ls -la"}'
```

The results are returned to you in the console, base64 encoded in a JSON object, under the "body" property. You can decode them any way you like, for example if you have `jq` installed, you can run:

```
sls invoke --function start --data '{"time":1,"cmd":"ls -la"}' | jq -r .body | base64 -D
```
