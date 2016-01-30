# <i>HCI Big Data Course - Weeks 9-13 </i>
This repository contains weeks nine through thirteen of the HCC Big Data Course (CSCI-4830-006), taught by Tom Yeh at CU, Fall semsester 2015.

The course consists of exploratory analysis of large data sets and visualizations through interactive web applications.

The format of the course was a weekly in-class team hackathon followed by take-home team and individual learning challenges.

## Web Application
The results of the hackathons and learning challenges for this book can be viewed at [book3](http://kjblakemore.github.io/book3/).

## Technologies
* JavaScript
* Lodash
* JQuery
* SVG
* Firebase
* Zapier
* Tableau
* HTML & CSS

## Data Sets
* NetApp SSD wear-out data
* CU Faculty Course Questionaire
* Yelp businesses
* Tweet images from the April 2015 Nepal earthquake
* Tweets with the term Russia
* Tweets for Bitcoin transactions
* Google Book dataset
* Online activity of classmates
* Sonar water column measurement data
* Zayo Sales Data

## Data Formats
* json, csv, excel


## Original README

Everything I've learned from the Big Data HCI course (Volume III).

### Install

    $ npm install

### Test / Development

    $ node build.js

The server is default to `http://localhost:8081`

### Deploy

Commit Changes

    $ git add build

    $ git commit -m 'your commit message'

Publish on gh-pages

    $ git subtree push --prefix build origin gh-pages
