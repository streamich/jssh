
module.exports =
  dest: './portable'

  layer:
    files:
      src: './'
      glob: [
        'key/client.pub'
        'key/server.key'
        'grammar/*.peg'
        '*.+(js|json|md)'
        'src/**/*.+(js|json)'
        'node_modules/**/*.+(js|json)'
      ]
      transform: ['.*\.js$', 'uglify']

  bundle:
    'jssh-big':
      target: 'node'
      volumes: [
        ['/jssh', 'files']
      ]
      props:
        main: '/jssh/index.js'
        compress: false

    jssh:
      target: 'node'
      volumes: [
        ['/jssh', 'files']
      ]
      props:
        main: '/jssh/index.js'
