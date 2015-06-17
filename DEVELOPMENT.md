
## Development

Start Docker.

    docker run -it --rm -v /share/jssh:/code streamich/node bash

Install `npm` dependencies.

    npm install --no-bin-links
    npm install -g mocha
    npm install -g tsd
    tsd query node -a install -ros
    
    mocha test
    
Building a portable bundle in `./portable/jssh.js`:

    portable.js bundle
    
    
    
    



