# Jovan Stosic Portiflo Website

## Usage & Copyright

This repository is intended strictly for showcase purposes.

#### Ownership & Rights

All code and design assets within this repository are the property of Jovan Stosic.

### Restrictions

- No Repurposing: I do not grant permission for this code, design, or any associated assets to be repurposed, redistributed, or used as a template for other personal or commercial websites.

- No Unauthorized Use: Please do not download, clone, or fork this repository with the intent of claiming the work as your own or using it for your own personal site.

I kindly ask that you respect the integrity of this work. If you find the code helpful for learning, I encourage you to use it as inspiration to build something unique of your own rather than copying this implementation. Thank you!

## Start Of Read Me

### Description

This app is not like a regular portfolio website; it is a single, monolithic app. It has multiple services and live projects embedded within the website, and I had to ensure they all had a seamless connection. It uses many programming languages, which I had to get working via an API in my Express.js backend. It has its own MySQL database as well and is set up with advanced security features.

### Tech Stack

- Languages: Python, TypeScript, JavaScript, PostgresSQL

- Front-End: React.js, TypeScript, JavaScript, HTML, CSS, Vite

- Back-End: Express.js, Socket.io, JWT, Docker

ReadMe is still under construction. For now just checkout the package.json scripts to see how to run it.

commands I shouldn't forget:

Local dev:

docker compose -f docker-compose.dev.yml up

Local prod test:

docker compose up
