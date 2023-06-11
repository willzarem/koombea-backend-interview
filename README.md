# Web Scrapper | Koombea Code Challenge

This is a backend project I created as a code challenge for [Koombea](https://koombea.com) as a backend developer.

## Requirements

- As a user, I must be able to register on the platform. For this, it will only be necessary to enter a username and password.
- As a user, I must be able to log into the system using an email and a password.
- As a user, I should be able to see a list of all the pages that I have scrapped with the number of links that the scraper found.
- As a user, I should be able to see the details of all the links of a particular page, that means the url of a link and the “name” of a link.
- As a user I should be able to add a url and the system should be able to check
  for all the links and add it to the database.
  - A link will have the following format `<a href="https://www.w3schools.com"> Visit W3Schools.com! </a>` the href will be the link and the body will be the name of the link. Keep in mind that the body of a link sometimes is not only text and could be other html elements, in those cases you could save only a portion of the html. The title of the web page will be the page name. Keep in mind that some pages will take more time than others to scrape.

## Nice to have

- Pagination in the list of pages and the list of links
- As a user, when I see the list of pages, I should be able to see the ones that are currently being processed.

## Timespan

- **From:** Fri Jun 09 2023 15:00:00 GMT-0600 (Central Standard Time)
- **To:** Fri Jun 10 2023 15:00:00 GMT-0600 (Central Standard Time)

## Progress

- 24h Mark -> [1st release](https://github.com/willzarem/koombea-backend-interview/releases/tag/v0.1.0)

## Mockups

<img src="https://raw.githubusercontent.com/willzarem/koombea-backend-interview/main/public/img/1.png" alt="Mockup 1" width="300" height="300">
<img src="https://raw.githubusercontent.com/willzarem/koombea-backend-interview/main/public/img/2.png" alt="Mockup 2" width="300" height="300">

## Technology used

| Tech                                | Reasoning                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nest.js                             | Efficiency. I've found that Nest.js helps a ton with wiring up things like validations, models, configuration and so on. The cli has schemas for practically every use case you need and I feel like it has a pretty clean way of organizing logic and components. Pretty angular-like and since I've worked with Angular for a while as well, double XP! |
| axios + @nestjs/axios               | It's the default supported HttpClient for Nest.js and since I've worked before with it and I really enjoy the fine-tuning you are able to do with each request                                                                                                                                                                                            |
| bcrypt                              | Basically used for hashing and salting the user's password and to compare it afterwards for the login                                                                                                                                                                                                                                                     |
| bull                                | Message Queue system supported by default by Nest.js. Personally it was the first time I used bull specifically but I found that the integration was pretty painless with the processors of the queue being pretty well defined                                                                                                                           |
| class-transformer & class-validator | These libraries help with validation and transformation (obviously) of the orm entities. They make the validation of Dtos and filtering of payloads a real breeze.                                                                                                                                                                                        |
| dom-parser                          | Node package I found to analyze and traverse through the DOM to find the elements I needed. I found later that there was another one, Cheerio, but this one worked fine for what I needed.                                                                                                                                                                |
| hbs                                 | I worked with handlebars some years ago and since it is de default view engine for Nest (and I wanted to keep everything inside a monorepo) I went for this, although I don't use most of the features it provides past the templating                                                                                                                    |
| joi                                 | Joi is the library I use for getting the env variables from env files but in a pragmatic way and also joi helps with validations since it will stop the running if a variable is missing according to the schema                                                                                                                                          |
| passport & passport-jwt             | My go-to library for handling authentication. Nest.js' implementation of passport is really nice since it handles the Auth header, jwt validation and extraction of payload and with a small custom decorator, it exposes the user in each request as needed.                                                                                             |
| pg                                  | PostgreSQL driver. I usually go with this since I've used SQL for a while and allows me to don't worry too much about the db and develop faster.                                                                                                                                                                                                          |
| typeorm                             | The ORM I've grown accostumed to. I've been exploring more options like Prisma, but this is the one I had on my mind.                                                                                                                                                                                                                                     |

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Routes

- `/api` - Base API Route
  - `/scrapes` - Rest node for scrapes.
    - POST
    - GET
    - PATCH
    * `/content`
      - POST
      - GET
- `/auth`
  - `/signin` - SignIn endpoint
  - `/signup` - SignUp endpoint

## Postman Documentation

[![Run in Postman](https://run.pstmn.io/button.svg)](https://documenter.getpostman.com/view/280567/2s93sc5DE1)

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
