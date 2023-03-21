FROM public.ecr.aws/bitnami/node:14.20.0

WORKDIR /usr/src/app

RUN npm i -g nodemon

COPY . .

RUN rm -rf node_modules

RUN npm install

EXPOSE 5001

EXPOSE 27017

EXPOSE 17677

EXPOSE 5432

EXPOSE 3000

CMD [ "npm", "run", "prod" ]