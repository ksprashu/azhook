#!/usr/bin/env bash

OUTPUT=`curl -X POST -u testprashuuser:Test123* -H 'Content-Type: application/json' -d '{"url": "https://azure-demo.appspot.com/azhook", "event": "PostDeployment", "insecure_ssl": true}' --url https://mycontactlistapp.scm.azurewebsites.net/api/hooks`
echo "${OUTPUT}"
