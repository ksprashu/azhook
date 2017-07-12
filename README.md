### Apigee Deployment Webhook

``` bash
apigeetool deploynodeapp -n azuredeployhook -e test -o ksp -u ksprashanth@google.com -U -V

OR 

gcloud app deploy
```

### Azure API Deployment

``` bash
az login

az group create --name myResourceGroup --location westeurope

az appservice plan create --name myAppServicePlan --resource-group myResourceGroup --sku FREE

az webapp create --name myContactListApp --resource-group myResourceGroup --plan myAppServicePlan

az webapp deployment user set --user-name testprashuuser --password Test123*

az webapp deployment source config-local-git --name myContactListApp --resource-group myResourceGroup --query url --output tsv

git remote add azure <URI from previous step>

./setup.sh https://mycontactlistapp.scm.azurewebsites.net/api/hooks http://ksp-test.apigee.net/azhook testprashuuser Test123*

git push azure master

```
