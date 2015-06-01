
## Development

Start Docker.

    docker run -it --rm -v /share/jssh:/code streamich/node bash
    docker run -it --rm -v /share/jssh:/code --name my-jssh streamich/jssh bash
    docker run -it --rm -v /share/jssh:/code --name my-jssh streamich/node bash

Install `npm` dependencies.

    npm install --no-bin-links
    
