module.exports = function (shipit) {
  var projectDir = '/var/docker-projects/blog-procesozombie.com/';
  var deployDir = projectDir+'deploys/';

  var user = process.env.DEPLOY_USER,
      host = process.env.DEPLOY_HOST,
      port = process.env.DEPLOY_PORT;

  shipit.initConfig({
    blog: {
      servers: user+'@'+host+':'+port
    }
  });

  /* Tasks */

  shipit.blTask('clean', function() {
    shipit.log("Removing old public/ dir");
    return shipit.local('rm -rf public/ blog.tar.gz');
  });

  shipit.blTask('generate', function() {
    shipit.log("Running gohugo's generator");
    return shipit.local('hugo -s . --uglyUrls=true');
  });

  shipit.blTask('tar', function() {
    shipit.log("Creating tar file");
    return shipit.local('tar -zcvf blog.tar.gz public/');
  });

  shipit.blTask('upload', function() {
    shipit.log("uploading tar file to server");
    return shipit.remoteCopy('blog.tar.gz', deployDir);
  });

  shipit.blTask('untar', function() {
    shipit.log("uncompressing tar file in server");
    return shipit.remote('tar -zxvf '+deployDir+'blog.tar.gz -C '+deployDir);
  });

  shipit.blTask('backup', function() {
    return shipit.remote('if [ -d "'+deployDir+'current" ]; then mv '+deployDir+'current '+deployDir+'current.old; fi');
  });

  shipit.blTask('rename', function() {
    shipit.log("creating current directory...");
    return shipit.remote('mv '+deployDir+'public '+deployDir+'current');
  });

  shipit.blTask('restart', function() {
    shipit.log("restarting dockers...");
    return shipit.remote('docker-compose -f '+projectDir+'docker-compose.yml restart');
  });

  shipit.blTask('post-clean-remote', function() {
    shipit.log("Removing unnecesary files in remote");
    return shipit.remote('rm -rf '+deployDir+'current.old '+deployDir+'blog.tar.gz');
  });

  shipit.blTask('post-clean-local', function() {
    shipit.log("Removing unnecesary files in local");
    return shipit.local('rm -rf public/ blog.tar.gz');
  });

  // /* Default Task */

  shipit.blTask('default', ['clean', 'generate', 'tar', 'upload', 'untar',
    'backup', 'rename', 'restart', 'post-clean-remote', 'post-clean-remote',
    'post-clean-local'
  ]);

};
