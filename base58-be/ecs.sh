aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 214772664190.dkr.ecr.us-east-1.amazonaws.com
aws ecr create-repository --repository-name rest-api --image-scanning-configuration scanOnPush=true --image-tag-mutability IMMUTABLE --region us-east-1
docker tag backend:latest 214772664190.dkr.ecr.us-east-1.amazonaws.com/rest-api:v1