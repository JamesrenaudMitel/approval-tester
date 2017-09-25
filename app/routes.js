var express = require('express')
var path = require('path')
var request = require('request')
var bodyparser = require('body-parser')
var AWS = require('aws-sdk')

// Create the router
var router = express.Router()
module.exports = router

// Setup the AWS API
AWS.config.loadFromPath('./config/aws-config.json')

var sts = new AWS.STS();
var pipeline;

router.get('/', function (request, response) {
    assumeRole('arn:aws:iam::097224318174:role/Administrator')
        .then(creds => {
            pipeline = new AWS.CodePipeline({
                credentials: creds
            })

            return pipeline.getPipelineState({
                name: 'Test-Pipeline'
            }).promise()
                .then(data => {
                    return data;
                })
        })
        .then(data => {
            return stage = data.stageStates.find(element => {
                return element.stageName.startsWith('Approve')
            })
        })
        .then(stage => {
            return pipeline.putApprovalResult({
                actionName: stage.actionStates[0].actionName,
                pipelineName: 'Test-Pipeline',
                result:{
                    status: 'Approved',
                    summary: 'This is a summary'
                },
                stageName: stage.stageName,
                token: stage.actionStates[0].latestExecution.token
            })
        })
        .then(approval =>{
            console.log(approval);
        })
        .catch(err => {
            throw err;
        })

})


function assumeRole(roleArn) {
    return new Promise((resolve, reject) => {
        let sts = new AWS.STS();

        sts.assumeRole({
            RoleArn: roleArn,
            RoleSessionName: "approval-machine"
        }).promise()
            .then(data => resolve(new AWS.Credentials(data.Credentials.AccessKeyId,
                data.Credentials.SecretAccessKey, data.Credentials.SessionToken)))
            .catch(err => reject(err));
    })
}
